---
id: build-42-vehicle-engine-reference
slug: vehicle-engine-reference
title: Vehicle engine reference
game: pz
version: build-42
section: vehicles
category: reference
difficulty: advanced
tags:
  - vehicle-engine
  - update-hooks
  - vehicles-lua
  - engine-reference
excerpt: >-
  Read this before writing any Outcast vehicle mod. Every entry was read out of
  the shipped game or the Build 42 decompile and, where possible, confirmed in
  game. Citations are given so you can...
last_updated: '2026-10-04'
---
# Vehicle engine reference

> Source: 20-vehicle-engine-reference.md (compiled 2026-09-01, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Read this before writing any Outcast vehicle mod.** Every entry was read out of
the shipped game or the Build 42 decompile and, where possible, confirmed in
game. Citations are given so you can re-check rather than trust.

Sources: `R:\Games\Steam\steamapps\common\ProjectZomboid\media\`, decompile at
`R:\ZOMBOID\PZ_Engine_Records\B42\src`.

This is **reference**, not planning. Outcast Motors' own plan is `12`; the study
of other mods is `01`-`06`.

---

## 1 · The vehicle update hooks

### They are named, therefore chainable, but Java caches them

Vehicle scripts name these hooks as strings, so several mods can wrap the same
hook and chain through each other. But the name is not looked up fresh on every
call. `Vehicles.Update.*`, `Vehicles.CheckEngine.*` and container `test =`
functions are called from Java, which resolves the name once and **caches the
function** (`LuaManager.getFunctionObject`, `luaFunctionMap`). A reassignment
after the first call is silently ignored. Only the hooks vanilla calls from Lua
through `VehicleUtils.callLua`, such as `Vehicles.Use.*`, are looked up on every
call. So chain once, early: from a file in `server/`, or at `OnGameStart` at the
latest, and never reassign later.

> **Proof:** Code. `zombie.Lua.LuaManager#getFunctionObject` (stores successful lookups in `luaFunctionMap`); `zombie.vehicles.VehicleParts`, `callLuaVoid` and `callLuaBoolean`; `media/lua/server/Vehicles/Vehicles.lua`, `VehicleUtils.callLua`. Build 42.20 (revision a2947723ca).

```lua
local previous = Vehicles.Update.Engine
Vehicles.Update.Engine = function(vehicle, part, elapsedMinutes)
    -- ours
    return previous(vehicle, part, elapsedMinutes)   -- ALWAYS call through
end
```

**`template vehicle` overrides are the opposite** -- whole-part replacement,
resolved once at load, last loaded wins outright. No merge, no chaining. See §6.

### Which hooks fire how often

Measured in game, not assumed. Milestone A, 263 s of driving:

| Hook | Calls | Distinct parts | Per-vehicle |
|---|---|---|---|
| Engine | 42 | 1 | n/a |
| Muffler | 42 | 1 | n/a |
| Suspension | 165 | 4 | 41 |
| Brakes | 168 | 4 | 42 |
| Tire | 168 | 4 | 42 |

**Brakes, Suspension and Tire fire once per WHEEL.** Per-vehicle work on those
hooks runs four times unless gated. Do not hardcode `part:getId() == "BrakeFrontLeft"`
-- bikes and trailers differ. Elect an anchor: record the first part id seen per
`(vehicleId, hookName)` and act only on it, with staleness re-election in case
that part is removed.

Cadence is roughly **0.25-0.27 vehicle-updates per second**, and `elapsedMinutes`
is about 1.0 per call.

### A parked car stops updating entirely

`Vehicles.Update.Engine` ends with:

```lua
if partData.temperature <= 0 and not vehicle:isEngineRunning()
        and not vehicle:getDriver() then
    vehicle:setNeedPartsUpdate(false)
end
```

So a **cold, parked, driverless car receives no part updates at all.** Sensible
for vanilla, where nothing about a parked car changes. A trap for any mod whose
state can change while parked -- a player can walk up and remove a part.

Anything that changes a vehicle's parts must call `vehicle:setNeedPartsUpdate(true)`
afterwards, or the symptom is intermittent and depends on whether the engine
happened to be warm.

### What Update.Engine actually does

**Only `partData.temperature`.** It never touches condition. So a mod writing
engine condition is uncontested, even though a chained handler runs before
vanilla's.

## 2 · Condition and wear

### Wear is a dice roll, so "condition did not drop" proves nothing

`Vehicles.LowerCondition` (`media/lua/server/Vehicles/Vehicles.lua:724`):

```lua
if vehicle:isEngineRunning() and vehicle:getCurrentSpeedKmHour() > 10 and part:getInventoryItem() then
    local chance = item:getConditionLowerNormal() * Vehicles.newSystemConditionLowerMult  -- x4
    chance = chance + (speed / 200) + math.abs(steering / 2)
    if part:getCondition() > 0 and ZombRandFloat(0, 100) < chance then
        part:setCondition(part:getCondition() - 1)
```

`NormalSuspension1` ships `ConditionLowerStandard = 0.03`, so straight-line at
60 km/h the chance is `0.12 + 0.30 = 0.42%` per call. Across four parts and ~63
calls each, **all four staying untouched is about a 35% outcome with everything
working correctly.**

**Note the naming asymmetry:** the script key is `ConditionLowerStandard`; the
Lua getter is `getConditionLowerNormal()`.

**Callers:** `Update.Suspension` and `Update.Muffler` call it unconditionally.
`Update.Tire` calls it behind its own engine-and-speed gate. **`Update.Brakes`
never calls it** -- it decrements condition inline on its own roll.

### Whether a car starts

`Vehicles.CheckEngine.Engine` is literally:

```lua
return part:getCondition() > 0
```

So writing 0 to the Engine part stops the car starting. Nothing else required.

### Crash damage lands on the hood first, the Engine part only after

`BaseVehicle.crash(float delta, boolean front)` (`BaseVehicle.java:4611`) is Java
with **no Lua hook**. It calls `addDamageFront`, and
`addDamageFrontHitAChr` (`:4668`) damages the `EngineDoor` first, then the
`Engine` part -- but only once the hood is destroyed, and only on a 1-in-4 roll.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#addDamageFront` (damages `EngineDoor`; `Engine` only when the hood is missing or under 25 condition). Build 42.20 (revision a2947723ca).

Sandbox `carDamageOnImpact` scales the delta (modifier 0.9 to 1.9).

**Consequence for any mod deriving engine condition:** an unabsorbed crash is
overwritten on the next update and the damage silently vanishes. Detect it by
comparing against **what your mod last wrote**, not against what your own state
justifies -- see `22-lessons-and-guards.md` §4.

## 3 · Finding vehicles and parts

### `getVehicles()` returns a Set, not a List

`IsoCell.getVehicles()` returns **`Set<BaseVehicle>`** (`IsoCell.java:2728`). It
has `size()` but **no `get(int)`**.

Vanilla's own `ISVehicleBloodUI.lua:80-81` indexes it with `vehicles:get(i-1)`
and therefore cannot ever have worked. It sits in a debug-only blood UI, so
nobody hit it. **"Vanilla does it" is evidence, not proof** -- especially in
debug tooling, which is exactly the code a modder is most likely to crib.

### `getNearVehicle()` filters on VISIBILITY, not just distance

`IsoGameCharacter.java:14072` requires **all four**:

1. the character is not in a vehicle
2. same floor -- `fastfloor(Z)` equal
3. **`vehicle.getTargetAlpha(playerIndex) != 0`**
4. `DistToSquared(vehicle) < 16.0` -- within 4 tiles

Number 3 is a rendering value. `BaseVehicle.java:6401` only runs the branch that
sets it to 1.0 when `square.lighting[playerIndex].bSeen()`, and `:3442` forces it
to 0 while `couldSeeIntersectedSquare` is false.

**So immediately after a save loads, a car two tiles in front of the player is
invisible to this call until they have looked at it.** Observed in game: standing
in the hood box on load returned nil; walking away, turning round and returning
worked at 2.5 tiles.

Any "act on the car I am standing at" feature that relies on this alone will fail
intermittently on load and look broken. Prefer taking the vehicle from whatever
interaction triggered the feature.

## 4 · Doors, hoods and animation

`VehicleDoor` (`zombie/vehicles/VehicleDoor.java`) carries exactly three fields:

```java
protected boolean open;
protected boolean locked;
protected boolean lockBroken;
```

**No angle, no delta.** Contrast `VehicleWindow`, which has `float openDelta`
because windows genuinely slide.

`anim Open` / `anim Close` in vanilla vehicle scripts carry **only a sound**. The
`anim ActorOpen` / `ActorClose` blocks animate the *character*, not the car. So
**vanilla has no hood-open visual at all.**

**The state persists.** `VehicleDoor.save()` writes all three booleans and
`load()` reads them back (`:56-66`), so cars really do come back from a save with
their hoods up.

**B42 can animate parts; vanilla just never authored the assets.**
`VehicleScript.java:837-856` parses `angle`, `anim`, `animate`, `loop`,
`reverse`, `rate`, `offset`, `sound` on a part's anim block; `ModelScript.java:101`
parses `boneWeight`; a `part` can carry its own `model` block
(`VehicleScript.java:776`, `:974`). Full mechanism in `17-vehicle-animation-reference.md`.

Other dead-but-callable API worth knowing:

- **`BaseVehicle.flipUpright()`** (`:4033`) is public, has zero callers anywhere,
  and works. It zeroes yaw as well as roll, so preserve heading yourself.
- **`setAngles` silently no-ops on sub-degree changes** (`:4045`), so a per-tick
  lerp stalls near zero.
- **`setWorldTransform` is a no-op for physics on a dedicated server** (`:4013`).

## 5 · Vehicle part categories

`part:getCategory()`, declared per part in the vehicle scripts. Counts across all
vanilla vehicle scripts:

| Category | Declarations |
|---|---|
| engine | 42 |
| **nodisplay** | **39** |
| bodywork | 11 |
| door | 2 |
| tire / suspension / seat / gastank / brakes / lights | 1 each |

**`nodisplay` hides a part from the mechanics UI entirely, and vanilla uses it
more than any other category except engine.** Hiding is established practice, not
a hack.

## 6 · The winner-take-all override

`template vehicle X` replaces the **entire part definition**. Resolved once at
load; last loaded wins. No merge and none of the late binding §1 describes.

Two mods adding a container to `template vehicle Engine` cannot coexist -- one
silently loses, with no error. Project Summer Car and Outcast Motors both do
this, which is why they declare each other incompatible.

**A runtime self-check is mandatory**, because `incompatible=` in mod.info only
covers rivals you knew about when you shipped. Resolve a real part at runtime and
confirm your own addition is present; if not, stand down with a named message
rather than nil-indexing for the rest of the session.

## 7 · Mechanics XP and the anti-grind flag

Installing or uninstalling records a per-item-per-vehicle key
(`Vehicles.lua:1415`, `:1445`):

```lua
chr:addMechanicsItem(item:getID() .. vehicle:getMechanicalID() .. "1", part, timeMillis)
```

A successful install records the key ending `"1"`; a successful uninstall records
the key ending `"0"`. `addMechanicsItem` pays XP only when the key is new, so
repeating the same job on the same part of the same car awards **no XP** while
the key exists. It **expires after one in-game day**: the timestamp is the game
calendar's clock, and `IsoPlayer.updateMechanicsItems` removes entries older than
`86400000L` milliseconds of game time.

On success, XP comes from the Mechanics level in the part's **uninstall** table
`skills`, doubled: level 6 and up pays 6 to 13, level 4 and up 6 to 9, level 2
and up 4 to 7, below that 4 (one time in three) or 2. A part with no Mechanics
skill listed pays 1. A failed attempt pays 1 XP through `addXp`, every time.
Repairing pays separately: `FixingManager` grants 3 to 5 XP per listed skill on a
successful fix.

> **Proof:** Code. `zombie.characters.IsoPlayer#addMechanicsItem` and `#updateMechanicsItems`; `media/lua/shared/Vehicles/TimedActions/ISInstallVehiclePart.lua` and `ISUninstallVehiclePart.lua`, `complete()`; `zombie.inventory.FixingManager#addXp`. Build 42.20 (revision a2947723ca).

**Any mod adding installable parts must respect this flag**, or it multiplies the
grind surface. Nineteen engine parts is nineteen times vanilla's.

## 8 · Tool and skill gating already in vanilla

Do not rebuild it; duplicating creates two systems that can disagree.

| Gate | Where |
|---|---|
| `Base.Jack` for tyres and suspension | `template_tire.txt:61`, `template_suspension.txt:68` |
| `base:lugwrench` | `template_tire.txt` |
| `base:wrench` (16 tables), `base:screwdriver` (18) | across templates |
| `requireInstalled` -- a tyre needs its brake and suspension fitted | `template_tire.txt` |
| Mechanics level, via `getEngineRepairLevel()` | `ISVehicleMechanics.lua:325` |
| `mechanicRequireKey` | `template_engine.txt` |
| `mechanicArea` / `area` -- where the character must stand | every template |

**What vanilla does NOT gate: information.** See `21-vehicle-ui-reference.md` §2.

## 9 · Reflection is closed

Lua reflection has been gated behind `-debug` since 42.15, after a March 2026
sandbox-escape incident. `LuaManager.validateReflectionAccess()` throws
`"Not in debug"`. It was never changelogged.

Do not design around reflection. Where a value looks unreachable, check for a
direct getter first -- TIS added `getThrottle()` for exactly this reason.

---

*Corrected 2026-10-04: the XP key expires after one in-game day, not 24 real-time hours; success XP is 2 to 13 (the uninstall skill level doubled), failure pays 1.*

*Corrected 2026-10-04: hooks called from Java (update, checkEngine, test) are cached on first use, so a later reassignment is ignored; chain once, early.*

*Corrected 2026-10-04: the section 2 crash heading now says the hood takes the damage first, as its body always did.*
