/**
 * AI configuration and capability types for Searchcraft indices.
 *
 * Added in engine 0.10.0 for AI-powered features like search summary generation.
 */

/**
 * Supported LLM providers for AI-powered features.
 */
export type LLMProvider =
  | 'anthropic'
  | 'bedrock'
  | 'google'
  | 'llamacpp'
  | 'mistral'
  | 'ollama'
  | 'openai'
  | 'xai';

/**
 * A single custom prompt instruction appended to the summary prompt.
 */
export interface PromptInstruction {
  readonly custom_instruction: string;
  /** Lower numbers appear first in the prompt ordering */
  readonly order: number;
}

/**
 * A keyword-based rule for dynamic prompt modification during summary generation.
 */
export interface KeywordRule {
  readonly rule_name: string;
  readonly detect_keywords: string[];
  /** Optional replacement term used in the prompt in place of the original query */
  readonly replacement_term?: string;
  /** Optional custom instruction added when this rule matches */
  readonly custom_instruction?: string;
  /** Optional custom empty-state message emitted when a matched summary returns zero results */
  readonly empty_state_message?: string;
  /** Lower numbers appear first in the prompt ordering */
  readonly order: number;
}

/**
 * Search summary generation configuration.
 */
export interface SearchSummaryConfig {
  /** The LLM model to use for summary generation */
  readonly model: string;
  /** Role/persona the LLM should adopt */
  readonly role?: string;
  /** Maximum character limit for the generated summary */
  readonly character_limit?: number;
  /** Maximum number of search results to include in the prompt */
  readonly max_results?: number;
  /** Maximum length to trim each document to (in characters) */
  readonly document_trim_length?: number;
  /** Temperature parameter for LLM generation (0.0 to 1.0) */
  readonly temperature?: number;
  /** Default empty-state message when a summary search returns zero results.
   *  Supports the `${searchTopic}` placeholder. */
  readonly empty_state_message?: string;
  /** Additional prompt instructions to include */
  readonly additional_prompt_instructions?: PromptInstruction[];
  /** Keyword-based rules for dynamic prompt modification */
  readonly keyword_rules?: KeywordRule[];
}

/**
 * AI configuration attached to an index.
 */
export interface AIConfig {
  /** Configuration for search summary generation */
  readonly search_summary?: SearchSummaryConfig;
  /** The LLM provider to use */
  readonly llm_provider: LLMProvider | (string & {});
  /** AWS region for Bedrock provider */
  readonly llm_region?: string;
  /** Base URL for Ollama, llama.cpp server mode, or OpenAI-compatible APIs */
  readonly llm_base_url?: string;
  /** API key for OpenAI or compatible APIs that require one */
  readonly llm_api_key?: string;
}

/**
 * AI capability/configuration status for an index.
 * Returned from GET /index/:index_name/capabilities (camelCased by the server).
 */
export interface AICapabilities {
  /** Whether AI features are enabled for this index */
  readonly enabled: boolean;
  /** Whether search summary is configured */
  readonly searchSummaryConfigured: boolean;
  /** Whether an LLM provider is configured */
  readonly llmProviderConfigured: boolean;
  /** Whether an LLM model is configured */
  readonly llmModelConfigured: boolean;
}

/**
 * Response from GET /index/:index_name/capabilities.
 */
export interface IndexCapabilities {
  readonly ai: AICapabilities;
}

/**
 * A single SSE event emitted by POST /index/:index_name/search/summary.
 */
export type SummaryStreamEvent =
  | { readonly type: 'metadata'; readonly data: SummaryMetadata }
  | { readonly type: 'delta'; readonly data: SummaryDelta }
  | { readonly type: 'done'; readonly data: SummaryDone }
  | { readonly type: 'error'; readonly data: SummaryError };

export interface SummaryMetadata {
  readonly results_count: number;
  readonly cached: boolean;
}

export interface SummaryDelta {
  readonly content: string;
}

export interface SummaryDone {
  readonly results_count: number;
}

export interface SummaryError {
  readonly message: string;
}
