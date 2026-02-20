/**
 * HTTP client for making requests to the Searchcraft API
 */

import type { ApiKey, HttpRequestOptions, HttpResponse } from '../types/index.js';
import { ApiError, AuthenticationError, NetworkError, NotFoundError } from '../types/index.js';

/**
 * HTTP client interface for dependency injection
 */
export interface HttpClient {
  /**
   * Executes an HTTP request against the Searchcraft API.
   * @param options - Request options including method, path, optional body, headers, and timeout.
   * @param apiKey - The API key to use for the Authorization header.
   * @returns A promise resolving to the typed HTTP response.
   * @throws {AuthenticationError} When the server responds with 401 or 403.
   * @throws {NotFoundError} When the server responds with 404.
   * @throws {ApiError} When the server responds with any other non-2xx status.
   * @throws {NetworkError} When the request times out or a network-level failure occurs.
   */
  request<T>(options: HttpRequestOptions, apiKey: ApiKey): Promise<HttpResponse<T>>;
}

/**
 * Creates headers for the request.
 * @param apiKey - The API key used for the `Authorization` header.
 * @param customHeaders - Optional additional headers to merge in (override defaults).
 * @returns A headers record with `Content-Type` and `Authorization` set.
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
 * Handles HTTP errors and throws the appropriate typed error.
 * @param status - The HTTP response status code.
 * @param data - The parsed response body, used to extract the error message.
 * @throws {AuthenticationError} When `status` is 401 or 403.
 * @throws {NotFoundError} When `status` is 404.
 * @throws {ApiError} For all other non-2xx status codes.
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
  /**
   * Executes an HTTP request using the browser/Node.js Fetch API.
   * @param options - Request options including method, path, optional body, headers, and timeout.
   * @param apiKey - The API key to use for the Authorization header.
   * @returns A promise resolving to the typed HTTP response.
   * @throws {AuthenticationError} When the server responds with 401 or 403.
   * @throws {NotFoundError} When the server responds with 404.
   * @throws {ApiError} When the server responds with any other non-2xx status.
   * @throws {NetworkError} When the request times out or a network-level failure occurs.
   */
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
 * Creates a default fetch-based HTTP client.
 * @returns A new {@link FetchHttpClient} instance.
 */
export const createHttpClient = (): HttpClient => {
  return new FetchHttpClient();
};
