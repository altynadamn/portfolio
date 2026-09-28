"use client";

import { useEffect, useRef } from "react";
import { ascii, registerAsciiEngine } from "@/ascii/bus";
import type { AsciiFieldEngine } from "@/ascii/field";
import { FORMATIONS_ENABLED } from "./flags";
import styles from "./AsciiField.module.css";

/*
 * Mounts the decorative ASCII canvas (aria-hidden, pointer-events: none).
 *
 * Loading strategy (performance): the engine is a separate chunk, imported
 * only after first paint when the browser is idle — it never competes with
 * hydration or the LCP. The canvas fades in once ready.
 *
 * Also arms view-triggered formations (data-formation-trigger="view") and one
 * delegated hover listener for [data-pulse] elements, so links that disturb
 * the field stay server components. If anything fails, the page stays a
 * complete static site.
 */
export function AsciiField({ fontFamily }: { fontFamily: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: AsciiFieldEngine | null = null;
    let observer: IntersectionObserver | null = null;
    let cancelled = false;
    let lastPulse: Element | null = null;

    // Delegated hover pulses: one listener for every [data-pulse] element.
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const el = (event.target as Element | null)?.closest?.("[data-pulse]") ?? null;
      if (el && el !== lastPulse) ascii.pulseAt(el);
      lastPulse = el;
    };
    document.addEventListener("pointerover", onPointerOver, { passive: true });

    const boot = async () => {
      try {
        const { AsciiFieldEngine } = await import("@/ascii/field");
        if (cancelled) return;
        const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff5f1f";
        engine = new AsciiFieldEngine(canvas, { fontFamily, fg: "#f2f2f2", accent });
        await engine.init();
      } catch {
        engine?.destroy();
        engine = null;
        return;
      }
      if (cancelled || !engine) return;
      engine.start();
      registerAsciiEngine(engine);
      canvas.dataset.ready = "true";

      if (!FORMATIONS_ENABLED || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const targets = document.querySelectorAll<HTMLElement>('[data-formation-trigger="view"]');
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer?.unobserve(entry.target);
            const target = entry.target as HTMLElement;
            if (!engine?.form(target)) target.dataset.formationState = "formed";
          }
        },
        // Start as soon as the text clears the bottom 10% of the viewport.
        { threshold: 0, rootMargin: "0px 0px -10% 0px" },
      );
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        // Already on screen at load: leave it readable, don't re-hide it.
        if (r.top < window.innerHeight && r.bottom > 0) return;
        el.dataset.formationState = "pending";
        observer?.observe(el);
      });
    };

    // Start after first paint, in idle time (with a cap so it never waits long).
    // Safari has no requestIdleCallback; fall back to a short timeout.
    const ric = (window as Partial<Pick<Window, "requestIdleCallback" | "cancelIdleCallback">>).requestIdleCallback;
    const idle = ric ? ric(() => void boot(), { timeout: 1500 }) : setTimeout(() => void boot(), 300);

    return () => {
      cancelled = true;
      if (ric) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle);
      document.removeEventListener("pointerover", onPointerOver);
      observer?.disconnect();
      registerAsciiEngine(null);
      engine?.destroy();
    };
  }, [fontFamily]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
