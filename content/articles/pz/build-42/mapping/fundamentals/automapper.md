---
id: build-42-automapper
slug: automapper
title: Automapper
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
  A saved target TMX uses a nearby rules.txt. Each non-comment entry points to a
  rule-map .tmx or another .txt list; relative paths resolve from the list
  containing them.
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
  - zombie-heatmap
  - in-game-map-worldmap-generation
  - street-names
  - preview-modes-power-snow-jumbo
  - vegetation-on-upper-levels
  - lot-generation-and-export
---
# Automapper `[VERIFIED -- TOOLS]`

> Source: 02-world-and-cells.md (compiled 2026-08-02, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A saved target TMX uses a nearby `rules.txt`. Each non-comment entry points to a
rule-map `.tmx` or another `.txt` list; relative paths resolve from the list
containing them.

- **Reload** rereads lists and rule maps.
- **Apply** runs all loaded patterns on the target map.
- **Interactive** reapplies relevant rules as tiles or objects change.

Safety: recursive list inclusion is skipped with a warning, the same rule map is
never loaded twice, unsupported extensions are reported, and unsaved target maps
are rejected explicitly (they cannot resolve a neighboring `rules.txt`).

`input` and `inputnot` may be tile layers **or Object Groups**. Object patterns
compare name, type, shape, position, dimensions, polygon data and custom
properties; a property value of `*` means "must have this property, any value".

Interactive automapping produces many changes fast -- keep Undo visible and test
new rule sets on a copy.

Reference: `Automapper.html` in the tools repo/release.
