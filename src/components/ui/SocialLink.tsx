import type { ReactNode } from "react";
import styles from "./SocialLink.module.css";

interface SocialLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  handle: string;
  external?: boolean;
  download?: boolean;
  /** Screen-reader suffix for external links, e.g. "(opens in a new tab)". */
  newTabLabel?: string;
}

/*
 * Icon · label · handle · arrow. Server component: the hover disturbance in
 * the ASCII field comes from AsciiField's delegated listener ([data-pulse]),
 * so no per-link client JS or hydration.
 */
export function SocialLink({ href, icon, label, handle, external, download, newTabLabel = "(opens in a new tab)" }: SocialLinkProps) {
  return (
    <a
      href={href}
      className={styles.link}
      data-pulse
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.handle}>{handle}</span>
      </span>
      <span className={styles.arrow} aria-hidden="true">
        {download ? "↓" : external ? "↗" : "→"}
      </span>
      {external ? <span className="sr-only"> {newTabLabel}</span> : null}
    </a>
  );
}
