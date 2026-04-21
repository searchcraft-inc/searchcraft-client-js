/**
 * HTTP client for making requests to the Searchcraft API
 */

import type {
  ApiKey,
  HttpRequestOptions,
  HttpResponse,
  HttpStreamResponse,
} from '../types/index.js';
import { ApiError, AuthenticationError, NetworkError, NotFoundError } from '../types/index.js';
import { CLIENT_USER_AGENT, isNodeRuntime } from './version.js';

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

  /**
   * Executes an HTTP request and returns the raw body as a readable stream.
   * Intended for Server-Sent Events endpoints such as search summary streaming.
   * The timeout, when provided, bounds only the initial response - not the
   * duration of the stream - so callers may safely read long-running streams.
   * @param options - Request options including method, path, optional body, headers, and timeout.
   * @param apiKey - The API key to use for the Authorization header.
   * @returns A promise resolving to a {@link HttpStreamResponse} with the body stream.
   * @throws {AuthenticationError} When the server responds with 401 or 403.
   * @throws {NotFoundError} When the server responds with 404.
   * @throws {ApiError} When the server responds with any other non-2xx status.
   * @throws {NetworkError} When the initial response times out or a network-level failure occurs.
   */
  stream(options: HttpRequestOptions, apiKey: ApiKey): Promise<HttpStreamResponse>;
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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: apiKey,
  };
  // `User-Agent` is a forbidden header in browsers and setting it has no
  // effect, so only emit one when running server-side on Node.js.
  if (isNodeRuntime()) {
    headers['User-Agent'] = CLIENT_USER_AGENT;
  }
  return {
    ...headers,
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

  async stream(options: HttpRequestOptions, apiKey: ApiKey): Promise<HttpStreamResponse> {
    const { method, path, body, headers: customHeaders, timeout = 30000 } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(path, {
        method,
        headers: {
          ...createHeaders(apiKey, customHeaders),
          Accept: 'text/event-stream',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorBody: unknown = null;
        try {
          const text = await response.text();
          if (text) {
            try {
              errorBody = JSON.parse(text);
            } catch {
              errorBody = { message: text };
            }
          }
        } catch {
          errorBody = null;
        }
        handleHttpError(response.status, errorBody);
      }

      if (!response.body) {
        throw new NetworkError('Response body is not a readable stream');
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        body: response.body,
        headers: Object.freeze(responseHeaders),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (
        error instanceof ApiError ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError ||
        error instanceof NetworkError
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
