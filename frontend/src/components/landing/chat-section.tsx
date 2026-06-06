"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ChatPage from "@/components/chat-page";

export default function ChatSection() {
  const t = useTranslations("ChatSection");

  return (
    <section id="chat" className="px-4 pt-16 pb-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-[750px]"
      >
        <h2
          className="mb-1 text-lg font-semibold text-text-heading sm:text-xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          {t("heading")}
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          {t("subtitle")}
        </p>
      </motion.div>
      <ChatPage embedded />
    </section>
  );
}
