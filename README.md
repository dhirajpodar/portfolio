# Portfolio

AI-powered portfolio website with an agentic chat assistant that uses reasoning-based tree-search retrieval (PageIndex) instead of vector databases.

## Project Structure

```
portfolio/
├── frontend/       Next.js app (UI, blog, chat interface)
├── backend/        FastAPI + LangGraph agent + PageIndex
└── docker-compose.yml
```

## Backend

FastAPI API with a LangGraph ReAct agent that answers questions about my experience, projects, and blog posts.

**Hybrid retrieval:**
- **Fast-path** (7 tools) -- instant lookups for skills, experience, contact, etc.
- **Deep-search** (3 PageIndex tools) -- reasoning-based tree navigation for blog content and technical deep-dives

**Stack:** Python, FastAPI, LangGraph, Groq (Kimi K2), PageIndex, SSE streaming

### Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # add your GROQ_API_KEY
```

### Build PageIndex indexes (one-time)

```bash
pip install litellm pyyaml
GROQ_API_KEY=your_key python3 scripts/build_index.py
```

Generates tree structures in `content/indexed/` from profile data and blog posts.

### Run

```bash
uvicorn app.main:app --reload --port 8000
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /chat` | SSE streaming chat with the agent |
| `GET /blog` | List all blog posts |
| `GET /blog/{slug}` | Single blog post |
| `GET /pageindex/documents` | Tree structures for all indexed documents |
| `GET /pageindex/documents/{id}` | Single document tree |
| `GET /pageindex/documents/{id}/sections/{lines}` | Section content by line numbers |
| `GET /health` | Health check |

## Frontend

Next.js portfolio site with chat interface, blog, and project showcase.

### Setup

```bash
cd frontend
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

## Releasing

Releases are automated with [release-please](https://github.com/googleapis/release-please-action) and driven by [Conventional Commits](https://www.conventionalcommits.org/):

- `fix:` → patch bump (e.g. `1.1.0` → `1.1.1`)
- `feat:` → minor bump (e.g. `1.1.0` → `1.2.0`)
- `feat!:` / `BREAKING CHANGE:` → major bump

On every push to `main`, release-please opens (and keeps updated) a **"Release vX.Y.Z" PR** that bumps `version.txt`, `frontend/package.json`, `backend/pyproject.toml`, and `CHANGELOG.md`. **Merging that PR** creates the git tag and GitHub release automatically — no manual tagging.

Commits like `docs:`/`chore:`/`ci:` don't trigger a release.

## How PageIndex Works

Traditional RAG uses vector similarity search. PageIndex replaces this with **reasoning-based tree-search**:

1. Documents are indexed into hierarchical tree structures (like a table of contents)
2. Each node has an LLM-generated summary
3. At query time, the agent navigates the tree by reading summaries and reasoning about which sections are relevant
4. Only the relevant sections are fetched -- precision retrieval through reasoning, not similarity
