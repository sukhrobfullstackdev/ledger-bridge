export interface AvalanchePayloadType {
    id: number;
    method: string;
    params: any;
}

export interface AvalancheWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}

export interface ExtensionOptions {
    chainId: string;
    networkId: number;
}
