import { ChainId, Pact } from "@kadena/client";

export function getBalancePact(address: string, chainId: ChainId) {
  return Pact.builder
  .execution((Pact.modules as any).coin["get-balance"](address))
  .setMeta({ chainId })
  .createTransaction();
}
