import QuestBoardTable from '@/components/QuestBoardTable'
import { Job } from '@/types'

const MOCK_JOBS: Job[] = [
  { id: '1', title: 'Create Rust Smart Contract for Token Airdrop', client: 'Yield Farming DAO', bounty: 5000, status: 'Open', deadline: '2026-06-01' },
  { id: '2', title: 'Audit Merkle Proof Logic', client: 'ZeroKnowledge Inc.', bounty: 12000, status: 'In Progress', deadline: '2026-05-25' },
  { id: '3', title: 'Design Figma Mockups for Governance UI', client: 'DeFi Punk', bounty: 3000, status: 'Completed', deadline: '2026-05-15' },
  { id: '4', title: 'Fix Soroban Auth Bug', client: 'Stellar Foundation', bounty: 8500, status: 'Disputed', deadline: '2026-05-10' },
  { id: '5', title: 'Build React Dashboard for Escrow', client: 'Loot Vault', bounty: 4500, status: 'Open', deadline: '2026-06-15' },
  { id: '6', title: 'Write Technical Documentation for VRF', client: 'ZK Labs', bounty: 1500, status: 'Completed', deadline: '2026-05-01' },
  { id: '7', title: 'Optimize Indexer Database Queries', client: 'Graph Protocol', bounty: 7000, status: 'In Progress', deadline: '2026-05-30' },
  { id: '8', title: 'Develop Telegram Alert Bot for Liquidations', client: 'Aave', bounty: 2500, status: 'Open', deadline: '2026-06-05' },
  { id: '9', title: 'Translate Landing Page to Japanese', client: 'Global Crypto', bounty: 500, status: 'Completed', deadline: '2026-04-20' },
  { id: '10', title: 'Implement WalletConnect v2', client: 'Trust Wallet', bounty: 6000, status: 'Open', deadline: '2026-06-10' },
  { id: '11', title: 'Create Promo Video Animation', client: 'Marketing DAO', bounty: 4000, status: 'Open', deadline: '2026-06-20' },
  { id: '12', title: 'Refactor Tailwind CSS Classes', client: 'UI Experts', bounty: 2000, status: 'In Progress', deadline: '2026-05-28' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans selection:bg-cyan-900">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="mb-12 border-b border-gray-800 pb-8 tracking-widest text-center mt-8">
          <h1 className="text-5xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500 uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            Loot Vault
          </h1>
          <p className="text-xl text-gray-400 font-mono">
            Decentralized Mercenary Protocols
          </p>
        </header>

        <section>
          <QuestBoardTable jobs={MOCK_JOBS} />
        </section>

        <footer className="mt-20 pt-8 border-t border-gray-800 text-center flex flex-col items-center gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-gray-500 w-full max-w-2xl text-left px-4">
            <div className="border-l border-cyan-800 pl-3">STS: <span className="text-cyan-600">ONLINE</span></div>
            <div className="border-l border-cyan-800 pl-3">NET: <span className="text-cyan-600">SOROBAN</span></div>
            <div className="border-l border-cyan-800 pl-3">TVL: <span className="text-cyan-600">8.4M XLM</span></div>
            <div className="border-l border-cyan-800 pl-3">VR: <span className="text-cyan-600">v1.2.4</span></div>
          </div>
          <a
            href="https://github.com/godamongstmen897/loot-vault"
            className="inline-block px-8 py-3 bg-transparent hover:bg-cyan-950/30 text-cyan-400 font-bold tracking-widest uppercase border border-cyan-700 hover:border-cyan-400 transition-all font-mono hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            Access Mainframe (GitHub)
          </a>
        </footer>
      </div>
    </main>
  )
}
