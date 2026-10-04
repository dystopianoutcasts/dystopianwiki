---
slug: sandbox-options-loot
title: 'Sandbox options: loot'
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
excerpt: 'How much loot there is, of each kind, how it respawns and how already-looted the world looks as time passes. Every option with its default, the presets that change it, and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-zombies
---
# Sandbox options: loot

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

How much loot there is, of each kind, how it respawns and how already-looted the world looks as time passes.

## Loot

### HoursForLootRespawn

- **On the settings screen:** "Hours for Loot Respawn".
- **In the file:** `HoursForLootRespawn = 0`, read by Lua as `SandboxVars.HoursForLootRespawn`. Takes a whole number from 0 to 2147483647.
- **Default:** `0`. Every preset keeps the default.
- **The game's description:** "When greater than 0, after X hours, all containers in towns and trailer parks in the world will respawn loot. To spawn loot a container must have been looted at least once. Loot respawn is not impacted by visibility or subsequent looting."
- **Read in:** `zombie.iso.IsoChunk#Save` (line 4509); `zombie.LootRespawn#getRespawnInterval` (line 105).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### SeenHoursPreventLootRespawn

- **On the settings screen:** "Loot Seen Prevent Hours".
- **In the file:** `SeenHoursPreventLootRespawn = 0`, read by Lua as `SandboxVars.SeenHoursPreventLootRespawn`. Takes a whole number from 0 to 2147483647.
- **Default:** `0`. Every preset keeps the default.
- **The game's description:** "When greater than 0, loot will not respawn in zones that have been visited within this number of in-game hours."
- **Read in:** `zombie.LootRespawn#respawnInChunk` (line 111).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MaxItemsForLootRespawn

- **On the settings screen:** "Max Items For Loot Respawn".
- **In the file:** `MaxItemsForLootRespawn = 5`, read by Lua as `SandboxVars.MaxItemsForLootRespawn`. Takes a whole number from 0 to 2147483647.
- **Default:** `5`. Every preset keeps the default.
- **The game's description:** "Containers with a number of items greater, or equal to, this setting will not respawn."
- **Read in:** `zombie.LootRespawn#respawnInContainer` (line 161).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ConstructionPreventsLootRespawn

- **On the settings screen:** "Construction Prevents Loot Respawn".
- **In the file:** `ConstructionPreventsLootRespawn = true`, read by Lua as `SandboxVars.ConstructionPreventsLootRespawn`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "Items will not respawn in buildings that players have barricaded or built in."
- **Read in:** `zombie.LootRespawn#respawnInChunk` (line 109).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MaximumLooted

- **On the settings screen:** "Maximum Looted Building Chance".
- **In the file:** `MaximumLooted = 25`, read by Lua as `SandboxVars.MaximumLooted`. Takes a whole number from 0 to 200.
- **Default:** `25` (the Apocalypse preset's value; the Java declaration says `50`). Other presets: Extinction `50`, Rising `0`.
- **The game's description:** "The chance that any building will already be looted when found. Check the "Advanced" box below to use a custom number."
- **Read in:** `zombie.SandboxOptions#getCurrentLootedChance` (line 1210).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).
- **What the code does with it:** The looted chance grows with the days since the world began: this value times the days, divided by `DaysUntilMaximumLooted`, with the days capped at that number. 0 turns it off, and a `DaysUntilMaximumLooted` of 0 gives the full value from the first day. A "Rich" square gets 1.5 times, and the result is at least 1.

### DaysUntilMaximumLooted

- **On the settings screen:** "Days Until Max Looted Building Chance".
- **In the file:** `DaysUntilMaximumLooted = 90`, read by Lua as `SandboxVars.DaysUntilMaximumLooted`. Takes a whole number from 0 to 3650.
- **Default:** `90`. Other presets: Extinction `60`.
- **The game's description:** "How long it takes for Maximum Looted Building Chance to be reached."
- **Read in:** `zombie.SandboxOptions#getCurrentLootedChance` (line 1211).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### RuralLooted

