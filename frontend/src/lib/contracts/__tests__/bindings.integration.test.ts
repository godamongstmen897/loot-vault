import { Address, Networks } from "@stellar/stellar-sdk";
import { Client as ContractClient } from "@stellar/stellar-sdk/contract";
import { Buffer } from "node:buffer";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Client as MercenaryBoardClient,
  networks as mercenaryBoardNetworks,
  rpc,
  type Milestone,
} from "../../../contracts/mercenary_board/src";
import {
  Client as LootVaultClient,
  networks as lootVaultNetworks,
} from "../../../contracts/loot_vault/src";

const TESTNET_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
  "https://soroban-testnet.stellar.org";
const RUN_LIVE_TESTNET =
  process.env.LOOT_VAULT_RUN_LIVE_BINDING_TESTS === "1";

const MERCENARY_BOARD_METHODS = [
  "create_job",
  "get_escrow",
  "submit_work",
  "dispute_refund",
  "approve_milestone",
] as const;

const LOOT_VAULT_METHODS = [
  "init",
  "deposit",
  "draw_winner",
  "get_loot_pool",
  "mock_generate_yield",
] as const;

const TEST_PUBLIC_KEY = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

type ContractEvent = {
  contractId: string;
  ledger: number;
  type: string;
  topic: string;
  value: unknown;
};

type EventServer = {
  getEvents: (request: {
    filters: Array<{
      contractIds: string[];
      topics: string[][];
      type: string;
    }>;
  }) => Promise<{ events: ContractEvent[] }>;
};

type FreighterLike = {
  signTransaction: (
    xdr: string,
    options: { networkPassphrase: string },
  ) => Promise<string>;
};

class ContractStateCache<T> {
  private entry?: { expiresAt: number; value: T };

  constructor(
    private readonly fetcher: () => Promise<T>,
    private readonly ttlMs: number,
    private readonly now = () => Date.now(),
  ) {}

  invalidate() {
    this.entry = undefined;
  }

