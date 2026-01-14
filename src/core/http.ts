/**
 * HTTP client for making requests to the Searchcraft API
 */

import type { ApiKey, HttpRequestOptions, HttpResponse } from '../types/index.js';
import { ApiError, AuthenticationError, NetworkError, NotFoundError } from '../types/index.js';

/**
 * HTTP client interface for dependency injection
 */
export interface HttpClient {
  request<T>(options: HttpRequestOptions, apiKey: ApiKey): Promise<HttpResponse<T>>;
}

/**
 * Creates headers for the request
 */
const createHeaders = (
  apiKey: ApiKey,
  customHeaders?: Readonly<Record<string, string>>
): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    Authorization: apiKey,
    ...customHeaders,
  };
};

/**
 * Handles HTTP errors and throws appropriate error types
 */
const handleHttpError = (status: number, data: unknown): never => {
  const errorMessage =
    typeof data === 'object' && data !== null && 'message' in data
      ? String(data.message)
      : 'Request failed';

  switch (status) {
    case 401:
    case 403:
      throw new AuthenticationError(errorMessage);
    case 404:
      throw new NotFoundError(errorMessage);
    default:
      throw new ApiError(errorMessage, status, data);
  }
};

/**
 * Default fetch-based HTTP client implementation
 */
export class FetchHttpClient implements HttpClient {
  async request<T>(options: HttpRequestOptions, apiKey: ApiKey): Promise<HttpResponse<T>> {
    const { method, path, body, headers: customHeaders, timeout = 30000 } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(path, {
        method,
        headers: createHeaders(apiKey, customHeaders),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = (await response.json()) as T;

      if (!response.ok) {
        handleHttpError(response.status, data);
      }

      // Extract headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        data,
        headers: Object.freeze(responseHeaders),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw our custom errors
      if (
        error instanceof ApiError ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }
        throw new NetworkError(error.message);
      }

      throw new NetworkError('Unknown error occurred');
    }
  }
}

/**
 * Creates a default HTTP client
 */
export const createHttpClient = (): HttpClient => {
  return new FetchHttpClient();
};
