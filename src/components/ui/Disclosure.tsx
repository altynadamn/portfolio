"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ascii } from "@/ascii/bus";
import { FORMATIONS_ENABLED } from "@/components/ascii/flags";
import styles from "./Entry.module.css";

interface DisclosureProps {
  id: string;
  /** Phrasing content rendered inside the toggle button (see EntryHeading). */
  heading: ReactNode;
  children: ReactNode;
  headingLevel?: 3 | 4;
}

/*
 * Accordion item (WAI-ARIA disclosure pattern). Collapsed content stays in the
 * HTML for SEO but is `inert`, so it is neither focusable nor announced.
 *
 * MORE: the panel opens while the ASCII field forms its [data-formation] text.
 * LESS: that text dissolves back into the field as the panel closes.
 * Without an engine (reduced motion, no canvas) it is a plain accordion.
 */
export function Disclosure({ id, heading, children, headingLevel = 3 }: DisclosureProps) {
  const [open, setOpen] = useState(false);
  const lastOpen = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const Heading = headingLevel === 3 ? "h3" : "h4";
  const buttonId = `${id}-button`;
  const panelId = `${id}-panel`;

  useEffect(() => {
    if (lastOpen.current === open) return;
    lastOpen.current = open;
    if (!FORMATIONS_ENABLED) return;
    const target = panelRef.current?.querySelector<HTMLElement>("[data-formation]");
    if (!target) return;
    // Let the open panel commit and acquire its natural layout before sampling.
    const first = requestAnimationFrame(() => {
      if (open) ascii.form(target);
      else ascii.dissolve(target);
    });
    return () => cancelAnimationFrame(first);
  }, [open]);

  const toggle = () => setOpen((value) => !value);

  return (
    <div className={styles.item} data-open={open}>
      <Heading className={styles.heading}>
        <button
          type="button"
          id={buttonId}
          className={`${styles.row} ${styles.button}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          onPointerEnter={(e) => ascii.pulseAt(e.currentTarget.querySelector(`.${styles.toggle}`) ?? e.currentTarget)}
        >
          {heading}
          <span className={styles.toggle} aria-hidden="true">
            <span className={styles.sign}>{open ? "−" : "+"}</span>
          </span>
        </button>
      </Heading>
      <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.panel} inert={!open}>
        <div className={styles.panelInner}>
          <div ref={panelRef} className={styles.panelContent}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
