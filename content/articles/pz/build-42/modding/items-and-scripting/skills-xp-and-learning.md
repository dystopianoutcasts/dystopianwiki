---
id: build-42-skills-xp-and-learning
slug: skills-xp-and-learning
title: 'Skills, XP, and learning'
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - craftrecipe
  - skills
  - xp
  - learning
  - recipes
excerpt: >-
  How a Build 42.22 craftRecipe asks for a skill, awards XP, and becomes known: SkillRequired, xpAward, NeedToBeLearn, the learning routes, skill books and the Lua hooks.
last_updated: '2026-11-16'
related_articles:
  - the-big-picture
  - items-the-item-block-in-b42
  - overriding-patching-vanilla
  - tech-tiers-and-production-chains
  - master-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who want a recipe to need a skill, give XP, or be learned from a magazine. To add a new skill, use [New skill](/pz/build-42/modding/cookbook/new-skill); the level numbers are on [XP level thresholds](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

:::callout[The 1-minute version]{kind=key}
- A recipe's `SkillRequired = Skill:Level` is a minimum level, and `xpAward = Skill:Amount` is raw XP. Several skills are separated by `;`.
- `xpAward` is raw XP before the character's boosts and the sandbox multipliers are applied. The 1.5 factor in the engine applies to the XP each level needs, not to the award.
- `NeedToBeLearn = true` hides a recipe until it is learned. The routes are `AutoLearnAll`, `AutoLearnAny`, a magazine item with `LearnedRecipes`, and `ResearchableRecipes` on an item.
- Skill books are a different thing: they raise the XP multiplier for a band of levels, and the vanilla skill books carry no `LearnedRecipes`.
- The hook keys are `OnTest`, `OnStart`, `OnUpdate`, `OnCreate` and `OnFailed`. There is no `OnGiveXP` key.
:::

:::facts
- **SkillRequired lines in vanilla** 591, in `media/scripts`
- **xpAward lines in vanilla** 714
- **NeedToBeLearn** 377 `true` lines and 40 `false` lines
- **AutoLearnAll and AutoLearnAny** 160 and 126 lines
- **XP for level 1, with the 1.5 factor** 75 for a skill whose table starts at 50, so an `xpAward` of 25 is a third of level 1
- **Level 10 total for the same skill** 32,775 XP
:::

## 1. Requirement and award

**`SkillRequired` sets the minimum level a recipe needs, and `xpAward` sets the XP it gives.**

Both keys are lists of `Skill:Number` pairs separated by `;`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:468-481`)] The skill name is looked up by the engine's skill names, and a name it does not know is logged as a warning and skipped. A requirement of level 0 is dropped, and a number that does not parse becomes 1. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415`)]

A vanilla recipe shows the keys together. The first forged hammer head asks for Blacksmith 1, is learned at Blacksmith 3, and gives 25 XP. :cite[(`media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_heads.txt:3-14`)]

```
craftRecipe Forge_Smithing_Hammer_Head
{
    SkillRequired = Blacksmith:1,
    NeedToBeLearn = true,
    AutoLearnAll = Blacksmith:3,
    xpAward = Blacksmith:25,
    Tags = PrimitiveForge,
    ...
}
```

The skill names in `SkillRequired` come from the 13 first names used across the 591 vanilla lines.

:::chips
- Tailoring
- Blacksmith
- Woodwork
- MetalWelding
- Carving
- Maintenance
- Masonry
- Electricity
- FlintKnapping
- Strength
- Glassmaking
- Pottery
- Trapping
:::

`Woodwork` is the id the scripts use, and the game shows it as Carpentry. :cite[(`zombie/characters/skills/PerkFactory.java:117`)]

## 2. What happens when the craft finishes

**The XP is added after the outputs exist, and then the character's boosts and the sandbox multipliers apply.**

The craft checks the skill and the learning first, then consumes the inputs, creates the outputs and only then awards XP. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeManager.java:350-358`, `zombie/entity/components/crafting/recipe/CraftRecipeData.java:497-509`)] On a dedicated server the server adds the XP, and in single player the character adds it directly. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:1478-1485`)]

