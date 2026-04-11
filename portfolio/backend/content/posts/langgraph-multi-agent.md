---
title: "Building a Production Multi-Agent System with LangGraph"
excerpt: "Architecture deep-dive: how I orchestrated 10 specialized domain agents with hybrid routing, cross-worker state, and multi-level caching."
tags:
  - "LLMs"
  - "AI Architecture"
  - "System Design"
date: "2026-02-28"
readTime: "14 min read"
---

## Introduction

Building a single LLM-powered tool is straightforward. Orchestrating ten specialized agents that share conversation state across multiple server workers, handle two languages, and respond in under a few seconds — that's a different challenge entirely.

I built the backend for a production AI chatbot that answers domain-specific questions across ten specialized areas: metals, chemicals, polymers, raw materials, construction, agriculture, packaging, electronics, machinery, and regional cost data. Users ask natural-language questions in English or German, and the system routes each query to the right agent, extracts structured parameters, calls the appropriate data APIs, and returns formatted answers — all within a stateful conversation.

> The core architecture question was not "can an LLM answer these questions?" but "how do you route, orchestrate, and cache ten specialized agents so the system feels instant?"

## System Architecture

The system is a FastAPI backend deployed on Azure Container Apps with four parallel workers. A hybrid router directs incoming queries to one of ten LangGraph agents. PostgreSQL persists conversation state across workers, while a multi-level Redis cache keeps response times low. A translation boundary at the API edge handles bilingual support without complicating internal logic.

![Request Flow](/blog/langgraph-multi-agent/multiagent-1-request-flow.svg)

Each agent is a singleton — one graph instance per domain, shared across all requests. An agent registry manages lifecycle and provides metadata to the frontend for dynamic UI rendering.

## Hybrid Routing: Pattern Matching + LLM Fallback

Not every query needs an LLM to figure out where it belongs. "Price of copper wire" is obviously a metals query. But "What's the cost of ESD trays for semiconductor packaging?" could be electronics or packaging.

The router uses a two-tier strategy. A fast pattern matcher handles the majority of queries at zero LLM cost. When confidence drops below a configurable threshold, a lightweight LLM classifier takes over.

```python
class HybridRouter:
    def __init__(self, threshold: float = 0.85):
        self.pattern_matcher = PatternMatcher()
        self.llm_classifier = LLMClassifier()
        self.threshold = threshold

    async def route(self, query: str) -> AgentType:
        match = self.pattern_matcher.classify(query)
        if match.confidence >= self.threshold:
            return match.agent_type

        # Fallback to LLM for ambiguous queries
        return await self.llm_classifier.classify(query)
```

The threshold is configurable at runtime — you can tune the speed-vs-accuracy tradeoff without redeploying. In practice, pattern matching handles roughly 80% of production queries, keeping LLM routing costs low.

## Two Agent Architectures

Not all domains have the same complexity. A metals price lookup follows a predictable workflow: extract the material, identify the product form, query the API. But a regional cost comparison might require chaining multiple API calls, interpreting partial results, and deciding what to fetch next. I used two different agent architectures to match these needs.

### Structured Graph Agents

For well-defined workflows, I built deterministic state graphs. Each node does one thing — extract parameters, validate them, call the search API, format the response. The LLM is used at specific nodes, not given free rein. Edges between nodes are explicit, so the execution path is predictable and debuggable.

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class SearchState(TypedDict):
    query: str
    params: dict
    results: list
    response: str

def build_search_agent(checkpointer):
    graph = StateGraph(SearchState)

    graph.add_node("extract", extract_params)
    graph.add_node("validate", validate_params)
    graph.add_node("search", call_search_api)
    graph.add_node("format", format_response)

    graph.set_entry_point("extract")
    graph.add_edge("extract", "validate")
    graph.add_conditional_edges("validate", route_validation)
    graph.add_edge("search", "format")
    graph.add_edge("format", END)

    return graph.compile(checkpointer=checkpointer)
