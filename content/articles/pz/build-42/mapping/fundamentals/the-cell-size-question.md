---
id: build-42-the-cell-size-question
slug: the-cell-size-question
title: The cell-size question
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
excerpt: 'B41: authoring cells and shipped game cells were both 300 x 300.'
last_updated: '2026-09-29'
related_articles:
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
# The cell-size question (the single biggest B42 confusion)

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

B41: authoring cells and shipped game cells were both **300 x 300**.

B42: the shipped game cells are **256 x 256**, and chunks are **8 x 8** squares
(B41 chunks were 10 x 10). `[VERIFIED -- vanilla map.info says
"Chunk size is 8x8, Cell size is 256x256"]`

You get two ways to author. The choice is a **per-project property**, set at
`File > New World`, and it is used consistently by world/cell views, coordinate
conversion, thumbnails, BMP-to-TMX, building import, procedural image tools, LOT
generation, InGameMap export and Lua placement. `[VERIFIED -- PZToolsGuide]`

| Property | 300 x 300 (Legacy) | 256 x 256 (Native) |
|---|---|---|
| Cell size | 300 x 300 map squares | 256 x 256 map squares |
| Source PNG per cell | 300 x 300 px | 256 x 256 px |
| LOT export | Converted to the game's 256 layout on export | No conversion |
| Zombie heatmap samples per cell | 30 x 30 (1 px = 10 x 10 squares) | 32 x 32 (1 px = 8 x 8 squares) |
| Project badge in WorldEd | `300 x 300 - LEGACY` | `256 x 256 - NATIVE` |

**Legacy 300 is still fully supported.** You paint 300x300 images, and export
splits the data into 256x256 game files -- which is why you end up with *more*
output files than you had cells, and why the exported file numbering does not
match your WorldEd cell numbering. `[VERIFIED + COMMUNITY]`

### Worked example of the split `[VERIFIED -- PZwiki, revised for 42.20.0]`

A map authored for **B41 cell (31, 23)** exports to **six** B42 cells:

```
(36, 26)  (37, 26)
(36, 27)  (37, 27)
(36, 28)  (37, 28)
```

Each exported cell has an **active** area (the part covered by your 300x300 cell)
and an **inactive** area (empty padding around the borders).

- Active areas **replace** the vanilla map.
- Inactive areas **fall back** to the vanilla map.

### The mod-map collision trap

> **Two mod maps that share the same adjacent 256x256 cells will clash, and one
> of them simply will not load.** `[VERIFIED -- PZwiki]`

This is the single biggest compatibility hazard in B42 mapping and it is a direct
consequence of the 300 -> 256 padding: your map's *inactive* padding still claims
those 256 cells. Two maps that are nowhere near each other in 300-space can still
collide in 256-space.

Check which 256 cells your export actually touches before publishing, and
consider a native 256 project if you need tight packing next to other mod maps.

### Replacing a vanilla cell is all-or-nothing

Overriding an existing cell replaces the **entire** cell -- terrain data and every
structure in it. You cannot drop a single building into a vanilla cell without
rebuilding all the surrounding buildings too. `[VERIFIED -- PZwiki]`

**Changing the grid flag on an existing project is not a safe conversion.** TMX
dimensions, cell coordinates, roads, objects, thumbnails and generated files all
have to agree. Create a new project or use a dedicated converter. `[VERIFIED]`

Check the project badge first whenever a thumbnail looks too small for its cell,
coordinates drift, or a generated image size is rejected. `[VERIFIED]`
