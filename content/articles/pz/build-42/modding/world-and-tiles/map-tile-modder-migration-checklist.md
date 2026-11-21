---
id: build-42-map-tile-modder-migration-checklist
slug: map-tile-modder-migration-checklist
title: Map/tile modder migration checklist
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
  A short checklist for moving a Build 41 map or tile mod to Build 42.22, with each item checked in the game code or marked not verified, and the points the old list got wrong.
last_updated: '2026-11-15'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - multi-z-the-vertical-engine-change
  - basements-the-underground-system
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - map-modding-toolchain-for-b42
  - tile-system
  - the-new-lighting-rendering-engine
  - zones-vehicle-parking-zones-foraging
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- Absolute square numbers stay the same. Cell numbers change, because a cell is now 256 squares wide, and a cell header must declare 8-square chunks.
- A `tiledef=` number must be from 100 to 8189. The old list said "100 to 8190", and the game refuses a number outside 100 to 8189.
- Levels run from -32 to 31, and basements are now chosen by the map's Lua when a new save starts, not drawn into a building as the old list said.
- `map.info` has nine keys, and a spawn point can be written three ways.
- Items about lighting, tile depth drawing and tile properties belong to the [tile system](/pz/build-42/modding/world-and-tiles/tile-system) and [lighting](/pz/build-42/modding/world-and-tiles/the-new-lighting-rendering-engine) pages. They are not verified here.
- The old list's server memory and player-count advice is dropped, because nothing in the code gives it.
:::

:::facts
- **Cell** 256 x 256 squares, chunk 8 x 8
- **tiledef= range** 100 to 8189
- **Levels** -32 to 31
- **map.info keys** 9
- **Checklist items** 14, in 5 groups
:::

Outcast, work down the five groups below in order, and check off an item only when you have looked at the file it names. Each item says how it was checked.

## 1. Cells and lot files

Cell numbers and chunk size are the first things a Build 41 map breaks on.

- [ ] **Renumber cells, keep squares.** A cell number is a square number divided by 256, as the basement code does for a spawn square. :cite[(`zombie/basements/Basements.java:418-420`)] The editors may still work on a 300 grid and export 256-square files; that is tool behavior and is not verified. See the [cell-size page](/pz/build-42/mapping/fundamentals/the-cell-size-question).
- [ ] **Chunks are 8 by 8.** A `.lotheader` must say its chunk width and height are 8, or that cell does not load. :cite[(`zombie/iso/IsoMetaGrid.java:2241`, `zombie/iso/IsoMetaGrid.java:2364-2369`)]
- [ ] **Check overlap with other map mods.** The game lists two map folders that carry a lot file of the same name as an "Overlap conflict", and it layers them square by square, the higher folder first. :cite[(`zombie/MapGroups.java:507-514`, `zombie/iso/CellLoader.java:378-408`)] A lower folder's buildings are also dropped where a higher folder covers the 300-square block. :cite[(`zombie/iso/IsoMetaGrid.java:2143-2152`, `zombie/iso/IsoMetaGrid.java:2325-2331`)] The cell-size page says a clashing map may not load; that is not tested here.

## 2. Tiles

A custom tile needs its tile definition file number in range, and the rest of the tile work is on the tile pages.

- [ ] **Pick a tiledef number from 100 to 8189.** The `mod.info` lines are `pack=<name>` and `tiledef=<name> <number>`, and a number outside the range makes the mod fail to read. :cite[(`zombie/gameStates/ChooseGameInfo.java:268-326`)] Whether a number is already used by another mod is the community registry's job, and is not verified.
- [ ] **Tile depth.** The game looks for a `tileGeometry.txt` in each mod's `common/media` folder. :cite[(`zombie/tileDepth/TileDepthTextureManager.java:51-58`)] How to draw box, cylinder or polygon shapes in the debug editor is not verified.
- [ ] **Tile properties.** Properties such as `Surface` and `ItemHeight`, and the fields of a colored light, are on the [tile system page](/pz/build-42/modding/world-and-tiles/tile-system). The old list said to check the light fields against the API docs, because the wiki did not list them; that is still not verified here.

