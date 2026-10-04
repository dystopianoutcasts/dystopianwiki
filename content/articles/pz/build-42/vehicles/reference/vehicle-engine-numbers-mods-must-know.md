---
id: build-42-vehicle-engine-numbers-mods-must-know
slug: vehicle-engine-numbers-mods-must-know
title: 'Engine numbers a vehicle mod must know'
game: pz
version: build-42
section: vehicles
category: reference
difficulty: intermediate
tags:
  - vehicles
  - engine
  - crash-damage
  - temperature
  - mechanics-xp
excerpt: >-
  How vanilla turns engine quality into power, why the curve is flat above 62.5,
  what really resets quality to 100, where the engine temperature ceiling comes
  from, which part a crash hurts, and what Mechanics XP a job really pays. Read
  from the 42.21 code.
last_updated: '2026-10-04'
related_articles:
  - vehicle-engine-reference
  - vehicle-lua-hook-traps
  - vehicle-script-traps
  - what-runs-on-the-server-in-build-42-multiplayer
---
# Engine numbers a vehicle mod must know

Outcast, if your mod touches a car's engine, these are the numbers vanilla is already using behind your back. Every one of them surprised us at least once. Two of them we had written down wrong in our own notes until we read the code again for this page, and we say which.

For the hook rules (how to chain `Vehicles.Update.Engine` and friends) read the [vehicle engine reference](/pz/build-42/vehicles/reference/vehicle-engine-reference) first. This page is the numbers.

## Power comes from quality, and the curve is flat at both ends

When a car is created, `Vehicles.Create.Engine` rolls an engine quality and turns it into power:

```lua
local qualityBoosted = engineQuality * 1.6;
if qualityBoosted > 100 then qualityBoosted = 100; end
local qualityModifier = math.max(0.6, ((qualityBoosted) / 100));
local enginePower = vehicle:getScript():getEngineForce() * qualityModifier;
vehicle:setEngineFeature(engineQuality, engineLoudness, enginePower);
```

So power is the script's `engineForce` times a modifier that is:

| Quality | Modifier |
|---|---|
| 62.5 and above | 1.0, full power |
| 37.5 to 62.5 | quality x 1.6 / 100 |
| 37.5 and below | 0.6, the floor |

What that means for you: most vanilla cars feel stock on purpose. If your mod derives power from some live quality measure using vanilla's own formula, anything above 62.5 changes nothing you can feel. If you want a worn engine to feel worn, you need your own curve.

With the sandbox option `VehicleEasyUse` on, the same function skips the roll and sets quality 100, loudness 30 and full power.

> **Proof:** Code. `media/lua/server/Vehicles/Vehicles.lua`, `Vehicles.Create.Engine`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

Power is real physics. The car controller pushes with `enginePower * (0.5 + engineSpeed / 24000)`, then takes off a share that grows with speed. And `setEngineFeature(quality, loudness, power)` is public and takes three whole numbers, so a fractional power is cut down to an integer.

> **Proof:** Code. `zombie.core.physics.CarController#control_Forward`; `zombie.vehicles.BaseVehicle#setEngineFeature(int, int, int)` and `#getEnginePower`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

There is a loudness trap in `setEngineFeature` (it stores loudness scaled by about 0.37, so passing `getEngineLoudness()` back in shrinks it every write), and a multiplayer trap (it sends nothing to clients). Both are covered in [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).

## What resets quality to 100 (less than we thought)

Our notes said vanilla resets engine quality to 100 "whenever the Engine part's stats are recomputed", so a mod owning engine quality would be overwritten all the time. That was wrong. The reset lives in exactly one place, `VehiclePart#repair`:

```java
if ("Engine".equalsIgnoreCase(this.getId())) {
   int quality = 100;
   int loudness = (int)(vehicleScript.getEngineLoudness() * SandboxOptions.getInstance().zombieAttractionMultiplier.getValue());
   int power = (int)vehicleScript.getEngineForce();
   this.vehicle.setEngineFeature(100, loudness, power);
   this.vehicle.transmitEngine();
}
```

That runs when a whole car is repaired: the admin and cheat repair commands, the debug tools, and a few scripted spawns. Installing a part or a normal mechanics job does not touch quality.

Still, if your mod owns engine quality or power, compare against the live getters (`getEngineQuality()`, `getEnginePower()`) rather than a copy of what you last wrote. An admin repair will put the car back to stock without asking you.

