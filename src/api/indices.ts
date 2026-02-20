/**
 * Index configuration management API operations
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type {
  AllIndexStatsResponse,
  ApiResponse,
  IndexConfig,
  IndexListResponse,
  IndexName,
  IndexOperationResponse,
  IndexStats,
  SearchcraftConfig,
} from '../types/index.js';

/**
 * Index configuration API class
 */
export class IndexApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Lists all index names.
   * Uses GET /index
   * @returns A promise resolving to the list of index names.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async list(): Promise<IndexListResponse> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index`;

    const response = await this.httpClient.request<ApiResponse<IndexListResponse>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data.data;
  }

  /**
   * Gets the configuration for a specific index.
   * Uses GET /index/:index
   * @param indexName - The name of the index to retrieve.
   * @returns A promise resolving to the index configuration.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async get(indexName: IndexName): Promise<IndexConfig> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/${indexName}`;

    const response = await this.httpClient.request<ApiResponse<IndexConfig>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data.data;
  }

  /**
   * Creates a new index with the given configuration.
   * Uses PUT /index/:index with body `{ index: { name, ...config } }`.
   * The `name` field is automatically populated from the `indexName` parameter.
   * @param indexName - The name of the new index.
   * @param indexConfig - The configuration for the new index.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async create(indexName: IndexName, indexConfig: IndexConfig): Promise<IndexOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}`;

    const response = await this.httpClient.request<ApiResponse<IndexOperationResponse>>(
      {
        method: 'PUT',
        path,
        body: { index: { name: indexName, ...indexConfig } },
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data.data;
  }

  /**
   * Updates an existing index with partial configuration changes.
   * Uses PATCH /index/:index with body `{ index: partialConfig }`.
   * @param indexName - The name of the index to update.
   * @param indexConfig - A partial configuration object with the fields to update.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async update(
    indexName: IndexName,
    indexConfig: Partial<IndexConfig>
  ): Promise<IndexOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}`;

    const response = await this.httpClient.request<ApiResponse<IndexOperationResponse>>(
      {
        method: 'PATCH',
        path,
        body: { index: indexConfig },
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data.data;
  }

  /**
   * Deletes an index.
   * Uses DELETE /index/:index
   * @param indexName - The name of the index to delete.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async delete(indexName: IndexName): Promise<IndexOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}`;

    const response = await this.httpClient.request<ApiResponse<IndexOperationResponse>>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data.data;
  }

  /**
   * Gets statistics for all indices.
   * Uses GET /index/stats
   * @returns A promise resolving to statistics for every index on the cluster.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async getStats(): Promise<AllIndexStatsResponse> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/stats`;

    const response = await this.httpClient.request<ApiResponse<AllIndexStatsResponse>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data.data;
  }

  /**
   * Gets statistics for a specific index.
   * Uses GET /index/:index_name/stats
   * @param indexName - The name of the index to retrieve statistics for.
   * @returns A promise resolving to the statistics for the specified index.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async getIndexStats(indexName: IndexName): Promise<IndexStats> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/${indexName}/stats`;

    const response = await this.httpClient.request<ApiResponse<IndexStats>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data.data;
  }
}
