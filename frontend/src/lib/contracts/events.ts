import { nativeToScVal, rpc, scValToNative } from "@stellar/stellar-sdk";
import type { Api } from "@stellar/stellar-sdk/rpc";

export const DEFAULT_CONTRACT_EVENT_TYPES = [
  "YieldClaimed",
  "JobCompleted",
  "DisputeRaised",
] as const;

export type KnownContractEventType = (typeof DEFAULT_CONTRACT_EVENT_TYPES)[number];
export type ContractEventType = KnownContractEventType | (string & {});
export type ContractEventCallback = (event: ContractEvent) => void;
export type ContractEventUnsubscribe = () => void;

export interface ContractEvent {
  id: string;
  timestamp: string;
  contract: string;
  eventType: ContractEventType;
  data: unknown;
  ledger: number;
  txHash: string;
  topics: unknown[];
  raw: Api.EventResponse;
}

type EventServer = Pick<
  InstanceType<typeof rpc.Server>,
  "getEvents" | "getLatestLedger"
>;

export interface ContractEventListenerOptions {
  rpcUrl?: string;
  contractIds?: string[];
  server?: EventServer;
  startLedger?: number;
  pollIntervalMs?: number;
  debounceMs?: number;
  pageLimit?: number;
  reconnectBaseDelayMs?: number;
  reconnectMaxDelayMs?: number;
  onError?: (error: unknown) => void;
}

const DEFAULT_RPC_URL = "https://soroban-testnet.stellar.org";
const DEFAULT_POLL_INTERVAL_MS = 5_000;
const DEFAULT_DEBOUNCE_MS = 250;
const DEFAULT_PAGE_LIMIT = 100;
const DEFAULT_RECONNECT_BASE_DELAY_MS = 1_000;
const DEFAULT_RECONNECT_MAX_DELAY_MS = 30_000;
const MAX_SEEN_EVENTS = 500;

let listenerOptions: ContractEventListenerOptions = {
  rpcUrl: readEnv("NEXT_PUBLIC_STELLAR_RPC_URL") ?? DEFAULT_RPC_URL,
  contractIds: [
    readEnv("NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID"),
    readEnv("NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID"),
  ].filter(isNonEmptyString),
};

export function configureContractEventListener(
  options: ContractEventListenerOptions,
) {
  listenerOptions = {
    ...listenerOptions,
    ...options,
    contractIds:
      options.contractIds === undefined
        ? listenerOptions.contractIds
        : normalizeList(options.contractIds),
  };
}

export function subscribeToContractEvents(
  eventTypes: string[],
  callback: ContractEventCallback,
  unsubscribe?: () => void,
): ContractEventUnsubscribe {
  const eventTypeFilters = normalizeList(eventTypes);
  const options = normalizeOptions(listenerOptions);
  const server =
    options.server ??
    new rpc.Server(options.rpcUrl, {
      allowHttp: options.rpcUrl.startsWith("http://"),
    });
  const filters = buildEventFilters(eventTypeFilters, options.contractIds);
  const seenEventIds: string[] = [];
  const seenEventIdSet = new Set<string>();
  const queuedEvents: ContractEvent[] = [];

  let stopped = false;
  let cursor: string | undefined;
  let startLedger = options.startLedger;
  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  let flushTimer: ReturnType<typeof setTimeout> | undefined;
  let reconnectAttempt = 0;

  const reportError = (error: unknown) => {
    try {
      options.onError?.(error);
    } catch (handlerError) {
      console.error("Contract event error handler failed", handlerError);
    }
  };

  const flushEvents = () => {
    if (stopped || queuedEvents.length === 0) {
      return;
    }

    const events = queuedEvents.splice(0, queuedEvents.length);
    for (const event of events) {
      try {
        callback(event);
      } catch (callbackError) {
        reportError(callbackError);
      }
    }
  };

  const queueEvent = (event: ContractEvent) => {
    const eventId = event.id || `${event.txHash}:${event.ledger}:${event.eventType}`;
    if (seenEventIdSet.has(eventId)) {
      return;
    }

    seenEventIdSet.add(eventId);
    seenEventIds.push(eventId);
    if (seenEventIds.length > MAX_SEEN_EVENTS) {
      const expiredId = seenEventIds.shift();
      if (expiredId) {
        seenEventIdSet.delete(expiredId);
      }
    }

    queuedEvents.push(event);
    if (options.debounceMs <= 0) {
      flushEvents();
      return;
    }

    if (!flushTimer) {
      flushTimer = setTimeout(() => {
        flushTimer = undefined;
        flushEvents();
      }, options.debounceMs);
    }
  };

  const schedulePoll = (delayMs: number) => {
    if (stopped) {
      return;
    }

    pollTimer = setTimeout(() => {
      pollTimer = undefined;
      void poll();
    }, delayMs);
  };

  const poll = async () => {
    if (stopped) {
      return;
    }

    try {
      if (startLedger === undefined && cursor === undefined) {
        startLedger = (await server.getLatestLedger()).sequence;
      }

      const request: Api.GetEventsRequest = cursor
        ? { filters, cursor, limit: options.pageLimit }
        : { filters, startLedger: startLedger ?? 0, limit: options.pageLimit };
      const response = await server.getEvents(request);

      if (stopped) {
        return;
      }

      cursor = response.cursor || cursor;
      if (!cursor && startLedger !== undefined) {
        startLedger = Math.max(startLedger, response.latestLedger + 1);
      }

      for (const rawEvent of response.events) {
        const event = toContractEvent(rawEvent);
        if (matchesEventTypes(event, eventTypeFilters)) {
          queueEvent(event);
        }
      }

      reconnectAttempt = 0;
      schedulePoll(options.pollIntervalMs);
    } catch (error) {
      if (stopped) {
        return;
      }

      reportError(error);
      reconnectAttempt += 1;
      schedulePoll(getReconnectDelay(options, reconnectAttempt));
    }
  };

  schedulePoll(0);

  return () => {
    stopped = true;
    if (pollTimer) {
      clearTimeout(pollTimer);
    }
    if (flushTimer) {
      clearTimeout(flushTimer);
    }
    queuedEvents.splice(0, queuedEvents.length);
    unsubscribe?.();
  };
}

