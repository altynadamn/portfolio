"use client";

import { useEffect } from "react";

/*
 * Cursor illumination for the hero: moves the #zh-light mask over the ZH mark
 * and a radial highlight across the name.
 *
 * Performance: no React state; element geometry is cached in page coordinates
 * (no layout reads per frame); work is skipped entirely when the hero is off
 * screen or the pointer is far from the mark/name; one rAF loop runs only while
 * the light is still moving.
 */
const EASE = 0.18;
const NAME_RADIUS_REM = 15;
/** Pointer distance (px) beyond an element's box at which its light is skipped. */
const REACH = 260;

interface Box {
  left: number;
  top: number; // page coordinates (viewport + scrollY)
  right: number;
  bottom: number;
}

export function HeroLight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const hero = document.getElementById("intro");
    const svg = document.getElementById("hero-mark") as SVGSVGElement | null;
    const gradient = document.getElementById("zh-light");
    const name = document.getElementById("intro-heading");
    // --lit goes on the lit group only: setting it on <svg> would invalidate the
    // style of every path in the drawing on each frame.
    const litGroup = document.getElementById("zh-lit");
    if (!hero || !svg || !gradient || !name || !litGroup) return;
    const lines = Array.from(name.querySelectorAll<HTMLElement>(":scope > span > span"));

    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const mountedAt = performance.now();

    // ── Cached geometry (page coordinates) ──
    let heroBottom = 0;
    let svgBox: Box = { left: 0, top: 0, right: 0, bottom: 0 };
    let nameBox: Box = svgBox;
    let lineTops: number[] = [];
    let lineLefts: number[] = [];
    let inv: DOMMatrix | null = null;
    let invScroll = 0;
    let dirty = true;

    const measure = () => {
      const sy = window.scrollY;
      const toBox = (r: DOMRect): Box => ({ left: r.left, top: r.top + sy, right: r.right, bottom: r.bottom + sy });
      heroBottom = hero.getBoundingClientRect().bottom + sy;
      svgBox = toBox(svg.getBoundingClientRect());
      nameBox = toBox(name.getBoundingClientRect());
      lineLefts = lines.map((l) => l.getBoundingClientRect().left);
      lineTops = lines.map((l) => l.getBoundingClientRect().top + sy);
      const ctm = svg.getScreenCTM();
      inv = ctm ? ctm.inverse() : null;
      invScroll = sy;
      dirty = false;
    };

    const near = (b: Box, px: number, pyPage: number) =>
      px > b.left - REACH && px < b.right + REACH && pyPage > b.top - REACH && pyPage < b.bottom + REACH;

    // ── Light state ──
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let strength = 0;
    let targetStrength = 0;
    let seen = false;
    let frame = 0;
    let svgLit = -1;
    let nameRadius = -1;
    let lastLx = NaN;
    let lastNameWrite = 0;
    let lastLy = NaN;

    const render = () => {
      frame = 0;
      // The name lines animate in on load; keep geometry fresh until then.
      if (dirty || performance.now() - mountedAt < 1800) measure();

      const k = instant ? 1 : EASE;
      x += (targetX - x) * k;
      y += (targetY - y) * k;
      strength += (targetStrength - strength) * (instant ? 1 : 0.12);

      const sy = window.scrollY;
      const pageY = y + sy;
      const heroVisible = heroBottom > sy;

      // ZH mark: update only near it (or while fading out).
      const markStrength = heroVisible && near(svgBox, x, pageY) ? strength : 0;
      if (markStrength > 0.001 && inv) {
        const cy = y + (sy - invScroll); // viewport y in the cached CTM's frame
        gradient.setAttribute("cx", (inv.a * x + inv.c * cy + inv.e).toFixed(1));
        gradient.setAttribute("cy", (inv.b * x + inv.d * cy + inv.f).toFixed(1));
      }
      const lit = Math.round(markStrength * 100) / 100;
      if (lit !== svgLit) {
        litGroup.style.setProperty("--lit", String(lit));
        svgLit = lit;
      }

      // Name: local coordinates per line; untouched when the pointer is far away.
      const nameStrength = heroVisible && near(nameBox, x, pageY) ? strength : 0;
      const radius = Math.round(nameStrength * NAME_RADIUS_REM * rootPx);
      const lx = Math.round(x);
      const ly = Math.round(pageY);
      // Style writes only when a rounded value actually changes (each write = style recalc).
      // ~30 fps is plenty for a soft glow and halves style recalcs of the big heading.
      const now = performance.now();
      const due = now - lastNameWrite >= 32 || (radius === 0 && nameRadius !== 0);
      if (due && (radius > 0 || nameRadius !== 0) && (lx !== lastLx || ly !== lastLy || radius !== nameRadius)) {
        lastNameWrite = now;
        for (let i = 0; i < lines.length; i++) {
          lines[i].style.setProperty("--lx", `${Math.round(lx - lineLefts[i])}px`);
          lines[i].style.setProperty("--ly", `${Math.round(ly - lineTops[i])}px`);
          lines[i].style.setProperty("--lr", `${radius}px`);
        }
        nameRadius = radius;
        lastLx = lx;
        lastLy = ly;
      }

      const settled =
        Math.abs(targetX - x) < 0.5 && Math.abs(targetY - y) < 0.5 && Math.abs(targetStrength - strength) < 0.005;
      if (!settled) frame = requestAnimationFrame(render);
    };

    const kick = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!seen) {
        x = targetX;
        y = targetY;
        seen = true;
      }
      targetStrength = 1;
      // Far below the hero: nothing to light, don't even schedule a frame.
      if (heroBottom > window.scrollY || strength > 0.01) kick();
    };

    const onLeave = () => {
      targetStrength = 0;
      kick();
    };

    const onScroll = () => {
      if (strength > 0.01 && heroBottom > window.scrollY - REACH) kick();
    };

    const invalidate = () => {
      dirty = true;
    };

    const resizeObserver = new ResizeObserver(invalidate);
    resizeObserver.observe(hero);
    measure();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  return null;
}
