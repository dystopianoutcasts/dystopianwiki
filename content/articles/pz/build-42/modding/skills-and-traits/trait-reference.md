---
id: build-42-trait-reference
slug: trait-reference
title: Vanilla trait reference
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - traits
  - character-trait-definition
  - vanilla-traits
  - b42-traits
excerpt: Machine-extracted from the installed game -- not from memory.
last_updated: '2026-10-04'
---
# Vanilla trait reference

> Source: 01-b42-trait-reference.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Machine-extracted from the installed game -- not from memory.

**Sources**

- Definitions: `<PZ>/media/scripts/generated/characters/character_traits.txt` (97 `character_trait_definition` blocks)
- Display text: `<PZ>/media/lua/shared/Translate/EN/UI.json` (B42 translations are JSON, not `.txt`)
- B41 comparison: `media/lua/shared/NPCs/MainCreationMethods.lua` in a copy of the Build 41 install, taken 2026-01-31

## Totals

| Metric | Count |
|---|---|
| Trait definitions (B42) | 97 |
| Profession-only traits (`IsProfessionTrait = true`) | 16 |
| Player-selectable at character creation | 81 |
| Traits declaring `MutuallyExclusiveTraits` | 70 |
| Traits declaring `XPBoosts` | 35 |
| Traits declaring `GrantedRecipes` | 18 |
| Traits declaring `GrantedTraits` | 2 |
| `DisabledInMultiplayer = true` | 0 |
| B41 traits (for comparison) | 99 |

Note: `DisabledInMultiplayer` is present on every definition but is `false` for all 97 in stock B42 -- the
field exists as a lever, and no vanilla trait uses it.

## Definition schema

Every block takes this shape. Only `UIName`, `IsProfessionTrait`, `DisabledInMultiplayer`, `Cost` and
`CharacterTrait` are present on all 97; the rest are optional.

```
module Base
{
    character_trait_definition base:artisan
    {
        IsProfessionTrait = false,
        DisabledInMultiplayer = false,
        CharacterTrait = base:artisan,
        Cost = 2,
        UIName = UI_trait_Artisan,
        UIDescription = UI_trait_ArtisanDesc,
        MutuallyExclusiveTraits = base:foo;base:bar,   -- semicolon separated
        XPBoosts = Glassmaking=1;Pottery=1,            -- perk=levels, capped at 3 total
        GrantedRecipes = MakeGlassJar;MakeGlassBottle, -- semicolon separated
        GrantedTraits = base:overweight,               -- implies another trait
    }
}
```

| Field | Meaning |
|---|---|
| `Cost` | Character-creation point cost. Positive = costs points (a benefit). Negative = refunds points (a drawback). `0` = profession trait, unselectable. |
| `IsProfessionTrait` | Granted by an occupation; hidden from the trait picker. |
| `DisabledInMultiplayer` | Hides the trait in MP. Unused by vanilla. |
| `MutuallyExclusiveTraits` | Cannot be co-held. **The engine enforces this at character creation. It does NOT re-check when Lua adds a trait at runtime.** |
| `XPBoosts` | Starting perk-boost levels. Boost is capped at 3 per perk. |
| `GrantedRecipes` | Recipes known from the start. |
| `GrantedTraits` | Auto-adds another trait. Only `weightgain -> overweight` and `weightloss -> underweight` use it. |

## Mutual exclusivity clusters

Derived from the 70 traits that declare exclusions. These are the hard constraints any dynamic-trait
system has to respect, because the engine will *not* enforce them for you at runtime.

