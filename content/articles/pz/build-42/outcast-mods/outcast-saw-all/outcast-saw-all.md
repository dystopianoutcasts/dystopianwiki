---
id: build-42-outcast-saw-all
slug: outcast-saw-all
title: Outcast Saw All
game: pz
version: build-42
section: outcast-mods
category: outcast-saw-all
difficulty: beginner
tags:
  - outcast-saw-all
  - crafting
  - overview
excerpt: >-
  A Project Zomboid Build 42 mod. One context-menu button that saws every log
  you can get to -- in your inventory, in your bags, in crates and corpses
  around you, and lying on the ground.
last_updated: '2026-09-29'
---
# Outcast Saw All

> Source: OutcastSawAll/README.md (compiled 2026-08-06, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A Project Zomboid **Build 42** mod. One context-menu button that saws every log
you can get to -- in your inventory, in your bags, in crates and corpses around
you, and lying on the ground.

Right-click anything in your inventory and you get **Saw All Logs (n)**, where
`n` is exactly how many logs will be sawn. Log bundles are untied first and
counted as their contents.

Every saw is the ordinary vanilla `SawLogs` craft and every untie is the ordinary
vanilla unstack, so woodwork XP, saw degradation and multiplayer syncing are
untouched. No custom timed action does any real work.

## Options

Options -> Mods -> Outcast Saw All:

| Option | Default | What it does |
|--------|---------|--------------|
| Search radius (tiles) | 4 | How far to look. Your character walks to anything past arm's reach. 0 searches nothing extra. Past 1 tile it only reaches squares you can see. |
| Max logs per click | 20 | Ceiling on one click. A log takes far longer than most crafts, and walking cancels the queue. |
| Untie log bundles | on | Untie 2/3/4-log bundles so their logs can be sawn. |

## How a run works

Your character works through a list of places, nearest first. At each one they
saw what is in reach -- logs are sawn where they lie, never hauled into your bag,
so a pile of twenty never leaves you immobile. Walk away and it stops.

If a spot cannot be reached it is skipped and reported. If you have logs but no
saw, the button does not appear at all -- same as vanilla's own "Saw Log".

## Layout

```
Contents/mods/OutcastSawAll/42/     the mod the game loads
  media/lua/shared/OutcastSawAll/     OSA_Config    identity and tunables
  media/lua/client/OutcastSawAll/     OSA_Scan      finding logs and stops
                                      OSA_Plan      scan -> count + stop list
                                      OSA_Run       the state machine
                                      OSA_StepAction  one-tick "we have arrived"
                                      OSA_ContextMenu the button
                                      OSA_Options   the Mod Options panel
  media/lua/shared/Translate/EN/      all user-facing strings
docs/DESIGN.md                      why it is shaped this way
docs/ENGINE.md                      the engine facts, with line numbers
scripts/install-junctions.ps1       point the game at this working tree
scripts/validate-data.ps1           catch the failures the game does not report
tests/                              stubbed-engine tests for the count logic
```

## Development

```powershell
# link the working tree into the game, no copy step
.\scripts\install-junctions.ps1

# check translation keys, recipe names and item types before shipping
.\scripts\validate-data.ps1 -GameMedia 'R:\ZOMBOID\PZ_Engine_Records\B42\game_snapshot\media'

# the number on the button, against a stubbed engine
cd tests; lua test_counting.lua
```

The tests cover counting only -- dedupe, bundle arithmetic, the cap, favourites,
and which craftability probe gets used. The run itself (timed actions, walking,
the callback chain) needs the real engine.

They read the stub from `../../OutcastLib/tests/pz_stub.lua` by relative path.
This mod used to vendor its own copy; that copy had drifted and was deleted
rather than kept in sync by hand, so **the OutcastLib repo must be checked out
alongside this one for the tests to run.**

## Dependency

**Requires OutcastLib (local reference: ../OutcastLib/)**, declared as `require=OutcastLib` in
`mod.info`. The game loads it first and marks this mod unavailable, with a logged
warning, if it is not installed.

The library owns the parts that were provably identical between this mod and
Outcast Rip All: the reachable-squares sweep, the per-square container walk, and
the container lock test. What stayed here is what is specific to a mod that
crafts -- the `floor`-type exclusion and the 2.5-tile `CRAFT_REACH` clamp, both
of which exist because `BaseCraftingLogic.isContainersAccessible` fails a whole
recipe when any container is out of range. Rip All's sweep has no such rule, so
sharing them would have applied a craft constraint to a mod that does no
crafting.

## Status

Tested in single player. **Not yet tested on a dedicated server** -- see the last
section of `docs/ENGINE.md` for the specific case to try first.

Build 42 only. Requires OutcastLib.
