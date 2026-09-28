import type { SiteContent } from "@/content";
import { Section } from "@/components/layout/Section";
import { ProfilePanel } from "./ProfilePanel";
import styles from "./About.module.css";

/*
 * The first moment after the hero: a large greeting over open ASCII territory,
 * then the compact profile. (Text formation is paused — see ascii/flags.ts.)
 */
export function About({ content }: { content: SiteContent }) {
  const { profile, ui, sections } = content;
  return (
    <Section id="about" sections={sections} meta={ui.about.meta} flush>
      <div className={styles.stage}>
        <p className={styles.greeting} data-formation="about" data-formation-trigger="view">
          <span className={`${styles.greetLine} ${styles.greetMuted}`}>{ui.about.greeting} </span>
          <span className={styles.greetLine}>{profile.firstName}.</span>
        </p>
      </div>
      <ProfilePanel content={content} />
    </Section>
  );
}
