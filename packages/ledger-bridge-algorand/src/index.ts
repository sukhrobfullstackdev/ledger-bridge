import { ExtensionOptions, PayloadType } from './type';
const algosdk = require('algosdk');
const algosdk_transaction = require('algosdk/dist/cjs/transaction');

const WALLET_TYPE = 'ALGOD';

export default class AlgodBridge {

    rpcUrl: string;

    constructor(rpcUrl: string, chainId: string, options: ExtensionOptions) {
        this.rpcUrl = rpcUrl;
    }

    signTransaction = async (payload: PayloadType, privateKey: string) => {
        const keys = algosdk.mnemonicToSecretKey(privateKey);
        if (payload.params.to) {
            return  algosdk.signTransaction(payload.params, keys.sk);
        }
        const decodedTxn = algosdk.decodeUnsignedTransaction(payload.params);
        const signedTxn = algosdk.signTransaction(decodedTxn, keys.sk);
        return signedTxn;
    };

    signBid = async (payload: PayloadType, privateKey: string) => {
        const keys = algosdk.mnemonicToSecretKey(privateKey);

        return algosdk.signBid(payload.params, keys.sk);
    };

    signGroupTransaction = async (payload: PayloadType, privateKey: string) => {
        const keys = algosdk.mnemonicToSecretKey(privateKey);
        const { params }  = payload;

        const txns = params.map((paymentTxn: any) => (algosdk.makePaymentTxnWithSuggestedParams(
                paymentTxn.from,
                paymentTxn.to,
                paymentTxn.amount,
                paymentTxn.closeRemainderTo,
                paymentTxn.note,
                paymentTxn.suggestedParams,
                paymentTxn.rekeyTo,
            )
        ));

        const txgroup = algosdk.assignGroupID(txns);

        return txns.map((txn: any) => txn.signTxn(keys.sk))
    };

    signGroupTransactionV2 = async (payload: PayloadType, privateKey: string) => {
        const txns  = payload.params;

        const stxns = await this.signTxns(txns, privateKey, {});

        for (const i in stxns) {
            if (!stxns[i]) {
                stxns[i] = txns[i].stxn;
            }
        }

        return stxns
    };

    createWallet = async () => {
        const keys = algosdk.generateAccount();
        const privateKey = algosdk.secretKeyToMnemonic(keys.sk);

        return {
            address: keys.addr,
            privateKey,
            walletType: WALLET_TYPE
        }
    };

    signTxns = async (txns: any, privateKey: string, opts?: any, ) => {
        const {sk, addr} = algosdk.mnemonicToSecretKey(privateKey);

        return txns.map((txnObj: any) => {
            if (Array.isArray(txnObj.signers) && txnObj.signers.length === 0) {
                return null;
            }
            const txnBuf = Buffer.from(txnObj.txn, 'base64');
            const t = algosdk_transaction.decodeUnsignedTransaction(txnBuf);
            const stxnBuf = Buffer.from(t.signTxn(sk));
            return stxnBuf.toString('base64');
        });
    };
}
