import * as ed from "@noble/ed25519";
import * as uint8arrays from "uint8arrays";
import { Buffer } from 'buffer';
import { Ed25519PayloadType, Ed25519WalletType } from './type';

const WALLET_TYPE = 'ED';

export default class EdBridge {
    constructor(rpcUrl: string, chainId: number){}

    /**
     * 
     * @param payload Uint8Array
     * @returns Uint8Array
     */
    sign = async (payload: Ed25519PayloadType, privateKey: string): Promise<any> => {
        const formattedPrivateKey = Uint8Array.from(Buffer.from(privateKey, "hex"));
        const signature = await ed.sign(payload.params, formattedPrivateKey);
        return signature;
    };

    /**
     * @returns base58-encoded public key with `did:key:z` prefix
     */
    getPublicKey = async (payload: Ed25519PayloadType, privateKey: string): Promise<any> => {
        const EDWARDS_DID_PREFIX = new Uint8Array([0xed, 0x01]);
        const formattedPrivateKey = Uint8Array.from(Buffer.from(privateKey, "hex"));
        const publicKey = await ed.getPublicKey(formattedPrivateKey);
        const pubKeyPrefixed = uint8arrays.concat([EDWARDS_DID_PREFIX, publicKey]);
        const pubKeyBase58 = uint8arrays.toString(pubKeyPrefixed, "base58btc");
        return `did:key:z${pubKeyBase58}`;
    };

    createWallet = async (): Promise<Ed25519WalletType> => {
        const privateKeyBuffer = ed.utils.randomPrivateKey();
        const privateKeyHex = ed.utils.bytesToHex(privateKeyBuffer);
        const publicKeyBuffer = await ed.getPublicKey(privateKeyBuffer);
        const publicKeyHex = ed.utils.bytesToHex(publicKeyBuffer);

        return {
            address: publicKeyHex,
            privateKey: privateKeyHex,
            walletType: WALLET_TYPE
        }
    }
}
