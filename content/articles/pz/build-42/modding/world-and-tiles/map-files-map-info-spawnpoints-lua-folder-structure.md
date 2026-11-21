---
id: build-42-map-files-map-info-spawnpoints-lua-folder-structure
slug: map-files-map-info-spawnpoints-lua-folder-structure
title: 'Map files: map.info, spawnpoints.lua, folder structure'
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
  Every file Build 42.22 reads from a map folder and what it does with it, the nine map.info keys, and the three forms of a spawn point, each checked in the game code.
last_updated: '2026-11-15'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - basements-the-underground-system
  - how-to-make-a-b42-map-building-basement
  - map-tile-modder-migration-checklist
  - multi-z-the-vertical-engine-change
  - zones-vehicle-parking-zones-foraging
  - multiplayer-map-streaming-notes
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- A folder under `media/maps/` is a map only if it holds `map.info`. The game finds lot files by their endings and loads the rest of the files by name.
- `map.info` is read line by line, and a line is matched by how it starts. It has nine keys. `lots=` is not "the world map this map loads into": it names other map folders, and the same key can repeat. It is followed only when the game map is a single name. A list written with `;`, such as a server's `Map=MyMap;Muldraugh, KY`, is taken literally, so it must name every folder, in priority order.
- A mod's `42/media/maps/` folder is looked at only if the mod also has a `common/media/maps/` folder. Put the map under `common/`, or keep an empty `common/media/maps/` beside it.
- A spawn point can be written three ways: absolute `posX`/`posY`/`posZ`, the old cell form `worldX`/`worldY` with `posX`/`posY`, or `position = "center"`. The cell form still multiplies by 300.
- Spawn points are grouped by profession name, and a profession with no group falls back to `unemployed`.
- On a dedicated server the list of spawn regions players see comes from the server's own `_spawnregions.lua` when that file exists, and every server writes one on its first start that lists four vanilla regions.
- What the editors write into these files is not the game, and it is marked "not verified".
:::

:::facts
- **map.info keys** 9
- **Cell and chunk** 256 x 256 squares and 8 x 8 squares
- **Spawn point forms** 3
- **Old cell form** `worldX * 300 + posX`
- **Files and folders the game reads** 19, listed in section 1
:::

Outcast, a map folder looks like a pile of files, but the game treats each one by its name and each one has its own reader. This page is the list of those readers, and then the two files you edit by hand most often: `map.info` and `spawnpoints.lua`.

## 1. What the game reads from a map folder

The game reads the folder by file name, and only `map.info` is needed for the folder to count as a map; each other file is read only if it exists. :cite[(`zombie/MapGroups.java:262-265`, `media/lua/server/metazones/metazoneHandler.lua:86-87`)] A mod's map folder goes under `common/media/maps/` or `42/media/maps/`, but `42/media/maps/` is scanned only when a `common/media/maps/` folder also exists. :cite[(`zombie/MapGroups.java:123-150`)]

```
media/maps/MyMap/
  map.info
  thumb.png            (the pick-a-map picture)
  worldmap.png         (or spawnSelectImagePyramid.zip)
  <X>_<Y>.lotheader
  world_<X>_<Y>.lotpack
  chunkdata_<X>_<Y>.bin
  objects.lua
  regions.lua
  roomtones.lua
  spawnOrigins.lua
  spawnpoints.lua
  spawnregions.lua
  basements.lua
  streets.xml
  worldmap.xml
  worldmap-forest.xml
  worldmap-annotations.lua
  WorldGenOverride.lua
  maps/biomemap_<X>_<Y>.png
```

