---
id: build-42-biomemap
slug: biomemap
title: Biomemap
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
  A biomemap is a data grid, not a decorative image. Input pixels must align
  exactly with project map squares. Open via Tools > Generate Biome Map....
  [VERIFIED]
last_updated: '2026-09-29'
related_articles:
  - the-cell-size-question
  - coordinates-use-b41-numbers
  - authoring-the-world-from-pngs
  - bmp-to-tmx
  - script-files-that-drive-generation
  - thumbnails
  - trimming-the-world-rectangle
  - zombie-heatmap
  - in-game-map-worldmap-generation
  - street-names
  - preview-modes-power-snow-jumbo
  - vegetation-on-upper-levels
  - automapper
  - lot-generation-and-export
---
# Biomemap

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A biomemap is a **data grid, not a decorative image**. Input pixels must align
exactly with project map squares. Open via `Tools > Generate Biome Map...`.
`[VERIFIED]`

**Channels**

- Red channel = biome IDs
- Green channel = foraging-zone IDs

**Inputs**

| Input | Contribution |
|---|---|
| `Map.png` | Base biome source. Required. |
| `Map_veg.png` | Vegetation contribution to classification. Required. *Not* copied into the green channel. |
| Seven Biomemap zone types | Rasterized from the project into the green channel |
| Zone PNG (optional) | Supplies exact green-channel IDs from an external image |

**The seven Biomemap-managed zone types** -- and only these -- are rasterized:
`Vegitation` (sic), `DeepForest`, `Forest`, `TownZone`, `Farm`, `FarmLand`,
`TrailerPark`. These are exactly the types the game's `metazoneHandler`
deliberately ignores in `objects.lua`, because it expects their data in the
biomemap green channel. `[VERIFIED]`

**Everything else stays in `objects.lua`** -- vehicle zones, geometries,
WorldGen, `WaterZone`, and every other vector zone/object type. The generator
excludes them from the image and reports which project types were assigned to
each path after generation. `[VERIFIED]`

**Output and fallback.** One biomemap file covers one complete 256 x 256 B42
tile, named `biomemap_X_Y.png`. The game loads the selected map folder together
with the folders in its `lots=` entry, and biomemap files follow that same
priority: if your mod map supplies `maps/biomemap_X_Y.png` it wins for those
exact coordinates; if it does not, the game can fall back to the matching vanilla
file (for example from `Muldraugh, KY`). `[VERIFIED]`

Consequences you must plan for:

- Supplying a file **replaces both biome and foraging data for that entire
  256x256 tile**. It is not clipped to your buildings or WorldEd zone shapes.
  Export every overlapping tile that needs different data; omit a tile only when
  the vanilla fallback is intentionally correct.
- This matters most for **legacy 300 projects**, whose bounds cross the 256-pixel
  boundaries. The generator aligns in world-square coordinates and always writes
  complete 256x256 files. Select the vanilla `maps` directory as the optional
  **base biomemap directory** to preserve data in the uncovered parts of boundary
  files. Without it those pixels get neutral ForagingNav data and are reported
  after generation.
- Fallback selection happens for the whole 256x256 image. After that selection,
  the game requests values on its 8x8 chunk grid and does **not** do a second
  vanilla fallback for uncovered chunks inside a selected mod image.

**Validation.** Input must cover the project at its own cell size -- multiples of
300 for legacy, multiples of 256 for native. The generator never resizes or pads,
because that would shift biome and zone data. Unknown source colors preserve
their red byte and are listed; invalid green-channel IDs stop generation.

Verified in the vanilla install: `media/maps/Muldraugh, KY/maps/biomemap_0_0.png`
and 4913 siblings. `[VERIFIED]`
