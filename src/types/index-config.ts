/**
 * Types for index configuration management
 */

import type { AIConfig } from './ai.js';

/**
 * Supported field types in Searchcraft indices
 */
export type FieldType = 'text' | 'facet' | 'bool' | 'f64' | 'u64' | 'i64' | 'datetime' | 'bytes';

/**
 * Configuration for a single field in an index
 */
export interface FieldConfig {
  readonly type: FieldType;
  readonly indexed?: boolean;
  readonly stored?: boolean;
  readonly fast?: boolean;
  readonly multi?: boolean;
  readonly required?: boolean;
  /** For datetime fields: "seconds", "milliseconds", "microseconds", "nanoseconds" */
  readonly precision?: string;
}

/**
 * Full index configuration as returned by GET /index/:index
 */
export interface IndexConfig {
  readonly auto_commit_delay?: number;
  readonly enable_language_stemming?: boolean;
  readonly exclude_stop_words?: boolean;
  readonly fields?: Record<string, FieldConfig>;
  readonly language?: string;
  readonly search_fields?: string[];
  readonly time_decay_field?: string;
  readonly weight_multipliers?: Record<string, number>;
  /**
   * Whether AI-powered features are enabled for this index.
   * Added in engine 0.10.0. Requires an admin-level key to change.
   */
  readonly ai_enabled?: boolean;
  /**
   * AI configuration for LLM-powered features like search summarization.
   * Added in engine 0.10.0.
   */
  readonly ai?: AIConfig;
}

/**
 * Response from GET /index listing all index names
 */
export interface IndexListResponse {
  readonly index_names: string[];
}

/**
 * Success message returned by index mutating operations
 */
export type IndexOperationResponse = string;

/**
 * Synonyms are stored as a map of synonym key -> list of terms.
 * When adding/deleting synonyms, use the format "synonym:original-term".
 */
export type SynonymsMap = Record<string, string[]>;

/**
 * Success message returned by synonym/stopword mutating operations
 */
export type SynonymOperationResponse = string;

/**
 * Success message returned by stopword mutating operations
 */
export type StopwordOperationResponse = string;

/**
 * Statistics for a single index, as returned by GET /index/:index_name/stats
 * Wire format: { "document_count": number }
 */
export interface IndexStats {
  readonly document_count: number;
}

/**
 * A single entry in the all-indices stats array.
 * Each object has the index name as key mapping to its stats.
 * Example: { "my_index": { "document_count": 1234 } }
 */
export type IndexStatsEntry = Record<string, IndexStats>;

/**
 * Response from GET /index/stats listing stats for all indices
 * Wire format: { "index_count": number, "indices": IndexStatsEntry[], "total_document_count": number }
 */
export interface AllIndexStatsResponse {
  readonly index_count: number;
  readonly indices: IndexStatsEntry[];
  readonly total_document_count: number;
}
