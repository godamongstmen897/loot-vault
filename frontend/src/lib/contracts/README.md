# Contract transaction utilities

## `signAndSubmitTransaction`

`signAndSubmitTransaction(transactionBuilder, waitsFor?)` builds a Stellar transaction, checks the browser Freighter wallet, asks Freighter to sign, submits the signed transaction through Horizon, then polls Horizon until the transaction is confirmed or the 30 second timeout is reached.

The helper returns:

```ts
{
  txHash: string;
  status: "confirmed";
}
```

Environment defaults:

```env
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

The runtime can also override these values with `configureTransactionSigner()`, which is useful for Storybook or local testnet previews.

Major wallet and network failures are normalized into user-facing messages: Freighter missing, wallet locked, access rejected, signing rejected, insufficient balance, stale sequence number, missing destination account, and confirmation timeout.
