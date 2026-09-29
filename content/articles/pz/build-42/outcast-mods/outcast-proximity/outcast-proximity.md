---
id: build-42-outcast-proximity
slug: outcast-proximity
title: Outcast Proximity
game: pz
version: build-42
section: outcast-mods
category: outcast-proximity
difficulty: beginner
tags:
  - outcast-proximity
  - inventory
  - overview
excerpt: 'Every container you can already reach, as one searchable list.'
last_updated: '2026-09-29'
---
# Outcast Proximity

> Source: OutcastProximity/README.md (compiled 2026-08-06, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Every container you can already reach, as one searchable list.

Stand on a pile of corpses, or in a kitchen with a counter, two cabinets, a
fridge and a bin, and stop clicking through them one at a time.

**Project Zomboid B42** (42.20.0+). By Raxdeg / Dystopian Outcasts.

---

## What it does

Adds one extra container button to the loot window holding everything from the
containers around you at once. Take from it exactly as you would from any
container -- the items are the real items, still in their real crates, so
transfers, crafting and everything else behave normally.

**It does not extend your reach.** You see what vanilla already lets you see:
the containers immediately around you. Reaching further was designed and then
deliberately cut, because instantly seeing a whole room undercuts the searching
that makes the game work.

## What it does not do

Putting items away is `OutcastStowAll`'s job. The two are independent and
neither requires the other.

## Do not run it alongside Proximity Inventory

Both build a combined list from the same containers, so with both active every
item is counted twice. This mod detects Proximity Inventory and switches itself
off with a console message rather than corrupting your item counts.

---

## Status

**Playable, and ready for a multiplayer test.** The combined list is built,
kept current, and confirmed in game.

Verified in single player:

- Crafting consumes the vanilla amount. Tested twice -- once with the whole
  recipe in one container, once split across two -- because a doubled count is
  the one failure mode here that could quietly damage a save.
- No container and no item has ever appeared twice, across thousands of window
  refreshes.
- The list updates the moment a craft consumes something, rather than lagging.
- Right-clicking the Nearby button works, and the pin holds.
- Rebuilds take a millisecond or less, and 98% of the window refreshes the game
  hands the mod are skipped without work.

Not yet tested: **two players connected.** Every transfer so far has taken the
single-player path, and multiplayer routes transfers through a separate
consistency check.

Not yet built: **search and filtering**, which is the point of the mod and the
largest remaining piece.

`docs/ROADMAP.md` is the plain-language plan. `docs/DESIGN.md` is the durable
design record. `docs/DEPLOY.md` covers publishing and the dedicated server.

---

## Development

```powershell
# Link the working tree into the game (no copy step, no stale builds)
.\scripts\install-junctions.ps1

# Check everything the game fails silently on
.\scripts\validate-data.ps1

# Unlink
.\scripts\install-junctions.ps1 -Remove
```

`install-junctions.ps1` is vendored from `Mods\OutcastMods\_shared\`. Edit it
there, never here -- `validate-data.ps1` checksums the two and fails on drift.
