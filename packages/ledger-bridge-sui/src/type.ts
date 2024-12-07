export interface SuiPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface SuiWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}

export type SuiNetwork = "mainnet" | "testnet" | "devnet";