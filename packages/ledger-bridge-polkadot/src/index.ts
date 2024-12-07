import { ApiPromise, WsProvider } from '@polkadot/api';
import Keyring from '@polkadot/keyring';
import { randomAsHex } from '@polkadot/util-crypto';
import { PayloadType, WalletType } from './type';
import '@polkadot/api-augment/polkadot'
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { TypeRegistry, createType } from '@polkadot/types';
import { u8aToHex } from '@polkadot/util';

const WALLET_TYPE = 'POLKADOT';

export default class PolkadotBridge {

    provider: any;
    api: any;
    rpcUrl: string;

    constructor(rpcUrl: string){
        this.provider = new WsProvider(rpcUrl);
        this.rpcUrl = rpcUrl;
    }

    getBalance = async (payload: PayloadType) => {

        const address = payload.params.address;

        let previous = await this.api.query.balances.freeBalance(address);

        return previous.toString();
    };

    signPayload = async (payload: PayloadType, privateKey: string) => {
        const polkadotPayload = payload.params[0] as SignerPayloadJSON

        const keyring = new Keyring();
        const accountPair = keyring.addFromUri(privateKey);

        const registry = new TypeRegistry();
        registry.setSignedExtensions(polkadotPayload.signedExtensions);

        const { signature } = registry
            .createType('ExtrinsicPayload', polkadotPayload, { 
                version: polkadotPayload.version 
            })
            .sign(accountPair)

        return signature;
    };

    signRaw = async (payload: PayloadType, privateKey: string) => {
        const polkadotPayload = payload.params[0] as SignerPayloadRaw

        const keyring = new Keyring();
        const accountPair = keyring.addFromUri(privateKey);

        const signature = accountPair.sign(polkadotPayload.data);

        return u8aToHex(signature)
    };

    sendTransaction = async (payload: PayloadType, privateKey: string) => {

        const api = await ApiPromise.create({ provider: new WsProvider(this.rpcUrl) });
        await api.isReady;

        const { to, value } = payload.params;

        const keyring = new Keyring();

        const accountPair = keyring.addFromUri(privateKey);

        const txHash = await api.tx.balances
            .transfer(to, value)
            // @ts-ignore
            .signAndSend(accountPair);

        return txHash.toHex();
    }


    contractCall = async (payload: PayloadType, privateKey: string) => {

        const { contractAddress, value, maxGas, data } = payload.params;

        const api = await ApiPromise.create({ provider: new WsProvider(this.rpcUrl) });
        await api.isReady;

        const keyring = new Keyring();
        const accountPair = keyring.addFromUri(privateKey);

        // @ts-ignore
        const txHash = await api.tx.contracts.call(contractAddress, value, maxGas, data).signAndSend(accountPair);

        return txHash.toHex();
    }


    createWallet = (): WalletType => {
        const randomKey = randomAsHex();
        const keyring = new Keyring();
        const accountPair = keyring.addFromUri(randomKey);

        return {
            address: accountPair.address,
            privateKey: randomKey,
            walletType: WALLET_TYPE
        }
    };
}
