/**
 * Document management types
 */

/**
 * Base document structure
 */
export type Document = Readonly<Record<string, unknown>>;

/**
 * Document with ID
 */
export interface DocumentWithId extends Document {
  readonly id: string | number;
}

/**
 * Create document request
 */
export interface CreateDocumentRequest {
  readonly document: DocumentWithId;
}

/**
 * Update document request
 */
export interface UpdateDocumentRequest {
  readonly document: DocumentWithId;
}

/**
 * Delete document request
 */
export interface DeleteDocumentRequest {
  readonly id: string | number;
}

/**
 * Batch document operation
 */
export interface BatchDocumentOperation {
  readonly documents: ReadonlyArray<DocumentWithId>;
}

/**
 * Response from insert operations (insert, batchInsert, deleteAll).
 * The API returns a plain confirmation string.
 */
export type DocumentOperationResponse = string;

/**
 * Response from delete operations (delete, batchDelete).
 * The API returns a detail message and the number of documents removed.
 */
export interface DocumentDeleteResponse {
  readonly detail: string;
  readonly num_removed: number;
}
