"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog-api";

export default function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.article
        whileHover={{
          y: -4,
          boxShadow: "0 0 4px rgba(168, 164, 255, 0.1)",
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl p-6 h-full flex flex-col cursor-pointer"
        style={{ backgroundColor: "#201f1f" }}
      >
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 font-medium"
              style={{
                fontSize: "0.6875rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                backgroundColor: "#0e0e0e",
                color: "#a8a4ff",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold text-text-heading mb-2"
          style={{ letterSpacing: "-0.02em" }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-text-muted mb-4 flex-1 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-text-muted">
          <span className="flex items-center gap-1" style={{ fontSize: "0.6875rem" }}>
            <Clock className="h-3 w-3" strokeWidth={2} />
            {post.readTime}
          </span>
          <span style={{ fontSize: "0.6875rem" }}>{formattedDate}</span>
        </div>
      </motion.article>
    </Link>
  );
}
