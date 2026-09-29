---
id: build-42-multi-z-the-vertical-engine-change
slug: multi-z-the-vertical-engine-change
title: 'Multi-Z: the vertical engine change'
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
  CONFIRMED (dev blogs). B42 broke the engine's old height limit (~8 floors).
  Each chunk now extends to up to 32 Z-levels. This makes both very tall
  buildings and underground spaces possible for the...
last_updated: '2026-09-29'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - the-map-expansion-knox-country-new-towns
  - basements-the-underground-system
  - tile-system
  - the-new-lighting-rendering-engine
  - map-modding-toolchain-for-b42
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - zones-vehicle-parking-zones-foraging
  - multiplayer-map-streaming-notes
  - map-tile-modder-migration-checklist
---
# Multi-Z: the vertical engine change

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**CONFIRMED (dev blogs).** B42 broke the engine's old height limit (~8 floors).
Each chunk now extends to **up to 32 Z-levels**. This makes both very tall
buildings and underground spaces possible for the first time.

Modeling implications for modders:
- Buildings and lots can define floors above **and** below ground level.
- Underground Z-levels (negative floors, **Level -1** and down in WorldEd) are the
  substrate for basements, bunkers, and labs (section 4). **CONFIRMED** that the
  tools expose negative levels (pzwiki: Creating basements, revid 1301995 --
  "Drag your basement .tbx file name from Level 0 onto Level -1").
- **UNCERTAIN (cache):** the wiki cache does not itself state the "32 levels"
  figure; that number is from dev blogs. Treat the exact ceiling as dev-blog
  sourced pending a wiki confirmation.

---

<a name="4-basements"></a>
