---
slug: sandbox-options-character
title: 'Sandbox options: character and XP'
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
excerpt: 'Character creation points, injuries, needs, reading, weapons and the XP multipliers for every skill. Every option with its default, the presets that change it, and where Build 42.21 reads it.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - sandbox-options-directory
  - sandbox-options-time-and-world
  - sandbox-options-zombies
---
# Sandbox options: character and XP

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Character creation points, injuries, needs, reading, weapons and the XP multipliers for every skill.

## Character

### StatsDecrease

- **On the settings screen:** "Stats Decrease".
- **In the file:** `StatsDecrease = 3`, read by Lua as `SandboxVars.StatsDecrease`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Fast", 2 "Fast", 3 "Normal", 4 "Slow", 5 "Very Slow".
- **Default:** `3` ("Normal"). Every preset keeps the default.
- **The game's description:** "How fast the player's hunger, thirst, and fatigue will decrease."
- **Read in:** `zombie.SandboxOptions#getStatsDecreaseMultiplier` (line 408).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### EndRegen

- **On the settings screen:** "Endurance Regeneration".
- **In the file:** `EndRegen = 3`, read by Lua as `SandboxVars.EndRegen`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Fast", 2 "Fast", 3 "Normal", 4 "Slow", 5 "Very Slow".
- **Default:** `3` ("Normal"). Other presets: Outbreak `2` ("Fast").
- **The game's description:** "Recovery from being tired after performing actions."
- **Read in:** `zombie.SandboxOptions#getEnduranceRegenMultiplier` (line 398).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### Nutrition

