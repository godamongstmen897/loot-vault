export const NETWORKS = {
  testnet: {
    name: 'testnet',
    passphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
  },
} as const;

export const CONTRACTS = {
  mercenaryBoard: process.env.NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID || 'CAF5QOC4HHHITUPDCBI3H64KZZHZKVXI5J5QGS4NLT3YE4CUGEESPSCA',
  lootVault: process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID || 'CBOCSNRLUDBBOOAVPECFHBR3TL6T576BZB6AVVBDFBDAXMBKFC573VYF',
} as const;

export const STELLAR_NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet') as keyof typeof NETWORKS;
export const SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || NETWORKS.testnet.rpcUrl;

export function getNetworkConfig() {
  return NETWORKS[STELLAR_NETWORK];
}

export function getContractConfig() {
  return {
    network: getNetworkConfig(),
    contracts: CONTRACTS,
  };
}
