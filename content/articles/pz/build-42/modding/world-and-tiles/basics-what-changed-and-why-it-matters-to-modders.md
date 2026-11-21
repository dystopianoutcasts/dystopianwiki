---
id: build-42-basics-what-changed-and-why-it-matters-to-modders
slug: basics-what-changed-and-why-it-matters-to-modders
title: 'Basics: what changed and why it matters to modders'
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
  What a map maker must know about Build 42.22, checked in the game code: 256-square cells, 8-square chunks, levels -32 to 31, basements chosen from Lua, and stacked map folders.
last_updated: '2026-11-15'
related_articles:
  - multi-z-the-vertical-engine-change
  - basements-the-underground-system
  - map-modding-toolchain-for-b42
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - map-tile-modder-migration-checklist
  - tile-system
  - the-new-lighting-rendering-engine
  - zones-vehicle-parking-zones-foraging
  - multiplayer-map-streaming-notes
  - the-map-expansion-knox-country-new-towns
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- A cell is 256 by 256 squares and a chunk is 8 by 8. Build 41 used 300 and 10. The 42.22 code still does 300 math in at least these places: the old `worldX`/`worldY` form of a spawn point, the check that decides when a lower map's buildings are dropped, the world map geometry, and animal position loading and pathing.
- A square can sit on any of 64 levels, numbered -32 to 31. Build 41 stopped at an `IsoCell` height of 8.
- A basement is not matched to a building by tags. The map's own Lua lists basement definitions and spawn locations, and the game picks and saves the placements when a new save starts.
- Several map folders can be active at once. The first one in the list wins a square, and later ones only fill squares the earlier ones left empty.
- `map.info` is read line by line for nine keys. Anything else on a line is ignored.
- What the outside tools (WorldEd, TileZed, BuildingEd) export is not the game, and it is marked "not verified" here.
:::

:::facts
- **Cell** 256 x 256 squares = 32 x 32 chunks = 1,024 chunks
- **Chunk** 8 x 8 squares (Build 41: 10 x 10)
- **Levels** -32 to 31 = 64 levels (Build 41 height: 8)
- **map.info keys** 9
- **Spawn point forms** 3 (`posX`/`posY`, `worldX`/`worldY`, `position`)
:::

Outcast, if you made maps in Build 41, your habits still work in the editors, but the game itself changed its grid, its height and the way it adds basements. This page lists each change that the 42.22 code shows, and sends you to the page that goes deeper.

## 1. The grid is 256 squares wide, and the world is 64 levels tall

The game's cell is 256 by 256 squares and its chunk is 8 by 8, so a cell holds 32 by 32 chunks. :cite[(`zombie/iso/IsoCell.java:126-127`, `zombie/iso/IsoChunkMap.java:53-54`)]

A square can be on any of 64 levels, from -32 up to 31. :cite[(`zombie/iso/IsoChunkMap.java:48-51`)] The loader clamps a lot file's levels to that range. :cite[(`zombie/iso/IsoLot.java:154-155`)] The Build 41 sources set the equivalent height to 8 (`IsoCell.java` line 92 in `GAME/PZ_Engine_Records/B41/src/iso/`), and a chunk was 10 squares wide (`iso/IsoChunkMap.java` line 33 there). The levels have their own page: [multi-Z](/pz/build-42/modding/world-and-tiles/multi-z-the-vertical-engine-change).

The 300 grid has not vanished from the code. A spawn point written with `worldX` and `worldY` is turned into a square with `worldX * 300 + posX`. :cite[(`zombie/iso/SpawnPoints.java:145-157`)] Whether a lower-priority map's building is kept also depends on 300-square blocks. :cite[(`zombie/iso/MapFiles.java:127-138`, `zombie/iso/IsoMetaGrid.java:2143-2152`)] The world map geometry and the animal code use 300 too, and this list is not complete. :cite[(`zombie/worldMap/WorldMapGeometry.java:141-160`, `zombie/characters/animals/IsoAnimal.java:1398`, `zombie/characters/animals/pathfind/AnimalPathfind.java:63`)]

The editors can still work on a 300 grid and convert on export; that is tool behavior and is not verified here. The mapping section's [cell-size page](/pz/build-42/mapping/fundamentals/the-cell-size-question) covers it.

## 2. Map folders stack, and the first one wins a square

A game uses an ordered list of map folders, and a folder earlier in the list has the higher priority. :cite[(`zombie/iso/IsoMetaGrid.java:1422-1433`, `zombie/iso/IsoMetaGrid.java:1446-1452`)]

