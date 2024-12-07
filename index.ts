const LedgerBridge = async (LedgerName: string): Promise<any> => {

    const legerMap: {[index: string]:any} = {
        HarmonyBridge: await import('./Bridges/Harmony/index'),
        IconBridge: await import('./Bridges/Icon/index'),
        TezosBridge: await import('./Bridges/Tezos/index'),
        ZilliqaBridge: await import('./Bridges/Zilliqa/index'),
        PolkadotBridge: await import('./Bridges/Polkadot/index'),
        FlowBridge: await import('./Bridges/Flow/index'),
    };

    return legerMap[LedgerName];
};

export default LedgerBridge;
