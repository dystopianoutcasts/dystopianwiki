---
id: build-42-modding-fire-water-and-power
slug: modding-fire-water-and-power
title: 'Modding fire, water and power'
game: pz
version: build-42
section: engine
category: fire-water-and-power
difficulty: intermediate
tags:
  - engine
  - modding
  - fire
  - water
  - electricity
  - multiplayer
  - lua
excerpt: >-
  How a mod starts and stops fire, reads and changes water and power, adds a fuel or a generator, which side must act in multiplayer, and one small working mod you can run.
last_updated: '2026-11-14'
related_articles:
  - how-fire-works
  - fighting-fire
  - water-and-plumbing
  - electricity-and-generators
  - fire-water-and-power-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders new to the engine](#a-small-working-mod-fire-watch) | [modders who know Lua](#what-a-mod-can-reach) | [server owners](#which-side-must-act-in-multiplayer)

:::callout[The 1-minute version]{kind=key}
- Lua can start and stop fires, set a character on fire, burn a square, read and set generator fuel and condition, and read or add water on a fixture or barrel. Lua cannot change the numbers inside the formulas (spread chances, rain rate, draws), and a fire's energy has no setter.
- Only the server (or single player) can start a wild fire. On a multiplayer client, the five-argument call logs a warning and does nothing, and the four-argument call does nothing at all, so a client mod asks the server with `sendClientCommand`.
- Always call the old function when you wrap a vanilla action such as `ISFixGenerator.complete`, and check who is asking in any server command that starts a fire.
- A powered object of your own that is not one the generator already counts draws no fuel and is not counted; the cost needs Java.
- The Fire Watch example mod near the end takes about ten minutes to build and run, but it was not run in a game for this draft.
:::

:::facts
- **New fire** `IsoFireManager.StartFire(getCell(), square, true, 100, 600)`
- **Fire life** `0` lets the engine roll 800 to 2,999 ticks
- **Generator fuel** liters, clamped to 0 to 10
- **Generator condition** 0 to 100
- **Water shutoff test** `getSandboxOptions():getWaterShutModifier()` against `getGameTime():getWorldAgeDaysSinceBegin()`
:::

You have read how fire spreads, how the taps stop and how a generator decides what to power. This page is for the next step: making a mod do something about it. It starts with what you are allowed to touch, then gives the calls, then one small mod you can build and run in about ten minutes.

If the words "client", "server" and "event" are new, read [The events system](/pz/build-42/modding/lua-api/the-events-system) and [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns) first. The mod folder layout is in [The versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders).

## What a mod can reach

Lua can start and stop fires, read and set many fire and generator values, and add or remove water, but it cannot change the numbers inside the formulas.

The engine records sort every method into tiers (see the generated index, `api/api.jsonl`). In plain words:

| You want to | Can Lua do it? | How |
|---|---|---|
| Start a fire, or smoke | Yes | `IsoFireManager.StartFire`, `StartSmoke` |
| Stop a fire | Yes | `square:stopFire()`, the global `stopFire(obj)` |
| Set a character on fire, or put them out | Yes | `SetOnFire()`, `StopBurning()` |
| Burn a square down without a fire | Yes | `square:Burn()` |
| Read a fire's life, energy, light, stage | Yes | `getLife()`, `getEnergy()`, `getLightRadius()`, `isPermanent()` |
| Change a fire's life, light or spread delay | Yes | `setLife`, `setLightRadius`, `setSpreadDelay`, `setLifeStage` |
| Change a fire's **energy** | **No setter** | See "What needs Java" |
| Read the grid state | Yes | `getWorld():isHydroPowerOn()`, `getSandboxOptions():doesPowerGridExist()` |
| Read or set a generator's fuel, condition, state | Yes | `IsoGenerator` methods |
| Read water on a fixture or barrel | Yes | `hasWater`, `getFluidAmount`, `isTaintedWater` |
| Add or remove water | Yes | `addFluid`, `useFluid`, `emptyFluid` |
| Change the numbers in the formulas (spread chances, rain rate, draws) | **No** | Java |

The exposed members are listed in `api/lua_exposed.jsonl`, for the classes `IsoFireManager`, `IsoFire`, `IsoGenerator`, `IsoLightSwitch`, `IsoObject`, `IsoGridSquare`, `IsoGameCharacter`, `SandboxOptions`, `GameTime` and `IsoWorld`.

## Fire

A mod starts a fire with one call on the server, stops it with `stopFire`, and can read and nudge a fire object's life, light and spread delay.

### Starting a fire

```lua
-- Start a wild fire. energy and life are numbers you choose.
IsoFireManager.StartFire(getCell(), square, true, 100, 600)
```

| Argument | Meaning |
|---|---|
| `getCell()` | The world cell |
| `square` | The square to burn |
| `true` | "Ignite on any": ignore the burnt-out flag, so a burnt square can burn again |
| `100` | Energy: how much spreading the fire can pay for. The floor's own requirement is taken off first, down to a minimum of 5 |
| `600` | Life in fire ticks. Use `0` (or leave the argument out, with the four-argument form) to let the engine roll 800 to 2,999 |

The call is defined in the fire manager :cite[(`zombie/iso/objects/IsoFireManager.java:193-235`, `:265-269`)]. It checks `CanAddFire` itself, so it silently does nothing on water, on an empty square, on a square that is already burning, in a safehouse where fire is off, or anywhere the server option `NoFire` is on :cite[(`IsoFire.java:273-291`)]. You can test first with `IsoFire.CanAddFire(square, true)`.

**Which side.** Only the server (or single player) can start a wild fire. On a multiplayer client, the five-argument call logs a warning and does nothing, and the four-argument call does nothing at all :cite[(`IsoFireManager.java:204-205`, `:265-269`)]. To start a fire from a client mod, ask the server (see the multiplayer section).

**Smoke** is different: `IsoFireManager.StartSmoke(cell, square, true, energy, life)` works on a client, which sends the request to the server :cite[(`IsoFireManager.java:237-263`)]. Smoke blinds zombies on that square; see [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works).

### Stopping a fire

Stopping a fire is a server job, except for putting a single character out.

| Call | Side | What it does | Code |
|---|---|---|---|
| `square:stopFire()` | Server or single player | Removes every wild fire on the square and flags it burnt out. A permanent (campfire) flame is not removed | `zombie/iso/IsoGridSquare.java:9690-9695`, `IsoFireManager.java:323-330` |
| `stopFire(obj)` (global) | **Server only**; ignored elsewhere | For a square: stops it and tells nearby clients. For a player or zombie: stops the burning | `zombie/Lua/LuaManager.java:9014-9029` |
| `character:StopBurning()` | Wherever the character is simulated | Puts the character out | `IsoGameCharacter.java:8188-8198` |
| `fire:extinctFire()` | Server | Ends one fire object now | `IsoFire.java:594-602` |

### Reading fire

A square is on fire when it has the burning flag, and the fire objects on it can be read one by one.

```lua
-- Is this square on fire right now? (a fire in stages 0 to 3)
local burning = square:has(IsoFlagType.burning)

-- Find the fire objects on it.
for i = 0, square:getObjects():size() - 1 do
    local obj = square:getObjects():get(i)
    if instanceof(obj, "IsoFire") then
        print(obj:getLife(), obj:getEnergy(), obj:isPermanent())
    end
end
```

`has(IsoFlagType.burning)` is how vanilla asks the same question :cite[(`media/lua/server/FireFighting/FireFighting.lua:107`)]. The campfire's permanent flame also sets the burning flag every update, so check `isPermanent()` if you only want wild fires :cite[(`IsoFire.java:397-399`, `:640-642`)].

### Hurting people with fire

`character:SetOnFire()` lights a character, plays the burning sound and attaches the flame.

The engine's code does this in the character class :cite[(`IsoGameCharacter.java:8158-8185`)]. Burn damage per update is set by `character:setFireKillRate(rate)` (default 0.0038) and `setFireSpreadProbability(n)` (default 6, out of 3,000, per update) :cite[(`IsoGameCharacter.java:557-558`, `:3280-3294`)]. Both are exposed and per character.

### Events for fire

Three events report fire, and nothing in vanilla Lua listens to the first two.

| Event | When | Notes |
|---|---|---|
| `OnNewFire(fire)` | A wild fire object is made | Fires on the server or single player, and on each client for its own copy. Nothing in vanilla Lua listens to it (`IsoFire.java:258`) |
| `OnGridBurnt(square)` | A square burns (end of the first fifth of a fire's life) | Server and single player; no vanilla listener (`IsoGridSquare.java:6209`) |
| `OnPlayerGetDamage(player, "FIRE", amount)` | Fire hurts a player | Fires once per update while burning (`IsoGameCharacter.java:5984`, `:6486`) |

## Water

A mod reads water on any object, plumbs a fixture the way the wrench does, and adds water sources through item and entity scripts.

### Reading

These calls read the water state of an `IsoObject` and the shutoff day.

| Call (on an `IsoObject`) | Returns |
|---|---|
| `obj:hasWater()` | True if the object has any water to give |
| `obj:getFluidAmount()` | Liters; 10,000 for an infinite source |
| `obj:getFluidCapacity()` | Liters of space |
| `obj:isTaintedWater()` | True if the water is tainted |
| `obj:getUsesExternalWaterSource()` | True if plumbed |
| `obj:hasExternalWaterSource()` | True if its barrel still exists |
| `getSandboxOptions():getWaterShutModifier()` | The shutoff day number (2,147,483,647 when disabled) |
| `getGameTime():getWorldAgeDaysSinceBegin()` | The world age in days that every shutoff test uses |

These come from the object, sandbox and game time classes :cite[(`zombie/iso/IsoObject.java:2480-3202`, `zombie/SandboxOptions.java:381-391`, `zombie/GameTime.java:897-899`)].

### Changing

```lua
-- Plumb a fixture to a barrel on the floor above (what the wrench does).
fixture:getModData().canBeWaterPiped = false
fixture:setUsesExternalWaterSource(true)
fixture:transmitModData()
fixture:sendObjectChange('usesExternalWaterSource', { value = true })
```

That is exactly what vanilla does :cite[(`media/lua/shared/TimedActions/ISPlumbItem.lua:31-36`, `media/lua/server/ClientCommands.lua:79-89`)]. It must run on the server. `obj:addFluid(FluidType.TaintedWater, 5)` and `obj:emptyFluid()` put water in a world object and take it out; both fire `OnWaterAmountChange(object, oldAmount)` on the server :cite[(`IsoObject.java:2776-2795`, `:2868-2891`)]; on a plumbed fixture they act on its barrel instead.

You can also move the shutoff day while the game runs: `getSandboxOptions():set("WaterShutModifier", 30)`. Every test reads the option each time, so in single player the change is immediate :cite[(`IsoObject.java:2701`)]. On a server the clients' copy of the option was not checked: not verified.

### Adding a water source

A new water source is an item or entity script with a fluid container, or a tile with water properties.

| What | How | Code |
|---|---|---|
| A rain catcher you can carry | An item script with `RainFactor` in its `component FluidContainer` block; vanilla's bucket is the model | `media/scripts/generated/items/normal.txt:13249-13273` |
| A rain catcher you build | An entity script with a `FluidContainer` that has `Capacity` and `RainFactor` | `media/scripts/generated/entities/outdoors/entity_raincollector.txt:3-46` |
| Clean rain | `FillsWithCleanWater = true` in the component (the Well does this) | `entity_well.txt:16` |
| A closed lid | A second entity with the same container and no `RainFactor`, swapped in by `ISOpenCloseLid` | `entity_raincollector.txt:103-120` |
| A tile that is a water fixture | Tile properties (`waterPiped`, `WaterAmount`, `taintedWater`), set in a tile pack with a tile editor. That is tile data, not Lua | |

How the rain rate is computed, and that it is applied only to containers with a rain factor, is on [Water, plumbing and rain collection](/pz/build-42/engine/fire-water-and-power/water-and-plumbing). The container calls are documented in [FluidContainer calls that do not do what their names say](/pz/build-42/modding/fluids/fluid-container-calls-that-lie).

### Events for water

Two events matter for water.

| Event | When | Side |
|---|---|---|
| `OnWaterAmountChange(object, oldAmount)` | A fixture's or container's water changed | Server, single player. One vanilla listener, in the old rain-barrel Lua (`SRainBarrelSystem.lua:77-92`) |
| `EveryTenMinutes` | Tick for slow checks | Server, single player |

## Power

A mod reads the grid and generator state, sets generator fuel and condition, and can add a generator or a fuel, but a powered object of its own needs Java to cost fuel.

### Reading and changing

```lua
local world = getWorld()
local gridOn = world:isHydroPowerOn()             -- the world flag
local gridExists = getSandboxOptions():doesPowerGridExist() -- the date test
local here = square:hasGridPower()                -- grid reaches this square
local gen  = square:haveElectricity()             -- a generator covers this square
local g = square:getGenerator()                   -- a generator standing on this square, or nil
```

| Call | Effect |
|---|---|
| `g:getFuel()`, `g:setFuel(x)` | Liters, clamped to 0 to 10 |
| `g:getCondition()`, `g:setCondition(n)` | 0 to 100 |
| `g:isActivated()`, `g:setActivated(true)` | On or off |
| `g:isConnected()`, `g:setConnected(true)` | Plugged in |
| `g:getItemsPowered()`, `g:getTotalPowerUsing()` | The info window's list and total liters an hour |
| `g:setSurroundingElectricity()` | Recount what the generator powers |
| `lightSwitch:setActive(true)`, `toggle()` | Switch a light (it checks that power exists) |

The generator and light switch classes define these calls :cite[(`zombie/iso/objects/IsoGenerator.java:506-598`, `:732-749`, `IsoLightSwitch.java:490-523`)]. `setActivated` also switches the building's fume flag and fires `OnElectricityChanged`.

`getWorld():setHydroPowerOn(false)` sets the grid flag directly. The flag is only written again when the sound manager's state changes :cite[(`zombie/AmbientStreamManager.java:607-616`)], so a forced value should stick; I did not test it, and each machine has its own flag.

### Adding a powered object

A generator only counts objects that answer yes to `couldBePoweredByGenerator()`, and the draw is a Java method. That gives you these routes without Java:

| Route | What counts | Draw | Code |
|---|---|---|---|
| A tile whose container type is `fridge` or `freezer` | Counted, and keeps food cold | 0.08, or 0.13 with both | `zombie/iso/IsoObject.java:5191-5207` |
| A tile that is a light (light properties) | Becomes a light switch; counted while on | 0.002 | `IsoLightSwitch.java:81-108`, `:837-844` |
| A tile with the piped-fuel property | A gas pump; counted | 0.03 | `IsoObject.java:5195-5197` |
| A tile that becomes a television, stove, radio or washer/dryer object | Counted while on or running | 0.03, 0.09, 0.01, 0.09 | `IsoTelevision.java:227-234`, `IsoStove.java:522-529`, `IsoRadio.java:31-38`, `IsoClothingWasher.java:85-92` |

A powered thing of your own that is *not* one of these draws no fuel and is not counted, even if your Lua checks `square:haveElectricity()` to decide whether it works. Use that check for behavior; the cost needs Java.

### Adding a generator

A generator model is an **item**, not a vehicle.

It needs the tag `base:generator`, a `WorldObjectSprite` (a tile), and the numbers the engine reads: `ConditionLowerChanceOneIn`, `SoundRadius`, `SoundVolume` :cite[(`media/scripts/generated/items/normal.txt:4800-4815`, `IsoGenerator.java:142-165`, `:179-190`, `:208`)]. A sprite property `GeneratorSound` picks the sound set :cite[(`IsoGenerator.java:755-762`)]. The tile itself has to exist in a tile pack.

### Adding a fuel

An item is a fuel for a campfire, fireplace or barbecue when it has the tag `base:isfirefuel` or a `FireFuelRatio` above 0 in its script.

The test is in the camping menu :cite[(`media/lua/shared/Camping/ISCampingMenu.lua:49-53`, `media/scripts/generated/items/clothing.txt:755`)]. The burn time is `min(table value, weight x ratio)` hours, ratio 2/3 by default :cite[(`ISCampingMenu.lua:4`, `:65-80`)]. A table entry you can add from Lua, after the vanilla table exists:

```lua
require "Camping/camping_fuel"      -- creates campingFuelType (a global table)
campingFuelType["MyLogType"] = 3.0  -- hours; the item type is the key
```

Whether the `require` path resolves from a mod's own `server` folder was not tested; if it does not, set the table from an `OnGameBoot`-time file that loads after the vanilla one. For generator fuel the rule is fixed: the item must hold the fluid **Petrol**, at least 0.099 liters :cite[(`ISWorldObjectContextMenuLogic.java:2234-2237`)].

### Events for power

One event reports power, and it carries no arguments.

| Event | When |
|---|---|
| `OnElectricityChanged` | The grid is cut (on every machine, with the sound), or a generator is switched on or off |

Read the state yourself after it fires :cite[(`IsoGenerator.java:555`, `:644`, `AmbientStreamManager.java:646`)]. There is no event for fuel running out or for a bulb breaking; poll `EveryOneMinute` or `EveryHours` if you need those :cite[(`zombie/GameTime.java:611`, `:643`)].

### Hooking a vanilla action

The generator actions are Lua classes you can wrap, and they run on the server in multiplayer.

The `complete()` method is the server step.

```lua
-- Add a message every time someone repairs a generator.
local oldComplete = ISFixGenerator.complete
function ISFixGenerator:complete()
    local result = oldComplete(self)       -- run the vanilla repair first
    -- self.generator is the IsoGenerator; self.character is the player
    print("Repaired to " .. self.generator:getCondition())
    return result
end
```

Put such a file where vanilla's file has loaded first (the same folder and a later name, or `require` it). The action classes are `ISAddFuel`, `ISActivateGenerator`, `ISFixGenerator`, `ISPlugGenerator`, `ISPlumbItem`, `ISPutOutFire`, `ISPutOutCampfireAction` (`media/lua/shared/TimedActions/`, `media/lua/shared/Camping/TimedActions/`). Another mod that wraps the same function will wrap yours: always call the old function.

## Which side must act in multiplayer

In multiplayer the server must start fires, put them out, burn squares, plumb fixtures and change fluid, and a client asks with a command.

| Job | Must run on | Why | What a client does |
|---|---|---|---|
| Start a wild fire | Server | The client call is refused | `sendClientCommand` |
| Put out a fire | Server | `stopFire(obj)` only works there | `sendClientCommand`, or use the vanilla action |
| Burn a square (`Burn()`) | Server | `BurnWalls` stops on a client | Ask the server |
| Set a character on fire | The machine that owns the character | Players and zombies are simulated by their owner | Direct call |
| Change generator state | Server (a client's change is also accepted and synced) | The server applies what a client sends without a check | Prefer a command |
| Plumb a fixture | Server | The change must be sent with `sendObjectChange` | `sendClientCommand` |
| Change fluid in a world object | Server | The change is applied only on the server or single player | Ask the server |
| Read any of the above | Any side | State is synced | Direct call |
| The grid flag | Each machine alone | No packet | Do not expect clients to agree if you force it |

The table rests on these places in the code :cite[(`IsoFireManager.java:204-205`, `LuaManager.java:9014-9029`, `IsoGridSquare.java:6223`, `IsoGenerator.java:603-646`, `IsoObject.java:2847`, `:2947`)].

A server-side command for starting a fire:

```lua
-- 42/media/lua/server/FireWatchServer.lua  (loads on the server, and in single player)
local function onClientCommand(module, command, player, args)
    if module ~= "FireWatch" or command ~= "startFire" then return end
    -- Always check who is asking. Vanilla's brush tool checks a capability:
    if not player:getRole():hasCapability(Capability.UseBrushToolManager) then return end
    local square = getCell():getGridSquare(args.x, args.y, args.z)
    if square then
        IsoFireManager.StartFire(getCell(), square, true, 100, 600)
    end
end
Events.OnClientCommand.Add(onClientCommand)
```

And the client side: `sendClientCommand(getPlayer(), "FireWatch", "startFire", { x = sq:getX(), y = sq:getY(), z = sq:getZ() })`. The capability check is copied from vanilla's client commands; without it, any player could burn the map :cite[(`media/lua/server/ClientCommands.lua:9-17`)].

## What needs Java

You need a loose class ahead of the jar on the classpath (tier L3 in the capability list) to change a fire's energy, the spread numbers, what a square destroys, a generator's draw or the rain rate.

| Change | Where | Code |
|---|---|---|
| Set a fire's energy | No setter; the field is public in Java only | `IsoFire.java:63` |
| Spread chance, number of spots, directions, the 75-fire limit | Constants and code in `Spread` and `IsoFireManager.Add` | `IsoFire.java:298-379`, `IsoFireManager.java:55` |
| Fire life range and stage split | The constructor and `updateFromTimer` | `IsoFire.java:228-242`, `:471-519` |
| What a square destroys, and the explosion powers | `BurnWalls` | `IsoGridSquare.java:6222-6556` |
| A generator's draw for a new kind of object | `getGeneratorPowerConsumption` and `couldBePoweredByGenerator` | `IsoObject.java:5191-5207` |
| Generator wear, backfire and fire chances | Constants in `update` | `IsoGenerator.java:208-263` |
| Rain rate formula and the 2.4 game seconds per tick | `FluidContainerUpdateSystem` | `FluidContainerUpdateSystem.java:76-106`, `EntitySimulation.java:35-37` |
| What makes a fixture infinite | `isWaterInfinite` | `IsoObject.java:2687-2710` |
| Fire damage to vehicles | There is none to extend: no vehicle code reads fire | `zombie/vehicles/BaseVehicle.java` |

Whether Lua can write the public static fields that the exposed `IsoFireManager` lists (such as `maxFireObjects`) was not tested: not verified.

## A small working mod: Fire Watch

Fire Watch makes your character say where a new fire started and when the power changes, and adds two right-click entries.

One entry lights a test fire (hidden on a multiplayer client; use a throwaway save), and the other reports the shutoff days and the power on the square you clicked.

### 1. Make the folders

Find your Zomboid user folder. On Windows it is `C:\Users\<your name>\Zomboid`. If it is not there, your install keeps it elsewhere; look for a folder with `console.txt` in it.

Inside it, make this tree. Everything in it is a plain folder or a plain text file.

```
Zomboid\
  mods\
    FireWatch\
      common\                        <- an EMPTY folder; the layout needs it
      42\
        mod.info
        media\
          lua\
            client\
              FireWatch.lua
```

Why `42`? The versioned layout loads the folder closest to the game version, so this mod loads on 42.x.

Why `client`? The context menu and the speech bubble exist only on the player's screen. If you put the file in `server`, it would run, but the menu would not appear. (More in [The versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders).)

### 2. mod.info

Save this as `42\mod.info`. There must be no spaces around the `=` signs and no blank junk at the end.

```
name=Fire Watch
id=FireWatch
description=Says where fires start and when the power changes. Adds a test fire and a utilities report to the right-click menu.
```

| Line | Means |
|---|---|
| `name=` | What the Mods screen shows |
| `id=` | The mod's unique name; keep it letters only |
| `description=` | The text under it |

### 3. FireWatch.lua

Save this as `42\media\lua\client\FireWatch.lua`. Every line is explained in the comments.

```lua
-- Fire Watch. A small client mod. Lines starting with two dashes are notes for humans.

print("[FireWatch] loaded")        -- shows up in console.txt, so you know the file ran

-- A small helper: make the local player say something in a speech bubble.
local function say(text)
    local player = getPlayer()      -- the first local player
    if player then                  -- on a loading screen there may be none
        player:Say(text)            -- Say shows a speech bubble over the head
    end
end

-- PART 1: tell the player where a fire started.
-- A big fire makes many new fires per second, so we only speak once every 3 seconds.
local lastSaid = 0
local function onNewFire(fire)      -- the engine hands us the new IsoFire
    local now = getTimestampMs()    -- milliseconds on the real clock
    if now - lastSaid < 3000 then return end
    lastSaid = now
    local square = fire:getSquare() -- the square the fire is on
    if square then
        say("Fire at " .. square:getX() .. ", " .. square:getY())
    end
end
Events.OnNewFire.Add(onNewFire)     -- "call onNewFire every time a fire is made"

-- PART 2: tell the player when the grid or a generator changes the power.
local function onElectricityChanged()
    say("Power changed. Grid flag: " .. tostring(getWorld():isHydroPowerOn()))
end
Events.OnElectricityChanged.Add(onElectricityChanged)

-- PART 3: two right-click entries on the ground.
-- Start a test fire on the clicked square. Only the server may start fires, so this
-- entry is hidden on a multiplayer client (see the multiplayer section).
-- WARNING: outdoors a fire can spread widely. Use a throwaway save.
local function lightTestFire(worldobjects, square)
    -- StartFire(cell, square, igniteOnAny, energy, life)
    IsoFireManager.StartFire(getCell(), square, true, 100, 600)
end

-- Say the shutoff days and the power state of the clicked square.
local function report(worldobjects, playerNum, square)
    local player = getSpecificPlayer(playerNum)
    local options = getSandboxOptions()
    local day = math.floor(getGameTime():getWorldAgeDaysSinceBegin())
    player:Say("Day " .. day
        .. ". Water off on day " .. options:getWaterShutModifier()
        .. ", power off on day " .. options:getElecShutModifier()
        .. ". Here: grid " .. tostring(square:hasGridPower())
        .. ", generator " .. tostring(square:haveElectricity()))
end

-- The game calls this every time the right-click menu is built.
local function onFillMenu(playerNum, context, worldobjects, test)
    if test then return end                 -- the game is only asking whether a menu exists
    local square = nil
    for _, obj in ipairs(worldobjects) do   -- the first thing clicked tells us the square
        square = obj:getSquare()
        break
    end
    if not square then return end
    context:addOption("Utilities report", worldobjects, report, playerNum, square)
    if not isClient() then                  -- a multiplayer client cannot start fires
        context:addOption("Light a test fire here", worldobjects, lightTestFire, square)
    end
end
Events.OnFillWorldObjectContextMenu.Add(onFillMenu)
```

Symbols you will see: `..` joins pieces of text; `:` calls a method that belongs to an object (`player:Say(...)`); `--` starts a comment; `local` keeps a name private to this file.

### 4. Turn the mod on and load a save

1. Start Project Zomboid.
2. On the main menu, open **Mods**. Find **Fire Watch** in the list and turn it on (its box should be checked). If it is not in the list, the folder is in the wrong place; see "If it does not work".
3. For a **new game**, start a Sandbox or Survival game; the mod list for a new game is chosen on its setup screen. For an **existing save**, pick the save on the Load screen and open its mod list before you press Play. If you cannot find the mod list for a saved game, start a new game instead; the test needs no particular save.
4. Once the game has loaded, open `console.txt` in your Zomboid folder and look for the line `[FireWatch] loaded`.

### 5. What you should see

1. Walk to the grass or a floor outside, away from your base. Right-click the ground. You should see **Utilities report** and **Light a test fire here**.
2. Choose **Utilities report**. Your character says something like "Day 3. Water off on day 14, power off on day 21. Here: grid true, generator false". The two shutoff numbers are your save's own. If a number is 2,147,483,647, that shutoff is set to Disabled. Indoors on grid power, the grid reads `true`; far from any building, `false`.
3. **Safety first.** Use a throwaway save, and light the fire on a bare floor indoors, or turn the **Fire Spread** sandbox option off. Outdoors, a child fire gets all of its parent's leftover energy :cite[(`IsoFire.java:369-370`)], vegetation adds 50 :cite[(`:254-256`)] and a hop costs 15, so a grass fire can fan out to the 75-fire cap. Then choose **Light a test fire here**. A fire appears, and your character says "Fire at x, y" (the numbers are the square's). Stand back. After a short time it may spread to a few neighbors (see [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works)); it will not repeat the message more than once every three seconds.
4. Put the test fire out with a bucket of water or an extinguisher (see [Fighting fire](/pz/build-42/engine/fire-water-and-power/fighting-fire)), or let it burn out in under two minutes.
5. If you have a generator, switch it on from its right-click menu. Your character says "Power changed". Switch it off for a second message.

### If it does not work

Most failures are a wrong folder, a mod that is off for the save, or a typo.

| You see | Likely cause | Fix |
|---|---|---|
| Fire Watch is not in the Mods list | The folder is in the wrong place, or `mod.info` is not inside `42\` | Check the tree above; there must be a `common` folder beside `42` |
| No `[FireWatch] loaded` in `console.txt` | The mod is off for this save | Turn it on in the mod list for that save |
| A red error in the game or lines starting `ERROR` in `console.txt` | A typo (a missing `end`, `)` or quote) | Read the line number in the message |
| The menu entries do not appear | The file is in the wrong folder, or you are on a multiplayer client (the fire entry hides there) | It must be in `media\lua\client` |
| The fire entry does nothing | You are a multiplayer client | Use the command pattern above |
| Many messages | The throttle is off | Check the `3000` in `onNewFire` |

### Make it multiplayer-safe

Two changes make the mod work on a server, and in normal single player that version is refused.

In `FireWatch.lua`, replace `lightTestFire` with a function that calls `sendClientCommand(getPlayer(), "FireWatch", "startFire", { x = square:getX(), y = square:getY(), z = square:getZ() })`, and remove the `if not isClient()` guard.

Then add the server file from the multiplayer section as `42\media\lua\server\FireWatchServer.lua`. In single player the server command is also delivered :cite[(`zombie/spnetwork/SinglePlayerServer.java:204`)], but the capability check reads the player's role, which in single player is the default one :cite[(`zombie/characters/IsoPlayer.java:339`)], and that role has the capability only in debug mode :cite[(`zombie/characters/Role.java:192-198`)].

So in normal single player this version is refused (not verified in a game); for a single-player test keep the client-only version above. On a server, only a player with the brush-tool capability (an admin) can use it.

## Where to go next

- [How fire works](/pz/build-42/engine/fire-water-and-power/how-fire-works) and [Fighting fire](/pz/build-42/engine/fire-water-and-power/fighting-fire): what your calls set off.
- [Water, plumbing and rain collection](/pz/build-42/engine/fire-water-and-power/water-and-plumbing) and [Electricity and generators](/pz/build-42/engine/fire-water-and-power/electricity-and-generators).
- [Fire, water and power: the numbers](/pz/build-42/engine/fire-water-and-power/fire-water-and-power-reference).
- [Timed actions](/pz/build-42/modding/lua-api/timed-actions) and [ModData](/pz/build-42/modding/lua-api/moddata).

:::callout[How we know]{kind=proof}
Everything above is read from the code: the `file:line` citations in each table, the Lua-exposed member lists in `api/lua_exposed.jsonl`, and the events in `api/events.jsonl` (`OnNewFire`, `OnGridBurnt`, `OnElectricityChanged`, `OnWaterAmountChange`, `OnFillWorldObjectContextMenu`, `OnClientCommand`). The example mod was not run in a game for this draft; every call in it is a method listed as Lua-exposed, and the patterns follow vanilla (`media/lua/server/ClientCommands.lua`, `media/lua/client/DebugUIs/AdminContextMenu.lua`). Build 42.22, engine revision 3d39148846 (Steam build 26486631). Not confirmed: whether Lua can write to the exposed static fields of `IsoFireManager`; whether the server-command version is accepted in single player outside debug mode (the code says no); whether the `require "Camping/camping_fuel"` path works from a mod's own folders; whether a runtime change of `WaterShutModifier` or `ElecShutModifier` reaches multiplayer clients; whether forcing the grid flag with `setHydroPowerOn` sticks across the grid's own state changes; and the exact wording of the in-game mod screens in 42.22, since the steps above name the buttons by their purpose.
:::
