import { CeloPayloadType, CeloWalletType } from './type'
import { newKit } from '@celo/contractkit'
import Web3 from 'web3'

const WALLET_TYPE = 'CELO';

export default class CeloBridge {

    rpcUrl: string;

    constructor(rpcUrl: string, chainId: number){
        this.rpcUrl = rpcUrl;
    }

    sendTransaction = async (payload: CeloPayloadType, privateKey: string): Promise<any> => {
        const kit = newKit(this.rpcUrl);
        kit.connection.addAccount(privateKey);
        const wallet = this.privateKeyToAccount(privateKey);

        kit.defaultAccount = wallet.address;

        const tx = await kit.sendTransaction(payload.params);

        const hash = await tx.getHash();
        const receipt = await tx.waitReceipt();

        return {
            hash,
            receipt,
        }
    };

    privateKeyToAccount = (privateKey: string): any => {
        const web3 = new Web3();
        return web3.eth.accounts.privateKeyToAccount(privateKey);
    };


    createWallet = async (): Promise<CeloWalletType> => {
        const web3 = new Web3();
        const wallet =  web3.eth.accounts.create(web3.utils.randomHex(64));

        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            walletType: WALLET_TYPE
        }
    }
}
