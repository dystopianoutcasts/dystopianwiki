---
id: build-42-vva-feasibility-and-plan
slug: vva-feasibility-and-plan
title: Animated vanilla vehicles on B42 -- feasibility study and plan
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: intermediate
tags:
  - vehicles
  - animation
  - vva
  - feasibility-study
excerpt: >-
  STALE ON ONE CENTRAL POINT, 2026-08-10. This study concludes that VVA has no
  B42 branch, which was true of workshop 3774077235 when it was written.
  Workshop 3281755175 is their Build 42 release...
last_updated: '2026-09-29'
---
# Animated vanilla vehicles on B42 -- feasibility study and plan

> Source: VVA_B42_Animated_Vehicles_Plan.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

> **STALE ON ONE CENTRAL POINT, 2026-08-10.** This study concludes that VVA has
> **no B42 branch**, which was true of workshop `3774077235` when it was written.
> Workshop **`3281755175` is their Build 42 release**: `common/` plus a B42-only
> `42/media/shaders`, 15 families, 398 scripts, 130 meshes.
>
> The mechanism findings here are sound and were the basis for the mod. The
> "nobody has done this on B42" framing is not. Current survey:
> `25-animation-mod-synthesis.md`.

Study of **Vanilla Vehicles Animated** (Workshop `3774077235`) against a B42
install, 2026-08-07. Every claim below was measured against files on disk, not
recalled. Game tree: your Steam library's `ProjectZomboid` folder
(B42 stable). Mod: `steamapps/workshop/content/108600/3774077235` in the same
Steam library.

---

## 1. Verdict

**Yes -- and it is a materially easier job on B42 than it was on B41, because
B42 vanilla ships the feature itself.**

This should not be a port of VVA. It should be a rebuild against vanilla's own
animated-vehicle scheme, which VVA predates. We would be using a supported
engine path rather than fighting one.

The reason nobody has done it is not that it is blocked. It is that the work is
**art, not code** -- and the art is the expensive half.

## 2. The finding that decides it

B42 vanilla ships **three already-rigged, already-animated vehicle assets**, plus
The Indie Stone's own Blender authoring source:

| File | Meshes | Bones | Clips |
|---|---|---|---|
| `models_X/vehicles/ModernCarWithDoors_Martin.FBX` | 8 | 8 | 8 takes |
| `models_X/vehicles/ModernCarWithDoors_ez.fbx` | 7 | 7 | 14 takes |
| `models_X/vehicles/SportsCarWithDoors.fbx` | 4 | 4 | 3 takes |
| `models_X/vehicles/ModernCarWithDoors.blend` | **TIS authoring source** | 7 | 14 actions + NLA |

`scripts/generated/vehicles/vehicle_car_modern_martin.txt` wires them up with
live `anim` blocks. So the engine feature is present, exercised by shipped
content, and documented by example. This is not a B41-only capability.

The `.blend` is the single most valuable artifact in the whole study -- it is
TIS's own rig, and it is the spec we should copy exactly.

## 3. How B42 actually does it -- measured

### The rig

```
ARMATURE 'VehicleSkeleton'
   Vehicle_bone            parent=-                  head=(0,0,0)     <- root, at origin
   DoorFrontLeft_bone      parent=-
   DoorFrontRight_bone     parent=-
   DoorRearLeft_bone       parent=-
   DoorRearRight_bone      parent=-
   Hood_bone               parent=-
   Trunk_bone              parent=-
   DoorRearLeftWindow_bone parent=DoorRearLeft_bone   <- window parents to its door
```

Bones are **flat** off the root, except a window bone which parents to its door
bone so it inherits the swing and can still roll down independently.

Each moving part is a **separate mesh object**, parented to the armature, with an
ARMATURE modifier and **exactly one vertex group** named for its bone, weight 1.0.
The car body itself is in the same rig, weighted to `Vehicle_bone`.

Tri counts are tiny -- doors 28-53, hood 44, trunk 26-32, body 562. A whole
animated car is ~830 tris.

### The script side

```
model ModernCar_Martin_DoorRearLeft
{
    mesh = vehicles/ModernCarWithDoors_Martin|DoorRearLeft_mesh,   <- file|subobject
    shader = vehicle,
    static = false,                                                <- skinned, not rigid
    scale = 0.01,
    boneWeight = DoorRearLeft_bone 1.0,                            <- bind to bone
}
```

