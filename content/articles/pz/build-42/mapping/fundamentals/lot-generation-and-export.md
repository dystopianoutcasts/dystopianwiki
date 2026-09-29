---
id: build-42-lot-generation-and-export
slug: lot-generation-and-export
title: Lot generation and export
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
  Generate lots after the world is painted, buildings placed, and zones defined.
  Output goes into the mod's media/maps/ folder -- see 06-mod-packaging.md.
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
  - vegetation-on-upper-levels
  - automapper
---
# Lot generation and export

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Generate lots after the world is painted, buildings placed, and zones defined.
Output goes into the mod's `media/maps/<MapName>` folder -- see
[06-mod-packaging.md](/pz/build-42/mapping/zones-and-packaging/mod-packaging-for-maps).

`File > Export Complete Mod (8x8)...` runs LOT export and builds a complete mod
structure rather than loose lot files. `[VERIFIED]`

Remember the split: authoring in 300x300 -> export in 256x256 -> more files than
cells, with different numbering.
