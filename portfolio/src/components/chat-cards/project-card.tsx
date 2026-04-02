"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/constants";

export default function ProjectCards({ projects }: { projects: Project[] }) {
  return (
    <div
      className="flex gap-3 overflow-x-auto py-2"
      style={{ scrollbarWidth: "none" }}
    >
      {projects.map((project, i) => (
        <motion.div
          key={project.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex-shrink-0 rounded-xl border p-3"
          style={{
            minWidth: 200,
            maxWidth: 220,
            background: "#0a0a0f",
            borderColor: "#1a1a24",
          }}
        >
          <h5
            className="text-sm font-semibold mb-0.5"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {project.name}
          </h5>
          <p className="text-[0.7rem] mb-2" style={{ color: "#6b6b80" }}>
            {project.tagline}
          </p>

          {project.metrics.slice(0, 2).map((m) => (
            <div key={m.label} className="flex items-baseline gap-1 mb-1">
              <span
                className="text-base font-bold"
                style={{ color: "#06b6d4" }}
              >
                {m.value}
              </span>
              <span className="text-[0.65rem]" style={{ color: "#6b6b80" }}>
                {m.label}
              </span>
            </div>
          ))}

          <div className="flex flex-wrap gap-1 mt-2">
            {project.tech.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded px-1.5 py-0.5 text-[0.6rem]"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#818cf8",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
