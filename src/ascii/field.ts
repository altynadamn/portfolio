import type { AsciiEngineApi } from "./bus";
import { sampleElementText, type FormationPoints } from "./formation";
import { NOISE, buildGlyphSet, mulberry32, pickSource, token } from "./sources";

/*
 * ASCII Information Field — Canvas 2D.
 *
 * Model: a full character grid that falls slowly downward. Each row is generated
 * deterministically from meaningful sources (π, binary ZHOMART, code, …).
 * Most characters are scrambled; the cursor resolves them to their true
 * source text, brightens them and pushes them slightly (cursor reveals
 * structure). Formations sample real DOM text and converge particles into it.
 *
 * Performance: glyphs pre-rendered into an atlas. The ambient field is cached
 * in an offscreen row layer (a ring of row strips): a row is rasterized once
 * when it enters, single cells only when they mutate. Each frame just blits
 * ~50 row strips and redraws the few cells under the cursor/pulses — instead
 * of thousands of glyph draws. Typed arrays, no per-frame allocation,
 * frame-rate capped, paused when hidden, DPR capped.
 */

interface Quality {
  font: number;
  cellW: number;
  cellH: number;
  fps: number;
  dpr: number;
  density: number;
  radius: number;
  coarse: boolean;
  mutation: number;
}

function pickQuality(): Quality {
  const w = window.innerWidth;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const constrained = (navigator.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory !== undefined && nav.deviceMemory <= 4);
  if (w < 768 || coarse) {
    return { font: 11, cellW: 12, cellH: 20, fps: 24, dpr: Math.min(devicePixelRatio, 1.25), density: 0.6, radius: 120, coarse, mutation: 0.0015 };
  }
  if (constrained) {
    return { font: 11, cellW: 12, cellH: 20, fps: 24, dpr: Math.min(devicePixelRatio, 1.25), density: 0.78, radius: 145, coarse, mutation: 0.0025 };
  }
  // The field is faint background texture: DPR 1.5 is visually indistinguishable
  // from 2 here and cuts fill-rate by ~44%.
  return { font: 12, cellW: 11, cellH: 19, fps: 30, dpr: Math.min(devicePixelRatio, 1.5), density: 1, radius: 170, coarse, mutation: 0.004 };
}

interface Formation {
  element: HTMLElement;
  points: FormationPoints;
  mode: "form" | "dissolve";
  start: number;
  offX: Float32Array;
  offY: Float32Array;
  delay: Float32Array;
  revealed: boolean;
  left: number;
  top: number;
  /** window.scrollY at capture — formations follow the page while scrolling. */
  scrollY: number;
  sourceSlots: Uint32Array;
}

interface Pulse {
  x: number;
  y: number;
  start: number;
}

const DRIFT_PX_PER_SEC = 22;
const PARALLAX = 0.18;
const FORM_TRAVEL = 650;
const FORM_REVEAL = 700;
const FORM_FADE_START = 1000;
const FORM_END = 1600;
const DISSOLVE_END = 1100;
const PULSE_LIFE = 650;

const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

/** Upper bound of cells influenced by the cursor + pulses in one frame. */
const MAX_LIT = 4096;

export class AsciiFieldEngine implements AsciiEngineApi {
  private ctx: CanvasRenderingContext2D;
  private atlas: HTMLCanvasElement;
  /** Cached ambient field: row slot s occupies y ∈ [s·cellH, (s+1)·cellH). */
  private layer: HTMLCanvasElement;
  private layerCtx: CanvasRenderingContext2D;

  // Per-frame lit-cell list (preallocated; indices into the cell arrays).
  private litStamp = new Uint32Array(0);
  private litSlot = new Int32Array(0);
  private readonly litIdx = new Int32Array(MAX_LIT);
  private readonly litT = new Float32Array(MAX_LIT);
  private readonly litDX = new Float32Array(MAX_LIT);
  private readonly litDY = new Float32Array(MAX_LIT);
  private readonly litX = new Float32Array(MAX_LIT);
  private readonly litY = new Float32Array(MAX_LIT);
  private litCount = 0;
  private stamp = 0;
  // Screen placement of each visible row (for cursor math), by screen row r.
  private rowY = new Float32Array(0);
  private rowX = new Float32Array(0);
  private rowSlot = new Int32Array(0);
  private readonly glyphs = buildGlyphSet();
  private readonly glyphIndex = new Map(this.glyphs.map((g, i) => [g, i] as const));
  /** Background text (The Grand Inquisitor), read line after line. Empty = source mix. */
  private book = "";
  private readonly noiseCodes = Uint16Array.from([...NOISE].map((ch) => this.glyphs.indexOf(ch)));

