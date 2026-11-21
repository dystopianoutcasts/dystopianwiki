---
id: build-42-multi-z-the-vertical-engine-change
slug: multi-z-the-vertical-engine-change
title: 'Multi-Z: the vertical engine change'
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
  Build 42.22 gives every column of squares 64 levels, numbered -32 to 31, not the 8 floors of Build 41. Where the limit is set, what a lot file stores, and what that means for tall and deep builds.
last_updated: '2026-11-15'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - basements-the-underground-system
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - map-tile-modder-migration-checklist
  - tile-system
  - the-new-lighting-rendering-engine
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- A square can be on any level from -32 to 31, which is 64 levels. Ground is level 0. The old page said "up to 32 levels", and the code shows twice that range.
- Build 41 set its height to 8. The change is in the engine, so a map can now be much taller, and it can go underground.
- A lot file records its own lowest and highest level, and the loader clamps them to -32 and 31. A map cannot store a level outside that range.
- Rooms carry a level number, so a room on level -1 and a room on level 1 are different rooms in the same building.
- A basement sits below level 0 by the height of its own file, so a one-level basement is placed with its floor on level -1.
- A spawn point has a `posZ`, and it is 0 when the point leaves it out.
:::

:::facts
- **Levels per column** 64 (-32 to 31)
- **Ground level** 0 (slot 32 of the 64 in a player's chunk map)
- **Build 41 height** 8
- **Chunk save flag** 1 bit per level in a 64-bit value
:::

Outcast, the biggest change under a map maker's feet is that the world got taller and deeper at the same time. This page says where the 42.22 code sets the limits and what each limit means for a map you build.

## 1. A column of squares holds 64 levels

The engine's range for a square's level is -32 to 31. :cite[(`zombie/iso/IsoChunkMap.java:48-51`)]

The same range is hard-coded where the game reads a lot file: it takes the file's lowest level or -32, whichever is higher, and its highest level or 31, whichever is lower. :cite[(`zombie/iso/IsoLot.java:154-155`)] One grid lookup in `IsoChunk` also returns nothing outside -32 to 31. :cite[(`zombie/iso/IsoChunk.java:5520`)] The save writes one bit per level, as bit `z + 32` of a 64-bit value for each square column of a chunk. :cite[(`zombie/iso/IsoChunk.java:4447-4454`)]

The Build 41 sources set the height to 8 (`IsoCell.java` line 92 in `GAME/PZ_Engine_Records/B41/src/iso/`). The old page of this name said each chunk reaches "up to 32 Z-levels" and called the figure dev-blog sourced. The code shows 64 slots from -32 to 31, of which 32 are at or above ground (0 to 31) and 32 below (-32 to -1).

## 2. Each lot file stores its own level range

A cell's `.lotheader` file lists its lowest and highest level, and the game reads both. :cite[(`zombie/iso/IsoMetaGrid.java:2243-2247`)]

An older lot header, version 0, has no lowest level: the game treats it as 0 and reads only the count of levels. :cite[(`zombie/iso/IsoMetaGrid.java:2242-2244`)] Both `.lotheader` and `.lotpack` files carry a version, 0 or 1. :cite[(`zombie/iso/LotHeader.java:14-16`, `zombie/iso/IsoLot.java:134-139`)]

Each room in the header records its level next to its rectangles. :cite[(`zombie/iso/IsoMetaGrid.java:2257-2259`)] So a floor of a building is a set of rooms on a level, and not a separate building.

## 3. How a map reaches below ground

A basement is placed so that its bottom is the spawn location's level minus the number of levels in the basement file. :cite[(`zombie/basements/Basements.java:370`)]

A basement spawn location written as a table in `basements.lua` has level 0 unless it gives a `z`, and one made from a `Basement` zone takes the zone's own level. :cite[(`zombie/basements/BasementsV1.java:78-80`, `zombie/basements/BasementsV1.java:106-114`)] So a basement with one level, on a location at level 0, has its floor on level -1. The way a basement is chosen and saved is on the [basements page](/pz/build-42/modding/world-and-tiles/basements-the-underground-system). The guide to authoring one is the [step-by-step page](/pz/build-42/modding/world-and-tiles/how-to-make-a-b42-map-building-basement).

A spawn point in `spawnpoints.lua` also has a level, `posZ`, and it is 0 when the point has none. :cite[(`zombie/iso/SpawnPoints.java:158-170`)] The file's forms are on the [map files page](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure).

## 4. What a tall build costs

Anything taller than Build 41's height of 8 is new ground for a modder, and the code gives the limit but not the cost.

The code does not say how much height slows rendering or lighting. The lighting is mostly native code, covered on the [lighting page](/pz/build-42/modding/world-and-tiles/the-new-lighting-rendering-engine), and the tile side on the [tile system page](/pz/build-42/modding/world-and-tiles/tile-system). The tools' own level controls are not verified; the editors have a "Level" list, and the old page quoted the community wiki for dragging a basement from Level 0 onto Level -1.

:::callout[How we know]{kind=proof}
- Read from the 42.22 decompile: the -32 to 31 range, the 64 levels, the clamp in the lot reader, the save flag, the room level and the basement placement.
- Not verified: what `IsoCell.maxHeight` (set to 32 at `zombie/iso/IsoCell.java:128`) limits in play. It is a separate setting from the level range, and I did not trace every use.
- Not verified: how WorldEd and TileZed show or limit levels, as of 2026-11-15. See the [tools setup page](/pz/build-42/mapping/fundamentals/tools-setup).
- Not verified: speed cost of tall builds. Nothing in the capture measures it.
:::
