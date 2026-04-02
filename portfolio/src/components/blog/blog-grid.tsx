"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TagFilter from "./tag-filter";
import BlogCard from "./blog-card";
import { getPostsByTag, type BlogTag, type BlogPost } from "@/lib/blog-data";

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [activeTag, setActiveTag] = useState<BlogTag>("All");
  const filtered = activeTag === "All" ? posts : getPostsByTag(activeTag);

  return (
    <div>
      <div className="mb-8">
        <TagFilter activeTag={activeTag} onTagChange={setActiveTag} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((post) => (
            <motion.div
              key={post.slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-muted py-12">
          No posts found for this tag.
        </p>
      )}
    </div>
  );
}
