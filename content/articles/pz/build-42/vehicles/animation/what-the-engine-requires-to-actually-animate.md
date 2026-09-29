---
id: build-42-what-the-engine-requires-to-actually-animate
slug: what-the-engine-requires-to-actually-animate
title: What the engine requires to actually animate
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
  BaseVehicle.playPartAnim, BaseVehicle.java:2016. All of these must hold, and
  every one of them fails silently:
last_updated: '2026-09-29'
related_articles:
  - the-headline-corrected
  - what-vanilla-ships
  - the-four-script-pieces
  - runtime-injection-how-to-do-this-to-a-vanilla-car
  - the-fbx-export-layer-where-two-of-the-four-failures-lived
  - the-rig
  - the-silent-failure-catalogue
  - still-unverified
  - prior-art-and-what-to-take
---
# What the engine requires to actually animate

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`BaseVehicle.playPartAnim`, `BaseVehicle.java:2016`. All of these must hold, and
**every one of them fails silently**:

1. `getModelInfoForPart(part)` returns non-null
2. `modelInfo.getAnimationPlayer()` is non-null **and `isReady()`** -- this
   exists only if the model loaded SKINNED
3. `skinningData.animationClips.containsKey(anim.anim)`

### 5.1 Skinned or static

`FileTask_LoadMesh.java:72`:

```java
mode = assetParams.isStatic ? LoadMode.StaticMesh : LoadMode.Normal;
```

then `ProcessedAiScene.processAiScene`:

```java
if (mode != LoadMode.StaticMesh && mesh.hasBones()) { /* skinned */ }
else { /* ImportedStaticMesh */ }
```

So a part declared `static = FALSE` whose mesh Assimp reports as boneless loads
static, renders at bind pose, and never animates. No log.

### 5.2 Clip name resolution

Blender exports takes as `<Armature>|<Action>`. **PZ strips the prefix** --
`ImportedSkeleton.java:253` and `:344` do `animName.indexOf(124)` and take the
substring after it. So an FBX take called `VehicleSkeleton|Hood_closing` is
addressed in script as `Hood_closing`.

TIS's Martin has bare take names; their SportsCar has the prefixed form. Both work.

### 5.3 Mesh name resolution

`ProcessedAiScene.findMesh`:
1. `mesh.getName().equalsIgnoreCase(name)` over `scene.getMeshes()`
2. else a scene NODE of that name owning exactly one mesh
3. else null, and **this is the one thing that does log**:
   `DebugType.General.error("No such mesh \"%s\"", meshName)`

The script references the **Geometry** name, which in Blender terms is the *mesh
data* name, not the object name. `SportsCarWithDoors` has object `body_obj` with
mesh data `body_mesh`, and its script says `|body_mesh`. If the two are named the
same in your export, either resolves.

### 5.4 boneWeight -- DECLARE IT. The old heading here said "optional".

```java
if (!modelInfo.modelScript.boneWeights.isEmpty()) {
   track.setBoneWeights(...); track.initBoneWeights(skinningData);
}
```

The conditional makes it *look* optional, and this section used to say
"omitting it is safe", reasoning that TIS declares it on some doors and omits it
on both hoods -- same file, same author, so the FBX binding must be enough.

**That was wrong, and it is the single most expensive claim in this document.**
The evidence was TIS's hood, which has never been seen to animate, in a mod that
exists because vanilla's hoods do not move.

Weighed against rigs that animate:

```
VanillaVehiclesAnimated   boneWeight = HoodBone 1.0      declares it
KI5                       every animated panel            declares it
TIS's hood                omitted                         does not animate
```

Omit it and the panel renders, animates, and **sits in the wrong place** --
which reads as a placement or rig bug and sends you looking anywhere but here.

The bone NAME must be measured per file, not hardcoded: one delivery of 22 files
carried `HoodBone` in twelve and `Hood_bone` in ten, and naming the wrong one is
silent.

Full recipe: `18-how-to-animate-a-vehicle-part.md` section 1.2.

### 5.5 Part animation does NOT replicate in multiplayer

`VehicleDoor.open` is a synced boolean, so the STATE replicates. The animation
does not: a remote client sees the part change state without playing the
transition.

Established from **Vehicle Animations Sinked** (workshop `3685499657`, mod id
`VASinked`), which exists solely to fix this and is three small Lua files. Its
approach:

```
client  hooks ISOpenVehicleDoor:start / ISCloseVehicleDoor:start
        sendClientCommand(player, 'VAS_Sync', 'setDoor',
                          { vehicleID, doorOpen, partID })

server  stamps args.username, rebroadcasts
        sendServerCommand('VAS_Sync', 'doorStatus', args)

client  ignores its own username, then
        vehicle:playPartAnim(part, "Open")
```

Three things worth taking from it:

**`BaseVehicle.playPartAnim(part, animId)` is Lua-callable.** That is the same
method described in section 5, and it can be driven directly. It is the single
best diagnostic available for a part that will not move, because it bypasses the
part-state transition entirely: if a panel animates under `playPartAnim` but not
from the radial, the fault is in the transition; if it animates under neither,
the fault is below it, in the clip, the skinning or the shader.

**It hooks the timed actions, not the part state.** `ISOpenVehicleDoor` and
`ISCloseVehicleDoor` are generic over parts, so the same sync covers hoods and
trunks without naming them.

**It is generic, so it syncs any mod's animated parts, not just its own.** A mod
that adds animated panels does not need its own sync layer -- it needs this one
installed, and should soft-recommend rather than hard-require it.

One caveat if you read the source: its `doorStatus` handler calls
`part:getDoor():setOpen(true)` in BOTH branches, so the close path sets the door
open on remote clients. The animation plays correctly; the boolean it writes is
wrong. Worth knowing before relying on its state handling.
