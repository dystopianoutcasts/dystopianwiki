---
slug: sandbox-options-vehicles
title: 'Sandbox options: vehicles'
game: pz
version: build-42
section: server
category: sandbox-options
difficulty: beginner
tags:
  - server
  - sandbox-options
  - sandbox
  - generated
excerpt: 'How many cars there are, their fuel, condition, locks and alarms, and what a crash does. Every option with its default, the presets that change it, and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-zombies
---
# Sandbox options: vehicles

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

How many cars there are, their fuel, condition, locks and alarms, and what a crash does.

## Vehicles

### EnableVehicles

- **On the settings screen:** "Vehicles".
- **In the file:** `EnableVehicles = true`, read by Lua as `SandboxVars.EnableVehicles`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If vehicles will spawn."
- **Read in:** `zombie.iso.IsoChunk#AddVehicles` (line 1744).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### VehicleEasyUse

- **On the settings screen:** "Easy Use".
- **In the file:** `VehicleEasyUse = false`, read by Lua as `SandboxVars.VehicleEasyUse`. Takes true or false.
- **Default:** `false`. Every preset keeps the default.
- **The game's description:** "Whether found vehicles are locked, need keys to start etc."
- **Read in:** `zombie.characters.IsoGameCharacter#updateUserName` (line 7326); `zombie.characters.IsoGameCharacter#renderlast` (line 7483); `zombie.vehicles.BaseVehicle#trySpawnKey` (line 2923); `zombie.vehicles.BaseVehicle#tryStartEngine` (line 7582); `zombie.vehicles.VehicleEngine#shouldFailToStartDueToCold` (line 334); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.showRadialMenu` (lines 94, 113); `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.Battery` (line 116); `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.Door` (line 134); `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.TrunkDoor` (line 185); `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.GasTank` (line 219); `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.Engine` (line 263); `media/lua/server/Vehicles/Vehicles.lua` in `VehicleUtils.RequiredKeyNotFound` (line 1384).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (19 files, 27 places); `media/lua/client/LastStand/` (2 files, 2 places).

### RecentlySurvivorVehicles

- **On the settings screen:** "Recent Survivor Vehicles".
- **In the file:** `RecentlySurvivorVehicles = 2`, read by Lua as `SandboxVars.RecentlySurvivorVehicles`. Takes a choice from 1 to 4.
- **Choices:** 1 "None", 2 "Low", 3 "Normal", 4 "High".
- **Default:** `2` ("Low") (the Apocalypse preset's value; the Java declaration says `3` ("Normal")). Other presets: Outbreak `3` ("Normal"), Rising `3` ("Normal").
- **The game's description:** "Whether a player can discover a car that has been cared for after the Knox infection struck."
- **Read in:** `zombie.vehicles.BaseVehicle#createPhysics` (lines 854, 858, 862, 866).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieAttractionMultiplier

- **On the settings screen:** "Zombie Attraction Multiplier".
- **In the file:** `ZombieAttractionMultiplier = 1.0`, read by Lua as `SandboxVars.ZombieAttractionMultiplier`. Takes a number from 0.0 to 100.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "General engine loudness to zombies."
- **Read in:** `zombie.vehicles.BaseVehicle#updatePartStats` (line 9127); `zombie.vehicles.VehiclePart#repair` (line 1008); `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.Engine` (line 280).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### CarSpawnRate

