---
title: "Vectorless RAG: Why Retrieval Is a Reasoning Problem, Not a Geometry One"
excerpt: "Vector search treats relevance as similarity. On long, structured documents that assumption breaks — and reasoning-based tree search (PageIndex) is a better fit."
tags:
  - "LLMs"
  - "AI Architecture"
  - "System Design"
date: "2026-04-18"
readTime: "8 min read"
---

# Vectorless RAG: Why Retrieval Is a Reasoning Problem, Not a Geometry One

Every production RAG system I've touched eventually hits the same wall. It works beautifully in demos, passes evals on short FAQs, then quietly falls apart the moment someone points it at a real document — a 200-page credit agreement, a 10-K, a technical manual with forward references three chapters deep. The retrieval layer starts returning chunks that are *nearby* but not *useful*, and no amount of re-ranking, hybrid search, or chunk-size tuning fully fixes it.

The reason is deeper than the fixes we usually reach for. It's a category error in how we framed the problem in the first place.

## Similarity is not relevance

Vector RAG rests on one quiet assumption: that semantic similarity is a good proxy for relevance. Embed the query, embed the chunks, find the nearest neighbors, and the answer will be among them.

For short, self-contained questions over short, self-contained passages, that assumption mostly holds. But "similar" and "relevant" diverge the moment a document has structure. A clause that *answers* a query about liability might share very few surface tokens with the query itself — the actual answer lives in a definitions section thirty pages earlier, or in a cross-reference to an exhibit. A cosine score can't see that. It sees word shapes.

Here's what that pipeline actually looks like:

![Vector RAG pipeline](/blog/vectorless-rag/vector-rag-pipeline.svg)

Notice what happens between steps: the document enters with structure — sections, headings, cross-references, page order — and exits the chunking stage as a bag of fragments. The vector database stores proximity, not hierarchy. Whatever the document *meant* by putting section 3.2 after section 3.1 is thrown away.

This is why vector RAG struggles on exactly the documents where RAG would be most valuable: contracts, filings, research papers, specifications. The more a document rewards careful reading, the less similarity search captures about it.

## What humans actually do

Watch a lawyer or an analyst answer a question about a long document. They don't scan every paragraph. They open the table of contents, jump to the section that looks right, skim the headings, descend into a subsection, and — if the answer isn't there — back out and try a different branch. It's tree search, guided by reasoning about structure.

This is the behavior that vectorless RAG tries to reproduce. The document gets indexed not as a flat soup of chunks but as a hierarchy: sections, subsections, summaries, page ranges. At query time, an LLM walks that hierarchy. It reads titles and summaries, decides which branches are worth descending into, and pulls the underlying pages only for the nodes that survive the reasoning step.

![Vectorless RAG with PageIndex](/blog/vectorless-rag/vectorless-rag-tree.svg)

No embeddings. No similarity scores. No chunking in the sense we usually mean it — the natural sections of the document *are* the units of retrieval.

## Why this is a better bet for long documents

Three properties fall out of this design that you can't easily bolt onto a vector pipeline.

**Retrieval preserves structure.** Because the index mirrors the document's actual organization, cross-references and section dependencies survive. When the query touches something defined elsewhere, the traversal can follow that thread.

**Retrieval is traceable.** Every answer comes attached to specific nodes and specific page ranges. You can point at the pages the LLM read. Compare that to handing a stakeholder "the top-5 chunks our vector search returned" and asking them to trust the distance metric.

**Retrieval tolerates query-document vocabulary gaps.** The LLM doing the traversal doesn't need the query and the document to use the same words. It's reasoning about what a section is *about*, not measuring token overlap.

The FinanceBench numbers — 98.7% accuracy on SEC filings using a PageIndex-powered system — aren't surprising once you see the mechanism. Financial filings are the canonical case where structure carries most of the meaning and similarity search throws most of it away.

## Where it doesn't apply

I want to be honest about the shape of this tool, because the "vectors are dead" framing you'll see online is overreach.

If your corpus is millions of short, independent items — support tickets, product descriptions, forum posts, chat history — there is no hierarchy to reason over. Flat similarity search is exactly the right abstraction, and it will be faster and cheaper than any tree traversal. Vectorless RAG is not a replacement for vector search in that regime.

It's a replacement for vector search in the regime where vector search was always a compromise: long, internally-structured documents where the thing you actually want is navigation, not matching.

## The real shift

The deeper point isn't about PageIndex specifically or any single implementation. It's that the rise of models capable of reasoning over long contexts changes what retrieval has to do. When your retriever was dumb, you needed a precise geometric filter in front of it. When your retriever can actually read and decide, you want to give it structure to reason over, not a pile of disembodied chunks.

Vector RAG was an architecture built around the limitations of earlier models. Some of those limitations are gone. It's worth asking, on every pipeline you maintain, whether you're still paying for a workaround to a problem that no longer exists.
