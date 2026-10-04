---
id: build-42-how-to-animate-a-vehicle-part
slug: how-to-animate-a-vehicle-part
title: How to animate a vehicle part
game: pz
version: build-42
section: vehicles
category: animation
difficulty: advanced
tags:
  - vehicle-animation
  - how-to
  - rig-recipe
  - animated-parts
excerpt: >-
  The recipe, derived from mods that demonstrably animate in a running B42 game:
  VanillaVehiclesAnimated and its B42 Orphanage (which animate the same vanilla
  cars this is usually wanted for), KI5's...
last_updated: '2026-10-04'
---
# How to animate a vehicle part

> Source: 18-how-to-animate-a-vehicle-part.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The recipe, derived from mods that **demonstrably animate in a running B42
game**: VanillaVehiclesAnimated and its B42 Orphanage (which animate the same
vanilla cars this is usually wanted for), KI5's fleet, and Filibuster Rhymes.

Written 2026-08-10 after three separate rig theories were invented, briefed to
an artist, and disproved. Read section 0 before section 1.

---

## 0. The rule that matters more than any fact below

**Never derive a rig rule from a file that has not been seen to animate.**

Vanilla ships three rigged vehicles -- `ModernCarWithDoors_Martin`,
`SportsCarWithDoors`, and the Blender source for the first. All three are dev
fixtures in no spawn table. **Nobody has ever seen one move.** They are
excellent for structure (what a bone tree looks like, what an anim block
references) and they are evidence of nothing working.

Three rules were invented by reasoning from them, or from structure in general.
All three were wrong, and each one cost a re-export brief:

| Invented rule | Killed by |
|---|---|
| mesh objects must be at identity rotation | VVA's meshes are at -90 and animate |
| bones must be at identity rotation | every working rig rotates its bones |
| the rig needs a root bone with the body bound | VVA's hood has one bone and no body |

The method that finally worked, and the one to use next time: **take a mod that
animates the same kind of vehicle, and diff its declaration and its FBX against
yours, line by line.** Not "what does a correct rig look like" -- "what does
this working file have that mine does not".

## 1. What actually has to be true

### 1.1 The model declaration

```
model MyMod_CarNormal_Hood
{
    mesh = vehicles/MyMod/CarNormal_Hood|Hood_obj,
    shader = vehicle_multiuv,
    static = FALSE,
    scale = 0.008,
    boneWeight = HoodBone 1.0,
}
```

- **`|` selects a sub-object**, it is not a path separator. Left of it is the
  file under `media/models_X/`; right of it is a mesh name inside the file.
  `FileTask_LoadMesh.java:49,55`.
- **`static = FALSE` is what makes it skinned.** Default is TRUE
  (`ModelScript.java:35`). Wrong, and the part renders at bind pose forever with
  no error.
- **`scale` must match the body's**, because the panel was cut from that body
  at that scale.
- **`boneWeight` is REQUIRED in practice.** See 1.2 -- this is the one that cost
  the most.

### 1.2 boneWeight: declare it, and measure the name

Every mod whose panels animate declares it:

```
VanillaVehiclesAnimated   boneWeight = HoodBone 1.0
KI5                       boneWeight on every animated panel
TIS's hood                omitted -- and TIS's hood does not animate
TIS's doors               declared
```

The engine treats it as conditional
(`if (!modelScript.boneWeights.isEmpty()) { track.setBoneWeights(...);
track.initBoneWeights(skinningData); }`), which reads as "optional" and is how
this project justified omitting it for weeks. **Omit it and the panel renders,
animates, and sits in the wrong place** -- ours ended up under the car, which
looks like a placement bug and sends you hunting the rig.

**The name must match the bone in the FBX, and it is not safe to hardcode.** One
delivery of 22 files carried two conventions -- twelve `HoodBone`, ten
`Hood_bone` beside a `Vehicle_bone`. A constant is silently wrong for one group:
the script parses and the model loads either way. Measure it per file.

### 1.3 The part, and the four anim blocks

```
part EngineDoor
{
    model Default { file = MyMod_CarNormal_Hood, }

    anim Close  { anim = Hood_closing, rate = 2.5, }
    anim Open   { anim = Hood_closing, reverse = TRUE, rate = 2.0, }
    anim Closed { anim = Hood_closing, reverse = TRUE, animate = FALSE, }
    anim Opened { anim = Hood_closing,                 animate = FALSE, }
}
```

