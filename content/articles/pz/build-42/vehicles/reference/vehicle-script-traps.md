---
id: build-42-vehicle-script-traps
slug: vehicle-script-traps
title: Vehicle script traps
game: pz
version: build-42
section: vehicles
category: reference
difficulty: intermediate
tags:
  - vehicles
  - scripts
  - templates
  - silent-failure
excerpt: >-
  One character decides whether a vehicle template replaces a part or merges
  into it. Parts are assembled from wildcard blocks, so grepping by part name
  lies. A Lua name in a script that does not resolve shuts every engine down.
  The vehicle script traps we hit, checked against the 42.21 code.
last_updated: '2026-10-04'
related_articles:
  - vehicle-engine-reference
  - vehicle-lua-hook-traps
  - vehicle-engine-numbers-mods-must-know
  - script-comments-what-slashes-do
---
# Vehicle script traps

Outcast, vehicle scripts fail quietly. A wrong line rarely errors; it just leaves a part without an item, a door that never opens, or a car whose engine keeps dying. These are the traps we fell into while building our car mods, each one checked again in the code. Before you read on, also read [Script comments: what // really does](/pz/build-42/modding/gotchas/script-comments-what-slashes-do), because a `//` in a vehicle script costs you properties without a word.

## `template =` replaces, `template! =` merges

A vehicle script can pull in a template two ways, and they do opposite things.

- **`template = X`** copies X's parts into your vehicle. If your vehicle already has a part with the same id, it is **replaced whole**, not merged. Areas, wheels and passengers work the same way, and physics shapes are worse: the whole physics list is cleared and replaced.
- **`template! = X`** (with the exclamation mark) reads X's body as if it were written inside your vehicle. Parts are found or created, and `table` blocks merge into the existing tables. So two sources that both touch one part id can both land.

```java
} else if ("template".equals(k)) {
   this.LoadTemplate(v);
} else if ("template!".equals(k)) {
   VehicleTemplate template = ScriptManager.instance.getVehicleTemplate(v);
   ...
   this.Load(name, template.body);
```

Why it matters: under `template =`, a later template silently erases an earlier one's work on the same part. The replaced part keeps its id and its slot, so it still shows in the mechanics window, but it loses its `itemType`, its install and uninstall tables and its `create` hook. It never gets an item and never renders. Nothing is logged, and every symptom points at the wrong mod.

`template!` is not exotic: vanilla uses it 200 times, 64 of them for the burnt and smashed cars. It is how vanilla builds a variant on top of a base car.

Two limits on the merge, so it does not surprise you: inside a part, a `lua { }` block, a `door { }` and a `window { }` replace the earlier one rather than adding keys to it, and each top-level `physics` block is added as one more shape.

> **Proof:** Code. `zombie.scripting.objects.VehicleScript#Load` (`template` and `template!` branches), `#LoadTemplate`, `#copyPartsFrom` (`parts.set(index, otherPart.makeCopy())` when the id exists), `#copyPhysicsFrom` (`physicsShapes.clear()`), `#LoadPart` (get or create; `luaFunctions` rebuilt from the block); counted `template! =` lines under `media/scripts` (200, 64 in `burntAndSmashedVehicles`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A template is found by its name, not its file

`template = TrunkDoorOpened` looks for a template block named `TrunkDoorOpened`, wherever it lives. One template file can hold several: `template_trunk_door.txt` defines both `TrunkDoor` and `TrunkDoorOpened`, and a vehicle gets only the one it names. A checker of ours that keyed templates by file name "found" a `TrunkDoorOpened` on 23 saloons that never had one, and we believed it for a month.

A side finding while we checked this: a few template names are defined more than once in vanilla with different bodies (`StepVan` twice, `StepVanMail` and `PickUpVanLights` four times each, `PickUpTruckLights` twice). The game keeps the body of the first definition it registers. We have not traced which file registers first, so if your mod builds on one of those names, check the part you care about at runtime.

> **Proof:** Code. `zombie.scripting.ScriptManager#getVehicleTemplate` (lookup by name in the template bucket); `media/scripts/generated/vehicles/template_trunk_door.txt` (`template vehicle TrunkDoor`, `template vehicle TrunkDoorOpened`); duplicate names: `zombie.scripting.ScriptBucket#CreateFromTokenPP` appends a second body, and `VehicleTemplate` keeps the body it was created with. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A part block is not the whole part: wildcards

`part SeatFrontLeft { ... }` in a car script often holds only the seat's position. Its `itemType`, install table and uninstall table come from a **wildcard block**, `part Seat* { ... }`, elsewhere in the same vehicle or a template. A part id containing `*` is a pattern; the block is applied to every part that already exists and matches it. It never creates a part.

How common this is, counting block lines in the vanilla scripts:

| Pattern | Blocks |
|---|---|
| `Seat*` | 123 |
| `Door*` | 116 |
| `Window*`, `Suspension*`, `Brake*` | 112 each |
| `Windshield*` | 111 |
| `SeatRear*` | 15 |
| `Radio*` | 4 |
| `EngineDoor*` | 3 |
| `TrunkDoor*`, `Headlight*` | 2 each |
| `Tire*`, `DoorRear*` | 1 each |

So **searching the scripts by part name cannot tell you whether a part is installable.** We decided seats and headlights could not be removed on exactly that basis, and we were wrong. Resolve the wildcards and templates first, or ask the game: `part:getTable("install")` and `part:getLuaFunction(name)` are callable from Lua.

> **Proof:** Code. `zombie.scripting.objects.VehicleScript#Load` (a child `part` whose id contains `*` is applied to every existing part that `#globMatch` matches); census of `part <name>*` lines under `media/scripts`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Engine and Heater look the same

After their templates merge, the `Engine` and `Heater` parts have no `itemType`, no install table and no uninstall table, and they share `category = engine` and the engine area. The only difference in the whole record is that the Engine declares `checkEngine` (and `create`) in its `lua` block. So the obvious filter "hide parts with no item and no tables" hides the Engine.

Vanilla's mechanics window hides a part only when its category is `nodisplay`. A Heater is `category = engine` in 216 of the 241 vanilla vehicles, so vanilla draws a blank Heater plate too. If you see one in your mod's window, that is vanilla, not you.

> **Proof:** Code. `media/scripts/generated/vehicles/template_engine.txt` and `template_heater.txt`; `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua`, `ISVehicleMechanics:initParts` (`if category ~= "nodisplay"`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A Lua name that does not exist shuts every engine down

A vehicle script names Lua functions as text, for example `checkEngine = Vehicles.CheckEngine.MyCheck`. The script loads whether or not your Lua defining `MyCheck` ever ran. When the name does not resolve, the game logs `no such function` and gets nothing back, and the engine check treats "nothing" as "not working":

```java
// zombie.vehicles.VehicleParts#isEngineWorking
if (functionName != null && !Boolean.TRUE.equals(this.callLuaBoolean(functionName, this.vehicle, part))) {
   return false;
}
```

What that does on 42.21: the car can still be started (vanilla's start command does not ask), but the engine's own update checks once a second whether it should shut itself down, and "engine not working" is a reason. The engine dies, again and again, on every car using that script or template. Fails closed, on the whole fleet, with one log line.

Our notes said "no car carrying that template ever starts again". The effect is the same for a player, but the mechanism is the automatic shutdown, not the start.

**The rule:** a `Vehicles.*` function named by a script must be defined everywhere the script loads, which is everywhere. If only one side's answer matters, decide inside the function; never leave it undefined.

> **Proof:** Code. `zombie.vehicles.VehicleParts#callLuaBoolean` (null when `LuaManager#getFunctionObject` finds nothing) and `#isEngineWorking`; `zombie.vehicles.VehicleEngine#shouldAutoShutDown` (`state == Running && !isEngineWorking()`), checked from `#update` every 1000 ms when not a client; `zombie.vehicles.BaseVehicle#isDriveable`; `media/lua/server/Vehicles/VehicleCommands.lua`, `Commands.startEngine` (`if true or vehicle:isEngineWorking()`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Keys: `mechanicRequireKey` works only on the part

`mechanicRequireKey` ("you need the car's key to work on this part") can be written on a part or inside its `table install` / `table uninstall`. Only the part-level one is read. Inside a table it is just stored, and nothing reads it. Vanilla itself has two of those dead lines, on `Door*` in `vehicle_car_small02_template.txt`, so "vanilla does it" is not proof it works.

There are 22 declarations in vanilla, 14 true and 8 false. The pattern behind the false ones: the key is required for what a lock protects and waived for what is already exposed, such as open truck beds, trailer trunks and some hoods.

> **Proof:** Code. `zombie.scripting.objects.VehicleScript#LoadPart` (the only place `mechanicRequireKey` is parsed, into the part); `media/lua/server/Vehicles/Vehicles.lua`, `VehicleUtils.RequiredKeyNotFound` (`part:getScriptPart():isMechanicRequireKey()`, the only reader); `vehicle_car_small02_template.txt` (the two table-scope lines); count of `mechanicRequireKey` under `media/scripts`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

Two neighbours of this rule:

- **`door = EngineDoor` in an install table gates nothing.** It is a convenience: the part menu opens the hood, does the job, and closes the hood again. Vanilla uses it only for the battery and the muffler. Nothing refuses the job because the hood is shut.
- **An open hood does not waive the key.** The check that lets you work keyless when a door or window is open skips the `EngineDoor` on purpose.

> **Proof:** Code. `media/scripts/generated/vehicles/template_battery.txt` and `template_muffler.txt` (`door = EngineDoor` in `table install`); `media/lua/client/Vehicles/ISUI/ISVehiclePartMenu.lua`, `onInstallPart` and `onUninstallPart` (queue open door, the action, close door); `media/lua/server/Vehicles/Vehicles.lua`, `VehicleUtils.CheckForUnlockedDoorsWindows` (`part:getId() ~= "EngineDoor"`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A part with no door never opens or poses

If you attach a moving model to a part, the part needs a `door { }` element to be posed as opened or closed (a part with a `window { }` is posed by a separate path). And the ground box and "open" option only appear for a part whose area holds the player and which names a Lua `use` function.

Vanilla's `TruckBed` and `TruckBedOpen` have neither a door nor a `use`. So a tailgate model hung on them draws, never poses, and can never be opened. Ours did, for three weeks. The fix is vanilla's own keyless `TrunkDoorOpened` template, which has a door, a `use` and no key requirement.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#updateAnimationPlayer` (plays `Opened` / `Closed` only when `part.getDoor() != null`) and `#getUseablePart` (area holds the player and a non-empty `use`); `media/scripts/generated/vehicles/template_trunk.txt` and `template_trunk_door.txt`; `Vehicles.Create.TrunkDoorOpen` (unlocks). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Skills are a recommendation; recipes are a gate

A part's `skills = Mechanics:3` does not stop anyone installing it. The skill check in the install and uninstall tests is commented out in vanilla, and the tooltip calls it "Recommended skill". Being under the level lowers the chance of success (by 20 plus 15 for each missing level) and raises the chance of damaging the part. What does block the job: the `recipes`, `professions`, `traits` and `items` requirements and the key.

When you check the player's tools yourself, use the same shape vanilla uses. `VehicleUtils.getItems(playerNum)` returns two tables: `typeToItem`, keyed by the item's full type string, and `tagToItem`, keyed by `ItemTag` **objects**. `tagToItem["base:wrench"]` finds nothing; `tagToItem[ItemTag.WRENCH]` works. See [Item tags from Lua](/pz/build-42/modding/items-and-scripting/item-tags-from-lua).

> **Proof:** Code. `media/lua/server/Vehicles/Vehicles.lua`: `Vehicles.InstallTest.Default` and `Vehicles.UninstallTest.Default` (perk test commented out), `VehicleUtils.calculateInstallationSuccess`, `VehicleUtils.getItems` (`tagToItem[tag]` over `item:getTags():toArray()`); `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua` (`Tooltip_vehicle_recommendedSkill`, `tagToItem[ItemTag.WRENCH]`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## "The van" is seven different vehicles

When someone reports a bug on "the van", ask which one. Grouping vanilla vehicles by the body mesh they draw, 116 intact cars with "Van" in their id fall into seven families (plus 21 burnt or smashed variants with their own meshes):

| Family (body mesh) | Intact cars |
|---|---|
| Van | 55 |
| StepVan | 29 |
| PickUpVan | 12 |
| VanSeats | 9 |
| PickUpVanLights | 8 |
| VanRadio | 2 |
| VanAmbulance | 1 |

They are different models with different parts. In our animated-panels mod they even go through different code paths, and we once instrumented the wrong family for a whole report because "the van" turned out to be a `PickUpVan`. Name the script id (`Base.PickUpVan`, `Base.Van`) in every bug report and log line.

> **Proof:** Code. Counted the `vehicle` blocks under `media/scripts` whose id contains `Van`, grouped by the mesh of their resolved `model { file = ... }` after following `template!`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).
