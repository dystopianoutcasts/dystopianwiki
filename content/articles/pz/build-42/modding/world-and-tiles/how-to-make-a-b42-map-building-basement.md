---
id: build-42-how-to-make-a-b42-map-building-basement
slug: how-to-make-a-b42-map-building-basement
title: How to make a B42 map / building / basement
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
  The order of work for a Build 42.22 map, building or basement: what the game reads at each step, cited, and the editor steps from the community wiki, marked not verified.
last_updated: '2026-11-15'
related_articles:
  - basements-the-underground-system
  - map-files-map-info-spawnpoints-lua-folder-structure
  - map-modding-toolchain-for-b42
  - map-tile-modder-migration-checklist
  - multi-z-the-vertical-engine-change
  - basics-what-changed-and-why-it-matters-to-modders
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- A map is a folder under `media/maps/` in a mod, and it counts as a map only if it holds a `map.info` file. A mod that only adds a start place on the vanilla map needs no editor at all.
- The editors draw the cells and buildings. What they write is not the game, so each editor step below is marked "not verified" and dated.
- The game reads a building as rooms, each with a name, a level and rectangles, from the cell's `.lotheader`. A spawn point that is not inside such a room is logged as a warning.
- A generated basement needs pieces, a `basements.lua` and a `Basement` location. A basement you place by hand in a lot needs none of those. The [basements page](/pz/build-42/modding/world-and-tiles/basements-the-underground-system) has the first way.
- To check your work, read the log: the game lists every map folder it looks in, and says when one is missing.
:::

:::facts
- **Smallest map mod** 5 files in the [cookbook recipe](/pz/build-42/modding/cookbook/map-building-basement), no editor
- **Cell** 256 x 256 squares (Build 41: 300)
- **Spawn point forms** 3
- **Editor steps below** 7 for a map, 4 for a building, 11 for a basement placed by hand, all not verified
:::

Outcast, the work comes in this order: pick a folder, make the ground, make the buildings, add the text files the game reads, package the mod, then read the log. This page names what the game itself needs at each step, and keeps the editor steps short and flagged.

:::flow[The order of work]
- Pick the map folder name
- Draw the cells in the editor
- Draw buildings and basements
- Write the text files
- Package the mod
- Read the log
:::

## 1. Pick the folder name first

The folder name is the map's id everywhere: in the `Map=` list, in a `lots=` line, and in a basement's `mapID`. A `lots=` line is followed only when the game map is a single name; a server's `Map=MyMap;Muldraugh, KY` must name every folder, in priority order. :cite[(`zombie/iso/IsoMetaGrid.java:2034-2044`)]

The game builds its list of folders from the maps of every enabled mod, and only a folder with a `map.info` counts. :cite[(`zombie/MapGroups.java:123-150`, `zombie/MapGroups.java:262-265`)] A basement location must lie in a cell that belongs to the folder it was registered under, and the comparison ignores case. :cite[(`zombie/basements/Basements.java:418-423`)] Put the map under `common/media/maps/`: a mod's `42/media/maps/` folder is scanned only if `common/media/maps/` exists, so a map placed only under `42/` is not found. :cite[(`zombie/MapGroups.java:123-150`)] The packaging rules are in the [cookbook recipe](/pz/build-42/modding/cookbook/map-building-basement) and on the [mod packaging page](/pz/build-42/mapping/zones-and-packaging/mod-packaging-for-maps).

## 2. A map: seven editor steps, and what the game reads

The game reads three kinds of lot file per cell, a `.lotheader`, a `.lotpack` and a `chunkdata_` file, named with the cell's x and y. :cite[(`zombie/iso/MapFiles.java:91-100`)]

The old page's seven steps were these. Every one is tool behavior, from the community wiki and the previous compilation, and is not verified as of 2026-11-15:
1. Install a community build of the mapping tools. The [tools setup page](/pz/build-42/mapping/fundamentals/tools-setup) says which.
2. Extract the packed tilesheets if the tools need them.
3. Optionally start from the vanilla map export (`PZ_Vanilla_map_b42`) as a base.
4. Lay out the cells on the editor's 300 grid, which the tools export as 256-square cells with empty borders. Check which cells you touch against other map mods, because two map folders with a lot file of the same name are reported as an "Overlap conflict". :cite[(`zombie/MapGroups.java:507-514`)]
5. Draw buildings and room definitions, and write the zone file `objects.lua`.
6. Make the map picture and the thumbnail. The game loads `thumb.png`, and then `spawnSelectImagePyramid.zip` or `worldmap.png`. :cite[(`zombie/gameStates/ChooseGameInfo.java:115-120`)]
7. Export the map folder and package it with a `mod.info` that has `pack=` and `tiledef=` lines where you add tiles. The [map files page](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure) lists the files, and a `tiledef=` line takes a number from 100 to 8189. :cite[(`zombie/gameStates/ChooseGameInfo.java:305-325`)]

