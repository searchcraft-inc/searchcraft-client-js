import { describe, expect, it, vi } from 'vitest';
import { SearchApi } from '../../src/api/search';
import type { HttpClient } from '../../src/core/http';
import { createApiKey, createFederationName, createIndexName } from '../../src/types/index';

describe('SearchApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
  };

  describe('searchIndex', () => {
    it('should perform a search on an index', async () => {
      const mockData = {
        hits: [],
        count: 0,
        time_taken: 0.1,
      };

      const mockResponse = {
        status: 200,
        data: mockData,
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const api = new SearchApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const request = {
        query: { fuzzy: { ctx: 'test' } },
        limit: 10,
      };

      const result = await api.searchIndex(indexName, request);

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/index/test-index/search',
          body: request,
        }),
        'test-read-key'
      );
    });

    it('should validate limit parameter', async () => {
      const api = new SearchApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const request = {
        query: { fuzzy: { ctx: 'test' } },
        limit: 201, // Over the limit
      };

      await expect(api.searchIndex(indexName, request)).rejects.toThrow();
    });

    it('should validate offset parameter', async () => {
      const api = new SearchApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const request = {
        query: { fuzzy: { ctx: 'test' } },
        offset: -1, // Invalid offset
      };

      await expect(api.searchIndex(indexName, request)).rejects.toThrow();
    });
  });

  describe('searchFederation', () => {
    it('should validate offset parameter', async () => {
      const api = new SearchApi(mockConfig, mockHttpClient);
      const federationName = createFederationName('test-federation');
      const request = {
        query: { fuzzy: { ctx: 'test' } },
        offset: -1,
      };

      await expect(api.searchFederation(federationName, request)).rejects.toThrow();
    });

    it('should perform a federated search', async () => {
      const mockData = {
        hits: [],
        count: 0,
        time_taken: 0.1,
      };

      const mockResponse = {
        status: 200,
        data: mockData,
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const api = new SearchApi(mockConfig, mockHttpClient);
      const federationName = createFederationName('test-federation');
      const request = {
        query: { fuzzy: { ctx: 'test' } },
        limit: 10,
      };

      const result = await api.searchFederation(federationName, request);

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/federation/test-federation/search',
          body: request,
        }),
        'test-read-key'
      );
    });
  });
});
