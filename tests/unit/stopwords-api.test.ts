import { describe, expect, it, vi } from 'vitest';
import { StopwordsApi } from '../../src/api/stopwords';
import type { HttpClient } from '../../src/core/http';
import { createApiKey, createIndexName } from '../../src/types/index';

describe('StopwordsApi', () => {
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
    it('should get all stopwords for an index', async () => {
      const mockData = ['the', 'a', 'is', 'are'];
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: mockData,
        headers: {},
      });

      const api = new StopwordsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const result = await api.get(indexName);

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/index/test-index/stopwords',
        }),
        'test-read-key'
      );
    });

    it('should return an empty array when there are no stopwords', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: [],
        headers: {},
      });

      const api = new StopwordsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const result = await api.get(indexName);

      expect(result).toEqual([]);
    });
  });

  describe('add', () => {
    it('should add stopwords to an index', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'stopwords added',
        headers: {},
      });

      const api = new StopwordsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const stopwords = ['foo', 'bar', 'baz'];

      const result = await api.add(indexName, stopwords);

      expect(result).toBe('stopwords added');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/index/test-index/stopwords',
          body: stopwords,
        }),
        'test-ingest-key'
      );
    });
  });

  describe('delete', () => {
    it('should delete specific stopwords from an index', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'stopwords deleted',
        headers: {},
      });

      const api = new StopwordsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const stopwords = ['foo', 'bar'];

      const result = await api.delete(indexName, stopwords);

      expect(result).toBe('stopwords deleted');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/index/test-index/stopwords',
          body: stopwords,
        }),
        'test-ingest-key'
      );
    });
  });

  describe('deleteAll', () => {
    it('should delete all stopwords from an index', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'all stopwords deleted',
        headers: {},
      });

      const api = new StopwordsApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');

      const result = await api.deleteAll(indexName);

      expect(result).toBe('all stopwords deleted');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/index/test-index/stopwords/all',
        }),
        'test-ingest-key'
      );
    });
  });
});
