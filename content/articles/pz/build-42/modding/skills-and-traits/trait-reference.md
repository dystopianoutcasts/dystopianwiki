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
excerpt: >-
  Every vanilla Build 42.22 trait: cost, XP boosts, exclusions and recipes, read from the game's own script and code, plus how the engine adds, removes and charges for them.
last_updated: '2026-11-15'
related_articles:
  - modding-add-a-trait
  - professions-reading-them-and-what-they-unlock
  - modding-add-a-profession
  - xp-level-thresholds-multipliers
  - the-xp-grant-skill-query-lua-api
  - recipe-gating-in-b42-scripts
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [players choosing traits](#the-full-trait-table) | [modders](#what-a-trait-definition-holds)

:::callout[The 1-minute version]{kind=key}
- Build 42.22 defines its traits as `character_trait_definition` blocks in one script file, `character_traits.txt`. The full list is in the table below.
- A positive `Cost` is what you pay at character creation, and a negative `Cost` refunds points. A trait flagged `IsProfessionTrait` is left out of the picker.
- The character creation screen enforces `MutuallyExclusiveTraits`. A trait that Lua adds at runtime is not checked against it.
- `getCharacterTraits():add(...)` sets only the trait flag. It does not hand out the trait's recipes, and the starting skill levels come from `XPBoosts` at creation.
- The engine adds and removes the strength, fitness and weight traits itself as those values change during play.
:::

:::facts
- **Trait definitions** 97 (counted by script)
- **Profession-only traits** 16 (`IsProfessionTrait = true`)
- **Not profession-only** 81
- **Declaring `MutuallyExclusiveTraits`** 70
- **Declaring `XPBoosts`** 35
- **Declaring `GrantedRecipes`** 18
- **Declaring `GrantedTraits`** 2
- **`DisabledInMultiplayer = true`** 0
:::

## What a trait definition holds

A trait is one `character_trait_definition` block in a script file, and the loader reads a fixed list of keys from it.

The loader accepts `CharacterTrait`, `UIName`, `Cost`, `UIDescription`, `IsProfessionTrait`, `DisabledInMultiplayer`, `GrantedRecipes`, `GrantedTraits`, `XPBoosts`, `MutuallyExclusiveTraits` and `Texture`. Any other key writes a script error, and in debug mode it throws. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:49-100`)] A `--` is not a comment in a script: only `/* ... */` is stripped, and values are split at commas. :cite[(`zombie/scripting/ScriptParser.java:20-54`, `zombie/scripting/ScriptParser.java:58-89`)] The block type is registered under the script name `character_trait_definition`. :cite[(`zombie/scripting/ScriptType.java:55`)]

```
module Base
{
    character_trait_definition base:weightgain
    {
        IsProfessionTrait = false,
        DisabledInMultiplayer = false,
        CharacterTrait = base:weightgain,
        Cost = -2,
        UIName = UI_trait_weightgain,
        UIDescription = UI_trait_weightgaindesc,
        MutuallyExclusiveTraits = base:weightloss,
        GrantedTraits = base:overweight,
    }
}
```

Every vanilla block sets `IsProfessionTrait`, `DisabledInMultiplayer`, `CharacterTrait`, `Cost` and `UIName`. The other keys are optional, and 84 of the 97 vanilla blocks set `UIDescription`. :cite[(`media/scripts/generated/characters/character_traits.txt:1037-1047`)]

| Field | Meaning | Code |
|---|---|---|
| `CharacterTrait` | The registry id this definition fills. The id must already be registered, because the loader looks it up in the trait registry. | :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:56-57`)] |
| `UIName`, `UIDescription` | Translation keys. The definition runs both through `Translator.getText`, and `UIDescription` may be left out. | :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:42-46`)] |
| `Cost` | Character-creation points. A positive value costs points, and a negative value refunds them. | :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:60-61`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:638-641`)] |
| `IsProfessionTrait` | The trait is granted by a profession and is left out of the picker. The loader reads it as `false` when the key is missing. | :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:41`, `zombie/scripting/objects/CharacterTraitDefinitionScript.java:64-65`, `zombie/characters/traits/CharacterTraitDefinition.java:112-114`)] |
| `DisabledInMultiplayer` | Stored on the definition and read as `false` when missing. No vanilla trait sets it to `true`. | :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:42`, `zombie/scripting/objects/CharacterTraitDefinitionScript.java:66-67`, `zombie/characters/traits/CharacterTraitDefinition.java:120-122`)] |
| `MutuallyExclusiveTraits` | Traits that cannot be held together. Separate the ids with `;`. | :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:85-88`)] |
| `XPBoosts` | `Skill=level` pairs separated by `;`. A skill name the engine does not know is skipped without an error, and a level that does not parse becomes 1. | :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:74-84`)] |
| `GrantedRecipes` | Recipe names separated by `;`, learned when the character is created. | :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:68-69`, `zombie/characters/IsoGameCharacter.java:11617-11628`)] |
| `GrantedTraits` | Traits added with this one. Only `weightgain` and `weightloss` use it in vanilla. | :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:70-73`, `media/scripts/generated/characters/character_traits.txt:1046`, `media/scripts/generated/characters/character_traits.txt:1058`)] |
| `Texture` | The icon. No vanilla block sets it. | :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:89-90`)] |

When `Texture` is missing, the icon is `media/ui/Traits/trait_<id>.png`, with the id in lower case and without its namespace. A generic icon stands in when that file is missing. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:49-52`)]

## How cost works at character creation

The sign of `Cost` decides which list a trait is in and whether picking it spends or refunds points.

The creator puts a trait with a positive `Cost` in the list of good traits and one with a negative `Cost` in the list of bad traits, and profession-only traits go in neither. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:891-911`)] Adding a trait subtracts its `Cost` from the points left, and removing it adds the `Cost` back. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:638-641`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:692-698`)] The right-hand label shows a positive cost as `-N` and a negative cost as `+N`, and a `Cost` of 0 shows nothing. :cite[(`zombie/characters/traits/CharacterTraitDefinition.java:158-171`)]

