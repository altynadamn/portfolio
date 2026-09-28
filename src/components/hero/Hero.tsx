import type { SiteContent } from "@/content";
import { HeroLight } from "./HeroLight";
import { HeroMark } from "./HeroMark";
import { LanguageSwitch } from "./LanguageSwitch";
import styles from "./Hero.module.css";

/*
 * Cinematic first viewport: huge name, ZH wireframe, one positioning line,
 * technical metadata — and open territory for the ASCII field.
 */
export function Hero({ content }: { content: SiteContent }) {
  const { profile, ui, locale } = content;
  const [first, last] = profile.name.split(" ");

  return (
    <section id="intro" aria-labelledby="intro-heading" className={styles.hero}>
      <div className={`${styles.metaRow} ${styles.enterLate}`}>
        <span>
          <span className={styles.accent}>00</span> / {ui.hero.intro}
        </span>
        <LanguageSwitch current={locale} label={ui.lang.label} />
      </div>

      <div className={styles.stage}>
        <h1 id="intro-heading" className={styles.name}>
          <span className={styles.lineMask}>
            <span className={`${styles.line} ${styles.enterLine1}`}>{first}</span>
          </span>
          <span className={styles.lineMask}>
            <span className={`${styles.line} ${styles.lineIndent} ${styles.enterLine2}`}>{last}</span>
          </span>
        </h1>

        <p className={`${styles.role} ${styles.enterLate}`}>
          <span className={styles.roleTitle}>{profile.role}</span>
          <span className={styles.roleFocus}>{profile.focus.join(" / ")}</span>
        </p>

        <figure className={`${styles.figure} ${styles.enterMark}`} aria-hidden="true">
          <HeroMark />
          <figcaption className={styles.caption}>
            {ui.hero.caption}
            <span className={styles.captionMore}>{ui.hero.captionMore}</span>
          </figcaption>
        </figure>
      </div>

      <div className={`${styles.baseRow} ${styles.enterLate}`}>
        <span>
          {profile.location.city}, {profile.location.country}
        </span>
        <span className={styles.hint} aria-hidden="true">
          {ui.hero.hint}
        </span>
        <a href="#about" className={styles.cue}>
          {ui.hero.scroll} <span aria-hidden="true">↓</span>
        </a>
      </div>

      <HeroLight />
    </section>
  );
}
