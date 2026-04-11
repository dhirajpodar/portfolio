"use client";

import { motion } from "framer-motion";
import { education } from "@/lib/constants";

export default function Education() {
  return (
    <section id="education" className="py-24 px-6">
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
            Education
          </h2>
          <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]" />
        </motion.div>

        {/* Education Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {education.map((edu, index) => {
            const isMasters =
              edu.degree.toLowerCase().includes("m.s") ||
              edu.degree.toLowerCase().includes("master") ||
              edu.degree.toLowerCase().includes("msc");

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative rounded-xl bg-[#111118] border border-[#ffffff0d] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#6366f133] hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] ${
                  isMasters ? "border-l-2 border-l-[#6366f1]" : ""
                }`}
              >
                <h3 className="text-lg font-bold text-[#f0f0f5] mb-1">
                  {edu.degree}
                </h3>
                <p className="text-[#6366f1] font-medium mb-3">
                  {edu.university}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b6b80] mb-5">
                  <span>{edu.period}</span>
                  <span>{edu.location}</span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#6b6b80] mb-2.5">
                    Relevant Courses
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {edu.courses.map((course) => (
                      <span
                        key={course}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#1a1a24] text-[#6b6b80] border border-[#ffffff08] transition-colors hover:text-[#e2e8f0]"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
