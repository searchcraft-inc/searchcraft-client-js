/**
 * Configuration management for Searchcraft client
 */

import type { ApiKey, SearchcraftConfig } from '../types/index.js';
import { ConfigurationError } from '../types/index.js';

/**
 * Validates the configuration object
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
 * Creates a normalized configuration object
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
 * Gets the appropriate API key for the operation
 */
export const getApiKey = (
  config: Readonly<SearchcraftConfig>,
  operation: 'read' | 'write'
): ApiKey => {
  const key = operation === 'read' ? config.readKey : config.ingestKey;

  if (!key) {
    throw new ConfigurationError(
      `${operation === 'read' ? 'readKey' : 'ingestKey'} is required for this operation`
    );
  }

  return key;
};
