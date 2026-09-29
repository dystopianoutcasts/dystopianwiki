---
id: build-42-trimming-the-world-rectangle
slug: trimming-the-world-rectangle
title: Trimming the world rectangle
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
  A PZW world is always a rectangle even if only a few cells hold TMX files.
  Cell > Remove All Empty Border Cells... trims complete empty outer rows and
  columns. [VERIFIED]
last_updated: '2026-09-29'
related_articles:
  - the-cell-size-question
  - coordinates-use-b41-numbers
  - authoring-the-world-from-pngs
  - bmp-to-tmx
  - script-files-that-drive-generation
  - thumbnails
  - biomemap
  - zombie-heatmap
  - in-game-map-worldmap-generation
  - street-names
  - preview-modes-power-snow-jumbo
  - vegetation-on-upper-levels
  - automapper
  - lot-generation-and-export
---
# Trimming the world rectangle

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A PZW world is always a rectangle even if only a few cells hold TMX files.
`Cell > Remove All Empty Border Cells...` trims complete empty outer rows and
columns. `[VERIFIED]`

- A border cell with a TMX, objects or other protected data is retained.
- Interior holes are never removed -- the PZW still has to describe a rectangle.
- World width/height shrink; the **world origin moves** if the left or top border
  is removed; roads and world-coordinate data are shifted to preserve location.
- Back up a mature project first: external scripts may hard-code the old origin.
