/**
 * Type exports
 */

// Common types
export type {
  ApiKey,
  IndexName,
  FederationName,
  DocumentId,
  QueryMode,
  OccurMode,
  SortDirection,
  HttpMethod,
  ApiResponse,
  ApiErrorResponse,
  SearchcraftConfig,
  HttpRequestOptions,
  HttpResponse,
} from './common.js';

export {
  createApiKey,
  createIndexName,
  createFederationName,
  createDocumentId,
} from './common.js';

// Error types
export {
  SearchcraftError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  NetworkError,
  ApiError,
  ConfigurationError,
} from './errors.js';

// Search types
export type {
  BaseQuery,
  FuzzyQuery,
  ExactQuery,
  DynamicQuery,
  QueryWithOccur,
  SearchQuery,
  SearchOptions,
  SearchRequest,
  FacetPath,
  Facet,
  SearchHit,
  SearchResponseData,
  SearchResponse,
  FieldQuery,
  QueryBuilderOptions,
} from './search.js';

// Document types
export type {
  Document,
  DocumentWithId,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DeleteDocumentRequest,
  BatchDocumentOperation,
  DocumentOperationResponse,
  BatchOperationResponse,
} from './document.js';
