import asyncio
from contextlib import asynccontextmanager
import json
import logging
import re
import uuid

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pydantic
from pydantic import BaseModel

from app.config import settings
from app.agent import agent
from app.blog import load_all_posts, load_post, get_all_tags
from app.notifications import notify_new_question
from app import pageindex_store

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    doc_count = len(pageindex_store.get_all_documents())
    if doc_count == 0:
        logger.warning(
            "No PageIndex documents found. Run 'python scripts/build_index.py' to generate indexes."
        )
    else:
        logger.info(f"PageIndex: {doc_count} documents loaded")
    logger.info("Portfolio API started")
    yield


app = FastAPI(title="Portfolio API", lifespan=lifespan)

origins = (
    settings.CORS_ORIGINS.split(",")
    if settings.CORS_ORIGINS != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = pydantic.Field(max_length=2000)
    thread_id: str | None = None


@app.get("/health")
async def health():
    return {"status": "ok"}


def extract_followups(text: str) -> tuple[str, list[str]]:
    """Extract follow-up questions from <!-- followups: [...] --> comment and return cleaned text + questions."""
    match = re.search(r"<!--\s*followups:\s*(\[.*?\])\s*-->", text, re.DOTALL)
    if not match:
        return text, []
    try:
        questions = json.loads(match.group(1))
    except (json.JSONDecodeError, ValueError):
        return text, []
    cleaned = text[:match.start()].rstrip()
    return cleaned, questions


async def _stream_agent(input_message, config, thread_id):
    """Yield SSE events from a single agent.astream() call.

    Handles both AIMessageChunk (streaming/create_react_agent) and
    AIMessage (non-streaming/create_agent) event types.
    """
    full_content = ""
    has_emitted_thinking = False
    tool_count = 0
    chunk_count = 0
    pending_content = ""
    any_tool_seen = False

    logger.info(f"[{thread_id[:8]}] Agent stream started")

    async for event, metadata in agent.astream(
        input_message, config=config, stream_mode="messages"
    ):
        msg_type = type(event).__name__

        if msg_type in ("AIMessageChunk", "AIMessage"):
            # Handle tool calls: chunks use tool_call_chunks, full messages use tool_calls
            tool_items = getattr(event, "tool_call_chunks", None) or getattr(event, "tool_calls", None) or []
            if tool_items:
                any_tool_seen = True
                if pending_content:
                    logger.info(f"[{thread_id[:8]}] Discarding pre-tool thinking ({len(pending_content)} chars)")
                    pending_content = ""
                if not has_emitted_thinking:
                    yield "event", json.dumps({"type": "thinking", "thread_id": thread_id})
                    has_emitted_thinking = True
                for tc in tool_items:
                    name = tc.get("name", "") if isinstance(tc, dict) else getattr(tc, "name", "")
                    if name:
                        tool_count += 1
                        logger.info(f"[{thread_id[:8]}] Tool call #{tool_count}: {name}")
                        event_data = {
                            "type": "tool_start",
                            "tool": name,
                            "thread_id": thread_id,
                        }
                        if name in ("get_blog_overview", "search_blog"):
                            args = tc.get("args", "") if isinstance(tc, dict) else getattr(tc, "args", "")
                            event_data["args"] = args if isinstance(args, str) else json.dumps(args)
                        yield "event", json.dumps(event_data)
            elif event.content:
                if any_tool_seen:
                    chunk_count += 1
                    full_content += event.content
                    yield "event", json.dumps({
                        "type": "content",
                        "content": event.content,
                        "thread_id": thread_id,
                    })
                else:
                    pending_content += event.content

            # Log finish reason and token usage if present
            if hasattr(event, "response_metadata") and event.response_metadata:
                finish = event.response_metadata.get("finish_reason")
                if finish:
                    logger.info(f"[{thread_id[:8]}] Finish reason: {finish}")
                usage = event.response_metadata.get("usage") or event.response_metadata.get("token_usage")
                if usage:
                    logger.info(f"[{thread_id[:8]}] Tokens: {usage}")

        elif msg_type == "ToolMessage":
            output = str(event.content)
            preview = output[:150] + "..." if len(output) > 150 else output
            logger.info(f"[{thread_id[:8]}] Tool result: {event.name} ({len(output)} chars)")
            yield "event", json.dumps({
                "type": "tool_end",
                "tool": event.name,
                "preview": preview,
                "thread_id": thread_id,
            })

    # If no tools were called, the buffered content IS the direct response
    if pending_content and not any_tool_seen:
        full_content = pending_content
        yield "event", json.dumps({
            "type": "content",
            "content": pending_content,
            "thread_id": thread_id,
        })

    logger.info(f"[{thread_id[:8]}] Stream complete: {chunk_count} chunks, {tool_count} tools, {len(full_content)} chars")
    yield "content", full_content


async def stream_response(message: str, thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    input_message = {"messages": [{"role": "user", "content": message}]}

    logger.info(f"[{thread_id[:8]}] Chat request: {message[:100]}{'...' if len(message) > 100 else ''}")

    full_content = ""
    max_retries = 2

    for attempt in range(max_retries + 1):
        try:
            async for kind, data in _stream_agent(input_message, config, thread_id):
                if kind == "event":
                    yield f"data: {data}\n\n"
                elif kind == "content":
                    full_content = data
            break  # success, exit retry loop

        except Exception as e:
            error_str = str(e).lower()
            is_rate_limit = "rate_limit" in error_str or "rate limit" in error_str or "429" in error_str

            if is_rate_limit and attempt < max_retries:
                wait = (attempt + 1) * 5  # 5s, 10s
                logger.warning(f"[{thread_id[:8]}] Rate limit (attempt {attempt + 1}/{max_retries}), retrying in {wait}s")
                yield f"data: {json.dumps({'type': 'content', 'content': chr(10) + chr(10) + '*One moment, gathering my thoughts...*' + chr(10) + chr(10), 'thread_id': thread_id})}\n\n"
                await asyncio.sleep(wait)
                continue

            logger.error(f"[{thread_id[:8]}] Streaming error: {type(e).__name__}: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': 'Something went wrong. Please try again.', 'thread_id': thread_id})}\n\n"
            break

    _, followups = extract_followups(full_content)
    if followups:
        logger.info(f"[{thread_id[:8]}] Follow-ups: {len(followups)}")
        yield f"data: {json.dumps({'type': 'followups', 'questions': followups, 'thread_id': thread_id})}\n\n"

    logger.info(f"[{thread_id[:8]}] Response complete: {len(full_content)} chars")
    yield f"data: {json.dumps({'type': 'done', 'thread_id': thread_id})}\n\n"


@app.post("/chat")
async def chat(request: ChatRequest):
    thread_id = request.thread_id or str(uuid.uuid4())

    asyncio.create_task(notify_new_question(request.message, thread_id))

    return StreamingResponse(
        stream_response(request.message, thread_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/blog")
async def list_posts():
    posts = load_all_posts()
    return {"posts": posts, "tags": get_all_tags(posts)}


@app.get("/blog/{slug}")
async def get_post(slug: str):
    post = load_post(slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# --- PageIndex Showcase Endpoints ---

@app.get("/pageindex/documents")
async def pageindex_documents():
    """Return catalog of all indexed documents with their tree structures."""
    documents = pageindex_store.get_all_documents()
    result = []
    for doc_id in documents:
        result.append({
            "doc_id": doc_id,
            **json.loads(pageindex_store.get_document_info(doc_id)),
            "structure": pageindex_store.get_tree_without_text(doc_id),
        })
    return {"documents": result}


@app.get("/pageindex/documents/{doc_id}")
async def pageindex_document(doc_id: str):
    """Return a single document's tree structure."""
    documents = pageindex_store.get_all_documents()
    if doc_id not in documents:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found")
    return {
        **json.loads(pageindex_store.get_document_info(doc_id)),
        "structure": pageindex_store.get_tree_without_text(doc_id),
    }


@app.get("/pageindex/documents/{doc_id}/sections/{line_nums}")
async def pageindex_sections(doc_id: str, line_nums: str):
    """Return content for specific sections of a document by line numbers."""
    content_json = pageindex_store.get_content(doc_id, line_nums)
    content = json.loads(content_json)
    if isinstance(content, dict) and "error" in content:
        raise HTTPException(status_code=400, detail=content["error"])
    return {"doc_id": doc_id, "sections": content}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
