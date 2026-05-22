"use client"

import { getContractStateCacheStats, invalidateCache, useContractState } from "../lib/contracts/stateCache"

export function ContractStatePanel() {
  const vault = useContractState("vault")
  const stats = getContractStateCacheStats()

  return (
    <section className="mt-8 border border-lime-400 bg-zinc-950 p-6 shadow-[0_0_24px_rgba(132,204,22,0.16)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-lime-300">Contract State Cache</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Vault query status</h2>
        </div>

        <button
          type="button"
          onClick={() => {
            invalidateCache()
            void vault.reload()
          }}
          className="border border-lime-300 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-lime-100 hover:bg-lime-300 hover:text-black focus:outline focus:outline-2 focus:outline-offset-4 focus:outline-lime-300"
        >
          Refresh
        </button>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
        <div className="border border-zinc-700 p-4">
          <dt className="text-zinc-400">Status</dt>
          <dd className="mt-2 font-mono text-lime-200">
            {vault.isLoading ? "LOADING" : vault.error ? "ERROR" : vault.isRefreshing ? "REFRESHING" : "READY"}
          </dd>
        </div>

        <div className="border border-zinc-700 p-4">
          <dt className="text-zinc-400">Loot pool</dt>
          <dd className="mt-2 font-mono text-white">{vault.data?.lootPool ?? "0"}</dd>
        </div>

        <div className="border border-zinc-700 p-4">
          <dt className="text-zinc-400">Cache</dt>
          <dd className="mt-2 font-mono text-white">
            H:{stats.hits} M:{stats.misses} S:{stats.staleHits}
          </dd>
        </div>
      </dl>

      {vault.error ? (
        <p role="alert" className="mt-4 border border-red-500 p-3 text-sm text-red-200">
          {vault.error.message}
        </p>
      ) : null}
    </section>
  )
}