The amount then passes the boosts in `AddXP`: the profession or trait boost for that skill (one quarter, one, 1.33 or 1.66 times, by boost level, and one quarter for a skill with no boost entry unless the skill is excluded), Fast Learner at 1.3, Slow Learner at 0.7, Crafty at 1.3 for skills under Crafting, Pacifist at 0.75 for the weapon skills and Aiming, then the book multiplier for the skill. :cite[(`zombie/characters/IsoGameCharacter.java:17812-17866`)] The last step is the sandbox multiplier, either the global one when its toggle is on or the one for that skill. :cite[(`zombie/characters/IsoGameCharacter.java:17867-17873`)] A sleeping character gets no XP. :cite[(`zombie/characters/IsoGameCharacter.java:17783-17784`)]

## 3. The 1.5 factor

**The engine multiplies each level's XP requirement by 1.5 when it creates a skill, and it does not multiply `xpAward`.**

Each skill is registered with ten numbers, and each one is multiplied by 1.5 and cut to a whole number. :cite[(`zombie/characters/skills/PerkFactory.java:87-96`)] Blacksmith is registered with 50, 100, 200, 500, 1000, 2000, 3000, 4000, 5000 and 6000. :cite[(`zombie/characters/skills/PerkFactory.java:125`)] The XP needed for a level is the sum of the numbers up to it. :cite[(`zombie/characters/skills/PerkFactory.java:314-325`)]

So Blacksmith needs 75, 150, 300, 750, 1,500, 3,000, 4,500, 6,000, 7,500 and 9,000 XP for levels 1 to 10, and 75, 225, 525, 1,275, 2,775, 5,775, 10,275, 16,275, 23,775 and 32,775 in total. A recipe with `xpAward = Blacksmith:25` gives a third of level 1 before boosts. The [XP level thresholds](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers) page has the full table, and [New skill](/pz/build-42/modding/cookbook/new-skill) shows how to register your own numbers.

## 4. Four ways to learn a recipe

**A recipe with `NeedToBeLearn = true` stays hidden until one of four things teaches it.**

The engine checks `NeedToBeLearn` at craft time, and the character knows the recipe when its name is in the known list. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:397-398`, `zombie/characters/IsoGameCharacter.java:11724-11730`)] The craft check asks the question with the sandbox option ignored, but the plain known-recipe check also passes when the sandbox option `SeeNotLearntRecipe` is on or the character knows all recipes, and it matches meta-recipe and translation names too. :cite[(`zombie/characters/IsoGameCharacter.java:11724-11730`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:350-358`)] Vanilla spells the key `NeedToBeLearn`, and the loader reads keys without regard to case. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:397`)]

| Route | Where it is written | What it does | Code |
|---|---|---|---|
| `AutoLearnAll = Blacksmith:3` | on the recipe | learned once every listed skill is at its level, one level lower for an inventive character, never below 1 | `zombie/scripting/entity/components/crafting/CraftRecipe.java:431-445`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:916-930`, `zombie/scripting/ScriptManager.java:1196-1208` |
| `AutoLearnAny = Carving:8` | on the recipe | learned once any one listed skill is at its level, with the same one-level discount | `zombie/scripting/entity/components/crafting/CraftRecipe.java:416-430`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:897-906`, `zombie/scripting/ScriptManager.java:1196-1208` |
| `LearnedRecipes = A;B` | on an item, in vanilla only on literature | reading the item teaches each listed recipe the character does not know | `zombie/scripting/objects/Item.java:2777-2784`, `zombie/characters/IsoGameCharacter.java:4897-4909` |
| `ResearchableRecipes = A;B` | on an item | lists recipes the item can be researched for | `zombie/scripting/objects/Item.java:2788-2795` |

The `AutoLearn` check runs for every unknown recipe when a character gains a skill level and when a world loads. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:196-198`, `zombie/iso/IsoWorld.java:2442`)] The item keys are on the item, and the `AutoLearn` keys are on the recipe. A recipe magazine in vanilla is a literature item with `LearnedRecipes`. :cite[(`media/scripts/generated/items/literature.txt:5159-5172`)]

```
item ArmorMag4
{
    DisplayCategory = RecipeResource,
    ItemType = base:literature,
    LearnedRecipes = base:assemble_shoulder_armor;Assemble_Articulated_Thigh_Armor;Forge_Codpiece;...,
    Tags = base:magazine,
    OnCreate = ItemCodeOnCreate.onCreateRecipeMagazine,
}
```

