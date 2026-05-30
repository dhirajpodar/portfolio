# Portfolio Project

AI-powered portfolio website with an agentic chat assistant using reasoning-based tree-search retrieval (PageIndex).

## Structure

```
portfolio/
├── frontend/          Next.js 16, React 19, TailwindCSS, Framer Motion
├── backend/           FastAPI, LangGraph, Gemini/Groq fallback, PageIndex
└── docker-compose.yml
```

See `frontend/CLAUDE.md` and `backend/CLAUDE.md` for detailed guidelines.

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env   # add GEMINI_API_KEY and GROQ_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker compose up --build
```

## Architecture

- **Chat:** Frontend sends messages to `POST /chat`, backend streams SSE events (thinking, tool calls, content tokens, follow-ups)
- **Agent:** LangGraph agent with middleware (retry, fallback, call limit, context editing) -- 7 fast-path tools (instant profile lookups) + 2 PageIndex tools (smart blog deep-search)
- **PageIndex:** Documents indexed into hierarchical trees at build time. Agent navigates trees by reading summaries, then fetches only relevant sections. No vector DB.
- **Blog:** Markdown posts with YAML frontmatter in `backend/content/posts/`, served via `/blog` API

## Key Rules

- `backend/app/pageindex/` has zero external deps at runtime. `litellm`/`pyyaml` are build-time only (`backend/scripts/`)
- Never add `litellm` or `pyyaml` to `pyproject.toml`
- Rebuild PageIndex indexes: `cd backend && python3 scripts/build_index.py`
- Model for ChatGoogleGenerativeAI: plain name (e.g. `gemini-2.5-flash-lite`). Model for LiteLLM: WITH `groq/` prefix
- Releases are automated via release-please — use Conventional Commit prefixes (`feat:`/`fix:`/`feat!:`); never manually `git tag`. Merge the bot's "Release vX.Y.Z" PR to publish. See README "Releasing"
- Do not include "Generated with Claude Code" or any Claude Code references in commit messages or PR descriptions
