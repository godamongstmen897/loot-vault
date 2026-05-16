import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export class Client extends ContractClient {
    options;
    static async deploy(
        /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
        options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAADhJbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIGFuIGFkbWluICh0aGUgUXVlc3QgTWFzdGVyKQAAAARpbml0AAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
            "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
            "AAAAAAAAACtQaWNrIGEgd2lubmVyIChTaW1wbGlmaWVkIGZvciBNb2NrIHZlcnNpb24pAAAAAAtkcmF3X3dpbm5lcgAAAAAAAAAAAQAAABM=",
            "AAAAAAAAAAAAAAANZ2V0X2xvb3RfcG9vbAAAAAAAAAAAAAABAAAACw==",
            "AAAAAAAAAD1PUFRJT04gMTogTW9jayBZaWVsZCAtIFRoZSBBZG1pbiAiaW5qZWN0cyIgbG9vdCBpbnRvIHRoZSBwb29sAAAAAAAAE21vY2tfZ2VuZXJhdGVfeWllbGQAAAAAAQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA=="]), options);
        this.options = options;
    }
    fromJSON = {
        init: (this.txFromJSON),
        deposit: (this.txFromJSON),
        draw_winner: (this.txFromJSON),
        get_loot_pool: (this.txFromJSON),
        mock_generate_yield: (this.txFromJSON)
    };
}
