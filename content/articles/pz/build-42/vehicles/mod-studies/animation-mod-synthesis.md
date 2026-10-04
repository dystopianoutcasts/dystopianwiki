---
id: build-42-animation-mod-synthesis
slug: animation-mod-synthesis
title: B42 vehicle animation -- what every installed mod actually does
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: intermediate
tags:
  - vehicles
  - animation
  - community-mods
  - workshop-survey
excerpt: >-
  Compiled 2026-08-10 from the 1117 Workshop mods in a Steam library's
  steamapps/workshop/content/108600 folder, read for technique only.
  Nothing here is copied. Supplements 17-vehicle-animation-reference.md...
last_updated: '2026-09-29'
---
# B42 vehicle animation -- what every installed mod actually does

> Source: 25-animation-mod-synthesis.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Compiled 2026-08-10 from the 1117 Workshop mods in a Steam library's
`steamapps/workshop/content/108600` folder, read for technique only.
Nothing here is copied. Supplements `17-vehicle-animation-reference.md` and
corrects two of its claims.

Every finding below was read out of the shipped files, and where a conclusion
depends on absence, the absence was proved rather than assumed.

---

## 1 · The population

Of 1117 installed mods, **42 declare at least one skinned vehicle model**
(`static = FALSE`). They fall into three groups, and the groups have almost
nothing in common technically.

| Group | Count | Approach |
|---|---|---|
| KI5 fleet (`70dodge`, `92jeepYJ`, `88toyotaHilux`, `81deloreanDMC12`, ...) | ~25 | own vehicles, own shader family, animated, working |
| Vanilla-car animators: VVA `3281755175` + Orphanage `3684603401` | 2 | runtime template injection onto vanilla scripts |
| Self-contained packs: Filibuster Rhymes `3683878228`, Autotsar, SVU | 3 | own vehicles, own private shader namespace |

Only the middle group does what OutcastMotorsAnimated does.

## 2 · Correction: VVA has a Build 42 branch

`17-vehicle-animation-reference.md` §10 says "B41 only, no B42 branch as of
2026-08-07". That is now wrong.

Workshop `3281755175` ships:

```
mods/VanillaVehiclesAnimated/common/media/   398 scripts, 130 meshes, 11 lua files
mods/VanillaVehiclesAnimated/42/media/       10 shader files, B42 only
```

Fifteen families under `scripts/vehicles/VVA2/`: Cattle, Horse, Luxury, Modern,
Modern02, Normal (+SWagon), Offroad, Pickup (+Van), Racer, Small, Small02,
Sport, StepVan, SUV, Vans. Doors, windows, trunks, hoods, lights, seats and
interior decor -- not just hoods.

`3684603401 [B42] VehicleAnimationsOrphanage` (`require=VanillaVehiclesAnimated`)
carries the families VVA dropped in the B42 rework.

**Consequence for us:** `incompatible=VanillaVehiclesAnimated` in our mod.info is
now load-bearing rather than theoretical, and our runtime `bodyIsVanilla` check
is the thing that keeps a mixed install from silently producing floating hoods.

## 3 · The shader gap is a vanilla gap, and the fix is a file, not a substitution

`ShaderProgram.java:286` resolves a vertex shader as
`name + (isStatic ? "_static" : "") + ".vert"`. So a skinned model needs
`<shader>.vert` to exist. Vanilla's `media/shaders/` ships:

| Shader | `.frag` | `_static.vert` | skinned `.vert` |
|---|---|---|---|
| `vehicle` | yes | yes | **yes** |
| `vehicle_noreflect` | yes | yes | **yes** |
| `vehicle_multiuv_noreflect` | yes | yes | **yes** |
| `vehicle_multiuv` | yes | yes | **MISSING** |
| `vehicle_norandom_multiuv` | yes | yes | **MISSING** |
| `vehicle_norandom_multiuv_noreflect` | yes | yes | **MISSING** |

Three shaders cannot draw a skinned mesh because TIS never shipped the vertex
program. This is why our hoods did not appear: it is a hole in the base game,
not a mistake in the mod.

**Two mods solve it independently, and neither substitutes a different shader.**

- **VVA** ships `42/media/shaders/vehicle_multiuv.vert` and
  `vehicle_norandom_multiuv_noreflect.vert`. Diffed against
  vanilla `vehicle_multiuv_noreflect.vert`: **byte-identical, both of them.**

  **Do not copy this without reading §3.1 below.** A straight copy is correct
  only for the `_noreflect` shaders, which is why VVA declares its panels with
  those -- and it is the reason their animated panels do not reflect on bodies
  that do.
- **Filibuster Rhymes** ships a whole private family: `fr_vehicle_multiuv.vert`,
  `fr_vehicle_multiuv_noreflect.vert`, `fr_vehicle_multiuv_static.vert`,
  `fr_vehiclewheel.vert` (+ `OLD_` backups). Every model declaration names
  `fr_*`, so they never touch a vanilla shader name and can never collide.

### 3.1 The copy is wrong for the reflective shaders, and it links anyway

Found the hard way on 2026-08-10, after shipping it.

