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
   * Performs a search on a specific index
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
   * Performs a federated search across multiple indices
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
