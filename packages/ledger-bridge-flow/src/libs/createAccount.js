import {genKeys} from './crypto'
import * as fcl from "@onflow/fcl";

export const createAccount = async (flowSeedWallet, rpcUrl, network) => {
    fcl.config().put("accessNode.api", rpcUrl);
    const keys = await genKeys();

    const {transaction} = (await flowSeedWallet(keys.flowKey, network)).data;
    const {events} = await fcl.tx(transaction).onceSealed()
    const accountCreatedEvent = events.find(d => d.type === "flow.AccountCreated")
    let addr = accountCreatedEvent.data.address

    const {account} = await fcl.send([fcl.getAccount(addr)])
    const key = account.keys.find(d => d.publicKey === keys.publicKey);

    return {
        addr,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        keyId: key.index,
    }
};