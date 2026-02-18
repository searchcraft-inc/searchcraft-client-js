/**
 * Synonyms management API operations
 *
 * Synonyms allow search queries to match related terms.
 * They are stored as a map and managed using the format "synonym:original-term".
 * Example: "nyc:new york city" means searching "nyc" will also match "new york city".
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type {
  IndexName,
  SearchcraftConfig,
  SynonymOperationResponse,
  SynonymsMap,
} from '../types/index.js';

/**
 * Synonyms API class
 */
export class SynonymsApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Gets all synonyms for an index
   * Uses GET /index/:index/synonyms
   * Returns a map of synonym key to list of terms
   */
  async get(indexName: IndexName): Promise<SynonymsMap> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/${indexName}/synonyms`;

    const response = await this.httpClient.request<SynonymsMap>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Adds synonyms to an index
   * Uses POST /index/:index/synonyms
   * @param synonyms - Array of synonym entries in "synonym:original-term" format
   *   Example: ["nyc:new york city", "usa:united states"]
   */
  async add(indexName: IndexName, synonyms: string[]): Promise<SynonymOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/synonyms`;

    const response = await this.httpClient.request<SynonymOperationResponse>(
      { method: 'POST', path, body: synonyms, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Deletes specific synonyms from an index
   * Uses DELETE /index/:index/synonyms
   * @param synonyms - Array of synonym entries in "synonym:original-term" format to delete
   */
  async delete(indexName: IndexName, synonyms: string[]): Promise<SynonymOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/synonyms`;

    const response = await this.httpClient.request<SynonymOperationResponse>(
      { method: 'DELETE', path, body: synonyms, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Deletes all synonyms from an index
   * Uses DELETE /index/:index/synonyms/all
   */
  async deleteAll(indexName: IndexName): Promise<SynonymOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/synonyms/all`;

    const response = await this.httpClient.request<SynonymOperationResponse>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }
}
