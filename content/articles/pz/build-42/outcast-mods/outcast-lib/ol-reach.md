---
id: build-42-ol-reach
slug: ol-reach
title: OL_Reach
game: pz
version: build-42
section: outcast-mods
category: outcast-lib
difficulty: advanced
tags:
  - outcast-lib
  - api
  - ol-init
  - containers
excerpt: >-
  Squares within radius the player may legitimately reach into, nearest first.
  Returns { { square = sq, distance = squaredDist }, ... }; empty array if the
  player has no current square.
last_updated: '2026-09-29'
related_articles:
  - implementation-status
  - ol-init
  - ol-containers
  - ol-squares
  - ol-compat
  - ol-options
  - ol-vehicleparts
  - ol-debug
  - log-file-location
  - log-line-visibility
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# OL_Reach

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### `OutcastLib.Reach.squares(playerObj, radius) -> array`

Squares within `radius` the player may legitimately reach into, **nearest
first**. Returns `{ { square = sq, distance = squaredDist }, ... }`; empty array
if the player has no current square.

This is the byte-identical 33 lines from `OSA_Scan.lua:138-170` /
`ORA_Scan.lua:104-136`. Preserve its three behaviours exactly:

1. `origin:canReachTo(square)` for squares within 1 tile; `square:isCanSee(playerNum)` beyond.
2. Safehouse clamp: `if isClient() and not SafeHouse.isSafehouseAllowLoot(square, playerObj)` -> not reachable. **Server-only rule** -- the `isClient()` guard is required.
3. Sort ascending by squared distance, so a capped run takes what is underfoot before what is across the room.

Consumers: RipAll, SawAll. **Not** StowAll or Proximity.
