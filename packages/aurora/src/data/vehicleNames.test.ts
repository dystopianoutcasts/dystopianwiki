import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NPC_RETRY_MS, fetchVehicleNames, resetNpcProbe } from './queries'
import { VEHICLE_NAMES_POLL_MS, VEHICLE_NAMES_VIEW, tidyScriptName, vehicleDisplayName, vehicleNameMap } from './vehicleNames'
import { vehicleFeatures } from '../layers/transform'

describe('tidyScriptName', () => {
  it.each([
    ['Base.CarTaxi', 'Car Taxi'],
    ['Base.93fordF350', '93 ford F350'],
    ['Base.82oshkoshM911', '82 oshkosh M911'],
    ['Base.PickUpTruck', 'Pick Up Truck'],
    ['Base.VanAmbulance', 'Van Ambulance'],
    ['Base.XMLHttpCar', 'XML Http Car'],
    ['Base.Pickup_Truck', 'Pickup Truck'],
    ['CarTaxi', 'Car Taxi'],
  ])('%s -> %s', (script, want) => {
    expect(tidyScriptName(script)).toBe(want)
  })
})

describe('the name join', () => {
  const names = vehicleNameMap([
    { script_name: 'Base.CarTaxi', display_name: 'Chevalier Nyala Taxi' },
    { script_name: 'Base.Blank', display_name: '   ' },
  ])

  it('a catalogue entry wins over the tidy name', () => {
    expect(vehicleDisplayName('Base.CarTaxi', names)).toBe('Chevalier Nyala Taxi')
  })
  it('no entry, or a blank one, falls back to the tidy name; null is "Vehicle"', () => {
    expect(vehicleDisplayName('Base.VanAmbulance', names)).toBe('Van Ambulance')
    expect(vehicleDisplayName('Base.Blank', names)).toBe('Blank')
    expect(vehicleDisplayName(null, names)).toBe('Vehicle')
  })
  it('the tooltip label and the claimed label use the display name', () => {
    const car = { server_id: 's', vehicle_id: 1, script_name: 'Base.CarTaxi', x: 1, y: 2, z: 0, t: null, driver_username: null }
    const [plain] = vehicleFeatures([car], [], 'account', names)
    expect(plain.label).toBe('Chevalier Nyala Taxi')
    const [claimed] = vehicleFeatures([{ ...car, claimed_by: 'ann' }], [], 'account', names)
    expect(claimed.label).toBe('Chevalier Nyala Taxi - claimed by ann')
  })
  it('refreshes every 30 minutes', () => {
    expect(VEHICLE_NAMES_POLL_MS).toBe(30 * 60_000)
  })
})

describe('the missing-view fallback', () => {
  const MISSING = { code: 'PGRST205', message: "Could not find the table 'aurora.vehicle_names_visible' in the schema cache" }
  function db(result: { data: unknown; error: { message: string; code?: string } | null }) {
    const log: string[] = []
    const client = {
      from: (t: string) => {
        log.push(`from(${t})`)
        return { select: (c: string) => { log.push(`select(${c})`); return Promise.resolve(result) } }
      },
    } as unknown as SupabaseClient
    return { client, log }
  }
  beforeEach(() => {
    resetNpcProbe()
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('reads the view and returns its rows', async () => {
    const rows = [{ script_name: 'Base.CarTaxi', display_name: 'Taxi' }]
    const { client, log } = db({ data: rows, error: null })
    expect(await fetchVehicleNames(client)).toEqual(rows)
    expect(log[0]).toBe(`from(${VEHICLE_NAMES_VIEW})`)
  })

  it('a missing view is empty with no error, and is not asked again for 5 minutes', async () => {
    vi.useFakeTimers()
    const { client, log } = db({ data: null, error: MISSING })
    expect(await fetchVehicleNames(client)).toEqual([])
    expect(await fetchVehicleNames(client)).toEqual([])
    expect(log.filter((l) => l.startsWith('from('))).toHaveLength(1)
    vi.advanceTimersByTime(NPC_RETRY_MS)
    await fetchVehicleNames(client)
    expect(log.filter((l) => l.startsWith('from('))).toHaveLength(2)
  })

  it('any other error is real and thrown', async () => {
    const { client } = db({ data: null, error: { message: 'boom', code: '500' } })
    await expect(fetchVehicleNames(client)).rejects.toThrow('vehicle names: boom')
  })
})
