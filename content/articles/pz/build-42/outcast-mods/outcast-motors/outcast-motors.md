---
id: build-42-outcast-motors
slug: outcast-motors
title: Outcast Motors
game: pz
version: build-42
section: outcast-mods
category: outcast-motors
difficulty: beginner
tags:
  - outcast-motors
  - vehicles
  - engine-bay
  - overview
excerpt: 'Engines are built, not repaired.'
last_updated: '2026-10-04'
---
# Outcast Motors

> Source: OutcastMotors/README.md (compiled 2026-09-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Engines are built, not repaired.

Every car in the world carries twenty-four real parts you can pull out, inspect,
swap and wear down -- sparkplugs, pistons, crankshaft, gearbox, radiator, fan
belt and the rest. Open a hood, right-click a part, pull it with the right tool,
and the car behaves differently: no distributor is no spark, a dead alternator
stops charging the battery, a missing radiator overheats, and the engine you
assemble sets that individual car's power.

**Status: test build, shipping to testers.** Workshop id `3782914142`. Requires
**OutcastLib** (`3778987608`), which the server needs too.

```
    24 slot parts        76 items (24 x 3 vehicle classes, plus fluid vessels)
    23 world models      7 fluids        4 quality grades
    37 test suites       13 data checks  1 sandbox option
```

Everything below is implemented and under test. Where a thing is partial it says
so in its own section.

---

## What it does

### The engine bay

Twenty-four parts, in four groups the Mechanic Workshop draws as tabs:

| Group | Parts |
|---|---|
| **Engine internals** | Spark Plug, Cylinder Head, Head Gasket, Piston Set, Crankshaft, Flywheel, Intake Manifold, Engine Assembly, Starter Motor, Distributor, Air Filter Housing |
| **Drive train** | Transmission, Torque Converter |
| **Fluids and cooling** | Oil Pan, Oil Filter, Radiator, Cooling Fan |
| **Accessories** | Fan Belt, Alternator, Water Pump, Power Steering Pump, Brake Booster, A/C Compressor, Heater Core |

Each carries its own **mechanic skill requirement** (1 to 9), **tool**, **install
time** and **weight**. A crankshaft is skill 7, 8 kg and 300 units of work; a
spark plug is skill 2 and 70. Six parts are **critical** -- the car does not run
without them.

### What actually breaks

The bay is not decoration. Each system reads the parts and changes the car:

- **Starting** — the distributor and starter gate ignition. Vanilla ANDs every
  part's `checkEngine` hook together, so ours sit as peers beside vanilla's own
  rather than replacing anything.
- **Power** — the bay sets *this car's* engine output and quality. Vanilla's
  `Engine` part has no inventory item and so contributes nothing to
  `updatePartStats`; the engine is the one major system vanilla never runs
  through it, and this closes that gap.
- **Charging** — the fan belt drives the alternator, the alternator fills the
  battery. Lose either and the battery drains with nothing replacing it.
- **Cooling** — radiator, water pump and cooling fan ride vanilla's own engine
  temperature gauge.
- **Braking** — brake fluid and the brake booster, and the stop that does not
  happen.
- **Heating** — the heater core becomes the car's actual cabin heater.
- **Condition mirror** — bay condition is written back to the vanilla Engine
  part, and crash damage spreads into the bay rather than stopping at the
  bodywork.

### Fluids

Seven fluids, and they are what turn a car from a thing you assembled into a
thing you maintain:

**Motor Oil** and **Used Motor Oil** — oil degrades, and used oil is a separate
substance you have to do something with. **Engine Coolant** — including a
freezing model: parked below freezing with the engine off, coolant damages the
radiator, water pump, heater core and head gasket over time. **Transmission
Fluid** and **Burnt Transmission Fluid** — two distinct ways ATF stops
protecting. **Brake Fluid**.

**Contamination** models a failing head gasket through two symptoms that never
name it — you diagnose it from what the car does, not from a label.

### Part quality

Two independent axes, and confusing them is the classic mistake here:

- **Quality grade** rides in item mod data: *worn* (0.85), *stock* (1.00),
  *refurbished* (1.08), *performance* (1.20). Anything unstamped reads as stock,
  so parts from older saves or other mods behave exactly as vanilla.
- **Vehicle class** is the trailing digit — `OMO_Sparkplug1/2/3`. That is
  vanilla's own per-class compatibility axis (`mechanicType`), not how good the
  part is. Truck parts differ from compact-car parts the same way vanilla's own
  tyres do.

### Getting parts

**Both, tiered by location.** Parts spawn in the world, but rarely and only where
a mechanic would keep them — a dealership beats a shop, a shop beats somebody's
garage. **A wreck is still the cheapest source**; nothing spawns often enough to
make stripping a car pointless.

> This reverses an earlier pillar ("they never spawn as loot") by our own
> decision, 2026-08-27. Recorded here because the Workshop page used to say otherwise.

### The Mechanic Workshop

A replacement mechanics panel that takes over the moment the player asks for
vehicle mechanics, with install, uninstall and repair as proper timed actions.
Access to the bay is gated — `OMO_Access` decides who may open it.

### Train Mechanics

Queue up work on a car and the character walks through it part by part, earning
mechanics XP. It tells the difference between three outcomes that look identical
from the inventory: a failed skill roll (the training worked, the part stayed
fitted), an interruption, and a failed refit.

> Vanilla pays Mechanics XP on both branches of install and uninstall. A
> **failed** attempt pays 1 XP, every time. A **successful** one pays through the
> Java method `addMechanicsItem`: 2 to 13 XP, scaled by the Mechanics level the
> part's uninstall table asks for, and only the first time that part is done on
> that car in a game day. So a part you have mastered still teaches you, once per
> car per game day. A mod using vanilla's own tables pays exactly what vanilla
> pays.
>
> **Proof:** Code. `media/lua/shared/Vehicles/TimedActions/ISInstallVehiclePart.lua` and `ISUninstallVehiclePart.lua`, `complete()`; `zombie.characters.IsoPlayer#addMechanicsItem` and `#updateMechanicsItems`. Build 42.20 (revision a2947723ca).

### Smaller things

- **Temperature readout** — engine temperature in real numbers while driving,
  rather than a moodle.
- **Hood key** — the use key shuts an open hood.
- **Reporting** — one log block per vehicle, written on change rather than on
  demand.

---

## The family

Outcast Motors is the simulation half of a three-mod product. Each ships
separately and **none requires another** — all three require only OutcastLib.

| Mod | Does |
|---|---|
| **Outcast Motors** (this) | The parts, the simulation, the items, the workshop panel |
| **Outcast Motors Animated** | The visible engine bay and every car's opening panels — 150 of 150 vehicles open every panel vanilla gives them |
| **Outcast Motors UI** | The mechanics window that draws our parts |

**This mod attaches no geometry to a car.** Its vehicle template declares zero
model files; the 23 models are `WorldStaticModel` — the part in your hands or on
the ground. Everything you see under a bonnet is Outcast Motors Animated.

---

## Install (development)

```powershell
.\scripts\install-junctions.ps1     # dev junction, Zomboid\mods
..\OutcastLib\scripts\stage-workshop.ps1 -Mod OutcastMotors   # upload copy
```

**Both are a second source for the mod id, and a second source makes the client
fail to join ANY multiplayer server.** Single-player never trips it, so it hides
until the first MP test. Clear them before joining:

```powershell
..\OutcastLib\scripts\unstage-all.ps1
```

## Sandbox options

| Option | Default | Effect |
|---|---|---|
| `OutcastMotors.PrepareUninstall` | `false` | Prepares the mod for clean removal from a save |

---

## Why this exists rather than using Project Summer Car

**The reason is operational control, not that Project Summer Car is bad.** It is
good, it works, and it is the reference implementation of this idea.

This runs on a server. That changes what matters:

- **We choose when updates land.** A Workshop mod updates on its author's
  schedule. Every update is a forced server restart, at a time nobody picked,
  possibly mid-session. A mod we own updates when we decide.
- **We are not waiting on anyone.** Project Summer Car's author has stopped
  modding and the page is locked from re-uploads -- 113k subscribers and no
  successor.
- **We are not absorbing other people's decisions.** A third-party UI overhaul,
  a compatibility patch, a rebalance -- each is someone else's judgement call
  arriving as a restart on our server.
- **We can actually maintain it.** Reading a bug report and fixing it beats
  waiting, forking, or working around.

### The technical bonus

- **Its throttle is a constant.** `getThrottle()` returns a hardcoded `0.2`
  because it predates the B42 getter, so its fuel and heat models run on a fixed
  value rather than on what the player is doing.
- **It clobbers instead of chaining.** It assigns `Vehicles.Update.Engine`
  outright, deleting any other mod's handler.
- **It abuses `MaxItemSize`** as a performance scalar -- a real field the engine
  uses for other purposes.
- **It ships 148 item types** where 24 plus item mod data does the same job.

### What owning the schedule implies for our own design

1. **No dependency that updates on someone else's schedule.** We depend on
   OutcastLib, which we control. We coexist with Project Summer Car, Realistic
   Car Physics and Better Car Physics; we do not depend on them.
2. **Pure Lua for the core.** A Java classpath overlay must be rebuilt against
   every game patch touching the classes it shadows, so the core must never need
   one.

A companion **Java physics overlay is planned** -- separately, downstream, and
never as a requirement. It buys what Lua provably cannot reach: real gear
selection driven by the gearbox you bolted in, and tire-pressure grip. It ships
with a build-version guard that **refuses to load on mismatch**, so a stale copy
fails loudly instead of silently reverting the game's own fixes.

## Independent reimplementation, not a copy

Informed by Project Summer Car, TEH Assembly Order, Realistic Car Physics and
Better Car Physics. Own Lua, own item ids, own tag namespace, own art.

**Never copy their models, textures or script files.** Game mechanics and
simulation approaches are ideas; the literal assets are not. That is the clearest
line in this project and the easiest to cross by accident.

---

## Layout

```
Contents/mods/OutcastMotors/42/media/lua/
  shared/OutcastMotors/
    OMO_Slots.lua       THE source of truth -- every slot, item, socket, fluid
    OMO_Config.lua      identity, the kill switch, the logging bridge
    OMO_Debug.lua       the OutcastLib contract, asserted in one place
    OMO_Data.lua        per-vehicle mod data, schema version and migration
    OMO_Compat.lua      three independent reasons to stand down
    OMO_Clock.lua       the timestep chunker -- catching a parked car up
    OMO_Hooks.lua       hook chaining and the per-vehicle fan-out gate
    OMO_Parts.lua       the part capability facade
    OMO_Grade.lua       performance grade and quality family, on an item
    OMO_Mirror.lua      the condition mirror, and crash damage spreading
    OMO_Output.lua      turning the engine bay into engine PERFORMANCE
    OMO_Actions.lua     may this character do this to this part, and if not, why
    OMO_Provider.lua    publishing our parts to whatever wants to draw them
    OMO_Report.lua      say what the engine is doing, without being asked
    OMO_Train.lua       Train Mechanics -- deciding WHAT the queue works through
  server/OutcastMotors/
    OMO_Engine.lua      the per-vehicle engine step
    OMO_Backend.lua     the real parts backend
    OMO_Command.lua     the authority for anything that changes an engine bay
    OMO_Start.lua       the parts that decide whether a car will start at all
    OMO_Charge.lua      belt -> alternator -> battery
    OMO_Cooling.lua     the cooling system, riding a gauge vanilla already built
    OMO_Coolant.lua     the coolant model, including freezing
    OMO_Oil.lua         the oil model
    OMO_ATF.lua         transmission fluid, and the two ways it stops protecting
    OMO_Brakes.lua      brake fluid, and the stop that does not happen
    OMO_Contamination.lua  a head gasket, and two symptoms that never name it
    OMO_Fluids.lua      the fluid tick
    OMO_Heater.lua      the heater core becomes the car's actual heater
    OMO_Populate.lua    put parts into an engine bay that has never had any
    OMO_Distribution.lua  engine parts and fluid vessels in the world's loot
    OMO_Access.lua      who may open the engine bay
    OMO_Guard.lua       run the runtime guards against a real vehicle
    OMO_Restore.lua     putting a vehicle back the way we found it
  client/OutcastMotors/
    OMO_Workshop.lua      the Mechanic Workshop panel
    OMO_WorkshopHook.lua  take over when the player asks for vehicle mechanics
    OMO_PartAction.lua    install, uninstall and repair as a timed action
    OMO_TrainRun.lua      running the Train Mechanics queue
    OMO_TempReadout.lua   engine temperature, in numbers, while driving
    OMO_HoodKey.lua       the use key shuts an open hood
    OMO_Net.lua           the client half of the command round trip
    OMO_IconCheck.lua     do our item icons actually resolve?
  media/scripts/          ALL GENERATED -- never hand-edit

tools/generate-content.lua   OMO_Slots.lua -> the script files; --check fails on drift
scripts/run-tests.ps1        37 suites
scripts/validate-data.ps1    13 checks, each proved by deliberately breaking it
scripts/validate-package.ps1 upload readiness
```

**`OMO_Slots.lua` is the single source of truth.** The files under
`media/scripts/` are generated from it, and validator check 1 fails the build if
they drift. Editing a generated file by hand is a change that survives until the
next generate and then silently vanishes.

## Output

Everything goes to the shared family log:

```
%UserProfile%\Zomboid\Lua\Outcast.log
```

(`~/Zomboid/Lua/Outcast.log` on Linux and macOS.)

The boot line is **ungated**, so an empty log means the mod did not load -- as
distinct from loading and finding nothing to say. Those are different problems
and the log should never conflate them.

## Compatibility

`incompatible=ProjectSummerCar` in mod.info, so the game refuses the combination
up front. That field is only the first line of defence -- it is editable text and
it keys on a mod id, and the Workshop already carries a repackaged PSC fork
(`PSCUiFixID`) shipping a byte-identical engine template.

So `OMO_Compat` adds runtime checks:

1. **Declared identity**, at boot -- the rival we know by name.
2. **Observable capability**, rename-proof -- a fork can change its id, not what
   it does.
3. **Did our template actually land**, off the first Engine update. This is the
   one that matters: a `template vehicle` override is winner-take-all with no
   merge and no error, so a losing override is a silent half-install that looks
   healthy until a player opens a hood and finds nothing there.
4. **Is the Engine part the shape we expect.**

`OMO_Guard` acts on them by refusing to run degraded. A mod that half-runs writes
wrong data into saves; one that declines and says why costs a session.

## Testing

```powershell
.\scripts\run-tests.ps1        # 37 suites
.\scripts\validate-data.ps1    # 13 content checks
.\scripts\validate-package.ps1 # upload readiness
```

**Every validator check has been proved by deliberately breaking it.** A check
nobody has seen fail is not known to work — that rule has caught real defects in
this project more than once, including a guard that passed on an empty read.

---

*Corrected 2026-10-04: vanilla pays Mechanics XP on a successful install or uninstall too, not only on failure; Train Mechanics no longer refuses a car of mastered parts.*
