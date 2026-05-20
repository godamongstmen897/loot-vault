import { ContractStatePanel } from "../components/ContractStatePanel"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">🎮 Loot Vault</h1>
        <p className="text-xl text-gray-300 mb-8">
          A Gamified DeFi Ecosystem & Decentralized Job Board built on Stellar Soroban
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-cyan-500 p-6">
            <h2 className="text-2xl font-bold mb-3 text-cyan-400">🎰 Loot Vault Protocol</h2>
            <p className="text-gray-300">
              No-loss yield pools where users deposit XLM and winners are drawn to receive accumulated yield.
            </p>
          </div>

          <div className="border border-magenta-500 p-6">
            <h2 className="text-2xl font-bold mb-3 text-magenta-400">⚔️ Mercenary Board</h2>
            <p className="text-gray-300">
              Trustless escrow for freelancers with milestone-based fund releases and dispute resolution.
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 border border-gray-600">
          <h3 className="text-lg font-semibold mb-4">📊 Tech Stack</h3>
          <ul className="grid grid-cols-2 gap-4 text-sm text-gray-300">
            <li>✅ Rust / Soroban Contracts</li>
            <li>✅ Next.js 16 Frontend</li>
            <li>✅ Stellar Network</li>
            <li>✅ Freighter Wallet</li>
            <li>✅ Axum Backend</li>
            <li>✅ TypeScript</li>
          </ul>
        </div>

        <ContractStatePanel />

        <div className="mt-8 text-center">
          <a
            href="https://github.com/godamongstmen897/loot-vault"
            className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded border border-cyan-500"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </main>
  )
}
