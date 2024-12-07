export interface HarmonyPayloadType {
    id: number | string;
    method: string;
    params: any;
}

export interface CreateWalletResultType {
    address: string;
    privateKey: string;
    walletType: string;
}

export interface SendTransactionResultType {
    transactionHash: string;
    receipt: any;
}
