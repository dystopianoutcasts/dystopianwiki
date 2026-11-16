---
id: build-42-craftrecipe-inputs-in-depth
slug: craftrecipe-inputs-in-depth
title: craftRecipe inputs in depth
game: pz
version: build-42
section: modding
category: crafting
difficulty: intermediate
tags:
  - craftrecipe
  - crafting
  - recipe-inputs
  - input-flags
excerpt: >-
  How one inputs line of a Build 42.22 craftRecipe is read: item lists, tags, any-item, amounts, the use, keep and destroy modes, the 69 flags, and fluid lines.
last_updated: '2026-11-16'
related_articles:
  - the-new-craftrecipe-block
  - craftrecipe-outputs-and-itemmappers
  - craftrecipe-vs-legacy-recipe
  - addendum-canonical-craftrecipe-schema
  - craftrecipe-reference
  - tags
  - new-craftrecipe
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who write the `inputs` block of a recipe and want to know which words the loader accepts and what each does. The [craftRecipe block](/pz/build-42/modding/crafting/the-new-craftrecipe-block) page covers the lines above `inputs`.

:::callout[The 1-minute version]{kind=key}
- An input line is `item <count> <what> <options>`. `<what>` is an exact list in square brackets, `[Base.A;Base.B]`, or `tags[base:name]`, or `[*]` for any item.
- With no `mode:`, the item is used up. `mode:keep` makes it a tool that stays, and `mode:destroy` removes the whole item.
- `flags[...]` takes names from a list of 69. A name outside the list throws, and the match is case-sensitive.
- A bare item name such as `item 1 Base.Plank` is not an input form. It throws `unknown recipe param` and the recipe is removed.
- A name inside `[..]` that no item has is skipped without a message outside debug mode, but a tag that no item carries throws.
:::

:::facts
- **Input line words** `item`, `fluid`, `energy`, and a `-fluid` line after an item line
- **Item modes** `use` (the default), `keep`, `destroy`
- **Flag names** 69 (`InputFlag`); vanilla recipes use 50 of them
- **Vanilla input lines** 3,348 `item` lines and 56 `-fluid` lines, in 965 recipes
- **`item` lines by form** 1,928 with `tags[...]` and 1,420 with a `[...]` list
:::

## 1. The shape of an input line

**An input line has a word, an amount, and then what to accept and how, in that order.**

The line is cut on whitespace. The first word is `item`, `fluid` or `energy`, and any other word throws `unknown type in craftrecipe`. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:579-590`)] The second word is the amount, read as a decimal number, or `variable[low:high]` for a range. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:598-605`)]

