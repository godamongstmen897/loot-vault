/**
 * Mercenary Board Contract Types
 *
 * Centralized type exports for the Mercenary Board Soroban smart contract.
 * Re-exports all relevant types from the generated contract bindings
 * and adds structured interfaces for job/escrow operations.
 *
 * @module mercenaryBoardTypes
 */

import type {
  Escrow as EscrowType,
  Milestone as MilestoneType,
  MilestoneStatus as MilestoneStatusType,
} from "../../contracts/mercenary_board/src/index";

// Re-export types directly from the generated contract bindings
export type Escrow = EscrowType;
export type Milestone = MilestoneType;
export type MilestoneStatus = MilestoneStatusType;

// Re-export network config
export { networks as MercenaryBoardNetworks } from "../../contracts/mercenary_board/src/index";

// Stellar SDK primitive types used by the contract
export type {
  u32,
  i128,
} from "@stellar/stellar-sdk/contract";

/**
 * Network configuration for the Mercenary Board contract deployment.
 */
export interface MercenaryBoardNetworkConfig {
  networkPassphrase: string;
  contractId: string;
}

/**
 * Parameters for creating a new job (escrow) on the Mercenary Board.
 * Transfers the total bounty from the client to the contract immediately.
 */
export interface CreateJobParams {
  /** Unique identifier for the job, chosen by the caller */
  job_id: string;
  /** Address of the client posting the job */
  client: string;
  /** Address of the freelancer assigned to the job */
  freelancer: string;
  /** Address of the token contract for payment */
  token: string;
  /** Ordered list of milestones for the job */
  milestones: Array<MilestoneType>;
  /** Ledgers after which the client can reclaim funds if no progress */
  refund_timelock: number;
}

/**
 * Parameters for retrieving an escrow by job ID.
 */
export interface GetEscrowParams {
  /** The unique job identifier */
  job_id: string;
}

/**
 * Parameters for a freelancer submitting work on a milestone.
 */
export interface SubmitWorkParams {
  /** The unique job identifier */
  job_id: string;
  /** Index of the milestone being submitted */
  milestone_index: number;
  /** Address of the freelancer submitting the work */
  freelancer: string;
}

/**
 * Parameters for a client disputing and requesting a refund.
 * Can only be called after the refund timelock has expired.
 */
export interface DisputeRefundParams {
  /** The unique job identifier */
  job_id: string;
  /** Address of the client requesting the refund */
  client: string;
}

/**
 * Parameters for a client approving a milestone.
 * Releases the milestone funds to the freelancer.
 */
export interface ApproveMilestoneParams {
  /** The unique job identifier */
  job_id: string;
  /** Index of the milestone being approved */
  milestone_index: number;
  /** Address of the client approving the milestone */
  client: string;
}
