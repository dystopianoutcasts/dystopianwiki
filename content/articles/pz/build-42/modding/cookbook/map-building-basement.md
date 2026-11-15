---
id: build-42-map-building-basement
slug: map-building-basement
title: 'Map, building, or basement'
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build a map mod with no tool: a new start location on the vanilla map. Then see which files the mapping tools add for your own cells, buildings and basements.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - map-files-map-info-spawnpoints-lua-folder-structure
  - how-to-make-a-b42-map-building-basement
  - basements-the-underground-system
  - buildings-and-buildinged
  - tools-setup
  - lot-generation-and-export
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoMap`: `mod.info`, `poster.png`, and a map folder with `map.info`, `spawnpoints.lua` and `thumb.png`. Every file is text or a copy of the poster, so no mapping tool is needed.
- The map folder points at the vanilla world with `lots=Muldraugh, KY`, so the mod adds a start location and no new ground.
- You start a new game and see **Recipe Demo Start** in the list of places to start.
- A building, a new cell or a basement is made in the mapping tools and exported as lot files. This page names those files and links the pages that teach the tools; it does not make them.
:::

:::facts
- **Mod id** `RecipeDemoMap`
- **Map folder** `RecipeDemoMap`, with `lots=Muldraugh, KY`
- **Files** 5 (`mod.info`, `poster.png`, `map.info`, `spawnpoints.lua`, `thumb.png`)
- **Start point** world position 10916, 10133
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A map mod that adds one new place to start a game, on the world the game already has.**

A map mod is a folder under `media/maps/` with a `map.info` file. The folder can hold its own lot files, which are the tiles of a cell, or it can borrow another map's lot files with a `lots=` line. This recipe borrows, so the whole mod is five small files, and you learn the three files every map folder has: `map.info`, `spawnpoints.lua` and a thumbnail.

In the game, a new game offers **Recipe Demo Start** next to the vanilla places to start, and a character who picks it appears in the vanilla town of Muldraugh.

## The files

**The skeleton's two files plus a map folder with three files in it, under `common/`.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `42/` folder with `mod.info` and the same `poster.png`, but here `common/` is not empty. This recipe leaves out the skeleton's `Boot.lua`, because the map needs no mod Lua.

```
Zomboid/mods/RecipeDemoMap/
  common/
    media/
      maps/
        RecipeDemoMap/
          map.info
          spawnpoints.lua
          thumb.png
  42/
    mod.info
    poster.png
