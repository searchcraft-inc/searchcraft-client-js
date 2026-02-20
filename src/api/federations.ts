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
   * Lists all federations.
   * Uses GET /federation
   * @returns A promise resolving to an array of all federation configurations.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
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
   * Gets the configuration for a specific federation.
   * Uses GET /federation/:federation
   * @param federationName - The name of the federation to retrieve.
   * @returns A promise resolving to the federation configuration.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified federation does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
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
   * Deletes a federation.
   * Uses DELETE /federation/:federation
   * @param federationName - The name of the federation to delete.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified federation does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
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
   * Gets statistics for a specific federation.
   * Uses GET /federation/:federation_name/stats
   * @param federationName - The name of the federation to retrieve statistics for.
   * @returns A promise resolving to the federation statistics.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the specified federation does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
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
