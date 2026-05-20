import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TransactionBuilder } from "@stellar/stellar-sdk";

const stellarMock = vi.hoisted(() => ({
  serverMock: vi.fn(),
  fromXdrMock: vi.fn(),
}));

vi.mock("@stellar/stellar-sdk", () => ({
  Horizon: {
    Server: stellarMock.serverMock,
  },
  Networks: {
    TESTNET: "Test SDF Network ; September 2015",
  },
  TransactionBuilder: {
    fromXDR: stellarMock.fromXdrMock,
  },
}));

import { configureTransactionSigner, signAndSubmitTransaction } from "./transactionSigner";

type FreighterWindow = typeof globalThis & {
  freighterApi: {
    isConnected: ReturnType<typeof vi.fn>;
    isAllowed: ReturnType<typeof vi.fn>;
    getAddress: ReturnType<typeof vi.fn>;
    signTransaction: ReturnType<typeof vi.fn>;
  };
};

const signedTransaction = { kind: "signed-transaction" };
const unsignedTransaction = {
  toXDR: vi.fn(() => "unsigned-xdr"),
};

let submitTransactionMock: ReturnType<typeof vi.fn>;
let confirmationCallMock: ReturnType<typeof vi.fn>;
let transactionLookupMock: ReturnType<typeof vi.fn>;

function makeBuilder(): TransactionBuilder {
  return {
    build: vi.fn(() => unsignedTransaction),
  } as unknown as TransactionBuilder;
}

function installFreighter(overrides: Partial<FreighterWindow["freighterApi"]> = {}) {
  const freighterApi = {
    isConnected: vi.fn(async () => true),
    isAllowed: vi.fn(async () => true),
    getAddress: vi.fn(async () => ({ address: "GBROWSERWALLET" })),
    signTransaction: vi.fn(async () => "signed-xdr"),
    ...overrides,
  };

  vi.stubGlobal("window", {
    freighterApi,
    setTimeout: globalThis.setTimeout,
  });

  return freighterApi;
}

function installHorizon() {
  submitTransactionMock = vi.fn(async () => ({ hash: "tx-hash-123" }));
  confirmationCallMock = vi.fn(async () => ({ hash: "tx-hash-123", successful: true }));
  transactionLookupMock = vi.fn(() => ({
    call: confirmationCallMock,
  }));

  stellarMock.serverMock.mockImplementation(function Server() {
    return {
      submitTransaction: submitTransactionMock,
      transactions: vi.fn(() => ({
        transaction: transactionLookupMock,
      })),
    };
  });

  stellarMock.fromXdrMock.mockReturnValue(signedTransaction);
}

beforeEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  installHorizon();
  configureTransactionSigner({
    horizonUrl: "https://horizon.test",
    networkPassphrase: "Test SDF Network ; September 2015",
    confirmationTimeoutMs: 30_000,
    pollIntervalMs: 2_000,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("signAndSubmitTransaction", () => {
  it("normalizes wallet signing rejection", async () => {
    installFreighter({
      signTransaction: vi.fn(async () => {
        throw new Error("User rejected the request");
      }),
    });

    await expect(signAndSubmitTransaction(makeBuilder())).rejects.toThrow(
      "Transaction signing was rejected in Freighter.",
    );
    expect(submitTransactionMock).not.toHaveBeenCalled();
  });

  it("times out when Horizon never confirms the submitted transaction", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    installFreighter();
    configureTransactionSigner({
      confirmationTimeoutMs: 50,
      pollIntervalMs: 10,
    });
    confirmationCallMock.mockRejectedValue(new Error("404 not found"));

    const result = signAndSubmitTransaction(makeBuilder());
    const expectation = expect(result).rejects.toThrow(
      "Timed out after 0.05s waiting for transaction confirmation.",
    );

    await vi.advanceTimersByTimeAsync(60);

    await expectation;
    expect(transactionLookupMock).toHaveBeenCalledWith("tx-hash-123");
  });

  it("normalizes network submission errors from Horizon", async () => {
    installFreighter();
    submitTransactionMock.mockRejectedValue({
      response: {
        data: {
          extras: {
            result_codes: {
              transaction: "tx_bad_seq",
            },
          },
        },
      },
    });

    await expect(signAndSubmitTransaction(makeBuilder())).rejects.toThrow(
      "Transaction sequence number is stale. Rebuild the transaction and try again.",
    );
  });

  it("returns a confirmed transaction after polling Horizon successfully", async () => {
    const freighterApi = installFreighter();

    await expect(signAndSubmitTransaction(makeBuilder())).resolves.toEqual({
      txHash: "tx-hash-123",
      status: "confirmed",
    });

    expect(freighterApi.signTransaction).toHaveBeenCalledWith("unsigned-xdr", {
      networkPassphrase: "Test SDF Network ; September 2015",
      accountToSign: "GBROWSERWALLET",
    });
    expect(stellarMock.fromXdrMock).toHaveBeenCalledWith("signed-xdr", "Test SDF Network ; September 2015");
    expect(submitTransactionMock).toHaveBeenCalledWith(signedTransaction);
    expect(confirmationCallMock).toHaveBeenCalledTimes(1);
  });

  it("uses a matching successful transaction record as confirmation without polling", async () => {
    installFreighter();

    await expect(
      signAndSubmitTransaction(makeBuilder(), {
        hash: "tx-hash-123",
        successful: true,
      } as never),
    ).resolves.toEqual({
      txHash: "tx-hash-123",
      status: "confirmed",
    });

    expect(transactionLookupMock).not.toHaveBeenCalled();
  });
});