| File | What the game does with it | Code |
|------|----------------------------|------|
| `map.info` | Makes the folder a map and gives its title, borrowed folders and picker settings. | `zombie/MapGroups.java:262-265`, `zombie/gameStates/ChooseGameInfo.java:64-101` |
| `<X>_<Y>.lotheader` | One per cell. Holds the cell's tile names, level range, rooms, buildings and zombie intensity. | `zombie/iso/MapFiles.java:91-96`, `zombie/iso/IsoMetaGrid.java:2221-2334` |
| `world_<X>_<Y>.lotpack` | The squares of a cell, read chunk by chunk. | `zombie/iso/IsoLot.java:123-150` |
| `chunkdata_<X>_<Y>.bin` | Registered by name, and its path is handed to the native collision code. | `zombie/iso/MapFiles.java:100-102`, `zombie/MapCollisionData.java:130` |
| `objects.lua` | Zones, read when the world loads. | `media/lua/server/metazones/metazoneHandler.lua:82-130` |
| `regions.lua` | More zones: mannequin, region, building-name and vehicle zones. | `media/lua/server/metazones/metazoneHandler.lua:132-150` |
| `roomtones.lua` | Room tone zones. | `media/lua/server/metazones/metazoneHandler.lua:67-80`, `media/lua/server/metazones/metazoneHandler.lua:152` |
| `spawnOrigins.lua` | Spawn origins, the same entries `objects.lua` may hold. | `media/lua/server/metazones/metazoneHandler.lua:157-176` |
| `basements.lua` | Basement pieces and locations. | `media/lua/shared/ProceduralBasements/basements.lua:1-12` |
| `spawnpoints.lua` | Where players may start, by profession. Read for each name in the game's map setting only. | `zombie/Lua/LuaManager.java:4527-4540` |
| `spawnregions.lua` | A custom list of start regions, used when the map list is a single name. | `media/lua/shared/SpawnRegions.lua:75-77` |
| `streets.xml` | Street names, and the `Nav` zones along the streets, for each lot directory. | `zombie/iso/IsoWorld.java:454-463`, `zombie/worldMap/streets/WorldMapStreet.java:1114-1116` |
| `worldmap.xml`, `worldmap-forest.xml` | Map data for the in-game map, added for each lot directory. | `media/lua/client/ISUI/Maps/ISMapDefinitions.lua:3-11`, `media/lua/client/ISUI/Maps/ISMapDefinitions.lua:28` |
| `worldmap-annotations.lua` | Symbols on the in-game map. | `zombie/worldMap/symbols/WorldMapSymbolsV2.java:176-183` |
| `thumb.png`, `worldmap.png`, `spawnSelectImagePyramid.zip` | The picture in the list of places to start, and the world picture beside it. | `zombie/gameStates/ChooseGameInfo.java:115-120` |
| `WorldGenOverride.lua` | World-generation overrides, run for each name in the game's map setting (`lots=` is not followed). | `zombie/iso/worldgen/WorldGenChunk.java:120-128` |
| `maps/biomemap_<X>_<Y>.png` | The biome picture of a cell, looked up under each name in the game's map setting (`lots=` is not followed). | `zombie/iso/worldgen/maps/BiomeMap.java:44-50` |

The 19 names in the file list above are the files and folders the readers in the table look for. Entries of eight types in `objects.lua` (`Vegitation`, `DeepForest`, `Forest`, `TownZone`, `Farm`, `FarmLand`, `TrailerPark` and `Nav`) are skipped by that loader. :cite[(`media/lua/server/metazones/metazoneHandler.lua:93`)]

The jar also holds a conversion class, `zombie.pot.POT`, that rewrites a folder of 300-square lot files, `objects.lua`, `spawnpoints.lua` and the world map files into 256-square ones. Nothing in the capture's source calls it, so how it is run is not verified. :cite[(`zombie/pot/POT.java:57-70`)] The cell and chunk sizes are on the [basics page](/pz/build-42/modding/world-and-tiles/basics-what-changed-and-why-it-matters-to-modders).

## 2. map.info has nine keys

The loader reads `map.info` one line at a time, trims it, and acts on a line that starts with a key and an equals sign. :cite[(`zombie/gameStates/ChooseGameInfo.java:78-101`)]

| Key | What the game does | Code |
|-----|--------------------|------|
| `title=` | The name in the list of places to start. A translation file for the folder can replace it. | `zombie/gameStates/ChooseGameInfo.java:81-82`, `zombie/core/Translator.java:403-410` |
| `lots=` | Names another map folder to load too. It can appear on several lines. It is followed only for a single-name map, not for a `;` list. | `zombie/gameStates/ChooseGameInfo.java:83-84`, `zombie/iso/IsoMetaGrid.java:2001-2012` |
| `description=` | The text beside the list. Several lines are joined. | `zombie/gameStates/ChooseGameInfo.java:85-90` |
| `fixed2x=` | It is false when the line is missing. When it is not `true`, each tile name in this folder's lot files is passed through a renaming step. | `zombie/gameStates/ChooseGameInfo.java:91-92`, `zombie/gameStates/ChooseGameInfo.java:377`, `zombie/iso/IsoCell.java:2518-2520` |
| `zoomX=`, `zoomY=` | Where the map picture centers when the entry is chosen. | `zombie/gameStates/ChooseGameInfo.java:93-96` |
| `zoomS=` | How far the picture is zoomed in. | `zombie/gameStates/ChooseGameInfo.java:97-98` |
| `demoVideo=` | The video shown when the entry is chosen. | `zombie/gameStates/ChooseGameInfo.java:99-100`, `media/lua/client/OptionScreens/MapSpawnSelect.lua:491`, `media/lua/client/OptionScreens/MapSpawnSelect.lua:706-712` |
| `only_for_game_mode=` | Limits the map to one game mode. A `GameMode.` prefix is stripped. | `zombie/gameStates/ChooseGameInfo.java:101-108` |

The table has eight rows because `zoomX=` and `zoomY=` share one; the keys are nine. The `GameMode.` prefix handling is new in 42.22. :cite[(`zombie/gameStates/ChooseGameInfo.java:102-108`)]

