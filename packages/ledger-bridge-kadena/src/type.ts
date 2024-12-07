export interface KadenaOptions {
  networkId: string;
  createAccountsOnChain: boolean;
}

export interface GetBalanceParams {
  params: {
    address: string;
  };
}

export interface KadenaSignTransactionPayload {
  id: number;
  method: string;
  params: [{ hash: string }];
}

export interface KadenaBaseSignatureResponse {
  sig: string;
  pubKey: string;
}

interface IUnsignedCommand {
  hash: string;
  cmd: string;
  sigs: [undefined];
}

export interface KadenaSignTransactionWithSpireKeyPayloadType {
  id: number;
  method: string;
  params: [{ transaction: IUnsignedCommand[] }];
}

interface Sig {
  sig: string;
  pubKey: string;
}

export interface KadenaSpireKeySignatureResponse {
  hash: string;
  cmd: string;
  sigs: Sig[];
}

export interface KadenaSeedWalletMutationResponse {
  data: {
    pubKey: string;
    sig: string;
  };
}

export interface KadenaWalletType {
  address: string;
  privateKey: string;
  walletType: string;
}
