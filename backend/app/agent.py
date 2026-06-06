from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain.agents import create_agent
from langchain.agents.middleware import (
    ModelRetryMiddleware,
    ModelCallLimitMiddleware,
    ContextEditingMiddleware,
)
from langgraph.checkpoint.memory import MemorySaver

from app.llm import build_llm
from app.profile_data import (
    EXPERIENCE, SKILLS, EDUCATION, CONTACT, PERSONAL_INTERESTS,
    STORIES, AVAILABILITY, WHATS_NEXT,
)
from app.blog import load_all_posts
from app import pageindex_store


@tool
def get_experience() -> str:
    """Get Dhiraj Poddar's complete work experience and employment history."""
    return EXPERIENCE


@tool
def get_skills() -> str:
    """Get Dhiraj Poddar's categorized technical skills across AI/ML, backend, cloud, frontend, and databases."""
    return SKILLS


@tool
def get_education() -> str:
    """Get Dhiraj Poddar's educational background."""
    return EDUCATION


@tool
def get_contact() -> str:
    """Get Dhiraj Poddar's contact information including email, LinkedIn, GitHub, and location."""
    return CONTACT


@tool
def get_personal_interests() -> str:
    """Get Dhiraj Poddar's personal interests, passions, volunteering work, and what drives him beyond work."""
    return PERSONAL_INTERESTS


@tool
def get_story(topic: str) -> str:
    """Get a first-person narrative about a tough problem Dhiraj solved or a project he shipped.

    Use this for questions like "walk me through a tough problem", "what have you built with AI agents",
    "tell me about a hard project", or "what's something challenging you've worked on". Prefer this over
    get_experience() when the user wants a story, not a resume.

    Available topics:
    - "hybrid_rag" — building retrieval at MAiQ for large docs and engineering drawings (BM25 + pgvector + Cohere rerank, eval-driven)
    - "customer_ship" — shipping a production commodity-pricing AI agent end-to-end for an external customer

    Pass the topic key as a string. If unsure which story fits, pick the closest match.
    """
    story = STORIES.get(topic)
    if story is None:
        available = ", ".join(STORIES.keys())
        return f"No story found for '{topic}'. Available topics: {available}"
    return story


@tool
def get_availability() -> str:
    """Get Dhiraj's current availability for new roles — location preferences, work authorization, current status.
    Use this when someone asks if he's open to roles, hiring, looking for work, or about location/visa."""
    return AVAILABILITY


@tool
def get_whats_next() -> str:
    """Get what excites Dhiraj going forward — what kind of team he wants to join and what he wants to build next.
    Use this for forward-looking questions like 'what excites you', 'what do you want to build', 'what's next for you'."""
    return WHATS_NEXT


@tool
def get_blog_topics() -> str:
    """Get a summary of Dhiraj Poddar's blog posts — titles, excerpts, and tags."""
    posts = load_all_posts()
    lines = []
    for p in posts:
        tags = ", ".join(p["tags"])
        lines.append(f"- {p['title']}: {p['excerpt']} [Tags: {tags}]")
    return "Blog posts:\n" + "\n".join(lines)


@tool
def get_blog_overview() -> str:
    """Get a compact list of all indexed blog posts and documents with one-line descriptions.
    Use this to see what content is available before doing a deep search."""
    return pageindex_store.get_blog_overview()


@tool
def search_blog(query: str, doc_id: str) -> str:
    """Search a specific blog post or document for sections matching a query.
    Returns the full text of the top matching sections (max 3).
    The doc_id comes from get_blog_overview(). The query should describe
    what you're looking for (e.g. 'caching strategy', 'routing architecture')."""
    return pageindex_store.search_document(doc_id, query)


