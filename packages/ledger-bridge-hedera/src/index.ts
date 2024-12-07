import {InternalAccount, PayloadType, WalletType} from './type';
import { Mnemonic } from "@hashgraph/sdk";
import {createWallet} from "./libs/createWallet";
import { getBalance } from "./libs/getBalance";
const WALLET_TYPE = 'HEDERA';

export default class HederaBridge {

    rpcUrl: string;
    network: string;

    constructor(rpcUrl: string, chainId: number, extensionOptions: any){
        this.rpcUrl = rpcUrl
        this.network = extensionOptions.network
    }

    sign = async (payload: PayloadType, privateKey: string) => {
        const mnemonic = await Mnemonic.fromString(privateKey);
        const sk = await mnemonic.toEd25519PrivateKey()
        const { message } = payload.params[0];
        return sk.sign(message)
    }

    getPublicKey = async (payload: PayloadType, privateKey: string) => {
        const mnemonic = await Mnemonic.fromString(privateKey);
        const sk = await mnemonic.toEd25519PrivateKey()
        return {
            publicKeyRaw: sk.publicKey.toStringRaw(),
            publicKeyDer: sk.publicKey.toStringDer()
        }
    }

    getBalance = (payload: PayloadType, privateKey: string) => {
        const { account, hederaSign } = payload.params;

        return getBalance(account.accountId, hederaSign, this.network, account.publicKey);
    }

    createWallet = async (hederaSign: any, account: InternalAccount): Promise<WalletType> => {
        try {
            const newAccount = await createWallet(account.accountId, hederaSign, this.network, account.publicKey)

            return {
                address: newAccount.accountId as any,
                privateKey: newAccount.privateKey,
                walletType: WALLET_TYPE
            }
        }
        catch (e) {
            throw e;
        }
    }
};
