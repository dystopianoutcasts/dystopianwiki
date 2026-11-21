---
id: build-42-tile-system
slug: tile-system
title: 'The tile system: tilesheets, tiledefs, tile depth and the .pack pipeline'
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
  How a custom tile gets into 42.22: the two mod.info lines, the tiledef number range (100 to 8189), sprite ids, tile depth shapes and the tile properties the code names.
last_updated: '2026-11-15'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - the-new-lighting-rendering-engine
  - map-tile-modder-migration-checklist
  - multi-z-the-vertical-engine-change
  - tiles-and-tiledefs
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- A custom tile needs a texture pack, a tile definition file and a map that uses the tile. The game reads the first two from two lines in the mod's `mod.info`: `pack=<name>` and `tiledef=<name> <number>`.
- The number must be a whole number from 100 to 8189. A number outside that range stops the mod's `mod.info` from reading. The old page said 100 to 16382 with 8190 as a safe ceiling; the 42.22 code stops at 8189.
- If two active mods use the same number, the game loads the first mod's file and logs an error for the second. The second mod's tiles are not loaded.
- A mod file holds up to 512 tilesets of up to 512 tiles each. Vanilla's main file is the only one allowed 1,024 of each.
- Tile depth shapes (box, cylinder, polygon) live in a `tileGeometry.txt`, and the game reads a mod's copy only from the mod's `common/media` folder.
- The old page called the colored light fields uncertain. The code reads them from three tile properties, `lightR`, `lightG` and `lightB`, with `LightRadius` for the size.
:::

:::facts
- **Tiledef number** 100 to 8189 per mod file
- **Tilesets per mod file** up to 512, each up to 512 tiles
- **Named tile properties** 238 in `IsoPropertyType`, 278 in a second list
- **Tile geometry file** versions 1 and 2, three shapes
:::

Outcast, this page is for the moment you have art and need the game to know it exists. It says what the 42.22 code reads, in the order it reads it, and which old rules it does not support.

## 1. A tile needs a pack, a definition and a map

A tile reaches the game through a texture pack, a tile definition file and a map or building that places it.

The loader treats the first two as separate mod.info entries. The `pack=` line names a pack that the game looks for as `media/texturepacks/<name>.pack`. :cite[(`zombie/ZomboidFileSystem.java:977-986`)] The path is compared in lower case, and a pack that is not found is a warning, not a stop. :cite[(`zombie/ZomboidFileSystem.java:978-981`)]

The `tiledef=` line names a tile definition file that the game looks for as `media/<name>.tiles`, and logs an error for the mod if the file is missing. :cite[(`zombie/ZomboidFileSystem.java:1006-1015`)] A `pack=` line may add `type=ui`, which marks a pack of interface art. :cite[(`zombie/gameStates/ChooseGameInfo.java:267-292`)]

:::flow[What the game does with a tile mod]
- Read mod.info: pack= and tiledef= lines
- Load the .pack textures
- Load the .tiles file under its number
- Run OnLoadedTileDefinitions
- Maps and buildings use the tile
:::

The order is vanilla's seven definition files first, then each active mod's file, then the `OnLoadedTileDefinitions` event. :cite[(`zombie/iso/IsoWorld.java:1984-1998`)] A file whose name ends in `.patch.tiles` does not add sprites. It changes the properties of sprites that already exist under the same name. :cite[(`zombie/iso/IsoWorld.java:657`, `zombie/iso/IsoWorld.java:722-731`)]

## 2. The tiledef number is 100 to 8189

The number in a `tiledef=` line must be a whole number from 100 to 8189, or the game logs an error and does not read the mod's `mod.info`.

The code reads two words after `tiledef=`, rejects anything that is not a name and an integer, and then checks the range. :cite[(`zombie/gameStates/ChooseGameInfo.java:304-326`)] The Build 41 code accepted up to 16382 (`gameStates/ChooseGameInfo.java` lines 333-337 in `GAME/PZ_Engine_Records/B41/src/`), and that is the source of the old page's "100 to 16382". In 42.22 the upper limit is 8189.

The cap matches the size of the sprite id.

A tile's id is `1048576 + (fileNumber - 2) * 262144 + (tilesetNumber - 1) * 512 + tileIndex` for every file except number 1. :cite[(`zombie/iso/IsoWorld.java:651-653`)] With the largest tileset number (512) and tile index (511), file 8189 gives exactly 2,147,483,647, the top of a 32-bit integer, and file 8190 would pass it. That is our arithmetic from the formula. The code does not say why 8189 was chosen.

Two mods with the same number do not both load. The loader remembers a number only after it has found the mod's `.tiles` file and loaded it, so a mod with a missing file does not claim its number. A second mod that asks for one gets an error in the log and no tiles. :cite[(`zombie/ZomboidFileSystem.java:1000-1019`, `zombie/ZomboidFileSystem.java:1010-1018`)] The mods are visited in the active mod list's order, so the first one in the list keeps the number. :cite[(`zombie/ZomboidFileSystem.java:1003-1006`)]

The file itself has hard limits. A mod's `.tiles` file may hold up to 512 tilesets and each tileset up to 512 tiles, and a tileset number must be 1 to 512. A file over the limit throws an error. Only vanilla's file number 1 is allowed 1,024 of each. :cite[(`zombie/iso/IsoWorld.java:658-659`, `zombie/iso/IsoWorld.java:700-716`)]

## 3. Tile depth is a shape file and a picture file

A tile's depth is described by shapes in a `tileGeometry.txt` and by optional `DEPTH_` pictures, and the game looks for both beside the mod's `common/media` folder.

