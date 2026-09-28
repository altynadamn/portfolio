import type { SiteContent } from "@/content";
import { GITHUB_USERNAME, socials } from "@/content/socials";
import { Section } from "@/components/layout/Section";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/icons";
import { SocialLink } from "@/components/ui/SocialLink";
import styles from "./Contact.module.css";

const link = (label: string) => socials.find((s) => s.label === label);

/* Final minimal beat: one oversized statement, then the channels. */
export function Contact({ content }: { content: SiteContent }) {
  const { profile, ui, sections } = content;
  const linkedin = link("LinkedIn");
  const newTab = ui.profile.newTab;

  return (
    <Section id="contact" sections={sections} meta={`${profile.location.city}, ${profile.location.country}`} flush>
      <div className={styles.stage}>
        <p className={styles.headline} data-formation="contact" data-formation-trigger="view">
          <span className={styles.line}>{ui.contact.lines[0]} </span>
          <span className={`${styles.line} ${styles.indent}`}>{ui.contact.lines[1]} </span>
          <span className={styles.line}>{ui.contact.lines[2]}</span>
        </p>

        <div className={styles.aside} data-reveal>
          <p className={styles.note}>{ui.contact.note}</p>
          <ul role="list" className={styles.links}>
            <li>
              <SocialLink href={`mailto:${profile.email}`} icon={<MailIcon />} label={ui.profile.email} handle={profile.email} />
            </li>
            <li>
              <SocialLink
                href={`https://github.com/${GITHUB_USERNAME}`}
                icon={<GitHubIcon />}
                label="GitHub"
                handle={`@${GITHUB_USERNAME}`}
                external
                newTabLabel={newTab}
              />
            </li>
            {linkedin ? (
              <li>
                <SocialLink href={linkedin.href} icon={<LinkedInIcon />} label="LinkedIn" handle="linkedin.com" external newTabLabel={newTab} />
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </Section>
  );
}
