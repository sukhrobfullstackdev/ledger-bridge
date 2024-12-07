import { IconPayloadType, IconWalletType } from './type'
const IconService = require('icon-sdk-js');

const WALLET_TYPE = 'ICON';

export default class IconBridge {

    iconService: any;

    constructor(rpcUrl: string, chainId: number){
        const httpProvider = new IconService.HttpProvider(rpcUrl);
        this.iconService = new IconService(httpProvider);
    }

    sendTransaction = async (payload: IconPayloadType, privateKey: string): Promise<string> => {

        try {
            const { IconWallet, SignedTransaction } = IconService;

            const wallet = IconWallet.loadPrivateKey(privateKey);

            const signedTransaction = new SignedTransaction(payload.params, wallet);

            return  await this.iconService.sendTransaction(signedTransaction).execute();
        }
        catch (e) {
           throw {
               walletType: WALLET_TYPE,
               message: e
           };
        }
    };

    signTransaction= async (payload: IconPayloadType, privateKey: string): Promise<any> => {

        try {
            const { IconWallet, SignedTransaction } = IconService;

            const wallet = IconWallet.loadPrivateKey(privateKey);

            const signedTransaction = new SignedTransaction(payload.params, wallet);

            return  {
                rawTransaction: signedTransaction.getRawTransaction(),
                signature: signedTransaction.getSignature(),
            };
        }
        catch (e) {
            throw {
                walletType: WALLET_TYPE,
                message: e
            };
        }
    };

    getBalance = async (payload: IconPayloadType): Promise<string> => {
        const balance = await this.iconService.getBalance(payload.params.address).execute();

        return balance.toString();
    };

    createWallet = (): IconWalletType => {
        const wallet = IconService.IconWallet.create();

        return {
            address: wallet.getAddress(),
            privateKey: wallet.getPrivateKey(),
            walletType: WALLET_TYPE
        }
    }
}
