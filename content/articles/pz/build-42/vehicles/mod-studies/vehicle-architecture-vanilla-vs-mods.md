---
id: build-42-vehicle-architecture-vanilla-vs-mods
slug: vehicle-architecture-vanilla-vs-mods
title: PZ B42 vehicle architecture -- vanilla vs KI5 and damnlib
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: advanced
tags:
  - vehicles
  - architecture
  - ki5trailers
  - damnlib
  - model-organisation
excerpt: >-
  Everything here was read off real files on this machine, not from wikis or
  memory.
last_updated: '2026-09-29'
---
# PZ B42 vehicle architecture -- vanilla vs KI5 and damnlib

> Source: PZ_VEHICLE_ARCHITECTURE.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Everything here was read off real files on this machine, not from wikis or memory.

- **Vanilla B42**: the installed game, your Steam library's `ProjectZomboid` folder (build 42 stable, rev `a2947723ca`)
- **KI5trailers**: workshop `3330403100`
- **damnlib** ("that DAMN Library 0.9868b"): workshop `3171167894`

Companion files in this folder:
- `vehicle_study.blend` — all four construction styles side by side, display-normalised
- `../../../..\_dev\Porsche911_992_2_Ref\PZ_VEHICLE_PIPELINE.md` — the B41→B42 schema diff

---

## 1. The three ways a vehicle mesh can be organised

### Style A — single mesh, no moving parts
`Vehicles_SportsCar.fbx` — **411 verts, 388 polys, one object, no armature.**

```
model Vehicles_SportsCar
{
    mesh   = vehicles/Vehicles_SportsCar,
    shader = vehicle_multiuv,
    scale  = 0.008,
}
```

Doors/hood/trunk still exist as *script* parts (installable, damageable, removable) but
never visually open. This is what most vanilla vehicles use.

### Style B — body + animated parts in one FBX
`SportsCarWithDoors.fbx` — **317 verts total across 4 meshes + an armature.**

```
VehicleSkeleton            (ARMATURE)
├── DoorFrontLeft_obj       22 verts
├── DoorFrontRight_obj      22 verts
└── Hood_obj                24 verts
body_obj                   249 verts   <- NOT parented
```

Each piece is addressed out of the shared file with the **pipe syntax**:

```
model Vehicles_SportsCar_ez
{ mesh = vehicles/SportsCarWithDoors|body_mesh,        shader = vehicle, scale = 0.31, }

model SportsCar_door_left
{ mesh = vehicles/SportsCarWithDoors|DoorFrontLeft_mesh, shader = vehicle,
  static = false,        <-- REQUIRED on anything that animates
  scale = 0.31, }
```

and bound to a part with a named animation clip:

```
part DoorFrontLeft
{
    model Default { file = SportsCar_door_left, }
    anim Close { anim = DoorFrontLeft_closing, rate = 2.5, }
    anim Open  { anim = DoorFrontLeft_opening, rate = 2.5, }
}
```

**The animation lives in the FBX as a named clip**, which is why the armature exists and
why TIS ships `SportsCar-anims.blend` as the authoring source.

Note the mesh object is `DoorFrontLeft_obj` but the script references
`DoorFrontLeft_mesh` — the script addresses the *mesh datablock* name, not the object name.
Getting this wrong is a silent failure.

### Style C — KI5: split Body / Objects, many variants per file
KI5 splits every vehicle into **two** FBX files:

| File | Contents |
|---|---|
| `Trailers_KI5cargo_Body.fbx` | all shell meshes for **all size variants**, plus animated doors on a `VehicleSkeleton` (which carries a `body_bone` EMPTY) |
| `Trailers_KI5cargo_Objects.fbx` | the **world-item** meshes — the `*WI` versions of every removable part |

Body file contents (1,317 verts across 12 meshes — three variants in one file):

