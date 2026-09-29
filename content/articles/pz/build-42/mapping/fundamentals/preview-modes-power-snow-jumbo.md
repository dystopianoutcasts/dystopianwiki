---
id: build-42-preview-modes-power-snow-jumbo
slug: preview-modes-power-snow-jumbo
title: 'Preview modes: POWER / SNOW / JUMBO'
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
  POWER draws the transparent same-index *_on sprite over the original tile,
  preserving the base image (lamp posts included), flips, source-layer order and
  isometric occlusion. It is an overlay, not...
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
  - vegetation-on-upper-levels
  - automapper
  - lot-generation-and-export
---
# Preview modes: POWER / SNOW / JUMBO `[VERIFIED -- 20260801/02]`

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

- **POWER** draws the transparent same-index `*_on` sprite over the original
  tile, preserving the base image (lamp posts included), flips, source-layer
  order and isometric occlusion. It is an overlay, not a replacement. Raster-mode
  alignment offsets were fixed in build 20260802.
- **SNOW** previews `SnowTile` definitions, including the B42 `roofs_01`..`roofs_05`
  fallback to `e_roof_snow_1`, so roof-coverage gaps can be checked without
  launching the game. Mappings are prepared for every level in the composite --
  roof snow no longer requires selecting each Z level once.
- **JUMBO** recognizes `jumbo_tree_01_0` markers and picks a stable
  coordinate-derived XL/XXL variant, reconstructing the B42 `IsoTreeJumbo` pair by
  drawing main sprite `N` with treetop `N+6`.

Related: native 256-cell lot generation no longer applies WorldEd's legacy
fake-Jumbo randomizer -- explicit B42 Jumbo trees and Biomemap/WorldGen decisions
are preserved. Biomemap ID **171** is *Forced Redbud Jumbo XXL (map override)*,
enabled per map by `WorldGenOverride.lua`. `[VERIFIED]`

`WorldGenOverride.lua` is real and small; the vanilla one looks like:

```lua
worldgen["static_modules"] = {
    { position = { xmax = 0, ymin = 4800, ymax = 5119 }, biome = worldgen.biomes.water },
    { position = { xmin = 12590, xmax = 12609, ymax = 900 }, prefab = worldgen.prefabs.highway_NS_00 },
}
```
`[VERIFIED -- vanilla Muldraugh]`
