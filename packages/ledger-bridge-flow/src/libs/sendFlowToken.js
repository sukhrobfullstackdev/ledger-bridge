import { sendFlowCadence } from "../cadence";
import * as fcl from "@onflow/fcl";
import {getTokenContractAddress} from "./crypto";

export const sendFlow = async (recipient, amount, authorization, rpcUrl, network) => {
    fcl.config().put("accessNode.api", rpcUrl);

    const args = (arg, t) => [arg(amount, t.UFix64), arg(recipient, t.Address)];
    
    const limit = 500;

    const tokenContractAddress = getTokenContractAddress(network);

    const txId = await fcl.mutate({
        cadence: sendFlowCadence(
            tokenContractAddress.FlowTokenAddress, 
            tokenContractAddress.FungibleTokenAddress
        ),
        args,
        limit,
        proposer: authorization,
        authorizations: [authorization],
        payer: authorization
    });

    return await fcl.tx(txId).onceSealed();
};

