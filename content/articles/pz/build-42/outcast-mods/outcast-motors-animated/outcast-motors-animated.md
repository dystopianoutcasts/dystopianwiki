---
id: build-42-outcast-motors-animated
slug: outcast-motors-animated
title: Outcast Motors Animated
game: pz
version: build-42
section: outcast-mods
category: outcast-motors-animated
difficulty: beginner
tags:
  - outcast-motors-animated
  - vehicles
  - animation
  - overview
excerpt: 'Build 42. Every panel a vanilla car has, opening.'
last_updated: '2026-09-29'
---
# Outcast Motors Animated

> Source: OutcastMotorsAnimated/README.md (compiled 2026-09-27, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Build 42. **Every panel a vanilla car has, opening.**

Vanilla plays a sound and an animation of your character reaching for a bonnet or
a door, and then nothing moves. `VehicleDoor` carries a boolean and no angle, and
every vanilla car is one welded mesh with no separate panels. **This mod gives
that boolean something to look like.**

**Appearance only.** No save data, no new items, no changes to mechanics, repair
or part condition.

**Status: nothing here has been confirmed in a running game.** Everything below
is verified against the shipped scripts, the B42 decompile, 34 data checks and
809 headless assertions. **None of that is the same as watching a hood swing**,
and the single most valuable unknown on the mod is whether a *second player* sees
any of it move. See [What is not known](#what-is-not-known).

---

## What it does

### Panels

**150 of 150 vanilla vehicles open every panel their body actually has.** No car
has a panel the mod declines to animate.

| panel | what moves |
|---|---|
| bonnet | lifts on `EngineDoor`, stays up on a car saved with the bay open |
| front doors | swing on `DoorFrontLeft` / `DoorFrontRight` |
| rear doors | swing, on the bodies that have them |
| middle cargo doors | one per flank on the vans -- **vanilla declares no such part; we create it** |
| boot lid | swings on `TrunkDoor` |
| barn doors | left/right pair on the vans, on `DoorRear` |
| split tailgate | upper hatch lifts, lower gate drops, on the pickup vans |
| fold-down tailgate | on the open-bed pickups |
| windows | slide down in the doors |
| rear glass | rides the panel it belongs to -- the barn doors, the tailgate, or the shell |

**Ten body layouts** cover the fleet, because the panel set genuinely differs
per body:

```
    sedan                     8 sets    6 swinging + 4 sliding
    coupe                     6 sets    4 swinging + 2 sliding
    coupeTailgate             3 sets    4 swinging + 2 sliding   rear glass rides the gate
    sedanTailgate             0 sets    6 swinging + 4 sliding   for the SUV once its glass is split
    singleRearDoor            2 sets    4 swinging + 2 sliding
    singleRearDoorMiddlePair  2 sets    6 swinging + 2 sliding   creates parts
    middlePairBarn            2 sets    6 swinging + 4 sliding
    middleSingleBarn          1 set     5 swinging + 2 sliding   creates parts
    barnTrunk                 1 set     4 swinging + 2 sliding
    foldDownTailgate          3 sets    4 swinging + 2 sliding   creates parts
```

### Engine bays

**44 cars show a real engine under the bonnet**, across 12 body shapes. Fourteen
part slots carry geometry, and **they appear and disappear as the player fits and
pulls the parts themselves** -- radiator, fan, battery, alternator, hoses, block,
booster and the rest.

**That is not scripted.** `VehiclePart.setInventoryItem` calls
`setAllModelsVisible(item ~= nil)`, so a part's models appear when its item is
fitted and vanish when it is pulled, with no Lua in the loop. It is the same path
that puts a tyre on a wheel.

**Outcast Motors declares 25 engine sockets. Thirteen are drawn, plus vanilla's
own Battery, and twelve are deliberately not drawn** -- each with a
recorded physical reason -- pistons and the crankshaft are inside the block, the
transmission is behind it, the heater core is in the cabin. A part is drawn if a
player would *see* it with the bonnet up, not because it is simulated.

**The other 106 cars open a bonnet onto an enclosure with no engine in it.** The
cab-over vans keep their engine under the seats, which is where a real one lives
and why the nose is short. The rest are pending art.

### Passengers

**Off by default** (`OMA.PASSENGER_ENABLED = false`). `IsoGameCharacter.render`
refuses to draw a seated character unless `BaseVehicle.showPassenger` returns
true, and that resolves to one unset field on the seat script. The feature is
that field.

---

## How it works

**Four pieces, and the engine already owns three of them.**

1. **A cut body**, declared as a model script and swapped in for the car's own
   welded mesh.
2. **The panels**, declared as skinned models bound to their own bones.
3. **Four `anim` blocks per part** -- `Close`, `Open`, `Closed`, `Opened` --
   driving one authored clip forward, backward, and frozen at each end.
4. **Nothing else.** The engine flips `VehicleDoor.open` when the player uses the
   part and plays the matching anim itself.

**If you find yourself writing an `OnTick` handler that interpolates an angle,
stop.** There is no Lua in the animation loop and there must not be.

### This is not a new idea, and that is the point

**Vanilla B42 already ships a working animated hood.** `ModernCar_Martin`
declares `part EngineDoor` with a `model Default` and the same four anim blocks.
It is in the game right now with no mods installed. **The mod deliberately leaves
that car alone**, by four separate routes.

### Declaration is at runtime, against the live script

`ScriptManager` is asked for each vehicle and the model block is injected into
it. **`VehicleScript.Load` is get-or-create**: naming a part that does not exist
CREATES a bare one rather than failing, which is a session-ending crash class, so
every part is checked for existence before it is named.

---

## Modules

| file | what it is for |
|---|---|
| `OMA_Config.lua` | identity, the kill switch, animation rates |
| `OMA_Boot.lua` | **the only file that touches the game's event system** |
| `OMA_Families.lua` | the family table. **Generated -- do not hand-edit** |
| `OMA_Cab.lua` | the panel sets: layouts, donors, per-car resolution |
| `OMA_Bay.lua` | the engine bay: which parts draw, on which bodies |
| `OMA_Script.lua` | building the two pieces of engine text |
| `OMA_Inject.lua` | attaching a model to a part, at runtime |
| `OMA_Compat.lua` | **three independent reasons to stand down** |
| `OMA_Passenger.lua` | making a seated character visible |
| `OMA_Live.lua` | reporting the car in front of the player, into the log |
| `OMA_Debug.lua` | diagnostics, client-side |

---

## For other mods

**`OMA.Bay.cannotShowEngine(vehicleId)`** is published for UI. It returns a
reason string, or `nil` when the car shows an engine or when this mod has no
opinion. **`nil` means say nothing; only a string means say something.**

```lua
local why = OMA and OMA.Bay and OMA.Bay.cannotShowEngine
            and OMA.Bay.cannotShowEngine(vehicleId)
if why then ... end
```

It accepts either `CarTaxi` or `Base.CarTaxi` -- the prefix is stripped inside,
because a comparison between the two does not error, it simply never matches.

Also stable: `Cab.donorFor`, `Cab.familyOf`, `Cab.vehicles`, `Cab.owns`,
`Bay.owns`, `Bay.setForVehicle`.

---

## Compatibility

**Requires OutcastLib.** Subscribers *and the server* both need it in the mod
list.

**Declared incompatible with VanillaVehiclesAnimated**, which replaces the same
body meshes.

**Three independent reasons the mod stands down**, checked at boot: a known
conflicting mod id, a body that is not the vanilla one we expected, and a
declaration that did not land. **If another mod has already replaced a car's
body, that car is left alone and the log says so** rather than the two fighting
over it.

**Any other mod that replaces the same vanilla body meshes will conflict**, last
one loaded winning. Mods that add their own vehicles are unaffected -- their cars
are never touched.

**Runs alongside Outcast Motors and neither requires the other.** Together, the
bonnet you open to reach the engine is now visibly open.

---

## Shaders

The mod ships five shader files, and **two of them are load-bearing for the base
game**:

```
    vehicle_multiuv.vert            vanilla ships the .frag and NOT this
    vehicle_norandom_multiuv.vert   likewise
    oma_glass.vert / _static.vert / .frag
```

PZ resolves a vertex program as `name + (isStatic ? "_static" : "") + ".vert"`.
Vanilla ships `vehicle_multiuv.frag` but no skinned `.vert`, so **a skinned model
under that shader cannot be drawn at all.** The mod supplies the missing programs,
and they shadow for the whole load order -- 97 vanilla car bodies resolve them.

---

## Verification

```
    34 data checks          validate-data.ps1
    809 assertions          9 headless behaviour suites
```

**The checks exist because of specific defects, and each one names its own.** A
few worth knowing about if you touch this:

- **check 20** -- every name a shipped script uses exists in the mesh it points
  at. A missing object draws nothing, silently, with no log line.
- **check 30** -- is what we declare *complete*, not merely correct. Every other
  gate asks whether what we declare is right; this asks whether it is all of it.
- **check 32** -- a model's `static` flag must agree with its bones. A skinned
  model marked static draws through the unskinned program and stands perfectly
  still, and every other check passes.
- **check 33** -- every shipped mesh matches the hash **its own producer
  recorded**. Two tools write the same file; for 84 cars the wrong one had won.
- **check 34** -- the only gate that opens the animation take. It asks whether
  each panel is actually *weighted* to the bone it names, and whether the clip
  the anim block names exists in the file and **moves**. A bone that is named,
  exists, and holds no weights passes checks 11, 20 and 32 and never budges.

**The recurring failure on this mod is a gate that is green because of what it
does not look at.** Several have had to be rebuilt for exactly that. If you add
one, make it refuse to pass over an empty set.

---

## What is not known

**Nobody has confirmed that a second player sees any panel move.** Everything
this mod does is panel movement, multiplayer is the target, and this has never
been tested. **It is a two-person, ten-second test and it is worth more than any
remaining geometry.**

**A few cars can still go slightly see-through from certain angles** -- measured
at 0.5% of angles on the taxi, 0.8% on the sports car, against an unmodded car's
0.0%. The cause is known: generated interior geometry made of single-sided
surfaces, and a single-sided surface seen from behind is a hole.

**106 cars open a bonnet onto an enclosure with no engine parts in it.** For the
96 cab-over vans that is correct and permanent. For the rest it is pending.

---

## Layout

```
    Contents/mods/OutcastMotorsAnimated/42/
        media/lua/shared/OutcastMotorsAnimated/   the modules above
        media/lua/client/OutcastMotorsAnimated/   OMA_Debug
        media/scripts/vehicles/                   generated model scripts
        media/models_X/vehicles/OMA/<donor>/      the cut meshes
        media/shaders/                            the five shader files
    tools/                                        checks, proofs, generators
    tests/                                        the headless suites
    scripts/validate-data.ps1                     the gate
```

**Generated files say so in their header.** `OMA_Families.lua` and every
`media/scripts/vehicles/*.txt` come from `tools/`; edit the generator and re-run,
never the output.

---

*Author: Raxdeg. Studio: Dystopian Outcasts.*
