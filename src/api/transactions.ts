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
   * Commits a write transaction for the given index
   * Uses POST /index/:index/commit
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
   * Rolls back a write transaction for the given index
   * Uses POST /index/:index/rollback
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

