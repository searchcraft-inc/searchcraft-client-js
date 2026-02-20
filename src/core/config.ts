/**
 * Configuration management for Searchcraft client
 */

import type { ApiKey, SearchcraftConfig } from '../types/index.js';
import { ConfigurationError } from '../types/index.js';

/**
 * Validates the configuration object.
 * @param config - The configuration object to validate.
 * @throws {ConfigurationError} When `endpointUrl` is missing or not a valid URL.
 * @throws {ConfigurationError} When neither `readKey` nor `ingestKey` is provided.
 * @throws {ConfigurationError} When `timeout` is provided but is not a positive number.
 */
export const validateConfig = (config: SearchcraftConfig): void => {
  if (!config.endpointUrl) {
    throw new ConfigurationError('endpointUrl is required');
  }

  // Validate URL format
  try {
    new URL(config.endpointUrl);
  } catch {
    throw new ConfigurationError('endpointUrl must be a valid URL');
  }

  // At least one key should be provided
  if (!config.readKey && !config.ingestKey) {
    throw new ConfigurationError('At least one of readKey or ingestKey must be provided');
  }

  // Validate timeout if provided
  if (config.timeout !== undefined && config.timeout <= 0) {
    throw new ConfigurationError('timeout must be a positive number');
  }
};

/**
 * Creates a normalized, immutable configuration object.
 * Validates the input, strips trailing slashes from `endpointUrl`, and applies defaults.
 * @param config - The raw configuration supplied by the caller.
 * @returns A frozen {@link SearchcraftConfig} with defaults applied.
 * @throws {ConfigurationError} When validation fails (see {@link validateConfig}).
 */
export const createConfig = (config: SearchcraftConfig): Readonly<SearchcraftConfig> => {
  validateConfig(config);

  // Remove trailing slash from endpoint URL
  const endpointUrl = config.endpointUrl.replace(/\/$/, '');

  return Object.freeze({
    ...config,
    endpointUrl,
    timeout: config.timeout ?? 30000, // Default 30 seconds
    headers: config.headers ? Object.freeze({ ...config.headers }) : undefined,
  });
};

/**
 * Gets the appropriate API key for the given operation type.
 * @param config - The client configuration containing the API keys.
 * @param operation - The operation type: `'read'` uses `readKey`, `'write'` uses `ingestKey`, `'admin'` uses `adminKey`.
 * @returns The API key string for the requested operation.
 * @throws {ConfigurationError} When the required key for the operation is not set in the configuration.
 */
export const getApiKey = (
  config: Readonly<SearchcraftConfig>,
  operation: 'read' | 'write' | 'admin'
): ApiKey => {
  let key: ApiKey | undefined;
  let keyName: string;

  if (operation === 'read') {
    key = config.readKey;
    keyName = 'readKey';
  } else if (operation === 'write') {
    key = config.ingestKey;
    keyName = 'ingestKey';
  } else {
    key = config.adminKey;
    keyName = 'adminKey';
  }

  if (!key) {
    throw new ConfigurationError(`${keyName} is required for this operation`);
  }

  return key;
};
