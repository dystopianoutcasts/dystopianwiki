---
slug: sandbox-options-meta-events
title: 'Sandbox options: meta events and stories'
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
excerpt: 'The helicopter, distant gunshots and other meta events, generators, annotated maps and the randomised stories in houses, on roads and in zones. Every option with its default, the presets that change it, and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-zombies
---
# Sandbox options: meta events and stories

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

The helicopter, distant gunshots and other meta events, generators, annotated maps and the randomised stories in houses, on roads and in zones.

## Meta

### Helicopter

- **On the settings screen:** "Helicopter".
- **In the file:** `Helicopter = 2`, read by Lua as `SandboxVars.Helicopter`. Takes a choice from 1 to 4.
- **Choices:** 1 "Never", 2 "Once", 3 "Sometimes", 4 "Often".
- **Default:** `2` ("Once"). Other presets: Extinction `3` ("Sometimes"), Rising `1` ("Never").
- **The game's description:** "How regularly a helicopter passes over the Event Zone."
- **Read in:** `zombie.GameTime#init` (line 351); `zombie.GameTime#update` (lines 507, 508, 512).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MetaEvent

- **On the settings screen:** "Meta Event".
- **In the file:** `MetaEvent = 2`, read by Lua as `SandboxVars.MetaEvent`. Takes a choice from 1 to 3.
- **Choices:** 1 "Never", 2 "Sometimes", 3 "Often".
- **Default:** `2` ("Sometimes"). Other presets: Extinction `3` ("Often").
- **The game's description:** "How often zombie-attracting metagame events like distant gunshots will occur."
- **Read in:** `zombie.GameTime#update` (lines 471, 475, 481); `zombie.GameTime#doMetaEvents` (lines 689, 693).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### SleepingEvent

- **On the settings screen:** "Sleeping Event".
- **In the file:** `SleepingEvent = 1`, read by Lua as `SandboxVars.SleepingEvent`. Takes a choice from 1 to 3.
- **Choices:** 1 "Never", 2 "Sometimes", 3 "Often".
- **Default:** `1` ("Never"). Every preset keeps the default.
- **The game's description:** "How often events during the player's sleep, like nightmares, occur."
- **Read in:** `zombie.ai.sadisticAIDirector.SleepingEvent#setPlayerFallAsleep` (lines 74, 82, 135).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### GeneratorFuelConsumption

- **On the settings screen:** "Generator Fuel Consumption".
- **In the file:** `GeneratorFuelConsumption = 0.1`, read by Lua as `SandboxVars.GeneratorFuelConsumption`. Takes a number from 0.0 to 100.0.
- **Default:** `0.1`. Every preset keeps the default.
- **The game's description:** "How much fuel is consumed by generators per in-game hour."
- **Read in:** `zombie.iso.objects.IsoGenerator#update` (line 210); `zombie.iso.objects.IsoGenerator#addPoweredItem` (line 380); `zombie.iso.objects.IsoGenerator#getBasePowerConsumption` (line 497); `zombie.iso.objects.IsoGenerator#getBasePowerConsumptionString` (line 501); `zombie.iso.objects.IsoGenerator#getTotalPowerUsing` (line 740); `zombie.iso.objects.IsoGenerator#getTotalPowerUsingString` (line 744).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### SurvivorHouseChance

- **On the settings screen:** "Randomized Building Chance".
- **In the file:** `SurvivorHouseChance = 3`, read by Lua as `SandboxVars.SurvivorHouseChance`. Takes a choice from 1 to 7.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often", 7 "Always Tries".
- **Default:** `3` ("Rare"). Other presets: Outbreak `4` ("Sometimes"), Extinction `2` ("Extremely Rare").
- **The game's description:** "The chance of finding randomized buildings on the map (eg. burnt out houses, ones containing loot stashes or dead bodies)."
- **Read in:** `zombie.randomizedWorld.randomizedBuilding.RandomizedBuildingBase#ChunkLoaded` (lines 244, 262); `zombie.randomizedWorld.randomizedBuilding.RBBasic#randomizeBuilding` (lines 211, 231).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (11 files, 11 places); `media/lua/client/LastStand/` (2 files, 2 places).

### VehicleStoryChance