The points to spend are the points from adding and removing traits, plus the profession's cost and the sandbox option `CharacterFreePoints`, minus a penalty for negative traits when the sandbox option `NegativeTraitsPenalty` is not 1. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:855-862`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:913-931`)]

Fifteen of the 16 profession-only traits have a `Cost` of 0, and `emaciated` has -10. The picker skips them all, because it tests `IsProfessionTrait` and not the cost. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:891-911`)]

In multiplayer, the three sleep traits (`insomniac`, `needslesssleep`, `needsmoresleep`) are listed only when the server allows and needs sleep. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:883-889`)]

## What the engine does with a trait

The engine applies a trait's skills and recipes when the character is created, and the picker builds the trait's tooltip for you.

At creation, `applyTraits` starts Fitness and Strength at level 5, adds the `XPBoosts` levels of every trait and of the profession, and clamps each skill to 0 through 10. It levels the skill up that many times, then stores a boost of at most 3 for it. :cite[(`zombie/characters/IsoGameCharacter.java:11551-11608`)] The recipes in `GrantedRecipes` are copied into the character's known recipes when the character is created, on a server and in single player. :cite[(`zombie/network/packets/character/CreatePlayerPacket.java:300-302`, `zombie/iso/IsoWorld.java:2387-2402`)]

The boost value then sets the XP speed for that skill. A value of 0 or no value is a quarter speed, 1 is normal speed, 2 is 1.33 and 3 or more is 1.66, with some skills left out of the increase or the reduction. :cite[(`zombie/characters/IsoGameCharacter.java:17812-17830`)] The rest is in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

The picker builds each trait's tooltip from its description plus one line per `XPBoosts` entry, such as `+1 Foraging`. :cite[(`media/lua/shared/NPCs/MainCreationMethods.lua:113-138`)] A few traits also change the starting clothing through `TraitClothingSelectionDefinitions`. :cite[(`media/lua/shared/Definitions/TraitClothingSelectionDefinitions.lua:1-4`, `media/lua/client/OptionScreens/CharacterCreationMain.lua:1366-1368`)]

## Mutual exclusion

Exclusions are a character-creation rule, and the code that adds a trait later does not look at them.

The creator removes the excluded traits from the picker when you add a trait, and `isMutuallyExclusive` also counts the exclusions of the traits it grants. :cite[(`media/lua/client/OptionScreens/CharacterCreationProfession.lua:660-690`, `zombie/characters/traits/CharacterTraitDefinition.java:202-215`)] `CharacterTraits.add` and `set` write the flag with no exclusion test, so a character can hold both `brave` and `cowardly` if Lua adds them. :cite[(`zombie/characters/traits/CharacterTraits.java:76-90`)]

The scripts do not always list an exclusion on both traits: `obese` lists `overweight`, and `overweight` does not list `obese`. Treat exclusion as the union of both directions, which is how the clusters below are built. :cite[(`media/scripts/generated/characters/character_traits.txt:743-753`, `media/scripts/generated/characters/character_traits.txt:788-798`)]

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

## The full trait table

This table lists every trait in the 42.22 script, with the cost, exclusions and XP boosts as the script writes them and the effect text as the game shows it.

`P` marks a profession-only trait. A `Cost` of 0 on a trait that is not marked `P` means the trait is free. The XP boosts use the internal skill names, for example `Woodwork` for Carpentry and `PlantScavenging` for Foraging.

The effect text is the English translation, with its line breaks turned into spaces. :cite[(`media/lua/shared/Translate/EN/UI.json:839-840`)]

