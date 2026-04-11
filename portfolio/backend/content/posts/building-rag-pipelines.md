---
title: "Building a Production-Grade Agentic RAG System"
excerpt: "Architecture deep-dive: structure-aware chunking, 3-way hybrid search with Reciprocal Rank Fusion, and a self-correcting LangGraph agent pipeline — all backed by PostgreSQL + pgvector."
tags:
  - "LLMs"
  - "AI Architecture"
  - "System Design"
date: "2026-04-08"
readTime: "14 min read"
---

## Introduction

Most RAG tutorials stop at "embed, retrieve, generate." That's a toy. Real-world RAG systems need to handle documents that aren't just plain text — PDFs with tables, DOCX with headings, HTML with structure. They need more than vector search alone, because keyword-heavy queries and exact term matches fall through the cracks. And they need to deal with the uncomfortable truth that the LLM's answer might be wrong.

This project tackles all of it. It's a full-stack RAG system with an agentic pipeline that can plan, retrieve, synthesize, audit, and self-correct — with quantifiable quality metrics at every stage.

> The core architecture question was not "can an LLM answer questions from documents?" but "how do you build a retrieval system that knows when its own answers are bad, and fixes them?"

## System Architecture

The system has two main data flows. **Ingestion** transforms raw documents into structured, enriched chunks with embeddings and metadata. **Query** takes user questions through a multi-agent pipeline that retrieves, synthesizes, audits, and optionally retries — producing cited answers with quality scores.

![Agentic RAG Architecture](/blog/building-rag-pipelines/agentic-rag-architecture.svg)

Both flows share a single PostgreSQL database — relational data, vector embeddings, and full-text search in one place. No separate vector database, no sync issues, no operational overhead of managing two systems.

## Structure-Aware Ingestion

The ingestion pipeline transforms raw documents into searchable chunks through six sequential steps: **Dedup → Parse → Chunk → Embed → Enrich → Store**. The interesting decisions happen in parsing, chunking, and enrichment.

### Document Parsing

Not all documents are plain text. The system uses a three-tier parsing strategy: **Docling** for rich parsing of PDF, DOCX, PPTX, HTML, and images — extracting headings, tables, code blocks, and lists with structural metadata. **Built-in parsers** handle Markdown, CSV, and plain text with lightweight regex. **MarkItDown** serves as a universal fallback, converting unknown formats to Markdown before parsing.

Each parser produces a list of `DocumentElement` objects — a uniform representation with a `type` (heading, paragraph, table, code, list) and its text `content`, regardless of source format.

### Structure-Aware Chunking

This is where most RAG systems get it wrong. Naive chunking — split every N tokens — destroys document semantics. Structure-aware chunking preserves them through five rules:

1. **Headings are chunk boundaries** — flush the buffer when a new heading appears (only if buffer ≥ 100 tokens)
2. **Tables and code blocks are never split** — they become standalone chunks if large, or merge into the current chunk if small
3. **Paragraphs accumulate** until the buffer hits ~512 tokens
4. **Oversized paragraphs** get sentence-level splitting with 50-token overlap
5. **Post-pass merging** — chunks under 100 tokens are merged with neighbors to avoid orphan fragments

The heading breadcrumb (e.g., `Machine Learning > Supervised Learning`) is prepended to each chunk, so every chunk carries its position in the document hierarchy — not just text, but text with structural context.

### LLM Metadata Enrichment

This is the secret sauce for recall. For each chunk, an LLM generates a dense **summary**, 3–7 domain-specific **keywords**, and 2–3 **hypothetical questions** that the chunk could answer.

> Hypothetical questions turned out to be the highest-impact enrichment. When a user asks "How do I train a classifier?", full-text search now matches against the pre-generated question "How does labeled data help train models?" — a semantic bridge that pure keyword search would miss entirely.

The cost is paid once during ingestion, but it improves every subsequent query. Enrichment runs with a concurrency semaphore (5 parallel requests) to balance throughput with API rate limits.

## 3-Way Hybrid Search

Instead of relying on a single retrieval strategy, the system runs three in parallel and fuses the results. Each strategy covers the others' blind spots.

### Vector Similarity

Embeds the query using `text-embedding-3-small` and finds the closest chunks by cosine distance via pgvector's HNSW index (m=16, ef_construction=64). This excels at semantic similarity — finding chunks that mean the same thing even if they use different words.

### Full-Text Search

Converts the query into a PostgreSQL `tsquery` and matches against a concatenation of `content + summary + hypothetical_questions` via `tsvector`. The key insight: the search isn't just over raw content. By including LLM-generated metadata in the tsvector, we get a much richer text surface for BM25-style matching.

### Keyword Array Search

Matches query terms against the `keywords[]` array column using a GIN index with the overlap operator (`&&`). This catches domain-specific terms that the enrichment step extracted but that don't appear verbatim in the content.

### Reciprocal Rank Fusion

RRF combines the three ranked lists without requiring score normalization:

```
RRF_score(chunk) = Σ (weight_i / (k + rank_i))
```

