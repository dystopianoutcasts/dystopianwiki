---
slug: sandbox-options-time-and-world
title: 'Sandbox options: time and world'
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
excerpt: 'When the world starts, how long a day lasts, when the water and power go off, alarms, locked houses, the weather and the look of the world. Every option with its default, the presets that change it, and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-zombies
  - sandbox-options-loot
---
# Sandbox options: time and world

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

When the world starts, how long a day lasts, when the water and power go off, alarms, locked houses, the weather and the look of the world.

## Time

### DayLength

- **On the settings screen:** "Day Length (in real time)".
- **In the file:** `DayLength = 4`, read by Lua as `SandboxVars.DayLength`. Takes a choice from 1 to 27.
- **Choices:** 1 "15 Minutes", 2 "30 Minutes", 3 "1 Hour", 4 "1 Hour, 30 Minutes", 5 "2 Hours", 6 "3 Hours", 7 "4 Hours", 8 "5 Hours", 9 "6 Hours", 10 "7 Hours", 11 "8 Hours", 12 "9 Hours", 13 "10 Hours", 14 "11 Hours", 15 "12 Hours", 16 "13 Hours", 17 "14 Hours", 18 "15 Hours", 19 "16 Hours", 20 "17 Hours", 21 "18 Hours", 22 "19 Hours", 23 "20 Hours", 24 "21 Hours", 25 "22 Hours", 26 "23 Hours", 27 "Real-time".
- **Default:** `4` ("1 Hour, 30 Minutes"). Other presets: Six Months Later `3` ("1 Hour").
- **Read in:** `zombie.SandboxOptions#getDayLengthMinutes` (line 418); `zombie.SandboxOptions#getDayLengthMinutesDefault` (line 430); `zombie.SandboxOptions#upgradeOptionValue` (lines 1029, 1031, 1035, 1084, 1085).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places); `zombie.SandboxOptions` (5 places).
- **What the code does with it:** Real minutes per in-game day: choice 1 is 15, 2 is 30, 3 is 60, 4 is 90, and from 5 up it is (choice minus 3) times 60.

### TimeSinceApo

- **On the settings screen:** "Months since the Apocalypse".
- **In the file:** `TimeSinceApo = 1`, read by Lua as `SandboxVars.TimeSinceApo`. Takes a choice from 1 to 13.
- **Choices:** 1 "0", 2 "1", 3 "2", 4 "3", 5 "4", 6 "5", 7 "6", 8 "7", 9 "8", 10 "9", 11 "10", 12 "11", 13 "12".
- **Default:** `1` ("0"). Other presets: Six Months Later `7` ("6").
- **The game's description:** "How long after the end of the world to begin. This will affect starting world erosion and food spoilage. Does not affect the starting date."
- **Read in:** `zombie.erosion.ErosionMain#initConfig` (line 353); `zombie.iso.IsoChunk#AddCorpses` (line 461); `zombie.iso.IsoChunk#doLoadGridsquare` (line 3758); `zombie.iso.IsoGridSquare#addCorpse` (line 11689); `zombie.radio.ZomboidRadio#Init` (lines 266, 272, 289); `zombie.SandboxOptions#getTimeSinceApo` (line 394).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### StartMonth

- **On the settings screen:** "Start Month".
- **In the file:** `StartMonth = 7`, read by Lua as `SandboxVars.StartMonth`. Takes a choice from 1 to 12.
- **Choices:** 1 "January", 2 "February", 3 "March", 4 "April", 5 "May", 6 "June", 7 "July", 8 "August", 9 "September", 10 "October", 11 "November", 12 "December".
- **Default:** `7` ("July"). Other presets: Six Months Later `12` ("December").
- **The game's description:** "Month in which the game starts."
- **Read in:** `zombie.SandboxOptions#applySettings` (line 457).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### StartDay

