import { PayloadType, WalletType } from './type';
import * as bitcoin from 'bitcoinjs-lib';

const WALLET_TYPE = 'BITCOIN';

export default class BitcoinBridge {

    isTestnet: boolean;
    TESTNET: any;

    constructor(rpcUrl: string, chainId: number, extensionOptions: any){
        this.isTestnet = extensionOptions.network === 'testnet';
        this.TESTNET = bitcoin.networks.testnet;
    }

    signTransaction = (payload: PayloadType, privateKey: string) => {
        const keyPair = this.isTestnet ? bitcoin.ECPair.fromWIF(privateKey, this.TESTNET) : bitcoin.ECPair.fromWIF(privateKey);

        const { params } = payload;

        const transaction = bitcoin.Transaction.fromHex(params[0]);

        const tx = this.isTestnet ? bitcoin.TransactionBuilder.fromTransaction(transaction, this.TESTNET)
            : bitcoin.TransactionBuilder.fromTransaction(transaction);

        for(let i = 0; i < transaction.ins.length; i++) {
            tx.sign(i, keyPair);
        }

        return  tx.build().toHex();
    };

    createWallet = (): WalletType => {
        if(this.isTestnet) {
            const keyPair = bitcoin.ECPair.makeRandom({ network: this.TESTNET });
            const { address } = bitcoin.payments.p2pkh({
                pubkey: keyPair.publicKey,
                network: this.TESTNET,
            });

            return {
                address,
                privateKey: keyPair.toWIF(),
                walletType: WALLET_TYPE
            }
        }
        else {
            const keyPair = bitcoin.ECPair.makeRandom();
            const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

            return {
                address,
                privateKey: keyPair.toWIF(),
                walletType: WALLET_TYPE
            }
        }
    }
}
