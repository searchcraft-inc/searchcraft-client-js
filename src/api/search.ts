/**
 * Search API operations
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import { throwIfAborted } from '../core/http.js';
import type {
  FederationName,
  IndexName,
  RequestOptions,
  SearchcraftConfig,
  SearchRequest,
  SearchResponse,
  SummaryStreamEvent,
} from '../types/index.js';
import { parseSseStream } from '../utils/sse.js';
import { validateLimit, validateOffset } from '../utils/validators.js';

type SummaryEventType = SummaryStreamEvent['type'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const validateSummaryEvent = (type: SummaryEventType, data: unknown): SummaryStreamEvent | null => {
  if (!isRecord(data)) return null;

  switch (type) {
    case 'metadata':
      if (typeof data.results_count === 'number' && typeof data.cached === 'boolean') {
        return { type, data: { results_count: data.results_count, cached: data.cached } };
      }
      return null;
    case 'delta':
      if (typeof data.content === 'string') {
        return { type, data: { content: data.content } };
      }
      return null;
    case 'done':
      if (typeof data.results_count === 'number') {
        return { type, data: { results_count: data.results_count } };
      }
      return null;
    case 'error':
      if (typeof data.message === 'string') {
        return { type, data: { message: data.message } };
      }
      return null;
  }
};

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
   * @param options - Optional per-call options. Pass `signal` to cancel the request.
   * @returns A promise resolving to the search response containing hits and metadata.
   * @throws {ValidationError} When `limit` is not positive or `offset` is negative.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   * @throws {RequestAbortedError} When `options.signal` is aborted before the request completes.
   * @example
   * const results = await client.search.searchIndex('products', { query: 'laptop', limit: 10 });
   *
   * // Cancel a stale request, e.g. when the user keeps typing:
   * const controller = new AbortController();
   * const pending = client.search.searchIndex('products', { query: 'lap' }, { signal: controller.signal });
   * controller.abort();
   * await pending.catch((e) => { if (!(e instanceof RequestAbortedError)) throw e; });
   */
  async searchIndex<T = unknown>(
    indexName: IndexName,
    request: SearchRequest,
    options?: RequestOptions
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
        signal: options?.signal,
      },
      apiKey
    );

    return response.data;
  }

  /**
   * Streams an AI-generated summary of search results for the given index.
   * Uses POST /index/:index_name/search/summary (Server-Sent Events).
   * Added in engine 0.10.0. Requires that AI features are enabled for the
   * index and that the authentication key has LLM summary permissions.
   * The returned async iterable yields tagged events as the server produces
   * them: a single `metadata` event, zero or more `delta` events, and
   * a final `done` or `error` event. Malformed SSE frames are surfaced as
   * synthetic `error` events instead of terminating the stream.
   * @param indexName - The name of the index to summarise search results for.
   * @param request - The search request used to retrieve candidate documents.
   * @param options - Optional per-call options. Pass `signal` to cancel the request or the stream.
   * @returns An async iterable of {@link SummaryStreamEvent}s.
   * @throws {ValidationError} When `limit` is not positive or `offset` is negative.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks summary permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the initial request times out or a network failure occurs.
   * @throws {RequestAbortedError} When `options.signal` is aborted, either before the response
   *   arrives or while the stream is being read.
   * @example
   * for await (const event of client.search.searchSummary('products', { query: { fuzzy: { ctx: 'laptop' } } })) {
   *   if (event.type === 'delta') process.stdout.write(event.data.content);
   * }
   *
   * // Stop streaming early:
   * const controller = new AbortController();
   * for await (const event of client.search.searchSummary('products', request, { signal: controller.signal })) {
   *   if (event.type === 'delta' && enough()) controller.abort();
   * }
   */
  async *searchSummary(
    indexName: IndexName,
    request: SearchRequest,
    options?: RequestOptions
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
        signal: options?.signal,
      },
      apiKey
    );

    try {
      yield* this.parseSummaryEvents(response.body);
    } catch (error) {
      // Reading a cancelled body rejects with the fetch abort error; report it
      // as the same typed error used for the initial request.
      throwIfAborted(options?.signal);
      throw error;
    }
  }

  private async *parseSummaryEvents(
    body: ReadableStream<Uint8Array>
  ): AsyncIterable<SummaryStreamEvent> {
    for await (const event of parseSseStream(body)) {
      const eventType = event.event ?? 'message';
      if (
        eventType !== 'metadata' &&
        eventType !== 'delta' &&
        eventType !== 'done' &&
        eventType !== 'error'
      ) {
        continue;
      }

      let data: unknown;
      try {
        data = event.data ? JSON.parse(event.data) : {};
      } catch {
        yield {
          type: 'error',
          data: { message: `Invalid JSON in ${eventType} event: ${event.data}` },
        };
        continue;
      }

      const validated = validateSummaryEvent(eventType, data);
      if (validated === null) {
        yield {
          type: 'error',
          data: {
            message: `Malformed ${eventType} payload: ${JSON.stringify(data)}`,
          },
        };
        continue;
      }
      yield validated;
    }
  }

  /**
   * Performs a federated search across multiple indices grouped under a federation.
   * @param federationName - The name of the federation to search.
   * @param request - The search request parameters including query, filters, limit, and offset.
   * @param options - Optional per-call options. Pass `signal` to cancel the request.
   * @returns A promise resolving to the search response containing hits and metadata.
   * @throws {ValidationError} When `limit` is not positive or `offset` is negative.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified federation does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   * @throws {RequestAbortedError} When `options.signal` is aborted before the request completes.
   * @example
   * const results = await client.search.searchFederation('global', { query: 'laptop', limit: 10 });
   */
  async searchFederation<T = unknown>(
    federationName: FederationName,
    request: SearchRequest,
    options?: RequestOptions
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
        signal: options?.signal,
      },
      apiKey
    );

    return response.data;
  }
}
