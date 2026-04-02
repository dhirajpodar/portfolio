"use client";

import { motion } from "framer-motion";
import type { SkillCategory } from "@/lib/constants";

export default function SkillCards({ skills }: { skills: SkillCategory[] }) {
  return (
    <div
      className="flex gap-3 overflow-x-auto py-2"
      style={{ scrollbarWidth: "none" }}
    >
      {skills.map((category, i) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex-shrink-0 rounded-xl border p-3"
          style={{
            minWidth: 180,
            maxWidth: 200,
            background: "#0a0a0f",
            borderColor: "#1a1a24",
          }}
        >
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: "#f0f0f5" }}
          >
            {category.name}
          </p>
          <div className="flex flex-wrap gap-1">
            {category.skills.map((skill) => (
              <span
                key={skill}
                className="rounded px-1.5 py-0.5 text-[0.6rem]"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#818cf8",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
