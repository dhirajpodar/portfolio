export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readTime: string;
}

export const BLOG_TAGS = [
  "All",
  "System Design",
  "LLMs",
  "MLOps",
  "AI Architecture",
] as const;

export type BlogTag = (typeof BLOG_TAGS)[number];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "building-rag-pipelines",
    title: "Building Production RAG Pipelines",
    excerpt:
      "How I designed a hybrid retrieval system combining BM25 full-text search, pgvector semantic search, and Cohere reranking for production AI applications.",
    tags: ["AI Architecture", "System Design"],
    date: "2026-03-15",
    readTime: "10 min read",
  },
  {
    slug: "langgraph-multi-agent",
    title: "Multi-Agent Orchestration with LangGraph",
    excerpt:
      "Lessons learned building agentic workflows — from single-tool agents to complex multi-agent systems with shared state and human-in-the-loop.",
    tags: ["LLMs", "AI Architecture"],
    date: "2026-02-28",
    readTime: "12 min read",
  },
  {
    slug: "azure-ml-ops",
    title: "MLOps on Azure: From Experiment to Production",
    excerpt:
      "A practical guide to deploying ML models on Azure Container Apps with Bicep IaC, KEDA autoscaling, and LangSmith evaluation pipelines.",
    tags: ["MLOps", "System Design"],
    date: "2026-02-10",
    readTime: "8 min read",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostsByTag(tag: BlogTag): BlogPost[] {
  if (tag === "All") return BLOG_POSTS;
  return BLOG_POSTS.filter((p) => p.tags.includes(tag));
}
