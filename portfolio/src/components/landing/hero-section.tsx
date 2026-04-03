"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { PERSONAL } from "@/lib/constants";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-[750px]">
        {/* Name */}
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0 }}
          className="text-4xl font-bold tracking-tight text-text-heading sm:text-5xl"
          style={{ letterSpacing: "-0.04em" }}
        >
          {PERSONAL.name}
        </motion.h1>

        {/* Title */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mt-2 text-xl font-semibold sm:text-2xl"
          style={{
            background: "linear-gradient(135deg, #a8a4ff, #9995ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {PERSONAL.title}
        </motion.p>

        {/* Quote */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="mt-8 text-lg italic text-text-heading sm:text-xl"
        >
          &ldquo;I didn&rsquo;t update my resume. I made it obsolete.&rdquo;
        </motion.p>

        {/* CTA */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="mt-8"
        >
          <button
            onClick={() =>
              document
                .getElementById("chat")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-full px-5 py-2.5 text-sm font-medium transition-shadow hover:shadow-[0_0_12px_rgba(168,164,255,0.3)]"
            style={{
              background: "#a8a4ff",
              color: "#1e009f",
            }}
          >
            Chat with my AI &rarr;
          </button>
        </motion.div>

        {/* Subtext */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="mt-4 text-sm text-text-muted"
        >
          Ask about my work, what I&rsquo;ve shipped, or if I&rsquo;m open to opportunities.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} className="text-text-muted opacity-50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
