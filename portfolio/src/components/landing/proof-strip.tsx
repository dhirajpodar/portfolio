"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "4+", label: "Years Experience" },
  { value: "3\u00d7", label: "Siemens" },
  { value: "6", label: "Shipped Projects" },
];

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

export default function ProofStrip() {
  return (
    <section className="border-y px-4 py-16 sm:px-6" style={{ borderColor: "rgba(72, 71, 71, 0.15)" }}>
      <div className="mx-auto flex w-full max-w-[750px] items-center justify-around">
        {STATS.map((stat) => (
          <motion.div key={stat.label} {...fadeIn} transition={{ duration: 0.4 }}>
            <p
              className="font-mono text-3xl font-bold"
              style={{ color: "#06b6d4" }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
