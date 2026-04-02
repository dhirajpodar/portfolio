"use client";

import { useState, useEffect } from "react";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export default function TocSidebar({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="hidden lg:block sticky top-24">
      <p
        className="font-medium mb-4 text-text-muted"
        style={{
          fontSize: "0.6875rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        On this page
      </p>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-sm transition-colors duration-200 ${
                h.level === 3 ? "pl-4" : ""
              } ${
                activeId === h.id
                  ? "text-accent-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
