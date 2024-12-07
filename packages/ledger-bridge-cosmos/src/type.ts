export interface CosmosPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface CosmosExtensionOptions {
    chain?: string;
}

export interface CosmosWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
