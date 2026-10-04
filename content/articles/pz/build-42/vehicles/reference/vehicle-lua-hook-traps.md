---
id: build-42-vehicle-lua-hook-traps
slug: vehicle-lua-hook-traps
title: Vehicle Lua hook traps
game: pz
version: build-42
section: vehicles
category: reference
difficulty: advanced
tags:
  - vehicles
  - hooks
  - lua
  - condition
  - silent-failure
excerpt: >-
  When the game remembers your hook and when it looks it up again, why the use
  key cannot close a hood, the stand-in vehicle that has no modData, and why
  slow wear written as fractions never lands. Checked against the 42.21 code.
last_updated: '2026-10-04'
related_articles:
  - vehicle-engine-reference
  - vehicle-script-traps
  - vehicle-engine-numbers-mods-must-know
  - what-runs-on-the-server-in-build-42-multiplayer
---
# Vehicle Lua hook traps

Outcast, if you chain `Vehicles.Update.*` or patch a `Vehicles.Use.*` handler, read this before your first drive test. These are the hook behaviours that cost us whole test sessions, each one read again in the code. The basics of chaining are in the [vehicle engine reference](/pz/build-42/vehicles/reference/vehicle-engine-reference), section 1.

## When the game remembers your hook, and when it does not

Hooks that **Java** calls (`update`, `create`, `init`, `checkEngine`, `checkOperate`, container access tests, install and uninstall tests) are looked up by name through `LuaManager.getFunctionObject`, which keeps a cache:

- A **successful** lookup is stored. The next call uses the stored function and does not look at your table again.
- A **failed** lookup logs `no such function`, returns nothing, and stores nothing. So a name defined late still resolves later.
- The whole cache is emptied whenever the game runs a Lua file it has not run before: at startup, at world load, on a `require` of a new file, and when a file is reloaded from the debugger.

So reassigning a hook after it has been called once is ignored, at least until some new Lua file happens to load and flush the cache. "Works after a reload, not before" is the signature. Do not rely on either behaviour: build your chain once, early (from a `server/` file at load, or at `OnGameStart` at the latest), and never swap functions later.

> **Proof:** Code. `zombie.Lua.LuaManager#getFunctionObject` (`luaFunctionMap.put` only when a function was found; `no such function` otherwise) and `#RunLuaInternal` (clears `luaFunctionMap` when it compiles a file not loaded before); callers `zombie.vehicles.VehicleParts#callLuaVoid` and `#callLuaBoolean`, `zombie.vehicles.VehiclePart#callLuaVoid`, `zombie.vehicles.BaseVehicle#callLuaVoid` and `#callLuaBoolean`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Use handlers are looked up every time, but load late

The `use` handler of a part (what the interact key does at a hood, trunk or door) is different. Java only checks that the part names one. Vanilla calls it from Lua, through `VehicleUtils.callLua`, which walks `_G` to the function on every call:

```lua
local t = _G
for i=1,#ss-1 do t = t[ss[i]] end
local func = t[ss[#ss]]
return func(arg1, arg2, arg3, arg4)
```

So a later reassignment of `Vehicles.Use.X` does take effect. Our own notes said the opposite for weeks; the cache above applies only to hooks Java calls.

What still bites is **when** you patch. `Vehicles.lua` lives in `media/lua/server/`, which loads when a world loads, after every `shared/` and `client/` file has already run. And it starts with `Vehicles.Use = {}`. A patch made at file scope in `client/` or `shared/` either indexes a table that does not exist yet, or is wiped when `Vehicles.lua` runs. Patch at `OnGameStart` (and `OnServerStarted` for a dedicated server), and make the patch safe to run twice, since a debugger reload runs your file again.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#getUseablePart` (only checks `part.getLuaFunction("use")` is not empty; no Java code calls the use function); `media/lua/server/Vehicles/Vehicles.lua`: `Vehicles.Use = {}`, `VehicleUtils.callLua`, `VehicleUtils.OnUseVehicle`; `media/lua/client/ISUI/ISButtonPrompt.lua`, `cmdUseVehicle`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### The use key opens a hood and never closes it

`Vehicles.Use.EngineDoor` has no branch that shuts an open hood. With the hood open, the key only opens or closes the mechanics window. The trunk handlers right below it do close. A controller is different: the button prompt shows "Close Hood" for an open hood and closes it. So on a keyboard the hood is the one door the use key cannot shut, and with a gamepad it can. If your mod changes hood behaviour, test both.