| # | Size | Members (script id) |
|---|---|---|
| 1 | 12 | `athletic`, `emaciated`, `fit`, `heartyappetite`, `lighteater`, `obese`, `out of shape`, `overweight`, `smoker`, `underweight`, `unfit`, `very underweight` |
| 2 | 7 | `adrenalinejunkie`, `agoraphobic`, `brave`, `claustrophobic`, `cowardly`, `desensitized`, `hemophobic` |
| 3 | 4 | `feeble`, `stout`, `strong`, `weak` |
| 4 | 3 | `crafty`, `fastlearner`, `slowlearner` |
| 5 | 3 | `deaf`, `hardofhearing`, `keenhearing` |
| 6 | 3 | `fastreader`, `illiterate`, `slowreader` |
| 7 | 2 | `allthumbs`, `dextrous` |
| 8 | 2 | `blacksmith`, `blacksmith2` |
| 9 | 2 | `clumsy`, `graceful` |
| 10 | 2 | `conspicuous`, `inconspicuous` |
| 11 | 2 | `cook`, `cook2` |
| 12 | 2 | `disorganized`, `organized` |
| 13 | 2 | `eagleeyed`, `shortsighted` |
| 14 | 2 | `fasthealer`, `slowhealer` |
| 15 | 2 | `herbalist`, `herbalist_prof` |
| 16 | 2 | `highthirst`, `lowthirst` |
| 17 | 2 | `inventive`, `inventive_prof` |
| 18 | 2 | `irongut`, `weakstomach` |
| 19 | 2 | `mechanics`, `mechanics2` |
| 20 | 2 | `needslesssleep`, `needsmoresleep` |
| 21 | 2 | `nutritionist`, `nutritionist2` |
| 22 | 2 | `pronetoillness`, `resilient` |
| 23 | 2 | `speeddemon`, `sundaydriver` |
| 24 | 2 | `thickskinned`, `thinskinned` |
| 25 | 2 | `weightgain`, `weightloss` |

Non-symmetric declarations exist: trait A may list B while B omits A. Treat exclusivity as the union of
both directions -- the clusters above already do.

## Full trait table

`P` = profession trait. Cost `0` on a non-profession trait means free.

