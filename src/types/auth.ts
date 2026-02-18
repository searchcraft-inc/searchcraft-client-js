/**
 * Authentication types for the Searchcraft API
 *
 * These endpoints are only available for self-hosted instances.
 * Requires an admin level authentication key to access.
 */

/**
 * Key permission levels
 * 1 = read, 15 = ingest, 63 = admin
 */
export type AuthKeyPermission = 1 | 15 | 63;

/**
 * Status of an authentication key
 */
export type AuthKeyStatus = 'active' | 'inactive';

/**
 * Authentication key object as returned by the API
 */
export interface AuthKey {
  readonly key: string;
  readonly name: string;
  readonly permissions: AuthKeyPermission;
  readonly allowed_indexes: string[];
  readonly status: AuthKeyStatus;
  readonly organization_id?: number;
  readonly organization_name?: string;
  readonly application_id?: number;
  readonly application_name?: string;
  /** Only used for read keys associated with a federation */
  readonly federation_name?: string;
}

/**
 * Request payload to create a new authentication key
 */
export interface CreateAuthKeyRequest {
  readonly allowed_indexes: string[];
  readonly permissions: AuthKeyPermission;
  readonly name: string;
  readonly status: AuthKeyStatus;
  readonly organization_id?: number;
  readonly organization_name?: string;
  readonly application_id?: number;
  readonly application_name?: string;
  /** Only needed for read keys associated with a federation */
  readonly federation_name?: string;
}

/**
 * Request payload to update an existing authentication key.
 * All fields are optional - only include the fields you want to update.
 */
export type UpdateAuthKeyRequest = Partial<CreateAuthKeyRequest>;

/**
 * Response containing a list of authentication keys
 */
export type AuthKeyListResponse = AuthKey[];

