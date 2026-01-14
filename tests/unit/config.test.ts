import { describe, expect, it } from 'vitest';
import { createConfig, getApiKey, validateConfig } from '../../src/core/config';
import { ConfigurationError } from '../../src/types/index';
import { createApiKey } from '../../src/types/index';

describe('config', () => {
  describe('validateConfig', () => {
    it('should accept valid configuration', () => {
      const config = {
        endpointUrl: 'http://localhost:8000',
        readKey: createApiKey('test-read-key'),
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should reject missing endpointUrl', () => {
      const config = {
        endpointUrl: '',
        readKey: createApiKey('test-read-key'),
      };
      expect(() => validateConfig(config)).toThrow(ConfigurationError);
    });

    it('should reject invalid URL', () => {
      const config = {
        endpointUrl: 'not-a-url',
        readKey: createApiKey('test-read-key'),
      };
      expect(() => validateConfig(config)).toThrow(ConfigurationError);
    });

    it('should reject missing API keys', () => {
      const config = {
        endpointUrl: 'http://localhost:8000',
      };
      expect(() => validateConfig(config)).toThrow(ConfigurationError);
    });

    it('should accept ingestKey only', () => {
      const config = {
        endpointUrl: 'http://localhost:8000',
        ingestKey: createApiKey('test-ingest-key'),
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should reject invalid timeout', () => {
      const config = {
        endpointUrl: 'http://localhost:8000',
        readKey: createApiKey('test-read-key'),
        timeout: -1,
      };
      expect(() => validateConfig(config)).toThrow(ConfigurationError);
    });
  });

  describe('createConfig', () => {
    it('should normalize configuration', () => {
      const config = createConfig({
        endpointUrl: 'http://localhost:8000/',
        readKey: createApiKey('test-read-key'),
      });

      expect(config.endpointUrl).toBe('http://localhost:8000');
      expect(config.timeout).toBe(30000);
    });

    it('should preserve custom timeout', () => {
      const config = createConfig({
        endpointUrl: 'http://localhost:8000',
        readKey: createApiKey('test-read-key'),
        timeout: 60000,
      });

      expect(config.timeout).toBe(60000);
    });

    it('should freeze configuration', () => {
      const config = createConfig({
        endpointUrl: 'http://localhost:8000',
        readKey: createApiKey('test-read-key'),
      });

      expect(Object.isFrozen(config)).toBe(true);
    });

    it('should freeze custom headers', () => {
      const config = createConfig({
        endpointUrl: 'http://localhost:8000',
        readKey: createApiKey('test-read-key'),
        headers: { 'X-Custom': 'value' },
      });

      expect(Object.isFrozen(config.headers)).toBe(true);
    });
  });

  describe('getApiKey', () => {
    it('should return readKey for read operations', () => {
      const config = createConfig({
        endpointUrl: 'http://localhost:8000',
        readKey: createApiKey('test-read-key'),
        ingestKey: createApiKey('test-ingest-key'),
      });

      expect(getApiKey(config, 'read')).toBe('test-read-key');
    });

    it('should return ingestKey for write operations', () => {
      const config = createConfig({
        endpointUrl: 'http://localhost:8000',
        readKey: createApiKey('test-read-key'),
        ingestKey: createApiKey('test-ingest-key'),
      });

      expect(getApiKey(config, 'write')).toBe('test-ingest-key');
    });

    it('should throw if readKey is missing for read operation', () => {
      const config = createConfig({
        endpointUrl: 'http://localhost:8000',
        ingestKey: createApiKey('test-ingest-key'),
      });

      expect(() => getApiKey(config, 'read')).toThrow(ConfigurationError);
    });

    it('should throw if ingestKey is missing for write operation', () => {
      const config = createConfig({
        endpointUrl: 'http://localhost:8000',
        readKey: createApiKey('test-read-key'),
      });

      expect(() => getApiKey(config, 'write')).toThrow(ConfigurationError);
    });
  });
});