```

The game looks for map folders in `media/maps/` of every enabled mod, and it skips a folder that has no `map.info`. :cite[(`zombie/MapGroups.java:123-153`, `zombie/MapGroups.java:262-265`)] It reads the `42/media/maps/` folder only after it has found a `common/media/maps/` folder, so the map goes under `common/`; an empty `common/media/maps/` would also let `42/` be read. :cite[(`zombie/MapGroups.java:123-150`)] A map folder whose `map.info` has a `lots=` line is grouped with the folder it names, so your folder joins the vanilla map's group. :cite[(`zombie/MapGroups.java:164-175`, `zombie/MapGroups.java:277-278`)]

## Step by step

**Write `mod.info`, copy the poster twice, then the two text files of the map folder.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page. The recipe has no `require=` line.

**File `42/mod.info`**

```
name=Recipe Demo Map
id=RecipeDemoMap
description=Adds a start point on the vanilla Muldraugh map. The cookbook map recipe.
poster=poster.png
author=Your Name
```

### Step 2. `common/media/maps/RecipeDemoMap/map.info`

This file names the map and says which lot files it uses. The loader reads it line by line and matches each line by its start. :cite[(`zombie/gameStates/ChooseGameInfo.java:64-101`)] It is modeled on the `map.info` of vanilla's Rosewood town folder, which has the line `lots=Muldraugh, KY` and the same zoom lines (the installed 42.22 game's `media/maps/Rosewood, KY/map.info`, lines 1-8; the capture holds no maps folder). The server's default region list names the town folders. :cite[(`zombie/network/ServerOptions.java:305-308`)]

**File `common/media/maps/RecipeDemoMap/map.info`**

```
title=Recipe Demo Start
lots=Muldraugh, KY
fixed2x=true
description=A start point on the vanilla map, added by the cookbook map recipe.
zoomX=10919
zoomY=10137
zoomS=14.5
```

| Line | What the loader does | Code |
|------|----------------------|------|
| `title=` | The name shown in the list of places to start. | `zombie/gameStates/ChooseGameInfo.java:81-82`, `media/lua/client/OptionScreens/MapSpawnSelect.lua:481` |
| `lots=` | Adds a folder whose lot files this map uses. The folder named there is loaded too. | `zombie/gameStates/ChooseGameInfo.java:83-84`, `zombie/iso/IsoMetaGrid.java:2000-2012` |
| `fixed2x=` | When it is not `true`, the engine runs each tile name from that folder's lot files through a name-fixing step. The vanilla map folders carry the line. | `zombie/gameStates/ChooseGameInfo.java:91-92`, `zombie/iso/IsoCell.java:2518-2520` |
| `description=` | The text shown beside the list. | `zombie/gameStates/ChooseGameInfo.java:85-90`, `media/lua/client/OptionScreens/MapSpawnSelect.lua:484` |
| `zoomX=`, `zoomY=`, `zoomS=` | Where the map picture centers, and how far it is zoomed in, when this entry is selected. | `zombie/gameStates/ChooseGameInfo.java:93-98`, `media/lua/client/OptionScreens/MapSpawnSelect.lua:488-490`, `media/lua/client/OptionScreens/MapSpawnSelect.lua:721-725` |

The zoom numbers here are a world position next to the start point, so the picture opens on it. The title and description lines can be overridden: the game also reads a `title` and a `description` from `Translate/<language>/<folder name>.json`, and vanilla ships such a file for Rosewood. :cite[(`zombie/gameStates/ChooseGameInfo.java:123`, `zombie/core/Translator.java:403-410`)] This recipe leaves them in `map.info`. The value 14.5 for `zoomS` is a choice of this page, borrowed from one of our own test maps; this page did not check what scale it gives.

### Step 3. `common/media/maps/RecipeDemoMap/spawnpoints.lua`

This file lists where a new character can appear. It must define a function called `SpawnPoints` that returns a table, and the loader calls it. :cite[(`media/lua/shared/SpawnRegions.lua:3-19`)] The keys of the table are professions, and the engine adds the points of every profession to the list of start points. :cite[(`zombie/iso/SpawnPoints.java:102-122`)]

**File `common/media/maps/RecipeDemoMap/spawnpoints.lua`**

```lua
function SpawnPoints()
    return {
        unemployed = {
            { posX = 10916, posY = 10133, posZ = 0 }
        }
    }
end
```

A point with `posX`, `posY` and `posZ` is a plain world position. :cite[(`zombie/iso/SpawnPoints.java:158-166`)] Vanilla's own files use this form, and the installed 42.22 game's Muldraugh file (`media/maps/Muldraugh, KY/spawnpoints.lua`, lines 2-7 and 23) lists points such as 10919, 10137, which is next to this one; the capture holds no maps folder. The engine still reads the older `worldX`, `worldY` form, which multiplies by 300. :cite[(`zombie/iso/SpawnPoints.java:155-156`)] This page did not check what stands at 10916, 10133.

### Step 4. `common/media/maps/RecipeDemoMap/thumb.png`

This is the map's thumbnail. The loader reads `thumb.png` from the map folder. :cite[(`zombie/gameStates/ChooseGameInfo.java:115`)] Copy the same `poster.png` here under the name `thumb.png`. It is a 761-byte PNG, 256 by 256 pixels.

Vanilla's town folders carry a `thumb.png` too (the installed game's `Rosewood, KY` folder has one), and this page did not check what happens when the file is missing.

## Turn it on and see it work

**Check the mod, start a new game and pick the new start.**

1. Put the `RecipeDemoMap` folder in `Zomboid/mods/`. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Map**, choose **ACCEPT**.
2. Start a new game. When the game asks where to start, look for **Recipe Demo Start** in the list. The list holds one entry for each map folder of the chosen world that has a `spawnpoints.lua`, named by its `title=` line. :cite[(`zombie/Lua/LuaManager.java:4526-4537`, `media/lua/client/OptionScreens/MapSpawnSelect.lua:474-484`)]
3. Select it. The map picture should move to the start point. :cite[(`media/lua/client/OptionScreens/MapSpawnSelect.lua:721-725`)] Start the game.

You should appear at world position 10916, 10133, in Muldraugh. This page did not run it, so the exact spot is what you check yourself.

On a dedicated server, put `Mods=RecipeDemoMap` in the settings file (several entries are separated by `;`) and copy the mod into the server's own `mods` folder, as the skeleton page describes. The map setting defaults to `Muldraugh, KY`, so the vanilla world loads. :cite[(`zombie/network/ServerOptions.java:74`)] A server that has its own `<ServerName>_spawnregions.lua` file shows only the regions listed in it, so add a line for the new folder there, in the form `{ name = "RecipeDemoMap", file = "media/maps/RecipeDemoMap/spawnpoints.lua" }`. :cite[(`media/lua/shared/SpawnRegions.lua:62-67`, `zombie/network/ServerOptions.java:296-312`)] These server steps have not been run in a game.

## If it does not work

**A map mod fails quietly, so check that the folder is found, that the start list shows it, and that the point is on ground.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| **Recipe Demo Start** is not in the list | The folder has no `map.info`, the folder is not under `common/media/maps/` of the mod, or the mod is not checked for this game. | `zombie/MapGroups.java:262-265` |
| `ERROR: "media/maps/RecipeDemoMap/spawnpoints.lua" doesn't exist, spawn points may be broken` in the log | The region was named but its file is missing. Check the file name and the folder name. | `media/lua/shared/SpawnRegions.lua:12-16` |
| The entry shows the folder name and no description | The game could not read `map.info` for that folder, so it used the plain name. Check the file name and that the folder name matches. | `media/lua/client/OptionScreens/MapSpawnSelect.lua:477-497` |
| You are asked to choose between several worlds, or an error says the map is `DEFAULT` with several worlds | The mod's folder is not grouped with the vanilla map. Check that `lots=Muldraugh, KY` is spelled exactly like the vanilla folder name, comma and space included. | `zombie/iso/IsoMetaGrid.java:2023-2028` |
| The character appears in the wrong place or in a wall | The point is not where you meant. Use the plain world position, and check it against vanilla's points. | `zombie/iso/SpawnPoints.java:158-166` |
| A changed `map.info` or `spawnpoints.lua` does not seem to apply | The details of each map are read once and kept in memory, so restart the game after a change. | `zombie/gameStates/ChooseGameInfo.java:60-62` |

