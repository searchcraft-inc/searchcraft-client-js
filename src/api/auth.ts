/**
 * Authentication management API operations
 *
 * These endpoints are only available for self-hosted instances of Searchcraft.
 * Requires an admin level authentication key (adminKey in config) to access.
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import { unwrapData } from '../core/http.js';
import type {
  AuthKey,
  AuthKeyListResponse,
  CreateAuthKeyRequest,
  UpdateAuthKeyRequest,
} from '../types/auth.js';
import type { ApiResponse, FederationName, IndexName, SearchcraftConfig } from '../types/index.js';
import { AuthenticationError } from '../types/index.js';

/**
 * Authentication management API class (self-hosted only)
 */
export class AuthApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Returns a list of all keys on the cluster.
   * Uses GET /auth/key
   * @returns A promise resolving to the list of all authentication keys.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async listKeys(): Promise<AuthKeyListResponse> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key`;
    const response = await this.httpClient.request<ApiResponse<AuthKeyListResponse>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return unwrapData(response);
  }

  /**
   * Gets an individual authentication key by its value.
   * Uses GET /auth/key/:key
   * @param key - The authentication key string to look up.
   * @returns A promise resolving to the matching authentication key details.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {NotFoundError} When the specified key does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async getKey(key: string): Promise<AuthKey | null> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key/${key}`;
    const response = await this.httpClient.request<ApiResponse<AuthKeyListResponse>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    // The engine answers this route with a list, empty when no such key exists.
    return unwrapData(response)[0] ?? null;
  }

  /**
   * Checks whether the configured admin key carries all of the given permission bits.
   * Uses GET /auth/key/check/:permission
   * @param permissionFlags - A bitmask built from the `permissions` constants.
   * @returns A promise resolving to true when the key carries every requested bit.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {ApiError} When the server returns a non-2xx response other than 403.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async checkKeyPermissions(permissionFlags: number): Promise<boolean> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key/check/${permissionFlags}`;
    try {
      await this.httpClient.request<ApiResponse<string>>(
        { method: 'GET', path, timeout: this.config.timeout },
        apiKey
      );
      return true;
    } catch (error) {
      // A key that simply lacks the permission is a 403, not a failure.
      if (error instanceof AuthenticationError) return false;
      throw error;
    }
  }

  /**
   * Creates a new authentication key.
   * Uses POST /auth/key
   * @param request - The details of the key to create.
   * @returns A promise resolving to the newly created authentication key.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async createKey(request: CreateAuthKeyRequest): Promise<AuthKey> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key`;
    const response = await this.httpClient.request<ApiResponse<AuthKey>>(
      { method: 'POST', path, body: request, timeout: this.config.timeout },
      apiKey
    );
    return unwrapData(response);
  }

  /**
   * Updates an individual authentication key.
   * Uses POST /auth/key/:key
   * @param key - The authentication key string to update.
   * @param request - The partial update to apply to the key.
   * @returns A promise resolving to the updated authentication key.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {NotFoundError} When the specified key does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async updateKey(key: string, request: UpdateAuthKeyRequest): Promise<AuthKey> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key/${key}`;
    const response = await this.httpClient.request<ApiResponse<AuthKey>>(
      { method: 'POST', path, body: request, timeout: this.config.timeout },
      apiKey
    );
    return unwrapData(response);
  }

  /**
   * Deletes an individual authentication key.
   * Uses DELETE /auth/key/:key
   * @param key - The authentication key string to delete.
   * @returns A promise resolving to a confirmation message string.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {NotFoundError} When the specified key does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async deleteKey(key: string): Promise<string> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key/${key}`;
    const response = await this.httpClient.request<ApiResponse<string>>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );
    return unwrapData(response);
  }

  /**
   * Deletes all authentication keys on the cluster.
   * Uses DELETE /auth/key
   * @returns A promise resolving to a confirmation message string.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async deleteAllKeys(): Promise<string> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key`;
    const response = await this.httpClient.request<ApiResponse<string>>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );
    return unwrapData(response);
  }

  /**
   * Returns all authentication keys for the given application.
   * Uses GET /auth/application/:application_id
   * @param applicationId - The numeric ID of the application.
   * @returns A promise resolving to the list of authentication keys for the application.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {NotFoundError} When the specified application does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async listApplicationKeys(applicationId: string): Promise<AuthKeyListResponse> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/application/${applicationId}`;
    const response = await this.httpClient.request<ApiResponse<AuthKeyListResponse>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return unwrapData(response);
  }

  /**
   * Returns all authentication keys for the given organization.
   * Uses GET /auth/organization/:organization_id
   * @param organizationId - The numeric ID of the organization.
   * @returns A promise resolving to the list of authentication keys for the organization.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {NotFoundError} When the specified organization does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async listOrganizationKeys(organizationId: string): Promise<AuthKeyListResponse> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/organization/${organizationId}`;
    const response = await this.httpClient.request<ApiResponse<AuthKeyListResponse>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return unwrapData(response);
  }

  /**
   * Returns all authentication keys associated with the given federation.
   * Uses GET /auth/federation/:federation_name
   * @param federationName - The name of the federation.
   * @returns A promise resolving to the list of authentication keys for the federation.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {NotFoundError} When the specified federation does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async listFederationKeys(federationName: FederationName): Promise<AuthKeyListResponse> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/federation/${federationName}`;
    const response = await this.httpClient.request<ApiResponse<AuthKeyListResponse>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return unwrapData(response);
  }

  /**
   * Returns all authentication keys that can access the given index.
   * Uses GET /auth/index/:index_name
   * Added in engine 0.10.0.
   * @param indexName - The name of the index.
   * @returns A promise resolving to the list of authentication keys for the index.
   * @throws {ConfigurationError} When `adminKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks admin permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async listIndexKeys(indexName: IndexName): Promise<AuthKeyListResponse> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/index/${encodeURIComponent(indexName)}`;
    const response = await this.httpClient.request<ApiResponse<AuthKeyListResponse>>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return unwrapData(response);
  }
}
