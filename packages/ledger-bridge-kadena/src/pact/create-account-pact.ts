import { ChainId, Pact } from "@kadena/client";

export async function buildAccountCreationTransaction(payerPublicKey: string, userPublicKey: string, chainId: ChainId, networkId: string) {
  const payerAccount = `k:${payerPublicKey}`;
  const userAccount = `k:${userPublicKey}`;

  const unsignedTransaction = Pact.builder
    .execution(
      (Pact.modules as any).coin["create-account"](
        userAccount,
        () => '(read-keyset "receiverKeyset")',
      )
    )
    .addData("receiverKeyset", {
      keys: [userPublicKey],
      pred: "keys-all",
    })
    .addSigner(payerPublicKey, (withCapability) => [
      withCapability("coin.GAS"),
    ])
    .setMeta({ chainId, senderAccount: payerAccount })
    .setNetworkId(networkId)
    .createTransaction();

  return unsignedTransaction;
}
