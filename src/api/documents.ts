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
  SearchHit,
  SearchcraftConfig,
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
   * Inserts a document into an index
   * Note: This will always create a new document, even if one exists with the same id
   * Uses POST /index/:index/documents with array body
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
   * Deletes a document from an index by its source ID
   * Uses DELETE /index/:index/documents/query with query body
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
   * Batch insert multiple documents into an index
   * Note: This will always create new documents, even if documents exist with the same ids
   * Uses POST /index/:index/documents with array body
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
   * Batch delete multiple documents by field term match
   * Uses DELETE /index/:index/documents with field term body
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
   * Delete all documents from an index
   * Uses DELETE /index/:index/documents/all
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
   * Get a document by its internal Searchcraft ID (_id)
   * Uses GET /index/:index/documents/:document_id
   * Returns a SearchHit containing the document, its internal ID, score, and source index
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