The skinned donor and the reflective fragment shaders do not agree on their
varyings:

| | declares `positionEye` | writes it |
|---|---|---|
| `vehicle_multiuv.frag` | yes, and consumes it | -- |
| `vehicle_norandom_multiuv.frag` | yes, and consumes it | -- |
| `vehicle_multiuv_static.vert` (vanilla, reflective) | yes | **yes** |
| `vehicle_multiuv_noreflect.vert` (the donor) | **no** | **no** |

The frag computes its reflection as

```glsl
vec2 refTexCoord = SphereMap( normalize(normal), positionEye.xyz );
```

`refTexCoord` is a local, not a varying, so nothing about the interface looks
missing. But `positionEye` is a varying, and under **GLSL 120 an unwritten
varying still links** -- it simply reads undefined. So the program builds, the
panel draws, and the shading is garbage.

Every existence check passes: the file is there, the name resolves, and an MD5
against vanilla's own shader matches exactly. §8.2 of `17-...md` again, in a new
place -- the value was verified and the **contract** was not.

The fix is two lines taken from vanilla's own reflective static vert, with the
bone matrix in place of the `transform` uniform:

```glsl
varying vec4 positionEye;
...
positionEye = (ModelViewProjection * boneEffect * position) - vec4(-0.2, 0.2, 0.2, 0);
```

**The generalisable check** -- worth having in any mod that ships a shader: for
every shader a model names, resolve the `.vert` the engine will actually pick
(`name + (isStatic ? "_static" : "") + ".vert"`) and require it to assign every
varying the paired `.frag` declares.

### What this costs us today

Our `Script.SKINNED_SHADER` maps all three missing shaders onto
`vehicle_multiuv_noreflect`. That draws, but it is not the same shader:

- `vehicle_multiuv` -> `..._noreflect` loses the reflection pass. Cosmetic.
- **`vehicle_norandom_multiuv*` -> `vehicle_multiuv_noreflect` loses `norandom`.**
  The `_norandom` variants exist because vanilla applies a random colour tint to
  ordinary cars and deliberately does not tint liveried ones. Substituting the
  random variant means **police, fire, ambulance and profession hoods get a
  random tint their own body does not have.** Counted from the generated script:
  11 of our 26 body models are `_norandom`, reaching **98 of the 121 vehicles**
  -- the liveried Van model alone is 50 of them.

That is a real defect, currently shipped, and it disappears entirely if we ship
the three missing `.vert` files instead.

## 4 · `template! =` can be injected at runtime

`17-...md` §4 established that `VehicleScript.Load` is additive and showed
injecting `model` and `part` blocks inline. It missed the more useful form.

VVA's core flattens a profile tree into **one** payload per vehicle:

```lua
vehicleScript:Load(id, "{ model { file = X, } template! = A, template! = B, }")
```

`template! = <name>` resolves an entire `template vehicle` block that was
declared normally in a static `.txt` file. So the whole part/model/anim surface
lives in files the engine parses and validates at script-load time, and the
runtime injection reduces to a list of names.

**Why that matters for us specifically:** the `//` comment bug (`17-...md` §8.1)
cost three in-game sessions precisely because our declarations were built as
runtime strings and a parse failure was invisible. Declared as templates, a
broken file means the template does not exist, and "does this template exist"
is a check we can run at boot and in the validator.

### Anim merge composes through templates

VVA declares the four anim blocks once:

```
template vehicle VVA_Hood { part EngineDoor { anim Close {...} anim Open {...}
                                              anim Closed {...} anim Opened {...} } }
```

then layers rate-only overrides:

```
template vehicle VVA_Hood_Slow { part EngineDoor { anim Close { rate = 0.625, }
                                                   anim Open  { rate = 0.5, } } }
```

Applying `VVA_Hood` then `VVA_Hood_Slow` yields the full anim with the slow
rate, because `LoadAnim` is get-or-create and only assigns keys that are
present. Their "Snappy Doors" and "Apocalyptically Slow Doors" submods are
nothing but a different rate template. A speed setting is free if the anim
blocks are declared this way.

### Parts can be parented to an animated part

```
part VVAAnchor_Hood*
{
    parent = EngineDoor,
    category = nodisplay,
    setAllModelsVisible = true,
    model Default { file = VVA_Dummy, }
}
```

A part declaring `parent = EngineDoor` rides the hood's animation. Relevant to
Outcast Motors later: bay contents could be parented rather than hand-placed.

### Bugs in that core worth not reproducing

Read because we are about to build the same shape:

- `ApplyAnimationProfiles` passes `vehicleid` (undefined global, nil) to
  `Load` instead of the loop variable. It evidently still works, which suggests
  the name argument is ignored when loading into an existing script object --
  but do not depend on that; pass the real id.
- No `pcall` around `Load`. One malformed template aborts the loop and every
  vehicle after it silently goes unmodified. Isolate per vehicle.
- `IsVehicleDefined` calls an undefined global and would error if anything used it.

## 5 · Nobody has working multiplayer animation sync

This is the largest finding, and every part of it was proved rather than
inferred.

