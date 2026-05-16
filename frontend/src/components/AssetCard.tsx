import { memo } from "react";
import type { Asset, AssetStatus } from "../types";

const statusStyles: Record<AssetStatus, string> = {
  active: "border-emerald-400/70 bg-emerald-400/10 text-emerald-200",
  pending: "border-cyan-400/70 bg-cyan-400/10 text-cyan-200",
  locked: "border-amber-300/70 bg-amber-300/10 text-amber-100",
  settled: "border-zinc-400/70 bg-zinc-400/10 text-zinc-200",
};

interface AssetCardProps {
  asset: Asset;
}

function AssetCardComponent({ asset }: AssetCardProps) {
  return (
    <article
      className="group flex h-36 flex-col justify-between border border-cyan-400/35 bg-black p-4 shadow-[0_0_0_rgba(34,211,238,0)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.28)]"
      aria-label={`${asset.name}: ${asset.amount}, ${asset.value}, ${asset.status}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center border border-fuchsia-400/60 bg-fuchsia-400/10 font-mono text-xs font-bold text-fuchsia-100">
            {asset.icon}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-white">{asset.name}</h2>
            {asset.description ? (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">{asset.description}</p>
            ) : null}
          </div>
        </div>
        <span className={`shrink-0 border px-2 py-1 text-xs font-semibold uppercase ${statusStyles[asset.status]}`}>
          {asset.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-3">
        <div>
          <p className="text-xs uppercase text-zinc-500">Amount</p>
          <p className="mt-1 truncate font-mono text-sm font-semibold text-cyan-100">{asset.amount}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-zinc-500">Value</p>
          <p className="mt-1 truncate font-mono text-sm font-semibold text-white">{asset.value}</p>
        </div>
      </div>
    </article>
  );
}

export const AssetCard = memo(AssetCardComponent);
