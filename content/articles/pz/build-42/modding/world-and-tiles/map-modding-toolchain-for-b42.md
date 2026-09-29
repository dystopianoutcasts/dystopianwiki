---
id: build-42-map-modding-toolchain-for-b42
slug: map-modding-toolchain-for-b42
title: Map-modding toolchain for B42
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
  Bottom line (CONFIRMED -- pzwiki: Mapping, revid 1443363): usable via
  community forks; the wiki now calls them reliable.
last_updated: '2026-09-29'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
  - the-map-expansion-knox-country-new-towns
  - multi-z-the-vertical-engine-change
  - basements-the-underground-system
  - tile-system
  - the-new-lighting-rendering-engine
  - how-to-make-a-b42-map-building-basement
  - map-files-map-info-spawnpoints-lua-folder-structure
  - zones-vehicle-parking-zones-foraging
  - multiplayer-map-streaming-notes
  - map-tile-modder-migration-checklist
---
# Map-modding toolchain for B42 (readiness assessment)

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Bottom line (CONFIRMED -- pzwiki: Mapping, revid 1443363): usable via community
forks; the wiki now calls them reliable.**

### 7.1 Official tools status (CONFIRMED)
- **No official B42 mapping-tool release** yet. The tools are a **public GitHub
  project** anyone can compile and are "fully usable to make maps."
- TIS (quoted from the **NEXT STEPS 2** blog on the Mapping page) will release,
  after Stable + hotfixing: *"both our latest mapping tools (WorldZed, TileZed,
  etc.) and our in-house animation editor and integration tool, AnimZed."* Note
  the name **WorldZed** (the successor to WorldEd) and the addition of **AnimZed**.
- The official package historically = **TileZed + WorldEd + PNG tiles**
  (pzwiki: Mapping tools (official), revid 1390645). **BuildingEd was merged into
  TileZed** (pzwiki: BuildingEd, revid 1386547). WorldEd unifies cells into a
  complete map (pzwiki: WorldEd, revid 1395235).

### 7.2 Community forks you actually use today (CORRECTED)
The wiki names **two** community forks (the earlier doc's "Unjammer/Alree" was one
person, and it missed Crater's edition):
- **Mapping tools (Alree)** -- by Alree (a.k.a. Unjammer on GitHub). A fork of the
  B41 official tools with changes merged from *before the April 2025 build* of the
  official B42 tools. Widely used and good, but may lag the latest official
  improvements. **CONFIRMED.**
- **Mapping tools (Community Edition)** -- by **Crater**. A **direct fork of the
  B42 official tools**, merging some of Alree's elements plus further
  improvements. **CONFIRMED.** (This is the more up-to-date option.)

The wiki's own reliability note (upgraded from the earlier UNCERTAIN alarm):
> "While the official mapping tools for Build 42 are not yet released, the
> community tools still provide a reliable way to create maps for Build 42,
> without any serious problems that should arise from moving to the official tools
> in the future."

**Correction to the prior draft:** the earlier "tiledef / `newtilesdef` is the
shakiest area" warning was based on mid-2025 GitHub comments. The canonical wiki
does not corroborate a systemic tiledef problem and instead deems the forks
reliable. Downgrade that alarm to "watch for tool-version quirks," not "expect
tiledef breakage."

### 7.3 Reference assets (CONFIRMED)
- **Unjammer `PZ_Vanilla_map_b42`** -- the vanilla Kentucky map reverse-engineered
  into a WorldEd/TileZed project. Great reference; building TBX files are
  **reconstructions** (original TBX metadata/tile categories are not fully
  recoverable). The Mapping page links this as the "Knox Country unofficial
  export" via the Vanilla Map Export project.
- **Building pools** (reusable building collections) listed by the wiki: Building
  Pool (official), Blackbeard, okkydoo, Dylan, Community Architect, B42 Vanilla
  Map Building Exports.

**Readiness verdict:** GREEN to prototype and build custom maps/buildings/
basements now with **Crater's Community Edition** (or Alree's fork); YELLOW only
for anything depending on not-yet-shipped official-tool features; re-verify once
WorldZed/TileZed/AnimZed officially ship post-42.20.

---

<a name="8-authoring"></a>