The geometry file starts with a `VERSION` of 1 or 2 (2 is the latest), then has one `tileset` block per sheet with a `tile` block per tile, addressed as `xy` (column x row). :cite[(`zombie/tileDepth/TileGeometryFile.java:45`, `zombie/tileDepth/TileGeometryFile.java:68-90`, `zombie/tileDepth/TileGeometryFile.java:119-121`)] A tile block can hold three shapes, `box`, `cylinder` and `polygon`, plus a `properties` block. :cite[(`zombie/tileDepth/TileGeometryFile.java:123-148`)] Tiles are indexed as column plus row times 8, so a sheet is eight tiles wide here. :cite[(`zombie/tileDepth/TileGeometryFile.java:103`, `zombie/tileDepth/TileGeometryFile.java:329`)]

The properties block can carry `ItemHeight`, `Surface`, `CurtainOffset` (three numbers), and three yes or no flags: `OpaquePixelsOnly`, `Translucent` and `UseObjectDepthTexture`. :cite[(`zombie/tileDepth/TileGeometryFile.java:882-920`)] Pictures are read from a `depthmaps` folder as files named `DEPTH_<tileset>.png`. :cite[(`zombie/tileDepth/TileDepthTextures.java:127-139`)] A mod's pictures are loaded only if that mod also has a `common/media/tileGeometry.txt`. :cite[(`zombie/tileDepth/TileDepthTextureManager.java:51-58`)]

The game reads its own file from its `media/tileGeometry.txt`. A mod's file is only seen if it sits in `<mod>/common/media/tileGeometry.txt`, because both managers test that exact folder. :cite[(`zombie/tileDepth/TileGeometry.java:30-33`, `zombie/tileDepth/TileGeometryManager.java:37-48`, `zombie/tileDepth/TileDepthTextureManager.java:51-58`)] A file in the version folder (for example `42/media`) is ignored.

The game ships a tile geometry editor in its debug interface folder. :cite[(`media/lua/client/DebugUIs/TileGeometryEditor/TileGeometryEditor.lua:1`)] How to use it is not verified here. The Build 41 sources have no `tileDepth` package, so the system is new in Build 42.

## 4. Tile properties are two lists of names

A tile's behavior comes from named properties, and the engine keeps two lists of names, one of 238 and one of 278.

The first list runs from `IsoType` to `CarSlowFactor`. :cite[(`zombie/core/properties/IsoPropertyType.java:19`, `zombie/core/properties/IsoPropertyType.java:256`)] The ones a mapper meets first are `Surface`, `ItemHeight` and `IsSurfaceOffset` for where items sit. :cite[(`zombie/core/properties/IsoPropertyType.java:83`, `zombie/core/properties/IsoPropertyType.java:86`, `zombie/core/properties/IsoPropertyType.java:167`)] 

The second list, `TilePropertyKey`, registers 278 distinct names, and it holds names this page uses and `IsoPropertyType` lacks: `CurtainOffset`, `OpaquePixelsOnly`, `Translucent`, `UseObjectDepthTexture` and the `LightFilter` family. :cite[(`zombie/core/properties/TilePropertyKey.java:17-295`)] The lists overlap in part, and we did not compare them name by name. The light fields are below.

::::cards
:::card[Colored light]{accent=orange}
`lightR`, `lightG` and `lightB` take 0 to 255 and the game divides each by 255. `LightRadius` sets the radius. Details and defaults are on the [lighting page](/pz/build-42/modding/world-and-tiles/the-new-lighting-rendering-engine).
:::
:::card[Streetlights]{accent=blue}
A tile with `streetlight` is treated as a street light, which the game switches by night and grid power. :cite[(`zombie/core/properties/IsoPropertyType.java:52`, `zombie/iso/LightingJNI.java:291`)]
:::
::::

The list is names only. What each property does is spread through the game code, and "not all interactions come from tile properties", as the old page warned, is still the right way to read it.

## 5. What this page does not check

The editor side of tile work, and the community's records, are not in the game code and are not checked here.

:::callout[How we know]{kind=proof}
- Every citation above was read in the 42.22 decompile. Nothing was tested by loading a mod.
- Changed: the tiledef range. The old page said 100 to 16382 with 8190 as a "safe practical ceiling". The code allows 100 to 8189 (`zombie/gameStates/ChooseGameInfo.java:321-325`).
- Changed: a duplicate number. The old page said the affected mods "will not work properly". The code loads the first mod and skips the second (`zombie/ZomboidFileSystem.java:1007-1009`).
- Changed: colored light. The old page said the property names were unknown. They are `lightR`, `lightG`, `lightB` and `LightRadius`.
- Dropped, not verified: sheet sizes (1024 by 2048 or 1024 by 4096), "64 sprites per sheet", the 128 by 256 sprite limit, lower-case `.png` names, the `.tilelayers.xml` file and the TileZed menu steps. They are about the editors, not the engine. See [tiles and tiledefs](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs) for the editor procedure.
- Dropped, not verified: the community registry of tiledef numbers and its examples of clashes, and the count of Build 42 tile packs.
- Not verified: that tile depth "replaced the layer system", that depth works like a normal map, and where the debug editor is opened from.
:::

## Where to go next

- [The new lighting engine](/pz/build-42/modding/world-and-tiles/the-new-lighting-rendering-engine)
- [Map tile modder checklist](/pz/build-42/modding/world-and-tiles/map-tile-modder-migration-checklist)
- [Tiles and tiledefs (editor steps)](/pz/build-42/mapping/buildings-and-tiles/tiles-and-tiledefs)
