# 🎮 Loot Vault

> **A Gamified DeFi Ecosystem & Decentralized Job Board built on Stellar Soroban**  
> *Featuring a LitRPG / System Interface Aesthetic*

Loot Vault is a next-generation Web3 platform combining **no-loss yield protocols** and **trustless escrow** for freelancers, all wrapped in an immersive, dark-mode "System/RPG" interface. Built with **Soroban smart contracts** (Rust), **Next.js**, and **Stellar blockchain**.

## 🚀 Vision

Loot Vault reimagines DeFi participation through an RPG lens. Participants are adventurers. Yield pools are treasure vaults. Freelancers are mercenaries taking bounties. The system watches over it all with real-time event streaming, cryptographic security, and trustless automation.

### Two Core Protocols

#### 🎰 **Loot Vault Protocol** (No-Loss Yield)
Users deposit test XLM into a shared vault. The protocol generates yield. A winner is randomly drawn to receive the accumulated yield, while all participants retain their principal. It's a fair, transparent lottery—no house always wins.

- ✅ Deployed to Stellar Testnet
- ✅ E2E tests passing with mocked StellarAssetContracts
- ✅ TypeScript bindings ready for frontend integration

#### ⚔️ **Mercenary Board Protocol** (Milestone-Based Escrow)
A trustless job board for freelancers. Clients post jobs and lock bounties. Freelancers submit work. Clients release funds milestone-by-milestone. A timelock dispute mechanism ensures neither party can lose funds unfairly.

- ✅ Deployed to Stellar Testnet
- ✅ Strict `require_auth()` security implemented
- ✅ E2E tests passing
- ✅ TypeScript bindings generated

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Rust, Soroban SDK v20.0.0+ |
| **Blockchain** | Stellar Network, Soroban Platform |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend / Indexer** | Rust, Axum, Tokio (Event bridge for ledger watching) |
| **Wallet Integration** | Freighter Wallet API |
| **UI Animations** | Framer Motion (planned) |

---

## 📂 Project Structure

```
loot-vault/
├── contracts/                    # Soroban smart contracts (Rust)
│   ├── Cargo.toml               # Workspace manifest
│   ├── src/
│   │   ├── lib.rs              # Mercenary Board contract
│   │   └── test.rs             # E2E tests
│   └── contracts/
│       └── hello-world/         # Example contract
├── frontend/                     # Next.js web application
│   ├── src/
│   │   ├── app/                # Next.js app directory
│   │   ├── components/         # React components (UI library in progress)
│   │   └── contracts/          # Generated TypeScript bindings
│   │       ├── loot_vault/
│   │       └── mercenary_board/
│   ├── tailwind.config.ts       # Tailwind dark mode setup
│   └── package.json
├── backend/                      # Axum Rust backend (event indexer)
│   ├── src/
│   └── Cargo.toml
└── .github/                      # GitHub Actions CI/CD
```

---

## ⚡ Quick Start

### Prerequisites