| Script id | In-game name | Cost | P | Mutually exclusive with | XP boosts | Effect |
|---|---|---|---|---|---|---|
| `adrenalinejunkie` | Adrenaline Junkie | 4 |  | agoraphobic, claustrophobic, cowardly, desensitized |  | Moves faster when highly panicked. |
| `agoraphobic` | Agoraphobic | -4 |  | adrenalinejunkie, brave, desensitized, claustrophobic |  | Gets panicked when outdoors. |
| `allthumbs` | All Thumbs | -2 |  | dextrous |  | Transfers inventory items slowly. Can't craft anything while walking. Slower rope climbing speed, and higher chance of falling. Slower weapon shouldering time. |
| `artisan` | Artisan | 2 |  |  | Glassmaking=1, Pottery=1 | Better at pottery and glass crafts. |
| `asthmatic` | Short of Breath | -5 |  |  |  | Faster endurance loss. |
| `athletic` | Athletic | 10 |  | overweight, fit, obese, out of shape, unfit, very underweight, smoker | Fitness=4 | Faster running speed. Can run for longer without tiring. |
| `axeman` | Ax-pert | 0 | P |  |  | Better at chopping trees. Faster axe swing. |
| `baseballplayer` | Baseball Player | 4 |  |  | Blunt=1 |  |
| `blacksmith` | Blacksmith Knowledge | 6 |  | blacksmith2 | Blacksmith=2, Maintenance=1 | Can use an anvil to create metal items. |
| `blacksmith2` | Blacksmith Knowledge | 0 | P | blacksmith |  | Can use an anvil to create metal items. |
| `brave` | Brave | 4 |  | cowardly, agoraphobic, claustrophobic, desensitized |  | Less prone to becoming panicked. |
| `brawler` | Brawler | 6 |  |  | Axe=1, Blunt=1 |  |
| `burglar` | Burglar | 0 | P |  |  | Can hotwire vehicles. Less chance of breaking window locks. |
| `claustrophobic` | Claustrophobic | -4 |  | adrenalinejunkie, agoraphobic, brave, desensitized |  | Gets panicked when in small indoor rooms. |
| `clumsy` | Clumsy | -2 |  | graceful |  | Makes more noise when moving. |
| `conspicuous` | Conspicuous | -4 |  | inconspicuous |  | More likely to be spotted by zombies. |
| `cook` | Keen Cook | 3 |  | cook2 | Cooking=2, Butchering=1 | Knows cooking recipes. |
| `cook2` | Keen Cook | 0 | P | cook |  | Knows cooking recipes. |
| `cowardly` | Cowardly | -2 |  | adrenalinejunkie, brave, desensitized |  | Especially prone to becoming panicked. |
| `crafty` | Crafty | 3 |  | fastlearner, slowlearner |  | Increased XP gains for Crafting skills. |
| `deaf` | Deaf | -12 |  | hardofhearing, keenhearing |  | Can't hear sound. |
| `desensitized` | Desensitized | 0 | P | adrenalinejunkie, agoraphobic, brave, claustrophobic, cowardly, hemophobic |  | Far less prone to panic.  Ignore discomfort. |
| `dextrous` | Dextrous | 2 |  | allthumbs |  | Transfers inventory items quickly. Faster rope climbing speed, and less chance of falling. Faster weapon shouldering time. |
| `disorganized` | Disorganized | -6 |  | organized |  | Decreased container inventory capacity. Affects world containers and bags, but not your main inventory. |
| `eagleeyed` | Eagle Eyed | 4 |  | shortsighted |  | Faster visibility fade. Higher visibility arc. Weapon sights more effective at long range. |
| `emaciated` | Emaciated | -10 | P | obese, overweight |  | Low strength, low endurance and prone to injury. |
| `fasthealer` | Fast Healer | 6 |  | slowhealer |  | Recovers quickly from injuries and illness. |
| `fastlearner` | Fast Learner | 6 |  | crafty, slowlearner |  | Increased XP gains. |
| `fastreader` | Fast Reader | 2 |  | slowreader, illiterate |  | Takes less time to read books. |
| `feeble` | Weak | -6 |  | stout, strong, weak | Strength=-2 | Less knockback from melee weapons. Decreased carrying weight. |
| `firstaid` | First Aider | 2 |  |  | Doctor=1 |  |
| `fishing` | Angler | 4 |  |  | Fishing=1 |  |
| `fit` | Fit | 6 |  | athletic, obese, out of shape, overweight, unfit | Fitness=2 |  |
| `formerscout` | Former Scout | 6 |  |  | Doctor=1, PlantScavenging=1, Fishing=1 | Start fires faster. |
| `gardener` | Gardener | 2 |  |  | Farming=1 |  |
| `graceful` | Graceful | 4 |  | clumsy |  | Makes less noise when moving. |
| `gymnast` | Gymnast | 5 |  |  | Lightfoot=1, Nimble=1 |  |
| `handy` | Handy | 8 |  |  | Carving=1, Maintenance=1, Masonry=1, Woodwork=1 | Faster and stronger constructions. |
| `hardofhearing` | Hard of Hearing | -4 |  | deaf, keenhearing |  | Smaller perception radius. Smaller hearing range. |
| `heartyappetite` | Hearty Appetite | -4 |  | lighteater, very underweight |  | Needs to eat more regularly. |
| `hemophobic` | Fear of Blood | -5 |  | desensitized |  | Panic when performing first aid on self. Cannot perform first aid on others. Gets stressed when bloody. |
| `herbalist` | Herbalist | 4 |  | herbalist_prof | PlantScavenging=1 | Can find medicinal herbs and craft medicines and poultices from them. |
| `herbalist_prof` | Herbalist | 0 | P | herbalist | PlantScavenging=1 | Can find medicinal herbs and craft medicines and poultices from them. |
| `highthirst` | High Thirst | -2 |  | lowthirst |  | Needs more water to survive. |
| `hiker` | Hiker | 5 |  |  | PlantScavenging=1, Trapping=1 |  |
| `hunter` | Hunter | 8 |  |  | Aiming=1, Tracking=1, Sneak=1, SmallBlade=1, Butchering=1 |  |
| `illiterate` | Illiterate | -10 |  | fastreader, slowreader |  | Cannot read any books or in-world text. |
| `inconspicuous` | Inconspicuous | 4 |  | conspicuous |  | Less likely to be spotted by zombies. |
| `insomniac` | Restless Sleeper | -6 |  |  |  | Slow loss of tiredness while sleeping. |
| `inventive` | Inventive | 2 |  | inventive_prof |  | Has lower skill level requirements to research recipes from items or auto learn recipes. |
| `inventive_prof` | Inventive | 0 | P | inventive |  | Has lower skill level requirements to research recipes from items or auto learn recipes. |
| `irongut` | Iron Gut | 2 |  | weakstomach |  | Less chance to have food illness. |
| `jogger` | Runner | 4 |  |  | Sprinting=1 |  |
| `keenhearing` | Keen Hearing | 6 |  | deaf, hardofhearing |  | Larger perception radius. |
| `lighteater` | Light Eater | 2 |  | heartyappetite, obese |  | Needs to eat less regularly. |
| `lowthirst` | Low Thirst | 2 |  | highthirst |  | Needs less water to survive. |
| `marksman` | Marksman | 0 | P |  |  | Improved gun accuracy and damage. Quicker reload. |
| `mason` | Mason | 2 |  |  | Masonry=2 | Better at building stone and brick constructions. |
| `mechanics` | Vehicle Knowledge | 3 |  | mechanics2 | Mechanics=1 | Has knowledge of common and commercial vehicle models, and repairs. |
| `mechanics2` | Vehicle Knowledge | 0 | P | mechanics |  | Has knowledge of common and commercial vehicle models, and repairs. |
| `needslesssleep` | Wakeful | 3 |  | needsmoresleep |  | Needs less sleep. |
| `needsmoresleep` | Sleepyhead | -4 |  | needslesssleep |  | Needs more sleep. |
| `nightowl` | Night Owl | 0 | P |  |  | Requires little sleep. Stays extra alert even when sleeping. |
| `nightvision` | Cat's Eyes | 3 |  |  |  | Better vision at night. |
| `nutritionist` | Nutritionist | 2 |  | nutritionist2 |  | Can see the nutritional values of any food. |
| `nutritionist2` | Nutritionist | 0 | P | nutritionist |  | Can see the nutritional values of any food. |
| `obese` | Very High Weight | 0 | P | athletic, emaciated, fit, lighteater, very underweight, underweight, overweight | Fitness=-2 | Reduced running speed, very low endurance and prone to injury. |
| `organized` | Organized | 4 |  | disorganized |  | Increased container inventory capacity. |
| `out of shape` | Out of Shape | -6 |  | athletic, fit, unfit | Fitness=-2 | Low endurance, low endurance regeneration. |
| `outdoorsman` | Outdoorsy | 2 |  |  |  | Less affected by harsh weather conditions. |
| `overweight` | High Weight | 0 | P | athletic, fit, emaciated, very underweight, underweight | Fitness=-1 | Reduced running speed, low endurance and prone to injury. |
| `pacifist` | Reluctant Fighter | -5 |  |  |  | Decreased combat XP gains. |
| `pronetoillness` | Prone to Illness | -4 |  | resilient |  | More prone to disease. Faster rate of zombification. |
| `resilient` | Resilient | 4 |  | pronetoillness |  | Less prone to disease. Slower rate of zombification. |
| `shortsighted` | Short Sighted | -2 |  | eagleeyed |  | Smaller view distance. Slower visibility fade. Weapon sights less effective. |
| `slowhealer` | Slow Healer | -3 |  | fasthealer |  | Recovers slowly from injuries and illness. |
| `slowlearner` | Slow Learner | -6 |  | crafty, fastlearner |  | Decreased XP gains. |
| `slowreader` | Slow Reader | -2 |  | fastreader, illiterate |  | Takes longer to read books and other literature. |
| `smoker` | Smoker | -3 |  | athletic |  | Unhappiness rises when tobacco is not smoked. Stress and unhappiness decrease after smoking tobacco. |
| `speeddemon` | Speed Demon | 1 |  | sundaydriver |  | Drives very fast. |
| `stout` | Stout | 6 |  | feeble, strong, weak | Strength=2 | Extra knockback from melee weapons. Increased carrying weight. |
| `strong` | Strong | 10 |  | feeble, stout, weak | Strength=4 | Extra knockback from melee weapons. Increased carrying weight. |
| `sundaydriver` | Sunday Driver | -1 |  | speeddemon |  | Drives very slow. |
| `tailor` | Sewer | 4 |  |  | Tailoring=1 |  |
| `target_shooter` | Target Shooter | 5 |  |  | Aiming=1 |  |
| `thickskinned` | Thick-skinned | 8 |  | thinskinned |  | Lower chance of being scratched or bitten. |
| `thinskinned` | Thin-skinned | -8 |  | thickskinned |  | Higher chance of being scratched or bitten by zombies. |
| `tinkerer` | Tinkerer | 4 |  |  | Maintenance=1 |  |
| `underweight` | Low Weight | 0 | P | obese, very underweight, overweight | Fitness=-1 | Low strength, low endurance and prone to injury. |
| `unfit` | Unfit | -10 |  | athletic, fit, out of shape | Fitness=-4 | Very low endurance and endurance regeneration. |
| `very underweight` | Very Low Weight | 0 | P | athletic, obese, overweight, heartyappetite, underweight | Fitness=-2 | Very low strength, very low endurance and prone to injury. |
| `weak` | Puny | -10 |  | feeble, stout, strong | Strength=-5 | Far less knockback from melee weapons. Extremely small carrying weight. |
| `weakstomach` | Weak Stomach | -2 |  | irongut |  | Higher chance to have food illness. |
| `weightgain` | Slow Metabolism | -2 |  | weightloss |  | Permanent tendency to gain weight. Starts with High Weight trait. |
| `weightloss` | Fast Metabolism | -2 |  | weightgain |  | Permanent tendency to lose weight. Starts with Low Weight trait. |
| `whittler` | Whittler | 2 |  |  | Carving=2 | Can carve wood and bone items. |
| `wildernessknowledge` | Bushcrafter | 8 |  |  | PlantScavenging=1, FlintKnapping=1, Maintenance=1, Carving=1 | Can find medicinal herbs and craft medicines and poultices from them, and make simple stone and bone tools.   Start fires faster. |

