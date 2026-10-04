/**
 * hashTarget - which element a URL hash points at (KB05: /#join from any page).
 *
 * Pure helpers for components/layout/ScrollToHash.tsx, kept free of the DOM so node:test
 * can check them.
 */

/** The element id a location hash names, or null when there is none ("", "#", bad escapes). */
export function hashTargetId(hash: string): string | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (raw === '') return null
  let id: string
  try {
    id = decodeURIComponent(raw)
  } catch {
    return null
  }
  return id.trim() === '' ? null : id
}

/** The heading selector ScrollToHash looks for inside a target that is not a heading itself. */
export const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6'

/**
 * How long ScrollToHash waits for the target to appear (an article body arrives from the
 * database after the page renders), and how long it keeps the target at the top while the
 * sections above it fill in with live data and change height. Any input from the reader
 * (wheel, touch, key, pointer) ends the hold at once.
 */
export const FIND_TARGET_MS = 5000
export const HOLD_TARGET_MS = 4000
