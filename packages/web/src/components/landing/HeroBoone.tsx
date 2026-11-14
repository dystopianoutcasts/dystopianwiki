/**
 * Boone's pictures on the home page (owner, 2026-11-14): his seal, turning, in the hero (option A
 * on the brand canvas); his service files, splayed beside About; and the cockpit frame (heading
 * tape, altitude ladders, corner brackets) around the live map. "Elsewhere": the files and the
 * cockpit sit in other sections, not in the hero.
 *
 * All pictures only: aria-hidden, no clicks taken; the heading tape drifts and the seal ring turns,
 * both still for reduced motion (hero-cockpit.css). The file's lines are PROPOSED lore
 * (DystopianOutcasts repo, DOCS/LORE/Boone.md). Hook-free, so staticMarkup can render them.
 */

/** The seal's ring (BRAND.md), with pipes between the words (owner, 2026-11-14). */
export const SEAL_RING = 'DYSTOPIAN OUTCASTS | ALONE | LIVING | SURVIVING | ';

const RING_R = 158;
/** The ring text is stretched to exactly one turn, so the last pipe sits as far from the first word as every other gap. */
const RING_LENGTH = Math.round(2 * Math.PI * RING_R);

/**
 * Extra cracks for his cracked lens, one set per tap (owner, 2026-11-14: "add the glint and extra
 * cracks to the large boone"), in the art's own 512 px coordinates. They run out from the old
 * impact at (288, 228) and stay inside the glass (clipped to it).
 */
export const LENS_CRACKS: string[][] = [
  ['M288 228 L300 205 L306 190', 'M288 228 L318 240 L332 238'],
  [
    'M288 228 L262 222 L238 214',
    'M288 228 L296 258 L300 276',
    'M262 205 L276 198 L292 200',
    'M305 246 L296 254 L280 256',
  ],
  [
    'M306 190 L318 186 L330 194',
    'M238 214 L226 200 L222 186',
    'M332 238 L342 228',
    'M262 222 L250 236 L236 244',
    'M300 276 L312 270',
  ],
];

/** The seal: the ring, his face, and on his cracked lens a glint and `cracks` extra sets of cracks. */
export function BooneSeal({ cracks = 0 }: { cracks?: number }) {
  const runs = LENS_CRACKS.slice(0, Math.max(0, Math.min(cracks, LENS_CRACKS.length))).flat();
  return (
    <div className="boone-seal">
      <svg className="boone-seal__ring" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
        <defs>
          <path
            id="boone-seal-path"
            d={`M200 200 m-${RING_R} 0 a${RING_R} ${RING_R} 0 1 1 ${2 * RING_R} 0 a${RING_R} ${RING_R} 0 1 1 -${2 * RING_R} 0`}
          />
        </defs>
        <circle cx="200" cy="200" r="196" className="boone-seal__disc" />
        <circle cx="200" cy="200" r="134" className="boone-seal__inner" />
        <g className="boone-seal__turn">
          <text className="boone-seal__text">
            <textPath href="#boone-seal-path" textLength={RING_LENGTH} lengthAdjust="spacing">
              {SEAL_RING}
            </textPath>
          </text>
        </g>
      </svg>
      <img className="boone-seal__face" src="/assets/branding/boone/boone-512.png" alt="" width={512} height={512} />
      {runs.length > 0 && (
        <svg className="boone-seal__cracks" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id="boone-seal-glass">
              <ellipse cx="282" cy="222" rx="66" ry="58" />
            </clipPath>
          </defs>
          <g clipPath="url(#boone-seal-glass)">
            {runs.map((d) => (
              <path key={`o${d}`} className="boone-seal__crack-edge" d={d} />
            ))}
            {runs.map((d) => (
              <path key={d} className="boone-seal__crack" d={d} />
            ))}
          </g>
        </svg>
      )}
      {/* Keyed on the crack count, so every new crack replays the glint at once. */}
      <span key={`glint-${cracks}`} className="boone-seal__glint" />
    </div>
  );
}

