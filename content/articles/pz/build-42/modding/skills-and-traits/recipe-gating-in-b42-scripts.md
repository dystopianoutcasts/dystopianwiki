---
id: build-42-recipe-gating-in-b42-scripts
slug: recipe-gating-in-b42-scripts
title: Recipe gating in B42 scripts
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
  How a Build 42.22 craftRecipe asks for a skill, gives XP and stays hidden until learned, read from a real vanilla blacksmith recipe, with the old magazine key corrected.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - xp-level-thresholds-multipliers
  - learning-paths
  - modding-add-a-skill
  - concrete-b42-examples
  - skills-xp-and-learning
  - craftrecipe-reference
  - handcraft-from-lua-what-the-server-does
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

The full list of recipe keys is in [craftRecipe reference](/pz/build-42/modding/crafting/craftrecipe-reference), and the craftRecipe side of skills, XP and learning is in [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning). This page keeps to the gating keys and shows them on one real recipe.

:::callout[The 1-minute version]{kind=key}
- Build 42 replaced the old `recipe` block with `craftRecipe`. A Build 41 recipe has to be rewritten.
- Four keys gate or reward a recipe: `SkillRequired` (a minimum level for each listed skill), `NeedToBeLearn` (hidden until learned), `AutoLearnAll` or `AutoLearnAny` (learned at a skill level) and `xpAward` (XP when the craft finishes).
- Skill names are the engine's ids and are case sensitive. A name the game does not know is logged and skipped, so a misspelled `SkillRequired` leaves no gate.
- A magazine teaches recipes with `LearnedRecipes`. The key `TeachedRecipes` is not read in 42.22.
- The craft checks the skills and the learned state again before it uses up any input.
:::

:::facts
- **List separators** `;` between skills, `:` between a skill and its level or amount
- **Recipes in the example magazine `ArmorMag4`** 10
- **Level for the example recipe** Blacksmith 4 and Tailoring 3 to craft, Blacksmith 6 to learn by levelling
- **Example XP** 10 Blacksmith and 5 Tailoring per craft, before the multipliers
:::

## 1. One real recipe

**A single vanilla recipe uses every gating key, so it is the best map of them.**

This is `Forge_Codpiece`, copied from the 42.22 scripts. :cite[(`media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_armor.txt:3-32`)]

```
craftRecipe Forge_Codpiece
{
    time = 400,
    SkillRequired = Blacksmith:4;Tailoring:3,
    NeedToBeLearn = true,
    timedAction = HammerMetalStanding,
    xpAward = Blacksmith:10;Tailoring:5,
    Tags = Forge,
    category = Armor,
    AutoLearnAll = Blacksmith:6,
    inputs
    {
        item 3 tags[base:charcoal],
        item 1 [Base.SmallSheetMetal],
        item 1 tags[base:smithinghammer] mode:keep flags[Prop1;MayDegradeLight],
        item 1 tags[base:tongs] mode:keep flags[Prop2;MayDegradeLight],
        item 1 tags[base:metalworkingpunch;base:smallpunch] mode:keep flags[MayDegradeLight],
        item 1 tags[base:headingtool] mode:keep,
        item 1 tags[base:scissors] mode:keep flags[MayDegradeLight],
        item 1 tags[base:sewingneedle] mode:keep flags[MayDegradeLight],
        item 1 tags[base:awl] mode:keep flags[MayDegradeLight],
        item 1 tags[base:leathercrudetannedsmall],
        item 1 tags[base:heavythread],
        item 1 [Base.LeatherStrips] mode:destroy,
    }
    outputs
    {
        item 1 Base.Codpiece_Metal,
    }
}
```

The recipe sits inside `module Base { ... }` in the file, which is how a recipe that makes an item is declared. A building or workstation carries its recipe inside its `entity` block instead, as `component CraftRecipe`, with the same gating keys. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_Drying_Rack.txt:474-491`, `zombie/scripting/entity/components/crafting/CraftRecipeComponentScript.java:62-66`)]

Older versions of this page showed a different `Forge_Codpiece` that did not match the scripts, with the output `Base.Codpiece`, a different animation and tag names without the `base:` namespace. The block above is the one in the 42.22 files. :cite[(`media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_armor.txt:3-32`)]

## 2. The gating keys

**Each key does one job: set a level, hide the recipe, teach it by level, or pay XP.**

The loader reads the keys without regard to case, so `NeedToBeLearn` and `needTobeLearn` are the same key. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:397-399`)] The four jobs are these.

