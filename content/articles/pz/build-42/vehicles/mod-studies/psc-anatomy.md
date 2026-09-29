---
id: build-42-psc-anatomy
slug: psc-anatomy
title: Project Summer Car -- architecture
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: intermediate
tags:
  - vehicles
  - project-summer-car
  - mod-study
  - template-vehicle
excerpt: >-
  Source:
  R:\Games\Steam\steamapps\workshop\content\108600\3564950449\mods\Project
  Summer Car\42.15\
last_updated: '2026-09-29'
---
# Project Summer Car -- architecture

> Source: 01-project-summer-car-anatomy.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Source: `R:\Games\Steam\steamapps\workshop\content\108600\3564950449\mods\Project Summer Car\42.15\`

~9,000 lines across Lua + script files. 345 files total including 25 FBX world
models and 7 language packs.

## The central trick: the Engine part becomes a container

This is the whole design in one file. `media/scripts/vehicles/template_engine.txt`:

```
template vehicle Engine
{
    part Engine
    {
        mechanicArea = Engine,
        durability = 10,
        lua
        {
            create      = Vehicles.Create.Engine,
            update      = Vehicles.Update.Engine,
            checkEngine = Vehicles.CheckEngine.Engine,
        }
        container
        {
            capacity = 100,
            conditionAffectsCapacity = false,
            test = Vehicles.NeverAccessEngine,
        }
    }
}
```

Vanilla's `Engine` vehicle part is a single opaque object with one condition
number. PSC gives it an **item container** and stuffs 19 inventory items inside
it. Every "engine part" is a real `InventoryItem` with its own condition, its own
mod data, its own fluid container, and its own world model.

`Vehicles.NeverAccessEngine` (`lua/server/Project_Summer_Car_Server.lua:55`)
returns false for normal players, so the container is invisible to the standard
inventory UI. The only door into it is the mod's own `ISEngineMechanics` panel.

Because it rides on the vanilla template system, it applies to **every vehicle
from every mod** with no per-vehicle patching -- that's why KI5, Filibuster and
Autotsar cars all just work.

## The engine condition mirror

`UpdateEngineCondition()` (`Project_Summer_Car_Server.lua:64`) is the bridge back
to vanilla. Every tick it:

1. Detects that the vanilla `Engine` part's condition **dropped** (a crash), and
   spreads that damage across `EngineImpactDamageCount` (default 4) randomly
   chosen items inside the container, at `damage * EngineImpactDamage * rand(0.5..1.0)`.
2. Scans for items tagged `EngineCritical`, takes the **minimum** condition of
   them, and writes it back onto the vanilla `Engine` part.
3. If fewer than 5 critical parts are present, forces engine condition to 0.

So the vanilla number every other mod reads is a *derived* value: "your engine is
as good as its worst critical component." Elegant -- no other mod needs to know
PSC exists.

The 5 `EngineCritical` parts are Sparkplug, Crankshaft, CylinderHead, Pistons,
Flywheel (`media/registries.lua:18-24`, tags applied in the item scripts).

## Random stalling

`Vehicles.CheckEngine.Engine` (`:119`) is overwritten so that 1 tick in 60 the
engine must beat `ZombRand(10) * ZombRand(10) * 0.1` instead of just being >0.
A 30%-condition engine will randomly cut out; a 90% one basically never does.

## Timestep chunking

`Vehicles.Update.Engine` (`:169`) refuses to run the sim with a huge
`elapsedMinutes`. It loops in 10-minute slices:

```lua
while elapsedMinutes > 10 do
    EngineUpdateInternal(vehicle, part, 10)
    elapsedMinutes = elapsedMinutes - 10
end
```

Necessary because thermal + oil-contamination integration is non-linear and
would explode when a car is reloaded after days of unsimulated time. Worth
stealing for any Outcast mod that integrates state over `elapsedMinutes`.

## Tagging system

`media/registries.lua` registers 20 `ItemTag`s under a `ProjectSummerCar:`
namespace. Two categories:

- **Identity tags** -- `EngineSparkplug`, `EngineRadiator`, etc. One per slot.
  Lookup is `part:getItemContainer():getFirstTag(tag)` -- O(1)-ish and avoids
  string comparison of item types.
- **Behavior tags** -- `EngineCritical` (feeds the condition mirror),
  `EnginePartNoRepair` (head gasket, fan belt -- must be crafted new),
  `EnginePartElectrical` (unlocks electrical failure modes),
  `EnginePartBearing`, `EnginePartFluid`, `EnginePartInitMarker`.

`EnginePartInitMarker` is a sentinel item added to the container so the mod knows
a given vehicle has already been populated (`Project_Summer_Part_Spawning.lua:222`).
That is how it achieves **mid-save compatibility** -- any engine lacking the
marker gets parts generated on first load. The marker is explicitly excluded from
impact damage and condition math.

## File map

| File | LOC | Role |
|------|-----|------|
| `client/Engine_Menu.lua` | 1502 | The `ISEngineMechanics` panel -- part list, tooltips, install/remove/fluid context menus |
| `client/Project_Dashboard.lua` | 926 | Custom drivable dashboard (V key) |
| `client/Project_Dashboard_Data.lua` | 297 | Per-vehicle gauge layout data |
| `client/Project_Dashboard_Vanilla.lua` | 210 | Fallback dash for unmapped vehicles |
| `client/Project_Summer_Car.lua` | 181 | Client bootstrap, keybinds |
| `server/Project_Summer_Car_Server.lua` | 926 | **The simulation.** Engine, battery, fuel, heater, cabin temp |
| `server/Project_Summer_Part_Spawning.lua` | 394 | World generation of parts + car condition takeover |
| `shared/Engine_Part_Repair.lua` | 432 | Failure-mode / repair-method system |
| `shared/ISInstallEnginePart.lua` | 146 | Timed action, skill check, failure damage |
| `shared/ISUninstallEnginePart.lua` | 101 | Removal timed action |
| `shared/ISTransferEngineFluid.lua` | 168 | Pouring oil/coolant/ATF |
| `shared/ISRepairEnginePart.lua` | 67 | Repair timed action wrapper |

## Multiplayer design

- All simulation is server-authoritative -- `EngineUpdateInternal` early-returns
  `if isClient()`.
- Fluid state can't ride the normal part-moddata sync, so PSC has a bespoke
  packet: `SendFluidSyncPacket()` (`:186`) serializes the fluid array of a part
  and sends `ProjectSummerCar / UpdateFluid`.
- Temperature is throttled: only transmitted when it moved by >2 units **and**
  at least 2 accumulated minutes have passed (`:474`).
- `setNeedPartsUpdate(false)` is called once the engine cools to ambient and
  nobody's driving -- the sim switches itself off to save CPU (`:479`).

## A notable scar in the code

```lua
function getThrottle(vehicle)
  return 0.2;
end
--[[ -- Reflection no longer allowed due to fun police.
```
(`Project_Summer_Car_Server.lua:12`)

PSC used to read `BaseVehicle.throttle` via Java reflection. TIS closed that off,
so throttle is now hardcoded to 0.2 and the mod recommends **Starlit Library** as
the sanctioned way to get the real value. Everything downstream (fuel burn,
engine heating) is therefore running on a constant, not real player input,
unless Starlit is installed. Good cautionary tale about depending on reflection.
