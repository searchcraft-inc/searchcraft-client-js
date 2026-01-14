/**
 * Advanced query examples
 */

import { createApiKey, createClient, createIndexName, exact, fuzzy } from '../src/index';

const client = createClient({
  endpointUrl: 'https://your-searchcraft-instance.com',
  readKey: createApiKey('your-read-key'),
});

const indexName = createIndexName('your-index');

// Example 1: Range query
async function rangeQuery() {
  const request = exact()
    .range('price', 10, 100) // Inclusive range
    .limit(20)
    .buildRequest();

  const response = await client.search.searchIndex(indexName, request);
  console.log('Products in price range:', response.data.hits);
}

// Example 2: Date range query
async function dateRangeQuery() {
  const from = new Date('2024-01-01');
  const to = new Date('2024-12-31');

  const request = exact().range('created_at', from, to).limit(50).buildRequest();

  const response = await client.search.searchIndex(indexName, request);
  console.log('Documents in date range:', response.data.hits);
}

// Example 3: IN query
async function inQuery() {
  const request = exact().fieldIn('category', ['tech', 'science', 'engineering']).buildRequest();

  const response = await client.search.searchIndex(indexName, request);
  console.log('Documents in categories:', response.data.hits);
}

// Example 4: Comparison queries
async function comparisonQueries() {
  // Greater than
  const highRated = exact().compare('rating', '>', 4.5).limit(10).buildRequest();

  // Less than or equal
  const affordable = exact().compare('price', '<=', 50).limit(10).buildRequest();

  const response1 = await client.search.searchIndex(indexName, highRated);
  const response2 = await client.search.searchIndex(indexName, affordable);

  console.log('High rated:', response1.data.hits);
  console.log('Affordable:', response2.data.hits);
}

// Example 5: Boolean queries with AND/OR
async function booleanQueries() {
  // AND query
  const andQuery = exact()
    .field('category', 'electronics')
    .and(exact().compare('price', '<', 100))
    .buildRequest();

  // OR query
  const orQuery = exact()
    .field('brand', 'Apple')
    .or(exact().field('brand', 'Samsung'))
    .buildRequest();

  const response1 = await client.search.searchIndex(indexName, andQuery);
  const response2 = await client.search.searchIndex(indexName, orQuery);

  console.log('AND results:', response1.data.hits);
  console.log('OR results:', response2.data.hits);
}

// Example 6: NOT queries (exclusion)
async function notQuery() {
  const request = fuzzy().term('laptop').not('refurbished').limit(20).buildRequest();

  const response = await client.search.searchIndex(indexName, request);
  console.log('Laptops excluding refurbished:', response.data.hits);
}

// Example 7: Grouped queries
async function groupedQuery() {
  // (category:tech OR category:science) AND rating:>4
  const subQuery = exact().field('category', 'tech').or('category:science');

  const request = exact()
    .group(subQuery)
    .and(exact().compare('rating', '>', 4))
    .buildRequest();

  const response = await client.search.searchIndex(indexName, request);
  console.log('Grouped query results:', response.data.hits);
}

// Example 8: Complex multi-condition query
async function complexQuery() {
  const request = exact()
    .field('active', true)
    .and(exact().range('price', 10, 100))
    .and(exact().fieldIn('category', ['electronics', 'computers']))
    .not('discontinued')
    .orderBy('rating', 'desc')
    .limit(25)
    .buildRequest();

  const response = await client.search.searchIndex(indexName, request);
  console.log('Complex query results:', response.data.hits);
}

// Example 9: Combining fuzzy search with exact filters
async function hybridQuery() {
  // This requires using the array query format
  const request = {
    query: [
      { occur: 'must', exact: { ctx: 'active:true' } },
      { occur: 'must', exact: { ctx: 'category:/electronics' } },
      { fuzzy: { ctx: 'wireless headphones' } },
    ],
    limit: 20,
  };

  const response = await client.search.searchIndex(indexName, request);
  console.log('Hybrid query results:', response.data.hits);
}

// Example 10: Faceted search
async function facetedSearch() {
  const request = fuzzy().term('laptop').limit(50).buildRequest();

  const response = await client.search.searchIndex(indexName, request);

  console.log('Search results:', response.data.hits);

  if (response.data.facets) {
    console.log('Available facets:', response.data.facets);
  }
}

// Run examples
export async function main() {
  try {
    await rangeQuery();
    await dateRangeQuery();
    await inQuery();
    await comparisonQueries();
    await booleanQueries();
    await notQuery();
    await groupedQuery();
    await complexQuery();
    await hybridQuery();
    await facetedSearch();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run
// main();
