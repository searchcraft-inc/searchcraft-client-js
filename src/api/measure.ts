/**
 * Measure API operations for metric event collection and reporting
 *
 * These endpoints are used for capturing usage metrics in Searchcraft Cloud.
 * When using an SDK or CMS integration you typically do not need to call these directly.
 * Requires an authentication key with ingestion permissions.
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type {
  MeasureDashboardSummary,
  MeasureOperationResponse,
  MeasureRequest,
  SearchcraftConfig,
} from '../types/index.js';

/**
 * Measure API class
 */
export class MeasureApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Returns measurement dashboard summary data.
   * Uses GET /measure/dashboard/summary
   * @returns A promise resolving to the dashboard summary statistics.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async getDashboardSummary(): Promise<MeasureDashboardSummary> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/measure/dashboard/summary`;

    const response = await this.httpClient.request<MeasureDashboardSummary>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
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

    const response = await this.httpClient.request<MeasureOperationResponse>(
      { method: 'POST', path, body: event, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
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

    const response = await this.httpClient.request<MeasureOperationResponse>(
      { method: 'POST', path, body: events, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }
}
