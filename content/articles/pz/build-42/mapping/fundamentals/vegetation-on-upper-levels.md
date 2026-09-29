---
id: build-42-vegetation-on-upper-levels
slug: vegetation-on-upper-levels
title: Vegetation on upper levels
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
excerpt: 'Tilesets confirmed to work above ground level:'
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
  - in-game-map-worldmap-generation
  - street-names
  - preview-modes-power-snow-jumbo
  - automapper
  - lot-generation-and-export
---
# Vegetation on upper levels `[COMMUNITY -- verified by the author in B41+B42]`

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Tilesets confirmed to work above ground level:

- `e_americanholly_01` -- first 4 trees
- `e_canadianhemlock_01` -- first 4 trees
- `blends_grassoverlays_01`
- `vegetation_foliage_01` -- **B42 only**

Prerequisite: each upper level needs both a `Vegetation` layer and a `Furniture`
layer.

Procedure:

1. On level 1, **Furniture** layer, paint the tiles you need with the stamp tool.
2. Select all (`R`), cut with `Ctrl+X`.
3. Click the randomize dice, select the brush tool.
4. `Ctrl+V`, then paint **on the Vegetation layer**. Never paint on the Furniture
   layer.

If you lose the copied set, right-drag over an area already painted with the
tiles you want, release, `Ctrl+V`, continue.
