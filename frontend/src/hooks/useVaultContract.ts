"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Address,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import type { AssembledTransaction } from "@stellar/stellar-sdk/contract";

import {
  Client as LootVaultClient,
  networks,
} from "../contracts/loot_vault/src";

export type Transaction<T = unknown> = AssembledTransaction<T>;

export type VaultContractMethods = {
  deposit(amount: bigint): Promise<Transaction<null>>;
  getBalance(userAddress: string): Promise<bigint>;
  getCurrentYield(): Promise<bigint>;
  getLastWinner(): Promise<string | null>;
  claimYield(): Promise<Transaction>;
};

export type VaultContractState = {
  methods: VaultContractMethods;
  loading: boolean;
  error: Error | null;
  isConnected: boolean;
};

type VaultConnection = {
  client: LootVaultClient;
  server: rpc.Server;
  config: ResolvedVaultConfig;
};

type ResolvedVaultConfig = {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
  allowHttp: boolean;
};

const DEFAULT_RPC_URL = "https://soroban-testnet.stellar.org";
const DEFAULT_NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;
const DEFAULT_CONTRACT_ID = networks.testnet.contractId;
const MAX_NETWORK_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 250;
const connectionCache = new Map<string, VaultConnection>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateAddress(address: string, label: string): string {
  try {
    Address.fromString(address);
  } catch {
    throw new Error(`${label} must be a valid Stellar address. Received "${address}".`);
  }

  return address;
}

function resolveRpcUrl(rpcUrl?: string): { rpcUrl: string; allowHttp: boolean } {
  const resolvedRpcUrl =
    rpcUrl ?? process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? DEFAULT_RPC_URL;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(resolvedRpcUrl);
  } catch {
    throw new Error(`Soroban RPC URL is invalid: "${resolvedRpcUrl}".`);
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new Error(
      `Soroban RPC URL must start with http:// or https://. Received "${resolvedRpcUrl}".`,
    );
  }

  return {
    rpcUrl: parsedUrl.toString(),
    allowHttp: parsedUrl.protocol === "http:",
  };
}

function resolveContractId(networkPassphrase: string): string {
  const contractId =
    process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID ??
    (networkPassphrase === DEFAULT_NETWORK_PASSPHRASE ? DEFAULT_CONTRACT_ID : undefined);

  if (!contractId) {
    throw new Error(
      "Missing Loot Vault contract ID. Set NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID for custom networks.",
    );
  }

  return validateAddress(contractId, "Loot Vault contract ID");
}

function resolveVaultConfig(
  networkPassphrase?: string,
  rpcUrl?: string,
): ResolvedVaultConfig {
  const resolvedNetworkPassphrase = networkPassphrase ?? DEFAULT_NETWORK_PASSPHRASE;
  const resolvedRpc = resolveRpcUrl(rpcUrl);

  return {
    contractId: resolveContractId(resolvedNetworkPassphrase),
    networkPassphrase: resolvedNetworkPassphrase,
    rpcUrl: resolvedRpc.rpcUrl,
    allowHttp: resolvedRpc.allowHttp,
  };
}

function getConnectionCacheKey(config: ResolvedVaultConfig): string {
  return [
    config.contractId,
    config.networkPassphrase,
    config.rpcUrl,
    String(config.allowHttp),
  ].join("|");
}

function getMemoizedConnection(config: ResolvedVaultConfig): VaultConnection {
  const cacheKey = getConnectionCacheKey(config);
  const cachedConnection = connectionCache.get(cacheKey);

  if (cachedConnection) {
    return cachedConnection;
  }

  const connection = {
    client: new LootVaultClient({
      contractId: config.contractId,
      networkPassphrase: config.networkPassphrase,
      rpcUrl: config.rpcUrl,
      allowHttp: config.allowHttp,
    }),
    server: new rpc.Server(config.rpcUrl, { allowHttp: config.allowHttp }),
    config,
  };

  connectionCache.set(cacheKey, connection);
  return connection;
}

function resetMemoizedConnection(config: ResolvedVaultConfig): void {
  connectionCache.delete(getConnectionCacheKey(config));
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /network|fetch|timeout|timed out|econn|socket|503|504|429|getaddrinfo|rpc/i.test(
    message,
  );
}

