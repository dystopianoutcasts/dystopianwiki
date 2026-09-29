---
id: build-42-misc-catch-all-systems
slug: misc-catch-all-systems
title: Misc / Catch-all Systems
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
  CONFIRMED -- Optimization was a headline theme: better/more efficient chunk
  caching for performance and visuals; extensive controller-support and
  new-map-area optimization; hundreds of bug fixes.
last_updated: '2026-09-29'
related_articles:
  - orientation
  - electricity-and-power
  - combat-and-animation
  - practical-b42-readiness-checklist
  - addendum-electricity-generator-power-model
---
# Misc / Catch-all Systems

> Source: 07_VEHICLES_POWER_COMBAT_MISC.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 5.1 Performance and threading

**CONFIRMED** -- Optimization was a headline theme: better/more efficient chunk caching
for performance and visuals; extensive controller-support and new-map-area optimization;
hundreds of bug fixes.

**CONFIRMED (multithreaded rendering)** -- The engine work included multi-threaded
rendering; the team dug into the renderer to fix long-standing capability/performance
problems (the core difficulty being a map of many unique tiles/shaders without a normal
z-buffer optimization). So "B42 added multithreading" is accurate specifically in the
rendering path.

**CONFIRMED (server architecture / de-facto threading of logic)** -- The inventory
system and ALL Timed Actions were moved to the server; clients now run only visuals.
This improves fairness and prevents desyncs and stuck-animation bugs. For mod authors
this is critical: **timed actions and inventory mutations now resolve server-side**, so
client-only assumptions from B41 can break in multiplayer.

**CONFIRMED (42.20)** -- Multiplayer stackable-item transfers were reworked to cut
transfer time; server-side anti-cheat was re-enabled.

### 5.2 Fire and heat

**LIKELY / CONFIRMED (direction)** -- B42 reworked fire spread to account for
**temperature, material type, volume, and surface area** when deciding spread speed and
distance. Devs also worked toward the world "remembering" a spreading fire after players
leave the area. Community feedback in the unstable period was that fire became very
powerful/easy to spread -- expect balance tuning across point releases.

### 5.3 Weather and temperature

**CONFIRMED (system model)** -- Temperature is driven by season, time of day, wind
strength, and air mass (which determines the weather front). Four seasons (summer,
winter, autumn, spring), each with distinct weather/temperature traits.

**LIKELY (42.19 data)** -- Body-temperature moodles are more developed: Hyperthermia
rises as core body temperature climbs; cool-down depends on insulation worn, ambient
weather, activity level, and nearby heat sources. Cold side (hypothermia) rewards
layering and heat sources.

### 5.4 Zombies and hordes

**CONFIRMED (42.20)** -- New spawn-map system uses **Voronoi noise** to produce more
urban-focused, natural-feeling hordes with believably random distribution across the
Exclusion Zone. Zombie ragdoll on vehicle/gun/explosive impact. Zombie culling bug that
caused population drops was fixed. Sandbox zombie deletion limit raised from 500 to
5,000 (relevant if a mod ships high-population presets).

### 5.5 Sound and music

**CONFIRMED (42.20)** -- The OST was reworked into an **adaptive exploration soundtrack**
with a real-time **music intensity parameter** that responds to in-game events. New
firearm SFX (part of the firearm overhaul) and new character vocalizations.

### 5.6 Inventory and UI

**CONFIRMED (42.20)** -- Major changes with modding implications:
- **3D item placement:** items can be placed at any position within a tile; guns and
  crafted melee weapons can be hung on walls for decoration.
- **Crafting UI:** crafting inputs are selectable; recipes searchable by input OR output
  item; craft multiple at once; intelligent right-click shortcuts when conditions are
  met. (Pairs with the fully rewritten crafting *system* -- the old B41 `recipe` block
  format does not carry over; define crafting with the new system and validate against
  vanilla scripts.)
- **Packing system:** canned food, boxes of nails, ammo, etc. can be packed into single
  carton items for tighter storage/stacking, or found pre-packed.
- Filter search boxes added to Discovered Recipes and Media UI; per-player ping shown in
  lists.

### 5.7 Lighting

**CONFIRMED** -- A full lighting pass: light bounces off walls and leaks through windows/
doors; a 1990s-era bulb pass makes nights darker and more dangerous. Basements/tall
floors have independent lighting.

### 5.8 Basements and verticality

**CONFIRMED** -- B42 broke the engine's old height limit, enabling basements and tall
buildings for the first time -- underground bunkers/panic rooms and up to ~32 floors
(Louisville skyscrapers). Some basements are map-authored (always same spot); others are
world-seed-generated. Floors have independent lighting and temperature. Relevant to
map/tile mods and to any Lua that reasons about z-levels.

### 5.9 Multiplayer / server authority

See 5.1 -- inventory and all Timed Actions moved server-side; clients are visual-only.
Multiplayer sync, registries, and exposed scripting methods changed. Server mod list now
needs the backslash-prefixed Mod ID format. Re-test any B41 mod that mutated inventory or
ran timed actions client-side.
