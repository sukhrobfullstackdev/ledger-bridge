import { DirectSecp256k1HdWallet, OfflineSigner } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { PrivateKey } from '@injectivelabs/sdk-ts';
import { InjectiveDirectEthSecp256k1Wallet } from '@injectivelabs/sdk-ts/dist/esm/core/accounts/signers';
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/esm/core/stargate';
import { CosmosExtensionOptions, CosmosPayloadType, CosmosWalletType } from './type';

const WALLET_TYPE = 'COSMOS';

export default class CosmosBridge {
  lcdApi: string;
  chain: string | undefined;

  constructor(rpcUrl: string, chainId: number, options: CosmosExtensionOptions) {
    this.lcdApi = rpcUrl;
    this.chain = options?.chain;
  }

  sendTokens = async (payload: CosmosPayloadType, mnemonic: string): Promise<any> => {
    const { address } = await this.getWalletAddress(mnemonic);
    const client = await this.createClient(mnemonic);
    const { recipientAddress, transferAmount, denom, memo } = payload.params;
    return client.sendTokens(
      address,
      recipientAddress,
      [{ denom, amount: transferAmount }],
      {
        amount: [{ denom: 'uatom', amount: '500' }],
        gas: '200000',
      },
      memo || '',
    );
  };

  signAndBroadcast = async (payload: CosmosPayloadType, mnemonic: string): Promise<any> => {
    const { address } = await this.getWalletAddress(mnemonic);
    const client = await this.createClient(mnemonic);
    const { message, fee } = payload.params;
    return client.signAndBroadcast(address, message, fee);
  };

  sign = async (payload: CosmosPayloadType, mnemonic: string): Promise<any> => {
    const { address } = await this.getWalletAddress(mnemonic);
    const client = await this.createClient(mnemonic);
    const { message, fee } = payload.params;
    return client.sign(address, message, fee, '');
  };

  createClient = async (mnemonic: string) => {
    return this.chain === 'inj' ? this.injectiveClient(mnemonic) : this.cosmosClient(mnemonic);
  };

  cosmosClient = async (mnemonic: string) => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
    return SigningStargateClient.connectWithSigner(this.lcdApi, wallet);
  };

  injectiveClient = async (mnemonic: string) => {
    const privateKeyHex = PrivateKey.fromMnemonic(mnemonic).toPrivateKeyHex();
    const privateKeyHexWithoutPrefix = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
    const privateKeyBuffer = Buffer.from(privateKeyHexWithoutPrefix, 'hex');
    const wallet = (await InjectiveDirectEthSecp256k1Wallet.fromKey(privateKeyBuffer)) as OfflineSigner;
    const client = await InjectiveSigningStargateClient.connectWithSigner(this.lcdApi, wallet);
    return client;
  };

  changeAddress = async (payload: CosmosPayloadType, mnemonic: string) => {
    const { prefix } = payload.params;
    if (prefix === 'inj') {
      const privateKey = PrivateKey.fromMnemonic(mnemonic);
      return privateKey.toAddress().bech32Address;
    }
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
    const [{ address }] = await wallet.getAccounts();
    return address;
  };

  getWalletAddress = async (mnemonic: string): Promise<{ address: string}> => {
    if (this.chain == 'inj') {
      const address = PrivateKey.fromMnemonic(mnemonic).toAddress().bech32Address;
      return { address };
    }
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
    const [{ address }] = await wallet.getAccounts();
    return { address }
  }

  createWallet = async (): Promise<CosmosWalletType> => {
    const wallet = await DirectSecp256k1HdWallet.generate();
    let [{ address }] = await wallet.getAccounts();

    if (this.chain) {
      address = await this.changeAddress({ id: 1, method: '', params: { prefix: this.chain } }, wallet.mnemonic);
    }

    return {
      address,
      privateKey: wallet.mnemonic,
      walletType: WALLET_TYPE,
    };
  };
}
