---
id: build-42-bmp-to-tmx
slug: bmp-to-tmx
title: BMP to TMX
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
excerpt: BMP-to-TMX converts the painted images into editable TMX cells.
last_updated: '2026-09-29'
related_articles:
  - the-cell-size-question
  - coordinates-use-b41-numbers
  - authoring-the-world-from-pngs
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
# BMP to TMX

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

BMP-to-TMX converts the painted images into editable TMX cells.

Current behavior worth knowing `[VERIFIED -- 20260802 changelog]`:

- It loads and waits for **every** sheet required by `Rules.txt`, aliases, and
  `Blends.txt` before generating. If a sheet is unavailable it is **named and
  generation stops**, instead of silently producing red unknown-tile placeholders.
- `exclude2` supports whole-sheet selectors.
- There is a CLI validation switch: `--validate-bmp-generation=<project.pzw>`.

**Removing a BMP from a cell:** use the WorldEd action for it, then you can add a
new BMP to the cell(s) and run BMP-to-TMX again. You will usually also need to
recreate thumbnails (right-click the cell -> *Recreate Thumbnail*), and
restarting the tools helps in most cases. `[COMMUNITY]`
