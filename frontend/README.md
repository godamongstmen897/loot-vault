This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Contract State Cache

`src/lib/contracts/stateCache.ts` provides the frontend query layer for contract state.

- `queryVaultState()` caches vault state for 30 seconds.
- `queryJobsByUser(address)` caches user job lists for 60 seconds.
- `invalidateCache(key?)` clears one cache entry or the whole query cache.
- `useContractState(query, params?)` wraps the query layer for React components.

The cache key includes the configured vault contract address plus query params, so manual invalidation can target a single contract/query pair when UI actions mutate state. Expired entries are served stale while a background refresh updates the cache, keeping UI renders fast while still pulling fresh data.

The module accepts real contract readers through `configureContractStateQueries()`:

```ts
import { configureContractStateQueries } from "./src/lib/contracts/stateCache"

configureContractStateQueries({
  queryVaultState: async () => ({
    contractAddress: process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID ?? "",
    lootPool: "0",
    updatedAt: new Date().toISOString(),
    source: "contract",
  }),
  queryJobsByUser: async (address) => {
    console.log("loading jobs for", address)
    return []
  },
})
```

Required public environment values:

```bash
NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID=
NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID=
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
