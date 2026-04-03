import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { fetchBlogPosts, fetchBlogPost } from "@/lib/blog-api";
import BlogArticle from "@/components/blog/blog-article";
import TocSidebar from "@/components/blog/toc-sidebar";
import BlogCard from "@/components/blog/blog-card";
import MarkdownContent from "@/components/blog/markdown-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Dhiraj Poddar`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  const { posts: allPosts } = await fetchBlogPosts();
  const otherPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 2);

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to blog
      </Link>

      {/* Header */}
      <header className="max-w-[680px] mx-auto mb-12">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 font-medium"
              style={{
                fontSize: "0.6875rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                backgroundColor: "#201f1f",
                color: "#a8a4ff",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold text-text-heading mb-4"
          style={{ letterSpacing: "-0.04em" }}
        >
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-text-muted text-sm">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-[0.625rem] font-bold"
              style={{
                background: "linear-gradient(135deg, #a8a4ff, #9995ff)",
                color: "#1e009f",
              }}
            >
              DP
            </div>
            <span>Dhiraj Poddar</span>
          </div>
          <span>{formattedDate}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" strokeWidth={2} />
            {post.readTime}
          </span>
        </div>
      </header>

      {/* Content + TOC */}
      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
        <BlogArticle>
          <MarkdownContent content={post.content} />
        </BlogArticle>
        <TocSidebar headings={post.headings} />
      </div>

      {/* Divider */}
      <hr
        className="max-w-[680px] mx-auto my-16"
        style={{ border: "none", borderTop: "1px solid rgba(72, 71, 71, 0.15)" }}
      />

      {/* More posts */}
      {otherPosts.length > 0 && (
        <div className="max-w-[680px] mx-auto">
          <h2
            className="text-xl font-bold text-text-heading mb-6"
            style={{ letterSpacing: "-0.02em" }}
          >
            More Posts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {otherPosts.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="max-w-[680px] mx-auto mt-12 text-center">
        <Link
          href="/"
          className="inline-block rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: "#a8a4ff",
            color: "#1e009f",
          }}
        >
          Have questions about this? Chat with my AI &rarr;
        </Link>
      </div>
    </div>
  );
}