| Script id | In-game name | Cost | P | Mutually exclusive with | XP boosts | Effect | Code |
|---|---|---|---|---|---|---|---|
| `adrenalinejunkie` | Adrenaline Junkie | 4 |  | agoraphobic, claustrophobic, cowardly, desensitized |  | Moves faster when highly panicked. | :cite[(`media/scripts/generated/characters/character_traits.txt:3-12`)] |
| `agoraphobic` | Agoraphobic | -4 |  | adrenalinejunkie, brave, desensitized, claustrophobic |  | Gets panicked when outdoors. | :cite[(`media/scripts/generated/characters/character_traits.txt:14-23`)] |
| `allthumbs` | All Thumbs | -2 |  | dextrous |  | Transfers inventory items slowly. Can't craft anything while walking. Slower rope climbing speed, and higher chance of falling. Slower weapon shouldering time. | :cite[(`media/scripts/generated/characters/character_traits.txt:25-34`)] |
| `artisan` | Artisan | 2 |  |  | Glassmaking=1, Pottery=1 | Better at pottery and glass crafts. | :cite[(`media/scripts/generated/characters/character_traits.txt:36-46`)] |
| `asthmatic` | Short of Breath | -5 |  |  |  | Faster endurance loss. | :cite[(`media/scripts/generated/characters/character_traits.txt:48-56`)] |
| `athletic` | Athletic | 10 |  | overweight, fit, obese, out of shape, unfit, very underweight, smoker | Fitness=4 | Faster running speed. Can run for longer without tiring. | :cite[(`media/scripts/generated/characters/character_traits.txt:58-68`)] |
| `axeman` | Ax-pert | 0 | P |  |  | Better at chopping trees. Faster axe swing. | :cite[(`media/scripts/generated/characters/character_traits.txt:70-78`)] |
| `baseballplayer` | Baseball Player | 4 |  |  | Blunt=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:80-89`)] |
| `blacksmith` | Blacksmith Knowledge | 6 |  | blacksmith2 | Blacksmith=2, Maintenance=1 | Can use an anvil to create metal items. | :cite[(`media/scripts/generated/characters/character_traits.txt:91-102`)] |
| `blacksmith2` | Blacksmith Knowledge | 0 | P | blacksmith |  | Can use an anvil to create metal items. | :cite[(`media/scripts/generated/characters/character_traits.txt:104-113`)] |
| `brave` | Brave | 4 |  | cowardly, agoraphobic, claustrophobic, desensitized |  | Less prone to becoming panicked. | :cite[(`media/scripts/generated/characters/character_traits.txt:115-124`)] |
| `brawler` | Brawler | 6 |  |  | Axe=1, Blunt=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:126-135`)] |
| `burglar` | Burglar | 0 | P |  |  | Can hotwire vehicles. Bonuses to forcing open doors and windows. | :cite[(`media/scripts/generated/characters/character_traits.txt:137-145`)] |
| `claustrophobic` | Claustrophobic | -4 |  | adrenalinejunkie, agoraphobic, brave, desensitized |  | Gets panicked when in small indoor rooms. | :cite[(`media/scripts/generated/characters/character_traits.txt:147-156`)] |
| `clumsy` | Clumsy | -2 |  | graceful |  | Makes more noise when moving. | :cite[(`media/scripts/generated/characters/character_traits.txt:158-167`)] |
| `conspicuous` | Conspicuous | -4 |  | inconspicuous |  | More likely to be spotted by zombies. | :cite[(`media/scripts/generated/characters/character_traits.txt:169-178`)] |
| `cook` | Keen Cook | 3 |  | cook2 | Cooking=2, Butchering=1 | Knows cooking recipes. | :cite[(`media/scripts/generated/characters/character_traits.txt:180-191`)] |
| `cook2` | Keen Cook | 0 | P | cook |  | Knows cooking recipes. | :cite[(`media/scripts/generated/characters/character_traits.txt:193-202`)] |
| `cowardly` | Cowardly | -2 |  | adrenalinejunkie, brave, desensitized |  | Especially prone to becoming panicked. | :cite[(`media/scripts/generated/characters/character_traits.txt:204-213`)] |
| `crafty` | Crafty | 3 |  | fastlearner, slowlearner |  | Increased XP gains for Crafting skills. | :cite[(`media/scripts/generated/characters/character_traits.txt:215-224`)] |
| `deaf` | Deaf | -12 |  | hardofhearing, keenhearing |  | Can't hear sound. | :cite[(`media/scripts/generated/characters/character_traits.txt:226-235`)] |
| `desensitized` | Desensitized | 0 | P | adrenalinejunkie, agoraphobic, brave, claustrophobic, cowardly, hemophobic |  | Far less prone to panic. Ignore discomfort. | :cite[(`media/scripts/generated/characters/character_traits.txt:237-246`)] |
| `dextrous` | Dextrous | 2 |  | allthumbs |  | Transfers inventory items quickly. Faster rope climbing speed, and less chance of falling. Faster weapon shouldering time. | :cite[(`media/scripts/generated/characters/character_traits.txt:248-257`)] |
| `disorganized` | Disorganized | -6 |  | organized |  | Decreased container inventory capacity. Affects world containers and bags, but not your main inventory. | :cite[(`media/scripts/generated/characters/character_traits.txt:259-268`)] |
| `eagleeyed` | Eagle Eyed | 4 |  | shortsighted |  | Faster visibility fade. Higher visibility arc. Weapon sights more effective at long range. | :cite[(`media/scripts/generated/characters/character_traits.txt:270-279`)] |
| `emaciated` | Emaciated | -10 | P | obese, overweight |  | Low strength, low endurance and prone to injury. | :cite[(`media/scripts/generated/characters/character_traits.txt:281-290`)] |
| `fasthealer` | Fast Healer | 6 |  | slowhealer |  | Recovers quickly from injuries and illness. | :cite[(`media/scripts/generated/characters/character_traits.txt:292-301`)] |
| `fastlearner` | Fast Learner | 6 |  | crafty, slowlearner |  | Increased XP gains. | :cite[(`media/scripts/generated/characters/character_traits.txt:303-312`)] |
| `fastreader` | Fast Reader | 2 |  | slowreader, illiterate |  | Takes less time to read books. | :cite[(`media/scripts/generated/characters/character_traits.txt:314-323`)] |
| `feeble` | Weak | -6 |  | stout, strong, weak | Strength=-2 | Less knockback from melee weapons. Decreased carrying weight. | :cite[(`media/scripts/generated/characters/character_traits.txt:325-335`)] |
| `firstaid` | First Aider | 2 |  |  | Doctor=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:337-345`)] |
| `fishing` | Angler | 4 |  |  | Fishing=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:347-356`)] |
| `fit` | Fit | 6 |  | athletic, obese, out of shape, overweight, unfit | Fitness=2 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:358-367`)] |
| `formerscout` | Former Scout | 6 |  |  | Doctor=1, PlantScavenging=1, Fishing=1 | Start fires faster. | :cite[(`media/scripts/generated/characters/character_traits.txt:832-842`)] |
| `gardener` | Gardener | 2 |  |  | Farming=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:369-378`)] |
| `graceful` | Graceful | 4 |  | clumsy |  | Makes less noise when moving. | :cite[(`media/scripts/generated/characters/character_traits.txt:380-389`)] |
| `gymnast` | Gymnast | 5 |  |  | Lightfoot=1, Nimble=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:391-399`)] |
| `handy` | Handy | 8 |  |  | Carving=1, Maintenance=1, Masonry=1, Woodwork=1 | Faster and stronger constructions. | :cite[(`media/scripts/generated/characters/character_traits.txt:401-411`)] |
| `hardofhearing` | Hard of Hearing | -4 |  | deaf, keenhearing |  | Smaller perception radius. Smaller hearing range. | :cite[(`media/scripts/generated/characters/character_traits.txt:413-422`)] |
| `heartyappetite` | Hearty Appetite | -4 |  | lighteater, very underweight |  | Needs to eat more regularly. | :cite[(`media/scripts/generated/characters/character_traits.txt:424-433`)] |
| `hemophobic` | Fear of Blood | -5 |  | desensitized |  | Panic when performing first aid on self. Cannot perform first aid on others. Gets stressed when bloody. | :cite[(`media/scripts/generated/characters/character_traits.txt:435-444`)] |
| `herbalist` | Herbalist | 4 |  | herbalist_prof | PlantScavenging=1 | Can find medicinal herbs and craft medicines and poultices from them. | :cite[(`media/scripts/generated/characters/character_traits.txt:446-457`)] |
| `herbalist_prof` | Herbalist | 0 | P | herbalist | PlantScavenging=1 | Can find medicinal herbs and craft medicines and poultices from them. | :cite[(`media/scripts/generated/characters/character_traits.txt:459-470`)] |
| `highthirst` | High Thirst | -2 |  | lowthirst |  | Needs more water to survive. | :cite[(`media/scripts/generated/characters/character_traits.txt:483-492`)] |
| `hiker` | Hiker | 5 |  |  | PlantScavenging=1, Trapping=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:472-481`)] |
| `hunter` | Hunter | 8 |  |  | Aiming=1, Tracking=1, Sneak=1, SmallBlade=1, Butchering=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:494-503`)] |
| `illiterate` | Illiterate | -10 |  | fastreader, slowreader |  | Cannot read any books or in-world text. | :cite[(`media/scripts/generated/characters/character_traits.txt:525-534`)] |
| `inconspicuous` | Inconspicuous | 4 |  | conspicuous |  | Less likely to be spotted by zombies. | :cite[(`media/scripts/generated/characters/character_traits.txt:536-545`)] |
| `insomniac` | Restless Sleeper | -6 |  |  |  | Slow loss of tiredness while sleeping. | :cite[(`media/scripts/generated/characters/character_traits.txt:580-588`)] |
| `inventive` | Inventive | 2 |  | inventive_prof |  | Has lower skill level requirements to research recipes from items or auto learn recipes. | :cite[(`media/scripts/generated/characters/character_traits.txt:547-556`)] |
| `inventive_prof` | Inventive | 0 | P | inventive |  | Has lower skill level requirements to research recipes from items or auto learn recipes. | :cite[(`media/scripts/generated/characters/character_traits.txt:558-567`)] |
| `irongut` | Iron Gut | 2 |  | weakstomach |  | Less chance to have food illness. | :cite[(`media/scripts/generated/characters/character_traits.txt:569-578`)] |
| `jogger` | Runner | 4 |  |  | Sprinting=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:590-598`)] |
| `keenhearing` | Keen Hearing | 6 |  | deaf, hardofhearing |  | Larger perception radius. | :cite[(`media/scripts/generated/characters/character_traits.txt:600-609`)] |
| `lighteater` | Light Eater | 2 |  | heartyappetite, obese |  | Needs to eat less regularly. | :cite[(`media/scripts/generated/characters/character_traits.txt:611-620`)] |
| `lowthirst` | Low Thirst | 2 |  | highthirst |  | Needs less water to survive. | :cite[(`media/scripts/generated/characters/character_traits.txt:622-631`)] |
| `marksman` | Marksman | 0 | P |  |  | Improved gun accuracy and damage. Quicker reload. | :cite[(`media/scripts/generated/characters/character_traits.txt:633-641`)] |
| `mason` | Mason | 2 |  |  | Masonry=2 | Better at building stone and brick constructions. | :cite[(`media/scripts/generated/characters/character_traits.txt:643-653`)] |
| `mechanics` | Vehicle Knowledge | 3 |  | mechanics2 | Mechanics=1 | Has knowledge of common and commercial vehicle models, and repairs. | :cite[(`media/scripts/generated/characters/character_traits.txt:655-666`)] |
| `mechanics2` | Vehicle Knowledge | 0 | P | mechanics |  | Has knowledge of common and commercial vehicle models, and repairs. | :cite[(`media/scripts/generated/characters/character_traits.txt:668-677`)] |
| `needslesssleep` | Wakeful | 3 |  | needsmoresleep |  | Needs less sleep. | :cite[(`media/scripts/generated/characters/character_traits.txt:679-688`)] |
| `needsmoresleep` | Sleepyhead | -4 |  | needslesssleep |  | Needs more sleep. | :cite[(`media/scripts/generated/characters/character_traits.txt:690-699`)] |
| `nightowl` | Night Owl | 0 | P |  |  | Requires little sleep. Stays extra alert even when sleeping. | :cite[(`media/scripts/generated/characters/character_traits.txt:701-709`)] |
| `nightvision` | Cat's Eyes | 3 |  |  |  | Better vision at night. | :cite[(`media/scripts/generated/characters/character_traits.txt:711-719`)] |
| `nutritionist` | Nutritionist | 2 |  | nutritionist2 |  | Can see the nutritional values of any food. | :cite[(`media/scripts/generated/characters/character_traits.txt:721-730`)] |
| `nutritionist2` | Nutritionist | 0 | P | nutritionist |  | Can see the nutritional values of any food. | :cite[(`media/scripts/generated/characters/character_traits.txt:732-741`)] |
| `obese` | Very High Weight | 0 | P | athletic, emaciated, fit, lighteater, very underweight, underweight, overweight | Fitness=-2 | Reduced running speed, very low endurance and prone to injury. | :cite[(`media/scripts/generated/characters/character_traits.txt:743-753`)] |
| `organized` | Organized | 4 |  | disorganized |  | Increased container inventory capacity. | :cite[(`media/scripts/generated/characters/character_traits.txt:755-764`)] |
| `out of shape` | Out of Shape | -6 |  | athletic, fit, unfit | Fitness=-2 | Low endurance, low endurance regeneration. | :cite[(`media/scripts/generated/characters/character_traits.txt:776-786`)] |
| `outdoorsman` | Outdoorsy | 2 |  |  |  | Less affected by harsh weather conditions. | :cite[(`media/scripts/generated/characters/character_traits.txt:766-774`)] |
| `overweight` | High Weight | 0 | P | athletic, fit, emaciated, very underweight, underweight | Fitness=-1 | Reduced running speed, low endurance and prone to injury. | :cite[(`media/scripts/generated/characters/character_traits.txt:788-798`)] |
| `pacifist` | Reluctant Fighter | -5 |  |  |  | Decreased combat XP gains. | :cite[(`media/scripts/generated/characters/character_traits.txt:800-808`)] |
| `pronetoillness` | Prone to Illness | -4 |  | resilient |  | More prone to disease. Faster rate of zombification. | :cite[(`media/scripts/generated/characters/character_traits.txt:810-819`)] |
| `resilient` | Resilient | 4 |  | pronetoillness |  | Less prone to disease. Slower rate of zombification. | :cite[(`media/scripts/generated/characters/character_traits.txt:821-830`)] |
| `shortsighted` | Short Sighted | -2 |  | eagleeyed |  | Smaller view distance. Slower visibility fade. Weapon sights less effective. | :cite[(`media/scripts/generated/characters/character_traits.txt:844-853`)] |
| `slowhealer` | Slow Healer | -3 |  | fasthealer |  | Recovers slowly from injuries and illness. | :cite[(`media/scripts/generated/characters/character_traits.txt:855-864`)] |
| `slowlearner` | Slow Learner | -6 |  | crafty, fastlearner |  | Decreased XP gains. | :cite[(`media/scripts/generated/characters/character_traits.txt:877-886`)] |
| `slowreader` | Slow Reader | -2 |  | fastreader, illiterate |  | Takes longer to read books and other literature. | :cite[(`media/scripts/generated/characters/character_traits.txt:866-875`)] |
| `smoker` | Smoker | -3 |  | athletic |  | Unhappiness rises when tobacco is not smoked. Stress and unhappiness decrease after smoking tobacco. | :cite[(`media/scripts/generated/characters/character_traits.txt:888-897`)] |
| `speeddemon` | Speed Demon | 1 |  | sundaydriver |  | Drives very fast. | :cite[(`media/scripts/generated/characters/character_traits.txt:899-908`)] |
| `stout` | Stout | 6 |  | feeble, strong, weak | Strength=2 | Extra knockback from melee weapons. Increased carrying weight. | :cite[(`media/scripts/generated/characters/character_traits.txt:910-920`)] |
| `strong` | Strong | 10 |  | feeble, stout, weak | Strength=4 | Extra knockback from melee weapons. Increased carrying weight. | :cite[(`media/scripts/generated/characters/character_traits.txt:922-932`)] |
| `sundaydriver` | Sunday Driver | -1 |  | speeddemon |  | Drives very slow. | :cite[(`media/scripts/generated/characters/character_traits.txt:934-943`)] |
| `tailor` | Sewer | 4 |  |  | Tailoring=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:945-954`)] |
| `target_shooter` | Target Shooter | 5 |  |  | Aiming=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:515-523`)] |
| `thickskinned` | Thick-skinned | 8 |  | thinskinned |  | Lower chance of being scratched or bitten. | :cite[(`media/scripts/generated/characters/character_traits.txt:956-965`)] |
| `thinskinned` | Thin-skinned | -8 |  | thickskinned |  | Higher chance of being scratched or bitten by zombies. | :cite[(`media/scripts/generated/characters/character_traits.txt:967-976`)] |
| `tinkerer` | Tinkerer | 4 |  |  | Maintenance=1 |  | :cite[(`media/scripts/generated/characters/character_traits.txt:505-513`)] |
| `underweight` | Low Weight | 0 | P | obese, very underweight, overweight | Fitness=-1 | Low strength, low endurance and prone to injury. | :cite[(`media/scripts/generated/characters/character_traits.txt:978-988`)] |
| `unfit` | Unfit | -10 |  | athletic, fit, out of shape | Fitness=-4 | Very low endurance and endurance regeneration. | :cite[(`media/scripts/generated/characters/character_traits.txt:990-1000`)] |
| `very underweight` | Very Low Weight | 0 | P | athletic, obese, overweight, heartyappetite, underweight | Fitness=-2 | Very low strength, very low endurance and prone to injury. | :cite[(`media/scripts/generated/characters/character_traits.txt:1002-1012`)] |
| `weak` | Puny | -10 |  | feeble, stout, strong | Strength=-5 | Far less knockback from melee weapons. Extremely small carrying weight. | :cite[(`media/scripts/generated/characters/character_traits.txt:1014-1024`)] |
| `weakstomach` | Weak Stomach | -2 |  | irongut |  | Higher chance to have food illness. | :cite[(`media/scripts/generated/characters/character_traits.txt:1026-1035`)] |
| `weightgain` | Slow Metabolism | -2 |  | weightloss |  | Permanent tendency to gain weight. Starts with High Weight trait. | :cite[(`media/scripts/generated/characters/character_traits.txt:1037-1047`)] |
| `weightloss` | Fast Metabolism | -2 |  | weightgain |  | Permanent tendency to lose weight. Starts with Low Weight trait. | :cite[(`media/scripts/generated/characters/character_traits.txt:1049-1059`)] |
| `whittler` | Whittler | 2 |  |  | Carving=2 | Can carve wood and bone items. | :cite[(`media/scripts/generated/characters/character_traits.txt:1061-1071`)] |
| `wildernessknowledge` | Bushcrafter | 8 |  |  | PlantScavenging=1, FlintKnapping=1, Maintenance=1, Carving=1 | Can find medicinal herbs and craft medicines and poultices from them, and make simple stone and bone tools.  Start fires faster. | :cite[(`media/scripts/generated/characters/character_traits.txt:1073-1083`)] |

