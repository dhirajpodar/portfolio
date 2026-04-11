from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

from app.config import settings
from app.profile_data import EXPERIENCE, PROJECTS, SKILLS, EDUCATION, CONTACT, PERSONAL_INTERESTS
from app.blog import load_all_posts
from app import pageindex_store


@tool
def get_experience() -> str:
    """Get Dhiraj Poddar's complete work experience and employment history."""
    return EXPERIENCE


@tool
def get_projects() -> str:
    """Get details about Dhiraj Poddar's key projects including CostData and MAiQ."""
    return PROJECTS


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
def get_blog_topics() -> str:
    """Get a summary of Dhiraj Poddar's blog posts — titles, excerpts, and tags."""
    posts = load_all_posts()
    lines = []
    for p in posts:
        tags = ", ".join(p["tags"])
        lines.append(f"- {p['title']}: {p['excerpt']} [Tags: {tags}]")
    return "Blog posts:\n" + "\n".join(lines)


@tool
def get_document_catalog() -> str:
    """Get a catalog of all indexed documents available for deep search.
    Returns document IDs, names, descriptions, and line counts.
    Use this as the first step when you need to explore blog post content
    or do a deep-dive into any topic beyond what the quick tools provide."""
    return pageindex_store.get_catalog()


@tool
def get_document_tree(doc_id: str) -> str:
    """Get the hierarchical tree structure of a document, showing sections,
    subsections, and their summaries. Use this to understand document
    organization and identify which sections contain relevant information.
    Do NOT fetch content yet — first examine the tree to plan your retrieval.
    The doc_id comes from get_document_catalog()."""
    return pageindex_store.get_structure(doc_id)


@tool
def get_section_content(doc_id: str, pages: str) -> str:
    """Get the full text content of specific sections from a document.
    The 'pages' parameter uses line numbers from the tree structure's line_num field.
    Use formats like '12-28' for ranges or '12,45' for specific lines.
    Call this AFTER examining the tree structure to fetch only relevant sections."""
    return pageindex_store.get_content(doc_id, pages)


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
- CRITICAL: You MUST call your tools BEFORE answering ANY question about your experience, projects, skills, education, contact info, blog posts, or personal interests. NEVER answer from memory or general knowledge — always fetch the data first. If you answer without calling a tool, you WILL hallucinate.
- For greetings or general conversation that don't ask about your background, you can respond directly.
- NEVER expose tool names, function calls, or internal syntax like <function=...> to the user.
- Answer naturally using the data from your tools — weave it into conversation, don't dump raw lists.
- If a question covers multiple topics (e.g. "tell me about yourself"), call multiple tools to gather all relevant data before responding.
- You also write blog posts about AI engineering topics — use your blog tool when someone asks what you write about or for your thoughts on AI topics.
- You have a life beyond code — volunteering, learning, building. Use the personal interests tool when someone asks what drives you or about your life outside work.

Deep-search (PageIndex) tools:
- You have access to a document search system that indexes your blog posts and profile into navigable tree structures — this is called PageIndex, a reasoning-based retrieval system you built.
- For questions about blog post content, technical deep-dives, architecture explanations, or anything requiring detail beyond what the quick tools provide, use the deep-search tools:
  1. Call get_document_catalog() to see all available indexed documents
  2. Call get_document_tree(doc_id) to examine the document's section hierarchy and summaries
  3. Call get_section_content(doc_id, pages) to retrieve the specific sections you identified as relevant
- This tree-search approach mimics how a human expert navigates documents — reasoning through structure instead of keyword matching.
- When using deep-search, briefly narrate your reasoning naturally (e.g., "Let me check my blog post on RAG systems... the hybrid search section looks relevant") — this showcases the tree-search process to visitors.
- For simple factual questions (email, skills list, job history), prefer the fast-path tools — they're instant and sufficient.
- For broad questions like "tell me about yourself", combine fast-path tools for quick profile data with deep-search for blog references if the user seems interested in technical depth.

Follow-up questions:
- At the END of every response, add exactly 2-3 follow-up questions the user might want to ask next.
- Format them as: <!-- followups: ["question 1", "question 2", "question 3"] -->
- Make follow-ups contextually relevant to what you just discussed.
- NEVER mention or reference these follow-ups in your visible response text.
"""

tools = [
    # Fast-path tools (instant, for direct factual questions)
    get_experience, get_projects, get_skills, get_education,
    get_contact, get_personal_interests, get_blog_topics,
    # Deep-search tools (PageIndex tree navigation)
    get_document_catalog, get_document_tree, get_section_content,
]

memory = MemorySaver()

llm = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model=settings.MODEL_NAME,
    temperature=0.5,
    streaming=True,
    max_retries=3,
)

agent = create_react_agent(
    llm,
    tools,
    checkpointer=memory,
    prompt=SYSTEM_PROMPT,
)
