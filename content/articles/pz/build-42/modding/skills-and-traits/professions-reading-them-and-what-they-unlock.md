---
id: build-42-professions-reading-them-and-what-they-unlock
slug: professions-reading-them-and-what-they-unlock
title: 'Professions: reading them from Lua, and what they really unlock'
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - professions
  - recipes
  - mechanics
  - gating
excerpt: >-
  The 25 Build 42.22 professions with their cost, skills, traits and recipes, how to read a character's profession in Lua, and why gating on a profession's recipes is only a delay.
last_updated: '2026-11-15'
related_articles:
  - modding-add-a-profession
  - trait-reference
  - modding-add-a-trait
  - recipe-gating-in-b42-scripts
  - xp-level-thresholds-multipliers
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [players picking an occupation](#the-25-professions) | [modders reading a profession in Lua](#reading-the-profession) | [modders gating on recipes](#what-a-profession-unlocks-and-why-it-leaks)

:::callout[The 1-minute version]{kind=key}
- Build 42.22 defines its professions as `character_profession_definition` blocks in `character_professions.txt`, and the table below lists all of them.
- A profession gives starting skill levels, can grant traits and recipes, and has a `Cost`. A profession's negative `Cost` costs points, which is the opposite sign from a trait.
- In Lua, `player:getDescriptor():getCharacterProfession()` returns a `CharacterProfession` object, not a string. `getProfession()` does not exist.
- Vehicle repairs check for recipe names, and magazines teach the same names, so a recipe gate is a delay and not a lock.
- An admin can change a character's profession from the player-stats panel, so it is not fixed for ever.
:::

:::facts
- **Professions** 25 (counted by script)
- **Grant traits** 12 of them
- **Grant recipes** 15 of them
- **Most expensive** Veteran at -8 points, and Custom Occupation gives +8
- **Mechanic recipe checks in vehicle scripts** Intermediate Mechanics 910 install and 908 uninstall tables
:::

## Reading the profession

A character's profession is one `CharacterProfession` object on its descriptor, and you compare it with a constant or read its name.

```lua
local prof = player:getDescriptor():getCharacterProfession()
-- prof:getName()  -> "mechanics"
-- tostring(prof)  -> "base:mechanics"
```

`getCharacterProfession()` returns the registry object. :cite[(`zombie/characters/SurvivorDesc.java:513-515`)] `getName()` returns the path without the namespace, and `toString()` returns the full id. :cite[(`zombie/scripting/objects/CharacterProfession.java:47-54`)] There is no `getProfession()` in Build 42, so Build 41 code that calls it fails.

Compare the object with a constant such as `CharacterProfession.MECHANICS`, or compare `getName()` with the bare name. :cite[(`zombie/scripting/objects/CharacterProfession.java:27`)] Vanilla's own player-stats screen reads it this way and then fetches the full definition. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:48-49`)]

The profession is worth reading because nothing in normal play changes it and no book grants it. It is chosen at creation and is saved with the character. If you derive a role from it each time you need it, you add no extra state that can go out of sync. One exception is the admin panel, which can set it: the panel's profession chooser calls `setCharacterProfession`. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:603`)]

## The 25 professions

Build 42.22 ships 25 professions, and the table gives each one's cost, starting skills, traits and recipe count as the script writes them.

`Cost` here has the opposite sign from a trait. The creator adds the profession's cost to the points to spend, so a negative cost spends points and a positive cost adds them. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:479`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:855-862`)] Custom Occupation, the renamed Unemployed, adds 8. :cite[(`media/lua/shared/Translate/EN/UI.json:316`)]

The skills in `XPBoosts` are internal names, for example `Woodwork` for Carpentry, `Sneak` for Sneaking and `PlantScavenging` for Foraging. Each skill starts at the listed level, and the character's Strength and Fitness start at 5 before any boost is added. :cite[(`zombie/characters/IsoGameCharacter.java:11551-11608`)]

| Profession id | In-game name | Cost | XP boosts | Granted traits | Granted recipes | Code |
|---|---|---|---|---|---|---|
| `burgerflipper` | Burger Flipper | 2 | Cooking=2, Maintenance=1, SmallBlade=1 | cook2 | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:14-22`)] |
| `burglar` | Burglar | -6 | Nimble=2, Sneak=2, Lightfoot=2 | burglar | 14 | :cite[(`media/scripts/generated/characters/character_professions.txt:3-12`)] |
| `carpenter` | Carpenter | -2 | Woodwork=4, Carving=1, SmallBlunt=1, Masonry=1, Maintenance=1 |  | 19 | :cite[(`media/scripts/generated/characters/character_professions.txt:24-32`)] |
| `chef` | Chef | -2 | Cooking=4, Maintenance=1, SmallBlade=1, Butchering=2 | cook2 | 20 | :cite[(`media/scripts/generated/characters/character_professions.txt:34-43`)] |
| `constructionworker` | Construction Worker | -2 | SmallBlunt=2, Blunt=1, Masonry=2, Woodwork=1, Maintenance=1 |  | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:45-52`)] |
| `doctor` | Doctor | 0 | Doctor=6, SmallBlade=1 |  | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:54-61`)] |
| `electrician` | Electrician | -2 | Electricity=5 |  | 12 | :cite[(`media/scripts/generated/characters/character_professions.txt:63-72`)] |
| `engineer` | Engineer | -4 | Electricity=1, Woodwork=1, Masonry=1 |  | 13 | :cite[(`media/scripts/generated/characters/character_professions.txt:74-83`)] |
| `farmer` | Farmer | 0 | Farming=4, Husbandry=1, Strength=1 |  | 63 | :cite[(`media/scripts/generated/characters/character_professions.txt:85-93`)] |
| `fireofficer` | Firefighter | 0 | Sprinting=1, Strength=1, Fitness=1, Axe=1 |  | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:95-102`)] |
| `fisherman` | Fishing Guide | -2 | Fishing=3, PlantScavenging=1, Butchering=1 |  | 5 | :cite[(`media/scripts/generated/characters/character_professions.txt:104-112`)] |
| `fitnessinstructor` | Fitness Instructor | -6 | Fitness=3, Sprinting=2, Strength=1 | nutritionist2 | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:114-122`)] |
| `lumberjack` | Lumberjack | 0 | Axe=2, Strength=1, Maintenance=1 | axeman | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:124-133`)] |
| `mechanics` | Mechanic | -4 | Mechanics=4, MetalWelding=1 | mechanics2 | 3 | :cite[(`media/scripts/generated/characters/character_professions.txt:135-145`)] |
| `metalworker` | Welder | -4 | MetalWelding=4 |  | 36 | :cite[(`media/scripts/generated/characters/character_professions.txt:147-156`)] |
| `nurse` | Nurse | 0 | Doctor=3, Lightfoot=1, Fitness=1 | nightowl | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:158-166`)] |
| `parkranger` | Park Ranger | -4 | Trapping=1, Doctor=1, PlantScavenging=1, FlintKnapping=1, Carving=1 | herbalist_prof | 5 | :cite[(`media/scripts/generated/characters/character_professions.txt:168-178`)] |
| `policeofficer` | Police Officer | -4 | Aiming=4, Reloading=1, Nimble=1 |  | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:180-187`)] |
| `rancher` | Rancher | 0 | Husbandry=4, Butchering=3, Fitness=1 |  | 1 | :cite[(`media/scripts/generated/characters/character_professions.txt:189-197`)] |
| `repairman` | DIY Expert | -2 | Woodwork=1, Maintenance=2, SmallBlunt=1, Masonry=1 | inventive_prof | 24 | :cite[(`media/scripts/generated/characters/character_professions.txt:199-208`)] |
| `securityguard` | Security Guard | -2 | Sprinting=2, Lightfoot=1, SmallBlunt=1 | nightowl | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:210-218`)] |
| `smither` | Blacksmith | -6 | Blacksmith=4, Maintenance=1, SmallBlunt=1 | blacksmith2 | 81 | :cite[(`media/scripts/generated/characters/character_professions.txt:220-230`)] |
| `tailor` | Tailor | 2 | Tailoring=4 |  | 59 | :cite[(`media/scripts/generated/characters/character_professions.txt:232-240`)] |
| `unemployed` | Custom Occupation | 8 |  |  | 0 | :cite[(`media/scripts/generated/characters/character_professions.txt:242-248`)] |
| `veteran` | Veteran | -8 | Aiming=2, Reloading=2 | desensitized | 1 | :cite[(`media/scripts/generated/characters/character_professions.txt:250-259`)] |

A profession's description in the creator is its `UIDescription`, then one line per skill, then the name of each trait it grants. :cite[(`media/lua/shared/NPCs/MainCreationMethods.lua:167-193`)] When you choose a profession, the creator adds its granted traits to your list and you cannot remove them, because they are profession-only. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:434-486`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:375-379`)]

Two professions grant `nightowl`, Nurse and Security Guard, and Mechanic grants the `mechanics2` trait with the three mechanics recipes. The older notes, which listed Security Guard alone, missed Nurse. :cite[(`media/scripts/generated/characters/character_professions.txt:158-166`, `media/scripts/generated/characters/character_professions.txt:210-218`)] The Blacksmith profession is `smither` in the script, and its skills are written on the profession itself, not on its `blacksmith2` trait, which has no `XPBoosts`. :cite[(`media/scripts/generated/characters/character_professions.txt:220-230`, `media/scripts/generated/characters/character_traits.txt:104-113`)]

## What a profession definition holds

A profession is one `character_profession_definition` block, and the loader reads eight keys from it.

The keys are `CharacterProfession`, `UIName`, `Cost`, `UIDescription`, `GrantedRecipes`, `GrantedTraits`, `XPBoosts` and `IconPathName`. An unknown key is a script error, and in debug mode it throws. :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:45-88`)] A skill name the engine does not know is skipped without an error. :cite[(`zombie/scripting/objects/CharacterProfessionDefinitionScript.java:70-75`)]