- **On the settings screen:** "Nutrition System".
- **In the file:** `Nutrition = true`, read by Lua as `SandboxVars.Nutrition`. Takes true or false.
- **Default:** `true` (the Apocalypse preset's value; the Java declaration says `false`). Every preset keeps the default.
- **The game's description:** "Nutritional value of food affects the player's condition. Turning this off will stop the player gaining or losing weight."
- **Read in:** `zombie.characters.BodyDamage.Nutrition#update` (line 65).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (15 files, 15 places); `media/lua/client/LastStand/` (2 files, 2 places).

### StarterKit

- **On the settings screen:** "Starter Kit".
- **In the file:** `StarterKit = false`, read by Lua as `SandboxVars.StarterKit`. Takes true or false.
- **Default:** `false`. Other presets: Rising `true`.
- **The game's description:** "Spawn with Chips, a Water Bottle, a Small Backpack, a Baseball Bat, and a Hammer."
- **Read in:** `media/lua/shared/Items/SpawnItems.lua` in `SpawnItems.OnNewGame` (line 149).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (18 files, 18 places); `media/lua/client/LastStand/` (4 files, 4 places).

### CharacterFreePoints

- **On the settings screen:** "Free Trait Points".
- **In the file:** `CharacterFreePoints = 0`, read by Lua as `SandboxVars.CharacterFreePoints`. Takes a whole number from -100 to 100.
- **Default:** `0`. Every preset keeps the default.
- **The game's description:** "Adds free points during character creation."
- **Read in:** `media/lua/client/OptionScreens/CharacterCreationProfession.lua` in `CharacterCreationProfession:PointToSpend` (lines 863, 864).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ConstructionBonusPoints

- **On the settings screen:** "Player-built Construction Strength".
- **In the file:** `ConstructionBonusPoints = 3`, read by Lua as `SandboxVars.ConstructionBonusPoints`. Takes a choice from 1 to 5.
- **Choices:** 1 "Very Low", 2 "Low", 3 "Normal", 4 "High", 5 "Very High".
- **Default:** `3` ("Normal"). Other presets: Outbreak `4` ("High"), Rising `4` ("High").
- **The game's description:** "Gives player-built constructions extra hit points so they are more resistant to zombie damage."
- **Read in:** `media/lua/server/BuildingObjects/ISBuildIsoEntity.lua` in `ISBuildIsoEntity:setInfo` (line 661).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### InjurySeverity

- **On the settings screen:** "Injury Severity".
- **In the file:** `InjurySeverity = 2`, read by Lua as `SandboxVars.InjurySeverity`. Takes a choice from 1 to 3.
- **Choices:** 1 "Low" = `LOW (0.5F)`, 2 "Normal" = `NORMAL (1.0F)`, 3 "High" = `HIGH (1.5F)`.
- **Default:** `2` ("Normal"). Other presets: Outbreak `1` ("Low"), Extinction `3` ("High"), Rising `1` ("Low").
- **The game's description:** "The impact that injuries have on your body, and their healing time."
- **Read in:** `zombie.characters.BodyDamage.BodyPart#setCut` (line 784); `zombie.characters.BodyDamage.BodyPart#setScratched` (line 830); `zombie.characters.BodyDamage.BodyPart#SetScratchedWeapon` (line 859); `zombie.characters.BodyDamage.BodyPart#generateDeepWound` (line 880); `zombie.characters.BodyDamage.BodyPart#generateDeepShardWound` (line 901); `zombie.characters.BodyDamage.BodyPart#generateFractureNew` (line 932); `zombie.characters.BodyDamage.BodyPart#SetScratchedWindow` (line 958); `zombie.characters.BodyDamage.BodyPart#getPain` (line 1060); `zombie.characters.BodyDamage.BodyPart#setHaveBullet` (line 1202); `zombie.characters.BodyDamage.BodyPart#setBurned` (line 1326); `zombie.characters.BodyDamage.BodyPart#generateBleeding` (line 1887); `zombie.characters.IsoPlayer#applyDamageFromVehicleHit` (line 2024); `zombie.vehicles.BaseVehicle#addRandomDamageFromCrash` (line 9500).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### BoneFracture

- **On the settings screen:** "Bone Fracture".
- **In the file:** `BoneFracture = true`, read by Lua as `SandboxVars.BoneFracture`. Takes true or false.
- **Default:** `true`. Other presets: Rising `false`.
- **The game's description:** "If survivors can get broken limbs from impacts, zombie damage, falls etc."
- **Read in:** `zombie.characters.BodyDamage.BodyPart#generateFracture` (line 916); `zombie.characters.IsoGameCharacter#handleLandingImpact` (lines 2515, 2528); `zombie.characters.IsoPlayer#applyDamageFromVehicleHit` (lines 2031, 2037, 2044); `zombie.vehicles.BaseVehicle#addRandomDamageFromCrash` (line 9513).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MuscleStrainFactor

- **On the settings screen:** "Muscle Strain Factor".
- **In the file:** `MuscleStrainFactor = 0.7`, read by Lua as `SandboxVars.MuscleStrainFactor`. Takes a number from 0.0 to 10.0.
- **Default:** `0.7` (the Apocalypse preset's value; the Java declaration says `1.0`). Other presets: Outbreak `0.6`, Extinction `1.0`.
- **The game's description:** "Functions as a multiplier when applying muscle strain from swinging weapons or carrying heavy loads."
- **Read in:** `zombie.characters.IsoGameCharacter#addCombatMuscleStrain` (lines 16333, 16344, 16382); `zombie.characters.IsoGameCharacter#addRightLegMuscleStrain` (lines 16394, 16396); `zombie.characters.IsoGameCharacter#addBackMuscleStrain` (lines 16404, 16406); `zombie.characters.IsoGameCharacter#addNeckMuscleStrain` (lines 16413, 16415); `zombie.characters.IsoGameCharacter#addArmMuscleStrain` (lines 16421, 16423); `zombie.characters.IsoGameCharacter#addLeftArmMuscleStrain` (lines 16431, 16433).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### DiscomfortFactor

- **On the settings screen:** "Discomfort Factor".
- **In the file:** `DiscomfortFactor = 0.8`, read by Lua as `SandboxVars.DiscomfortFactor`. Takes a number from 0.0 to 10.0.
- **Default:** `0.8` (the Apocalypse preset's value; the Java declaration says `1.0`). Other presets: Outbreak `0.7`, Extinction `1.0`.
- **The game's description:** "Functions as a multiplier when applying discomfort from worn items."
- **Read in:** `zombie.scripting.objects.Item#getDiscomfortModifier` (lines 3368, 3370).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### WoundInfectionFactor

- **On the settings screen:** "Wound Infection Damage Factor".
- **In the file:** `WoundInfectionFactor = 1.0`, read by Lua as `SandboxVars.WoundInfectionFactor`. Takes a number from 0.0 to 10.0.
- **Default:** `1.0` (the Apocalypse preset's value; the Java declaration says `0.0`). Other presets: Extinction `2.0`.
- **The game's description:** "If greater than zero damage can be taken from serious wound infections."
- **Read in:** `zombie.characters.BodyDamage.BodyDamage#Update` (line 2284); `zombie.characters.BodyDamage.BodyDamage#getGeneralWoundInfectionLevel` (lines 3168, 3182).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### ClothingDegradation

- **On the settings screen:** "Clothing Degradation".
- **In the file:** `ClothingDegradation = 3`, read by Lua as `SandboxVars.ClothingDegradation`. Takes a choice from 1 to 4.
- **Choices:** 1 "Disabled", 2 "Slow", 3 "Normal", 4 "Fast".
- **Default:** `3` ("Normal"). Other presets: Extinction `4` ("Fast").
- **The game's description:** "How quickly clothing degrades, becomes dirty, and bloodied."
- **Read in:** `zombie.characters.IsoZombie#addRandomBloodDirtHolesEtc` (line 4559); `zombie.characterTextures.BloodClothingType#addBlood` (line 124); `zombie.characterTextures.BloodClothingType#addDirt` (line 134); `zombie.inventory.types.Clothing#getClothingDirtynessIncreaseLevel` (lines 831, 834).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### NoBlackClothes

- **On the settings screen:** "No Black Clothes".
- **In the file:** `NoBlackClothes = true`, read by Lua as `SandboxVars.NoBlackClothes`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If true clothing with randomized tints will not be so dark to be virtually black."
- **Read in:** `zombie.core.skinnedmodel.population.OutfitRNG#randomImmutableColor` (line 83).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### RearVulnerability

- **On the settings screen:** "Rear Vulnerability".
- **In the file:** `RearVulnerability = 3`, read by Lua as `SandboxVars.RearVulnerability`. Takes a choice from 1 to 3.
- **Choices:** 1 "Low", 2 "Medium", 3 "High".
- **Default:** `3` ("High"). Other presets: Rising `2` ("Medium").
- **The game's description:** "Chance of being bitten when a zombie attacks from behind."
- **Read in:** `zombie.characters.BodyDamage.BodyDamage#AddRandomDamageFromZombie` (lines 1313, 1319, 1335, 1341).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiHitZombies

- **On the settings screen:** "Weapon Multi Hit".
- **In the file:** `MultiHitZombies = false`, read by Lua as `SandboxVars.MultiHitZombies`. Takes true or false.
- **Default:** `false`. Other presets: Outbreak `true`, Rising `true`.
- **The game's description:** "If certain melee weapons will be able to strike multiple zombies in one hit."
- **Read in:** `zombie.CombatManager#calculateHitInfoList` (line 2313); `zombie.network.anticheats.AntiCheatHitWeapon#isRateExceeded` (line 68).
- **Set (not read) in:** `media/lua/client/LastStand/` (4 files, 4 places).

### FirearmUseDamageChance

- **On the settings screen:** "Firearms Use Damage Chance".
- **In the file:** `FirearmUseDamageChance = 2`, read by Lua as `SandboxVars.FirearmUseDamageChance`. Takes a choice from 1 to 3.
- **Choices:** 1 "Disabled", 2 "Zombies only", 3 "All types of target".
- **Default:** `2` ("Zombies only"). Every preset keeps the default.
- **The game's description:** "Replaces Chance-To-Hit mechanics with Chance-To-Damage calculations. This mode prioritizes player aiming."
- **Read in:** `zombie.CombatManager#attackCollisionCheck` (lines 773, 774).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FirearmNoiseMultiplier

- **On the settings screen:** "Firearm Noise Multiplier".
- **In the file:** `FirearmNoiseMultiplier = 1.0`, read by Lua as `SandboxVars.FirearmNoiseMultiplier`. Takes a number from 0.2 to 2.0.
- **Default:** `1.0`. Other presets: Extinction `1.25`.
- **The game's description:** "A multiplier for the distance at which zombies can hear gunshots."
- **Read in:** `zombie.debug.debugWindows.FirearmPanel#doSettingTweaks` (line 104); `media/lua/shared/TimedActions/ISReloadWeaponAction.lua` in `ISReloadWeaponAction.attackHook` (line 443).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FirearmJamMultiplier

- **On the settings screen:** "Firearm Jam Multiplier".
- **In the file:** `FirearmJamMultiplier = 1.0`, read by Lua as `SandboxVars.FirearmJamMultiplier`. Takes a number from 0.0 to 10.0.
- **Default:** `1.0` (the Apocalypse preset's value; the Java declaration says `0.0`). Other presets: Extinction `1.25`.
- **The game's description:** "Multiplier for firearm jamming chance. 0 disables jamming."
- **Read in:** `zombie.inventory.types.HandWeapon#checkJam` (line 2151).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places); `media/lua/client/Tutorial/` (1 file, 1 place).

### FirearmMoodleMultiplier

- **On the settings screen:** "Firearm Moodle Multiplier".
- **In the file:** `FirearmMoodleMultiplier = 1.0`, read by Lua as `SandboxVars.FirearmMoodleMultiplier`. Takes a number from 0.0 to 10.0.
- **Default:** `1.0`. Other presets: Extinction `1.25`.
- **The game's description:** "Multiplier for Moodle effects on hit chance. 0 disables Moodle penalty."
- **Read in:** `zombie.CombatManager#getMoodlesPenalty` (line 2574).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FirearmWeatherMultiplier

- **On the settings screen:** "Firearm Weather Multiplier".
- **In the file:** `FirearmWeatherMultiplier = 1.0`, read by Lua as `SandboxVars.FirearmWeatherMultiplier`. Takes a number from 0.0 to 10.0.
- **Default:** `1.0`. Other presets: Extinction `1.25`.
- **The game's description:** "Multiplier for the effects of weather (wind, rain and fog) on hit chance. 0 disables weather effect."
- **Read in:** `zombie.CombatManager#getWeatherPenalty` (line 2609).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### FirearmHeadGearEffect

- **On the settings screen:** "Firearm Headgear Effect".
- **In the file:** `FirearmHeadGearEffect = true`, read by Lua as `SandboxVars.FirearmHeadGearEffect`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "Enable to have headgear like welding masks affect hit chance"
- **Read in:** `zombie.CombatManager#calculateHitChanceData` (line 2776).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AttackBlockMovements

- **On the settings screen:** "Melee Movement Disruption".
- **In the file:** `AttackBlockMovements = true`, read by Lua as `SandboxVars.AttackBlockMovements`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If melee attacking slows you down."
- **Read in:** `zombie.ai.states.PlayerDraggingCorpse#OnAnimEvent_BlockMovement` (line 135); `zombie.ai.states.SwipeStatePlayer#OnAnimEvent_BlockMovement` (line 315).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### AllClothesUnlocked

- **On the settings screen:** "All Clothing Unlocked".
- **In the file:** `AllClothesUnlocked = false`, read by Lua as `SandboxVars.AllClothesUnlocked`. Takes true or false.
- **Default:** `false`. Every preset keeps the default.
- **The game's description:** "Allows you to select from every piece of clothing in the game when customizing your character"
- **Read in:** `zombie.SandboxOptions#getAllClothesUnlocked` (line 1176).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### EnablePoisoning

- **On the settings screen:** "Enable Poisoning".
- **In the file:** `EnablePoisoning = 1`, read by Lua as `SandboxVars.EnablePoisoning`. Takes a choice from 1 to 3.
- **Choices:** 1 "True", 2 "False", 3 "Only bleach poisoning is disabled".
- **Default:** `1` ("True"). Every preset keeps the default.
- **The game's description:** "If poison can be added to food."
- **Read in:** `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` in `ISInventoryPaneContextMenu.doEvorecipeMenu` (lines 4267, 4283).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (1 file, 1 place); `media/lua/client/LastStand/` (2 files, 2 places).

### LiteratureCooldown

- **On the settings screen:** "Literature Cooldown Days".
- **In the file:** `LiteratureCooldown = 45`, read by Lua as `SandboxVars.LiteratureCooldown`. Takes a whole number from 1 to 365.
- **Default:** `45` (the Apocalypse preset's value; the Java declaration says `90`). Other presets: Outbreak `30`, Extinction `90`, Rising `90`.
- **The game's description:** "Number of days before one can benefit from reading previously read literature items."
- **Read in:** `zombie.characters.IsoGameCharacter#isLiteratureRead` (line 14982).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### NegativeTraitsPenalty

- **On the settings screen:** "Negative Traits Penalty".
- **In the file:** `NegativeTraitsPenalty = 1`, read by Lua as `SandboxVars.NegativeTraitsPenalty`. Takes a choice from 1 to 4.
- **Choices:** 1 "None", 2 "1 point penalty for every 3 negative traits selected", 3 "1 point penalty for every 2 negative traits selected", 4 "1 point penalty for every negative trait selected after the first".
- **Default:** `1` ("None"). Every preset keeps the default.
- **The game's description:** "If there are diminishing returns on bonus trait points provided from selecting multiple negative traits."
- **Read in:** `media/lua/client/OptionScreens/CharacterCreationProfession.lua` in `CharacterCreationProfession:render` (line 818); `media/lua/client/OptionScreens/CharacterCreationProfession.lua` in `CharacterCreationProfession:PointToSpend` (line 862); `media/lua/client/OptionScreens/CharacterCreationProfession.lua` in `CharacterCreationProfession:negativeTraitOffset` (line 919).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MinutesPerPage

- **On the settings screen:** "Minutes Per Skill Book Page".
- **In the file:** `MinutesPerPage = 2.0`, read by Lua as `SandboxVars.MinutesPerPage`. Takes a number from 0.0 to 60.0.
- **Default:** `2.0`. Every preset keeps the default.
- **The game's description:** "The number of in-game minutes it takes to read one page of a skill book."
- **Read in:** `media/lua/shared/TimedActions/ISReadABook.lua` in `ISReadABook:new` (line 488).
- **Set (not read) in:** `media/lua/client/DebugUIs/Scenarios/` (1 file, 1 place); `media/lua/client/LastStand/` (2 files, 2 places).

### LevelForDismantleXPCutoff

- **On the settings screen:** "Maximum Dismantling XP Level".
- **In the file:** `LevelForDismantleXPCutoff = 0`, read by Lua as `SandboxVars.LevelForDismantleXPCutoff`. Takes a whole number from 0 to 10.
- **Default:** `0`. Every preset keeps the default.
- **The game's description:** "When a skill is at this level or above, scrapping furniture does not provide XP for the relevant skill. Does not apply to Electrical."
- **Read in:** `media/lua/shared/Moveables/ISMoveableSpriteProps.lua` in `ISMoveableSpriteProps:scrapGiveXp` (line 3821).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### LevelForMediaXPCutoff

- **On the settings screen:** "Maximum Media XP Level".
- **In the file:** `LevelForMediaXPCutoff = 3`, read by Lua as `SandboxVars.LevelForMediaXPCutoff`. Takes a whole number from 0 to 10.
- **Default:** `3`. Every preset keeps the default.
- **The game's description:** "When a skill is at this level or above, television/VHS/other media will not provide XP for it."
- **Read in:** `media/lua/shared/RadioCom/ISRadioInteractions.lua` in `doSkill` (line 7).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### EasyClimbing

- **On the settings screen:** "Easy Climbing".
- **In the file:** `EasyClimbing = false`, read by Lua as `SandboxVars.EasyClimbing`. Takes true or false.
- **Default:** `false`. Other presets: Rising `true`.
- **The game's description:** "Disables the failure chances when climbing sheet ropes or over walls."
- **Read in:** `zombie.ai.states.ClimbDownSheetRopeState#execute` (line 85); `zombie.ai.states.ClimbOverWallState#setParams` (line 315); `zombie.ai.states.ClimbSheetRopeState#execute` (line 96); `zombie.pathfind.nativeCode.PathFindRequest#init` (line 83).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### SeeNotLearntRecipe

- **On the settings screen:** "See Not Known Recipes".
- **In the file:** `SeeNotLearntRecipe = true`, read by Lua as `SandboxVars.SeeNotLearntRecipe`. Takes true or false.
- **Default:** `true`. Every preset keeps the default.
- **The game's description:** "If true, you will be able to see any recipes that can be done with a station, even if you haven't learnt them yet."
- **Read in:** `zombie.characters.IsoGameCharacter#isRecipeKnown` (lines 11574, 11584, 11602); `zombie.scripting.objects.Item#getUsedInRecipes` (line 3686); `zombie.scripting.objects.Item#isUsedInBuildRecipes` (line 3746); `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua` in `ISInventoryPaneContextMenu.doLiteratureMenu` (lines 1127, 1131); `media/lua/client/ISUI/ISLiteratureUI.lua` in `ISLiteratureList:doDrawItem` (line 116); `media/lua/client/ISUI/ISLiteratureUI.lua` in `ISLiteratureUI:onRecipeSelected` (line 558).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Global

- **On the settings screen:** "Global Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Global = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Global`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "The rate at which all skills level up."
- **Read in:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17540); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 57).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).
- **What the code does with it:** Multiplies the XP gain in `IsoGameCharacter.XP#AddXP` while `MultiplierConfig.GlobalToggle` is true. The per-skill values are used only when it is false.

### MultiplierConfig.GlobalToggle

- **On the settings screen:** "Use Global Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { GlobalToggle = true }`, read by Lua as `SandboxVars.MultiplierConfig.GlobalToggle`. Takes true or false.
- **Default:** `true`. Other presets: Outbreak `false`.
- **The game's description:** "When enabled, all skills will use the Global Multiplier."
- **Read in:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17539); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 56).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).
- **What the code does with it:** In `IsoGameCharacter.XP#AddXP`, when this is true the XP gain is multiplied by `MultiplierConfig.Global`; when it is false, by the skill's own `MultiplierConfig.<skill>` value.

