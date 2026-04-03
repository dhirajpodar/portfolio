---
title: "Building Production RAG Pipelines"
excerpt: "How I designed a hybrid retrieval system combining BM25 full-text search, pgvector semantic search, and Cohere reranking for production AI applications."
tags:
  - "AI Architecture"
  - "System Design"
date: "2026-03-15"
readTime: "10 min read"
---

## Introduction

Retrieval-Augmented Generation has become the de facto pattern for grounding LLM responses in domain-specific knowledge. But the gap between a demo RAG pipeline and a production system is enormous. This post walks through the architecture I built at MAindTec for our AI SaaS platform.

## Architecture Overview

The system combines three retrieval strategies into a single pipeline: BM25 keyword search for exact matches, pgvector cosine similarity for semantic understanding, and Cohere reranking to merge and score the results. Documents flow through an event-driven ingestion pipeline on Redis Streams before being indexed.

> The key insight: no single retrieval method is sufficient. Keyword search catches exact terminology that embeddings miss, while semantic search handles paraphrasing and conceptual queries.

## Hybrid Retrieval Strategy

### BM25 Full-Text Search

PostgreSQL's built-in full-text search with `tsvector` and `tsquery` provides BM25-equivalent scoring. We index document chunks with GIN indexes for fast retrieval, typically returning results in under 10ms.

```sql
-- Create full-text search index
ALTER TABLE document_chunks
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('english', content)
) STORED;

CREATE INDEX idx_chunks_search
ON document_chunks USING GIN (search_vector);
```

### Semantic Search with pgvector

For semantic retrieval, we use pgvector with OpenAI embeddings (text-embedding-3-small, 1536 dimensions). HNSW indexes provide approximate nearest neighbor search with tunable recall/speed trade-offs.

## Cohere Reranking

After retrieving candidates from both BM25 and semantic search, we merge the results and pass them through Cohere's reranking model. This cross-encoder approach considers the full query-document interaction, producing significantly better relevance scores than either retrieval method alone.

## Lessons Learned

- **Chunk size matters more than embedding model choice.** We found 512-token chunks with 50-token overlap to be the sweet spot for our document types.
- **Monitor retrieval quality separately from generation.** LangSmith traces let us evaluate whether the right documents were retrieved, independent of the LLM's response quality.
- **Event-driven ingestion is essential.** Redis Streams let us decouple document upload from indexing, handle retries gracefully, and scale workers independently.
