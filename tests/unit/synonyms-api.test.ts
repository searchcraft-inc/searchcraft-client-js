import { describe, expect, it, vi } from 'vitest';
import { SynonymsApi } from '../../src/api/synonyms';
import type { HttpClient } from '../../src/core/http';
import { createApiKey, createIndexName } from '../../src/types/index';

describe('SynonymsApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    ingestKey: createApiKey('test-ingest-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
  };

  describe('get', () => {
    it('should get all synonyms for an index', async () => {
      const mockData = { nyc: ['new york city'], usa: ['united states'] };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: mockData,
        headers: {},
      });

      const api = new SynonymsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const result = await api.get(indexName);

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/index/test-index/synonyms',
        }),
        'test-read-key'
      );
    });

    it('should return an empty map when there are no synonyms', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: {},
        headers: {},
      });

      const api = new SynonymsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const result = await api.get(indexName);

      expect(result).toEqual({});
    });
  });

  describe('add', () => {
    it('should add synonyms to an index', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'synonyms added',
        headers: {},
      });

      const api = new SynonymsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const synonyms = ['nyc:new york city', 'usa:united states'];

      const result = await api.add(indexName, synonyms);

      expect(result).toBe('synonyms added');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/index/test-index/synonyms',
          body: synonyms,
        }),
        'test-ingest-key'
      );
    });
  });

  describe('delete', () => {
    it('should delete specific synonyms from an index', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'synonyms deleted',
        headers: {},
      });

      const api = new SynonymsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const synonyms = ['nyc:new york city'];

      const result = await api.delete(indexName, synonyms);

      expect(result).toBe('synonyms deleted');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/index/test-index/synonyms',
          body: synonyms,
        }),
        'test-ingest-key'
      );
    });
  });

  describe('deleteAll', () => {
    it('should delete all synonyms from an index', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'all synonyms deleted',
        headers: {},
      });

      const api = new SynonymsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');

      const result = await api.deleteAll(indexName);

      expect(result).toBe('all synonyms deleted');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/index/test-index/synonyms/all',
        }),
        'test-ingest-key'
      );
    });
  });
});
