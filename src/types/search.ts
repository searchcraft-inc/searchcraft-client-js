/**
 * Search-related types
 */

import type { DocumentId, IndexName, OccurMode, QueryMode, SortDirection } from './common.js';

/**
 * Which fields a `fuzzy` or `term` clause searches.
 * Defaults to the index's configured `search_fields` when omitted.
 */
export type FieldSelector = string | ReadonlyArray<string> | Readonly<Record<string, number>>;

/**
 * Base query structure
 */
export interface BaseQuery {
  readonly ctx: string;
  /** Fields to search. Applies to `fuzzy` and `term` clauses only. */
  readonly fields?: FieldSelector;
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
 * Term query: matches a single term against a specific field without
 * query-syntax parsing. Useful for programmatic filters.
 */
export interface TermQuery {
  readonly term: BaseQuery;
}

/**
 * More-like-this query: finds documents similar to a reference document,
 * identified by its internal Searchcraft `document_id`.
 */
export interface MoreLikeThisQuery {
  readonly 'more-like-this': { readonly ctx: string };
}

/**
 * Query with occur parameter
 */
export interface QueryWithOccur {
  readonly occur: OccurMode;
  readonly fuzzy?: BaseQuery;
  readonly exact?: BaseQuery;
  readonly dynamic?: BaseQuery;
  readonly term?: BaseQuery;
  readonly 'more-like-this'?: { readonly ctx: string };
}

/**
 * Union type for all query types
 */
export type SearchQuery =
  | FuzzyQuery
  | ExactQuery
  | DynamicQuery
  | TermQuery
  | MoreLikeThisQuery
  | QueryWithOccur
  | (FuzzyQuery & { readonly occur?: OccurMode })
  | (ExactQuery & { readonly occur?: OccurMode })
  | (DynamicQuery & { readonly occur?: OccurMode })
  | (TermQuery & { readonly occur?: OccurMode })
  | (MoreLikeThisQuery & { readonly occur?: OccurMode });

/**
 * Search options for pagination and sorting
 */
export interface SearchOptions {
  /**
   * Maximum results to return. Defaults to 20 server-side.
   *
   * The engine clamps this to its configured maximum (200 unless the operator
   * raised it) rather than rejecting the request.
   */
  readonly limit?: number;
  readonly offset?: number;
  /**
   * Field to order results by. Ordering by a field means hits come back with
   * a null `score`.
   */
  readonly order_by?: string;
  readonly sort?: SortDirection;
  /**
   * Datetime field used to decay relevance for older documents, overriding
   * the index's own setting for this query.
   */
  readonly time_decay_field?: string;
  /** Relevance weight for this index within a federation search. Defaults to 1.0. */
  readonly index_weighting?: number;
  /**
   * The minimum number of optional (`should`) clauses a document must match.
   *
   * When omitted the engine applies its Elasticsearch-compatible default: a
   * query of only `should` clauses requires 1, and a query containing any
   * `must` or `mustnot` clause requires 0. Added in engine 0.11.0.
   */
  readonly minimum_number_should_match?: number;
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
  /**
   * Searchcraft's internal document ID, distinct from your own `id` field.
   * Pass this to `documents.get()`.
   */
  readonly document_id: DocumentId;
  /**
   * The relevance score, or null when results were ordered by a field rather
   * than by relevance — an `order_by` query carries no score.
   */
  readonly score: number | null;
  readonly source_index: IndexName;
}

/**
 * Search response data
 */
export interface SearchResponseData<T = unknown> {
  readonly hits: ReadonlyArray<SearchHit<T>>;
  readonly count: number;
  /** Time the search took, in seconds. */
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
