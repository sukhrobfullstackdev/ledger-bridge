// import or require Index class
const {Account} = require('@harmony-js/account');
const { Harmony: Index } = require('@harmony-js/core');
// import or require settings
const { ChainID, ChainType } = require('@harmony-js/utils');
import { CreateWalletResultType, HarmonyPayloadType, SendTransactionResultType } from './type';

const WALLET_TYPE = 'HARMONY';

export default class HarmonyBridge {

    harmony: any;

    constructor(rpcUrl: string, chainId: number = ChainID.HmyTestnet){

        this.harmony = new Index(
            // rpc url
            rpcUrl,
            {
                // chainType set to Index
                chainType: ChainType.Harmony,
                // chainType set to HmyLocal
                chainId,
            },
        );
    }

    sendTransaction = async (payload: HarmonyPayloadType, privateKey: string): Promise<SendTransactionResultType> => {

        const harmony = this.harmony;

        harmony.wallet.addByPrivateKey(privateKey);

        async function setSharding() {

            const res = await harmony.blockchain.getShardingStructure();
            harmony.shardingStructures(res.result);
        }

        await setSharding();

        const txn = harmony.transactions.newTx(payload.params);

        const signedTxn = await harmony.wallet.signTransaction(txn);

        const [sentTxn, txnHash] = await signedTxn.sendTransaction();

        const confiremdTxn = await sentTxn.confirm(txnHash);

        return {
            transactionHash: txnHash,
            receipt: confiremdTxn.receipt
        }

    };

    getBalance = async (payload: HarmonyPayloadType): Promise<string> => {

        const address = payload.params[0];
        const { result } = await this.harmony.blockchain.getBalance({address});
        return result;
    };

    createWallet = (): CreateWalletResultType => {
        const wallet = new Account();

        return {
            address: wallet.bech32Address,
            privateKey: wallet.privateKey,
            walletType: WALLET_TYPE
        }
    };
}
