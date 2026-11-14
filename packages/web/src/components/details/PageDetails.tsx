/**
 * Small details for the site's main pages beyond the home page (owner, 2026-11-14: "add little
 * things like this on other main pages"): a FILED stamp and a coffee ring for State of the Server,
 * and stenciled panel codes for the wiki's section pages, like the markings on an aircraft's
 * panels. Pictures only: aria-hidden, no clicks taken (page-details.css). Hook-free, so
 * staticMarkup can render them.
 */

/** A one-ink stamp (BRAND.md: stamps use Moss Stamp ink), with Boone's one-color mark. */
export function FiledStamp({ label }: { label: string }) {
  return (
    <span className="filed-stamp" aria-hidden="true">
      <span className="filed-stamp__mark" />
      <span className="filed-stamp__text">FILED | {label.toUpperCase()}</span>
    </span>
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