> **Proof:** Code. `media/lua/server/Vehicles/Vehicles.lua`, `Vehicles.Use.EngineDoor` (no `ISCloseVehicleDoor`); `media/lua/client/ISUI/ISButtonPrompt.lua` (`IGUI_CloseHood` label with `cmdCloseVehicleDoor`, which calls `ISVehicleMenu.onCloseDoor`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The vehicle in your update hook may not be a vehicle

The first argument your `Vehicles.Update.*` function receives is whatever currently holds the car's parts, and there are two kinds:

- `BaseVehicle`, the car you know.
- `VirtualVehicle`, a stand-in the game uses for a car in a part of the map nobody has loaded, so that alarms, sirens and running engines carry on off-screen. When a cell unloads, the stand-in **takes over the same parts object** from the real car, so your update hook keeps being called for that car, with a different first argument. No event tells you.

`VirtualVehicle` has **no `getModData()`** (and no `getMechanicalID()`). Any hook that reaches into the car's modData throws on it. It does have `getId`, `getSqlId`, `getParts`, `getPartById`, `getScript`, `getScriptName`, the engine getters (`getEngineQuality`, `isEngineRunning` and others) and even `setEngineFeature`. Its `transmit...` and `updatePartStats` methods do nothing.

What cost us a full test session: our hook threw on a stand-in, our safety code switched the hook off for the rest of the session, and every car opened after that showed an empty engine bay. One unloaded car disabled the mod for the whole world.

How to guard it:

```lua
local function hasModData(vehicle)
    return type(vehicle.getModData) == "function"
end
```

Test the shape at the top of your hook, not the class name (Lua cannot use `instanceof`, and a third kind of owner in a later build would break a name list). And keep "skip this one" separate from "something is broken": a skipped stand-in is normal and must never switch your mod off.

> **Proof:** Code. `zombie.vehicles.VehicleParts` (holds a `VehiclePartOwner`; `#updatePart` passes `this.getOwner()` to the Lua hook); `zombie.vehicles.VirtualVehicle` (implements `VehiclePartOwner`; `#set` does `this.parts = vehicle.getParts(); this.parts.setOwner(this)`; no `getModData`; `#update` runs `getParts().update()`), exposed to Lua in `zombie.Lua.LuaManager`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Condition is a whole number: bank the remainder

A part's and an item's condition is an integer. `getCondition()` returns one and `setCondition()` takes one. When Lua passes a number with a fraction, the game cuts the fraction off (it does not round). So a slow-wear model that writes a fraction every tick goes wrong one of two ways:

- If you round yourself, for example `setCondition(math.floor(before - amount + 0.5))`, any `amount` under 0.5 rounds back to `before`. **It never changes anything, however many ticks pass.** We measured it: 500 calls at 0.06 per minute reported 30 points of damage and left the part on 100. Our oil-starvation damage shipped like that, and the server log was full of lines reporting damage that never happened.
- If you pass the raw value, `setCondition(before - 0.06)` becomes `before - 1`. Every tick costs a whole point, about 16 times harsher than your numbers say.

Realistic wear rates are fractions of a point per game minute, and updates come about once a minute, so every slow-wear mod (cars, tools, clothing) hits this. **Keep the fraction yourself.** Store the owed damage per part, apply whole points only when it reaches one, and return what you actually removed, so your log lines describe what happened rather than what you asked for.

```lua
local owed = (data.owed or 0) + amount
local whole = math.floor(owed)
if whole >= 1 then
    part:setCondition(part:getCondition() - whole)
    owed = owed - whole
end
data.owed = owed
return whole
```

> **Proof:** Code. `zombie.inventory.InventoryItem#getCondition` and `#setCondition(int)`; `zombie.vehicles.VehiclePart#getCondition` and `#setCondition(int)`; `zombie.Lua.KahluaNumberConverter` (a Lua number becomes an `int` through `Double#intValue`, which drops the fraction). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Game test. 500 calls of a 0.06-per-minute wear function left a part on condition 100 while reporting 30 points of damage. Build 42.20.

Why no test caught it: our tests checked the wear-rate function and never that a condition fell. Test the contract in the units callers really use, fractions, over many calls.
