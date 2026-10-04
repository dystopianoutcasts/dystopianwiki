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

Sources: the installed game's `media/` folder, and our decompile of the Build 42 engine.

This is **reference**, not planning. Outcast Motors' own plan is `12`; the study
of other mods is `01`-`06`.

---

## 1 · The vehicle update hooks

### They are named, therefore chainable, but Java caches them

Vehicle scripts name these hooks as strings, so several mods can wrap the same
hook and chain through each other. But the name is not looked up fresh on every
call. `Vehicles.Update.*`, `Vehicles.CheckEngine.*` and container `test =`
functions are called from Java, which resolves the name once and **caches the
function** (`LuaManager.getFunctionObject`, `luaFunctionMap`). The cache is
emptied every time a Lua file runs for the first time, so while the game is still
loading files a reassignment can still be picked up. Once loading is over, only a
file loading late (a `require` of a file not yet loaded, or a reload) empties it.
So a reassignment after the first call is ignored, and it may suddenly start
working later, at a moment that has nothing to do with your code. Only the hooks
vanilla calls from Lua through `VehicleUtils.callLua`, such as `Vehicles.Use.*`,
are looked up on every call. So chain once, early: from a file in `server/`, or
at `OnGameStart` at the latest, and never reassign later.

> **Proof:** Code. `zombie.Lua.LuaManager#getFunctionObject` (stores successful lookups in `luaFunctionMap`) and `#RunLuaInternal` (`luaFunctionMap.clear()` before each file that has not run yet); `zombie.vehicles.VehicleParts`, `callLuaVoid` and `callLuaBoolean`; `media/lua/server/Vehicles/Vehicles.lua`, `VehicleUtils.callLua`. Build 42.21.0 (revision 4a0e9546ec).

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

`Vehicles.LowerCondition` (`media/lua/server/Vehicles/Vehicles.lua:722`):

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

So writing 0 to the Engine part stops the car starting. Nothing else required:
Java checks the same thing again when the key turns (`BaseVehicle#tryStartEngine`
needs the `Engine` part above 0 condition), and vanilla's radial menu only offers
Start while every part's `checkEngine` hook passes.

Build 42.21 changed two things here.

- **The hook's first argument.** `VehicleParts#isEngineWorking` now calls each
  `checkEngine` hook as `(vehicle, part)`, and that first argument is the car: a
  `BaseVehicle`, or the `VirtualVehicle` stand-in the game uses for a car in an
  area nobody has loaded (see
  [Vehicle Lua hook traps](/pz/build-42/vehicles/reference/vehicle-lua-hook-traps)).
  On 42.20 the first argument was the `VehicleParts` object itself. Vanilla's own
  `Vehicles.CheckEngine.GasTank` now calls `vehicle:hasEnoughGasToRun()` on it, so
  a 42.20 hook that treated its first argument as the parts list needs a look.
- **Fuel.** "No fuel" is now `hasEnoughGasToRun()`: the tank's contents rounded to
  three decimals, compared with zero. A start with an empty tank fails with the
  reason `EngineNotWorking` (it was `OutOfFuel` on 42.20), so the out-of-gas sound
  no longer plays on a failed start; you hear the plain ignition failure. A
  running engine that runs dry still stalls with the out-of-gas sound.

> **Proof:** Code. `zombie.vehicles.VehicleParts#isEngineWorking` (`callLuaBoolean(functionName, this.getOwner(), part)` on 42.21, `(functionName, this, part)` on 42.20); `zombie.vehicles.VehiclePartOwner#hasEnoughGasToRun` (`roundToPrecision(getGasRemaining(), 3) > 0.0`); `zombie.vehicles.VehicleEngine#updateStarting` (`doStartingFailed(EngineNotWorking)` when there is no gas; 42.20 passed `OutOfFuel`), `#shutOff` (stalls when there is no gas); `zombie.vehicles.BaseVehicle#tryStartEngine` and the `StartingFailed` and `Stalling` sound cases; `media/lua/server/Vehicles/Vehicles.lua`, `Vehicles.CheckEngine.GasTank`; `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` (Start offered only when `vehicle:isEngineWorking()`). Build 42.21.0 (revision 4a0e9546ec).

### Crash damage lands on the hood first, the Engine part only after

`BaseVehicle.crash(float delta, boolean front)` (`BaseVehicle.java:4654`) is Java
with **no Lua hook**. A front crash calls `addDamageFront`, which damages the
`EngineDoor` (the hood) first, then the `Engine` part whenever the hood is missing
or below 25 condition. It also damages the windshield and, on 1-in-4 rolls each,
the front doors and front windows.

Running down a zombie, or anyone else on foot, is a different function with its own rule:
`addDamageFrontHitAChr` (`:4711`) also damages the hood first, but touches the
`Engine` part only once the hood is gone or at 0 condition, and then only on a
1-in-4 roll. See
[Vehicle engine numbers mods must know](/pz/build-42/vehicles/reference/vehicle-engine-numbers-mods-must-know).

> **Proof:** Code. `zombie.vehicles.BaseVehicle#crash` (calls `addDamageFront` for a front crash), `#addDamageFront` (damages `EngineDoor`; `Engine` when the hood is missing or under 25 condition; doors and windows on `Rand.Next(4) == 0`), `#addDamageFrontHitAChr` (reached from `#damageFromHitChr` for character hits; `Engine` only when the hood is at 0 or missing and `Rand.NextBool(4)`). Build 42.21.0 (revision 4a0e9546ec).

