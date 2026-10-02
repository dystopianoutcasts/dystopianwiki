import { describe, expect, it } from 'vitest'
import type { Death, PlayerPublic } from '../data/types'
import { deathFeatures, describeAgeWords, latestDeaths } from './transform'

const NOW = Date.parse('2026-10-02T12:00:00Z')
const HOUR = 3_600_000

function death(over: Partial<Death> = {}): Death {
  return { server_id: 's', username: 'ann', x: 100, y: 200, z: 0, t: new Date(NOW - 3 * HOUR).toISOString(), hours_survived: 28.7, ...over }
}

function profile(username: string, display_name: string | null): PlayerPublic {
  return { server_id: 's', username, display_name, last_seen: null, online: false, hours_survived: null, is_dead: null }
}

describe('latest death per player (admin rows hold every death)', () => {
  it('keeps the newest row per username, whatever the order, and counts them', () => {
    const rows = [
      death({ t: '2026-10-01T10:00:00Z', x: 1 }),
      death({ t: '2026-10-02T10:00:00Z', x: 2 }),
      death({ t: '2026-09-20T10:00:00Z', x: 3 }),
      death({ username: 'bob', t: '2026-09-01T10:00:00Z', x: 9 }),
    ]
    const { latest, counts } = latestDeaths(rows)
    expect(latest.map((d) => [d.username, d.x])).toEqual([['ann', 2], ['bob', 9]])
    expect(counts.get('s/ann')).toBe(3)
    expect(counts.get('s/bob')).toBe(1)
  })

  it('keeps servers apart, and a row with an unreadable time loses to one with a time', () => {
    const { latest } = latestDeaths([death({ t: 'garbage', x: 1 }), death({ t: '2026-01-01T00:00:00Z', x: 2 }), death({ server_id: 'other', x: 3 })])
    expect(latest.map((d) => d.x).sort()).toEqual([2, 3])
  })
})

describe('death marker label', () => {
  it('reads "<name> died here - <age> - survived N h", keyed per server and player, placed at [y, x]', () => {
    const [f] = deathFeatures([death()], [], 'account', false, NOW)
    expect(f.label).toBe('ann died here - 3 hours ago - survived 28 h')
    expect(f.key).toBe('death/s/ann')
    expect(f.latlng).toEqual([200, 100])
  })

  it('resolves the name like other player names: character mode shows the display name, account mode the username', () => {
    const profiles = [profile('ann', 'Annie')]
    expect(deathFeatures([death()], profiles, 'character', false, NOW)[0].label).toMatch(/^Annie died here/)
    expect(deathFeatures([death()], profiles, 'account', false, NOW)[0].label).toMatch(/^ann died here/)
    expect(deathFeatures([death()], [profile('ann', null)], 'character', false, NOW)[0].label).toMatch(/^ann died here/)
  })

  it('leaves out hours survived when unknown', () => {
    expect(deathFeatures([death({ hours_survived: null })], [], 'account', false, NOW)[0].label).toBe('ann died here - 3 hours ago')
  })

  it('says "died N times" for an admin from two deaths up, never for the public, and draws one marker per player', () => {
    const rows = [death(), death({ t: '2026-09-01T00:00:00Z' }), death({ t: '2026-08-01T00:00:00Z' })]
    const admin = deathFeatures(rows, [], 'account', true, NOW)
    expect(admin).toHaveLength(1)
    expect(admin[0].label).toBe('ann died here - 3 hours ago - survived 28 h - died 3 times')
    expect(deathFeatures(rows, [], 'account', false, NOW)[0].label).not.toMatch(/times/)
    expect(deathFeatures([death()], [], 'account', true, NOW)[0].label).not.toMatch(/times/)
  })
})

describe('relative time in words', () => {
  const ago = (ms: number) => describeAgeWords(new Date(NOW - ms).toISOString(), NOW)
  it('uses minutes, hours and days with the right plural', () => {
    expect(ago(10_000)).toBe('just now')
    expect(ago(60_000)).toBe('1 minute ago')
    expect(ago(59 * 60_000)).toBe('59 minutes ago')
    expect(ago(HOUR)).toBe('1 hour ago')
    expect(ago(3 * HOUR)).toBe('3 hours ago')
    expect(ago(24 * HOUR)).toBe('1 day ago')
    expect(ago(49 * HOUR)).toBe('2 days ago')
    expect(ago(400 * 24 * HOUR)).toBe('400 days ago')
  })
  it('reads a future time as "just now"', () => {
    expect(ago(-5 * HOUR)).toBe('just now')
  })
})
