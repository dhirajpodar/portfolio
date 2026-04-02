"use client";

import { motion } from "framer-motion";
import { Mail, ExternalLink, MapPin } from "lucide-react";
import { PERSONAL } from "@/lib/constants";

export default function ContactCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-3 my-2"
      style={{
        background: "#0a0a0f",
        borderColor: "#1a1a24",
        maxWidth: 280,
      }}
    >
      <p className="text-sm font-semibold mb-2" style={{ color: "#f0f0f5" }}>
        Get in touch
      </p>

      <div className="flex flex-col gap-2">
        <a
          href={`mailto:${PERSONAL.email}`}
          className="flex items-center gap-2 text-xs transition-colors hover:text-[#8b5cf6]"
          style={{ color: "#94a3b8" }}
        >
          <Mail className="h-3.5 w-3.5" style={{ color: "#6366f1" }} />
          {PERSONAL.email}
        </a>

        <a
          href={PERSONAL.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs transition-colors hover:text-[#8b5cf6]"
          style={{ color: "#94a3b8" }}
        >
          <ExternalLink className="h-3.5 w-3.5" style={{ color: "#6366f1" }} />
          LinkedIn
        </a>

        <a
          href={PERSONAL.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs transition-colors hover:text-[#8b5cf6]"
          style={{ color: "#94a3b8" }}
        >
          <ExternalLink className="h-3.5 w-3.5" style={{ color: "#6366f1" }} />
          GitHub
        </a>

        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: "#94a3b8" }}
        >
          <MapPin className="h-3.5 w-3.5" style={{ color: "#6366f1" }} />
          {PERSONAL.location}
        </div>
      </div>
    </motion.div>
  );
}