## Traits that grant recipes

Eighteen traits give recipes at creation, and adding one of them from Lua later gives none of them.

`CharacterTraits.add` only sets the flag, and the recipes are copied by `applyCharacterTraitsRecipes` and by the creation code. :cite[(`zombie/characters/traits/CharacterTraits.java:88-90`, `zombie/characters/IsoGameCharacter.java:11617-11628`)] The lists below are the `GrantedRecipes` line of each block. They match the 42.21 lists, including the four that changed in 42.21 (`blacksmith`, `cook`, `gardener` and `mason`).

| Trait | Granted recipes | Code |
|---|---|---|
| `artisan` | MakeGlassJar, MakeGlassBottle, MakeDrinkingGlass, MakeWineGlass, MakeGlassPanel, MakeLanternGlass | :cite[(`media/scripts/generated/characters/character_traits.txt:36-46`)] |
| `baseballplayer` | CarveBat | :cite[(`media/scripts/generated/characters/character_traits.txt:80-89`)] |
| `blacksmith` | Advanced_Forge, Blast_Furnace, Charcoal_Burner_MetalDrum, Charcoal_Pit, Dome_Kiln, Forge, Smelting_Furnace, Forge_Primitive_Forge, Primitive_Furnace, Forge_Baking_Pan, Forge_Baking_Tray, Forge_Bucket, Forge_Ball_Peen_Hammer_Head, Forge_Clawhammer_Head, Forge_Cooking_Pot, Forge_Corkscrew, Forge_Crowbar, Forge_Crude_Shortsword_Blade, Forge_Crude_Sword_Blade, Forge_Door_Knob, Forge_Fine_Butter_Knives, Forge_Fine_Forks, Forge_Fine_Spoons, Forge_Fishing_Hooks, Forge_Forceps, Forge_Forks, Forge_Frying_Pan, Forge_Garden_Hoe_Head, Forge_Gardening_Trowel, Forge_Hand_Scythe_Head, Forge_Hinge, Forge_Hunting_Knife_Blade, Forge_Kettle, Forge_Kitchen_Knife_Blade, Forge_Large_Knife_Blade, Forge_Machete_Blade, Forge_Masons_Chisel, Forge_Masons_Trowel, Forge_Meat_Cleaver_Blade, Forge_Metalworking_Chisel, Forge_Metalworking_Pliers, Forge_Metalworking_Punch, Forge_File, Forge_Drill, Forge_Nails, Forge_Needle, Forge_Pick_Axe_Head, Forge_Roasting_Pan, Forge_Saucepan, Forge_Saw, Forge_Scissors, Forge_Scythe_Head, Forge_Spade_Head, Forge_Sheep_Shears, Forge_Sledgehammer_Head, Forge_Small_Knife, Forge_Small_Steel_Sheet, Forge_Smithing_Hammer_Head, Forge_Spoons, Forge_Steel_Sheet, Forge_Straight_Razor, Forge_Sword_Blade, Forge_Tongs, Forge_Tweezers, MakeCrudeWhetstone, Forge_Heading_Tool, Forge_Draw_Plate, ForgeMaceHead, MakeSpikedClub, ForgeSpearHead, ForgeLongSpearHead, Forge_Wood_Axe_Head, Forge_Old_Axe_Head, Forge_Hand_Axe_Head, Forge_Fleshing_Tool, Forge_Cup, Forge_Buckle, Forge_Lantern, Forge_Carpentry_Chisel, Forge_Wrench | :cite[(`media/scripts/generated/characters/character_traits.txt:91-102`)] |
| `brawler` | BarbedWireWeapon, BoltBat, CanReinforceLongWeapon, CanReinforceShortWeapon, CanReinforceWeapon, SheetMetalWeapon | :cite[(`media/scripts/generated/characters/character_traits.txt:126-135`)] |
| `cook` | MakeCakeBatter, MakePieDough, MakeBreadDough, MakeBaguetteDough, MakeBiscuits, MakeChocolateChipCookieDough, MakeOatmealCookieDough, MakeShortbreadCookieDough, MakeSugarCookieDough, MakePizza, MakeFriedOnionRings, MakeFriedShrimp, MakeCabbageRolls, MakeJar, MakeGuacamole | :cite[(`media/scripts/generated/characters/character_traits.txt:180-191`)] |
| `fishing` | MakeFishingRod, FixFishingRod, MakeChum | :cite[(`media/scripts/generated/characters/character_traits.txt:347-356`)] |
| `formerscout` | MakeFishingRod, FixFishingRod, MakeChum | :cite[(`media/scripts/generated/characters/character_traits.txt:832-842`)] |
| `gardener` | MakeFliesCureFromCigarettes, MakeFliesCureFromLooseTobacco, MakeFliesCureFromChewingTobacco, MakeMildewCure, MakeAphidsCure, MakeScarecrow, base:carrot growing season, base:broccoli growing season, base:radish growing season, base:strawberry growing season, base:tomato growing season, base:potato growing season, base:cabbage growing season, base:corn growing season, base:kale growing season, base:sweet potato growing season, base:green pea growing season, base:onion growing season, base:garlic growing season, base:soybean growing season, base:basil growing season, base:chives growing season, base:cilantro growing season, base:oregano growing season, base:parsley growing season, base:sage growing season, base:rosemary growing season, base:thyme growing season, base:hops growing season, base:sugar beet growing season, base:bell pepper growing season, base:cauliflower growing season, base:cucumber growing season, base:habanero growing season, base:jalapeno growing season, base:leek growing season, base:lettuce growing season, base:pumpkin growing season, base:spinach growing season, base:sunflower growing season, base:turnip growing season, base:watermelon growing season, base:zucchini growing season, base:chamomile growing season, base:lemongrass growing season, base:marigold growing season, base:mint growing season, base:black sage growing season, base:broadleaf plantain growing season, base:comfrey growing season, base:common mallow growing season, base:wild garlic growing season, base:rose growing season, base:poppy growing season, base:lavender growing season, MakeJar | :cite[(`media/scripts/generated/characters/character_traits.txt:369-378`)] |
| `handy` | BarbedWireWeapon, BoltBat, MakeBrakeWeapon, MakeBucketMaul, CanReinforceLongWeapon, CanReinforceShortWeapon, CanReinforceWeapon, MakeGardenForkHeadWeapon, MakeKettleMaul, RailspikeBaseballBat, MakeRailspikeCudgel, MakeRailspikeIronPipe, MakeRailspikeLongHandle, MakeRailspikeWeapon, MakeRakeHeadWeapon, MakeSawPlank, MakeSawbladeCudgel, MakeSawbladeLongHandle, MakeSawbladePlank, MakeSawbladeTableLeg, MakeSawbladeWeapon, SheetMetalWeapon, MakeSpadeHeadCudgel, MakeScrewdriver | :cite[(`media/scripts/generated/characters/character_traits.txt:401-411`)] |
| `herbalist` | Herbalist, MakePlantainPoultice, MakeComfreyPoultice, MakeWildGarlicPoultice, base:black sage growing season, base:broadleaf plantain growing season, base:comfrey growing season, base:common mallow growing season, base:wild garlic growing season | :cite[(`media/scripts/generated/characters/character_traits.txt:446-457`)] |
| `herbalist_prof` | Herbalist, MakePlantainPoultice, MakeComfreyPoultice, MakeWildGarlicPoultice, base:black sage growing season, base:broadleaf plantain growing season, base:comfrey growing season, base:common mallow growing season, base:wild garlic growing season | :cite[(`media/scripts/generated/characters/character_traits.txt:459-470`)] |
| `hiker` | MakeStickTrap, MakeSnareTrap, MakeWoodenBoxTrap | :cite[(`media/scripts/generated/characters/character_traits.txt:472-481`)] |
| `hunter` | MakeStickTrap, MakeSnareTrap, MakeWoodenBoxTrap, MakeTrapBox, MakeCageTrap, MakeStagHeadTrophy | :cite[(`media/scripts/generated/characters/character_traits.txt:494-503`)] |
| `mason` | Advanced_Forge, Blast_Furnace, Dome_Kiln, Forge, Smelting_Furnace, Forge_Primitive_Forge, Primitive_Furnace | :cite[(`media/scripts/generated/characters/character_traits.txt:643-653`)] |
| `mechanics` | Basic Mechanics, Intermediate Mechanics | :cite[(`media/scripts/generated/characters/character_traits.txt:655-666`)] |
| `tailor` | KnitBalaclavaFace, KnitBalaclavaFull, KnitBeany, KnitDoily, KnitLegwarmers, KnitScarf, KnitSocks, KnitSweaterVest, KnitWoolyHat, SewCrudeLeatherBackpack, SewHideBoots, SewHidePants, SewHideSleepingBag, SewHideCoat, SewHideHoodie, SewHideJacket, SewHideRobe, SewHideHat, MakeTarpChestRig, AssembleSmallFramepack, AssembleLargeFramepack, AssembleAdvancedFramepack, AssembleAdvancedLargeFramepack, MakeGarbageBagTankTop, MakeTarpTankTop, MakeGarbageBagDress, MakeTarpDress, WeaveTwineShoes, SewLeatherCodpiece, SewLeatherGorget, SewHolster, SewHolsterDouble, MakeWesternBoots, SewBelt, SewLeatherToolRoll, SewSandals, SewLeatherGloves, SewLeatherWaterBag, SewBandolier, SewShellsBandolier, SewHideWallet, SewFurredHideCoat, SewFurredHideJacket, SewLeatherGaiter, SewLeatherVambrace, SewElbowPads, SewKneePads, SewLeatherPants, SewHideFannyBag, SewClothSatchel, SewDressKnees, SewLongjohns, SewShirt, SewSkirtKnees, SewTrousers, SewDressLong, SewLongjohnsBottom, SewShirtSleeveless, SewSkirtLong | :cite[(`media/scripts/generated/characters/character_traits.txt:945-954`)] |
| `whittler` | SharpenBone, SharpenLongBone, SharpenJawbone, MakeBoneFishingHook, MakeBoneSewingNeedle, CarveKnittingNeedles, CarveBat, MakeBoneHatchetHead, MakeBoneAwl, MakeLargeBoneBead, MakeLargeBoneBeads, CarveWoodenFork, MakeBoneFork, CarveWoodenSpade, CarveGoblets, CarveBucket, CarveFleshingTool, CarveShortBat, CarveWhistle | :cite[(`media/scripts/generated/characters/character_traits.txt:1061-1071`)] |
| `wildernessknowledge` | Herbalist, MakeStoneBlade, RemakeLongStoneBlade, MakeLongStoneBlade, MakeStoneBladeScythe, FireHardenSpear, MakePlantainPoultice, MakeComfreyPoultice, MakeWildGarlicPoultice, BindSpear, WireSpear, SharpenLongBone, MakeBoneFishingHook, MakeBoneSewingNeedle, MakeBoneAwl, MakeStoneAwl, MakeStoneChisel, MakeStoneDrill, MakeLargeStoneAxeHead, MakeStoneMaulHead, MakeBoneClub, MakeBoneHatchetHead, MakeJawboneAxe, MakeFishingRod, MakeSnareTrap, MakeStoneBladeSaw, CarveBucket, CarveFleshingTool, MakeCrudeWhetstone | :cite[(`media/scripts/generated/characters/character_traits.txt:1073-1083`)] |

