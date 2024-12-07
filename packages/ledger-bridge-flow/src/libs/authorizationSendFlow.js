import * as fcl from "@onflow/fcl";
import { signWithKey } from "./crypto";


export const authorizationSendFlow = async (account = {}, privateKey, rpcUrl, addr) => {
    fcl.config().put("accessNode.api", rpcUrl);
    let keyId = 0;

    let sequenceNum;
    if (account.role.proposer) {
        const response = await fcl.send([fcl.getAccount(addr)]);
        const acct = await fcl.decode(response);

        sequenceNum = acct.keys[keyId].sequenceNumber;
    }

    const signingFunction = async data => {

        return {
            addr,
            keyId,
            signature: signWithKey(privateKey, data.message)
        };
    };

    return {
        ...account,
        addr,
        keyId,
        signingFunction,
        sequenceNum
    };
};
