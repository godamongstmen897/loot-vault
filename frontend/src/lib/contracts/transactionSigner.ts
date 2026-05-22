import {
  Horizon,
  Networks,
  TransactionBuilder,
  type FeeBumpTransaction,
  type Transaction,
} from "@stellar/stellar-sdk";

export type TransactionSubmitStatus = "submitted" | "confirmed";

export interface SignedTransactionResult {
  txHash: string;
  status: TransactionSubmitStatus;
}

export interface TransactionSignerConfig {
  horizonUrl?: string;
  networkPassphrase?: string;
  confirmationTimeoutMs?: number;
  pollIntervalMs?: number;
}

export type HorizonTransactionRecord = Horizon.ServerApi.TransactionRecord;

interface FreighterSignOptions {
  network?: string;
  networkPassphrase?: string;
  accountToSign?: string;
}

interface FreighterApi {
  isConnected?: () => boolean | Promise<boolean>;
  isAllowed?: () => boolean | Promise<boolean>;
  requestAccess?: () => string | { address?: string } | Promise<string | { address?: string }>;
  getAddress?: () => string | { address?: string } | Promise<string | { address?: string }>;
  signTransaction: (
    transactionXdr: string,
    options?: FreighterSignOptions,
  ) =>
    | string
    | { signedTxXdr?: string; signedXDR?: string; signedTransaction?: string }
    | Promise<string | { signedTxXdr?: string; signedXDR?: string; signedTransaction?: string }>;
}

declare global {
  interface Window {
    freighterApi?: FreighterApi;
  }
}

const DEFAULT_HORIZON_URL = "https://horizon-testnet.stellar.org";
const DEFAULT_CONFIRMATION_TIMEOUT_MS = 30_000;
const DEFAULT_POLL_INTERVAL_MS = 2_000;

let transactionSignerConfig: Required<TransactionSignerConfig> = {
  horizonUrl: DEFAULT_HORIZON_URL,
  networkPassphrase: Networks.TESTNET,
  confirmationTimeoutMs: DEFAULT_CONFIRMATION_TIMEOUT_MS,
  pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
};

export function configureTransactionSigner(config: TransactionSignerConfig): void {
  transactionSignerConfig = {
    ...transactionSignerConfig,
    ...removeUndefinedConfig(config),
  };
}

export async function signAndSubmitTransaction(
  transactionBuilder: TransactionBuilder,
  waitsFor?: HorizonTransactionRecord,
): Promise<SignedTransactionResult> {
  const config = getRuntimeConfig();
  const wallet = await getConnectedFreighter();
  const signerAddress = await getWalletAddress(wallet);
  const transaction = buildTransaction(transactionBuilder);
  const signedTransaction = await signTransaction(wallet, transaction, config.networkPassphrase, signerAddress);
  const horizon = new Horizon.Server(config.horizonUrl);
  const submitted = await submitSignedTransaction(horizon, signedTransaction);
  const confirmed = resolveKnownConfirmation(submitted.hash, waitsFor);

  if (confirmed) {
    return {
      txHash: submitted.hash,
      status: "confirmed",
    };
  }

  await waitForConfirmation(horizon, submitted.hash, config.confirmationTimeoutMs, config.pollIntervalMs);

  return {
    txHash: submitted.hash,
    status: "confirmed",
  };
}

function getRuntimeConfig(): Required<TransactionSignerConfig> {
  return {
    horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || transactionSignerConfig.horizonUrl,
    networkPassphrase:
      process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || transactionSignerConfig.networkPassphrase,
    confirmationTimeoutMs: transactionSignerConfig.confirmationTimeoutMs,
    pollIntervalMs: transactionSignerConfig.pollIntervalMs,
  };
}

function removeUndefinedConfig(config: TransactionSignerConfig): TransactionSignerConfig {
  return Object.fromEntries(Object.entries(config).filter(([, value]) => value !== undefined));
}

async function getConnectedFreighter(): Promise<FreighterApi> {
  if (typeof window === "undefined") {
    throw new Error("Freighter signing is only available in the browser.");
  }

  const wallet = window.freighterApi;

  if (!wallet?.signTransaction) {
    throw new Error("Freighter wallet was not found. Install or enable Freighter, then reconnect.");
  }

  const connected = await callOptionalBoolean(wallet.isConnected);

  if (connected === false) {
    throw new Error("Freighter is installed but not connected. Unlock Freighter and connect it to Loot Vault.");
  }

  const allowed = await callOptionalBoolean(wallet.isAllowed);

  if (allowed === false && wallet.requestAccess) {
    try {
      await wallet.requestAccess();
    } catch (error) {
      throw normalizeWalletError(error, "Freighter access was rejected.");
    }
  } else if (allowed === false) {
    throw new Error("Freighter has not granted this site access. Allow Loot Vault in Freighter and retry.");
  }

  return wallet;
}

