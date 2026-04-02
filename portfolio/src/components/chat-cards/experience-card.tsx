"use client";

import { motion } from "framer-motion";
import type { Experience } from "@/lib/constants";

export default function ExperienceCards({
  experiences,
}: {
  experiences: Experience[];
}) {
  return (
    <div
      className="flex gap-3 overflow-x-auto py-2"
      style={{ scrollbarWidth: "none" }}
    >
      {experiences.map((exp, i) => (
        <motion.div
          key={`${exp.company}-${exp.period}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex-shrink-0 rounded-xl border p-3"
          style={{
            minWidth: 240,
            maxWidth: 260,
            background: "#0a0a0f",
            borderColor: "#1a1a24",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "#f0f0f5" }}>
            {exp.role}
          </p>
          <p className="text-xs" style={{ color: "#8b5cf6" }}>
            {exp.company}
          </p>
          <p className="text-[0.7rem] mb-2" style={{ color: "#6b6b80" }}>
            {exp.period}
          </p>

          {exp.bullets.slice(0, 2).map((bullet, j) => (
            <div key={j} className="flex gap-1.5 mb-1">
              <span
                className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                style={{ background: "#6366f1" }}
              />
              <p className="text-[0.7rem]" style={{ color: "#94a3b8" }}>
                {bullet.length > 80 ? bullet.slice(0, 80) + "..." : bullet}
              </p>
            </div>
          ))}

          <div className="flex flex-wrap gap-1 mt-2">
            {exp.tech.slice(0, 4).map((t) => (
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
