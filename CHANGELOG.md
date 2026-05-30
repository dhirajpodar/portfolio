# Changelog

All notable changes to this project are documented here.
Generated automatically from release notes on each tagged release.

## [1.1.0] - 2026-05-30

## What's Changed
* fix: stream no-tool greetings inline instead of in the thinking panel by @dhirajpodar in https://github.com/dhirajpodar/portfolio/pull/30
* feat: expose the model's chain-of-thought in the thinking panel by @dhirajpodar in https://github.com/dhirajpodar/portfolio/pull/32
* chore: auto-generate CHANGELOG.md on each release by @dhirajpodar in https://github.com/dhirajpodar/portfolio/pull/31
* fix: keep chain-of-thought working across the fallback chain by @dhirajpodar in https://github.com/dhirajpodar/portfolio/pull/33
* Release: chain-of-thought exposure + fallback reliability by @dhirajpodar in https://github.com/dhirajpodar/portfolio/pull/34


**Full Changelog**: https://github.com/dhirajpodar/portfolio/compare/v1.0.0...v1.1.0

## [1.0.0] - 2026-05-30

First production release.

### Added
- Token-by-token streaming of chat responses over SSE (#26)
- Collapsible "thinking" panel surfacing agent reasoning and tool calls (#28)
- SEC 10-K diligence agent blog post with its PageIndex index (#25)
- Release workflow that publishes a GitHub release on each `v*` tag, restricted to tags on `main`

### Changed
- Instant provider failover on rate-limit — the Gemini and Groq clients use `max_retries=0` so `ModelFallbackMiddleware` switches providers in ~0.2s instead of burning ~33s of internal backoff (#27)