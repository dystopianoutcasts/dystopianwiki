---
id: build-42-learning-paths
slug: learning-paths
title: 'Learning: learn-by-doing, skill books, recipe magazines and auto-learn'
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - skills
  - traits
  - professions
  - xp
  - craftrecipe-gating
excerpt: >-
  How a character gains skill levels and recipe knowledge in 42.22: learn by doing, skill books, recipe magazines, auto-learn, and the one-level-short rule. The two are separate systems.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - xp-level-thresholds-multipliers
  - recipe-gating-in-b42-scripts
  - skills-xp-and-learning
  - trait-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- Two things are learned. A skill level rises with XP. Recipe knowledge is a list of known recipe names. The engine gates them separately.
- Doing something raises a skill only when that action grants XP, for example a `craftRecipe` with `xpAward`.
- A skill book does not teach a recipe. It multiplies XP for two levels at a time. A recipe magazine teaches recipes through `LearnedRecipes`, and 42.22 reads no other item key for that. An item can also carry one recipe in its mod data.
- `AutoLearnAll` and `AutoLearnAny` teach a recipe when the character's levels reach the listed ones, one level lower for an Inventive character and never below 1. The check runs when a level changes and when a world loads.
- A recipe you know but are exactly one level short for in every missing skill can still be crafted while a magazine that teaches it is in one of the containers the craft searches, if it is light enough to read and you are not illiterate.
:::

:::facts
- **Skill books** 24 skills, 5 volumes each, 2 levels per volume
- **Book volumes start at level** 1, 3, 5, 7 or 9 (any other value prints an error)
- **A book is too hard when its first level is above** your level plus 1
- **Auto-learn discount for Inventive** 1 level, never below 1
- **Research level when the recipe sets none** two thirds of the highest skill requirement, rounded, at least 1
- **Inventive research discount** 2 levels
:::

## 1. Two things are learned

**A skill level and a known recipe are different records, and the known-recipe check has rules of its own.**

The character's known-recipe list is a list of names. A recipe counts as known when it does not set `NeedToBeLearn`, when its name, its translation name or its meta recipe is in the list, or when the sandbox option `SeeNotLearntRecipe` shows everything. :cite[(`zombie/characters/IsoGameCharacter.java:11720-11731`)] That sandbox option defaults to true, so the plain known-recipe check passes for every recipe by default. Crafting asks the question again with the sandbox option ignored, so a recipe that needs learning still has to be learned. :cite[(`zombie/SandboxOptions.java:224`, `media/lua/shared/Sandbox/Apocalypse.lua:147`, `zombie/characters/IsoGameCharacter.java:11749-11751`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:355-361`)]

A skill level is a number from 0 to 10 held in the character's perk list, and XP decides it. The XP rules are in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

## 2. Skill level: learn by doing

**An action raises a skill only when the code that runs it grants XP, and a recipe does that with `xpAward`.**

A `craftRecipe` with `xpAward = Woodwork:10` grants XP for each listed skill when the craft completes. On a server it calls `GameServer.addXp`, and in single player it calls `AddXP`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:468-480`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1464-1488`, `media/scripts/generated/entities/agricultural/workstations/entity_Drying_Rack.txt:479`)] The XP then goes through the multipliers.

Other actions, such as combat, running and reloading, grant XP from Lua. Those amounts are in [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level) and in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

## 3. Skill books

**A skill book changes how fast XP arrives for two levels of one skill, and its own fields teach no recipe.**

A skill book is a literature item with four fields.

| Field | What it does | Code |
|---|---|---|
| `SkillTrained` | The skill's book name, which the Lua table `SkillBook` turns into a skill. | `zombie/scripting/objects/Item.java:2499-2500`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-196` |
| `LvlSkillTrained` | The first level the volume covers. Only 1, 3, 5, 7 and 9 have a multiplier. | `zombie/scripting/objects/Item.java:2501-2502`, `media/lua/shared/TimedActions/ISReadABook.lua:491-505` |
| `NumLevelsTrained` | How many levels it covers. The script default is 1, and every vanilla book sets 2. | `zombie/scripting/objects/Item.java:200`, `zombie/scripting/objects/Item.java:2503-2504`, `media/scripts/generated/items/literature.txt:6311-6322` |
| `NumberOfPages` | The length of the book, which sets how long reading takes and how the multiplier grows. | `zombie/scripting/objects/Item.java:2497-2498`, `media/lua/shared/TimedActions/ISReadABook.lua:103-118` |

