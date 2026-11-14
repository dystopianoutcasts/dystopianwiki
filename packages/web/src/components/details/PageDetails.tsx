/**
 * Small details for the site's main pages beyond the home page (owner, 2026-11-14: "add little
 * things like this on other main pages"): a FILED stamp and a coffee ring for State of the Server;
 * stenciled panel codes for the wiki's build and section pages, like the markings on an aircraft's
 * panels; a CERTIFIED stamp and pencil tally marks for the mascot vote. Pictures only: aria-hidden,
 * no clicks taken (page-details.css). Hook-free, so staticMarkup can render them.
 */

/** A one-ink stamp (BRAND.md: stamps use Moss Stamp ink), with Boone's one-color mark. */
export function FiledStamp({ label }: { label: string }) {
  return (
    <span className="ink-stamp filed-stamp" aria-hidden="true">
      <span className="ink-stamp__mark" />
      <span>FILED | {label.toUpperCase()}</span>
    </span>
  );
}

/** Stamped on the winning entry's art: the count is certified. */
export function CertifiedStamp() {
  return (
    <span className="ink-stamp certified-stamp" aria-hidden="true">
      <span className="ink-stamp__mark" />
      <span>CERTIFIED</span>
    </span>
  );
}

/** Pencil tally marks, in groups of five with the fifth struck across. Nothing past 40. */
export function TallyMarks({ count }: { count: number }) {
  const n = Math.min(Math.max(0, Math.floor(count)), 40);
  if (n === 0) return null;
  const marks = [];
  for (let i = 0; i < n; i++) {
    const group = Math.floor(i / 5);
    const k = i % 5;
    const gx = group * 34;
    if (k < 4) {
      const x = gx + 4 + k * 6;
      marks.push(<line key={i} x1={x} y1={3 + (k % 2)} x2={x + 1} y2={27 - (k % 2)} />);
    } else {
      marks.push(<line key={i} x1={gx} y1={22} x2={gx + 28} y2={8} />);
    }
  }
  const width = Math.ceil(n / 5) * 34;
  return (
    <svg className="tally-marks" viewBox={`-2 0 ${width} 30`} width={width} height={30} aria-hidden="true" focusable="false">
      {marks}
    </svg>
  );
}

/** A coffee ring left on a paper by a mug. */
export function CoffeeRing() {
  return (
    <svg className="coffee-ring" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="46" className="coffee-ring__wide" />
      <circle cx="60" cy="60" r="44" className="coffee-ring__edge" />
      <path d="M100 74 a44 44 0 0 1 -30 28" className="coffee-ring__drip" />
    </svg>
  );
}

/**
 * The stenciled code of a wiki section: its first three letters and its place in the build's list,
 * "MOD-02". A category adds its place in the section: "MOD-02.3".
 */
export function panelCode(sectionId: string, sectionIndex: number, categoryIndex?: number): string {
  const letters = sectionId.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase() || 'SEC';
  const base = `${letters}-${String(sectionIndex + 1).padStart(2, '0')}`;
  return categoryIndex === undefined ? base : `${base}.${categoryIndex + 1}`;
}

export function StencilCode({ code, small = false }: { code: string; small?: boolean }) {
  return (
    <span className={small ? 'stencil-code stencil-code--small' : 'stencil-code'} aria-hidden="true">
      {code}
    </span>
  );
}
