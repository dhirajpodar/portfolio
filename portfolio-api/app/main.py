import asyncio
import json
import logging
import re
import uuid

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.config import settings
from app.agent import agent
from app.blog import load_all_posts, load_post, get_all_tags
from app.notifications import notify_new_question

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Portfolio API")

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
    message: str
    thread_id: str | None = None


@app.on_event("startup")
async def startup():
    logger.info("Portfolio API started")


SUGGESTED_QUESTIONS = [
    "What have you built with AI agents?",
    "What do you write about?",
    "What drives you outside of work?",
    "Are you open to new opportunities?",
    "Walk me through a tough problem you solved",
]


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/suggested-questions")
async def suggested_questions():
    return {"questions": SUGGESTED_QUESTIONS}


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


async def stream_response(message: str, thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    input_message = {"messages": [{"role": "user", "content": message}]}

    has_emitted_thinking = False
    full_content = ""

    try:
        async for event, metadata in agent.astream(
            input_message, config=config, stream_mode="messages"
        ):
            msg_type = type(event).__name__

            if msg_type == "AIMessageChunk":
                # Tool call chunks — emit thinking + tool_start
                tool_chunks = event.tool_call_chunks or []
                if tool_chunks:
                    if not has_emitted_thinking:
                        payload = json.dumps({"type": "thinking", "thread_id": thread_id})
                        yield f"data: {payload}\n\n"
                        has_emitted_thinking = True
                    for tc in tool_chunks:
                        name = tc.get("name", "")
                        if name:
                            payload = json.dumps({
                                "type": "tool_start",
                                "tool": name,
                                "thread_id": thread_id,
                            })
                            yield f"data: {payload}\n\n"

                # Content token — stream word by word
                elif event.content:
                    full_content += event.content
                    payload = json.dumps({
                        "type": "content",
                        "content": event.content,
                        "thread_id": thread_id,
                    })
                    yield f"data: {payload}\n\n"

            elif msg_type == "ToolMessage":
                output = str(event.content)
                preview = output[:150] + "..." if len(output) > 150 else output
                payload = json.dumps({
                    "type": "tool_end",
                    "tool": event.name,
                    "preview": preview,
                    "thread_id": thread_id,
                })
                yield f"data: {payload}\n\n"

    except Exception as e:
        logger.error(f"Streaming error: {e}")
        error_payload = json.dumps({
            "type": "error",
            "error": str(e),
            "thread_id": thread_id,
        })
        yield f"data: {error_payload}\n\n"

    # Extract follow-up questions and emit as separate event
    _, followups = extract_followups(full_content)
    if followups:
        followup_payload = json.dumps({
            "type": "followups",
            "questions": followups,
            "thread_id": thread_id,
        })
        yield f"data: {followup_payload}\n\n"

    done_payload = json.dumps({"type": "done", "thread_id": thread_id})
    yield f"data: {done_payload}\n\n"


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


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
