---
id: build-42-craftrecipe-outputs-and-itemmappers
slug: craftrecipe-outputs-and-itemmappers
title: craftRecipe outputs and itemMappers
game: pz
version: build-42
section: modding
category: crafting
difficulty: intermediate
tags:
  - craftrecipe
  - crafting
  - itemmapper
  - recipe-outputs
excerpt: >-
  How the outputs block and itemMapper blocks of a Build 42.22 craftRecipe work: plain and mapped results, counts, ranges, output flags, the default line, and what a bad line does.
last_updated: '2026-11-16'
related_articles:
  - the-new-craftrecipe-block
  - craftrecipe-inputs-in-depth
  - craftrecipe-vs-legacy-recipe
  - addendum-canonical-craftrecipe-schema
  - craftrecipe-reference
  - new-craftrecipe
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write the `outputs` block of a recipe, or a recipe whose result depends on which item was used. The [inputs page](/pz/build-42/modding/crafting/craftrecipe-inputs-in-depth) covers the `mappers[...]` word on the other side.

:::callout[The 1-minute version]{kind=key}
- An output line is `item <count> Module.Item`. The item name has no square brackets. That is the opposite of an input line.
- For a result that depends on the input, write `item 1 mapper:Name`, give an input `mappers[Name]`, and add an `itemMapper Name` block of `Output = Input,` lines.
- The left side of a mapper line is the item you get, and the right side is the item you used. A `default = Item,` line is the fallback.
- A `mapper:Name` that no earlier line created throws, and an output item that does not exist throws when the world loads.
- An empty `outputs { }` is valid, and vanilla has 27 of them.
:::

:::facts
- **Vanilla output lines** 984 `item` lines: 757 plain and 227 with `mapper:`
- **`itemMapper` blocks** 227, with 1,744 entries, 129 of them blocks with a `default` line
- **Recipes with an empty `outputs { }`** 27, and 11 recipes have no `outputs` block at all
- **Output flag names** 12 (`OutputFlag`); vanilla uses 6
- **Output lines with `chance:`** 0 in vanilla
:::

## 1. Plain outputs

**A plain output names the item by its full type, with no brackets, and says how many to make.**

An output line is cut on whitespace. It holds three parts in order: the word `item`, `fluid` or `energy`, then the count, then the result. :cite[(`zombie/scripting/entity/components/crafting/OutputScript.java:281-318`)] For an item, a result that does not start with `mapper:` becomes a mapper of its own with the item as its only value. :cite[(`zombie/scripting/entity/components/crafting/OutputScript.java:319-331`)]

```
outputs
{
    item 10 Base.Nails,
    item 25 Base.LeatherStrips,
}
```

A recipe may have several output lines, and the loader adds each one to the recipe's list. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:603-607`)] An `outputs { }` block with no lines is valid too. Vanilla's beer bottle opener recipe uses one, because its input only unseals the bottle (the input carries the flags `IsSealed` and `Unseal`) and the recipe makes no new item. :cite[(`media/scripts/generated/recipes/recipes_fluids.txt:3-19`)]

A bracketed name such as `item 1 [Base.Nails]` is the input form. In an output line the whole text `[Base.Nails]` is read as the item's name, no item has that name, and the item check throws when the world loads (section 6). :cite[(`zombie/entity/components/crafting/recipe/OutputMapper.java:83-90`)]

## 2. Counts, ranges and flags

**The count can be a fixed number or a range, and a few options and flags change what is made.**

- **Count.** A number is read as a decimal. `variable[low:high]` makes it a range that follows the same ratio as the variable inputs of the recipe. :cite[(`zombie/scripting/entity/components/crafting/OutputScript.java:305-316`, `zombie/entity/components/crafting/recipe/CraftRecipeData.java:1342-1343`)] Vanilla's corn drying recipe writes both sides as a range: one to 20 ears are turned into the same number of seeds. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_Drying_Rack_craftRecipe.txt:4-17`)]
- **`chance:`.** An option `chance:0.5` is read as a number and clamped between 0 and 1. :cite[(`zombie/scripting/entity/components/crafting/OutputScript.java:341-343`)] No vanilla output line uses it, and what the craft does with the chance is not verified here.
- **`flags[...]`.** Each name is looked up in the `OutputFlag` list of 12 names with `valueOf`, so an unknown name throws. :cite[(`zombie/scripting/entity/components/crafting/OutputScript.java:391-401`, `zombie/entity/components/crafting/OutputFlag.java:13-25`)]

Vanilla uses 6 of the 12 flag names. Four of them are read by the code that creates the result.