### MultiplierConfig.Fitness

- **On the settings screen:** "Fitness Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Fitness = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Fitness`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Fitness skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Strength

- **On the settings screen:** "Strength Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Strength = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Strength`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Strength skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Sprinting

- **On the settings screen:** "Sprinting Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Sprinting = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Sprinting`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Sprinting skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Lightfoot

- **On the settings screen:** "Lightfooted Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Lightfoot = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Lightfoot`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Lightfooted skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Nimble

- **On the settings screen:** "Nimble Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Nimble = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Nimble`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Nimble skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Sneak

- **On the settings screen:** "Sneaking Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Sneak = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Sneak`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Sneaking skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Axe

- **On the settings screen:** "Axe Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Axe = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Axe`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Axe skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Blunt

- **On the settings screen:** "Long Blunt Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Blunt = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Blunt`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Long Blunt skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.SmallBlunt

- **On the settings screen:** "Short Blunt Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { SmallBlunt = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.SmallBlunt`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Short Blunt skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.LongBlade

- **On the settings screen:** "Long Blade Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { LongBlade = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.LongBlade`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Long Blade skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.SmallBlade

- **On the settings screen:** "Short Blade Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { SmallBlade = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.SmallBlade`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Short Blade skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Spear

- **On the settings screen:** "Spear Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Spear = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Spear`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Spear skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Maintenance

