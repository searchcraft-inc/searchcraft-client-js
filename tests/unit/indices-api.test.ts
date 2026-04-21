import { describe, expect, it, vi } from 'vitest';
import { IndexApi } from '../../src/api/indices';
import type { HttpClient } from '../../src/core/http';
import { createApiKey, createIndexName } from '../../src/types/index';

describe('IndexApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    ingestKey: createApiKey('test-ingest-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
  };

  describe('list', () => {
    it('should list all index names', async () => {
      const mockData = { index_names: ['index_a', 'index_b'] };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: mockData },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const result = await api.list();

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: 'http://localhost:8000/index' }),
        'test-read-key'
      );
    });
  });

  describe('get', () => {
    it('should get index configuration', async () => {
      const mockData = { search_fields: ['title'], fields: {}, weight_multipliers: {} };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: mockData },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const result = await api.get(indexName);

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: 'http://localhost:8000/index/test-index' }),
        'test-read-key'
      );
    });
  });

  describe('create', () => {
    it('should create an index with given configuration and inject name into body', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'index created' },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('new-index');
      const indexConfig = { search_fields: ['title', 'body'], fields: {} };

      const result = await api.create(indexName, indexConfig);

      expect(result).toBe('index created');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          path: 'http://localhost:8000/index/new-index',
          body: { index: { name: 'new-index', ...indexConfig } },
        }),
        'test-ingest-key'
      );
    });
  });

  describe('update', () => {
    it('should update an index with partial configuration', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'index updated' },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const partialConfig = { search_fields: ['title', 'body', 'tags'] };

      const result = await api.update(indexName, partialConfig);

      expect(result).toBe('index updated');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          path: 'http://localhost:8000/index/test-index',
          body: partialConfig,
        }),
        'test-ingest-key'
      );
    });

    it('should accept an empty object as partial config', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'index updated' },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');

      const result = await api.update(indexName, {});

      expect(result).toBe('index updated');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PATCH', body: {} }),
        'test-ingest-key'
      );
    });
  });

  describe('delete', () => {
    it('should delete an index', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'index deleted' },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('old-index');

      const result = await api.delete(indexName);

      expect(result).toBe('index deleted');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/index/old-index',
        }),
        'test-ingest-key'
      );
    });
  });

  describe('getStats', () => {
    it('should get stats for all indices', async () => {
      const mockData = {
        index_count: 2,
        indices: [{ index_a: { document_count: 100 } }, { index_b: { document_count: 250 } }],
        total_document_count: 350,
      };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: mockData },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const result = await api.getStats();

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: 'http://localhost:8000/index/stats' }),
        'test-read-key'
      );
    });
  });

  describe('getIndexStats', () => {
    it('should get stats for a specific index', async () => {
      const mockData = { document_count: 100 };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: mockData },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const result = await api.getIndexStats(indexName);

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/index/test-index/stats',
        }),
        'test-read-key'
      );
    });
  });

  describe('getCapabilities', () => {
    it('should GET /index/:index/capabilities and return AI capability flags', async () => {
      const mockData = {
        ai: {
          enabled: true,
          searchSummaryConfigured: true,
          llmProviderConfigured: true,
          llmModelConfigured: false,
        },
      };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: mockData },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const result = await api.getCapabilities(createIndexName('products'));

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/index/products/capabilities',
        }),
        'test-read-key'
      );
    });
  });

  describe('AI config on create/update (engine 0.10.0)', () => {
    it('should allow specifying ai and ai_enabled in create payload', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'index created' },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('ai-index');
      const indexConfig = {
        search_fields: ['title'],
        fields: {},
        ai_enabled: true,
        ai: {
          llm_provider: 'anthropic' as const,
          llm_api_key: 'sk-123',
          search_summary: {
            model: 'claude-sonnet-4-6',
            temperature: 0.2,
          },
        },
      };

      await api.create(indexName, indexConfig);

      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          path: 'http://localhost:8000/index/ai-index',
          body: { index: { name: 'ai-index', ...indexConfig } },
        }),
        'test-ingest-key'
      );
    });

    it('should allow partially patching ai_enabled', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: { status: 200, data: 'index updated' },
        headers: {},
      });

      const api = new IndexApi(mockConfig, mockHttpClient);
      await api.update(createIndexName('ai-index'), { ai_enabled: false });

      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          body: { ai_enabled: false },
        }),
        'test-ingest-key'
      );
    });
  });
});