- **On the settings screen:** "Start Day".
- **In the file:** `StartDay = 9`, read by Lua as `SandboxVars.StartDay`. Takes a choice from 1 to 31.
- **Choices:** 1 "1", 2 "2", 3 "3", 4 "4", 5 "5", 6 "6", 7 "7", 8 "8", 9 "9", 10 "10", 11 "11", 12 "12", 13 "13", 14 "14", 15 "15", 16 "16", 17 "17", 18 "18", 19 "19", 20 "20", 21 "21", 22 "22", 23 "23", 24 "24", 25 "25", 26 "26", 27 "27", 28 "28", 29 "29", 30 "30", 31 "31".
- **Default:** `9` ("9") (the Apocalypse preset's value; the Java declaration says `23` ("23")). Every preset keeps the default.
- **The game's description:** "Day of the month in which the games starts."
- **Read in:** `zombie.SandboxOptions#applySettings` (line 458).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (1 file, 1 place).

### StartTime

- **On the settings screen:** "Start Hour".
- **In the file:** `StartTime = 2`, read by Lua as `SandboxVars.StartTime`. Takes a choice from 1 to 9.
- **Choices:** 1 "7 AM", 2 "9 AM", 3 "12 PM", 4 "2 PM", 5 "5 PM", 6 "9 PM", 7 "12 AM", 8 "2 AM", 9 "5 AM".
- **Default:** `2` ("9 AM"). Every preset keeps the default.
- **The game's description:** "Hour of the day in which the game starts."
- **Read in:** `zombie.SandboxOptions#applySettings` (line 461).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

## World

### WaterShutModifier

- **On the settings screen:** "Water Shutoff". The sandbox screen shows it only in debug mode.
- **In the file:** `WaterShutModifier = 14`, read by Lua as `SandboxVars.WaterShutModifier`. Takes a whole number from -1 to 2147483647.
- **Default:** `14`. Other presets: Six Months Later `-1`.
- **The game's description:** "How long after the default start date (July 9, 1993) that plumbing fixtures (eg. sinks) stop being infinite sources of water."
- **Read in:** `zombie.iso.ISWorldObjectContextMenuLogic#fetch` (line 560); `zombie.SandboxOptions#getWaterShutModifier` (line 386); `media/lua/client/OptionScreens/MainScreen.lua` in `MainScreen:setSandboxPreset` (line 1592).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### ElecShutModifier

- **On the settings screen:** "Electricity Shutoff". The sandbox screen shows it only in debug mode.
- **In the file:** `ElecShutModifier = 14`, read by Lua as `SandboxVars.ElecShutModifier`. Takes a whole number from -1 to 2147483647.
- **Default:** `14`. Other presets: Six Months Later `-1`.
- **The game's description:** "How long after the default start date (July 9, 1993) that the world's electricity turns off for good."
- **Read in:** `zombie.inventory.types.Food#setAutoAge` (line 800); `zombie.SandboxOptions#getElecShutModifier` (line 390); `media/lua/client/ISUI/ISButtonPrompt.lua` in `ISButtonPrompt:testInteractButtonAction` (lines 520, 551); `media/lua/client/OptionScreens/MainScreen.lua` in `MainScreen:setSandboxPreset` (line 1595).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### WaterShut

- **On the settings screen:** "Water Shutoff".
- **In the file:** `WaterShut = 2`, read by Lua as `SandboxVars.WaterShut`. Takes a choice from 1 to 9.
- **Choices:** 1 "Instant", 2 "0 - 30 Days", 3 "0 - 2 Months", 4 "0 - 6 Months", 5 "0 - 1 Year", 6 "0 - 5 Years", 7 "2 - 6 Months", 8 "6 - 12 Months", 9 "Disabled".
- **Default:** `2` ("0 - 30 Days"). Other presets: Outbreak `3` ("0 - 2 Months"), Rising `3` ("0 - 2 Months"), Six Months Later `1` ("Instant").
- **The game's description:** "How long after the default start date (July 9, 1993) that plumbing fixtures (eg. sinks) stop being infinite sources of water."
- **Read in:** `media/lua/client/OptionScreens/MainScreen.lua` in `MainScreen:setSandboxPreset` (line 1590).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### ElecShut

- **On the settings screen:** "Electricity Shutoff".
- **In the file:** `ElecShut = 2`, read by Lua as `SandboxVars.ElecShut`. Takes a choice from 1 to 9.
- **Choices:** 1 "Instant", 2 "14 - 30 Days", 3 "14 Days - 2 Months", 4 "14 Days - 6 Months", 5 "14 Days - 1 Year", 6 "14 Days - 5 Years", 7 "2 - 6 Months", 8 "6 - 12 Months", 9 "Disabled".
- **Default:** `2` ("14 - 30 Days"). Other presets: Outbreak `3` ("14 Days - 2 Months"), Rising `3` ("14 Days - 2 Months"), Six Months Later `1` ("Instant").
- **The game's description:** "How long after the default start date (July 9, 1993) that the world's electricity turns off for good."
- **Read in:** `media/lua/client/OptionScreens/MainScreen.lua` in `MainScreen:setSandboxPreset` (line 1591).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### AlarmDecay

- **On the settings screen:** "Alarm Battery Decay".
- **In the file:** `AlarmDecay = 2`, read by Lua as `SandboxVars.AlarmDecay`. Takes a choice from 1 to 6.
- **Choices:** 1 "Instant", 2 "0 - 30 Days", 3 "0 - 2 Months", 4 "0 - 6 Months", 5 "0 - 1 Year", 6 "0 - 5 Years".
- **Default:** `2` ("0 - 30 Days"). Every preset keeps the default.
- **The game's description:** "How long alarm batteries can last for after the power shuts off."
- **Read in:** `zombie.iso.IsoMetaGrid#CreateStep2` (line 1560).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### Alarm

- **On the settings screen:** "House Alarms Frequency".
- **In the file:** `Alarm = 4`, read by Lua as `SandboxVars.Alarm`. Takes a choice from 1 to 6.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often".
- **Default:** `4` ("Sometimes"). Other presets: Extinction `5` ("Often"), Rising `2` ("Extremely Rare"), Six Months Later `1` ("Never").
- **The game's description:** "How likely the player is to activate a house alarm when breaking into a new house."
- **Read in:** `zombie.iso.IsoMetaGrid#CreateStep2` (lines 1543, 1545, 1547, 1549, 1551).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places); `media/lua/client/Tutorial/` (1 file, 1 place).

