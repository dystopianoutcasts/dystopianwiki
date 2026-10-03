/** Pure helpers for the "Aurora world" admin panel and the home page's world line (T49). Tests: worldsPanel.test.ts. */
import type { DetectedBy, Leftovers, PendingWorld, World } from './worldsApi'

export const UNDO_WINDOW_MS = 24 * 60 * 60 * 1000

export const MISSING_TEXT = 'Worlds are not set up yet (migration 032)'

/** The current world, or null. */
export function currentWorld(worlds: World[]): World | null {
  return worlds.find((w) => w.status === 'current') ?? null
}

/** Undo is offered only while the current world started under 24 hours ago. */
export function canUndo(world: World | null, now: number): boolean {
  if (!world || world.status !== 'current') return false
  const t = Date.parse(world.startedAt)
  if (Number.isNaN(t)) return false
  const age = now - t
  return age >= 0 && age < UNDO_WINDOW_MS
}

export function detectedByText(by: DetectedBy): string {
  if (by === 'exporter') return 'the exporter'
  if (by === 'admin') return 'an admin'
  return 'the migration'
}

/** The table cell: how a world came to exist (a NULL exporter id means the migration or an admin made it). */
export function originText(by: DetectedBy): string {
  if (by === 'exporter') return 'Detected by the exporter'
  if (by === 'admin') return 'Started by an admin'
  return 'Detected by the migration'
}

export function formatDate(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

/** "World 3, started Oct 2, 2026, 9:00 AM, detected by the exporter". */
export function statusLine(world: World): string {
  return `World ${world.seq}, started ${formatDate(world.startedAt)}, detected by ${detectedByText(world.detectedBy)}`
}

export function worldCountText(n: number): string {
  return `${n} ${n === 1 ? 'world' : 'worlds'} so far`
}

export function pendingText(p: PendingWorld): string {
  const hours = p.worldAgeHoursAtStart === null ? 'an unknown number of' : String(Math.round(p.worldAgeHoursAtStart))
  const when = p.startedAt ? formatDate(p.startedAt) : 'an unknown date'
  return `The server reported a new world on ${when} with a world age of ${hours} hours. That is unusual for a wipe, so it was not switched automatically.`
}

const COUNT_LABELS: Readonly<Record<string, string>> = {
  vehicles: 'cars',
  cars: 'cars',
  safehouses: 'safehouses',
  players: 'players',
  npcs: 'NPCs',
}

function labelOf(key: string): string {
  return COUNT_LABELS[key] ?? key.replace(/_/g, ' ')
}

/** "Left over from older worlds: ...", only non-zero counts; "Nothing left over" when all are zero. */
export function leftoversText(l: Leftovers): string {
  const parts: string[] = []
  if (l.vehicleClaimsStale > 0) {
    parts.push(`${l.vehicleClaimsStale} car ${l.vehicleClaimsStale === 1 ? 'claim' : 'claims'} still in the claim file`)
  }
  for (const c of l.counts) parts.push(`${c.count} ${labelOf(c.key)}`)
  if (parts.length === 0) return 'Nothing left over'
  return `Left over from older worlds: ${parts.join(', ')} (hidden from the map; pruned after 30 days)`
}

/** The home page line: "World 3 since Oct 2", nothing when the server has not said. */
export function homeWorldLine(seq: number | null, startedAt: Date | null): string | null {
  if (seq === null) return null
  if (!startedAt) return `World ${seq}`
  const day = startedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `World ${seq} since ${day}`
}
