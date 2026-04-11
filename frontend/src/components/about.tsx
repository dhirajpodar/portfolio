"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ABOUT_SUMMARY, STATS } from "@/lib/constants";

function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  const [display, setDisplay] = useState("0");
  const numericPart = value.replace(/[^0-9]/g, "");
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    if (!inView) return;
    const target = parseInt(numericPart, 10);
    if (isNaN(target)) {
      const id = setTimeout(() => setDisplay(value), 0);
      return () => clearTimeout(id);
    }

    let current = 0;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setDisplay(Math.floor(current).toString() + suffix);
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, numericPart, suffix, value]);

  return <>{display}</>;
}

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const highlights = [
    "production AI platforms",
    "first engineer",
    "Azure cloud infrastructure",
    "LangGraph multi-agent systems",
    "Next.js frontend",
    "real-time AI streaming",
    "4+ years",
  ];

  function renderSummary(text: string) {
    let result: (string | React.ReactNode)[] = [text];

    highlights.forEach((phrase) => {
      const newResult: (string | React.ReactNode)[] = [];
      result.forEach((segment) => {
        if (typeof segment !== "string") {
          newResult.push(segment);
          return;
        }
        const parts = segment.split(new RegExp(`(${phrase})`, "gi"));
        parts.forEach((part, i) => {
          if (part.toLowerCase() === phrase.toLowerCase()) {
            newResult.push(
              <span
                key={`${phrase}-${i}`}
                className="text-accent-primary font-semibold"
              >
                {part}
              </span>
            );
          } else if (part) {
            newResult.push(part);
          }
        });
      });
      result = newResult;
    });

    return result;
  }

  return (
    <div ref={ref}>
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
        {/* Text column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-heading mb-2">
            About Me
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full mb-6" />
          <p className="text-lg leading-relaxed text-text-primary">
            {renderSummary(ABOUT_SUMMARY)}
          </p>
        </motion.div>

        {/* Photo column */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative p-[3px] rounded-2xl bg-gradient-to-br from-accent-primary via-accent-secondary to-accent-tertiary">
            <div className="rounded-2xl overflow-hidden bg-bg-secondary">
              <Image
                src="/photo.jpg"
                alt="Dhiraj Poddar"
                width={360}
                height={420}
                className="rounded-2xl object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="text-center p-6 rounded-xl bg-bg-secondary border border-white/5 hover:border-accent-primary/30 transition-colors"
          >
            <div className="text-3xl sm:text-4xl font-mono font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-2">
              <AnimatedNumber value={stat.value} inView={inView} />
            </div>
            <div className="text-sm text-text-muted">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