The old page said `objects.lua` holds car spawns and navigation meshes. In 42.22 the loader skips `objects.lua` entries of eight types, among them `Nav`, and registers the rest as zones; `Nav` zones are made from `streets.xml`. :cite[(`media/lua/server/metazones/metazoneHandler.lua:93`, `zombie/iso/IsoWorld.java:454-463`, `zombie/worldMap/streets/WorldMapStreet.java:1114-1116`)]

## 3. A building: rooms with names and levels

The game sees a building as a list of rooms, and a room has a name, a level and rectangles.

Each `.lotheader` lists its rooms, each with a name, a level and a set of rectangles, and then the buildings as lists of those rooms. :cite[(`zombie/iso/IsoMetaGrid.java:2251-2262`, `zombie/iso/IsoMetaGrid.java:2304-2322`)] The room name is the text the game later uses for room-based features, so the room list in the editor matters; the loot side is on the [mapping section's loot page](/pz/build-42/mapping/zones-and-packaging/loot-room-definitions-and-custom-distributions).

The steps in the editor, not verified as of 2026-11-15:
1. In TileZed, open Tools, then Building Editor, then New Building. The old page said the building editor is merged into TileZed.
2. Check the list of room definitions before drawing, so each room gets a valid name.
3. Draw the rooms. For several floors, draw floors above and below as needed.
4. Export the building as a building file (`.tbx`) for the map. The old page also allowed drawing a basement directly into the house's `building.tbx`; the standalone way is the one it documented.

A spawn point should be inside a room. When the game turns spawn points into spawn buildings, it warns "no room or building" for a point that is not. :cite[(`zombie/iso/SpawnPoints.java:177-186`)] The [buildings page](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged) teaches the editor.

## 4. A basement: two ways

You can place a basement by hand in a lot, or let the game generate one from pieces; the second is how vanilla does most of them.

The hand-placed way is tool behavior. The old page gave these steps from the community wiki (a basement guide, 42.12.3), not verified as of 2026-11-15. The mapping section's [buildings page](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged) has a longer walk-through.
1. In the Building Editor make a new building and check the room list.
2. In the iso view, use Draw Room on floor 1 of 1, fully enclosed. For more levels add floors; the old page said the topmost drawn floor is the first one going down.
3. Use Place Stairs for the entry and save.
4. In the map project, pick the entrance place.
5. With the eraser tool, delete 3 ground-floor tiles, which will sit above the stairs.
6. In the world editor, drag the basement file into the map.
7. In its Levels list, drag the file from Level 0 onto Level -1.
8. Move it so the 3 erased tiles are directly above the stairs.
9. In the Building Editor, open the house file and set the floor tile of the room above to None.
10. Draw a floor tile everywhere in that room except the 3 tiles above the stairs, and save.
11. Place the house in the world editor and line up the 3 missing floor tiles.
For a generated basement the old page added that you also export the piece and list it in the map's Lua; the game side of that is on the [basements page](/pz/build-42/modding/world-and-tiles/basements-the-underground-system).

For the generated way the game wants a piece in `media/binmap/`, an entry in `basements.lua` and a `Basement` location, all read when a new save starts. :cite[(`zombie/basements/Basements.java:110-134`, `zombie/basements/Basements.java:464-487`)] A piece whose file is missing is dropped without a log line, so look in the world after you start a new save. :cite[(`zombie/basements/Basements.java:464-487`)]

## 5. Read the log

The log lists every map folder the game looks in, so a folder that is not there shows up as a line.

At world start the game writes "Looking in these map folders:", then one path for each folder, or "skipping non-existent map folder" for a folder it cannot find. :cite[(`zombie/iso/IsoMetaGrid.java:1424-1436`)] The Workshop uploader's check of a mod's maps folder returns the error "MissingMapDotInfo" for a map folder with no `map.info`. :cite[(`zombie/core/znet/SteamWorkshopItem.java:316-341`)] The basement code writes its own lines on the `Basement` debug channel when it builds a piece into a chunk. :cite[(`zombie/iso/NewMapBinaryFile.java:110-112`)]

:::callout[How we know]{kind=proof}
- The reading of the loader is from the 42.22 decompile. Nothing here was tested by building a map in a running game.
- Not verified: every editor step and every menu name above, as of 2026-11-15. They come from the old page, which took them from the community wiki ("Creating basements", "Mapping") and a dev blog.
- Dropped: the old page's pointer to "Room definitions and item spawns" as a wiki page. The room names the game reads are in the lot files, which this page cites; the wiki page was not read.
- Not verified: what two map folders with a lot file of the same name do in play. The code layers them square by square (see the [basics page](/pz/build-42/modding/world-and-tiles/basics-what-changed-and-why-it-matters-to-modders)), and the mod screen reports the overlap. :cite[(`zombie/modding/ActiveMods.java:185-192`)]
:::
