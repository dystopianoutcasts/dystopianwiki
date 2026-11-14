/**
 * Small details from Boone's story (DystopianOutcasts repo, DOCS/LORE/Boone.md): a strafing run on
 * Longest survivors, his dog tag on About, a cracked lens on the live map (owner, 2026-11-14:
 * "lean into the Boone mythology").
 *
 * All three are pictures only: aria-hidden, never under text, never in the way of a click or a
 * drag. They hold still for prefers-reduced-motion. Colors come from boone-details.css, so the
 * light theme can retune them; HomePage imports that stylesheet, so this file stays loadable in
 * node:test. Hook-free, so staticMarkup can render them.
 */

type Point = [number, number];

/** A torn metal rim around a bullet hole: points alternate between two radii, with a fixed jitter. */
const RIM_POINTS: string = (() => {
  const jitter = [0.4, -0.6, 0.9, -0.2, 0.5, -0.8, 0.3, 0.7, -0.5, 0.1, -0.3, 0.6, -0.7, 0.2];
  return jitter
    .map((j, i) => {
      const angle = (i / jitter.length) * Math.PI * 2;
      const r = (i % 2 === 0 ? 8.6 : 6.6) + j;
      return `${(Math.cos(angle) * r).toFixed(2)},${(Math.sin(angle) * r).toFixed(2)}`;
    })
    .join(' ');
})();

/** Short cracks running out from the rim: [angle in degrees, length]. */
const HOLE_CRACKS: [number, number][] = [[18, 5.5], [95, 4], [160, 6.5], [230, 3.5], [300, 5]];

/**
 * One burst from wing guns: five holes in a line with a little scatter, top right to bottom left.
 * [x, y, scale, rotation]. Holes after the second are hidden on narrow screens (boone-details.css).
 */
const STRAFE: [number, number, number, number][] = [
  [176, 34, 1.6, 10],
  [146, 96, 1.35, 75],
  [129, 154, 1.75, 140],
  [97, 216, 1.45, 205],
  [78, 278, 1.6, 265],
];

export function StrafingRun() {
  return (
    <svg className="boone-strafe" viewBox="0 0 220 320" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="boone-strafe-scorch">
          <stop offset="0" className="boone-strafe__scorch-in" />
          <stop offset="1" className="boone-strafe__scorch-out" />
        </radialGradient>
        <g id="boone-strafe-hole">
          <circle r="15" fill="url(#boone-strafe-scorch)" />
          <polygon className="boone-strafe__rim" points={RIM_POINTS} />
          {HOLE_CRACKS.map(([deg, len]) => {
            const a = (deg * Math.PI) / 180;
            const x1 = Math.cos(a) * 8;
            const y1 = Math.sin(a) * 8;
            return (
              <line
                key={deg}
                className="boone-strafe__crack"
                x1={x1.toFixed(2)}
                y1={y1.toFixed(2)}
                x2={(x1 + Math.cos(a) * len).toFixed(2)}
                y2={(y1 + Math.sin(a) * len).toFixed(2)}
              />
            );
          })}
          <circle className="boone-strafe__core" r="5.4" />
          <path className="boone-strafe__glint" d="M -3.8 2.6 A 4.6 4.6 0 0 0 3.8 2.6" />
        </g>
      </defs>
      {STRAFE.map(([x, y, s, r], i) => (
        <use
          key={i}
          href="#boone-strafe-hole"
          className={i < 2 ? 'boone-strafe__hole' : 'boone-strafe__hole boone-strafe__hole--extra'}
          transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
        />
      ))}
    </svg>
  );
}

/** The text stamped on Boone's tag, top to bottom (PROPOSED in Boone.md until the owner rules). */
export const DOG_TAG_LINES = ['BOONE', 'RINGTAIL', 'ALONE. LIVING.', 'SURVIVING.'] as const;

/** Bead centers along a quadratic curve from a to b bending through c, about `gap` apart. */
function beads(a: Point, c: Point, b: Point, gap: number): Point[] {
  const at = (t: number): Point => [
    (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t ** 2 * b[0],
    (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t ** 2 * b[1],
  ];
  const fine = Array.from({ length: 201 }, (_, i) => at(i / 200));
  const out: Point[] = [fine[0]];
  let run = 0;
  for (let i = 1; i < fine.length; i++) {
    run += Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]);
    if (run >= gap) {
      out.push(fine[i]);
      run = 0;
    }
  }
  return out;
}

const HOLE: Point = [72, 98];
const CHAIN: Point[] = [
  ...beads([28, -4], [40, 60], HOLE, 5.2),
  ...beads([134, -4], [118, 64], HOLE, 5.2),
];

