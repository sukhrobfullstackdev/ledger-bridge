export interface PayloadType {
    id: number;
    method: string;
    params: any;
}

export interface WalletType {
    address: string;
    privateKey: string;
    walletType: string;
}

export interface ExtensionOptions {
    chainId: string;
    networkId: number;
}
