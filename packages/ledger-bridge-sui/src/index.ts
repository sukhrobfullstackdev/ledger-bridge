
import * as bip39 from "bip39";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiNetwork, SuiPayloadType, SuiWalletType } from "./type";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const WALLET_TYPE = "SUI";

export default class SuiBridge {
  rpcUrl: SuiNetwork;

  constructor(rpcUrl: SuiNetwork) {
    this.rpcUrl = rpcUrl;
  }

  signAndSendTransaction = async (payload: SuiPayloadType, privateKey: string) => {
    const keypair = this.createAccountFromMnemonic(privateKey);
    const url = getFullnodeUrl(this.rpcUrl);
    const client = new SuiClient({ url });

    // Reconstruct the serialized transaction block
    payload.params.transactionBlock = TransactionBlock.from(payload.params.transactionBlock);

    return client.signAndExecuteTransactionBlock({
      ...payload.params,
      signer: keypair,
    });
  };

  createWallet = (): SuiWalletType => {
    const mnemonic = bip39.generateMnemonic();
    const account = this.createAccountFromMnemonic(mnemonic);

    return {
      address: account.toSuiAddress(),
      privateKey: mnemonic, // store mnemonic instead of private key
      walletType: WALLET_TYPE,
    };
  };

  createAccountFromMnemonic = (mnemonic: string): Ed25519Keypair => {
    return Ed25519Keypair.deriveKeypair(mnemonic);
  };
}