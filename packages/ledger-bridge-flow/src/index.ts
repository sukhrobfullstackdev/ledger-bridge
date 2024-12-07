import { FlowPayloadType } from './type';
import { createAccount } from './libs/createAccount';
import { signWithKey } from './libs/crypto';
import { getFlowBalance } from './libs/getBalance';
import { getFlowUsdcBalance } from './libs/getUsdcBalance';
import { sendFlow } from './libs/sendFlowToken';
import { authorizationSendFlow } from './libs/authorizationSendFlow';
import { signUserMessage } from './libs/signUserMessage';

const WALLET_TYPE = 'FLOW';

export default class FlowBridge {
  rpcUrl: string;
  sendFlow: any;

  constructor(rpcUrl: string, chainId: number, options: any) {
    this.rpcUrl = rpcUrl;
    this.sendFlow = sendFlow;
  }

  signTransaction = (payload: FlowPayloadType, privateKey: string) => {
    const { message } = payload.params;

    return signWithKey(privateKey, message);
  };

  signMessage = (payload: FlowPayloadType, privateKey: string) => {
    const { message } = payload.params;

    return signUserMessage({
      rpcUrl: this.rpcUrl,
      privateKey,
      message,
    })
  }

  getBalance = async (payload: FlowPayloadType, privateKey: string) => {
    const { address, network } = payload.params;

    return await getFlowBalance(address, this.rpcUrl, network);
  };

  getUsdcBalance = async (payload: FlowPayloadType) => {
    const { address, network } = payload.params;
    return await getFlowUsdcBalance(address, this.rpcUrl, network);
  };

  composeSendFlow = async (payload: FlowPayloadType, privateKey: string) => {
    const { recipient, amount, address, network } = payload.params;
    const authorization = (account: any) => authorizationSendFlow(account, privateKey, this.rpcUrl, address);

    return sendFlow(recipient, amount, authorization, this.rpcUrl, network);
  };

  createWallet = async (flowSeedWallet: any, address: string, network: string) => {
    try {
      const wallet = await createAccount(flowSeedWallet, this.rpcUrl, network);

      return {
        address: wallet.addr,
        privateKey: wallet.privateKey,
        walletType: WALLET_TYPE,
      };
    } catch (e) {
      throw e;
    }
  };
}
