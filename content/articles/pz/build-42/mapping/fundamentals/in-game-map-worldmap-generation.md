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
  InGameMap > Generate Road Features on a cell selection derives polygons for
  primary/secondary/tertiary roads, trails and railways from recognized map
  tiles. [VERIFIED]
last_updated: '2026-09-29'
related_articles:
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
# In-game map (worldmap) generation

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`InGameMap > Generate Road Features` on a cell selection derives polygons for
primary/secondary/tertiary roads, trails and railways from recognized map tiles.
`[VERIFIED]`

Feature Generation preferences, stored separately for roads, trails and railways:

| Setting | Meaning | Trade-off |
|---|---|---|
| Simplification tolerance | How far the simplified contour may deviate, in tiles | Higher = fewer vertices, softer corners, narrower roads |
| Maximum point spacing | Caps contour segment length | Lower = more detail, more points |

Geometry is normalized before XML or binary export -- duplicate closing vertices,
consecutive duplicates and collinear points are removed. Shapes that cannot be
represented safely are rejected:

| Rejected | Reason |
|---|---|
| Fewer than three distinct vertices | Renderer cannot fill a polygon with no area |
| Zero-area or collinear polygon | Geometrically a line |
| Non-finite coordinate | NaN/infinity cannot be serialized |
| Coordinate outside signed 16-bit | Binary representation would overflow |
| Excessive properties / point complexity | Target binary format has bounded counts |

Logs give output, cell, feature index, properties and the exact repair or
rejection reason -- this is how you find geometry that used to crash
`WorldMapRenderer$Drawer.fillPolygon()`.

XML and binary outputs are validated and committed as one recoverable pair.
