// @ts-nocheck
/* eslint-disable */
import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAF5QOC4HHHITUPDCBI3H64KZZHZKVXI5J5QGS4NLT3YE4CUGEESPSCA",
  }
} as const


/**
 * Escrow/job object
 */
export interface Escrow {
  client: string;
  creation_ledger: u32;
  freelancer: string;
  milestones: Array<Milestone>;
  refund_timelock: u32;
  released_amount: i128;
  token: string;
  total_amount: i128;
}


/**
 * A single milestone inside a job
 */
export interface Milestone {
  amount: i128;
  description: string;
  status: MilestoneStatus;
}

/**
 * Milestone status enum
 */
export type MilestoneStatus = { tag: "Pending", values: void } | { tag: "Submitted", values: void } | { tag: "Approved", values: void };

export interface Client {
  /**
   * Construct and simulate a create_job transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new job (escrow). `job_id` is a unique key chosen by caller (use a String).
   * Transfers the total bounty from `client` to the contract immediately.
   */
  create_job: ({ job_id, client, freelancer, token, milestones, refund_timelock }: { job_id: string, client: string, freelancer: string, token: string, milestones: Array<Milestone>, refund_timelock: u32 }, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Read helper: get escrow by job id
   */
  get_escrow: ({ job_id }: { job_id: string }, options?: MethodOptions) => Promise<AssembledTransaction<Escrow>>

  /**
   * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Freelancer submits work for a specific milestone index
   */
  submit_work: ({ job_id, milestone_index, freelancer }: { job_id: string, milestone_index: u32, freelancer: string }, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a dispute_refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Allows the client to reclaim unreleased funds after a timelock has passed
   */
  dispute_refund: ({ job_id, client }: { job_id: string, client: string }, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a approve_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Client approves a submitted milestone and releases funds to the freelancer
   */
  approve_milestone: ({ job_id, milestone_index, client }: { job_id: string, milestone_index: u32, client: string }, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec(["AAAAAQAAABFFc2Nyb3cvam9iIG9iamVjdAAAAAAAAAAAAAAGRXNjcm93AAAAAAAIAAAAAAAAAAZjbGllbnQAAAAAABMAAAAAAAAAD2NyZWF0aW9uX2xlZGdlcgAAAAAEAAAAAAAAAApmcmVlbGFuY2VyAAAAAAATAAAAAAAAAAptaWxlc3RvbmVzAAAAAAPqAAAH0AAAAAlNaWxlc3RvbmUAAAAAAAAAAAAAD3JlZnVuZF90aW1lbG9jawAAAAAEAAAAAAAAAA9yZWxlYXNlZF9hbW91bnQAAAAACwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAx0b3RhbF9hbW91bnQAAAAL",
        "AAAAAQAAAB9BIHNpbmdsZSBtaWxlc3RvbmUgaW5zaWRlIGEgam9iAAAAAAAAAAAJTWlsZXN0b25lAAAAAAAAAwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAPTWlsZXN0b25lU3RhdHVzAA==",
        "AAAAAgAAABVNaWxlc3RvbmUgc3RhdHVzIGVudW0AAAAAAAAAAAAAD01pbGVzdG9uZVN0YXR1cwAAAAADAAAAAAAAAAAAAAAHUGVuZGluZwAAAAAAAAAAAAAAAAlTdWJtaXR0ZWQAAAAAAAAAAAAAAAAAAAhBcHByb3ZlZA==",
        "AAAAAAAAAJpDcmVhdGUgYSBuZXcgam9iIChlc2Nyb3cpLiBgam9iX2lkYCBpcyBhIHVuaXF1ZSBrZXkgY2hvc2VuIGJ5IGNhbGxlciAodXNlIGEgU3RyaW5nKS4KVHJhbnNmZXJzIHRoZSB0b3RhbCBib3VudHkgZnJvbSBgY2xpZW50YCB0byB0aGUgY29udHJhY3QgaW1tZWRpYXRlbHkuAAAAAAAKY3JlYXRlX2pvYgAAAAAABgAAAAAAAAAGam9iX2lkAAAAAAAQAAAAAAAAAAZjbGllbnQAAAAAABMAAAAAAAAACmZyZWVsYW5jZXIAAAAAABMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAKbWlsZXN0b25lcwAAAAAD6gAAB9AAAAAJTWlsZXN0b25lAAAAAAAAAAAAAA9yZWZ1bmRfdGltZWxvY2sAAAAABAAAAAA=",
        "AAAAAAAAACFSZWFkIGhlbHBlcjogZ2V0IGVzY3JvdyBieSBqb2IgaWQAAAAAAAAKZ2V0X2VzY3JvdwAAAAAAAQAAAAAAAAAGam9iX2lkAAAAAAAQAAAAAQAAB9AAAAAGRXNjcm93AAA=",
        "AAAAAAAAADZGcmVlbGFuY2VyIHN1Ym1pdHMgd29yayBmb3IgYSBzcGVjaWZpYyBtaWxlc3RvbmUgaW5kZXgAAAAAAAtzdWJtaXRfd29yawAAAAADAAAAAAAAAAZqb2JfaWQAAAAAABAAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAAAAAApmcmVlbGFuY2VyAAAAAAATAAAAAA==",
        "AAAAAAAAAElBbGxvd3MgdGhlIGNsaWVudCB0byByZWNsYWltIHVucmVsZWFzZWQgZnVuZHMgYWZ0ZXIgYSB0aW1lbG9jayBoYXMgcGFzc2VkAAAAAAAADmRpc3B1dGVfcmVmdW5kAAAAAAACAAAAAAAAAAZqb2JfaWQAAAAAABAAAAAAAAAABmNsaWVudAAAAAAAEwAAAAA=",
        "AAAAAAAAAEpDbGllbnQgYXBwcm92ZXMgYSBzdWJtaXR0ZWQgbWlsZXN0b25lIGFuZCByZWxlYXNlcyBmdW5kcyB0byB0aGUgZnJlZWxhbmNlcgAAAAAAEWFwcHJvdmVfbWlsZXN0b25lAAAAAAAAAwAAAAAAAAAGam9iX2lkAAAAAAAQAAAAAAAAAA9taWxlc3RvbmVfaW5kZXgAAAAABAAAAAAAAAAGY2xpZW50AAAAAAATAAAAAA=="]),
      options
    )
  }
  public readonly fromJSON = {
    create_job: this.txFromJSON<null>,
    get_escrow: this.txFromJSON<Escrow>,
    submit_work: this.txFromJSON<null>,
    dispute_refund: this.txFromJSON<null>,
    approve_milestone: this.txFromJSON<null>
  }
}