/*
 * Meaningful source streams for the ASCII field.
 * Characters are mostly NOT random: rows are composed from these streams and
 * scrambled; the cursor resolves them back to their true source text.
 *
 * Glyphs must exist in the shipped JetBrains Mono subsets (latin + greek):
 * no ∑ ∫ √ ∞ ≈ ≠ ∂.
 */

export type AsciiSource = "random" | "pi" | "binary" | "code" | "math" | "personal" | "literature";

export const NOISE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/\\<>_-+=*#:;.{}[]()";

export const MATH = "πλΔΣθαβγμ±×÷";

export const PI =
  "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196";

/** "ZHOMART", one byte per token. */
export const BINARY = ["01011010", "01101000", "01101111", "01101101", "01100001", "01110010", "01110100"];

export const CODE = [
  "const", "async", "await", "return", "yield", "import", "def", "class",
  "SELECT", "FROM", "WHERE", "JOIN", "INSERT", "UPDATE",
  "docker", "k3s", "postgres", "redis", "git", "commit", "merge",
  "OData", "HTTPS", "retry", "dedupe", "push", "idempotent", "cron",
];

export const PERSONAL = [
  "ZHOMART", "BEGALY", "ASTANA", "BUILD", "CREATE", "SOFTWARE", "SYSTEM",
  "BACKEND", "AUTOMATE", "DATA", "ENGINEERING", "SIGNAL", "PIPELINE",
];

/** Ada Lovelace, 1843 — public domain. */
export const LITERATURE =
  "THE ANALYTICAL ENGINE WEAVES ALGEBRAICAL PATTERNS JUST AS THE JACQUARD LOOM WEAVES FLOWERS AND LEAVES".split(" ");

/** Every glyph the field can draw; index 0 is reserved for "empty". */
export function buildGlyphSet(): string[] {
  const set = new Set<string>();
  const add = (s: string) => {
    for (const ch of s) if (ch !== " ") set.add(ch);
  };
  add(NOISE);
  add(MATH);
  add(PI);
  BINARY.forEach(add);
  CODE.forEach(add);
  PERSONAL.forEach(add);
  LITERATURE.forEach(add);
  return ["", ...set];
}

/** Deterministic PRNG so a given row always has the same content. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Weights = [AsciiSource, number][];

// Hidden regions: no visible boundaries, only tendencies.
const LEFT: Weights = [["pi", 0.45], ["math", 0.15], ["random", 0.25], ["code", 0.15]];
const CENTER: Weights = [["binary", 0.35], ["random", 0.35], ["personal", 0.15], ["math", 0.15]];
const RIGHT: Weights = [["code", 0.35], ["personal", 0.25], ["literature", 0.15], ["random", 0.25]];

export function pickSource(xFraction: number, rng: () => number): AsciiSource {
  const weights = xFraction < 0.3 ? LEFT : xFraction < 0.7 ? CENTER : RIGHT;
  let r = rng();
  for (const [source, w] of weights) {
    if ((r -= w) <= 0) return source;
  }
  return "random";
}

export function token(source: AsciiSource, rng: () => number, row: number, col: number): string {
  switch (source) {
    case "pi": {
      const start = Math.abs(row * 7 + col * 3) % (PI.length - 8);
      return PI.slice(start, start + 3 + Math.floor(rng() * 5));
    }
    case "binary":
      return BINARY[Math.abs(row + col) % BINARY.length];
    case "code":
      return CODE[Math.floor(rng() * CODE.length)];
    case "personal":
      return PERSONAL[Math.floor(rng() * PERSONAL.length)];
    case "literature": {
      const i = Math.abs(row) % LITERATURE.length;
      return LITERATURE.slice(i, i + 1 + Math.floor(rng() * 2)).join(" ");
    }
    case "math":
      return MATH[Math.floor(rng() * MATH.length)];
    default: {
      let s = "";
      const n = 1 + Math.floor(rng() * 2);
      for (let i = 0; i < n; i++) s += NOISE[Math.floor(rng() * NOISE.length)];
      return s;
    }
  }
}