function isMissingContractData(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /not found|missing|does not exist|no contract data/i.test(message);
}

function toHumanReadableError(error: unknown, action: string): Error {
  const message = error instanceof Error ? error.message : String(error);

  if (message.startsWith("Missing ") || message.includes("must be a valid Stellar address")) {
    return new Error(message);
  }

  if (isNetworkError(error)) {
    return new Error(
      `Loot Vault ${action} failed because the Soroban RPC connection was unavailable after ${MAX_NETWORK_RETRIES} retries.`,
    );
  }

  if (/auth|authorization|signature|sign/i.test(message)) {
    return new Error(`Loot Vault ${action} requires a valid wallet signature or source account.`);
  }

  if (/hosterror|contract/i.test(message)) {
    return new Error(`Loot Vault contract rejected ${action}: ${message}`);
  }

  return new Error(`Loot Vault ${action} failed: ${message}`);
}

async function withNetworkRetries<T>(
  action: (attempt: number) => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_NETWORK_RETRIES; attempt += 1) {
    try {
      return await action(attempt);
    } catch (error) {
      lastError = error;

      if (!isNetworkError(error) || attempt === MAX_NETWORK_RETRIES) {
        throw error;
      }

      await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
    }
  }

  throw lastError;
}

function resolveEnvAddress(envKey: string, label: string): string {
  const address = process.env[envKey];

  if (!address) {
    throw new Error(`Missing ${envKey}. ${label}`);
  }

  return validateAddress(address, envKey);
}

function readContractDataValue(entry: Awaited<ReturnType<rpc.Server["getContractData"]>>) {
  return entry.val.contractData().val();
}

async function readPersistentI128(
  connection: VaultConnection,
  key: xdr.ScVal,
): Promise<bigint> {
  try {
    const entry = await connection.server.getContractData(
      connection.config.contractId,
      key,
      rpc.Durability.Persistent,
    );
    const value = scValToNative(readContractDataValue(entry));

    return typeof value === "bigint" ? value : BigInt(value);
  } catch (error) {
    if (isMissingContractData(error)) {
      return BigInt(0);
    }

    throw error;
  }
}

async function readInstanceStorageValue(
  connection: VaultConnection,
  keyName: string,
): Promise<unknown | null> {
  try {
    const entry = await connection.server.getContractData(
      connection.config.contractId,
      xdr.ScVal.scvLedgerKeyContractInstance(),
      rpc.Durability.Persistent,
    );
    const instance = readContractDataValue(entry).instance();
    const storageEntries = instance.storage() ?? [];
    const storageEntry = storageEntries.find((candidate) => {
      return scValToNative(candidate.key()) === keyName;
    });

    return storageEntry ? scValToNative(storageEntry.val()) : null;
  } catch (error) {
    if (isMissingContractData(error)) {
      return null;
    }

    throw error;
  }
}

/**
 * Initializes and exposes the Loot Vault contract operations behind a React hook.
 *
 * The deployed testnet binding currently needs a user and token address to build
 * deposit transactions, so `deposit(amount)` reads `NEXT_PUBLIC_LOOT_VAULT_USER_ADDRESS`
 * and `NEXT_PUBLIC_LOOT_VAULT_TOKEN_ADDRESS`. `claimYield()` uses
 * `NEXT_PUBLIC_LOOT_VAULT_ADMIN_ADDRESS` when provided, otherwise the user address,
 * and maps to the current contract's `draw_winner` settlement transaction until a
 * dedicated `claim_yield` binding is generated.
 */