/** Boone's dog tag, hung on its bead chain from the top edge of a section. Swings on hover. */
export function DogTag() {
  return (
    <svg className="boone-tag" viewBox="0 0 220 180" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="boone-tag-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d5d9dc" />
          <stop offset="0.45" stopColor="#9aa1a7" />
          <stop offset="0.7" stopColor="#c3c8cc" />
          <stop offset="1" stopColor="#868d93" />
        </linearGradient>
        <mask id="boone-tag-hole">
          <rect x="-12" y="-36" width="160" height="72" fill="#fff" />
          <circle r="4.2" fill="#000" />
        </mask>
      </defs>
      <g className="boone-tag__swing">
        {CHAIN.map(([x, y], i) => (
          <circle key={i} className="boone-tag__bead" cx={x.toFixed(1)} cy={y.toFixed(1)} r="1.9" />
        ))}
        <g transform={`translate(${HOLE[0]} ${HOLE[1]}) rotate(14)`}>
          <rect
            x="-10"
            y="-34"
            width="146"
            height="68"
            rx="15"
            fill="url(#boone-tag-steel)"
            className="boone-tag__plate"
            mask="url(#boone-tag-hole)"
          />
          <rect x="-4" y="-28" width="134" height="56" rx="11" className="boone-tag__rim" />
          {DOG_TAG_LINES.map((line, i) => (
            <g key={line} className="boone-tag__line" transform={`translate(10 ${-15 + i * 13.5})`}>
              <text className="boone-tag__emboss" x="0.7" y="0.7">{line}</text>
              <text className="boone-tag__text">{line}</text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

/**
 * A cracked lens over one corner of the live map, like his goggle. Drawn once from a fixed seed so
 * it is the same crack on every visit: radial runs that zigzag out from an impact near the corner,
 * thinner and fainter as they go, with broken rings between neighbors.
 */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IMPACT: Point = [188, 26];

type CrackPath = { d: string; tier: 'main' | 'fine' | 'ring' };

const CRACK: CrackPath[] = (() => {
  const rand = seeded(1940);
  const paths: CrackPath[] = [];
  const runs: Point[][] = [];
  const count = 13;
  for (let i = 0; i < count; i++) {
    const base = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.35;
    // Runs heading into the map are long; runs heading off the corner are cut by the edge anyway.
    const length = 40 + rand() * 150;
    const pts: Point[] = [[IMPACT[0] + Math.cos(base) * 2, IMPACT[1] + Math.sin(base) * 2]];
    let angle = base;
    let gone = 0;
    while (gone < length) {
      const step = 5 + rand() * 11;
      angle += (rand() - 0.5) * 0.5;
      const [x, y] = pts[pts.length - 1];
      pts.push([x + Math.cos(angle) * step, y + Math.sin(angle) * step]);
      gone += step;
    }
    runs.push(pts);
    const d = (p: Point[]) => 'M' + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');
    const near = pts.slice(0, Math.ceil(pts.length / 2) + 1);
    const far = pts.slice(Math.ceil(pts.length / 2));
    paths.push({ d: d(near), tier: 'main' }, { d: d(far), tier: 'fine' });
    // A short branch off the middle of some runs.
    if (rand() < 0.5 && pts.length > 4) {
      const [bx, by] = pts[2 + Math.floor(rand() * (pts.length - 3))];
      const ba = angle + (rand() < 0.5 ? 0.7 : -0.7);
      const bl = 8 + rand() * 18;
      paths.push({ d: `M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + Math.cos(ba) * bl).toFixed(1)} ${(by + Math.sin(ba) * bl).toFixed(1)}`, tier: 'fine' });
    }
  }
  // Broken rings: join neighboring runs at a set distance from the impact, not every pair.
  for (const [k, keep] of [[1, 0.6], [3, 0.3]] as const) {
    for (let i = 0; i < runs.length; i++) {
      const a = runs[i][k];
      const b = runs[(i + 1) % runs.length][k];
      if (!a || !b || rand() > keep) continue;
      // Glass breaks in straight shards: one kink, pushed in or out at random.
      const kink = 0.1 + rand() * 0.25 * (rand() < 0.5 ? 1 : -1);
      const mx = (a[0] + b[0]) / 2 + (IMPACT[0] - (a[0] + b[0]) / 2) * kink;
      const my = (a[1] + b[1]) / 2 + (IMPACT[1] - (a[1] + b[1]) / 2) * kink;
      paths.push({ d: `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${mx.toFixed(1)} ${my.toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`, tier: 'ring' });
    }
  }
  return paths;
})();

export function CrackedLens() {
  return (
    <svg className="boone-crack" viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      {CRACK.map((p, i) => (
        <path key={`s${i}`} className="boone-crack__shadow" d={p.d} transform="translate(0.7 0.7)" />
      ))}
      {CRACK.map((p, i) => (
        <path key={i} className={`boone-crack__line boone-crack__line--${p.tier}`} d={p.d} />
      ))}
      <circle className="boone-crack__impact" cx={IMPACT[0]} cy={IMPACT[1]} r="3.2" />
    </svg>
  );
}
