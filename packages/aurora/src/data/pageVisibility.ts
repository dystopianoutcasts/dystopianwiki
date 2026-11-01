// Polls pause while the tab is hidden (usage, 2026-11-01). A map left open in a background
// tab used to download every dataset around the clock; an admin's full vehicle list alone
// is about 600 kB every poll. The browser's Page Visibility API says when the tab is
// hidden; without a document (tests, server rendering) the page counts as visible.

/** The part of `document` these helpers read, so tests can pass a stand-in. */
export interface VisibilitySource {
  visibilityState?: string
  addEventListener?: (type: 'visibilitychange', fn: () => void) => void
  removeEventListener?: (type: 'visibilitychange', fn: () => void) => void
}

function currentDocument(): VisibilitySource | undefined {
  return typeof document === 'undefined' ? undefined : document
}

/** True only when the browser reports the tab hidden. */
export function pageHidden(doc: VisibilitySource | undefined = currentDocument()): boolean {
  return doc?.visibilityState === 'hidden'
}

/** Calls `onShown` each time the tab becomes visible again. Returns the unsubscribe. */
export function onPageShown(onShown: () => void, doc: VisibilitySource | undefined = currentDocument()): () => void {
  if (!doc?.addEventListener || !doc.removeEventListener) return () => {}
  const fn = () => {
    if (!pageHidden(doc)) onShown()
  }
  doc.addEventListener('visibilitychange', fn)
  return () => doc.removeEventListener?.('visibilitychange', fn)
}

/**
 * What a returning tab should fetch, from how long ago the last request started:
 * nothing if a poll ran within one interval (rapid tab switching costs nothing),
 * a full fetch if the gap is at least the full interval (rows may have disappeared
 * meanwhile), otherwise a normal poll.
 */
export function catchUpKind(elapsedMs: number, pollMs: number, fullMs: number | null): 'none' | 'poll' | 'full' {
  if (elapsedMs < pollMs) return 'none'
  if (fullMs !== null && elapsedMs >= fullMs) return 'full'
  return 'poll'
}