  private q: Quality = pickQuality();
  private width = 0;
  private height = 0;
  private cols = 0;
  private rows = 0;
  private slotW = 0;
  private slotH = 0;

  private rowAbs = new Int32Array(0);
  private trueCode = new Uint16Array(0);
  private curCode = new Uint16Array(0);
  private baseAlpha = new Float32Array(0);
  private scrambled = new Uint8Array(0);
  private captured = new Uint8Array(0);

  private drift = 0;
  private lastTime = 0;
  private lastDraw = 0;
  private frameHandle = 0;
  private running = false;
  private frameCount = 0;

  private targetX = -9999;
  private targetY = -9999;
  private px = -9999;
  private py = -9999;
  private strength = 0;
  private pointerActive = false;
  private lastPointerTime = 0;

  private formations: Formation[] = [];
  private pulses: Pulse[] = [];
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private resizeTimer = 0;

  private snapToDevicePixel(value: number) {
    const dpr = this.q.dpr;
    return Math.round(value * dpr) / dpr;
  }

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: { fontFamily: string; fg: string; accent: string },
  ) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;
    this.atlas = document.createElement("canvas");
    this.layer = document.createElement("canvas");
    const layerCtx = this.layer.getContext("2d", { alpha: true });
    if (!layerCtx) throw new Error("Canvas 2D unavailable");
    this.layerCtx = layerCtx;
  }

  async init() {
    try {
      // Separate chunk: ~40 KB of text never blocks the first render.
      const { GRAND_INQUISITOR } = await import("./literature");
      this.book = GRAND_INQUISITOR;
      for (const ch of this.book) {
        if (ch !== " " && !this.glyphIndex.has(ch)) {
          this.glyphIndex.set(ch, this.glyphs.length);
          this.glyphs.push(ch);
        }
      }
    } catch {
      this.book = ""; // fall back to the meaningful source mix
    }
    try {
      await document.fonts.load(`${this.q.font}px ${this.options.fontFamily}`, "Zπ0“—é");
    } catch {
      // Fallback font is acceptable.
    }
    this.layout();
    window.addEventListener("resize", this.onResize, { passive: true });
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("blur", this.onPointerLeave);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerdown", this.onPointerMove);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("blur", this.onPointerLeave);
    window.removeEventListener("scroll", this.onScroll);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  start() {
    if (this.running || document.hidden) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frameHandle = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameHandle);
  }

  /* ── Public API (bus) ─────────────────────────────────────────── */

  form(element: HTMLElement): boolean {
    if (this.reducedMotion) return false;
    const points = sampleElementText(element, this.glyphIndex, this.noiseCodes[0], 700);
    if (!points || points.count === 0) return false;
    const formation = this.captureFormation(element, points, "form");
    if (!formation) return false;
    this.replaceFormation(element, formation);
    element.dataset.formationState = "pending";
    // Never leave content hidden if the loop is paused (e.g. background tab).
    window.setTimeout(() => {
      if (element.dataset.formationState === "pending") element.dataset.formationState = "formed";
    }, FORM_END + 400);
    this.ensureRunning();
    return true;
  }

  dissolve(element: HTMLElement): boolean {
    if (this.reducedMotion) return false;
    const active = this.formations.find((formation) => formation.element === element);
    if (active) {
      active.mode = "dissolve";
      active.start = performance.now();
      active.revealed = true;
      element.dataset.formationState = "dissolving";
      this.ensureRunning();
      return true;
    }
    const points = sampleElementText(element, this.glyphIndex, this.noiseCodes[0], 700);
    if (!points || points.count === 0) return false;
    const formation = this.captureFormation(element, points, "dissolve");
    if (!formation) return false;
    this.replaceFormation(element, formation);
    element.dataset.formationState = "dissolving";
    this.ensureRunning();
    return true;
  }

  private replaceFormation(element: HTMLElement, next: Formation) {
    for (let i = this.formations.length - 1; i >= 0; i--) {
      const previous = this.formations[i];
      if (previous.element !== element) continue;
      this.releaseSources(previous);
      this.formations.splice(i, 1);
    }
    this.formations.push(next);
  }

  private releaseSources(formation: Formation) {
    let previousRow = -1;
    for (const slot of formation.sourceSlots) {
      if (slot >= this.captured.length) continue; // stale after a resize
      this.captured[slot] = 0;
      const row = (slot / this.cols) | 0;
      if (previousRow >= 0 && row !== previousRow) this.renderRow(previousRow);
      previousRow = row;
    }
    if (previousRow >= 0) this.renderRow(previousRow);
  }

  /**
   * Capture nearby live field characters for the target. The short local
   * search keeps travel bounded and returns these same grid particles when
   * the text dissolves.
   */
  private captureFormation(element: HTMLElement, sampled: FormationPoints, mode: Formation["mode"]): Formation | null {
    const rect = element.getBoundingClientRect();
    const { cellW, cellH } = this.q;
    const pos = window.scrollY * PARALLAX - this.drift;
    const firstAbs = Math.floor(pos / cellH);
    const frac = pos - firstAbs * cellH;
    const candidates: { slot: number; x: number; y: number }[] = [];
    const margin = 180;

    for (let r = 0; r < this.rows; r++) {
      const abs = firstAbs + r;
      const row = ((abs % this.rows) + this.rows) % this.rows;
      if (this.rowAbs[row] !== abs) this.fillRow(row, abs);
      const base = row * this.cols;
      const y = r * cellH - frac + Math.sin(performance.now() * 0.00012 + abs * 0.31) * 1.5;
      const rowDrift = Math.sin(performance.now() * 0.00022 + abs * 1.71) * 1.6;
      if (y < rect.top - margin || y > rect.bottom + margin) continue;
      for (let c = 0; c < this.cols; c++) {
        const slot = base + c;
        if (this.trueCode[slot] === 0 || this.captured[slot]) continue;
        const x = c * cellW + rowDrift;
        if (x >= rect.left - margin && x <= rect.right + margin) candidates.push({ slot, x, y });
      }
    }
    if (candidates.length === 0) return null;

    const count = Math.min(sampled.count, candidates.length);
    const points: FormationPoints = {
      count,
      x: sampled.x.subarray(0, count),
      y: sampled.y.subarray(0, count),
      code: sampled.code.subarray(0, count),
      step: sampled.step,
    };
    const offX = new Float32Array(count);
    const offY = new Float32Array(count);
    const delay = new Float32Array(count);
    const sourceSlots = new Uint32Array(count);
    const stride = candidates.length / count;
    let previousRow = -1;
    for (let i = 0; i < count; i++) {
      const source = candidates[Math.floor((i + 0.5) * stride)];
      sourceSlots[i] = source.slot;
      this.captured[source.slot] = 1;
      const row = (source.slot / this.cols) | 0;
      if (previousRow >= 0 && row !== previousRow) this.renderRow(previousRow);
      previousRow = row;
      offX[i] = source.x - (rect.left + points.x[i]);
      offY[i] = source.y - (rect.top + points.y[i]);
      delay[i] = mode === "form" ? Math.random() * 200 : Math.random() * 180;
    }
    if (previousRow >= 0) this.renderRow(previousRow);

    return {
      element: element,
      points,
      mode,
      start: performance.now(),
      offX,
      offY,
      delay,
      revealed: mode === "dissolve",
      left: rect.left,
      top: rect.top,
      scrollY: window.scrollY,
      sourceSlots,
    };
  }

  pulse(x: number, y: number) {
    this.pulses.push({ x, y, start: performance.now() });
    if (this.pulses.length > 6) this.pulses.shift();
    this.ensureRunning();
  }

  /* ── Layout ───────────────────────────────────────────────────── */

  private layout() {
    for (const formation of this.formations) {
      this.releaseSources(formation);
      if (formation.element.dataset.formationState === "pending") formation.element.dataset.formationState = "formed";
      else if (formation.element.dataset.formationState === "dissolving") delete formation.element.dataset.formationState;
    }
    this.formations.length = 0;
    this.q = pickQuality();
    const { cellW, cellH, dpr, font } = this.q;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;

    this.cols = Math.ceil(this.width / cellW) + 1;
    this.rows = Math.ceil(this.height / cellH) + 2;
    const cells = this.cols * this.rows;
    this.rowAbs = new Int32Array(this.rows).fill(-2147483648);
    this.trueCode = new Uint16Array(cells);
    this.curCode = new Uint16Array(cells);
    this.baseAlpha = new Float32Array(cells);
    this.scrambled = new Uint8Array(cells);
    this.captured = new Uint8Array(cells);
    this.litStamp = new Uint32Array(cells);
    this.litSlot = new Int32Array(cells);
    this.rowY = new Float32Array(this.rows);
    this.rowX = new Float32Array(this.rows);
    this.rowSlot = new Int32Array(this.rows);

    // Row layer (every row gets re-rasterized on the next draw via rowAbs reset).
    this.layer.width = Math.ceil(this.cols * cellW * dpr);
    this.layer.height = Math.ceil(this.rows * cellH * dpr);
    this.layerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Glyph atlas: row 0 = foreground, row 1 = accent.
    this.slotW = Math.ceil(cellW * dpr);
    this.slotH = Math.ceil(cellH * dpr);
    this.atlas.width = this.slotW * this.glyphs.length;
    this.atlas.height = this.slotH * 2;
    const a = this.atlas.getContext("2d");
    if (!a) return;
    a.clearRect(0, 0, this.atlas.width, this.atlas.height);
    a.font = `${font * dpr}px ${this.options.fontFamily}`;
    a.textAlign = "center";
    a.textBaseline = "middle";
    for (let i = 1; i < this.glyphs.length; i++) {
      const cx = i * this.slotW + this.slotW / 2;
      a.fillStyle = this.options.fg;
      a.fillText(this.glyphs[i], cx, this.slotH / 2);
      a.fillStyle = this.options.accent;
      a.fillText(this.glyphs[i], cx, this.slotH * 1.5);
    }
  }

  private fillRow(slot: number, abs: number) {
    const rng = mulberry32(Math.imul(abs, 2654435761) ^ 0x9e3779b9);
    const base = slot * this.cols;
    const cols = this.cols;
    this.trueCode.fill(0, base, base + cols);
    this.rowAbs[slot] = abs;

    if (this.book) {
      const text = this.book;
      const len = text.length;
      let at = (((abs * cols) % len) + len) % len;
      let wordAlpha = 0.03 + rng() * 0.07;
      for (let c = 0; c < cols; c++, at = at + 1 === len ? 0 : at + 1) {
        const i = base + c;
        this.captured[i] = 0;
        const ch = text[at];
        if (ch === " ") {
          wordAlpha = 0.03 + rng() * 0.07; // each word gets its own faint tone
          continue;
        }
        const code = this.glyphIndex.get(ch) ?? 0;
        this.trueCode[i] = code;
        this.baseAlpha[i] = wordAlpha * (0.85 + rng() * 0.3);
        this.scrambled[i] = rng() < 0.55 ? 1 : 0;
        this.curCode[i] = this.scrambled[i] ? this.noiseCodes[Math.floor(rng() * this.noiseCodes.length)] : code;
      }
      this.renderRow(slot);
      return;
    }

    // Fallback: a continuous wall of source tokens separated by one or two spaces.
    // Rare quieter rows keep it from reading as a solid block; lower
    // density (mobile) opens it up.
    const loose = this.q.density < 1;
    const quiet = rng() < (loose ? 0.22 : 0.05);
    let c = Math.floor(rng() * 3);
    while (c < cols) {
      const source = pickSource(c / cols, rng);
      const text = token(source, rng, abs, c);
      const tokenAlpha = 0.03 + rng() * 0.07;
      for (let k = 0; k < text.length && c < cols; k++, c++) {
        const code = this.glyphIndex.get(text[k]) ?? 0;
        const i = base + c;
        this.captured[i] = 0;
        this.trueCode[i] = code;
        this.baseAlpha[i] = tokenAlpha * (0.8 + rng() * 0.4);
        this.scrambled[i] = rng() < 0.6 ? 1 : 0;
        this.curCode[i] = this.scrambled[i] ? this.noiseCodes[Math.floor(rng() * this.noiseCodes.length)] : code;
      }
      c += quiet ? 6 + Math.floor(rng() * 14) : loose ? 2 + Math.floor(rng() * 3) : 1 + (rng() < 0.35 ? 1 : 0);
    }
    this.renderRow(slot);
  }

  /** Rasterize one row slot into the cached layer. */
  private renderRow(slot: number) {
    const { layerCtx: l, atlas, slotW, slotH, cols } = this;
    const { cellW, cellH } = this.q;
    const y = slot * cellH;
    const base = slot * cols;
    l.clearRect(0, y, cols * cellW, cellH);
    for (let c = 0; c < cols; c++) {
      const i = base + c;
      const trueCode = this.trueCode[i];
      if (trueCode === 0 || this.captured[i]) continue;
      l.globalAlpha = this.baseAlpha[i];
      l.drawImage(atlas, (this.scrambled[i] ? this.curCode[i] : trueCode) * slotW, 0, slotW, slotH, c * cellW, y, cellW, cellH);
    }
    l.globalAlpha = 1;
  }

  /** Re-rasterize a single cell in the cached layer (after a mutation). */
  private renderCell(i: number) {
    const { layerCtx: l, atlas, slotW, slotH, cols } = this;
    const { cellW, cellH } = this.q;
    const x = (i % cols) * cellW;
    const y = ((i / cols) | 0) * cellH;
    l.clearRect(x, y, cellW, cellH);
    if (this.trueCode[i] === 0 || this.captured[i]) return;
    l.globalAlpha = this.baseAlpha[i];
    l.drawImage(atlas, (this.scrambled[i] ? this.curCode[i] : this.trueCode[i]) * slotW, 0, slotW, slotH, x, y, cellW, cellH);
    l.globalAlpha = 1;
  }

  /* ── Events ───────────────────────────────────────────────────── */

  private onResize = () => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      // Ignore mobile URL-bar height jitter.
      if (Math.abs(window.innerWidth - this.width) < 1 && Math.abs(window.innerHeight - this.height) < 120) return;
      this.layout();
      this.ensureRunning();
    }, 150);
  };

  private onPointerMove = (e: PointerEvent) => {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
    if (!this.pointerActive && this.strength < 0.01) {
      this.px = this.targetX;
      this.py = this.targetY;
    }
    this.pointerActive = true;
    this.lastPointerTime = performance.now();
    this.ensureRunning();
  };

  private onPointerLeave = () => {
    this.pointerActive = false;
    this.ensureRunning();
  };

  private onScroll = () => {
    if (this.reducedMotion) this.ensureRunning();
  };

  private onVisibility = () => {
    if (document.hidden) this.stop();
    else this.start();
  };

  private ensureRunning() {
    if (!this.running) this.start();
  }

  /* ── Frame ────────────────────────────────────────────────────── */

  private frame = (now: number) => {
    if (!this.running) return;
    this.frameHandle = requestAnimationFrame(this.frame);

    const hasTransient = this.formations.length > 0 || this.pulses.length > 0;
    // Keep formations and hover pulses fluid without rendering at 90/120/144Hz.
    // Ambient movement uses the lower device-specific cap.
    const interval = 1000 / (hasTransient ? Math.min(60, this.q.fps * 2) : this.q.fps);
    if (now - this.lastDraw < interval) return;
    this.lastDraw = now;

    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.frameCount++;

    // Touch: the light fades out shortly after the finger lifts.
    if (this.pointerActive && this.q.coarse && now - this.lastPointerTime > 900) {
      this.pointerActive = false;
    }

    const follow = this.reducedMotion ? 1 : 1 - Math.pow(0.001, dt);
    this.px += (this.targetX - this.px) * follow;
    this.py += (this.targetY - this.py) * follow;
    this.strength += ((this.pointerActive ? 1 : 0) - this.strength) * Math.min(1, dt * 5);

    if (!this.reducedMotion) {
      this.drift += DRIFT_PX_PER_SEC * dt;
      this.mutate();
    }

    this.draw(now);

    // Reduced motion: render only while something is changing.
    if (this.reducedMotion && !hasTransient && Math.abs((this.pointerActive ? 1 : 0) - this.strength) < 0.01) {
      this.stop();
    }
  };

  private mutate() {
    const cells = this.cols * this.rows;
    const n = Math.ceil(cells * this.q.mutation);
    for (let k = 0; k < n; k++) {
      const i = (Math.random() * cells) | 0;
      if (this.trueCode[i] === 0) continue;
      if (this.scrambled[i]) {
        if (Math.random() < 0.4) {
          this.scrambled[i] = 0;
          this.curCode[i] = this.trueCode[i];
        } else {
          this.curCode[i] = this.noiseCodes[(Math.random() * this.noiseCodes.length) | 0];
        }
      } else if (Math.random() < 0.3) {
        this.scrambled[i] = 1;
        this.curCode[i] = this.noiseCodes[(Math.random() * this.noiseCodes.length) | 0];
      } else {
        continue;
      }
      this.renderCell(i);
    }
  }

  private draw(now: number) {
    const { ctx, atlas, slotW, slotH, cols, rows } = this;
    const { cellW, cellH, radius } = this.q;
    ctx.clearRect(0, 0, this.width, this.height);

    // Field falls down over time; page scroll adds a slight parallax.
    const pos = window.scrollY * PARALLAX - this.drift;
    const firstAbs = Math.floor(pos / cellH);
    const frac = pos - firstAbs * cellH;

    for (let r = 0; r < rows; r++) {
      const abs = firstAbs + r;
      const slot = ((abs % rows) + rows) % rows;
      if (this.rowAbs[slot] !== abs) this.fillRow(slot, abs);
    }

    // Live pulses (hover disturbances).
    // Compact in place: the render loop should not allocate a new pulse array.
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      if (now - this.pulses[i].start >= PULSE_LIFE) this.pulses.splice(i, 1);
    }
    const dpr = this.q.dpr;
    const stripW = cols * cellW;

    // 1. Blit cached row strips: one drawImage per row instead of per glyph.
    ctx.globalAlpha = 1;
    for (let r = 0; r < rows; r++) {
      const abs = firstAbs + r;
      const slot = ((abs % rows) + rows) % rows;
      const y = this.snapToDevicePixel(r * cellH - frac + Math.sin(now * 0.00012 + abs * 0.31) * 1.5);
      const x = this.snapToDevicePixel(Math.sin(now * 0.00022 + abs * 1.71) * 1.6);
      this.rowY[r] = y;
      this.rowX[r] = x;
      this.rowSlot[r] = slot;
      ctx.drawImage(this.layer, 0, slot * cellH * dpr, stripW * dpr, cellH * dpr, x, y, stripW, cellH);
    }

    // 2. Cells under the cursor / pulses: collect, erase, redraw lit.
    this.litCount = 0;
    this.stamp = (this.stamp + 1) >>> 0 || 1;
    if (this.strength > 0.01) this.collect(this.px, this.py, radius, this.strength);
    for (let k = 0; k < this.pulses.length; k++) {
      const p = this.pulses[k];
      this.collect(p.x, p.y, 90, (1 - (now - p.start) / PULSE_LIFE) * 0.8);
    }

    const n = this.litCount;
    if (n > 0) {
      for (let k = 0; k < n; k++) ctx.clearRect(this.litX[k], this.litY[k], cellW, cellH);
      for (let k = 0; k < n; k++) {
        const i = this.litIdx[k];
        const t = this.litT[k];
        const trueCode = this.trueCode[i];
        // Periphery shimmers, the core resolves to the true source text.
        let code = this.scrambled[i] ? this.curCode[i] : trueCode;
        if (t > 0.3) code = trueCode;
        else if (((i + this.frameCount) & 7) === 0) code = this.noiseCodes[(i * 13 + this.frameCount) % this.noiseCodes.length];
        const dx = this.litDX[k];
        const dy = this.litDY[k];
        ctx.globalAlpha = Math.min(0.95, this.baseAlpha[i] + t * t * 0.85);
        ctx.drawImage(
          atlas,
          code * slotW,
          t > 0.66 ? slotH : 0,
          slotW,
          slotH,
          this.litX[k] + dx * t * 7,
          this.litY[k] + dy * t * 7,
          cellW,
          cellH,
        );
      }
    }

    if (this.formations.length) this.drawFormations(now);
    ctx.globalAlpha = 1;
  }

  /** Add live cells within `radius` of (cx, cy) to the lit list, keeping the max influence. */
  private collect(cx: number, cy: number, radius: number, strength: number) {
    if (strength <= 0.01) return;
    const { cols, rows } = this;
    const { cellW, cellH } = this.q;
    const r2 = radius * radius;
    const cMin = Math.max(0, Math.floor((cx - radius) / cellW) - 1);
    const cMax = Math.min(cols - 1, Math.ceil((cx + radius) / cellW) + 1);

    for (let r = 0; r < rows; r++) {
      const y = this.rowY[r];
      if (y + cellH < cy - radius || y > cy + radius) continue;
      const base = this.rowSlot[r] * cols;
      const xOff = this.rowX[r];
      for (let c = cMin; c <= cMax; c++) {
        const i = base + c;
        if (this.trueCode[i] === 0 || this.captured[i]) continue;
        const x = c * cellW + xOff;
        const dx = x - cx;
        const dy = y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 >= r2) continue;
        const distance = Math.sqrt(d2);
        const t = smooth(1 - distance / radius) * strength;
        if (t <= 0.004) continue;

        if (this.litStamp[i] === this.stamp) {
          const k = this.litSlot[i];
          if (t > this.litT[k]) {
            this.litT[k] = t;
            const inverseDistance = 1 / (distance || 1);
            this.litDX[k] = dx * inverseDistance;
            this.litDY[k] = dy * inverseDistance;
          }
          continue;
        }
        if (this.litCount >= MAX_LIT) return;
        const k = this.litCount++;
        this.litStamp[i] = this.stamp;
        this.litSlot[i] = k;
        this.litIdx[k] = i;
        this.litT[k] = t;
        const inverseDistance = 1 / (distance || 1);
        this.litDX[k] = dx * inverseDistance;
        this.litDY[k] = dy * inverseDistance;
        this.litX[k] = x;
        this.litY[k] = y;
      }
    }
  }

  private drawFormations(now: number) {
    const { ctx, atlas, slotW, slotH } = this;
    const noise = this.noiseCodes;

    for (let fi = this.formations.length - 1; fi >= 0; fi--) {
      const f = this.formations[fi];
      const t = now - f.start;
      const end = f.mode === "form" ? FORM_END : DISSOLVE_END;
      if (t > end) {
        if (f.mode === "form") f.element.dataset.formationState = "formed";
        else
          window.setTimeout(() => {
            if (f.element.dataset.formationState === "dissolving") delete f.element.dataset.formationState;
          }, 400);
        this.formations.splice(fi, 1);
        this.releaseSources(f);
        continue;
      }
      // Follow the element while the page scrolls (no layout read per frame).
      const top = f.top - (window.scrollY - f.scrollY);
      const pointBottom = f.points.count ? f.points.y[f.points.count - 1] : 0;
      if (top + pointBottom < -200 || top > this.height + 200) continue;

      if (f.mode === "form" && !f.revealed && t > FORM_REVEAL) {
        f.revealed = true;
        f.element.dataset.formationState = "formed";
      }

      const { x, y, code, count, step } = f.points;
      const gw = step * 1.05;
      const gh = step * 1.75;
      const globalFade = f.mode === "form" && t > FORM_FADE_START ? 1 - (t - FORM_FADE_START) / (FORM_END - FORM_FADE_START) : 1;

      for (let i = 0; i < count; i++) {
        const local = Math.max(0, t - f.delay[i]);
        let gx: number;
        let gy: number;
        let alpha: number;
        let glyph: number;
        let accent = false;

        if (f.mode === "form") {
          const p = Math.min(1, local / FORM_TRAVEL);
          const e = easeOut(p);
          gx = f.left + x[i] + f.offX[i] * (1 - e);
          gy = top + y[i] + f.offY[i] * (1 - e);
          alpha = Math.min(1, local / 260) * (p < 1 ? 0.55 : 0.95) * globalFade;
          glyph = p < 1 ? noise[(i * 7 + this.frameCount) % noise.length] : code[i];
          accent = p >= 1 && t < FORM_REVEAL + 250;
        } else {
          const p = Math.min(1, local / (DISSOLVE_END - 220));
          const e = easeOut(p);
          gx = f.left + x[i] + f.offX[i] * e;
          gy = top + y[i] + f.offY[i] * e;
          alpha = 0.9 * (1 - p);
          glyph = p < 0.15 ? code[i] : noise[(i * 5 + this.frameCount) % noise.length];
        }

        if (alpha <= 0.01) continue;
        ctx.globalAlpha = alpha;
        ctx.drawImage(atlas, glyph * slotW, accent ? slotH : 0, slotW, slotH, gx - gw / 2, gy - gh / 2, gw, gh);
      }
    }
  }
}
