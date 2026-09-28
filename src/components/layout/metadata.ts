import type { Metadata } from "next";
import { LOCALE_PATH } from "@/content";
import type { Locale } from "@/content/types";

/** Canonical origin: NEXT_PUBLIC_SITE_URL, else the Vercel production URL, else localhost. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const COPY: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: "Zhomart Begaly — Software Engineer",
    description:
      "Software engineer in Astana: backend, systems and automation — integrations between legacy databases, on-site hardware, 1C and external APIs.",
    ogLocale: "en_US",
  },
  ru: {
    title: "Жомарт Бегалы — инженер-программист",
    description:
      "Инженер-программист из Астаны: backend, системы и автоматизация — интеграции legacy-баз, оборудования на объектах, 1С и внешних API.",
    ogLocale: "ru_RU",
  },
};

export function pageMetadata(locale: Locale): Metadata {
  const { title, description, ogLocale } = COPY[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: LOCALE_PATH[locale],
      languages: { en: LOCALE_PATH.en, ru: LOCALE_PATH.ru, "x-default": LOCALE_PATH.en },
    },
    openGraph: { title, description, url: LOCALE_PATH[locale], locale: ogLocale, type: "website" },
  };
}
