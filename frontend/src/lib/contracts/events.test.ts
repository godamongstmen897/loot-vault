import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

const stellarSdkMocks = vi.hoisted(() => ({
  nativeToScVal: vi.fn((value: string) => ({
    toXDR: vi.fn(() => `symbol:${value}`),
  })),
  scValToNative: vi.fn((value: MockScVal) => {
    if (value.decodeError) {
      throw new Error("decode failed");
    }

    return value.native;
  }),
  Server: vi.fn(),
}));

vi.mock("@stellar/stellar-sdk", () => ({
  nativeToScVal: stellarSdkMocks.nativeToScVal,
  scValToNative: stellarSdkMocks.scValToNative,
  rpc: {
    Server: stellarSdkMocks.Server,
  },
}));

import {
  configureContractEventListener,
  subscribeToContractEvents,
  type ContractEventListenerOptions,
} from "./events";

interface MockScVal {
  native: unknown;
  decodeError?: boolean;
  toXDR: Mock<() => string>;
}

interface MockRawEvent {
  id: string;
  ledgerClosedAt: string;
  contractId?: { toString: () => string };
  type: string;
  topic: MockScVal[];
  value: MockScVal;
  ledger: number;
  txHash: string;
}

interface MockEventsResponse {
  cursor?: string;
  latestLedger: number;
  events: MockRawEvent[];
}

interface MockServer {
  getLatestLedger: Mock<() => Promise<{ sequence: number }>>;
  getEvents: Mock<(request: unknown) => Promise<MockEventsResponse>>;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  configureContractEventListener({
    rpcUrl: "https://soroban-testnet.stellar.org",
    contractIds: [],
    server: undefined,
    startLedger: undefined,
    pollIntervalMs: 5_000,
    debounceMs: 250,
    pageLimit: 100,
    reconnectBaseDelayMs: 1_000,
    reconnectMaxDelayMs: 30_000,
    onError: undefined,
  });
});

