"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export type QueryType = "vault" | "jobsByUser"

export type VaultState = {
  contractAddress: string
  lootPool: string
  updatedAt: string
  source: "contract" | "unconfigured"
}

export type JobStatus = "open" | "submitted" | "approved" | "disputed" | "unknown"

export type Job = {
  id: string
  client: string
  freelancer: string
  totalAmount: string
  releasedAmount: string
  status: JobStatus
  updatedAt: string
}

export type ContractStateQueryHandlers = {
  queryVaultState?: () => Promise<VaultState>
  queryJobsByUser?: (address: string) => Promise<Job[]>
}

export type ContractStateResult<T> = {
  data: T | null
  error: Error | null
  isLoading: boolean
  isRefreshing: boolean
  reload: () => Promise<void>
}

type CacheEntry<T> = {
  value?: T
  expiresAt: number
  refresh?: Promise<T>
}

type CacheStats = {
  hits: number
  misses: number
  staleHits: number
}

const VAULT_TTL_MS = 30_000
const JOBS_TTL_MS = 60_000
const cache = new Map<string, CacheEntry<unknown>>()
const stats: CacheStats = {
  hits: 0,
  misses: 0,
  staleHits: 0,
}

let handlers: ContractStateQueryHandlers = {}

export function configureContractStateQueries(nextHandlers: ContractStateQueryHandlers) {
  handlers = { ...handlers, ...nextHandlers }
}

export function invalidateCache(key?: string): void {
  if (key) {
    cache.delete(key)
    return
  }

  cache.clear()
}

export function getContractStateCacheStats(): CacheStats {
  return { ...stats }
}

function devLog(message: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[contract-state-cache] ${message}`, details ?? "")
  }
}

function cacheKey(name: string, params?: Record<string, string>) {
  const contractAddress = getEnv("NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID") ?? "unconfigured-vault"
  const serializedParams = params
    ? Object.entries(params)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => `${key}:${value}`)
        .join("|")
    : "default"

  return `${contractAddress}:${name}:${serializedParams}`
}

async function readThroughCache<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const entry = cache.get(key) as CacheEntry<T> | undefined

  if (entry?.value !== undefined && now < entry.expiresAt) {
    stats.hits += 1
    devLog("hit", { key, stats: getContractStateCacheStats() })
    return entry.value
  }

  if (entry?.value !== undefined) {
    stats.staleHits += 1
    devLog("stale-hit-refreshing", { key, stats: getContractStateCacheStats() })
    if (!entry.refresh) {
      entry.refresh = refreshCacheEntry(key, ttlMs, fetcher)
    }
    return entry.value
  }

  stats.misses += 1
  devLog("miss", { key, stats: getContractStateCacheStats() })
  return refreshCacheEntry(key, ttlMs, fetcher)
}

async function refreshCacheEntry<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const refresh = fetcher()
    .then((value) => {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      })
      return value
    })
    .catch((error) => {
      const existing = cache.get(key)
      if (existing?.value !== undefined) {
        cache.set(key, { ...existing, refresh: undefined })
      } else {
        cache.delete(key)
      }
      throw error
    })

  cache.set(key, {
    value: cache.get(key)?.value as T | undefined,
    expiresAt: 0,
    refresh,
  })

  return refresh
}

export async function queryVaultState(): Promise<VaultState> {
  return readThroughCache(cacheKey("vault"), VAULT_TTL_MS, async () => {
    if (handlers.queryVaultState) {
      return handlers.queryVaultState()
    }

    return {
      contractAddress: getEnv("NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID") ?? "",
      lootPool: "0",
      updatedAt: new Date().toISOString(),
      source: "unconfigured",
    }
  })
}

export async function queryJobsByUser(address: string): Promise<Job[]> {
  const normalizedAddress = normalizeAddress(address)

  return readThroughCache(cacheKey("jobs-by-user", { address: normalizedAddress }), JOBS_TTL_MS, async () => {
    if (handlers.queryJobsByUser) {
      return handlers.queryJobsByUser(normalizedAddress)
    }

    return []
  })
}

export function useContractState(query: "vault"): ContractStateResult<VaultState>
export function useContractState(query: "jobsByUser", params: { address: string }): ContractStateResult<Job[]>
export function useContractState(
  query: QueryType,
  params?: { address?: string },
): ContractStateResult<VaultState | Job[]> {
  const address = params?.address ?? ""
  const [data, setData] = useState<VaultState | Job[] | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const aliveRef = useRef(true)
  const requestRef = useRef(0)
  const queryKey = useMemo(() => `${query}:${address}`, [address, query])

  const runQuery = useCallback(async () => {
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    setIsRefreshing(true)
    try {
      const nextData =
        query === "vault" ? await queryVaultState() : await queryJobsByUser(address)
      if (aliveRef.current && requestRef.current === requestId) {
        setData(nextData)
        setError(null)
      }
    } catch (caught) {
      if (aliveRef.current && requestRef.current === requestId) {
        setError(caught instanceof Error ? caught : new Error(String(caught)))
      }
    } finally {
      if (aliveRef.current && requestRef.current === requestId) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [address, query])

  useEffect(() => {
    aliveRef.current = true
    queueMicrotask(() => {
      void runQuery()
    })

    return () => {
      aliveRef.current = false
    }
  }, [queryKey, runQuery])

  return {
    data,
    error,
    isLoading,
    isRefreshing,
    reload: runQuery,
  }
}

function normalizeAddress(address: string) {
  const trimmed = address.trim()
  if (!trimmed) {
    throw new Error("A wallet address is required to query user contract state.")
  }
  return trimmed
}

function getEnv(key: string) {
  return process.env[key]?.trim() || undefined
}
