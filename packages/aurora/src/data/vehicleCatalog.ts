// T72 "Watch for a car": the catalogue of cars a signed-in viewer can pick, the fuzzy search over
// it, and which cars on the map match the picks. Pure: no React, no Leaflet, no requests.
import Fuse from 'fuse.js'
import type { Expression } from 'fuse.js'
import type { Vehicle } from './types'
import { vehicleDisplayName } from './vehicleNames'

/**
 * Whether a car somebody has claimed (`claimed_by` set, which includes every car drawn from the
 * claim ledger) counts as a match. Planner default: no, it is taken. One constant so the owner's
 * call is a one-line flip.
 */
export const WATCH_INCLUDES_CLAIMED = false

/** One pickable car type: one vehicle SCRIPT ("Base.StepVan_Glass"), never a family. */
export interface CatalogEntry {
  script: string
  /** The display name (vehicle_names_visible), else the tidied script name. */
  label: string
  /** The script id without its module ("StepVan_Glass"): shown on every row and searched. */
  detail: string
  /** Burnt and smashed scripts: hidden from the checklist unless "Show wrecks" is on. */
  wreck: boolean
  /** How many matching (unclaimed) cars of this script are on the map now. */
  onMap: number
}

const WRECK = /burnt|smashed/i

export function scriptDetail(script: string): string {
  return script.slice(script.lastIndexOf('.') + 1)
}

export function isWreck(script: string): boolean {
  return WRECK.test(script)
}

/** A row that may be a match by the claim rule alone (its script is checked separately). */
function matchable(v: Vehicle, includeClaimed: boolean): boolean {
  if (includeClaimed) return true
  return v.claimed_by == null && v.from_ledger !== true
}

/** The cars on the map whose script is watched and which nobody has claimed (WATCH_INCLUDES_CLAIMED). */
export function matchWatched(vehicles: readonly Vehicle[], watching: ReadonlySet<string>, includeClaimed: boolean = WATCH_INCLUDES_CLAIMED): Vehicle[] {
  if (watching.size === 0) return []
  return vehicles.filter((v) => v.script_name != null && watching.has(v.script_name) && matchable(v, includeClaimed))
}

/** The rows split for drawing: a match is drawn ONCE, in the watched layer, never also as an ordinary car. */
export function splitWatched(vehicles: readonly Vehicle[], watching: ReadonlySet<string>, includeClaimed: boolean = WATCH_INCLUDES_CLAIMED): { ordinary: Vehicle[]; matches: Vehicle[] } {
  const matches = matchWatched(vehicles, watching, includeClaimed)
  if (matches.length === 0) return { ordinary: [...vehicles], matches }
  const taken = new Set(matches)
  return { ordinary: vehicles.filter((v) => !taken.has(v)), matches }
}

/** script -> how many matchable cars of it are on the map. */
function countOnMap(vehicles: readonly Vehicle[], includeClaimed: boolean): Map<string, number> {
  const counts = new Map<string, number>()
  for (const v of vehicles) {
    if (v.script_name == null || !matchable(v, includeClaimed)) continue
    counts.set(v.script_name, (counts.get(v.script_name) ?? 0) + 1)
  }
  return counts
}

function entry(script: string, names: ReadonlyMap<string, string>, counts: ReadonlyMap<string, number>): CatalogEntry {
  return { script, label: vehicleDisplayName(script, names), detail: scriptDetail(script), wreck: isWreck(script), onMap: counts.get(script) ?? 0 }
}

function byLabel(a: CatalogEntry, b: CatalogEntry): number {
  return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }) || a.script.localeCompare(b.script)
}

/**
 * "All cars available on the server": the scripts the game server reported (vehicle_scripts_visible)
 * when there are any, else the scripts the name table knows; then every distinct script seen on the
 * map, so a mod car with no name row that has been seen is always listed. Sorted by label, then script.
 */
export function buildCatalog(
  serverScripts: readonly string[],
  names: ReadonlyMap<string, string>,
  vehicles: readonly Vehicle[],
  includeClaimed: boolean = WATCH_INCLUDES_CLAIMED,
): CatalogEntry[] {
  const scripts = new Set<string>(serverScripts.length > 0 ? serverScripts : names.keys())
  for (const v of vehicles) if (v.script_name) scripts.add(v.script_name)
  const counts = countOnMap(vehicles, includeClaimed)
  return [...scripts].filter((s) => s.trim() !== '').map((s) => entry(s, names, counts)).sort(byLabel)
}

/**
 * The "Watching" list: every watched script, as its catalogue entry when there is one, else built on
 * the spot (a mod was removed and the script is gone from the catalogue: it must still be uncheckable).
 */
export function watchingEntries(
  watching: ReadonlySet<string>,
  catalog: readonly CatalogEntry[],
  names: ReadonlyMap<string, string>,
  vehicles: readonly Vehicle[],
  includeClaimed: boolean = WATCH_INCLUDES_CLAIMED,
): CatalogEntry[] {
  const known = new Map(catalog.map((e) => [e.script, e]))
  const counts = countOnMap(vehicles, includeClaimed)
  return [...watching].map((s) => known.get(s) ?? entry(s, names, counts)).sort(byLabel)
}

/**
 * Fuzzy search (fuse.js). The threshold is chosen by the tests in vehicleCatalog.test.ts: "nyalla" and
 * "chev nyala" find Chevalier Nyala, "f350" finds 93fordF350, "stepvan glass" finds StepVan_Glass,
 * "zzzz" finds nothing, and a three-letter word ("van") allows no typo (at 0.34 and above it matched
 * every name with a "v" or an "an" in it). 0.3 lets one typo through in four letters.
 *
 * Each word of the query is matched on its own, in the label or the script id, and every word must
 * match (fuse.js logical query: $and of $or), so "chev nyala" finds "Chevalier Nyala" although the
 * two words are not next to each other there, and word order does not matter.
 */
export const SEARCH_THRESHOLD = 0.3

export function searchCatalog(query: string, entries: readonly CatalogEntry[]): CatalogEntry[] {
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return [...entries]
  const fuse = new Fuse(entries as CatalogEntry[], {
    keys: [
      { name: 'label', weight: 0.7 },
      { name: 'detail', weight: 0.3 },
    ],
    ignoreLocation: true,
    threshold: SEARCH_THRESHOLD,
  })
  const perWord = (w: string): Expression => {
    const inLabel: Expression = { label: w }
    const inDetail: Expression = { detail: w }
    return { $or: [inLabel, inDetail] }
  }
  const results = words.length === 1 ? fuse.search(words[0]) : fuse.search({ $and: words.map(perWord) })
  return results.map((r) => r.item)
}
