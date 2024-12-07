import { signWithKey } from "./crypto";

import * as fcl from '@onflow/fcl';

const rightPaddedHexBuffer = (value, pad) => {
  return Buffer.from(value.padEnd(pad * 2, 0), "hex");
};

const USER_DOMAIN_TAG = rightPaddedHexBuffer(
  Buffer.from("FLOW-V0.0-user").toString("hex"),
  32
).toString("hex");

export const signUserMessage = async ({
  rpcUrl, 
  privateKey,
  message
}) => {
  fcl.config().put("accessNode.api", rpcUrl);

  return signWithKey(privateKey, USER_DOMAIN_TAG + message);
}
