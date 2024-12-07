import { getBalanceCadence } from "../cadence";
import * as fcl from "@onflow/fcl";
import {getTokenContractAddress} from "./crypto";

export const getFlowBalance = async (address, rpcUrl, network) => {
    fcl.config().put("accessNode.api", rpcUrl);
    const tokenContractAddress = getTokenContractAddress(network)

    const args = (arg, t) => [arg(address, t.Address)];
    return await fcl.query({
        cadence: getBalanceCadence(
            tokenContractAddress.FlowStorageFeesAddress,
            tokenContractAddress.FlowServiceAccountAddress,
            network
        ),
        args,
    });
};
