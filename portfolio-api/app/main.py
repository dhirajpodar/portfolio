import json
import logging
import re
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.config import settings
from app.agent import agent

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


@app.get("/health")
async def health():
    return {"status": "ok"}


async def stream_response(message: str, thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    input_message = {"messages": [{"role": "user", "content": message}]}

    has_emitted_thinking = False
    tools_were_called = False

    try:
        async for event in agent.astream_events(input_message, config=config, version="v2"):
            kind = event.get("event")

            if kind == "on_chat_model_start":
                if not has_emitted_thinking:
                    payload = json.dumps({"type": "thinking", "thread_id": thread_id})
                    yield f"data: {payload}\n\n"
                    has_emitted_thinking = True

            elif kind == "on_tool_start":
                tools_were_called = True
                tool_name = event.get("name", "unknown")
                payload = json.dumps({
                    "type": "tool_start",
                    "tool": tool_name,
                    "thread_id": thread_id,
                })
                yield f"data: {payload}\n\n"

            elif kind == "on_tool_end":
                tool_name = event.get("name", "unknown")
                output = str(event["data"].get("output", ""))
                preview = output[:150] + "..." if len(output) > 150 else output
                payload = json.dumps({
                    "type": "tool_end",
                    "tool": tool_name,
                    "preview": preview,
                    "thread_id": thread_id,
                })
                yield f"data: {payload}\n\n"

            elif kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    # Strip leaked function call syntax from model output
                    content = re.sub(r'<function=\w+>\{[^}]*\}</function>', '', content)
                    content = re.sub(r'<function=\w+>[^<]*</function>', '', content)
                    if content.strip():
                        payload = json.dumps({
                            "type": "content",
                            "content": content,
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

    done_payload = json.dumps({"type": "done", "thread_id": thread_id})
    yield f"data: {done_payload}\n\n"


@app.post("/chat")
async def chat(request: ChatRequest):
    thread_id = request.thread_id or str(uuid.uuid4())

    return StreamingResponse(
        stream_response(request.message, thread_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
