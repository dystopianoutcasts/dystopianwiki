---
id: build-42-authoring-the-world-from-pngs
slug: authoring-the-world-from-pngs
title: Authoring the world from PNGs
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
excerpt: 'The world starts as two images:'
last_updated: '2026-09-29'
related_articles:
  - the-cell-size-question
  - coordinates-use-b41-numbers
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
# Authoring the world from PNGs

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The world starts as two images:

- `Map.png` -- ground / terrain
- `Map_veg.png` -- vegetation

**The B42 color table is different from B41.** Do not reuse a B41 palette.

- Unjammer/Crater tools color table:
  https://github.com/pzmapping/B42-Colors/blob/main/MAP%20and%20MAP_veg%20Colors.png
- The official B42 tools use their own table (posted 2026-04-03 in the channel);
  the two are not interchangeable. `[COMMUNITY]`

Ground and vegetation colors are read from the **project's `Rules.txt`**, so the
palette is authoritative per project rather than global. `[VERIFIED]`

### Built-in terrain/vegetation image editor `[VERIFIED -- TOOLS]`

WorldEd ships a paint editor for the `Map.png` / `Map_veg.png` pair. It is
enabled only after a project is loaded, because palette colors, cell dimensions
and output paths belong to the project.

Flow: load the PZW -> `Terrain / Vegetation Image Editor...` -> pick geometry
(300 or 256) from the project, set cell origin/width/height -> create blank
layers or open existing PNGs -> save the pair and optionally attach it to the
project.

- Palette contains only colors declared by `Rules.txt`.
- Unknown colors are **not** silently approximated -- you get the RGB value, the
  pixel coordinate and the affected file.
- Tools: brush, fill, picker, vegetation eraser, zoom, composite preview, undo/redo.
- PNG saves are atomic (verified before the original is replaced).
- Working-memory limit is configurable 128 MiB -- 64 GiB, default 512 MiB. Undo
  history needs headroom on top, so stay well under available RAM.
- PNG dimensions must exactly match the chosen cell rectangle.

**Procedural generation** operates over the whole image, not per cell, so a
river, lake, road network or vegetation patch crosses a 300 or 256 cell boundary
without a seam. Generate, review, paint corrections, save as ordinary PNGs.

### Custom BMP brushes (new, build 20260802) `[VERIFIED]`

The TileZed BMP painter accepts PNG brush masks in addition to square/circle.
Drop masks into `brushes` or `settings/brushes` (subfolders work; changes are
detected while TileZed is open). `BMP Tools > Options` has Add PNG, Open Folder,
Reload. Dark opaque pixels are the brush; transparent/light pixels are ignored.
Images center on the cursor. 32x32 recommended, 128x128 safe maximum.