For each 8 by 8 chunk, the loader paints the highest-priority folder first and then asks each lower folder only for the squares still empty. :cite[(`zombie/iso/CellLoader.java:378-408`)] The check is per column of squares: once any level of an x,y square is filled, a lower folder adds nothing to that column. :cite[(`zombie/iso/IsoCell.java:2458-2478`)]

A `lots=` line in `map.info` names the folders a map borrows, and a folder named there is added after it in the list, but only when the game map is a single name. A `;` list, such as a server's `Map=MyMap;Muldraugh, KY`, is taken literally and must name every folder in priority order; the new-game screen builds that list itself. :cite[(`zombie/iso/IsoMetaGrid.java:2001-2012`, `zombie/iso/IsoMetaGrid.java:2034-2044`, `zombie/MapGroups.java:240-250`)]

A mod's map folder under `42/media/maps/` is scanned only if the mod has a `common/media/maps/` folder. :cite[(`zombie/MapGroups.java:123-150`)] The game also reports two maps in one group that carry a lot file of the same name, as an "Overlap conflict". :cite[(`zombie/MapGroups.java:507-514`)] The files and keys are on the [map files page](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure).

## 3. Basements come from the map's Lua, and a new save fixes them

A basement is a `.pzby` building that a map folder's Lua lists, and the game decides where each one goes once, when the save is new. :cite[(`zombie/basements/Basements.java:110-135`, `zombie/basements/Basements.java:469`)]

The Lua is `basements.lua` in the map folder, plus `Basement` zones in `objects.lua`. :cite[(`media/lua/shared/ProceduralBasements/basements.lua:1-12`, `media/lua/server/metazones/metazoneHandler.lua:96-97`)] The choice is seeded from the world seed and written to `map_basements.bin` in the save. :cite[(`zombie/basements/Basements.java:322`, `zombie/basements/Basements.java:240`)] The [basements page](/pz/build-42/modding/world-and-tiles/basements-the-underground-system) walks through it.

## 4. What the game reads from a map folder

The game reads a map folder's files by name, and `map.info` is the one that makes a folder count as a map. :cite[(`zombie/MapGroups.java:263`)]

Lot files are found by their endings: `.lotheader`, `.lotpack` and names starting `chunkdata_`. :cite[(`zombie/iso/MapFiles.java:91-100`)] The nine `map.info` keys are `title`, `lots`, `description`, `fixed2x`, `zoomX`, `zoomY`, `zoomS`, `demoVideo` and `only_for_game_mode`. :cite[(`zombie/gameStates/ChooseGameInfo.java:81-101`)] A mod's tile packs and tile definitions go in `mod.info`, and a `tiledef=` number must be from 100 to 8189. :cite[(`zombie/gameStates/ChooseGameInfo.java:305-325`)]

## 5. What this page does not check

Everything about the outside tools, and about rendering, is outside what the game's Java and Lua can show.

The old version of this page repeated figures from dev blogs and the community wiki: about 1,400 new buildings, about 20,000 tiles, and 15,000 tiles in Build 41. They are dropped, because the capture holds no map data to count them from. The tile depth system and the new lighting have their own pages: [tile system](/pz/build-42/modding/world-and-tiles/tile-system) and [lighting](/pz/build-42/modding/world-and-tiles/the-new-lighting-rendering-engine). The [toolchain page](/pz/build-42/modding/world-and-tiles/map-modding-toolchain-for-b42) says what is known about the editors, and the [migration checklist](/pz/build-42/modding/world-and-tiles/map-tile-modder-migration-checklist) is the short list to work through.

The other pages of this set are the [map expansion](/pz/build-42/modding/world-and-tiles/the-map-expansion-knox-country-new-towns), [zones and parking](/pz/build-42/modding/world-and-tiles/zones-vehicle-parking-zones-foraging), [map streaming](/pz/build-42/modding/world-and-tiles/multiplayer-map-streaming-notes) and the [step-by-step guide](/pz/build-42/modding/world-and-tiles/how-to-make-a-b42-map-building-basement).

:::callout[How we know]{kind=proof}
- Every number above is read from the 42.22 decompile (capture B42_3d39148846). The Build 41 comparisons are read from the B41 sources in the same records folder and are named by file and line in the text.
- Not verified: what WorldEd, TileZed and BuildingEd write, as of 2026-11-15. The [tools setup page](/pz/build-42/mapping/fundamentals/tools-setup) covers them.
- Not verified: that Build 41 saves cannot be loaded. The code read here only shows that a mod's version folder below 42.0 is not read (`ZomboidFileSystem.java:468-480`, with the 42.0 minimum at `ChooseGameInfo.java:45`).
- The 300-square overlap check is read from the code, but what it does to lot data in play, not only buildings, was not tested.
:::