The old page called `lots` "the world map the map loads into" and gave `lots=Muldraugh, KY` as the vanilla form. In 42.22 `lots=` names folders that load too, and the map's own folder comes first, but only when the game map is a single name. A `;` list is used as written, without reading `lots=`, and the new-game screen builds that list itself from the folders' `lots=` lines. :cite[(`zombie/iso/IsoMetaGrid.java:2001-2012`, `zombie/iso/IsoMetaGrid.java:2034-2044`, `zombie/MapGroups.java:240-250`)] That is why vanilla's start-place folders carry `lots=Muldraugh, KY` and no lot files of their own: of the eleven folders in the installed game's `media/maps/` that have a `map.info`, only `Muldraugh, KY` has lot files.

The old page also called `fixed2x` a flag "fixing rendering issues". What the code shows is the tile-name renaming above, and nothing about rendering.

## 3. spawnpoints.lua has three forms

The file is a Lua function `SpawnPoints()` that returns a table of profession names, each with a list of points. :cite[(`media/lua/shared/SpawnRegions.lua:3-20`)]

```lua
function SpawnPoints()
  return {
    chef = {
      { posX = 10606, posY = 9474, posZ = 0 },
      { posX = 10624, posY = 10533, posZ = 0 },
    },
    unemployed = {
      { posX = 10916, posY = 10133, posZ = 0 },
    },
  }
end
```

The preferred form is the absolute one above: `posX` and `posY` are world squares, and `posZ` is the level and is 0 when left out. :cite[(`zombie/iso/SpawnPoints.java:159-170`)] A point with `worldX` is the Build 41 form: the game computes `worldX * 300 + posX` and `worldY * 300 + posY`, which is the same sum Build 41 used, so such a point lands on the same absolute square as before. :cite[(`zombie/iso/SpawnPoints.java:145-157`)] A point with `position = "center"` is placed near the middle of the loaded cells. :cite[(`zombie/iso/SpawnPoints.java:126-140`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:1099-1105`)]

The old page quoted the `worldX * 300` lines from the Java and said the 300 math "still applies in B42". That holds for the cell form only; the other two forms do not use it. The Build 41 sources have the same `* 300` lines (`iso/SpawnPoints.java` line 127 in `GAME/PZ_Engine_Records/B41/src/`).

A character picks a group by profession name, and when the map has none for that profession it uses the `unemployed` group, and when there is none of that it is an error. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:1092-1100`)] The server repeats the lookup when it creates the player. :cite[(`zombie/network/packets/character/CreatePlayerPacket.java:224-232`)] When the game turns spawn points into spawn buildings, a point that is not inside a room is logged as a warning. :cite[(`zombie/iso/SpawnPoints.java:177-186`)]

## 4. Which spawn points a player is offered

The list of start regions is built from each map folder's `spawnpoints.lua`, unless a custom regions file or a server file replaces it.

With a single map name, a map's own `spawnregions.lua` is used if it exists. With a list of maps separated by `;`, or without that file, the game makes one region per folder that has a `spawnpoints.lua`, named after the folder. :cite[(`media/lua/shared/SpawnRegions.lua:75-84`, `zombie/Lua/LuaManager.java:4511-4540`)] On a dedicated server, a file named `<server name>_spawnregions.lua` in the server folder is used first when it exists. :cite[(`media/lua/shared/SpawnRegions.lua:62-70`)]

Every server writes that file the first time it starts, and the file lists four vanilla regions (Muldraugh, West Point, Rosewood and Riverside). :cite[(`zombie/network/ServerOptions.java:284-310`)] So, as read, every server needs a line added for your map before its spawn points are offered. The line has the shape `{ name = "My Map", file = "media/maps/<Folder>/spawnpoints.lua" }`, inside the table that `SpawnRegions()` returns. :cite[(`media/lua/shared/SpawnRegions.lua:44-49`)]

The server sends each region to a client when the client connects. :cite[(`zombie/network/GameServer.java:2741-2750`)] A server can also fix one start point with the `SpawnPoint` option, written as `x,y,z`. :cite[(`zombie/iso/SpawnPoints.java:65-84`)]

:::callout[How we know]{kind=proof}
- The readers, keys and forms are read from the 42.22 decompile and its Lua. Nothing here was tested by loading a map.
- The eleven-folder count and the claim that only `Muldraugh, KY` has lot files are from the installed game's `media/maps/` on the reading machine, 2026-11-15, which is not part of the capture. Whether that install is exactly 42.22 was not checked.
- Not verified: how WorldEd, TileZed and the other tools write any of these files. The old page's folder diagram came from the community wiki ("Mapping", revision 1443363) and is replaced by the list above, which is what the game looks for.
- Not verified: that a server created earlier misses a new map's spawn points. It is read from `ServerOptions.java` and `SpawnRegions.lua`, and was not played.
- Dropped: the wiki's "stub" notes for `chunkdata`, `worldmap.xml` and `worldmap-forest.xml`. The readers are now named. The content of `chunkdata` is not shown by the Java, which only passes the file's path to native code.
- Dropped: the claim that `objects.lua` "defines car spawns and navigation meshes". The loader registers vehicle zones from other entries, and `Nav` entries in `objects.lua` are skipped.
:::