```
damnTrailer_cargo_small_body       250    small_interior   40    small_flares   14
damnTrailer_cargo_medium_body      332    medium_interior  41    medium_flares  14
damnTrailer_cargo_large_body       230    large_interior   54    large_flares   26
VehicleSkeleton (ARMATURE) + body_bone (EMPTY)
├── damnTrailer_cargo_small_door        88
├── damnTrailer_cargo_medium_splitdoor 160
└── damnTrailer_cargo_large_rolldoor    68
```

Objects file (424 verts across 6 meshes), every name suffixed `WI`:

```
damnTrailer_cargo_small_doorWI  88   ...large_rolldoorWI  68   ...medium_splitdoorWI 160
damnTrailer_cargo_small_flaresWI 28  ...medium_flaresWI   28   ...large_flaresWI      52
```

So a removable part is modelled **twice**: once installed on the vehicle, once as the item
you carry. The `WI` model is declared separately with its own scale:

```
model KI5trailersRollDoorWI
{
    mesh    = vehicles/Trailers_KI5cargo_Objects|damnTrailer_cargo_large_rolldoorWI,
    texture = Vehicles/Objects_KI5cargo_Shell,
    scale   = 0.6,
}
```

**Vanilla uses the pipe syntax too** — it is not a KI5 invention. KI5 just leans on it much
harder: one file, many variants, addressed by sub-mesh name.

---

### Style D — Filibuster Rhymes: shared global parts library

FR ("Certified Used Cars", workshop `3683878228`) is the second-biggest car mod and uses a
**third architecture** again — and notably ships **no damnlib dependency** (`mod.info` has no
`require=` line at all).

Per-vehicle body FBX, plus **one shared global accessory library** instanced at per-vehicle
offsets:

```
model FR_AntennaCiv_1
{
    mesh    = vehicles/fr_parts|antenna_civ1,   // ONE shared fr_parts.fbx
    texture = vehicles/fr_parts,                // ONE shared texture
    shader  = fr_vehiclewheel,
    scale   = 0.004519,                         // empirically calibrated
    static  = TRUE,
}
```

and placed per vehicle inside the part block:

```
part FR_VehicleArmoryMil1
{
    model Default { offset = -0.4000 0.1780 0.3100, rotate = 0.0000 -270.0000 0.0000, }
}
```

**`offset` and `rotate` inside a part's `model` block** position a shared mesh on that
specific vehicle. That is how 61 vehicles share one antenna/accessory library instead of each
shipping its own. Most scalable of the three approaches.

`Vehicles_to_corolla_90.fbx` measured: **52 meshes, 6,748 verts**, body alone **1,182**. It
carries sedan, coupe *and* hatchback door/trunk variants in one file, plus separate meshes for
bumpers, brakes, shock absorbers, seats and hardtop.

Two details that matter for us:

- **FR parents its window meshes to the armature alongside the doors** — independent
  confirmation of the frameless-glass fix made to the 911 rig.
- **FR's armature is named `Armature`, not `VehicleSkeleton`.** So the armature name is free;
  vanilla's `VehicleSkeleton` is convention, not a requirement.
- FR keeps scripts in **`media/scripts/vehicles/`**, not `generated/`. So the vanilla
  relocation is where *vanilla* put its own files — mods are not bound to it.

---

## 2. Side-by-side comparison

| | Vanilla (typical) | Vanilla `_ez` | **KI5** |
|---|---|---|---|
| Files per vehicle | 1 FBX | 1 FBX | **2 FBX** (Body + Objects) |
| Variants per file | 1 | 1 | **3+** |
| Body verts | 411 | 249 | 230–332 per variant |
| Total verts in file | 411 | 317 | **1,317** |
| Animated parts | none | doors + hood | doors (+ many optional parts) |
| World-item meshes | reuses generic items | reuses generic items | **bespoke `*WI` mesh each** |
| Shader | `vehicle_multiuv` / `vehicle` | `vehicle` | **`damn_vehicle_shader`** (custom) |
| UV channels | 2 | 1 | **2** |
| Interior mesh | none | none | **separate `_interior` mesh** |
| Mod packaging | n/a | n/a | **versioned folders** `42.0` / `42.13` / `common` |

