/**
 * Contract Types Index
 *
 * Aggregates and re-exports all contract-related types from both
 * the Loot Vault and Mercenary Board Soroban smart contracts.
 *
 * Usage:
 *   import { Escrow, DepositParams } from "@/lib/types";
 *   // or
 *   import { Escrow } from "@/lib/types/mercenaryBoardTypes";
 *   import { DepositParams } from "@/lib/types/lootVaultTypes";
 */

// Loot Vault types
export type {
  LootVaultNetworkConfig,
  LootVaultNetworks,
  InitParams,
  DepositParams,
  MockYieldParams,
  LootPoolBalance,
  WinnerAddress,
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
} from "./lootVaultTypes";

// Mercenary Board types
export type {
  Escrow,
  Milestone,
  MilestoneStatus,
  MercenaryBoardNetworkConfig,
  CreateJobParams,
  GetEscrowParams,
  SubmitWorkParams,
  DisputeRefundParams,
  ApproveMilestoneParams,
} from "./mercenaryBoardTypes";

// Re-export network configs as values (not just types)
export { MercenaryBoardNetworks } from "./mercenaryBoardTypes";