async function getWalletAddress(wallet: FreighterApi): Promise<string | undefined> {
  if (!wallet.getAddress) {
    return undefined;
  }

  const addressResult = await wallet.getAddress();

  return typeof addressResult === "string" ? addressResult : addressResult.address;
}

function buildTransaction(transactionBuilder: TransactionBuilder): Transaction {
  if (!transactionBuilder || typeof transactionBuilder.build !== "function") {
    throw new Error("Invalid transaction builder: expected a Stellar TransactionBuilder with build().");
  }

  return transactionBuilder.build();
}

async function signTransaction(
  wallet: FreighterApi,
  transaction: Transaction,
  networkPassphrase: string,
  accountToSign?: string,
): Promise<Transaction | FeeBumpTransaction> {
  try {
    const signedXdr = await wallet.signTransaction(transaction.toXDR(), {
      networkPassphrase,
      accountToSign,
    });

    return TransactionBuilder.fromXDR(extractSignedXdr(signedXdr), networkPassphrase);
  } catch (error) {
    throw normalizeWalletError(error, "Freighter could not sign the transaction.");
  }
}

function extractSignedXdr(
  signed:
    | string
    | { signedTxXdr?: string; signedXDR?: string; signedTransaction?: string },
): string {
  if (typeof signed === "string") {
    return signed;
  }

  const signedXdr = signed.signedTxXdr || signed.signedXDR || signed.signedTransaction;

  if (!signedXdr) {
    throw new Error("Freighter did not return a signed transaction XDR.");
  }

  return signedXdr;
}

async function submitSignedTransaction(
  horizon: Horizon.Server,
  transaction: Transaction | FeeBumpTransaction,
): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
  try {
    return await horizon.submitTransaction(transaction);
  } catch (error) {
    throw normalizeHorizonError(error);
  }
}

function resolveKnownConfirmation(
  submittedHash: string,
  waitsFor?: HorizonTransactionRecord,
): HorizonTransactionRecord | undefined {
  if (waitsFor?.hash === submittedHash && waitsFor.successful) {
    return waitsFor;
  }

  return undefined;
}

async function waitForConfirmation(
  horizon: Horizon.Server,
  txHash: string,
  timeoutMs: number,
  pollIntervalMs: number,
): Promise<HorizonTransactionRecord> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const record = await horizon.transactions().transaction(txHash).call();

      if (record.successful) {
        return record;
      }

      throw new Error("Transaction was found on Horizon but marked unsuccessful.");
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw normalizeHorizonError(error);
      }
    }

    await delay(pollIntervalMs);
  }

  throw new Error(`Timed out after ${timeoutMs / 1000}s waiting for transaction confirmation.`);
}

async function callOptionalBoolean(callback?: () => boolean | Promise<boolean>): Promise<boolean | undefined> {
  return callback ? callback() : undefined;
}

function normalizeWalletError(error: unknown, fallback: string): Error {
  const message = getErrorMessage(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("reject") || lowerMessage.includes("declin") || lowerMessage.includes("denied")) {
    return new Error("Transaction signing was rejected in Freighter.");
  }

  if (lowerMessage.includes("lock")) {
    return new Error("Freighter appears to be locked. Unlock the wallet and retry.");
  }

  return new Error(message || fallback);
}

function normalizeHorizonError(error: unknown): Error {
  const message = getErrorMessage(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("tx_insufficient_balance") || lowerMessage.includes("underfunded")) {
    return new Error("Transaction failed because the source account has insufficient balance.");
  }

  if (lowerMessage.includes("timeout")) {
    return new Error("Stellar network confirmation timed out. Check the transaction hash before retrying.");
  }

  if (lowerMessage.includes("bad_seq")) {
    return new Error("Transaction sequence number is stale. Rebuild the transaction and try again.");
  }

  if (lowerMessage.includes("op_no_destination")) {
    return new Error("Transaction failed because the destination account does not exist.");
  }

  return new Error(message || "Stellar Horizon rejected the transaction.");
}

function isNotFoundError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return message.includes("not found") || message.includes("404");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const response = "response" in error ? (error.response as { data?: unknown } | undefined) : undefined;

    if (response?.data) {
      return typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    }
  }

  return String(error);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
