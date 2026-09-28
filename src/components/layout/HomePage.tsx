import "@/styles/tokens.css";
import "@/styles/base.css";

import { About } from "@/components/about/About";
import { Activity } from "@/components/activity/Activity";
import { AsciiField } from "@/components/ascii/AsciiField";
import { Reveal } from "@/components/ascii/Reveal";
import { Contact } from "@/components/contact/Contact";
import { SiteFooter } from "@/components/contact/SiteFooter";
import { Education } from "@/components/education/Education";
import { Experience } from "@/components/experience/Experience";
import { Hero } from "@/components/hero/Hero";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { Projects } from "@/components/projects/Projects";
import { Stack } from "@/components/stack/Stack";
import { getContent } from "@/content";
import type { Locale } from "@/content/types";
import { monoFont } from "./fonts";
import styles from "./HomePage.module.css";

/*
 * The portfolio. Layers: ASCII canvas (fixed, behind) →
 * transparent frame with semantic HTML on top.
 *
 * Rhythm: cinematic (hero) → open (about) → dense (activity, stack)
 * → compact (experience, education) → open → editorial (work) → minimal (contact).
 */
export function HomePage({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  return (
    <>
      <AsciiField fontFamily={monoFont.style.fontFamily} />
      <Reveal />
      <CommandPalette sections={content.sections} strings={content.ui.palette} />
      <div className={styles.frame}>
        <a href="#main" className={styles.skip}>
          {content.ui.skip}
        </a>
        <main id="main" tabIndex={-1} className={styles.main}>
          <Hero content={content} />
          <About content={content} />
          <Activity content={content} />
          <Stack content={content} />
          <Experience content={content} />
          <Education content={content} />
          <Projects content={content} />
          <Contact content={content} />
        </main>
        <SiteFooter label={content.ui.footer.top} />
      </div>
    </>
  );
}