Sandbox `carDamageOnImpact` scales the delta (modifier 0.9 to 1.9).

**Consequence for any mod deriving engine condition:** an unabsorbed crash is
overwritten on the next update and the damage silently vanishes. Detect it by
comparing against **what your mod last wrote**, not against what your own state
justifies -- see `22-lessons-and-guards.md` §4.

## 3 · Finding vehicles and parts

### `getVehicles()` returns a Set, not a List

`IsoCell.getVehicles()` returns **`Set<BaseVehicle>`** (`IsoCell.java:2739`). It
has `size()` but **no `get(int)`**.

Vanilla's own `ISVehicleBloodUI.lua:80-81` indexes it with `vehicles:get(i-1)`
and therefore cannot ever have worked. It sits in a debug-only blood UI, so
nobody hit it. **"Vanilla does it" is evidence, not proof** -- especially in
debug tooling, which is exactly the code a modder is most likely to crib.

### `getNearVehicle()` filters on VISIBILITY, not just distance

`IsoGameCharacter.java:14114` requires **all four**:

1. the character is not in a vehicle
2. same floor -- `fastfloor(Z)` equal
3. **`vehicle.getTargetAlpha(playerIndex) != 0`**
4. `DistToSquared(vehicle) < 16.0` -- within 4 tiles

Number 3 is a rendering value. `BaseVehicle.java:6444` only runs the branch that
sets it to 1.0 when `square.lighting[playerIndex].bSeen()`, and `:3485` forces it
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

- **`BaseVehicle.flipUpright()`** (`:4076`) is public, has zero callers anywhere,
  and works. It zeroes yaw as well as roll, so preserve heading yourself.
- **`setAngles` silently no-ops on sub-degree changes** (`:4088`), so a per-tick
  lerp stalls near zero.
- **`setWorldTransform` is a no-op for physics on a dedicated server** (`:4056`).

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

### Using a template is a different question: `template =` replaces, `template! =` merges

Overriding a template's definition is the winner-take-all case above. Pulling a
template into a vehicle script is a separate choice, and the one character
matters. `template = X` copies X's parts in and replaces any part with the same id
whole. `template! = X` reads X's body as if it were written inside your vehicle:
the part is found or created, its single values are overwritten one by one, and
its `table` and `container` blocks merge into what is already there. Three blocks
inside a part never merge, even under `template!`: `lua`, `door` and `window` are
built fresh from the block, so the last one read replaces the whole block. `anim`
and `model` blocks are added to the part's list, and `physics` shapes are appended
(up to ten). The full story, and the bug the plain form causes, is in
[Vehicle script traps](/pz/build-42/vehicles/reference/vehicle-script-traps).

> **Proof:** Code. `zombie.scripting.objects.VehicleScript#Load` (`template` calls `LoadTemplate`; `template!` re-runs `Load` on the template's body; `physics` adds a shape while there are fewer than 10), `#LoadPart` (gets or creates the part; `table` and `container` are loaded on top of the existing value; `lua`, `door` and `window` are assigned new objects from `LoadLuaFunctions`, `LoadDoor`, `LoadWindow`). Build 42.21.0 (revision 4a0e9546ec).

## 7 · Mechanics XP and the anti-grind flag

Installing or uninstalling records a per-item-per-vehicle key
(`Vehicles.lua:1413`, `:1443`):

```lua
chr:addMechanicsItem(item:getID() .. vehicle:getMechanicalID() .. "1", part, timeMillis)
```

A successful install records the key ending `"1"`; a successful uninstall records
the key ending `"0"`. `addMechanicsItem` pays XP only when the key is new, so
repeating the same job on the same part of the same car awards **no XP** while
the key exists. It **expires one in-game day after its last use**: the timestamp
is the game calendar's clock, and `IsoPlayer.updateMechanicsItems` removes entries
older than `86400000L` milliseconds of game time. But `addMechanicsItem` writes a
fresh timestamp on **every** call, paid or not, so each repeat of the same job
pushes the expiry another day out. Install and uninstall the same part over and
over and it stays at zero XP for as long as you keep going; it only pays again
after a full in-game day without touching that part on that car.

On success, XP comes from the Mechanics level in the part's **uninstall** table
`skills`, doubled: level 6 and up pays 6 to 13, level 4 and up 6 to 9, level 2
and up 4 to 7, below that 4 (one time in three) or 2. A part with no Mechanics
skill listed pays 1. A failed attempt pays 1 XP through `addXp`, every time.
Repairing pays separately: `FixingManager` grants 3 to 5 XP per listed skill on a
successful fix.

> **Proof:** Code. `zombie.characters.IsoPlayer#addMechanicsItem` (XP only when the key is absent; `mechanicsItem.put(..., milli)` after the check, on every call) and `#updateMechanicsItems`; `media/lua/shared/Vehicles/TimedActions/ISInstallVehiclePart.lua` and `ISUninstallVehiclePart.lua`, `complete()`; `zombie.inventory.FixingManager#addXp`. Build 42.21.0 (revision 4a0e9546ec).

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

*Re-checked 2026-10-04 for Build 42.21: line numbers updated; the code claims we re-checked still hold.*

*Updated 2026-10-04: the XP key's day restarts on every use; the crash paragraph no longer mixes in the rule for hitting a zombie; the hook cache is emptied whenever a Lua file loads for the first time; `template!` merges a part except its `lua`, `door` and `window` blocks; the 42.21 `checkEngine` first argument and the empty-tank start failure.*