### Poly budget — corrected TWICE, and the ceiling is much higher than first thought

| Source | Body verts | Whole file |
|---|---|---|
| Vanilla `Vehicles_SportsCar` (B42) | 411 | 411 |
| Vanilla `SportsCarWithDoors` | 249 | 317 |
| KI5 cargo trailer (per variant) | ~330 | 1,317 (3 variants) |
| **FR Corolla** | **1,182** | **6,748 (52 meshes, 3 body styles)** |

I first treated vanilla's 411 as roughly the ceiling. That was wrong twice over. FR's body
alone is **~3× vanilla**, and their files carry separate meshes for bumpers, brakes, shock
absorbers, seats and hardtops — detail vanilla does not attempt.

**Vanilla's numbers are a 2013-era floor, not an engine limit.** For the 911, **800–1,200
verts for the shell is well within what shipped mods do**, with animated panels on top. The
current part-split blockout sits at 973 pre-mirror — comfortably in range.

---

## 3. What damnlib actually provides

damnlib is not just Lua glue — it ships **custom GLSL shaders**:

```
common/media/shaders/damn_vehicle_shader.vert / .frag / _static.vert
common/media/shaders/damn_vehicle_noreflect_shader.vert / .frag / _static.vert
common/media/shaders/damn_wheel_shader.vert / .frag / _static.vert
```

Note the `_static` variants. They pair with the `static = false` model flag: animated
(skinned) parts need the non-static vertex shader, immobile ones the `_static` one. Any
mod declaring `shader = damn_vehicle_shader` **hard-depends on damnlib being loaded.**

Lua modules (both 42.0 and 42.13 trees):

| Area | Files |
|---|---|
| Parts / placeholders | `DAMN_Parts.lua`, `DAMN_PartPlaceholders.lua` |
| Mechanics UI | `DAMN_MechOverlay*.lua`, `DAMN_MechanicsTooltip.lua`, `DAMN_VehicleMenu.lua` |
| Enter/exit anims | `DAMN_EnterAnimations.lua`, `VanillaEnterVehicleHack.lua` (a Kludge) |
| Armor system | `DAMN_Armor_{Client,Server,Shared}.lua` |
| Spawns / distribution | `DAMN_Spawns.lua`, `DAMN_Distribution.lua`, `DAMN_containerDistro.lua` |
| Script injection | `DAMN_ScriptTweaker.lua`, `DynamicScripts/` |
| Back-compat | `DAMN_BackCompat.lua` |

Plus its own AnimSets under `media/AnimSets/player-vehicle/enter/`.

---

## 4. Mod packaging: versioned folders

Both mods use B42's multi-version layout:

```
mods/<modid>/
├── 42.0/media/...      loaded on build 42.0
├── 42.13/media/...     loaded on build 42.13+
└── common/media/...    shared by both
```

Models and textures live in `common/`; scripts and Lua are duplicated per version. This is
how one Workshop item supports several game builds. Worth copying for the 911.

---

## 5. Scale — the part that does NOT have a clean answer

The scale chain is `model scale x vehicle scale`:

| Model | model scale | vehicle scale | product |
|---|---|---|---|
| `Vehicles_SportsCar` | 0.008 | 1.82 | 0.01456 |
| `Vehicles_SportsCar_ez` | 0.31 | 1.82 | 0.5642 |
| `TrailerKI5cargoMedium` | 0.1 | 0.9 | 0.09 |

Those products differ by ~40x, because **each FBX is authored at a completely different raw
size** and the `model scale` compensates:

| File | max raw dimension | read via |
|---|---|---|
| `Vehicles_SportsCar.fbx` | 261.18 | ASCII parser (true file units) |
| `SportsCarWithDoors.fbx` | 6.63 | Blender importer |
| `Trailers_KI5cargo_Body.fbx` | 48.4 | Blender importer |
| `Trailers_KI5cargo_Objects.fbx` | 19.75 | ASCII parser |

