"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
  stagger?: boolean;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function SectionWrapper({
  children,
  id,
  className = "",
  stagger = false,
}: SectionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <section id={id} className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="mx-auto max-w-6xl">{children}</div>
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}
      variants={stagger ? staggerContainer : fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </motion.section>
  );
}

export function FadeInChild({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={fadeInUp}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
