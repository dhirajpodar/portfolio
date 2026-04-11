@AGENTS.md

# Frontend Guidelines

## Stack

- **Framework:** Next.js 16 with App Router
- **React:** 19
- **Styling:** TailwindCSS 4 + Framer Motion
- **Markdown:** react-markdown (blog posts)
- **Icons:** lucide-react

## Structure

```
src/
├── app/                  Routes (App Router)
│   ├── page.tsx          Landing / chat page
│   ├── about/            About page
│   └── blog/             Blog listing + [slug] detail
├── components/           UI components
│   ├── chat-page.tsx     Chat interface (SSE streaming)
│   ├── agent-steps.tsx   Agent tool call visualization
│   ├── navigation.tsx    Top nav bar
│   ├── hero.tsx, about.tsx, experience.tsx, skills.tsx, projects.tsx, education.tsx, contact.tsx
│   ├── blog/             Blog components (grid, card, article, toc, markdown)
│   └── landing/          Landing page sections
└── lib/
    ├── constants.ts      All static data (experience, projects, skills, education)
    ├── use-chat.ts       Chat hook (SSE streaming to backend)
    ├── blog-api.ts       Blog API client
    ├── agent-events.ts   SSE event types
    └── chat-context.tsx  Chat state context
```

## Backend Connection

- API base URL is in `lib/use-chat.ts` and `lib/blog-api.ts`
- Backend runs at `http://localhost:8000` (see `../backend/`)
- Chat uses SSE streaming (`POST /chat`) with event types: `thinking`, `tool_start`, `tool_end`, `content`, `followups`, `done`, `error`
- PageIndex tool events include `args` field for tree visualization

## Rules

- All static profile data lives in `lib/constants.ts` -- update there, not in individual components
- Blog posts are served by the backend API, not stored in frontend
- Chat streaming uses `EventSource`-style parsing of SSE from backend
