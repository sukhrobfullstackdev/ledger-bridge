export interface TerraPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface TerraWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
