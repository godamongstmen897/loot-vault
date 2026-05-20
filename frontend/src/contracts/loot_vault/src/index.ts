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
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  // @ts-expect-error Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBOCSNRLUDBBOOAVPECFHBR3TL6T576BZB6AVVBDFBDAXMBKFC573VYF",
  }
} as const


export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the contract with an admin (the Quest Master)
   */
  init: ({ admin }: { admin: string }, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit: ({ user, token, amount }: { user: string, token: string, amount: i128 }, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a draw_winner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Pick a winner (Simplified for Mock version)
   */
  draw_winner: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_loot_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_loot_pool: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a mock_generate_yield transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * OPTION 1: Mock Yield - The Admin "injects" loot into the pool
   */
  mock_generate_yield: ({ amount }: { amount: i128 }, options?: MethodOptions) => Promise<AssembledTransaction<null>>

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
      new ContractSpec(["AAAAAAAAADhJbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIGFuIGFkbWluICh0aGUgUXVlc3QgTWFzdGVyKQAAAARpbml0AAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
        "AAAAAAAAACtQaWNrIGEgd2lubmVyIChTaW1wbGlmaWVkIGZvciBNb2NrIHZlcnNpb24pAAAAAAtkcmF3X3dpbm5lcgAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAAAAAAANZ2V0X2xvb3RfcG9vbAAAAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAD1PUFRJT04gMTogTW9jayBZaWVsZCAtIFRoZSBBZG1pbiAiaW5qZWN0cyIgbG9vdCBpbnRvIHRoZSBwb29sAAAAAAAAE21vY2tfZ2VuZXJhdGVfeWllbGQAAAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA=="]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
    deposit: this.txFromJSON<null>,
    draw_winner: this.txFromJSON<string>,
    get_loot_pool: this.txFromJSON<i128>,
    mock_generate_yield: this.txFromJSON<null>
  }
}
