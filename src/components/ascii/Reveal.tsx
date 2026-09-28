"use client";

import { useEffect } from "react";

/*
 * Section reveals: elements with [data-reveal] rise in once when they enter
 * the viewport. Hidden states only apply after `html.reveal-ready` is set, so
 * without JS (or before hydration) everything is visible.
 */
export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    for (const el of elements) {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.dataset.revealed = "true";
      else observer.observe(el);
    }
    root.classList.add("reveal-ready");

    return () => observer.disconnect();
  }, []);

  return null;
}
