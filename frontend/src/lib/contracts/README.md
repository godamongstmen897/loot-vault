# Contract Binding Tests

The integration harness lives in
`src/lib/contracts/__tests__/bindings.integration.test.ts`.

Run the default mocked/type-level suite:

```bash
npm run test
npm run test:coverage
```

The default suite avoids wallet prompts and live network writes, so CI can run it
without Freighter. To add a live Soroban RPC smoke check against Stellar
Testnet, opt in explicitly:

```bash
LOOT_VAULT_RUN_LIVE_BINDING_TESTS=1 npm run test
```

`NEXT_PUBLIC_STELLAR_RPC_URL` can override the default Testnet RPC endpoint.
