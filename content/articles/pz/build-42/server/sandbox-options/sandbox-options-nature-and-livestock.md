---
slug: sandbox-options-nature-and-livestock
title: 'Sandbox options: nature and livestock'
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
excerpt: 'Farming, foraging, fishing, erosion and the animals. Every option with its default, the presets that change it, and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-zombies
---
# Sandbox options: nature and livestock

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Farming, foraging, fishing, erosion and the animals.

## Nature

### NightDarkness

- **On the settings screen:** "Darkness during night".
- **In the file:** `NightDarkness = 3`, read by Lua as `SandboxVars.NightDarkness`. Takes a choice from 1 to 4.
- **Choices:** 1 "Pitch Black", 2 "Dark", 3 "Normal", 4 "Bright".
- **Default:** `3` ("Normal"). Other presets: Extinction `1` ("Pitch Black").
- **The game's description:** "The level of ambient lighting at night."
- **Read in:** `zombie.core.opengl.RenderSettings$PlayerRenderSettings#updateRenderSettings` (line 163).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### Temperature

- **On the settings screen:** "Temperature".
- **In the file:** `Temperature = 3`, read by Lua as `SandboxVars.Temperature`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Cold", 2 "Cold", 3 "Normal", 4 "Hot", 5 "Very Hot".
- **Default:** `3` ("Normal"). Every preset keeps the default.
- **The game's description:** "The global temperature."
- **Read in:** `zombie.SandboxOptions#getTemperatureModifier` (line 374).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### Rain

- **On the settings screen:** "Rain".
- **In the file:** `Rain = 3`, read by Lua as `SandboxVars.Rain`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Dry", 2 "Dry", 3 "Normal", 4 "Rainy", 5 "Very Rainy".
- **Default:** `3` ("Normal"). Every preset keeps the default.
- **The game's description:** "How often it rains."
- **Read in:** `zombie.SandboxOptions#getRainModifier` (line 378).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### MaxFogIntensity

- **On the settings screen:** "Maximum Fog Intensity".
- **In the file:** `MaxFogIntensity = 1`, read by Lua as `SandboxVars.MaxFogIntensity`. Takes a choice from 1 to 4.
- **Choices:** 1 "Normal", 2 "Moderate", 3 "Low", 4 "None".
- **Default:** `1` ("Normal"). Every preset keeps the default.
- **The game's description:** "Maximum intensity of fog."
- **Read in:** `zombie.iso.weather.fx.IsoWeatherFX#setFogIntensity` (lines 326, 328, 330).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MaxRainFxIntensity

- **On the settings screen:** "Maximum Rain FX Intensity".
- **In the file:** `MaxRainFxIntensity = 1`, read by Lua as `SandboxVars.MaxRainFxIntensity`. Takes a choice from 1 to 3.
- **Choices:** 1 "Normal", 2 "Moderate", 3 "Low".
- **Default:** `1` ("Normal"). Every preset keeps the default.
- **The game's description:** "Maximum intensity of rain."
- **Read in:** `zombie.iso.weather.fx.IsoWeatherFX#setPrecipitationIntensity` (lines 350, 352).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ErosionSpeed

