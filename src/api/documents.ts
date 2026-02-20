/**
 * Document management API operations
 */

import { getApiKey } from '../core/config.js';
import type { HttpClient } from '../core/http.js';
import type {
  DocumentDeleteResponse,
  DocumentOperationResponse,
  DocumentWithId,
  IndexName,
  SearchcraftConfig,
  SearchHit,
} from '../types/index.js';
import { ValidationError } from '../types/index.js';

/**
 * Document API class
 */
export class DocumentApi {
  constructor(
    private readonly config: Readonly<SearchcraftConfig>,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Inserts a document into an index.
   * Note: This will always create a new document, even if one exists with the same id.
   * Uses POST /index/:index/documents with array body
   * @param indexName - The name of the index to insert the document into.
   * @param document - The document to insert. Must include an `id` field.
   * @returns A promise resolving to the operation result.
   * @throws {ValidationError} When the document is missing the `id` field.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async insert(indexName: IndexName, document: DocumentWithId): Promise<DocumentOperationResponse> {
    if (!document.id) {
      throw new ValidationError('Document must have an id field', 'id');
    }

    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/documents`;

    const response = await this.httpClient.request<DocumentOperationResponse>(
      {
        method: 'POST',
        path,
        body: [document],
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data;
  }

  /**
   * Deletes a document from an index by its source ID.
   * Uses DELETE /index/:index/documents/query with query body
   * @param indexName - The name of the index to delete the document from.
   * @param documentId - The source `id` value of the document to delete.
   * @returns A promise resolving to the delete operation result.
   * @throws {ValidationError} When `documentId` is falsy.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async delete(indexName: IndexName, documentId: string | number): Promise<DocumentDeleteResponse> {
    if (!documentId) {
      throw new ValidationError('Document ID is required', 'id');
    }

    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/documents/query`;

    const response = await this.httpClient.request<DocumentDeleteResponse>(
      {
        method: 'DELETE',
        path,
        body: {
          query: {
            exact: {
              ctx: `id:${documentId}`,
            },
          },
        },
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data;
  }

  /**
   * Batch inserts multiple documents into an index.
   * Note: This will always create new documents, even if documents exist with the same ids.
   * Uses POST /index/:index/documents with array body
   * @param indexName - The name of the index to insert documents into.
   * @param documents - A non-empty array of documents to insert. Each must include an `id` field.
   * @returns A promise resolving to the operation result.
   * @throws {ValidationError} When `documents` is empty or any document is missing the `id` field.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async batchInsert(
    indexName: IndexName,
    documents: ReadonlyArray<DocumentWithId>
  ): Promise<DocumentOperationResponse> {
    if (documents.length === 0) {
      throw new ValidationError('Documents array cannot be empty', 'documents');
    }

    // Validate all documents have IDs
    for (const doc of documents) {
      if (!doc.id) {
        throw new ValidationError('All documents must have an id field', 'id');
      }
    }

    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/documents`;

    const response = await this.httpClient.request<DocumentOperationResponse>(
      {
        method: 'POST',
        path,
        body: [...documents],
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data;
  }

  /**
   * Batch deletes multiple documents by their source IDs.
   * Uses DELETE /index/:index/documents with field term body
   * @param indexName - The name of the index to delete documents from.
   * @param documentIds - A non-empty array of source `id` values to delete.
   * @returns A promise resolving to the delete operation result.
   * @throws {ValidationError} When `documentIds` is empty.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async batchDelete(
    indexName: IndexName,
    documentIds: ReadonlyArray<string | number>
  ): Promise<DocumentDeleteResponse> {
    if (documentIds.length === 0) {
      throw new ValidationError('Document IDs array cannot be empty', 'documentIds');
    }

    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/documents`;

    // Delete by field term match for each ID
    const response = await this.httpClient.request<DocumentDeleteResponse>(
      {
        method: 'DELETE',
        path,
        body: { id: documentIds },
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data;
  }

  /**
   * Deletes all documents from an index.
   * Uses DELETE /index/:index/documents/all
   * @param indexName - The name of the index to clear.
   * @returns A promise resolving to the operation result.
   * @throws {ConfigurationError} When `ingestKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks write permissions.
   * @throws {NotFoundError} When the specified index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async deleteAll(indexName: IndexName): Promise<DocumentOperationResponse> {
    const apiKey = getApiKey(this.config, 'write');
    const path = `${this.config.endpointUrl}/index/${indexName}/documents/all`;

    const response = await this.httpClient.request<DocumentOperationResponse>(
      {
        method: 'DELETE',
        path,
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data;
  }

  /**
   * Gets a document by its internal Searchcraft ID (`_id`).
   * Uses GET /index/:index/documents/:document_id
   * @param indexName - The name of the index to retrieve the document from.
   * @param internalId - The internal Searchcraft `_id` of the document (not the source `id`).
   * @returns A promise resolving to a {@link SearchHit} containing the document, internal ID, score, and source index.
   * @throws {ConfigurationError} When `readKey` is not set in the client configuration.
   * @throws {AuthenticationError} When the API key is invalid or lacks read permissions.
   * @throws {NotFoundError} When the document or index does not exist.
   * @throws {ApiError} When the server returns a non-2xx response.
   * @throws {NetworkError} When the request times out or a network failure occurs.
   */
  async get<T = unknown>(indexName: IndexName, internalId: string): Promise<SearchHit<T>> {
    const apiKey = getApiKey(this.config, 'read');
    const path = `${this.config.endpointUrl}/index/${indexName}/documents/${internalId}`;

    const response = await this.httpClient.request<SearchHit<T>>(
      {
        method: 'GET',
        path,
        timeout: this.config.timeout,
      },
      apiKey
    );

    return response.data;
  }
}
