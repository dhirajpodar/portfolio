"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setUserLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/config";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("LocaleSwitcher");
  const [isPending, startTransition] = useTransition();

  const next: Locale = locale === "de" ? "en" : "de";

  return (
    <button
      onClick={() => startTransition(() => void setUserLocale(next))}
      disabled={isPending}
      aria-label={t("label")}
      className="font-mono text-sm font-medium text-text-muted transition-colors duration-200 hover:text-text-primary disabled:opacity-50"
    >
      {t(next)}
    </button>
  );
}