describe("subscribeToContractEvents", () => {
  it("normalizes callback payloads and sends filtered RPC requests", async () => {
    vi.useFakeTimers();
    const rawEvent = createRawEvent({
      id: "evt-1",
      eventType: "YieldClaimed",
      data: { amount: "100", asset: "XLM" },
    });
    const server = createServer([{ cursor: "cursor-1", latestLedger: 42, events: [rawEvent] }]);
    configureTestListener(server);
    const callback = vi.fn();

    subscribeToContractEvents([" YieldClaimed ", "YieldClaimed"], callback);
    await vi.advanceTimersByTimeAsync(0);

    expect(server.getEvents).toHaveBeenCalledWith({
      filters: [
        {
          type: "contract",
          contractIds: ["CONTRACT_A"],
          topics: [["symbol:YieldClaimed"]],
        },
      ],
      startLedger: 7,
      limit: 25,
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      id: "evt-1",
      timestamp: "2026-05-20T15:00:00Z",
      contract: "CONTRACT_A",
      eventType: "YieldClaimed",
      data: { amount: "100", asset: "XLM" },
      ledger: 41,
      txHash: "tx-evt-1",
      topics: ["YieldClaimed"],
      raw: rawEvent,
    });
  });

  it("cleans up pending debounce callbacks, timers, queues, and caller unsubscribe", async () => {
    vi.useFakeTimers();
    const server = createServer([
      {
        cursor: "cursor-1",
        latestLedger: 42,
        events: [createRawEvent({ id: "evt-cleanup", eventType: "JobCompleted" })],
      },
    ]);
    configureTestListener(server, { debounceMs: 1_000, pollIntervalMs: 2_000 });
    const callback = vi.fn();
    const callerUnsubscribe = vi.fn();

    const unsubscribe = subscribeToContractEvents(
      ["JobCompleted"],
      callback,
      callerUnsubscribe,
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(callback).not.toHaveBeenCalled();

    unsubscribe();
    await vi.advanceTimersByTimeAsync(3_000);

    expect(callback).not.toHaveBeenCalled();
    expect(callerUnsubscribe).toHaveBeenCalledTimes(1);
    expect(server.getEvents).toHaveBeenCalledTimes(1);
  });

  it("suppresses duplicate events across poll pages", async () => {
    vi.useFakeTimers();
    const first = createRawEvent({ id: "evt-dupe", eventType: "DisputeRaised" });
    const duplicate = createRawEvent({ id: "evt-dupe", eventType: "DisputeRaised" });
    const server = createServer([
      { cursor: "cursor-1", latestLedger: 42, events: [first] },
      { cursor: "cursor-2", latestLedger: 43, events: [duplicate] },
    ]);
    configureTestListener(server, { pollIntervalMs: 20 });
    const callback = vi.fn();

    const unsubscribe = subscribeToContractEvents(["DisputeRaised"], callback);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(20);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(server.getEvents).toHaveBeenNthCalledWith(2, {
      filters: [
        {
          type: "contract",
          contractIds: ["CONTRACT_A"],
          topics: [["symbol:DisputeRaised"]],
        },
      ],
      cursor: "cursor-1",
      limit: 25,
    });
    unsubscribe();
  });

  it("reports poll errors and reconnects with capped exponential backoff", async () => {
    vi.useFakeTimers();
    const firstError = new Error("rpc unavailable");
    const secondError = new Error("still unavailable");
    const rawEvent = createRawEvent({ id: "evt-recovered", eventType: "YieldClaimed" });
    const server = createServer([
      firstError,
      secondError,
      { cursor: "cursor-1", latestLedger: 42, events: [rawEvent] },
    ]);
    configureTestListener(server, {
      reconnectBaseDelayMs: 100,
      reconnectMaxDelayMs: 150,
      pollIntervalMs: 5_000,
    });
    const onError = vi.fn();
    configureContractEventListener({ onError });
    const callback = vi.fn();

    const unsubscribe = subscribeToContractEvents(["YieldClaimed"], callback);
    await vi.advanceTimersByTimeAsync(0);
    expect(onError).toHaveBeenCalledWith(firstError);

    await vi.advanceTimersByTimeAsync(99);
    expect(server.getEvents).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(onError).toHaveBeenCalledWith(secondError);

    await vi.advanceTimersByTimeAsync(149);
    expect(server.getEvents).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: "evt-recovered", eventType: "YieldClaimed" }),
    );

    unsubscribe();
  });

  it("reports callback errors without stopping later event delivery", async () => {
    vi.useFakeTimers();
    const callbackError = new Error("callback failed");
    const server = createServer([
      {
        cursor: "cursor-1",
        latestLedger: 42,
        events: [
          createRawEvent({ id: "evt-error-1", eventType: "YieldClaimed" }),
          createRawEvent({ id: "evt-error-2", eventType: "YieldClaimed" }),
        ],
      },
    ]);
    const onError = vi.fn();
    configureTestListener(server, { onError });
    const callback = vi
      .fn()
      .mockImplementationOnce(() => {
        throw callbackError;
      })
      .mockImplementationOnce(() => undefined);

    subscribeToContractEvents(["YieldClaimed"], callback);
    await vi.advanceTimersByTimeAsync(0);

    expect(onError).toHaveBeenCalledWith(callbackError);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "evt-error-2" }),
    );
  });
});

function configureTestListener(
  server: MockServer,
  options: Partial<ContractEventListenerOptions> = {},
) {
  configureContractEventListener({
    rpcUrl: "https://rpc.example",
    contractIds: [" CONTRACT_A ", "CONTRACT_A", ""],
    server: server as unknown as ContractEventListenerOptions["server"],
    startLedger: 7,
    pollIntervalMs: 10_000,
    debounceMs: 0,
    pageLimit: 25,
    reconnectBaseDelayMs: 100,
    reconnectMaxDelayMs: 500,
    onError: undefined,
    ...options,
  });
}

function createServer(results: Array<MockEventsResponse | Error>): MockServer {
  const pendingResults = [...results];

  return {
    getLatestLedger: vi.fn(async () => ({ sequence: 7 })),
    getEvents: vi.fn(async () => {
      const result = pendingResults.shift();
      if (result instanceof Error) {
        throw result;
      }

      return result ?? { cursor: "cursor-empty", latestLedger: 42, events: [] };
    }),
  };
}

function createRawEvent({
  id,
  eventType,
  data = { ok: true },
}: {
  id: string;
  eventType: string;
  data?: unknown;
}): MockRawEvent {
  return {
    id,
    ledgerClosedAt: "2026-05-20T15:00:00Z",
    contractId: { toString: () => "CONTRACT_A" },
    type: "contract",
    topic: [createScVal(eventType)],
    value: createScVal(data),
    ledger: 41,
    txHash: `tx-${id}`,
  };
}

function createScVal(native: unknown): MockScVal {
  return {
    native,
    toXDR: vi.fn(() => `xdr:${String(native)}`),
  };
}
