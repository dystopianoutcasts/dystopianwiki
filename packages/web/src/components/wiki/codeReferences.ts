/**
 * Code references (`:cite[...]` and "Code" table columns in a layered article) are hidden until
 * the reader asks for them. The choice is remembered per reader in localStorage. Every storage
 * read and write is wrapped, so a private window or blocked storage just means "hidden".
 */

export const CODE_REFERENCES_KEY = 'dystopian-wiki:code-references'

/** The part of Storage this feature uses; a test passes a stub, even one that throws. */
export type RefStorage = Pick<Storage, 'getItem' | 'setItem'>

/** The browser's localStorage, or null when touching it throws (blocked storage, some previews). */
export function browserStorage(): RefStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/** True (hidden) unless the reader chose to show them. */
export function readHidden(storage: RefStorage | null): boolean {
  try {
    return storage?.getItem(CODE_REFERENCES_KEY) !== 'shown'
  } catch {
    return true
  }
}

/** Remembers the choice. Returns false when it could not be saved; the page works either way. */
export function writeHidden(storage: RefStorage | null, hidden: boolean): boolean {
  try {
    if (!storage) return false
    storage.setItem(CODE_REFERENCES_KEY, hidden ? 'hidden' : 'shown')
    return true
  } catch {
    return false
  }
}

/** What the button says: the action it will do. */
export function buttonLabel(hidden: boolean): string {
  return hidden ? 'Show code references' : 'Hide code references'
}

/** The class on the article root that hides every citation (field-notes.css). */
export const HIDE_CODE_REFERENCES_CLASS = 'wiki-article--hide-cites'
