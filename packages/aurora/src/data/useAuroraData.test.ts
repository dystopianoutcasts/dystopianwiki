// Structural checks, not a runtime hook test: this vitest project's `test.environment`
// is 'node' (no jsdom), and this monorepo has no working React test setup anywhere -
// zero existing .test.tsx files. Rendering useAuroraData with @testing-library/react
// hits a pre-existing, out-of-scope problem: the repo root's package.json pins
// react@19.1.0 directly (nothing at the root actually renders React; this looks like
// a leftover) while react-dom stays at 18.3.1, hoisted from packages/web/aurora's
// ^18.3.1 range. react-dom's own internal require('react') resolves to the root's
// mismatched 19.1.0 copy regardless of Vite alias/dedupe/deps.inline settings, so any
// component or hook render throws "Cannot read properties of undefined (reading
// 'ReactCurrentDispatcher')". Fixing that means editing the repo root's package.json,
// which is outside this task's declared scope (Dystopian_Wiki, packages/aurora/ only).
// These tests instead assert directly on the source text, which still catches the two
// T19 mutations named in the task ("subscription left in", "health poll removed")
// deterministically and without the environment problem.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const useAuroraData = readFileSync(fileURLToPath(new URL('./useAuroraData.ts', import.meta.url)), 'utf8')
const mapPage = readFileSync(fileURLToPath(new URL('../pages/MapPage.tsx', import.meta.url)), 'utf8')

