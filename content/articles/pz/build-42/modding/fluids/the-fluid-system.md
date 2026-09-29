---
id: build-42-the-fluid-system
slug: the-fluid-system
title: The fluid system
game: pz
version: build-42
section: modding
category: fluids
difficulty: intermediate
tags:
  - fluids
  - fluidcontainer
  - liquids
excerpt: >-
  [CONFIRMED — NEW in B42, BREAKING vs B41.] B41 modeled liquids as many item
  variants (empty/half/full bottles, hairdye split items, etc.). B42 has one
  real fluid system.
last_updated: '2026-09-29'
---
# The fluid system

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**[CONFIRMED — NEW in B42, BREAKING vs B41.]** B41 modeled liquids as many item variants (empty/half/full bottles, `hairdye` split items, etc.). B42 has one real fluid system.

### 12.1 Defining a `fluid`

From `media/scripts/fluids.txt` `[CONFIRMED]`:

```
fluid Water
{
    ColorReference = LightSkyBlue,
    DisplayName    = Fluid_Name_Water,
    Categories
    {
        Beverage,
        Water,
    }
    Properties
    {
        thirstChange = -50,
    }
}

fluid TaintedWater
{
    ColorReference = LightSkyBlue,
    DisplayName    = Fluid_Name_TaintedWater,
    Categories
    {
        Beverage,
        Hazardous,
        Water,
    }
    Properties
    {
        thirstChange = -50,
    }
    Poison
    {
        maxEffect   = Medium,
        minAmount   = 1.0,
        diluteRatio = 0.20,
    }
}
```

Full field set (from the commented template in `fluids.txt`) `[CONFIRMED]`:
- `Color = R : G : B` OR `ColorReference = <NamedColor>`.
- `DisplayName` — translation key.
- `Categories { ... }` — e.g. `Beverage`, `Water`, `Industrial`, `Fuel`, `Hazardous`, `Alcoholic`. Used for blending rules and recipe matching.
- `Properties { ... }` — nutrition/effect deltas: `thirstChange`, `hungerChange`, `calories`, `carbohydrates`, `lipids`, `proteins`, `alcohol`, `fatigueChange`, `stressChange`, `unhappyChange`, `fluReduction`, `painReduction`, `enduranceChange`, `foodSicknessReduction`.
- `Poison { maxEffect, minAmount, diluteRatio }` — toxicity.
- `BlendWhiteList` / `BlendBlackList` — reference a filter script or define inline (`whitelist = true, fluids { Water }, categories { Beverage }`) to control what mixes.

**Vanilla fluid identifier rule** `[CONFIRMED, from the template comment]`: for the base game, the fluid identifier must match a `FluidType` enum; if it does NOT match the enum, it is treated as a **modded fluid**. So mod fluids just use a new name and are auto-registered as modded. Vanilla fluids are split across `fluids.txt`, `fluids_Beverages.txt`, `fluids_Alcoholic.txt`.

### 12.2 Fluid containers (item component)

From `TEMPORARY_TESTING_new_items/TEMPORARY_items_fluidcontainers.txt` `[CONFIRMED]`:

```
item Bucket
{
    DisplayCategory = WaterContainer,
    Weight   = 1,
    Type     = Normal,
    DisplayName = Bucket,
    EatType  = Bucket,
    PourType = Bucket,
    Icon     = MetalBucket,
    IconFluidMask = Bucket_Mask,
    StaticModel = Bucket_Ground_Fluid,
    WorldStaticModel = Bucket_Ground,
    Tags = Bucket;Cookable;HasMetal;MetalBucket,
    ResearchableRecipes = MakeBucketMaul;Forge_Bucket;CarveBucket,

    component FluidContainer
    {
        ContainerName = Bucket,
        RainFactor    = 0.5,
        capacity      = 10.0,
    }
}
```

`FluidContainer` fields `[CONFIRMED]`: `ContainerName` (logical container id), `capacity` (float, max units), `RainFactor` (0..1, how fast it fills from rain). Wiki also documents `TransferRate` (units/tick when pouring). `[TransferRate UNCERTAIN — not in this sample]`. `IconFluidMask` lets the icon tint to show fill/color.

### 12.3 Fluids in recipes

Consume fluid (from `recipes_butter_churn.txt`) `[CONFIRMED]`:

```
craftRecipe Churn Cow Butter
{
    time = 500,
    tags = ChurnBucket,
    category = Farming,
    inputs
    {
        item 1 [*],            // any container...
        -fluid 5 [CowMilk],    // ...holding at least 5 units of CowMilk
    }
    outputs
    {
        item 1 Base.Butter,
    }
}
```

Consume fluid + items together (from `recipes_sugar.txt`, currently commented in vanilla but syntactically representative) `[CONFIRMED syntax]`:

```
inputs
{
    item 9 [Base.SugarBeet] mode:destroy,
    item 1 tags[SharpKnife;Grater] mode:keep flags[IsNotDull;MayDegradeLight],
    item 1 [*],
    -fluid 1.0 [Water],
}
```

Producing fluid uses `+fluid <amount> [FluidType]` in inputs/outputs against a container. `[CONFIRMED by wiki; exact vanilla `+fluid` line not in files pulled — UNCERTAIN]`
