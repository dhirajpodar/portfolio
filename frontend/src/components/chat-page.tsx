"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChatContext } from "@/lib/chat-context";
import ThinkingBlock from "./thinking-block";

const FALLBACK_QUESTIONS = [
  "What have you built with AI agents?",
  "What do you write about?",
  "What drives you outside of work?",
  "Are you open to new opportunities?",
  "Walk me through a tough problem you solved",
];

export default function ChatPage({ embedded = false }: { embedded?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(FALLBACK_QUESTIONS);

  const {
    messages,
    input,
    setInput,
    isStreaming,
    error,
    coldStartMsg,
    messagesEndRef,
    sendMessage,
    handleRetry,
    agentSteps,
  } = useChatContext();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/suggested-questions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions?.length) setSuggestedQuestions(data.questions);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (messages.length === 0 && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className={`flex flex-col max-w-[750px] mx-auto px-4 ${embedded ? "min-h-[70vh]" : "h-[calc(100vh-4rem)]"}`}>
      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto py-6 space-y-4">
        {/* Welcome state */}
        {messages.length === 0 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center pt-[15vh]"
          >
            <h1
              className="text-3xl sm:text-4xl font-bold mb-3 text-text-heading"
              style={{ letterSpacing: "-0.04em" }}
            >
              {embedded ? "What would you like to know?" : "Hey, I\u2019m Dhiraj"}
            </h1>
            <p className="text-text-muted text-center max-w-md mb-8">
              {embedded
                ? "Ask about my experience, projects, tech stack, or how I approach problems."
                : "An AI Engineer. Ask me about my work, how I think, or what I\u2019m building."}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {suggestedQuestions.map((q) => (
                <motion.button
                  key={q}
                  whileHover={{
                    boxShadow: "0 0 4px rgba(168, 164, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendMessage(q)}
                  className="rounded-full px-5 py-2.5 text-sm transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "#201f1f",
                    color: "#adaaaa",
                  }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => (
          <div key={i}>
            <div
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}
            >
              {msg.role === "user" ? (
                <div
                  className="max-w-[80%] text-sm whitespace-pre-wrap rounded-2xl rounded-br-md px-4 py-3"
                  style={{ backgroundColor: "#a8a4ff", color: "#1e009f" }}
                >
                  {msg.content}
                </div>
              ) : (
                (() => {
                  const isLast = i === messages.length - 1;
                  const activeStreaming = isStreaming && isLast;
                  // Live steps for the streaming message; persisted steps after.
                  const steps = activeStreaming ? agentSteps : msg.agentSteps ?? [];
                  const hasToolActivity = steps.some(
                    (s) =>
                      s.type === "thinking" ||
                      s.type === "tool_start" ||
                      s.type === "tool_end"
                  );
                  // The thinking panel is only for tool-using replies. A no-tool
                  // reply (greeting/chitchat) streams its text as `reasoning`,
                  // since no tool ever flips the backend into answer mode — so
                  // treat that reasoning as the live answer and stream it inline
                  // rather than hiding it in a "Thinking…" panel.
                  const showThinking = hasToolActivity;
                  const liveAnswer =
                    msg.content || (!hasToolActivity ? msg.reasoning ?? "" : "");
                  const showDots = activeStreaming && !liveAnswer && !showThinking;
                  return (
                <div className="max-w-[85%] chat-markdown" style={{ color: "#adaaaa" }}>
                  {showThinking && (
                    <ThinkingBlock
                      reasoning={msg.reasoning}
                      steps={steps}
                      streaming={activeStreaming && !msg.content}
                      answerStarted={!!msg.content}
                    />
                  )}
                  {liveAnswer ? (
                    <ReactMarkdown>{liveAnswer.replace(/<!--\s*followups:[\s\S]*?-->/g, "").trim()}</ReactMarkdown>
                  ) : showDots ? (
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                  ) : null}
                </div>
                  );
                })()
              )}
            </div>

          </div>
        ))}


        {coldStartMsg && (
          <div className="text-center">
            <span className="text-xs italic text-text-muted">
              Waking up AI...
            </span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-xs text-red-500">{error}</span>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="text-xs rounded-lg px-3 py-1 transition-colors cursor-pointer"
              style={{ backgroundColor: "#201f1f", color: "#a8a4ff" }}
            >
              Retry
            </motion.button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 pb-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{ backgroundColor: "#000000" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isStreaming}
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-text-muted disabled:opacity-50"
            style={{ color: "#adaaaa" }}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={isStreaming || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
            style={{ backgroundColor: "#a8a4ff" }}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" style={{ color: "#1e009f" }} />
          </motion.button>
        </form>

        <p
          className="text-center mt-3 text-text-muted"
          style={{
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Powered by an agent that knows me well
        </p>
      </div>
    </div>
  );
}
