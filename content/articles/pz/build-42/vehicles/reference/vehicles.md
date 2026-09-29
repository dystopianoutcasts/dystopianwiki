---
id: build-42-vehicles
slug: vehicles
title: Vehicles
game: pz
version: build-42
section: vehicles
category: reference
difficulty: intermediate
tags:
  - vehicles
  - vehicle-api
  - b42-vehicles
excerpt: >-
  CONFIRMED -- Vehicles are still defined by a vehicle script block in scripts/,
  the same file family used for items, recipes, and sounds. The block declares
  the vehicle's parameters (models, parts...
last_updated: '2026-09-29'
---
# Vehicles

> Source: 07_VEHICLES_POWER_COMBAT_MISC.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 2.1 Script/template format

**CONFIRMED** -- Vehicles are still defined by a `vehicle` script block in `scripts/`,
the same file family used for items, recipes, and sounds. The block declares the
vehicle's parameters (models, parts, physics values, install/repair recipe classes).

**CONFIRMED** -- File locations and file layout for vehicle scripts changed in B42, so
a B41 vehicle mod will not load as-is; the scripts must be moved into the B42 versioned
layout and updated to the current schema.

**LIKELY** -- B42 leans on **shared vehicle templates**: base templates define default
values (seats, doors, brakes, tanks, engine) and an individual vehicle script overrides
or raises those defaults, including raising a part's recipe class to Intermediate or
Advanced. This means a modded vehicle typically inherits from a template rather than
respecifying every part. (Observed in Build 42.19 shared-template values via community
guides; verify field names against current vanilla scripts.)

**Action for modders:** copy the closest vanilla vehicle script + the template it
references out of the game's `media/scripts/vehicles/` as your starting point, then diff
your B41 script against it. Do not assume B41 field names survived.

### 2.2 Mechanics and repair

**CONFIRMED / LIKELY** -- Part install/uninstall still requires specific tools per part,
and some parts can be repaired with materials. Skill gates (mechanics level, and for the
engine a separate engine-repair check) apply.

**LIKELY (engine change)** -- The engine is NOT a free install/uninstall part the way a
battery is. Engines cannot be swapped wholesale between vehicles; they are repaired
in place. You can dismantle another vehicle's engine to obtain **Engine Parts**, which
are then consumed to repair an engine. This is a meaningful departure from the old
"just swap the better engine in" flow some players expect.

### 2.3 Physics and the Lua/Java modding ceiling

**LIKELY (important for physics modders)** -- B42 vehicle physics are simulated
Java-side. The community "True Vehicle Physics B42" project documents the practical
ceiling:
- Client-side Lua can read/adjust some parameters (a config DB of physics weights and
  per-surface traction multipliers is scriptable in Lua).
- Exposed-ish concepts: RPM/throttle response, gear ratios, final drive, engine torque,
  per-wheel wheel-slip ratio, and surface-specific traction limits (asphalt/grass/dirt/
  sand) with dynamic speed scaling by grip.
- **Hard limit:** the vanilla Java speed regulator (`regulator:setSpeed()`) is the
  bottleneck, and the Lua API does **not** allow direct force injection onto physics
  bodies (Body3D force manipulation is not exposed). True simulation-grade vehicle
  physics therefore currently requires Java-level modification (ASM/Mixin bytecode
  injection), not pure Lua.

Takeaway: a vehicle content mod (new cars, new parts, retuned stats) is very doable in
scripts + Lua; a vehicle *physics-behavior* overhaul hits a Java ceiling.

### 2.4 B41 -> B42 vehicle changes (summary)

- **CONFIRMED** Script file locations/layout changed; B41 scripts must be ported.
- **CONFIRMED (42.20)** Zombies now ragdoll when struck by a vehicle (physics/feel).
- **CONFIRMED (42.20)** Rebalanced vehicle speed and towing; trailers can now detach
  during sharp turns or at high speed.
- **CONFIRMED (42.20)** Numerous vehicle-physics bug fixes rolled into stable.
- **LIKELY** Template-driven vehicle definitions and the engine-repair (not engine-swap)
  model.