The profession must be registered with `CharacterProfession.register` first, and the registry rejects the `base` namespace for a mod. :cite[(`zombie/scripting/objects/CharacterProfession.java:56-65`, `zombie/scripting/objects/RegistryReset.java:22-29`)] The how-to is [Modding: add a profession](/pz/build-42/modding/skills-and-traits/modding-add-a-profession).

## What a profession unlocks, and why it leaks

Build 42 gates vehicle repairs on recipe names that a profession grants, but magazines teach the same names.

The mechanic's definition grants the three mechanics recipes and a trait. :cite[(`media/scripts/generated/characters/character_professions.txt:135-145`)]

```
character_profession_definition base:mechanics
    CharacterProfession = base:mechanics,
    GrantedTraits = base:mechanics2,
    XPBoosts = Mechanics=4;MetalWelding=1,
    GrantedRecipes = Basic Mechanics;Intermediate Mechanics;Advanced Mechanics,
```

Vehicle parts do ask for those recipe names. Each part's `install` and `uninstall` table can list `recipes`, and the install and uninstall checks refuse the job unless the character knows every recipe listed. :cite[(`media/lua/server/Vehicles/Vehicles.lua:910`, `media/lua/server/Vehicles/Vehicles.lua:945`, `media/lua/server/Vehicles/Vehicles.lua:1086-1093`)]

