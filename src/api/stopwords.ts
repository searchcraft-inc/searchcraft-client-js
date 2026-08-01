/**
 * Stopwords management API operations
 *
 * Stopwords are common words filtered out of search queries (e.g., "the", "a", "is").
 * Searchcraft supports language-specific stopword dictionaries.
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import { unwrapData } from '../core/http.js';
import type {
  ApiResponse,
  IndexName,
  SearchcraftConfig,
  StopwordOperationResponse,
} from '../types/index.js';

/**
 * Stopwords API class
 */
export class StopwordsApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Gets all stopwords for an index.
   * Uses GET /index/:index/stopwords
   * @param indexName - The name of the index to retrieve stopwords for.
   * @returns A promise resolving to an array of stopword strings.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async get(indexName: IndexName): Promise<string[]> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/${indexName}/stopwords`;

    const response = await this.httpClient.request<ApiResponse<string[]>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Gets the engine's built-in stopword list for the index's language.
   * Uses GET /index/:index/stopwords/default
   * These are the defaults the index starts from, distinct from the
   * customized list returned by {@link get}.
   * @param indexName - The name of the index.
   * @returns A promise resolving to the default stopwords for the index language.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async getDefaults(indexName: IndexName): Promise<string[]> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/${indexName}/stopwords/default`;

    const response = await this.httpClient.request<ApiResponse<string[]>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Adds stopwords to an index.
   * Uses POST /index/:index/stopwords
   * @param indexName - The name of the index to add stopwords to.
   * @param stopwords - Array of stopword strings to add.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async add(indexName: IndexName, stopwords: string[]): Promise<StopwordOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/stopwords`;

    const response = await this.httpClient.request<ApiResponse<StopwordOperationResponse>>(
      { method: 'POST', path, body: stopwords, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Deletes specific stopwords from an index.
   * Uses DELETE /index/:index/stopwords
   * @param indexName - The name of the index to remove stopwords from.
   * @param stopwords - Array of stopword strings to remove.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async delete(indexName: IndexName, stopwords: string[]): Promise<StopwordOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/stopwords`;

    const response = await this.httpClient.request<ApiResponse<StopwordOperationResponse>>(
      { method: 'DELETE', path, body: stopwords, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Deletes all stopwords from an index.
   * Uses DELETE /index/:index/stopwords/all
   * @param indexName - The name of the index to clear all stopwords from.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async deleteAll(indexName: IndexName): Promise<StopwordOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/stopwords/all`;

    const response = await this.httpClient.request<ApiResponse<StopwordOperationResponse>>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }
}
