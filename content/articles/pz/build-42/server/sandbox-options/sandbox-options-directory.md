---
slug: sandbox-options-directory
title: 'Sandbox options A to Z (Build 42.21)'
game: pz
version: build-42
section: server
category: sandbox-options
difficulty: beginner
tags:
  - server
  - sandbox-options
  - sandbox
  - reference
  - generated
excerpt: 'All 269 Build 42.21 sandbox options A to Z, how the SandboxVars file and the presets work, and which options the code never reads.'
last_updated: '2026-10-04'
related_articles:
  - running-a-server
  - sandbox-options-time-and-world
  - sandbox-options-zombies
  - sandbox-options-loot
  - server-options-directory
---
# Sandbox options A to Z

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-server`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. How it is made is on [the handbook's first page](/pz/build-42/server/getting-started/running-a-server#how-these-pages-are-made).

Outcast, the sandbox options are the flavour of your world: how many zombies, how fast, how much loot, how long the power stays on. Build 42.21 has 269 of them. Here they are A to Z; click a name for the full entry.

## The file and the presets

- **Where they live.** A dedicated server keeps its sandbox options in `Server/<servername>_SandboxVars.lua` in your Zomboid folder. Each option is a line `Name = value,`; the options of a group (ZombieLore, ZombieConfig, Basement, Map, MultiplierConfig) sit inside a table named after the group. The game writes each option's description above it as a `--` comment, and for a choice it lists every value.
- **The defaults are the Apocalypse preset.** The game builds its sandbox options, then loads `media/lua/shared/Sandbox/Apocalypse.lua` and makes those values the defaults. So for 45 options the default the game uses is not the number written in the Java declaration. Each entry shows both when they differ.
- **The presets.** The sandbox screen offers "Apocalypse", "Outbreak", "Extinction", "Rising", "Six Months Later". Choosing one starts from the Apocalypse values and applies the preset file on top, so an option a preset file does not mention keeps the Apocalypse value. Each entry lists the presets that set a different value.
- **A value out of range is refused,** exactly as for the server options: the game logs an error and keeps the value it had.

> **Proof:** Code. zombie.SandboxOptions constructor (loadGameFile("Apocalypse") then setDefaultsToCurrentValues), #loadServerLuaFile, #saveServerLuaFile and #writeLuaFile (the file, the groups, the comments); media/lua/client/OptionScreens/SandboxOptions.lua SandboxOptionsScreen:loadPresets and addPresetToList (each preset is a fresh SandboxOptions with the preset file loaded on top); zombie.config.IntegerConfigOption#setValue and zombie.config.DoubleConfigOption#setValue. Build 42.21 (revision 4a0e9546ec).

## What we found

- **224 options are read directly** by the Java or the vanilla Lua (611 read sites).
- **37 are read through a name built elsewhere:** the XP multipliers (the code builds "MultiplierConfig." plus the skill name) and the options the world generator names in its data.
- **4 have no read we could find, but their name appears as text:** [ZombieRespawn](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombierespawn), [ZombieMigrate](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombiemigrate), [Farming](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#farming), [NatureAbundance](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#natureabundance). Each entry says where.
- **4 are read nowhere:** [AlarmDecayModifier](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#alarmdecaymodifier), [PlantAbundance](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#plantabundance), [NightLength](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#nightlength), [Basement.SpawnFrequency](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#basementspawnfrequency).
- **1,238 places set a sandbox value instead of reading it,** nearly all in the debug scenarios and the Last Stand challenges. Each entry lists them apart from the reads.
- **Names the code uses that are not options in 42.21:** `LootRespawn` (20 places, first `media/lua/client/DebugUIs/Scenarios/AiteronScenario.lua` in `setSandbox` (line 38)); `Speed` (15 places, first `media/lua/client/DebugUIs/Scenarios/AiteronScenario.lua` in `setSandbox` (line 10)); `Survivors` (15 places, first `media/lua/client/DebugUIs/Scenarios/AiteronScenario.lua` in `setSandbox` (line 13)); `ThumpOnConstruction` (1 place, first `media/lua/client/Tutorial/Tutorial1.lua` in `Tutorial1.PreloadInit` (line 17)); `ZombiesRespawn` (3 places, first `media/lua/client/DebugUIs/Scenarios/BobKates.lua` in `setSandbox` (line 38)).
- **The Six Months Later preset sets names that are not options:** `LootRespawn`, `XpMultiplier`. The game ignores them.
- **The Six Months Later preset computes some values:** `ZombieConfig.PopulationMultiplier = tonumber(ZombiePopulationMultiplier.VeryHigh) = 1.6`; `ZombieConfig.PopulationStartMultiplier = tonumber(ZombiePopulationStartMultiplier.VeryHigh) = 2.0`; `ZombieConfig.PopulationPeakMultiplier = tonumber(ZombiePopulationPeakMultiplier.Normal) = 1.0` (the tables are set in `media/lua/shared/defines.lua`).

## How a read site is found

Every "Read in" line on these pages comes from a search of the Build 42.21 Java and the vanilla Lua, by these rules:

1. Java, a server option: the option's field reached through ServerOptions.instance or ServerOptions.getInstance() (or a local variable holding one of them, inside the same method), the field reached with this. inside ServerOptions itself (its constructor, which only builds the public list, is left out), and a call getOption / getBoolean / getInteger / getFloat / getDouble / getOptionByName / putOption / putSaveOption / changeOption with the option's name written as text, on a ServerOptions receiver.
2. Java, a sandbox option: the option's field reached through SandboxOptions.instance or SandboxOptions.getInstance() (for a nested group, through its group field, such as lore or zombieConfig), through a local variable holding SandboxOptions or one of its groups inside the same method, or with this. inside SandboxOptions; and getOptionByName with the option's name written as text. A getOptionByName whose name is built at run time ("MultiplierConfig." + a skill) is kept as a computed read for every option the prefix can reach, and so is an option the world generator's Lua data names as "Sandbox.Name", which ProbaString looks up by that name.
3. A write is kept apart from a read: in Java a call to setValue, parse or setValueFromObject on the option, or putOption / putSaveOption / changeOption with its name; in Lua an assignment to SandboxVars.Name. The debug scenarios and the Last Stand challenges set many sandbox values this way.
4. Lua (vanilla media/lua, all three folders), a server option: getServerOptions():<getter>("Name") or ServerOptions.getInstance():<getter>("Name"). A sandbox option: SandboxVars.Name, SandboxVars.Group.Name, SandboxVars["Name"], and getSandboxOptions():getOptionByName("Name").
5. Not counted as reads: the declaration itself, the settings screens' lists of option names, the preset files, the translation files, and the generic loops that load, save, copy or send every option.
6. An option with no read site is searched once more for its name written as text anywhere else in Java or Lua; a hit there is listed as "named in" (the name appears, but no read of the value was recognised). An option with neither is marked "not read by the 42.21 code".
7. A capability: Capability.Name in Java or Lua, except the enum itself, the built-in role definitions in Roles#addStatic, and the command annotations (listed with each command instead).

A read site says where the code uses the value. When the code there makes the effect plain, the entry adds a line on what it does, written by hand from that site. When it does not, the entry only says where the value is read: we do not guess.

## All options

| Option | Type | Default | Settings page |
|---|---|---|---|
| [AbundantLootFactor](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#abundantlootfactor) | double | `3.0` | - |
| [Alarm](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#alarm) | enum | `4` ("Sometimes") | World |
| [AlarmDecay](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#alarmdecay) | enum | `2` ("0 - 30 Days") | World |
| [AlarmDecayModifier](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#alarmdecaymodifier) | integer | `14` | - |
| [AllClothesUnlocked](/pz/build-42/server/sandbox-options/sandbox-options-character#allclothesunlocked) | boolean | `false` | Character |
| [AllowExteriorGenerator](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#allowexteriorgenerator) | boolean | `true` | World |
| [AmmoLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#ammolootnew) | double | `0.6` | Loot |
| [AnimalAgeModifier](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalagemodifier) | enum | `4` ("Normal") | Livestock |
| [AnimalEggHatch](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalegghatch) | enum | `4` ("Normal") | Livestock |
| [AnimalGrassRegrowTime](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalgrassregrowtime) | integer | `240` | Livestock |
| [AnimalMatingSeason](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalmatingseason) | boolean | `true` | Livestock |
| [AnimalMetaPredator](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalmetapredator) | boolean | `false` | Livestock |
| [AnimalMetaStatsModifier](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#animalmetastatsmodifier) | enum | `4` ("Normal") | - |
| [AnimalMilkIncModifier](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalmilkincmodifier) | enum | `4` ("Normal") | Livestock |
| [AnimalPathChance](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalpathchance) | enum | `4` ("Sometimes") | Livestock |
| [AnimalPregnancyTime](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalpregnancytime) | enum | `4` ("Normal") | Livestock |
| [AnimalRanchChance](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalranchchance) | enum | `5` ("Often") | Livestock |
| [AnimalSoundAttractZombies](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalsoundattractzombies) | boolean | `true` | Livestock |
| [AnimalStatsModifier](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalstatsmodifier) | enum | `4` ("Normal") | Livestock |
| [AnimalTrackChance](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animaltrackchance) | enum | `4` ("Sometimes") | Livestock |
| [AnimalWoolIncModifier](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#animalwoolincmodifier) | enum | `4` ("Normal") | Livestock |
| [AnnotatedMapChance](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#annotatedmapchance) | enum | `4` ("Sometimes") | Meta |
| [AttackBlockMovements](/pz/build-42/server/sandbox-options/sandbox-options-character#attackblockmovements) | boolean | `true` | Character |
| [Basement.SpawnFrequency](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#basementspawnfrequency) | enum | `4` ("Sometimes") | World |
| [BloodLevel](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#bloodlevel) | enum | `3` ("Normal") | Meta |
| [BloodSplatLifespanDays](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#bloodsplatlifespandays) | integer | `0` | Meta |
| [BoneFracture](/pz/build-42/server/sandbox-options/sandbox-options-character#bonefracture) | boolean | `true` | Character |
| [CannedFoodLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#cannedfoodlootnew) | double | `0.6` | Loot |
| [CarAlarm](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#caralarm) | enum | `3` ("Rare") | Vehicles |
| [CarDamageOnImpact](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#cardamageonimpact) | enum | `3` ("Normal") | Vehicles |
| [CarGasConsumption](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#cargasconsumption) | double | `1.0` | Vehicles |
| [CarGeneralCondition](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#cargeneralcondition) | enum | `3` ("Normal") | Vehicles |
| [CarSpawnRate](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#carspawnrate) | enum | `3` ("Low") | Vehicles |
| [ChanceHasGas](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#chancehasgas) | enum | `2` ("Normal") | Vehicles |
| [CharacterFreePoints](/pz/build-42/server/sandbox-options/sandbox-options-character#characterfreepoints) | integer | `0` | Character |
| [ClayLakeChance](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#claylakechance) | double | `0.05` | Nature |
| [ClayRiverChance](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#clayriverchance) | double | `0.05` | Nature |
| [ClimateCycle](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#climatecycle) | enum | `1` ("Normal") | Meta |
| [ClothingDegradation](/pz/build-42/server/sandbox-options/sandbox-options-character#clothingdegradation) | enum | `3` ("Normal") | Character |
| [ClothingLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#clothinglootnew) | double | `0.6` | Loot |
| [CommonLootFactor](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#commonlootfactor) | double | `2.0` | - |
| [CompostTime](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#composttime) | enum | `2` ("2 Weeks") | Nature |
| [ConstructionBonusPoints](/pz/build-42/server/sandbox-options/sandbox-options-character#constructionbonuspoints) | enum | `3` ("Normal") | Character |
| [ConstructionPreventsLootRespawn](/pz/build-42/server/sandbox-options/sandbox-options-loot#constructionpreventslootrespawn) | boolean | `true` | Loot |
| [ContainerLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#containerlootnew) | double | `0.6` | Loot |
| [CookwareLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#cookwarelootnew) | double | `0.6` | Loot |
| [DamageToPlayerFromHitByACar](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#damagetoplayerfromhitbyacar) | enum | `1` ("None") | Vehicles |
| [DayLength](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#daylength) | enum | `4` ("1 Hour, 30 Minutes") | Time |
| [DayNightCycle](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#daynightcycle) | enum | `1` ("Normal") | Meta |
| [DaysForRottenFoodRemoval](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#daysforrottenfoodremoval) | integer | `-1` | World |
| [DaysUntilMaximumDiminishedLoot](/pz/build-42/server/sandbox-options/sandbox-options-loot#daysuntilmaximumdiminishedloot) | integer | `3650` | Loot |
| [DaysUntilMaximumLooted](/pz/build-42/server/sandbox-options/sandbox-options-loot#daysuntilmaximumlooted) | integer | `90` | Loot |
| [DaysUntilMaximumRatIndex](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#daysuntilmaximumratindex) | integer | `90` | Nature |
| [DecayingCorpseHealthImpact](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#decayingcorpsehealthimpact) | enum | `3` ("Normal") | Meta |
| [DiscomfortFactor](/pz/build-42/server/sandbox-options/sandbox-options-character#discomfortfactor) | double | `0.8` | Character |
| [Distribution](/pz/build-42/server/sandbox-options/sandbox-options-zombies#distribution) | enum | `1` ("Urban Focused") | Zombie |
| [EasyClimbing](/pz/build-42/server/sandbox-options/sandbox-options-character#easyclimbing) | boolean | `false` | Character |
| [ElecShut](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#elecshut) | enum | `2` ("14 - 30 Days") | World |
| [ElecShutModifier](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#elecshutmodifier) | integer | `14` | World |
| [EnablePoisoning](/pz/build-42/server/sandbox-options/sandbox-options-character#enablepoisoning) | enum | `1` ("True") | Character |
| [EnableSnowOnGround](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#enablesnowonground) | boolean | `true` | Nature |
| [EnableTaintedWaterText](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#enabletaintedwatertext) | boolean | `true` | Nature |
| [EnableVehicles](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#enablevehicles) | boolean | `true` | Vehicles |
| [EndRegen](/pz/build-42/server/sandbox-options/sandbox-options-character#endregen) | enum | `3` ("Normal") | Character |
| [ErosionDays](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#erosiondays) | integer | `0` | Nature |
| [ErosionSpeed](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#erosionspeed) | enum | `4` ("Slow (200 Days)") | Nature |
| [ExtremeLootFactor](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#extremelootfactor) | double | `0.2` | - |
| [Farming](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#farming) | enum | `3` ("Normal") | - |
| [FarmingAmountNew](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#farmingamountnew) | double | `1.0` | Nature |
| [FarmingLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#farminglootnew) | double | `0.6` | Loot |
| [FarmingSpeedNew](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#farmingspeednew) | double | `1.0` | Nature |
| [FirearmHeadGearEffect](/pz/build-42/server/sandbox-options/sandbox-options-character#firearmheadgeareffect) | boolean | `true` | Character |
| [FirearmJamMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-character#firearmjammultiplier) | double | `1.0` | Character |
| [FirearmMoodleMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-character#firearmmoodlemultiplier) | double | `1.0` | Character |
| [FirearmNoiseMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-character#firearmnoisemultiplier) | double | `1.0` | Character |
| [FirearmUseDamageChance](/pz/build-42/server/sandbox-options/sandbox-options-character#firearmusedamagechance) | enum | `2` ("Zombies only") | Character |
| [FirearmWeatherMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-character#firearmweathermultiplier) | double | `1.0` | Character |
| [FireSpread](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#firespread) | boolean | `true` | World |
| [FishAbundance](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#fishabundance) | enum | `2` ("Poor") | Nature |
| [FogCycle](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#fogcycle) | enum | `1` ("Normal") | Meta |
| [FoodLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#foodlootnew) | double | `0.8` | Loot |
| [FoodRotSpeed](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#foodrotspeed) | enum | `3` ("Normal") | World |
| [FridgeFactor](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#fridgefactor) | enum | `3` ("Normal") | World |
| [FuelStationGasEmptyChance](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#fuelstationgasemptychance) | integer | `20` | World |
| [FuelStationGasInfinite](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#fuelstationgasinfinite) | boolean | `false` | World |
| [FuelStationGasMax](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#fuelstationgasmax) | double | `0.8` | World |
| [FuelStationGasMin](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#fuelstationgasmin) | double | `0.0` | World |
| [GeneratorFuelConsumption](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#generatorfuelconsumption) | double | `0.1` | Meta |
| [GeneratorSpawning](/pz/build-42/server/sandbox-options/sandbox-options-loot#generatorspawning) | enum | `4` ("Rare") | Loot |
| [GeneratorTileRange](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#generatortilerange) | integer | `20` | World |
| [GeneratorVerticalPowerRange](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#generatorverticalpowerrange) | integer | `3` | World |
| [Helicopter](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#helicopter) | enum | `2` ("Once") | Meta |
| [HoursForCorpseRemoval](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#hoursforcorpseremoval) | double | `216.0` | Meta |
| [HoursForLootRespawn](/pz/build-42/server/sandbox-options/sandbox-options-loot#hoursforlootrespawn) | integer | `0` | Loot |
| [HoursForWorldItemRemoval](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#hoursforworlditemremoval) | double | `24.0` | World |
| [InitialGas](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#initialgas) | enum | `2` ("Low") | Vehicles |
| [InjurySeverity](/pz/build-42/server/sandbox-options/sandbox-options-character#injuryseverity) | enum | `2` ("Normal") | Character |
| [InsaneLootFactor](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#insanelootfactor) | double | `0.05` | - |
| [ItemRemovalListBlacklistToggle](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#itemremovallistblacklisttoggle) | boolean | `false` | World |
| [KeyLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#keylootnew) | double | `0.4` | Loot |
| [KillInsideCrops](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#killinsidecrops) | boolean | `true` | Nature |
| [LevelForDismantleXPCutoff](/pz/build-42/server/sandbox-options/sandbox-options-character#levelfordismantlexpcutoff) | integer | `0` | Character |
| [LevelForMediaXPCutoff](/pz/build-42/server/sandbox-options/sandbox-options-character#levelformediaxpcutoff) | integer | `3` | Character |
| [LightBulbLifespan](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#lightbulblifespan) | double | `2.0` | World |
| [LiteratureCooldown](/pz/build-42/server/sandbox-options/sandbox-options-character#literaturecooldown) | integer | `45` | Character |
| [LiteratureLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#literaturelootnew) | double | `0.6` | Loot |
| [LockedCar](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#lockedcar) | enum | `4` ("Sometimes") | Vehicles |
| [LockedHouses](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#lockedhouses) | enum | `6` ("Very Often") | World |
| [LootItemRemovalList](/pz/build-42/server/sandbox-options/sandbox-options-loot#lootitemremovallist) | string | (empty) | Loot |
| [MaggotSpawn](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#maggotspawn) | enum | `1` ("In and Around Bodies") | Meta |
| [Map.AllowMiniMap](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#mapallowminimap) | boolean | `false` | Meta |
| [Map.AllowWorldMap](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#mapallowworldmap) | boolean | `true` | Meta |
| [Map.MapAllKnown](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#mapmapallknown) | boolean | `false` | Meta |
| [Map.MapNeedsLight](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#mapmapneedslight) | boolean | `true` | Meta |
| [MaterialLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#materiallootnew) | double | `0.6` | Loot |
| [MaxFogIntensity](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#maxfogintensity) | enum | `1` ("Normal") | Nature |
| [MaximumDiminishedLoot](/pz/build-42/server/sandbox-options/sandbox-options-loot#maximumdiminishedloot) | integer | `20` | Loot |
| [MaximumFireFuelHours](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#maximumfirefuelhours) | integer | `8` | World |
| [MaximumLooted](/pz/build-42/server/sandbox-options/sandbox-options-loot#maximumlooted) | integer | `25` | Loot |
| [MaximumLootedBuildingRooms](/pz/build-42/server/sandbox-options/sandbox-options-loot#maximumlootedbuildingrooms) | integer | `50` | Loot |
| [MaximumRatIndex](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#maximumratindex) | integer | `25` | Nature |
| [MaxItemsForLootRespawn](/pz/build-42/server/sandbox-options/sandbox-options-loot#maxitemsforlootrespawn) | integer | `5` | Loot |
| [MaxRainFxIntensity](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#maxrainfxintensity) | enum | `1` ("Normal") | Nature |
| [MechanicsLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#mechanicslootnew) | double | `0.6` | Loot |
| [MediaLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#medialootnew) | double | `0.6` | Loot |
| [MedicalLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#medicallootnew) | double | `0.6` | Loot |
| [MementoLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#mementolootnew) | double | `0.6` | Loot |
| [MetaEvent](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#metaevent) | enum | `2` ("Sometimes") | Meta |
| [MetaKnowledge](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#metaknowledge) | enum | `3` ("Completely hidden") | Meta |
| [MinutesPerPage](/pz/build-42/server/sandbox-options/sandbox-options-character#minutesperpage) | double | `2.0` | Character |
| [MultiHitZombies](/pz/build-42/server/sandbox-options/sandbox-options-character#multihitzombies) | boolean | `false` | Character |
| [MultiplierConfig.Aiming](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigaiming) | double | `1.0` | Character |
| [MultiplierConfig.Axe](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigaxe) | double | `1.0` | Character |
| [MultiplierConfig.Blacksmith](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigblacksmith) | double | `1.0` | Character |
| [MultiplierConfig.Blunt](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigblunt) | double | `1.0` | Character |
| [MultiplierConfig.Butchering](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigbutchering) | double | `1.0` | Character |
| [MultiplierConfig.Carving](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigcarving) | double | `1.0` | Character |
| [MultiplierConfig.Cooking](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigcooking) | double | `1.0` | Character |
| [MultiplierConfig.Doctor](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigdoctor) | double | `1.0` | Character |
| [MultiplierConfig.Electricity](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigelectricity) | double | `1.0` | Character |
| [MultiplierConfig.Farming](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigfarming) | double | `1.0` | Character |
| [MultiplierConfig.Fishing](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigfishing) | double | `1.0` | Character |
| [MultiplierConfig.Fitness](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigfitness) | double | `1.0` | Character |
| [MultiplierConfig.FlintKnapping](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigflintknapping) | double | `1.0` | Character |
| [MultiplierConfig.Glassmaking](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigglassmaking) | double | `1.0` | Character |
| [MultiplierConfig.Global](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigglobal) | double | `1.0` | Character |
| [MultiplierConfig.GlobalToggle](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigglobaltoggle) | boolean | `true` | Character |
| [MultiplierConfig.Husbandry](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfighusbandry) | double | `1.0` | Character |
| [MultiplierConfig.Lightfoot](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfiglightfoot) | double | `1.0` | Character |
| [MultiplierConfig.LongBlade](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfiglongblade) | double | `1.0` | Character |
| [MultiplierConfig.Maintenance](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigmaintenance) | double | `1.0` | Character |
| [MultiplierConfig.Masonry](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigmasonry) | double | `1.0` | Character |
| [MultiplierConfig.Mechanics](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigmechanics) | double | `1.0` | Character |
| [MultiplierConfig.MetalWelding](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigmetalwelding) | double | `1.0` | Character |
| [MultiplierConfig.Nimble](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfignimble) | double | `1.0` | Character |
| [MultiplierConfig.PlantScavenging](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigplantscavenging) | double | `1.0` | Character |
| [MultiplierConfig.Pottery](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigpottery) | double | `1.0` | Character |
| [MultiplierConfig.Reloading](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigreloading) | double | `1.0` | Character |
| [MultiplierConfig.SmallBlade](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigsmallblade) | double | `1.0` | Character |
| [MultiplierConfig.SmallBlunt](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigsmallblunt) | double | `1.0` | Character |
| [MultiplierConfig.Sneak](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigsneak) | double | `1.0` | Character |
| [MultiplierConfig.Spear](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigspear) | double | `1.0` | Character |
| [MultiplierConfig.Sprinting](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigsprinting) | double | `1.0` | Character |
| [MultiplierConfig.Strength](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigstrength) | double | `1.0` | Character |
| [MultiplierConfig.Tailoring](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigtailoring) | double | `1.0` | Character |
| [MultiplierConfig.Tracking](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigtracking) | double | `1.0` | Character |
| [MultiplierConfig.Trapping](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigtrapping) | double | `1.0` | Character |
| [MultiplierConfig.Woodwork](/pz/build-42/server/sandbox-options/sandbox-options-character#multiplierconfigwoodwork) | double | `1.0` | Character |
| [MuscleStrainFactor](/pz/build-42/server/sandbox-options/sandbox-options-character#musclestrainfactor) | double | `0.7` | Character |
| [NatureAbundance](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#natureabundance) | enum | `3` ("Normal") | Nature |
| [NegativeTraitsPenalty](/pz/build-42/server/sandbox-options/sandbox-options-character#negativetraitspenalty) | enum | `1` ("None") | Character |
| [NightDarkness](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#nightdarkness) | enum | `3` ("Normal") | Nature |
| [NightLength](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#nightlength) | enum | `3` ("Normal") | - |
| [NoBlackClothes](/pz/build-42/server/sandbox-options/sandbox-options-character#noblackclothes) | boolean | `true` | Character |
| [NormalLootFactor](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#normallootfactor) | double | `1.0` | - |
| [Nutrition](/pz/build-42/server/sandbox-options/sandbox-options-character#nutrition) | boolean | `true` | Character |
| [OtherLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#otherlootnew) | double | `0.8` | Loot |
| [PlaceDirtAboveground](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#placedirtaboveground) | boolean | `false` | Nature |
| [PlantAbundance](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#plantabundance) | enum | `3` ("Normal") | - |
| [PlantGrowingSeasons](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#plantgrowingseasons) | boolean | `true` | Nature |
| [PlantResilience](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#plantresilience) | enum | `3` ("Normal") | Nature |
| [PlayerDamageFromCrash](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#playerdamagefromcrash) | boolean | `true` | Vehicles |
| [Rain](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#rain) | enum | `3` ("Normal") | Nature |
| [RangedWeaponLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#rangedweaponlootnew) | double | `1.2` | Loot |
| [RareLootFactor](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#rarelootfactor) | double | `0.6` | - |
| [RearVulnerability](/pz/build-42/server/sandbox-options/sandbox-options-character#rearvulnerability) | enum | `3` ("High") | Character |
| [RecentlySurvivorVehicles](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#recentlysurvivorvehicles) | enum | `2` ("Low") | Vehicles |
| [RecipeResourceLoot](/pz/build-42/server/sandbox-options/sandbox-options-loot#reciperesourceloot) | double | `0.6` | Loot |
| [RemoveStoryLoot](/pz/build-42/server/sandbox-options/sandbox-options-loot#removestoryloot) | boolean | `false` | Loot |
| [RemoveZombieLoot](/pz/build-42/server/sandbox-options/sandbox-options-loot#removezombieloot) | boolean | `false` | Loot |
| [RollsMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-loot#rollsmultiplier) | double | `1.0` | Loot |
| [RuralLooted](/pz/build-42/server/sandbox-options/sandbox-options-loot#rurallooted) | double | `0.5` | Loot |
| [SeenHoursPreventLootRespawn](/pz/build-42/server/sandbox-options/sandbox-options-loot#seenhourspreventlootrespawn) | integer | `0` | Loot |
| [SeeNotLearntRecipe](/pz/build-42/server/sandbox-options/sandbox-options-character#seenotlearntrecipe) | boolean | `true` | Character |
| [SirenEffectsZombies](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#sireneffectszombies) | boolean | `true` | Vehicles |
| [SirenShutoffHours](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#sirenshutoffhours) | double | `0.0` | Vehicles |
| [SkillBookLoot](/pz/build-42/server/sandbox-options/sandbox-options-loot#skillbookloot) | double | `0.6` | Loot |
| [SleepingEvent](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#sleepingevent) | enum | `1` ("Never") | Meta |
| [StartDay](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#startday) | enum | `9` ("9") | Time |
| [StarterKit](/pz/build-42/server/sandbox-options/sandbox-options-character#starterkit) | boolean | `false` | Character |
| [StartMonth](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#startmonth) | enum | `7` ("July") | Time |
| [StartTime](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#starttime) | enum | `2` ("9 AM") | Time |
| [StartYear](/pz/build-42/server/sandbox-options/sandbox-options-not-on-the-settings-screen#startyear) | enum | `1` ("1993") | - |
| [StatsDecrease](/pz/build-42/server/sandbox-options/sandbox-options-character#statsdecrease) | enum | `3` ("Normal") | Character |
| [SurvivalGearsLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#survivalgearslootnew) | double | `0.6` | Loot |
| [SurvivorHouseChance](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#survivorhousechance) | enum | `3` ("Rare") | Meta |
| [Temperature](/pz/build-42/server/sandbox-options/sandbox-options-nature-and-livestock#temperature) | enum | `3` ("Normal") | Nature |
| [TimeSinceApo](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#timesinceapo) | enum | `1` ("0") | Time |
| [ToolLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#toollootnew) | double | `0.6` | Loot |
| [TrafficJam](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#trafficjam) | boolean | `true` | Vehicles |
| [VehicleEasyUse](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#vehicleeasyuse) | boolean | `false` | Vehicles |
| [VehicleStoryChance](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#vehiclestorychance) | enum | `3` ("Rare") | Meta |
| [WaterShut](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#watershut) | enum | `2` ("0 - 30 Days") | World |
| [WaterShutModifier](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#watershutmodifier) | integer | `14` | World |
| [WeaponLootNew](/pz/build-42/server/sandbox-options/sandbox-options-loot#weaponlootnew) | double | `0.6` | Loot |
| [WorldItemRemovalList](/pz/build-42/server/sandbox-options/sandbox-options-time-and-world#worlditemremovallist) | string | `Base.Hat, Base.Glasses, Base.Maggots, Base.Slug, Base.Slug2, Base.Snail, Base.Worm, Base.Dung_Mouse, Base.Dung_Rat` | World |
| [WoundInfectionFactor](/pz/build-42/server/sandbox-options/sandbox-options-character#woundinfectionfactor) | double | `1.0` | Character |
| [ZombieAttractionMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-vehicles#zombieattractionmultiplier) | double | `1.0` | Vehicles |
| [ZombieConfig.FollowSoundDistance](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigfollowsounddistance) | integer | `100` | Zombie |
| [ZombieConfig.PopulationMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigpopulationmultiplier) | double | `0.65` | Zombie |
| [ZombieConfig.PopulationPeakDay](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigpopulationpeakday) | integer | `28` | Zombie |
| [ZombieConfig.PopulationPeakMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigpopulationpeakmultiplier) | double | `1.5` | Zombie |
| [ZombieConfig.PopulationStartMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigpopulationstartmultiplier) | double | `1.0` | Zombie |
| [ZombieConfig.RallyGroupRadius](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigrallygroupradius) | integer | `3` | Zombie |
| [ZombieConfig.RallyGroupSeparation](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigrallygroupseparation) | integer | `15` | Zombie |
| [ZombieConfig.RallyGroupSize](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigrallygroupsize) | integer | `20` | Zombie |
| [ZombieConfig.RallyGroupSizeVariance](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigrallygroupsizevariance) | integer | `50` | Zombie |
| [ZombieConfig.RallyTravelDistance](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigrallytraveldistance) | integer | `20` | Zombie |
| [ZombieConfig.RedistributeHours](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigredistributehours) | double | `12.0` | Zombie |
| [ZombieConfig.RespawnHours](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigrespawnhours) | double | `0.0` | Zombie |
| [ZombieConfig.RespawnMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigrespawnmultiplier) | double | `0.0` | Zombie |
| [ZombieConfig.RespawnUnseenHours](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigrespawnunseenhours) | double | `0.0` | Zombie |
| [ZombieConfig.ZombiesCountBeforeDelete](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieconfigzombiescountbeforedelete) | integer | `300` | Zombie |
| [ZombieHealthImpact](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#zombiehealthimpact) | boolean | `false` | Meta |
| [ZombieLore.ActiveOnly](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloreactiveonly) | enum | `1` ("Both") | Zombie |
| [ZombieLore.ChanceOfAttachedWeapon](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorechanceofattachedweapon) | integer | `6` | Zombie |
| [ZombieLore.Cognition](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorecognition) | enum | `3` ("Basic Navigation") | Zombie |
| [ZombieLore.CrawlUnderVehicle](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorecrawlundervehicle) | enum | `5` ("Often") | Zombie |
| [ZombieLore.DisableFakeDead](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloredisablefakedead) | enum | `1` ("World Zombies") | Zombie |
| [ZombieLore.DoorOpeningPercentage](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloredooropeningpercentage) | integer | `0` | Zombie |
| [ZombieLore.FenceDamageMultiplier](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#zombielorefencedamagemultiplier) | double | `1.0` | Meta |
| [ZombieLore.FenceThumpersRequired](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#zombielorefencethumpersrequired) | integer | `25` | Meta |
| [ZombieLore.Hearing](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorehearing) | enum | `5` ("Random between Normal and Poor") | Zombie |
| [ZombieLore.Memory](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorememory) | enum | `2` ("Normal") | Zombie |
| [ZombieLore.Mortality](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloremortality) | enum | `5` ("2-3 Days") | Zombie |
| [ZombieLore.PlayerSpawnZombieRemoval](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloreplayerspawnzombieremoval) | enum | `1` ("Inside the building and around it") | Zombie |
| [ZombieLore.Reanimate](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorereanimate) | enum | `3` ("0-1 Minutes") | Zombie |
| [ZombieLore.Sight](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloresight) | enum | `5` ("Random between Normal and Poor") | Zombie |
| [ZombieLore.Speed](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorespeed) | enum | `4` ("Random") | Zombie |
| [ZombieLore.SpottedLogic](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorespottedlogic) | boolean | `true` | Zombie |
| [ZombieLore.SprinterPercentage](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloresprinterpercentage) | integer | `0` | Zombie |
| [ZombieLore.Strength](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorestrength) | enum | `2` ("Normal") | Zombie |
| [ZombieLore.ThumpNoChasing](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorethumpnochasing) | boolean | `false` | Zombie |
| [ZombieLore.ThumpOnConstruction](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorethumponconstruction) | boolean | `true` | Zombie |
| [ZombieLore.Toughness](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloretoughness) | enum | `4` ("Random") | Zombie |
| [ZombieLore.Transmission](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloretransmission) | enum | `1` ("Blood and Saliva") | Zombie |
| [ZombieLore.TriggerHouseAlarm](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombieloretriggerhousealarm) | boolean | `true` | Zombie |
| [ZombieLore.ZombiesArmorFactor](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorezombiesarmorfactor) | double | `2.0` | Zombie |
| [ZombieLore.ZombiesCrawlersDragDown](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorezombiescrawlersdragdown) | boolean | `false` | Zombie |
| [ZombieLore.ZombiesDragDown](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorezombiesdragdown) | boolean | `true` | Zombie |
| [ZombieLore.ZombiesFallDamage](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorezombiesfalldamage) | double | `1.0` | Zombie |
| [ZombieLore.ZombiesFenceLunge](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorezombiesfencelunge) | boolean | `true` | Zombie |
| [ZombieLore.ZombiesMaxDefense](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombielorezombiesmaxdefense) | integer | `85` | Zombie |
| [ZombieMigrate](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombiemigrate) | boolean | `true` | Zombie |
| [ZombiePopLootEffect](/pz/build-42/server/sandbox-options/sandbox-options-loot#zombiepoplooteffect) | integer | `0` | Loot |
| [ZombieRespawn](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombierespawn) | enum | `4` ("None") | Zombie |
| [Zombies](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombies) | enum | `4` ("Normal") | Zombie |
| [ZombieVoronoiNoise](/pz/build-42/server/sandbox-options/sandbox-options-zombies#zombievoronoinoise) | boolean | `true` | Zombie |
| [ZoneStoryChance](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#zonestorychance) | enum | `3` ("Rare") | Meta |
