"use client";

import { motion } from "framer-motion";
import type { Education } from "@/lib/constants";

export default function EducationCards({
  education,
}: {
  education: Education[];
}) {
  return (
    <div
      className="flex gap-3 overflow-x-auto py-2"
      style={{ scrollbarWidth: "none" }}
    >
      {education.map((edu, i) => (
        <motion.div
          key={edu.degree}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex-shrink-0 rounded-xl border p-3"
          style={{
            minWidth: 220,
            maxWidth: 240,
            background: "#0a0a0f",
            borderColor: "#1a1a24",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "#f0f0f5" }}>
            {edu.degree}
          </p>
          <p className="text-xs" style={{ color: "#8b5cf6" }}>
            {edu.university}
          </p>
          <p className="text-[0.7rem] mb-2" style={{ color: "#6b6b80" }}>
            {edu.period} &bull; {edu.location}
          </p>
          <div className="flex flex-wrap gap-1">
            {edu.courses.map((course) => (
              <span
                key={course}
                className="rounded px-1.5 py-0.5 text-[0.6rem]"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#818cf8",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {course}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
