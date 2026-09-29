---
id: build-42-map-tile-modder-migration-checklist
slug: map-tile-modder-migration-checklist
title: Map/tile modder migration checklist
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
  [ ] Edit on the 300x300 grid; expect 256x256 exported cells with empty
  borders. Do not reuse B41 cell coords (re-index). [ ] Check adjacency against
  other map mods (shared 256 cells drop a map). [...
last_updated: '2026-09-29'
related_articles:
  - basics-what-changed-and-why-it-matters-to-modders
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
---
# Map/tile modder migration checklist (B41 -> B42)

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

- [ ] Edit on the **300x300 grid**; expect **256x256** exported cells with empty
      borders. Do not reuse B41 cell coords (re-index).
- [ ] Check **adjacency** against other map mods (shared 256 cells drop a map).
- [ ] Use **Crater's Community Edition** (direct B42 fork) or **Alree's tools**;
      official WorldZed/TileZed/AnimZed come after 42.20 hotfixes.
- [ ] Choose a **unique tiledef number 100-8190** (avoid >8190; check the
      "Tiledefs used by mods" registry); set `pack=` and `tiledef=<name> <num>` in
      `mod.info`.
- [ ] Add **tile depth** geometry (box/cylinder/polygon via the debug tile-depth
      editor; stored in `tileGeometry.txt`) for custom tiles.
- [ ] Set **tile properties** (Surface/ItemHeight/etc.); verify colored-light
      emitter fields against PZ-API-Docs (wiki doesn't enumerate them).
- [ ] Add **multi-Z** where wanted; author basements as buildings placed on
      **Level -1** (topmost floor = first floor down; staircase + 3 erased tiles
      above it).
- [ ] Light interiors deliberately -- **windowless rooms are now truly dark.**
- [ ] Re-verify **RoomDefs** on all buildings/basements (spawns/semantics).
- [ ] Author **map.info** (title/description/lots/fixed2x/zoom*/demoVideo) and
      **spawnpoints.lua** (absolute `posX/posY/posZ`, or B41-compat
      `worldX/worldY` with `*300`).
- [ ] Define **vehicle zones** (ParkingStall, size multiple of 4x3, valid name).
- [ ] For MP: budget **8-9 GB+ RAM**, SSD, <20 players.
- [ ] Assume B41 saves/maps **do not transfer**; ship as a fresh B42 map.

---

<a name="13-gaps"></a>
