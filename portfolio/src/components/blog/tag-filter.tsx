"use client";

import { motion } from "framer-motion";
import { BLOG_TAGS, type BlogTag } from "@/lib/blog-data";

interface TagFilterProps {
  activeTag: BlogTag;
  onTagChange: (tag: BlogTag) => void;
}

export default function TagFilter({ activeTag, onTagChange }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {BLOG_TAGS.map((tag) => {
        const isActive = activeTag === tag;
        return (
          <motion.button
            key={tag}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTagChange(tag)}
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: isActive ? "#a8a4ff" : "#201f1f",
              color: isActive ? "#1e009f" : "#adaaaa",
            }}
          >
            {tag}
          </motion.button>
        );
      })}
    </div>
  );
}
