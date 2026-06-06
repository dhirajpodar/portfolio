"use server";

import { cookies } from "next/headers";
import { defaultLocale, LOCALE_COOKIE, locales, type Locale } from "./config";

export async function getUserLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(LOCALE_COOKIE, locale);
}
