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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function createMercenaryBoardClient() {
  return new MercenaryBoardClient({
    contractId: mercenaryBoardNetworks.testnet.contractId,
    networkPassphrase: Networks.TESTNET,
    rpcUrl: TESTNET_RPC_URL,
  });
}

describe("contract binding integration harness", () => {
  it("tracks the deployed Mercenary Board Testnet binding", () => {
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

  it("initializes a typed contract client with the active Testnet RPC settings", () => {
    const client = createMercenaryBoardClient();

    expect(client.options.contractId).toBe(
      mercenaryBoardNetworks.testnet.contractId,
    );
    expect(client.options.networkPassphrase).toBe(Networks.TESTNET);
    expect(client.options.rpcUrl).toBe(TESTNET_RPC_URL);

    for (const methodName of MERCENARY_BOARD_METHODS) {
      expect(typeof client[methodName]).toBe("function");
      expect(typeof client.fromJSON[methodName]).toBe("function");
    }
  });

  it("keeps the generated deploy wrapper wired to Stellar SDK deployment", async () => {
    const deployResult = { result: "deploy-transaction" };
    const deploySpy = vi
      .spyOn(ContractClient, "deploy")
      .mockResolvedValue(deployResult as never);
    const wasmHash = Buffer.alloc(32);

    await expect(
      MercenaryBoardClient.deploy({
        wasmHash,
        networkPassphrase: Networks.TESTNET,
        rpcUrl: TESTNET_RPC_URL,
        publicKey: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      }),
    ).resolves.toBe(deployResult);

    expect(deploySpy).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ wasmHash, rpcUrl: TESTNET_RPC_URL }),
    );
  });

  it("keeps representative Mercenary Board payloads aligned with generated binding types", () => {
    const milestone: Milestone = {
      amount: BigInt(1_000_000),
      description: "Initial implementation milestone",
      status: { tag: "Pending", values: undefined },
    };

    const createJobPayload = {
      job_id: "integration-test-job",
      client: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      freelancer: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      token: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
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
  });
});

describe.skipIf(!RUN_LIVE_TESTNET)("live Stellar Testnet contract binding smoke", () => {
  it("connects to the configured Soroban RPC endpoint before live contract calls run", async () => {
    const server = new rpc.Server(TESTNET_RPC_URL);
    const health = await server.getHealth();

    expect(["healthy", "degraded", "unhealthy"]).toContain(health.status);
  });
});