## 3. Height, basements and light

Height and basements are new, and light is the least checkable of the three.

- [ ] **Use the level range.** Levels are -32 to 31. :cite[(`zombie/iso/IsoChunkMap.java:48-51`)] See [multi-Z](/pz/build-42/modding/world-and-tiles/multi-z-the-vertical-engine-change).
- [ ] **Basements.** Write the piece, the `basements.lua` entry and a `Basement` location, and start a new save. The old list said to place the basement as a building on Level -1, with its top drawn floor as the way down, a staircase and 3 erased floor tiles above it. That is the hand-placed way and is tool behavior, not verified; the generated way is on the [basements page](/pz/build-42/modding/world-and-tiles/basements-the-underground-system). :cite[(`zombie/basements/Basements.java:110-134`)]
- [ ] **Light interiors.** The old list said windowless rooms are now truly dark. That is a lighting claim and is not verified here; the lighting is mostly native code. See the [lighting page](/pz/build-42/modding/world-and-tiles/the-new-lighting-rendering-engine).

## 4. Text files

The text files are where the game and the old list agree most, with two numbers to fix.

- [ ] **Room definitions.** Each room in a `.lotheader` has a name, a level and rectangles, and a basement piece's rooms join the map's room list. :cite[(`zombie/iso/IsoMetaGrid.java:2251-2262`, `zombie/basements/Basements.java:505-540`)] Check them on every building and basement.
- [ ] **map.info and spawnpoints.lua.** Write the nine `map.info` keys you need and the spawn points in one of three forms. The `worldX`/`worldY` form still multiplies by 300. :cite[(`zombie/gameStates/ChooseGameInfo.java:81-101`, `zombie/iso/SpawnPoints.java:145-170`)] The files are on the [map files page](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure).
- [ ] **Vehicle zones.** The game registers a zone as a vehicle zone only when its type is `Vehicle` or `ParkingStall`. :cite[(`zombie/iso/IsoMetaGrid.java:836-839`)] The old list added that a parking stall's size is a multiple of 4 by 3 and that its name must be valid; neither rule is checked here, and the [zones page](/pz/build-42/modding/world-and-tiles/zones-vehicle-parking-zones-foraging) owns them.

## 5. Before you ship

The last items are what to read and what not to assume.

- [ ] **Read the log.** The game lists every map folder it looks in and says when one is missing. :cite[(`zombie/iso/IsoMetaGrid.java:1424-1436`)]
- [ ] **Assume a fresh start.** The old list said Build 41 saves and maps do not transfer, so ship a fresh Build 42 map. The code read here shows that a Build 41 cell header, with 10-square chunks, does not load, and that a mod folder numbered below 42.0 is not read. :cite[(`zombie/iso/IsoMetaGrid.java:2241`, `zombie/ZomboidFileSystem.java:468-480`)] That Build 41 saves cannot be opened is not verified.

:::callout[How we know]{kind=proof}
- Every item with a citation was checked in the 42.22 decompile by reading the cited lines. None was tested by loading a map or a save.
- Dropped: "budget 8 to 9 GB of RAM, an SSD and fewer than 20 players" for multiplayer. It came from the community, and nothing in the code states a memory or player figure for maps.
- Not verified: the editor side of every item, as of 2026-11-15. The old list said to use Crater's Community Edition or Alree's tools and to expect official tools after hotfixes; that is on the [toolchain page](/pz/build-42/modding/world-and-tiles/map-modding-toolchain-for-b42), marked not verified.
- Changed: the old list's tiledef range (100 to 8190) and its "basements are buildings on Level -1" rule. The first is in `ChooseGameInfo.java:322-325`.
:::
