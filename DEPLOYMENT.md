# Deployment Guide

## Overview

Loot Vault is deployed with:
- **Frontend**: Next.js app on Vercel (auto-deploys from main branch)
- **Smart Contracts**: Soroban contracts on Stellar Testnet (manual deployment via Soroban CLI)
- **Backend Indexer**: Coming soon (currently a skeleton)

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account connected to Vercel
- Repository pushed to GitHub

### Automatic Deployment

1. **Connect Vercel to your GitHub repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Select your `loot-vault` repository
   - Vercel auto-detects Next.js

2. **Configure Environment Variables** in Vercel Dashboard:
   ```
   NEXT_PUBLIC_STELLAR_NETWORK = testnet
   NEXT_PUBLIC_SOROBAN_RPC_URL = https://soroban-testnet.stellar.org
   NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID = CAF5QOC4HHHITUPDCBI3H64KZZHZKVXI5J5QGS4NLT3YE4CUGEESPSCA
   NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID = CBOCSNRLUDBBOOAVPECFHBR3TL6T576BZB6AVVBDFBDAXMBKFC573VYF
   ```

3. **Deploy**:
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Your live URL: `https://loot-vault.vercel.app` (or custom domain)

### Subsequent Deployments

Every push to `main` branch auto-triggers a new deployment. To manually redeploy:
1. Push changes to main: `git push origin main`
2. Vercel automatically builds and deploys
3. View deployment status in Vercel dashboard

### Local Testing Before Deployment

```bash
cd frontend
npm install
npm run build
npm run start
```

Open http://localhost:3000 and verify contract integration works.

---

## Smart Contract Deployment (Stellar Testnet)

### Current Status

Both contracts are **already deployed to Stellar Testnet**:

| Contract | Address |
|----------|---------|
| **Mercenary Board** | `CAF5QOC4HHHITUPDCBI3H64KZZHZKVXI5J5QGS4NLT3YE4CUGEESPSCA` |
| **Loot Vault** | `CBOCSNRLUDBBOOAVPECFHBR3TL6T576BZB6AVVBDFBDAXMBKFC573VYF` |

### Deploying Contract Updates

If you update the smart contracts and need to redeploy:

```bash
cd contracts

# Build the contract
cargo build --release --target wasm32-unknown-unknown

# Deploy to Testnet (requires funded Stellar account)
soroban contract deploy \
  --network testnet \
  --source $YOUR_ACCOUNT_SECRET \
  --wasm target/wasm32-unknown-unknown/release/mercenary_board.wasm

# Regenerate TypeScript bindings with new contract ID
soroban contract bindings ts \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015" \
  --id <NEW_CONTRACT_ID> \
  --name mercenary_board \
  --output-dir ../frontend/src/contracts/mercenary_board
```

### Getting a Testnet Account

1. Visit [Stellar Testnet Faucet](https://laboratory.stellar.org/#account-creator)
2. Generate a new testnet account (receives 10,000 test XLM)
3. Save your secret key securely (use environment variables, never commit)

---

## Environment Variables

### Frontend Environment Variables

All frontend environment variables use the `NEXT_PUBLIC_` prefix (visible to browser):

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_STELLAR_NETWORK` | Network to connect to | `testnet` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID` | Mercenary Board contract address | (see .env.example) |
| `NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID` | Loot Vault contract address | (see .env.example) |

### Development (.env.local)

```bash
cp frontend/.env.example frontend/.env.local
# Edit with your values if needed
npm run dev
```

### Production (Vercel)

Set these in Vercel Project Settings → Environment Variables.

---

## Troubleshooting

### Build Fails on Vercel

1. Check Vercel build logs for errors
2. Ensure `vercel.json` is in repository root
3. Verify all environment variables are set
4. Try local build: `cd frontend && npm run build`

### Contract Calls Fail in Deployed App

1. Check browser console for network errors
2. Verify contract addresses in environment variables
3. Confirm Stellar Testnet RPC is accessible
4. Test with cURL: `curl https://soroban-testnet.stellar.org/` (should return 404)

### Live URL Not Working

1. Wait 2-3 minutes after deployment completes
2. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
3. Check Vercel dashboard for deployment status
4. Redeploy if stuck: Vercel Dashboard → Deployments → Redeploy

---

## Next Steps

- [ ] Deploy frontend to Vercel
- [ ] Test live app with Freighter Wallet
- [ ] Document live URL in README
- [ ] Implement backend event indexer
- [ ] Deploy contracts to Stellar Mainnet
- [ ] Set up monitoring/alerting

---

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Soroban Deployment Guide](https://developers.stellar.org/docs/smart-contracts/deploy)
- [Stellar Testnet Faucet](https://laboratory.stellar.org/#account-creator)
