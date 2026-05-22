import { AssetGrid } from "../src/components/AssetGrid";
import type { Asset } from "../src/types";

const mockAssets: Asset[] = [
  {
    id: "xlm-yield",
    name: "XLM Yield Pool",
    amount: "2,480.50 XLM",
    value: "$318.27",
    icon: "XLM",
    status: "active",
    description: "Deposited balance generating pooled yield.",
  },
  {
    id: "loot-ticket",
    name: "Vault Entry Tickets",
    amount: "18 tickets",
    value: "$54.00",
    icon: "TKT",
    status: "active",
    description: "Current draw participation receipts.",
  },
  {
    id: "merc-escrow",
    name: "Mercenary Escrow",
    amount: "430 USDC",
    value: "$430.00",
    icon: "ESC",
    status: "locked",
    description: "Milestone funds held until delivery.",
  },
  {
    id: "job-reward",
    name: "Job Reward Pool",
    amount: "92.4 XLM",
    value: "$11.86",
    icon: "JOB",
    status: "pending",
    description: "Awaiting client release confirmation.",
  },
  {
    id: "rare-cache",
    name: "Rare Cache NFT",
    amount: "1 item",
    value: "$72.00",
    icon: "NFT",
    status: "settled",
    description: "Collected from a completed quest chain.",
  },
  {
    id: "reputation",
    name: "Reputation Credits",
    amount: "1,220 REP",
    value: "$0.00",
    icon: "REP",
    status: "active",
    description: "Non-transferable freelancer standing.",
  },
  {
    id: "daily-bonus",
    name: "Daily Bonus Stash",
    amount: "7 claims",
    value: "$3.15",
    icon: "DAY",
    status: "pending",
    description: "Unclaimed streak rewards.",
  },
  {
    id: "guild-share",
    name: "Guild Share",
    amount: "4.8%",
    value: "$96.42",
    icon: "GLD",
    status: "active",
    description: "Revenue share from squad activity.",
  },
  {
    id: "loot-bond",
    name: "Loot Bond",
    amount: "3 bonds",
    value: "$150.00",
    icon: "BND",
    status: "locked",
    description: "Timed vault position with unlock window.",
  },
  {
    id: "spark-points",
    name: "Spark Points",
    amount: "8,910 SPK",
    value: "$0.00",
    icon: "SPK",
    status: "active",
    description: "Progression points for future perks.",
  },
  {
    id: "dispute-reserve",
    name: "Dispute Reserve",
    amount: "125 USDC",
    value: "$125.00",
    icon: "DSP",
    status: "locked",
    description: "Held while arbitration is in progress.",
  },
  {
    id: "winner-yield",
    name: "Winner Yield",
    amount: "64.2 XLM",
    value: "$8.24",
    icon: "WIN",
    status: "settled",
    description: "Paid from the last completed draw.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="border-b border-cyan-400/30 pb-6">
          <p className="text-sm uppercase text-cyan-300">Loot Vault Inventory</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase text-white sm:text-6xl">
            Asset Command Grid
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            Responsive asset cards for vault balances, escrowed job funds, NFTs, and reward positions.
          </p>
        </header>

        <AssetGrid assets={mockAssets} />
      </div>
    </main>
  );
}
