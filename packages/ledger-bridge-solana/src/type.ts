export interface SolanaPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface SolanaWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}

export interface SignTransacionResult {
    rawTransaction: Buffer;
    signature?: Buffer | null;

}