## Traits only a profession grants

Sixteen traits are marked profession-only, and a profession script grants ten of them.

The table names the professions that list each trait in `GrantedTraits`. The five weight traits are set by the character's weight, and `marksman` is granted by no profession script. :cite[(`media/scripts/generated/characters/character_professions.txt:3-260`)]

| Trait | In-game name | Cost | Granted by | Code |
|---|---|---|---|---|
| `axeman` | Ax-pert | 0 | Lumberjack | :cite[(`media/scripts/generated/characters/character_traits.txt:70-78`)] |
| `blacksmith2` | Blacksmith Knowledge | 0 | Blacksmith | :cite[(`media/scripts/generated/characters/character_traits.txt:104-113`)] |
| `burglar` | Burglar | 0 | Burglar | :cite[(`media/scripts/generated/characters/character_traits.txt:137-145`)] |
| `cook2` | Keen Cook | 0 | Burger Flipper, Chef | :cite[(`media/scripts/generated/characters/character_traits.txt:193-202`)] |
| `desensitized` | Desensitized | 0 | Veteran | :cite[(`media/scripts/generated/characters/character_traits.txt:237-246`)] |
| `emaciated` | Emaciated | -10 | no profession script | :cite[(`media/scripts/generated/characters/character_traits.txt:281-290`)] |
| `herbalist_prof` | Herbalist | 0 | Park Ranger | :cite[(`media/scripts/generated/characters/character_traits.txt:459-470`)] |
| `inventive_prof` | Inventive | 0 | DIY Expert | :cite[(`media/scripts/generated/characters/character_traits.txt:558-567`)] |
| `marksman` | Marksman | 0 | no profession script | :cite[(`media/scripts/generated/characters/character_traits.txt:633-641`)] |
| `mechanics2` | Vehicle Knowledge | 0 | Mechanic | :cite[(`media/scripts/generated/characters/character_traits.txt:668-677`)] |
| `nightowl` | Night Owl | 0 | Nurse, Security Guard | :cite[(`media/scripts/generated/characters/character_traits.txt:701-709`)] |
| `nutritionist2` | Nutritionist | 0 | Fitness Instructor | :cite[(`media/scripts/generated/characters/character_traits.txt:732-741`)] |
| `obese` | Very High Weight | 0 | no profession script | :cite[(`media/scripts/generated/characters/character_traits.txt:743-753`)] |
| `overweight` | High Weight | 0 | no profession script | :cite[(`media/scripts/generated/characters/character_traits.txt:788-798`)] |
| `underweight` | Low Weight | 0 | no profession script | :cite[(`media/scripts/generated/characters/character_traits.txt:978-988`)] |
| `very underweight` | Very Low Weight | 0 | no profession script | :cite[(`media/scripts/generated/characters/character_traits.txt:1002-1012`)] |

