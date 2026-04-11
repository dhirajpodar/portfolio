# Project Guidelines

## Structure

- `frontend/` -- Next.js app (see `frontend/AGENTS.md` for Next.js-specific rules)
- `backend/` -- FastAPI + LangGraph agent with PageIndex integration

## Backend

- **Framework:** FastAPI with SSE streaming
- **Agent:** LangGraph ReAct agent with 10 tools (7 fast-path + 3 PageIndex deep-search)
- **LLM:** Groq Kimi K2 (`moonshotai/kimi-k2-instruct`) via `langchain-groq`
- **Retrieval:** Hybrid -- hardcoded profile tools for quick facts, PageIndex tree-search for blog deep-dives
- **Runtime deps:** stdlib only for PageIndex (no litellm/yaml at runtime). `litellm` + `pyyaml` are build-time only (in `scripts/`)

### Key files

- `backend/app/agent.py` -- agent tools + system prompt
- `backend/app/main.py` -- FastAPI endpoints + SSE streaming with rate limit retry
- `backend/app/pageindex_store.py` -- loads pre-built JSON trees at startup
- `backend/app/pageindex/retrieve.py` -- runtime retrieval (stdlib only)
- `backend/scripts/build_index.py` -- offline indexing via Groq/LiteLLM

### Rules

- Never add `litellm` or `pyyaml` to `pyproject.toml` -- they are build-time only
- Pre-built JSON indexes live in `backend/content/indexed/` -- regenerate with `scripts/build_index.py`
- `app/pageindex/` is runtime code (zero external deps). `scripts/` is build-time code (needs litellm)
- Model for ChatGroq: use name WITHOUT `groq/` prefix. Model for LiteLLM: use WITH `groq/` prefix
- Rate limit handling: ChatGroq has `max_retries=3`, SSE stream retries with backoff on 429

## Frontend

- See `frontend/AGENTS.md` for Next.js version-specific rules
- API base URL configured in `frontend/src/lib/constants.ts`
