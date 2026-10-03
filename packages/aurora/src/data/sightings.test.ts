// T72: the "Spotted" notice's rules: announce once, forget on uncheck, prune only after a full fetch.
import { describe, expect, it } from 'vitest'
import { vehicleKey } from './live'
import { forgetScripts, spottedGroups, spottedText, stepSeen } from './sightings'
import { car } from './watchFixtures'

const NAMES = new Map([
  ['Base.CarNormal', 'Chevalier Nyala'],
  ['Base.Van', 'Franklin Valuline'],
  ['Base.SUV', 'Dash Bulldriver'],
])

describe('T72: new sightings', () => {
  it('a match is announced once; the next poll with the same car announces nothing', () => {
    const a = car('Base.Van')
    const first = stepSeen(new Set(), [a], [a], true)
    expect(first.fresh).toEqual([vehicleKey(a)])
    const second = stepSeen(first.seen, [a], [a], false)
    expect(second.fresh).toEqual([])
    expect(second.changed).toBe(false)
    const third = stepSeen(second.seen, [a], [a], true)
    expect(third.fresh).toEqual([])
  })

  it('checking a script that already has cars on the map announces all of them at once', () => {
    const cars = [car('Base.CarNormal'), car('Base.CarNormal'), car('Base.CarNormal')]
    expect(stepSeen(new Set(), cars, cars, false).fresh).toHaveLength(3)
  })

  it('a delta never prunes: a car missing from the held rows stays announced', () => {
    const a = car('Base.Van')
    const seen = new Set([vehicleKey(a)])
    const step = stepSeen(seen, [], [], false)
    expect(step.seen.has(vehicleKey(a))).toBe(true)
    expect(step.changed).toBe(false)
  })

  it('a full fetch prunes cars no longer held, so a car that comes back is announced again', () => {
    const a = car('Base.Van')
    const b = car('Base.Van')
    const seen = new Set([vehicleKey(a), vehicleKey(b)])
    const pruned = stepSeen(seen, [b], [b], true)
    expect([...pruned.seen]).toEqual([vehicleKey(b)])
    expect(pruned.changed).toBe(true)
    expect(stepSeen(pruned.seen, [a, b], [a, b], false).fresh).toEqual([vehicleKey(a)])
  })

  it('a full fetch keeps a car that is still held even if it is no longer a match (claimed meanwhile)', () => {
    const a = car('Base.Van', { claimed_by: 'ann' })
    const step = stepSeen(new Set([vehicleKey(a)]), [], [a], true)
    expect(step.seen.has(vehicleKey(a))).toBe(true)
  })

  it('unchecking a script forgets its cars, so checking it again announces them again', () => {
    const a = car('Base.Van')
    const n = car('Base.CarNormal')
    const seen = new Set([vehicleKey(a), vehicleKey(n)])
    const after = forgetScripts(seen, [a, n], new Set(['Base.Van']))
    expect([...after]).toEqual([vehicleKey(n)])
    expect(stepSeen(after, [a], [a, n], false).fresh).toEqual([vehicleKey(a)])
  })
})

describe('T72: the notice text', () => {
  it('groups by car type, most first: "Spotted: Chevalier Nyala (3)"', () => {
    const nyalas = [car('Base.CarNormal'), car('Base.CarNormal'), car('Base.CarNormal')]
    const van = car('Base.Van')
    const all = [...nyalas, van]
    const groups = spottedGroups(all.map(vehicleKey), all, NAMES)
    expect(groups.map((g) => [g.label, g.cars.length])).toEqual([
      ['Chevalier Nyala', 3],
      ['Franklin Valuline', 1],
    ])
    expect(spottedText(groups.slice(0, 1))).toBe('Spotted: Chevalier Nyala (3)')
    expect(spottedText(groups)).toBe('Spotted: Chevalier Nyala (3), Franklin Valuline (1)')
  })

  it('names two types, then "and N more", so it stays short on a phone', () => {
    const all = [car('Base.CarNormal'), car('Base.Van'), car('Base.SUV'), car('Base.Mystery')]
    expect(spottedText(spottedGroups(all.map(vehicleKey), all, NAMES))).toMatch(/^Spotted: .+ \(1\), .+ \(1\) and 2 more types$/)
  })

  it('only announced cars that are still matches are listed', () => {
    const a = car('Base.Van')
    const b = car('Base.Van')
    expect(spottedGroups([vehicleKey(a)], [a, b], NAMES)).toEqual([{ label: 'Franklin Valuline', cars: [a] }])
    expect(spottedGroups([vehicleKey(a)], [b], NAMES)).toEqual([])
  })
})