**Vanilla admits it.** `shared/Vehicles/TimedActions/ISOpenVehicleDoor.lua:29`,
immediately above the `playPartAnim` call:

```lua
function ISOpenVehicleDoor:start()
	-- TODO: sync part animation + sound
	self.vehicle:playPartAnim(self.part, "Open")
```

First-party confirmation of `17-...md` §5.5.

**VVA has no networking at all.** Zero matches for `sendServerCommand`,
`sendClientCommand` or `OnServerCommand` anywhere in `3281755175`.

**The Orphanage's sync is a no-op.** `patchDoorOpenCloseActions.lua` chains
`ISOpenVehicleDoor:complete` and, on the server, broadcasts:

```lua
sendServerCommand(onlinePlayer, "vehicle", "setDoorOpen", args)
```

Client dispatch is `client/ServerCommands.lua:201`:

```lua
ServerCommands.OnServerCommand = function(module, command, args)
    if Commands[module] and Commands[module][command] then ...
```

`Commands` is declared `local` at line 4 of that file and defines
`player, fishing, erosion, character, literature, square, animal, animalCorpse,
hutch, ui, recipe, forage`. **There is no `Commands.vehicle`**, nothing else in
vanilla adds one (it is file-local), and neither VVA nor the Orphanage defines
one. The command is dispatched into nothing. `Commands.setDoorOpen` does exist
-- in `server/Vehicles/VehicleCommands.lua:154`, which is the *client to server*
direction and irrelevant here.

**VASinked works but carries two defects.** `VAS_CCommands.lua`:

```lua
if opened then
    vehicle:playPartAnim(part, "Open")
    part:getDoor():setOpen(true)
else
    vehicle:playPartAnim(part, "Close")
    part:getDoor():setOpen(true)      -- line 20: wrong in the close branch
end
```

and it broadcasts from `:start()`, so an interrupted action leaves every remote
client animated-open with the boolean set, while the actor's `:complete()` never
ran and their own door stayed shut.

### The design that falls out of this

Vanilla already replicates the door boolean: `ISOpenVehicleDoor:complete()`
calls `vehicle:transmitPartDoor(part)`. So a sync layer must broadcast **intent
to animate** and call **`playPartAnim` only** -- never `setOpen`. That deletes
VASinked's entire bug class and is less code than what it replaces.

Two further points:

- **Interrupt handling is a vanilla gap that only becomes visible once panels
  move.** `ISOpenVehicleDoor:stop()` carries TIS's own
  `-- TODO: interrupted, close door again?`. Today nothing moves so nobody
  notices; the moment a hood swings, an interrupted open leaves a visually open
  hood over a closed door, locally as well as remotely. Handle it on both sides.
- **`Events.OnClientCommand.Add` filtered on `module == 'vehicle'` is an
  additive server-side hook** -- Filibuster Rhymes uses it to observe vanilla's
  own vehicle commands without replacing the handler. Useful whenever the
  trigger *is* a vanilla client command (door open is not; it is a direct
  `transmitPartDoor`).

## 6 · Conflict handling: ours is the better design

VVA detects rivals by name and skips those vehicles:

```lua
if VVA.CheckModEnabled("VVSR_Continued") then
    VVA.ForbidVehicle("Base.CanNormal")
```

A hardcoded list of rivals its author knew about, requiring a mod update for
every new one. Our runtime `bodyIsVanilla` per-car check reads back what
actually landed and stands down per vehicle, which catches rivals nobody has
heard of. Keep it; it is the stronger mechanism and `04-compatibility-and-risk.md`
called for exactly this.

## 7 · Assorted

- VVA splits each family into **separate FBX files per panel**
  (`vehicles/VVA/Normal/static|Model`, `vehicles/VVA/Normal/hood|Hood_obj`).
  TIS and KI5 use one FBX with many sub-objects; we follow TIS/KI5. Both work;
  the split means every panel file carries its own armature.
- VVA declares every model **twice**, `X` and `X_nr`, and duplicates the whole
  template tree, to select random-tint versus liveried shaders. Shipping the
  missing `.vert` files makes that duplication unnecessary for us -- one
  declaration can name the correct shader directly.
- Several mods carry versioned build folders (`42.0/`, `42.13/`, `42.17/`,
  `42.20/`) side by side; PZ picks the highest `<=` the running build.
- FR's `OLD_*` shader files shipped in the release build. Ours should not.

## 8 · Answers to open questions from `17-...md` §9

| Question | Status |
|---|---|
| Does a Blender panel cut from a vanilla body want `vehicle` or `vehicle_multiuv`? | **Answered.** It wants the body's own shader; the reason it failed is the missing skinned `.vert`, not the wrong choice. Ship the file, keep the shader. |
| Does part animation replicate in MP? | Answered previously: no. Now confirmed by TIS's own `-- TODO` at the call site. |
| Does `anim Opened { animate = FALSE }` restore a saved-open state on load? | **Still unverified.** VVA ships it, which shows it does not fail catastrophically -- not that it behaves correctly. One save/reload settles it. |
| Does a rig without `Vehicle_bone` animate? | Still unverified. KI5 binds their body to `body_bone` and it works, so a root bone exists in every working example. |
