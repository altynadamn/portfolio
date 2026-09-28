import styles from "./HeroMark.module.css";

/*
 * Extruded wireframe "ZH", drawn as an oblique engineering projection.
 * Geometry is computed once at module load (server-side) — no runtime cost.
 *
 * Drafting conventions: visible edges solid, hidden edges dashed, chain centre
 * lines, dimension lines. A second, brighter copy of the geometry sits under a
 * radial mask (#zh-light); HeroLight moves that mask with the cursor, so edges
 * near the pointer illuminate.
 */

type Pt = readonly [number, number];

// Letter outlines, clockwise (y down), 100 × 120 units, stroke weight 24.
const Z: Pt[] = [
  [0, 0], [100, 0], [100, 24], [33, 96], [100, 96],
  [100, 120], [0, 120], [0, 96], [67, 24], [0, 24],
];
const H: Pt[] = [
  [0, 0], [24, 0], [24, 48], [76, 48], [76, 0], [100, 0],
  [100, 120], [76, 120], [76, 72], [24, 72], [24, 120], [0, 120],
];

const LETTER_GAP = 136;
const LETTERS: { outline: Pt[]; dx: number }[] = [
  { outline: Z, dx: 0 },
  { outline: H, dx: LETTER_GAP },
];

const DEPTH = 46;
const OFFSET: Pt = [DEPTH * 0.55, -DEPTH * 0.32];

const f = (v: number) => Number(v.toFixed(2));
const seg = (a: Pt, b: Pt) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;

const front: string[] = [];
const depthVisible: string[] = [];
const depthHidden: string[] = [];
const vertices: Pt[] = [];

for (const { outline, dx } of LETTERS) {
  const F = outline.map(([x, y]) => [x + dx, y] as const);
  const B = F.map(([x, y]) => [x + OFFSET[0], y + OFFSET[1]] as const);
  const n = F.length;

  // A side face is visible when its outward normal faces the extrusion direction.
  const faceVisible = F.map((p, i) => {
    const q = F[(i + 1) % n];
    return (q[1] - p[1]) * OFFSET[0] - (q[0] - p[0]) * OFFSET[1] > 0;
  });

  for (let i = 0; i < n; i++) {
    (faceVisible[i] ? depthVisible : depthHidden).push(seg(B[i], B[(i + 1) % n]));
    const connectorVisible = faceVisible[i] || faceVisible[(i - 1 + n) % n];
    (connectorVisible ? depthVisible : depthHidden).push(seg(F[i], B[i]));
  }

  front.push(`M${F.map(([x, y]) => `${x} ${y}`).join("L")}Z`);
  vertices.push(...F);
}

const FRONT = front.join("");
const DEPTH_VISIBLE = depthVisible.join("");
const DEPTH_HIDDEN = depthHidden.join("");

const MIN_Y = OFFSET[1];
const MAX_X = LETTER_GAP + 100 + OFFSET[0];
const DIM_TOP = MIN_Y - 16;
const DIM_RIGHT = MAX_X + 16;
const VIEW = { x: -38, y: -50, w: MAX_X + 76, h: 212 };

function Nodes({ className }: { className: string }) {
  return (
    <g className={className}>
      {vertices.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 1.25} y={y - 1.25} width="2.5" height="2.5" />
      ))}
    </g>
  );
}

export function HeroMark({ className }: { className?: string }) {
  return (
    <svg
      id="hero-mark"
      className={`${styles.mark} ${className ?? ""}`}
      viewBox={`${VIEW.x} ${VIEW.y} ${f(VIEW.w)} ${VIEW.h}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="zh-light" gradientUnits="userSpaceOnUse" cx="-999" cy="-999" r="78">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="zh-light-mask" maskUnits="userSpaceOnUse" x={VIEW.x} y={VIEW.y} width={f(VIEW.w)} height={VIEW.h}>
          <rect x={VIEW.x} y={VIEW.y} width={f(VIEW.w)} height={VIEW.h} fill="url(#zh-light)" />
        </mask>
      </defs>

      {/* Centre lines */}
      <path className={styles.centre} d={`M50 -42V152M${LETTER_GAP + 50} -42V152M-30 60H${f(MAX_X + 30)}`} />

      {/* Base drawing */}
      <path className={styles.hidden} d={DEPTH_HIDDEN} />
      <path className={styles.depth} d={DEPTH_VISIBLE} />
      <path className={styles.front} d={FRONT} />
      <Nodes className={styles.nodes} />

      {/* Illuminated copy, revealed around the cursor */}
      <g id="zh-lit" className={styles.lit} mask="url(#zh-light-mask)">
        <path className={styles.litHidden} d={DEPTH_HIDDEN} />
        <path className={styles.litDepth} d={DEPTH_VISIBLE} />
        <path className={styles.litFront} d={FRONT} />
        <Nodes className={styles.litNodes} />
      </g>

      {/* Horizontal dimension: overall width */}
      <g className={styles.dim}>
        <path d={`M0 ${f(DIM_TOP - 4)}V${f(DIM_TOP + 4)}M${f(MAX_X)} ${f(DIM_TOP - 4)}V${f(DIM_TOP + 4)}M0 ${f(DIM_TOP)}H${f(MAX_X)}`} />
        <path d={`M0 ${f(DIM_TOP + 6)}V-6M${f(MAX_X)} ${f(DIM_TOP + 6)}V${f(MIN_Y - 4)}`} className={styles.ext} />
        <text x={f(MAX_X / 2)} y={f(DIM_TOP - 5)} textAnchor="middle">
          ZH — 01
        </text>
      </g>

      {/* Vertical dimension: letter height */}
      <g className={styles.dim}>
        <path d={`M${f(DIM_RIGHT - 4)} 0H${f(DIM_RIGHT + 4)}M${f(DIM_RIGHT - 4)} 120H${f(DIM_RIGHT + 4)}M${f(DIM_RIGHT)} 0V120`} />
        <path d={`M${LETTER_GAP + 104} 120H${f(DIM_RIGHT + 6)}`} className={styles.ext} />
        <text x={f(DIM_RIGHT + 8)} y="60" transform={`rotate(90 ${f(DIM_RIGHT + 8)} 60)`} textAnchor="middle">
          120
        </text>
      </g>

      {/* Origin marker — the single static accent */}
      <rect className={styles.origin} x="-2" y="-2" width="4" height="4" />
      <path className={styles.leader} d="M-2 -2L-16 -16H-32" />
      <text className={styles.leaderLabel} x="-32" y="-19">
        0,0
      </text>
    </svg>
  );
}
