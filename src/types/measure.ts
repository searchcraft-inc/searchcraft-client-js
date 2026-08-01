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
 * Response from GET /measure/status.
 * Reports whether analytics are configured on the server.
 * When `enabled` is `false`, all other `/measure/*` endpoints are no-ops.
 */
export interface MeasureStatus {
  /** `true` when analytics are configured on the server. */
  readonly enabled: boolean;
}

/**
 * Time bucket size for dashboard reports.
 */
export type MeasureQueryGranularity = 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

/**
 * Filters accepted by the `/measure/dashboard/*` reports.
 *
 * Every field is optional. Scope fields the calling key already carries
 * (`organization_id`, `application_id`) are injected server-side when omitted,
 * and supplying one that conflicts with the key is rejected. Super-user keys
 * may omit `organization_id` to read across tenants.
 */
export interface MeasureDashboardParams {
  /** Organization to report on. Must match the calling key unless it is a super user. */
  readonly organization_id?: string;
  /** Application to report on. Must be accessible to the calling key. */
  readonly application_id?: string;
  /** Restrict the report to these indexes. Sent pipe-delimited. */
  readonly index_names?: ReadonlyArray<string>;
  readonly user_id?: string;
  readonly user_type?: MeasureUserType;
  readonly session_id?: string;
  readonly event_name?: MeasureEventName;
  /** Start of the reporting window, as a Unix timestamp in seconds. */
  readonly date_start?: number;
  /** End of the reporting window, as a Unix timestamp in seconds. */
  readonly date_end?: number;
  /** Time bucket size for series data. */
  readonly granularity?: MeasureQueryGranularity;
  /** Results per page. */
  readonly rpp?: number;
  /** Zero-based page number. */
  readonly page?: number;
}

/**
 * Response from GET /measure/dashboard/summary
 */
export type MeasureDashboardSummary = Record<string, unknown>;

/**
 * Response from the GET /measure/dashboard/* reports.
 * The shape is not stable across engine versions.
 */
export type MeasureDashboardReport = Record<string, unknown>;

/**
 * Response from POST /measure/event and POST /measure/batch
 */
export type MeasureOperationResponse = string;
