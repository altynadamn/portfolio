import type { ReactNode } from "react";
import type { Section as SectionData } from "@/content/types";
import styles from "./Section.module.css";

interface SectionProps {
  id: string;
  /** Localized section list (labels, numbers, statements). */
  sections: SectionData[];
  /** Right-aligned technical metadata in the section label row. */
  meta?: ReactNode;
  children: ReactNode;
  /** Body without padding — the section composes its own layout. */
  flush?: boolean;
  /** Render the section's display statement as an open opener. */
  opener?: boolean;
  /** Vertical rhythm: "open" sections get more air than "dense" ones. */
  spacing?: "open" | "dense";
  className?: string;
}

/*
 * Section = small technical label (h2, "06 / Selected work") + optional
 * display opener + body. No rules or boxes: spacing, type and alignment
 * carry the structure; the ASCII field provides texture.
 */
export function Section({ id, sections, meta, children, flush, opener, spacing = "open", className }: SectionProps) {
  const section = sections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown section id: ${id}`);
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${styles.section} ${spacing === "dense" ? styles.dense : ""} ${className ?? ""}`}
    >
      <header className={styles.label} data-reveal>
        <span className={styles.number} aria-hidden="true">
          {section.number}
        </span>
        <span className={styles.slash} aria-hidden="true">
          /
        </span>
        <h2 id={headingId} className={styles.title}>
          {section.label}
        </h2>
        {meta ? <p className={styles.meta}>{meta}</p> : null}
      </header>

      {opener && section.statement ? (
        <div className={styles.opener}>
          <span className={styles.numeral} aria-hidden="true">
            {section.number}
          </span>
          <p className={styles.statement} data-formation={`${id}-opener`} data-formation-trigger="view">
            {section.statement.map((line) => (
              <span key={line} className={styles.statementLine}>
                {line}{" "}
              </span>
            ))}
          </p>
        </div>
      ) : null}

      <div className={flush ? undefined : styles.body}>{children}</div>
    </section>
  );
}
