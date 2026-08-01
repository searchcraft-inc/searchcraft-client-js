/**
 * Types for federation management
 */

/**
 * Configuration for a single index within a federation
 */
export interface FederationIndexConfig {
  readonly name: string;
  readonly weight_multiplier: number;
}

/**
 * Request payload to create or update a federation.
 */
export interface FederationRequest {
  readonly name: string;
  readonly friendly_name: string;
  readonly created_by?: string;
  readonly last_modified_by?: string;
  readonly organization_id?: string;
  readonly index_configurations: ReadonlyArray<FederationIndexConfig>;
}

/**
 * Full federation configuration as returned by the API
 */
export interface Federation {
  readonly name: string;
  readonly friendly_name: string;
  readonly created_at: string;
  /** Identifier of the creating principal, when known. */
  readonly created_by?: string | null;
  readonly last_modified: string;
  readonly last_modified_by?: string | null;
  /** Owning organization, when scoped to one. */
  readonly organization_id?: string | null;
  readonly index_configurations: FederationIndexConfig[];
}

/**
 * Success message returned by federation mutating operations
 */
export type FederationOperationResponse = string;

/**
 * Statistics for a specific federation, as returned by GET /federation/:federation_name/stats
 */
export interface FederationStats {
  readonly federation_name: string;
  readonly num_docs: number;
  readonly indices: ReadonlyArray<{
    readonly index_name: string;
    readonly num_docs: number;
    readonly space_usage: number;
  }>;
}