Vanilla has 24 skills with books and 5 volumes for each, so a full set covers levels 1 to 10. :cite[(`media/scripts/generated/items/literature.txt:6311-6322`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-196`)] The multiplier values by volume are in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

Reading has three limits, and in each case the action stops with a halo message. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:38-60`, `media/lua/shared/TimedActions/ISReadABook.lua:79-100`)]
- **Too hard:** the book's first level is more than one above the reader's level.
- **Too easy:** the book's top level is below the reader's level plus one.
- **Illiterate:** an Illiterate reader gets nothing.

Volume 2 (levels 3 and 4) can therefore be used at reader levels 2 and 3.

The Read entry in the inventory menu is offered only when the item is literature, it is not tagged uninteresting, the reader is not illiterate (or the book is a picture book) and the reader is not in the dark. :cite[(`media/lua/client/ISUI/ISInventoryPane.lua:1109`)]

## 4. Recipe knowledge: the four fields

**A recipe asks for a skill with `SkillRequired`, hides itself with `NeedToBeLearn`, and can teach itself with `AutoLearnAll` or `AutoLearnAny`.**

| Field | Meaning | Code |
|---|---|---|
| `SkillRequired = Blacksmith:4` | The character must have that level in each listed skill. Several skills are separated by `;`, for example `Blacksmith:4;Tailoring:3`. A level of 0 or less is dropped. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:367-384` |
| `NeedToBeLearn = true` | The recipe is unknown until its name is added to the known list. The key is matched without regard to case, so the older spelling `needTobeLearn = true` loads the same. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:397-398`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:355-361` |
| `AutoLearnAll = Blacksmith:6` | The recipe is learned once every listed skill is at its level. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:431-445`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:916-935` |
| `AutoLearnAny = Carving:8` | The recipe is learned once any one listed skill is at its level. Like `AutoLearnAll`, it takes a list such as `Carving:8;Tailoring:6`. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:416-430`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:897-914` |

An `AutoLearn` key does nothing for a recipe that does not set `NeedToBeLearn`, because that recipe is already known. :cite[(`zombie/scripting/ScriptManager.java:1196-1208`, `zombie/characters/IsoGameCharacter.java:11720-11731`)] A recipe that sets `NeedToBeLearn` and no `AutoLearn` key is learned by other routes, for example a magazine, research, a trait or profession grant, or Lua. The grants are in [Vanilla trait reference](/pz/build-42/modding/skills-and-traits/trait-reference).

An Inventive character counts every `AutoLearn` level as one lower, and never below 1. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:897-935`, `zombie/characters/IsoGameCharacter.java:17232-17234`)] The check runs for every unknown recipe each time a character gains or loses a skill level, because vanilla's `LevelPerk` listener asks for it, and once when a world loads. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:196-198`, `media/lua/server/XpSystem/XpUpdate.lua:387-389`, `zombie/iso/IsoWorld.java:2442`)]

Three other rules come from the same recipe code.
- **Research level:** a recipe may set `ResearchSkillLevel`. When it does not, the engine uses two thirds of the highest `SkillRequired` level, rounded, with a minimum of 1, or the highest `AutoLearn` level in the same way when the recipe has no `SkillRequired`. An `AutoLearnAll` level counts here only when the recipe also has an `AutoLearnAny` list, which looks like a bug in the code (not tested). An Inventive character researches at 2 levels lower. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:382-383`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1228-1252`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1273-1287`)] How the research action uses this level is not read for this page.
- **Lua-taught recipes:** vanilla Lua also learns a few named recipes by level: Basic, Intermediate and Advanced Mechanics at Mechanics 8, 9 and 10, Generator at Electrical 3, and the farming season recipes at Farming 10. An Inventive character needs one level less. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:240-265`, `media/lua/server/XpSystem/XpUpdate.lua:347-372`)]
- **Gate versus teach:** `SkillRequired` decides whether a known recipe can be crafted, and `AutoLearn` decides whether it becomes known. The two are separate, and so are skill books. The craftRecipe side is in [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning).

## 5. Recipe magazines

**A recipe magazine is a literature item with `LearnedRecipes`, and reading it to the end teaches every listed recipe the character does not know.**