| Flag | What it does | Vanilla output lines | Code |
|---|---|---|---|
| `IsBlunt` | The new item starts with no sharpness, if it has any. | 36 | `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:1055-1057` |
| `HasOneUse` | The new item starts with one use. | 3 | `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:1059-1061` |
| `HasNoUses` | The new item starts with no uses. | 3 | `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:1063-1065` |
| `EquipSecondary` | The new item goes into the character's secondary hand. | 2 | `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:1071-1077` |

The other two used flags, `DontInheritCondition` and `SetActivated`, and the six unused ones (`HandcraftOnly`, `AutomationOnly`, `IsEmpty`, `ForceEmpty`, `AlwaysFill`, `RespectCapacity`) are in the same list. This page does not describe what they do.

## 3. The itemMapper: a result that depends on the input

**An `itemMapper` block lists which item to make for each item that was used.**

A recipe that handles several kinds of one thing, such as wet leather of different animals, needs a different result for each. The recipe gives its input a name with `mappers[Name]`, its output asks for `mapper:Name`, and a block named `itemMapper Name` holds the table. Vanilla's recipe that dries large leather is the model. :cite[(`media/scripts/generated/entities/animals/craftRecipes/recipes_leather_prep.txt:54-79`)]

```
craftRecipe DryLargeLeather
{
    time = 604800,
    Tags = DryLeatherLarge,
    category = Farming,
    inputs
    {
        item 1 tags[base:leathercrudewetlarge;base:leatherfurwetlarge] mappers[DryLeatherLarge],
    }
    outputs
    {
        item 1 mapper:DryLeatherLarge,
    }
    itemMapper DryLeatherLarge
    {
        Base.Leather_Crude_Large_Tan = Base.Leather_Crude_Large_Tan_Wet,
        Base.CowLeather_Angus_Fur_Tan = Base.CowLeather_Angus_Fur_Tan_Wet,
        Base.DeerLeather_Fur_Tan = Base.DeerLeather_Fur_Tan_Wet,
    }
}
```

Read each mapper line as `ResultItem = UsedItem,`. When the used item is the wet leather on the right, the item made is the dry leather on the left. The loader stores the key as the result and the value as the pattern of used items. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:614-648`, `zombie/entity/components/crafting/recipe/OutputMapper.java:65-70`)] The block above is shortened from vanilla, which lists five animals and adds an `overlayMapper` word and block (section 4).

### How the engine picks the result

**It tries each mapper line in the order written and takes the first line whose used items were really used, and otherwise the `default` line.**

The engine walks the entries in the order they are written. :cite[(`zombie/entity/components/crafting/recipe/OutputMapper.java:141-166`)] A line matches when every item on its right side is matched by a different input line that carries `mappers[Name]`, and the input matches when the item it took is that item. :cite[(`zombie/entity/components/crafting/recipe/OutputMapper.java:191-205`)] The right side may list several used items separated by `;`, and vanilla has 79 such lines.

When no line matches, the `default = Item,` line gives the result. When there is no default either, the mapper gives no item. :cite[(`zombie/entity/components/crafting/recipe/OutputMapper.java:167-188`)] Vanilla's flax scutching recipe has a default as the last line of its mapper. :cite[(`media/scripts/generated/entities/agricultural/craftRecipes/recipes_fiber.txt:3-26`)] What a craft does when the mapper gives no item is not verified, and 129 of the 227 vanilla mapper blocks carry a `default` line.

### The order matters, and who creates the mapper

**An output can only name a mapper that already exists when its line is read.**

The recipe's blocks are read in the order they are written. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:514-537`)] A `mappers[Name]` on an input line creates the mapper, so an `inputs` block above `outputs` works.

An `itemMapper Name` block above `outputs` creates it too, but one written below `outputs` does not. A `mapper:Name` that nothing created yet throws `Could not find output mapper`. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:758-766`, `zombie/scripting/entity/components/crafting/OutputScript.java:319-325`)] Every vanilla recipe with a `mapper:` output also has an input with `mappers[...]`.


A mapper block with no entries and no default throws `Failed to load contents for output mapper`. A value that holds a `$` is cut after it, except that `fluid$` and `energy$` throw `Not yet implemented`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:620-646`)]

### Adding to a vanilla mapper from a mod

