---
id: build-42-ol-init
slug: ol-init
title: OL_Init
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
  require asserts OutcastLib.VERSION >= minVersion and raises a named error
  naming consumerName if not. Call once at the top of each consumer's entry
  file.
last_updated: '2026-09-29'
related_articles:
  - implementation-status
  - ol-containers
  - ol-reach
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
# OL_Init

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

```lua
OutcastLib.VERSION            -- integer, bumped on every breaking change
OutcastLib.require(minVersion, consumerName)
```

`require` asserts `OutcastLib.VERSION >= minVersion` and raises a named error
naming `consumerName` if not. Call once at the top of each consumer's entry
file.

`require` returns the library table, so a consumer can bind in the same line:

```lua
local OL = OutcastLib.require(1, "OutcastStowAll")
```

It raises on a missing or empty `consumerName` as well as on a version shortfall.
A nameless assertion produces a nameless error, which defeats the only reason the
function exists.

This is belt-and-braces: `require=OutcastLib` in `mod.info` already guarantees
presence and load order (README, engine facts). The assertion converts a version
mismatch from a nil-index deep in a call stack into a sentence.

**`OutcastLib.VERSION` bumps only on breaking changes** -- a removed function, a
changed signature, a changed return shape. Additive changes do not bump it,
because a consumer written against v1 keeps working against a v1-plus-extras
library.

### Load order inside the library

Every `OL_*.lua` file begins with `require "OutcastLib/OL_Init"` (and whatever
else it uses). **This is load-bearing, not decoration.** PZ loads a directory
alphabetically, and `OL_Init` sorts *after* `OL_Compat`, `OL_Containers` and
`OL_Debug` -- so a module that merely assumed the global already existed would
nil-index on three of the seven files. `require` makes the order explicit
instead of accidental, and it is the idiom the rest of the family already uses
(`ORA_Scan.lua:20`).

The test harness deliberately loads the modules in a non-alphabetical order to
prove any order yields a complete library.
