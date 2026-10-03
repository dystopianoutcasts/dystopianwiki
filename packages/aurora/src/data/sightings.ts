// T72: the "Spotted" notice's bookkeeping. Pure: which watched cars are new sightings, when the
// announced set may forget a car, and how the notice groups what it announces.
import type { Vehicle } from './types'
import { vehicleKey } from './live'
import { vehicleDisplayName } from './vehicleNames'

/**
 * One poll's worth of sightings. `matches` are the watched, unclaimed cars on the map now; `all` is
 * every vehicle row held. A FULL fetch (`full`) is the only evidence that a car is gone: then the
 * announced set is cut to the cars still held, so a car that leaves and comes back is announced
 * again. A delta never prunes (a car missing from a delta has only not moved). New = a match whose
 * key was never announced; it is announced once and remembered.
 */
export function stepSeen(
  seen: ReadonlySet<string>,
  matches: readonly Vehicle[],
  all: readonly Vehicle[],
  full: boolean,
): { seen: Set<string>; fresh: string[]; changed: boolean } {
  let next = new Set(seen)
  let changed = false
  if (full) {
    const held = new Set(all.map(vehicleKey))
    const kept = [...next].filter((k) => held.has(k))
    if (kept.length !== next.size) {
      next = new Set(kept)
      changed = true
    }
  }
  const fresh: string[] = []
  for (const v of matches) {
    const k = vehicleKey(v)
    if (next.has(k)) continue
    next.add(k)
    fresh.push(k)
    changed = true
  }
  return { seen: next, fresh, changed }
}

/** Unchecking a script forgets its cars, so checking it again announces them again. */
export function forgetScripts(seen: ReadonlySet<string>, vehicles: readonly Vehicle[], scripts: ReadonlySet<string>): Set<string> {
  const drop = new Set(vehicles.filter((v) => v.script_name != null && scripts.has(v.script_name)).map(vehicleKey))
  return new Set([...seen].filter((k) => !drop.has(k)))
}

export interface SpottedGroup {
  label: string
  /** The announced cars of this type that are still matches, in a stable order. */
  cars: Vehicle[]
}

/** The notice's groups: announced cars that are still matches, by car type, most first, then by name. */
export function spottedGroups(pending: readonly string[], matches: readonly Vehicle[], names: ReadonlyMap<string, string>): SpottedGroup[] {
  const want = new Set(pending)
  const groups = new Map<string, Vehicle[]>()
  for (const v of matches) {
    if (!want.has(vehicleKey(v))) continue
    const label = vehicleDisplayName(v.script_name, names)
    const list = groups.get(label) ?? []
    list.push(v)
    groups.set(label, list)
  }
  return [...groups.entries()]
    .map(([label, cars]) => ({ label, cars: cars.sort((a, b) => vehicleKey(a).localeCompare(vehicleKey(b))) }))
    .sort((a, b) => b.cars.length - a.cars.length || a.label.localeCompare(b.label))
}

/** How many car types the notice names before "and N more", so it stays within two lines on a phone. */
export const NOTICE_MAX_TYPES = 2

/** "Spotted: Chevalier Nyala (3)", "Spotted: Chevalier Nyala (3), Franklin Valuline (1) and 2 more types". */
export function spottedText(groups: readonly SpottedGroup[]): string {
  const named = groups.slice(0, NOTICE_MAX_TYPES).map((g) => `${g.label} (${g.cars.length})`).join(', ')
  const rest = groups.length - NOTICE_MAX_TYPES
  return `Spotted: ${named}${rest > 0 ? ` and ${rest} more ${rest === 1 ? 'type' : 'types'}` : ''}`
}
