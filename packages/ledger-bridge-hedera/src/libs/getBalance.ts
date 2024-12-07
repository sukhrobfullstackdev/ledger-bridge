import {
  AccountBalanceQuery,
  HbarUnit,
} from "@hashgraph/sdk";
import { InternalWallet } from './InternalWallet';
import { LocalProvider } from "./LocalProvider";

export async function getBalance (accountId: string, signFunction: any, network: string, publicKey: string) {
  const balanceTransaction = await new AccountBalanceQuery()
    .setAccountId(accountId);

  const internalWallet = new InternalWallet(
    accountId,
    new LocalProvider(network),
    signFunction,
    publicKey,
  ) as any;

  const balance = await balanceTransaction.executeWithSigner(internalWallet);

  return balance.hbars.to(HbarUnit.Hbar).toString();
}