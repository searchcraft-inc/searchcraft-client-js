import { describe, expect, it } from 'vitest';
import { createApiKey, createClient } from '../../src/index';

describe('SearchcraftClient', () => {
  it('should create a client with valid configuration', () => {
    const client = createClient({
      endpointUrl: 'http://localhost:8000',
      readKey: createApiKey('test-read-key'),
    });

    expect(client).toBeDefined();
    expect(client.search).toBeDefined();
    expect(client.documents).toBeDefined();
    expect(client.health).toBeDefined();
  });

  it('should create a client with both read and ingest keys', () => {
    const client = createClient({
      endpointUrl: 'http://localhost:8000',
      readKey: createApiKey('test-read-key'),
      ingestKey: createApiKey('test-ingest-key'),
    });

    expect(client).toBeDefined();
  });

  it('should create a client with custom timeout', () => {
    const client = createClient({
      endpointUrl: 'http://localhost:8000',
      readKey: createApiKey('test-read-key'),
      timeout: 60000,
    });

    expect(client).toBeDefined();
  });

  it('should create a client with custom headers', () => {
    const client = createClient({
      endpointUrl: 'http://localhost:8000',
      readKey: createApiKey('test-read-key'),
      headers: { 'X-Custom': 'value' },
    });

    expect(client).toBeDefined();
  });

  it('should expose config getter', () => {
    const client = createClient({
      endpointUrl: 'http://localhost:8000',
      readKey: createApiKey('test-read-key'),
    });

    expect(client.config).toBeDefined();
    expect(client.config.endpointUrl).toBe('http://localhost:8000');
  });

  it('should expose httpClient getter', () => {
    const client = createClient({
      endpointUrl: 'http://localhost:8000',
      readKey: createApiKey('test-read-key'),
    });

    expect(client.httpClient).toBeDefined();
  });
});
