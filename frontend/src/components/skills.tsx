"use client";

import { motion } from "framer-motion";
import { Brain, Server, Cloud, Layout, Database } from "lucide-react";
import { skillCategories } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Server,
  Cloud,
  Layout,
  Database,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#f0f0f5] mb-4">
            Skills
          </h2>
          <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]" />
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {skillCategories.map((category, index) => {
            const Icon = iconMap[category.icon] || Brain;
            const isAIML =
              category.name.toLowerCase().includes("ai") ||
              category.name.toLowerCase().includes("ml") ||
              category.name.toLowerCase().includes("machine");

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className={`group relative rounded-xl bg-[#111118] border border-[#ffffff0d] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#6366f133] hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] ${
                  isAIML ? "border-l-2 border-l-[#6366f1]" : ""
                }`}
              >
                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-lg bg-[#6366f1]/10 text-[#6366f1]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#f0f0f5]">
                    {category.name}
                  </h3>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-mono px-2.5 py-1.5 rounded-md bg-[#1a1a24] text-[#6b6b80] border border-[#ffffff08] transition-all duration-200 hover:text-[#6366f1] hover:-translate-y-0.5 hover:border-[#6366f133] hover:shadow-[0_0_12px_rgba(99,102,241,0.1)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
