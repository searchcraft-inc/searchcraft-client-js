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
   * Lists all index names
   * Uses GET /index
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
   * Gets the configuration for a specific index
   * Uses GET /index/:index
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
   * Creates a new index with the given configuration
   * Uses PUT /index/:index with body { index: { name, ...config } }
   * The name field is automatically populated from the indexName parameter
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
   * Updates an existing index with partial configuration changes
   * Uses PATCH /index/:index with body { index: partialConfig }
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
   * Deletes an index
   * Uses DELETE /index/:index
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
   * Gets statistics for all indices
   * Uses GET /index/stats
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
   * Gets statistics for a specific index
   * Uses GET /index/:index_name/stats
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