### LockedHouses

- **On the settings screen:** "Locked Houses Frequency".
- **In the file:** `LockedHouses = 6`, read by Lua as `SandboxVars.LockedHouses`. Takes a choice from 1 to 6.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often".
- **Default:** `6` ("Very Often") (the Apocalypse preset's value; the Java declaration says `4` ("Sometimes")). Other presets: Rising `5` ("Often"), Six Months Later `1` ("Never").
- **The game's description:** "How frequently the doors of homes and buildings will be locked when discovered."
- **Read in:** `zombie.iso.objects.IsoDoor#IsoDoor` (lines 831, 833, 835, 837, 839, 841); `zombie.iso.objects.IsoWindow#IsoWindow` (line 146).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### FireSpread

- **On the settings screen:** "Fire Spread".
- **In the file:** `FireSpread = true`, read by Lua as `SandboxVars.FireSpread`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If fires spread when started."
- **Read in:** `zombie.characters.IsoGameCharacter#SpreadFireMP` (line 8168); `zombie.characters.IsoGameCharacter#SpreadFire` (line 8177); `zombie.iso.objects.IsoDeadBody#IsoDeadBody` (line 409); `zombie.iso.objects.IsoFire#Spread` (line 299).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AllowExteriorGenerator

- **On the settings screen:** "Generator Working in Exterior".
- **In the file:** `AllowExteriorGenerator = true`, read by Lua as `SandboxVars.AllowExteriorGenerator`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If enabled, generators will work on exterior tiles. This will allow, for example, the powering of gas pumps."
- **Read in:** `zombie.iso.IsoGridSquare#haveElectricity` (line 9704); `zombie.iso.IsoObject#getPipedFuelAmount` (line 2576); `zombie.iso.ISWorldObjectContextMenuLogic#doFuelMenu` (line 1947); `zombie.iso.objects.IsoGenerator#setSurroundingElectricity` (line 285); `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua` in `ISVehicleMenu.FillPartMenu` (line 1088).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### GeneratorTileRange

- **On the settings screen:** "Generator tile range".
- **In the file:** `GeneratorTileRange = 20`, read by Lua as `SandboxVars.GeneratorTileRange`. Takes a whole number from 1 to 100.
- **Default:** `20`. Every preset keeps the default.
- **Read in:** `zombie.iso.objects.IsoGenerator#setGeneratorRange` (line 119).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### GeneratorVerticalPowerRange

- **On the settings screen:** "Generator vertical range".
- **In the file:** `GeneratorVerticalPowerRange = 3`, read by Lua as `SandboxVars.GeneratorVerticalPowerRange`. Takes a whole number from 1 to 15.
- **Default:** `3`. Every preset keeps the default.
- **The game's description:** "How many levels both above and below a generator it can provide with electricity."
- **Read in:** `zombie.iso.objects.IsoGenerator#setGeneratorRange` (line 118).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FuelStationGasInfinite

- **On the settings screen:** "Infinite Gas Pumps".
- **In the file:** `FuelStationGasInfinite = false`, read by Lua as `SandboxVars.FuelStationGasInfinite`. Takes true or false.
- **Default:** `false`. Every preset keeps the default.
- **The game's description:** "If enabled, gas pumps will never run out of fuel"
- **Read in:** `zombie.iso.IsoObject#getPipedFuelAmount` (line 2572).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FuelStationGasMin

- **On the settings screen:** "Initial Minimum Gas Pump Amount".
- **In the file:** `FuelStationGasMin = 0.0`, read by Lua as `SandboxVars.FuelStationGasMin`. Takes a number from 0.0 to 1.0.
- **Default:** `0.0`. Other presets: Outbreak `0.5`, Rising `0.7`.
- **The game's description:** "The minimum amount of gasoline that can spawn in gas pumps. Check the "Advanced" box below to use a custom amount."
- **Read in:** `zombie.iso.IsoObject#getPipedFuelAmount` (line 2579).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FuelStationGasMax

- **On the settings screen:** "Initial Maximum Gas Pump Amount".
- **In the file:** `FuelStationGasMax = 0.8`, read by Lua as `SandboxVars.FuelStationGasMax`. Takes a number from 0.0 to 1.0.
- **Default:** `0.8` (the Apocalypse preset's value; the Java declaration says `0.7`). Other presets: Outbreak `0.9`, Extinction `0.7`, Rising `1.0`.
- **The game's description:** "The maximum amount of gasoline that can spawn in gas pumps. Check the "Advanced" box below to use a custom amount."
- **Read in:** `zombie.iso.IsoObject#getPipedFuelAmount` (line 2580).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FuelStationGasEmptyChance

- **On the settings screen:** "Initial Gas Pump Empty Chance".
- **In the file:** `FuelStationGasEmptyChance = 20`, read by Lua as `SandboxVars.FuelStationGasEmptyChance`. Takes a whole number from 0 to 100.
- **Default:** `20`. Other presets: Extinction `25`, Rising `10`.
- **The game's description:** "The chance, as a percentage, that individual gas pumps will initially have no fuel."
- **Read in:** `zombie.iso.IsoObject#getPipedFuelAmount` (line 2589).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### LightBulbLifespan

- **On the settings screen:** "Light Bulb Lifespan".
- **In the file:** `LightBulbLifespan = 2.0`, read by Lua as `SandboxVars.LightBulbLifespan`. Takes a number from 0.0 to 1000.0.
- **Default:** `2.0` (the Apocalypse preset's value; the Java declaration says `1.0`). Other presets: Extinction `1.0`, Rising `3.0`.
- **The game's description:** "The higher the value, the longer lightbulbs last before breaking. If 0, lightbulbs will never break. Does not affect vehicle headlights."
- **Read in:** `zombie.iso.objects.IsoLightSwitch#update` (line 718).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FoodRotSpeed

- **On the settings screen:** "Food Spoilage".
- **In the file:** `FoodRotSpeed = 3`, read by Lua as `SandboxVars.FoodRotSpeed`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Fast", 2 "Fast", 3 "Normal", 4 "Slow", 5 "Very Slow".
- **Default:** `3` ("Normal"). Every preset keeps the default.
- **The game's description:** "How fast that food will spoil, inside or outside of a fridge."
- **Read in:** `zombie.inventory.types.Food#getFoodRotSpeed` (line 732).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### FridgeFactor

- **On the settings screen:** "Refrigeration Effectiveness".
- **In the file:** `FridgeFactor = 3`, read by Lua as `SandboxVars.FridgeFactor`. Takes a choice from 1 to 6.
- **Choices:** 1 "Very Low", 2 "Low", 3 "Normal", 4 "High", 5 "Very High", 6 "No decay".
- **Default:** `3` ("Normal"). Other presets: Outbreak `4` ("High").
- **The game's description:** "How effective a fridge will be at keeping food fresh for longer."
- **Read in:** `zombie.inventory.types.Food#getFridgeFactor` (line 721).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### DaysForRottenFoodRemoval

- **On the settings screen:** "Rotten Food Removal".
- **In the file:** `DaysForRottenFoodRemoval = -1`, read by Lua as `SandboxVars.DaysForRottenFoodRemoval`. Takes a whole number from -1 to 2147483647.
- **Default:** `-1`. Every preset keeps the default.
- **The game's description:** "Number of in-game days before rotten food is removed from the map. -1 means rotten food is never removed."
- **Read in:** `zombie.inventory.types.Food#updateRotting` (lines 706, 712); `zombie.inventory.types.Food#finishupdate` (line 1340); `zombie.inventory.types.Food#shouldUpdateInWorld` (line 1362).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).
- **What the code does with it:** -1 turns it off. From 0 up, rotten food is destroyed once its age passes the age at which it rots (`OffAgeMax`) by this many days, unless it sits in a compost bin.

### WorldItemRemovalList

- **On the settings screen:** "World Item Removal List".
- **In the file:** `WorldItemRemovalList = Base.Hat, Base.Glasses, Base.Maggots, Base.Slug, Base.Slug2, Base.Snail, Base.Worm, Base.Dung_Mouse, Base.Dung_Rat`, read by Lua as `SandboxVars.WorldItemRemovalList`. Takes text.
- **Default:** `Base.Hat, Base.Glasses, Base.Maggots, Base.Slug, Base.Slug2, Base.Snail, Base.Worm, Base.Dung_Mouse, Base.Dung_Rat` (the Apocalypse preset's value; the Java declaration says `Base.Hat,Base.Glasses,Base.Dung_Turkey,Base.Dung_Chicken,Base.Dung_Cow,Base.Dung_Deer,Base.Dung_Mouse,Base.Dung_Pig,Base.Dung_Rabbit,Base.Dung_Rat,Base.Dung_Sheep`). Other presets: Six Months Later `Base.Hat,Base.Glasses,Base.Maggots,Base.Slug,Base.Slug2,Base.Snail,Base.Worm,Base.Dung_Mouse,Base.Dung_Rat`.
- **The game's description:** "A comma-separated list of item types that will be removed after HoursForWorldItemRemoval hours."
- **Read in:** `zombie.SandboxOptions#worldItemRemovalListContains` (lines 1313, 1314, 1315).

### HoursForWorldItemRemoval

- **On the settings screen:** "Hours for Removal List".
- **In the file:** `HoursForWorldItemRemoval = 24.0`, read by Lua as `SandboxVars.HoursForWorldItemRemoval`. Takes a number from 0.0 to 2147483647.0.
- **Default:** `24.0`. Every preset keeps the default.
- **The game's description:** "Number of hours since an item was dropped on the ground before it is removed. Items are removed the next time that part of the map is loaded. Zero means items are not removed."
- **Read in:** `zombie.iso.IsoGridSquare#load` (lines 3233, 3246).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ItemRemovalListBlacklistToggle

- **On the settings screen:** "Removal List as Whitelist".
- **In the file:** `ItemRemovalListBlacklistToggle = false`, read by Lua as `SandboxVars.ItemRemovalListBlacklistToggle`. Takes true or false.
- **Default:** `false`. Every preset keeps the default.
- **The game's description:** "If true, any items \*not\* in WorldItemRemovalList will be removed."
- **Read in:** `zombie.iso.IsoGridSquare#load` (lines 3235, 3237, 3240, 3242).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### Basement.SpawnFrequency

- **On the settings screen:** "Basement Spawn Frequency", in the "Basements" group.
- **In the file:** `Basement = { SpawnFrequency = 4 }`, read by Lua as `SandboxVars.Basement.SpawnFrequency`. Takes a choice from 1 to 7.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often", 7 "Always".
- **Default:** `4` ("Sometimes"). Every preset keeps the default.
- **The game's description:** "How frequently basements spawn at random locations."
- **Not read by the 42.21 code.** We found no place in the Java or the vanilla Lua that reads this option, and its name appears nowhere else as text.
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MaximumFireFuelHours

- **On the settings screen:** "Maximum Fire Fuel Hours", in the "Basements" group.
- **In the file:** `MaximumFireFuelHours = 8`, read by Lua as `SandboxVars.MaximumFireFuelHours`. Takes a whole number from 1 to 168.
- **Default:** `8`. Other presets: Outbreak `12`.
- **The game's description:** "The maximum hours of fuel that can be placed in a campfire, wood stove etc."
- **Read in:** `media/lua/server/Camping/camping_fuel.lua` in `getCampingFuelMax` (line 178).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
