---
id: build-42-vanilla-mechanics-code-what-it-really-checks
slug: vanilla-mechanics-code-what-it-really-checks
title: 'The vanilla mechanics code: what it really checks'
game: pz
version: build-42
section: vehicles
category: reference
difficulty: intermediate
tags:
  - vehicles
  - mechanics
  - parts
  - multiplayer
excerpt: >-
  Skill never blocks a part job, it only sets the risk, and six levels short
  means certain failure. Recipes, professions and traits do block. A repair
  written to the item is not a repair of the part. A car needs more than 12.5%
  battery to start. Trunks spawn locked, hoods never. What the vanilla
  mechanics code does, read from 42.21.
last_updated: '2026-10-04'
---
# The vanilla mechanics code: what it really checks

Outcast, this page is for anyone who mods car parts and for every player who has argued about why a part refused to come off. We read the vanilla install, uninstall, door and engine code end to end while building our own mechanics mods. Most of it matches what you would guess. These are the places it does not.

For the wider picture of vehicle Lua, see [vehicle engine reference](/pz/build-42/vehicles/reference/vehicle-engine-reference) and [vehicle UI reference](/pz/build-42/vehicles/reference/vehicle-ui-reference).

## Skill sets the risk; recipes, professions and traits block

A part's `install` and `uninstall` tables can list `skills`, `recipes`, `professions`, `traits` and `items`. They are not treated alike:

- **`skills` never blocks.** The skill check in the default install test is commented out in vanilla ("allow all perk, but calculate success/failure risk"). A survivor with no Mechanics at all may try anything; the skill only decides the odds.
- **`recipes`, `professions`, `traits` and `items` block.** Missing any of them and the option is refused outright.
- So does a missing key when the part needs one, and a socket that already holds a part.

> **Proof:** Code. `media/lua/server/Vehicles/Vehicles.lua`, `Vehicles.InstallTest.Default` (`--	if not VehicleUtils.testPerks(chr, keyvalues.skills) then return false end`, then `testRecipes`, `testProfession`, `testTraits`, `testItems`, `VehicleUtils.RequiredKeyNotFound`). Build 42.21, Steam build 25485521.

## The odds, and the cliff at six levels short

Each skill in the list that the survivor is short of takes `20 + 15 x (levels short)` off a 100% success chance:

| Levels short | Success chance |
|---|---|
| 0 | 100% |
| 1 | 65% |
| 2 | 50% |
| 3 | 35% |
| 4 | 20% |
| 5 | 5% |
| 6 or more | 0%: the part can never be moved by this survivor |

When the job fails:

- **Uninstall:** the part stays fitted and loses 5 to 9 condition. Try again, it loses more.
- **Install:** the item comes back to your inventory, sometimes 5 to 9 condition worse.
- Either failure pays 1 Mechanics XP.

One more surprise: **uninstalling reads the skills from the part's `install` table**, not its `uninstall` table. If a mod puts different skill levels in the two tables, the uninstall one is ignored.

> **Proof:** Code. `media/lua/server/Vehicles/Vehicles.lua`, `VehicleUtils.calculateInstallationSuccess` (`success = success - (20 + (level - perkLvl) * 15)`, clamped to 0-100); `media/lua/shared/Vehicles/TimedActions/ISUninstallVehiclePart.lua`, `ISUninstallVehiclePart:complete` (`self.part:getTable("install")` for the skills; on failure `setCondition(... - ZombRand(5,10))` and `addXp(..., 1)`); `ISInstallVehiclePart.lua`, `ISInstallVehiclePart:complete` (failure branches). Build 42.21, Steam build 25485521.

## A repair written to the item is not a repair of the part

A fitted part has its own condition, separate from its item's. `part:setCondition(n)` sets both. `item:setCondition(n)` on the fitted item changes only the item. Every vanilla window reads `part:getCondition()`, and `transmitPartCondition` sends the part's value, so a repair written to the item does not show until the part is removed and fitted again.

**The safe way:** repair through `part:setCondition`, then `vehicle:transmitPartCondition(part)` on the server.

> **Proof:** Code. `zombie.vehicles.VehiclePart#getCondition` returns the part's own field; `VehiclePart#setCondition` writes it and then the item's. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Server test. A repair applied server-side to the item did not appear until refit; the player kept retrying for over a minute, seen in the dedicated server's log. Build 42.20, engine revision a2947723ca.

## A car needs more than 12.5% battery to start

Each start attempt takes 2.5% off the battery **first**, then the engine checks that what is left is at least 10%. So a battery at 12% fails to start (and drops to 9.5%), and a battery at 13% starts. Every failed attempt also costs 2.5%, so a weak battery gets weaker with each try.

