/**
 * Loot Vault Contract Types
 *
 * Centralized type exports for the Loot Vault Soroban smart contract.
 * Re-exports all relevant types and adds structured interfaces for
 * contract operations.
 *
 * @module lootVaultTypes
 */

// Stellar SDK primitive types used by the contract
export type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";

/**
 * Network configuration for the Loot Vault contract deployment.
 * Currently only testnet is supported.
 */
export interface LootVaultNetworkConfig {
  networkPassphrase: string;
  contractId: string;
}

/**
 * Supported networks for Loot Vault contract
 */
export interface LootVaultNetworks {
  testnet: LootVaultNetworkConfig;
}

/**
 * Parameters for initializing the Loot Vault contract.
 * Sets the admin address (Quest Master) who can manage the pool.
 */
export interface InitParams {
  /** Admin address — the Quest Master who controls the vault */
  admin: string;
}

/**
 * Parameters for depositing tokens into the Loot Vault pool.
 */
export interface DepositParams {
  /** Address of the user making the deposit */
  user: string;
  /** Address of the token contract being deposited */
  token: string;
  /** Amount to deposit in stroop units */
  amount: bigint;
}

/**
 * Parameters for the mock yield generation (testnet only).
 * Admin injects loot into the pool to simulate yield.
 */
export interface MockYieldParams {
  /** Amount of yield to inject in stroop units */
  amount: bigint;
}

/**
 * Return type for the get_loot_pool query.
 * Represents the total amount of tokens currently in the loot pool.
 */
export type LootPoolBalance = bigint;

/**
 * Return type for draw_winner.
 * The address of the randomly selected winner.
 */
export type WinnerAddress = string;
