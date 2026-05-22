"use client";

import { useMemo } from "react";
import {
  Client as MercenaryBoardClient,
  networks,
  type Escrow,
  type Milestone,
} from "../contracts/mercenary_board/src";
import type { AssembledTransaction, MethodOptions } from "@stellar/stellar-sdk/contract";

export type Job = Escrow;
export type Transaction<T = unknown> = AssembledTransaction<T>;

export interface MercenaryBoardHookOptions {
  /** Address of the connected client posting jobs. */
  clientAddress?: string;
  /** Address of the connected freelancer submitting work. */
  freelancerAddress?: string;
  /** SAC token contract address used for job escrow payments. */
  tokenAddress?: string;
  /** Ledger delta after which the client can request a disputed refund. */
  refundTimelock?: number;
  /** Optional Soroban method options, e.g. a source account/public key. */
  methodOptions?: MethodOptions;
}

export interface MercenaryBoardApi {
  client: MercenaryBoardClient;
  postJob(
    title: string,
    description: string,
    bounty: bigint,
    milestones: Milestone[],
    options?: MercenaryBoardHookOptions,
  ): Promise<Transaction<null>>;
  submitWork(
    jobId: string,
    evidence: string,
    options?: MercenaryBoardHookOptions,
  ): Promise<Transaction<null>>;
  releaseFunds(
    jobId: string,
    milestoneIndex: number,
    options?: MercenaryBoardHookOptions,
  ): Promise<Transaction<null>>;
  disputeJob(
    jobId: string,
    reason: string,
    options?: MercenaryBoardHookOptions,
  ): Promise<Transaction<null>>;
  getJobDetails(jobId: string, options?: MethodOptions): Promise<Job>;
  getFreelancerJobs(freelancerAddress: string): Promise<Job[]>;
}

const DEFAULT_RPC_URL = "https://soroban-testnet.stellar.org";
const DEFAULT_REFUND_TIMELOCK = 17_280; // roughly one day on 5-second ledgers

function readPublicEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function assertPresent(value: string | undefined, message: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(message);
  }
  return value.trim();
}

function assertPositiveBigInt(value: bigint, field: string): void {
  if (value <= BigInt(0)) {
    throw new Error(`${field} must be greater than zero`);
  }
}

function assertNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field} is required`);
  }
  return trimmed;
}

function normalizeMilestones(description: string, bounty: bigint, milestones: Milestone[]): Milestone[] {
  if (milestones.length > 0) {
    return milestones.map((milestone) => {
      assertPositiveBigInt(BigInt(milestone.amount), "milestone amount");
      assertNonEmpty(milestone.description, "milestone description");
      return milestone;
    });
  }

  return [
    {
      amount: bounty,
      description: assertNonEmpty(description, "description"),
      status: { tag: "Pending", values: undefined },
    },
  ];
}

function resolveOption(
  override: string | undefined,
  envName: string,
  message: string,
): string {
  return assertPresent(override ?? readPublicEnv(envName), message);
}

/**
 * React hook for Mercenary Board Soroban contract operations.
 *
 * The hook mirrors the generated contract binding while adding app-level
 * validation and stable method names for UI code. Write methods return the
 * assembled transaction so callers can review/sign/send it with their wallet
 * flow; read methods return contract results directly.
 */
export function useMercenaryBoard(
  networkPassphrase = networks.testnet.networkPassphrase,
  rpcUrl = DEFAULT_RPC_URL,
): MercenaryBoardApi {
  return useMemo(() => {
    const client = new MercenaryBoardClient({
      contractId: networks.testnet.contractId,
      networkPassphrase,
      rpcUrl,
    });

    return {
      client,

      async postJob(title, description, bounty, milestones, options = {}) {
        const jobId = assertNonEmpty(title, "title");
        assertPositiveBigInt(bounty, "bounty");

        return client.create_job(
          {
            job_id: jobId,
            client: resolveOption(
              options.clientAddress,
              "NEXT_PUBLIC_MERCENARY_CLIENT_ADDRESS",
              "clientAddress is required to post a Mercenary Board job",
            ),
            freelancer: resolveOption(
              options.freelancerAddress,
              "NEXT_PUBLIC_MERCENARY_FREELANCER_ADDRESS",
              "freelancerAddress is required to post a Mercenary Board job",
            ),
            token: resolveOption(
              options.tokenAddress,
              "NEXT_PUBLIC_MERCENARY_TOKEN_ADDRESS",
              "tokenAddress is required to post a Mercenary Board job",
            ),
            milestones: normalizeMilestones(description, bounty, milestones),
            refund_timelock: options.refundTimelock ?? DEFAULT_REFUND_TIMELOCK,
          },
          options.methodOptions,
        );
      },

      async submitWork(jobId, evidence, options = {}) {
        assertNonEmpty(evidence, "evidence");
        return client.submit_work(
          {
            job_id: assertNonEmpty(jobId, "jobId"),
            milestone_index: 0,
            freelancer: resolveOption(
              options.freelancerAddress,
              "NEXT_PUBLIC_MERCENARY_FREELANCER_ADDRESS",
              "freelancerAddress is required to submit Mercenary Board work",
            ),
          },
          options.methodOptions,
        );
      },

      async releaseFunds(jobId, milestoneIndex, options = {}) {
        if (!Number.isInteger(milestoneIndex) || milestoneIndex < 0) {
          throw new Error("milestoneIndex must be a non-negative integer");
        }

        return client.approve_milestone(
          {
            job_id: assertNonEmpty(jobId, "jobId"),
            milestone_index: milestoneIndex,
            client: resolveOption(
              options.clientAddress,
              "NEXT_PUBLIC_MERCENARY_CLIENT_ADDRESS",
              "clientAddress is required to release Mercenary Board funds",
            ),
          },
          options.methodOptions,
        );
      },

      async disputeJob(jobId, reason, options = {}) {
        assertNonEmpty(reason, "reason");
        return client.dispute_refund(
          {
            job_id: assertNonEmpty(jobId, "jobId"),
            client: resolveOption(
              options.clientAddress,
              "NEXT_PUBLIC_MERCENARY_CLIENT_ADDRESS",
              "clientAddress is required to dispute a Mercenary Board job",
            ),
          },
          options.methodOptions,
        );
      },

      async getJobDetails(jobId, options) {
        const transaction = await client.get_escrow(
          { job_id: assertNonEmpty(jobId, "jobId") },
          options,
        );
        return transaction.result;
      },

      async getFreelancerJobs(freelancerAddress) {
        assertNonEmpty(freelancerAddress, "freelancerAddress");
        // The current generated contract exposes point lookup by job id only.
        // Keep the hook method stable for UI callers; return an empty list
        // until the contract adds a freelancer index/query endpoint.
        return [];
      },
    };
  }, [networkPassphrase, rpcUrl]);
}
