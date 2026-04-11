"use client";

import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useCallback } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#4338ca",
    primaryTextColor: "#e0e0e0",
    primaryBorderColor: "#6366f1",
    lineColor: "#6366f1",
    secondaryColor: "#1e1b4b",
    tertiaryColor: "#0f172a",
    background: "#0a0a0a",
    mainBkg: "#1e1b4b",
    nodeBorder: "#6366f1",
    clusterBkg: "#111827",
    clusterBorder: "#374151",
    titleColor: "#f5f5f5",
    edgeLabelBackground: "#1e1b4b",
    fontSize: "14px",
  },
});

function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderDiagram = useCallback(async () => {
    if (!containerRef.current) return;
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    try {
      const { svg } = await mermaid.render(id, code);
      containerRef.current.innerHTML = svg;
    } catch {
      containerRef.current.innerHTML = `<pre style="color:#f87171;">${code}</pre>`;
    }
  }, [code]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  return <div ref={containerRef} className="mermaid-diagram" />;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s]+/g, "-");
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children !== null && typeof children === "object") {
    const obj = children as unknown as Record<string, unknown>;
    if ("props" in obj) {
      const props = obj.props as { children?: React.ReactNode };
      return extractText(props.children);
    }
  }
  return String(children ?? "");
}

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 id={slugify(extractText(children))}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 id={slugify(extractText(children))}>{children}</h3>
        ),
        code: ({ className, children }) => {
          const match = /language-(\w+)/.exec(className || "");
          if (match && match[1] === "mermaid") {
            return <MermaidBlock code={String(children).trim()} />;
          }
          return <code className={className}>{children}</code>;
        },
        pre: ({ children }) => {
          const child = children as React.ReactElement<{
            className?: string;
          }>;
          if (
            child?.props?.className &&
            /language-mermaid/.test(child.props.className)
          ) {
            return <>{children}</>;
          }
          return <pre>{children}</pre>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
