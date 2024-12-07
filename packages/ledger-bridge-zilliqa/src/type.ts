export interface ZilliqaPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface ZilliqaWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
