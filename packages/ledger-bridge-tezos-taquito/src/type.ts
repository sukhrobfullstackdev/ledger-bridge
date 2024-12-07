export interface TaquitoPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface TaquitoWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
