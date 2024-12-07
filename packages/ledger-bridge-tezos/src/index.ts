import { TezosPayloadType, TezosWalletType } from './type';
import { KeyStoreUtils, SoftSigner } from 'conseiljs-softsigner';
import { TezosMessageUtils, TezosNodeWriter } from 'conseiljs';

const WALLET_TYPE = 'TEZOS';

export default class TezosBridge {
  tezosNode: string;

  constructor(rpcUrl: string, chainId: number) {
    this.tezosNode = rpcUrl;
  }

  sendTransaction = async (payload: TezosPayloadType, privateKey: string): Promise<any> => {
    const { to, amount, fee } = payload.params;

    const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(privateKey);
    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));

    return await TezosNodeWriter.sendTransactionOperation(this.tezosNode, signer, keyStore, to, amount, fee);
  };

  sendContractOrigination = async (payload: any, privateKey: string): Promise<any> => {
    const { storage, amount, delegate, fee, storage_limit, gas_limit, code, codeFormat } = payload.params;

    const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(privateKey);
    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));

    return await TezosNodeWriter.sendContractOriginationOperation(
      this.tezosNode,
      signer,
      keyStore,
      amount,
      delegate,
      fee,
      storage_limit,
      gas_limit,
      code,
      storage,
      codeFormat,
    );
  };

  sendContractInvocation = async (payload: any, privateKey: string): Promise<any> => {
    const { contract, amount, fee, storageLimit, gasLimit, entrypoint, parameters, parameterFormat } = payload.params;

    const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(privateKey);
    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));

    return await TezosNodeWriter.sendContractInvocationOperation(
      this.tezosNode,
      signer,
      keyStore,
      contract,
      amount,
      fee,
      storageLimit,
      gasLimit,
      entrypoint,
      parameters,
      parameterFormat,
    );
  };

  sendContractPingOperation = async (payload: any, privateKey: string): Promise<any> => {
    const { contract, fee, storageLimit, gasLimit, entrypoint } = payload.params;

    const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(privateKey);
    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));

    return await TezosNodeWriter.sendContractPing(
      this.tezosNode,
      signer,
      keyStore,
      contract,
      fee,
      storageLimit,
      gasLimit,
      entrypoint,
    );
  };

  sendDelegation = async (payload: any, privateKey: string): Promise<any> => {
    const { fee, delegate, derivationPath = '' } = payload.params;

    const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(privateKey);
    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));

    return await TezosNodeWriter.sendDelegationOperation(this.tezosNode, signer, keyStore, delegate, fee);
  };

  createWallet = async (): Promise<TezosWalletType> => {
    const mnemonic = KeyStoreUtils.generateMnemonic();
    const wallet = await KeyStoreUtils.restoreIdentityFromMnemonic(mnemonic, '');
    
    return {
      address: wallet.publicKeyHash,
      privateKey: wallet.secretKey,
      walletType: WALLET_TYPE,
    };
  };
}
