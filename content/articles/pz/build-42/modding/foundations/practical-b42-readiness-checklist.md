---
id: build-42-practical-b42-readiness-checklist
slug: practical-b42-readiness-checklist
title: Practical B42 readiness checklist
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
  Restructure the mod into common/media, 42/media, (optional) 41/media with a
  42/mod.info. Re-author all scripts against current vanilla B42 scripts --
  especially crafting (recipe format is...
last_updated: '2026-09-29'
related_articles:
  - orientation
  - electricity-and-power
  - combat-and-animation
  - misc-catch-all-systems
  - addendum-electricity-generator-power-model
---
# Practical B42 readiness checklist

> Source: 07_VEHICLES_POWER_COMBAT_MISC.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

1. **Restructure the mod** into `common/media`, `42/media`, (optional) `41/media` with a
   `42/mod.info`.
2. **Re-author all scripts** against current vanilla B42 scripts -- especially crafting
   (recipe format is replaced), items, vehicles, and weapons (new multi-part condition /
   sharpness fields).
3. **Port animations** into `anims_X` with `Bob/`/`Kate/` subfolders and `Bob_`/`Kate_`
   filename prefixes; define/adjust `AnimSets/` XML nodes.
4. **Audit Lua for client-vs-server assumptions** -- inventory and Timed Actions are now
   server-authoritative in MP.
5. **Fix the server config Mod ID format** (backslash prefix per Mod ID).
6. **Re-validate against the specific 42.x point release** you target; schema can drift
   between point releases.
7. For vehicle mods: expect the template-inheritance model and the engine-repair (not
   swap) flow; accept the Java ceiling on physics-behavior changes.
8. For electricity content: hook into the generator-bubble model rather than expecting a
   wiring API.
