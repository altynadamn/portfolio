/*
 * Target-text rasterization for formations:
 * element text → per-word ranges → offscreen canvas → sampled target points.
 *
 * Words are drawn at their real DOM positions and horizontally scaled to the
 * DOM width, so condensed/variable fonts and letter-spacing still line up
 * with the HTML that fades in afterwards.
 */

export interface FormationPoints {
  count: number;
  /** Target positions relative to the element's top-left, CSS px. */
  x: Float32Array;
  y: Float32Array;
  /** Glyph index each point locks to (letters of the word it belongs to). */
  code: Uint16Array;
  /** Sampling step in CSS px — also the drawn glyph size. */
  step: number;
}

interface WordBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  word: string;
}

export function sampleElementText(
  element: HTMLElement,
  glyphIndex: Map<string, number>,
  fallbackCode: number,
  maxPoints = 3200,
): FormationPoints | null {
  const rect = element.getBoundingClientRect();
  const w = Math.ceil(rect.width);
  const h = Math.ceil(rect.height);
  if (w < 4 || h < 4) return null;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";

  const words: WordBox[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    const text = node.textContent ?? "";
    if (!parent || !text.trim() || parent.closest(".sr-only, [aria-hidden='true']")) continue;

    const style = getComputedStyle(parent);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const upper = style.textTransform === "uppercase";

    for (const match of text.matchAll(/\S+/g)) {
      const start = match.index ?? 0;
      range.setStart(node, start);
      range.setEnd(node, start + match[0].length);
      const r = range.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;

      const word = upper ? match[0].toUpperCase() : match[0];
      const m = ctx.measureText(word);
      const ascent = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent;
      const descent = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent;
      const x = r.left - rect.left;
      const baseline = r.top - rect.top + ascent * (r.height / Math.max(1, ascent + descent));

      ctx.save();
      ctx.translate(x, baseline);
      ctx.scale(r.width / Math.max(1, m.width), 1);
      ctx.fillText(word, 0, 0);
      ctx.restore();

      words.push({ x0: x, x1: x + r.width, y0: r.top - rect.top, y1: r.bottom - rect.top, word });
    }
  }
  if (words.length === 0) return null;

  const data = ctx.getImageData(0, 0, w, h).data;

  // Pick a sampling step that keeps the point budget.
  let filled = 0;
  for (let i = 3; i < data.length; i += 16) if (data[i] > 110) filled++;
  filled *= 4;
  const step = Math.max(4, Math.ceil(Math.sqrt(filled / maxPoints)));
  // Samples are visited top-to-bottom. Index words by scan row so each
  // particle checks only nearby text boxes instead of searching the whole
  // paragraph (which used to cost O(samples * words)).
  const rowCount = Math.ceil(h / step);
  const wordsByRow: WordBox[][] = Array.from({ length: rowCount }, () => []);
  for (const word of words) {
    const firstRow = Math.max(0, Math.floor(word.y0 / step));
    const lastRow = Math.min(rowCount - 1, Math.floor(word.y1 / step));
    for (let row = firstRow; row <= lastRow; row++) wordsByRow[row].push(word);
  }

  const xs: number[] = [];
  const ys: number[] = [];
  const codes: number[] = [];
  for (let y = step / 2; y < h; y += step) {
    const rowWords = wordsByRow[Math.floor(y / step)];
    for (let x = step / 2; x < w; x += step) {
      if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] <= 110) continue;
      xs.push(x);
      ys.push(y);
      let box: WordBox | undefined;
      for (let i = 0; i < rowWords.length; i++) {
        const candidate = rowWords[i];
        if (x >= candidate.x0 && x <= candidate.x1 && y >= candidate.y0 && y <= candidate.y1) {
          box = candidate;
          break;
        }
      }
      const ch = box ? box.word[Math.min(box.word.length - 1, Math.floor(((x - box.x0) / (box.x1 - box.x0)) * box.word.length))] : "";
      codes.push(glyphIndex.get(ch) ?? glyphIndex.get(ch.toUpperCase()) ?? fallbackCode);
    }
  }

  return {
    count: xs.length,
    x: Float32Array.from(xs),
    y: Float32Array.from(ys),
    code: Uint16Array.from(codes),
    step,
  };
}