> **Proof:** Code. `zombie.vehicles.BaseVehicle`, the start path (`batteryItem.setCurrentUsesFloat(... currentCharge - 0.025F ...)`, then `if (currentCharge <= 0.1F) engineDoStartingFailedNoPower()`); `zombie.vehicles.VehicleEngine#updateStarting` (`getBatteryCharge() < 0.1F`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Trunks spawn locked, hoods never do

A trunk door's create function locks it on spawn according to the "locked car" sandbox setting (from never up to an 80% roll), and a good-condition car's trunk is locked unless that setting is "never". The hood uses the default create function, which never locks it. When a door is locked, the vanilla open action finishes without opening it, with no message and no sound.

> **Proof:** Code. `media/lua/server/Vehicles/Vehicles.lua`, `Vehicles.Create.TrunkDoor` (lock chance by `SandboxVars.LockedCar`) and `Vehicles.Create.Default`; `media/scripts/generated/vehicles/template_engine_door.txt` (`create = Vehicles.Create.Default`); `media/lua/shared/Vehicles/TimedActions/ISOpenVehicleDoor.lua`, `ISOpenVehicleDoor:complete` (opens only `if not ... isLocked()`). Build 42.21, Steam build 25485521.

## In multiplayer, opening an open door plays the animation again

`ISOpenVehicleDoor:isValid()` refuses an already-open door only in single player. In multiplayer it only checks that the part exists, so asking to open an open hood replays the opening. If your mod queues "open the hood, then work", check `getDoor():isOpen()` yourself first.

> **Proof:** Code. `media/lua/shared/Vehicles/TimedActions/ISOpenVehicleDoor.lua`, `ISOpenVehicleDoor:isValid` (the `isOpen` check is inside `if not isClient() and not isServer()`). Build 42.21, Steam build 25485521.

## The lightbar repair is hardcoded by name

Police, sheriff and security vehicles have a `lightbar` part with a repair that is not in any script table. The mechanics window adds it because the part id is exactly `lightbar`, and the repair pays 5 Mechanics XP. A mod that rebuilds the part list from script data alone will lose it.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua` (`if part:getId() == "lightbar" then`); `media/lua/shared/Vehicles/TimedActions/ISRepairLightbar.lua` (`addXp(self.character, Perks.Mechanics, 5)`). Build 42.21, Steam build 25485521.

## The mechanics picture: by script name, or `carMechanicsOverlay`

The car picture in the mechanics window is looked up by the vehicle's full script name in `ISCarMechanicsOverlay.CarList`, unless the vehicle script says `carMechanicsOverlay = Base.SomeCar,`. A reskin or a mod car with a new name and no `carMechanicsOverlay` line gets no picture, in vanilla's own window too. Vanilla's own reskins (for example the branded pickups) declare the line.

One hole in vanilla's art: the `truck_` picture set has no rear windshield image, though the other sets do. A truck-style car with a rear windshield part draws nothing for it.

> **Proof:** Code. `media/lua/client/Vehicles/ISUI/ISVehicleMechanics.lua` (`overlayName` from `getCarMechanicsOverlay()`, else the script name, then `ISCarMechanicsOverlay.CarList[overlayName]`); `zombie.scripting.objects.VehicleScript` loads `carMechanicsOverlay`; listed the installed `media/ui/vehicles/mechanic overlay` folder (`*_window_rear_windshield.png` for eight sets, none for `truck_`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Any part with `engineLoudness` counts as a muffler

When the game recomputes a car's stats, a car with no muffler has its engine loudness doubled. "Has a muffler" means "some fitted part's item declares `engineLoudness` above zero". If your mod gives any other part item an `engineLoudness`, it also hides a missing muffler.

> **Proof:** Code. `zombie.vehicles.BaseVehicle`, the part-stats update (`if (part.getInventoryItem().getEngineLoudness() > 0.0F) { ... foundMuffler = true; }`, then `if (!foundMuffler) engineLoudness *= 2.0F`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Top speed is a plain setter, read only by the driver's physics

`vehicle:setMaxSpeed(n)` just stores a number. It is reset from the vehicle script whenever the car's physics is created (as the car loads into the world), it is not saved, and the only code that reads it is the car physics controller, which runs for the driver. To change a car's top speed, set it where the physics runs and set it again each time the car loads. `changeTransmission` cannot be called from Lua at all: no Lua value converts to its argument type.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#setMaxSpeed` (plain assignment) and `BaseVehicle#createPhysics` (`this.setMaxSpeed(this.getScript().maxSpeed)`); the readers of `getMaxSpeed()` are in `zombie.core.physics.CarController`; `BaseVehicle#changeTransmission(TransmissionNumber)`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Brake readings on a dedicated server

If a server-side mod wants to know how a car is being driven, these are what we measured on a dedicated server: `getBrakingForce()` and `getCurrentSpeedKmHour()` carry real values (speed is signed: negative when reversing). `isBraking()` was always false and `getBrakeSpeedBetweenUpdate()` always 0, in every sample. Do not build server logic on those two.

> **Proof:** Server test. Eight logged samples of each accessor while a player drove and braked, from the dedicated server's log. Build 42.20, engine revision a2947723ca.

## Where to go next

- [Vehicle engine reference](/pz/build-42/vehicles/reference/vehicle-engine-reference)
- [Invented vehicle parts and areas](/pz/build-42/vehicles/reference/invented-vehicle-parts-and-areas)
