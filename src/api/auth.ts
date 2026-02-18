/**
 * Authentication management API operations
 *
 * These endpoints are only available for self-hosted instances of Searchcraft.
 * Requires an admin level authentication key (adminKey in config) to access.
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type { FederationName, SearchcraftConfig } from '../types/index.js';
import type {
  AuthKey,
  AuthKeyListResponse,
  CreateAuthKeyRequest,
  UpdateAuthKeyRequest,
} from '../types/auth.js';

/**
 * Authentication management API class (self-hosted only)
 */
export class AuthApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Returns a list of all keys on the cluster
   * Uses GET /auth/key
   */
  async listKeys(): Promise<AuthKeyListResponse> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key`;
    const response = await this.httpClient.request<AuthKeyListResponse>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return response.data;
  }

  /**
   * Get an individual key by its value
   * Uses GET /auth/key/:key
   */
  async getKey(key: string): Promise<AuthKey> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key/${key}`;
    const response = await this.httpClient.request<AuthKey>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return response.data;
  }

  /**
   * Create a new authentication key
   * Uses POST /auth/key
   */
  async createKey(request: CreateAuthKeyRequest): Promise<AuthKey> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key`;
    const response = await this.httpClient.request<AuthKey>(
      { method: 'POST', path, body: request, timeout: this.config.timeout },
      apiKey
    );
    return response.data;
  }

  /**
   * Update an individual key
   * Uses POST /auth/key/:key
   */
  async updateKey(key: string, request: UpdateAuthKeyRequest): Promise<AuthKey> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key/${key}`;
    const response = await this.httpClient.request<AuthKey>(
      { method: 'POST', path, body: request, timeout: this.config.timeout },
      apiKey
    );
    return response.data;
  }

  /**
   * Delete an individual key
   * Uses DELETE /auth/key/:key
   */
  async deleteKey(key: string): Promise<string> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key/${key}`;
    const response = await this.httpClient.request<string>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );
    return response.data;
  }

  /**
   * Delete all keys on the cluster
   * Uses DELETE /auth/key
   */
  async deleteAllKeys(): Promise<string> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/key`;
    const response = await this.httpClient.request<string>(
      { method: 'DELETE', path, timeout: this.config.timeout },
      apiKey
    );
    return response.data;
  }

  /**
   * Returns all keys for the given application
   * Uses GET /auth/application/:application_id
   */
  async listApplicationKeys(applicationId: number): Promise<AuthKeyListResponse> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/application/${applicationId}`;
    const response = await this.httpClient.request<AuthKeyListResponse>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return response.data;
  }

  /**
   * Returns all keys for the given organization
   * Uses GET /auth/organization/:organization_id
   */
  async listOrganizationKeys(organizationId: number): Promise<AuthKeyListResponse> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/organization/${organizationId}`;
    const response = await this.httpClient.request<AuthKeyListResponse>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return response.data;
  }

  /**
   * Returns all keys associated with the given federation entity
   * Uses GET /auth/federation/:federation_name
   */
  async listFederationKeys(federationName: FederationName): Promise<AuthKeyListResponse> {
    const apiKey = getApiKey(this.config, 'admin');
    const path = `${this.config.endpointUrl}/auth/federation/${federationName}`;
    const response = await this.httpClient.request<AuthKeyListResponse>(
      { method: 'GET', path, timeout: this.config.timeout },
      apiKey
    );
    return response.data;
  }
}

