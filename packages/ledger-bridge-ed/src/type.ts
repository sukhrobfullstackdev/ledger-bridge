export interface Ed25519PayloadType {
    id: number;
    method: string;
    params: any;
}

export interface Ed25519WalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
