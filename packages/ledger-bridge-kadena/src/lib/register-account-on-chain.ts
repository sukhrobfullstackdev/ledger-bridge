import { createClient, ChainId, addSignatures } from "@kadena/client";
import { KadenaSeedWalletMutationResponse } from "../type";
import { buildAccountCreationTransaction } from "../pact/create-account-pact";

export async function registerAccountOnChain(
  createAccountMutation: (hash: string) => Promise<KadenaSeedWalletMutationResponse>,
  payerPublicKey: string,
  userPublicKey: string,
  chainId: ChainId,
  networkId: string,
  rpcUrl: string,
) {
  const transaction = await buildAccountCreationTransaction(
    payerPublicKey,
    userPublicKey,
    chainId,
    networkId
  );
  const { data: signature } = await createAccountMutation(transaction.hash);
  const signedTransaction = addSignatures(transaction, signature);
  const client = createClient(rpcUrl);
  const transactionDescriptor = await client.submit(signedTransaction);
  const response = await client.listen(transactionDescriptor);

  if (response.result.status === 'failure') {
    console.error(response.result.error);
    throw new Error(`Failed to create account: ${response.result.error}`);
  }
}
