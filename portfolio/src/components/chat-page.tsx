"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChatContext } from "@/lib/chat-context";
import CardRenderer from "./chat-cards/card-renderer";

const SUGGESTED_QUESTIONS = [
  "What's your tech stack?",
  "How do you approach system design?",
  "What are you working on?",
];

export default function ChatPage({ embedded = false }: { embedded?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    input,
    setInput,
    isStreaming,
    error,
    coldStartMsg,
    activeCardTypes,
    messagesEndRef,
    sendMessage,
    handleRetry,
  } = useChatContext();

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
              {SUGGESTED_QUESTIONS.map((q) => (
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
                <div className="max-w-[85%] chat-markdown" style={{ color: "#adaaaa" }}>
                  {msg.content ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : isStreaming ? (
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
              )}
            </div>

            {/* Card responses */}
            {msg.role === "assistant" &&
              i === messages.length - 1 &&
              !isStreaming &&
              activeCardTypes.length > 0 && (
                <CardRenderer cardTypes={activeCardTypes} />
              )}
            {msg.role === "assistant" &&
              i < messages.length - 1 &&
              msg.cardTypes && <CardRenderer cardTypes={msg.cardTypes} />}
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
