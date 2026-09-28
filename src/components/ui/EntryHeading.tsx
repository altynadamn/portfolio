import type { ReactNode } from "react";
import styles from "./Entry.module.css";

interface EntryHeadingProps {
  index: string;
  title: string;
  subtitle: string;
  period: ReactNode;
}

/** Phrasing-only content so it can live inside a <button>. */
export function EntryHeading({ index, title, subtitle, period }: EntryHeadingProps) {
  return (
    <>
      <span className={styles.index}>{index}</span>
      <span className={styles.main}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </span>
      <span className={styles.period}>{period}</span>
    </>
  );
}

/** Non-expandable entry with the same geometry as a Disclosure row. */
export function StaticEntry({ children }: { children: ReactNode }) {
  return (
    <div className={styles.item}>
      <div className={styles.row}>{children}</div>
    </div>
  );
}