```

The `route_validation` function handles edge cases — if parameters are ambiguous, it can route to an interrupt node that asks the user for clarification before proceeding.

### Agentic Tool-Calling Agents

For open-ended domains like regional cost comparisons or machinery lookups, the agent needs autonomy. These agents run a reasoning loop: observe the query and conversation history, decide which tool to call, execute it, and repeat until the answer is complete. Each agent has access to a curated set of tools specific to its domain.

This architecture is more flexible but less predictable — exactly the tradeoff you want for queries like "compare manufacturing overhead costs across three countries."

## Cross-Worker Conversation State

The backend runs four Gunicorn workers behind a load balancer. A user's first message might hit worker 1, and their follow-up hits worker 3. Without shared state, the conversation context is lost.

LangGraph's PostgreSQL checkpointer solves this. Every agent execution saves its full state — messages, extracted parameters, intermediate results — to PostgreSQL, keyed by a thread ID. The thread ID scheme is `{session_id}_{agent_type}`, so each agent within a session maintains its own conversation history. Any worker can resume any conversation by loading the checkpoint.

This also means conversation state survives server restarts and deployments — no lost context during rolling updates.

## Multi-Level Caching Strategy

LLM-backed systems are latency-sensitive. Users expect chat-like response times, but each query may involve LLM reasoning plus one or more external API calls. A single cache layer isn't enough.

![Infrastructure Layer](/blog/langgraph-multi-agent/multiagent-2-infrastructure.svg)

**Layer 1 — In-memory singletons.** LLM client instances are expensive to initialize. A factory caches one instance per model-temperature combination, shared across requests within each worker.

**Layer 2 — Agent state cache.** Frequently accessed reference data (material catalogs, region lists) is cached within the LangGraph state for the duration of an invocation.

**Layer 3 — Redis.** Cross-worker shared cache for API responses and reference data. A background prefetch daemon loads common lookups into Redis immediately after user login, so the first query hits warm cache.

**Layer 4 — Data API.** The source of truth. Only reached on cache misses.

## Bilingual Processing at the Boundary

The system supports English and German. Rather than maintaining bilingual prompts, bilingual pattern matchers, and bilingual formatting logic, I chose a simpler approach: translate at the boundary, process internally in one language.

German input is translated to English at the API edge. All routing, agent logic, and prompt engineering operates in English. The response is translated back to German only at the output boundary. The user's original language is tracked via a per-request context variable.

> Translate at the boundary, process in one language internally. This cut prompt maintenance burden in half and kept routing logic monolingual.

## Stateless Auth for Horizontal Scaling

Authentication uses JWE tokens encrypted with AES-256-GCM. The token contains everything the server needs — session ID, user info, access and refresh tokens — encrypted so the client can't read or tamper with it. No server-side session store lookup is needed per request. Any worker can decrypt and validate any token independently.

When an access token expires, the server transparently refreshes it and returns a new JWE in a response header. The client swaps tokens without re-authenticating. This stateless approach means scaling from two workers to ten is a config change, not an architecture change.

## Lessons Learned

- **Not every agent needs to be agentic.** Structured graph agents with deterministic transitions are faster, cheaper, and more predictable for well-defined workflows. Reserve autonomous tool-calling for genuinely open-ended tasks.
- **Hybrid routing saves real money.** Pattern matching handles the majority of queries at zero LLM cost. A configurable confidence threshold lets you tune speed vs. accuracy without code changes.
- **Design for statelessness from day one.** PostgreSQL checkpointing and stateless JWE auth meant horizontal scaling required zero architecture changes. Adding workers was a config change, not a redesign.
- **Cache aggressively, but at multiple levels.** A single Redis cache is not enough. In-memory singletons, agent state caching, and background prefetch each address a different latency bottleneck.
- **Translate at the boundary, not throughout.** Maintaining bilingual prompts and routing logic is a maintenance nightmare. A clean translation boundary keeps the entire internal system monolingual.
