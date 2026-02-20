import { describe, expect, it, vi } from 'vitest';
import { TransactionApi } from '../../src/api/transactions';
import type { HttpClient } from '../../src/core/http';
import { createApiKey, createIndexName } from '../../src/types/index';

describe('TransactionApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    ingestKey: createApiKey('test-ingest-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
  };

  describe('commit', () => {
    it('should commit a transaction for the given index', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'transaction committed',
        headers: {},
      });

      const api = new TransactionApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const result = await api.commit(indexName);

      expect(result).toBe('transaction committed');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/index/test-index/commit',
        }),
        'test-ingest-key'
      );
    });

    it('should use the ingest key for commit', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'ok',
        headers: {},
      });

      const api = new TransactionApi(mockConfig, mockHttpClient);
      await api.commit(createIndexName('my-index'));

      expect(mockHttpClient.request).toHaveBeenCalledWith(expect.anything(), 'test-ingest-key');
    });
  });

  describe('rollback', () => {
    it('should roll back a transaction for the given index', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'transaction rolled back',
        headers: {},
      });

      const api = new TransactionApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const result = await api.rollback(indexName);

      expect(result).toBe('transaction rolled back');
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/index/test-index/rollback',
        }),
        'test-ingest-key'
      );
    });

    it('should use the ingest key for rollback', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        data: 'ok',
        headers: {},
      });

      const api = new TransactionApi(mockConfig, mockHttpClient);
      await api.rollback(createIndexName('my-index'));

      expect(mockHttpClient.request).toHaveBeenCalledWith(expect.anything(), 'test-ingest-key');
    });
  });
});
