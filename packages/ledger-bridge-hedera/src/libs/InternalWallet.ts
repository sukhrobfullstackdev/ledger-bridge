import {
  AccountId,
  SignerSignature,
  AccountBalanceQuery,
  AccountInfoQuery,
  AccountRecordsQuery,
  TransactionId,
  Transaction,
  PublicKey,
} from "@hashgraph/sdk";

import * as utils from './utils'

/**
 * @implements {Signer}
 */
export class InternalWallet {

  publicKey: any;
  accountId: AccountId;
  provider: any;
  signer: any;

  /**
   * @param {AccountId | string} accountId
   * @param {Provider=} provider
   * @param {function} signFunction
   * @param {String} publicKey
   * @param {function} signer
   */
  constructor(accountId: AccountId | string, provider: any, signFunction: any, publicKey: string, signer?: any) {

    this.publicKey = PublicKey.fromString(publicKey);

    /**
     * @param {Uint8Array} message
     * @returns {Promise<Uint8Array>}
     */
    async function signMessage (message: Uint8Array) {
      const signedMessage = (await signFunction(utils.encode(message))).data.signature;

      return utils.decode(signedMessage)
    }

    /**
     * @type {(messasge: Uint8Array) => Promise<Uint8Array>}
     */
    this.signer = signMessage;
    this.provider = provider;
    this.accountId =
      typeof accountId === "string"
        ? AccountId.fromString(accountId)
        : accountId;
  }

  /**
   * @returns {Provider=}
   */
  getProvider() {
    return this.provider;
  }

  /**
   * @abstract
   * @returns {AccountId}
   */
  getAccountId() {
    return this.accountId;
  }

  /**
   * @returns {Key}
   */
  getAccountKey() {
    return this.publicKey;
  }

  /**
   * @returns {LedgerId?}
   */
  getLedgerId() {
    return this.provider == null ? null : this.provider.getLedgerId();
  }

  /**
   * @abstract
   * @returns {{[key: string]: (string | AccountId)}}
   */
  getNetwork() {
    return this.provider == null ? {} : this.provider.getNetwork();
  }

  /**
   * @abstract
   * @returns {string[]}
   */
  getMirrorNetwork() {
    return this.provider == null ? [] : this.provider.getMirrorNetwork();
  }

  /**
   * @param {Uint8Array[]} messages
   * @returns {Promise<SignerSignature[]>}
   */
  async sign(messages: Uint8Array[]) {
    const sigantures = [];

    for (const message of messages) {
      sigantures.push(
        new SignerSignature({
          publicKey: this.publicKey,
          signature: await this.signer(message),
          accountId: this.accountId,
        })
      );
    }

    return sigantures;
  }

  /**
   * @returns {Promise<AccountBalance>}
   */
  getAccountBalance() {
    return this.call(
      new AccountBalanceQuery().setAccountId(this.accountId)
    );
  }

  /**
   * @abstract
   * @returns {Promise<AccountInfo>}
   */
  getAccountInfo() {
    return this.call(new AccountInfoQuery().setAccountId(this.accountId));
  }

  /**
   * @abstract
   * @returns {Promise<TransactionRecord[]>}
   */
  getAccountRecords() {
    return this.call(
      new AccountRecordsQuery().setAccountId(this.accountId)
    );
  }

  /**
   * @template {Transaction} T
   * @param {T} transaction
   * @returns {Promise<T>}
   */
  signTransaction(transaction: Transaction) {
    return transaction.signWith(this.publicKey, this.signer);
  }

  /**
   * @template {Transaction} T
   * @param {T} transaction
   * @returns {Promise<T>}
   */
  checkTransaction(transaction: Transaction) {
    const transactionId = transaction.transactionId;
    if (
      transactionId != null &&
      transactionId.accountId != null &&
      transactionId.accountId.compare(this.accountId) != 0
    ) {
      throw new Error(
        "transaction's ID constructed with a different account ID"
      );
    }

    if (this.provider == null) {
      return Promise.resolve(transaction);
    }

    const nodeAccountIds = (
      transaction.nodeAccountIds != null ? transaction.nodeAccountIds : []
    ).map((nodeAccountId) => nodeAccountId.toString());
    const network = Object.values(this.provider.getNetwork()).map(
      (nodeAccountId: any) => nodeAccountId.toString()
    );

    if (
      !nodeAccountIds.reduce(
        (previous, current) => previous && network.includes(current),
        true
      )
    ) {
      throw new Error(
        "Transaction already set node account IDs to values not within the current network"
      );
    }

    return Promise.resolve(transaction);
  }

  /**
   * @template {Transaction} T
   * @param {T} transaction
   * @returns {Promise<T>}
   */
  populateTransaction(transaction: Transaction) {
    transaction._freezeWithAccountId(this.accountId);

    if (transaction.transactionId == null) {
      transaction.setTransactionId(
        TransactionId.generate(this.accountId)
      );
    }

    if (
      transaction.nodeAccountIds != null &&
      transaction.nodeAccountIds.length != 0
    ) {
      return Promise.resolve(transaction.freeze());
    }

    if (this.provider == null) {
      return Promise.resolve(transaction);
    }

    const nodeAccountIds = Object.values(this.provider.getNetwork()).map(
      (id) => (typeof id === "string" ? AccountId.fromString(id) : id)
    ) as any;
    utils.shuffle(nodeAccountIds);
    transaction.setNodeAccountIds(
      nodeAccountIds.slice(0, (nodeAccountIds.length + 3 - 1) / 3)
    );

    return Promise.resolve(transaction.freeze());
  }

  /**
   * @template RequestT
   * @template ResponseT
   * @template OutputT
   * @param {Executable<RequestT, ResponseT, OutputT>} request
   * @returns {Promise<OutputT>}
   */
  call(request: any) {
    if (this.provider == null) {
      throw new Error(
        "cannot send request with an wallet that doesn't contain a provider"
      );
    }

    return this.provider.call(
      request._setOperatorWith(
        this.accountId,
        this.publicKey,
        this.signer
      )
    );
  }
}
