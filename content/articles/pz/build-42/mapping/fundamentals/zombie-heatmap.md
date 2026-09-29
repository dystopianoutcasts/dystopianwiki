---
id: build-42-zombie-heatmap
slug: zombie-heatmap
title: Zombie heatmap
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
  Enable View > ZombieMap first -- the painting tool stays disabled while the
  layer is hidden, to prevent editing an invisible data image. [VERIFIED]
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
  - in-game-map-worldmap-generation
  - street-names
  - preview-modes-power-snow-jumbo
  - vegetation-on-upper-levels
  - automapper
  - lot-generation-and-export
---
# Zombie heatmap

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Enable `View > ZombieMap` first -- the painting tool stays disabled while the
layer is hidden, to prevent editing an invisible data image. `[VERIFIED]`

| Control | Function | Stored effect |
|---|---|---|
| Heat radius | Brush radius in heatmap samples | Number of edited pixels |
| Raw intensity | Red channel value 0-255 | Written exactly to the PNG |
| B42 preview x40 | Amplifies visibility in WorldView | **No** change to stored values |
| Left drag | Paint selected intensity | Undoable stroke |
| Right drag | Erase to zero | Undoable stroke |
| Expand to world | Extend image bounds | Adds zero-valued pixels outside the old image |

Sampling: legacy 300 -> 30x30 samples per cell, 1 px = 10x10 squares.
Native 256 -> 32x32 samples per cell, 1 px = 8x8 squares.

The first disk edit creates `.before-paint.bak`; later strokes use Undo and the
PNG is saved atomically. The image path is stored in the PZW under
`GenerateLots/ZombieSpawnMap`. `[VERIFIED]`

**Editing the PNG does not update already-generated binaries.** Re-run the 8x8
lot generation. `[VERIFIED]`

What it actually controls: a density input written into the generated binary
data, not a zombie count or coordinate. Sandbox multipliers, peak/time settings,
respawn, migration and room spawning are applied afterward. Painting zero
requests no initial density; runtime scripts and migrating populations can still
introduce zombies. See [05-zones-and-spawns.md](/pz/build-42/mapping/zones-and-packaging/zones-and-spawns-overview).
