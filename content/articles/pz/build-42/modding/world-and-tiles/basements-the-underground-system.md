---
id: build-42-basements-the-underground-system
slug: basements-the-underground-system
title: Basements + the underground system
game: pz
version: build-42
section: modding
category: world-and-tiles
difficulty: intermediate
tags:
  - tiles
  - multi-z
  - basements
  - map-modding
  - tiledefs
excerpt: >-
  This is the flagship new-world system in B42 and the one most relevant to
  environment modders.
last_updated: '2026-09-29'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - the-map-expansion-knox-country-new-towns
  - multi-z-the-vertical-engine-change
  - tile-system
  - the-new-lighting-rendering-engine
  - map-modding-toolchain-for-b42
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - zones-vehicle-parking-zones-foraging
  - multiplayer-map-streaming-notes
  - map-tile-modder-migration-checklist
---
# Basements + the underground system

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

This is the flagship new-world system in B42 and the one most relevant to
environment modders.

### 4.1 What exists underground (CONFIRMED -- dev blogs)
- **Basements** under suitable houses/buildings.
- **Bunkers**, **panic rooms**, and unique sets.
- **Military labs** and deeper structures.
Some are unique/hand-placed; most are generated and change per run.

### 4.2 Distribution (CONFIRMED -- dev blogs)
- **~400 procedurally generated** basements + **~75 hand-crafted** basements.
- **Two placement classes:** predefined/hand-crafted (baked into the map, always
  same spot) and procedural (chosen from the world seed at world creation).

### 4.3 Procedural injection (CONFIRMED as mechanic -- dev blogs; NOT on the
wiki cache)
Dev description of the injection: when an area streams in for the first time, an
appropriate basement "building" (authored in the Building Editor, exported as a
binary file) is selected randomly from the pool of all possible basements and
injected into the map. The pick is seeded (stable per-world, varied across
worlds).

**Honesty flag:** the canonical "Creating basements" wiki page (revid 1301995,
v42.12.3) documents only the **manual, hand-placed** authoring workflow (a
standalone `.tbx` dragged onto Level -1 in WorldEd -- see 4.4 and section 8). It
does **not** describe the procedural pool, the injection trigger, or the
"appropriate basement" matching keys. Those remain dev-blog sourced. The exact
matching rules (footprint / tags / room types) stay a **gap**.

### 4.4 Authoring a basement -- CONFIRMED exact workflow
Upgraded from LIKELY to **CONFIRMED** (pzwiki: Creating basements, revid 1301995).
Two methods exist: (1) a standalone `.tbx`, or (2) drawn directly into your
`building.tbx`. The wiki guide covers method 1. Full steps are in section 8.3.

Key confirmed facts:
- Basements are authored as **buildings** in the Building Editor, then placed on a
  **negative WorldEd level (Level -1)**.
- **Topmost drawn floor = the first floor descending into the basement**
  (multi-level basements add more floors).
- Entry is a **staircase** (Place Stairs tool), and **3 ground-floor tiles**
  directly above the staircase must be removed (BMP Eraser) so the player can
  descend.
- **Check the room definitions list before drawing** so rooms get correct
  RoomDefs (drives item/zombie spawns) -- see the RoomDef reference (pzwiki: Room
  definitions and item spawns, revid 1392885).

---

<a name="5-tiles"></a>
