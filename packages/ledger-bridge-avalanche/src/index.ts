import {AvalanchePayloadType, AvalancheWalletType, ExtensionOptions} from './type'
import { Avalanche, BN } from 'avalanche';

const WALLET_TYPE = 'AVAX';

export default class AvaxBridge {

    rpcUrl: string;
    ava: any;

    constructor(rpcUrl: string, chainId: string, options: ExtensionOptions) {
        this.rpcUrl = rpcUrl;

        const url = new URL(rpcUrl);

        const protocol = url.protocol.replace(':', '');

        const parsePort = () => {
            if (protocol === 'http') return 80;
            if (protocol === 'https') return 443;
            throw new Error('Unknown protocol!')
        };

        const port = url.port ? parseInt(url.port) : parsePort();

        this.ava = new Avalanche(url.hostname, port, protocol, options.networkId, options.chainId);
    }

    signTransaction = async (payload: AvalanchePayloadType, privateKey: string) => {
        const  {
            sendAmount,
            assetId,
            toAddresses,
            fromAddresses,
            changeAddresses,
        } = payload.params;


        const xchain = this.ava.XChain();
        const myKeychain = xchain.keyChain();

        myKeychain.importKey(privateKey);

        const utxos = (await xchain.getUTXOs(fromAddresses)).utxos;

        const unsignedTx = await xchain.buildBaseTx(utxos, new BN(sendAmount), assetId, toAddresses, fromAddresses, changeAddresses);
        const signedTx = xchain.signTx(unsignedTx);

        return signedTx.toStringHex();
    };

    createWallet = async (): Promise<AvalancheWalletType | any> => {
        const xchain = this.ava.XChain();
        const myKeychain = xchain.keyChain();
        let newAddress1 = myKeychain.makeKey();
        let privateKey = newAddress1.getPrivateKeyString();
        let address = newAddress1.getAddressString();

        return {
            address,
            privateKey,
            walletType: WALLET_TYPE
        }
    }
}
