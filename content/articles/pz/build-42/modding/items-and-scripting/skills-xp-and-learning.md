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
  - item-scripts
  - tags
  - workstation
  - tech-tiers
  - timedaction
excerpt: 'All [CONFIRMED] from vanilla recipe files unless noted.'
last_updated: '2026-09-29'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - items-the-item-block-in-b42
  - tags
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - timedaction-blocks
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
# Skills, XP, and learning

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

All `[CONFIRMED]` from vanilla recipe files unless noted.

### 8.1 Skill requirement and XP

```
SkillRequired = Blacksmith:1,     // must have Blacksmith level >= 1 to craft
xpAward       = Blacksmith:20,     // grants 20 Blacksmith XP on success
```
Format is `Skill:Level` (for requirement) and `Skill:Amount` (for XP). Multiple can be chained with `;` (e.g. `xpAward = Cooking:3;Farming:2` pattern). `SawLogs` uses `xpAward = Woodwork:5`. `[CONFIRMED]`

### 8.2 The learning gates

| Property | Meaning |
|---|---|
| `needTobeLearn = true` | Recipe is NOT known by default; must be unlocked somehow (magazine, research, or auto-learn). (Note the vanilla spelling `needTobeLearn`.) |
| `AutoLearnAll = Blacksmith:3` | Automatically learned once the player reaches Blacksmith level 3 (ALL listed conditions required). |
| `AutoLearnAny = Carving:8` | Auto-learned when ANY one listed condition is met. |
| `TeachedRecipes = ...` (on a Literature item) | Reading/owning that magazine teaches these recipe IDs. |
| `ResearchableRecipes = ...` (on an item) | Player can learn these recipes by researching/disassembling this item. |

Recipe-magazine item (from `items/items_literature_recipe.txt`) `[CONFIRMED]`:

```
item ArmorMag4
{
    DisplayName = European Armor in the Late Medieval Era (Armor),
    DisplayCategory = SkillBook,
    Type = Literature,
    Weight = 0.5,
    Icon = Magazine_EarlyArmour3,
    BoredomChange = -20,
    StressChange = -15,
    TeachedRecipes = Assemble_Shoulder_Armor;Forge_Codpiece;Forge_Gorget;Forge_Metal_Helmet;Forge_CoatOfPlates;Forge_Buckle,
    StaticModel = Magazine,
    WorldStaticModel = ArmorMag4,
    Tags = Magazine,
}
```
Comment in that file confirms: *"as we don't consume literature items when reading them, we don't need to declare ReplaceOnUse."* `[CONFIRMED]`

Skill BOOK (trains a skill band, teaches NO recipe) from `items/items_literature_skill.txt` `[CONFIRMED]`:

```
item BookCarpentry1
{
    DisplayName = Carpentry I: "A Guide to Nailing",
    DisplayCategory = SkillBook,
    Type = Literature,
    Weight = 1,
    LvlSkillTrained = 1,        // covers skill levels 1..(1+2)
    NumLevelsTrained = 2,
    NumberOfPages = 220,
    SkillTrained = Carpentry,
    StaticModel = BookBrown,
    WorldStaticModel = BookBrown_Ground,
}
```

**The mental model:** skill books gate the *XP multiplier* over a level band; magazines/research/auto-learn gate *which recipes you know*; `SkillRequired` gates *whether you can execute a known recipe*. All three are independent.

### 8.3 Lua hooks

`OnTest`, `OnCreate`, `OnGiveXP` point at Lua functions `[CONFIRMED]`:

```
OnCreate = Recipe.OnCreate.OpenBeer,
OnTest   = Recipe.OnTest.BottleNotOpened,
AllowBatchCraft = False,
```
`OnTest` gates availability at runtime; `OnCreate` runs custom logic on the produced item(s). `AllowBatchCraft` toggles the "craft many" UI.
