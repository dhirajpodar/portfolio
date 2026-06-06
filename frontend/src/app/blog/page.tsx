import { fetchBlogPosts } from "@/lib/blog-api";
import BlogGrid from "@/components/blog/blog-grid";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Dhiraj Poddar",
  description: "Thoughts on AI architecture, system design, LLMs, and MLOps.",
};

export default async function BlogPage() {
  const { posts, tags } = await fetchBlogPosts();
  const t = await getTranslations("Blog");
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1
        className="text-3xl sm:text-4xl font-bold text-text-heading mb-2"
        style={{ letterSpacing: "-0.04em" }}
      >
        {t("pageTitle")}
      </h1>
      <p className="text-text-muted mb-10">
        {t("pageSubtitle")}
      </p>
      <BlogGrid posts={posts} availableTags={tags} />
    </div>
  );
}