Where `k=60` is a damping constant that prevents top-ranked results from dominating. Default weights (0.5 vector, 0.3 text, 0.2 keyword) favor semantic search but let keyword matches surface results that embedding similarity alone would miss. RRF is score-agnostic, rank-based, and stable across different query types — no need to normalize wildly different score scales.

## The Agentic Pipeline

A naive RAG pipeline (retrieve → generate) has no way to block malicious queries, decompose complex multi-part questions, check if its own answer is any good, or retry when quality is low. Agents solve all of these.

The pipeline is a LangGraph `StateGraph` with six nodes and two conditional edges. A shared `RAGState` TypedDict flows through every node, accumulating results:

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class RAGState(TypedDict):
    query: str
    is_valid: bool
    sub_queries: list
    chunks: list
    answer: str
    scores: dict
    retries: int

graph = StateGraph(RAGState)
graph.add_node("gatekeeper", gatekeeper_node)
graph.add_node("planner", planner_node)
graph.add_node("retriever", retriever_node)
graph.add_node("synthesizer", synthesizer_node)
graph.add_node("auditor", auditor_node)
graph.add_node("strategist", strategist_node)

graph.set_entry_point("gatekeeper")
graph.add_conditional_edges("gatekeeper", route_gatekeeper)
graph.add_edge("planner", "retriever")
graph.add_edge("retriever", "synthesizer")
graph.add_edge("synthesizer", "auditor")
graph.add_edge("auditor", "strategist")
graph.add_conditional_edges("strategist", route_strategist)
```

**Gatekeeper** classifies whether the query is legitimate or a prompt injection attempt — if invalid, it's rejected immediately with no retrieval or generation. **Planner** decomposes complex queries like "Compare supervised and unsupervised learning" into targeted sub-queries, while simple queries pass through unchanged. **Retriever** runs 3-way hybrid search for each sub-query, fuses with RRF, reranks with an LLM, and deduplicates across sub-queries. **Synthesizer** generates a grounded answer with mandatory `[Source N]` citations, using only retrieved context. **Auditor** is an independent LLM judge that scores faithfulness (are claims supported by context?) and relevance (does the answer address the question?) on a 0–1 scale. **Strategist** makes the final call: return the answer if quality ≥ 0.7, retry if under budget, or return best-effort if retries are exhausted.

## The Self-Correction Loop

Here's how a retry plays out in practice. A query like "What temperature should I use for espresso?" might score faithfulness=0.4, relevance=0.6 (avg 0.5) on the first attempt because the temperature claim wasn't grounded in any source. The Strategist triggers a retry. On the second pass, retrieval surfaces better chunks, and the scores jump to faithfulness=0.8, relevance=0.9 (avg 0.85) — above the 0.7 threshold, so the answer is returned.

```
avg_score = (faithfulness + relevance) / 2

if avg_score >= 0.7  → return answer
if retries < 2       → retry from retriever
if retries >= 2      → return best effort
```

> Self-correction loops need tight bounds. Without max retries, the system loops indefinitely on genuinely unanswerable questions. Two retries prevent runaway costs while still catching most fixable quality issues.

The retry mechanism is deliberately conservative. Most production systems prefer returning a lower-quality answer quickly over spending 3x the latency and cost on retries. In practice, most queries succeed on the first attempt — retries kick in for edge cases where the initial retrieval didn't surface the right chunks.

## PostgreSQL as the Only Database

Instead of PostgreSQL + Pinecone or Weaviate or Chroma, this system uses PostgreSQL + pgvector for everything. Two tables with a 1:N relationship: `documents` (metadata, file hash for dedup, status tracking) and `chunks` (content, 1536-dim embedding, heading path, enriched metadata). Three specialized indexes: HNSW for vector similarity, GIN for keyword array overlap, and runtime tsvector for full-text search.

One database means simpler operations — one system to back up, monitor, and scale. ACID transactions across document and chunk operations. SQL for complex queries, joins, and filtering. Full-text search comes built-in. And at this scale, pgvector's HNSW index provides competitive ANN performance without the operational complexity of a dedicated vector store.

## Lessons Learned

- **Chunking quality matters more than embedding model choice.** Switching from naive chunking to structure-aware chunking improved retrieval quality more than switching embedding models. A table split across two chunks is useless regardless of how good the embeddings are.
- **Hybrid search is almost always better than vector-only.** Pure vector search misses exact keyword matches. Pure keyword search misses semantic similarity. The 3-way fusion consistently outperforms any single strategy.
- **Metadata enrichment has outsized impact on recall.** Hypothetical questions effectively pre-compute the semantic bridge between user queries and document content. The LLM cost at ingestion time pays dividends on every subsequent query.
- **Self-correction loops need tight bounds.** Without max retries, the system can loop indefinitely on genuinely unanswerable questions. Two retries prevent runaway costs while still catching most fixable quality issues.
- **One database is operationally simpler than two.** PostgreSQL + pgvector handles relational data, vector search, and full-text search in a single system. The operational simplicity outweighs the marginal performance gains of a dedicated vector store at this scale.
