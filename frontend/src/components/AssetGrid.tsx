import type { Asset } from "../types";
import { AssetCard } from "./AssetCard";

interface AssetGridProps {
  assets: Asset[];
  emptyMessage?: string;
}

export function AssetGrid({ assets, emptyMessage = "No assets found." }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="grid min-h-36 place-items-center border border-dashed border-zinc-700 bg-zinc-950 p-6 text-center text-sm text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section
      className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Asset inventory grid"
    >
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </section>
  );
}
