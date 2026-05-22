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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Contract Client Configuration

`frontend/src/lib/contracts/config.ts` exposes:

- `initializeContractClients(config: ContractConfig)`
- `ContractConfig = { network: "testnet" | "mainnet"; rpcUrl?: string }`

Set contract IDs via environment variables:

```bash
# Required (testnet/mainnet-specific or shared fallback)
NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID_TESTNET=...
NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID_TESTNET=...

# Optional network-specific overrides
NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID_MAINNET=...
NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID_MAINNET=...

# Shared fallback if network-specific key is not set
NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID=...
NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID=...

# Optional global RPC override
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

Behavior:

- RPC URL is validated (`http://` or `https://` required)
- Contract IDs are validated as Soroban contract addresses
- Clients are memoized by network + RPC + contract IDs to avoid re-initialization

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
