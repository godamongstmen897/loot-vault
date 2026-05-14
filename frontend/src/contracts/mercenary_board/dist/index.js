import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAABFFc2Nyb3cvam9iIG9iamVjdAAAAAAAAAAAAAAGRXNjcm93AAAAAAAIAAAAAAAAAAZjbGllbnQAAAAAABMAAAAAAAAAD2NyZWF0aW9uX2xlZGdlcgAAAAAEAAAAAAAAAApmcmVlbGFuY2VyAAAAAAATAAAAAAAAAAptaWxlc3RvbmVzAAAAAAPqAAAH0AAAAAlNaWxlc3RvbmUAAAAAAAAAAAAAD3JlZnVuZF90aW1lbG9jawAAAAAEAAAAAAAAAA9yZWxlYXNlZF9hbW91bnQAAAAACwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAx0b3RhbF9hbW91bnQAAAAL",
            "AAAAAQAAAB9BIHNpbmdsZSBtaWxlc3RvbmUgaW5zaWRlIGEgam9iAAAAAAAAAAAJTWlsZXN0b25lAAAAAAAAAwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAPTWlsZXN0b25lU3RhdHVzAA==",
            "AAAAAgAAABVNaWxlc3RvbmUgc3RhdHVzIGVudW0AAAAAAAAAAAAAD01pbGVzdG9uZVN0YXR1cwAAAAADAAAAAAAAAAAAAAAHUGVuZGluZwAAAAAAAAAAAAAAAAlTdWJtaXR0ZWQAAAAAAAAAAAAAAAAAAAhBcHByb3ZlZA==",
            "AAAAAAAAAJpDcmVhdGUgYSBuZXcgam9iIChlc2Nyb3cpLiBgam9iX2lkYCBpcyBhIHVuaXF1ZSBrZXkgY2hvc2VuIGJ5IGNhbGxlciAodXNlIGEgU3RyaW5nKS4KVHJhbnNmZXJzIHRoZSB0b3RhbCBib3VudHkgZnJvbSBgY2xpZW50YCB0byB0aGUgY29udHJhY3QgaW1tZWRpYXRlbHkuAAAAAAAKY3JlYXRlX2pvYgAAAAAABgAAAAAAAAAGam9iX2lkAAAAAAAQAAAAAAAAAAZjbGllbnQAAAAAABMAAAAAAAAACmZyZWVsYW5jZXIAAAAAABMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAKbWlsZXN0b25lcwAAAAAD6gAAB9AAAAAJTWlsZXN0b25lAAAAAAAAAAAAAA9yZWZ1bmRfdGltZWxvY2sAAAAABAAAAAA=",
            "AAAAAAAAACFSZWFkIGhlbHBlcjogZ2V0IGVzY3JvdyBieSBqb2IgaWQAAAAAAAAKZ2V0X2VzY3JvdwAAAAAAAQAAAAAAAAAGam9iX2lkAAAAAAAQAAAAAQAAB9AAAAAGRXNjcm93AAA=",
            "AAAAAAAAADZGcmVlbGFuY2VyIHN1Ym1pdHMgd29yayBmb3IgYSBzcGVjaWZpYyBtaWxlc3RvbmUgaW5kZXgAAAAAAAtzdWJtaXRfd29yawAAAAADAAAAAAAAAAZqb2JfaWQAAAAAABAAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAAAAAApmcmVlbGFuY2VyAAAAAAATAAAAAA==",
            "AAAAAAAAAElBbGxvd3MgdGhlIGNsaWVudCB0byByZWNsYWltIHVucmVsZWFzZWQgZnVuZHMgYWZ0ZXIgYSB0aW1lbG9jayBoYXMgcGFzc2VkAAAAAAAADmRpc3B1dGVfcmVmdW5kAAAAAAACAAAAAAAAAAZqb2JfaWQAAAAAABAAAAAAAAAABmNsaWVudAAAAAAAEwAAAAA=",
            "AAAAAAAAAEpDbGllbnQgYXBwcm92ZXMgYSBzdWJtaXR0ZWQgbWlsZXN0b25lIGFuZCByZWxlYXNlcyBmdW5kcyB0byB0aGUgZnJlZWxhbmNlcgAAAAAAEWFwcHJvdmVfbWlsZXN0b25lAAAAAAAAAwAAAAAAAAAGam9iX2lkAAAAAAAQAAAAAAAAAA9taWxlc3RvbmVfaW5kZXgAAAAABAAAAAAAAAAGY2xpZW50AAAAAAATAAAAAA=="]), options);
        this.options = options;
    }
    fromJSON = {
        create_job: (this.txFromJSON),
        get_escrow: (this.txFromJSON),
        submit_work: (this.txFromJSON),
        dispute_refund: (this.txFromJSON),
        approve_milestone: (this.txFromJSON)
    };
}