`Close`/`Open` are transitions; `Closed`/`Opened` are rest poses that hold a
frame. **One authored clip serves all four**, played forward, reversed, and
frozen at each end. Parsed keys, `VehicleScript.java:838-857`: `angle`, `anim`,
`animate`, `loop`, `reverse`, `rate`, `offset`, `sound`. Defaults: `rate = 1.0`,
`animate = true`, `loop = false`, `reverse = false`.

**Which blocks carry `reverse` depends on which way the clip was authored, and
you cannot get that from its name.** There is no convention: TIS author
`<part>_closing` (open to closed), KI5 author `<part>_opening` (closed to open).
Both are fine. Getting it backwards inverts all four blocks -- `Close` opens,
`Open` closes, and each rest pose holds the other's frame -- which in game is a
panel sunk into the body that moves once and never opens.

**Measure the direction** (see 2.3). The arrangement above is for a clip that
CLOSES. For a clip that opens, every `reverse` flips.

### 1.4 The body must lose its panel

A part model draws **in addition to** the vehicle model; it does not cut a hole.
Attach a hood without removing the hood from the body and every car has two.

Ship a de-panelled body as a static model and swap it in. Fill the aperture with
a recessed cap, or you see through the car.

### 1.5 The shader must have a skinned vertex program

`ShaderProgram.java:286` resolves the vertex shader as
`name + (isStatic ? "_static" : "") + ".vert"`.

Vanilla ships a `.frag` and a `_static.vert` for six vehicle shaders and the
skinned `.vert` for only **three**:

| shader | `.frag` | `_static.vert` | skinned `.vert` |
|---|---|---|---|
| `vehicle` | yes | yes | yes |
| `vehicle_noreflect` | yes | yes | yes |
| `vehicle_multiuv_noreflect` | yes | yes | yes |
| `vehicle_multiuv` | yes | yes | **MISSING** |
| `vehicle_norandom_multiuv` | yes | yes | **MISSING** |
| `vehicle_norandom_multiuv_noreflect` | yes | yes | **MISSING** |

A `static = FALSE` panel naming one of the missing three resolves a vertex
program that does not exist, draws unskinned at bind pose, and cannot be
animated -- with nothing logged, because every name resolved.

**Two ways out, both used in the wild:**

- Ship the missing file (VVA). **Do not simply copy
  `vehicle_multiuv_noreflect.vert` under the missing names** -- the reflective
  frags declare and consume `varying vec4 positionEye` and the noreflect vert
  never writes it. Under GLSL 120 an unwritten varying still LINKS, so the panel
  draws with an undefined reflection. Take the two lines that write
  `positionEye` from vanilla's own reflective *static* vert, with the bone
  matrix in place of the `transform` uniform.
