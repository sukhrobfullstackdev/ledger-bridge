import {
  AccountCreateTransaction,
  Hbar,
  Mnemonic,
} from "@hashgraph/sdk";
import { InternalWallet } from './InternalWallet';
import { LocalProvider } from "./LocalProvider";

export async function createWallet(accountId: string, signFunction: any, network: string, publicKey: string) {
  const mnemonic = await Mnemonic.generate();
  const privateKey = await mnemonic.toEd25519PrivateKey();
  const newPublicKey = await privateKey.publicKey;

  const internalWallet = new InternalWallet(
    accountId,
    new LocalProvider(network),
    signFunction,
    publicKey,
  ) as any;

  let transaction = await new AccountCreateTransaction()
      .setInitialBalance(new Hbar(0))
      .setKey(newPublicKey)
      .freezeWithSigner(internalWallet);

  transaction = await transaction.signWithSigner(internalWallet);

  const response = await transaction.executeWithSigner(internalWallet);

  const receipt = await response.getReceiptWithSigner(internalWallet);

  return {
    accountId: receipt.accountId?.toString(),
    privateKey: mnemonic.toString()
  }
}
