import { ZilliqaPayloadType, ZilliqaWalletType} from './type'
const { Zilliqa, TxStatus } = require('@zilliqa-js/zilliqa');
const { BN, Long } = require('@zilliqa-js/util');

const WALLET_TYPE = 'ZILLIQA';

export default class ZilliqaBridge {

    rpcUrl: string;

    constructor(rpcUrl: string, chainId: number){
        this.rpcUrl = rpcUrl;
    }

    sendTransaction = async (payload: ZilliqaPayloadType, privateKey: string): Promise<any> => {
        const zilliqa = new Zilliqa(this.rpcUrl);
        zilliqa.wallet.addByPrivateKey(privateKey);
        const { params } = payload.params;
        try {
            const result =  await zilliqa.blockchain.createTransaction(
                zilliqa.transactions.new(
                    {
                        version: params.version,
                        toAddr: params.toAddr,
                        amount: new BN(params.amount),
                        gasPrice: new BN(params.gasPrice),
                        gasLimit: Long.fromNumber(params.gasLimit),
                    },
                    payload.params.toDs,
                ),
            );

            return {
                id: result.id,
                receipt: result.getReceipt()
            };
        } catch (error) {
            throw error;
        }
    };

    deployContract = async (payload: ZilliqaPayloadType, privateKey: string) => {
        const zilliqa = new Zilliqa(this.rpcUrl);
        zilliqa.wallet.addByPrivateKey(privateKey);
        const { params } = payload;

        const contract = await zilliqa.contracts.new(params.code, params.init);

        const deployParams = {
            version: params.params.version,
            toAddr: params.params.toAddr,
            gasPrice: new BN(params.params.gasPrice),
            gasLimit: Long.fromNumber(params.params.gasLimit),
        };

        try {
            const [deployTx, deployedContract] = await contract.deploy(
                deployParams,
                params.attempts,
                params.interval,
                params.toDs,
            );
            return {
                id: deployTx.id,
                receipt: deployTx.getReceipt(),
                contractAddress: deployedContract.address
            }
        } catch (error) {
            throw error;
        }
    };

    callContract = async (payload: ZilliqaPayloadType, privateKey: string) => {
        const zilliqa = new Zilliqa(this.rpcUrl);
        zilliqa.wallet.addByPrivateKey(privateKey);
        const { params } = payload;

        const deployedContract = zilliqa.contracts.at(params.contractAddress);

        const callParams = {
            version: params.params.version,
            amount: new BN(params.params.amount),
            gasPrice: new BN(params.params.gasPrice),
            gasLimit: Long.fromNumber(params.params.gasLimit),
        };
        try {
            const result = await deployedContract.call(
                params.transition,
                params.args,
                callParams,
                params.attempts,
                params.interval,
                params.toDs,
            );
            if (result.status === TxStatus.Rejected) {
                if (deployedContract.error) {
                  throw new Error(JSON.stringify(deployedContract.error));
                } else {
                  throw new Error(JSON.stringify(result.receipt?.exceptions || []));
                }
            }
            return {
                id: result.id,
                receipt: result.getReceipt()
            };
        } catch (error) {
            throw error;
        }
    };

    getWallet = (payload: ZilliqaPayloadType, privateKey: string) => {
        const zilliqa = new Zilliqa(this.rpcUrl);
        zilliqa.wallet.addByPrivateKey(privateKey);

        delete zilliqa.wallet.defaultAccount.privateKey;

        return zilliqa.wallet.defaultAccount;
    };

    createWallet = (): ZilliqaWalletType => {
        const zilliqa = new Zilliqa(this.rpcUrl);
        zilliqa.wallet.create();

        return {
            address: zilliqa.wallet.defaultAccount.bech32Address,
            privateKey: zilliqa.wallet.defaultAccount.privateKey,
            walletType: WALLET_TYPE
        }
    };
}
