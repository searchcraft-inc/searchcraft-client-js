/**
 * Authentication types for the Searchcraft API
 *
 * These endpoints are only available for self-hosted instances.
 * Requires an admin level authentication key to access.
 */

/**
 * Individual permission bits a key can carry.
 *
 * The engine stores key permissions as a bitmask, not a fixed set of levels,
 * and the set grows over time. Combine these flags with bitwise OR.
 */
export const permissions = {
  /** Search the key's permitted indexes. */
  SEARCH: 1 << 0,
  /** Add and remove synonyms. */
  MODIFY_SYNONYMS: 1 << 1,
  /** Add and remove stop words. */
  MODIFY_STOP_WORDS: 1 << 2,
  /** Add and remove documents. */
  MODIFY_DOCUMENTS: 1 << 3,
  /** Create and delete indexes. */
  MODIFY_INDEX: 1 << 4,
  /** Create, revoke and modify auth keys. */
  MODIFY_AUTH: 1 << 5,
  /** Generate AI search summaries. */
  LLM_RAG_SUMMARIES: 1 << 6,
  /** Perform LLM-expanded keyword searches. */
  LLM_EXPANDED_KEYWORD_SEARCH: 1 << 7,
  /** Read analytics from the `/measure/dashboard/*` endpoints. */
  READ_ANALYTICS: 1 << 8,
} as const;

/**
 * Conventional permission masks.
 *
 * `READ`, `INGEST`, `ADMIN` and `SUPER_USER` are levels: what a key can
 * change. `AI` and `ANALYTICS` are add-ons for features a key can use on top
 * of its level. Combine them with bitwise OR, e.g. `READ | AI` for a public key
 * that can request AI summaries. Use `|`, not `+`: OR is safe to repeat, while
 * `READ + READ` is `2`, a different permission.
 *
 * `SUPER_USER` includes the AI and analytics bits, so it exceeds 255 — a key
 * permission is a number, never one of a fixed set of levels.
 */
export const permissionPresets = {
  /** Search only, the conventional "read key" (1). */
  READ: permissions.SEARCH,
  /** Search plus document, synonym and stop word writes (15). */
  INGEST:
    permissions.SEARCH |
    permissions.MODIFY_SYNONYMS |
    permissions.MODIFY_STOP_WORDS |
    permissions.MODIFY_DOCUMENTS,
  /** Ingest plus index and auth management (63). */
  ADMIN:
    permissions.SEARCH |
    permissions.MODIFY_SYNONYMS |
    permissions.MODIFY_STOP_WORDS |
    permissions.MODIFY_DOCUMENTS |
    permissions.MODIFY_INDEX |
    permissions.MODIFY_AUTH,
  /** Every permission the engine defines, including AI and analytics (511). */
  SUPER_USER:
    permissions.SEARCH |
    permissions.MODIFY_SYNONYMS |
    permissions.MODIFY_STOP_WORDS |
    permissions.MODIFY_DOCUMENTS |
    permissions.MODIFY_INDEX |
    permissions.MODIFY_AUTH |
    permissions.LLM_RAG_SUMMARIES |
    permissions.LLM_EXPANDED_KEYWORD_SEARCH |
    permissions.READ_ANALYTICS,
  /** Add-on: AI summaries and semantic search (64). */
  AI: permissions.LLM_RAG_SUMMARIES,
  /** Add-on: read the measure dashboards (256). */
  ANALYTICS: permissions.READ_ANALYTICS,
} as const;

/**
 * A key's permission bitmask.
 */
export type AuthKeyPermission = number;

/** Returns true when `mask` carries every bit in `flags`. */
export const hasPermissions = (mask: AuthKeyPermission, flags: number): boolean =>
  (mask & flags) === flags;

/**
 * Status of an authentication key
 */
export type AuthKeyStatus = 'active' | 'inactive';

/**
 * Authentication key object as returned by the API
 */
export interface AuthKey {
  /** The key value used in the `Authorization` header. */
  readonly token: string;
  /** When the key was created. Unchanged by updates. */
  readonly created?: string;
  /** Human-readable name. Null for keys created without one. */
  readonly name?: string | null;
  /** The key's permission bitmask. */
  readonly permissions: AuthKeyPermission;
  /** Indexes the key may access. Null means every index. */
  readonly allowed_indexes?: string[] | null;
  readonly status: AuthKeyStatus;
  readonly organization_id?: string | null;
  readonly organization_name?: string | null;
  readonly application_id?: string | null;
  readonly application_name?: string | null;
  /** Only used for read keys associated with a federation */
  readonly federation_name?: string | null;
}

/**
 * Request payload to create a new authentication key
 */
export interface CreateAuthKeyRequest {
  /** Indexes the new key may access. Omit to grant access to every index. */
  readonly allowed_indexes?: string[];
  readonly permissions: AuthKeyPermission;
  readonly name: string;
  readonly status: AuthKeyStatus;
  readonly organization_id?: string;
  readonly organization_name?: string;
  readonly application_id?: string;
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
