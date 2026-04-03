"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, UserRoundSearch, Code, MapPin } from "lucide-react";
import { PERSONAL } from "@/lib/constants";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

const LINKS = [
  {
    label: "Email",
    href: `mailto:${PERSONAL.email}`,
    icon: Mail,
    value: PERSONAL.email,
  },
  {
    label: "LinkedIn",
    href: PERSONAL.linkedin,
    icon: UserRoundSearch,
    value: "dhiraj-poddar",
  },
  {
    label: "GitHub",
    href: PERSONAL.github,
    icon: Code,
    value: "dhirajpodar",
  },
];

export default function AboutSection() {
  return (
    <div>
      {/* Photo + Bio */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-start gap-8 sm:flex-row sm:items-stretch sm:gap-10"
      >
        <div className="relative w-40 shrink-0 self-stretch overflow-hidden rounded-2xl sm:min-h-full">
          <Image
            src="/dhiraj.jpg"
            alt={PERSONAL.name}
            fill
            className="object-cover object-top"
          />
        </div>

        <div>
          <p className="text-sm leading-relaxed text-text-primary sm:text-base">
            From Nepal to India to Germany &mdash; I&rsquo;ve chased curiosity
            across borders. Along the way, I&rsquo;ve learnt to build AI
            products and take them to production. Now I&rsquo;m at a startup as
            the first engineer &mdash; because building from zero is where I do
            my best work.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-text-primary sm:text-base">
            I believe in lifelong learning &mdash; AI is at its peak moment, and
            the best way to ride it is to keep building. I have a hunger to
            solve real-world problems and ship things that actually make an
            impact.
          </p>
        </div>
      </motion.div>

      {/* Contact cards */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-12"
      >
        <h3 className="mb-4 font-mono text-xs font-medium uppercase tracking-widest text-text-muted">
          Get in touch
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:border-text-muted"
              style={{
                background: "#0a0a0f",
                borderColor: "rgba(72, 71, 71, 0.25)",
              }}
            >
              <link.icon size={20} className="shrink-0 text-accent-primary" />
              <div>
                <p className="text-sm font-medium text-text-heading">
                  {link.label}
                </p>
                <p className="text-xs text-text-muted">{link.value}</p>
              </div>
            </a>
          ))}

          <div
            className="flex items-center gap-4 rounded-xl border p-4"
            style={{
              background: "#0a0a0f",
              borderColor: "rgba(72, 71, 71, 0.25)",
            }}
          >
            <MapPin size={20} className="shrink-0 text-accent-primary" />
            <div>
              <p className="text-sm font-medium text-text-heading">Location</p>
              <p className="text-xs text-text-muted">{PERSONAL.location}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
