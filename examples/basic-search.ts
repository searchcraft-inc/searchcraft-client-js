/**
 * Basic search examples
 */

import { createApiKey, createClient, createIndexName, exact, fuzzy } from '../src/index';

// Initialize the client
const client = createClient({
  endpointUrl: 'https://your-searchcraft-instance.com',
  readKey: createApiKey('your-read-key'),
});

const indexName = createIndexName('your-index');

// Example 1: Simple fuzzy search
async function simpleFuzzySearch() {
  const request = fuzzy().term('search term').limit(10).buildRequest();

  const response = await client.search.searchIndex(indexName, request);

  console.log(`Found ${response.data.count} results`);
  console.log(`Search took ${response.data.time_taken}s`);

  for (const hit of response.data.hits) {
    console.log(`Score: ${hit.score}, Document:`, hit.doc);
  }
}

// Example 2: Exact search with field filter
async function exactSearchWithFilter() {
  const request = exact().field('category', 'technology').limit(20).buildRequest();

  const response = await client.search.searchIndex(indexName, request);

  console.log('Results:', response.data.hits);
}

// Example 3: Search with pagination
async function paginatedSearch() {
  const page = 1;
  const pageSize = 10;

  const request = fuzzy()
    .term('query')
    .limit(pageSize)
    .offset(page * pageSize)
    .buildRequest();

  const response = await client.search.searchIndex(indexName, request);

  console.log(`Page ${page + 1} of ${Math.ceil(response.data.count / pageSize)}`);
  console.log('Results:', response.data.hits);
}

// Example 4: Search with sorting
async function sortedSearch() {
  const request = fuzzy().term('latest').orderBy('created_at', 'desc').limit(10).buildRequest();

  const response = await client.search.searchIndex(indexName, request);

  console.log('Latest results:', response.data.hits);
}

// Example 5: Using simple query helpers
async function simpleQueryHelpers() {
  const response = await client.search.searchIndex(indexName, {
    query: { fuzzy: { ctx: 'simple search' } },
    limit: 10,
  });

  console.log('Results:', response.data.hits);
}

// Run examples
export async function main() {
  try {
    await simpleFuzzySearch();
    await exactSearchWithFilter();
    await paginatedSearch();
    await sortedSearch();
    await simpleQueryHelpers();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run
// main();