A second recipe body with the same id merges into the earlier body, and an `itemMapper` block in it adds its lines to the mapper of that name. :cite[(`zombie/scripting/ScriptBucket.java:109-125`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:614-624`)] The input that those new lines depend on must be on the recipe already, and the merge rules and the doubling trap are on [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting).

## 4. The overlayMapper

**An `overlayMapper` block picks a picture style for a bench from the item that was used.**

The block reads `default = Style,` for the fallback and `Item;Item = Style,` for the others, and the `overlayStyle` key of the recipe sets the default style too. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:503-504`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:650-668`)]

An input joins it with the word `overlayMapper` on its line. The craft logic asks it for a style when it updates the bench. :cite[(`zombie/entity/components/crafting/CraftLogic.java:596`)] Vanilla has 3 `overlayMapper` blocks and 34 `overlayStyle` lines. What the game draws with the style is not covered here.

## 5. Try it: a mapper in a mod

**A one-recipe mod that turns a seed into flour or cornmeal, depending on the seed.**

1. Make `Zomboid/mods/OutputMapperDemo/` with `42/mod.info` and `42/poster.png`, laid out as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Write `42/mod.info`:

```
name=Output Mapper Demo
id=OutputMapperDemo
description=One recipe whose result depends on the seed used.
poster=poster.png
author=Your Name
```

3. Write `42/media/scripts/OutputMapperDemo_recipes.txt`:

```
module OutputMapperDemo
{
    craftRecipe MillDemoGrain
    {
        time = 100,
        timedAction = Making,
        Tags = InHandCraft,
        category = Cooking,
        inputs
        {
            item 1 [Base.WheatSeed;Base.CornSeed] mappers[DemoGrain] flags[ItemCount],
        }
        outputs
        {
            item 1 mapper:DemoGrain,
        }
        itemMapper DemoGrain
        {
            Base.Flour2 = Base.WheatSeed,
            Base.Cornmeal2 = Base.CornSeed,
            default = Base.Flour2,
        }
    }
}
```

4. Start the game, open **Mods**, check **Output Mapper Demo** and start a game. In debug mode, spawn one `Base.WheatSeed` and one `Base.CornSeed`, open the crafting window and craft `MillDemoGrain` twice.

You should get one `Base.Flour2` from the wheat seed and one `Base.Cornmeal2` from the corn seed. `console.txt` should hold no `Could not find output mapper` line. The recipe is shaped like vanilla's two seed-milling recipes, merged into one with a mapper. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_stone_mill_craftRecipe.txt:35-49`)]

## 6. What a bad output line does

**Output mistakes throw at read time, or when the world dictionary is built, and the second kind ends that pass for the remaining craft recipes.**

| Mistake | What happens | Code |
|---|---|---|
| `item 1 [Base.Nails]` or any item name that does not exist | Throws `item not found` when the world dictionary is built. The stack trace is logged, and the pass ends for the craft recipes after it. | `zombie/entity/components/crafting/recipe/OutputMapper.java:83-90`, `zombie/scripting/ScriptBucketCollection.java:189-195`, `zombie/scripting/ScriptManager.java:1823-1832` |
| `mapper:Name` with no mapper of that name read yet | Throws `Could not find output mapper`, and the loader removes the recipe. | `zombie/scripting/entity/components/crafting/OutputScript.java:319-325`, `zombie/scripting/ScriptBucket.java:198-205` |
| A word after the result that is not `chance:`, `mode:`, `apply:`, `shapedIndex:` or `flags[...]` | Throws `unknown recipe param`. | `zombie/scripting/entity/components/crafting/OutputScript.java:341-393` |
| An output flag name outside the 12, or in the wrong case | Throws from `valueOf`. | `zombie/scripting/entity/components/crafting/OutputScript.java:391-401` |
| A line that starts with `-` | Throws `Cannot add '-' line to output`. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:600-602` |
| A mapper entry that names a missing item, on either side | Throws `item not found` when the world dictionary is built. | `zombie/entity/components/crafting/recipe/OutputMapper.java:115-135` |

:::callout[How we know]{kind=proof}
Every code line above was opened in the 42.22 capture.

The vanilla counts (984 output lines, 757 plain and 227 mapped, 227 `itemMapper` blocks with 1,744 entries, 129 blocks with a `default`, 79 entries with more than one used item, 27 empty `outputs`, 11 recipes with no `outputs` block, the flag counts) were taken over every `craftRecipe` block in `media/scripts`. The example mod passed the repo's recipe checker and was not run in a game.

Not verified: what a craft does when a mapper gives no item, what `chance:` does at craft time, what the `overlayMapper` style draws, and what the unused output flags do. Corrected from the old page: a `default` line is common but not shown only in the fiber recipe, the count range is `variable[low:high]` and not `3-5`, and an `outputs { }` block is valid because 27 vanilla recipes have one. The old page's mapper example was read in the right direction and has been kept, with the real vanilla lines.
:::
