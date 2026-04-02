import type { TocHeading } from "@/components/blog/toc-sidebar";

export const headings: TocHeading[] = [
  { id: "intro", text: "Introduction", level: 2 },
  { id: "architecture", text: "Architecture Overview", level: 2 },
  { id: "retrieval", text: "Hybrid Retrieval Strategy", level: 2 },
  { id: "bm25", text: "BM25 Full-Text Search", level: 3 },
  { id: "semantic", text: "Semantic Search with pgvector", level: 3 },
  { id: "reranking", text: "Cohere Reranking", level: 2 },
  { id: "lessons", text: "Lessons Learned", level: 2 },
];

export default function BuildingRagPipelines() {
  return (
    <>
      <h2 id="intro">Introduction</h2>
      <p>
        Retrieval-Augmented Generation has become the de facto pattern for
        grounding LLM responses in domain-specific knowledge. But the gap
        between a demo RAG pipeline and a production system is enormous. This
        post walks through the architecture I built at MAindTec for our AI
        SaaS platform.
      </p>

      <h2 id="architecture">Architecture Overview</h2>
      <p>
        The system combines three retrieval strategies into a single pipeline:
        BM25 keyword search for exact matches, pgvector cosine similarity for
        semantic understanding, and Cohere reranking to merge and score the
        results. Documents flow through an event-driven ingestion pipeline on
        Redis Streams before being indexed.
      </p>
      <blockquote>
        The key insight: no single retrieval method is sufficient. Keyword
        search catches exact terminology that embeddings miss, while semantic
        search handles paraphrasing and conceptual queries.
      </blockquote>

      <h2 id="retrieval">Hybrid Retrieval Strategy</h2>

      <h3 id="bm25">BM25 Full-Text Search</h3>
      <p>
        PostgreSQL&apos;s built-in full-text search with <code>tsvector</code>{" "}
        and <code>tsquery</code> provides BM25-equivalent scoring. We index
        document chunks with GIN indexes for fast retrieval, typically
        returning results in under 10ms.
      </p>
      <pre>
        <code>{`-- Create full-text search index
ALTER TABLE document_chunks
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('english', content)
) STORED;

CREATE INDEX idx_chunks_search
ON document_chunks USING GIN (search_vector);`}</code>
      </pre>

      <h3 id="semantic">Semantic Search with pgvector</h3>
      <p>
        For semantic retrieval, we use pgvector with OpenAI embeddings
        (text-embedding-3-small, 1536 dimensions). HNSW indexes provide
        approximate nearest neighbor search with tunable recall/speed
        trade-offs.
      </p>

      <h2 id="reranking">Cohere Reranking</h2>
      <p>
        After retrieving candidates from both BM25 and semantic search, we
        merge the results and pass them through Cohere&apos;s reranking model.
        This cross-encoder approach considers the full query-document
        interaction, producing significantly better relevance scores than
        either retrieval method alone.
      </p>

      <h2 id="lessons">Lessons Learned</h2>
      <ul>
        <li>
          <strong>Chunk size matters more than embedding model choice.</strong>{" "}
          We found 512-token chunks with 50-token overlap to be the sweet spot
          for our document types.
        </li>
        <li>
          <strong>Monitor retrieval quality separately from generation.</strong>{" "}
          LangSmith traces let us evaluate whether the right documents were
          retrieved, independent of the LLM&apos;s response quality.
        </li>
        <li>
          <strong>Event-driven ingestion is essential.</strong> Redis Streams
          let us decouple document upload from indexing, handle retries
          gracefully, and scale workers independently.
        </li>
      </ul>
    </>
  );
}
