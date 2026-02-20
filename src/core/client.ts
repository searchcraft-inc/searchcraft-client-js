/**
 * Main Searchcraft client
 */

import { AuthApi } from '../api/auth.js';
import { DocumentApi } from '../api/documents.js';
import { FederationApi } from '../api/federations.js';
import { HealthApi } from '../api/health.js';
import { IndexApi } from '../api/indices.js';
import { MeasureApi } from '../api/measure.js';
import { SearchApi } from '../api/search.js';
import { StopwordsApi } from '../api/stopwords.js';
import { SynonymsApi } from '../api/synonyms.js';
import { TransactionApi } from '../api/transactions.js';
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
  public readonly indices: IndexApi;
  public readonly federations: FederationApi;
  public readonly synonyms: SynonymsApi;
  public readonly stopwords: StopwordsApi;
  public readonly transactions: TransactionApi;
  public readonly measure: MeasureApi;
  /** Authentication management (self-hosted only, requires adminKey in config) */
  public readonly auth: AuthApi;

  /**
   * Creates a new SearchcraftClient instance.
   * @param config - Client configuration including the endpoint URL and at least one API key.
   * @param httpClient - Optional custom HTTP client implementation. Defaults to the built-in fetch-based client.
   */
  constructor(config: SearchcraftConfig, httpClient?: HttpClient) {
    this.config = createConfig(config);
    this.httpClient = httpClient ?? createHttpClient();

    // Initialize API modules
    this.search = new SearchApi(this.config, this.httpClient);
    this.documents = new DocumentApi(this.config, this.httpClient);
    this.health = new HealthApi(this.config, this.httpClient);
    this.indices = new IndexApi(this.config, this.httpClient);
    this.federations = new FederationApi(this.config, this.httpClient);
    this.synonyms = new SynonymsApi(this.config, this.httpClient);
    this.stopwords = new StopwordsApi(this.config, this.httpClient);
    this.transactions = new TransactionApi(this.config, this.httpClient);
    this.measure = new MeasureApi(this.config, this.httpClient);
    this.auth = new AuthApi(this.config, this.httpClient);
  }

  /**
   * Gets the current configuration (readonly).
   * @returns The frozen client configuration object.
   */
  getConfig(): Readonly<SearchcraftConfig> {
    return this.config;
  }
}

/**
 * Factory function to create a Searchcraft client.
 * @param config - Client configuration including the endpoint URL and at least one API key.
 * @param httpClient - Optional custom HTTP client implementation. Defaults to the built-in fetch-based client.
 * @returns A configured {@link SearchcraftClient} instance.
 */
export const createClient = (
  config: SearchcraftConfig,
  httpClient?: HttpClient
): SearchcraftClient => {
  return new SearchcraftClient(config, httpClient);
};
