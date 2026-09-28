import { LOCALE_PATH, LOCALES } from "@/content";
import type { Locale } from "@/content/types";
import styles from "./LanguageSwitch.module.css";

const LABEL: Record<Locale, string> = { en: "EN", ru: "RU" };
const NAME: Record<Locale, string> = { en: "English", ru: "Русский" };

/** EN / RU — plain links between the two static pages. */
export function LanguageSwitch({ current, label }: { current: Locale; label: string }) {
  return (
    <nav aria-label={label} className={styles.switch}>
      {LOCALES.map((locale, i) => (
        <span key={locale} className={styles.item}>
          {i > 0 ? (
            <span className={styles.sep} aria-hidden="true">
              /
            </span>
          ) : null}
          <a
            href={LOCALE_PATH[locale]}
            hrefLang={locale}
            lang={locale}
            aria-label={NAME[locale]}
            aria-current={locale === current ? "page" : undefined}
            className={styles.link}
          >
            {LABEL[locale]}
          </a>
        </span>
      ))}
    </nav>
  );
}
