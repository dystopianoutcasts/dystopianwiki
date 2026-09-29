---
id: build-42-script-files-that-drive-generation
slug: script-files-that-drive-generation
title: Script files that drive generation
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
  Documentation for the tool script files lives in the PZ Scripts Data project
  (contributions accepted via PR) [COMMUNITY]:
last_updated: '2026-09-29'
related_articles:
  - the-cell-size-question
  - coordinates-use-b41-numbers
  - authoring-the-world-from-pngs
  - bmp-to-tmx
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
# Script files that drive generation

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Documentation for the tool script files lives in the PZ Scripts Data project
(contributions accepted via PR) `[COMMUNITY]`:

| File | Role |
|---|---|
| `Rules.txt` | Maps `Map.png` / `Map_veg.png` colors to tiles; source of the editor palette |
| `Blends.txt` | Terrain blending between adjacent ground types |
| `MapBaseXML.txt` | Base XML template for generated maps |
| `TMXConfig.txt` | TMX layer configuration; also read by BuildingEd at startup |
