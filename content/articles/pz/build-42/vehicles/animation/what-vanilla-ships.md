---
id: build-42-what-vanilla-ships
slug: what-vanilla-ships
title: What vanilla ships
game: pz
version: build-42
section: vehicles
category: animation
difficulty: advanced
tags:
  - vehicle-animation
  - rig
  - fbx
  - silent-failures
excerpt: >-
  No vanilla car animates its parts. zombie/vehicles/VehicleDoor.java carries
  open, locked, lockBroken and no angle. template_engine_door.txt gives anim
  Open/anim Close a sound and nothing else...
last_updated: '2026-09-29'
related_articles:
  - the-headline-corrected
  - the-four-script-pieces
  - runtime-injection-how-to-do-this-to-a-vanilla-car
  - what-the-engine-requires-to-actually-animate
  - the-fbx-export-layer-where-two-of-the-four-failures-lived
  - the-rig
  - the-silent-failure-catalogue
  - still-unverified
  - prior-art-and-what-to-take
---
# What vanilla ships

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**No vanilla car animates its parts.** `zombie/vehicles/VehicleDoor.java` carries
`open`, `locked`, `lockBroken` and no angle. `template_engine_door.txt` gives
`anim Open`/`anim Close` a sound and nothing else. Every ordinary vanilla car is
one welded mesh.

**But three rigged, animated assets do ship**, and they are the ground truth for
everything else here:

| File | Format | Rig | Script |
|---|---|---|---|
| `models_X/vehicles/ModernCarWithDoors_Martin.FBX` | binary | full | `vehicle_car_modern_martin*.txt` |
| `models_X/vehicles/ModernCarWithDoors.blend` | Blender source | full | -- |
| `models_X/vehicles/SportsCarWithDoors.fbx` | binary | full | `vehicle_car_sports_ez*.txt` |

`ModernCar_Martin` and `SportsCar_ez` are in **no spawn table** -- they are TIS
test fixtures, reachable only via the debug menu (`Base.ModernCar_Martin`). Their
existence is the proof the engine path works; their absence from the world is why
nobody has noticed the feature exists.

A debug-spawned one shows every panel wide open. That is not a bug: a vehicle
spawned without part inventory items has those parts in the removed/open state,
and vanilla's own `isHoodOpen` returns true when `getInventoryItem()` is nil.
