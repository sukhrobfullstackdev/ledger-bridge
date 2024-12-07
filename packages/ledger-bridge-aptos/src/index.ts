import { AptosAccount, AptosClient, BCS, CoinClient, HexString, TxnBuilderTypes } from 'aptos';

import { AptosPayloadType } from './type';

const WALLET_TYPE = 'APTOS';

export default class AptosBridge {
    nodeUrl: string;

    constructor(rpcUrl: string, chainId: number, options: any) {
        // TODO: rpcUrl and chainId are not used
        const { nodeUrl } = options;
        this.nodeUrl = nodeUrl;
    }

    private createAptosClient = () => {
        return new AptosClient(this.nodeUrl)
    }

    private deserializeRawTransaction = (transactinoBytes: Uint8Array) => {
        try {
            const s = new BCS.Deserializer(transactinoBytes);
            return TxnBuilderTypes.RawTransaction.deserialize(s);
        } catch (e) {
            console.error('Can not deserialize raw transaction', e)
            throw e
        }
    }

    createWallet = () => {
        const wallet = new AptosAccount()
        const keyObject = wallet.toPrivateKeyObject();

        return {
            address: keyObject.address,
            privateKey: keyObject.privateKeyHex,
            walletType: WALLET_TYPE,
        }
    }

    getAccountInfo = (payload: AptosPayloadType, privateKey: string) => {
        if (payload.params.length !== 1) {
            throw new Error('Invalid payload. Params length should be 1.')
        }

        const { address } = payload.params[0];

        const aptosAccount = new AptosAccount(
            new HexString(privateKey).toUint8Array(),
            address
        );

        return {
            address: aptosAccount.address().hex(),
            publicKey: aptosAccount.pubKey().hex(),
        }
    }

    signTransaction = (payload: AptosPayloadType, privateKey: string) => {
        if (payload.params.length !== 1) {
            throw new Error('Invalid payload. Params length should be 1.')
        }

        const { address, transactionBytes } = payload.params[0];
        
        const rawTransaction = this.deserializeRawTransaction(transactionBytes)

        const account = new AptosAccount(new HexString(privateKey).toUint8Array(), address)
        const client = this.createAptosClient()

        return client.signTransaction(account, rawTransaction)
    }

    signAndSubmitTransaction = async (payload: AptosPayloadType, privateKey: string) => {
        if (payload.params.length !== 1) {
            throw new Error('Invalid payload. Params length should be 1.')
        }

        const { address, transactionBytes } = payload.params[0];

        const aptosAccount = new AptosAccount(
            new HexString(privateKey).toUint8Array(),
            address
        );

        const rawTransaction = this.deserializeRawTransaction(transactionBytes)

        const client = this.createAptosClient();
        const signed = await client.signTransaction(aptosAccount, rawTransaction);
        const result = await client.submitTransaction(signed);

        return { hash: result.hash };
    }

    signAndSubmitBCSTransaction = async (payload: AptosPayloadType, privateKey: string) => {
        if (payload.params.length !== 1) {
            throw new Error('Invalid payload. Params length should be 1.')
        }

        const { address, transactionBytes } = payload.params[0];

        const aptosAccount = new AptosAccount(
            new HexString(privateKey).toUint8Array(),
            address
        );

        const rawTransaction = this.deserializeRawTransaction(transactionBytes);
        const bcsTransaction = AptosClient.generateBCSTransaction(aptosAccount, rawTransaction);

        const client = this.createAptosClient();
        const result = await client.submitSignedBCSTransaction(bcsTransaction);

        return { hash: result.hash };
    }

    signMessage = async (payload: AptosPayloadType, privateKey: string) => {
        if (payload.params.length !== 1) {
            throw new Error('Invalid payload. Params length should be 1.')
        }

        const { address, message: {
            message, ...rest
        } } = payload.params[0];

        const aptosAccount = new AptosAccount(
            new HexString(privateKey).toUint8Array(),
            address
        );

        const encoder = new TextEncoder();
        const encoded = encoder.encode(message);
        const signed = aptosAccount.signBuffer(encoded);

        return {
            ...rest,
            fullMessage: message,
            message,
            prefix: 'APTOS',
            signature: signed.hex(),
        };
    }

    signMessageAndVerify = async (payload: AptosPayloadType, privateKey: string) => {
        if (payload.params.length !== 1) {
            throw new Error('Invalid payload. Params length should be 1.')
        }

        const { address, message: {
            message, ...rest
        } } = payload.params[0];

        const aptosAccount = new AptosAccount(
            new HexString(privateKey).toUint8Array(),
            address
        );

        const encoder = new TextEncoder();
        const encoded = encoder.encode(message);
        const signed = aptosAccount.signBuffer(encoded);

        return aptosAccount.verifySignature(HexString.fromUint8Array(encoded), signed);
    }
}
