/**
 * Types for the Measure API (event collection and reporting)
 */

/**
 * The name of a measure event
 */
export type MeasureEventName = string;

/**
 * Properties attached to a measure request
 */
export interface MeasureRequestProperties {
  readonly searchcraft_organization_id?: string;
  readonly searchcraft_application_id?: string;
  readonly searchcraft_index_names: string[];
  readonly search_term?: string;
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
