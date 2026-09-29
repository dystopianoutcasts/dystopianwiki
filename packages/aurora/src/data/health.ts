import type { HealthSample } from './types'

/**
 * Add a live sample to the sliding window: replaces a sample with the same timestamp,
 * drops anything older than the window, and keeps the list ordered oldest first.
 */
export function appendSample(
  samples: HealthSample[],
  row: HealthSample,
  windowMinutes: number,
  now: number = Date.now(),
): HealthSample[] {
  const cutoff = now - windowMinutes * 60_000
  const byT = new Map<string, HealthSample>()
  for (const s of samples) byT.set(s.t, s)
  byT.set(row.t, row)
  return [...byT.values()].filter((s) => Date.parse(s.t) >= cutoff).sort((a, b) => Date.parse(a.t) - Date.parse(b.t))
}

/** Memory used as a whole percentage, or null when either figure is missing or the maximum is zero. */
export function memoryPercent(s: HealthSample): number | null {
  if (s.memory_used == null || s.memory_max == null || s.memory_max <= 0) return null
  return Math.round((s.memory_used / s.memory_max) * 100)
}

/**
 * A server that has not posted a sample for this long is treated as idle/offline in the
 * panel (T22 Part D item 3: "when the last report is older than 3 minutes").
 */
export const STALE_AFTER_MS = 3 * 60_000

export function isStale(s: HealthSample, now: number = Date.now()): boolean {
  return now - Date.parse(s.t) > STALE_AFTER_MS
}

function roundMs(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

/**
 * Tick time for display: "104 ms (98 to 131)" when the one-second min and max are
 * both present, "104 ms" when only the instantaneous figure is, "-" when nothing
 * was reported. tick_ms is the engine performance counter named `fps`, which is a
 * cycle DURATION in ms despite its name; it is never a frame rate, and the panel
 * must not source it from avg-update-period or getServerFPS() (migration 014).
 */
export function describeTick(s: Pick<HealthSample, 'tick_ms' | 'tick_min_ms' | 'tick_max_ms'>): string {
  if (s.tick_ms == null) return '-'
  const base = `${roundMs(s.tick_ms)} ms`
  if (s.tick_min_ms == null || s.tick_max_ms == null) return base
  return `${base} (${roundMs(s.tick_min_ms)} to ${roundMs(s.tick_max_ms)})`
}
