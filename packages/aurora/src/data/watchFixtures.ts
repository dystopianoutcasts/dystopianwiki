// T72 test fixtures (imported by the *.test.ts files only; never by the app).
import type { Vehicle } from './types'

let nextId = 1

/** A vehicle row as the public view returns it, unclaimed and loaded, with a unique id and position. */
export function car(script: string | null, extra: Partial<Vehicle> = {}): Vehicle {
  const id = nextId++
  return { server_id: 's', vehicle_id: id, script_name: script, x: 100 + id, y: 200 + id, z: 0, t: '2026-10-03T10:00:00Z', driver_username: null, claimed_by: null, sql_id: 1000 + id, from_ledger: false, ...extra }
}
