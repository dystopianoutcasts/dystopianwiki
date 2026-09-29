---
id: build-42-the-fbx-export-layer-where-two-of-the-four-failures-lived
slug: the-fbx-export-layer-where-two-of-the-four-failures-lived
title: The FBX/export layer -- where two of the four failures lived
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
  Not what the FBX spec implies. Proved by measurement, not assumption:
  SportsCarWithDoors has UnitScaleFactor = 100 and a raw body 6.633 long,
  declared at scale = 0.31. If the unit factor were...
last_updated: '2026-09-29'
related_articles:
  - the-headline-corrected
  - what-vanilla-ships
  - the-four-script-pieces
  - runtime-injection-how-to-do-this-to-a-vanilla-car
  - what-the-engine-requires-to-actually-animate
  - the-rig
  - the-silent-failure-catalogue
  - still-unverified
  - prior-art-and-what-to-take
---
# The FBX/export layer -- where two of the four failures lived

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 6.1 Assimp applies node scaling and IGNORES UnitScaleFactor

Not what the FBX spec implies. Proved by measurement, not assumption:
`SportsCarWithDoors` has `UnitScaleFactor = 100` and a raw body 6.633 long,
declared at `scale = 0.31`. If the unit factor were applied that car would be
200 metres. It is a sports car.

| | UnitScaleFactor | node `Lcl Scaling` |
|---|---|---|
| TIS `SportsCarWithDoors` | 100 | 1.0 |
| TIS `ModernCarWithDoors_Martin` | 2.54 | 1.0 |
| **Blender default export** | **1.0** | **100** |

Blender's `apply_scale_options` defaults to `FBX_SCALE_NONE` ("All Local"), which
writes the unit conversion into **per-object `Lcl Scaling`**. Use
`FBX_SCALE_ALL`, which puts it in `UnitScaleFactor` where the engine ignores it.

**Symptom of getting this wrong:** the car renders ~100x oversize, the camera
ends up inside the mesh and backface-culls to nothing, and the vehicle's shadow
keeps drawing at the correct size because it comes from `shadowExtents` in the
vehicle script and never touches the mesh. **A car park of perfect shadows and no
cars.** Nothing is logged, because the mesh loaded fine -- it was simply enormous.

Two traps when checking for this:

- FBX carries a **second `Lcl Scaling` in `Definitions`** as an ObjectType
  template default, always 1.0 and owned by no Model. A checker that looks for
  "any non-1.0" misses it; a checker that tests equality against an expected 100
  reports a phantom mismatch on every file. Scope to the `Objects` subtree.
- **Vanilla is not internally consistent.** Of 146 files in `models_X/vehicles`,
  four break identity: `vehicle_horsebox`, `vehicle_livestocktrailer` and
  `KeyChain_Racer` at 0.0254, and `Trailer.fbx` at 100 (which also ships a Light
  and a Camera inside the mesh file). Never derive a rule from "what vanilla
  does" without checking whether vanilla does it uniformly.

### 6.2 Most vanilla vehicle meshes are ASCII FBX

**103 of 146** are ASCII, which Blender refuses outright
(`Error: ASCII FBX files are not supported`). All three rigged assets are binary.
So anyone cutting panels from vanilla bodies needs a conversion step or an ASCII
reader first.

Vanilla bodies carry **two UV channels** (`UVChannel_1`, `UVChannel_2`) for the
`vehicle_multiuv` shader family. Any converter that drops the second breaks
texturing in a way nothing flags.

### 6.3 Shaders

| Mesh | Shader |
|---|---|
| vanilla ASCII single-mesh bodies | `vehicle_multiuv` / `vehicle_norandom_multiuv` |
| TIS Blender multi-object rigs | `vehicle` |
| KI5 | `damn_vehicle_shader` (their own) |

The `_norandom` variants exist because vanilla tints random cars and does not
tint liveried ones. **Which shader is correct for a Blender-exported panel cut
from a vanilla body is still unverified** -- see section 9.
