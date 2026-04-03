export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  readTime: string;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export interface BlogPostFull extends BlogPost {
  content: string;
  headings: TocHeading[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchBlogPosts(): Promise<{
  posts: BlogPost[];
  tags: string[];
}> {
  const res = await fetch(`${API_URL}/blog`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function fetchBlogPost(slug: string): Promise<BlogPostFull | null> {
  const res = await fetch(`${API_URL}/blog/${slug}`, {
    next: { revalidate: 3600 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}
