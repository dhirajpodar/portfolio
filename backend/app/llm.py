"""LLM factory — single source of truth for the chat model.

Runtime uses OpenRouter exclusively: one free model, OpenAI-compatible, so we
use ChatOpenAI pointed at OpenRouter's base_url (no extra dependency).
extra_body enables OpenRouter's unified reasoning param — a reasoning model
streams chain-of-thought to the thinking panel; a non-reasoning model returns
none and the panel stays empty.
"""
from functools import lru_cache

from langchain_openai import ChatOpenAI

from app.config import settings

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


class ChatOpenRouter(ChatOpenAI):
    """ChatOpenAI variant that recovers OpenRouter's reasoning stream.

    langchain's ChatOpenAI deliberately drops provider-specific reasoning fields
    on the chat-completions path (it only surfaces reasoning via OpenAI's
    Responses API, which OpenRouter doesn't expose). OpenRouter streams its
    chain-of-thought in `delta.reasoning`, so we re-attach it as
    `reasoning_content` — the channel app/main.py:_split_reasoning already reads.
    """

    def _convert_chunk_to_generation_chunk(
        self, chunk, default_chunk_class, base_generation_info
    ):
        gen = super()._convert_chunk_to_generation_chunk(
            chunk, default_chunk_class, base_generation_info
        )
        if gen is None:
            return gen
        try:
            delta = (chunk.get("choices") or [{}])[0].get("delta") or {}
        except (AttributeError, IndexError):
            delta = {}
        reasoning = delta.get("reasoning")
        if isinstance(reasoning, str) and reasoning:
            gen.message.additional_kwargs["reasoning_content"] = reasoning
        return gen


@lru_cache(maxsize=1)
def build_llm() -> ChatOpenRouter:
    """Build the chat model from settings (cached — one shared instance)."""
    # enabled:true is model-agnostic — each reasoning model picks its own effort
    # (some only accept high/xhigh), and non-reasoning models ignore it. Avoids
    # hardcoding an effort level the configured model may reject.
    extra_body = {"reasoning": {"enabled": True}}
    # OpenRouter's native fallback: it tries these models in order, so a primary
    # outage or credit exhaustion quietly drops to the (free) secondary model.
    if settings.OPENROUTER_FALLBACK_MODEL:
        extra_body["models"] = [
            settings.OPENROUTER_MODEL,
            settings.OPENROUTER_FALLBACK_MODEL,
        ]
    return ChatOpenRouter(
        api_key=settings.OPENROUTER_API_KEY,
        base_url=OPENROUTER_BASE_URL,
        model=settings.OPENROUTER_MODEL,
        temperature=0.5,
        max_tokens=4096,
        # max_retries=0 lets ModelRetryMiddleware own retries (avoids the client
        # doing its own backoff on top of the agent-level retry).
        max_retries=0,
        extra_body=extra_body,
        default_headers={
            "HTTP-Referer": "https://dhirajpoddar.com",
            "X-Title": "Dhiraj Poddar Portfolio",
        },
    )
