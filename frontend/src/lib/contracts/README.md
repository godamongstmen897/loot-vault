# Contract Event Listener

`subscribeToContractEvents` polls Stellar Soroban RPC for contract events, filters by event type, debounces callback delivery, retries with exponential backoff after disconnects, and returns an unsubscribe cleanup function.

```ts
import { subscribeToContractEvents } from "@/src/lib/contracts";

const unsubscribe = subscribeToContractEvents(
  ["YieldClaimed", "JobCompleted"],
  (event) => {
    console.log(event.eventType, event.contract, event.data);
  },
);

unsubscribe();
```

The default RPC URL is `https://soroban-testnet.stellar.org`. Override it with `NEXT_PUBLIC_STELLAR_RPC_URL`.

Contract filters are read from:

- `NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID`
- `NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID`

For tests or custom runtime wiring, call `configureContractEventListener(...)` before subscribing:

```ts
import { configureContractEventListener } from "@/src/lib/contracts";

configureContractEventListener({
  rpcUrl: "https://soroban-testnet.stellar.org",
  contractIds: ["CB..."],
  pollIntervalMs: 3000,
  debounceMs: 150,
});
```

`events.stories.tsx` contains a Storybook-compatible example component without adding a Storybook dependency to the frontend package.
