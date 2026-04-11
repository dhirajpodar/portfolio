"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { projects } from "@/lib/constants";

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#f0f0f5] mb-4">
            Projects
          </h2>
          <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]" />
        </motion.div>

        {/* Project Cards */}
        <div className="space-y-8">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <div className="relative rounded-xl bg-[#111118] border border-[#ffffff0d] overflow-hidden transition-all duration-300 hover:border-[#6366f133] hover:shadow-[0_0_40px_rgba(99,102,241,0.06)]">
        {/* Gradient top border */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]" />

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
              {project.name}
            </h3>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30 whitespace-nowrap">
              {project.role}
            </span>
          </div>

          <p className="text-[#6b6b80] mb-8">{project.tagline}</p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {project.metrics.map((metric, i) => (
              <div
                key={i}
                className="text-center p-4 rounded-lg bg-[#0a0a0f] border border-[#ffffff08]"
              >
                <div className="text-xl md:text-2xl font-bold font-mono text-[#f0f0f5]">
                  {metric.value}
                </div>
                <div className="text-xs text-[#6b6b80] mt-1">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Highlights Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm font-medium text-[#6366f1] hover:text-[#8b5cf6] transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
              Key Highlights
            </button>

            <motion.div
              initial={false}
              animate={{
                height: expanded ? "auto" : 0,
                opacity: expanded ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <ul className="mt-4 space-y-2 pl-1">
                {project.highlights.map((highlight, i) => (
                  <li
                    key={i}
                    className="text-sm text-[#e2e8f0] flex items-start gap-2"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#6366f1] shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#1a1a24] text-[#6b6b80] border border-[#ffffff08] transition-colors hover:text-[#6366f1] hover:border-[#6366f133]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