function buildEventFilters(
  eventTypes: string[],
  contractIds: string[],
): Api.EventFilter[] {
  const filter: Api.EventFilter = { type: "contract" };

  if (contractIds.length > 0) {
    filter.contractIds = contractIds;
  }

  if (eventTypes.length > 0) {
    filter.topics = eventTypes.map((eventType) => [
      nativeToScVal(eventType, { type: "symbol" }).toXDR("base64"),
    ]);
  }

  return [filter];
}

function toContractEvent(rawEvent: Api.EventResponse): ContractEvent {
  const topics = rawEvent.topic.map((topic) => decodeScVal(topic));
  const eventType =
    topics.find((topic): topic is string => typeof topic === "string") ??
    rawEvent.type;

  return {
    id: rawEvent.id,
    timestamp: rawEvent.ledgerClosedAt,
    contract: rawEvent.contractId?.toString() ?? "",
    eventType,
    data: decodeScVal(rawEvent.value),
    ledger: rawEvent.ledger,
    txHash: rawEvent.txHash,
    topics,
    raw: rawEvent,
  };
}

function decodeScVal(scVal: Parameters<typeof scValToNative>[0]) {
  try {
    return scValToNative(scVal);
  } catch {
    return scVal.toXDR("base64");
  }
}

function matchesEventTypes(event: ContractEvent, eventTypes: string[]) {
  return eventTypes.length === 0 || eventTypes.includes(event.eventType);
}

function normalizeOptions(
  options: ContractEventListenerOptions,
): Required<
  Pick<
    ContractEventListenerOptions,
    | "rpcUrl"
    | "contractIds"
    | "pollIntervalMs"
    | "debounceMs"
    | "pageLimit"
    | "reconnectBaseDelayMs"
    | "reconnectMaxDelayMs"
  >
> &
  Pick<ContractEventListenerOptions, "server" | "startLedger" | "onError"> {
  const rpcUrl = options.rpcUrl ?? DEFAULT_RPC_URL;

  return {
    rpcUrl,
    contractIds: normalizeList(options.contractIds ?? []),
    server: options.server,
    startLedger: options.startLedger,
    pollIntervalMs: positiveNumber(
      options.pollIntervalMs,
      DEFAULT_POLL_INTERVAL_MS,
    ),
    debounceMs: Math.max(0, options.debounceMs ?? DEFAULT_DEBOUNCE_MS),
    pageLimit: positiveNumber(options.pageLimit, DEFAULT_PAGE_LIMIT),
    reconnectBaseDelayMs: positiveNumber(
      options.reconnectBaseDelayMs,
      DEFAULT_RECONNECT_BASE_DELAY_MS,
    ),
    reconnectMaxDelayMs: positiveNumber(
      options.reconnectMaxDelayMs,
      DEFAULT_RECONNECT_MAX_DELAY_MS,
    ),
    onError: options.onError,
  };
}

function getReconnectDelay(
  options: Pick<
    Required<ContractEventListenerOptions>,
    "reconnectBaseDelayMs" | "reconnectMaxDelayMs"
  >,
  attempt: number,
) {
  const multiplier = 2 ** Math.max(0, attempt - 1);
  return Math.min(
    options.reconnectBaseDelayMs * multiplier,
    options.reconnectMaxDelayMs,
  );
}

function normalizeList(values: readonly (string | undefined | null)[]) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter(isNonEmptyString)),
  );
}

function positiveNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function readEnv(name: string) {
  return typeof process !== "undefined" ? process.env?.[name] : undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
