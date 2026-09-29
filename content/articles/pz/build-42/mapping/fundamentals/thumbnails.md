---
id: build-42-thumbnails
slug: thumbnails
title: Thumbnails
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
  A cell thumbnail is an isometric preview cached below the project's .pzeditor
  data. The minimap and WorldView read that cache. The Zombie Heatmap is a
  separate image and is not a thumbnail. [VERIFIED]
last_updated: '2026-09-29'
related_articles:
  - the-cell-size-question
  - coordinates-use-b41-numbers
  - authoring-the-world-from-pngs
  - bmp-to-tmx
  - script-files-that-drive-generation
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
# Thumbnails

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A cell thumbnail is an isometric preview cached below the project's `.pzeditor`
data. The minimap and WorldView read that cache. The Zombie Heatmap is a
separate image and is **not** a thumbnail. `[VERIFIED]`

To rebuild: select cells in WorldView (`Ctrl+A` selects all cells), run the
thumbnail recreate action, and watch progress. A blank result means missing
tilesets or TMX errors -- check `settings/logs`.

Output resolution is configurable and affects only preview detail and disk/memory,
never the project's 300/256 geometry. Grid color and thickness are editor overlay
only. `[VERIFIED]`
