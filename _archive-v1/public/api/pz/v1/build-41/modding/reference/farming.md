---
id: farming
slug: farming
title: Farming Script Reference
excerpt: Farming scripts define crops, seeds, gardening tools, and farming-related recipes. The farming module is located in `media/scripts/farming.txt`. media/scripts/farming.txt ├── Farming Food Items    --...
game: pz
version: build-41
section: modding
category: reference
subcategory: null
difficulty: beginner
tags:
  - beginner
  - farming
  - gardening
  - scripts
  - reference
  - food
last_updated: 2026-01-10
---
# Farming Script Reference

## Overview

Farming scripts define crops, seeds, gardening tools, and farming-related recipes. The farming module is located in `media/scripts/farming.txt`.

## File Structure

```
media/scripts/farming.txt
├── Farming Food Items    -- Crops and produce
├── Food Items            -- Processed foods
├── Seeds                 -- Individual seeds
├── Seed Packages         -- Seed packets
├── Tools                 -- Gardening equipment
└── Recipes               -- Farming recipes
```

---

## Module Declaration

```
module farming
{
    imports
    {
        Base
    }
    
    /* Item and recipe definitions */
}
```

Note: The farming module imports Base, so items reference `Base.ItemName` or just `ItemName`.

---

## Crop Items

Crops are Food type items with special farming properties:

```
item Tomato
{
    DisplayCategory = Food,
    Type = Food,
    DisplayName = Tomato,
    Icon = Tomato,
    Weight = 0.2,
    
    /* Nutrition */
    HungerChange = -12,
    ThirstChange = -8,
    Calories = 14,
    Carbohydrates = 3.53,
    Proteins = 1.29,
    Lipids = 0.21,
    
    /* Spoilage */
    DaysFresh = 4,
    DaysTotallyRotten = 12,
    
    /* Cooking */
    EvolvedRecipe = Pizza:12;Soup:12;Stew:12;Salad:6,
    FoodType = Vegetables,
    
    /* 3D Models */
    StaticModel = RoundFood_Red,
    WorldStaticModel = Tomato_Ground,
}
```

### Key Crop Properties

| Property | Description | Example |
|----------|-------------|----------|
| `FoodType` | Category for recipes | `FoodType = Vegetables,` |
| `EvolvedRecipe` | Cooking compatibility | `EvolvedRecipe = Soup:12;Stew:12,` |
| `ThirstChange` | Water content | `ThirstChange = -8,` |
| `DaysFresh` | Freshness duration | `DaysFresh = 4,` |
| `WorldStaticModel` | Dropped item model | `WorldStaticModel = Tomato_Ground,` |

---

## Vanilla Crops

| Crop | HungerChange | DaysFresh | DaysTotallyRotten |
|------|--------------|-----------|-------------------|
| Tomato | -12 | 4 | 12 |
| Potato | -18 | 14 | 28 |
| Cabbage | -24 | 2 | 4 |
| Carrot | -10 | 7 | 14 |
| Broccoli | -10 | 3 | 7 |
| Radish | -3 | 3 | 7 |
| Strawberry | -5 | 2 | 5 |

---

## Seed Items

### Individual Seeds

```
item TomatoSeed
{
    DisplayCategory = Gardening,
    Type = Normal,
    DisplayName = Tomato Seeds,
    Icon = TZ_TomatoSeeds,
    Weight = 0.009,
    SurvivalGear = TRUE,
    WorldStaticModel = Seeds_Ground,
}
```

### Seed Packets

```
item TomatoBagSeed
{
    DisplayCategory = Gardening,
    Type = Normal,
    DisplayName = Tomato Seeds Packet,
    Icon = TZ_SeedpackTomatoes,
    Weight = 0.1,
    SurvivalGear = TRUE,
    WorldStaticModel = TomatoSeedBag_Ground,
}
```

### Vanilla Seeds

| Seed | Packet | Opens To |
|------|--------|----------|
| CarrotSeed | CarrotBagSeed | 50 seeds |
| TomatoSeed | TomatoBagSeed | 50 seeds |
| PotatoSeed | PotatoBagSeed | 50 seeds |
| CabbageSeed | CabbageBagSeed | 50 seeds |
| BroccoliSeed | BroccoliBagSeed | 50 seeds |
| RedRadishSeed | RedRadishBagSeed | 50 seeds |
| StrewberrieSeed | StrewberrieBagSeed | 50 seeds |

---

## Gardening Tools

### Trowel (Hand Shovel)

