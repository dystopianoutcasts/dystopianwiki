---
id: build-42-multiplayer-map-streaming-notes
slug: multiplayer-map-streaming-notes
title: Multiplayer + map-streaming notes
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
  CONFIRMED / LIKELY (hosting sources, not wiki): Ports: UDP 16261 (handshake);
  TCP 16262 (map-data streaming). Player-count sensitivity: above ~32 players ->
  poor streaming/desync. TIS B42 MP...
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
  - map-tile-modder-migration-checklist
---
# Multiplayer + map-streaming notes

> Source: 06_WORLD_MAP_BASEMENTS_TILES.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**CONFIRMED / LIKELY (hosting sources, not wiki):**
- **Ports:** UDP **16261** (handshake); TCP **16262** (map-data streaming).
- **Player-count sensitivity:** above ~32 players -> poor streaming/desync. TIS
  B42 MP recommendation: **under 20 players**, start without mods, disable
  ragdolls.
- **Memory:** **~8-9 GB practical minimum**; grows as the world is explored.
- **Disk:** use an **SSD** to reduce chunk-load and streaming hiccups.
- **Map-modding takeaway:** larger custom maps + multi-Z + basements increase
  streamed state; budget extra RAM and fast storage, keep player counts
  conservative.

---

<a name="12-checklist"></a>