Every word after the amount is one option: a bracketed list, `tags[..]`, `mode:`, `flags[..]`, `mappers[..]` or `overlayMapper`. Any other word throws `unknown recipe param`. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:764-770`)]

Vanilla's blacksmith nail recipe uses most of the parts. :cite[(`media/scripts/generated/entities/blacksmith/craftRecipes/recipes_blacksmith_tools.txt:75-97`)]

```
craftRecipe Forge_Nails
{
    time = 300,
    SkillRequired = Blacksmith:1,
    NeedToBeLearn = true,
    timedAction = HammerMetalStanding,
    xpAward = Blacksmith:20,
    AutoLearnAll = Blacksmith:3,
    Tags = PrimitiveForge,
    category = Tools,
    inputs
    {
        item 2 tags[base:charcoal],
        item 1 [Base.IronChunk;Base.IronScrap;Base.SteelChunk;Base.SteelScrap],
        item 1 tags[base:smithinghammer] mode:keep flags[MayDegradeLight],
        item 1 tags[base:metalworkingpliers;base:tongs] mode:keep flags[MayDegradeLight],
        item 1 tags[base:headingtool] mode:keep,
    }
    outputs
    {
        item 10 Base.Nails,
    }
}
```

The charcoal and the metal are used up, and the hammer, the pliers and the heading tool stay. The hammer and the pliers may lose condition each craft.

## 2. What an input accepts

**An input names its items in a bracketed list, by tag, or as any item, and the amount can be a range.**

- **A list, `[Base.A;Base.B]`.** The text in the brackets is split on `;`, and any one of the items fills the input. A `*` entry means any item. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:626-634`)] An item the game has never heard of is skipped without a message, and it is logged only in debug mode. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:874-889`)]
- **A tag, `tags[base:name]`.** The text is split on `;`, and each entry is read as an item tag id, so an id with no colon is read in the `base` namespace and lower-cased. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:729-739`, `zombie/scripting/objects/ResourceLocation.java:25-36`)] An input then accepts every item that carries any listed tag, and a tag that no item carries throws `Tag has no items`. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:891-896`)] The [Tags](/pz/build-42/modding/items-and-scripting/tags) page explains item tags, and tags are the better form for tools so that other mods' items work.
- **Any item, `[*]`.** The input accepts any item, and any list or tags on the same line are discarded. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:633-634`, `zombie/scripting/entity/components/crafting/InputScript.java:783-786`)] Vanilla uses it on 36 lines, and 35 of them sit directly before a `-fluid` line as the container.
- **A different amount per item, `[Base.A;2:Base.B]`.** An entry written `2:Base.B` is two of that item where the line's amount is one of the others. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:635-640`)] Vanilla's double holster recipe takes either one medium tan leather or two small tan pieces on one line. :cite[(`media/scripts/generated/recipes/recipes_tailoring_leatherAndHide.txt:1321`)]
- **A range, `variable[1:20]`.** The amount becomes a lower and an upper value, and the craft carries one ratio that scales the inputs and the outputs that are also written as a range. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:598-603`, `zombie/entity/components/crafting/recipe/CraftRecipeData.java:529-531`, `zombie/entity/components/crafting/recipe/CraftRecipeData.java:1342-1343`)] Vanilla's corn drying recipe turns one to 20 ears into the same number of seeds. :cite[(`media/scripts/generated/entities/agricultural/workstations/entity_Drying_Rack_craftRecipe.txt:4-17`)]

A range written `item 3-5` is not a form the loader reads. The range word is `variable[low:high]`.

## 3. Modes: use, keep, destroy

**The mode says what happens to the item after the craft: it is used, it stays, or it is destroyed.**

| Mode | What happens | Vanilla input lines | Code |
|---|---|---|---|
| none, or `mode:use` | The item loses the uses the line asks for, and it is removed when its uses run out. | most lines | `zombie/scripting/entity/components/crafting/InputScript.java:677`, `zombie/inventory/ItemUser.java:33-40` |
| `mode:keep` | The item stays, and its uses are not reduced. The line can also damage it through a `MayDegrade` flag. | 1,363 | `zombie/scripting/entity/components/crafting/InputScript.java:678-679`, `zombie/inventory/ItemUser.java:38-40` |
| `mode:destroy` | The whole item is removed, even if it would normally be replaced when used. | 242 | `zombie/scripting/entity/components/crafting/InputScript.java:680-681`, `zombie/inventory/ItemUser.java:74-76` |

The words `useprop1`, `useprop2`, `keepprop1`, `keepprop2`, `prop1` and `prop2` are logged as `Deprecated parameter in inputscript!` and the line still loads. Any other word throws `Invalid item mode Error`. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:682-697`)] The word `use` is accepted and means the default. Vanilla writes it on no line, so a line with `mode:use` is the same as a line with no mode.

## 4. Flags

**A flag is a name from a fixed list of 69, and a name outside the list throws.**

