import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const stellarMocks = vi.hoisted(() => {
  const getHealth = vi.fn<() => Promise<unknown>>();
  const getContractData = vi.fn<() => Promise<unknown>>();
  const server = vi.fn(function MockServer() {
    return {
      getHealth,
      getContractData,
    };
  });
  const fromString = vi.fn((address: string) => ({
    toScVal: () => ({ kind: "address", address }),
  }));
  const scValToNative = vi.fn((value: unknown) => {
    if (typeof value === "object" && value !== null && "__native" in value) {
      return (value as { __native: unknown }).__native;
    }

    return value;
  });

  return {
    getHealth,
    getContractData,
    server,
    fromString,
    scValToNative,
  };
});

const contractMocks = vi.hoisted(() => {
  const deposit = vi.fn();
  const getLootPool = vi.fn();
  const drawWinner = vi.fn();
  const client = vi.fn(function MockClient() {
    return {
      deposit,
      get_loot_pool: getLootPool,
      draw_winner: drawWinner,
    };
  });

  return {
    client,
    deposit,
    getLootPool,
    drawWinner,
  };
});

vi.mock("@stellar/stellar-sdk", () => ({
  Address: {
    fromString: stellarMocks.fromString,
  },
  rpc: {
    Durability: {
      Persistent: "persistent",
    },
    Server: stellarMocks.server,
  },
  scValToNative: stellarMocks.scValToNative,
  xdr: {
    ScVal: {
      scvLedgerKeyContractInstance: () => ({ kind: "instance" }),
    },
  },
}));

vi.mock("../contracts/loot_vault/src", () => ({
  Client: contractMocks.client,
  networks: {
    testnet: {
      contractId: "CBOCSNRLUDBBOOAVPECFHBR3TL6T576BZB6AVVBDFBDAXMBKFC573VYF",
      networkPassphrase: "Test SDF Network ; September 2015",
    },
  },
}));

import { useVaultContract } from "./useVaultContract";

const originalEnv = process.env;

function makeContractDataEntry(nativeValue: unknown) {
  return {
    val: {
      contractData: () => ({
        val: () => ({ __native: nativeValue }),
      }),
    },
  };
}

function makeInstanceStorageEntry(keyName: string, nativeValue: unknown) {
  return {
    val: {
      contractData: () => ({
        val: () => ({
          instance: () => ({
            storage: () => [
              {
                key: () => ({ __native: keyName }),
                val: () => ({ __native: nativeValue }),
              },
            ],
          }),
        }),
      }),
    },
  };
}

describe("useVaultContract", () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_LOOT_VAULT_ADMIN_ADDRESS: "GADMIN",
      NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID: "CENVCONTRACT",
      NEXT_PUBLIC_LOOT_VAULT_TOKEN_ADDRESS: "GTOKEN",
      NEXT_PUBLIC_LOOT_VAULT_USER_ADDRESS: "GUSER",
    };
    stellarMocks.getHealth.mockReset();
    stellarMocks.getHealth.mockResolvedValue({ status: "healthy" });
    stellarMocks.getContractData.mockReset();
    stellarMocks.server.mockClear();
    stellarMocks.fromString.mockClear();
    stellarMocks.scValToNative.mockClear();
    contractMocks.client.mockClear();
    contractMocks.deposit.mockReset();
    contractMocks.getLootPool.mockReset();
    contractMocks.drawWinner.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("initializes with custom network params and returns the expected hook shape", async () => {
    const { result } = renderHook(() =>
      useVaultContract("Custom Network", "http://localhost:8000"),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.isConnected).toBe("boolean");
    expect(result.current.methods).toEqual({
      claimYield: expect.any(Function),
      deposit: expect.any(Function),
      getBalance: expect.any(Function),
      getCurrentYield: expect.any(Function),
      getLastWinner: expect.any(Function),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.isConnected).toBe(true);
    expect(contractMocks.client).toHaveBeenCalledWith({
      allowHttp: true,
      contractId: "CENVCONTRACT",
      networkPassphrase: "Custom Network",
      rpcUrl: "http://localhost:8000/",
    });
    expect(stellarMocks.server).toHaveBeenCalledWith("http://localhost:8000/", {
      allowHttp: true,
    });
  });

  it("returns expected method result types through the public hook API", async () => {
    const depositTransaction = { result: null };
    const claimTransaction = { result: "GWINNER" };
    contractMocks.deposit.mockResolvedValue(depositTransaction);
    contractMocks.getLootPool.mockResolvedValue({ result: BigInt(125) });
    contractMocks.drawWinner.mockResolvedValue(claimTransaction);
    stellarMocks.getContractData
      .mockResolvedValueOnce(makeContractDataEntry(BigInt(44)))
      .mockResolvedValueOnce(makeInstanceStorageEntry("LastWinner", "GWINNER"));

    const { result } = renderHook(() =>
      useVaultContract("Test SDF Network ; September 2015", "https://types.example/rpc"),
    );
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    await expect(result.current.methods.deposit(BigInt(10))).resolves.toBe(depositTransaction);
    await expect(result.current.methods.getBalance("GUSER")).resolves.toBe(BigInt(44));
    await expect(result.current.methods.getCurrentYield()).resolves.toBe(BigInt(125));
    await expect(result.current.methods.getLastWinner()).resolves.toBe("GWINNER");
    await expect(result.current.methods.claimYield()).resolves.toBe(claimTransaction);

    expect(contractMocks.deposit).toHaveBeenCalledWith(
      {
        amount: BigInt(10),
        token: "GTOKEN",
        user: "GUSER",
      },
      { publicKey: "GUSER" },
    );
    expect(contractMocks.drawWinner).toHaveBeenCalledWith({ publicKey: "GADMIN" });
  });

  it("surfaces human-readable initialization errors", async () => {
    const { result } = renderHook(() => useVaultContract("Test", "ftp://bad-rpc"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error?.message).toBe(
      'Soroban RPC URL must start with http:// or https://. Received "ftp://bad-rpc".',
    );
  });

  it("retries network initialization failures and refreshes the memoized connection", async () => {
    stellarMocks.getHealth
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce({ status: "healthy" });

    const { result } = renderHook(() =>
      useVaultContract("Test SDF Network ; September 2015", "https://retry.example/rpc"),
    );

    await waitFor(() => expect(result.current.isConnected).toBe(true), {
      timeout: 3_000,
    });

    expect(stellarMocks.getHealth).toHaveBeenCalledTimes(3);
    expect(contractMocks.client).toHaveBeenCalledTimes(3);
    expect(stellarMocks.server).toHaveBeenCalledTimes(3);
    expect(result.current.error).toBeNull();
  });

  it("converts repeated network failures into a readable retry-limit error", async () => {
    stellarMocks.getHealth.mockRejectedValue(new TypeError("fetch failed"));

    const { result } = renderHook(() =>
      useVaultContract("Test SDF Network ; September 2015", "https://down.example/rpc"),
    );

    await waitFor(() => expect(result.current.loading).toBe(false), {
      timeout: 4_000,
    });

    expect(stellarMocks.getHealth).toHaveBeenCalledTimes(4);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error?.message).toBe(
      "Loot Vault initialization failed because the Soroban RPC connection was unavailable after 3 retries.",
    );
  });
});