Counting the `recipes =` lines in the vehicle scripts, by the enclosing `install` or `uninstall` table, gives these totals. They are table occurrences across templates and per-car overrides, not a count of distinct parts.

| Recipe | Install tables | Uninstall tables |
|---|---|---|
| Intermediate Mechanics | 910 | 908 |
| Advanced Mechanics | 101 | 101 |
| Basic Mechanics | 12 | 12 |

We counted these with a script over all 292 `.txt` files under `media/scripts/generated/vehicles`. It reads each `recipes =` line and credits it to the `table install` or `table uninstall` block it sits in. The example below is from the JP Landscaping pickup truck. :cite[(`media/scripts/generated/vehicles/professionVehicles/vehicle_pickuptruck_JPLandscaping.txt:183-191`)]

**The leak.** The same three names are taught by magazines. In `literature.txt`, `MechanicMag1` teaches Basic Mechanics, `MechanicMag2` Intermediate Mechanics and `MechanicMag3` Advanced Mechanics, through `LearnedRecipes`. :cite[(`media/scripts/generated/items/literature.txt:5774-5815`)] The Mechanics trait also grants Basic and Intermediate. :cite[(`media/scripts/generated/characters/character_traits.txt:655-666`)] So a gate on those recipes holds only until someone finds the magazines, and after that the profession is an XP boost.

That is how vanilla is designed: every gate is a delay, and nothing is exclusive. If your mod needs something only a mechanic can do, gate on the profession itself, over content your mod owns. The vehicle part tables also have a `professions` key that tests the profession, but no vanilla vehicle script sets it, and we did not check that it works. :cite[(`media/lua/server/Vehicles/Vehicles.lua:1060-1068`)] Making vanilla's own parts exclusive would mean editing every one of those table entries and every loot table that drops the magazines.

## Recipes each profession grants

Fifteen professions grant recipes at creation, and the lists are the `GrantedRecipes` line of each block.