  async get() {
    if (this.entry && this.entry.expiresAt > this.now()) {
      return this.entry.value;
    }

    const value = await this.fetcher();
    this.entry = {
      value,
      expiresAt: this.now() + this.ttlMs,
    };
    return value;
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function createLootVaultClient() {
  return new LootVaultClient({
    contractId: lootVaultNetworks.testnet.contractId,
    networkPassphrase: Networks.TESTNET,
    rpcUrl: TESTNET_RPC_URL,
  });
}

function createMercenaryBoardClient() {
  return new MercenaryBoardClient({
    contractId: mercenaryBoardNetworks.testnet.contractId,
    networkPassphrase: Networks.TESTNET,
    rpcUrl: TESTNET_RPC_URL,
  });
}

function createContractClients() {
  return {
    lootVault: createLootVaultClient(),
    mercenaryBoard: createMercenaryBoardClient(),
  };
}

async function pollContractEvents({
  server,
  contractId,
  eventTypes,
  onEvent,
}: {
  server: EventServer;
  contractId: string;
  eventTypes: string[];
  onEvent: (event: ContractEvent) => void;
}) {
  const response = await server.getEvents({
    filters: eventTypes.map((type) => ({
      contractIds: [contractId],
      topics: [[]],
      type,
    })),
  });

  for (const event of response.events) {
    onEvent(event);
  }

  return () => undefined;
}

function normalizeContractError(error: unknown) {
  if (error instanceof Error) {
    if (/permission|denied|auth/i.test(error.message)) {
      return "Permission denied by wallet or contract authorization";
    }

    if (/invalid|malformed/i.test(error.message)) {
      return "Invalid contract input";
    }

    return error.message;
  }

  return "Unknown contract error";
}

async function signWithFreighter({
  freighter,
  xdr,
  networkPassphrase,
}: {
  freighter: FreighterLike;
  xdr: string;
  networkPassphrase: string;
}) {
  try {
    return await freighter.signTransaction(xdr, { networkPassphrase });
  } catch (error) {
    throw new Error(normalizeContractError(error));
  }
}

describe("contract binding integration harness", () => {
  it("tracks deployed Testnet bindings for both application contracts", () => {
    expect(lootVaultNetworks.testnet.networkPassphrase).toBe(Networks.TESTNET);
    expect(lootVaultNetworks.testnet.contractId).toMatch(/^C[A-Z2-7]{55}$/);
    expect(() =>
      Address.fromString(lootVaultNetworks.testnet.contractId),
    ).not.toThrow();

    expect(mercenaryBoardNetworks.testnet.networkPassphrase).toBe(
      Networks.TESTNET,
    );
    expect(mercenaryBoardNetworks.testnet.contractId).toMatch(
      /^C[A-Z2-7]{55}$/,
    );
    expect(() =>
      Address.fromString(mercenaryBoardNetworks.testnet.contractId),
    ).not.toThrow();
  });

  it("initializes hook-ready contract clients with active Testnet RPC settings", () => {
    const { lootVault, mercenaryBoard } = createContractClients();

    expect(lootVault.options.contractId).toBe(
      lootVaultNetworks.testnet.contractId,
    );
    expect(lootVault.options.networkPassphrase).toBe(Networks.TESTNET);
    expect(lootVault.options.rpcUrl).toBe(TESTNET_RPC_URL);

    expect(mercenaryBoard.options.contractId).toBe(
      mercenaryBoardNetworks.testnet.contractId,
    );
    expect(mercenaryBoard.options.networkPassphrase).toBe(Networks.TESTNET);
    expect(mercenaryBoard.options.rpcUrl).toBe(TESTNET_RPC_URL);

    for (const methodName of LOOT_VAULT_METHODS) {
      expect(typeof lootVault[methodName]).toBe("function");
      expect(typeof lootVault.fromJSON[methodName]).toBe("function");
    }

    for (const methodName of MERCENARY_BOARD_METHODS) {
      expect(typeof mercenaryBoard[methodName]).toBe("function");
      expect(typeof mercenaryBoard.fromJSON[methodName]).toBe("function");
    }
  });

  it("keeps generated deploy wrappers wired to Stellar SDK deployment", async () => {
    const deployResult = { result: "deploy-transaction" };
    const deploySpy = vi
      .spyOn(ContractClient, "deploy")
      .mockResolvedValue(deployResult as never);
    const wasmHash = Buffer.alloc(32);

    await expect(
      LootVaultClient.deploy({
        wasmHash,
        networkPassphrase: Networks.TESTNET,
        rpcUrl: TESTNET_RPC_URL,
        publicKey: TEST_PUBLIC_KEY,
      }),
    ).resolves.toBe(deployResult);

    await expect(
      MercenaryBoardClient.deploy({
        wasmHash,
        networkPassphrase: Networks.TESTNET,
        rpcUrl: TESTNET_RPC_URL,
        publicKey: TEST_PUBLIC_KEY,
      }),
    ).resolves.toBe(deployResult);

    expect(deploySpy).toHaveBeenCalledTimes(2);
    for (const call of deploySpy.mock.calls) {
      expect(call).toEqual([
        null,
        expect.objectContaining({ wasmHash, rpcUrl: TESTNET_RPC_URL }),
      ]);
    }
  });

  it("keeps representative Loot Vault payloads aligned with generated binding types", () => {
    const initPayload = {
      admin: TEST_PUBLIC_KEY,
    } satisfies Parameters<LootVaultClient["init"]>[0];

    const depositPayload = {
      user: TEST_PUBLIC_KEY,
      token: TEST_PUBLIC_KEY,
      amount: BigInt(1_000_000),
    } satisfies Parameters<LootVaultClient["deposit"]>[0];

    const yieldPayload = {
      amount: BigInt(25_000),
    } satisfies Parameters<LootVaultClient["mock_generate_yield"]>[0];

    expect(initPayload.admin).toBe(TEST_PUBLIC_KEY);
    expect(depositPayload.amount).toBe(BigInt(1_000_000));
    expect(yieldPayload.amount).toBeGreaterThan(BigInt(0));
  });

  it("keeps representative Mercenary Board payloads aligned with generated binding types", () => {
    const milestone: Milestone = {
      amount: BigInt(1_000_000),
      description: "Initial implementation milestone",
      status: { tag: "Pending", values: undefined },
    };

    const createJobPayload = {
      job_id: "integration-test-job",
      client: TEST_PUBLIC_KEY,
      freelancer: TEST_PUBLIC_KEY,
      token: TEST_PUBLIC_KEY,
      milestones: [milestone],
      refund_timelock: 60,
    } satisfies Parameters<MercenaryBoardClient["create_job"]>[0];

    const submitWorkPayload = {
      job_id: createJobPayload.job_id,
      milestone_index: 0,
      freelancer: createJobPayload.freelancer,
    } satisfies Parameters<MercenaryBoardClient["submit_work"]>[0];

    const approveMilestonePayload = {
      job_id: createJobPayload.job_id,
      milestone_index: 0,
      client: createJobPayload.client,
    } satisfies Parameters<MercenaryBoardClient["approve_milestone"]>[0];

    expect(createJobPayload.milestones[0].status.tag).toBe("Pending");
    expect(submitWorkPayload.milestone_index).toBe(0);
    expect(approveMilestonePayload.client).toBe(createJobPayload.client);
  });

  it("polls contract events and delivers callback payloads for listeners", async () => {
    const event: ContractEvent = {
      contractId: mercenaryBoardNetworks.testnet.contractId,
      ledger: 123,
      type: "contract",
      topic: "MilestoneApproved",
      value: { jobId: "integration-test-job", milestoneIndex: 0 },
    };
    const server: EventServer = {
      getEvents: vi.fn().mockResolvedValue({ events: [event] }),
    };
    const callback = vi.fn();

    const unsubscribe = await pollContractEvents({
      server,
      contractId: mercenaryBoardNetworks.testnet.contractId,
      eventTypes: ["contract"],
      onEvent: callback,
    });

    expect(server.getEvents).toHaveBeenCalledWith({
      filters: [
        {
          contractIds: [mercenaryBoardNetworks.testnet.contractId],
          topics: [[]],
          type: "contract",
        },
      ],
    });
    expect(callback).toHaveBeenCalledWith(event);
    expect(unsubscribe()).toBeUndefined();
  });

  it("mocks Freighter signing without requiring the browser extension", async () => {
    const freighter: FreighterLike = {
      signTransaction: vi.fn().mockResolvedValue("signed-xdr"),
    };

    await expect(
      signWithFreighter({
        freighter,
        xdr: "unsigned-xdr",
        networkPassphrase: Networks.TESTNET,
      }),
    ).resolves.toBe("signed-xdr");

    expect(freighter.signTransaction).toHaveBeenCalledWith("unsigned-xdr", {
      networkPassphrase: Networks.TESTNET,
    });
  });

  it("normalizes wallet permission and invalid-input contract errors", async () => {
    const permissionDenied: FreighterLike = {
      signTransaction: vi.fn().mockRejectedValue(new Error("permission denied")),
    };
    const invalidInput = new Error("invalid contract argument: amount");

    await expect(
      signWithFreighter({
        freighter: permissionDenied,
        xdr: "unsigned-xdr",
        networkPassphrase: Networks.TESTNET,
      }),
    ).rejects.toThrow("Permission denied by wallet or contract authorization");

    expect(normalizeContractError(invalidInput)).toBe("Invalid contract input");
    expect(normalizeContractError(null)).toBe("Unknown contract error");
  });

  it("refreshes and invalidates cached contract state deterministically", async () => {
    let now = 1_000;
    const fetcher = vi
      .fn<() => Promise<bigint>>()
      .mockResolvedValueOnce(BigInt(10))
      .mockResolvedValueOnce(BigInt(20))
      .mockResolvedValueOnce(BigInt(30));
    const cache = new ContractStateCache(fetcher, 500, () => now);

    await expect(cache.get()).resolves.toBe(BigInt(10));
    await expect(cache.get()).resolves.toBe(BigInt(10));
    expect(fetcher).toHaveBeenCalledTimes(1);

    now = 1_501;
    await expect(cache.get()).resolves.toBe(BigInt(20));

    cache.invalidate();
    await expect(cache.get()).resolves.toBe(BigInt(30));
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("documents how to enable the live Stellar Testnet smoke check", () => {
    expect(typeof RUN_LIVE_TESTNET).toBe("boolean");
    expect(TESTNET_RPC_URL).toMatch(/^https?:\/\//);
  });

  it("installs Buffer for browser-like generated binding imports", async () => {
    vi.resetModules();
    vi.stubGlobal("window", {});

    const generatedBindingPath =
      "../../../contracts/mercenary_board/src?browser-buffer";
    await import(generatedBindingPath);

    expect((globalThis.window as { Buffer?: typeof Buffer }).Buffer).toBe(
      Buffer,
    );

    vi.resetModules();
    vi.stubGlobal("window", {});

    const lootVaultBindingPath = "../../../contracts/loot_vault/src?browser-buffer";
    await import(lootVaultBindingPath);

    expect((globalThis.window as { Buffer?: typeof Buffer }).Buffer).toBe(
      Buffer,
    );
  });
});

describe.skipIf(!RUN_LIVE_TESTNET)("live Stellar Testnet contract binding smoke", () => {
  it("connects to the configured Soroban RPC endpoint before live contract calls run", async () => {
    const server = new rpc.Server(TESTNET_RPC_URL);
    const health = await server.getHealth();

    expect(["healthy", "degraded", "unhealthy"]).toContain(health.status);
  });
});
