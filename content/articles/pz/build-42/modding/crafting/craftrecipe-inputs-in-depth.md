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
  - itemmapper
  - recipe-tags
excerpt: >-
  The inputs{} block is where B42's expressiveness lives. Each line is one
  ingredient requirement.
last_updated: '2026-09-29'
related_articles:
  - the-new-craftrecipe-block
  - craftrecipe-outputs-and-itemmappers
  - craftrecipe-vs-legacy-recipe
  - addendum-canonical-craftrecipe-schema
---
# `craftRecipe` inputs in depth

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The `inputs{}` block is where B42's expressiveness lives. Each line is one ingredient requirement.

### 6.1 Item by count + exact name

```
item 20 [Base.CornSeed],
item 1 [Base.SugarBeetPulpPot],
```
`item <count> [Base.ItemName]` — consumes `<count>` of that exact item.

### 6.2 The `[A;B]` OR-syntax (exact items)

```
item 12 [Base.WheatSeed;Base.RyeSeed;Base.BarleySeed],
item 1 [Base.IronChunk;Base.IronScrap;Base.SteelChunk;Base.SteelScrap],
```
Semicolon-separated names inside `[ ]` = "any ONE of these items satisfies it." `[CONFIRMED]`

### 6.3 Match by tag: `tags[...]`

```
item 1 tags[SharpKnife;Scissors] mode:keep flags[IsNotDull;MayDegradeLight],
item 2 tags[Charcoal],
```
`item <count> tags[TagA;TagB]` — any item carrying one of those tags. This is the preferred form for tools/materials so mods interoperate. `[CONFIRMED]`

### 6.4 Item modes — `mode:destroy` / `mode:keep` (and default)

`[CONFIRMED]` The mode controls what happens to the input after crafting:

| Mode | Meaning |
|---|---|
| *(none / default)* | Item is **consumed** (used up as an ingredient). This is the default when no `mode:` is present — e.g. `item 1 tags[BarStockQuarter],` is eaten by the recipe. |
| `mode:keep` | Item is a **tool** — required but NOT consumed (returned after). Used for hammers, knives, tongs, containers. |
| `mode:destroy` | Item is **explicitly destroyed/consumed** (used to force-consume even things that might otherwise be treated as tools, and to make intent explicit). Seen on `item 30 [Base.SunflowerSeeds] mode:destroy` and `item 9 [Base.SugarBeet] mode:destroy`. |

**Community note:** `mode:use` is documented as a third mode (consume a *charge*/uses off a drainable rather than the whole item). `[UNCERTAIN — referenced by community wiki, not confirmed in the vanilla files pulled here]`

### 6.5 `flags[...]`

`[CONFIRMED]` Extra per-ingredient conditions/behaviors, semicolon-separated:

```
item 1 tags[SharpKnife;Scissors] mode:keep flags[IsNotDull;MayDegradeLight],
item 1 [Base.CrudeWoodenTongs] mode:keep flags[MayDegradeLight],
item 1 [Base.BeerBottle] mode:keep flags[DontPutBack;Prop2],
```

Observed flags:
- `IsNotDull` — tool must not be dull (blade condition gate).
- `MayDegradeLight` / (implied heavier degrade variants) — tool loses condition when used.
- `DontPutBack` — don't auto-return the item to inventory slot after.
- `Prop1` / `Prop2` — which "prop hand"/animation slot the item occupies during the action.
- `IsCookedFoodItem` — ingredient must be in a cooked state.
- `IsFireFuel` / `IsFireTinder` — fuel/tinder roles.

### 6.6 `mappers[...]` on an input (paired with `itemMapper`)

```
item 1 tags[LeatherCrudeWetLarge;LeatherFurWetLarge] mappers[DryLeatherLarge],
```
`mappers[<MapperName>]` links this input to an `itemMapper` block so the OUTPUT can be chosen based on WHICH input was used (see 7.2). `[CONFIRMED]`

### 6.7 The `[*]` wildcard container (fluids)

```
item 1 [*],
-fluid 5 [CowMilk],
```
`item 1 [*]` = "any item at all" — in fluid recipes this is the **container** that holds the fluid being consumed. Paired with a `-fluid` line. `[CONFIRMED]`

### 6.8 Fluid inputs / outputs — `-fluid` / `+fluid`

```
-fluid 5 [CowMilk],     // consume 5.0 units of CowMilk from a container in inputs
-fluid 1.0 [Water],     // floats allowed
```
`-fluid <amount> [FluidType;...]` consumes fluid; `+fluid <amount> [FluidType]` produces fluid (into an output container). Amount is a **float**. `[CONFIRMED for -fluid; +fluid form CONFIRMED by wiki/secondary, exact vanilla +fluid line UNCERTAIN in files pulled]`

### 6.9 Full worked input example (blacksmithing)

From `entities/blacksmith/craftRecipes/recipes_blacksmith_tools.txt` `[CONFIRMED]`:

```
craftRecipe Forge_Nails
{
    time        = 300,
    SkillRequired = Blacksmith:1,
    needTobeLearn = true,
    timedAction = MakingHammer_Surface,
    xpAward = Blacksmith:20,
    AutoLearnAll = Blacksmith:3,
    tags = PrimitiveForge,
    category = Tools,
    inputs
    {
        item 2 tags[Charcoal],                                              // fuel, consumed
        item 1 [Base.IronChunk;Base.IronScrap;Base.SteelChunk;Base.SteelScrap], // stock, consumed
        item 1 tags[SmithingHammer] mode:keep flags[MayDegradeLight],       // tool, kept, degrades
        item 1 tags[MetalworkingPliers;Tongs] mode:keep flags[MayDegradeLight],
        item 1 tags[HeadingTool] mode:keep,
    }
    outputs
    {
        item 10 Base.Nails,
    }
}
```