The recipes are copied into the character's known recipes when the character is created, together with the recipes of the chosen traits. :cite[(`zombie/characters/IsoGameCharacter.java:11610-11628`, `zombie/iso/IsoWorld.java:2387-2402`)]

| Profession | Granted recipes | Code |
|---|---|---|
| `burglar` | MakeForearmMagazineArmor, MakeBodyMagazineArmor, MakeGlassShiv, MakeShiv, MakeToothbrushShiv, CopyBuildingKey, MakeHollowBook, MakeForearmBulletproofVestArmor, MakeShinBulletproofVestArmor, MakeThighBulletproofVestArmor, base:hemp growing season, MakeScrewdriver, MakeBlankID, MakeImprovisedLighter | :cite[(`media/scripts/generated/characters/character_professions.txt:3-12`)] |
| `carpenter` | MakeBrakeWeapon, CanReinforceLongWeapon, CanReinforceShortWeapon, CanReinforceWeapon, MakeGardenForkHeadWeapon, RailspikeBaseballBat, MakeRailspikeCudgel, MakeRailspikeLongHandle, MakeRakeHeadWeapon, MakeSawPlank, MakeSawbladeCudgel, MakeSawbladeLongHandle, MakeSawbladePlank, MakeSawbladeTableLeg, MakeSawbladeWeapon, SheetMetalWeapon, MakeSpadeHeadCudgel, MakeAdvancedFramepackFrame, MakeAdvancedLargeFramepackFrame | :cite[(`media/scripts/generated/characters/character_professions.txt:24-32`)] |
| `chef` | MakeCakeBatter, MakePieDough, MakeBreadDough, MakeBaguetteDough, MakeBiscuits, MakeChocolateCookieDough, MakeChocolateChipCookieDough, MakeOatmealCookieDough, MakeShortbreadCookieDough, MakeSugarCookieDough, MakePizza, MakeFriedOnionRings, MakeFriedShrimp, MakeSushi, MakeOnigiri, MakeMaki, MakeCabbageRolls, PrepareMuffins, MakeGuacamole, MakeJar | :cite[(`media/scripts/generated/characters/character_professions.txt:34-43`)] |
| `electrician` | Generator, MakeRemoteControllerV1, MakeRemoteControllerV2, MakeRemoteControllerV3, MakeRemoteTrigger, MakeTimer, CraftMakeshiftRadio, CraftMakeshiftHAMRadio, CraftMakeshiftWalkieTalkie, MakeImprovisedFlashlight, MakeImprovisedLantern, MakeImprovisedLighter | :cite[(`media/scripts/generated/characters/character_professions.txt:63-72`)] |
| `engineer` | MakeAerosolBomb, MakeFlameBomb, MakePipeBomb, MakeNoiseMaker, MakeSmokeBomb, MakeFirecracker, MakeCraftedGasMaskFilter, MakeImprovisedGasMask, RechargeFilters, MakeImprovisedFlashlight, MakeImprovisedLantern, MakeImprovisedLighter, Generator | :cite[(`media/scripts/generated/characters/character_professions.txt:74-83`)] |
| `farmer` | MakeMildewCure, MakeFliesCureFromCigarettes, MakeFliesCureFromLooseTobacco, MakeFliesCureFromChewingTobacco, MakeAphidsCure, MakeScarecrow, MakeBarbedWire, base:carrot growing season, base:broccoli growing season, base:radish growing season, base:strawberry growing season, base:tomato growing season, base:potato growing season, base:cabbage growing season, base:corn growing season, base:kale growing season, base:sweet potato growing season, base:green pea growing season, base:onion growing season, base:garlic growing season, base:soybean growing season, base:wheat growing season, base:basil growing season, base:chives growing season, base:cilantro growing season, base:oregano growing season, base:parsley growing season, base:sage growing season, base:rosemary growing season, base:thyme growing season, base:barley growing season, base:flax growing season, base:hops growing season, base:rye growing season, base:sugar beet growing season, base:tobacco growing season, base:bell pepper growing season, base:cauliflower growing season, base:cucumber growing season, base:habanero growing season, base:jalapeno growing season, base:leek growing season, base:lettuce growing season, base:pumpkin growing season, base:spinach growing season, base:sunflower growing season, base:turnip growing season, base:watermelon growing season, base:zucchini growing season, base:chamomile growing season, base:lemongrass growing season, base:marigold growing season, base:mint growing season, base:rose growing season, base:poppy growing season, base:hemp growing season, base:lavender growing season, base:comfrey growing season, base:common mallow growing season, base:broadleaf plantain growing season, base:black sage growing season, base:wild garlic growing season, MakeJar | :cite[(`media/scripts/generated/characters/character_professions.txt:85-93`)] |
| `fisherman` | MakeFishingRod, FixFishingRod, GetWireBack, MakeFishingNet, MakeChum | :cite[(`media/scripts/generated/characters/character_professions.txt:104-112`)] |
| `mechanics` | Basic Mechanics, Intermediate Mechanics, Advanced Mechanics | :cite[(`media/scripts/generated/characters/character_professions.txt:135-145`)] |
| `metalworker` | MakeMetalSheet, MakeSmallMetalSheet, MakeScrapMetalHelmet, MakeScrapMetalShoulderArmor, MakeScrapMetalThighArmor, MakeScrapMetalBodyArmor, SpikeArmorWelding, Drill_Draw_Plate, Drill_Heading_Tool, MetalWallLvl1, MetalWallLvl2, MetalDoorFrameLvl1, MetalWindowFrameLvl1, MetalWindowFrameLvl2, MetalWallFrame, MetalDoorFrameLvl2, Metal_Stairs, Metal_Counter_Lvl1, Metal_Counter_Lvl2, Metal_CounterCorner_Lvl1, Metal_CounterCorner_Lvl2, Metal_Crate_Lvl1, Metal_Crate_Lvl2, Metal_LockerBig_Lvl1, Metal_LockerBig_Lvl2, Metal_LockerSmall_Lvl1, Metal_LockerSmall_Lvl2, Metal_Shelves_Lvl1, Metal_Shelves_Lvl2, MetalPoleFenceGate, MetalPoleFenceGateSmall, MetalWireFenceGate, MetalWireFenceGateSmall, MetalFenceLvl1, MetalFenceLvl2, MetalSmallWireFence | :cite[(`media/scripts/generated/characters/character_professions.txt:147-156`)] |
| `parkranger` | MakeStickTrap, MakeSnareTrap, MakeWoodenBoxTrap, MakeTrapBox, MakeCageTrap | :cite[(`media/scripts/generated/characters/character_professions.txt:168-178`)] |
| `rancher` | MakeBarbedWire | :cite[(`media/scripts/generated/characters/character_professions.txt:189-197`)] |
| `repairman` | BarbedWireWeapon, BoltBat, MakeBrakeWeapon, MakeBucketMaul, CanReinforceLongWeapon, CanReinforceShortWeapon, CanReinforceWeapon, MakeGardenForkHeadWeapon, MakeKettleMaul, RailspikeBaseballBat, MakeRailspikeCudgel, MakeRailspikeIronPipe, MakeRailspikeLongHandle, MakeRailspikeWeapon, MakeRakeHeadWeapon, MakeSawPlank, MakeSawbladeCudgel, MakeSawbladeLongHandle, MakeSawbladePlank, MakeSawbladeTableLeg, MakeSawbladeWeapon, SheetMetalWeapon, MakeSpadeHeadCudgel, MakeScrewdriver | :cite[(`media/scripts/generated/characters/character_professions.txt:199-208`)] |
| `smither` | BarbedWireWeapon, Advanced_Forge, Blast_Furnace, Charcoal_Burner_MetalDrum, Charcoal_Pit, Dome_Kiln, Forge, Smelting_Furnace, Forge_Primitive_Forge, Primitive_Furnace, Forge_Baking_Pan, Forge_Baking_Tray, Forge_Bucket, Forge_Ball_Peen_Hammer_Head, Forge_Clawhammer_Head, Forge_Cooking_Pot, Forge_Corkscrew, Forge_Crowbar, Forge_Crude_Shortsword_Blade, Forge_Crude_Sword_Blade, Forge_Door_Knob, Forge_Fine_Butter_Knives, Forge_Fine_Forks, Forge_Fine_Spoons, Forge_Fishing_Hooks, Forge_Forceps, Forge_Forks, Forge_Frying_Pan, Forge_Garden_Hoe_Head, Forge_Gardening_Trowel, Forge_Hand_Scythe_Head, Forge_Hinge, Forge_Hunting_Knife_Blade, Forge_Kettle, Forge_Kitchen_Knife_Blade, Forge_Large_Knife_Blade, Forge_Machete_Blade, Forge_Masons_Chisel, Forge_Masons_Trowel, Forge_Meat_Cleaver_Blade, Forge_Metalworking_Chisel, Forge_Metalworking_Pliers, Forge_Metalworking_Punch, Forge_File, Forge_Drill, Forge_Nails, Forge_Needle, Forge_Pick_Axe_Head, Forge_Roasting_Pan, Forge_Saucepan, Forge_Saw, Forge_Scissors, Forge_Scythe_Head, Forge_Spade_Head, Forge_Sheep_Shears, Forge_Sledgehammer_Head, Forge_Small_Knife, Forge_Small_Steel_Sheet, Forge_Smithing_Hammer_Head, Forge_Spoons, Forge_Steel_Sheet, Forge_Straight_Razor, Forge_Sword_Blade, Forge_Tongs, Forge_Tweezers, MakeCrudeWhetstone, Forge_Heading_Tool, Forge_Draw_Plate, ForgeMaceHead, MakeSpikedClub, ForgeSpearHead, ForgeLongSpearHead, Forge_Wood_Axe_Head, Forge_Old_Axe_Head, Forge_Hand_Axe_Head, Forge_Fleshing_Tool, Forge_Cup, Forge_Buckle, Forge_Lantern, Forge_Carpentry_Chisel, Forge_Wrench | :cite[(`media/scripts/generated/characters/character_professions.txt:220-230`)] |
| `tailor` | KnitBalaclavaFace, KnitBalaclavaFull, KnitBeany, KnitDoily, KnitLegwarmers, KnitScarf, KnitSocks, KnitSweaterVest, KnitWoolyHat, SewCrudeLeatherBackpack, SewHideBoots, SewHidePants, SewHideSleepingBag, SewHideCoat, SewHideHoodie, SewHideJacket, SewHideRobe, SewHideHat, MakeTarpChestRig, AssembleSmallFramepack, AssembleLargeFramepack, AssembleAdvancedFramepack, AssembleAdvancedLargeFramepack, MakeGarbageBagTankTop, MakeTarpTankTop, MakeGarbageBagDress, MakeTarpDress, WeaveTwineShoes, SewLeatherCodpiece, SewLeatherGorget, SewHolster, SewHolsterDouble, MakeWesternBoots, SewBelt, SewLeatherToolRoll, SewSandals, SewLeatherGloves, SewLeatherWaterBag, SewBandolier, SewShellsBandolier, SewHideWallet, SewFurredHideCoat, SewFurredHideJacket, SewLeatherGaiter, SewLeatherVambrace, SewElbowPads, SewKneePads, SewLeatherPants, SewHideFannyBag, SewClothSatchel, SewDressKnees, SewLongjohns, SewShirt, SewSkirtKnees, SewTrousers, SewDressLong, SewLongjohnsBottom, SewShirtSleeveless, SewSkirtLong | :cite[(`media/scripts/generated/characters/character_professions.txt:232-240`)] |
| `veteran` | MakeTarpChestRig | :cite[(`media/scripts/generated/characters/character_professions.txt:250-259`)] |