- **On the settings screen:** "Maintenance Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Maintenance = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Maintenance`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Maintenance skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Farming

- **On the settings screen:** "Agriculture Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Farming = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Farming`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Agriculture skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Husbandry

- **On the settings screen:** "Animal Care Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Husbandry = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Husbandry`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Animal Care skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Woodwork

- **On the settings screen:** "Carpentry Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Woodwork = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Woodwork`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Carpentry skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Carving

- **On the settings screen:** "Carving Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Carving = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Carving`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Carving skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Cooking

- **On the settings screen:** "Cooking Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Cooking = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Cooking`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Cooking skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Electricity

- **On the settings screen:** "Electrical Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Electricity = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Electricity`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Electrical skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Doctor

- **On the settings screen:** "First Aid Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Doctor = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Doctor`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.5`.
- **The game's description:** "Rate at which First Aid skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.FlintKnapping

- **On the settings screen:** "Knapping Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { FlintKnapping = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.FlintKnapping`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Knapping skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Masonry

- **On the settings screen:** "Masonry Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Masonry = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Masonry`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Masonry skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Mechanics

- **On the settings screen:** "Mechanics Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Mechanics = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Mechanics`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.4`.
- **The game's description:** "Rate at which Mechanics skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Blacksmith

- **On the settings screen:** "Blacksmithing Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Blacksmith = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Blacksmith`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Blacksmithing skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Pottery

