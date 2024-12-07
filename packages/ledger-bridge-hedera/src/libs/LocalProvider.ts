import {
  Client,
  AccountBalanceQuery,
  AccountInfoQuery,
  AccountRecordsQuery,
  TransactionReceiptQuery,
  AccountId,
  TransactionId,
  TransactionResponse,
} from "@hashgraph/sdk";

export class LocalProvider {

  _client: any;

  constructor(hedera_network: string) {
    if (!hedera_network) {
      throw new Error(
        "LocalProvider requires the `HEDERA_NETWORK` environment variable to be set"
      );
    }

    this._client = Client.forName(hedera_network);
  }

  /**
   * @returns {LedgerId?}
   */
  getLedgerId() {
    return this._client.ledgerId;
  }

  /**
   * @returns {{[key: string]: (string | AccountId)}}
   */
  getNetwork() {
    return this._client.network;
  }

  /**
   * @returns {string[]}
   */
  getMirrorNetwork() {
    return this._client.mirrorNetwork;
  }

  /**
   * @param {AccountId | string} accountId
   * @returns {Promise<AccountBalance>}
   */
  getAccountBalance(accountId: string | AccountId) {
    return new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(this._client);
  }

  /**
   * @param {AccountId | string} accountId
   * @returns {Promise<AccountInfo>}
   */
  getAccountInfo(accountId: string | AccountId) {
    return new AccountInfoQuery()
      .setAccountId(accountId)
      .execute(this._client);
  }

  /**
   * @param {AccountId | string} accountId
   * @returns {Promise<TransactionRecord[]>}
   */
  getAccountRecords(accountId: string | AccountId) {
    return new AccountRecordsQuery()
      .setAccountId(accountId)
      .execute(this._client);
  }

  /**
   * @param {TransactionId | string} transactionId
   * @returns {Promise<TransactionReceipt>}
   */
  getTransactionReceipt(transactionId: TransactionId | string) {
    return new TransactionReceiptQuery()
      .setTransactionId(transactionId)
      .execute(this._client);
  }

  /**
   * @param {TransactionResponse} response
   * @returns {Promise<TransactionReceipt>}
   */
  waitForReceipt(response: TransactionResponse) {
    return new TransactionReceiptQuery()
      .setNodeAccountIds([response.nodeId])
      .setTransactionId(response.transactionId)
      .execute(this._client);
  }

  /**
   * @template RequestT
   * @template ResponseT
   * @template OutputT
   * @param {Executable<RequestT, ResponseT, OutputT>} request
   * @returns {Promise<OutputT>}
   */
  call(request: any) {
    return request.execute(this._client);
  }
}
