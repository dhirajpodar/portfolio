"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  parseSSELine,
  type AgentStep,
} from "./agent-events";

export interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  agentSteps?: AgentStep[];
}

function generateUUID(): string {
  return (
    crypto.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36)
  );
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coldStartMsg, setColdStartMsg] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [threadId] = useState(() => generateUUID());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight + 200;
    if (inViewport) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsStreaming(true);
      setError(null);
      setColdStartMsg(false);
      setAgentSteps([]);
      const coldStartTimer = setTimeout(() => {
        setColdStartMsg(true);
      }, 3000);

      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      const controller = new AbortController();
      abortRef.current = controller;

      let generatingAdded = false;
      const collectedSteps: AgentStep[] = [];

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
            const data = parseSSELine(line);
            if (!data) continue;

            switch (data.type) {
              case "thinking": {
                const step: AgentStep = {
                  type: "thinking",
                  timestamp: Date.now(),
                };
                collectedSteps.push(step);
                setAgentSteps([...collectedSteps]);
                break;
              }
              case "reasoning": {
                // Pre-tool narration — stream it into the message's separate
                // reasoning field, shown in a collapsible "thinking" panel.
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      reasoning: (last.reasoning ?? "") + data.content,
                    };
                  }
                  return updated;
                });
                break;
              }
              case "tool_start": {
                const step: AgentStep = {
                  type: "tool_start",
                  tool: data.tool,
                  timestamp: Date.now(),
                };
                collectedSteps.push(step);
                setAgentSteps([...collectedSteps]);
                break;
              }
              case "tool_end": {
                const step: AgentStep = {
                  type: "tool_end",
                  tool: data.tool,
                  preview: data.preview,
                  timestamp: Date.now(),
                };
                collectedSteps.push(step);
                setAgentSteps([...collectedSteps]);

                break;
              }
              case "content": {
                if (!generatingAdded) {
                  const step: AgentStep = {
                    type: "generating",
                    timestamp: Date.now(),
                  };
                  collectedSteps.push(step);
                  setAgentSteps([...collectedSteps]);
                  generatingAdded = true;
                }
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + data.content,
                    };
                  }
                  return updated;
                });
                break;
              }
              case "done": {
                // Persist steps, strip followup comment from content
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    // No-tool replies (greetings) stream as "reasoning" since
                    // no tool ever flips the backend into answer mode. If we
                    // ended with no answer, that reasoning WAS the answer.
                    let content = last.content;
                    let reasoning = last.reasoning;
                    if (!content && reasoning) {
                      content = reasoning;
                      reasoning = undefined;
                    }
                    const cleaned = content.replace(
                      /<!--\s*followups:\s*\[[\s\S]*?\]\s*-->/,
                      ""
                    ).trimEnd();
                    updated[updated.length - 1] = {
                      ...last,
                      content: cleaned,
                      reasoning,
                      agentSteps: [...collectedSteps],
                    };
                  }
                  return updated;
                });
                break;
              }
              case "error": {
                throw new Error(data.error);
              }
            }
          }
        }
      } catch (err: unknown) {
        clearTimeout(coldStartTimer);
        setColdStartMsg(false);

        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

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
    },
    [isStreaming, threadId],
  );

  const handleRetry = useCallback(() => {
    setError(null);
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  const resetChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]);
    setInput("");
    setIsStreaming(false);
    setError(null);
    setColdStartMsg(false);
    setAgentSteps([]);
  }, []);

  return {
    messages,
    input,
    setInput,
    isStreaming,
    error,
    coldStartMsg,
    agentSteps,
    threadId,
    messagesEndRef,
    sendMessage,
    handleRetry,
    resetChat,
  };
}
