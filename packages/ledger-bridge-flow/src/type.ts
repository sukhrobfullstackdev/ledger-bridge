export interface FlowPayloadType {
    id: number;
    method: string;
    params: any;
}

export interface FlowWalletType {
    address: string;
    privateKey: string;
    walletType: string;
}
