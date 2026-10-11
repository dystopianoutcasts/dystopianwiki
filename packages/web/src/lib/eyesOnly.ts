/**
 * Pure logic for the executive role and the EYES ONLY area (migration 041): reading what
 * the database functions return, the slug and size rules the upload form checks before it
 * asks, and the small formatters the pages share. No network, no React.
 *
 * The database enforces every rule here again (table CHECK constraints), so these checks
 * only spare the superadmin a round trip.
 *
 * Tests: eyesOnly.test.ts (`npm test` in packages/web).
 */
import { parseMembers, type Member, type Parsed } from './adminDashboard'

/** 8 MiB, the table's octet_length limit on the document. */
export const EYES_ONLY_MAX_BYTES = 8 * 1024 * 1024
export const SLUG_MAX_LENGTH = 80
export const TITLE_MAX_LENGTH = 200
export const SUMMARY_MAX_LENGTH = 500

/** Lowercase words joined by single hyphens, as the table's CHECK. */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug)
}

/** A slug suggested from a file name: "My Report (v2).html" becomes "my-report-v2". Empty when nothing usable is left. */
export function suggestSlug(fileName: string): string {
  const base = fileName.replace(/\.[a-z0-9]+$/i, '')
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, '')
}

/** Characters as the database counts them (length()), not UTF-16 units. */
const charCount = (s: string): number => Array.from(s).length

export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export interface UploadDraft {
  slug: string
  title: string
  summary: string
  html: string
}

/** The first thing wrong with an upload, in the words the form shows, or null when it can be sent. */
export function uploadProblem(draft: UploadDraft): string | null {
  if (!draft.html.trim()) return 'Choose an HTML file first.'
  if (byteLength(draft.html) > EYES_ONLY_MAX_BYTES) return `That file is larger than ${formatBytes(EYES_ONLY_MAX_BYTES)}.`
  if (!draft.slug) return 'Enter a slug.'
  if (!isValidSlug(draft.slug)) {
    return `The slug must be lowercase letters and digits joined by single hyphens, at most ${SLUG_MAX_LENGTH} characters.`
  }
  const title = draft.title.trim()
  if (!title) return 'Enter a title.'
  if (charCount(title) > TITLE_MAX_LENGTH) return `The title can be at most ${TITLE_MAX_LENGTH} characters.`
  if (charCount(draft.summary.trim()) > SUMMARY_MAX_LENGTH) return `The summary can be at most ${SUMMARY_MAX_LENGTH} characters.`
  return null
}

/** "1.5 MB" style size for the cards and the dashboard list. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ---------------------------------------------------------------------------
// Documents (public.eyes_only_list and eyes_only_get)
// ---------------------------------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
const isString = (v: unknown): v is string => typeof v === 'string'
const isTime = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v))

export interface EyesOnlyListItem {
  slug: string
  title: string
  summary: string
  updatedAt: string
  sizeBytes: number
}

export function parseDocumentList(raw: unknown): Parsed<EyesOnlyListItem[]> {
  if (!Array.isArray(raw)) return { ok: false }
  const out: EyesOnlyListItem[] = []
  for (const row of raw) {
    if (!isRecord(row)) return { ok: false }
    const { slug, title, summary, updated_at, size_bytes } = row
    if (!isString(slug) || !isValidSlug(slug) || !isString(title) || !isString(summary)) return { ok: false }
    if (!isTime(updated_at)) return { ok: false }
    if (typeof size_bytes !== 'number' || !Number.isInteger(size_bytes) || size_bytes < 0) return { ok: false }
    out.push({ slug, title, summary, updatedAt: updated_at, sizeBytes: size_bytes })
  }
  return { ok: true, value: out }
}

export interface EyesOnlyDocument {
  slug: string
  title: string
  summary: string
  html: string
  sha256: string
  updatedAt: string
}

const SHA256_PATTERN = /^[0-9a-f]{64}$/

/** eyes_only_get returns a one-row table; anything but exactly one well-formed row is refused. */
export function parseDocument(raw: unknown): Parsed<EyesOnlyDocument> {
  if (!Array.isArray(raw) || raw.length !== 1) return { ok: false }
  const row: unknown = raw[0]
  if (!isRecord(row)) return { ok: false }
  const { slug, title, summary, html, sha256, updated_at } = row
  if (!isString(slug) || !isValidSlug(slug) || !isString(title) || !isString(summary)) return { ok: false }
  if (!isString(html) || !isString(sha256) || !SHA256_PATTERN.test(sha256) || !isTime(updated_at)) return { ok: false }
  return { ok: true, value: { slug, title, summary, html, sha256, updatedAt: updated_at } }
}

/** site_superadmin_put_eyes_only returns the document's sha256 as a bare string. */
export function parsePutResult(raw: unknown): Parsed<string> {
  return isString(raw) && SHA256_PATTERN.test(raw) ? { ok: true, value: raw } : { ok: false }
}

// ---------------------------------------------------------------------------
// Members with the executive flag (public.site_admin_members)
// ---------------------------------------------------------------------------

export interface ExecutiveMember extends Member {
  isExecutive: boolean
}

export function parseExecutiveMembers(raw: unknown): Parsed<ExecutiveMember[]> {
  const base = parseMembers(raw)
  if (!base.ok || !Array.isArray(raw)) return { ok: false }
  const out: ExecutiveMember[] = []
  for (let i = 0; i < base.value.length; i += 1) {
    const row: unknown = raw[i]
    if (!isRecord(row) || typeof row.is_executive !== 'boolean') return { ok: false }
    out.push({ ...base.value[i], isExecutive: row.is_executive })
  }
  return { ok: true, value: out }
}

export type ExecutiveState = 'inherited' | 'executive' | 'none'

/** Admins and the superadmin are executives by inheritance and have no toggle. */
export function executiveState(m: Pick<ExecutiveMember, 'isAdmin' | 'isSuperadmin' | 'isExecutive'>): ExecutiveState {
  if (m.isAdmin || m.isSuperadmin) return 'inherited'
  return m.isExecutive ? 'executive' : 'none'
}

/** "Oct 11, 2026", in UTC so the same instant reads the same for everyone. Empty for a bad time. */
export function formatDocDate(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  return new Date(t).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}
