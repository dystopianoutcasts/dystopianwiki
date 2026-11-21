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
  How Build 42.22 adds basements: a map's Lua lists pieces and locations, the game picks from the world seed once per new save, saves the result, and builds each piece as chunks are made.
last_updated: '2026-11-15'
related_articles:
  - how-to-make-a-b42-map-building-basement
  - multi-z-the-vertical-engine-change
  - basics-what-changed-and-why-it-matters-to-modders
  - map-files-map-info-spawnpoints-lua-folder-structure
  - map-tile-modder-migration-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- Vanilla's basements are not found while you play. When a new save starts, the game reads each map folder's Lua, picks a piece for each basement location, and writes the result to `map_basements.bin` in the save.
- A piece is a `.pzby` file. Basements are in `media/binmap/` and "access" pieces, which change the building above the stairs, are in `media/basement_access/`.
- A piece fits a location only when its stair points the same way, it fits inside the location's box (when the box is bigger than one square), it sits in a cell of the same map folder, and it does not overlap an earlier basement. The pick among the fits is random, seeded from the world seed.
- The code has no tags, room types or building-type matching. A location can name the pieces it allows, and otherwise every piece of that map is a candidate.
- As read, a location added after a save exists is ignored, because that save already holds its placements.
- The sandbox option `Basement.SpawnFrequency` exists, but I found no code that reads it. Not verified.
:::

:::facts
- **Vanilla locations** 455 `Basement` zones in Muldraugh's `objects.lua`, all on level 0 (installed game, counted)
- **Vanilla pieces** 275 listed and 57 commented out in `basements.lua`, plus 147 access pieces (installed game, counted)
- **Piece file** `.pzby`, first four bytes `PZBY`
- **Save file** `map_basements.bin`, first four bytes `BSMT`
- **Spawn frequency option** 1 to 7, Java default 4; four of the six preset files set 4 and two do not mention it
:::

Outcast, a basement in Build 42 is a small building that the game stamps under a house, and the stamping is decided from the map's Lua when a new save starts. This page follows that path from the Lua to the chunk.

## 1. What a map folder supplies

A map folder gives the game three lists, and all three are filled by Lua when the world loads.

The first list is the piece definitions. A map's `basements.lua` calls `Basements.getAPIv1()` and hands it a table of names, each with `width`, `height`, `stairx`, `stairy` and `stairDir`. :cite[(`zombie/basements/BasementsV1.java:42-64`)] The game runs every active map folder's `basements.lua`. :cite[(`media/lua/shared/ProceduralBasements/basements.lua:1-12`)] The access pieces are a second table of the same shape. :cite[(`zombie/basements/BasementsV1.java:18-40`)]

The second list is the spawn locations. They come from `Basement` zones in `objects.lua`, with the box as the zone's `x`, `y`, `width` and `height`, and with `StairX`, `StairY`, `StairDirection` and `Access` in its `properties`. :cite[(`media/lua/server/metazones/metazoneHandler.lua:96-97`, `zombie/basements/BasementsV1.java:106-140`)] A table in `basements.lua` can add more, each with `x`, `y`, an optional `z`, `stairDir`, an optional `choices` list of piece names and an optional `access`. :cite[(`zombie/basements/BasementsV1.java:66-104`)]

Only the letter `N` counts as north. Any other `stairDir` value, such as the `W` that vanilla uses, is read as "not north". :cite[(`zombie/basements/BasementsV1.java:29`, `zombie/basements/BasementsV1.java:74`)] A `Basement` zone that gives no `StairDirection` is treated as north. :cite[(`zombie/basements/BasementsV1.java:116`, `zombie/basements/BasementsV1.java:128-131`)]

The mapping section has the zone format on the [objects.lua page](/pz/build-42/mapping/zones-and-packaging/objects-lua-the-zone-export) and the editor side on the [buildings page](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged).

## 2. A new save picks the pieces once

The game works out the placements only when the save has no `map_basements.bin`, and otherwise it reads them back. :cite[(`zombie/basements/Basements.java:110-134`, `zombie/basements/Basements.java:162`)]

The work is done by `beforeLoadMetaGrid`, which the world setup runs right after the `OnLoadMapZones` event. :cite[(`zombie/iso/IsoWorld.java:2069-2073`)] For each location, the code lists the pieces that fit and picks one at random with a generator seeded from the world seed. :cite[(`zombie/basements/Basements.java:322`, `zombie/basements/Basements.java:332-358`)] As read from the code, and not tested, the same seed, map and Lua therefore give the same basements. The choice is not made again in later sessions of that save.

A piece fits a location when all of these hold:
- its stair direction equals the location's; :cite[(`zombie/basements/Basements.java:393-395`)]
- when the location's box is bigger than one square each way, the piece lies wholly inside the box once its stairs are put on the location's `StairX` and `StairY`. When the box is not bigger than one square each way, the piece is placed with its stairs on the location's `x` and `y`, and `StairX` and `StairY` are not used; :cite[(`zombie/basements/Basements.java:360-368`, `zombie/basements/Basements.java:396-408`)]
- the location's cell belongs to the map folder that registered it; :cite[(`zombie/basements/Basements.java:410-423`)]
- it does not overlap a basement already placed. :cite[(`zombie/basements/Basements.java:414`)]

A location with a `choices` list considers only those names, and one without it considers every piece that map folder registered. :cite[(`zombie/basements/Basements.java:336-356`)] A basement piece whose file cannot be read, or that does not hold exactly one building, is dropped from the list without a log line. :cite[(`zombie/basements/Basements.java:464-487`)] An access piece is dropped only when its file cannot be read. :cite[(`zombie/basements/Basements.java:489-503`)]

## 3. Where the basement goes, and how the stairs line up

