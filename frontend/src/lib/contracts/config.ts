import { Address } from "@stellar/stellar-sdk";

import { Client as MercenaryBoardClientClass, type Client as MercenaryBoardClient } from "@/src/contracts/mercenary_board/src";
import { Client as VaultClientClass, type Client as VaultClient } from "@/src/contracts/loot_vault/src";

export type ContractConfig = {
  network: "testnet" | "mainnet";
  rpcUrl?: string;
};

export type ContractClients = {
  vault: VaultClient;
  mercenaryBoard: MercenaryBoardClient;
};

type ResolvedRpcConfig = {
  rpcUrl: string;
  allowHttp: boolean;
};

const NETWORK_DEFAULTS = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    rpcUrl: "https://soroban-testnet.stellar.org",
  },
  mainnet: {
    networkPassphrase: "Public Global Stellar Network ; September 2015",
    rpcUrl: "https://mainnet.sorobanrpc.com",
  },
} as const;

const clientCache = new Map<string, ContractClients>();

function resolveRpcUrl(config: ContractConfig): ResolvedRpcConfig {
  const rawRpcUrl = config.rpcUrl ?? process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? NETWORK_DEFAULTS[config.network].rpcUrl;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawRpcUrl);
  } catch {
    throw new Error(`Invalid Soroban RPC URL: "${rawRpcUrl}"`);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(`Soroban RPC URL must start with http:// or https://. Received "${rawRpcUrl}"`);
  }

  return {
    rpcUrl: parsedUrl.toString(),
    allowHttp: parsedUrl.protocol === "http:",
  };
}

function resolveContractAddress(envKeys: string[], label: string): string {
  const contractId = envKeys.map((key) => process.env[key]).find((value) => typeof value === "string" && value.length > 0);

  if (!contractId) {
    throw new Error(`Missing ${label} contract ID. Set one of: ${envKeys.join(", ")}`);
  }

  if (!contractId.startsWith("C")) {
    throw new Error(`Invalid ${label} contract ID "${contractId}". Soroban contract IDs must start with "C".`);
  }

  try {
    Address.fromString(contractId);
  } catch {
    throw new Error(`Invalid ${label} contract ID "${contractId}". Expected a valid Stellar contract address.`);
  }

  return contractId;
}

function resolveContractAddresses(network: ContractConfig["network"]): { vaultContractId: string; mercenaryBoardContractId: string } {
  const networkSuffix = network.toUpperCase();
  const vaultContractId = resolveContractAddress(
    [`NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID_${networkSuffix}`, "NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID"],
    "Loot Vault",
  );
  const mercenaryBoardContractId = resolveContractAddress(
    [`NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID_${networkSuffix}`, "NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID"],
    "Mercenary Board",
  );

  return { vaultContractId, mercenaryBoardContractId };
}

export function initializeContractClients(config: ContractConfig): ContractClients {
  const networkSettings = NETWORK_DEFAULTS[config.network];
  if (!networkSettings) {
    throw new Error(`Unsupported network "${String(config.network)}". Expected "testnet" or "mainnet".`);
  }

  const { rpcUrl, allowHttp } = resolveRpcUrl(config);
  const { vaultContractId, mercenaryBoardContractId } = resolveContractAddresses(config.network);
  const cacheKey = `${config.network}|${rpcUrl}|${vaultContractId}|${mercenaryBoardContractId}`;
  const cachedClients = clientCache.get(cacheKey);

  if (cachedClients) {
    return cachedClients;
  }

  const options = {
    rpcUrl,
    allowHttp,
    networkPassphrase: networkSettings.networkPassphrase,
  };

  const initializedClients: ContractClients = {
    vault: new VaultClientClass({
      ...options,
      contractId: vaultContractId,
    }),
    mercenaryBoard: new MercenaryBoardClientClass({
      ...options,
      contractId: mercenaryBoardContractId,
    }),
  };

  clientCache.set(cacheKey, initializedClients);

  return initializedClients;
}
