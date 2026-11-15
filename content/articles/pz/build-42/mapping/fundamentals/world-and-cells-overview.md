---
id: build-42-world-and-cells-overview
slug: world-and-cells-overview
title: World and cells
game: pz
version: build-42
section: mapping
category: fundamentals
difficulty: intermediate
tags:
  - cell-size
  - worldmap
  - biomemap
  - lot-export
excerpt: >-
  Start here for mapping: how big a cell is in 42.22, which files the game reads from a map folder, and a guide to the mapping pages and the map pages for modders.
last_updated: '2026-11-15'
related_articles:
  - the-world-map
  - the-cell-size-question
  - coordinates-use-b41-numbers
  - authoring-the-world-from-pngs
  - bmp-to-tmx
  - script-files-that-drive-generation
  - thumbnails
  - trimming-the-world-rectangle
  - biomemap
  - zombie-heatmap
  - in-game-map-worldmap-generation
  - street-names
  - preview-modes-power-snow-jumbo
  - vegetation-on-upper-levels
  - automapper
  - lot-generation-and-export
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [map makers](#the-pages-in-this-series) | [modders working with maps](#map-pages-for-modders) | [server owners](#what-the-game-reads-from-a-map-folder)

:::callout[The 1-minute version]{kind=key}
- In the 42.22 game a cell is 256 by 256 squares and a chunk is 8 by 8 squares.
- The game finds a map's cells from the lot header files in its folder, named by cell x and y.
- The in-game map (the M window) reads its own data files in the same folder, not the lot files.
- The mapping tools can work on a 300 or a 256 grid, and the pages in this series say which is which. That part comes from the tools' own notes and is not verified in the game code.
- This page points to the right mapping page for each job; it does not repeat them.
:::

:::facts
- **Cell** 256 by 256 squares :cite[(`IsoCell.java:127`)]
- **Chunk** 8 by 8 squares :cite[(`IsoChunkMap.java:54`)]
- **Chunks along one side of a cell** 32 :cite[(`IsoCell.java:126`)]
- **Lot header file name** `<cell x>_<cell y>.lotheader` :cite[(`MapFiles.java:121`)]
:::

## The cell in the game

The game works in cells of 256 by 256 squares, each made of chunks of 8 by 8 squares.

A cell is 256 squares on a side :cite[(`IsoCell.java:127`, `:283-285`)]. It holds 32 chunks along each side :cite[(`IsoCell.java:126`)], and each chunk is 8 squares on a side :cite[(`IsoChunkMap.java:54`)]. The world map data uses the same cell size: its binary reader rejects any other :cite[(`WorldMapBinary.java:50-52`)], and the position of a map shape inside a cell is counted from the cell's own corner :cite[(`WorldMapCell.java:25-27`)].

The game still has code for the older 300-square grid. When it lines up two maps' world map shapes, it converts between 256-square cells and 300-square cells :cite[(`MapFiles.java:127-138`, `WorldMapGeometry.java:141-160`)]. How the tools use the two grids is on [The cell-size question](/pz/build-42/mapping/fundamentals/the-cell-size-question).

## What the game reads from a map folder

A map folder holds the lot files the game plays on, and separate data files the in-game map draws.

The game lists a map's cells from files named `<x>_<y>.lotheader` in the folder :cite[(`MapFiles.java:118-124`)]. The in-game map reads other files from the same folder: `worldmap.xml` and `worldmap-forest.xml` (or their `.bin` forms), `streets.xml` and `worldmap-annotations.lua`, and the image files `pyramid.zip` and `forest.pyramid.zip` :cite[(`ISMapDefinitions.lua:3-20`, `:32-39`, `:52-60`, `WorldMap.java:151-153`, `WorldMapImages.java:22`, `WorldMapDataAssetManager.java:34-38`)].

The details of the world map side, including who owns the fog of discovery on a server, are on [The world map](/pz/build-42/modding/engine/the-world-map). How to make the shapes and what the game accepts is on [In-game map (worldmap) generation](/pz/build-42/mapping/fundamentals/in-game-map-worldmap-generation).

## The pages in this series

Each mapping page covers one job, and the table says when to read it.

The table follows the series order. The flow below is the order the lot generation page gives: it says to generate lots after the world is painted, buildings placed and zones defined. The descriptions are taken from what each page says about itself; the tool behavior they describe is from the tools' own notes and is not checked against the game code.

:::flow[The order the lot page gives]
- Paint the world from PNGs
- Convert it to TMX cells
- Place buildings and define zones
- Generate lots
:::

| Page | Read it when |
|---|---|
| [The cell-size question](/pz/build-42/mapping/fundamentals/the-cell-size-question) | You need to choose between the 300 and the 256 grid, or you are confused by cell numbers |
| [Coordinates: use B41 numbers](/pz/build-42/mapping/fundamentals/coordinates-use-b41-numbers) | You are placing your map relative to the vanilla world |
| [Authoring the world from PNGs](/pz/build-42/mapping/fundamentals/authoring-the-world-from-pngs) | You are starting from `Map.png` and `Map_veg.png` |
| [BMP to TMX](/pz/build-42/mapping/fundamentals/bmp-to-tmx) | You are turning the painted images into editable cells |
| [Script files that drive generation](/pz/build-42/mapping/fundamentals/script-files-that-drive-generation) | You need `Rules.txt`, `Blends.txt` or the other tool script files |
| [Thumbnails](/pz/build-42/mapping/fundamentals/thumbnails) | Cell previews are blank or out of date |
| [Trimming the world rectangle](/pz/build-42/mapping/fundamentals/trimming-the-world-rectangle) | Your world has empty border cells |
| [Biomemap](/pz/build-42/mapping/fundamentals/biomemap) | You are making the biome and foraging data grid |
| [Zombie heatmap](/pz/build-42/mapping/fundamentals/zombie-heatmap) | You are painting where zombies spawn |
| [In-game map (worldmap) generation](/pz/build-42/mapping/fundamentals/in-game-map-worldmap-generation) | Your map shows nothing on the M map |
| [Street names](/pz/build-42/mapping/fundamentals/street-names) | You want street labels on the in-game map |
| [Preview modes: POWER / SNOW / JUMBO](/pz/build-42/mapping/fundamentals/preview-modes-power-snow-jumbo) | You want to preview power, snow or jumbo trees in the editor |
| [Vegetation on upper levels](/pz/build-42/mapping/fundamentals/vegetation-on-upper-levels) | You want plants above ground level |
| [Automapper](/pz/build-42/mapping/fundamentals/automapper) | You want rules that place tiles automatically |
| [Lot generation and export](/pz/build-42/mapping/fundamentals/lot-generation-and-export) | Your world is painted and you want the files the game loads |

## Map pages for modders

The modding section has its own set of map and tile pages, for people who change the world rather than draw it.

The modding pages below used to hang off one index page, which now points here. They cover what changed in Build 42, the tile system, map files and the toolchain.

| Page | Read it when |
|---|---|
| [Basics: what changed and why it matters to modders](/pz/build-42/modding/world-and-tiles/basics-what-changed-and-why-it-matters-to-modders) | You made maps in Build 41 and need the headline changes |
| [The map expansion (Knox Country) and new towns](/pz/build-42/modding/world-and-tiles/the-map-expansion-knox-country-new-towns) | You want the setting and the new towns |
| [Multi-Z: the vertical engine change](/pz/build-42/modding/world-and-tiles/multi-z-the-vertical-engine-change) | You build tall or deep |
| [Basements and the underground system](/pz/build-42/modding/world-and-tiles/basements-the-underground-system) | You are adding basements |
| [The tile system](/pz/build-42/modding/world-and-tiles/tile-system) | You are adding custom tiles |
| [The new lighting and rendering engine](/pz/build-42/modding/world-and-tiles/the-new-lighting-rendering-engine) | Your tiles or lights look wrong |
| [Map-modding toolchain for B42](/pz/build-42/modding/world-and-tiles/map-modding-toolchain-for-b42) | You need to choose and install the tools |
| [How to make a B42 map, building or basement](/pz/build-42/modding/world-and-tiles/how-to-make-a-b42-map-building-basement) | You want the steps from nothing to a working map |
| [Map files: map.info, spawnpoints.lua, folder structure](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure) | You are laying out a map mod's folder |
| [Zones: vehicle and parking zones, foraging](/pz/build-42/modding/world-and-tiles/zones-vehicle-parking-zones-foraging) | Vehicles or foraging are not appearing |
| [Multiplayer and map-streaming notes](/pz/build-42/modding/world-and-tiles/multiplayer-map-streaming-notes) | You are hosting a map mod |
| [Map and tile modder migration checklist](/pz/build-42/modding/world-and-tiles/map-tile-modder-migration-checklist) | You are porting a Build 41 map |

:::callout[How we know]{kind=proof}
The cell and chunk sizes, the lot header file names and the files the in-game map reads were opened in the 42.22 capture. The older version of this page was only a list of titles and had no facts of its own to check.

**Not verified:** everything the series says about the mapping tools (the 300 and 256 grids as a choice in the tools, `Rules.txt`, the editors, thumbnails and the rest), because the tools are not in the capture. The "Read it when" lines are our summaries of what each page says about itself. The vanilla `map.info` file, which the cell-size page quotes, is not in the capture either.
:::