- **On the settings screen:** "Erosion Speed".
- **In the file:** `ErosionSpeed = 4`, read by Lua as `SandboxVars.ErosionSpeed`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Fast (20 Days)", 2 "Fast (50 Days)", 3 "Normal (100 Days)", 4 "Slow (200 Days)", 5 "Very Slow (500 Days)".
- **Default:** `4` ("Slow (200 Days)") (the Apocalypse preset's value; the Java declaration says `3` ("Normal (100 Days)")). Other presets: Extinction `3` ("Normal (100 Days)"), Six Months Later `1` ("Very Fast (20 Days)").
- **The game's description:** "Number of days until the erosion system (which adds vines, long grass, new trees etc. to the world) will reach 100%% growth."
- **Read in:** `zombie.SandboxOptions#getErosionSpeed` (line 382).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### ErosionDays

- **On the settings screen:** "Erosion Days".
- **In the file:** `ErosionDays = 0`, read by Lua as `SandboxVars.ErosionDays`. Takes a whole number from -1 to 36500.
- **Default:** `0`. Every preset keeps the default.
- **The game's description:** "For a custom Erosion Speed. Zero means use the Erosion Speed option. Maximum is 36,500 days (approximately 100 years)."
- **Read in:** `zombie.erosion.ErosionMain#mainTimer` (line 111); `zombie.erosion.ErosionMain#initConfig` (line 355).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FarmingSpeedNew

- **On the settings screen:** "Farming Speed".
- **In the file:** `FarmingSpeedNew = 1.0`, read by Lua as `SandboxVars.FarmingSpeedNew`. Takes a number from 0.1 to 100.0.
- **Default:** `1.0`. Other presets: Outbreak `1.5`.
- **The game's description:** "The speed of plant growth."
- **Read in:** `media/lua/server/Farming/farming_vegetableconf.lua` in `calcNextTimeFactor` (line 106).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### CompostTime

- **On the settings screen:** "Compost Time".
- **In the file:** `CompostTime = 2`, read by Lua as `SandboxVars.CompostTime`. Takes a choice from 1 to 8.
- **Choices:** 1 "1 Week", 2 "2 Weeks", 3 "3 Weeks", 4 "4 Weeks", 5 "6 Weeks", 6 "8 Weeks", 7 "10 Weeks", 8 "12 Weeks".
- **Default:** `2` ("2 Weeks"). Other presets: Outbreak `1` ("1 Week").
- **The game's description:** "How long it takes for food to break down in a composter."
- **Read in:** `zombie.SandboxOptions#getCompostHours` (line 442).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FishAbundance

- **On the settings screen:** "Fishing Abundance".
- **In the file:** `FishAbundance = 2`, read by Lua as `SandboxVars.FishAbundance`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Poor", 2 "Poor", 3 "Normal", 4 "Abundant", 5 "Very Abundant".
- **Default:** `2` ("Poor") (the Apocalypse preset's value; the Java declaration says `3` ("Normal")). Other presets: Outbreak `3` ("Normal"), Rising `3` ("Normal").
- **The game's description:** "The abundance of fish in rivers and lakes."
- **Read in:** `zombie.iso.FishSchoolManager#getNumberOfFishInPoint` (line 314).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### NatureAbundance

- **On the settings screen:** "Nature's Abundance".
- **In the file:** `NatureAbundance = 3`, read by Lua as `SandboxVars.NatureAbundance`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Poor", 2 "Poor", 3 "Normal", 4 "Abundant", 5 "Very Abundant".
- **Default:** `3` ("Normal"). Other presets: Extinction `2` ("Poor"), Six Months Later `5` ("Very Abundant").
- **The game's description:** "The abundance of items found in Foraging mode."
- **No read found.** We found no read of the value. The name appears as text in: `media/lua/shared/Foraging/forageDefinitions.lua` in `<file>` (line 62); `media/lua/shared/Foraging/forageSkills.lua` in `<file>` (lines 560, 567, 574, 581, 609); `media/lua/shared/Foraging/forageSystem.lua` in `forageSystem.getRefillBonus` (line 1466); `media/lua/shared/Foraging/forageZones.lua` in `<file>` (lines 7, 14, 21, 31, 38, 45, 55, 62, 69, 76, 83, 95, 102, 114, 126, 133, 144).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).
- **What the code does with it:** Foraging reads it through a variable: `forageSystem.getRefillBonus` looks up `SandboxVars[abundanceSetting]`, and the forage zones and definitions set `abundanceSetting` to "NatureAbundance" (it is also the fallback). The refill bonus is 1 plus one hundredth of the matching entry in `forageSystem.abundanceSettings`.

### PlantResilience

- **On the settings screen:** "Plant Resilience".
- **In the file:** `PlantResilience = 3`, read by Lua as `SandboxVars.PlantResilience`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very High", 2 "High", 3 "Normal", 4 "Low", 5 "Very Low".
- **Default:** `3` ("Normal"). Other presets: Outbreak `2` ("High"), Extinction `4` ("Low").
- **The game's description:** "How much water plants will lose per day, and their ability to avoid disease."
- **Read in:** `media/lua/server/Farming/SFarmingSystem.lua` in `SFarmingSystem:EveryTenMinutes` (lines 99, 101, 103, 105); `media/lua/server/Farming/SPlantGlobalObject.lua` in `SPlantGlobalObject:defaultDiseaseCheck` (lines 338, 340, 342, 344).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### FarmingAmountNew

- **On the settings screen:** "Farming Abundance".
- **In the file:** `FarmingAmountNew = 1.0`, read by Lua as `SandboxVars.FarmingAmountNew`. Takes a number from 0.1 to 10.0.
- **Default:** `1.0`. Other presets: Outbreak `1.5`.
- **The game's description:** "The abundance of harvested crops."
- **Read in:** `media/lua/server/Farming/farming_vegetableconf.lua` in `getVegetablesNumber` (line 72).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### KillInsideCrops

- **On the settings screen:** "Kill Crops Grown Inside".
- **In the file:** `KillInsideCrops = true`, read by Lua as `SandboxVars.KillInsideCrops`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "When enabled, crops and herbs grown inside buildings will die. Does not affect houseplants."
- **Read in:** `media/lua/server/Farming/SFarmingSystem.lua` in `SFarmingSystem:changeHealth` (line 144).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### PlantGrowingSeasons

- **On the settings screen:** "Plant Growing Seasons".
- **In the file:** `PlantGrowingSeasons = true`, read by Lua as `SandboxVars.PlantGrowingSeasons`. Takes true or false.
- **Default:** `true`. Other presets: Outbreak `false`.
- **The game's description:** "When enabled, the growth of plants is affected by seasons."
- **Read in:** `media/lua/client/Farming/CPlantGlobalObject.lua` in `CPlantGlobalObject:isBadMonth` (line 19); `media/lua/client/Farming/ISUI/ISFarmingMenu.lua` in `ISFarmingMenu.plantInfo` (line 502); `media/lua/client/Farming/ISUI/ISFarmingMenu.lua` in `ISFarmingMenu:doSeedMenu` (line 1014); `media/lua/server/Farming/SFarmingSystem.lua` in `SFarmingSystem:changeHealth` (line 143); `media/lua/server/Farming/SPlantGlobalObject.lua` in `SPlantGlobalObject:isBadMonth` (line 135); `media/lua/server/Farming/SPlantGlobalObject.lua` in `SPlantGlobalObject:isBadMonthHardy` (line 149); `media/lua/server/Farming/SPlantGlobalObject.lua` in `SPlantGlobalObject:isSowMonth` (line 163); `media/lua/server/Farming/SPlantGlobalObject.lua` in `SPlantGlobalObject:isBestMonth` (line 177); `media/lua/server/Farming/SPlantGlobalObject.lua` in `SPlantGlobalObject:isRiskMonth` (line 191); `media/lua/server/Farming/SPlantGlobalObject.lua` in `SPlantGlobalObject:fertilize2` (line 599); `media/lua/server/Farming/SPlantGlobalObject.lua` in `SPlantGlobalObject:seed` (line 725); `media/lua/server/Farming/SPlantGlobalObject.lua` in `SPlantGlobalObject:initHealth` (line 737).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### PlaceDirtAboveground

- **On the settings screen:** "Farms not on Ground Level \[!\]".
- **In the file:** `PlaceDirtAboveground = false`, read by Lua as `SandboxVars.PlaceDirtAboveground`. Takes true or false.
- **Default:** `false`. Every preset keeps the default.
- **The game's description:** "\<BHC\> \[!\] It is recommended that you DO NOT change this. Changing this can result in performance issues. \[!\] \<RGB:1,1,1\> When enabled, dirt can be placed, and farming performed on other than the ground level."
- **Read in:** `media/lua/client/Farming/ISUI/ISFarmingMenu.lua` in `ISFarmingMenu.canDigHereSquare` (line 461).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### EnableSnowOnGround

- **On the settings screen:** "Snow on Ground".
- **In the file:** `EnableSnowOnGround = true`, read by Lua as `SandboxVars.EnableSnowOnGround`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If snow will accumulate on the ground. If disabled, snow will still show on vegetation and rooftops."
- **Read in:** `zombie.iso.fboRenderChunk.FBORenderCell#renderTilesInternal` (line 394); `zombie.iso.IsoCell#setSnowTarget` (line 1856).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### EnableTaintedWaterText

- **On the settings screen:** "Enable 'Tainted Water' tooltip".
- **In the file:** `EnableTaintedWaterText = true`, read by Lua as `SandboxVars.EnableTaintedWaterText`. Takes true or false.
- **Default:** `true`. Other presets: Extinction `false`.
- **The game's description:** "If tainted water will show a warning marking it as such."
- **Read in:** `zombie.characters.IsoGameCharacter#getWaterSource` (line 11548); `zombie.entity.components.fluids.FluidContainer#DoTooltip` (lines 294, 321); `zombie.entity.components.fluids.FluidContainer#getUiName` (lines 419, 460, 477, 492); `zombie.entity.components.fluids.FluidContainer#isTaintedStatusKnown` (line 1364); `zombie.inventory.InventoryItem#DoTooltipEmbedded` (line 1008); `zombie.iso.ISWorldObjectContextMenuLogic#addFluidFromItem` (line 4292); `zombie.iso.ISWorldObjectContextMenuLogic#doDrinkWaterMenu` (line 4331); `zombie.iso.ISWorldObjectContextMenuLogic#createWaterSourceTooltip` (line 4493); `zombie.iso.ISWorldObjectContextMenuLogic#doRecipeUsingWaterMenu` (line 4877); `media/lua/client/ISUI/ISInventoryPane.lua` in `ISInventoryPane:renderdetails` (lines 2324, 2331, 2363, 2367); `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` in `ISInventoryPaneContextMenu.doDrinkForThirstMenu` (line 2353); `media/lua/client/ISUI/ISWorldObjectContextMenu.lua` in `createWaterSourceTooltip` (line 1663); `media/lua/client/ISUI/ISWorldObjectContextMenu.lua` in `CleanBandages.setSubmenu` (line 1893); `media/lua/client/ISUI/ISWorldObjectContextMenu.lua` in `ISWorldObjectContextMenu.doRecipeUsingWaterMenu` (line 2025).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MaximumRatIndex

- **On the settings screen:** "Maximum Vermin Index".
- **In the file:** `MaximumRatIndex = 25`, read by Lua as `SandboxVars.MaximumRatIndex`. Takes a whole number from 0 to 50.
- **Default:** `25`. Every preset keeps the default.
- **The game's description:** "The frequency and intensity of eg. rats in infested buildings."
- **Read in:** `zombie.randomizedWorld.randomizedBuilding.RBBasic#initRDSMap` (line 1063); `zombie.SandboxOptions#getCurrentRatIndex` (line 1180).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### DaysUntilMaximumRatIndex

- **On the settings screen:** "Days Until Maximum Vermin Index".
- **In the file:** `DaysUntilMaximumRatIndex = 90`, read by Lua as `SandboxVars.DaysUntilMaximumRatIndex`. Takes a whole number from 0 to 365.
- **Default:** `90`. Every preset keeps the default.
- **The game's description:** "How long it takes for the Maximum Vermin Index to be reached."
- **Read in:** `zombie.SandboxOptions#getCurrentRatIndex` (line 1181).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ClayLakeChance

- **On the settings screen:** "Clay chance - Lake".
- **In the file:** `ClayLakeChance = 0.05`, read by Lua as `SandboxVars.ClayLakeChance`. Takes a number from 0.0 to 1.0.
- **Default:** `0.05`. Every preset keeps the default.
- **The game's description:** "Chance to turn a dirt floor into a clay floor. Applies to lakes."
- **Read through a name built elsewhere:** `zombie.iso.worldgen.utils.probabilities.ProbaString#ProbaString` (line 21); `media/lua/server/WorldGen/biomes/map/clay_lake.lua` in `<file>` (lines 3, 4, 5, 6).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ClayRiverChance

- **On the settings screen:** "Clay chance - River".
- **In the file:** `ClayRiverChance = 0.05`, read by Lua as `SandboxVars.ClayRiverChance`. Takes a number from 0.0 to 1.0.
- **Default:** `0.05`. Every preset keeps the default.
- **The game's description:** "Chance to turn a dirt floor into a clay floor. Applies to rivers."
- **Read through a name built elsewhere:** `zombie.iso.worldgen.utils.probabilities.ProbaString#ProbaString` (line 21); `media/lua/server/WorldGen/biomes/map/clay_shore.lua` in `<file>` (lines 3, 4, 5, 6).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

## Livestock

### AnimalStatsModifier

- **On the settings screen:** "Stats Reduction Speed".
- **In the file:** `AnimalStatsModifier = 4`, read by Lua as `SandboxVars.AnimalStatsModifier`. Takes a choice from 1 to 6.
- **Choices:** 1 "Ultra Fast", 2 "Very Fast", 3 "Fast", 4 "Normal", 5 "Slow", 6 "Very Slow".
- **Default:** `4` ("Normal"). Every preset keeps the default.
- **The game's description:** "Speed at which animals stats (hunger, thirst etc.) reduce."
- **Read in:** `zombie.characters.animals.datas.AnimalData#getHungerReductionMod` (line 722).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalPregnancyTime

- **On the settings screen:** "Pregnancy Time".
- **In the file:** `AnimalPregnancyTime = 4`, read by Lua as `SandboxVars.AnimalPregnancyTime`. Takes a choice from 1 to 6.
- **Choices:** 1 "Ultra Fast", 2 "Very Fast", 3 "Fast", 4 "Normal", 5 "Slow", 6 "Very Slow".
- **Default:** `4` ("Normal") (the Apocalypse preset's value; the Java declaration says `2` ("Very Fast")). Other presets: Outbreak `3` ("Fast"), Rising `3` ("Fast").
- **The game's description:** "How long animals will be pregnant for before giving birth."
- **Read in:** `zombie.characters.animals.datas.AnimalData#getPregnantPeriod` (line 664); `zombie.characters.animals.datas.AnimalData#getTimeBeforeNextPregnancy` (line 1824).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalEggHatch

- **On the settings screen:** "Egg Hatch Time".
- **In the file:** `AnimalEggHatch = 4`, read by Lua as `SandboxVars.AnimalEggHatch`. Takes a choice from 1 to 6.
- **Choices:** 1 "Ultra Fast", 2 "Very Fast", 3 "Fast", 4 "Normal", 5 "Slow", 6 "Very Slow".
- **Default:** `4` ("Normal") (the Apocalypse preset's value; the Java declaration says `3` ("Fast")). Other presets: Outbreak `3` ("Fast").
- **The game's description:** "How long before baby animals will hatch from eggs."
- **Read in:** `zombie.inventory.types.Food#setTimeToHatch` (line 2405).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalAgeModifier

- **On the settings screen:** "Aging Modifier Speed".
- **In the file:** `AnimalAgeModifier = 4`, read by Lua as `SandboxVars.AnimalAgeModifier`. Takes a choice from 1 to 6.
- **Choices:** 1 "Ultra Fast", 2 "Very Fast", 3 "Fast", 4 "Normal", 5 "Slow", 6 "Very Slow".
- **Default:** `4` ("Normal") (the Apocalypse preset's value; the Java declaration says `3` ("Fast")). Other presets: Outbreak `3` ("Fast").
- **The game's description:** "Speed at which animals age."
- **Read in:** `zombie.characters.animals.datas.AnimalData#getAgeGrowModifier` (line 215).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalMilkIncModifier

- **On the settings screen:** "Milk Increase Speed".
- **In the file:** `AnimalMilkIncModifier = 4`, read by Lua as `SandboxVars.AnimalMilkIncModifier`. Takes a choice from 1 to 6.
- **Choices:** 1 "Ultra Fast", 2 "Very Fast", 3 "Fast", 4 "Normal", 5 "Slow", 6 "Very Slow".
- **Default:** `4` ("Normal") (the Apocalypse preset's value; the Java declaration says `3` ("Fast")). Other presets: Outbreak `3` ("Fast").
- **Read in:** `zombie.characters.animals.datas.AnimalData#getMilkIncModifier` (line 640).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalWoolIncModifier

- **On the settings screen:** "Wool Increase Speed".
- **In the file:** `AnimalWoolIncModifier = 4`, read by Lua as `SandboxVars.AnimalWoolIncModifier`. Takes a choice from 1 to 6.
- **Choices:** 1 "Ultra Fast", 2 "Very Fast", 3 "Fast", 4 "Normal", 5 "Slow", 6 "Very Slow".
- **Default:** `4` ("Normal") (the Apocalypse preset's value; the Java declaration says `3` ("Fast")). Other presets: Outbreak `3` ("Fast").
- **Read in:** `zombie.characters.animals.datas.AnimalData#getWoolIncModifier` (line 651).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalRanchChance

- **On the settings screen:** "Animal Spawn Chance".
- **In the file:** `AnimalRanchChance = 5`, read by Lua as `SandboxVars.AnimalRanchChance`. Takes a choice from 1 to 7.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often", 7 "Always".
- **Default:** `5` ("Often") (the Apocalypse preset's value; the Java declaration says `7` ("Always")). Other presets: Outbreak `6` ("Very Often"), Extinction `4` ("Sometimes"), Rising `6` ("Very Often").
- **The game's description:** "The chance of finding animals in farm."
- **Read in:** `zombie.randomizedWorld.randomizedRanch.RandomizedRanchBase#doRandomRanch` (line 66).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalGrassRegrowTime

- **On the settings screen:** "Grass Regrowth time".
- **In the file:** `AnimalGrassRegrowTime = 240`, read by Lua as `SandboxVars.AnimalGrassRegrowTime`. Takes a whole number from 1 to 9999.
- **Default:** `240`. Every preset keeps the default.
- **The game's description:** "The number of hours grass will regrow after being eaten by an animal or cut by the player."
- **Read in:** `zombie.iso.IsoChunk#CheckGrassRegrowth` (line 4135).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalMetaPredator

- **On the settings screen:** "Meta Predator".
- **In the file:** `AnimalMetaPredator = false`, read by Lua as `SandboxVars.AnimalMetaPredator`. Takes true or false.
- **Default:** `false`. Other presets: Extinction `true`.
- **The game's description:** "If a meta (ie. not actually visible in-game) fox may attack your chickens if the hutch's door is left open at night."
- **Read in:** `zombie.characters.animals.IsoAnimal#checkKilledByMetaPredator` (line 1750).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalMatingSeason

- **On the settings screen:** "Breeding Season".
- **In the file:** `AnimalMatingSeason = true`, read by Lua as `SandboxVars.AnimalMatingSeason`. Takes true or false.
- **Default:** `true`. Other presets: Outbreak `false`.
- **The game's description:** "If on, animals will only mate during their breeding season (if any). Otherwise they can reproduce/lay eggs all year round."
- **Read in:** `zombie.characters.animals.datas.AnimalData#checkEggs` (lines 590, 598); `zombie.characters.animals.datas.AnimalData#isInLayingEggPeriod` (line 2006); `zombie.characters.animals.datas.AnimalData#haveLayingEggPeriod` (line 2012); `zombie.characters.animals.IsoAnimal#isInMatingSeason` (line 2870).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalSoundAttractZombies

- **On the settings screen:** "Animals Attract Zombies".
- **In the file:** `AnimalSoundAttractZombies = true`, read by Lua as `SandboxVars.AnimalSoundAttractZombies`. Takes true or false.
- **Default:** `true` (the Apocalypse preset's value; the Java declaration says `false`). Other presets: Rising `false`.
- **The game's description:** "If true, animal calls will attract nearby zombies."
- **Read in:** `zombie.characters.animals.AnimalSoundState#start` (line 87).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalTrackChance

- **On the settings screen:** "Animal Tracks Chance".
- **In the file:** `AnimalTrackChance = 4`, read by Lua as `SandboxVars.AnimalTrackChance`. Takes a choice from 1 to 6.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often".
- **Default:** `4` ("Sometimes"). Other presets: Outbreak `5` ("Often").
- **The game's description:** "The chance of animals leaving tracks."
- **Read in:** `zombie.characters.animals.AnimalTracksDefinitions#getRandomTrack` (lines 31, 41); `zombie.characters.animals.AnimalZones#spawnAnimalsOnZone` (lines 127, 129).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AnimalPathChance

- **On the settings screen:** "Animal Paths Chance".
- **In the file:** `AnimalPathChance = 4`, read by Lua as `SandboxVars.AnimalPathChance`. Takes a choice from 1 to 6.
- **Choices:** 1 "Never", 2 "Extremely Rare", 3 "Rare", 4 "Sometimes", 5 "Often", 6 "Very Often".
- **Default:** `4` ("Sometimes"). Every preset keeps the default.
- **The game's description:** "The chance of creating a path for animals to be hunted."
- **Read in:** `zombie.iso.worldgen.zones.ZoneGenerator#genAnimalsPath` (lines 171, 207).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
