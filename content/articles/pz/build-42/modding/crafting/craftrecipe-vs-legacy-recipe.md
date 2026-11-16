---
id: build-42-craftrecipe-vs-legacy-recipe
slug: craftrecipe-vs-legacy-recipe
title: craftRecipe vs legacy recipe
game: pz
version: build-42
section: modding
category: crafting
difficulty: intermediate
tags:
  - craftrecipe
  - crafting
  - legacy-recipe
  - porting
excerpt: >-
  In 42.22 vanilla has 965 craftRecipe blocks and no recipe blocks, and the old recipe parser reads only ingredient lines. What changed from Build 41, and how to move a recipe.
last_updated: '2026-11-16'
related_articles:
  - the-new-craftrecipe-block
  - craftrecipe-inputs-in-depth
  - craftrecipe-outputs-and-itemmappers
  - addendum-canonical-craftrecipe-schema
  - craftrecipe-reference
  - new-craftrecipe
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who have a Build 41 `recipe` block, or an old tutorial that shows one, and want it to work in Build 42.

:::callout[The 1-minute version]{kind=key}
- Write every recipe as a `craftRecipe` block. Vanilla 42.22 has 965 of them and no `recipe` block.
- The word `recipe` is still a script type, but its parser reads only bare ingredient lines and an `Override:` line. A `Result:`, `Time:` or `Sound:` line is logged as an error and ignored.
- Nothing in the engine source sets a legacy recipe's result, and the check that decides whether a legacy recipe can be made fails when there is no result. So a Build 41 block does not work as a recipe. Rewrite it.
- In a `craftRecipe` the result goes in `outputs`, the ingredients in `inputs`, and the length in `time`, which is not seconds. See [The new craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block).
- Look a craftRecipe up with `getCraftRecipe`. The older `getRecipe` call reads the legacy list.
:::

:::facts
- **Vanilla `craftRecipe` blocks** 965
- **Vanilla `recipe` blocks** 0
- **`Key:Value` lines the legacy parser keeps** 1, the word `Override`
- **Engine callers of the legacy result reader** 0
:::

## 1. What changed

**Build 42 crafting is a different system: a `craftRecipe` block with an `inputs` block and an `outputs` block, not a list of bare lines and `Key:Value` lines.**

Counting the blocks in `media/scripts` gives 965 `craftRecipe` blocks and no `recipe` block. The engine still lists `recipe` as one of its script words, next to `craftRecipe`, `evolvedrecipe` and `uniquerecipe`. :cite[(`zombie/scripting/ScriptType.java:23-25`, `zombie/scripting/ScriptType.java:45`)]

A Build 41 recipe looked like this. It is shown for comparison only, and you should not write it in a Build 42 mod.

```
recipe Open Box of Nails
{
    NailsBox,
    Result:Nails=20,
    Sound:PutItemInBag,
    Time:5.0,
}
```

The Build 42 recipe that does the same job is a `craftRecipe`. This one is in a mod you can try in section 4.

```
craftRecipe OpenDemoNailsBox
{
    time = 50,
    timedAction = UnPackBox_Small,
    Tags = InHandCraft,
    category = Packing,
    inputs
    {
        item 1 [Base.NailsBox],
    }
    outputs
    {
        item 20 Base.Nails,
    }
}
```

## 2. What the old parser still reads

**The legacy parser turns bare lines into ingredients and keeps only one `Key:Value` line, `Override`.**

A line that contains a colon is split into a key and a value, and any key but `Override` is logged as `Could not assign [key]`. :cite[(`zombie/scripting/objects/Recipe.java:84-96`)] Every other line is read as an ingredient. A `Name=count` suffix sets how many, a `keep` prefix keeps the item, a `;` suffix sets a `use` amount, a `destroy` prefix destroys it, and `/` separates alternatives. :cite[(`zombie/scripting/objects/Recipe.java:103-139`)]

The method that would read a result, `DoResult`, is only declared. No class in the engine source calls it, and a `Result:` line goes to the colon branch and is not read. :cite[(`zombie/scripting/objects/Recipe.java:143-167`)] The check that decides whether a legacy recipe can be made returns false when the recipe has no result. :cite[(`zombie/inventory/RecipeManager.java:166-171`)] A Build 41 block therefore loads with its ingredients and without a result, a time or a sound, and it is not valid for crafting.

The `Recipe` class is exposed to Lua, so a mod's Lua could in principle call `DoResult` itself. That is not tested here. :cite[(`zombie/Lua/LuaManager.java:2341`)] The error lines are written on the General channel, which is on in a normal game. :cite[(`zombie/debug/DebugLog.java:478-483`)]

## 3. The two systems side by side

**Each Build 41 idea has a Build 42 line, and the table shows which line to write.**

