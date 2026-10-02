import { describe, expect, it } from 'vitest'
import type { NpcGroup, NpcOutpost } from '../data/types'
import { npcGroupFeatures, npcOutpostFeatures } from './transform'

function group(over: Partial<NpcGroup> = {}): NpcGroup {
  return {
    server_id: 's', group_id: 'g1', faction_name: 'Raiders', stance: 'hostile', size: 4,
    x: 100, y: 200, z: 0, active: true, t: null, ...over,
  }
}

function outpost(over: Partial<NpcOutpost> = {}): NpcOutpost {
  return {
    server_id: 's', outpost_id: 'o1', faction_name: 'Raiders', stance: 'hostile', hostile: true,
    x1: 10, y1: 20, x2: 30, y2: 50, t: null, ...over,
  }
}

describe('A-Life NPC groups', () => {
  it('states faction, size and stance in words for every stance', () => {
    for (const stance of ['hostile', 'careful', 'neutral', 'friendly', 'allied']) {
      const [f] = npcGroupFeatures([group({ stance })])
      expect(f.label).toBe(`Raiders - 4 members - ${stance}`)
      expect(f.stance).toBe(stance)
    }
  })

  it('keys by server and group, places at [y, x], and carries the size for the marker', () => {
    const [f] = npcGroupFeatures([group()])
    expect(f.key).toBe('npc/s/g1')
    expect(f.latlng).toEqual([200, 100])
    expect(f.size).toBe(4)
  })

  it('says "1 member" for a lone NPC and copes with no stance or an unknown one', () => {
    expect(npcGroupFeatures([group({ size: 1 })])[0].label).toBe('Raiders - 1 member - hostile')
    const none = npcGroupFeatures([group({ stance: null }), group({ stance: 'feral' })])
    expect(none.map((f) => f.stance)).toEqual([null, null])
    expect(none[0].label).toBe('Raiders - 4 members - stance unknown')
  })

  it('flags a dormant group and says so in the tooltip text', () => {
    const [live, dormant] = npcGroupFeatures([group(), group({ group_id: 'g2', active: false, stance: 'friendly' })])
    expect(live.active).toBe(true)
    expect(live.label).not.toMatch(/not near any player/)
    expect(dormant.active).toBe(false)
    expect(dormant.label).toBe('Raiders - 4 members - friendly - not near any player')
  })

  it('shows encounter and source only when the admin row carries them', () => {
    const [pub] = npcGroupFeatures([group()])
    expect(pub.label).not.toMatch(/encounter|source|admin only/)
    const [adm] = npcGroupFeatures([group({ encounter: 'ambush', source: 'squad', faction_id: 'f9' })])
    expect(adm.label).toBe('Raiders - 4 members - hostile - encounter ambush - source squad')
    expect(adm.adminOnly).toBe(false)
  })

  it('marks a sensitive group admin only, in the label and the flag', () => {
    const [f] = npcGroupFeatures([group({ sensitive: true })])
    expect(f.adminOnly).toBe(true)
    expect(f.label).toMatch(/admin only/)
  })
})

describe('A-Life NPC outposts', () => {
  it('converts the corners to a [y, x] rectangle, whichever order they come in', () => {
    const [a, b] = npcOutpostFeatures([outpost(), outpost({ x1: 30, y1: 50, x2: 10, y2: 20 })])
    expect(a.bounds).toEqual([[20, 10], [51, 31]])
    expect(b.bounds).toEqual(a.bounds)
    expect(a.key).toBe('npco/s/o1')
  })

  it('labels "<faction> outpost" and adds "hostile to players" only when hostile', () => {
    const [h, f] = npcOutpostFeatures([outpost(), outpost({ hostile: false, stance: 'friendly' })])
    expect(h.label).toBe('Raiders outpost - hostile to players')
    expect(f.label).toBe('Raiders outpost')
    expect(h.hostile).toBe(true)
    expect(f.hostile).toBe(false)
  })

  it('adds state and an admin-only note from the admin row', () => {
    const [f] = npcOutpostFeatures([outpost({ state: 'abandoned', hidden: true })])
    expect(f.label).toBe('Raiders outpost - hostile to players - state abandoned - admin only - hidden from the public map')
  })
})
