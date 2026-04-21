/**
 * Search API operations
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type {
  FederationName,
  IndexName,
  SearchcraftConfig,
  SearchRequest,
  SearchResponse,
  SummaryStreamEvent,
} from '../types/index.js';
import { parseSseStream } from '../utils/sse.js';
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
  /**
   * Streams an AI-generated summary of search results for the given index.
   * Uses POST /index/:index_name/search/summary (Server-Sent Events).
   * Added in engine 0.10.0. Requires that AI features are enabled for the
   * index and that the authentication key has LLM summary permissions.
   * The returned async iterable yields tagged events as the server produces
   * them: a single `metadata` event, zero or more `delta` events, and
   * a final `done` or `error` event.
   * @param indexName - The name of the index to summarise search results for.
   * @param request - The search request used to retrieve candidate documents.
   * @returns An async iterable of {@link SummaryStreamEvent}s.
   * @throws {ValidationError} When `limit` exceeds 200 or `offset` is negative.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks summary permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the initial request times out or a network failure occurs.
   * @example
   * for await (const event of client.search.searchSummary('products', { query: { fuzzy: { ctx: 'laptop' } } })) {
   *   if (event.type === 'delta') process.stdout.write(event.data.content);
   * }
   */
  async *searchSummary(
    indexName: IndexName,
    request: SearchRequest
  ): AsyncIterable<SummaryStreamEvent> {
    if (request.limit !== undefined) {
      validateLimit(request.limit);
    }
    if (request.offset !== undefined) {
      validateOffset(request.offset);
    }

    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/${indexName}/search/summary`;

    const response = await this.httpClient.stream(
      {
        method: 'POST',
        path,
        body: request,
        timeout: this.config.timeout,
      },
      apiKey
    );

    for await (const event of parseSseStream(response.body)) {
      const eventType = event.event ?? 'message';
      if (
        eventType === 'metadata' ||
        eventType === 'delta' ||
        eventType === 'done' ||
        eventType === 'error'
      ) {
        const data = event.data ? JSON.parse(event.data) : {};
        yield { type: eventType, data } as SummaryStreamEvent;
      }
    }
  }

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
