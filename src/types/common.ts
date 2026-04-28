/**
 * Common types and branded types for type safety
 */

/**
 * Branded type for API keys to prevent mixing with regular strings
 */
export type ApiKey = string & { readonly __brand: 'ApiKey' };

/**
 * Branded type for index names
 */
export type IndexName = string & { readonly __brand: 'IndexName' };

/**
 * Branded type for federation names
 */
export type FederationName = string & { readonly __brand: 'FederationName' };

/**
 * Branded type for document IDs
 */
export type DocumentId = string & { readonly __brand: 'DocumentId' };

/**
 * Helper to create branded types
 */
export const createApiKey = (key: string): ApiKey => key as ApiKey;
export const createIndexName = (name: string): IndexName => name as IndexName;
export const createFederationName = (name: string): FederationName => name as FederationName;
export const createDocumentId = (id: string): DocumentId => id as DocumentId;

/**
 * Query mode types
 */
export type QueryMode = 'fuzzy' | 'exact' | 'dynamic';

/**
 * Occur parameter for boolean queries
 */
export type OccurMode = 'should' | 'must';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Base API response structure
 */
export interface ApiResponse<T> {
  readonly status: number;
  readonly data: T;
}

/**
 * Error response structure
 */
export interface ApiErrorResponse {
  readonly status: number;
  readonly error?: string;
  readonly message?: string;
}

/**
 * Configuration for the Searchcraft client
 */
export interface SearchcraftConfig {
  readonly endpointUrl: string;
  readonly readKey?: ApiKey;
  readonly ingestKey?: ApiKey;
  /** Admin key required for authentication management endpoints (self-hosted only) */
  readonly adminKey?: ApiKey;
  readonly timeout?: number;
  readonly headers?: Readonly<Record<string, string>>;
}

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  readonly method: HttpMethod;
  readonly path: string;
  readonly body?: unknown;
  readonly headers?: Readonly<Record<string, string>>;
  readonly timeout?: number;
}

/**
 * HTTP response
 */
export interface HttpResponse<T = unknown> {
  readonly status: number;
  readonly data: T;
  readonly headers: Readonly<Record<string, string>>;
}

/**
 * Streaming HTTP response with a raw body stream.
 * Used for Server-Sent Events endpoints like /index/:index/search/summary.
 */
export interface HttpStreamResponse {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: ReadableStream<Uint8Array>;
}
