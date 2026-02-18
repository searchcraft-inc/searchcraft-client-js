/**
 * Stopwords management API operations
 *
 * Stopwords are common words filtered out of search queries (e.g., "the", "a", "is").
 * Searchcraft supports language-specific stopword dictionaries.
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type { IndexName, SearchcraftConfig, StopwordOperationResponse } from '../types/index.js';

/**
 * Stopwords API class
 */
export class StopwordsApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Gets all stopwords for an index
   * Uses GET /index/:index/stopwords
   * Returns an array of stopword strings
   */
  async get(indexName: IndexName): Promise<string[]> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/${indexName}/stopwords`;

    const response = await this.httpClient.request<string[]>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Adds stopwords to an index
   * Uses POST /index/:index/stopwords
   * @param stopwords - Array of stopword strings to add
   */
  async add(indexName: IndexName, stopwords: string[]): Promise<StopwordOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/stopwords`;

    const response = await this.httpClient.request<StopwordOperationResponse>(
      { method: 'POST', path, body: stopwords, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Deletes specific stopwords from an index
   * Uses DELETE /index/:index/stopwords
   * @param stopwords - Array of stopword strings to remove
   */
  async delete(indexName: IndexName, stopwords: string[]): Promise<StopwordOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/stopwords`;

    const response = await this.httpClient.request<StopwordOperationResponse>(
      { method: 'DELETE', path, body: stopwords, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Deletes all stopwords from an index
   * Uses DELETE /index/:index/stopwords/all
   */
  async deleteAll(indexName: IndexName): Promise<StopwordOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/stopwords/all`;

    const response = await this.httpClient.request<StopwordOperationResponse>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }
}
