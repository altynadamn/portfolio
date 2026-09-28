import type { ReactNode } from "react";

// Standalone figures such as "664", "~42%", "18,207", "2.1" — not "1C" or "k3s".
const NUMBER = /(?<![\w])(~?\d+(?:[.,]\d+)*%?)(?![\w])/g;

/** Wraps standalone numbers so they render as data (mono, full contrast). */
export function emphasizeNumbers(text: string, className: string): ReactNode[] {
  return text.split(NUMBER).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={className}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