```
part DoorFrontLeft
{
    model Default { file = ModernCar_Martin_DoorFrontLeft, offset = ..., rotate = ... }
    anim Close  { anim = DoorFrontLeft_closing, rate = 2.5 }
    anim Open   { anim = DoorFrontLeft_closing, reverse = true, rate = 2.0 }
    anim Closed { anim = DoorFrontLeft_closing, reverse = true, animate = false }
    anim Opened { anim = DoorFrontLeft_closing, animate = false }
}
```

Note how economical this is: **one clip per part**, played forward to close,
reversed to open, and frozen with `animate = false` for the two resting states.
`ModernCarWithDoors_ez` also carries separate `_opening` clips and an `Idle`, so
both styles work, but the single-clip form is what the shipped Martin car uses
and it halves the animation work.

`attachment` blocks can be pinned to a bone (`bone = DoorFrontLeft_bone`), which
is how the hood ornament and the tire-on-door ride along.

### Clip naming

FBX take name == the string in `anim =`. TIS's `.blend` holds one Blender **action**
per clip, named exactly `DoorFrontLeft_closing`, `Hood_closing`, `Trunk_opening`,
each **15 frames**, stashed as NLA strips. On export those become named takes.
Blender re-imports them as `VehicleSkeleton|<TakeName>|BaseLayer`, confirming the
round trip.

### Template system is alive in B42

77 `template vehicle` definitions and 200 `template!` references in vanilla B42
scripts. VVA leans on this heavily and it survives.

## 4. What VVA does, and what to take from it

VVA's genuinely clever part is **runtime script injection** (`VVA_core.lua`):

```lua
local vehicleScript = ScriptManager.instance:getVehicle(vehicleId)
vehicleScript:Load(vehicleid, "{ model { file = " .. model .. ",}}")
vehicleScript:Load(vehicleid, "{ template! = " .. template .. ",}")
```

fired on `OnInitGlobalModData`. It patches vanilla vehicle scripts in memory
instead of overwriting the files, which is why it composes with other vehicle
mods (it ships addons for VVE, SVU, KI5, STFR). It also resolves an inheritance
graph of profiles/templates with plus/minus sets so one vehicle can inherit
another's animation set and subtract parts it lacks.

**Take:** the injection technique and the profile/template inheritance idea.
**Take:** their codegen approach -- 670 script files, git history shows
"Recreate scripts using codegen workshop". Hand-writing that many files is a
mistake; generate them.

**Do not take:** their bone naming (`FrontDoor.L`, `FrontWindow.L`), their
multi-armature-per-FBX layout, or their `scale = 0.004`. Vanilla's
`VehicleSkeleton` / `DoorFrontLeft_bone` / `scale = 0.01` convention is better
because the engine's own content uses it and any future TIS change will follow it.

**Do not take: their meshes.** VVA's door and body FBX are their authored work.
Same rule we applied to the Project Summer Car reference set on the engine parts:
study for proportion and approach, model our own. A vanilla car door is our own
geometry cut from a vanilla body; it must not be their file retyped.

### Their submods, decoded

- `VVA_transparentWindows` -- a custom fragment shader that **discards pixels in a
  checkerboard pattern** instead of real alpha. Dodges the transparency sort
  order problem entirely. Genuinely smart, and portable.
- `VVA_cullseats` -- hides passengers because characters clip through the roof
  once the roof is no longer hiding them.
- `VVA_snapDoors` / `VVA_slowdoors` -- animation rate overrides.

The `cullseats` mod is a warning: **once doors open, the interior is visible and
every clipping problem vanilla hid becomes yours.**

## 5. Status of the mod itself

Worth correcting the premise slightly. The Workshop copy ships the author's
**entire git repository**, and it is not stale in the way it looks:

- checked-out branch `Build41`, last commit **2026-07-23** (two weeks ago)
- branches: `Build41` and `main`; `Build41` contains all of `main` plus 16 commits
- **no B42 branch exists**, and no `42/` or `common/` folder -- the layout is
  B41-style throughout

So: actively maintained *for B41*, with the B42 port genuinely unstarted. The
premise holds. It also means the author is reachable and possibly willing --
worth a message before duplicating months of art.

## 6. The hard part, stated honestly

The rigging and scripting are the easy 20%. The real work:

