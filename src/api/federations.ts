/**
 * Federation management API operations
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type {
  Federation,
  FederationName,
  FederationOperationResponse,
  FederationStats,
  SearchcraftConfig,
} from '../types/index.js';

/**
 * Federation API class
 */
export class FederationApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Lists all federations
   * Uses GET /federation
   */
  async list(): Promise<Federation[]> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/federation`;

    const response = await this.httpClient.request<Federation[]>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Gets the configuration for a specific federation
   * Uses GET /federation/:federation
   */
  async get(federationName: FederationName): Promise<Federation> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/federation/${federationName}`;

    const response = await this.httpClient.request<Federation>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Deletes a federation
   * Uses DELETE /federation/:federation
   */
  async delete(federationName: FederationName): Promise<FederationOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/federation/${federationName}`;

    const response = await this.httpClient.request<FederationOperationResponse>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }

  /**
   * Gets statistics for a specific federation
   * Uses GET /federation/:federation_name/stats
   */
  async getStats(federationName: FederationName): Promise<FederationStats> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/federation/${federationName}/stats`;

    const response = await this.httpClient.request<FederationStats>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return response.data;
  }
}
