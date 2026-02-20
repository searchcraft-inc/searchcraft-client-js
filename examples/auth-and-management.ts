/**
 * Auth, transaction, measure, and index management examples
 *
 * These APIs are primarily used for self-hosted Searchcraft instances.
 * Auth management requires an adminKey in the client config.
 */

import { createApiKey, createClient, createFederationName, createIndexName } from '../src/index';

// Self-hosted instance with all key types configured
const client = createClient({
  endpointUrl: 'https://your-searchcraft-instance.com',
  readKey: createApiKey('your-read-key'),
  ingestKey: createApiKey('your-ingest-key'),
  adminKey: createApiKey('your-admin-key'),
});

const indexName = createIndexName('your-index');

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

// Example 1: Commit a write transaction
async function commitTransaction() {
  const result = await client.transactions.commit(indexName);
  console.log('Transaction committed:', result);
}

// Example 2: Roll back a write transaction
async function rollbackTransaction() {
  const result = await client.transactions.rollback(indexName);
  console.log('Transaction rolled back:', result);
}

// Example 3: Wrap document writes in a try/commit/rollback pattern
async function safeIngest() {
  try {
    await client.documents.upsert(indexName, [{ id: '1', name: 'Widget' }]);
    await client.transactions.commit(indexName);
    console.log('Ingest committed successfully');
  } catch (error) {
    await client.transactions.rollback(indexName);
    console.error('Ingest failed, rolled back:', error);
  }
}

// ---------------------------------------------------------------------------
// Measure (event tracking)
// ---------------------------------------------------------------------------

// Example 4: Track a search event
async function trackSearchEvent() {
  await client.measure.trackEvent({
    event_name: 'search',
    properties: {
      searchcraft_index_names: [String(indexName)],
      search_term: 'wireless headphones',
      number_of_documents: 42,
    },
    user: {
      user_id: 'user-abc123',
      locale: 'en-US',
      platform: 'web',
    },
  });
  console.log('Search event tracked');
}

// Example 5: Track a click/result event
async function trackClickEvent() {
  await client.measure.trackEvent({
    event_name: 'click',
    properties: {
      searchcraft_index_names: [String(indexName)],
      search_term: 'wireless headphones',
      external_document_id: 'product-789',
      document_position: 2,
    },
    user: { user_id: 'user-abc123' },
  });
  console.log('Click event tracked');
}

// Example 6: Track multiple events in one request
async function trackBatchEvents() {
  const user = { user_id: 'user-abc123' };
  const indexNames = [String(indexName)];

  await client.measure.trackBatch([
    {
      event_name: 'search',
      properties: { searchcraft_index_names: indexNames, search_term: 'laptop' },
      user,
    },
    {
      event_name: 'click',
      properties: { searchcraft_index_names: indexNames, external_document_id: 'prod-1' },
      user,
    },
  ]);
  console.log('Batch events tracked');
}

// Example 7: Fetch the measure dashboard summary
async function getDashboardSummary() {
  const summary = await client.measure.getDashboardSummary();
  console.log('Dashboard summary:', summary);
}

// ---------------------------------------------------------------------------
// Auth key management (self-hosted only, requires adminKey)
// ---------------------------------------------------------------------------

// Example 8: List all auth keys on the cluster
async function listAuthKeys() {
  const keys = await client.auth.listKeys();
  console.log(`${keys.length} keys on cluster:`);
  for (const k of keys) {
    console.log(` - ${k.name} (permissions: ${k.permissions}, status: ${k.status})`);
  }
}

// Example 9: Create a new read-only key scoped to one index
async function createReadKey() {
  const newKey = await client.auth.createKey({
    name: 'Storefront Read Key',
    permissions: 1,
    allowed_indexes: [String(indexName)],
    status: 'active',
  });
  console.log('Created key:', newKey.key);
}

// Example 10: Disable a key
async function deactivateKey(key: string) {
  const updated = await client.auth.updateKey(key, { status: 'inactive' });
  console.log('Key deactivated:', updated.name);
}

// Example 11: List keys scoped to a federation
async function listFederationKeys() {
  const federation = createFederationName('your-federation');
  const keys = await client.auth.listFederationKeys(federation);
  console.log(`${keys.length} keys for federation`);
}

// ---------------------------------------------------------------------------
// Index stats
// ---------------------------------------------------------------------------

// Example 12: Get stats for all indices
async function getAllIndexStats() {
  const stats = await client.indices.getStats();
  console.log('All index stats:', stats);
}

// Example 13: Get stats for a specific index
async function getIndexStats() {
  const stats = await client.indices.getIndexStats(indexName);
  console.log(`Stats for ${indexName}:`, stats);
}

// Run examples
export async function main() {
  try {
    await commitTransaction();
    await rollbackTransaction();
    await safeIngest();
    await trackSearchEvent();
    await trackClickEvent();
    await trackBatchEvents();
    await getDashboardSummary();
    await listAuthKeys();
    await createReadKey();
    await deactivateKey('some-key-value');
    await listFederationKeys();
    await getAllIndexStats();
    await getIndexStats();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run
// main();
