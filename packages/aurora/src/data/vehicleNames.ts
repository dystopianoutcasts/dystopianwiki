// Vehicle display names: a public catalogue (script_name -> display_name) from migration
// 031, with a tidied script name as the fallback for a car the catalogue does not list.

import type { VehicleName } from './types'

/** The public view carrying the catalogue (migration 031); columns script_name, display_name. */
export const VEHICLE_NAMES_VIEW = 'vehicle_names_visible'
export const VEHICLE_NAME_COLUMNS = 'script_name,display_name'
/** The catalogue rarely changes, so it is read once on load and then this often. */
export const VEHICLE_NAMES_POLL_MS = 30 * 60_000

/** script_name -> display_name; rows with a blank name are dropped so they fall back to the tidy name. */
export function vehicleNameMap(rows: VehicleName[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const r of rows) {
    const name = r.display_name?.trim()
    if (r.script_name && name) m.set(r.script_name, name)
  }
  return m
}

/**
 * "Base.CarTaxi" -> "Car Taxi", "Base.93fordF350" -> "93 ford F350". Drops the module
 * prefix, turns underscores into spaces, and splits at lower->Upper ("PickUp"), at an
 * acronym's end ("XMLHttp" -> "XML Http") and at digit->letter ("93ford"). Letter->digit is
 * left alone so model codes stay whole ("F350", "M911").
 */
export function tidyScriptName(script: string): string {
  const bare = script.slice(script.lastIndexOf('.') + 1)
  return bare
    .replace(/_+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The catalogue name when there is one, else the tidied script name, else "Vehicle". */
export function vehicleDisplayName(script: string | null, names: ReadonlyMap<string, string>): string {
  if (!script) return 'Vehicle'
  return names.get(script) ?? (tidyScriptName(script) || 'Vehicle')
}
