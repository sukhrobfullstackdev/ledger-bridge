import { SolanaPayloadType, SolanaWalletType } from "./type";
import * as web3 from "@solana/web3.js";
import {
  Connection,
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import * as bip39 from "bip39";
import nacl from "tweetnacl";

const WALLET_TYPE = "SOLANA";

export default class SolanaBridge {
  rpcUrl: string;

  constructor(rpcUrl: string, chainId: number) {
    this.rpcUrl = rpcUrl;
  }

  sendTransaction = async (
    payload: SolanaPayloadType,
    privateKey: string
  ): Promise<string> => {
    const connection = new web3.Connection(this.rpcUrl);
    const account = await this.createAccountFromMnemonic(privateKey);

    let { instructions, options } = payload.params;

    const transaction = new web3.Transaction();

    instructions.map((instruction: any) => {
      transaction.add(instruction);
    });

    return await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [account],
      options
    );
  };

  signTransaction = async (payload: SolanaPayloadType, privateKey: string) => {
    const { type, serialized, serializeConfig } = payload.params;

    if (type === "legacy") {
      const transaction = Transaction.from(serialized);
      const account = await this.createAccountFromMnemonic(privateKey);

      transaction.sign(account);

      return {
        rawTransaction: transaction.serialize(serializeConfig),
        signature: transaction.signatures,
      };
    } else if (type === 0) {
      const transaction = VersionedTransaction.deserialize(serialized);
      const account = await this.createAccountFromMnemonic(privateKey);

      transaction.sign([account]);

      return {
        rawTransaction: transaction.serialize(),
        signature: transaction.signatures,
      };
    } else {
      // Compatibility with old version
      const { instructions, recentBlockhash, feePayer, serializeConfig } =
        payload.params;
      const account = await this.createAccountFromMnemonic(privateKey);

      const connection = new Connection(this.rpcUrl);

      const transaction = new Transaction({
        feePayer: new web3.PublicKey(feePayer),
        recentBlockhash:
          recentBlockhash || (await connection.getRecentBlockhash()).blockhash,
      });

      const instructionsMagic = instructions.map((i: any) => {
        return {
          ...i,
          keys: i.keys.map((k: any) => {
            return { ...k, pubkey: new web3.PublicKey(k.pubkey) };
          }),
        };
      });

      instructionsMagic.map((instruction: any) => {
        transaction.add(instruction);
      });

      transaction.sign(account);

      return {
        rawTransaction: transaction.serialize(serializeConfig),
        signature: transaction.signatures,
      };
    }
  };

  partialSignTransaction = async (payload: SolanaPayloadType, privateKey: string) => {
    const { type, serialized, serializeConfig } = payload.params;

    if (type === "legacy") {
      const transaction = Transaction.from(serialized);
      const account = await this.createAccountFromMnemonic(privateKey);

      transaction.partialSign(account);

      return {
        rawTransaction: transaction.serialize(serializeConfig),
        signature: transaction.signatures,
      };
    }
    
    const transaction = VersionedTransaction.deserialize(serialized);
    const account = await this.createAccountFromMnemonic(privateKey);

    transaction.sign([account]);

    return {
      rawTransaction: transaction.serialize(),
      signature: transaction.signatures,
    };
  };

  signMessage = async (payload: SolanaPayloadType, privateKey: string) => {
    const account = await this.createAccountFromMnemonic(privateKey);
    const message = payload.params.message;

    if (typeof message === 'string') {
      const encoded = new TextEncoder().encode(message);
      return nacl.sign.detached(encoded, account.secretKey);
    } else if (message instanceof Uint8Array) {
      return nacl.sign.detached(message, account.secretKey);
    } else {
      throw new Error('Invalid message type')
    }
  };

  convertMnemonicToRawPrivateKey = async (
    payload: SolanaPayloadType,
    privateKey: string
  ) => {
    const seed = await bip39.mnemonicToSeed(privateKey);
    const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
    const accounts = new web3.Keypair(keyPair);
    const secretKey = accounts.secretKey;
    return Buffer.from(secretKey).toString("hex");
  };

  createWallet = async (): Promise<SolanaWalletType> => {
    const mnemonic = bip39.generateMnemonic();
    const account = await this.createAccountFromMnemonic(mnemonic);

    return {
      address: account.publicKey.toBase58(),
      privateKey: mnemonic, // store mnemonic instead of private key
      walletType: WALLET_TYPE,
    };
  };

  createAccountFromMnemonic = async (mnemonic: string) => {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
    return new Keypair(keyPair);
  };
}