- **On the settings screen:** "Pottery Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Pottery = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Pottery`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Pottery skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Tailoring

- **On the settings screen:** "Tailoring Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Tailoring = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Tailoring`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.4`.
- **The game's description:** "Rate at which Tailoring skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.MetalWelding

- **On the settings screen:** "Welding Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { MetalWelding = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.MetalWelding`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.4`.
- **The game's description:** "Rate at which Welding skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Aiming

- **On the settings screen:** "Aiming Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Aiming = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Aiming`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Aiming skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Reloading

- **On the settings screen:** "Reloading Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Reloading = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Reloading`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Every preset keeps the default.
- **The game's description:** "Rate at which Reloading skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Fishing

- **On the settings screen:** "Fishing Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Fishing = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Fishing`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Fishing skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.PlantScavenging

- **On the settings screen:** "Foraging Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { PlantScavenging = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.PlantScavenging`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Foraging skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Tracking

- **On the settings screen:** "Tracking Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Tracking = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Tracking`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Tracking skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Trapping

- **On the settings screen:** "Trapping Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Trapping = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Trapping`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Trapping skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Butchering

- **On the settings screen:** "Butchering Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Butchering = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Butchering`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Butchering skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

### MultiplierConfig.Glassmaking

- **On the settings screen:** "Glassmaking Multiplier", in the "XP multipliers" group.
- **In the file:** `MultiplierConfig = { Glassmaking = 1.0 }`, read by Lua as `SandboxVars.MultiplierConfig.Glassmaking`. Takes a number from 0.0 to 1000.0.
- **Default:** `1.0`. Other presets: Outbreak `1.2`.
- **The game's description:** "Rate at which Glassmaking skill levels up."
- **Read through a name built elsewhere:** `zombie.characters.IsoGameCharacter$XP#AddXP` (line 17543); `zombie.network.anticheats.AntiCheatXPUpdate#getMaxPerkXpMultiplier` (line 59).
- **Set (not read) in:** `media/lua/client/LastStand/` (2 files, 2 places).

> **Proof:** Code. zombie.SandboxOptions (each option's declaration: name, type, Java default, range, translation keys), media/lua/shared/Sandbox/*.lua (the presets; the Apocalypse values are the defaults, loaded by the SandboxOptions constructor), media/lua/shared/Translate/EN/Sandbox.json (labels, descriptions, choices), media/lua/client/OptionScreens/ServerSettingsScreen.lua (the settings pages), and the read sites named under each option. Build 42.21 (revision 4a0e9546ec).
