import { describe, expect, it, vi } from 'vitest';
import { FederationApi } from '../../src/api/federations';
import type { HttpClient } from '../../src/core/http';
import type { Federation } from '../../src/types/index';
import { createApiKey, createFederationName } from '../../src/types/index';

describe('FederationApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    ingestKey: createApiKey('test-ingest-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
  };

  const mockFederation: Federation = {
    name: 'test_federation',
    friendly_name: 'Test Federation',
    created_at: '2025-01-01T00:00:00Z',
    created_by: '1',
    last_modified: '2025-01-01T00:00:00Z',
    last_modified_by: '1',
    organization_id: '1',
    index_configurations: [
      { name: 'index_a', weight_multiplier: 1.0 },
      { name: 'index_b', weight_multiplier: 0.5 },
    ],
  };

  describe('list', () => {
    it('should list all federations', async () => {
      const mockData = [mockFederation];
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: mockData,
        headers: {},
      });

      const api = new FederationApi(mockConfig, mockHttpClient);
      const result = await api.list();

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: 'http://localhost:8000/federation' }),
        'test-read-key'
      );
    });

    it('should return an empty array when there are no federations', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: [],
        headers: {},
      });

      const api = new FederationApi(mockConfig, mockHttpClient);
      const result = await api.list();

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('should get a specific federation', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: mockFederation,
        headers: {},
      });

      const api = new FederationApi(mockConfig, mockHttpClient);
      const federationName = createFederationName('test_federation');
      const result = await api.get(federationName);

      expect(result).toEqual(mockFederation);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/federation/test_federation',
        }),
        'test-read-key'
      );
    });
  });

  describe('delete', () => {
    it('should delete a federation', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'federation deleted',
        headers: {},
      });

      const api = new FederationApi(mockConfig, mockHttpClient);
      const federationName = createFederationName('old_federation');

      const result = await api.delete(federationName);

      expect(result).toBe('federation deleted');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/federation/old_federation',
        }),
        'test-ingest-key'
      );
    });
  });

  describe('getStats', () => {
    it('should get stats for a specific federation', async () => {
      const mockData = {
        federation_name: 'test_federation',
        num_docs: 350,
        indices: [
          { index_name: 'index_a', num_docs: 100, space_usage: 2048 },
          { index_name: 'index_b', num_docs: 250, space_usage: 4096 },
        ],
      };
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: mockData,
        headers: {},
      });

      const api = new FederationApi(mockConfig, mockHttpClient);
      const federationName = createFederationName('test_federation');
      const result = await api.getStats(federationName);

      expect(result).toEqual(mockData);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/federation/test_federation/stats',
        }),
        'test-read-key'
      );
    });
  });
});
