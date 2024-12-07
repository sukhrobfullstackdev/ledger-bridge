export interface PayloadType {
    id: number;
    method: string;
    params: any;
}

export interface WalletType {
    address: string | undefined;
    privateKey: string;
    walletType: string;
}