`LearnedRecipes` takes recipe names separated by `;`. :cite[(`zombie/scripting/objects/Item.java:2777-2784`)] When the reading action completes, the character's `ReadLiterature` adds each listed recipe that is not yet known. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:323-343`, `zombie/characters/IsoGameCharacter.java:4897-4907`)] That call is skipped for a skill book, and for an item whose `literatureTitle` the character has already read, so a re-read teaches nothing. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:203-207`, `media/lua/shared/TimedActions/ISReadABook.lua:337-347`)] Separately, an item can carry one recipe in its mod data under `learnedRecipe`, and reading teaches that one whatever the item is, even a skill book. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:353-355`, `zombie/inventory/types/Literature.java:560-564`)] :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:353-355`, `zombie/inventory/types/Literature.java:560-564`)]

The older item key `TeachedRecipes` is not read in 42.22. No Java, script or Lua file uses it, apart from seven non-English tooltip translation files (AR, ES, KO, NL, PT, PTBR and UA), and the item loader has no branch for it. A mod that still writes `TeachedRecipes` teaches nothing; rename it to `LearnedRecipes`. :cite[(`zombie/scripting/objects/Item.java:2777`)]

A recipe magazine is not consumed. Only items tagged `ConsumeOnRead` are used up, and in vanilla two entertainment magazines carry that tag. :cite[(`zombie/characters/IsoGameCharacter.java:4909-4911`, `media/scripts/generated/items/literature.txt:1690`, `media/scripts/generated/items/literature.txt:1703`)] Vanilla's recipe magazines, such as `ArmorMag4`, list their recipes in `LearnedRecipes` and carry only the `magazine` tag. :cite[(`media/scripts/generated/items/literature.txt:5159-5172`)]

:::callout[A known recipe, one level short]{kind=design}
A recipe that sets `NeedToBeLearn`, that the character already knows, and that lists `SkillRequired` can still be crafted when every skill the character lacks is short by exactly one level and a magazine that teaches that recipe is at hand. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:1491-1554`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:367-384`)]

"At hand" means the magazine is in one of the containers of the list that the craft is given. Each of those containers is searched without looking inside the bags it holds. Only the meta-recipe check searches the inventory and its bags recursively.

When the caller gives no container list, the skill check fails at once, so that case cannot grant the craft. The check fails when the player is too dark to read, and an illiterate character can use only a picture book. :cite[(`zombie/inventory/ItemContainer.java:3764-3796`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:367-379`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1535-1553`)]
:::

## Summary

| Mechanism | Affects | Consumed? | Field or call |
|---|---|---|---|
| Doing an action | skill level | no | `xpAward` on a recipe, or a Lua or Java XP grant |
| Skill book | skill XP rate for two levels | no | `SkillTrained`, `LvlSkillTrained`, `NumLevelsTrained` |
| Recipe magazine | recipes known | no, unless tagged `ConsumeOnRead` | `LearnedRecipes` |
| Auto-learn | recipes known | not applicable | `AutoLearnAll`, `AutoLearnAny` |
| Hard gate | whether a known recipe can be crafted | not applicable | `SkillRequired`, `NeedToBeLearn` |

:::callout[How we know]{kind=proof}
Every rule above is read from the 42.22 Java, Lua and scripts in the lines cited. The counts (24 skills, 5 volumes, 2 levels each, two `ConsumeOnRead` items) come from a script over `literature.txt` and the `SkillBook` table. We did not play a reading session or craft a recipe, so the at-hand rule and the halo messages are read from the code, not observed.

Dropped from the older page: `TeachedRecipes` (42.22 reads only `LearnedRecipes`), the claim that a magazine "flips a recipe to known" under that key, the claim that `NeedToBeLearn` alone means "you will not auto-learn it by levelling" (an `AutoLearn` key does exactly that), and the changelog-sourced statement that the developers relaxed auto-learn levels in 42.x, which the code cannot show. The older notes named `items_literature_skill.txt` and `items_literature_recipe.txt`; in 42.22 both kinds of item are in one generated file, `literature.txt`. Kept and corrected: Inventive now has its numbers, and Illiterate is shown where it applies. Not verified: how the research action spends the research level, and how a multiplayer server syncs learned recipes to the client.
:::