## Traits that grant recipes

Relevant because adding a trait via Lua does **not** grant these automatically -- see the API notes.

| Trait | Granted recipes |
|---|---|
| `artisan` | MakeGlassJar, MakeGlassBottle, MakeDrinkingGlass, MakeWineGlass, MakeGlassPanel, MakeLanternGlass |
| `baseballplayer` | CarveBat |
| `blacksmith` | Advanced_Forge, Blast_Furnace, Charcoal_Burner_MetalDrum, Charcoal_Pit, Dome_Kiln, Forge, Smelting_Furnace, Forge_Primitive_Forge, Primitive_Furnace, Forge_Baking_Pan, Forge_Baking_Tray, Forge_Bucket, Forge_Ball_Peen_Hammer_Head, Forge_Clawhammer_Head, Forge_Cooking_Pot, Forge_Corkscrew, Forge_Crowbar, Forge_Crude_Shortsword_Blade, Forge_Crude_Sword_Blade, Forge_Door_Knob, Forge_Fine_Butter_Knives, Forge_Fine_Forks, Forge_Fine_Spoons, Forge_Fishing_Hooks, Forge_Forceps, Forge_Forks, Forge_Frying_Pan, Forge_Garden_Hoe_Head, Forge_Gardening_Trowel, Forge_Hand_Scythe_Head, Forge_Hinge, Forge_Hunting_Knife_Blade, Forge_Kettle, Forge_Kitchen_Knife_Blade, Forge_Large_Knife_Blade, Forge_Machete_Blade, Forge_Masons_Chisel, Forge_Masons_Trowel, Forge_Meat_Cleaver_Blade, Forge_Metalworking_Chisel, Forge_Metalworking_Pliers, Forge_Metalworking_Punch, Forge_File, Forge_Drill, Forge_Nails, Forge_Needle, Forge_Pick_Axe_Head, Forge_Roasting_Pan, Forge_Saucepan, Forge_Saw, Forge_Scissors, Forge_Scythe_Head, Forge_Spade_Head, Forge_Sheep_Shears, Forge_Sledgehammer_Head, Forge_Small_Knife, Forge_Small_Steel_Sheet, Forge_Smithing_Hammer_Head, Forge_Spoons, Forge_Steel_Sheet, Forge_Straight_Razor, Forge_Sword_Blade, Forge_Tongs, Forge_Tweezers, MakeCrudeWhetstone, Forge_Heading_Tool, Forge_Draw_Plate, ForgeMaceHead, MakeSpikedClub, ForgeSpearHead, ForgeLongSpearHead, Forge_Wood_Axe_Head, Forge_Old_Axe_Head, Forge_Hand_Axe_Head, Forge_Fleshing_Tool, Forge_Cup, Forge_Buckle, Forge_Lantern, Forge_Carpentry_Chisel, Forge_Wrench |
| `brawler` | BarbedWireWeapon, BoltBat, CanReinforceLongWeapon, CanReinforceShortWeapon, CanReinforceWeapon, SheetMetalWeapon |
| `cook` | MakeCakeBatter, MakePieDough, MakeBreadDough, MakeBaguetteDough, MakeBiscuits, MakeChocolateChipCookieDough, MakeOatmealCookieDough, MakeShortbreadCookieDough, MakeSugarCookieDough, MakePizza, MakeFriedOnionRings, MakeFriedShrimp, MakeCabbageRolls, MakeJar, MakeGuacamole |
| `fishing` | MakeFishingRod, FixFishingRod, MakeChum |
| `formerscout` | MakeFishingRod, FixFishingRod, MakeChum |
| `gardener` | MakeFliesCureFromCigarettes, MakeFliesCureFromLooseTobacco, MakeFliesCureFromChewingTobacco, MakeMildewCure, MakeAphidsCure, MakeScarecrow, base:carrot growing season, base:broccoli growing season, base:radish growing season, base:strawberry growing season, base:tomato growing season, base:potato growing season, base:cabbage growing season, base:corn growing season, base:kale growing season, base:sweet potato growing season, base:green pea growing season, base:onion growing season, base:garlic growing season, base:soybean growing season, base:basil growing season, base:chives growing season, base:cilantro growing season, base:oregano growing season, base:parsley growing season, base:sage growing season, base:rosemary growing season, base:thyme growing season, base:hops growing season, base:sugar beet growing season, base:bell pepper growing season, base:cauliflower growing season, base:cucumber growing season, base:habanero growing season, base:jalapeno growing season, base:leek growing season, base:lettuce growing season, base:pumpkin growing season, base:spinach growing season, base:sunflower growing season, base:turnip growing season, base:watermelon growing season, base:zucchini growing season, base:chamomile growing season, base:lemongrass growing season, base:marigold growing season, base:mint growing season, base:black sage growing season, base:broadleaf plantain growing season, base:comfrey growing season, base:common mallow growing season, base:wild garlic growing season, base:rose growing season, base:poppy growing season, base:lavender growing season, MakeJar |
| `handy` | BarbedWireWeapon, BoltBat, MakeBrakeWeapon, MakeBucketMaul, CanReinforceLongWeapon, CanReinforceShortWeapon, CanReinforceWeapon, MakeGardenForkHeadWeapon, MakeKettleMaul, RailspikeBaseballBat, MakeRailspikeCudgel, MakeRailspikeIronPipe, MakeRailspikeLongHandle, MakeRailspikeWeapon, MakeRakeHeadWeapon, MakeSawPlank, MakeSawbladeCudgel, MakeSawbladeLongHandle, MakeSawbladePlank, MakeSawbladeTableLeg, MakeSawbladeWeapon, SheetMetalWeapon, MakeSpadeHeadCudgel, MakeScrewdriver |
| `herbalist` | Herbalist, MakePlantainPoultice, MakeComfreyPoultice, MakeWildGarlicPoultice, base:black sage growing season, base:broadleaf plantain growing season, base:comfrey growing season, base:common mallow growing season, base:wild garlic growing season |
| `herbalist_prof` | Herbalist, MakePlantainPoultice, MakeComfreyPoultice, MakeWildGarlicPoultice, base:black sage growing season, base:broadleaf plantain growing season, base:comfrey growing season, base:common mallow growing season, base:wild garlic growing season |
| `hiker` | MakeStickTrap, MakeSnareTrap, MakeWoodenBoxTrap |
| `hunter` | MakeStickTrap, MakeSnareTrap, MakeWoodenBoxTrap, MakeTrapBox, MakeCageTrap, MakeStagHeadTrophy |
| `mason` | Advanced_Forge, Blast_Furnace, Dome_Kiln, Forge, Smelting_Furnace, Forge_Primitive_Forge, Primitive_Furnace |
| `mechanics` | Basic Mechanics, Intermediate Mechanics |
| `tailor` | KnitBalaclavaFace, KnitBalaclavaFull, KnitBeany, KnitDoily, KnitLegwarmers, KnitScarf, KnitSocks, KnitSweaterVest, KnitWoolyHat, SewCrudeLeatherBackpack, SewHideBoots, SewHidePants, SewHideSleepingBag, SewHideCoat, SewHideHoodie, SewHideJacket, SewHideRobe, SewHideHat, MakeTarpChestRig, AssembleSmallFramepack, AssembleLargeFramepack, AssembleAdvancedFramepack, AssembleAdvancedLargeFramepack, MakeGarbageBagTankTop, MakeTarpTankTop, MakeGarbageBagDress, MakeTarpDress, WeaveTwineShoes, SewLeatherCodpiece, SewLeatherGorget, SewHolster, SewHolsterDouble, MakeWesternBoots, SewBelt, SewLeatherToolRoll, SewSandals, SewLeatherGloves, SewLeatherWaterBag, SewBandolier, SewShellsBandolier, SewHideWallet, SewFurredHideCoat, SewFurredHideJacket, SewLeatherGaiter, SewLeatherVambrace, SewElbowPads, SewKneePads, SewLeatherPants, SewHideFannyBag, SewClothSatchel, SewDressKnees, SewLongjohns, SewShirt, SewSkirtKnees, SewTrousers, SewDressLong, SewLongjohnsBottom, SewShirtSleeveless, SewSkirtLong |
| `whittler` | SharpenBone, SharpenLongBone, SharpenJawbone, MakeBoneFishingHook, MakeBoneSewingNeedle, CarveKnittingNeedles, CarveBat, MakeBoneHatchetHead, MakeBoneAwl, MakeLargeBoneBead, MakeLargeBoneBeads, CarveWoodenFork, MakeBoneFork, CarveWoodenSpade, CarveGoblets, CarveBucket, CarveFleshingTool, CarveShortBat, CarveWhistle |
| `wildernessknowledge` | Herbalist, MakeStoneBlade, RemakeLongStoneBlade, MakeLongStoneBlade, MakeStoneBladeScythe, FireHardenSpear, MakePlantainPoultice, MakeComfreyPoultice, MakeWildGarlicPoultice, BindSpear, WireSpear, SharpenLongBone, MakeBoneFishingHook, MakeBoneSewingNeedle, MakeBoneAwl, MakeStoneAwl, MakeStoneChisel, MakeStoneDrill, MakeLargeStoneAxeHead, MakeStoneMaulHead, MakeBoneClub, MakeBoneHatchetHead, MakeJawboneAxe, MakeFishingRod, MakeSnareTrap, MakeStoneBladeSaw, CarveBucket, CarveFleshingTool, MakeCrudeWhetstone |

