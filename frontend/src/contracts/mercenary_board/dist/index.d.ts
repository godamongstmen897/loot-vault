import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { u32, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CAF5QOC4HHHITUPDCBI3H64KZZHZKVXI5J5QGS4NLT3YE4CUGEESPSCA";
    };
};
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
export type MilestoneStatus = {
    tag: "Pending";
    values: void;
} | {
    tag: "Submitted";
    values: void;
} | {
    tag: "Approved";
    values: void;
};
export interface Client {
    /**
     * Construct and simulate a create_job transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Create a new job (escrow). `job_id` is a unique key chosen by caller (use a String).
     * Transfers the total bounty from `client` to the contract immediately.
     */
    create_job: ({ job_id, client, freelancer, token, milestones, refund_timelock }: {
        job_id: string;
        client: string;
        freelancer: string;
        token: string;
        milestones: Array<Milestone>;
        refund_timelock: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Read helper: get escrow by job id
     */
    get_escrow: ({ job_id }: {
        job_id: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Escrow>>;
    /**
     * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Freelancer submits work for a specific milestone index
     */
    submit_work: ({ job_id, milestone_index, freelancer }: {
        job_id: string;
        milestone_index: u32;
        freelancer: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a dispute_refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Allows the client to reclaim unreleased funds after a timelock has passed
     */
    dispute_refund: ({ job_id, client }: {
        job_id: string;
        client: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a approve_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Client approves a submitted milestone and releases funds to the freelancer
     */
    approve_milestone: ({ job_id, milestone_index, client }: {
        job_id: string;
        milestone_index: u32;
        client: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        create_job: (json: string) => AssembledTransaction<null>;
        get_escrow: (json: string) => AssembledTransaction<Escrow>;
        submit_work: (json: string) => AssembledTransaction<null>;
        dispute_refund: (json: string) => AssembledTransaction<null>;
        approve_milestone: (json: string) => AssembledTransaction<null>;
    };
}
