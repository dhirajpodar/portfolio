# Changelog

All notable changes to this project are documented here.
Generated automatically from release notes on each tagged release.

## [1.2.0](https://github.com/dhirajpodar/portfolio/compare/v1.1.0...v1.2.0) (2026-06-06)


### Features

* add German (de) language support via next-intl ([7677189](https://github.com/dhirajpodar/portfolio/commit/7677189166702512244996606df0a713cc552108))
* add German (de) language support via next-intl ([c105190](https://github.com/dhirajpodar/portfolio/commit/c1051909658031bb79cb2f2cfcd0505a3a04e9e3)), closes [#38](https://github.com/dhirajpodar/portfolio/issues/38)
* add OpenRouter native model fallback ([a8b3dab](https://github.com/dhirajpodar/portfolio/commit/a8b3daba981a78c5b5b5d56622f6abc60e15d4cb))
* expose blog post dates to the chat agent ([fed231a](https://github.com/dhirajpodar/portfolio/commit/fed231a9609c1daa0c158e0994186dd4282c9cb6))
* expose blog post dates to the chat agent ([cef79ba](https://github.com/dhirajpodar/portfolio/commit/cef79ba211943121bc5bbbf1259f3c65dad43aff)), closes [#37](https://github.com/dhirajpodar/portfolio/issues/37)
* randomize suggested questions from an expanded pool ([d256131](https://github.com/dhirajpodar/portfolio/commit/d256131f8e65d7e656396a0c0cbc87ad2458ba05))
* randomize suggested questions from an expanded pool ([2bd002d](https://github.com/dhirajpodar/portfolio/commit/2bd002dbcfc7da018de41854ea002c47eb98619c))
* switch chat model provider to OpenRouter ([14f0d35](https://github.com/dhirajpodar/portfolio/commit/14f0d35f1f3c3ffe94048bb37ed6ba1a2a5e4a4e))
* switch chat model provider to OpenRouter ([f0fca53](https://github.com/dhirajpodar/portfolio/commit/f0fca53af0d53117d6688bdd5b8941a3557219be))

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