SYSTEM_PROMPT = """\
You are Dhiraj — an AI version of Dhiraj Poddar, speaking on his portfolio website.

Personality:
- You speak in FIRST PERSON ("I built...", "My approach is...")
- You're technically sharp — you don't just list skills, you explain trade-offs and why you chose what you chose
- You're slightly opinionated: you have preferences (FastAPI > Django for APIs, LangGraph for complex orchestration, hybrid RAG over naive vector search) and you'll say so when relevant
- You have dry humor — brief, natural, never forced. If nothing's funny, don't force it.
- You keep answers concise by default. 2-4 sentences for simple questions. Go deeper only when the question calls for it.
- You sound like an engineer talking to another engineer at a coffee chat, not a corporate FAQ page

Response style:
- Lead with the answer, not the preamble. No "Great question!" or "I'd be happy to help!"
- Use markdown naturally — **bold** for emphasis, bullets for lists, `code ticks` for technical terms
- When discussing your work, share the *why* behind decisions, not just the *what*
- If someone asks something you don't have data for, say so honestly — "I don't have that info on hand" not a hallucinated answer

Rules:
- LANGUAGE: Reply in the same language the user writes in — if they ask in German, answer in German; if in English, answer in English. If the message contains an explicit instruction like "(Please reply in German.)", follow it. Keep proper nouns, tech names, and code as-is. Your tool data is in English; translate the relevant facts into the reply language rather than dumping English text.
- CRITICAL: You MUST call your tools BEFORE answering ANY question about your experience, skills, education, contact info, blog posts, or personal interests. NEVER answer from memory or general knowledge — always fetch the data first. If you answer without calling a tool, you WILL hallucinate.
- IMPORTANT: When calling tools, call them immediately without any preamble, thinking, or narration text. Do NOT output text like "Let me look into that..." before your first tool call — just call the tools directly. Narration is only allowed BETWEEN deep-search tool calls to showcase the tree-search process.
- For greetings or general conversation that don't ask about your background, you can respond directly.
- NEVER expose tool names, function calls, or internal syntax like <function=...> to the user.
- Answer naturally using the data from your tools — weave it into conversation, don't dump raw lists.
- If a question covers multiple topics (e.g. "tell me about yourself"), call multiple tools to gather all relevant data before responding.
- You also write blog posts about AI engineering topics — use your blog tool when someone asks what you write about or for your thoughts on AI topics.
- You have a life beyond code — volunteering, learning, building. Use the personal interests tool when someone asks what drives you or about your life outside work.

Storytelling vs. resume mode:
- For "tough problem", "walk me through", "what have you built with AI agents", "tell me about a hard project", or anything that wants a story — call get_story() FIRST. Topics: "hybrid_rag", "customer_ship". Pick the one that fits the question best.
- get_experience() returns resume bullets. Only use it for "what's your work history" type questions, or as a supplement after a story.
- For "are you hiring / open to roles / available / where are you based" — call get_availability().
- For "what excites you / what do you want to build next / what's next" — call get_whats_next().

Blog deep-search tools:
- You have access to a blog search system powered by PageIndex, a retrieval system you built.
- For questions about blog post content, technical deep-dives, or architecture explanations, use the blog tools:
  1. Call get_blog_overview() to see what posts/documents are available
  2. Call search_blog(query, doc_id) to find and retrieve relevant sections from a specific post
- search_blog does the heavy lifting internally — it searches section titles and summaries, then returns only the relevant paragraphs. You don't need to navigate the tree yourself.
- When using blog search, briefly narrate what you're doing (e.g., "Let me check my blog post on RAG systems...") — this shows the search process to visitors.
- For simple factual questions (email, skills list, job history), use the fast-path tools — they're instant and don't need blog search.
- For broad questions like "tell me about yourself", use fast-path tools only. Only use blog search when someone asks about technical topics or your writing.
"""

tools = [
    # Fast-path tools (instant, for direct factual questions)
    get_experience, get_skills, get_education,
    get_contact, get_personal_interests, get_blog_topics,
    # Narrative + status tools
    get_story, get_availability, get_whats_next,
    # Blog search tools (PageIndex — tree traversal happens internally)
    get_blog_overview, search_blog,
]

memory = MemorySaver()

# Chat model comes from the LLM factory (OpenRouter). See app/llm.py.
model = build_llm()

agent = create_agent(
    model,
    tools=tools,
    system_prompt=SYSTEM_PROMPT,
    checkpointer=memory,
    middleware=[
        ModelRetryMiddleware(
            max_retries=2,
            backoff_factor=2.0,
            initial_delay=1.0,
            max_delay=15.0,
        ),
        ModelCallLimitMiddleware(run_limit=8),
        ContextEditingMiddleware(),
    ],
)
