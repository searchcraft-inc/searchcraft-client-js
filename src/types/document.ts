/**
 * Document management types
 */

import type { DocumentId } from './common.js';

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
 * Document operation response
 */
export interface DocumentOperationResponse {
  readonly status: number;
  readonly data: {
    readonly success: boolean;
    readonly document_id?: DocumentId;
    readonly message?: string;
  };
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse {
  readonly status: number;
  readonly data: {
    readonly success: boolean;
    readonly processed: number;
    readonly failed: number;
    readonly errors?: ReadonlyArray<{
      readonly document_id?: string | number;
      readonly error: string;
    }>;
  };
}
