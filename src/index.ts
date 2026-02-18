/**
 * Searchcraft TypeScript Client
 * Main entry point
 */

// Export main client
export { createClient, SearchcraftClient } from './core/client.js';

// Export types
export type {
  AllIndexStatsResponse,
  // Common types
  ApiKey,
  // Auth types (self-hosted only)
  AuthKey,
  AuthKeyListResponse,
  AuthKeyPermission,
  AuthKeyStatus, CreateAuthKeyRequest,
  // Document types
  Document,
  DocumentDeleteResponse,
  DocumentId,
  DocumentOperationResponse,
  DocumentWithId,
  Facet,
  FacetPath,
  Federation,
  // Federation types
  FederationIndexConfig,
  FederationName,
  FederationOperationResponse,
  FederationStats,
  FieldConfig,
  // Index configuration types
  FieldType, IndexConfig,
  IndexListResponse,
  IndexName,
  IndexOperationResponse,
  IndexStats,
  // Measure types
  MeasureDashboardSummary,
  MeasureEventName,
  MeasureOperationResponse,
  MeasureRequest,
  MeasureRequestProperties,
  MeasureRequestUser,
  OccurMode,
  QueryMode,
  QueryWithOccur,
  SearchcraftConfig,
  SearchHit,
  SearchOptions,
  // Search types
  SearchQuery,
  SearchRequest,
  SearchResponse,
  SearchResponseData,
  SortDirection,
  StopwordOperationResponse,
  SynonymOperationResponse,
  SynonymsMap, UpdateAuthKeyRequest
} from './types/index.js';

// Export branded type creators
export {
  createApiKey,
  createDocumentId,
  createFederationName,
  createIndexName
} from './types/index.js';

// Export errors
export {
  ApiError,
  AuthenticationError,
  ConfigurationError,
  NetworkError,
  NotFoundError,
  SearchcraftError,
  ValidationError
} from './types/index.js';

// Export query builder
export {
  createDynamicQuery,
  createExactQuery,
  createFuzzyQuery,
  dynamic,
  exact,
  fuzzy,
  QueryBuilder
} from './utils/query-builder.js';

// Export HTTP client interface for custom implementations
export { createHttpClient } from './core/http.js';
export type { HttpClient } from './core/http.js';

// Export API classes for direct use or extension
export { AuthApi } from './api/auth.js';
export { FederationApi } from './api/federations.js';
export { IndexApi } from './api/indices.js';
export { MeasureApi } from './api/measure.js';
export { StopwordsApi } from './api/stopwords.js';
export { SynonymsApi } from './api/synonyms.js';
export { TransactionApi } from './api/transactions.js';

