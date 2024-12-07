import { addSignatures, ChainId, createClient, Pact } from "@kadena/client";
import { registerAccountOnChain } from "./lib/register-account-on-chain";
import {
  GetBalanceParams,
  KadenaBaseSignatureResponse,
  KadenaOptions,
  KadenaSeedWalletMutationResponse,
  KadenaSignTransactionPayload,
  KadenaSignTransactionWithSpireKeyPayloadType,
  KadenaSpireKeySignatureResponse,
  KadenaWalletType,
} from "./type";
import {
  kadenaGenMnemonic,
  kadenaMnemonicToSeed,
  kadenaGenKeypairFromSeed,
  kadenaSignWithSeed,
} from "@kadena/hd-wallet";
import { getBalancePact } from "./pact/get-balance";
import {
  connect,
  ConnectedAccount,
  sign,
  SignedTransactions,
} from "@kadena/spirekey-sdk";

const WALLET_TYPE = "KADENA";

export default class KadenaBridge {
  rpcUrl: string;
  chainId: ChainId;
  networkId: string;
  createAccountsOnChain: boolean;

  constructor(rpcUrl: string, chainId: ChainId, options: KadenaOptions) {
    this.rpcUrl = rpcUrl;
    this.chainId = chainId;
    this.networkId = options.networkId;
    this.createAccountsOnChain = options.createAccountsOnChain;
  }

  // Function is not user facing
  // It is here to query balance of our seeder wallet address after signup
  getBalance = async ({ params }: GetBalanceParams): Promise<number> => {
    const kadenaClient = createClient(this.rpcUrl);
    const query = getBalancePact(params.address, this.chainId);
    const res = await kadenaClient.local(query, { preflight: false });
    if (res.result.status === "failure") {
      console.error(
        `Failed to get balance: ${(res.result.error as any).message}`
      );
      return 0;
    }
    return (res.result as any).data as number;
  };

  signTransaction = async (
    payload: KadenaSignTransactionPayload,
    privateKey: string
  ): Promise<KadenaBaseSignatureResponse> => {
    const { hash } = payload.params[0];
    const seed = await kadenaMnemonicToSeed("", privateKey);
    const signer = await kadenaSignWithSeed("", seed, 0);
    return signer(hash);
  };

  signTransactionWithSpireKey = (
    payload: KadenaSignTransactionWithSpireKeyPayloadType
  ): Promise<SignedTransactions> => {
    const { transaction } = payload.params[0];
    return sign(transaction);
  };

  signSpireKeyLogin = async (
    account: ConnectedAccount
  ): Promise<KadenaSpireKeySignatureResponse> => {
    const senderAccountName = account.accountName;
    const pubKey = account.devices[0].guard.keys[0];

    const transaction = Pact.builder
      .execution(
        `(enforce-guard (at 'guard (coin.details "${senderAccountName}")))`
      )
      .addSigner({
        pubKey: pubKey,
        scheme: "WebAuthn",
      })
      .setMeta({ chainId: this.chainId, senderAccount: senderAccountName })
      .setNetworkId(this.networkId)
      .createTransaction();

    const signature = await sign(transaction, [account]);
    return addSignatures(transaction, ...signature.transactions[0].sigs);
  };

  createWallet = async (
    createAccountMutation: (
      hash: string
    ) => Promise<KadenaSeedWalletMutationResponse>,
    payerPublicKey: string
  ): Promise<KadenaWalletType> => {
    const mnemonic = kadenaGenMnemonic();
    const seed = await kadenaMnemonicToSeed("", mnemonic);
    const [userPublicKey] = await kadenaGenKeypairFromSeed("", seed, 0);

    if (this.createAccountsOnChain) {
      try {
        await registerAccountOnChain(
          createAccountMutation,
          payerPublicKey,
          userPublicKey,
          this.chainId,
          this.networkId,
          this.rpcUrl
        );
      } catch (error) {
        console.error("Failed to create account on chain", error);
      }
    }

    return {
      address: `k:${userPublicKey}`,
      privateKey: mnemonic,
      walletType: WALLET_TYPE,
    };
  };

  createSpireKeyWallet = (): Promise<ConnectedAccount> => {
    return connect(this.networkId, this.chainId);
  };
}
