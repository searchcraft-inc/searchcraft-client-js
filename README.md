<img alt="Searchcraft" src="https://raw.githubusercontent.com/searchcraft-inc/searchcraft-client-js/main/header.png">

<h1 align="center">Searchcraft TypeScript Client</h1>

<p align="center">
A TypeScript client library for the <a href="https://searchcraft.io">Searchcraft</a> API.
</p>

<p align="center">
  <a href="https://docs.searchcraft.io"><strong>Documentation</strong></a> ·
  <a href="https://searchcraft.io"><strong>Website</strong></a> ·
  <a href="https://github.com/searchcraft-inc/searchcraft-client-js/issues"><strong>Issues</strong></a>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript&style=flat" alt="TypeScript">
  </a>
  <a href="https://nodejs.org/en/">
    <img src="https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js&style=flat" alt="Node.js">
  </a>
  <a href="https://github.com/searchcraft-inc/searchcraft-client-js/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat" alt="License">
  </a>
</p>

---

## Features

- Full TypeScript support with comprehensive type definitions.
- Works with JavaScript projects as well.
- Functional, immutable API design.
- Composable query builder.
- Support for all Searchcraft query modes (fuzzy, exact, dynamic) and operations.
- Full index, federation, synonyms, and stopwords management.
- Complete query language support.
- Works in both Node.js and browser environments.
- Available via NPM and CDN.
- Zero runtime dependencies.

## Installation

### NPM

```bash
npm install @searchcraft/client
```

### Yarn

```bash
yarn add @searchcraft/client
```

### PNPM

```bash
pnpm add @searchcraft/client
```

### CDN (UMD)

```html
<script src="https://unpkg.com/@searchcraft/client/dist/index.umd.js"></script>
<script>
  const { createClient, createApiKey, createIndexName } = SearchcraftClient;
</script>
```

## Quick Start

```typescript
import { createClient, createApiKey, createIndexName, fuzzy } from '@searchcraft/client';

// Initialize the client
const client = createClient({
  endpointUrl: 'https://your-searchcraft-instance.com',
  readKey: createApiKey('your-read-key'),
});

// Perform a search
const indexName = createIndexName('your-index');
const request = fuzzy().term('search query').limit(10).buildRequest();

const response = await client.search.searchIndex(indexName, request);

console.log(`Found ${response.data.count} results`);
console.log(response.data.hits);
```

## Usage

### Client Initialization

```typescript
import { createClient, createApiKey } from '@searchcraft/client';

const client = createClient({
  endpointUrl: 'https://your-instance.com',
  readKey: createApiKey('your-read-key'),
  ingestKey: createApiKey('your-ingest-key'), // Optional, for document operations
  adminKey: createApiKey('your-admin-key'), // Optional, only needed for self-hosted clusters
  timeout: 30000, // Optional, default 30 seconds
  headers: {
    // Optional Searchcraft headers for analytics and tracking:
    'X-Sc-User-Id': 'user-123', // Unique identifier for the current user
    'X-Sc-Session-Id': 'session-abc', // Session identifier for tracking user sessions
    'X-Sc-User-Type': 'authenticated', // User type: 'authenticated' or 'anonymous'
  },
});
```

> **Note:** The `adminKey` is only required for self-hosted Searchcraft clusters. If you're using Searchcraft Cloud, you do not need to provide an admin key.

### Basic Search

```typescript
import { fuzzy, exact, dynamic } from '@searchcraft/client';

// Fuzzy search (typo-tolerant, uses weight ranking, synonyms and stopwords)
const fuzzyQuery = fuzzy().term('search term').limit(20).buildRequest();

// Exact search
const exactQuery = exact().term('exact match').buildRequest();

// Dynamic search (adapts based on word count)
const dynamicQuery = dynamic().term('adaptive search').buildRequest();

const response = await client.search.searchIndex(indexName, fuzzyQuery);
```

### Query Builder

The query builder provides a fluent, immutable API for constructing complex queries.