> **Proof:** Code. `zombie.vehicles.VehiclePart#repair` (the only call of `setEngineFeature` with 100 in the Java); callers `zombie.vehicles.BaseVehicle#repair` and `media/lua/server/Vehicles/VehicleCommands.lua` (`repair`, `repairPart`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The engine temperature ceiling comes from the hood

`Vehicles.Update.Engine` warms a running engine a little each update, up to a maximum. That maximum is set by the hood, and nothing else:

```lua
local max = 100;
local increment = ZombRand(0,3);
local engineDoor = vehicle:getPartById("EngineDoor");
if engineDoor then
    if not engineDoor:getInventoryItem() then max = 200;
    else max = 100 + ((100 - engineDoor:getCondition()) / 3) end
end
```

| Hood | Maximum temperature |
|---|---|
| Fitted, condition 100 | 100 |
| Fitted, condition 0 | about 133 |
| Hood slot empty (hood removed) | 200 |
| The car's script has no hood part at all | 100 |

So with a hood fitted, vanilla never goes above about 133, whatever the radiator is doing. We once told our own Outcast Motors developer that a damaged radiator "boils and stalls" a car with a hood on. The code says it cannot.

One more thing we looked for and did not find: **any code that stalls or damages an engine because it is hot.** The engine's temperature is read by the heater (how fast the cabin warms), the mechanics window (display) and an admin command. If your mod wants overheating to hurt, your mod has to do the hurting.

> **Proof:** Code. `media/lua/server/Vehicles/Vehicles.lua`, `Vehicles.Update.Engine` (the ceiling) and `Vehicles.Update.Heater` (the reader); searched the Java for any other reader of the engine temperature and found only `BaseVehicle#getInsideTemperature`, which reads the passenger compartment. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A crash hurts the hood, so watch the hood

A frontal crash goes through `BaseVehicle#addDamageFront`:

```java
this.currentFrontEndDurability -= dmg;
VehiclePart part = this.getPartById("EngineDoor");
if (part != null && part.getInventoryItem() != null) {
   part.damage(Rand.Next(Math.max(1, dmg - 5), dmg + 5));
}
if (part == null || part.getInventoryItem() == null || part.getCondition() < 25) {
   part = this.getPartById("Engine");
   if (part != null) { part.damage(Rand.Next(Math.max(1, dmg - 3), dmg + 3)); }
}
```

On a car with a healthy hood, the Engine part takes nothing. A crash detector that watches engine condition passes every test where you damage the engine yourself, and then fires on almost no real collision. We built one like that.

Two signals look tempting and do not work. Watching the Engine part, for the reason above. And `currentFrontEndDurability`, the value that always moves: it is a public Java field with no getter, and Lua only sees methods, so it reads nil every time.

**What works is the hood's condition drop.** It moves on every frontal hit, by about the damage dealt (give or take five), and `getCondition()` is an ordinary method. When the hood is gone or below 25, vanilla damages the engine directly, so an engine-condition drop covers that case. Every community armour mod we read ended up here on its own.

Running down a zombie is a different function, `addDamageFrontHitAChr`, with its own rule: the engine is only touched when the hood is gone or at zero, and then only one time in four.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#addDamageFront` and `#addDamageFrontHitAChr` (both private; nothing is skipped except in driver god mode). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### On KI5 cars the hood is not a damage meter

KI5's cars come with optional armour from the shared library "that DAMN Library" (KI5 and bikinihorst). While a front bumper armour piece is fitted, the car's client-side armour code puts the hood's condition back to what it was when the driver got in, and takes a little off the bumper instead. The library sends the new conditions to the server as an `updatePartConditions` command, and the server handler applies them without checking who sent them.

So on a KI5 car with armour, a hood that drops after a crash and snaps back a second later is the armour doing its job, not a sync bug in your mod. Outcast Motors stands its crash logic down on an armoured end for this reason.

> **Proof:** Reported. Read in "that DAMN Library" (Workshop 3171167894), `media/lua/server/Commands/DAMN_Armor.lua` function `DAMN.ServerHandlers.updatePartConditions` and `media/lua/client/DAMN_Armor_Client.lua`; the per-car armour files are in each KI5 car mod. Not tested by us in game. Build 42.20 folder of the library, read 2026-10-02 and 2026-10-04.

## What a mechanics job pays in XP

The full table is in the [vehicle engine reference, section 7](/pz/build-42/vehicles/reference/vehicle-engine-reference). The short version, all of it paid on the server in multiplayer:

- A **successful** install or uninstall pays 2 to 13 Mechanics XP, from the Mechanics level in the part's uninstall table, through the Java `addMechanicsItem`. A failure pays 1.
- It pays only when the job's key (item, car, and "1" for install or "0" for uninstall) is new. **The key's clock restarts every time you do the job**, even when it pays nothing: `addMechanicsItem` stores the time on every call, and the key is dropped 24 in-game hours after the last time it was stored. So installing and removing the same part over and over keeps it at zero XP for as long as you keep doing it, and it pays again only after a full in-game day without touching it.
- A successful repair with a fixer pays 3 to 5 XP per skill the fixer lists. Repairing the engine with Engine Parts pays one XP per part used, once per car until its key expires, plus the install-style payment above.

> **Proof:** Code. `zombie.characters.IsoPlayer#addMechanicsItem` (`mechanicsItem.put` runs whether or not XP was paid) and `#updateMechanicsItems` (drops a key when the game time passes `milli + 86400000`); `media/lua/shared/Vehicles/TimedActions/ISInstallVehiclePart.lua`, `ISUninstallVehiclePart.lua` and `ISRepairEngine.lua`, `complete()`; `zombie.inventory.FixingManager#addXp`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

We got the XP rule wrong for three weeks: we read the Lua success branch, saw no `addXp`, and concluded success pays nothing. The success branch pays through a Java method with a different name. If you are hunting for where XP comes from, search for the perk, not for the call you expect.
