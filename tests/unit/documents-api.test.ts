import { describe, expect, it, vi } from 'vitest';
import { DocumentApi } from '../../src/api/documents';
import type { HttpClient } from '../../src/core/http';
import { ValidationError, createApiKey, createIndexName } from '../../src/types/index';

describe('DocumentApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    ingestKey: createApiKey('test-ingest-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
  };

  describe('upsert', () => {
    it('should insert a document', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true },
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const document = { id: '123', title: 'Test' };

      const result = await api.upsert(indexName, document);

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/index/test-index/documents',
          body: [document],
        }),
        'test-ingest-key'
      );
    });

    it('should throw ValidationError if document has no id', async () => {
      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      // Intentionally create an invalid document without id to test validation
      const document = { title: 'Test' } as unknown as DocumentWithId;

      await expect(api.upsert(indexName, document)).rejects.toThrow(ValidationError);
    });
  });

  describe('delete', () => {
    it('should delete a document by query', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true },
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');

      const result = await api.delete(indexName, '123');

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/index/test-index/documents/query',
          body: {
            query: {
              exact: {
                ctx: 'id:123',
              },
            },
          },
        }),
        'test-ingest-key'
      );
    });

    it('should throw ValidationError if documentId is empty', async () => {
      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');

      await expect(api.delete(indexName, '')).rejects.toThrow(ValidationError);
    });
  });

  describe('batchUpsert', () => {
    it('should batch insert documents', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true, count: 2 },
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const documents = [
        { id: '1', title: 'Test 1' },
        { id: '2', title: 'Test 2' },
      ];

      const result = await api.batchUpsert(indexName, documents);

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/index/test-index/documents',
          body: documents,
        }),
        'test-ingest-key'
      );
    });

    it('should throw ValidationError if documents array is empty', async () => {
      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');

      await expect(api.batchUpsert(indexName, [])).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if any document has no id', async () => {
      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      // Intentionally create an array with one invalid document (missing id) to test validation
      const documents = [
        { id: '1', title: 'Test 1' },
        { title: 'Test 2' },
      ] as unknown as ReadonlyArray<DocumentWithId>;

      await expect(api.batchUpsert(indexName, documents)).rejects.toThrow(ValidationError);
    });
  });

  describe('batchDelete', () => {
    it('should batch delete documents by field term match', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true, count: 2 },
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');
      const documentIds = ['1', '2'];

      const result = await api.batchDelete(indexName, documentIds);

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/index/test-index/documents',
          body: { id: documentIds },
        }),
        'test-ingest-key'
      );
    });

    it('should throw ValidationError if documentIds array is empty', async () => {
      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');

      await expect(api.batchDelete(indexName, [])).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteAll', () => {
    it('should delete all documents from an index', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true },
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');

      const result = await api.deleteAll(indexName);

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: 'http://localhost:8000/index/test-index/documents/all',
        }),
        'test-ingest-key'
      );
    });
  });

  describe('get', () => {
    it('should get a document by internal ID', async () => {
      const mockDocument = { id: '123', _id: 'internal-id', title: 'Test' };
      const mockResponse = {
        status: 200,
        data: mockDocument,
      };

      vi.mocked(mockHttpClient.request).mockResolvedValueOnce(mockResponse);

      const api = new DocumentApi(mockConfig, mockHttpClient);
      const indexName = createIndexName('test-index');

      const result = await api.get(indexName, 'internal-id');

      expect(result).toEqual(mockDocument);
      expect(mockHttpClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: 'http://localhost:8000/index/test-index/documents/internal-id',
        }),
        'test-read-key'
      );
    });
  });
});
