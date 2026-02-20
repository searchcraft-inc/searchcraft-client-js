/**
 * Transaction management API operations
 *
 * Transactions group write operations into a single atomic operation.
 * If your index has auto_commit_delay enabled you may not need to use these directly.
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type { IndexName, SearchcraftConfig } from '../types/index.js';

/**
 * Response returned by transaction commit/rollback operations
 */
export type TransactionOperationResponse = string;

/**
 * Transaction API class
 */
export class TransactionApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Commits a write transaction for the given index.
   * Uses POST /index/:index/commit
   * @param indexName - The name of the index whose pending transaction should be committed.
   * @returns A promise resolving to a confirmation message string.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async commit(indexName: IndexName): Promise<TransactionOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/commit`;

    const response = await this.httpClient.request<TransactionOperationResponse>(
      { method: 'POST', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Rolls back a write transaction for the given index.
   * Uses POST /index/:index/rollback
   * @param indexName - The name of the index whose pending transaction should be rolled back.
   * @returns A promise resolving to a confirmation message string.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async rollback(indexName: IndexName): Promise<TransactionOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/rollback`;

    const response = await this.httpClient.request<TransactionOperationResponse>(
      { method: 'POST', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }
}
