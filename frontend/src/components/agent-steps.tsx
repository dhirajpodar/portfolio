"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Brain, Wrench, Check, Sparkles, ChevronDown, Zap } from "lucide-react";
import type { AgentStep } from "@/lib/agent-events";

interface AgentStepsProps {
  steps: AgentStep[];
  isActive: boolean;
}

function StepNode({
  step,
  isLast,
  isActive,
}: {
  step: AgentStep;
  isLast: boolean;
  isActive: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const t = useTranslations("AgentSteps");

  const isCurrentlyActive = isLast && isActive;

  const config = {
    thinking: {
      icon: <Brain className="h-3.5 w-3.5" />,
      label: t("thinking"),
      bg: "rgba(99, 102, 241, 0.15)",
      border: "rgba(99, 102, 241, 0.3)",
      color: "#818cf8",
      glow: "rgba(99, 102, 241, 0.4)",
    },
    tool_start: {
      icon: <Wrench className="h-3.5 w-3.5" />,
      label: step.tool ?? t("tool"),
      bg: "rgba(6, 182, 212, 0.15)",
      border: "rgba(6, 182, 212, 0.3)",
      color: "#22d3ee",
      glow: "rgba(6, 182, 212, 0.4)",
    },
    tool_end: {
      icon: <Check className="h-3.5 w-3.5" />,
      label: step.tool ?? t("tool"),
      bg: "rgba(16, 185, 129, 0.15)",
      border: "rgba(16, 185, 129, 0.3)",
      color: "#34d399",
      glow: "rgba(16, 185, 129, 0.4)",
    },
    generating: {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      label: t("generating"),
      bg: "rgba(139, 92, 246, 0.15)",
      border: "rgba(139, 92, 246, 0.3)",
      color: "#a78bfa",
      glow: "rgba(139, 92, 246, 0.4)",
    },
  }[step.type];

  return (
    <motion.div
      className="relative"
      onMouseEnter={() => step.preview && setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -8 }}
        animate={{
          opacity: step.type === "tool_end" || step.type === "thinking" ? 0.75 : 1,
          scale: 1,
          x: 0,
          boxShadow: isCurrentlyActive
            ? [
                `0 0 0px ${config.glow}`,
                `0 0 12px ${config.glow}`,
                `0 0 0px ${config.glow}`,
              ]
            : `0 0 0px ${config.glow}`,
        }}
        transition={{
          duration: 0.3,
          boxShadow: isCurrentlyActive
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 },
        }}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
        style={{
          background: config.bg,
          border: `1px solid ${config.border}`,
          color: config.color,
          fontSize: "0.7rem",
          fontFamily: "var(--font-mono, monospace)",
          whiteSpace: "nowrap",
        }}
      >
        {config.icon}
        <span>{config.label}</span>
        {step.type === "tool_end" && (
          <Check className="h-3 w-3" style={{ color: "#34d399" }} />
        )}
        {isCurrentlyActive && step.type !== "tool_end" && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: config.color }}
          />
        )}
      </motion.div>

      {/* Preview tooltip */}
      <AnimatePresence>
        {showPreview && step.preview && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute left-0 top-full z-10 mt-1 max-w-[250px] rounded-lg border px-3 py-2"
            style={{
              background: "#111118",
              borderColor: "#1a1a24",
              fontSize: "0.7rem",
              color: "#94a3b8",
              lineHeight: 1.4,
            }}
          >
            {step.preview}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 20 }}
      transition={{ duration: 0.2 }}
      className="h-[2px] flex-shrink-0"
      style={{
        background: active
          ? "linear-gradient(90deg, #6366f1, #06b6d4)"
          : "#1a1a24",
      }}
    />
  );
}

export default function AgentSteps({ steps, isActive }: AgentStepsProps) {
  const [expanded, setExpanded] = useState(true);

  // Deduplicate: skip tool_start if followed by tool_end for same tool
  const displaySteps = steps.filter((step, i) => {
    if (step.type === "tool_start") {
      const hasEnd = steps.some(
        (s, j) => j > i && s.type === "tool_end" && s.tool === step.tool,
      );
      if (hasEnd) return false;
    }
    return true;
  });

  if (displaySteps.length === 0) return null;

  const toolCount = steps.filter((s) => s.type === "tool_end").length;
  const toolNames = steps
    .filter((s) => s.type === "tool_end")
    .map((s) => s.tool)
    .join(", ");

  // Auto-collapse when done streaming
  const shouldShowCollapsed = !isActive && toolCount > 0;

  if (shouldShowCollapsed && !expanded) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-left transition-colors hover:bg-[#1a1a24] cursor-pointer"
        style={{
          background: "#111118",
          fontSize: "0.7rem",
          color: "#6b6b80",
        }}
      >
        <Zap className="h-3 w-3" style={{ color: "#8b5cf6" }} />
        <span>
          Agent used {toolCount} tool{toolCount !== 1 ? "s" : ""} ({toolNames})
        </span>
        <ChevronDown className="h-3 w-3 ml-auto" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-1"
    >
      {shouldShowCollapsed && (
        <button
          onClick={() => setExpanded(false)}
          className="mb-1 text-[0.65rem] cursor-pointer transition-colors hover:text-[#8b5cf6]"
          style={{ color: "#6b6b80" }}
        >
          Collapse
        </button>
      )}
      <div
        className="flex items-center gap-1 overflow-x-auto py-1"
        style={{ scrollbarWidth: "none" }}
      >
        {displaySteps.map((step, i) => (
          <div key={`${step.type}-${step.tool ?? ""}-${i}`} className="flex items-center gap-1">
            {i > 0 && <Connector active={true} />}
            <StepNode
              step={step}
              isLast={i === displaySteps.length - 1}
              isActive={isActive}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
