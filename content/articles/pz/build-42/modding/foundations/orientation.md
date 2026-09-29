---
id: build-42-orientation
slug: orientation
title: Orientation
game: pz
version: build-42
section: modding
category: foundations
difficulty: intermediate
tags:
  - electricity
  - combat
  - animation
  - power
  - misc-systems
excerpt: >-
  CONFIRMED -- Build 42 (v42.20) shipped to the public/stable Steam branch on
  Wednesday 2026-07-29. It is the largest content update in the game's history
  and it overhauled the modding framework...
last_updated: '2026-09-29'
related_articles:
  - electricity-and-power
  - combat-and-animation
  - misc-catch-all-systems
  - practical-b42-readiness-checklist
  - addendum-electricity-generator-power-model
---
# Orientation

> Source: 07_VEHICLES_POWER_COMBAT_MISC.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**CONFIRMED** -- Build 42 (v42.20) shipped to the public/stable Steam branch on
Wednesday 2026-07-29. It is the largest content update in the game's history and it
overhauled the modding framework. B41 mods are broadly **not** compatible, and B41
saves do not transfer. Even within B42, a mod that worked on an earlier point release
can stop loading after an update -- treat schema as version-locked and re-validate
against the current in-game vanilla scripts.

**CONFIRMED** -- Systems that changed in ways mods touch: crafting, item definitions,
interfaces/UI, vehicles, multiplayer synchronization, registries, and exposed scripting
methods.

**CONFIRMED (folder structure)** -- B42 introduces a versioned mod folder layout so one
upload can serve multiple builds:

```
MyMod/
  common/media/     # build-agnostic content, loaded for every build
  42/mod.info       # Build 42 manifest
  42/media/         # Build 42-specific content
  41/mod.info       # optional Build 41 manifest
  41/media/         # optional Build 41-specific content
```

Inside each `media/` the familiar hierarchy holds: `lua/shared`, `lua/client`,
`lua/server`, `scripts/` (item/recipe/vehicle definitions in `.txt`), `textures/`.
B41's flat "mod.info at the root" layout is replaced by this versioned approach.

**CONFIRMED (server config gotcha)** -- The single most common cause of B42 mod
breakage on servers is the Mod ID format change: B42 requires a backslash before each
Mod ID in the server config's mod list.