**These numbers are not directly comparable.** Blender's FBX importer applies each file's
`UnitScaleFactor` (baking it into `object.scale` — 0.001 for the KI5 files), while a raw
ASCII read does not. Applying the game's scale chain to Blender-imported dimensions gave
0.004 m for the KI5 trailer — obvious nonsense.

Two traps this produced, both worth remembering:
1. `object.dimensions` is **stale immediately after import**. Call
   `bpy.context.view_layer.update()` before measuring.
2. Assigning `object.scale = (s,s,s)` **discards the importer's unit scale**. Multiply
   the existing scale instead.

**Conclusion: do not derive the 911's scale arithmetically.** Author at a convenient size,
export, then calibrate `model scale` empirically by putting the car next to a vanilla one
in game. Everything else in this document is verifiable from files; this is the one thing
that needs an in-game measurement.

### Axis convention also varies per file

`Vehicles_SportsCar.fbx` read raw has length on **Y**, height on Z. The same game's
`SportsCarWithDoors.fbx` through Blender's importer has length on **Z**. The engine's own
space is X=lateral, **Y=up, Z=forward** (proven by the wheel offsets: front wheels
`Z=+0.5879`, rear `Z=-0.5659`, and `centerOfMassOffset = 0.0 0.2473 0.0` being purely
vertical). Verify per file; do not assume.

---

## 6. Tooling — what to actually use

Asked directly: is there a better program than Python for this?

| Need | Best tool |
|---|---|
| **Author / edit meshes** | Blender. Export **binary** FBX — the engine reads both, vanilla ships both. |
| **Read ASCII FBX** | Blender *cannot* ("ASCII FBX files are not supported"). Either convert, or use `scripts/ascii_fbx.py` in this repo. |
| **ASCII ↔ binary conversion** | **Autodesk FBX Converter 2013** (free, Windows GUI + CLI). The standard tool; handles both directions and older FBX versions. |
| **Quick inspection of many game formats** | **Noesis** — previews and converts a wide range of game meshes. |
| **Scripted batch conversion** | Autodesk **FBX SDK** (C++/Python bindings), or `fbx-conv` from libGDX. |
| **Analysis / measurement** | Python. This is where it genuinely wins — parsing, measuring, comparing, generating. |

**Practical answer:** you do not need a new program for the 911. You author in Blender and
export binary FBX, which the engine accepts. Python is only needed to *study* existing
ASCII-FBX content — and `ascii_fbx.py` already covers that, validated against vanilla's
411-vert sports car (parses to exactly 411 verts / 388 polys, renders correctly).

If you want a GUI round-trip for ASCII files, Autodesk FBX Converter 2013 is the one to
install. Otherwise the current toolchain is sufficient.

---

## 7. Implications for the Porsche 911

Decisions this study forces **now**, before more modelling:

1. **Split the body into parts from the start.** Retrofitting `DoorFrontLeft_obj`,
   `DoorFrontRight_obj`, `Hood_obj`, `Trunk_obj` into a finished single mesh means
   re-cutting the shell. Build them as separate objects on a `VehicleSkeleton` now.
2. **Decide on damnlib as a dependency.** Using `damn_vehicle_shader` gets KI5-grade
   rendering and the parts/mechanics UI, at the cost of a hard dependency. Vanilla
   `vehicle_multiuv` has no dependency but looks plainer.
3. **Budget 500–800 verts for the shell**, not 411. Vanilla is a floor, not a ceiling.
4. **Two UV channels** either way.
5. **Plan the `*WI` meshes** if parts should be carryable — that is a second mesh per
   removable part, and it is much cheaper to model them alongside the originals.
6. **Use the versioned folder layout** (`42.0` / `42.13` / `common`) from the first commit.