export function useVaultContract(
  networkPassphrase?: string,
  rpcUrl?: string,
): VaultContractState {
  const [connection, setConnection] = useState<VaultConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<VaultConnection | null>(null);

  const initializeConnection = useCallback(
    async (forceRefresh = false): Promise<VaultConnection> => {
      const config = resolveVaultConfig(networkPassphrase, rpcUrl);

      if (forceRefresh) {
        resetMemoizedConnection(config);
      }

      const nextConnection = getMemoizedConnection(config);
      await nextConnection.server.getHealth();
      connectionRef.current = nextConnection;
      return nextConnection;
    },
    [networkPassphrase, rpcUrl],
  );

  useEffect(() => {
    let isMounted = true;

    async function connect() {
      setLoading(true);
      setError(null);
      setIsConnected(false);

      try {
        const nextConnection = await withNetworkRetries((attempt) =>
          initializeConnection(attempt > 0),
        );

        if (!isMounted) {
          return;
        }

        connectionRef.current = nextConnection;
        setConnection(nextConnection);
        setIsConnected(true);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setConnection(null);
        connectionRef.current = null;
        setIsConnected(false);
        setError(toHumanReadableError(caughtError, "initialization"));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void connect();

    return () => {
      isMounted = false;
    };
  }, [initializeConnection]);

  const runVaultOperation = useCallback(
    async <T,>(
      actionName: string,
      operation: (activeConnection: VaultConnection) => Promise<T>,
    ): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const result = await withNetworkRetries(async (attempt) => {
          const activeConnection =
            attempt > 0 || !connectionRef.current
              ? await initializeConnection(attempt > 0)
              : connectionRef.current;

          return operation(activeConnection);
        });

        if (connectionRef.current) {
          setConnection(connectionRef.current);
        }

        setIsConnected(true);
        return result;
      } catch (caughtError) {
        const readableError = toHumanReadableError(caughtError, actionName);
        setError(readableError);

        if (isNetworkError(caughtError)) {
          setIsConnected(false);
        }

        throw readableError;
      } finally {
        setLoading(false);
      }
    },
    [initializeConnection],
  );

  const deposit = useCallback(
    async (amount: bigint): Promise<Transaction<null>> => {
      return runVaultOperation("deposit", async (activeConnection) => {
        const user = resolveEnvAddress(
          "NEXT_PUBLIC_LOOT_VAULT_USER_ADDRESS",
          "The current generated contract requires a default depositor for deposit(amount).",
        );
        const token = resolveEnvAddress(
          "NEXT_PUBLIC_LOOT_VAULT_TOKEN_ADDRESS",
          "The current generated contract requires a token contract for deposit(amount).",
        );

        return activeConnection.client.deposit(
          {
            user,
            token,
            amount,
          },
          { publicKey: user },
        );
      });
    },
    [runVaultOperation],
  );

  const getBalance = useCallback(
    async (userAddress: string): Promise<bigint> => {
      return runVaultOperation("balance lookup", async (activeConnection) => {
        const user = validateAddress(userAddress, "User address");
        return readPersistentI128(activeConnection, Address.fromString(user).toScVal());
      });
    },
    [runVaultOperation],
  );

  const getCurrentYield = useCallback(async (): Promise<bigint> => {
    return runVaultOperation("current yield lookup", async (activeConnection) => {
      const transaction = await activeConnection.client.get_loot_pool();
      return BigInt(transaction.result);
    });
  }, [runVaultOperation]);

  const getLastWinner = useCallback(async (): Promise<string | null> => {
    return runVaultOperation("last winner lookup", async (activeConnection) => {
      const value = await readInstanceStorageValue(activeConnection, "LastWinner");
      return typeof value === "string" ? value : null;
    });
  }, [runVaultOperation]);

  const claimYield = useCallback(async (): Promise<Transaction> => {
    return runVaultOperation("yield claim", async (activeConnection) => {
      const publicKey =
        process.env.NEXT_PUBLIC_LOOT_VAULT_ADMIN_ADDRESS ??
        process.env.NEXT_PUBLIC_LOOT_VAULT_USER_ADDRESS;

      if (!publicKey) {
        throw new Error(
          "Missing NEXT_PUBLIC_LOOT_VAULT_ADMIN_ADDRESS or NEXT_PUBLIC_LOOT_VAULT_USER_ADDRESS. The current contract requires an authorized source account to settle yield.",
        );
      }

      return activeConnection.client.draw_winner({
        publicKey: validateAddress(publicKey, "Yield settlement source address"),
      });
    });
  }, [runVaultOperation]);

  const methods = useMemo<VaultContractMethods>(
    () => ({
      deposit,
      getBalance,
      getCurrentYield,
      getLastWinner,
      claimYield,
    }),
    [claimYield, deposit, getBalance, getCurrentYield, getLastWinner],
  );

  return {
    methods,
    loading,
    error,
    isConnected: isConnected && Boolean(connection),
  };
}
