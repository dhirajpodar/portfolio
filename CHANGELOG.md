# Changelog

All notable changes to this project are documented here.
Generated automatically from release notes on each tagged release.

## [1.0.0] - 2026-05-30

First production release.

### Added
- Token-by-token streaming of chat responses over SSE (#26)
- Collapsible "thinking" panel surfacing agent reasoning and tool calls (#28)
- SEC 10-K diligence agent blog post with its PageIndex index (#25)
- Release workflow that publishes a GitHub release on each `v*` tag, restricted to tags on `main`

### Changed
- Instant provider failover on rate-limit — the Gemini and Groq clients use `max_retries=0` so `ModelFallbackMiddleware` switches providers in ~0.2s instead of burning ~33s of internal backoff (#27)
