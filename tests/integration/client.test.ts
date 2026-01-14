import { beforeAll, describe, expect, it } from 'vitest';
import {
  type DocumentWithId,
  createApiKey,
  createClient,
  createIndexName,
  exact,
  fuzzy,
} from '../../src/index';

// These tests can be run against a real Searchcraft instance
// Set SEARCHCRAFT_ENDPOINT, SEARCHCRAFT_READ_KEY, SEARCHCRAFT_INGEST_KEY, and SEARCHCRAFT_INDEX_NAME
// environment variables to run integration tests

const shouldRunIntegrationTests =
  process.env.SEARCHCRAFT_ENDPOINT && process.env.SEARCHCRAFT_READ_KEY;

const shouldRunDocumentTests = shouldRunIntegrationTests && process.env.SEARCHCRAFT_INGEST_KEY;

// Test document interface
interface TestDocument extends DocumentWithId {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

describe.skipIf(!shouldRunIntegrationTests)('Integration Tests', () => {
  let client: ReturnType<typeof createClient>;
  let indexName: ReturnType<typeof createIndexName>;

  beforeAll(() => {
    if (!process.env.SEARCHCRAFT_READ_KEY) {
      throw new Error(
        'SEARCHCRAFT_READ_KEY environment variable is required for integration tests'
      );
    }

    client = createClient({
      endpointUrl: process.env.SEARCHCRAFT_ENDPOINT || 'http://127.0.0.1:8000',
      readKey: createApiKey(process.env.SEARCHCRAFT_READ_KEY),
      ...(process.env.SEARCHCRAFT_INGEST_KEY && {
        ingestKey: createApiKey(process.env.SEARCHCRAFT_INGEST_KEY),
      }),
    });

    indexName = createIndexName(process.env.SEARCHCRAFT_INDEX_NAME || 'data_test');
  });

  describe('Search API', () => {
    it('should perform a basic fuzzy search', async () => {
      const request = fuzzy().term('human').limit(5).buildRequest();

      const response = await client.search.searchIndex(indexName, request);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.hits).toBeDefined();
      expect(Array.isArray(response.data.hits)).toBe(true);
      expect(response.data.count).toBeGreaterThan(0);
      expect(typeof response.data.time_taken).toBe('number');
    });

    it('should perform an exact search with field filter', async () => {
      const request = exact().field('active', false).limit(5).buildRequest();

      const response = await client.search.searchIndex(indexName, request);

      expect(response.status).toBe(200);
      expect(response.data.hits).toBeDefined();
    });

    it('should perform a search with pagination', async () => {
      const request = fuzzy().term('world').limit(2).offset(0).buildRequest();

      const response = await client.search.searchIndex(indexName, request);

      expect(response.status).toBe(200);
      expect(response.data.hits.length).toBeLessThanOrEqual(2);
    });

    it('should perform a search with sorting', async () => {
      const request = exact()
        .field('category', '/science-fiction')
        .orderBy('created_at', 'desc')
        .limit(5)
        .buildRequest();

      const response = await client.search.searchIndex(indexName, request);

      expect(response.status).toBe(200);
      expect(response.data.hits).toBeDefined();
    });

    it('should perform a range query', async () => {
      const request = exact().range('rating', 6, 9).limit(5).buildRequest();

      const response = await client.search.searchIndex(indexName, request);

      expect(response.status).toBe(200);
      expect(response.data.hits).toBeDefined();
    });

    it('should perform an IN query', async () => {
      const request = exact()
        .fieldIn('tags', ['evolution', 'colonization'])
        .limit(5)
        .buildRequest();

      const response = await client.search.searchIndex(indexName, request);

      expect(response.status).toBe(200);
      expect(response.data.hits).toBeDefined();
    });

    it('should perform a comparison query', async () => {
      const request = exact().compare('reviews', '>=', 3000).limit(5).buildRequest();

      const response = await client.search.searchIndex(indexName, request);

      expect(response.status).toBe(200);
      expect(response.data.hits).toBeDefined();
    });

    it('should perform a complex boolean query', async () => {
      const request = exact()
        .field('active', false)
        .and(exact().compare('rating', '>', 9.0))
        .limit(5)
        .buildRequest();

      const response = await client.search.searchIndex(indexName, request);

      expect(response.status).toBe(200);
      expect(response.data.hits).toBeDefined();
    });

    it('should handle search results with facets', async () => {
      const request = fuzzy().term('science').limit(10).buildRequest();

      const response = await client.search.searchIndex(indexName, request);

      expect(response.status).toBe(200);
      if (response.data.facets) {
        expect(Array.isArray(response.data.facets)).toBe(true);
      }
    });
  });

  describe('Health API', () => {
    it('should perform a health check', async () => {
      const response = await client.health.check();

      expect(response).toBeDefined();
      // The response structure may vary by server implementation
      // Just verify we got a response object
      expect(typeof response).toBe('object');
    });
  });

  describe.skipIf(!shouldRunDocumentTests)('Document API', () => {
    it('should insert, get, and delete a document', async () => {
      // Create a unique document ID for this test
      const testDocId = `test-doc-${Date.now()}`;
      const testDocument: TestDocument = {
        id: testDocId,
        title: 'Integration Test Document',
        content: 'This is a test document created by the integration tests',
        created_at: new Date().toISOString(),
      };

      // Step 1: Insert the document
      const createResponse = await client.documents.upsert(indexName, testDocument);
      expect(createResponse).toBeDefined();
      expect(createResponse.status).toBeDefined();
      expect(createResponse.data.success).toBe(true);

      // Wait a bit for the document to be indexed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Search for the document to get its internal document_id
      const searchResponse = await client.search.searchIndex<TestDocument>(
        indexName,
        exact().field('id', testDocId).limit(1).buildRequest()
      );

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.data.hits.length).toBeGreaterThan(0);

      const foundHit = searchResponse.data.hits[0];
      expect(foundHit.doc).toBeDefined();
      expect(foundHit.doc.id).toBe(testDocId);
      expect(foundHit.document_id).toBeDefined();

      // Step 3: Get the document by its internal document_id
      const getResponse = await client.documents.get(indexName, foundHit.document_id);
      expect(getResponse).toBeDefined();
      expect(getResponse.id).toBe(testDocId);
      expect((getResponse as TestDocument).title).toBe(testDocument.title);

      // Step 4: Delete the document
      const deleteResponse = await client.documents.delete(indexName, testDocId);
      expect(deleteResponse).toBeDefined();
      expect(deleteResponse.status).toBeDefined();
      expect(deleteResponse.data.success).toBe(true);

      // Wait a bit for the deletion to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 5: Verify the document is deleted
      const verifyResponse = await client.search.searchIndex(
        indexName,
        exact().field('id', testDocId).limit(1).buildRequest()
      );

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.data.hits.length).toBe(0);
    });
  });
});
