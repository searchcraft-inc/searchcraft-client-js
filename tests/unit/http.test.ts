import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHttpClient } from '../../src/core/http';
import {
    ApiError,
    AuthenticationError,
    NetworkError,
    NotFoundError,
    ValidationError,
    createApiKey,
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
});