describe('T19: no realtime channel on the public map path', () => {
  it('useAuroraData never calls .channel(...) or imports the deleted realtime module', () => {
    expect(useAuroraData).not.toMatch(/\.channel\(/)
    expect(useAuroraData).not.toMatch(/subscribeAurora|from '\.\/realtime'|from '\.\.\/data\/realtime'/)
  })

  it('MapPage no longer wires up a realtime subscription', () => {
    expect(mapPage).not.toMatch(/\.channel\(/)
    expect(mapPage).not.toMatch(/subscribeAurora|from '\.\.\/data\/realtime'/)
  })
})

describe('T19: the health series is wired to a poll, not a push', () => {
  it('useAuroraData calls fetchHealthSince and feeds its result into the returned series', () => {
    expect(useAuroraData).toMatch(/fetchHealthSince/)
    // The health series is derived by folding the polled dataset's own `.data`, not
    // from a separately accumulated push-event array (the old `live`/`onHealthSample`
    // state). Anchored on `.reduce(` specifically: a bare `healthSince.data` mention
    // (e.g. in a `typeof` annotation) would still be true if the fold were deleted.
    expect(useAuroraData).toMatch(/healthSince\.data\.reduce\(/)
    expect(useAuroraData).not.toMatch(/onHealthSample|setLive\b/)
  })

  it('the health dataset polls, not a push-driven interval of null', () => {
    // T23: a live dataset - the full window via fetchHealthSince, deltas via
    // fetchHealthAfter, on the shared `live` intervals.
    const call = useAuroraData.match(/const healthSince = useLiveDataset\(\{[\s\S]*?\}\)/)?.[0] ?? ''
    expect(call).toMatch(/fetchFull: \(\) => fetchHealthSince\(/)
    expect(call).toMatch(/fetchSince: \(since\) => fetchHealthAfter\(/)
    // Append-only: deltas every LIVE_POLL_MS, and no periodic full refetch of the window.
    expect(call).toMatch(/liveMs: LIVE_POLL_MS,\s*fullMs: null/)
  })
})

describe('T34: health is for admins only (VISIBILITY.md)', () => {
  it('healthSince is enabled only for an admin', () => {
    const call = useAuroraData.match(/const healthSince = useLiveDataset\(\{[\s\S]*?\}\)/)?.[0] ?? ''
    expect(call).toMatch(/enabled: isAdmin,/)
  })

  it('healthLatest takes isAdmin as its enabled (first) argument', () => {
    expect(useAuroraData).toMatch(/const healthLatest = useDataset\(\s*isAdmin,/)
  })
})

describe('T23: live datasets poll at LIVE_POLL_MS with an INGEST_INTERVAL_MS self-heal', () => {
  it('the shared intervals are the two config constants', () => {
    expect(useAuroraData).toMatch(/const live = \{ liveMs: LIVE_POLL_MS, fullMs: INGEST_INTERVAL_MS \}/)
  })

  it('positions and roster are live datasets with a since-filtered delta', () => {
    for (const [name, fn] of [
      ['positions', 'fetchPositions'],
      ['profiles', 'fetchPlayerProfiles'],
    ]) {
      const call = useAuroraData.match(new RegExp(`const ${name} = useLiveDataset\\(\\{[\\s\\S]*?\\}\\)`))?.[0] ?? ''
      expect(call, name).toMatch(new RegExp(`fetchSince: \\(since\\) => ${fn}\\(client, serverId, since\\)`))
      expect(call, name).toMatch(/\.\.\.live/)
    }
  })

  it('the zombie grid stays at the ingest interval', () => {
    expect(useAuroraData).toMatch(/const grid = useDataset\([^\n]*INGEST_INTERVAL_MS\)/)
  })
})

describe('T34: vehicles are public (type and position); only an admin also gets the driver', () => {
  it('vehicles are enabled by the layer toggle alone, with no sign-in gate', () => {
    const call = useAuroraData.match(/const vehicles = useLiveDataset\(\{[\s\S]*?\}\)/)?.[0] ?? ''
    expect(call).toMatch(/enabled: prefs\.vehicles,/)
    expect(call).not.toMatch(/user/)
  })

  it('the fetch is chosen by role: fetchVehiclesAdmin (the RPC, always a full fetch) for an admin, fetchVehiclesPublic otherwise', () => {
    const call = useAuroraData.match(/const vehicles = useLiveDataset\(\{[\s\S]*?\}\)/)?.[0] ?? ''
    expect(call).toMatch(/isAdmin \? fetchVehiclesAdmin\(client, serverId\) : fetchVehiclesPublic\(client, serverId\)/)
    expect(call).toMatch(/isAdmin \? fetchVehiclesAdmin\(client, serverId\) : fetchVehiclesPublic\(client, serverId, since\)/)
    expect(call).toMatch(/fullMs: isAdmin \? LIVE_POLL_MS/)
  })

  it('vehicles refetch in full when the admin flag itself changes', () => {
    expect(useAuroraData).toMatch(/vehicles\.refresh\(\)/)
    const effect = useAuroraData.match(/useEffect\(\(\) => \{\s*vehicles\.refresh\(\)[\s\S]*?\}, \[isAdmin\]\)/)?.[0] ?? ''
    expect(effect).not.toBe('')
  })
})

describe('A-Life NPCs (migration 029): polling and role', () => {
  it('groups poll on the live interval, outposts on the slow one, each gated by its own toggle', () => {
    expect(useAuroraData).toMatch(/useDataset\(prefs\.npcGroups, \(\) => fetchNpcGroups\(client, serverId, isAdmin\), LIVE_POLL_MS\)/)
    expect(useAuroraData).toMatch(/useDataset\(prefs\.npcOutposts, \(\) => fetchNpcOutposts\(client, serverId, isAdmin\), SLOW_POLL_MS\)/)
  })

  it('both are refetched when the viewer signs in or out, or becomes an admin', () => {
    expect(useAuroraData.match(/npcGroups\.refresh\(\)/g)).toHaveLength(2)
    expect(useAuroraData.match(/npcOutposts\.refresh\(\)/g)).toHaveLength(2)
  })
})

describe('Deaths (migration 030): polling and role', () => {
  it('deaths ride the slow interval, gated by their toggle, with the role passed to the fetch', () => {
    expect(useAuroraData).toMatch(/useDataset\(prefs\.deaths, \(\) => fetchDeaths\(client, serverId, isAdmin\), SLOW_POLL_MS\)/)
  })

  it('deaths refetch on sign-in or out and when the admin flag changes', () => {
    expect(useAuroraData.match(/deaths\.refresh\(\)/g)).toHaveLength(2)
  })
})
