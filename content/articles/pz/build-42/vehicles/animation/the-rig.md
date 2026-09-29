---
id: build-42-the-rig
slug: the-rig
title: The rig
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
  This section was rewritten four times in one day, each time asserting a new
  rig rule, and three of those rules were wrong. Rather than leave a fifth
  attempt here, the verified recipe now lives in...
last_updated: '2026-09-29'
related_articles:
  - the-headline-corrected
  - what-vanilla-ships
  - the-four-script-pieces
  - runtime-injection-how-to-do-this-to-a-vanilla-car
  - what-the-engine-requires-to-actually-animate
  - the-fbx-export-layer-where-two-of-the-four-failures-lived
  - the-silent-failure-catalogue
  - still-unverified
  - prior-art-and-what-to-take
---
# The rig

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 7.1 The rig: see 18-how-to-animate-a-vehicle-part.md

This section was rewritten four times in one day, each time asserting a new rig
rule, and **three of those rules were wrong**. Rather than leave a fifth
attempt here, the verified recipe now lives in
`18-how-to-animate-a-vehicle-part.md`. What survives as fact:

**The rule.** Never derive a rig rule from a file that has not been seen to
animate. Vanilla's three rigged vehicles are dev fixtures in no spawn table.

**What is required:** every vertex of the panel bound to its bone at weight 1.0;
the bone on the hinge line rather than at the origin; a clip whose name matches
`anim =`; and `boneWeight` declared in the model script naming that bone
(see 5.4).

**What is NOT required** -- measured across VVA, KI5 and Filibuster Rhymes, all
of which animate:

| | KI5 | VVA | Filibuster |
|---|---|---|---|
| mesh node rotation | identity | **-90** | identity |
| bone rotation | identity | 90-125 | 90 |
| root bone at origin | `body_bone` | **none** | `staticbone` |
| body bound into the rig | yes | **no** | yes |
| bone count | 9 | **1** | 40 |

`VVA/Normal/hood.fbx` is one bone, no root bone, no body in the file, mesh nodes
at -90 -- and it animates a vanilla taxi correctly today. **If a rig rule you
are about to state would fail that file, the rule is wrong.**

The three withdrawn rules, kept so nobody re-derives them: "mesh objects must be
at identity", "bones must be at identity", "the rig needs a root bone with the
body bound into it".

### 7.2 TIS's structure -- shape only, NOT a specification

Structurally useful, since it is the only rig with published Blender source, but
**do not copy its transforms**. From `ModernCarWithDoors.blend`:

```
ARMATURE 'VehicleSkeleton'
   Vehicle_bone             parent=-   head=(0,0,0)   <- ROOT, at origin
   DoorFrontLeft_bone       parent=-
   DoorFrontRight_bone      parent=-
   DoorRearLeft_bone        parent=-
   DoorRearRight_bone       parent=-
   Hood_bone                parent=-
   Trunk_bone               parent=-
   DoorRearLeftWindow_bone  parent=DoorRearLeft_bone   <- window rides its door
```

- Bones are **flat off the root**, except window bones which parent to their door
  so they inherit the swing and can still roll down independently.
- Each moving part is a **separate mesh object**, parented to the armature, with
  an ARMATURE modifier and **exactly one vertex group** at weight 1.0.
- **The body is in the same rig, weighted to `Vehicle_bone`.**
- One Blender action per clip, named exactly as the script's `anim =` value,
  **15 frames**, stashed as NLA strips.
- Tri counts are tiny: doors 28-53, hood 44, trunk 26-32, body 562.
- TIS's hood opens **90 degrees** and is modelled standing vertical at rest.

`rate` scales playback speed, so clip length and rate travel together. Vanilla's
`rate = 2.5`/`2.0` assume a 15-frame clip; a 30-frame clip at the same rate runs
for twice as long.

Panel undersides: TIS's `Hood_obj` is a **closed shell** (0 boundary edges,
thickness ~0.481% of body length). Their `Trunk_obj` and door panels are open
sheets, and those open too. TIS is not consistent; match the panel you are
building.
