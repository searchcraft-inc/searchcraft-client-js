/**
 * Federation management API operations
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import { unwrapData } from '../core/http.js';
import type {
  ApiResponse,
  Federation,
  FederationName,
  FederationOperationResponse,
  FederationRequest,
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

    const response = await this.httpClient.request<ApiResponse<Federation[]>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
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

    const response = await this.httpClient.request<ApiResponse<Federation>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Lists the federations belonging to an organization.
   * Uses GET /federation/organization/:organization_id
   * @param organizationId - The organization to list federations for.
   * @returns A promise resolving to the federations owned by the organization.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the organization does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async listByOrganization(organizationId: string): Promise<Federation[]> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/federation/organization/${organizationId}`;

    const response = await this.httpClient.request<ApiResponse<Federation[]>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Lists the index names that make up a federation.
   * Uses GET /federation/:federation_name/indices
   * @param federationName - The federation to inspect.
   * @returns A promise resolving to the federated index names.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the federation does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async listIndices(federationName: FederationName): Promise<string[]> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/federation/${federationName}/indices`;

    const response = await this.httpClient.request<ApiResponse<string[]>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Creates a federation.
   * Uses POST /federation
   * @param request - The federation to create.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {ApiError} When the server returns a non-2xx response, including when a federation of that name already exists.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async create(request: FederationRequest): Promise<FederationOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/federation`;

    const response = await this.httpClient.request<ApiResponse<FederationOperationResponse>>(
      { method: 'POST', path, body: request, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }

  /**
   * Updates an existing federation.
   * Uses PUT /federation/:federation_name
   * @param federationName - The federation to update.
   * @param request - The replacement federation configuration.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the federation does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async update(
    federationName: FederationName,
    request: FederationRequest
  ): Promise<FederationOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/federation/${federationName}`;

    const response = await this.httpClient.request<ApiResponse<FederationOperationResponse>>(
      { method: 'PUT', path, body: request, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
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

    const response = await this.httpClient.request<ApiResponse<FederationOperationResponse>>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
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

    const response = await this.httpClient.request<ApiResponse<FederationStats>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );

    return unwrapData(response);
  }
}