Two professions grant `nightowl`, Nurse and Security Guard. The older notes gave it to Security Guard alone, which is wrong for 42.22. :cite[(`media/scripts/generated/characters/character_professions.txt:158-166`, `media/scripts/generated/characters/character_professions.txt:210-218`)]

## Traits the engine adds and removes

Strength, fitness and weight traits are not chosen in play, because the engine swaps them as the numbers change.

Each time Strength levels, the engine removes `weak`, `feeble`, `stout` and `strong`, then adds one by level. Levels 0 and 1 give `weak`, 2 to 4 give `feeble`, 6 to 8 give `stout` and 9 and above give `strong`, and level 5 gives none. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:201-217`)] Fitness works the same way with `unfit` (0 to 1), `out of shape` (2 to 4), `fit` (6 to 8) and `athletic` (9 and above). :cite[(`media/lua/server/XpSystem/XpUpdate.lua:221-235`)]

The in-game names are Puny for `weak`, Weak for `feeble` and Out of Shape for `out of shape`, as the table above shows.

Weight sets the five weight traits. `applyTraitFromWeight` clears them and adds one: `obese` at 100 or more, `overweight` from 85 up to 100, `underweight` above 65 up to 75, `very underweight` above 50 up to 65 and `emaciated` at 50 or less. :cite[(`zombie/characters/BodyDamage/Nutrition.java:224-248`)] In the other direction, a character created with one of those traits starts at a fixed weight: 50, 60, 70, 95 and 105 for emaciated, very underweight, underweight, overweight and obese. :cite[(`zombie/characters/BodyDamage/Nutrition.java:200-222`)]

## Changes since Build 41

Build 42 moved traits from Lua calls to scripts, and the trait list that carried over is close to the Build 41 one.

The comparison uses the owner's copy of the Build 41 install, not the 42.22 capture. That file has 85 active `TraitFactory.addTrait` lines and 14 more that are commented out. Two active B41 traits, `Lucky` and `Unlucky`, have no B42 definition. B41 spelled two ids with typos, `Claustophobic` and `HeartyAppitite`, and B42 spells them `claustrophobic` and `heartyappetite`.

The older notes listed 12 B41 traits as missing from B42. Ten of them are commented out in the B41 file itself: `Patient`, `ShortTemper`, `Brooding`, `Hypercondriac`, `LightDrinker`, `HeavyDrinker`, `GiftOfTheGab`, `Injured`, `SelfDefenseClass` and `PlaysFootball`. The B41 file also comments out `Metalworker`, `Metalworker2`, `Blacksmith` and `Blacksmith2`, so the older claim that B42 merged Metalworker into Blacksmith is not supported.

Twelve B42 traits have no B41 line at all, active or commented: `artisan`, `crafty`, `herbalist_prof`, `inventive`, `inventive_prof`, `mason`, `target_shooter`, `tinkerer`, `weightgain`, `weightloss`, `whittler` and `wildernessknowledge`.

:::callout[How we know]{kind=proof}
Every cost, exclusion, XP boost, recipe list and count above comes from `character_traits.txt` and the Java and Lua cited in each section. A script counted the blocks and the keys, and the numbers match the rows above. The 97 definitions have the same costs, exclusions, boosts and recipes as the 42.21 table this page replaces. The one change we found in the trait text is the Burglar description, which now reads "Can hotwire vehicles. Bonuses to forcing open doors and windows."

We searched the capture's Lua and Java and found nothing that reads `DisabledInMultiplayer` outside the definition classes, so we cannot say it has any effect. The exclusion clusters are our own grouping, built with a script from the union of both directions. The B41 comparison comes from the owner's B41 install copy, which is not part of the 42.22 capture. We did not run a game for any of this page.
:::