- Ship a private shader family (Filibuster Rhymes' `fr_*`). No collision
  surface, at the cost of renaming the shader in every declaration.

**Do not substitute a different shader name.** Mapping `vehicle_norandom_multiuv`
onto `vehicle_multiuv_noreflect` draws, and silently drops `norandom` -- vanilla
random-tints ordinary cars and deliberately does not tint liveried ones, so
every police, fire and ambulance panel gets a colour its body does not have.

### 1.6 Scripts have no `//` comment

`ScriptParser#stripComments` removes `/* */` and nothing else, so `//` is
ordinary text that sticks to whatever follows it, up to the next comma or
brace. Where it sits decides what you lose, and usually nothing is logged:

- above `module`: the **whole file** is skipped;
- above a `model` or `vehicle` block: **that block** is skipped (a note above
  every declaration looks exactly like a dead file);
- between two properties, or after one on the same line: the **next**
  property is lost, while the one you annotated works.

Any of these means no model declaration, so no mesh load is attempted, so you
do not even get the `No such mesh` error that would have told you. Cost three
sessions here. Write notes as `/* */`. The full table, read from the parser:
[Script comments: what // really does](/pz/build-42/modding/gotchas/script-comments-what-slashes-do).

> **Proof:** Code. `zombie.scripting.ScriptManager#CreateFromToken`,
> `zombie.scripting.objects.ScriptModule#CreateFromTokenPP`,
> `zombie.scripting.ScriptParser#readBlock`. Build 42.21.0 (revision 4a0e9546ec, Steam build 25485521).

## 2. What the rig has to do -- and what it does not

Measured across `VVA/Normal/hood.fbx`, VVA's Orphanage D90 set, KI5's
`Vehicles_70dodge_Body.fbx` and Filibuster's `ag_hmmwv_92_animatedparts.fbx`.

### 2.1 Required

- **Every vertex of the panel bound to the bone**, at weight 1.0. An unweighted
  vertex multiplies by a zero matrix in the vertex shader and collapses to the
  model origin. The panel renders stretched between the origin and its
  neighbours -- a thin wedge that still animates.
- **The bone on the hinge line**, at the panel's rear edge, not at the model
  origin. A pivot at the origin swings the panel through a metre-long arc.
- **The mesh named in the script must exist in the file.** This is the one thing
  that DOES log: `DebugType.General.error("No such mesh \"%s\"")`.
- **A clip whose name matches `anim =`.** Blender exports takes as
  `<Armature>|<Action>`; PZ strips the prefix (`ImportedSkeleton.java:253`), so
  `VehicleSkeleton|Hood_closing` is addressed as `Hood_closing`.

### 2.2 NOT required -- all of these vary between working rigs

| | KI5 | VVA | Filibuster | verdict |
|---|---|---|---|---|
| mesh node rotation | identity | **-90** | identity | irrelevant |
| bone rotation | identity | 90-125 | 90 | irrelevant |
| root bone at origin | `body_bone` | **none in hood.fbx** | `staticbone` | not required |
| body bound into the rig | yes | **not in hood.fbx** | yes | not required |
| bone count | 9 | **1** | 40 | not required |
| body and panel in one file | yes | **separate files** | separate | either |
| `UnitScaleFactor` | 0.1 | -- | -- | ignored by Assimp |

VVA's hood file is one bone, no root, no body, mesh nodes at -90 -- and it
animates a vanilla taxi correctly. If a rule you are about to state would fail
that file, the rule is wrong.

### 2.3 Measure the clip direction, do not read the name

At bind pose a skinned mesh renders exactly where it was modelled. So if the
panel is modelled closed, the bind rotation IS the closed value, and whichever
end of the curve sits on it tells you which way the clip runs.

```
bone rest        145.00
curve            145.00 -> 90.00
                 ^ starts at the bind pose, travels away -> the clip OPENS
```

That file is named `Hood_closing`.

A hood bone resting at `90 + <open angle>` is **not** evidence that the open
pose was baked into the rest pose. That arithmetic is a coincidence of the axis
conversion, and chasing it produced one of the three withdrawn briefs.

### 2.4 Scale

Assimp applies node `Lcl Scaling` and **ignores `UnitScaleFactor`**. Blender's
default export (`FBX_SCALE_NONE`) writes the metre-to-centimetre conversion into
per-object `Lcl Scaling`; `FBX_SCALE_ALL` puts it in `UnitScaleFactor` where the
engine ignores it.

Get it wrong and the car renders ~100x oversize: the camera ends up inside the
mesh and backface-culls to nothing, while the shadow keeps drawing correctly
because it comes from `shadowExtents` in the vehicle script and never touches
the mesh. **A car park of perfect shadows and no cars.**

Binary-sourced FBX carry a second trap: object animation keying scale to the
unit factor, which `frame_set` re-applies after the world transform is baked, so
the evaluated mesh is 1/39 size while `matrix_world` reads identity. That one
shipped here and read as "the vehicle has disappeared".

Either compensate by measuring node scaling per file, or require identity nodes.
Measuring is safer: a hardcoded `/100` becomes a 1/100 bug the day the export is
fixed.

## 3. Attaching to a vanilla car without owning it

`template vehicle X` is winner-take-all. You do not need it.

`VehicleScript.Load(name, text)` parses a block into an already-loaded script,
and every loader is get-or-create -- `Load` (`:141`) does not clear `parts`,
`LoadPart` (`:916`), `LoadAnim` (`:829`) and `LoadModel` (`:700`) all mutate in
place. So this is additive:

```lua
local script = ScriptManager.instance:getVehicle("CarNormal")
script:Load("CarNormal", [[
{
    model { file = MyMod_CarNormal_Body, }
    part EngineDoor
    {
        model Default { file = MyMod_CarNormal_Hood, }
        anim Close { anim = Hood_closing, rate = 2.5, }
    }
}
]])
```

Two load-bearing details:

- **The outer braces are required.** `Load` takes
  `parse(text).children.get(0)`, so the payload must sit inside one anonymous
  wrapper.
- **The bare `model` block replaces the car's body.** A vehicle's body model has
  no id, and `getModelById` has an explicit null-id branch
  (`VehicleScript.java:1546`), so it FINDS and mutates the existing body rather
  than appending a second one. `scale` and `offset` survive untouched.

Fire it on `OnInitGlobalModData` -- after scripts parse, before vehicles spawn.

**`template! = <name>` can also be injected at runtime**, which is what VVA do.
That lets every declaration live in a static script file the engine parses and
validates, with the runtime doing nothing but naming templates.

**The compatibility cost is the body swap, not the part.** Any other mod
replacing the same body mesh collides, last writer winning. Unavoidable: a hood
cannot open away from a shell that still has one.

## 4. Multiplayer

**Part animation does not replicate.** The state does -- `VehicleDoor.open` is a
synced boolean -- the transition does not. Vanilla says so itself, at
`ISOpenVehicleDoor.lua:29`, directly above the call:

```lua
function ISOpenVehicleDoor:start()
	-- TODO: sync part animation + sound
	self.vehicle:playPartAnim(self.part, "Open")
```

Nothing on the Workshop syncs it correctly. VVA has no networking at all. The
Orphanage broadcasts `sendServerCommand(p, "vehicle", "setDoorOpen", ...)` into
a client `Commands` table that is file-local and has no `vehicle` key, so it
dispatches into nothing. VASinked works but calls `setOpen(true)` in **both**
branches and fires on `:start()`, so an interrupted action desyncs.

The correct shape: hook `ISOpenVehicleDoor:start` / `ISCloseVehicleDoor:start`,
relay through the server, and on remote clients call
**`vehicle:playPartAnim(part, dir)` and nothing else**. Vanilla already
replicates the boolean through `transmitPartDoor` in `:complete()`, so a sync
layer that also writes `setOpen` is inventing a way to disagree with the engine.

Also handle the interrupt: `ISOpenVehicleDoor:stop` carries TIS's own
`-- TODO: interrupted, close door again?`, so an interrupted open leaves a
visually open panel over a closed door. Invisible until panels actually move.

## 5. The diagnostic that localises a dead panel fastest

`vehicle:playPartAnim(part, animId)` is Lua-callable and bypasses the part-state
transition entirely.

- moves under `playPartAnim` but not from the radial -> the fault is in the
  transition
- moves under neither -> the fault is below it: the clip, the skinning, or the
  shader

## 6. The silent-failure catalogue

Every one of these renders as "nothing happens", or "it looks wrong", with no
error from the mod or the engine. Several are indistinguishable by eye.

| Cause | Symptom |
|---|---|
| `//` in a script file | the file, the next block or the next property silently missing, by where it sits (1.6) |
| shader has no skinned `.vert` | panel never drawn, no mesh error |
| vert does not write a varying the frag consumes | panel drawn, shading garbage |
| shader substituted for a drawable one | panel drawn, wrong tint or gloss |
| **`boneWeight` omitted** | **panel drawn and animating, in the wrong place** |
| `boneWeight` names a bone the file lacks | same, and the name looks right |
| some vertices unweighted | panel is a thin wedge that still animates |
| clip authored opposite to its name | opens on close, holds the wrong rest pose |
| `static` wrong / mesh has no bones | renders at bind pose, never moves |
| node `Lcl Scaling` not compensated | car ~100x, invisible, shadow correct |
| binary-source unit keying | mesh 1/39 size, reads as "the car is gone" |
| mesh sub-object name wrong | **this one logs** `No such mesh` |
| another mod won the body model | your panel floats over their shell |
| UTF-8 BOM on a Lua file | file does not load, no error |

### The generalisable lesson

Every validator on this project checked whether things **existed** -- the mesh
file, the contract strings inside it, the shader, the model id -- and every one
passed while the mod was visibly broken.

**Verify that values are sane and that references RESOLVE, not that files are
present.** The two checks that would have saved the most time here:

```lua
ScriptManager.instance:getModelScript("MyMod_CarNormal_Body")   -- known at all?
raw_extent * nodeScale * modelScale * vehicleScale              -- ~1.9 x 4.8 x 1.2 m?
```

## 7. Status of this document

Everything in sections 1-6 is read out of the shipped game, the B42 decompile,
or a mod observed animating in a running game.

**Section 1.2 is CONFIRMED IN GAME, 2026-08-10.** Adding `boneWeight` moved a
panel that had been rendering and animating below the sill into its correct
place on the car. Closed, the hood now sits flush; opened, it hinges at the cowl
and lifts forward. One declaration, and it was the last thing standing between a
mod that had every other piece right and a hood that worked.

Three rig theories were briefed to an artist before this. None of them was the
problem, and the problem was one line in a script.

> **Correction, 2026-10-04:** section 1.6 and the matching row of section 6
> used to say that one `//` line makes the whole script file fail. That is
> only true when the `//` sits above `module`. Read from the script parser, a
> `//` elsewhere drops the block below it or the property after it instead.
> Details in [Script comments: what // really does](/pz/build-42/modding/gotchas/script-comments-what-slashes-do).

*Re-checked 2026-10-04 for Build 42.21: the script parser, the model script defaults and the mesh-load error are unchanged; the code claims we re-checked still hold.*
