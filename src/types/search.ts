/**
 * Search-related types
 */

import type { DocumentId, IndexName, OccurMode, QueryMode, SortDirection } from './common.js';

/**
 * Base query structure
 */
export interface BaseQuery {
  readonly ctx: string;
}

/**
 * Fuzzy query
 */
export interface FuzzyQuery {
  readonly fuzzy: BaseQuery;
}

/**
 * Exact query
 */
export interface ExactQuery {
  readonly exact: BaseQuery;
}

/**
 * Dynamic query
 */
export interface DynamicQuery {
  readonly dynamic: BaseQuery;
}

/**
 * Query with occur parameter
 */
export interface QueryWithOccur {
  readonly occur: OccurMode;
  readonly fuzzy?: BaseQuery;
  readonly exact?: BaseQuery;
  readonly dynamic?: BaseQuery;
}

/**
 * Union type for all query types
 */
export type SearchQuery =
  | FuzzyQuery
  | ExactQuery
  | DynamicQuery
  | QueryWithOccur
  | (FuzzyQuery & { readonly occur?: OccurMode })
  | (ExactQuery & { readonly occur?: OccurMode })
  | (DynamicQuery & { readonly occur?: OccurMode });

/**
 * Search options for pagination and sorting
 */
export interface SearchOptions {
  readonly limit?: number;
  readonly offset?: number;
  readonly order_by?: string;
  readonly sort?: SortDirection;
}

/**
 * Complete search request payload
 */
export interface SearchRequest extends SearchOptions {
  readonly query: SearchQuery | ReadonlyArray<QueryWithOccur>;
}

/**
 * Facet path with count
 */
export interface FacetPath {
  readonly path: string;
  readonly count: number;
  readonly children?: ReadonlyArray<FacetPath>;
}

/**
 * Facet object
 */
export type Facet = Readonly<Record<string, ReadonlyArray<FacetPath>>>;

/**
 * Search hit document
 */
export interface SearchHit<T = unknown> {
  readonly doc: T;
  readonly document_id: DocumentId;
  readonly score: number;
  readonly source_index: IndexName;
}

/**
 * Search response data
 */
export interface SearchResponseData<T = unknown> {
  readonly hits: ReadonlyArray<SearchHit<T>>;
  readonly count: number;
  readonly time_taken: number;
  readonly facets?: ReadonlyArray<Facet>;
}

/**
 * Complete search response
 */
export interface SearchResponse<T = unknown> {
  readonly status: number;
  readonly data: SearchResponseData<T>;
}

/**
 * Query builder field operations
 */
export interface FieldQuery {
  readonly field: string;
  readonly value: string | number | boolean | ReadonlyArray<string | number>;
  readonly operator?: 'IN' | 'TO' | '>' | '<' | '>=' | '<=';
}

/**
 * Query builder options
 */
export interface QueryBuilderOptions {
  readonly mode?: QueryMode;
  readonly occur?: OccurMode;
}
