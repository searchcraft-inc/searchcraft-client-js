import { describe, expect, it, vi } from 'vitest';
import { SearchApi } from '../../src/api/search';
import type { HttpClient } from '../../src/core/http';
import {
  createApiKey,
  createFederationName,
  createIndexName,
  RequestAbortedError,
} from '../../src/types/index';

function stringsToStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe('SearchApi', () => {
  const mockConfig = {
    endpointUrl: 'http://localhost:8000',
    readKey: createApiKey('test-read-key'),
    timeout: 30000,
  };

  const mockHttpClient: HttpClient = {
    request: vi.fn(),
    stream: vi.fn(),
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
        headers: {},
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

  describe('searchSummary', () => {
    it('should stream SSE events from POST /index/:index/search/summary', async () => {
      const sseBody =
        'event: metadata\ndata: {"results_count":3,"cached":false}\n\n' +
        'event: delta\ndata: {"content":"Hello"}\n\n' +
        'event: delta\ndata: {"content":" world"}\n\n' +
        'event: done\ndata: {"results_count":3}\n\n';

      vi.mocked(mockHttpClient.stream).mockResolvedValueOnce({
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
        body: stringsToStream([sseBody]),
      });

      const api = new SearchApi(mockConfig, mockHttpClient);
      const request = { query: { fuzzy: { ctx: 'laptop' } }, limit: 5 };

      const events = [];
      for await (const event of api.searchSummary(createIndexName('products'), request)) {
        events.push(event);
      }

      expect(events).toEqual([
        { type: 'metadata', data: { results_count: 3, cached: false } },
        { type: 'delta', data: { content: 'Hello' } },
        { type: 'delta', data: { content: ' world' } },
        { type: 'done', data: { results_count: 3 } },
      ]);

      expect(mockHttpClient.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: 'http://localhost:8000/index/products/search/summary',
          body: request,
        }),
        'test-read-key'
      );
    });

    it('should emit an error event when the server sends one', async () => {
      const sseBody = 'event: error\ndata: {"message":"LLM unavailable"}\n\n';
      vi.mocked(mockHttpClient.stream).mockResolvedValueOnce({
        status: 200,
        headers: {},
        body: stringsToStream([sseBody]),
      });

      const api = new SearchApi(mockConfig, mockHttpClient);
      const events = [];
      for await (const event of api.searchSummary(createIndexName('products'), {
        query: { fuzzy: { ctx: 'x' } },
      })) {
        events.push(event);
      }
      expect(events).toEqual([{ type: 'error', data: { message: 'LLM unavailable' } }]);
    });

    it('should validate limit before streaming', async () => {
      const api = new SearchApi(mockConfig, mockHttpClient);
      const iter = api.searchSummary(createIndexName('products'), {
        query: { fuzzy: { ctx: 'x' } },
        limit: 201,
      });
      await expect(iter[Symbol.asyncIterator]().next()).rejects.toThrow();
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
        headers: {},
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
  describe('abort signal', () => {
    const request = { query: { fuzzy: { ctx: 'laptop' } } };

    it('forwards the signal for searchIndex', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: {},
      });
      const { signal } = new AbortController();
      await new SearchApi(mockConfig, mockHttpClient).searchIndex(
        createIndexName('products'),
        request,
        { signal }
      );
      expect(mockHttpClient.request).toHaveBeenLastCalledWith(
        expect.objectContaining({ signal }),
        expect.anything()
      );
    });

    it('forwards the signal for searchFederation', async () => {
      vi.mocked(mockHttpClient.request).mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: {},
      });
      const { signal } = new AbortController();
      await new SearchApi(mockConfig, mockHttpClient).searchFederation(
        createFederationName('global'),
        request,
        { signal }
      );
      expect(mockHttpClient.request).toHaveBeenLastCalledWith(
        expect.objectContaining({ signal }),
        expect.anything()
      );
    });

    it('searchSummary throws RequestAbortedError when aborted mid-stream', async () => {
      const controller = new AbortController();
      const encoder = new TextEncoder();
      const body = new ReadableStream<Uint8Array>({
        start(c) {
          c.enqueue(encoder.encode('event: delta\ndata: {"content":"a"}\n\n'));
          controller.signal.addEventListener('abort', () => c.error(controller.signal.reason));
        },
      });
      vi.mocked(mockHttpClient.stream).mockResolvedValueOnce({ status: 200, headers: {}, body });

      const iter = new SearchApi(mockConfig, mockHttpClient).searchSummary(
        createIndexName('products'),
        request,
        { signal: controller.signal }
      );

      const first = await iter[Symbol.asyncIterator]().next();
      expect(first.value).toEqual({ type: 'delta', data: { content: 'a' } });

      const it = iter[Symbol.asyncIterator]();
      const next = it.next();
      controller.abort();
      await expect(next).rejects.toThrow(RequestAbortedError);
    });

    it('searchSummary does not yield buffered events after an abort', async () => {
      const controller = new AbortController();
      const body = stringsToStream([
        'event: delta\ndata: {"content":"a"}\n\nevent: delta\ndata: {"content":"b"}\n\n',
      ]);
      vi.mocked(mockHttpClient.stream).mockResolvedValueOnce({ status: 200, headers: {}, body });

      const it = new SearchApi(mockConfig, mockHttpClient)
        .searchSummary(createIndexName('products'), request, { signal: controller.signal })
        [Symbol.asyncIterator]();

      const first = await it.next();
      expect(first.value).toEqual({ type: 'delta', data: { content: 'a' } });

      controller.abort();
      await expect(it.next()).rejects.toThrow(RequestAbortedError);
    });

    it('searchSummary does not complete normally when aborted on the last event', async () => {
      const controller = new AbortController();
      const body = stringsToStream(['event: done\ndata: {"results_count":1}\n\n']);
      vi.mocked(mockHttpClient.stream).mockResolvedValueOnce({ status: 200, headers: {}, body });

      const it = new SearchApi(mockConfig, mockHttpClient)
        .searchSummary(createIndexName('products'), request, { signal: controller.signal })
        [Symbol.asyncIterator]();

      await it.next();
      controller.abort();
      await expect(it.next()).rejects.toThrow(RequestAbortedError);
    });
  });
});
