---
id: build-42-basics-what-changed-and-why-it-matters-to-modders
slug: basics-what-changed-and-why-it-matters-to-modders
title: 'Basics: what changed and why it matters to modders'
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
  If you made or ran maps in B41, these are the headline shifts that will break
  or change your workflow. Each is expanded later.
last_updated: '2026-09-29'
related_articles:
  - the-map-expansion-knox-country-new-towns
  - multi-z-the-vertical-engine-change
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
# Basics: what changed and why it matters to modders

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

If you made or ran maps in B41, these are the headline shifts that will break or
change your workflow. Each is expanded later.

- **Cell size changed.** B41 cells were 300x300 tiles. B42 cells are **256x256
  tiles**. **CONFIRMED** (pzwiki: Mapping, revid 1443363). Nuance now resolved:
  you still *edit* on a 300x300 grid; the tools *export* to 256x256, leaving
  empty border tiles. (See section 2 -- the old "300 vs 256" confusion is a
  non-conflict.)
- **The world is much taller and deeper.** The old ~8-floor ceiling is gone;
  each chunk now supports up to **32 Z-levels**, enabling skyscrapers and, going
  down, basements/bunkers/labs. **CONFIRMED** (dev blogs; wiki cache silent on
  the exact "32" count -- see Gaps). (Section 3.)
- **Basements are a first-class system.** Hand-authored basements are placed on
  underground levels (Level -1 and below) via the mapping tools; the vanilla
  world additionally injects procedural basements at stream-in. **CONFIRMED**
  authoring workflow (pzwiki: Creating basements, revid 1301995); procedural
  injection detail is dev-blog sourced. (Section 4.)
- **Massively more content.** ~1,400 new unique buildings and ~20,000 tiles
  (up from B41's ~15,000). Many tilesheets are new and B42-only. **CONFIRMED**
  (dev blogs).
- **New tile depth system.** B42 replaced the old rendering layer system with
  per-tile **tile depth** (a normal-map-like depth geometry). **CONFIRMED**
  (pzwiki: Tile depth, revid 1438979). (Section 5.)
- **New lighting/rendering engine.** Colored light, light bleed, true dark
  interiors, large performance gains. **CONFIRMED** (dev blogs). (Section 6.)
- **Saves and most mods do not transfer.** B41 saves are incompatible; the cell
  re-index plus tile changes mean B41 map mods must be reworked. **CONFIRMED.**
- **Official map tools are not released yet.** The community uses compiled forks
  (Alree/Unjammer; Crater's Community Edition). Official tools (WorldZed,
  TileZed, AnimZed) follow after 42.20 stable + hotfixes. **CONFIRMED** (pzwiki:
  Mapping, revid 1443363, quoting TIS "NEXT STEPS 2"). (Section 7.)

---

<a name="2-map-expansion"></a>