- **On the settings screen:** "Rural Building Looted Chance Multiplier".
- **In the file:** `RuralLooted = 0.5`, read by Lua as `SandboxVars.RuralLooted`. Takes a number from 0.0 to 2.0.
- **Default:** `0.5`. Other presets: Extinction `1.0`.
- **The game's description:** "The chance that any rural building will already be looted when found. Check the "Advanced" box below to use a custom number."
- **Read in:** `zombie.SandboxOptions#getCurrentLootedChance` (line 1228); `zombie.SandboxOptions#getCurrentDiminishedLootPercentage` (line 1266).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).
- **What the code does with it:** On a square outside every town region, the looted chance is multiplied by this value after it is cut to a whole number: anything below 1.0 gives 0 (the chance then becomes its floor of 1), 1.0 to 1.99 leaves it unchanged, 2.0 doubles it. The diminished-loot percentage (`getCurrentDiminishedLootPercentage`) is cut the same way, and there below 1.0 means none.

### MaximumDiminishedLoot

- **On the settings screen:** "Maximum Diminished Loot Percentage".
- **In the file:** `MaximumDiminishedLoot = 20`, read by Lua as `SandboxVars.MaximumDiminishedLoot`. Takes a whole number from 0 to 100.
- **Default:** `20` (the Apocalypse preset's value; the Java declaration says `0`). Other presets: Extinction `0`.
- **The game's description:** "The maximum loot that won't spawn when Days Until Maximum Diminished Loot is reached. Check the "Advanced" box below to use an exact percentage."
- **Read in:** `zombie.SandboxOptions#getCurrentDiminishedLootPercentage` (line 1248).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### DaysUntilMaximumDiminishedLoot

- **On the settings screen:** "Days Until Maximum Diminished Loot".
- **In the file:** `DaysUntilMaximumDiminishedLoot = 3650`, read by Lua as `SandboxVars.DaysUntilMaximumDiminishedLoot`. Takes a whole number from 0 to 3650.
- **Default:** `3650`. Other presets: Extinction `1825`.
- **The game's description:** "How long it takes for Maximum Diminished Loot Percentage to be reached."
- **Read in:** `zombie.SandboxOptions#getCurrentDiminishedLootPercentage` (line 1249).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MaximumLootedBuildingRooms

- **On the settings screen:** "Maximum Looted Building Rooms".
- **In the file:** `MaximumLootedBuildingRooms = 50`, read by Lua as `SandboxVars.MaximumLootedBuildingRooms`. Takes a whole number from 0 to 200.
- **Default:** `50`. Every preset keeps the default.
- **The game's description:** "If a building has more than this amount of rooms it will not be looted."
- **Read in:** `zombie.randomizedWorld.randomizedBuilding.RBLooted#isValid` (line 105); `zombie.randomizedWorld.randomizedBuilding.RBShopLooted#isValid` (lines 106, 107, 108); `zombie.randomizedWorld.randomizedBuilding.RBTrashed#isValid` (line 86).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FoodLootNew

- **On the settings screen:** "Perishable Food", in the "Loot rarity" group.
- **In the file:** `FoodLootNew = 0.8`, read by Lua as `SandboxVars.FoodLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.8` (the Apocalypse preset's value; the Java declaration says `0.6`). Other presets: Extinction `0.4`, Rising `0.6`.
- **The game's description:** "Any food that can rot or spoil."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 472).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### CannedFoodLootNew

- **On the settings screen:** "Non-Perishable Food", in the "Loot rarity" group.
- **In the file:** `CannedFoodLootNew = 0.6`, read by Lua as `SandboxVars.CannedFoodLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Extinction `0.4`.
- **The game's description:** "Canned and dried food, beverages."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 476).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### WeaponLootNew

- **On the settings screen:** "Melee Weapons", in the "Loot rarity" group.
- **In the file:** `WeaponLootNew = 0.6`, read by Lua as `SandboxVars.WeaponLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Outbreak `0.8`, Extinction `0.4`, Rising `0.4`.
- **The game's description:** "Weapons that are not tools in other categories."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 473).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### RangedWeaponLootNew

- **On the settings screen:** "Ranged Weapons", in the "Loot rarity" group.
- **In the file:** `RangedWeaponLootNew = 1.2`, read by Lua as `SandboxVars.RangedWeaponLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `1.2` (the Apocalypse preset's value; the Java declaration says `0.6`). Other presets: Extinction `0.6`, Rising `0.4`.
- **The game's description:** "Also includes weapon attachments."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 474).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AmmoLootNew

- **On the settings screen:** "Ammo", in the "Loot rarity" group.
- **In the file:** `AmmoLootNew = 0.6`, read by Lua as `SandboxVars.AmmoLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Extinction `0.2`, Rising `0.4`.
- **The game's description:** "Loose ammo, boxes and magazines."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 475).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MedicalLootNew

- **On the settings screen:** "Medical", in the "Loot rarity" group.
- **In the file:** `MedicalLootNew = 0.6`, read by Lua as `SandboxVars.MedicalLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Extinction `0.4`.
- **The game's description:** "Medicine, bandages and first aid tools."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 479).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### SurvivalGearsLootNew

- **On the settings screen:** "Survival Essentials", in the "Loot rarity" group.
- **In the file:** `SurvivalGearsLootNew = 0.6`, read by Lua as `SandboxVars.SurvivalGearsLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Extinction `0.4`, Rising `2.0`.
- **The game's description:** "Fishing Rods, Tents, camping gear etc."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 478).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MechanicsLootNew

- **On the settings screen:** "Mechanics", in the "Loot rarity" group.
- **In the file:** `MechanicsLootNew = 0.6`, read by Lua as `SandboxVars.MechanicsLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Every preset keeps the default.
- **The game's description:** "Vehicle parts and the tools needed to install them."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 480).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### SkillBookLoot

- **On the settings screen:** "Skill Books", in the "Loot rarity" group.
- **In the file:** `SkillBookLoot = 0.6`, read by Lua as `SandboxVars.SkillBookLoot`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Outbreak `1.0`, Extinction `0.4`, Rising `0.4`.
- **The game's description:** "Books that provide skill XP multipliers."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 491).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### RecipeResourceLoot

- **On the settings screen:** "Recipe Resources", in the "Loot rarity" group.
- **In the file:** `RecipeResourceLoot = 0.6`, read by Lua as `SandboxVars.RecipeResourceLoot`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Extinction `0.4`, Rising `0.8`.
- **The game's description:** "Items that teach recipes."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 492).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### LiteratureLootNew

- **On the settings screen:** "Other Literature", in the "Loot rarity" group.
- **In the file:** `LiteratureLootNew = 0.6`, read by Lua as `SandboxVars.LiteratureLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Outbreak `0.8`.
- **The game's description:** "All other items that can be read, including books, fliers, and newspapers."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 477).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ClothingLootNew

- **On the settings screen:** "Clothing", in the "Loot rarity" group.
- **In the file:** `ClothingLootNew = 0.6`, read by Lua as `SandboxVars.ClothingLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Every preset keeps the default.
- **The game's description:** "All wearable items that are not containers."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 481).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ContainerLootNew

- **On the settings screen:** "Bags", in the "Loot rarity" group.
- **In the file:** `ContainerLootNew = 0.6`, read by Lua as `SandboxVars.ContainerLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Extinction `0.4`.
- **The game's description:** "Backpacks and other wearable/equippable containers, eg. cases."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 482).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### KeyLootNew

- **On the settings screen:** "Keys", in the "Loot rarity" group.
- **In the file:** `KeyLootNew = 0.4`, read by Lua as `SandboxVars.KeyLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.4` (the Apocalypse preset's value; the Java declaration says `0.6`). Other presets: Outbreak `0.6`, Rising `0.6`.
- **The game's description:** "Keys for buildings/cars, key rings, and locks."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (lines 483, 484); `zombie.vehicles.BaseVehicle#<field initializer>` (line 441); `zombie.VirtualZombieManager#getKeySpawnChanceD100` (line 69).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MediaLootNew

- **On the settings screen:** "Media", in the "Loot rarity" group.
- **In the file:** `MediaLootNew = 0.6`, read by Lua as `SandboxVars.MediaLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Outbreak `1.2`, Extinction `0.4`, Rising `2.0`.
- **The game's description:** "VHS tapes and CDs."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 485).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MementoLootNew

- **On the settings screen:** "Mementos", in the "Loot rarity" group.
- **In the file:** `MementoLootNew = 0.6`, read by Lua as `SandboxVars.MementoLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Every preset keeps the default.
- **The game's description:** "Spiffo items, plushies, and other collectible keepsake items eg. Photos."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 486).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### CookwareLootNew

- **On the settings screen:** "Cooking", in the "Loot rarity" group.
- **In the file:** `CookwareLootNew = 0.6`, read by Lua as `SandboxVars.CookwareLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Outbreak `2.0`, Rising `2.0`.
- **The game's description:** "Items that are used in cooking, including those (eg. knives) which can be weapons. Does not include food. Includes both usable and unusable items."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 487).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MaterialLootNew

- **On the settings screen:** "Material", in the "Loot rarity" group.
- **In the file:** `MaterialLootNew = 0.6`, read by Lua as `SandboxVars.MaterialLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Rising `3.0`.
- **The game's description:** "Items and weapons that are used as ingredients for crafting or building. This is a general category that does not include items belonging to other categories such as Cookware or Medical. Does not include Tools."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 488).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FarmingLootNew

- **On the settings screen:** "Farming", in the "Loot rarity" group.
- **In the file:** `FarmingLootNew = 0.6`, read by Lua as `SandboxVars.FarmingLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Rising `2.0`.
- **The game's description:** "Items and weapons which are used in both animal and plant agriculture, such as Seeds, Trowels, or Shovels."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 489).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ToolLootNew

- **On the settings screen:** "Tools", in the "Loot rarity" group.
- **In the file:** `ToolLootNew = 0.6`, read by Lua as `SandboxVars.ToolLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.6`. Other presets: Outbreak `1.0`, Extinction `0.4`, Rising `2.0`.
- **The game's description:** "Items and weapons which are Tools but don't fit in other categories such as Mechanics or Farming."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 490).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### OtherLootNew

- **On the settings screen:** "Other", in the "Loot rarity" group.
- **In the file:** `OtherLootNew = 0.8`, read by Lua as `SandboxVars.OtherLootNew`. Takes a number from 0.0 to 4.0.
- **Default:** `0.8` (the Apocalypse preset's value; the Java declaration says `0.6`). Other presets: Extinction `0.4`, Rising `1.0`.
- **The game's description:** "Everything else. Also affects foraging for all items in Town/Road zones."
- **Read in:** `zombie.inventory.ItemPickerJava#InitSandboxLootSettings` (line 471).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### GeneratorSpawning

- **On the settings screen:** "Generators", in the "Loot rarity" group.
- **In the file:** `GeneratorSpawning = 4`, read by Lua as `SandboxVars.GeneratorSpawning`. Takes a choice from 1 to 7.
- **Choices:** 1 "None (not recommended)", 2 "Insanely Rare", 3 "Extremely Rare", 4 "Rare", 5 "Normal", 6 "Common", 7 "Abundant".
- **Default:** `4` ("Rare") (the Apocalypse preset's value; the Java declaration says `5` ("Normal")). Other presets: Outbreak `5` ("Normal"), Extinction `2` ("Insanely Rare").
- **The game's description:** "The chance of electrical generators spawning on the map."
- **Read in:** `zombie.inventory.ItemPickerJava#getLootModifierFromType` (line 1519); `zombie.iso.IsoCell#ProcessSpottedRooms` (line 4196).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### LootItemRemovalList

- **On the settings screen:** "Loot Item Removal List", in the "Loot rarity" group.
- **In the file:** `LootItemRemovalList = `, read by Lua as `SandboxVars.LootItemRemovalList`. Takes text.
- **Default:** (empty). Every preset keeps the default.
- **The game's description:** "A comma-separated list of item types that won't spawn as ordinary loot."
- **Read in:** `zombie.SandboxOptions#lootItemRemovalListContains` (lines 1302, 1303, 1304); `media/lua/shared/Foraging/forageSystem.lua` in `forageSystem.setOptionValues` (line 765).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (2 files, 2 places).

### RemoveStoryLoot

- **On the settings screen:** "Remove Unwanted Story Loot", in the "Loot rarity" group.
- **In the file:** `RemoveStoryLoot = false`, read by Lua as `SandboxVars.RemoveStoryLoot`. Takes true or false.
- **Default:** `false`. Every preset keeps the default.
- **The game's description:** "If enabled, items on the Loot Item Removal List, or that have their rarity set to 'None', will not spawn in randomised world stories."
- **Read in:** `zombie.iso.IsoChunk#addItemOnGround` (line 5351); `zombie.randomizedWorld.randomizedBuilding.RandomizedBuildingBase#addWorldItem` (lines 602, 648); `zombie.randomizedWorld.randomizedBuilding.RandomizedBuildingBase#trySpawnStoryItem` (line 683); `zombie.randomizedWorld.RandomizedWorldBase#addItemOnGround` (lines 1038, 1068, 1076); `zombie.randomizedWorld.RandomizedWorldBase#addItemOnGroundNoLoot` (lines 1048, 1084); `zombie.randomizedWorld.RandomizedWorldBase#addItemOnGroundStatic` (lines 1058, 1092); `zombie.randomizedWorld.RandomizedWorldBase#trySpawnStoryItem` (lines 2354, 2360, 2366, 2372, 2376); `media/lua/server/RandomizedWorldContent/StoryTable_Initialization.lua` in `StoryTables.addItemToClutterTable` (line 9).

### RemoveZombieLoot

- **On the settings screen:** "Remove Unwanted Zombie Loot", in the "Loot rarity" group.
- **In the file:** `RemoveZombieLoot = false`, read by Lua as `SandboxVars.RemoveZombieLoot`. Takes true or false.
- **Default:** `false`. Every preset keeps the default.
- **The game's description:** "If enabled, items on the Loot Item Removal List, or that have their rarity set to 'None', will not spawn worn by, or attached to, zombies."
- **Read in:** `zombie.characters.AttachedItems.AttachedWeaponDefinitions#addAttachedWeapon` (line 115).

### RollsMultiplier

- **On the settings screen:** "Rolls Multiplier \[!\]", in the "Loot rarity" group.
- **In the file:** `RollsMultiplier = 1.0`, read by Lua as `SandboxVars.RollsMultiplier`. Takes a number from 0.1 to 100.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "\<BHC\> \[!\] It is recommended that you DO NOT change this. \[!\] \<RGB:1,1,1\> Can be used to adjust the number of rolls made on loot tables when spawning loot. Will not reduce the number of rolls below 1. Can negatively affect performance if set to high values. It is highly recommended that this not be changed."
- **Read in:** `zombie.inventory.ItemPickerJava#doRollItemInternal` (line 1024); `zombie.inventory.ItemPickerJava#rollContainerItemInternal` (line 1284).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ZombiePopLootEffect

- **On the settings screen:** "Zombie Population Loot Effect", in the "Loot rarity" group.
- **In the file:** `ZombiePopLootEffect = 0`, read by Lua as `SandboxVars.ZombiePopLootEffect`. Takes a whole number from 0 to 20.
- **Default:** `0` (the Apocalypse preset's value; the Java declaration says `10`). Other presets: Extinction `10`.
- **The game's description:** "If greater than 0, the spawn of loot is increased relative to the number of nearby zombies, with the effect multiplied by this number."
- **Read in:** `zombie.inventory.ItemPickerJava#getZombieDensityFactor` (lines 2122, 2136).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