- **On the settings screen:** "Randomized Road Stories Chance".
- **In the file:** `VehicleStoryChance = 3`, read by Lua as `SandboxVars.VehicleStoryChance`. Takes a choice from 1 to 7.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often", 7 "Always Tries".
- **Default:** `3` ("Rare"). Every preset keeps the default.
- **The game's description:** "The chance of road stories (eg. police roadblocks) spawning."
- **Read in:** `zombie.randomizedWorld.randomizedVehicleStory.RandomizedVehicleStoryBase#doRandomStory` (line 75).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (14 files, 14 places); `media/lua/client/LastStand/` (2 files, 2 places).

### ZoneStoryChance

- **On the settings screen:** "Randomized Zone Stories Chance".
- **In the file:** `ZoneStoryChance = 3`, read by Lua as `SandboxVars.ZoneStoryChance`. Takes a choice from 1 to 7.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often", 7 "Always Tries".
- **Default:** `3` ("Rare"). Every preset keeps the default.
- **The game's description:** "The chance of stories specific to map zones (eg. a campsite in a forest) spawning."
- **Read in:** `zombie.randomizedWorld.randomizedZoneStory.RandomizedZoneStoryBase#doRandomStory` (line 101).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnnotatedMapChance

- **On the settings screen:** "Annotated Map Chance".
- **In the file:** `AnnotatedMapChance = 4`, read by Lua as `SandboxVars.AnnotatedMapChance`. Takes a choice from 1 to 6.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often".
- **Default:** `4` ("Sometimes"). Other presets: Outbreak `5` ("Often"), Extinction `2` ("Extremely Rare").
- **The game's description:** "How often a looted map will have notes on it, written by a deceased survivor."
- **Read in:** `zombie.core.stash.StashSystem#checkStashItem` (line 102).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### HoursForCorpseRemoval

- **On the settings screen:** "Time Before Corpse Removal".
- **In the file:** `HoursForCorpseRemoval = 216.0`, read by Lua as `SandboxVars.HoursForCorpseRemoval`. Takes a number from -1.0 to 2147483647.0.
- **Default:** `216.0` (the Apocalypse preset's value; the Java declaration says `-1.0`). Every preset keeps the default.
- **The game's description:** "How long, in hours, before dead zombie bodies disappear from the world. If 0, maggots will not spawn on corpses."
- **Read in:** `zombie.iso.objects.IsoDeadBody#updateBodies` (line 1593).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).
- **What the code does with it:** 0 or less: the corpse pass does nothing. Otherwise each rot stage of a human corpse lasts a third of this many hours, and of an animal corpse a quarter. The pass runs everywhere except on a multiplayer client.

### DecayingCorpseHealthImpact

- **On the settings screen:** "Decaying Corpse Health Impact".
- **In the file:** `DecayingCorpseHealthImpact = 3`, read by Lua as `SandboxVars.DecayingCorpseHealthImpact`. Takes a choice from 1 to 5.
- **Choices:** 1 "None", 2 "Low", 3 "Normal", 4 "High", 5 "Insane".
- **Default:** `3` ("Normal"). Other presets: Extinction `4` ("High").
- **The game's description:** "The impact that nearby decaying bodies has on the player's health and emotions."
- **Read in:** `zombie.characters.BodyDamage.BodyDamage#getSicknessFromCorpsesRate` (lines 2461, 2465); `zombie.characters.BodyDamage.BodyDamage#UpdateIllness` (line 2486); `zombie.characters.Moodles.Moodle#Update` (line 564); `zombie.FliesSound#update` (line 50).
- **Set (not read) in:** `media/lua/client/LastStand/` (3 files, 3 places).

### ZombieHealthImpact

- **On the settings screen:** "Zombie Health Impact".
- **In the file:** `ZombieHealthImpact = false`, read by Lua as `SandboxVars.ZombieHealthImpact`. Takes true or false.
- **Default:** `false`. Other presets: Extinction `true`.
- **The game's description:** "Whether nearby "living" zombies have the same impact on the player's health and emotions."
- **Read in:** `zombie.iso.CorpseCount#getCorpseCount` (line 87).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### BloodLevel

