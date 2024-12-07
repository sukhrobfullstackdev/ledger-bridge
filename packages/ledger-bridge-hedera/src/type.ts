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

export interface InternalAccount {
    accountId: string;
    publicKey: string;
}