The old key name `TeachedRecipes` is not read: no vanilla line uses it, and the item loader has no branch for it. :cite[(`zombie/scripting/objects/Item.java:2777`)] There are 199 `LearnedRecipes` lines and 955 `ResearchableRecipes` lines in vanilla. The recipe keys `ResearchAll` and `ResearchAny` also exist and take skill names. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:446-467`)] This page does not explain the research screens; that part is not verified.

## 5. Skill books

**A skill book raises the XP multiplier for a band of levels and teaches no recipe.**

A skill book is a literature item with `SkillTrained`, whose value is the key of the Lua skill-book table (`Carpentry`), not the script skill id (`Woodwork`). The table entry points at the perk, and the perk ids are what `SkillRequired` and `xpAward` use. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:38`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:19-20`, `zombie/characters/skills/PerkFactory.java:392-394`)]

A skill book also has `LvlSkillTrained`, `NumLevelsTrained` and `NumberOfPages`. :cite[(`zombie/scripting/objects/Item.java:2497-2504`)] Vanilla has 120 such items in `literature.txt`, and none of them has a `LearnedRecipes` line. The first carpentry book trains from level 1 for two levels. :cite[(`media/scripts/generated/items/literature.txt:6310-6322`)]

```
item BookCarpentry1
{
    DisplayCategory = SkillBook,
    ItemType = base:literature,
    LvlSkillTrained = 1,
    NumLevelsTrained = 2,
    NumberOfPages = 220,
    SkillTrained = Carpentry,
}
```

While you read, the multiplier grows by one tenth of the book's maximum for each tenth of the pages read, and it is applied to that band of levels. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:102-116`)] The maximum comes from a table in Lua, picked by the book's starting level: 1, 3, 5, 7 or 9. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:491-502`)] The table has 24 skills. 21 of them use 3, 5, 8, 12 and 16, and Aiming, Reloading and LongBlade use 1.5, 2.5, 4, 6 and 8. :cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:1-25`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:164-188`)]

So three things are independent: skill books change how fast XP arrives, the learning routes decide which recipes are known, and `SkillRequired` decides whether a known recipe can be crafted.

## 6. XP that does not come from a recipe

**Weapons give XP from Lua, not from `xpAward`, and Aiming shows the pattern.**

When a ranged weapon hits, the hit XP for Aiming is the hit count, multiplied by 2.7 while Aiming is below level 5. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:81-85`)] At level 5 and above the multiplier is gone, which is 1 divided by 2.7, or about 0.37 of the earlier amount. That is the rule behind the "0.37037" figure on the thresholds page.

## 7. Lua hooks on a recipe

**A craftRecipe can call Lua or Java functions by name at five points.**

The loader reads `OnTest`, `OnAddToMenu`, `OnStart`, `OnUpdate`, `OnCreate` and `OnFailed`, and the engine's list of call points holds five of them, without `OnAddToMenu`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:384-395`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1626-1632`)]

- **`OnTest`** is asked about one item and one character, and the function must return true for the item to count. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:1017-1036`)]
- **`OnCreate`** is called with the craft data and the character after the outputs exist. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeData.java:466-473`)]
- A name the engine cannot find is logged as `Could not find lua function` on the craft-logic channel, and the call is skipped. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeData.java:421-434`)]

Vanilla values name Java class methods, not recipe tables, for example `OnCreate = RecipeCodeOnCreate.minorCondition,` with 584 `OnCreate` lines and 20 `OnTest` lines in vanilla. The class is exposed to Lua, and the method exists. :cite[(`zombie/Lua/LuaManager.java:1972`, `zombie/scripting/logic/RecipeCodeOnCreate.java:1072`)] The old example `Recipe.OnCreate.OpenBeer` is not in the 42.22 files.

`AllowBatchCraft = false,` turns off the craft-many controls. It defaults to true, and vanilla has 111 `false` lines and one `true` line. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:93`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:499-500`, `media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipePanel.lua:90`)]

:::callout[How we know]{kind=proof}
The key parsing, the XP path and the learning checks were read from the 42.22 source, and the counts were made over `media/scripts`. Not verified: the research screens behind `ResearchableRecipes`, `ResearchAll` and `ResearchAny`; that `OnAddToMenu` is called anywhere (the loader reads it, and the call list in the enum does not include it); and no recipe here was run in a game. Dropped from the old page: the `OnGiveXP` key, which no line reads, and the `Recipe.OnCreate.OpenBeer` example.
:::