The loader looks each name up in the `InputFlag` list with `valueOf`, which is case-sensitive and throws for an unknown name. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:749-757`)] The names `IsFireFuel` and `IsFireTinder` are not in the list, so a line that uses them throws. :cite[(`zombie/entity/components/crafting/InputFlag.java:13-82`)]

The flags below are the ones this page opened in code. The other flags are in the same list, and a flag whose effect is not opened here is not described.

| Flag | What it does | Vanilla input lines | Code |
|---|---|---|---|
| `MayDegradeLight` | A kept item gets a condition-damage check each craft. The four degrade flags pass the numbers 1 (`MayDegradeHeavy`), 2 (`MayDegrade`), 3 (`MayDegradeLight`) and 6 (`MayDegradeVeryLight`) to the check. | 973 (Light), 73 (VeryLight), 37 (plain), 4 (Heavy) | `zombie/entity/components/crafting/recipe/CraftRecipeData.java:1268-1301` |
| `IsNotDull` | A blade that is dull is refused. | 214 | `zombie/scripting/entity/components/crafting/InputScript.java:1032` |
| `Prop1`, `Prop2` | The item's model is shown in the primary or secondary hand while the action runs. Two inputs may not claim the same one. | 315 and 380 | `zombie/entity/components/crafting/recipe/CraftRecipeData.java:1761-1778`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:749-757` |
| `ItemCount` | The input counts items, so a stack of ten seeds is ten items and not the uses left in them. | 183 | `zombie/entity/components/crafting/recipe/CraftRecipeData.java:622` |
| `DontPutBack` | The crafting window does not return this item to the container it came from after the craft. | 12 | `zombie/entity/components/crafting/recipe/CraftRecipeData.java:1932-1940`, `media/lua/client/Entity/ISUI/CraftRecipe/ISWidgetHandCraftControl.lua:330-348` |
| `AllowDestroyedItem` | A broken item is accepted. | 86 | `zombie/scripting/entity/components/crafting/InputScript.java:1001-1003` |
| `IsCookedFoodItem`, `IsUncookedFoodItem` | A cookable food that is still uncooked is refused, or one that is not uncooked is refused. | 11 and 12 | `zombie/scripting/entity/components/crafting/InputScript.java:1144-1146` |
| `NotFull` | A drainable, radio or weapon part that is already full is refused. | 16 | `zombie/scripting/entity/components/crafting/InputScript.java:1060` |

## 5. Fluids on an input

**A `-fluid` line takes fluid from the item on the line before it, and that line must be a single item.**

A line that starts with `-` is read as a fluid input that belongs to the previous item line. It throws if there is no previous input, and if that input already has one. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:569-582`)] The previous line must have an amount of exactly 1. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:828-831`)]

The fluid list is `[Water;Petrol]` with the fluid ids, or `categories[Water]` for a fluid category, and `[*]` accepts any fluid.

The word after `mode:` on a fluid line is `exact`, `primary`, `mixture` or `anything`. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:701-715`, `zombie/scripting/entity/components/crafting/InputScript.java:741-748`)] Vanilla has 56 `-fluid` lines in 54 recipes, 26 of them with `mode:mixture` and 25 with `categories[...]`. An unknown fluid name throws `Fluid not found` when the world dictionary is built. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:914-917`)] The butter churn recipe is the plain case: it takes any container and five units of milk from it. :cite[(`media/scripts/generated/entities/animals/craftRecipes/recipes_butter_churn.txt:4-18`)]

```
inputs
{
    item 1 [*],
    -fluid 5.0 [CowMilk;SheepMilk] mode:mixture,
}
```

A `+` line is read after an input or an output line, and vanilla recipes use no `+` line. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:553-568`)] This page does not cover `+` lines further, and `energy` lines are not used by any vanilla recipe.

## 6. Mappers on an input

**`mappers[Name]` ties the input to an `itemMapper` block, so that the output can depend on which item filled the input.**

The loader registers the input with the named mapper, creating the mapper when it does not exist yet. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:758-766`)] Vanilla has 218 input lines with `mappers[...]`. The matching rule and the `mapper:` output are on [craftRecipe outputs and itemMappers](/pz/build-42/modding/crafting/craftrecipe-outputs-and-itemmappers). The `overlayMapper` word on an input line (3 vanilla lines) registers the input with the recipe's overlay mapper in the same way. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:767-774`)]

## 7. Try it: three recipes that use these lines

**A one-file mod with a recipe for a kept tool, a fluid and a range, so each form is on screen.**

1. Make `Zomboid/mods/InputGrammarDemo/` with `42/mod.info` and `42/poster.png`, laid out as in the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton).
2. Write `42/mod.info`:

```
name=Input Grammar Demo
id=InputGrammarDemo
description=Three recipes that show the main input line forms.
poster=poster.png
author=Your Name
```

3. Write `42/media/scripts/InputGrammarDemo_recipes.txt`:

