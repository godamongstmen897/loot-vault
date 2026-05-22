import { afterEach, describe, expect, it, vi } from "vitest";

const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
const MAINNET_PASSPHRASE = "Public Global Stellar Network ; September 2015";
const VAULT_CONTRACT_ID = "CBOCSNRLUDBBOOAVPECFHBR3TL6T576BZB6AVVBDFBDAXMBKFC573VYF";
const MERCENARY_BOARD_CONTRACT_ID = "CAF5QOC4HHHITUPDCBI3H64KZZHZKVXI5J5QGS4NLT3YE4CUGEESPSCA";
const CONTRACT_ENV_KEYS = [
  "NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID",
  "NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID_TESTNET",
  "NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID_MAINNET",
  "NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID",
  "NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID_TESTNET",
  "NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID_MAINNET",
  "NEXT_PUBLIC_SOROBAN_RPC_URL",
];

async function loadContractsModule() {
  vi.resetModules();
  return import("./config");
}

function resetContractEnv() {
  for (const key of CONTRACT_ENV_KEYS) {
    delete process.env[key];
  }
}

function setDefaultContractEnv() {
  process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID = VAULT_CONTRACT_ID;
  process.env.NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID = MERCENARY_BOARD_CONTRACT_ID;
}

describe("initializeContractClients", () => {
  afterEach(() => {
    resetContractEnv();
    vi.resetModules();
  });

  it("initializes both contract clients with default testnet network settings", async () => {
    resetContractEnv();
    setDefaultContractEnv();
    const { initializeContractClients } = await loadContractsModule();

    const clients = initializeContractClients({ network: "testnet" });

    expect(clients.vault.options).toMatchObject({
      contractId: VAULT_CONTRACT_ID,
      networkPassphrase: TESTNET_PASSPHRASE,
      rpcUrl: "https://soroban-testnet.stellar.org/",
      allowHttp: false,
    });
    expect(clients.mercenaryBoard.options).toMatchObject({
      contractId: MERCENARY_BOARD_CONTRACT_ID,
      networkPassphrase: TESTNET_PASSPHRASE,
      rpcUrl: "https://soroban-testnet.stellar.org/",
      allowHttp: false,
    });
  });

  it("initializes with a custom RPC URL and enables local HTTP RPC clients", async () => {
    resetContractEnv();
    setDefaultContractEnv();
    const { initializeContractClients } = await loadContractsModule();

    const clients = initializeContractClients({
      network: "testnet",
      rpcUrl: "http://localhost:8000/soroban",
    });

    expect(clients.vault.options.rpcUrl).toBe("http://localhost:8000/soroban");
    expect(clients.mercenaryBoard.options.rpcUrl).toBe("http://localhost:8000/soroban");
    expect(clients.vault.options.allowHttp).toBe(true);
    expect(clients.mercenaryBoard.options.allowHttp).toBe(true);
  });

  it("uses network-specific contract IDs and mainnet defaults when present", async () => {
    resetContractEnv();
    process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID_MAINNET = VAULT_CONTRACT_ID;
    process.env.NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID_MAINNET = MERCENARY_BOARD_CONTRACT_ID;
    const { initializeContractClients } = await loadContractsModule();

    const clients = initializeContractClients({ network: "mainnet" });

    expect(clients.vault.options).toMatchObject({
      contractId: VAULT_CONTRACT_ID,
      networkPassphrase: MAINNET_PASSPHRASE,
      rpcUrl: "https://mainnet.sorobanrpc.com/",
      allowHttp: false,
    });
    expect(clients.mercenaryBoard.options.networkPassphrase).toBe(MAINNET_PASSPHRASE);
  });

  it("memoizes and reuses clients for identical resolved config", async () => {
    resetContractEnv();
    setDefaultContractEnv();
    const { initializeContractClients } = await loadContractsModule();

    const firstClients = initializeContractClients({ network: "testnet" });
    const secondClients = initializeContractClients({ network: "testnet" });
    const customRpcClients = initializeContractClients({
      network: "testnet",
      rpcUrl: "https://rpc.example.test",
    });

    expect(secondClients).toBe(firstClients);
    expect(secondClients.vault).toBe(firstClients.vault);
    expect(secondClients.mercenaryBoard).toBe(firstClients.mercenaryBoard);
    expect(customRpcClients).not.toBe(firstClients);
  });

  it("throws clear errors for invalid RPC URLs", async () => {
    resetContractEnv();
    setDefaultContractEnv();
    const { initializeContractClients } = await loadContractsModule();

    expect(() =>
      initializeContractClients({
        network: "testnet",
        rpcUrl: "not a url",
      }),
    ).toThrow('Invalid Soroban RPC URL: "not a url"');
    expect(() =>
      initializeContractClients({
        network: "testnet",
        rpcUrl: "ftp://rpc.example.test",
      }),
    ).toThrow('Soroban RPC URL must start with http:// or https://. Received "ftp://rpc.example.test"');
  });

  it("throws clear errors for unsupported networks and missing or invalid contract IDs", async () => {
    resetContractEnv();
    let contractsModule = await loadContractsModule();

    expect(() =>
      contractsModule.initializeContractClients({
        network: "devnet" as "testnet",
      }),
    ).toThrow('Unsupported network "devnet". Expected "testnet" or "mainnet".');

    contractsModule = await loadContractsModule();
    expect(() => contractsModule.initializeContractClients({ network: "testnet" })).toThrow(
      "Missing Loot Vault contract ID. Set one of: NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID_TESTNET, NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID",
    );

    resetContractEnv();
    process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID = "not-a-contract-id";
    process.env.NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID = MERCENARY_BOARD_CONTRACT_ID;
    contractsModule = await loadContractsModule();
    expect(() => contractsModule.initializeContractClients({ network: "testnet" })).toThrow(
      'Invalid Loot Vault contract ID "not-a-contract-id". Soroban contract IDs must start with "C".',
    );

    resetContractEnv();
    process.env.NEXT_PUBLIC_LOOT_VAULT_CONTRACT_ID = "CNOTVALID";
    process.env.NEXT_PUBLIC_MERCENARY_BOARD_CONTRACT_ID = MERCENARY_BOARD_CONTRACT_ID;
    contractsModule = await loadContractsModule();
    expect(() => contractsModule.initializeContractClients({ network: "testnet" })).toThrow(
      'Invalid Loot Vault contract ID "CNOTVALID". Expected a valid Stellar contract address.',
    );
  });
});
