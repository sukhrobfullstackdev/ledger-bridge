import {ec as EC} from "elliptic";
import {SHA3} from "sha3";
import * as fcl from "@onflow/fcl";
import * as rlp from "rlp"
import {MainnetAddress, TestnetAddress, Networks} from "../constants";

const ec = new EC("p256");

export const rightPaddedHexBuffer = (value, pad) =>
    Buffer.from(value.padEnd(pad * 2, 0), "hex")

const TRANSACTION_DOMAIN_TAG = rightPaddedHexBuffer(Buffer.from("FLOW-V0.0-transaction").toString("hex"), 32).toString("hex")
export const prependTransactionDomainTag = tx => TRANSACTION_DOMAIN_TAG + tx

export const hashMsgHex = msgHex => {
    const sha = new SHA3(256);
    sha.update(Buffer.from(msgHex, "hex"));
    return sha.digest();
};

export const getTokenContractAddress = network => {
  return network === 'MAINNET' || network === 'mainnet' ? MainnetAddress : TestnetAddress;
};

// current cadded AuthAccount constructor (what you use to create an account on flow)
// requires a public key to be in a certain format. That format is an rlp encoded value
// that encodes the key itself, what curve it uses, how the signed values are hashed
// and the keys weight.
const encodePublicKeyForFlow = publicKey =>
    rlp
        .encode([
            Buffer.from(publicKey, "hex"), // publicKey hex to binary
            2, // P256 per https://github.com/onflow/flow/blob/master/docs/accounts-and-keys.md#supported-signature--hash-algorithms
            3, // SHA3-256 per https://github.com/onflow/flow/blob/master/docs/accounts-and-keys.md#supported-signature--hash-algorithms
            1000, // give key full weight
        ])
        .toString("hex")

export const genKeys = () => {
    const keys = ec.genKeyPair()
    const privateKey = keys.getPrivate("hex")
    const publicKey = keys.getPublic("hex").replace(/^04/, "")
    const flowKey = publicKey;
    
    return {
        publicKey,
        privateKey,
        flowKey,
    }
}

export const signWithKey = (privateKey, msgHex) => {
    const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"));

    const sig = key.sign(hashMsgHex(msgHex));
    const n = 32; // half of signature length?
    const r = sig.r.toArrayLike(Buffer, "be", n);
    const s = sig.s.toArrayLike(Buffer, "be", n);

    return Buffer.concat([r, s]).toString("hex");
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
};

export const authorizationCreateAccount = async (account = {}, flowSignMessage, rpcUrl, addr) => {
    fcl.config().put("accessNode.api", rpcUrl);
    let keyId = 0;

    let sequenceNum;
    if (account.role.proposer) {
        const response = await fcl.send([fcl.getAccount(addr)]);
        const acct = await fcl.decode(response);
        keyId = getRandomInt(0, acct.keys.length - 1);

        sequenceNum = acct.keys[keyId].sequenceNumber;
    }

    const signingFunction = async data => {
        const {signature} = (await flowSignMessage(data.message)).data;

        return {
            addr,
            keyId,
            signature,
        };
    };

    return {
        ...account,
        addr,
        keyId,
        signingFunction,
        sequenceNum
    };
};
