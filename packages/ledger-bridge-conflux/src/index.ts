import { ConfluxPayloadType, ConfluxWalletType, ConfluxExtensionOptions } from './type';
import { Conflux } from 'js-conflux-sdk';

const WALLET_TYPE = 'CONFLUX';

export default class ConfluxBridge {

    conflux: any;

    constructor(rpcUrl: string, chainId: number, extensionOptions: ConfluxExtensionOptions){ 
        this.conflux = new Conflux({
            url: extensionOptions.rpcUrl,
            networkId: extensionOptions.networkId || 1,
        });
    }

    sendTransaction = async (payload: ConfluxPayloadType, privateKey: string): Promise<any> => {
        this.conflux.wallet.addPrivateKey(privateKey);
        const receipt = await this.conflux.cfx.sendTransaction(payload.params).executed();
        return receipt;
    };

    createWallet = async (): Promise<ConfluxWalletType> => {
        const wallet = this.conflux.wallet.addRandom();
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            walletType: WALLET_TYPE
        }
    }
}
