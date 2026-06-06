"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useChatContext } from "@/lib/chat-context";
import LocaleSwitcher from "@/components/locale-switcher";

const NAV_KEYS: Record<string, "chat" | "blog" | "about"> = {
  "/": "chat",
  "/blog": "blog",
  "/about": "about",
};

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { resetChat } = useChatContext();
  const t = useTranslations("Nav");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              onClick={resetChat}
              className="font-mono text-xl font-bold"
              style={{
                background: "linear-gradient(135deg, #a8a4ff, #9995ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DP
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(link.href)
                      ? "text-accent-primary"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {t(NAV_KEYS[link.href])}
                </Link>
              ))}
              <LocaleSwitcher />
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-text-primary p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bg-primary/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-2xl font-semibold transition-colors ${
                      isActive(link.href)
                        ? "text-accent-primary"
                        : "text-text-primary hover:text-accent-primary"
                    }`}
                  >
                    {t(NAV_KEYS[link.href])}
                  </Link>
                </motion.div>
              ))}
              <LocaleSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
