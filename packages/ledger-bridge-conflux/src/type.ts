export interface ConfluxPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface ConfluxWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}

export interface ConfluxExtensionOptions {
    rpcUrl: string,
    networkId: number,
}
