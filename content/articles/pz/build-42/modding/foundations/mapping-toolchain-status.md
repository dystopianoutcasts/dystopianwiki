---
id: build-42-mapping-toolchain-status
slug: mapping-toolchain-status
title: Mapping toolchain status
game: pz
version: build-42
section: modding
category: foundations
difficulty: beginner
tags:
  - mapping
  - map-info
  - project-structure
excerpt: >-
  What the Build 42.22 game code decides for a map mod: where it looks for maps, what map.info does, the 256-square cell and the lot files. Tool release status is not verified.
last_updated: '2026-11-16'
related_articles:
  - the-b42-mod-project-structure
  - the-versioned-layout-common-build-folders
  - tl-dr-what-a-b41-modder-must-change-first
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who plan a map mod and want to know what the game itself requires before they open a mapping tool. The tools are outside the game code, so their status is marked not verified.

:::callout[The 1-minute version]{kind=key}
- The game finds a mod's maps in `media/maps/` and only if that folder exists in the mod's `common` folder. A mod's version folder is read for maps only after that check passes.
- A folder under `media/maps/` counts as a map only when it has a `map.info` file. Each `lots=` line in that file names another map folder to load with it.
- A map is made of cell files. The game's code uses a cell size of 256 squares, and it reads one `.lotheader` and one `.lotpack` file per cell.
- If the cell files give the grid no valid range, the game throws "Failed to find any .lotheader files".
- Which version of TileZed or WorldEd works with 42.22, and whether they need compiling from source, is not verified on this page.
:::

:::facts
- **Cell size** 256 squares
- **Map folder** `media/maps/<name>/`, with a `map.info` file
- **Cell files** `<x>_<y>.lotheader` and `world_<x>_<y>.lotpack`
- **Tool release status** not verified, checked 2026-11-16
:::

## 1. Where the game looks for maps

**A mod's maps are found under `media/maps/`, and only when that folder exists in the mod's `common` folder.**

For each active mod, the game checks for `media/maps/` in the mod's `common` folder first. :cite[(`zombie/MapGroups.java:123-150`)] Only inside that check does it also read `media/maps/` in the mod's version folder, so a map that lives only in a version folder is not found. :cite[(`zombie/MapGroups.java:140-150`)]

Each folder found there is passed to the map loader, which skips it unless it has a `map.info` file. :cite[(`zombie/MapGroups.java:254-266`)] The folder name `challengemaps` is handled separately from the rest. :cite[(`zombie/MapGroups.java:128-130`)]

## 2. What map.info does

**The game reads `map.info` for one thing: the `lots=` lines that name other map folders to load with this one.**

Each line that starts with `lots=` adds a folder name to the map's list. :cite[(`zombie/MapGroups.java:277-278`)] Maps that list each other, or share a folder, are put into one group. :cite[(`zombie/MapGroups.java:170-186`)] The other keys in `map.info` are read elsewhere; see [map files, map.info and the spawn points](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure) for them.

## 3. Cells and lot files

**A map is a grid of 256-square cells, and each cell is a `.lotheader` file and a `.lotpack` file.**

The engine defines a cell as 256 squares. :cite[(`zombie/iso/IsoCell.java:127`)] The zone code divides a square's coordinate by 256 to find its cell. :cite[(`zombie/iso/IsoMetaGrid.java:212-213`)] The header file for a cell is named `<x>_<y>.lotheader`. :cite[(`zombie/iso/IsoMetaGrid.java:2203`)] The pack file is named `world_<x>_<y>.lotpack`. :cite[(`zombie/iso/IsoLot.java:123`)]

The loader lists the map folder's files that end in `.lotheader`. :cite[(`zombie/MapGroups.java:360-368`)] When the cell files give the grid no valid range, the grid throws "Failed to find any .lotheader files". :cite[(`zombie/iso/IsoMetaGrid.java:1474-1498`)]

Map tools are one way to make these files. For the order they run in, see [the map modding toolchain for B42](/pz/build-42/modding/world-and-tiles/map-modding-toolchain-for-b42).

:::callout[How we know]{kind=proof}
The map rules come from the 42.22 decompiled Java; no game was run. Not verified, dated 2026-11-16: whether an official release of TileZed, WorldEd or WorldZed exists for Build 42, whether they must be compiled from source, that some tilesheets must be unpacked from the game's `texturepacks` first, the `Unjammer/PZ_Vanilla_map_b42` reference project, and the advice to load Maps, then Tile Packs, then Framework mods, then Vehicle mods. None of these are decided by the game code read here. Not checked either: what the other keys in `map.info` do.
:::
