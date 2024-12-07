import { TaquitoPayloadType, TaquitoWalletType } from './type';
import { InMemorySigner } from '@taquito/signer';
import * as bip39 from 'bip39';

const WALLET_TYPE = 'TAQUITO';

export default class TaquitoBridge {

    constructor(rpcUrl: string, chainId: number){}

    sign = async (payload: TaquitoPayloadType, privateKey: string) => {
        const signer = new InMemorySigner(privateKey);
        const { bytes, watermark } = payload.params[0];
        return signer.sign(bytes, watermark)
    }

    getPublicKeyAndHash = async (payload: TaquitoPayloadType, privateKey: string) => {
        const signer = new InMemorySigner(privateKey);
        return {
            pkh: await signer.publicKeyHash(),
            pk: await signer.publicKey()
        }
    }

    createWallet = async (): Promise<TaquitoWalletType> => {
        const mnemonic = bip39.generateMnemonic();

        const signer = InMemorySigner.fromFundraiser('', '', mnemonic)

        return {
            address: await signer.publicKeyHash(),
            privateKey: await signer.secretKey(),
            walletType: WALLET_TYPE
        }
    }
};
