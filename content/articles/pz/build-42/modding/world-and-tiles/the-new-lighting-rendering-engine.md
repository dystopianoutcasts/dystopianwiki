---
id: build-42-the-new-lighting-rendering-engine
slug: the-new-lighting-rendering-engine
title: The new lighting + rendering engine
game: pz
version: build-42
section: modding
category: world-and-tiles
difficulty: intermediate
tags:
  - tiles
  - multi-z
  - basements
  - map-modding
  - tiledefs
excerpt: >-
  CONFIRMED (dev blogs). B42's lighting/rendering overhaul is the biggest visual
  change and has direct modding implications. (The canonical PZwiki "Rendering"
  page is unrelated -- it covers Blender...
last_updated: '2026-09-29'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - the-map-expansion-knox-country-new-towns
  - multi-z-the-vertical-engine-change
  - basements-the-underground-system
  - tile-system
  - map-modding-toolchain-for-b42
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - zones-vehicle-parking-zones-foraging
  - multiplayer-map-streaming-notes
  - map-tile-modder-migration-checklist
---
# The new lighting + rendering engine

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**CONFIRMED (dev blogs).** B42's lighting/rendering overhaul is the biggest visual
change and has direct modding implications. (The canonical PZwiki "Rendering" page
is unrelated -- it covers Blender rendering of assets, not the engine -- so this
section stays dev-blog sourced.)

### 6.1 What the new engine does
- **Light bleed / propagation:** light creeps across rooms; leaks through windows,
  doors, curtains, gaps.
- **True darkness:** windowless rooms can be **completely dark even at midday** --
  this is what makes basements genuinely dark and drives placed/portable lighting.
- **Colored lighting:** colored light is now possible (previously infeasible).
- **Era-accurate pass:** relit for 1990s bulbs; improved streetlights/exteriors.
- **Feedback cues:** wall switches show an on-indicator; an open door's glow
  reflects on the character.

### 6.2 Performance / rendering (CONFIRMED -- dev blogs)
- Large optimization gains claimed; solid framerates even at 4K / furthest zoom.
- The renderer changes are what let the taller/deeper world render affordably.

### 6.3 What modders must know (mixed confidence)
- **Light-source tiles / fixtures matter more** because interiors can be truly
  dark. **CONFIRMED (implication).**
- **Light source definitions** are driven by tile properties; the exact B42 field
  names for colored-light intensity/hue are **UNCERTAIN** from the cache (see 5.6).
- **Existing lighting mods updated** for B42, confirming the modding surface is
  live.

---

<a name="7-toolchain"></a>