## A note for balance claims

If your mod's design says "a punch kills a zombie in three hits", say which sandbox settings that assumes.

Zombie toughness is the sandbox option `ZombieLore.Toughness`, with four choices (Tough, Normal, Fragile and Random) and Normal as the default. :cite[(`zombie/SandboxOptions.java:2100`, `media/lua/shared/Translate/EN/Sandbox.json:463-468`)] How badly the player is hurt is `InjurySeverity`, with Low at 0.5, Normal at 1.0 and High at 1.5. :cite[(`zombie/SandboxOptions.java:162`, `zombie/characters/InjurySeverity.java:11-13`)] A number that does not name them cannot be reproduced on someone else's server.

:::callout[How we know]{kind=proof}
The professions, costs, skills, traits and recipe lists come from `character_professions.txt` and a script counted them. The vehicle recipe totals were recounted on 42.22 with a script and match the 42.21 totals.

Corrected from the older notes: Nurse grants `nightowl` and not only Security Guard; Mechanic starts at `Mechanics=4`, not 3; and the Blacksmith profession carries its own skills, not through its trait. 

We dropped the wiki quote about occupations making you "feel like a professional from day one", and the lists of "likely" new occupations (Rancher is a real profession; an Artisan profession does not exist), because the scripts replace them. 

Where the older page said the profession "never changes", the admin panel can change it. We searched the engine source for `getProfession(` and found no match. We did not run a game for any of this page.
:::