## What needs a mapping tool

**Your own cell, building or basement is made in the mapping tools and exported as lot files, which this recipe cannot give as text.**

When a map folder owns its ground, it holds binary lot files that the tools write. A one-cell map made with the tools has, in its map folder, a `.lotheader` file, a `world_<X>_<Y>.lotpack` file, a `chunkdata_<X>_<Y>.bin` file and a `maps/biomemap_<X>_<Y>.png` picture, plus the same `map.info` and `spawnpoints.lua` you wrote here. The cell numbers go in the names, and the one-cell test map we made used a header of about 5 KB, a chunk data file of about 6 KB and a lot pack of about 0.8 MB. Those sizes are one sample, not a rule.

| You want | What makes it | Where to learn it |
|----------|---------------|-------------------|
| A new cell with roads, grass and trees | The mapping tools, then an export to lot files | [Tools setup](/pz/build-42/mapping/fundamentals/tools-setup), [Lot generation and export](/pz/build-42/mapping/fundamentals/lot-generation-and-export) |
| A building | The building editor, placed in a cell | [Buildings and BuildingEd](/pz/build-42/mapping/buildings-and-tiles/buildings-and-buildinged) |
| A basement | A basement made with the multi-level support of Build 42 | [Basements, the underground system](/pz/build-42/modding/world-and-tiles/basements-the-underground-system), [How to make a B42 map, building or basement](/pz/build-42/modding/world-and-tiles/how-to-make-a-b42-map-building-basement) |
| Your own tiles | A tile pack and a tile definition number | [Tiles and tiledefs](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) |

The game reads lot files only when a chunk is first made, so a changed map needs a new save to show. That rule comes from the mapping notes of this project and was not re-read in the code for this page.

## Going further

**Learn the map folder, then the tools.**

- [Map files: map.info, spawnpoints.lua and the folder structure](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure) covers the files of this recipe in more depth.
- [Mapping overview](/pz/build-42/mapping/fundamentals/mapping-overview) starts the tool side.
- [How to make a B42 map, building or basement](/pz/build-42/modding/world-and-tiles/how-to-make-a-b42-map-building-basement) goes on to the parts this recipe leaves out.

:::callout[How we know]{kind=proof}
The map folder rules, the `map.info` keys and the spawn point forms come from the 42.22 engine code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the Lua checker. It has not been run in a game: the entry in the start list, the zoom and the start position are what you check yourself.

The map files quoted from vanilla come from the installed 42.22 game, not from the capture, so they are named by path in plain parentheses. What stands at the start point was not checked. The old page said to compile the mapping tools from source, to author on a 300 grid, and to keep tile definition numbers in a range; those tool and numbering claims were not re-read in code here and moved to the mapping pages, so they are dropped from this recipe.
:::
