/**
 * safeNext - validates the post-login "next" destination.
 *
 * Pure function, no browser APIs except URL parsing. Returns the path when it is a
 * same-site path, or null when it is not (callers fall back to the home page).
 *
 * Accepted: a single leading "/" followed by anything that is not "/" or "\", with no
 * whitespace or control characters and no backslash anywhere. Browsers treat "/\" as
 * "//" and strip tabs and newlines inside URLs, so all of those are rejected outright.
 * The percent-decoded form is checked too, so "/%2F/evil.com" and "/%5Cevil.com" fail.
 *
 * Expected results (see the report for the full table):
 *   "/vote"            -> "/vote"
 *   "/map/"            -> "/map/"
 *   "/search?q=a%20b"  -> "/search?q=a%20b"
 *   "//evil.com"       -> null
 *   "/\\evil.com"      -> null
 *   "https://evil.com" -> null
 *   "javascript:x"     -> null
 *   ""                 -> null
 *   "vote" (no slash)  -> null
 */
const MAX_LENGTH = 2048;
const PROBE_ORIGIN = 'https://safe-next.invalid';

// Whitespace and control characters (including tab, CR, LF, DEL) and backslash.
// eslint-disable-next-line no-control-regex
const FORBIDDEN_RAW = /[\x00-\x20\x7f\\]/;
// A percent-encoded space is a normal path character, so the decoded check leaves it alone.
// eslint-disable-next-line no-control-regex
const FORBIDDEN_DECODED = /[\x00-\x1f\x7f\\]/;

function startsWithSingleSlash(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}

export function safeNext(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  if (raw.length === 0 || raw.length > MAX_LENGTH) return null;
  if (!startsWithSingleSlash(raw)) return null;
  if (FORBIDDEN_RAW.test(raw)) return null;

  // Reject encoded tricks: the decoded text must not turn into "//" or hold a backslash.
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (!startsWithSingleSlash(decoded) || FORBIDDEN_DECODED.test(decoded)) return null;

  // Last line of defence: resolved against a throwaway origin it must stay on that origin.
  try {
    if (new URL(raw, PROBE_ORIGIN).origin !== PROBE_ORIGIN) return null;
  } catch {
    return null;
  }

  return raw;
}

/** The live map is a separate static app, not an SPA route: it needs a full page load. */
export function isMapPath(path: string): boolean {
  return path === '/map' || path.startsWith('/map/') || path.startsWith('/map?');
}
