"use client";

import { motion } from "framer-motion";
import { experiences } from "@/lib/constants";

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6">
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
            Experience
          </h2>
          <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 lg:left-1/2 lg:-translate-x-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#6366f1] to-[#8b5cf6]" />

          {experiences.map((exp, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div
                key={index}
                className="relative mb-12 last:mb-0"
              >
                {/* Timeline node */}
                <div className="absolute left-4 lg:left-1/2 -translate-x-1/2 top-8 z-10">
                  <div className="relative w-4 h-4 rounded-full bg-[#0a0a0f] border-2 border-transparent bg-clip-padding">
                    <div className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] -z-10" />
                    <div className="absolute inset-[-6px] rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] opacity-30 animate-pulse -z-20" />
                  </div>
                </div>

                {/* Card */}
                <motion.div
                  initial={{
                    opacity: 0,
                    x: isLeft ? -60 : 60,
                  }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`
                    ml-12 lg:ml-0 lg:w-[calc(50%-2rem)]
                    ${isLeft ? "lg:mr-auto lg:pr-0" : "lg:ml-auto lg:pl-0"}
                  `}
                >
                  <div className="group relative rounded-xl bg-[#111118] border border-[#ffffff0d] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#6366f133] hover:shadow-[0_0_30px_rgba(99,102,241,0.08)]">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#f0f0f5]">
                          {exp.role}
                        </h3>
                        <p className="text-[#6366f1] font-medium">
                          {exp.company}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exp.badges?.map((badge) => (
                          <span
                            key={badge}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              badge === "Current"
                                ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30"
                                : "bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30"
                            }`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b6b80] mb-4">
                      <span>{exp.period}</span>
                      <span>{exp.location}</span>
                    </div>

                    {/* Bullets */}
                    <ul className="space-y-2 mb-4">
                      {exp.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="text-sm text-[#e2e8f0] flex items-start gap-2"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#6366f1] shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2">
                      {exp.tech.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#1a1a24] text-[#6b6b80] border border-[#ffffff08] transition-colors hover:text-[#6366f1] hover:border-[#6366f133]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