/** His service record, as typed: [label, value]. A value of '' continues the line above. */
export const SERVICE_RECORD: [string, string][] = [
  ['NAME', 'BOONE'],
  ['CALLSIGN', 'RINGTAIL'],
  ['DUTY', 'AIR COMBAT'],
  ['ENLISTED', "WON'T SAY"],
  ['KIN', 'BROTHER'],
  ['', '(TOO BUSY)'],
  ['STATUS', 'SURVIVING'],
];

/** His files: a manila folder, the typed service record with its stamp, a photo. */
export function BooneFiles() {
  return (
    <div className="boone-files" aria-hidden="true">
      <div className="boone-files__stage">
        <div className="boone-files__folder">
          <span className="boone-files__tab">201 FILE | BOONE</span>
        </div>
        <div className="boone-files__sheet">
          <p className="boone-files__head">SERVICE RECORD</p>
          <dl className="boone-files__lines">
            {SERVICE_RECORD.map(([label, value], i) => (
              <div key={i} className="boone-files__line">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <span className="boone-files__stamp">
            <span className="boone-files__stamp-mark" />
            SURVIVED
          </span>
        </div>
        <div className="boone-files__photo">
          <svg className="boone-files__clip" viewBox="0 0 20 52" focusable="false">
            <path d="M6 48V10a4 4 0 0 1 8 0v34a2 2 0 0 1-4 0V14" />
          </svg>
          <span className="boone-files__picture">
            <img src="/assets/branding/boone/boone-512.png" alt="" width={512} height={512} />
          </span>
          <span className="boone-files__caption">RINGTAIL</span>
        </div>
      </div>
    </div>
  );
}

/** Compass headings for the tape, every 30 degrees. */
const HEADINGS = ['N', '030', '060', 'E', '120', '150', 'S', '210', '240', 'W', '300', '330'];
const PX_PER_DEGREE = 4;
const TURN = 360 * PX_PER_DEGREE;

/** Two full turns of tape, so it can drift one turn and start over without a seam. */
function HeadingTape() {
  const ticks = [];
  for (let d = 0; d < 720; d += 5) {
    const x = d * PX_PER_DEGREE;
    const major = d % 30 === 0;
    ticks.push(<line key={`t${d}`} x1={x} y1="0" x2={x} y2={major ? 14 : 7} />);
    if (major) {
      ticks.push(
        <text key={`l${d}`} x={x} y="28" textAnchor="middle">
          {HEADINGS[(d / 30) % 12]}
        </text>,
      );
    }
  }
  return (
    <div className="cockpit__tape">
      <svg className="cockpit__tape-strip" width={TURN * 2} height="34" viewBox={`0 0 ${TURN * 2} 34`} focusable="false">
        {ticks}
      </svg>
      <span className="cockpit__caret" />
    </div>
  );
}

/** An altitude ladder: a tick every step, a number on every other one. */
function Ladder({ side }: { side: 'left' | 'right' }) {
  const rows = [];
  for (let i = 0; i <= 12; i++) {
    const y = 6 + i * 34;
    const major = i % 2 === 0;
    const x1 = side === 'left' ? 0 : 120 - (major ? 18 : 9);
    rows.push(<line key={`t${i}`} x1={x1} y1={y} x2={x1 + (major ? 18 : 9)} y2={y} />);
    if (major) {
      rows.push(
        <text key={`l${i}`} x={side === 'left' ? 26 : 94} y={y + 4} textAnchor={side === 'left' ? 'start' : 'end'}>
          {((12 - i) * 500).toLocaleString('en-US')}
        </text>,
      );
    }
  }
  return (
    <svg className={`cockpit__ladder cockpit__ladder--${side}`} viewBox="0 0 120 420" focusable="false">
      {rows}
    </svg>
  );
}

/** The cockpit frame, laid over the live map (ServerNow). */
export function CockpitHud() {
  return (
    <div className="cockpit" aria-hidden="true">
      <HeadingTape />
      <Ladder side="left" />
      <Ladder side="right" />
      <span className="cockpit__corner cockpit__corner--tl" />
      <span className="cockpit__corner cockpit__corner--tr" />
      <span className="cockpit__corner cockpit__corner--bl" />
      <span className="cockpit__corner cockpit__corner--br" />
    </div>
  );
}
