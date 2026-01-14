/**
 * Health check API operations
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type { SearchcraftConfig } from '../types/index.js';

/**
 * Health check response data
 */
export interface HealthCheckData {
  readonly healthy: boolean;
  readonly version?: string;
  readonly uptime?: number;
}

/**
 * Health API class
 */
export class HealthApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Performs a health check on the Searchcraft instance
   */
  async check(): Promise<HealthCheckData> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/healthcheck`;

    const response = await this.httpClient.request<HealthCheckData>(
      {
        method: 'GET',
        path,
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data;
  }
}