```
item HandShovel
{
    DisplayCategory = Gardening,
    Type = Weapon,
    DisplayName = Trowel,
    Icon = TZ_GardenTrowel,
    Weight = 0.5,
    
    /* Weapon properties */
    WeaponSprite = Trowel,
    Categories = SmallBlade,
    SubCategory = Stab,
    SwingAnim = Stab,
    MinDamage = 0.2,
    MaxDamage = 0.4,
    ConditionMax = 6,
    
    /* Tool functions */
    Tags = ClearAshes;DigPlow;TakeDirt,
    SurvivalGear = TRUE,
}
```

### Watering Can

```
item WateredCan
{
    DisplayCategory = Gardening,
    Type = Normal,
    DisplayName = Watering Can,
    Icon = TZ_WateringCan,
    Weight = 2.0,
    ReplaceOnUseOn = WaterSource-WateredCanFull,
    CanStoreWater = true,
    RainFactor = 0.2,
    StaticModel = WateringCan,
    SurvivalGear = TRUE,
}

item WateredCanFull
{
    DisplayCategory = Water,
    Type = Drainable,
    DisplayName = Watering Can (Full),
    Icon = TZ_WateringCan,
    Weight = 4.0,
    UseDelta = 0.025,
    UseWhileEquipped = false,
    ReplaceOnUseOn = WaterSource-WateredCanFull,
    ReplaceOnDeplete = WateredCan,
    IsWaterSource = true,
    CanStoreWater = true,
    RainFactor = 0.2,
    EatType = WateringCan,
}
```

### Gardening Spray Can

```
item GardeningSprayEmpty
{
    DisplayCategory = Gardening,
    Type = Normal,
    DisplayName = Gardening Spray Can (Empty),
    Icon = TZ_GardeningSprayCan,
    Weight = 0.3,
    ReplaceOnUseOn = WaterSource-GardeningSprayFull,
    CanStoreWater = true,
    SurvivalGear = TRUE,
}

item GardeningSprayMilk
{
    DisplayCategory = Gardening,
    Type = Drainable,
    DisplayName = Mildew Spray,
    Icon = TZ_GardeningSprayCan,
    Weight = 1.0,
    UseDelta = 0.1,
    ReplaceOnDeplete = GardeningSprayEmpty,
    UseWhileEquipped = false,
}

item GardeningSprayCigarettes
{
    DisplayCategory = Gardening,
    Type = Drainable,
    DisplayName = Insecticide Spray,
    Icon = TZ_GardeningSprayCan,
    Weight = 1.0,
    UseDelta = 0.1,
    ReplaceOnDeplete = GardeningSprayEmpty,
    UseWhileEquipped = false,
}
```

---

## Farming Recipes

### Open Seed Packet

```
recipe Open Packet of Tomato Seeds
{
    TomatoBagSeed,

    Result:TomatoSeed=50,
    Time:20.0,
    Category:Farming,
    Sound:OpenSeedPacket,
}
```

### Repack Seeds

```
recipe Put Tomato Seeds in Packet
{
    TomatoSeed=50,

    Result:TomatoBagSeed,
    Time:10.0,
    Category:Farming,
}
```

### Make Mildew Cure

```
recipe Make Mildew Cure
{
    GardeningSprayEmpty,
    [Recipe.GetItemTypes.Milk],

    Result:GardeningSprayMilk,
    Time:40.0,
    Category:Farming,
    NeedToBeLearn:true,
    AllowRottenItem:true,
    OnTest:Recipe.OnTest.WholeMilk,
}
```

### Make Insecticide Spray

```
recipe Make Flies Cure
{
    GardeningSprayEmpty,
    Water=3,
    Cigarettes=5,

    Result:GardeningSprayCigarettes,
    Time:40.0,
    Category:Farming,
    NeedToBeLearn:true,
}
```

### Smithing Recipes

```
recipe Make Shovel
{
    IronIngot=90,
    Handle,
    keep [Recipe.GetItemTypes.Hammer],
    keep Tongs,

    NearItem:Anvil,
    Result:Shovel,
    Time:200.0,
    Category:Smithing,
    SkillRequired:Blacksmith=6,
    OnGiveXP:Recipe.OnGiveXP.Blacksmith25,
    NeedToBeLearn:true,
}

recipe Make Hand Shovel
{
    IronIngot=50,
    keep [Recipe.GetItemTypes.Hammer],
    keep Tongs,

    NearItem:Anvil,
    Result:HandShovel,
    Time:200.0,
    Category:Smithing,
    SkillRequired:Blacksmith=6,
    OnGiveXP:Recipe.OnGiveXP.Blacksmith20,
    NeedToBeLearn:true,
}
```

