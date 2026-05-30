import asyncio
import sys
import threading
from contextlib import asynccontextmanager, nullcontext
import json
import logging
import uuid

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pydantic
from pydantic import BaseModel

from app.config import settings
from app.agent import agent
from app.blog import load_all_posts, load_post, get_all_tags
from app.notifications import notify_new_question
from app import pageindex_store
from app.rate_limit import RateLimiter

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
    logger.info(f"Email notifications: enabled={settings.EMAIL_NOTIFICATIONS_ENABLED}, api_key_set={bool(settings.RESEND_API_KEY)}, notify_email={settings.NOTIFY_EMAIL or 'not set'}")
    yield


app = FastAPI(title="Portfolio API", lifespan=lifespan)

rate_limiter = RateLimiter(
    per_ip_per_min=settings.RATE_LIMIT_PER_IP_PER_MIN,
    per_ip_per_day=settings.RATE_LIMIT_PER_IP_PER_DAY,
    global_per_day=settings.RATE_LIMIT_GLOBAL_PER_DAY,
)

origins = (
    settings.CORS_ORIGINS.split(",")
    if settings.CORS_ORIGINS != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=settings.CORS_ORIGINS != "*",
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = pydantic.Field(max_length=2000)
    thread_id: str | None = None


@app.get("/health")
async def health():
    return {"status": "ok"}


_STREAM_DONE = object()


async def _agent_stream(input_message, config):
    """Async wrapper over the agent's *sync* .stream().

    create_agent's async .astream() does not emit token chunks in
    langchain 1.2 (returns one AIMessage per response — see langchain
    issue #34017). Its sync .stream() streams AIMessageChunk correctly,
    so we run it in a worker thread and hand chunks back to the event
    loop. Yields (event, metadata) tuples, same shape as .astream().
    """
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue()
    stop = threading.Event()

    def _produce():
        try:
            for chunk in agent.stream(
                input_message, config=config, stream_mode="messages"
            ):
                if stop.is_set():  # consumer gone (timeout/disconnect) — bail
                    return
                loop.call_soon_threadsafe(queue.put_nowait, chunk)
        except Exception as exc:  # surface to the consumer, don't swallow
            loop.call_soon_threadsafe(queue.put_nowait, exc)
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, _STREAM_DONE)

    threading.Thread(target=_produce, daemon=True).start()

    try:
        while True:
            item = await queue.get()
            if item is _STREAM_DONE:
                break
            if isinstance(item, Exception):
                raise item
            yield item
    finally:
        # On timeout/cancellation, signal the worker to stop at the next chunk
        # instead of draining the whole response into an unread queue.
        stop.set()


