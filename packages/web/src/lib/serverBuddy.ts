/**
 * ServerBuddy download (admin dashboard): the pure half. Reads Storage's answers and errors
 * into plain values. No React, no network, so it is tested with node:test.
 *
 * Storage answers a missing object and an object the caller may not read the same way
 * (statusCode "404", "Object not found"): row level security hides the row. The dashboard is
 * shown to admins only, so the page words that answer as "not uploaded yet".
 */

export type StorageFailure = 'missing' | 'login' | 'network' | 'malformed'

/** The file as Storage lists it. `bytes` is null when Storage did not say. */
export type StoredFile = { bytes: number | null; updatedAt: string | null }

type ErrorLike = { name?: unknown; message?: unknown; status?: unknown; statusCode?: unknown } | null | undefined

/** Sorts a Storage error into what the page can tell an admin. */
export function classifyStorageError(error: ErrorLike): Exclude<StorageFailure, 'malformed'> {
  if (!error) return 'network'
  const code = typeof error.statusCode === 'string' ? error.statusCode : ''
  const message = typeof error.message === 'string' ? error.message : ''
  if (code === '404' || /not.?found/i.test(message)) return 'missing'
  if (code === '401' || code === '403' || /jwt|unauthori[sz]ed|invalid.?token/i.test(message)) return 'login'
  return 'network'
}

/**
 * The signed link must be an https URL (http only for a local Supabase) that carries a token,
 * or the page does not follow it.
 */
export function parseSignedUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const raw = (data as { signedUrl?: unknown }).signedUrl
  if (typeof raw !== 'string' || raw.length === 0) return null
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null
  if (!url.searchParams.get('token')) return null
  return url.toString()
}

/**
 * Finds `file` in a Storage listing of its folder. Returns null when it is not there, or
 * 'malformed' when the listing is not a list of named entries.
 */
export function findListedFile(data: unknown, file: string): StoredFile | null | 'malformed' {
  if (!Array.isArray(data)) return 'malformed'
  for (const entry of data) {
    if (!entry || typeof entry !== 'object') return 'malformed'
    const e = entry as { name?: unknown; updated_at?: unknown; metadata?: unknown }
    if (typeof e.name !== 'string') return 'malformed'
    if (e.name !== file) continue
    const meta = e.metadata && typeof e.metadata === 'object' ? (e.metadata as { size?: unknown }) : null
    const size = meta?.size
    return {
      bytes: typeof size === 'number' && Number.isSafeInteger(size) && size >= 0 ? size : null,
      updatedAt: typeof e.updated_at === 'string' ? e.updated_at : null,
    }
  }
  return null
}

/** "10.8 MB" */
export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * What the card says about the stored file, before anyone clicks. A size that differs from the
 * release's means someone uploaded a different build under this name.
 */
export function storedFileLine(stored: StoredFile | null, expectedBytes: number, file: string): { tone: 'ok' | 'warn'; text: string } {
  if (stored === null) {
    return { tone: 'warn', text: `${file} is not uploaded yet. The owner uploads it to the admin-tools bucket in Supabase Storage.` }
  }
  if (stored.bytes !== null && stored.bytes !== expectedBytes) {
    return {
      tone: 'warn',
      text: `The stored ${file} is ${stored.bytes.toLocaleString('en-US')} bytes, not ${expectedBytes.toLocaleString('en-US')}. It may be a different build: check its SHA-256 after downloading.`,
    }
  }
  return { tone: 'ok', text: `${file} is uploaded and ready.` }
}

export const STORAGE_FAILURE_TEXT: Readonly<Record<StorageFailure, string>> = {
  missing: 'The file is not uploaded yet, or this account is no longer an admin. Reload the page to check.',
  login: 'Your session has ended. Log in again with an admin account.',
  network: 'We could not reach the server. Check your connection and try again.',
  malformed: 'The server sent something this page could not read. Please try again later.',
}
