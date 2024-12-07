import { getUsdcBalanceCadence } from "../cadence";
import * as fcl from "@onflow/fcl";
import {getTokenContractAddress} from "./crypto";

export const getFlowUsdcBalance = async (address, rpcUrl, network) => {
    fcl.config().put("accessNode.api", rpcUrl);
    const tokenContractAddress = getTokenContractAddress(network)
    const args = (arg, t) => [arg(address, t.Address)];
    return await fcl.query({
        cadence: getUsdcBalanceCadence(
            tokenContractAddress.FungibleTokenAddress,
            tokenContractAddress.FiatTokenAddress,
            network
        ),
        args,
    });
};
