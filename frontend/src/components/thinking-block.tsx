"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Brain, Wrench, Check, ChevronDown } from "lucide-react";
import type { AgentStep } from "@/lib/agent-events";

type ThinkingTranslator = ReturnType<typeof useTranslations<"ThinkingBlock">>;

interface ThinkingBlockProps {
  reasoning?: string;
  steps: AgentStep[];
  /** The agent is still working and the answer hasn't started. */
  streaming: boolean;
  /** The final answer has begun streaming. */
  answerStarted: boolean;
}

function stepLabel(
  step: AgentStep,
  t: ThinkingTranslator,
): { icon: React.ReactNode; text: string } {
  switch (step.type) {
    case "thinking":
      return { icon: <Brain className="h-3 w-3" />, text: t("thinking") };
    case "tool_start":
      return { icon: <Wrench className="h-3 w-3" />, text: t("using", { tool: step.tool ?? "" }) };
    case "tool_end":
      return { icon: <Check className="h-3 w-3" />, text: t("used", { tool: step.tool ?? "" }) };
    case "generating":
      return { icon: <Brain className="h-3 w-3" />, text: t("writingAnswer") };
  }
}

export default function ThinkingBlock({
  reasoning,
  steps,
  streaming,
  answerStarted,
}: ThinkingBlockProps) {
  const t = useTranslations("ThinkingBlock");
  // Default: open while thinking, auto-collapsed once the answer starts.
  // A manual toggle overrides the default and sticks.
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? !answerStarted;

  // Drop tool_start once its tool_end arrived, and the generating step (that's
  // the answer phase, not thinking).
  const displaySteps = steps.filter((s, i) => {
    if (s.type === "generating") return false;
    if (s.type === "tool_start") {
      return !steps.some(
        (o, j) => j > i && o.type === "tool_end" && o.tool === s.tool
      );
    }
    return true;
  });

  if (displaySteps.length === 0 && !reasoning) return null;

  const toolCount = steps.filter((s) => s.type === "tool_end").length;
  const headerText = streaming
    ? t("headerStreaming")
    : toolCount > 0
      ? t("thoughtProcessTools", { count: toolCount })
      : t("thoughtProcess");

  return (
    <div className="mb-2">
      <button
        onClick={() => setUserOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-left transition-colors hover:bg-[#1a1a24] cursor-pointer"
        style={{ fontSize: "0.7rem", color: "#818cf8" }}
      >
        <Brain className="h-3.5 w-3.5" />
        <span>{headerText}</span>
        {streaming && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "#818cf8" }}
          />
        )}
        <motion.span animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-1 ml-2 border-l-2 pl-3"
              style={{ borderColor: "rgba(99, 102, 241, 0.3)" }}
            >
              {displaySteps.length > 0 && (
                <div className="flex flex-col gap-1 py-0.5">
                  {displaySteps.map((step, i) => {
                    const { icon, text } = stepLabel(step, t);
                    return (
                      <div
                        key={`${step.type}-${step.tool ?? ""}-${i}`}
                        className="flex items-center gap-1.5"
                        style={{ fontSize: "0.72rem", color: "#7a7a8c" }}
                      >
                        {icon}
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {reasoning && (
                <div
                  className="whitespace-pre-wrap pt-1"
                  style={{
                    fontSize: "0.78rem",
                    lineHeight: 1.5,
                    color: "#8a8a99",
                  }}
                >
                  {reasoning}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
