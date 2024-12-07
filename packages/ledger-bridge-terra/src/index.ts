import { TerraPayloadType, TerraWalletType } from './type'
import { LCDClient, MsgSend, MnemonicKey, SimplePublicKey } from '@terra-money/terra.js';
import { SHA256, Word32Array } from 'jscrypto';
import * as secp256k1 from 'secp256k1';

const WALLET_TYPE = 'TERRA';

export default class TerraBridge {

    constructor(rpcUrl: string, chainId: number){

    }

    sign = async (payload: TerraPayloadType, privateKey: string): Promise<any> => {
        const privateKeyBuff = this.mnemonicToPrivateBuff(privateKey)
        const { signature } = this.ecdsaSign(payload.params[0], privateKeyBuff);

        return Buffer.from(signature);
    };

    ecdsaSign(payload: Buffer, privateKeyBuff: Buffer): { signature: Uint8Array; recid: number } {
        const hash = Buffer.from(
          SHA256.hash(new Word32Array(payload)).toString(),
          'hex'
        );
        return secp256k1.ecdsaSign(
          Uint8Array.from(hash),
          Uint8Array.from(privateKeyBuff)
        );
    }

    getPublicKey = async (payload: Buffer, privateKey: string) => {
        const privateKeyBuff = this.mnemonicToPrivateBuff(privateKey)
        const publicKey = secp256k1.publicKeyCreate(
          new Uint8Array(privateKeyBuff),
          true
        );
        return Buffer.from(publicKey).toString('base64')
    }

    mnemonicToPrivateBuff = (mnemonic: string): Buffer => {
        const mk = new MnemonicKey({mnemonic});
        return mk.privateKey
    }

    createWallet = (): TerraWalletType => {
        const mk = new MnemonicKey();

        return {
            address: mk.accAddress,
            privateKey: mk.mnemonic,
            walletType: WALLET_TYPE
        }
    };
}
