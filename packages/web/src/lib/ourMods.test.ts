/**
 * Tests for ourMods: the mods the home page shows, their grouping, the live badge and names.
 *
 * node:test, run with `npx tsx --test src/lib/ourMods.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import ourMods from '../data/ourMods.json'
import {
  GROUP_ORDER,
  groupMods,
  guideSlug,
  isOnServer,
  liveModIds,
  steamUrl,
  tidyName,
  visibleMods,
  type ModGroup,
  type OurMod,
} from './ourMods'

function mod(id: string, group: ModGroup): OurMod {
  return { id, workshopId: '1', name: id, group, blurb: 'A mod.', poster: null }
}

test('OutcastAurora, OutcastLib and OutcastStowAll never appear, even when the data holds them', () => {
  const data = [
    mod('OutcastPunch', 'Outcast'),
    mod('OutcastAurora', 'Outcast'),
    mod('OutcastLib', 'Outcast'),
    mod('OutcastStowAll', 'Outcast'),
    mod('outcastaurora', 'Dystopian'),
  ]
  assert.deepEqual(visibleMods(data).map((m) => m.id), ['OutcastPunch'])
  const shown = groupMods(data).flatMap((g) => g.mods.map((m) => m.id))
  assert.deepEqual(shown, ['OutcastPunch'])
})

test('the shipped list holds none of the three and every entry has a Steam link and a known group', () => {
  const all = ourMods as OurMod[]
  assert.equal(visibleMods(all).length, all.length)
  for (const m of all) {
    assert.ok(GROUP_ORDER.includes(m.group), m.id)
    assert.match(steamUrl(m.workshopId), /^https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id=\d+$/)
  }
})

test('groups come in the fixed order, whatever the order of the data, and empty groups are left out', () => {
  const data = [
    mod('SquirrellyIndustries', 'Squirrelly Industries'),
    mod('CosmicSolar', 'Cosmic'),
    mod('DystopianGym', 'Dystopian'),
    mod('OutcastPunch', 'Outcast'),
    mod('OutcastLadders', 'Outcast'),
  ]
  const groups = groupMods(data)
  assert.deepEqual(groups.map((g) => g.group), ['Outcast', 'Dystopian', 'Cosmic', 'Squirrelly Industries'])
  assert.deepEqual(groups[0].mods.map((m) => m.id), ['OutcastPunch', 'OutcastLadders'])
  assert.deepEqual(groupMods([mod('CosmicSolar', 'Cosmic')]).map((g) => g.group), ['Cosmic'])
})

test('the live badge matches case-insensitively', () => {
  const live = liveModIds(['DystopianVehicleClaim', ' OutcastPunch ', ''])
  assert.equal(isOnServer(live, 'dystopianvehicleclaim'), true)
  assert.equal(isOnServer(live, 'OUTCASTPUNCH'), true)
  assert.equal(isOnServer(live, 'OutcastLadders'), false)
})

test('the live list reads a ";" string, and anything else as empty', () => {
  assert.equal(isOnServer(liveModIds('OutcastPunch;CosmicSolar'), 'cosmicsolar'), true)
  assert.equal(liveModIds(undefined).size, 0)
  assert.equal(liveModIds(42).size, 0)
  assert.equal(liveModIds([1, null]).size, 0)
})

test('names are tidied, and a name that already has spaces is kept', () => {
  assert.equal(tidyName('DystopianTinkering'), 'Dystopian Tinkering')
  assert.equal(tidyName('SquirrellyIndustries'), 'Squirrelly Industries')
  assert.equal(tidyName('DystopianArsenal '), 'Dystopian Arsenal')
  assert.equal(tidyName('Dystopian QoL'), 'Dystopian QoL')
  assert.equal(tidyName('MRAPMC'), 'MRAPMC')
})

test('a guide slug is the wiki category id of the mod', () => {
  assert.equal(guideSlug('OutcastLightLoad'), 'outcast-light-load')
  assert.equal(guideSlug('OutcastMotorsUI'), 'outcast-motors-ui')
  assert.equal(guideSlug('OutcastPunch'), 'outcast-punch')
})

test('every poster has its size and its file under public/', () => {
  for (const m of ourMods as OurMod[]) {
    if (!m.poster) continue
    assert.ok(m.posterWidth && m.posterHeight, `${m.id} has no posterWidth/posterHeight`)
    assert.ok(fs.existsSync(path.join(process.cwd(), 'public', m.poster)), `${m.id}: ${m.poster} is missing`)
  }
})

test('every blurb is one short sentence of at most 140 characters', () => {
  for (const m of ourMods as OurMod[]) {
    assert.ok(m.blurb.length > 0 && m.blurb.length <= 140, `${m.id}: ${m.blurb.length} characters`)
  }
})
