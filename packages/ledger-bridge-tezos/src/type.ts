export interface TezosPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface TezosWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