- **On the settings screen:** "Vehicle Spawn Rate".
- **In the file:** `CarSpawnRate = 3`, read by Lua as `SandboxVars.CarSpawnRate`. Takes a choice from 1 to 5.
- **Choices:** 1 "None", 2 "Very Low", 3 "Low", 4 "Normal", 5 "High".
- **Default:** `3` ("Low") (the Apocalypse preset's value; the Java declaration says `4` ("Normal")). Other presets: Outbreak `4` ("Normal"), Rising `4` ("Normal").
- **The game's description:** "How frequently vehicles can be discovered on the map."
- **Read in:** `zombie.iso.IsoChunk#AddVehicles_OnZone` (line 994); `zombie.iso.IsoChunk#AddVehicles` (line 1738).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### ChanceHasGas

- **On the settings screen:** "Chance Has Gas".
- **In the file:** `ChanceHasGas = 2`, read by Lua as `SandboxVars.ChanceHasGas`. Takes a choice from 1 to 3.
- **Choices:** 1 "Low", 2 "Normal", 3 "High".
- **Default:** `2` ("Normal"). Other presets: Extinction `1` ("Low"), Six Months Later `1` ("Low").
- **The game's description:** "The chance of finding a vehicle with gas in its tank."
- **Read in:** `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.GasTank` (lines 231, 234).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### InitialGas

- **On the settings screen:** "Initial Gas".
- **In the file:** `InitialGas = 2`, read by Lua as `SandboxVars.InitialGas`. Takes a choice from 1 to 6.
- **Choices:** 1 "Very Low", 2 "Low", 3 "Normal", 4 "High", 5 "Very High", 6 "Full".
- **Default:** `2` ("Low") (the Apocalypse preset's value; the Java declaration says `3` ("Normal")). Other presets: Outbreak `3` ("Normal"), Rising `3` ("Normal").
- **The game's description:** "How full the gas tank of discovered vehicles will be."
- **Read in:** `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.GasTank` (lines 242, 245, 248, 251).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### CarGasConsumption

- **On the settings screen:** "Gas Consumption".
- **In the file:** `CarGasConsumption = 1.0`, read by Lua as `SandboxVars.CarGasConsumption`. Takes a number from 0.0 to 100.0.
- **Default:** `1.0`. Other presets: Rising `0.6`.
- **The game's description:** "How gas-hungry vehicles are."
- **Read in:** `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Update.GasTank` (line 485).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### LockedCar

- **On the settings screen:** "Locked Vehicle Frequency".
- **In the file:** `LockedCar = 4`, read by Lua as `SandboxVars.LockedCar`. Takes a choice from 1 to 6.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often".
- **Default:** `4` ("Sometimes"). Other presets: Outbreak `3` ("Rare"), Extinction `6` ("Very Often"), Rising `3` ("Rare"), Six Months Later `1` ("Never").
- **The game's description:** "How likely cars will be locked"
- **Read in:** `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.Door` (lines 142, 147, 149, 151, 153, 155); `media/lua/server/Vehicles/Vehicles.lua` in `Vehicles.Create.TrunkDoor` (lines 193, 198, 200, 202, 204, 206).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### CarGeneralCondition

- **On the settings screen:** "General Condition".
- **In the file:** `CarGeneralCondition = 3`, read by Lua as `SandboxVars.CarGeneralCondition`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Low", 2 "Low", 3 "Normal", 4 "High", 5 "Very High".
- **Default:** `3` ("Normal"). Other presets: Extinction `2` ("Low"), Six Months Later `1` ("Very Low").
- **The game's description:** "General condition discovered vehicles will be in."
- **Read in:** `zombie.vehicles.VehiclePart#setRandomCondition` (line 275); `zombie.vehicles.VehiclePart#setGeneralCondition` (line 318).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### TrafficJam

- **On the settings screen:** "Car Wreck Congestion".
- **In the file:** `TrafficJam = true`, read by Lua as `SandboxVars.TrafficJam`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If traffic jams consisting of wrecked cars will appear on main roads."
- **Read in:** `zombie.iso.IsoChunk#AddVehicles` (line 1760).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### CarAlarm

- **On the settings screen:** "Vehicle Alarms Frequency".
- **In the file:** `CarAlarm = 3`, read by Lua as `SandboxVars.CarAlarm`. Takes a choice from 1 to 6.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often".
- **Default:** `3` ("Rare") (the Apocalypse preset's value; the Java declaration says `4` ("Sometimes")). Other presets: Extinction `4` ("Sometimes"), Six Months Later `1` ("Never").
- **The game's description:** "How frequently discovered vehicles have active alarms."
- **Read in:** `zombie.iso.IsoChunk#AddVehicles_OnZone` (line 1017); `zombie.iso.IsoChunk#AddVehicles_OnZonePolyline` (line 1161).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### PlayerDamageFromCrash

- **On the settings screen:** "Player Damage from Crash".
- **In the file:** `PlayerDamageFromCrash = true`, read by Lua as `SandboxVars.PlayerDamageFromCrash`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If the player can get injured from being in a car accident."
- **Read in:** `zombie.vehicles.BaseVehicle#damagePlayers` (line 9453).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### CarDamageOnImpact

- **On the settings screen:** "Car Damage on Impact".
- **In the file:** `CarDamageOnImpact = 3`, read by Lua as `SandboxVars.CarDamageOnImpact`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Low", 2 "Low", 3 "Normal", 4 "High", 5 "Very High".
- **Default:** `3` ("Normal"). Every preset keeps the default.
- **The game's description:** "The amount of damage dealt to vehicles that crash."
- **Read in:** `zombie.vehicles.BaseVehicle#crash` (line 4661).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### SirenShutoffHours

- **On the settings screen:** "Siren Shutoff Hours".
- **In the file:** `SirenShutoffHours = 0.0`, read by Lua as `SandboxVars.SirenShutoffHours`. Takes a number from 0.0 to 168.0.
- **Default:** `0.0`. Every preset keeps the default.
- **The game's description:** "How many in-game hours before a wailing siren shuts off."
- **Read in:** `zombie.vehicleSound.VehicleSoundOwner#sirenShutoffTimeExpired` (line 100).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### DamageToPlayerFromHitByACar

- **On the settings screen:** "Player Damage From Vehicle Impact".
- **In the file:** `DamageToPlayerFromHitByACar = 1`, read by Lua as `SandboxVars.DamageToPlayerFromHitByACar`. Takes a choice from 1 to 5.
- **Choices:** 1 "None" = `NONE (0.0F)`, 2 "Low" = `LOW (0.5F)`, 3 "Normal" = `STANDARD (1.0F)`, 4 "High" = `HIGH (2.0F)`, 5 "Very High" = `EXTREME (5.0F)`.
- **Default:** `1` ("None"). Every preset keeps the default.
- **The game's description:** "Damage received by the player from being crashed into."
- **Read in:** `zombie.characters.IsoPlayer#onHitByVehicleApplyDamage` (line 1995); `zombie.characters.IsoPlayer#applyDamageFromVehicleHit` (line 2010).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### SirenEffectsZombies

- **On the settings screen:** "Vehicle Sirens Attract Zombies".
- **In the file:** `SirenEffectsZombies = true`, read by Lua as `SandboxVars.SirenEffectsZombies`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If zombies will head towards the sound of vehicle sirens."
- **Read in:** `zombie.vehicles.BaseVehicle#updateWorldSounds` (line 7836); `zombie.vehicles.VirtualVehicle#updateWorldSounds` (line 98).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
