---
id: build-42-coordinates-use-b41-numbers
slug: coordinates-use-b41-numbers
title: 'Coordinates: use B41 numbers'
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
  When placing your map relative to the vanilla world, use B41 coordinates.
  Coordinates read off the B42 online map will put your map in the wrong place.
  [COMMUNITY -- stated explicitly, January 2026]
last_updated: '2026-09-29'
related_articles:
  - the-cell-size-question
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
# Coordinates: use B41 numbers

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

When placing your map relative to the vanilla world, **use B41 coordinates**.
Coordinates read off the B42 online map will put your map in the wrong place.
`[COMMUNITY -- stated explicitly, January 2026]`

- Coordinate source: https://map.projectzomboid.com/
- B41 vanilla map export incl. `map.png`: https://github.com/Unjammer/PZ_Vanilla_Map-B41-
- B42.10 `map.png` / `map_veg.png` exports by Alree: posted in the mapping channel

Practical method: layer the B41 and B42 PNGs in GIMP/Photoshop, overlay a
300x300 grid, and count cells rather than test in-game repeatedly.

### Grid overlay in GIMP `[COMMUNITY]`

1. Open the B42 `Map.png`.
2. `Filters > Render > Pattern > Grid` -- size 300 x 300, high-contrast line color.
   This draws the legacy 300 boundaries.
3. `Image > Configure Grid` (set a second color) then `View > Show Grid` for the
   pixel grid.

The online map only shows the 256 grid, so this is how you see where the old 300
boundaries fall and align roads/rivers across the two systems.

### Reusing vanilla terrain `[COMMUNITY]`

Alree's B42.10 `map.png` / `map_veg.png` let you recreate vanilla cells. They
carry base terrain and vegetation but **no buildings**. Import into an editor,
overlay a 300x300 grid, copy the cells you need. Treat it as guidance, not a
1:1 source of truth -- it is a rough export from an unstable build.
