# Contributing to Loot Vault

Thank you for your interest in contributing to Loot Vault! This guide will help you get started.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/loot-vault.git
   cd loot-vault
   ```
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Issue Selection

We organize contributions into **6 batches** with clearly labeled issues:

- **Batch 1**: Frontend UI/UX (LitRPG Design System) — [See BATCH_1_FRONTEND_ISSUES.md](./BATCH_1_FRONTEND_ISSUES.md)
- **Batch 2**: Web3 Integration (Freighter & Soroban) — [See BATCH_2_WEB3_INTEGRATION_ISSUES.md](./BATCH_2_WEB3_INTEGRATION_ISSUES.md)
- **Batch 5**: Advanced Features (Gamification, Reputation) — [See BATCH_5_ADVANCED_FEATURES.md](./BATCH_5_ADVANCED_FEATURES.md)
- **Batch 6**: Mobile & Performance (PWA, CWV) — [See BATCH_6_MOBILE_PERFORMANCE.md](./BATCH_6_MOBILE_PERFORMANCE.md)

**Choosing an issue:**
- Look for labels: `good-first-issue`, `drips-wave`, or `100-points` for beginner-friendly work
- Check `200-points` issues for more complex challenges
- Each issue has a point value; completed work earns recognition and contributor points

## Development Setup

### Prerequisites
- **Rust** 1.75+: [Install](https://www.rust-lang.org/tools/install)
- **Soroban CLI**: `cargo install soroban-cli`
- **Node.js** 18+: [Install](https://nodejs.org/)
- **Git**

### Building Locally

**Smart Contracts:**
```bash
cd contracts
cargo build --release
cargo test --release -- --test-threads=1
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend (optional):**
```bash
cd backend
cargo build --release
cargo run --release
```

## Code Standards

### Rust
- Run `cargo fmt` before committing
- Run `cargo clippy` and fix warnings
- Add tests for new contract functionality
- Use clear variable names and avoid unsafe code when possible

### TypeScript/JavaScript
- Run `npm run lint` to check ESLint rules
- Use TypeScript for type safety
- Follow the existing component patterns in `frontend/src/components/`
- Format with Prettier (auto-applied on save in most editors)

### Git Commits
- Write clear, descriptive commit messages
- Use conventional commits: `feat(area): description`, `fix(area): description`, `docs:`, `chore:`, etc.
- Example: `feat(contracts): add dispute resolution for escrow`
- Keep commits atomic and logical

## Testing

Before submitting a pull request:

**Contracts:**
```bash
cd contracts
cargo test --release -- --test-threads=1
```

**Frontend:**
```bash
cd frontend
npm run lint
npm run build  # Ensure no build errors
```

## Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - **Title**: Clear, follows conventional commits (e.g., `feat(frontend): add mana pool animation`)
   - **Description**: Explain what the change does and why (reference the issue number: `Closes #123`)
   - **Testing notes**: How you tested the change
   - **Screenshots**: For UI changes, include before/after

3. **Address feedback** promptly—reviewers may request changes

## PR Checklist

Before submitting, ensure:
- [ ] Code follows project style and conventions
- [ ] Tests pass locally (`cargo test` and/or `npm run lint`)
- [ ] Commit messages are clear and follow conventional commits
- [ ] No breaking changes (or clearly documented if intentional)
- [ ] For UI changes: tested in dark mode, keyboard navigation works
- [ ] For contracts: security best practices followed (`require_auth()`, no overflow risks)

## Documentation

- Update **README.md** if adding significant new features
- Add comments only for non-obvious logic (see [our comment philosophy](./frontend/CLAUDE.md))
- Keep inline documentation minimal—prefer clear code over comment walls

## Recognition & Points

All merged contributions are tracked:
- Each issue has a point value (typically 50–200 points)
- Points accumulate and contributors are recognized in project documentation
- This program is part of the **Drips Wave Stellar ecosystem initiative**

## Getting Help

- **Questions?** Open a GitHub Discussion or ask in an issue
- **Stuck?** Comment on the issue—maintainers and other contributors can help
- **Security issue?** Email [security@lootvault.example.com](mailto:security@lootvault.example.com) instead of opening a public issue

## Code of Conduct

We're committed to a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

---

**Ready to contribute?** Pick an issue, fork the repo, and start coding. We can't wait to see what you build! 🚀