- **Rust** 1.75+: [Install](https://www.rust-lang.org/tools/install)
- **Stellar CLI** (soroban-cli): `cargo install soroban-cli`
- **Node.js** 18+: [Install](https://nodejs.org/)
- **Freighter Wallet** browser extension: [Get it here](https://www.freighter.app/)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/loot-vault.git
cd loot-vault
```

### 2. Build Smart Contracts

```bash
cd contracts
cargo build --release
```

Run the full E2E test suite:

```bash
cargo test --release -- --test-threads=1
```

Deploy to Stellar Testnet:

```bash
soroban contract deploy \
  --network testnet \
  --source $YOUR_ACCOUNT \
  --wasm target/wasm32-unknown-unknown/release/mercenary_board.wasm
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 to see the LitRPG interface.

### 4. Backend Indexer (Optional)

```bash
cd backend
cargo build --release
cargo run --release
```

The backend listens for Soroban contract events and feeds real-time data to the frontend.

---

## 🌐 Live Demo

**Try Loot Vault now:** [https://loot-vault.vercel.app](https://loot-vault.vercel.app)

The frontend is live on Vercel and connected to Stellar Testnet. You'll need the **[Freighter Wallet](https://www.freighter.app/)** browser extension to interact with the contracts.

### Smart Contracts (Testnet)

Both core protocols are deployed and ready for interaction:

| Contract | Address | Status |
|----------|---------|--------|
| **Mercenary Board** | `CAF5QOC4HHHITUPDCBI3H64KZZHZKVXI5J5QGS4NLT3YE4CUGEESPSCA` | ✅ Live |
| **Loot Vault** | `CBOCSNRLUDBBOOAVPECFHBR3TL6T576BZB6AVVBDFBDAXMBKFC573VYF` | ✅ Live |

For detailed deployment information, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 🎨 UI/UX: LitRPG System Aesthetic

The Loot Vault frontend embraces a **dark, futuristic "System Interface"** inspired by sci-fi RPGs:

- **Dark mode by default** (true black backgrounds, neon accents)
- **Retro-futuristic typography** (monospace, glitch effects)
- **Animated status panels** (health bars, mana pools, quest logs)
- **Glowing borders & holographic card effects**
- **Framer Motion micro-interactions** (smooth state transitions)
- **Accessibility-first**: ARIA labels, keyboard navigation, high contrast

Future contributor batches will focus on building a reusable component library that makes these LitRPG patterns easy to extend.

---

## 🤝 Contributing

We are **thrilled to welcome open-source contributors**! This project is participating in the **Drips Wave Stellar ecosystem program**.

### 🎯 Contributor Roadmap: 60 Issues Across 6 Batches

We've prepared a comprehensive backlog of 60 high-quality issues (1,200 points total) organized in sprints:

| Batch | Focus | Issues | Status |
|-------|-------|--------|--------|
| **1** | Frontend UI/UX (LitRPG Design System) | 10 | ✅ Live |
| **2** | Web3 Integration (Freighter & Soroban) | 10 | 🔜 Ready |
| **3** | Smart Contracts (Optimizations & Security) | 10 | 🔜 Ready |
| **4** | Backend Event Indexer (Rust/Axum) | 10 | 🔜 Ready |
| **5** | Advanced Features (Gamification, Reputation) | 6 | ✅ Live |
| **6** | Mobile & Performance (PWA, CWV) | 6 | ✅ Live |

### For Contributors

- **New to Soroban?** Start with the [Soroban docs](https://developers.stellar.org/docs/smart-contracts).
- **Good first issues:** Look for `drips-wave`, `good-first-issue`, and `100-points` labels for Batch 1.
- **Advanced work:** Check `200-points` issues for high-complexity features.
- **Fork → Branch → PR model**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.
- **Points & Recognition:** Completed issues earn contributor points and lifetime recognition.

### 📋 Issue Documentation

- **[Batch 1: Frontend UI/UX](./BATCH_1_FRONTEND_ISSUES.md)** — LitRPG components, animations, accessibility
- **[Batch 5: Advanced Features](./BATCH_5_ADVANCED_FEATURES.md)** — Tiered pools, reputation, leaderboards
- **[Batch 6: Mobile & Performance](./BATCH_6_MOBILE_PERFORMANCE.md)** — PWA, optimization, Core Web Vitals

---

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)**: Frontend (Vercel), smart contracts, environment setup
- **[Smart Contracts](./contracts/README.md)**: Soroban contract architecture, deployment, testing
- **[Frontend](./frontend/README.md)**: Next.js setup, component library, TypeScript bindings
- **[Backend](./backend/README.md)**: Event indexer, API routes, Axum patterns

---

## 🔐 Security

- All smart contracts implement **strict `require_auth()` checks** for permission control
- Milestone-based escrow includes **timelock dispute resolution**
- No-loss yield protocol uses **Stellar's native randomization** for fairness
- Frontend integrates **Freighter Wallet** for secure key custody (keys never leave the browser)

For security concerns, please email [security@lootvault.example.com](mailto:security@lootvault.example.com).

---

## 📜 License

MIT License. See [LICENSE](./LICENSE) for details.

---

## 🌟 Acknowledgments

- Built on [Stellar Soroban](https://developers.stellar.org/) smart contracts
- UI inspired by sci-fi RPG aesthetics (FFVII, Cyberpunk, deus ex)
- Powered by an amazing community of Web3 developers

---

## 📞 Get Involved

- **Discord**: [Join our server](https://discord.gg/example) (coming soon)
- **Twitter**: [@LootVaultXYZ](https://twitter.com/example) (coming soon)
- **GitHub Issues**: Ask questions, report bugs, propose features
- **GitHub Discussions**: Share ideas and get feedback

---

**Ready to earn points and help shape the future of DeFi?** Pick an issue, fork the repo, and start coding! 🚀
