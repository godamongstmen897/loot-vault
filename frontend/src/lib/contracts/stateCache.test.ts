import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { VaultState } from "./stateCache"

type StateCacheModule = typeof import("./stateCache")

async function loadStateCache(): Promise<StateCacheModule> {
  vi.resetModules()
  return import("./stateCache")
}

function vaultState(sequence: number): VaultState {
  return {
    contractAddress: "loot-vault-1",
    lootPool: String(sequence),
    updatedAt: `2026-05-20T00:00:${String(sequence).padStart(2, "0")}.000Z`,
    source: "contract",
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })

  return { promise, reject, resolve }
}

describe("contract state cache", () => {
  const originalContractId = process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID

  beforeEach(() => {
    process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID = "loot-vault-1"
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-20T00:00:00.000Z"))
  })

  afterEach(() => {
    if (originalContractId === undefined) {
      delete process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID
    } else {
      process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID = originalContractId
    }
    vi.useRealTimers()
  })

  it("records a miss on first vault query and a hit while the TTL is fresh", async () => {
    const stateCache = await loadStateCache()
    const queryVaultState = vi.fn(async () => vaultState(1))

    stateCache.configureContractStateQueries({ queryVaultState })

    await expect(stateCache.queryVaultState()).resolves.toEqual(vaultState(1))
    await expect(stateCache.queryVaultState()).resolves.toEqual(vaultState(1))

    expect(queryVaultState).toHaveBeenCalledTimes(1)
    expect(stateCache.getContractStateCacheStats()).toEqual({
      hits: 1,
      misses: 1,
      staleHits: 0,
    })
  })

  it("expires vault state after the TTL and serves stale data while refresh is in flight", async () => {
    const stateCache = await loadStateCache()
    const refresh = deferred<VaultState>()
    const queryVaultState = vi
      .fn<() => Promise<VaultState>>()
      .mockResolvedValueOnce(vaultState(1))
      .mockImplementationOnce(() => refresh.promise)

    stateCache.configureContractStateQueries({ queryVaultState })

    await expect(stateCache.queryVaultState()).resolves.toEqual(vaultState(1))
    vi.advanceTimersByTime(30_001)

    await expect(stateCache.queryVaultState()).resolves.toEqual(vaultState(1))

    expect(queryVaultState).toHaveBeenCalledTimes(2)
    expect(stateCache.getContractStateCacheStats()).toEqual({
      hits: 0,
      misses: 1,
      staleHits: 1,
    })

    refresh.resolve(vaultState(2))
    await refresh.promise
    await vi.runAllTicks()

    await expect(stateCache.queryVaultState()).resolves.toEqual(vaultState(2))
    expect(queryVaultState).toHaveBeenCalledTimes(2)
    expect(stateCache.getContractStateCacheStats()).toEqual({
      hits: 1,
      misses: 1,
      staleHits: 1,
    })
  })

  it("coalesces repeated stale reads behind one refresh promise", async () => {
    const stateCache = await loadStateCache()
    const refresh = deferred<VaultState>()
    const queryVaultState = vi
      .fn<() => Promise<VaultState>>()
      .mockResolvedValueOnce(vaultState(1))
      .mockImplementationOnce(() => refresh.promise)

    stateCache.configureContractStateQueries({ queryVaultState })

    await stateCache.queryVaultState()
    vi.advanceTimersByTime(30_001)

    await expect(
      Promise.all([stateCache.queryVaultState(), stateCache.queryVaultState()]),
    ).resolves.toEqual([vaultState(1), vaultState(1)])

    expect(queryVaultState).toHaveBeenCalledTimes(2)
    expect(stateCache.getContractStateCacheStats()).toEqual({
      hits: 0,
      misses: 1,
      staleHits: 2,
    })

    refresh.resolve(vaultState(2))
    await refresh.promise
  })

  it("misses again after manual invalidation", async () => {
    const stateCache = await loadStateCache()
    const queryVaultState = vi
      .fn<() => Promise<VaultState>>()
      .mockResolvedValueOnce(vaultState(1))
      .mockResolvedValueOnce(vaultState(2))

    stateCache.configureContractStateQueries({ queryVaultState })

    await expect(stateCache.queryVaultState()).resolves.toEqual(vaultState(1))
    stateCache.invalidateCache()
    await expect(stateCache.queryVaultState()).resolves.toEqual(vaultState(2))

    expect(queryVaultState).toHaveBeenCalledTimes(2)
    expect(stateCache.getContractStateCacheStats()).toEqual({
      hits: 0,
      misses: 2,
      staleHits: 0,
    })
  })

  it("keys jobs queries deterministically by normalized address", async () => {
    const stateCache = await loadStateCache()
    const queryJobsByUser = vi.fn(async (address: string) => [
      {
        id: "job-1",
        client: address,
        freelancer: "GBIDDER",
        totalAmount: "100",
        releasedAmount: "0",
        status: "open" as const,
        updatedAt: "2026-05-20T00:00:00.000Z",
      },
    ])

    stateCache.configureContractStateQueries({ queryJobsByUser })

    const first = await stateCache.queryJobsByUser("  GCLIENT  ")
    const second = await stateCache.queryJobsByUser("GCLIENT")

    expect(second).toEqual(first)
    expect(queryJobsByUser).toHaveBeenCalledTimes(1)
    expect(queryJobsByUser).toHaveBeenCalledWith("GCLIENT")
    expect(stateCache.getContractStateCacheStats()).toEqual({
      hits: 1,
      misses: 1,
      staleHits: 0,
    })
  })

  it("isolates cache entries by configured contract id", async () => {
    const stateCache = await loadStateCache()
    const queryJobsByUser = vi.fn(async (address: string) => [
      {
        id: `${process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID}-${address}`,
        client: address,
        freelancer: "GBIDDER",
        totalAmount: "100",
        releasedAmount: "0",
        status: "open" as const,
        updatedAt: "2026-05-20T00:00:00.000Z",
      },
    ])

    stateCache.configureContractStateQueries({ queryJobsByUser })

    await stateCache.queryJobsByUser("GCLIENT")
    process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID = "loot-vault-2"
    await stateCache.queryJobsByUser("GCLIENT")

    expect(queryJobsByUser).toHaveBeenCalledTimes(2)
    expect(stateCache.getContractStateCacheStats()).toEqual({
      hits: 0,
      misses: 2,
      staleHits: 0,
    })
  })
})