The piece is placed so that its stair lands on the location's stair, and its floor is below the location's level.

The code places the piece at the location's stair position minus the piece's `stairx` and `stairy`, and at the location's level minus the piece's number of levels. :cite[(`zombie/basements/Basements.java:359-374`)] When the location names an `Access` piece, a second piece is placed at the location's own level, lined up on the same stairs. :cite[(`zombie/basements/Basements.java:376-388`)] Vanilla's access pieces are named with a `ba_` prefix, and the game tells them from basements by that prefix. :cite[(`zombie/iso/NewMapBinaryFile.java:112-117`)] The level maths is on the [multi-Z page](/pz/build-42/modding/world-and-tiles/multi-z-the-vertical-engine-change).

A placed piece whose lowest level is 0 or above, such as an access piece placed at the location's own level, is merged into the one building next to it that is also on level 0 or above. If two such buildings touch it, it is not merged. :cite[(`zombie/basements/Basements.java:553-575`)] A basement, which starts below 0, is never merged this way.

## 4. A chunk gets its basement when the chunk is first made

The pieces are built into the world one chunk at a time, when a chunk is generated for the first time.

When a chunk is created brand new, the game asks every saved placement whether it overlaps the chunk, with one square of margin, and builds the overlapping part. :cite[(`zombie/iso/IsoChunk.java:2264`, `zombie/basements/Basements.java:440-468`)] The piece is read from `media/binmap/<name>.pzby`, or from `media/basement_access/` for a name starting `ba_`. :cite[(`zombie/iso/NewMapBinaryFile.java:110-134`)] The file opens with the four bytes `PZBY` and then lists its tiles, size, levels, rooms and buildings. :cite[(`zombie/iso/NewMapBinaryFile.java:216-270`)] Its rooms join the map's room list, so a basement room has a name and a level like any other room. :cite[(`zombie/basements/Basements.java:505-540`)]

A chunk that is already saved is read from disk and is not built again. :cite[(`zombie/iso/IsoChunk.java:2321-2345`)]

So even a placement that exists can only show in chunks nobody has visited yet. On an existing save no new placement is added, since the saved ones are read back. The one way to roll them again is to delete `map_basements.bin`; the debug-only delete list on the Load Game screen offers it. :cite[(`media/lua/client/OptionScreens/LoadGameScreen.lua:234`)] Not tested.

## 5. Both sides run it, and the frequency option is not read

Single player, a dedicated server and a multiplayer client all run `beforeLoadMetaGrid`, which holds the read, the calculation and the write.

The server and single player load the metagrid, then read or write `map_basements.bin`. :cite[(`zombie/iso/IsoWorld.java:2071-2077`)] A client takes the other branch, which calls `beforeLoadMetaGrid` too. :cite[(`zombie/iso/IsoWorld.java:2080-2081`, `zombie/basements/Basements.java:110-134`)] So, as read, the client works out placements with its own seed, and it needs the map's lot files and `.pzby` pieces on its own disk, since a location must lie in a cell of the registering folder. :cite[(`zombie/basements/Basements.java:418-423`)] Whether the client's seed matches the server's, so that both would pick the same pieces, was not checked.

The sandbox option `Basement.SpawnFrequency` is declared with 7 choices and a Java default of 4, and four of the six files in `media/lua/shared/Sandbox/` set it to 4, while the other two do not mention it. :cite[(`zombie/SandboxOptions.java:1318-1327`, `media/lua/shared/Sandbox/Apocalypse.lua:185-187`)] The server settings screen lists it. :cite[(`media/lua/client/OptionScreens/ServerSettingsScreen.lua:4904`)] I searched the game's Java and Lua for a reader of its value and found none, so what the option changes is not verified.

## 6. What vanilla ships

Vanilla's Muldraugh folder is a long worked example of all of the above, and it is in the installed game on the reading machine, not in the capture.

Its `basements.lua` lists 275 basement pieces and has 57 more commented out, with the comment that the commented ones are unique basements placed as lots in the editor and do not spawn at random (lines 1-341). It lists 147 access pieces (lines 354-502) and ends with three calls to the API (lines 504-507).

Its `objects.lua` has 455 `Basement` zones, each on level 0. The folder `media/binmap` holds 365 `.pzby` files and `media/basement_access` holds 147. These counts are from the installed game on 2026-11-15; whether that install is exactly 42.22 was not checked.

The old page said the world has "about 400" generated and "about 75" hand-made basements, from a dev blog. Neither figure can be reproduced from these files, so both are dropped: 455 zones is a count of places, and a zone gives a basement only when a piece fits.

:::callout[How we know]{kind=proof}
- The path from Lua to chunk is read from `Basements.java`, `BasementsV1.java`, `NewMapBinaryFile.java`, `IsoWorld.java` and `IsoChunk.java` in the 42.22 decompile. Nothing here was tested in a running game.
- Not verified: what `Basement.SpawnFrequency` does. Not verified: a client's seed. Not verified: how the editors export `.pzby` files and write `basements.lua`; the vanilla file's own comment says TileZed writes it.
- Not verified: that a location added to an existing save is ignored in play. The code reads that way (`Basements.java:120-125`), and the placements in the save are the only ones used.
- The old page's matching rules (footprint, tags, room types) were a "gap". The code shows stair direction, fit, map folder and overlap, and no tags or room types.
- The old page's authoring steps (place the `.tbx` on Level -1, erase three floor tiles) are tool behavior and moved to the [step-by-step page](/pz/build-42/modding/world-and-tiles/how-to-make-a-b42-map-building-basement). The old page also named two methods, a standalone `.tbx` or a basement drawn into the house's `building.tbx`; both are tool behavior and are not verified.
:::
