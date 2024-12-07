export interface CeloPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface CeloWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
