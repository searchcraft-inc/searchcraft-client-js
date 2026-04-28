# Changelog

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
