---
id: build-42-psc-takeaways
slug: psc-takeaways
title: 'Takeaways -- what makes this immersive, and what transfers'
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: intermediate
tags:
  - vehicles
  - project-summer-car
  - design-lessons
  - containers
excerpt: >-
  The single highest-leverage move in PSC. container { } on a vehicle part turns
  one opaque condition number into an inventory of real items with independent
  condition, mod data, fluids and world...
last_updated: '2026-09-29'
---
# Takeaways -- what makes this immersive, and what transfers

> Source: 05-takeaways.md (compiled 2026-08-06, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

## The design ideas worth stealing

### 1. A vanilla part becomes a container of items
The single highest-leverage move in PSC. `container { }` on a vehicle part turns
one opaque condition number into an inventory of real items with independent
condition, mod data, fluids and world models -- and it works on **every vehicle
from every mod** because it rides the template system. No per-vehicle patching.

Generalizes beyond cars: any vanilla object with a `part` definition could be
decomposed this way.

### 2. Derive the vanilla stat instead of replacing it
PSC never fights the engine. It computes `min(condition of critical parts)` and
writes that back to the vanilla `Engine` part, so every other mod, UI element and
Java system keeps reading a number that means what it always meant. Complexity is
additive and invisible to non-participants.

### 3. Degradation as *transmutation*, not decrement
`MotorOil` slowly becomes `UsedMotorOil` in the same container. It isn't a
"freshness" float -- it's two fluids, so the state is visible, drainable,
measurable, and the fix is a physical operation. Compare with a hidden decay
timer: same math, completely different feel.

### 4. Cross-system contamination as a diagnostic
A failing head gasket pushes oil into the coolant **and** coolant into the oil.
The player diagnoses an invisible part by inspecting a different system. This is
the best single mechanic in the mod and it's about 8 lines of Lua.

### 5. One cheap part as the keystone
The fan belt: craftable from leather, unrepairable, and required by the water
pump, alternator, power steering and A/C simultaneously. A tiny item that makes
four systems fail at once creates more tension than any expensive part could.

### 6. Consequence in the survival layer, not just the performance layer
`engineLoudness = base * (1.7 - avgEngineCond)`. A bad engine isn't slow, it's
**loud**, and loud attracts zombies. Mechanical neglect becomes a survival
problem. Far stronger than "-20% top speed."

### 7. Failure modes with names
Repair isn't a progress bar -- the part *has* "Stripped Bolts" and "Burnt Wiring",
each with 1-2 methods across different skills (MetalWelding, Electricity,
Maintenance, Mechanics) and different consumables. Modes accrue as condition
drops (first at 90%, fifth at 10%), and every botched repair permanently raises
the difficulty via `timesRepaired`. You can repair a part into being
unrepairable, which makes "should I stop here" a real decision.

### 8. Skill gradient as the progression curve
Mechanics 0 changes fluids, 1 does the oil filter, 2 does plugs and radiator,
4 does the accessories, 5 does the drivetrain, 7 rebuilds the bottom end. Nothing
is gated by a book or a recipe unlock -- the gate *is* the skill number, and
failure just damages the part.

### 9. Timestep chunking for long-elapsed simulation
```lua
while elapsedMinutes > 10 do  Update(10);  elapsedMinutes = elapsedMinutes - 10  end
```
Non-linear integrators explode when a chunk reloads after days offline. This is
the same class of problem as the `hourLastSeen` burst issue in OutcastHusbandry.

### 10. Sandbox everything, with *ratios* not absolutes
56 options. The author's own comments show them tuning by ratio -- "still 1:4 vs
a 90% engine, is that the reward of a GOOD engine?" -- and the defaults encode
that answer. Notable: `PartChanceHighCondChance` exists purely so a server can
create an "everything good has already been looted" world.

## Warnings

### Java modding still means a manual install
Both physics mods require hand-copying a `zombie` folder into the game directory.
Correction to an earlier read of this: **on B42.13+ that folder no longer
overwrites anything** -- Better Car Physics' own instructions say *"Build 41:
Overwrite all files (should be 24), Build 42.20: Should not overwrite any files"*,
so B42 loads the overlay as a classpath addition rather than a patch. Uninstall
is deleting the folder instead of verifying game files.

Still not something to ship: it can't be installed by subscribing, it breaks on
builds that touch the classes it shadows, and users routinely think the mod is
broken when it's just uninstalled. Do not build an Outcast mod that needs this.

### Reflection is closed -- see `06-reflection-and-java-modding.md`
```lua
function getThrottle(vehicle) return 0.2 end
--[[ -- Reflection no longer allowed due to fun police.
```
Verified in the installed B42.20 jar: the seven reflection functions still exist,
but `LuaManager.validateReflectionAccess()` gates them on `Core.debug` and throws
`"Not in debug"` otherwise. Added in **42.15** (March 2026) as emergency security
hardening after two disclosed sandbox-escape vulnerabilities -- and vindicated a
month later when 14 malicious Workshop mods were caught writing files outside the
game directory on 500-2200 machines.

PSC's fuel and heat models therefore run on a **hardcoded 0.2 throttle** for
anyone without Starlit Library. If you need a Java field the API doesn't expose,
the sanctioned route is Starlit Library or asking in `#mod_portal`, never
reflection and never Reflection Enabler.

### `MaxItemSize` is being abused
PSC uses `MaxItemSize` on engine parts as a performance-tier float, because it's
a free field the engine ignores in that context. Clever, but fragile -- a future
build that gives `MaxItemSize` meaning for container items would silently rebalance
every engine.

### The author has left
The Project Summer Car page states the creator is quitting modding and the mod is
locked from re-uploads. 113k subscribers, no maintainer. Community forks already
exist (`3744620731`, a Neat UI compat fork that vendors the whole mod). Expect
drift as B42 advances.

### Version sprawl
PSC ships four parallel copies of itself (`42`, `42.13`, `42.14`, `42.15`) using
mod.info `versionMin`/`versionMax` to select. Effective for B42's fast-moving
API, but it means 4x the maintenance and the `42` folder is already stale
(different file set: `Part_Spawning.lua` vs `Project_Summer_Part_Spawning.lua`).

## TEH Assembly Order -- the hardcore layer

`3593757134`, by TEH Megamin. 694 lines of Lua that add three things on top of PSC:

**Dependency graph.** Each part declares `requires` and `blockedBy`:
```lua
enginepistons  = { requires = {"EngineCrankshaft"}, blockedBy = {"EngineCylinderHead","EngineOilPan"} }
enginefanbelt  = { requires = {"EngineCrankshaft","EngineAlternator","EngineWaterPump",
                               "EnginePowerSteeringPump","EngineAirConditioner"},
                   blockedBy = {} }   -- belt goes on last
```
You must disassemble in the correct order to reach a part. Crankshaft is blocked
by oil pan, pistons and flywheel. Sparkplugs must come out before the head.

It also already carries entries for **turbocharger, intake manifold, exhaust
manifold and air filter** -- parts that don't exist in the 42.15 PSC on disk.

**Injuries.**
- Removing a moving part (transmission, fan belt, flywheel, torque converter)
  with the **engine running** -> hand injury. With `AOSevereTraumas` on: deep
  wound and a **21-day fracture**.
- Touching a hot part (>80 C block, or a hot radiator) -> burn on the hand.
- Draining a hot oil pan or radiator -> scalding, `numBurns = floor(amount/100)`
  burns distributed across body parts, plus wetness.

**No condition hints.** The panel stops telling you part condition -- you
diagnose by symptom.

Two sandbox options only: `AOSevereTraumas` (default off) and
`AOIgnoreRunningEngine` (default off).

This is the right shape for a hardcore add-on: pure client Lua, `require=\ProjectSummerCar`,
`loadModAfter`, and it adds *consequence* rather than content.

## If we ever build something in this space

**CONFIRMED BY THE SPIKE, 2026-08-06.** `Vehicles.Update.Brakes`, `.Suspension`,
`.Tire` and `.Muffler` were measured firing on a moving vehicle: 116 calls across
4 distinct parts each (Brakes/Suspension/Tire) and 29 on a single part (Muffler)
over 118 seconds, at roughly one call per game-minute. `LowerCondition` was
reached 213 times. The gap below is not merely reachable -- it is measured, and
it is the single largest unclaimed area in the B42 vehicle ecosystem.

Two implementation constraints that came out of the same measurement: per-vehicle
work on the wheel hooks **must** be de-duplicated by `part:getId()` or it runs
four times, and the ~0.25 Hz real-time cadence is fine for wear and thermal work
but far too coarse for anything wanting per-frame smoothness -- a torque curve
belongs on `OnPlayerUpdate`, not here.

The gap in the ecosystem is **everything that isn't the engine.** PSC owns the
engine bay completely and RCP owns the drivetrain physics. Nobody has decomposed:

- Brakes (pads, rotors, lines, fluid) -- PSC has the booster but no brake system
- Suspension (springs, shocks, bushings) -- PSC's spawn code explicitly *avoids*
  touching suspension because removing it makes vehicles fly
- Steering rack / tie rods
- Exhaust (PSC has no muffler -- and loudness already matters for zombies)
- Fuel delivery (pump, filter, injectors/carb)
- Differential / axles

An exhaust system in particular would slot into PSC's existing loudness model
with almost no new machinery, and loudness is already the mechanic with the most
survival weight. Worth noting alongside the existing Outcast mod list.
