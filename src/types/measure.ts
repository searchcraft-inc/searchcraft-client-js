/**
 * Types for the Measure API (event collection and reporting)
 */

/**
 * Known measure event names emitted by the engine and SDKs.
 * Unknown strings are also accepted for forward compatibility.
 */
export type KnownMeasureEventName =
  | 'sdk_initialized'
  | 'search_requested'
  | 'search_response_received'
  | 'search_completed'
  | 'document_clicked'
  | 'api_requested'
  | 'api_queried'
  /** Emitted when a search summary is requested. Added in engine 0.10.0. */
  | 'api_summary_requested';

/**
 * The name of a measure event. Accepts any known event name, but also
 * accepts arbitrary strings so client code stays forward-compatible.
 */
export type MeasureEventName = KnownMeasureEventName | (string & {});

/**
 * User type segmentation for measure requests.
 */
export type MeasureUserType = 'anonymous' | 'authenticated';

/**
 * Properties attached to a measure request
 */
export interface MeasureRequestProperties {
  readonly searchcraft_organization_id?: string;
  readonly searchcraft_application_id?: string;
  readonly searchcraft_index_names: string[];
  /** Federation the event is associated with, if any. */
  readonly searchcraft_federation_name?: string;
  readonly search_term?: string;
  /** Query kind (e.g. "fuzzy", "exact", "dynamic"). */
  readonly search_kind?: string;
  /**
   * The LLM provider that served the event, if any.
   * Populated for `api_summary_requested` events. Added in engine 0.10.0.
   */
  readonly ai_provider?: string;
  readonly number_of_documents?: number;
  readonly external_document_id?: string;
  readonly document_position?: number;
  readonly session_id?: string;
}

/**
 * User properties attached to a measure request
 */
export interface MeasureRequestUser {
  readonly user_id: string;
  /** Segmentation between authenticated and anonymous sessions. */
  readonly user_type?: MeasureUserType;
  readonly country?: string;
  readonly city?: string;
  readonly device_id?: string;
  readonly client_ip?: string;
  readonly locale?: string;
  readonly os?: string;
  readonly platform?: string;
  readonly region?: string;
  readonly sdk_name?: string;
  readonly sdk_version?: string;
  readonly user_agent?: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

/**
 * A measure event request payload for POST /measure/event
 * POST /measure/batch expects an array of these
 */
export interface MeasureRequest {
  readonly event_name: MeasureEventName;
  readonly properties: MeasureRequestProperties;
  readonly user: MeasureRequestUser;
}

/**
 * Response from GET /measure/dashboard/summary
 */
export type MeasureDashboardSummary = Record<string, unknown>;

/**
 * Response from POST /measure/event and POST /measure/batch
 */
export type MeasureOperationResponse = string;
