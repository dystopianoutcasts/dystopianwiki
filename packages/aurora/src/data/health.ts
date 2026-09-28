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

/** Newest of two samples, treating null as older than anything. */
export function newest(a: HealthSample | null, b: HealthSample | null): HealthSample | null {
  if (!a) return b
  if (!b) return a
  return Date.parse(b.t) >= Date.parse(a.t) ? b : a
}

/** Memory used as a whole percentage, or null when either figure is missing or the maximum is zero. */
export function memoryPercent(s: HealthSample): number | null {
  if (s.memory_used == null || s.memory_max == null || s.memory_max <= 0) return null
  return Math.round((s.memory_used / s.memory_max) * 100)
}

/** A server that has not posted a sample for this long is treated as offline in the panel. */
export const STALE_AFTER_MS = 5 * 60_000

export function isStale(s: HealthSample, now: number = Date.now()): boolean {
  return now - Date.parse(s.t) > STALE_AFTER_MS
}