| Aspect | Legacy `recipe` block (what 42.22 reads) | `craftRecipe` block (42.22) | Code |
|---|---|---|---|
| Separator | `Key:Value` lines; only `Override` is read | `key = value,` lines | `zombie/scripting/objects/Recipe.java:84-96`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:376-503` |
| Ingredients | Bare lines with `keep`, `destroy`, `Name=count` | `item <count> [..]` or `tags[..]` with `mode:` and `flags[..]` | `zombie/scripting/objects/Recipe.java:103-139`, `zombie/scripting/entity/components/crafting/InputScript.java:626-634` |
| Alternatives | `A/B` | `[A;B]` and `tags[A;B]` | `zombie/scripting/objects/Recipe.java:128-132`, `zombie/scripting/entity/components/crafting/InputScript.java:626-634`, `zombie/scripting/entity/components/crafting/InputScript.java:729-739` |
| Result | `Result:` line, not read | `outputs { item N Module.Item }`, or `mapper:Name` | `zombie/scripting/objects/Recipe.java:143-167`, `zombie/scripting/entity/components/crafting/OutputScript.java:317-327` |
| Length | `Time:` line, not read | `time`, a whole number that is not seconds | `zombie/scripting/entity/components/crafting/CraftRecipe.java:380-381` |
| Sound | `Sound:` line, not read | the `sound =` line of the recipe's `timedAction` block | `media/scripts/generated/timedactions.txt:3-10`, `media/lua/shared/Entity/TimedActions/ISHandcraftAction.lua:146-148` |
| Where it is offered | no line is read for it | `Tags` matched to a bench's `Recipes` list, or `InHandCraft` and `AnySurfaceCraft` | `zombie/scripting/entity/components/crafting/CraftRecipe.java:491-496`, `zombie/scripting/entity/components/crafting/CraftBenchScript.java:68-69` |
| Fluids | no line is read for it | a `-fluid` line after an item line | `zombie/scripting/entity/components/crafting/CraftRecipe.java:569-582`, `zombie/scripting/entity/components/crafting/InputScript.java:583` |
| Learning | no line is read for it | `NeedToBeLearn`, `AutoLearnAll`, `AutoLearnAny`, and an item's `LearnedRecipes` | `zombie/scripting/entity/components/crafting/CraftRecipe.java:397-445`, `zombie/scripting/objects/Item.java:2777-2784` |
| Dynamic result | none | an `itemMapper` block | `zombie/scripting/entity/components/crafting/CraftRecipe.java:518-519` |
| Lua lookup | `getScriptManager():getRecipe(name)` | `getScriptManager():getCraftRecipe("Module.Name")` | `zombie/scripting/ScriptManager.java:775-777`, `zombie/scripting/ScriptManager.java:1059-1072` |

The learning key an old note calls `TeachedRecipes` is not read by the item loader. The item key is `LearnedRecipes`, and the other recipe keys are explained on [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning).

## 4. Moving one recipe: try it

**A one-recipe mod that moves the nails-box recipe above into Build 42 form.**

1. Make `Zomboid/mods/LegacyMoveDemo/` with `42/mod.info` and `42/poster.png`, laid out as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Write `42/mod.info`:

```
name=Legacy Move Demo
id=LegacyMoveDemo
description=One craftRecipe that opens a box of nails.
poster=poster.png
author=Your Name
```

3. Write `42/media/scripts/LegacyMoveDemo_recipes.txt`:

```
module LegacyMoveDemo
{
    craftRecipe OpenDemoNailsBox
    {
        time = 50,
        timedAction = UnPackBox_Small,
        Tags = InHandCraft,
        category = Packing,
        inputs
        {
            item 1 [Base.NailsBox],
        }
        outputs
        {
            item 20 Base.Nails,
        }
    }
}
```

4. Start the game, open **Mods**, check **Legacy Move Demo** and start a game. In debug mode, spawn one `Base.NailsBox`, open the crafting window and craft `OpenDemoNailsBox`.

You should get 20 `Base.Nails`, and `console.txt` should hold no `Unknown key` line. The vanilla box recipe is the model, and it hands out 100 nails through an item mapper. :cite[(`media/scripts/generated/recipes/recipes_packing.txt:221-242`)] For a recipe that opens several kinds of box, read [craftRecipe outputs and itemMappers](/pz/build-42/modding/crafting/craftrecipe-outputs-and-itemmappers).

:::callout[How we know]{kind=proof}
The legacy parser, the `craftRecipe` loader and the vanilla recipe counts were read in the 42.22 capture, and the vanilla blocks were counted over `media/scripts`. The example mod passed the repo's recipe checker and was not run in a game. Not verified: whether any screen offers a legacy `recipe` to the player, what a mod's Lua `DoResult` call would do, and what the game shows for a recipe with no translation beyond the id. Dropped from the old page: the claim that a legacy block is "still parseable, but not the modern menu" (its `Result:` and `Time:` lines are not read), the `Time unit: abstract` and `Workstation binding: hard-coded` cells (no line proves them), and `TeachedRecipes` as a learning key (no loader reads it).
:::
