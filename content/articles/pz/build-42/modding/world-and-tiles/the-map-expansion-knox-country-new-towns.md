---
id: build-42-the-map-expansion-knox-country-new-towns
slug: the-map-expansion-knox-country-new-towns
title: The map expansion (Knox Country) + new towns
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
  CONFIRMED (dev blogs). B42 is a heavy evolution/overhaul of Knox Country (the
  Kentucky setting), aiming for areas that feel more lived-in and believable.
last_updated: '2026-09-29'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - multi-z-the-vertical-engine-change
  - basements-the-underground-system
  - tile-system
  - the-new-lighting-rendering-engine
  - map-modding-toolchain-for-b42
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - zones-vehicle-parking-zones-foraging
  - multiplayer-map-streaming-notes
  - map-tile-modder-migration-checklist
---
# The map expansion (Knox Country) + new towns

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**CONFIRMED (dev blogs).** B42 is a heavy evolution/overhaul of Knox Country (the
Kentucky setting), aiming for areas that feel more lived-in and believable.

Scale of the content pass:
- ~1,400 unique buildings added.
- ~20,000 tiles total (B41 had ~15,000).

**Rebuilt towns (first wave).** Rosewood, Riverside, West Point, Fallas Lake,
Muldraugh, and Ekron were reworked. **CONFIRMED (dev blogs).**

**New towns.** **CONFIRMED (dev blogs):**
- **Brandenburg** -- a new location on the banks of the Ohio River.
- **Ekron** -- a small agricultural town with Southern character (listed both as
  new and rebuilt across sources; treat as "new/expanded").
- **Irvington** -- in the south-west of the map, known for its race track.

**Vertical landmark content.** Louisville skyscrapers can now hold up to ~32
zombie-filled floors thanks to the height increase. **CONFIRMED (dev blogs).**

### The cell-size change (critical for map modders) -- RESOLVED
**CONFIRMED** (pzwiki: Mapping, revid 1443363). The canonical wiki settles the
earlier "300 vs 256" confusion. Direct quotes:

> "This is done by creating a new map cell, which is a 300x300 tile area in
> Build 41 and 256x256 in Build 42."

> "Previously in Build 41, cells were 300x300 tiles big, but in Build 42 they are
> now 256x256 tiles big. However when you create your map, you still work with
> 300x300 cells, but the mapping tools will export them as 256x256 cells, which
> means that the exported map will have some empty tiles around the borders of the
> exported cells."

So there is **no conflict**: the shipped/native B42 cell is **256x256**; the
editing project grid stays **300x300** and is converted on export. The Unjammer
"300x300 TMX converted from 256x256" report was correct and is now reconciled.

**Cell re-index (CONFIRMED, exactly matches earlier community reports).** A single
B41 300x300 cell maps to several B42 256x256 cells. The wiki's worked example:
B41 cell **(31, 23)** exports to B42 cells **(36,26), (37,26), (36,27), (37,27),
(36,28), (37,28)**. Exported cells have an **active area** (your 300x300 content,
which overrides vanilla) and an **inactive area** (empty border tiles, which fall
back to vanilla).

**Adjacency clashes (CONFIRMED).** "those that share the same adjacent 256x256
cells will clash together and one will not be loaded in." Coordinate planning
between map mods matters more than in B41. (Wiki cites its own Talk:Mapping cell-
clash test.)

**Chunk tile-size (still UNCERTAIN).** The cache does not state the per-chunk tile
size in B42. Do not hard-code a chunk size; verify in-build. (See Gaps.)

**Note on the 300 grid persistence.** Even in B42, spawnpoint cell math still
treats a cell as 300x300 for B41-compatible coordinates (`worldX*300+posX`); see
section 9.2. The 300 grid is baked into more than just the editor.

---

<a name="3-multi-z"></a>
