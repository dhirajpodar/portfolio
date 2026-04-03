"use client";

import ReactMarkdown from "react-markdown";

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
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