**Vanilla car bodies are single welded shells with no doors and no interior
surfaces.** `Vehicles_CarNormal.fbx` is one mesh. The moment a door swings open
you are looking at geometry that does not exist:

1. the **inner face of the door** (currently a one-sided outer skin)
2. the **door aperture** -- sill, B-pillar inner, roof rail underside
3. enough **interior** that the hole reads as a cabin

That is per-vehicle modelling, and it is why this mod is a big job rather than a
weekend.

### A hard blocker, with a known fix

**Vanilla vehicle bodies are ASCII FBX. Blender refuses them outright:**

```
RuntimeError: Error: ASCII FBX files are not supported
  ...\models_X\vehicles\Vehicles_CarNormal.fbx
```

Confirmed on `Vehicles_CarNormal.fbx` and `Vehicles_SportsCar.fbx`. The three
newer `*WithDoors*` assets are binary and import fine. So a conversion step is
mandatory before any body can be touched: Autodesk FBX Converter 2013, the FBX
SDK, or Noesis. Solvable, but it must be solved first or nothing downstream moves.

## 7. Scope

~15 base body groups, matching VVA's own folder split: Normal (+StationWagon,
Taxi), Small, Small02, Modern, Modern02, Luxury, Sport, SUV, Offroad, Pickup,
PickUpVan, Van (+Ambulance, Radio, Seats), StepVan, Racer.

The 146 FBX in `models_X/vehicles` are mostly `SMASH_`/`CRASH_`/`Burnt` damage
variants of those same shells. **Open question for the dev:** damaged bodies swap
the whole mesh, so either damage variants need rigging too, or damaged vehicles
fall back to static doors. VVA has a `Wrecks` folder, so they hit this.

### Per-vehicle Blender deliverable

One FBX containing:

- `VehicleSkeleton` armature; `Vehicle_bone` at the origin as root
- `DoorFrontLeft_bone`, `DoorFrontRight_bone`, `DoorRearLeft_bone`,
  `DoorRearRight_bone`, `Hood_bone`, `Trunk_bone` (+ `*Window_bone` children
  where we do windows), each placed **on the real hinge axis**
- one mesh object per part, one vertex group each at weight 1.0, ARMATURE modifier
- body mesh weighted to `Vehicle_bone`
- one 15-frame action per part named `<Part>_closing`
- authored at vanilla's `scale = 0.01`

Plus the retained `.blend`, same as the engine-parts delivery.

## 8. Plan

**Phase 0 -- spike, one vehicle, before committing to anything.**
Prove the whole chain end to end on a single car. Blender rig -> FBX with correct
take names -> script `anim` blocks -> doors actually swing in game. Confirm
`vehicleScript:Load` still behaves on B42 and that the engine drives the anim off
part open/close state with no Lua (strongly implied by Martin working in vanilla,
but unverified). If this fails, everything after it is moot.

**Phase 1 -- tooling.** A parameterised Blender generator: given a body mesh with
correctly named door objects, it builds the skeleton, places bones on hinge axes,
assigns vertex groups, generates the closing clips, and exports. Same procedural,
re-runnable, self-verifying approach as the engine-parts pipeline -- 15 vehicles
hand-rigged is 15 chances to typo a bone name.

**Phase 2 -- the art.** Per vehicle: cut doors, build inner skins, jambs and
apertures. The long pole. Order by how often a player sees the car (Normal, Small,
Pickup, SUV, Van first).

**Phase 3 -- script codegen.** Your dev generates the model + template + part
scripts per vehicle, and the runtime injection layer, mirroring VVA's structure.

**Phase 4 -- extras.** Windows, transparency shader, damage variants, passenger
culling, compat addons.

## 9. What I can start on immediately

1. Solve the ASCII->binary FBX conversion and confirm a vanilla body imports clean.
2. Stand up the Phase 1 rig/animation generator against TIS's `.blend` as ground truth.
3. Run the Phase 0 spike on one vehicle, up to the point where it needs an in-game test.

I cannot verify anything in a running game -- Phase 0 needs your dev, or a manual
test session, to close.

## 10. Open questions for the coding dev

- Does `ScriptManager.instance:getVehicle():Load()` still exist and behave on B42?
- Is door animation engine-driven off part state, or does Lua trigger it?
- Multiplayer: is the anim state synced, or does each client drive it locally?
- Damage variants -- rig them, or accept static doors on wrecks?
- Do we approach the VVA author before rebuilding their art?
