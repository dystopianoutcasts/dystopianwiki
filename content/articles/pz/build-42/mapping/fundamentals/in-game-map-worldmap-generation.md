---
id: build-42-in-game-map-worldmap-generation
slug: in-game-map-worldmap-generation
title: In-game map (worldmap) generation
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
  How the data behind the in-game map is made and what the game accepts when it loads it: the mapping tools' road-feature export, its rejection rules, and the file formats the 42.22 game reads.
last_updated: '2026-11-15'
related_articles:
  - the-world-map
  - world-and-cells-overview
  - the-cell-size-question
  - coordinates-use-b41-numbers
  - authoring-the-world-from-pngs
  - bmp-to-tmx
  - script-files-that-drive-generation
  - thumbnails
  - trimming-the-world-rectangle
  - biomemap
  - zombie-heatmap
  - street-names
  - preview-modes-power-snow-jumbo
  - vegetation-on-upper-levels
  - automapper
  - lot-generation-and-export
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [map makers](#making-the-data-with-the-mapping-tools) | [anyone checking what the game accepts](#what-the-game-reads)

:::callout[The 1-minute version]{kind=key}
- The in-game map is drawn from separate world map data files in your map folder, not from your lot files. A map folder without them adds no shapes to the map.
- The mapping tools make that data. Their `InGameMap > Generate Road Features` action derives road, trail and railway polygons from recognized map tiles; this comes from the tools' own notes and is not verified in the game code.
- The game reads `worldmap.xml`, or the binary `worldmap.xml.bin` when one sits beside it. The binary must be version 2 with cell size 256.
- Every map point is stored as a 16-bit whole number, so a coordinate outside that range wraps silently in the XML reader, which casts to a 16-bit number.
- If you keep both an XML and a binary file, the game loads the binary and ignores the XML.
:::

:::facts
- **Cell size in the data** 256 squares; a binary file with another cell size is rejected :cite[(`WorldMapBinary.java:50-52`)]
- **Binary version** 2 only; version 1 (cell size 300) is rejected :cite[(`WorldMapBinary.java:23-25`, `:41-48`)]
- **Largest count of properties on a feature** 255, written as one byte :cite[(`WorldMapBinary.java:155`)]
- **Largest count of point lists in one geometry** 255, written as one byte :cite[(`WorldMapBinary.java:182`)]
- **Points in one list** up to 32,767, written as a 16-bit number :cite[(`WorldMapBinary.java:197`)]
:::

## What the data is

The in-game map draws a set of shapes (roads, buildings, water and other features) from a data file that you generate for your map.

The game reads the file `worldmap.xml` in your map's folder, and `worldmap-forest.xml` for the forest layer; if a `.bin` file with the same name plus `.bin` exists, it loads that file in its place :cite[(`ISMapDefinitions.lua:3-12`, `WorldMapDataAssetManager.java:34-38`)]. The shapes are not read from the loaded world, so a map that plays well can still show nothing on the M map.

What happens to the data afterward is on [The world map](/pz/build-42/modding/engine/the-world-map).

## Making the data with the mapping tools

The mapping tools make the road shapes for the in-game map from your painted tiles.

Everything in this section comes from the mapping tools' own notes. The game code does not contain the tools, so none of it is verified in the game code; the checks it can make against the game are in the next section.

To make the road shapes, select the cells you want, then run `InGameMap > Generate Road Features`. It derives polygons for primary, secondary and tertiary roads, trails and railways from recognized map tiles. After it runs, check the output in the tools' logs and on the in-game map.

The tools keep separate Feature Generation preferences for roads, trails and railways:

| Setting | Meaning | Trade-off |
|---|---|---|
| Simplification tolerance | How far the simplified contour may deviate, in tiles | Higher means fewer vertices, softer corners and narrower roads |
| Maximum point spacing | Caps the length of a contour segment | Lower means more detail and more points |

The tools clean the geometry before they write the XML or the binary file: duplicate closing vertices, consecutive duplicates and collinear points are removed. They reject shapes that cannot be stored safely, and the logs give the output, the cell, the feature index, the properties and the exact repair or rejection reason. That log is how you find geometry that used to crash `WorldMapRenderer$Drawer.fillPolygon()`.

| Rejected | Reason the tools give | Code |
|---|---|---|
| Fewer than three distinct vertices | The renderer cannot fill a polygon with no area | Not verified |
| Zero-area or collinear polygon | Geometrically a line | Not verified |
| Non-finite coordinate | NaN or infinity cannot be serialized | Not verified (tool side) |
| Coordinate outside signed 16-bit | The binary form would overflow | `WorldMapBinary.java:197-205`, `WorldMapXML.java:166-167` (the XML cast wraps an out-of-range value) |
| Excessive properties or point complexity | The binary format has bounded counts | `WorldMapBinary.java:155`, `:182`, `:197` |

On the game side, the XML reader takes each point as a whole number, and a value that is not a number reads as 0 :cite[(`WorldMapXML.java:179-183`)]. The tools write the XML and binary outputs as one validated pair. The game uses only one of the two files (see below), so a stale binary file will hide a fix you made to the XML.

## What the game reads

The game reads either an XML file or a binary file, and both store whole-number points in 16-bit form.

**The XML form.** The root element is `world`; each `cell` element has an `x` and `y` cell coordinate and holds `feature` elements :cite[(`WorldMapXML.java:29`, `:39`, `:55`)]. A feature has one `geometry` element with a `type` of `LineString`, `Point` or `Polygon`, and a second geometry in the same feature is an error :cite[(`WorldMapXML.java:72-75`, `:125`, `WorldMapGeometry.java:337-341`)]. The geometry holds `coordinates` elements made of `point` elements with whole-number `x` and `y` attributes, and the feature's `properties` element holds `property` elements with a `name` and a `value` :cite[(`WorldMapXML.java:81`, `:97`, `:129`, `:164`, `:179-183`)]. Points are cast to 16-bit numbers when they are stored :cite[(`WorldMapXML.java:166-167`)].

**The binary form.** The file starts with four bytes that the code checks, then a version and the cell size, the width and height in cells, a string table, and one entry per cell position :cite[(`WorldMapBinary.java:33-60`)]. A cell entry starts with its cell x, and an x of -1 means an empty position :cite[(`WorldMapBinary.java:124-130`)]. Each feature holds a geometry type, a count of point lists, each list's points as pairs of 16-bit numbers, and a count of properties stored as pairs of string-table indexes :cite[(`WorldMapBinary.java:151-165`, `:178-207`)].

**Cell-relative points.** Point coordinates are relative to the cell's own corner: the game subtracts the cell's origin (cell number times 256) before testing a point against a shape :cite[(`WorldMapCell.java:25-27`)]. The geometry code checks for a shape that reaches outside its cell's 0 to 256 range and handles it separately :cite[(`WorldMapGeometry.java:105`)].

**Which file wins.** The game checks for a `.bin` file beside the XML path and loads it when present; only otherwise does it load the XML :cite[(`WorldMapDataAssetManager.java:34-38`)]. Delete or regenerate the binary file when you change the XML.

**Priority between maps.** Shapes from every map folder are drawn, and a lower-priority map's shapes are cut away where a higher-priority map has lot cells; see [The world map](/pz/build-42/modding/engine/the-world-map#where-the-picture-comes-from) for the code.

Street names are a separate file, `streets.xml`, in the same folder, and extra drawings are a Lua file, `worldmap-annotations.lua` :cite[(`ISMapDefinitions.lua:32-39`, `:52-60`)]. See [Street names](/pz/build-42/mapping/fundamentals/street-names).

## Check it in the game

Open the game with your map mod enabled and press M to see whether the shapes appear.

In debug mode the map's right-click menu offers Show Cell Grid and Show Tile Grid, which help line the shapes up with your cells :cite[(`ISWorldMap.lua:911-923`)]. The debug menu also has a Map Editor window for data files, bounds, style, annotations, maps, stashes and streets :cite[(`ISDebugMenu.lua:42`, `WorldMapEditor.lua:36-39`)]. We have not walked a map through these tools from a cold start; treat this as a pointer to where to look.

:::callout[How we know]{kind=proof}
The game-side rows were opened in the 42.22 capture. The data files themselves (`worldmap.xml`, the binary files, `pyramid.zip`) and the mapping tools are not in the capture, so these are not verified: the `InGameMap > Generate Road Features` menu path, the two preference names and what they trade off, the repair rules, and the first two rejection reasons. The capture shows what the game does with the data, not how the tools make it.

**Corrected or added since the older page:** the game's binary reader rejects cell size 300 and any version other than 2; and the game prefers the binary file over the XML when both exist.
:::
