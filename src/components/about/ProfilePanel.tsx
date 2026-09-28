import type { ReactNode } from "react";
import type { SiteContent } from "@/content";
import { GITHUB_USERNAME, LINKEDIN_URL } from "@/content/socials";
import { ClockIcon, CodeIcon, GitHubIcon, GlobeIcon, LayersIcon, LinkedInIcon, MailIcon, PinIcon } from "@/components/ui/icons";
import { LocalTime } from "./LocalTime";
import styles from "./ProfilePanel.module.css";

interface Row {
  icon: ReactNode;
  label: string;
  content: ReactNode;
}

/*
 * Compact profile (structure after chanhdai.com): a row of square icon links,
 * then icon · text rows in two columns. Mono text, hairline frame, dashed
 * column divider. Hover pulses the ASCII field via [data-pulse].
 */
export function ProfilePanel({ content }: { content: SiteContent }) {
  const { profile, experience, ui, locale } = content;
  const current = experience.find((e) => !e.period.end);
  const t = ui.profile;

  const iconLinks = [
    { label: "GitHub", href: `https://github.com/${GITHUB_USERNAME}`, icon: <GitHubIcon />, external: true },
    { label: "LinkedIn", href: LINKEDIN_URL, icon: <LinkedInIcon />, external: true },
    { label: t.email, href: `mailto:${profile.email}`, icon: <MailIcon />, external: false },
  ];

  const left: Row[] = [
    {
      icon: <CodeIcon />,
      label: t.role,
      content: (
        <>
          {current ? current.role.split(" — ")[0] : profile.role}
          {current ? <strong className={styles.at}> @{current.organization}</strong> : null}
        </>
      ),
    },
    { icon: <LayersIcon />, label: t.focus, content: profile.focus.join(" · ") },
    { icon: <PinIcon />, label: t.location, content: `${profile.location.city}, ${profile.location.country}` },
    {
      icon: <MailIcon />,
      label: t.email,
      content: (
        <a href={`mailto:${profile.email}`} className={styles.link} data-pulse>
          {profile.email}
        </a>
      ),
    },
  ];
  const right: Row[] = [
    { icon: <ClockIcon />, label: t.localTime, content: <LocalTime timeZone={profile.location.timeZone} locale={locale} /> },
    { icon: <GlobeIcon />, label: t.languages, content: profile.languages.map((l) => l.name).join(" · ") },
  ];

  const renderRows = (rows: Row[]) =>
    rows.map((row) => (
      <div key={row.label} className={styles.row}>
        <dt className="sr-only">{row.label}</dt>
        <dd className={styles.rowContent}>
          <span className={styles.rowIcon}>{row.icon}</span>
          <span className={styles.rowText}>{row.content}</span>
        </dd>
      </div>
    ));

  return (
    <div className={styles.profile} data-reveal>
      <ul role="list" className={styles.icons} aria-label={t.links}>
        {iconLinks.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className={styles.iconLink}
              aria-label={l.external ? `${l.label} ${t.newTab}` : l.label}
              title={l.label}
              data-pulse
              {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {l.icon}
            </a>
          </li>
        ))}
      </ul>

      <dl className={styles.info}>
        <div className={styles.column}>{renderRows(left)}</div>
        <div className={`${styles.column} ${styles.columnRight}`}>{renderRows(right)}</div>
      </dl>
    </div>
  );
}