async def _stream_agent(input_message, config, thread_id):
    """Yield SSE events from a single agent stream.

    Handles both AIMessageChunk (streaming) and AIMessage
    (non-streaming) event types.
    """
    full_content = ""
    has_emitted_thinking = False
    tool_count = 0
    chunk_count = 0
    in_answer = False  # flips True after the first tool result; until then,
    # any model text is reasoning/narration, not the final answer

    logger.info(f"[{thread_id[:8]}] Agent stream started")

    async for event, metadata in _agent_stream(input_message, config):
        msg_type = type(event).__name__

        if msg_type in ("AIMessageChunk", "AIMessage"):
            # Handle tool calls: chunks use tool_call_chunks, full messages use tool_calls
            tool_items = getattr(event, "tool_call_chunks", None) or getattr(event, "tool_calls", None) or []
            if tool_items:
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
                # Stream every chunk live. Text before the first tool result is
                # the model's reasoning/narration ("let me check ...") and is
                # tagged as "reasoning" so the client can show it in a separate
                # thinking panel. Everything after a tool result is the answer.
                chunk_count += 1
                if in_answer:
                    full_content += event.content
                    yield "event", json.dumps({
                        "type": "content",
                        "content": event.content,
                        "thread_id": thread_id,
                    })
                else:
                    yield "event", json.dumps({
                        "type": "reasoning",
                        "content": event.content,
                        "thread_id": thread_id,
                    })

            # Log finish reason and token usage if present
            if hasattr(event, "response_metadata") and event.response_metadata:
                finish = event.response_metadata.get("finish_reason")
                if finish:
                    logger.info(f"[{thread_id[:8]}] Finish reason: {finish}")
                usage = event.response_metadata.get("usage") or event.response_metadata.get("token_usage")
                if usage:
                    logger.info(f"[{thread_id[:8]}] Tokens: {usage}")

        elif msg_type == "ToolMessage":
            in_answer = True  # tools have run; subsequent text is the answer
            output = str(event.content)
            preview = output[:150] + "..." if len(output) > 150 else output
            logger.info(f"[{thread_id[:8]}] Tool result: {event.name} ({len(output)} chars)")
            yield "event", json.dumps({
                "type": "tool_end",
                "tool": event.name,
                "preview": preview,
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
            timeout_cm = asyncio.timeout(60) if sys.version_info >= (3, 11) else nullcontext()
            async with timeout_cm:
                async for kind, data in _stream_agent(input_message, config, thread_id):
                    if kind == "event":
                        yield f"data: {data}\n\n"
                    elif kind == "content":
                        full_content = data
            break  # success, exit retry loop

        except TimeoutError:
            logger.error(f"[{thread_id[:8]}] Agent stream timed out after 60s")
            yield f"data: {json.dumps({'type': 'error', 'error': 'Response timed out. Please try again.', 'thread_id': thread_id})}\n\n"
            break

        except Exception as e:
            error_str = str(e).lower()
            is_rate_limit = "rate_limit" in error_str or "rate limit" in error_str or "429" in error_str

            if is_rate_limit and attempt < max_retries:
                wait = (attempt + 1) * 5  # 5s, 10s
                logger.warning(f"[{thread_id[:8]}] Rate limit (attempt {attempt + 1}/{max_retries}), retrying in {wait}s")
                cold_payload = json.dumps({"type": "content", "content": "\n\n*One moment, gathering my thoughts...*\n\n", "thread_id": thread_id})
                yield f"data: {cold_payload}\n\n"
                await asyncio.sleep(wait)
                continue

            logger.error(f"[{thread_id[:8]}] Streaming error: {type(e).__name__}: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': 'Something went wrong. Please try again.', 'thread_id': thread_id})}\n\n"
            break

    logger.info(f"[{thread_id[:8]}] Response complete: {len(full_content)} chars")
    yield f"data: {json.dumps({'type': 'done', 'thread_id': thread_id})}\n\n"


def _client_ip(http_request: Request) -> str:
    xff = http_request.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[0].strip()
    return http_request.client.host if http_request.client else ""


_SSE_HEADERS = {
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
}


async def _stream_rate_limited(message: str, thread_id: str):
    """Emit a single content event with the denial message, then done."""
    yield f"data: {json.dumps({'type': 'content', 'content': message, 'thread_id': thread_id})}\n\n"
    yield f"data: {json.dumps({'type': 'done', 'thread_id': thread_id})}\n\n"


@app.post("/chat")
async def chat(request: ChatRequest, http_request: Request):
    thread_id = request.thread_id or str(uuid.uuid4())
    client_ip = _client_ip(http_request)

    if settings.RATE_LIMIT_ENABLED:
        allowed, reason = await rate_limiter.check(client_ip)
        if not allowed:
            logger.warning(f"[{thread_id[:8]}] Rate limited: ip={client_ip} reason={reason}")
            return StreamingResponse(
                _stream_rate_limited(reason, thread_id),
                media_type="text/event-stream",
                headers=_SSE_HEADERS,
            )

    asyncio.create_task(notify_new_question(
        request.message,
        thread_id,
        client_ip=client_ip,
        user_agent=http_request.headers.get("user-agent", ""),
        referer=http_request.headers.get("referer", ""),
        accept_language=http_request.headers.get("accept-language", ""),
    ))

    return StreamingResponse(
        stream_response(request.message, thread_id),
        media_type="text/event-stream",
        headers=_SSE_HEADERS,
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