> **📚 Full Query Syntax Documentation:** For complete details on the Searchcraft query language, operators, and advanced features, see the [official documentation](https://docs.searchcraft.io).

```typescript
import { exact } from '@searchcraft/client';

const query = exact()
  .field('category', 'electronics')
  .and(exact().range('price', 10, 100))
  .not('discontinued')
  .orderBy('rating', 'desc')
  .limit(25)
  .buildRequest();

const response = await client.search.searchIndex(indexName, query);
```

### Field Queries

```typescript
// Simple field match
exact().field('title', 'laptop').buildRequest();

// IN query
exact().fieldIn('tags', ['tech', 'gadgets', 'mobile']).buildRequest();

// Range query
exact().range('price', 10, 100).buildRequest(); // Inclusive
exact().range('price', 10, 100, false).buildRequest(); // Exclusive

// Comparison queries
exact().compare('rating', '>', 4.5).buildRequest();
exact().compare('stock', '<=', 10).buildRequest();
```

### Date Queries

```typescript
const from = new Date('2024-01-01');
const to = new Date('2024-12-31');

exact().range('created_at', from, to).buildRequest();
exact().compare('updated_at', '>=', new Date('2024-06-01')).buildRequest();
```

### Boolean Operators

```typescript
// AND
exact().field('active', true).and(exact().compare('price', '<', 100)).buildRequest();

// OR
exact().field('brand', 'Apple').or(exact().field('brand', 'Samsung')).buildRequest();

// NOT (exclusion)
fuzzy().term('laptop').not('refurbished').buildRequest();

// Grouping
const subQuery = exact().field('category', 'tech').or('category:science');
exact().group(subQuery).and(exact().compare('rating', '>', 4)).buildRequest();
```

### Pagination and Sorting

```typescript
fuzzy()
  .term('query')
  .limit(20)
  .offset(40)
  .orderBy('created_at', 'desc')
  .buildRequest();
```

### Federated Search

Search across multiple indices:

```typescript
import { createFederationName } from '@searchcraft/client';

const federationName = createFederationName('my-federation');
const request = fuzzy().term('search term').buildRequest();

const response = await client.search.searchFederation(federationName, request);
```

### Advanced: Raw Query Objects

For complex queries or when you need maximum control, you can construct request objects directly instead of using the query builder:

```typescript
const request = {
  query: [
    { occur: 'must', exact: { ctx: 'active:true' } },
    { occur: 'must', exact: { ctx: 'category:/electronics' } },
    { fuzzy: { ctx: 'wireless headphones' } },
  ],
  limit: 20,
};

const response = await client.search.searchIndex(indexName, request);
```

**Note:** The query builder (e.g., `fuzzy().term()...`) is recommended for most use cases. Use raw objects when you need to dynamically construct complex queries or have specific requirements the builder doesn't cover.

### Document Management

```typescript
import { createIndexName } from '@searchcraft/client';

const indexName = createIndexName('my-index');

// Insert a document
await client.documents.insert(indexName, {
  id: '123',
  title: 'Product Title',
  description: 'Product description',
  price: 99.99,
});

// Delete a document by its id
await client.documents.delete(indexName, '123');

// Batch insert documents
await client.documents.batchInsert(indexName, [
  { id: '1', title: 'Product 1' },
  { id: '2', title: 'Product 2' },
]);

// Batch delete documents by their ids
await client.documents.batchDelete(indexName, ['1', '2']);

// Delete all documents from an index
await client.documents.deleteAll(indexName);
```

### Index Management

```typescript
import { createIndexName } from '@searchcraft/client';

const indexName = createIndexName('my-index');

// List all index names
const { index_names } = await client.indices.list();

// Get index configuration
const config = await client.indices.get(indexName);

// Create a new index
await client.indices.create(indexName, {
  search_fields: ['title', 'body'],
  fields: {
    title: { type: 'text', indexed: true, stored: true },
    body: { type: 'text', indexed: true, stored: true },
  },
});

// Update index configuration (partial)
await client.indices.update(indexName, {
  weight_multipliers: { title: 2.0, body: 0.7 },
});

// Delete an index
await client.indices.delete(indexName);
```

### Federation Management

```typescript
import { createFederationName } from '@searchcraft/client';

const federationName = createFederationName('my-federation');

// List all federations
const federations = await client.federations.list();

// Get a specific federation
const federation = await client.federations.get(federationName);

// Delete a federation
await client.federations.delete(federationName);
```

### Synonyms

```typescript
// Get all synonyms for an index
const synonyms = await client.synonyms.get(indexName);

// Add synonyms — format: "synonym:original-term" or "many,synonyms:original,terms"
await client.synonyms.add(indexName, [
  'nyc:new york city',
  'usa:united states',
]);

// Delete specific synonyms by key
await client.synonyms.delete(indexName, ['nyc', 'usa']);

// Delete all synonyms
await client.synonyms.deleteAll(indexName);
```

### Stopwords

```typescript
// Get all stopwords for an index
const stopwords = await client.stopwords.get(indexName);

// Add custom stopwords
await client.stopwords.add(indexName, ['foo', 'bar']);

// Delete specific stopwords
await client.stopwords.delete(indexName, ['foo', 'bar']);

// Delete all custom stopwords
await client.stopwords.deleteAll(indexName);
```

### Health Check

```typescript
// check() throws on error, so if it returns the service is healthy
const health = await client.health.check();
console.log('Status:', health.status);   // 200
console.log('Message:', health.data);    // "Searchcraft is healthy."
```

## API Reference

### Client

- `createClient(config: SearchcraftConfig): SearchcraftClient`

### Search API

- `searchIndex<T>(indexName: IndexName, request: SearchRequest): Promise<SearchResponse<T>>`
- `searchFederation<T>(federationName: FederationName, request: SearchRequest): Promise<SearchResponse<T>>`

### Document API

- `insert(indexName: IndexName, document: DocumentWithId): Promise<DocumentOperationResponse>` - Insert a document
- `delete(indexName: IndexName, documentId: string | number): Promise<DocumentDeleteResponse>` - Delete a document by id
- `batchInsert(indexName: IndexName, documents: DocumentWithId[]): Promise<DocumentOperationResponse>` - Batch insert documents
- `batchDelete(indexName: IndexName, documentIds: (string | number)[]): Promise<DocumentDeleteResponse>` - Batch delete documents by ids
- `deleteAll(indexName: IndexName): Promise<DocumentOperationResponse>` - Delete all documents from an index
- `get<T>(indexName: IndexName, internalId: string): Promise<SearchHit<T>>` - Get a document by its internal Searchcraft ID (_id)

### Index API

- `list(): Promise<IndexListResponse>` - List all index names
- `get(indexName: IndexName): Promise<IndexConfig>` - Get the configuration for a specific index
- `create(indexName: IndexName, indexConfig: IndexConfig): Promise<IndexOperationResponse>` - Create a new index
- `update(indexName: IndexName, indexConfig: Partial<IndexConfig>): Promise<IndexOperationResponse>` - Update an existing index (partial)
- `delete(indexName: IndexName): Promise<IndexOperationResponse>` - Delete an index

### Federation API

- `list(): Promise<Federation[]>` - List all federations
- `get(federationName: FederationName): Promise<Federation>` - Get a specific federation
- `delete(federationName: FederationName): Promise<FederationOperationResponse>` - Delete a federation

### Synonyms API

- `get(indexName: IndexName): Promise<SynonymsMap>` - Get all synonyms for an index
- `add(indexName: IndexName, synonyms: string[]): Promise<SynonymOperationResponse>` - Add synonyms in `"synonym:original-term"` format
- `delete(indexName: IndexName, synonyms: string[]): Promise<SynonymOperationResponse>` - Delete specific synonyms by key
- `deleteAll(indexName: IndexName): Promise<SynonymOperationResponse>` - Delete all synonyms from an index

### Stopwords API

- `get(indexName: IndexName): Promise<string[]>` - Get all stopwords for an index
- `add(indexName: IndexName, stopwords: string[]): Promise<StopwordOperationResponse>` - Add custom stopwords
- `delete(indexName: IndexName, stopwords: string[]): Promise<StopwordOperationResponse>` - Delete specific stopwords
- `deleteAll(indexName: IndexName): Promise<StopwordOperationResponse>` - Delete all stopwords from an index

### Health API

- `check(): Promise<HealthCheckResponse>`

### Query Builder

- `fuzzy(): QueryBuilder` - Create a fuzzy query builder
- `exact(): QueryBuilder` - Create an exact query builder
- `dynamic(): QueryBuilder` - Create a dynamic query builder

#### QueryBuilder Methods

All methods return a new QueryBuilder instance (immutable):

- `term(term: string): QueryBuilder` - Add a search term
- `field(field: string, value: string | number | boolean): QueryBuilder` - Add field:value query
- `fieldIn(field: string, values: (string | number)[]): QueryBuilder` - Add field IN query
- `range(field: string, from: string | number | Date, to: string | number | Date, inclusive?: boolean): QueryBuilder` - Add range query
- `compare(field: string, operator: '>' | '<' | '>=' | '<=', value: number | Date): QueryBuilder` - Add comparison query
- `and(query: string | QueryBuilder): QueryBuilder` - Add AND operator
- `or(query: string | QueryBuilder): QueryBuilder` - Add OR operator
- `not(term: string): QueryBuilder` - Add NOT operator
- `group(query: string | QueryBuilder): QueryBuilder` - Group query with parentheses
- `limit(limit: number): QueryBuilder` - Set result limit
- `offset(offset: number): QueryBuilder` - Set result offset
- `orderBy(field: string, sort?: 'asc' | 'desc'): QueryBuilder` - Set ordering
- `occur(occur: 'should' | 'must'): QueryBuilder` - Set occur mode
- `build(): SearchQuery` - Build the query object
- `buildRequest(): SearchRequest` - Build the complete request object

## Type Safety

The library uses **branded types** for enhanced compile-time type safety. Branded types prevent you from accidentally mixing up different string-based identifiers.

### Benefits of Branded Types

- ✅ **Compile-time safety** - TypeScript catches type mismatches before runtime
- ✅ **Prevents mixing types** - Can't accidentally use an `IndexName` where a `FederationName` is expected
- ✅ **IDE support** - Better autocomplete and inline error detection
- ✅ **Zero runtime overhead** - Types are erased during compilation
- ✅ **Works in JavaScript** - Functions work normally, just without compile-time checks

### Usage

```typescript
import {
  createApiKey,
  createIndexName,
  createFederationName,
  createDocumentId
} from '@searchcraft/client';

const apiKey = createApiKey('key');                    // ApiKey type
const indexName = createIndexName('my-index');         // IndexName type
const federationName = createFederationName('my-fed'); // FederationName type
const docId = createDocumentId('123');                 // DocumentId type

// ✅ TypeScript ensures you use the correct type
await client.search.searchIndex(indexName, request);
await client.search.searchFederation(federationName, request);

// ❌ TypeScript error - prevents mistakes at compile time
await client.search.searchFederation(indexName, request); // Error!
```

## Error Handling

```typescript
import {
  SearchcraftError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  NetworkError,
  ApiError,
} from '@searchcraft/client';

try {
  const response = await client.search.searchIndex(indexName, request);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed');
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.field);
  } else if (error instanceof NetworkError) {
    console.error('Network error');
  }
}
```

## Documentation

For comprehensive documentation on Searchcraft, including:

- **Query Language Reference** - Complete syntax and operators
- **API Reference** - All endpoints and parameters
- **Search Guides** - Best practices and advanced techniques
- **Integration Examples** - Real-world use cases

Visit the official documentation at **[docs.searchcraft.io](https://docs.searchcraft.io)**

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## Issues

Please file issues in the [Searchcraft Issues](https://github.com/searchcraft-inc/searchcraft-issues) repository.
