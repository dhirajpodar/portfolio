"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ChevronDown } from "lucide-react";
import { PERSONAL, HERO_TITLES } from "@/lib/constants";
import { GithubIcon, LinkedinIcon } from "@/components/icons";

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTitle = HERO_TITLES[titleIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentTitle) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setTitleIndex((prev) => (prev + 1) % HERO_TITLES.length);
    } else {
      timeout = setTimeout(
        () => {
          setDisplayText(
            isDeleting
              ? currentTitle.slice(0, displayText.length - 1)
              : currentTitle.slice(0, displayText.length + 1)
          );
        },
        isDeleting ? 30 : 60
      );
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, titleIndex]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139, 92, 246, 0.15), transparent), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(6, 182, 212, 0.15), transparent)",
            animation: "meshFloat 15s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Availability badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-success/30 bg-success/10 mb-8"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span className="text-sm text-success font-medium">
            Available for opportunities
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 bg-gradient-to-r from-text-heading via-accent-primary to-accent-secondary bg-clip-text text-transparent"
        >
          {PERSONAL.name}
        </motion.h1>

        {/* Typing animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-10 sm:h-12 flex items-center justify-center mb-6"
        >
          <span className="text-xl sm:text-2xl font-mono text-accent-tertiary">
            {displayText}
            <span className="animate-pulse">|</span>
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg text-text-muted max-w-2xl mx-auto mb-10"
        >
          Building production AI platforms with multi-agent systems, hybrid RAG
          pipelines, and cloud-native infrastructure.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={() =>
              document
                .getElementById("projects")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold hover:shadow-lg hover:shadow-accent-primary/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            View Projects
          </button>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-lg font-semibold text-text-primary border border-accent-primary/50 hover:border-accent-primary hover:bg-accent-primary/10 transition-all duration-300 hover:-translate-y-0.5"
          >
            Download Resume
          </a>
        </motion.div>

        {/* Social Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center gap-5"
        >
          <a
            href={PERSONAL.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="p-3 rounded-full text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 transition-all duration-200"
          >
            <GithubIcon size={22} />
          </a>
          <a
            href={PERSONAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="p-3 rounded-full text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 transition-all duration-200"
          >
            <LinkedinIcon size={22} />
          </a>
          <a
            href={`mailto:${PERSONAL.email}`}
            aria-label="Email"
            className="p-3 rounded-full text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 transition-all duration-200"
          >
            <Mail size={22} />
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={28} className="text-text-muted" />
        </motion.div>
      </motion.div>

      {/* CSS animation keyframes */}
      <style jsx>{`
        @keyframes meshFloat {
          0% {
            transform: scale(1) translateY(0);
          }
          100% {
            transform: scale(1.1) translateY(-30px);
          }
        }
      `}</style>
    </section>
  );
}
