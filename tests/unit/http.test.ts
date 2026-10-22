import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHttpClient } from '../../src/core/http';
import {
  ApiError,
  AuthenticationError,
  createApiKey,
  NetworkError,
  NotFoundError,
  RequestAbortedError,
} from '../../src/types/index';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('HttpClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('successful requests', () => {
    it('should make a GET request', async () => {
      const mockData = { test: 'value' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => mockData,
      });

      const client = createHttpClient();
      const result = await client.request(
        {
          method: 'GET',
          path: 'http://localhost:8000/test',
        },
        createApiKey('test-key')
      );

      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'test-key',
          }),
        })
      );
    });

    it('should make a POST request with body', async () => {
      const mockData = { id: '123' };
      const requestBody = { name: 'test' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => mockData,
      });

      const client = createHttpClient();
      const result = await client.request(
        {
          method: 'POST',
          path: 'http://localhost:8000/test',
          body: requestBody,
        },
        createApiKey('test-key')
      );

      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should set a User-Agent header in Node.js environments', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      });

      const client = createHttpClient();
      await client.request(
        { method: 'GET', path: 'http://localhost:8000/test' },
        createApiKey('test-key')
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringMatching(/^searchcraft-client-js\/\d+\.\d+\.\d+/),
          }),
        })
      );
    });

    it('should allow custom headers to override User-Agent', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      });

      const client = createHttpClient();
      await client.request(
        {
          method: 'GET',
          path: 'http://localhost:8000/test',
          headers: { 'User-Agent': 'my-app/1.0' },
        },
        createApiKey('test-key')
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({ 'User-Agent': 'my-app/1.0' }),
        })
      );
    });

    it('should include custom headers', async () => {
      const mockResponse = { data: {} };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => mockResponse,
      });

      const client = createHttpClient();
      await client.request(
        {
          method: 'GET',
          path: 'http://localhost:8000/test',
          headers: { 'X-Custom': 'value' },
        },
        createApiKey('test-key')
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'value',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw AuthenticationError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers(),
        json: async () => ({ error: 'Invalid API key' }),
      });

      const client = createHttpClient();
      await expect(
        client.request(
          {
            method: 'GET',
            path: 'http://localhost:8000/test',
          },
          createApiKey('invalid-key')
        )
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError on 403', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers(),
        json: async () => ({ error: 'Forbidden' }),
      });

      const client = createHttpClient();
      await expect(
        client.request(
          {
            method: 'GET',
            path: 'http://localhost:8000/test',
          },
          createApiKey('test-key')
        )
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        json: async () => ({ error: 'Resource not found' }),
      });

      const client = createHttpClient();
      await expect(
        client.request(
          {
            method: 'GET',
            path: 'http://localhost:8000/test',
          },
          createApiKey('test-key')
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ApiError on other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        json: async () => ({ error: 'Server error' }),
      });

      const client = createHttpClient();
      await expect(
        client.request(
          {
            method: 'GET',
            path: 'http://localhost:8000/test',
          },
          createApiKey('test-key')
        )
      ).rejects.toThrow(ApiError);
    });

    it('should throw NetworkError on timeout', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            setTimeout(() => reject(error), 10);
          })
      );

      const client = createHttpClient();
      await expect(
        client.request(
          {
            method: 'GET',
            path: 'http://localhost:8000/test',
            timeout: 5,
          },
          createApiKey('test-key')
        )
      ).rejects.toThrow(NetworkError);
    });

    it('should throw NetworkError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      const client = createHttpClient();
      await expect(
        client.request(
          {
            method: 'GET',
            path: 'http://localhost:8000/test',
          },
          createApiKey('test-key')
        )
      ).rejects.toThrow(NetworkError);
    });

    it('should throw NetworkError with unknown message when a non-Error value is thrown', async () => {
      mockFetch.mockRejectedValueOnce('raw string error');

      const client = createHttpClient();
      const error = await client
        .request({ method: 'GET', path: 'http://localhost:8000/test' }, createApiKey('test-key'))
        .catch((e) => e);

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Unknown error occurred');
    });

    it('should extract the error message from the engine envelope', async () => {
      // The engine reports failures through the same { status, data } envelope
      // it uses for successes, with the message as the `data` string.
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers(),
        json: async () => ({ status: 400, data: 'index does not exist' }),
      });

      const client = createHttpClient();
      await expect(
        client.request(
          { method: 'GET', path: 'http://localhost:8000/index/nope' },
          createApiKey('test-key')
        )
      ).rejects.toThrow('index does not exist');
    });

    it('should extract error message from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers(),
        json: async () => ({ message: 'Custom error message' }),
      });

      const client = createHttpClient();
      await expect(
        client.request(
          {
            method: 'GET',
            path: 'http://localhost:8000/test',
          },
          createApiKey('test-key')
        )
      ).rejects.toThrow('Custom error message');
    });
  });

  describe('stream', () => {
    function makeBodyStream(body: string): ReadableStream<Uint8Array> {
      const encoder = new TextEncoder();
      return new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(body));
          controller.close();
        },
      });
    }

    it('returns a readable stream for SSE responses', async () => {
      const sse = 'event: delta\ndata: hi\n\n';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: makeBodyStream(sse),
      });

      const client = createHttpClient();
      const response = await client.stream(
        { method: 'POST', path: 'http://localhost:8000/stream', body: { q: 1 } },
        createApiKey('test-key')
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }
      expect(text).toBe(sse);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/stream',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'test-key',
            Accept: 'text/event-stream',
          }),
          body: JSON.stringify({ q: 1 }),
        })
      );
    });

    it('throws AuthenticationError on 401 and does not return a body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
        json: async () => ({ message: 'Unauthorized' }),
        text: async () => 'Unauthorized',
      });

      const client = createHttpClient();
      await expect(
        client.stream({ method: 'POST', path: 'http://localhost:8000/stream' }, createApiKey('bad'))
      ).rejects.toThrow(AuthenticationError);
    });

    it('throws NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
        json: async () => ({ message: 'not found' }),
        text: async () => 'not found',
      });

      const client = createHttpClient();
      await expect(
        client.stream({ method: 'POST', path: 'http://localhost:8000/stream' }, createApiKey('k'))
      ).rejects.toThrow(NotFoundError);
    });

    it('throws ApiError on other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: async () => ({ message: 'boom' }),
        text: async () => 'boom',
      });

      const client = createHttpClient();
      await expect(
        client.stream({ method: 'POST', path: 'http://localhost:8000/stream' }, createApiKey('k'))
      ).rejects.toThrow(ApiError);
    });

    it('throws NetworkError on timeout', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            setTimeout(() => reject(err), 5);
          })
      );

      const client = createHttpClient();
      await expect(
        client.stream(
          { method: 'POST', path: 'http://localhost:8000/stream', timeout: 1 },
          createApiKey('k')
        )
      ).rejects.toThrow(NetworkError);
    });
  });
  describe('abort signal', () => {
    // Mimics fetch: rejects with the signal's reason once the signal aborts.
    const abortableFetch = () =>
      mockFetch.mockImplementationOnce(
        (_url: string, init: RequestInit) =>
          new Promise((_, reject) => {
            init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
          })
      );

    it('request rejects with RequestAbortedError when aborted mid-flight', async () => {
      abortableFetch();
      const controller = new AbortController();
      const client = createHttpClient();

      const pending = client.request(
        { method: 'GET', path: 'http://localhost:8000/test', signal: controller.signal },
        createApiKey('k')
      );
      controller.abort('stale');

      const error = await pending.catch((e) => e);
      expect(error).toBeInstanceOf(RequestAbortedError);
      expect(error).not.toBeInstanceOf(NetworkError);
      expect(error.reason).toBe('stale');
    });

    it('request does not call fetch when the signal is already aborted', async () => {
      const client = createHttpClient();
      await expect(
        client.request(
          { method: 'GET', path: 'http://localhost:8000/test', signal: AbortSignal.abort() },
          createApiKey('k')
        )
      ).rejects.toThrow(RequestAbortedError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('request still reports a timeout as NetworkError when a signal is supplied', async () => {
      abortableFetch();
      const client = createHttpClient();
      const error = await client
        .request(
          {
            method: 'GET',
            path: 'http://localhost:8000/test',
            timeout: 5,
            signal: new AbortController().signal,
          },
          createApiKey('k')
        )
        .catch((e) => e);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Request timeout');
    });

    // The caller gives up after the timeout fired but before fetch settled.
    const timeoutThenCallerAbortFetch = (controller: AbortController) =>
      mockFetch.mockImplementationOnce(
        (_url: string, init: RequestInit) =>
          new Promise((_, reject) => {
            init.signal?.addEventListener('abort', () => {
              controller.abort();
              reject(init.signal?.reason);
            });
          })
      );

    it('request reports the timeout when it fires before a caller abort', async () => {
      const controller = new AbortController();
      timeoutThenCallerAbortFetch(controller);
      const client = createHttpClient();

      const error = await client
        .request(
          {
            method: 'GET',
            path: 'http://localhost:8000/test',
            timeout: 5,
            signal: controller.signal,
          },
          createApiKey('k')
        )
        .catch((e) => e);
      expect(controller.signal.aborted).toBe(true);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Request timeout');
    });

    it('request keeps an HTTP error when the caller aborts after it occurred', async () => {
      const controller = new AbortController();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: async () => {
          controller.abort();
          return { message: 'Server error' };
        },
      });
      const client = createHttpClient();

      await expect(
        client.request(
          { method: 'GET', path: 'http://localhost:8000/test', signal: controller.signal },
          createApiKey('k')
        )
      ).rejects.toThrow(ApiError);
    });

    it('stream reports the timeout when it fires before a caller abort', async () => {
      const controller = new AbortController();
      timeoutThenCallerAbortFetch(controller);
      const client = createHttpClient();

      const error = await client
        .stream(
          {
            method: 'POST',
            path: 'http://localhost:8000/stream',
            timeout: 5,
            signal: controller.signal,
          },
          createApiKey('k')
        )
        .catch((e) => e);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe('Request timeout');
    });

    it('stream rejects with RequestAbortedError when aborted before the response', async () => {
      abortableFetch();
      const controller = new AbortController();
      const client = createHttpClient();

      const pending = client.stream(
        { method: 'POST', path: 'http://localhost:8000/stream', signal: controller.signal },
        createApiKey('k')
      );
      controller.abort();

      await expect(pending).rejects.toThrow(RequestAbortedError);
    });

    it('stream passes a signal to fetch that aborts with the caller signal', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        body: new ReadableStream(),
      });
      const controller = new AbortController();
      const client = createHttpClient();
      await client.stream(
        { method: 'POST', path: 'http://localhost:8000/stream', signal: controller.signal },
        createApiKey('k')
      );

      const fetchSignal = mockFetch.mock.calls[0]?.[1]?.signal as AbortSignal;
      expect(fetchSignal.aborted).toBe(false);
      controller.abort();
      expect(fetchSignal.aborted).toBe(true);
    });
  });
});
