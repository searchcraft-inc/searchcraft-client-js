import { describe, expect, it } from 'vitest';
import type { HttpClient } from '../../src/core/http';
import { createApiKey, createClient } from '../../src/index';
import type { SearchcraftConfig } from '../../src/types/index';

/** Shape of the private fields these tests assert are wired up. */
interface ClientInternals {
  readonly config: SearchcraftConfig;
  readonly httpClient: HttpClient;
}

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
    expect(client.indices).toBeDefined();
    expect(client.federations).toBeDefined();
    expect(client.synonyms).toBeDefined();
    expect(client.stopwords).toBeDefined();
    expect(client.transactions).toBeDefined();
    expect(client.measure).toBeDefined();
    expect(client.auth).toBeDefined();
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

    // `config` is private; reach past the access modifier to assert internal wiring.
    const internals = client as unknown as ClientInternals;
    expect(internals.config).toBeDefined();
    expect(internals.config.endpointUrl).toBe('http://localhost:8000');
  });

  it('should expose httpClient getter', () => {
    const client = createClient({
      endpointUrl: 'http://localhost:8000',
      readKey: createApiKey('test-read-key'),
    });

    const internals = client as unknown as ClientInternals;
    expect(internals.httpClient).toBeDefined();
  });

  it('should return frozen config via getConfig()', () => {
    const client = createClient({
      endpointUrl: 'http://localhost:8000',
      readKey: createApiKey('test-read-key'),
    });

    const config = client.getConfig();
    expect(config).toBeDefined();
    expect(config.endpointUrl).toBe('http://localhost:8000');
  });
});