- **On the settings screen:** "Blood Level".
- **In the file:** `BloodLevel = 3`, read by Lua as `SandboxVars.BloodLevel`. Takes a choice from 1 to 5.
- **Choices:** 1 "None", 2 "Low", 3 "Normal", 4 "High", 5 "Ultra Gore".
- **Default:** `3` ("Normal"). Every preset keeps the default.
- **The game's description:** "How much blood is sprayed on floors and walls by injuries."
- **Read in:** `zombie.characters.IsoGameCharacter#doDeathSplatterAndSounds` (lines 2080, 2090, 2108, 2116, 2148, 2164); `zombie.characters.IsoGameCharacter#addBloodFromVehicleImpact` (lines 14528, 14538, 14556); `zombie.characters.IsoZombie#addBloodFromVehicleImpact` (lines 4075, 4085, 4103, 4107, 4123); `zombie.CombatManager#splash` (lines 413, 423, 443, 462); `zombie.network.GameClient#receiveBloodSplatter` (lines 1912, 1923, 1935).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### BloodSplatLifespanDays

- **On the settings screen:** "Blood Splat Lifespan Days".
- **In the file:** `BloodSplatLifespanDays = 0`, read by Lua as `SandboxVars.BloodSplatLifespanDays`. Takes a whole number from 0 to 365.
- **Default:** `0`. Every preset keeps the default.
- **The game's description:** "Number of days before old blood splats are removed. Removal happens when map chunks are loaded. 0 means they will never disappear."
- **Read in:** `zombie.iso.IsoChunk#LoadFromDiskOrBufferInternal` (line 3537); `zombie.iso.IsoObject#load` (line 1273).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MaggotSpawn

- **On the settings screen:** "Corpse Maggot Spawn".
- **In the file:** `MaggotSpawn = 1`, read by Lua as `SandboxVars.MaggotSpawn`. Takes a choice from 1 to 3.
- **Choices:** 1 "In and Around Bodies", 2 "In Bodies Only", 3 "Never".
- **Default:** `1` ("In and Around Bodies"). Every preset keeps the default.
- **The game's description:** "If/when maggots can spawn in corpses."
- **Read in:** `zombie.iso.objects.IsoDeadBody#updateRotting` (lines 1719, 1737, 1754).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (1 file, 1 place); `media/lua/client/LastStand/` (2 files, 2 places).

### MetaKnowledge

- **On the settings screen:** "Media List Meta Knowledge".
- **In the file:** `MetaKnowledge = 3`, read by Lua as `SandboxVars.MetaKnowledge`. Takes a choice from 1 to 3.
- **Choices:** 1 "Fully revealed", 2 "Shown as ???", 3 "Completely hidden".
- **Default:** `3` ("Completely hidden"). Every preset keeps the default.
- **The game's description:** "If a piece of media hasn't been fully seen or read, this setting determines whether it's displayed fully, displayed as "???", or hidden completely."
- **Read in:** `media/lua/client/ISUI/ISLiteratureUI.lua` in `ISLiteratureList:doDrawItem` (line 78); `media/lua/client/ISUI/ISLiteratureUI.lua` in `ISLiteratureMediaList:doDrawItem` (line 189); `media/lua/client/ISUI/ISLiteratureUI.lua` in `ISLiteratureUI:setLists` (line 427); `media/lua/client/ISUI/ISLiteratureUI.lua` in `ISLiteratureUI:onRecipeSelected` (line 557).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### DayNightCycle

- **On the settings screen:** "Day / Night Cycle".
- **In the file:** `DayNightCycle = 1`, read by Lua as `SandboxVars.DayNightCycle`. Takes a choice from 1 to 3.
- **Choices:** 1 "Normal", 2 "Endless Day", 3 "Endless Night".
- **Default:** `1` ("Normal"). Every preset keeps the default.
- **The game's description:** "Whether the time of day changes naturally, or it's always day/night."
- **Read in:** `zombie.erosion.season.ErosionSeason#isEndlessDay` (line 480); `zombie.erosion.season.ErosionSeason#isEndlessNight` (line 484); `zombie.GameTime#isEndlessDay` (line 1319); `zombie.GameTime#isEndlessNight` (line 1323).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ClimateCycle

- **On the settings screen:** "Climate Cycle".
- **In the file:** `ClimateCycle = 1`, read by Lua as `SandboxVars.ClimateCycle`. Takes a choice from 1 to 6.
- **Choices:** 1 "Normal", 2 "No Weather", 3 "Endless Rain", 4 "Endless Storm", 5 "Endless Snow", 6 "Endless Blizzard".
- **Default:** `1` ("Normal"). Every preset keeps the default.
- **The game's description:** "Whether weather changes or remains at a single state."
- **Read in:** `zombie.iso.weather.ClimateManager#updateSandboxOverrides` (line 924).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FogCycle

