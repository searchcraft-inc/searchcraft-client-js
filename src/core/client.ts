/**
 * Main Searchcraft client
 */

import { DocumentApi } from '../api/documents.js';
import { HealthApi } from '../api/health.js';
import { SearchApi } from '../api/search.js';
import type { SearchcraftConfig } from '../types/index.js';
import { createConfig } from './config.js';
import type { HttpClient } from './http.js';
import { createHttpClient } from './http.js';

/**
 * Main Searchcraft client class
 */
export class SearchcraftClient {
  private readonly config: Readonly<SearchcraftConfig>;
  private readonly httpClient: HttpClient;

  public readonly search: SearchApi;
  public readonly documents: DocumentApi;
  public readonly health: HealthApi;

  constructor(config: SearchcraftConfig, httpClient?: HttpClient) {
    this.config = createConfig(config);
    this.httpClient = httpClient ?? createHttpClient();

    // Initialize API modules
    this.search = new SearchApi(this.config, this.httpClient);
    this.documents = new DocumentApi(this.config, this.httpClient);
    this.health = new HealthApi(this.config, this.httpClient);
  }

  /**
   * Gets the current configuration (readonly)
   */
  getConfig(): Readonly<SearchcraftConfig> {
    return this.config;
  }
}

/**
 * Factory function to create a Searchcraft client
 */
export const createClient = (
  config: SearchcraftConfig,
  httpClient?: HttpClient
): SearchcraftClient => {
  return new SearchcraftClient(config, httpClient);
};
