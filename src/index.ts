/**
 * Searchcraft TypeScript Client
 * Main entry point
 */

// Export main client
export { SearchcraftClient, createClient } from './core/client.js';

// Export types
export type {
  // Common types
  ApiKey,
  IndexName,
  FederationName,
  DocumentId,
  QueryMode,
  OccurMode,
  SortDirection,
  SearchcraftConfig,
  // Search types
  SearchQuery,
  SearchOptions,
  SearchRequest,
  SearchResponse,
  SearchResponseData,
  SearchHit,
  Facet,
  FacetPath,
  QueryWithOccur,
  // Document types
  Document,
  DocumentWithId,
  DocumentOperationResponse,
  BatchOperationResponse,
} from './types/index.js';

// Export branded type creators
export {
  createApiKey,
  createIndexName,
  createFederationName,
  createDocumentId,
} from './types/index.js';

// Export errors
export {
  SearchcraftError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  NetworkError,
  ApiError,
  ConfigurationError,
} from './types/index.js';

// Export query builder
export {
  QueryBuilder,
  fuzzy,
  exact,
  dynamic,
  createFuzzyQuery,
  createExactQuery,
  createDynamicQuery,
} from './utils/query-builder.js';

// Export HTTP client interface for custom implementations
export type { HttpClient } from './core/http.js';
export { createHttpClient } from './core/http.js';
