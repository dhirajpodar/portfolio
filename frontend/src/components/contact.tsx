"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Copy, Check } from "lucide-react";
import { PERSONAL } from "@/lib/constants";
import { GithubIcon, LinkedinIcon } from "@/components/icons";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PERSONAL.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = PERSONAL.email;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="text-center max-w-2xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-bold text-text-heading mb-2"
      >
        Let&apos;s Connect
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-16 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full mx-auto mb-6"
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg text-text-muted mb-8"
      >
        Open to AI/ML engineering opportunities in Germany and Europe
      </motion.p>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-10"
      >
        <a
          href={`mailto:${PERSONAL.email}`}
          className="text-xl sm:text-2xl font-mono text-accent-primary hover:text-accent-secondary transition-colors"
        >
          {PERSONAL.email}
        </a>
        <div className="mt-3">
          <button
            onClick={copyEmail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary bg-bg-secondary hover:bg-bg-tertiary border border-white/5 hover:border-accent-primary/30 transition-all"
          >
            {copied ? (
              <>
                <Check size={16} className="text-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy email
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Social links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-center justify-center gap-6"
      >
        <a
          href={PERSONAL.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="group p-4 rounded-full bg-bg-secondary border border-white/5 hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/10 transition-all duration-300"
        >
          <span className="text-text-muted group-hover:text-accent-primary transition-colors">
            <GithubIcon size={24} />
          </span>
        </a>
        <a
          href={PERSONAL.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="group p-4 rounded-full bg-bg-secondary border border-white/5 hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/10 transition-all duration-300"
        >
          <span className="text-text-muted group-hover:text-accent-primary transition-colors">
            <LinkedinIcon size={24} />
          </span>
        </a>
        <a
          href={`mailto:${PERSONAL.email}`}
          aria-label="Email"
          className="group p-4 rounded-full bg-bg-secondary border border-white/5 hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/10 transition-all duration-300"
        >
          <Mail
            size={24}
            className="text-text-muted group-hover:text-accent-primary transition-colors"
          />
        </a>
      </motion.div>
    </div>
  );
}
