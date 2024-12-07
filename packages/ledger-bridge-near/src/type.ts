export interface NearPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface NearWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
