---
id: build-42-the-four-script-pieces
slug: the-four-script-pieces
title: The four script pieces
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
  | is a sub-object selector, not a path separator. Everything left of it is the
  file under media/models_X/; everything right is a mesh name inside it.
  FileTask_LoadMesh.java:49,55. static = FALSE...
last_updated: '2026-09-29'
related_articles:
  - the-headline-corrected
  - what-vanilla-ships
  - runtime-injection-how-to-do-this-to-a-vanilla-car
  - what-the-engine-requires-to-actually-animate
  - the-fbx-export-layer-where-two-of-the-four-failures-lived
  - the-rig
  - the-silent-failure-catalogue
  - still-unverified
  - prior-art-and-what-to-take
---
# The four script pieces

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 3.1 Model declaration

```
model OMA_Vehicles_CarNormal_Hood
{
    mesh = vehicles/OMA/OMA_Normal_Hood|Hood_obj,
    shader = vehicle,
    static = FALSE,
    scale = 0.008,
    boneWeight = HoodBone 1.0,     /* REQUIRED in practice -- see 5.4 */
}
```

- **`|` is a sub-object selector, not a path separator.** Everything left of it
  is the file under `media/models_X/`; everything right is a mesh name inside it.
  `FileTask_LoadMesh.java:49,55`.
- **`static = FALSE` makes it skinned.** Default is TRUE
  (`ModelScript.java:35`). Get it wrong and the part renders, in bind pose,
  forever, with no error.
- **`invertX` defaults to false** (`ModelScript.java:252`), so vanilla's explicit
  `invertX = false` is redundant and omitting it is safe.

### 3.2 Attaching to a part

```
part EngineDoor
{
    model Default { file = OMA_Vehicles_CarNormal_Hood, }
}
```

A vehicle `part` can carry its own `model` block -- `VehicleScript.java:974`.
The block id is arbitrary; TIS uses `Default`, KI5 uses `DoorFrontLeftdg`.

### 3.3 The four anim blocks

```
anim Close  { anim = Hood_closing, rate = 2.5, }
anim Open   { anim = Hood_closing, reverse = TRUE, rate = 2.0, }
anim Closed { anim = Hood_closing, reverse = TRUE, animate = FALSE, }
anim Opened { anim = Hood_closing,               animate = FALSE, }
```

`Close`/`Open` are transitions; `Closed`/`Opened` are rest poses
(`animate = FALSE` snaps without playing). **One authored clip serves all four**
-- author one direction and reverse it for the other.

**Which blocks carry `reverse` depends on which way the clip was authored, and
the clip's NAME does not tell you.** TIS author `<part>_closing`, KI5 author
`<part>_opening`; both are fine. Get it backwards and all four invert -- `Close`
opens, `Open` closes, each rest pose holds the other's frame -- which in game is
a panel sunk into the body that moves once and never opens. The arrangement
above is for a clip that CLOSES. Measure it:
`18-how-to-animate-a-vehicle-part.md` section 2.3.

Parsed keys, `VehicleScript.java:838-857`: `angle`, `anim`, `animate`, `loop`,
`reverse`, `rate`, `offset`, `sound`.

**Defaults** (`VehicleScript.Anim`): `rate = 1.0`, **`animate = true`**,
`loop = false`, `reverse = false`. So a transition block does not need
`animate` spelled out.

### 3.4 The body must lose its panel

A part model draws **in addition to** the vehicle model; it does not cut a hole.
Attach a hood without removing the hood from the body and every car has two --
z-fighting shut, and a ghost panel lying flat when the real one lifts.

TIS solves this by shipping the de-panelled body as another sub-object in the
same FBX (`ModernCarWithDoors_Martin|Vehicles_ModernCar_mesh`), `static = true`.
KI5 does the same (`Vehicles_70dodge_Body|challengerRT_body`). VVA ships a
per-family `static.fbx`.
