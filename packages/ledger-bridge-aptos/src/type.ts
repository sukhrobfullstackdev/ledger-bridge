export interface AptosPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface AptosWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
