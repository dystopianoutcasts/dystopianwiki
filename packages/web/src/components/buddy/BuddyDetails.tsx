/**
 * Small pilot details on the Outcast Buddy page (owner, 2026-11-14: "add little things like this
 * on other main pages, like the buddy page"): a REMOVE BEFORE FLIGHT streamer on the download card,
 * a pre-flight checklist tag over the install steps, and a CLEARED FOR TAKEOFF stamp beside Rax's
 * sign-off. Pictures only: aria-hidden, no clicks taken, still for reduced motion
 * (buddy-details.css). Hook-free, so staticMarkup can render them.
 */

/** The red-flag streamer pilots pull off before a flight, here in the brand's orange. */
export function RemoveBeforeFlight() {
  return (
    <span className="rbf" aria-hidden="true">
      <span className="rbf__ring" />
      <span className="rbf__flag">
        <span className="rbf__text">REMOVE BEFORE FLIGHT</span>
      </span>
    </span>
  );
}

/** A stenciled tag over the install steps. */
export function PreflightTag() {
  return (
    <span className="preflight-tag" aria-hidden="true">
      PRE-FLIGHT CHECKLIST
    </span>
  );
}

/** A one-ink stamp with Boone's one-color mark (BRAND.md: stamps use Moss Stamp ink). */
export function ClearedStamp() {
  return (
    <span className="cleared-stamp" aria-hidden="true">
      <span className="cleared-stamp__mark" />
      <span className="cleared-stamp__text">
        CLEARED
        <br />
        FOR TAKEOFF
      </span>
    </span>
  );
}
