/**
 * ServerBuddy download (admin dashboard): the calls to Supabase Storage (migration 047).
 * Every answer is read by serverBuddy.ts. Nothing here throws: failures come back as values.
 *
 * Storage is the gate. The bucket is private and only website admins may read it, so a page
 * shown to the wrong person still gets no file and no link.
 */
import { api } from './supabase'
import { classifyStorageError, findListedFile, parseSignedUrl, type StorageFailure, type StoredFile } from './serverBuddy'
import { SERVERBUDDY_BUCKET, SERVERBUDDY_FILE, SERVERBUDDY_LINK_SECONDS, SERVERBUDDY_OBJECT } from '../data/serverBuddy'

export type StorageResult<T> = { ok: true; value: T } | { ok: false; reason: StorageFailure }

const FOLDER = SERVERBUDDY_OBJECT.slice(0, SERVERBUDDY_OBJECT.lastIndexOf('/'))

/** Is the release file in the bucket, and how big is it? null = not uploaded. */
export async function fetchServerBuddyFile(): Promise<StorageResult<StoredFile | null>> {
  try {
    const { data, error } = await api
      .getClient()
      .storage.from(SERVERBUDDY_BUCKET)
      .list(FOLDER, { search: SERVERBUDDY_FILE, limit: 10 })
    if (error) {
      const reason = classifyStorageError(error)
      // Listing a folder that does not exist is not an error in Storage, but be safe.
      return reason === 'missing' ? { ok: true, value: null } : { ok: false, reason }
    }
    const found = findListedFile(data, SERVERBUDDY_FILE)
    return found === 'malformed' ? { ok: false, reason: 'malformed' } : { ok: true, value: found }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

/** A short-lived link that downloads the release under its own file name. */
export async function fetchServerBuddyLink(): Promise<StorageResult<string>> {
  try {
    const { data, error } = await api
      .getClient()
      .storage.from(SERVERBUDDY_BUCKET)
      .createSignedUrl(SERVERBUDDY_OBJECT, SERVERBUDDY_LINK_SECONDS, { download: SERVERBUDDY_FILE })
    if (error) return { ok: false, reason: classifyStorageError(error) }
    const url = parseSignedUrl(data)
    return url ? { ok: true, value: url } : { ok: false, reason: 'malformed' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}
