"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles, X, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What projects has Dhiraj built?",
  "What's his experience with RAG?",
  "Tell me about his tech stack",
];

function generateUUID(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coldStartMsg, setColdStartMsg] = useState(false);
  const [threadId] = useState(() => generateUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setError(null);
    setColdStartMsg(false);

    const coldStartTimer = setTimeout(() => {
      setColdStartMsg(true);
    }, 3000);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), thread_id: threadId }),
        signal: controller.signal,
      });

      clearTimeout(coldStartTimer);
      setColdStartMsg(false);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === "done") continue;
            if (data.type === "content" && data.content) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: (last.content + data.content)
                      .replace(/<!--\s*followups:\s*\[.*?\]\s*-->/gs, "")
                      .trimEnd(),
                  };
                }
                return updated;
              });
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err: unknown) {
      clearTimeout(coldStartTimer);
      setColdStartMsg(false);

      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      // Remove the empty assistant message on error
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      setError("Chat is currently unavailable");
    } finally {
      clearTimeout(coldStartTimer);
      setColdStartMsg(false);
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleRetry = () => {
    setError(null);
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating bubble */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing glow */}
        {!isOpen && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full opacity-30"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 flex w-96 max-sm:w-[calc(100vw-1.5rem)] max-sm:right-3 max-sm:left-3 flex-col rounded-2xl border border-[#1a1a24] shadow-2xl"
            style={{
              maxHeight: "500px",
              backgroundColor: "#111118",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1a1a24] px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
                <span className="text-sm font-semibold" style={{ color: "#f0f0f5" }}>
                  Ask about Dhiraj
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 transition-colors hover:bg-[#1a1a24] cursor-pointer"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" style={{ color: "#6b6b80" }} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: "200px", maxHeight: "360px" }}>
              {messages.length === 0 && !isStreaming && (
                <div className="flex flex-col gap-2 pt-4">
                  <p className="text-xs mb-2" style={{ color: "#6b6b80" }}>
                    Suggested questions
                  </p>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-sm rounded-xl border border-[#1a1a24] px-3 py-2 transition-colors hover:bg-[#1a1a24] cursor-pointer"
                      style={{ color: "#e2e8f0" }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "rounded-br-md"
                        : "rounded-bl-md"
                    }`}
                    style={{
                      backgroundColor: msg.role === "user" ? "#6366f1" : "#1a1a24",
                      color: "#e2e8f0",
                    }}
                  >
                    {msg.content}
                    {/* Typing indicator for empty assistant message */}
                    {msg.role === "assistant" && !msg.content && isStreaming && (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#6b6b80] animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#6b6b80] animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#6b6b80] animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Cold start message */}
              {coldStartMsg && (
                <div className="text-center">
                  <span className="text-xs italic" style={{ color: "#6b6b80" }}>
                    Waking up AI...
                  </span>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex flex-col items-center gap-2 py-2">
                  <span className="text-xs" style={{ color: "#ef4444" }}>
                    {error}
                  </span>
                  <button
                    onClick={handleRetry}
                    className="text-xs rounded-lg px-3 py-1 transition-colors cursor-pointer"
                    style={{ backgroundColor: "#1a1a24", color: "#8b5cf6" }}
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-[#1a1a24] px-3 py-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isStreaming}
                className="flex-1 rounded-xl border-none bg-[#1a1a24] px-3 py-2 text-sm outline-none placeholder:text-[#6b6b80] disabled:opacity-50"
                style={{ color: "#e2e8f0" }}
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                style={{ backgroundColor: "#6366f1" }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