- **On the settings screen:** "Fog Cycle".
- **In the file:** `FogCycle = 1`, read by Lua as `SandboxVars.FogCycle`. Takes a choice from 1 to 3.
- **Choices:** 1 "Normal", 2 "No Fog", 3 "Endless Fog".
- **Default:** `1` ("Normal"). Every preset keeps the default.
- **The game's description:** "Whether fog occurs naturally, never occurs, or is always present."
- **Read in:** `zombie.iso.weather.ClimateManager#updateSandboxOverrides` (lines 974, 975).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.FenceThumpersRequired

- **On the settings screen:** "Zombies To Damage Fences".
- **In the file:** `ZombieLore = { FenceThumpersRequired = 25 }`, read by Lua as `SandboxVars.ZombieLore.FenceThumpersRequired`. Takes a whole number from -1 to 100.
- **Default:** `25` (the Apocalypse preset's value; the Java declaration says `50`). Other presets: Extinction `20`, Six Months Later `50`.
- **The game's description:** "How many zombies it takes to damage a tall fence."
- **Read in:** `zombie.iso.BentFences#getThumpersRequired` (line 885).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombieLore.FenceDamageMultiplier

- **On the settings screen:** "Fence Damage Multiplier".
- **In the file:** `ZombieLore = { FenceDamageMultiplier = 1.0 }`, read by Lua as `SandboxVars.ZombieLore.FenceDamageMultiplier`. Takes a number from 0.01 to 100.0.
- **Default:** `1.0`. Other presets: Extinction `1.5`.
- **The game's description:** "How quickly zombies damage tall fences."
- **Read in:** `zombie.iso.BentFences#getFenceDamageMultiplier` (line 889).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### Map.AllowWorldMap

- **On the settings screen:** "Allow World Map", in the "In-game Map" group.
- **In the file:** `Map = { AllowWorldMap = true }`, read by Lua as `SandboxVars.Map.AllowWorldMap`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If enabled, the world map can be accessed."
- **Read in:** `media/lua/client/ISUI/Maps/ISWorldMap.lua` in `ISWorldMap.IsAllowed` (line 1493).
- **Set (not read) in:** `media/lua/client/LastStand/` (3 files, 3 places).

### Map.AllowMiniMap

- **On the settings screen:** "Allow Mini-Map", in the "In-game Map" group.
- **In the file:** `Map = { AllowMiniMap = false }`, read by Lua as `SandboxVars.Map.AllowMiniMap`. Takes true or false.
- **Default:** `false`. Other presets: Outbreak `true`, Rising `true`.
- **The game's description:** "If enabled, a mini-map window will be available."
- **Read in:** `media/lua/client/ISUI/Maps/ISMiniMap.lua` in `ISMiniMap.IsAllowed` (line 687).
- **Set (not read) in:** `media/lua/client/LastStand/` (3 files, 3 places).
- **What the code does with it:** The minimap is allowed only when the world map is allowed and this is true. The default is false, so a server that keeps the defaults has no minimap: see [the missing minimap](/pz/build-42/modding/multiplayer/missing-minimap-check-the-sandbox-first).

### Map.MapAllKnown

- **On the settings screen:** "All Known On Start", in the "In-game Map" group.
- **In the file:** `Map = { MapAllKnown = false }`, read by Lua as `SandboxVars.Map.MapAllKnown`. Takes true or false.
- **Default:** `false`. Every preset keeps the default.
- **The game's description:** "If enabled, the world map will be completely filled in on starting the game."
- **Read in:** `zombie.worldMap.WorldMapVisited#setBounds` (line 139); `zombie.worldMap.WorldMapVisited#getInstance` (line 895).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### Map.MapNeedsLight

- **On the settings screen:** "Light Needed To Read Map", in the "In-game Map" group.
- **In the file:** `Map = { MapNeedsLight = true }`, read by Lua as `SandboxVars.Map.MapNeedsLight`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If enabled, maps can't be read unless there's a source of light available."
- **Read in:** `media/lua/client/ISUI/Maps/ISMiniMap.lua` in `ISMiniMap.NeedsLight` (line 693); `media/lua/client/ISUI/Maps/ISWorldMap.lua` in `ISWorldMap.NeedsLight` (line 1497).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
