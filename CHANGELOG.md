# Changelog

## 0.3.0

- This is a breaking update as the TypeScript dependency and Node version have been increased.
- Support for Searchcraft engine 0.11.0.

### Fixes

- **API errors carried no message.** The error handler looked for a `message` field, but the engine reports failures through the same `{ status, data }` envelope, with the message as the `data` string. Every API error surfaced as the generic `"Request failed"`.
- **`limit` is no longer rejected above 200.** The engine clamps to `SEARCHCRAFT_MAX_RESULT_LIMIT` (200 by default) rather than rejecting, and operators can raise that ceiling, so a client-side cap broke otherwise-valid requests.
- **`DocumentApi` and `HealthApi` are now exported** from the package root, alongside the other eight API classes.
- `Federation.created_by`, `last_modified_by`, and `organization_id` are nullable; `AuthKey.name` and `allowed_indexes` are nullable, where a null `allowed_indexes` means the key may reach every index.
- `SearchResponseData.time_taken` is documented as **seconds**, not milliseconds.

### Added

- `IndexApi.replace()` — `PUT /index/:index`, whole-schema replacement of an existing index.
- `FederationApi.create()`, `update()`, `listIndices()`, and `listByOrganization()`.
- `StopwordsApi.getDefaults()` — the engine's built-in stopword list for the index language.
- `DocumentApi.deleteByInternalId()` — delete by Searchcraft's internal document id, as opposed to your own `id` field.
- `AuthApi.checkKeyPermissions()` — `GET /auth/key/check/:permission`, returning a boolean rather than throwing on 403.
- `MeasureApi.getDashboardConversion()` and `getDashboardUsage()`.
- `term` and `more-like-this` query kinds, and `'mustnot'` as an `OccurMode`.
- `fields` on query clauses (`FieldSelector`) to scope a fuzzy or term search to specific fields, optionally with per-field boosts.
- `minimum_number_should_match` (engine 0.11.0), `time_decay_field`, and `index_weighting` search options.
- `fieldnorms` on `FieldConfig`; `ingestion` on `IndexConfig`.
- New types: `FederationRequest`, `IngestionConfig`, `FieldSelector`, `TermQuery`, `MoreLikeThisQuery`, `MeasureDashboardParams`, `MeasureDashboardReport`, `MeasureQueryGranularity`, `HealthCheckData`.

### Dependencies

- Minimum supported Node version raised to > 20.19.0 || 22.12.0
- Raised TypeScript version to 6.0.3
- Supporting dev dependency version bumps for Vite and related packages.

## 0.2.1

- New: `MeasureApi.getStatus()` wraps the unauthenticated `GET /measure/status` and returns `{ enabled: boolean }`, indicating whether analytics are configured on the server. When `enabled` is `false`, the other `/measure/*` endpoints are no-ops.
- New: `MeasureStatus` type.

## 0.2.0

- Support for Searchcraft engine 0.10.0.
- New: `IndexApi.getCapabilities()` wraps `GET /index/:index/capabilities` and returns the index's AI capability flags.
- New: `SearchApi.searchSummary()` streams `POST /index/:index/search/summary` Server-Sent Events as an async iterable of tagged `metadata`, `delta`, `done`, and `error` events.
- New: `AuthApi.listIndexKeys()` wraps `GET /auth/index/:index_name`.
- New: `ai` and `ai_enabled` fields on `IndexConfig` for AI configuration on index create/update. Changing `ai_enabled` requires an admin-level key.
- New: `AIConfig`, `SearchSummaryConfig`, `PromptInstruction`, `KeywordRule`, `LLMProvider`, `IndexCapabilities`, `AICapabilities`, and `SummaryStreamEvent` types.
- New: `api_summary_requested` measure event and `ai_provider`, `search_kind`, `searchcraft_federation_name` properties on `MeasureRequestProperties`, plus `user_type` on `MeasureRequestUser`.
- New: `HttpClient.stream()` method for raw-body streaming responses, with a default `FetchHttpClient` implementation.

## 0.1.0

- Initial release!