```
module InputGrammarDemo
{
    craftRecipe StitchDemoStraps
    {
        time = 200,
        timedAction = SewingCloth,
        Tags = AnySurfaceCraft,
        category = Tailoring,
        inputs
        {
            item 1 tags[base:scissors] mode:keep flags[IsNotDull;MayDegradeLight],
            item 1 [Base.Leather_Crude_Medium_Tan;2:Base.Leather_Crude_Small_Tan],
            item 2 tags[base:heavythread],
            item 1 [Base.Buckle] mode:destroy,
        }
        outputs
        {
            item 4 Base.LeatherStrips,
        }
    }

    craftRecipe FillDemoFirebomb
    {
        time = 80,
        timedAction = Making,
        Tags = InHandCraft,
        category = Electrical,
        inputs
        {
            item 1 tags[base:glassbottle] mode:destroy,
            -fluid 1.0 [RubbingAlcohol;Petrol;Tequila;Vodka;Whiskey],
            item 1 [Base.RippedSheets;Base.RippedSheetsDirty] mode:destroy,
        }
        outputs
        {
            item 1 Base.Molotov,
        }
    }

    craftRecipe DryDemoCorn
    {
        time = 1000,
        Tags = AnySurfaceCraft,
        category = Farming,
        inputs
        {
            item variable[1:20] [Base.Corn] flags[ItemCount] mode:destroy,
        }
        outputs
        {
            item variable[1:20] Base.CornSeed,
        }
    }
}
```

4. Start the game, open **Mods**, check **Input Grammar Demo** and start a game. In debug mode, spawn scissors, a medium tan leather, two heavy thread, a buckle, some `Base.Corn`, and open the crafting window next to a table.

You should find `StitchDemoStraps` and `DryDemoCorn` in the list under their ids, and `FillDemoFirebomb` in the hand-craft list once you hold a glass bottle with a fluid from its list. `StitchDemoStraps` should keep the scissors and use up the rest, and should make 4 leather strips. `DryDemoCorn` should offer a number of ears from 1 to 20 and make the same number of seeds. The recipes are copies of vanilla's holster, molotov and corn drying lines with new ids. :cite[(`media/scripts/generated/recipes/recipes_tailoring_leatherAndHide.txt:1306-1330`, `media/scripts/generated/recipes/recipes_traps.txt:317-333`)]

## 8. What a bad input line does

**Most mistakes throw while the block is read and remove the recipe; a few wait for the world dictionary.**

| Mistake | What happens | Code |
|---|---|---|
| `item 1 Base.Plank` (no brackets) | Throws `unknown recipe param`, and the loader removes the recipe. | `zombie/scripting/entity/components/crafting/InputScript.java:764-770`, `zombie/scripting/ScriptBucket.java:198-205` |
| A flag name outside the 69, or one with the wrong case | Throws from `valueOf`. | `zombie/scripting/entity/components/crafting/InputScript.java:749-757` |
| A mode word that is not `use`, `keep` or `destroy` | Throws `Invalid item mode Error`, except for six deprecated words that are only logged. | `zombie/scripting/entity/components/crafting/InputScript.java:677-697` |
| A `-fluid` line with no item line before it | Throws `Previous input is null`. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:569-574` |
| A tag that no item carries | Throws `Tag has no items` when the world dictionary is built. One failure ends that pass for the remaining craft recipes. | `zombie/scripting/entity/components/crafting/InputScript.java:891-896`, `zombie/scripting/ScriptBucketCollection.java:189-195` |
| A bracketed item that does not exist | Skipped, and logged only in debug mode. The input can then be empty and log `Invalid input`. | `zombie/scripting/entity/components/crafting/InputScript.java:874-889`, `zombie/scripting/entity/components/crafting/InputScript.java:949-951` |

:::callout[How we know]{kind=proof}
Every code line above was opened in the 42.22 capture.

The vanilla counts were taken over every `craftRecipe` block in `media/scripts`: 3,348 `item` and 56 `-fluid` input lines, the form counts, the mode counts and the flag counts. The example mod passed the repo's recipe checker and was not run in a game, so the in-game results above follow from the code.

Not verified: what an unregistered tag id does at load (the registry lookup returns nothing, and the code that follows was not traced), whether `FillDemoFirebomb` accepts a particular bottle, and how the `+` line behaves in a mod. Corrected from the old page: `IsFireFuel` and `IsFireTinder` are not flags, the `mode:use` mode is accepted and is the default, the count range is `variable[low:high]` and not `3-5`, and the `[A;B]` form is no longer the only list form (per-item amounts exist). Dropped: the tags `Charcoal` and `SharpKnife` in their capitalized, unprefixed form (vanilla writes `base:charcoal`; the loader lower-cases either), and the `HeadingTool` example form.
:::