> **Proof:** Code. `media/scripts/generated/characters/character_traits.txt`, the `GrantedRecipes` line of each `character_trait_definition`; the four rows above changed in Build 42.21 (forge, kiln and charcoal recipes renamed, cook and gardener lists shortened). Build 42.21.0 (revision 4a0e9546ec).

## B41 -> B42 trait roster diff

Matched by case/space-insensitive name, so `Out of Shape` == `out of shape`. Verified renames are
excluded from both lists so they don't read as churn:

| B41 | B42 | Note |
|---|---|---|
| `Claustophobic` | `claustrophobic` | B41 shipped the typo |
| `HeartyAppitite` | `heartyappetite` | B41 shipped the typo |
| `Metalworker` | `blacksmith` | merged -- B41 had Blacksmith *and* Metalworker; B42 keeps one pair |
| `Metalworker2` | `blacksmith2` | merged, profession variant |

### In B41, absent from B42 (12)

- `Brooding`
- `GiftOfTheGab`
- `HeavyDrinker`
- `Hypercondriac`
- `Injured`
- `LightDrinker`
- `Lucky`
- `Patient`
- `PlaysFootball`
- `SelfDefenseClass`
- `ShortTemper`
- `Unlucky`

### In B42, absent from B41 (12)

- `artisan` -- Artisan
- `crafty` -- Crafty
- `herbalist_prof` -- Herbalist
- `inventive` -- Inventive
- `inventive_prof` -- Inventive
- `mason` -- Mason
- `target_shooter` -- Target Shooter
- `tinkerer` -- Tinkerer
- `weightgain` -- Slow Metabolism
- `weightloss` -- Fast Metabolism
- `whittler` -- Whittler
- `wildernessknowledge` -- Bushcrafter

*Updated 2026-10-04 for Build 42.21: the granted recipes of blacksmith, cook, gardener and mason now match 42.21; every other row, name and description was re-checked and is unchanged.*
