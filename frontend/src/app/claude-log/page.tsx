import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Code Session Log | Dhiraj Poddar",
  description: "Transcript of a Claude Code coding session.",
};

const LOG_FILE = "10k-agent-session.txt";

export default function ClaudeLogPage() {
  const filePath = path.join(process.cwd(), "public", "claude-logs", LOG_FILE);
  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12">
      <h1
        className="text-3xl sm:text-4xl font-bold text-text-heading mb-2"
        style={{ letterSpacing: "-0.04em" }}
      >
        Claude Code Session Log
      </h1>
      <p className="text-text-muted mb-6">
        Transcript from a Claude Code session while building a 10-K research agent.
      </p>
      <div className="mb-6 flex gap-3 text-sm">
        <a
          href={`/claude-logs/${LOG_FILE}`}
          download
          className="inline-block px-3 py-1.5 rounded-md border border-text-muted/30 hover:bg-text-muted/10 transition"
        >
          Download .txt
        </a>
        <a
          href={`/claude-logs/${LOG_FILE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 py-1.5 rounded-md border border-text-muted/30 hover:bg-text-muted/10 transition"
        >
          View raw
        </a>
      </div>
      <pre className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words bg-black/5 dark:bg-white/5 rounded-lg p-4 sm:p-6 font-mono overflow-x-auto">
        {content}
      </pre>
    </div>
  );
}
