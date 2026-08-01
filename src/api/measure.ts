/**
 * Measure API operations for metric event collection and reporting
 *
 * These endpoints are used for capturing usage metrics in Searchcraft Cloud.
 * When using an SDK or CMS integration you typically do not need to call these directly.
 * Requires an authentication key with ingestion permissions.
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import { unwrapData } from '../core/http.js';
import type {
  ApiResponse,
  MeasureDashboardParams,
  MeasureDashboardReport,
  MeasureDashboardSummary,
  MeasureOperationResponse,
  MeasureRequest,
  MeasureStatus,
  SearchcraftConfig,
} from '../types/index.js';

/**
 * Measure API class
 */
/**
 * Serializes dashboard filters into a query string.
 * `index_names` is pipe-delimited, which is what the engine parses.
 * @param params - The filters to apply, if any.
 * @returns A query string beginning with `?`, or an empty string when no filters are set.
 */
const buildDashboardQuery = (params: MeasureDashboardParams = {}): string => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (key === 'index_names') {
      const names = value as ReadonlyArray<string>;
      if (names.length > 0) search.set(key, names.join('|'));
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
};

export class MeasureApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Reports whether analytics are configured on the server.
   * Uses GET /measure/status. This endpoint is unauthenticated and works with
   * or without an API key, like `GET /healthcheck`. When `enabled` is `false`,
   * all other `/measure/*` endpoints are no-ops; call this first to decide
   * whether the other measure endpoints will do anything.
   * @returns A promise resolving to the measure status (`{ enabled: boolean }`).
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async getStatus(): Promise<MeasureStatus> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/measure/status`;

    const response = await this.httpClient.request<ApiResponse<MeasureStatus>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Returns measurement dashboard summary data.
   * Uses GET /measure/dashboard/summary
   * @returns A promise resolving to the dashboard summary statistics.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async getDashboardSummary(params: MeasureDashboardParams = {}): Promise<MeasureDashboardSummary> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/measure/dashboard/summary${buildDashboardQuery(params)}`;

    const response = await this.httpClient.request<ApiResponse<MeasureDashboardSummary>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Tracks a single measure event.
   * Uses POST /measure/event
   * @param event - The measure event data to track.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async trackEvent(event: MeasureRequest): Promise<MeasureOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/measure/event`;

    const response = await this.httpClient.request<ApiResponse<MeasureOperationResponse>>(
      { method: 'POST', path, body: event, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Tracks a batch of measure events.
   * Uses POST /measure/batch
   * @param events - An array of measure event data to track.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async trackBatch(events: MeasureRequest[]): Promise<MeasureOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/measure/batch`;

    const response = await this.httpClient.request<ApiResponse<MeasureOperationResponse>>(
      // The batch endpoint expects `{ "items": [...] }`, not a bare array.
      { method: 'POST', path, body: { items: events }, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Returns the measure dashboard conversion report.
   * Uses GET /measure/dashboard/conversion
   * The shape of this payload is not stable across engine versions.
   * @returns A promise resolving to the conversion report.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key lacks the analytics permission.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async getDashboardConversion(
    params: MeasureDashboardParams = {}
  ): Promise<MeasureDashboardReport> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/measure/dashboard/conversion${buildDashboardQuery(params)}`;

    const response = await this.httpClient.request<ApiResponse<MeasureDashboardReport>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Returns the measure dashboard usage report.
   * Uses GET /measure/dashboard/usage
   * The shape of this payload is not stable across engine versions.
   * @returns A promise resolving to the usage report.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key lacks the analytics permission.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async getDashboardUsage(params: MeasureDashboardParams = {}): Promise<MeasureDashboardReport> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/measure/dashboard/usage${buildDashboardQuery(params)}`;

    const response = await this.httpClient.request<ApiResponse<MeasureDashboardReport>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }
}
