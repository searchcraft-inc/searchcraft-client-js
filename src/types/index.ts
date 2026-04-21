/**
 * Type exports
 */

// AI types (engine 0.10.0+)
export type {
  AICapabilities,
  AIConfig,
  IndexCapabilities,
  KeywordRule,
  LLMProvider,
  PromptInstruction,
  SearchSummaryConfig,
  SummaryDelta,
  SummaryDone,
  SummaryError,
  SummaryMetadata,
  SummaryStreamEvent,
} from './ai.js';
// Auth types (self-hosted only)
export type {
  AuthKey,
  AuthKeyListResponse,
  AuthKeyPermission,
  AuthKeyStatus,
  CreateAuthKeyRequest,
  UpdateAuthKeyRequest,
} from './auth.js';
// Common types
export type {
  ApiErrorResponse,
  ApiKey,
  ApiResponse,
  DocumentId,
  FederationName,
  HttpMethod,
  HttpRequestOptions,
  HttpResponse,
  HttpStreamResponse,
  IndexName,
  OccurMode,
  QueryMode,
  SearchcraftConfig,
  SortDirection,
} from './common.js';
export {
  createApiKey,
  createDocumentId,
  createFederationName,
  createIndexName,
} from './common.js';
// Document types
export type {
  BatchDocumentOperation,
  CreateDocumentRequest,
  DeleteDocumentRequest,
  Document,
  DocumentDeleteResponse,
  DocumentOperationResponse,
  DocumentWithId,
  UpdateDocumentRequest,
} from './document.js';
// Error types
export {
  ApiError,
  AuthenticationError,
  ConfigurationError,
  NetworkError,
  NotFoundError,
  SearchcraftError,
  ValidationError,
} from './errors.js';
// Federation types
export type {
  Federation,
  FederationIndexConfig,
  FederationOperationResponse,
  FederationStats,
} from './federation.js';
// Index configuration types
export type {
  AllIndexStatsResponse,
  FieldConfig,
  FieldType,
  IndexConfig,
  IndexListResponse,
  IndexOperationResponse,
  IndexStats,
  IndexStatsEntry,
  StopwordOperationResponse,
  SynonymOperationResponse,
  SynonymsMap,
} from './index-config.js';

// Measure types
export type {
  KnownMeasureEventName,
  MeasureDashboardSummary,
  MeasureEventName,
  MeasureOperationResponse,
  MeasureRequest,
  MeasureRequestProperties,
  MeasureRequestUser,
  MeasureUserType,
} from './measure.js';
// Search types
export type {
  BaseQuery,
  DynamicQuery,
  ExactQuery,
  Facet,
  FacetPath,
  FieldQuery,
  FuzzyQuery,
  QueryBuilderOptions,
  QueryWithOccur,
  SearchHit,
  SearchOptions,
  SearchQuery,
  SearchRequest,
  SearchResponse,
  SearchResponseData,
} from './search.js';