---

## Creating Custom Crops

### Custom Vegetable

```
module MyMod
{
    imports { Base farming }
    
    item CustomVegetable
    {
        DisplayCategory = Food,
        Type = Food,
        DisplayName = Custom Vegetable,
        Icon = CustomVegIcon,
        Weight = 0.2,
        
        HungerChange = -15,
        ThirstChange = -5,
        Calories = 25,
        Carbohydrates = 5,
        Proteins = 2,
        Lipids = 0.1,
        
        DaysFresh = 5,
        DaysTotallyRotten = 10,
        
        EvolvedRecipe = Soup:15;Stew:15;Salad:8,
        FoodType = Vegetables,
        
        WorldStaticModel = CustomVeg_Ground,
    }
}
```

### Custom Seeds

```
module MyMod
{
    imports { Base }
    
    item CustomVegSeed
    {
        DisplayCategory = Gardening,
        Type = Normal,
        DisplayName = Custom Vegetable Seeds,
        Icon = CustomSeedIcon,
        Weight = 0.009,
        SurvivalGear = TRUE,
    }
    
    item CustomVegBagSeed
    {
        DisplayCategory = Gardening,
        Type = Normal,
        DisplayName = Custom Vegetable Seeds Packet,
        Icon = CustomSeedBagIcon,
        Weight = 0.1,
        SurvivalGear = TRUE,
    }
    
    recipe Open Packet of Custom Seeds
    {
        CustomVegBagSeed,
        
        Result:CustomVegSeed=50,
        Time:20.0,
        Category:Farming,
        Sound:OpenSeedPacket,
    }
}
```

---

## Food Processing Items

### Bacon Processing

```
item Bacon
{
    DisplayCategory = Food,
    Type = Food,
    DisplayName = Bacon,
    Icon = Bacon,
    Weight = 0.3,
    IsCookable = true,
    MinutesToCook = 20,
    MinutesToBurn = 50,
    HungerChange = -12,
    DaysFresh = 3,
    DaysTotallyRotten = 5,
    DangerousUncooked = true,
    EvolvedRecipe = Pizza:12;Stew:12;Sandwich:12|Cooked,
    FoodType = Bacon,
    GoodHot = true,
    BadCold = true,
    Packaged = TRUE,
}

item BaconRashers
{
    /* ... sliced bacon ... */
}

item BaconBits
{
    /* ... diced bacon ... */
}

recipe Get Bacon Rashers
{
    keep [Recipe.GetItemTypes.SharpKnife],
    Bacon,

    Result:BaconRashers=4,
    Time:10.0,
    Category:Cooking,
}

recipe Get Bacon Bits
{
    keep [Recipe.GetItemTypes.SharpKnife],
    BaconRashers,

    Result:BaconBits=4,
    Time:10.0,
    Category:Cooking,
}
```

---

## Condiments

### Mayonnaise

```
item MayonnaiseFull
{
    DisplayCategory = Food,
    Type = Food,
    DisplayName = Mayonnaise,
    Weight = 0.5,
    HungerChange = -30,
    BoredomChange = 10,
    UnhappyChange = 5,
    DaysFresh = 10,
    DaysTotallyRotten = 13,
    ReplaceOnUse = MayonnaiseEmpty,
    EvolvedRecipe = Sandwich:2;Burger:2;Salad:2,
    Spice = true,
    Packaged = TRUE,
    EatType = candrink,
    FoodType = NoExplicit,
}

item MayonnaiseEmpty
{
    DisplayCategory = WaterContainer,
    Type = Normal,
    DisplayName = Empty Bottle,
    Weight = 0.1,
    ReplaceOnUseOn = WaterSource-MayonnaiseWaterFull,
    CanStoreWater = true,
}
```

---

## Important Tags

| Tag | Purpose |
|-----|----------|
| `SurvivalGear` | Marks item as essential |
| `CanStoreWater` | Can hold water |
| `RainFactor` | Collects rain (0.0-1.0) |
| `DigPlow` | Can plow ground |
| `TakeDirt` | Can collect dirt |
| `ClearAshes` | Can clear fire remains |

---

## Related

- [Script Properties](/build-41/modding/reference/script-properties) - Item and recipe properties
- [Foraging Documentation](/build-41/modding/foraging) - Foraging system
- [Evolved Recipes](/build-41/modding/recipes/evolved-recipe-syntax) - Cooking system 