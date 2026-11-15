---
id: build-42-changing-recipes-and-crafting
slug: changing-recipes-and-crafting
title: 'Changing recipes and crafting: time, inputs, outputs, and the traps'
game: pz
version: build-42
section: modding
category: changing-vanilla
difficulty: intermediate
tags:
  - crafting
  - craftrecipe
  - scripts
  - overriding
  - merge
excerpt: >-
  How to change a vanilla craftRecipe in 42.22: edit its time, add outputs or inputs, why repeating a whole recipe doubles its ingredients, and why enabled = false logs an error.
last_updated: '2026-11-14'
related_articles:
  - changing-vanilla-start-here
  - patching-vanilla-lua
  - overriding-scripts
  - editing-items-at-load
  - changing-loot
  - what-needs-java-and-what-is-impossible
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders tweaking a number](#change-a-number-a-short-block) | [modders adding an output](#add-an-output-or-an-input) | [modders who must remove an input](#removing-or-changing-an-existing-input-or-output)

When you open the crafting window and click "Craft Rope", the game uses a `craftRecipe` block: how long it takes, what it eats, what it gives. Changing a recipe looks like changing an item, and mostly it is, because both are merged script blocks. There are three differences that catch everyone, so read the table first.

| You want to | Easy? | How |
|---|---|---|
| Change the time, the skill needed, the category | Yes | A short block with only that line |
| Add an output, or add an input | Yes | A short block with only the extra lines |
| Remove or change an existing input or output | No | Write a new recipe, and decide what to do about the old one |
| Switch a recipe off | Awkward | See "Turning a recipe off" |

If you have not read [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts), skim it first. Recipes use the same merge.

:::callout[The 1-minute version]{kind=key}
- A short `craftRecipe` block with only the lines you change is a second body that merges onto vanilla's. `time = 70,` alone halves the rope time.
- Single values (`time`, `SkillRequired`, callbacks) replace. `Tags` and every line in `inputs` and `outputs` add.
- Never copy the whole recipe. Every `inputs` and `outputs` line is appended, so the recipe asks for and gives double.
- A merge cannot remove a line. Write a new recipe under a new name, or mark the old one `needToBeLearn = true`.
- `enabled = false` switches a recipe off but logs an "Unknown key" error on every start, and stops a `-debug` start.
:::

:::facts
- **Example recipe time** `time = 140` in vanilla, 70 in the short block
- **Doubled by a full copy** inputs: 4 dogbane or hemp, 2 sticks, 2 knives; outputs: 2 ropes
- **Debug start** a script load error stops it with "Script load errors"
:::

## The recipe we will change

`CraftRope` is a plain hand-crafting recipe, and its vanilla block shows time, tags, inputs and outputs.

This is vanilla's block:

```
module Base
{
    craftRecipe CraftRope
    {
        timedAction = Making,
        time = 140,
        Tags = AnySurfaceCraft,
        inputs
        {
            item 2 [Base.Dogbane;Base.HempScutched] flags[Prop2],
            item 1 [Base.WoodenStick2;Base.TreeBranch2;Base.Handle] mode:keep flags[Prop1],
            item 1 tags[base:sharpknife;base:scissors] mode:keep flags[IsNotDull;MayDegradeLight],
        }
        outputs
        {
            item 1 Base.Rope,
        }
    }
}
```

That is vanilla's recipe as written. :cite[(`media/scripts/generated/recipes/recipes.txt:3-18`)]

Reading it: `time = 140` is how long the action takes. `Tags = AnySurfaceCraft` says where it can be crafted. Each `item` line in `inputs` is something the recipe uses; `mode:keep` means the item is not used up (the stick and the knife are tools). The `outputs` block lists what you get.

## Change a number: a short block

A block with only `time` is loaded as a second body, sets the time, and leaves everything else as it was.

```
module Base
{
    craftRecipe CraftRope
    {
        time = 70,
    }
}
```

What happens: your block is a second body for `Base.CraftRope`. The engine loads vanilla's body first, then yours. In yours it finds only `time`, sets it to 70, and leaves everything else as it was.

A second body is added to the existing entry :cite[(`zombie/scripting/ScriptBucket.java:109-116`)], and `time` is set from the value. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:380-381`)] A craft recipe type has no `reset()`, so nothing is cleared between bodies :cite[(`zombie/scripting/objects/BaseScriptObject.java:197`)] (the same reasoning as in [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts)).

::::cards
:::card[Keys that replace when written]{accent=orange}
- `time`, `timedAction`, `category`, `icon`, `Tooltip`, `needToBeLearn`.
- `SkillRequired`: starts a brand-new list every time. If you write `SkillRequired = Woodwork:3`, vanilla's skills are gone, not added to.
- The Lua callbacks `OnTest`, `OnCreate`, `OnStart`, `OnUpdate`, `OnFailed`: each name replaces the one before it.
:::
:::card[Keys that add]{accent=blue}
- `Tags` (the stations and categories the recipe is offered at). It never removes one.
- Every line in `inputs` and `outputs`.
:::
::::

The replacing keys are read at :cite[(`CraftRecipe.java:380`)] (`time`), :cite[(`:397-398`)] (`needToBeLearn`), :cite[(`:399-400`)] (`SkillRequired` makes a new list), :cite[(`:333-335`, `:392-393`)] (a callback is stored in a map, so the new name replaces the old) and :cite[(`:487-490`)] (`timedAction`, `category`). The adding keys are at :cite[(`CraftRecipe.java:491-495`)] (`categoryTags.add`), :cite[(`:585`)] (`inputs.add`) and :cite[(`:605`)] (`outputs.add`).

## Add an output (or an input)

An `outputs` block in your short block adds each of its lines to the recipe's output list.

To make the recipe also give a piece of twine:

```
module Base
{
    craftRecipe CraftRope
    {
        outputs
        {
            item 1 Base.Twine,
        }
    }
}
```

Your block has an `outputs` block, and the engine adds each line in it to the recipe's output list. The recipe now gives a rope and a twine.

Put both pieces in one file, `42\media\scripts\RopeTweaks_recipes.txt`:

```
module Base
{
    craftRecipe CraftRope
    {
        time = 70,
        outputs
        {
            item 1 Base.Twine,
        }
    }
}
```

**See the result:** start a game, give yourself two `Dogbane`, a `WoodenStick2` and a knife (debug mode's item list is the quickest way), open the crafting window and look at Craft Rope. The time should be about half. After you craft it the inventory should hold a rope and a twine. If the recipe does not appear at all, search `console.txt` for `removing script due to load error` and `Unknown key`; the reasons are below. The vanilla recipe is the block shown earlier. :cite[(`media/scripts/generated/recipes/recipes.txt:3-18`)]

## The trap: do not repeat the whole recipe

If you copy the whole vanilla block, every `inputs` and `outputs` line is added a second time, so the recipe asks for and gives double.

A natural thing to do is copy the entire vanilla block into your mod and edit the numbers. Do not. The recipe does not reset between bodies, and each `inputs` and `outputs` line is added to a list:

```
-- WRONG: a full copy, with time changed
craftRecipe CraftRope
{
    timedAction = Making,
    time = 70,
    Tags = AnySurfaceCraft,
    inputs { item 2 [Base.Dogbane;Base.HempScutched] flags[Prop2], ... }
    outputs { item 1 Base.Rope, }
}
```

The recipe now has the vanilla `inputs` **and** your copy of them: two of every input, so it asks for four dogbane or hemp, two sticks, two knives. It also gives two ropes. `time` is correct, because it is a single value, so the mistake is easy to miss.

Every `inputs` or `outputs` block goes to `LoadIO` :cite[(`CraftRecipe.java:516-517`)], and each line is appended with nothing checking for duplicates. :cite[(`:585`, `:605`)] The one place a recipe's lists are emptied is `PreReload`, which runs on a script reload, not between bodies at start-up. :cite[(`:670-690`)]

## Removing or changing an existing input or output

A merge cannot remove a line, so there are three ways around that.

**1. Write a new recipe with a new name.** Copy the vanilla block, change its name and its lines, and ship it as an additional recipe:

```
module Base
{
    craftRecipe CraftRopeFromTwine
    {
        timedAction = Making,
        time = 140,
        Tags = AnySurfaceCraft,
        inputs
        {
            item 4 [Base.Twine],
            item 1 tags[base:sharpknife;base:scissors] mode:keep flags[IsNotDull;MayDegradeLight],
        }
        outputs
        {
            item 1 Base.Rope,
        }
    }
}
```

The old recipe still exists, so the crafting window should list both (not verified in a running game). The recipe's display name comes from a translation lookup by the recipe's name :cite[(`CraftRecipe.java:369`)], so a new recipe needs its own translation entry. What the game shows when none exists: not verified. Use a module of your own for new recipes (`module MyMod` with `imports { Base }`) so the name cannot collide with a future vanilla one.

**2. Make the old recipe hard to get.** `needToBeLearn = true` marks a recipe as one a character must have learned. The game then offers it only to a character who knows it.

```
craftRecipe CraftRope
{
    needToBeLearn = true,
}
```

The recipe loader reads the key :cite[(`CraftRecipe.java:397-398`)], and `hasPlayerLearned` is true when no learning is needed, otherwise only when the character knows the recipe. :cite[(`:1571`)] Whether a vanilla magazine or auto-learn rule would still teach it: not verified.

**3. Reach into the live recipe from Lua.** The recipe object is exposed to Lua and `getInputs()` returns its live input list, so in principle a Lua edit at start-up can clear or change it. I have not run this, and the game builds extra data from the lists (`CraftRecipeData`), so a late edit may not take. Treat it as not verified. `CraftRecipe` is exposed to Lua :cite[(`zombie/Lua/LuaManager.java:2302`)], `getInputs` and `getOutputs` return the lists themselves :cite[(`CraftRecipe.java:253-259`)], and `getCraftRecipe(name)` finds a recipe by name. :cite[(`zombie/scripting/ScriptManager.java:1059-1072`)]

## Turning a recipe off

`enabled = false` does switch a recipe off, but it logs an "Unknown key" error on every start.

Every script object has an `enabled` flag. When it is false after loading, the engine skips the object: it is never added to the recipe lookup, so nothing can offer or craft it.

```
craftRecipe CraftRope
{
    enabled = false,
}
```

This does switch the recipe off, but with a catch. `BaseScriptObject` reads `enabled`, while `CraftRecipe.Load` does not list it among its own keys. So each time the game starts, it logs `Unknown key 'enabled' ... in craft recipe`. Worse, in debug mode (launching with `-debug`) that case throws an exception, and a debug launch stops start-up with "Script load errors". I have read this in the code and not run it.

`BaseScriptObject` reads `enabled` :cite[(`zombie/scripting/objects/BaseScriptObject.java:177-178`)], a disabled script is skipped :cite[(`zombie/scripting/ScriptBucket.java:218-221`)], the recipe loader raises the unknown-key error (and throws when `Core.debug`) :cite[(`CraftRecipe.java:505-509`)], and a load error aborts a debug start. :cite[(`zombie/scripting/ScriptManager.java:1711-1712`)] Vanilla uses `enabled = false` only in ragdoll scripts, not in recipes. :cite[(`media/scripts/ragdolls/ragdoll_anchors.txt:9`)]

So prefer `needToBeLearn = true` if "hard to get" is enough. If you must switch a recipe off, accept the log line and do not test with `-debug` while it is in. Do not depend on this staying quiet in a later build.

## Run your own code when a recipe completes

`OnCreate` names a Lua function the game calls after a recipe makes its outputs, and it replaces any vanilla callback on that recipe.

The engine passes it the recipe data and the character who crafted:

```
craftRecipe CraftRope
{
    OnCreate = MyRopeMod.onRopeCrafted,
}
```

Because a callback is replaced when a name is written, this replaces any vanilla callback on that recipe. Several vanilla recipes use one (for example `OnCreate = RecipeCodeOnCreate.refillLighter`). Check that the recipe you change does not, or your block turns that behavior off. In 42.22 `RecipeCodeOnCreate` is a Java class :cite[(`zombie/scripting/logic/RecipeCodeOnCreate.java`)], not a Lua file, The class is exposed to Lua :cite[(`zombie/Lua/LuaManager.java:1972`)]; whether Lua can replace its functions: not verified.

`luaCallOnCreate` calls the function with `this` and the character. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeData.java:463-470`)] The `RefillLighter` block in `media/scripts/generated/recipes/recipes.txt` has `OnCreate = RecipeCodeOnCreate.refillLighter`. That a Lua function written in a mod's `OnCreate` line is found and called: not verified in a running game.

## Checklist before you ship

Tick these five before you publish.

- [ ] My block has only the lines I want to change. I did not copy the whole recipe.
- [ ] If I added an input or output, I know it is added to the list, not swapped in.
- [ ] I searched `console.txt` for `removing script due to load error` and `Unknown key`.
- [ ] If the recipe had an `OnCreate`, I did not accidentally replace it.
- [ ] My file name has my mod's name in it.

## Where to go next

- [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts): the merge rules in full.
- [Changing vanilla: start here](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here).
- [What needs Java, and what is impossible](/pz/build-42/modding/changing-vanilla/what-needs-java-and-what-is-impossible): for behavior a recipe cannot express.

:::callout[How we know]{kind=proof}
Read from the 42.22 engine source and vanilla scripts; nothing here was run in a game. Not verified: that the crafting window lists both an old and a new recipe, what the game shows for a recipe with no translation, whether a vanilla magazine or auto-learn rule would still teach a `needToBeLearn` recipe, whether a late Lua edit of the live input list takes, the `enabled = false` error and debug throw (read, not run), and whether a mod's Lua `OnCreate` function is found and called.
:::