| Key | What it does | Code |
|---|---|---|
| `SkillRequired = Blacksmith:4;Tailoring:3` | The character needs at least that level in every listed skill. A skill the game does not know is logged and skipped, and a level of 0 or less is dropped. The one exception is the one-level-short rule below. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:367-384` |
| `NeedToBeLearn = true` | The recipe stays unknown until its name is in the character's list of known recipes. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:397-398`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:355-361` |
| `AutoLearnAll = Blacksmith:6` | The recipe is learned when every listed skill has reached its level. `AutoLearnAny` needs only one. An Inventive character needs one level less, never below 1. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:416-445`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:897-935`, `zombie/characters/IsoGameCharacter.java:17232-17234` |
| `xpAward = Blacksmith:10;Tailoring:5` | The listed XP goes to each skill when the craft finishes, before the character's multipliers. An unknown skill is logged and skipped. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:468-481`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1464-1488` |

The craft checks the skills first and the learned state second, and a character that does not pass either is refused. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeManager.java:342-362`)] The same check runs at the start of `perform`, before any input is consumed, and the XP is added only after the outputs exist. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeData.java:497-509`)] Which machine calls `perform` for a multiplayer craft is described in [Crafting and timed actions from Lua](/pz/build-42/modding/crafting/handcraft-from-lua-what-the-server-does).

The `xpAward` amounts are whole numbers, and on a dedicated server the XP is added through `GameServer.addXp`, in single player through the character's own `AddXP`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:1464-1488`)] The multipliers that follow are in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

The skill names are the ids of the game's own skills: `Woodwork` for Carpentry, `Doctor` for First Aid and `PlantScavenging` for Foraging. A name from a book or from the screen is not an id. :cite[(`zombie/characters/skills/PerkFactory.java:117`, `zombie/characters/skills/PerkFactory.java:121`, `zombie/characters/skills/PerkFactory.java:132`, `zombie/characters/skills/PerkFactory.java:392-394`)] A skill you add yourself is named by its own id, as [Modding: add a SKILL](/pz/build-42/modding/skills-and-traits/modding-add-a-skill) shows.

## 3. Learning, magazines and the gate

**A magazine teaches a recipe with `LearnedRecipes`, and that is separate from the level the recipe needs.**

`ArmorMag4` is a literature item with `LearnedRecipes`, and `Forge_Codpiece` is one of the ten names in its list. :cite[(`media/scripts/generated/items/literature.txt:5159-5172`)] Reading it to the end adds each listed recipe the character does not know. :cite[(`zombie/scripting/objects/Item.java:2777-2784`, `media/lua/shared/TimedActions/ISReadABook.lua:323-343`, `zombie/characters/IsoGameCharacter.java:4897-4907`)]

The older page said the magazine lets you make the recipe at Blacksmith 4, before the Blacksmith 6 auto-learn, through `TeachedRecipes`. In 42.22 the key is `LearnedRecipes`, and `TeachedRecipes` is read by nothing. :cite[(`zombie/scripting/objects/Item.java:2777`)]

The magazine lifts the skill gate only through one rule: a recipe the character already knows can be crafted while short by exactly one level in every missing skill, when a magazine that teaches it is in a container the craft searches, and with no container list the check fails. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeManager.java:367-384`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1491-1554`)] A reader with Blacksmith 3 and Tailoring 3 who has read the magazine can therefore forge the codpiece while the magazine is in a searched container, and a reader with Blacksmith 2 cannot. The rule is explained in [Learning](/pz/build-42/modding/skills-and-traits/learning-paths).

So the three records are independent. A skill book changes how fast XP arrives, `LearnedRecipes` and `AutoLearn` change which recipes are known, and `SkillRequired` decides whether a known recipe can be crafted. The recipe is also tied to a place by its tags.

The `Tags` key is a list separated by `;`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496`)] A recipe whose tags are not `InHandCraft`, `AnySurfaceCraft`, `EntityRecipe` or `Outdoors` counts as needing a specific workstation, and the tag `Forge` is one of the game's recipe tags, written with that exact capital. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:1042-1044`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1590-1596`, `zombie/scripting/objects/CraftRecipeTag.java:37`)] The workstation and surface rules are in the crafting pages, and this page does not repeat them.

## 4. Inputs, in brief

**In `inputs`, an item is a bracketed type or a tag, and in `outputs` it is a bare type.**

The example shows both forms: `item 1 [Base.SmallSheetMetal]` and `item 1 tags[base:tongs]` in `inputs`, and `item 1 Base.Codpiece_Metal` in `outputs`.

An input line in the wrong form fails to load with "unknown recipe param", and the recipe is removed. In debug mode the game then stops with "Script load errors". :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:767-769`, `zombie/scripting/ScriptManager.java:1710-1712`)] The repo's recipe checker catches the wrong form before the game does, and the grammar is in [craftRecipe inputs in depth](/pz/build-42/modding/crafting/craftrecipe-inputs-in-depth). The mode `keep` keeps the item, as the tools in the example do, and `destroy` destroys it. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:673-681`, `media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_armor.txt:15-26`)]

:::callout[How we know]{kind=proof}
The keys are read from `CraftRecipe.java` and `CraftRecipeManager.java`, and the example is the vanilla block copied from the 42.22 scripts. We ran the repo's recipe checker on a recipe in the same shape and it found no fault. We did not craft anything in a game.

Dropped from the older page: the claim that this was a "real vanilla 42.20 example" (it differed from the 42.22 file in the output, the animation and the tag spelling), the remark that the workstation system is how many recipes are physically gated (the tag rule above is what the code shows), and the magazine key `TeachedRecipes`. Not tested: which machine calls `perform` in each multiplayer case, which the handcraft page covers.
:::
