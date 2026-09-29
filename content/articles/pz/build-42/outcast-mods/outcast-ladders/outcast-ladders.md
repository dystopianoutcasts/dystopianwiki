---
id: build-42-outcast-ladders
slug: outcast-ladders
title: Outcast Ladders
game: pz
version: build-42
section: outcast-mods
category: outcast-ladders
difficulty: beginner
tags:
  - outcast-ladders
  - ladders
  - overview
excerpt: >-
  A Project Zomboid Build 42 mod that lets you climb the ladders already in the
  world.
last_updated: '2026-09-29'
---
# Outcast Ladders

> Source: OutcastLadders/README.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A Project Zomboid **Build 42** mod that lets you climb the ladders already in the
world.

The game is full of ladder sprites. They are decoration — you walk past them.
Vanilla has no climbing for them, even though the engine can already climb sheet
ropes and the tile definitions already say which sprites are ladders.

**Status: built, not yet tested in game.**

---

## The approach

**Reuse the engine's sheet-rope climb, do not write a new one.** Tagging a ladder
sprite with `climbSheetW`/`climbSheetN`/`climbSheetE`/`climbSheetS` makes the
existing `ClimbSheetRopeState` work on it — inheriting animation, pathing and
network behaviour rather than reimplementing them.

That part is prior art and it is the right call. See
docs/RESEARCH.md (local reference: RESEARCH.md).

**Find the ladders, do not list them.** Existing mods hardcode sprite names —
one ships 34 literal names plus a 62-entry generated loop, padded with other
mods' tiles. Any ladder not on the list silently does not work.

Vanilla already marks its ladders in the tile definitions:

```
// carpentry_02_84
tile {
    CustomName = Ladders
    Facing = E
    ladderW =
}
```

and those properties are queryable from Lua with no registration, because
`IsoWorld` interns every property name it finds in every loaded tileset. So we
discover ladders instead of enumerating them — which covers **modded ladders for
free** and never goes stale.

---

## What we intend to do better

| existing mods | here |
|---------------|------|
| hardcoded sprite name lists | discover via the `ladder*` tile property |
| only West and North handled | all four — `climbSheetE`/`S` exist in the engine |
| monkey-patch vanilla timed actions | no patching of vanilla globals |
| square-walk on every Interact keypress | only act when there is a ladder |
| module-global "last player to climb" | state on the character, split-screen safe |
| magic sprite IDs from another mod's range | no invented sprite IDs if avoidable |
| client-only, no `OnServerStarted` | decide the MP split deliberately, up front |

---

## Documentation

| doc | contents |
|-----|----------|
| docs/RESEARCH.md (local reference: RESEARCH.md) | the three existing mods, how they work, what is wrong, and the engine chain that makes discovery possible |
| [docs/ANIMATION.md](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation) | the ladder climb clip, how it is selected, and what is still untuned |

Rationale lives in `docs/`, not in source comments.

**One naming inconsistency, left deliberately.** The animation clip is called
`Bob_NF_LadderClimb` while everything else here uses `OCL_`. The name lives
inside the `.X`, so changing it needs the Blender action renamed and the clip
re-exported — not a file rename. Flagged rather than quietly kept; see
[docs/ANIMATION.md](/pz/build-42/outcast-mods/outcast-ladders/naming).

---

## Development

```powershell
scripts\install-junctions.ps1     # point the game at this working tree
scripts\validate-lua.ps1          # reject B41-era API calls and unreal flag names
scripts\validate-anims.ps1        # clip names, both climb directions, anim variables
scripts\install-junctions.ps1 -Remove
```

Then launch, enable **Outcast Ladders** in the mod list, and watch the console
for `[OutcastLadders] engine contract OK`.

In the in-game Lua console:

| command | does |
|---------|------|
| `OutcastLadders.dump()` | contract status, how much has been tagged, and the flags on the square you are standing on |
| `OutcastLadders.column()` | per level: ladder or not, the flags the engine sees, and **both** gates that decide the dismount |
| `OutcastLadders.trace(true)` | one line per tick during a climb — position, direction, and the `ClimbFence*` state |
| `OutcastLadders.scan(3)` | force a sweep, for testing a ladder you just placed |

Run with `-debug` for per-square detail.
