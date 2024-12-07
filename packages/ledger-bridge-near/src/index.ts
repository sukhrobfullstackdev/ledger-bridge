import { NearPayloadType, NearWalletType } from './type'
import { KeyPair, transactions, InMemorySigner} from 'near-api-js'

const WALLET_TYPE = 'NEAR';

export default class NearBridge {

    constructor(rpcUrl: string, chainId: number){

    }

    signTransaction= async (payload: NearPayloadType, privateKey: string): Promise<any> => {
        const keyPair = KeyPair.fromString(privateKey);

        const { rawTransaction, networkId } = payload.params;

        const { publicKey, accountID } = this.getPublicKeyAndAccountID(keyPair);

        const signer = await InMemorySigner.fromKeyPair(networkId, accountID, keyPair);

        const transaction = transactions.Transaction.decode(Buffer.from(rawTransaction));

        const signedTransaction = await transactions.signTransaction(transaction, signer, accountID, networkId);

        return {
            hash: signedTransaction[0],
            encodedSignedTransaction: signedTransaction[1].encode(),
        }
    };

    getPublicKey = async (payload: NearPayloadType, privateKey: string) => {
        const keyPair = KeyPair.fromString(privateKey);

        const { publicKey, accountID } = this.getPublicKeyAndAccountID(keyPair);

        return publicKey.toString();
    };

    createWallet = (): NearWalletType => {
        const keyPair = KeyPair.fromRandom('ed25519');
        const publicKey = keyPair.getPublicKey().data;
        const accountID = Buffer.from(publicKey).toString('hex');

        return {
            address: accountID,
            privateKey: keyPair.toString().replace('ed25519:', ''),
            walletType: WALLET_TYPE
        }
    };

    getPublicKeyAndAccountID = (keyPair: any) => {
        const publicKey = keyPair.getPublicKey();

        return {
            publicKey,
            accountID: Buffer.from(publicKey.data).toString('hex')
        }
    }
}
