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
  - recipe-tags
excerpt: >-
  item Base.ItemName — produces that many. Multiple output lines allowed. An
  empty outputs { } is valid — used when the recipe's effect is a state change /
  fluid transfer / opening a bottle (see...
last_updated: '2026-09-29'
related_articles:
  - the-new-craftrecipe-block
  - craftrecipe-inputs-in-depth
  - craftrecipe-vs-legacy-recipe
  - addendum-canonical-craftrecipe-schema
---
# `craftRecipe` outputs and itemMappers

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### 7.1 Simple outputs

```
outputs
{
    item 10 Base.Nails,
    item 25 Base.LeatherStrips,
}
```
`item <count> Base.ItemName` — produces that many. Multiple output lines allowed. An **empty `outputs { }`** is valid — used when the recipe's effect is a state change / fluid transfer / opening a bottle (see `OpenBottleOfBeer`). `[CONFIRMED]`

### 7.2 `mapper:` output + `itemMapper` block (dynamic output)

When the output should depend on which input variant was used, the output line references a mapper and an `itemMapper` block defines the `input -> output` table. Real example (from `recipes_leather_prep.txt`) `[CONFIRMED]`:

```
craftRecipe DryLargeLeather
{
    time  = 100,
    tags  = DryLeatherLarge,
    category = Farming,
    inputs
    {
        item 1 tags[LeatherCrudeWetLarge;LeatherFurWetLarge] mappers[DryLeatherLarge],
    }
    outputs
    {
        item 1 mapper:DryLeatherLarge,
    }
    itemMapper DryLeatherLarge
    {
        Base.Leather_Crude_Large_Tan      = Base.Leather_Crude_Large_Tan_Wet,
        Base.CowLeather_Angus_Fur_Tan     = Base.CowLeather_Angus_Fur_Tan_Wet,
        Base.CowLeather_Holstein_Fur_Tan  = Base.CowLeather_Holstein_Fur_Tan_Wet,
    }
}
```

Read the mapper as **`OutputItem = InputItem,`** — i.e. if the consumed input was `..._Tan_Wet`, the produced output is the dry `..._Tan`. A `default = Base.Something,` line provides a fallback (seen in `recipes_fiber.txt`'s `fiberTypes` mapper). `[CONFIRMED]`

### 7.3 Count ranges

`[UNCERTAIN]` Community/wiki docs describe count ranges like `item 3-5 Base.Foo` for randomized yields. The vanilla files pulled here used only fixed integer counts, so treat ranges as documented-but-unverified in these samples. Validate in-game.
