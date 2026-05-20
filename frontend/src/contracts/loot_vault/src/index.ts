// @ts-nocheck
/* eslint-disable */
import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type { i128 } from "@stellar/stellar-sdk/contract";
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
  },
} as const;

export interface Client {
  /**
   * Construct and simulate an init transaction.
   * Initialize the contract with an admin (the Quest Master).
   */
  init: (
    { admin }: { admin: string },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a deposit transaction.
   */
  deposit: (
    { user, token, amount }: { user: string; token: string; amount: i128 },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a draw_winner transaction.
   * Pick a winner (simplified for the mock version).
   */
  draw_winner: (options?: MethodOptions) => Promise<AssembledTransaction<string>>;

  /**
   * Construct and simulate a get_loot_pool transaction.
   */
  get_loot_pool: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>;

  /**
   * Construct and simulate a mock_generate_yield transaction.
   * The admin injects loot into the pool.
   */
  mock_generate_yield: (
    { amount }: { amount: i128 },
    options?: MethodOptions,
  ) => Promise<AssembledTransaction<null>>;
}

export class Client extends ContractClient {
  static async deploy<T = Client>(
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        wasmHash: Buffer | string;
        salt?: Buffer | Uint8Array;
        format?: "hex" | "base64";
      },
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }

  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAAAAADhJbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIGFuIGFkbWluICh0aGUgUXVlc3QgTWFzdGVyKQAAAARpbml0AAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
        "AAAAAAAAACtQaWNrIGEgd2lubmVyIChTaW1wbGlmaWVkIGZvciBNb2NrIHZlcnNpb24pAAAAAAtkcmF3X3dpbm5lcgAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAAAAAAANZ2V0X2xvb3RfcG9vbAAAAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAD1PUFRJT04gMTogTW9jayBZaWVsZCAtIFRoZSBBZG1pbiAiaW5qZWN0cyIgbG9vdCBpbnRvIHRoZSBwb29sAAAAAAAAE21vY2tfZ2VuZXJhdGVfeWllbGQAAAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
      ]),
      options,
    );
  }

  public readonly fromJSON = {
    init: this.txFromJSON<null>,
    deposit: this.txFromJSON<null>,
    draw_winner: this.txFromJSON<string>,
    get_loot_pool: this.txFromJSON<i128>,
    mock_generate_yield: this.txFromJSON<null>,
  };
}
