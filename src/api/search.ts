/**
 * Search API operations
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type {
    FederationName,
    IndexName,
    SearchRequest,
    SearchResponse,
    SearchcraftConfig,
} from '../types/index.js';
import { validateLimit, validateOffset } from '../utils/validators.js';

/**
 * Search API class
 */
export class SearchApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Performs a search on a specific index.
   * @param indexName - The name of the index to search.
   * @param request - The search request parameters including query, filters, limit, and offset.
   * @returns A promise resolving to the search response containing hits and metadata.
   * @throws {ValidationError} When `limit` exceeds 200 or `offset` is negative.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   * @example
   * const results = await client.search.searchIndex('products', { query: 'laptop', limit: 10 });
   */
  async searchIndex<T = unknown>(
    indexName: IndexName,
    request: SearchRequest
  ): Promise<SearchResponse<T>> {
    // Validate pagination parameters
    if (request.limit !== undefined) {
      validateLimit(request.limit);
    }
    if (request.offset !== undefined) {
      validateOffset(request.offset);
    }

    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/${indexName}/search`;

    const response = await this.httpClient.request<SearchResponse<T>>(
      {
        method: 'POST',
        path,
        body: request,
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data;
  }

  /**
   * Performs a federated search across multiple indices grouped under a federation.
   * @param federationName - The name of the federation to search.
   * @param request - The search request parameters including query, filters, limit, and offset.
   * @returns A promise resolving to the search response containing hits and metadata.
   * @throws {ValidationError} When `limit` exceeds 200 or `offset` is negative.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified federation does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   * @example
   * const results = await client.search.searchFederation('global', { query: 'laptop', limit: 10 });
   */
  async searchFederation<T = unknown>(
    federationName: FederationName,
    request: SearchRequest
  ): Promise<SearchResponse<T>> {
    // Validate pagination parameters
    if (request.limit !== undefined) {
      validateLimit(request.limit);
    }
    if (request.offset !== undefined) {
      validateOffset(request.offset);
    }

    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/federation/${federationName}/search`;

    const response = await this.httpClient.request<SearchResponse<T>>(
      {
        method: 'POST',
        path,
        body: request,
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data;
  }
}
