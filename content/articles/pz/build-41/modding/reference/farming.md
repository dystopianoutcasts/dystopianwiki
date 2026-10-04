---
id: reference-farming
slug: farming
title: "Farming Script Reference"
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
excerpt: "Reference for Project Zomboid farming scripts including crops, seeds, gardening tools, and farming recipes."
table_of_contents:
  - text: "What Is Farming?"
    link: "#what-is-farming"
  - text: "Overview"
    link: "#overview"
  - text: "File Structure"
    link: "#file-structure"
  - text: "Module Declaration"
    link: "#module-declaration"
  - text: "Crop Items"
    link: "#crop-items"
  - text: "Vanilla Crops"
    link: "#vanilla-crops"
  - text: "Seed Items"
    link: "#seed-items"
  - text: "Gardening Tools"
    link: "#gardening-tools"
  - text: "Farming Recipes"
    link: "#farming-recipes"
  - text: "Creating Custom Crops"
    link: "#creating-custom-crops"
  - text: "Food Processing Items"
    link: "#food-processing-items"
  - text: "Condiments"
    link: "#condiments"
  - text: "Important Tags"
    link: "#important-tags"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Best Practices"
    link: "#best-practices"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-10
---

# Farming Script Reference

## What Is Farming?

You know when you plant tomatoes in your backyard garden in-game and watch them grow? Or when you craft a shovel at an anvil? All of that is defined by **farming scripts** - the script files that tell the game what crops exist, how seeds work, what gardening tools do, and how farming recipes function.

**Farming scripts are item and recipe definitions.** Every vegetable you harvest, every seed packet you open, and every watering can you fill is defined in the `farming.txt` script file. Understanding these scripts lets you create custom crops, add new gardening tools, or modify how the farming system works.

When I first tried to add a custom crop, I thought I just needed to define the plant. Wrong! You need the crop item, the seed item, the seed packet, recipes to open/close packets, and if you want it integrated properly - cooking compatibility and proper nutrition values. The farming system has a lot of interconnected pieces, but once you understand the pattern, it's straightforward.

This reference shows you every part of the farming system: crops, seeds, tools, recipes, and the tags that make them work together.

---

## Overview

Farming scripts define crops, seeds, gardening tools, and farming-related recipes. The farming module is located in `media/scripts/farming.txt`.

**What farming scripts control:**
- **Crops** - Vegetables you harvest (tomatoes, potatoes, etc.)
- **Seeds** - Individual seeds and seed packets
- **Tools** - Shovels, watering cans, spray bottles
- **Recipes** - Opening seed packets, crafting sprays, smithing tools
- **Processing** - Slicing bacon, preparing ingredients

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

```lua
module farming                              /* Declare the farming module */
{
    imports                                 /* Import other modules we need */
    {
        Base                                /* We'll reference Base module items */
    }

    /* Item and recipe definitions go here */
}
```

**Why it matters:** The farming module imports Base, so items can reference `Base.ItemName` or just `ItemName`. This is why you see `Water` instead of `Base.Water` in recipes - Base is already imported.

---

## Crop Items

Crops are Food type items with special farming properties. Every harvestable plant in the game is defined as a crop item.

### Basic Crop Structure

```lua
item Tomato                                 /* Define a crop called Tomato */
{
    DisplayCategory = Food,                 /* Shows in Food category in inventory */
    Type = Food,                            /* This is a food item (can be eaten) */
    DisplayName = Tomato,                   /* Name shown to player */
    Icon = Tomato,                          /* Icon file to use */
    Weight = 0.2,                           /* Weight in inventory units */

    /* Nutrition - what eating this does */
    HungerChange = -12,                     /* Reduces hunger by 12 */
    ThirstChange = -8,                      /* Reduces thirst by 8 (juicy!) */
    Calories = 14,                          /* Calorie content */
    Carbohydrates = 3.53,                   /* Carbs in grams */
    Proteins = 1.29,                        /* Protein in grams */
    Lipids = 0.21,                          /* Fats in grams */

    /* Spoilage - how long it lasts */
    DaysFresh = 4,                          /* Stays fresh for 4 days */
    DaysTotallyRotten = 12,                 /* Completely rotten after 12 days */

    /* Cooking - can this be used in recipes? */
    EvolvedRecipe = Pizza:12;Soup:12;Stew:12;Salad:6,  /* Compatible recipes with values */
    FoodType = Vegetables,                  /* Category for recipe matching */

    /* 3D Models */
    StaticModel = RoundFood_Red,            /* Model when held/in inventory */
    WorldStaticModel = Tomato_Ground,       /* Model when dropped on ground */
}
```

### Key Crop Properties

| Property | Description | Example |
|----------|-------------|---------|
| `FoodType` | Category for recipes | `FoodType = Vegetables,` |
| `EvolvedRecipe` | Cooking compatibility | `EvolvedRecipe = Soup:12;Stew:12,` |
| `ThirstChange` | Water content | `ThirstChange = -8,` |
| `DaysFresh` | Freshness duration | `DaysFresh = 4,` |
| `WorldStaticModel` | Dropped item model | `WorldStaticModel = Tomato_Ground,` |

**Why crops need these properties:**
- **FoodType** - Tells recipes "this is a vegetable" so it works in salads, soups, etc.
- **ThirstChange** - Juicy vegetables like tomatoes reduce thirst, dry vegetables don't
- **EvolvedRecipe** - Defines which advanced recipes can use this ingredient and how much it adds
- **DaysFresh/DaysTotallyRotten** - Freshness timer affects taste and safety

---

## Vanilla Crops

Here are all the vanilla crops with their core stats:

| Crop | HungerChange | DaysFresh | DaysTotallyRotten |
|------|--------------|-----------|-------------------|
| Tomato | -12 | 4 | 12 |
| Potato | -18 | 14 | 28 |
| Cabbage | -24 | 2 | 4 |
| Carrot | -10 | 7 | 14 |
| Broccoli | -10 | 3 | 7 |
| Radish | -3 | 3 | 7 |
| Strawberry | -5 | 2 | 5 |

**Pattern observation:**
- High water content crops (tomato, cabbage) rot faster
- Root vegetables (potato, carrot) last much longer
- Hunger reduction varies by crop size/density

---

## Seed Items

Every crop needs seeds. Seeds come in two forms: **individual seeds** (planted one at a time) and **seed packets** (contain 50 seeds).

### Individual Seeds

```lua
item TomatoSeed                             /* Individual seed item */
{
    DisplayCategory = Gardening,            /* Shows in Gardening category */
    Type = Normal,                          /* Basic item (not food, not weapon) */
    DisplayName = Tomato Seeds,             /* Name shown to player */
    Icon = TZ_TomatoSeeds,                  /* Icon file */
    Weight = 0.009,                         /* Very light (seeds are tiny!) */
    SurvivalGear = TRUE,                    /* Tagged as survival essential */
    WorldStaticModel = Seeds_Ground,        /* Model when dropped */
}
```

### Seed Packets

```lua
item TomatoBagSeed                          /* Seed packet (contains 50 seeds) */
{
    DisplayCategory = Gardening,            /* Shows in Gardening category */
    Type = Normal,                          /* Basic item */
    DisplayName = Tomato Seeds Packet,      /* Name shown to player */
    Icon = TZ_SeedpackTomatoes,             /* Different icon (shows packet) */
    Weight = 0.1,                           /* Heavier than individual seed */
    SurvivalGear = TRUE,                    /* Tagged as survival essential */
    WorldStaticModel = TomatoSeedBag_Ground, /* Model when dropped */
}
```

**Why two types?**
- **Individual seeds** - Planted directly, found loose in containers
- **Seed packets** - Convenient storage, found in stores, opened to get 50 seeds

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

**Standard pattern:** All vanilla seed packets contain exactly 50 seeds when opened.

---

## Gardening Tools

### Trowel (Hand Shovel)

```lua
item HandShovel                             /* Small digging tool */
{
    DisplayCategory = Gardening,            /* Shows in Gardening category */
    Type = Weapon,                          /* Can be used as weapon! */
    DisplayName = Trowel,                   /* Name shown to player */
    Icon = TZ_GardenTrowel,                 /* Icon file */
    Weight = 0.5,                           /* Half an inventory unit */

    /* Weapon properties - yes, you can stab with a trowel */
    WeaponSprite = Trowel,                  /* Sprite when equipped */
    Categories = SmallBlade,                /* Weapon category */
    SubCategory = Stab,                     /* Attack type */
    SwingAnim = Stab,                       /* Animation to use */
    MinDamage = 0.2,                        /* Minimum damage */
    MaxDamage = 0.4,                        /* Maximum damage */
    ConditionMax = 6,                       /* Durability (breaks after use) */

    /* Tool functions - what can this tool do? */
    Tags = ClearAshes;DigPlow;TakeDirt,     /* Three gardening functions */
    SurvivalGear = TRUE,                    /* Tagged as survival essential */
}
```

**Tags explained:**
- `ClearAshes` - Can clear burnt remains from fires
- `DigPlow` - Can plow ground for planting
- `TakeDirt` - Can collect dirt for filling containers

### Watering Can

```lua
item WateredCan                             /* Empty watering can */
{
    DisplayCategory = Gardening,            /* Shows in Gardening category */
    Type = Normal,                          /* Basic item */
    DisplayName = Watering Can,             /* Name shown to player */
    Icon = TZ_WateringCan,                  /* Icon file */
    Weight = 2.0,                           /* Heavy when empty (metal can) */
    ReplaceOnUseOn = WaterSource-WateredCanFull,  /* When used on water source, becomes full */
    CanStoreWater = true,                   /* This item can hold water */
    RainFactor = 0.2,                       /* Collects 20% of rainfall */
    StaticModel = WateringCan,              /* 3D model */
    SurvivalGear = TRUE,                    /* Tagged as survival essential */
}

item WateredCanFull                         /* Full watering can */
{
    DisplayCategory = Water,                /* Shows in Water category */
    Type = Drainable,                       /* Can be used up gradually */
    DisplayName = Watering Can (Full),      /* Name shows it's full */
    Icon = TZ_WateringCan,                  /* Same icon */
    Weight = 4.0,                           /* Doubled weight (water is heavy!) */
    UseDelta = 0.025,                       /* Uses 2.5% per water action */
    UseWhileEquipped = false,               /* Can't drink from it while walking */
    ReplaceOnUseOn = WaterSource-WateredCanFull,  /* Refills when used on water */
    ReplaceOnDeplete = WateredCan,          /* Becomes empty can when used up */
    IsWaterSource = true,                   /* Can be used as water source */
    CanStoreWater = true,                   /* Can hold water */
    RainFactor = 0.2,                       /* Still collects rain when full */
    EatType = WateringCan,                  /* Animation type when using */
}
```

**Pattern: Empty/Full versions** - Many water containers have two versions (empty and full) with different weights and properties.

### Gardening Spray Can

```lua
item GardeningSprayEmpty                    /* Empty spray bottle */
{
    DisplayCategory = Gardening,            /* Shows in Gardening category */
    Type = Normal,                          /* Basic item */
    DisplayName = Gardening Spray Can (Empty), /* Name shown to player */
    Icon = TZ_GardeningSprayCan,            /* Icon file */
    Weight = 0.3,                           /* Light when empty */
    ReplaceOnUseOn = WaterSource-GardeningSprayFull, /* Becomes full when used on water */
    CanStoreWater = true,                   /* Can hold water (or other liquids) */
    SurvivalGear = TRUE,                    /* Tagged as survival essential */
}

item GardeningSprayMilk                     /* Mildew spray (milk-based) */
{
    DisplayCategory = Gardening,            /* Shows in Gardening category */
    Type = Drainable,                       /* Can be used up */
    DisplayName = Mildew Spray,             /* Specific purpose name */
    Icon = TZ_GardeningSprayCan,            /* Same spray can icon */
    Weight = 1.0,                           /* Weight when filled */
    UseDelta = 0.1,                         /* Uses 10% per spray */
    ReplaceOnDeplete = GardeningSprayEmpty, /* Becomes empty when used up */
    UseWhileEquipped = false,               /* Must stop to use */
}

item GardeningSprayCigarettes               /* Insecticide spray (cigarette-based) */
{
    DisplayCategory = Gardening,            /* Shows in Gardening category */
    Type = Drainable,                       /* Can be used up */
    DisplayName = Insecticide Spray,        /* Specific purpose name */
    Icon = TZ_GardeningSprayCan,            /* Same spray can icon */
    Weight = 1.0,                           /* Weight when filled */
    UseDelta = 0.1,                         /* Uses 10% per spray */
    ReplaceOnDeplete = GardeningSprayEmpty, /* Becomes empty when used up */
    UseWhileEquipped = false,               /* Must stop to use */
}
```

**Pattern: One container, multiple fills** - Same spray bottle can hold different treatments (mildew cure or insecticide).

---

## Farming Recipes

### Open Seed Packet

```lua
recipe Open Packet of Tomato Seeds          /* Recipe to open seed packet */
{
    TomatoBagSeed,                          /* Requires seed packet (consumed) */

    Result:TomatoSeed=50,                   /* Produces 50 individual seeds */
    Time:20.0,                              /* Takes 20 time units */
    Category:Farming,                       /* Shows in Farming crafting tab */
    Sound:OpenSeedPacket,                   /* Sound effect to play */
}
```

### Repack Seeds

```lua
recipe Put Tomato Seeds in Packet           /* Recipe to repack seeds */
{
    TomatoSeed=50,                          /* Requires 50 seeds (consumed) */

    Result:TomatoBagSeed,                   /* Produces seed packet */
    Time:10.0,                              /* Takes 10 time units (faster than opening) */
    Category:Farming,                       /* Shows in Farming crafting tab */
}
```

**Why repacking exists:** Players can consolidate loose seeds found in different containers back into tidy packets.

### Make Mildew Cure

```lua
recipe Make Mildew Cure                     /* Recipe for plant disease treatment */
{
    GardeningSprayEmpty,                    /* Requires empty spray bottle (consumed) */
    [Recipe.GetItemTypes.Milk],             /* Requires any milk item (consumed) */

    Result:GardeningSprayMilk,              /* Produces mildew spray */
    Time:40.0,                              /* Takes 40 time units */
    Category:Farming,                       /* Shows in Farming crafting tab */
    NeedToBeLearn:true,                     /* Must read recipe/magazine first */
    AllowRottenItem:true,                   /* Rotten milk works (it's a spray!) */
    OnTest:Recipe.OnTest.WholeMilk,         /* Validation: must be whole milk */
}
```

**OnTest function:** Ensures player is using whole milk, not skim or other variants.

### Make Insecticide Spray

```lua
recipe Make Flies Cure                      /* Recipe for insect repellent */
{
    GardeningSprayEmpty,                    /* Requires empty spray bottle (consumed) */
    Water=3,                                /* Requires 3 units of water (consumed) */
    Cigarettes=5,                           /* Requires 5 cigarettes (consumed) */

    Result:GardeningSprayCigarettes,        /* Produces insecticide spray */
    Time:40.0,                              /* Takes 40 time units */
    Category:Farming,                       /* Shows in Farming crafting tab */
    NeedToBeLearn:true,                     /* Must read recipe/magazine first */
}
```

**Cigarettes as insecticide:** Based on real gardening technique - nicotine is a natural pesticide.

### Smithing Recipes

```lua
recipe Make Shovel                          /* Craft full-size shovel */
{
    IronIngot=90,                           /* Requires 90 iron ingots (consumed) */
    Handle,                                 /* Requires wooden handle (consumed) */
    keep [Recipe.GetItemTypes.Hammer],      /* Requires hammer (NOT consumed) */
    keep Tongs,                             /* Requires tongs (NOT consumed) */

    NearItem:Anvil,                         /* Must be near anvil */
    Result:Shovel,                          /* Produces shovel */
    Time:200.0,                             /* Takes 200 time units (long!) */
    Category:Smithing,                      /* Shows in Smithing crafting tab */
    SkillRequired:Blacksmith=6,             /* Requires Blacksmith skill level 6 */
    OnGiveXP:Recipe.OnGiveXP.Blacksmith25,  /* Gives 25 Blacksmith XP */
    NeedToBeLearn:true,                     /* Must read smithing book */
}

recipe Make Hand Shovel                     /* Craft trowel/hand shovel */
{
    IronIngot=50,                           /* Requires 50 iron ingots (less than full shovel) */
    keep [Recipe.GetItemTypes.Hammer],      /* Requires hammer (NOT consumed) */
    keep Tongs,                             /* Requires tongs (NOT consumed) */

    NearItem:Anvil,                         /* Must be near anvil */
    Result:HandShovel,                      /* Produces trowel */
    Time:200.0,                             /* Same time as full shovel */
    Category:Smithing,                      /* Shows in Smithing crafting tab */
    SkillRequired:Blacksmith=6,             /* Requires Blacksmith skill level 6 */
    OnGiveXP:Recipe.OnGiveXP.Blacksmith20,  /* Gives 20 Blacksmith XP (less than shovel) */
    NeedToBeLearn:true,                     /* Must read smithing book */
}
```

**Material differences:** Full shovel needs 90 ingots + handle, trowel only needs 50 ingots (smaller tool).

---

## Creating Custom Crops

Want to add your own vegetables? Here's the complete pattern.

### Custom Vegetable

```lua
module MyMod                                /* Your mod's module */
{
    imports { Base farming }                /* Import Base and farming modules */

    item CustomVegetable                    /* Your new crop */
    {
        DisplayCategory = Food,             /* Shows in Food category */
        Type = Food,                        /* This is a food item */
        DisplayName = Custom Vegetable,     /* Name shown to player */
        Icon = CustomVegIcon,               /* Your custom icon file */
        Weight = 0.2,                       /* Weight in inventory */

        /* Nutrition values */
        HungerChange = -15,                 /* How filling it is */
        ThirstChange = -5,                  /* How juicy it is */
        Calories = 25,                      /* Calorie content */
        Carbohydrates = 5,                  /* Carbs in grams */
        Proteins = 2,                       /* Protein in grams */
        Lipids = 0.1,                       /* Fats in grams */

        /* Freshness timers */
        DaysFresh = 5,                      /* Stays fresh for 5 days */
        DaysTotallyRotten = 10,             /* Rotten after 10 days */

        /* Cooking integration */
        EvolvedRecipe = Soup:15;Stew:15;Salad:8,  /* Can be used in these recipes */
        FoodType = Vegetables,              /* Recipe category */

        /* 3D model */
        WorldStaticModel = CustomVeg_Ground, /* Model when dropped */
    }
}
```

**Balance tip:** Compare your nutrition values to similar vanilla vegetables. A custom root vegetable should match potato stats, a leafy green should match cabbage.

### Custom Seeds

```lua
module MyMod                                /* Your mod's module */
{
    imports { Base }                        /* Import Base module */

    item CustomVegSeed                      /* Individual seed */
    {
        DisplayCategory = Gardening,        /* Shows in Gardening category */
        Type = Normal,                      /* Basic item */
        DisplayName = Custom Vegetable Seeds, /* Name shown to player */
        Icon = CustomSeedIcon,              /* Your seed icon */
        Weight = 0.009,                     /* Standard seed weight */
        SurvivalGear = TRUE,                /* Mark as survival item */
    }

    item CustomVegBagSeed                   /* Seed packet */
    {
        DisplayCategory = Gardening,        /* Shows in Gardening category */
        Type = Normal,                      /* Basic item */
        DisplayName = Custom Vegetable Seeds Packet, /* Packet name */
        Icon = CustomSeedBagIcon,           /* Your packet icon */
        Weight = 0.1,                       /* Standard packet weight */
        SurvivalGear = TRUE,                /* Mark as survival item */
    }

    recipe Open Packet of Custom Seeds      /* Recipe to open packet */
    {
        CustomVegBagSeed,                   /* Requires your seed packet */

        Result:CustomVegSeed=50,            /* Produces 50 seeds (standard amount) */
        Time:20.0,                          /* Standard opening time */
        Category:Farming,                   /* Shows in Farming tab */
        Sound:OpenSeedPacket,               /* Use vanilla sound effect */
    }
}
```

**Complete pattern:** For a fully-integrated custom crop you need:
1. The crop item (vegetable itself)
2. Individual seed item
3. Seed packet item
4. Recipe to open packet
5. (Optional) Recipe to repack seeds
6. (Optional) Lua code to define growing behavior

---

## Food Processing Items

### Bacon Processing

```lua
item Bacon                                  /* Raw bacon slab */
{
    DisplayCategory = Food,                 /* Shows in Food category */
    Type = Food,                            /* This is a food item */
    DisplayName = Bacon,                    /* Name shown to player */
    Icon = Bacon,                           /* Icon file */
    Weight = 0.3,                           /* Weight in inventory */
    IsCookable = true,                      /* Can be cooked */
    MinutesToCook = 20,                     /* Cooks in 20 minutes */
    MinutesToBurn = 50,                     /* Burns after 50 minutes */
    HungerChange = -12,                     /* How filling it is */
    DaysFresh = 3,                          /* Fresh for 3 days */
    DaysTotallyRotten = 5,                  /* Rotten after 5 days */
    DangerousUncooked = true,               /* MUST be cooked (food poisoning!) */
    EvolvedRecipe = Pizza:12;Stew:12;Sandwich:12|Cooked, /* Must be cooked for recipes */
    FoodType = Bacon,                       /* Special bacon food type */
    GoodHot = true,                         /* Tastes better when hot */
    BadCold = true,                         /* Tastes worse when cold */
    Packaged = TRUE,                        /* Comes in packaging */
}

item BaconRashers                           /* Sliced bacon strips */
{
    /* ... similar properties to Bacon ... */
}

item BaconBits                              /* Diced bacon pieces */
{
    /* ... similar properties but smaller portions ... */
}

recipe Get Bacon Rashers                    /* Slice bacon into strips */
{
    keep [Recipe.GetItemTypes.SharpKnife],  /* Requires knife (NOT consumed) */
    Bacon,                                  /* Requires bacon slab (consumed) */

    Result:BaconRashers=4,                  /* Produces 4 strips */
    Time:10.0,                              /* Takes 10 time units */
    Category:Cooking,                       /* Shows in Cooking tab */
}

recipe Get Bacon Bits                       /* Dice bacon strips into bits */
{
    keep [Recipe.GetItemTypes.SharpKnife],  /* Requires knife (NOT consumed) */
    BaconRashers,                           /* Requires bacon strips (consumed) */

    Result:BaconBits=4,                     /* Produces 4 portions of bits */
    Time:10.0,                              /* Takes 10 time units */
    Category:Cooking,                       /* Shows in Cooking tab */
}
```

**Processing chain:** Bacon Slab → Bacon Rashers → Bacon Bits. Each step makes smaller portions for different recipes.

---

## Condiments

### Mayonnaise

```lua
item MayonnaiseFull                         /* Full mayo jar */
{
    DisplayCategory = Food,                 /* Shows in Food category */
    Type = Food,                            /* Food item (though nobody eats pure mayo...) */
    DisplayName = Mayonnaise,               /* Name shown to player */
    Weight = 0.5,                           /* Half an inventory unit */
    HungerChange = -30,                     /* Very filling (pure fat!) */
    BoredomChange = 10,                     /* Increases boredom (ugh, plain mayo) */
    UnhappyChange = 5,                      /* Makes player unhappy (who eats mayo alone?) */
    DaysFresh = 10,                         /* Lasts 10 days fresh */
    DaysTotallyRotten = 13,                 /* Rotten after 13 days */
    ReplaceOnUse = MayonnaiseEmpty,         /* Becomes empty jar when used up */
    EvolvedRecipe = Sandwich:2;Burger:2;Salad:2, /* Works in these recipes */
    Spice = true,                           /* This is a condiment/spice */
    Packaged = TRUE,                        /* Comes in packaging */
    EatType = candrink,                     /* Animation type (drink from jar) */
    FoodType = NoExplicit,                  /* No specific food category */
}

item MayonnaiseEmpty                        /* Empty mayo jar */
{
    DisplayCategory = WaterContainer,       /* Shows in Water Container category */
    Type = Normal,                          /* Basic item */
    DisplayName = Empty Bottle,             /* Generic name (just a glass jar) */
    Weight = 0.1,                           /* Light when empty */
    ReplaceOnUseOn = WaterSource-MayonnaiseWaterFull, /* Becomes water jar when filled */
    CanStoreWater = true,                   /* Can hold water after mayo is gone */
}
```

**Condiment pattern:** Condiments have `Spice = true` and low EvolvedRecipe values (they're additions, not main ingredients).

---

## Important Tags

These tags give items special behaviors in the farming system:

| Tag | Purpose | Example |
|-----|----------|---------|
| `SurvivalGear` | Marks item as essential | `SurvivalGear = TRUE,` |
| `CanStoreWater` | Can hold water | `CanStoreWater = true,` |
| `RainFactor` | Collects rain (0.0-1.0) | `RainFactor = 0.2,` |
| `DigPlow` | Can plow ground | `Tags = DigPlow,` |
| `TakeDirt` | Can collect dirt | `Tags = TakeDirt,` |
| `ClearAshes` | Can clear fire remains | `Tags = ClearAshes,` |

**Multiple tags:** Use semicolon to combine: `Tags = ClearAshes;DigPlow;TakeDirt,`

**RainFactor values:**
- `0.0` - Collects no rain
- `0.2` - Collects 20% of rainfall (watering can)
- `1.0` - Collects 100% of rainfall (large containers)

---

## Common Mistakes

### 1. Forgetting FoodType on Crops

**Problem:** Custom vegetable doesn't work in any recipes.

**Wrong:**
```lua
item CustomVegetable
{
    Type = Food,
    HungerChange = -15,
    /* Missing FoodType! */
}
```

**Right:**
```lua
item CustomVegetable
{
    Type = Food,
    HungerChange = -15,
    FoodType = Vegetables,              /* Now recipes can use it */
    EvolvedRecipe = Soup:12;Stew:12,    /* Define recipe compatibility */
}
```

**Why it matters:** Without FoodType, evolved recipes don't know this is a vegetable and won't accept it as an ingredient.

### 2. Mismatched Seed Packet Recipes

**Problem:** Seed packet produces wrong number of seeds or references wrong items.

**Wrong:**
```lua
item CustomVegSeed { /* ... */ }
item CustomVegBagSeed { /* ... */ }

recipe Open Packet of Custom Seeds
{
    CustomVegBagSeed,
    Result:CustomVegSeed=5,             /* Only 5 seeds? Players will hate this */
}
```

**Right:**
```lua
item CustomVegSeed { /* ... */ }
item CustomVegBagSeed { /* ... */ }

recipe Open Packet of Custom Seeds
{
    CustomVegBagSeed,
    Result:CustomVegSeed=50,            /* Standard amount is 50 */
    Time:20.0,                          /* Standard opening time */
    Category:Farming,                   /* Shows in Farming tab */
    Sound:OpenSeedPacket,               /* Use vanilla sound */
}
```

**Standard:** All vanilla seed packets contain 50 seeds. Match this for consistency.

### 3. Incorrect Water Container Properties

**Problem:** Empty container can't be filled with water.

**Wrong:**
```lua
item CustomCanEmpty
{
    Type = Normal,
    /* Missing CanStoreWater and ReplaceOnUseOn! */
}
```

**Right:**
```lua
item CustomCanEmpty
{
    Type = Normal,
    CanStoreWater = true,                       /* Mark as water container */
    ReplaceOnUseOn = WaterSource-CustomCanFull, /* Becomes full version when filled */
}

item CustomCanFull
{
    Type = Drainable,                           /* Can be gradually used */
    IsWaterSource = true,                       /* Can be used as water */
    ReplaceOnDeplete = CustomCanEmpty,          /* Becomes empty when used up */
}
```

**Pattern:** Water containers need empty/full versions linked with ReplaceOnUseOn and ReplaceOnDeplete.

### 4. Tool Without Proper Tags

**Problem:** Trowel or shovel doesn't work for gardening actions.

**Wrong:**
```lua
item CustomTrowel
{
    Type = Normal,
    /* Missing Tags! */
}
```

**Right:**
```lua
item CustomTrowel
{
    Type = Weapon,                      /* Make it a weapon (can be equipped) */
    Tags = DigPlow;TakeDirt;ClearAshes, /* Add all gardening functions */
    SurvivalGear = TRUE,                /* Mark as survival item */
}
```

**Required tags for gardening tools:**
- `DigPlow` - Required to plow ground for planting
- `TakeDirt` - Required to collect dirt
- `ClearAshes` - Required to clear burnt remains

### 5. Unrealistic Spoilage Times

**Problem:** Crop freshness doesn't match its type.

**Wrong:**
```lua
item CustomTomato
{
    Type = Food,
    DaysFresh = 30,                     /* Tomatoes last 30 days?? */
    DaysTotallyRotten = 60,             /* Too long */
}
```

**Right:**
```lua
item CustomTomato
{
    Type = Food,
    DaysFresh = 4,                      /* Fresh for 4 days (like vanilla tomatoes) */
    DaysTotallyRotten = 12,             /* Fully rotten after 12 days */
}
```

**Balance guide:**
- **Leafy greens** (cabbage, lettuce): 2-4 days fresh
- **Fruits/juicy vegetables** (tomatoes, strawberries): 3-5 days fresh
- **Root vegetables** (potatoes, carrots): 7-14 days fresh
- **Processed foods** (bacon, preserves): 3-10 days fresh

---

## Try It Yourself

### Exercise 1: Create a Custom Herb

Create a basil herb with these requirements:
- Weighs 0.05 units (light!)
- Reduces hunger by 5 (small)
- Stays fresh for 2 days
- Works in Pizza:8, Soup:8, Salad:6
- FoodType = Herbs

<details>
<summary>Solution</summary>

```lua
module MyMod
{
    imports { Base }

    item Basil
    {
        DisplayCategory = Food,
        Type = Food,
        DisplayName = Basil,
        Icon = BasilIcon,
        Weight = 0.05,

        HungerChange = -5,
        ThirstChange = -2,
        Calories = 8,

        DaysFresh = 2,
        DaysTotallyRotten = 5,

        EvolvedRecipe = Pizza:8;Soup:8;Salad:6,
        FoodType = Herbs,

        WorldStaticModel = Herb_Ground,
    }

    item BasilSeed
    {
        DisplayCategory = Gardening,
        Type = Normal,
        DisplayName = Basil Seeds,
        Icon = BasilSeedIcon,
        Weight = 0.009,
        SurvivalGear = TRUE,
    }
}
```

**Key points:**
- Herbs are lightweight (0.05)
- Short freshness (2 days)
- Low hunger value (herbs are seasoning, not meals)
- FoodType = Herbs (separate from Vegetables)
</details>

### Exercise 2: Create a Fertilizer Recipe

Create a recipe that combines compost and water to make fertilizer spray:
- Uses empty spray bottle
- Requires compost item (consumed)
- Requires 2 units of water (consumed)
- Produces fertilizer spray
- Takes 30 time units
- Requires reading recipe first

<details>
<summary>Solution</summary>

```lua
module MyMod
{
    imports { Base farming }

    item FertilizerSpray
    {
        DisplayCategory = Gardening,
        Type = Drainable,
        DisplayName = Fertilizer Spray,
        Icon = TZ_GardeningSprayCan,
        Weight = 1.0,
        UseDelta = 0.1,
        ReplaceOnDeplete = GardeningSprayEmpty,
        UseWhileEquipped = false,
    }

    recipe Make Fertilizer Spray
    {
        GardeningSprayEmpty,
        Compost,
        Water=2,

        Result:FertilizerSpray,
        Time:30.0,
        Category:Farming,
        NeedToBeLearn:true,
    }
}
```

**Pattern follows:** Mildew spray and insecticide spray recipes.
</details>

### Exercise 3: Create a Root Vegetable

Create a turnip with:
- Weighs 0.3 units
- Reduces hunger by 15
- Fresh for 10 days, rotten after 20 days
- Works in Soup:12, Stew:15
- FoodType = Vegetables
- Create matching seeds (individual + packet + open recipe)

<details>
<summary>Solution</summary>

```lua
module MyMod
{
    imports { Base farming }

    item Turnip
    {
        DisplayCategory = Food,
        Type = Food,
        DisplayName = Turnip,
        Icon = TurnipIcon,
        Weight = 0.3,

        HungerChange = -15,
        ThirstChange = -3,
        Calories = 28,
        Carbohydrates = 6,
        Proteins = 1,
        Lipids = 0.1,

        DaysFresh = 10,
        DaysTotallyRotten = 20,

        EvolvedRecipe = Soup:12;Stew:15,
        FoodType = Vegetables,

        WorldStaticModel = Turnip_Ground,
    }

    item TurnipSeed
    {
        DisplayCategory = Gardening,
        Type = Normal,
        DisplayName = Turnip Seeds,
        Icon = TurnipSeedIcon,
        Weight = 0.009,
        SurvivalGear = TRUE,
    }

    item TurnipBagSeed
    {
        DisplayCategory = Gardening,
        Type = Normal,
        DisplayName = Turnip Seeds Packet,
        Icon = TurnipSeedBagIcon,
        Weight = 0.1,
        SurvivalGear = TRUE,
    }

    recipe Open Packet of Turnip Seeds
    {
        TurnipBagSeed,

        Result:TurnipSeed=50,
        Time:20.0,
        Category:Farming,
        Sound:OpenSeedPacket,
    }
}
```

**Key points:**
- Root vegetables last longer (10/20 days vs tomato's 4/12)
- Lower ThirstChange (not juicy)
- Complete seed system (individual + packet + recipe)
</details>

---

## Best Practices

### 1. Follow Vanilla Naming Conventions

**Use consistent naming patterns:**
- Crops: `Tomato`, `Potato`, `CustomVegetable`
- Seeds: `TomatoSeed`, `CustomVegetableSeed`
- Seed packets: `TomatoBagSeed`, `CustomVegetableBagSeed`
- Tools: `HandShovel`, `WateredCan`, `GardeningSprayEmpty`

### 2. Balance Nutrition Against Vanilla

**Compare your crops to similar vanilla vegetables:**
- Leafy greens: Compare to cabbage (-24 hunger)
- Root vegetables: Compare to potato (-18 hunger) or carrot (-10 hunger)
- Fruits: Compare to strawberry (-5 hunger)

**Don't make super-crops:** A single vegetable shouldn't be more filling than an entire potato.

### 3. Match Spoilage to Food Type

**Freshness guidelines:**
- **2-4 days**: Leafy greens, berries, juicy vegetables
- **5-7 days**: Medium vegetables, processed foods
- **7-14 days**: Root vegetables, hard vegetables
- **10+ days**: Preserved foods, condiments

**Rule of thumb:** DaysTotallyRotten should be 2-3x DaysFresh.

### 4. Use Standard Seed Packet Amounts

**Always use 50 seeds per packet:**
```lua
Result:CustomVegSeed=50,                /* Standard amount */
```

Players expect consistency. Don't make some packets contain 20 seeds and others 100.

### 5. Integrate with Evolved Recipes

**Define recipe compatibility:**
```lua
EvolvedRecipe = Soup:12;Stew:12;Salad:8,   /* Works in these recipes */
FoodType = Vegetables,                      /* Category for matching */
```

This makes your crops feel integrated with the vanilla game.

### 6. Tag Tools Completely

**Don't forget tool tags:**
```lua
Tags = ClearAshes;DigPlow;TakeDirt,         /* All gardening functions */
SurvivalGear = TRUE,                        /* Marks as essential */
```

### 7. Create Complete Item Chains

**For crops, create the full chain:**
1. Crop item (vegetable)
2. Individual seed
3. Seed packet
4. Open packet recipe
5. Repack seeds recipe (optional but nice)

Missing links make the system feel incomplete.

---

## Key Takeaways

1. **Farming scripts define items** - Crops, seeds, tools, and recipes are all defined in scripts, not Lua
2. **Follow the vanilla pattern** - Individual seeds + seed packets + open/close recipes
3. **Tools need Tags** - DigPlow, TakeDirt, ClearAshes make tools functional
4. **FoodType is essential** - Without it, crops won't work in evolved recipes
5. **Balance freshness times** - Match spoilage rates to food type (leafy vs root vegetables)
6. **Water containers need pairs** - Empty and full versions linked by ReplaceOnUseOn/ReplaceOnDeplete
7. **Standard is 50 seeds per packet** - Keep packet amounts consistent with vanilla
8. **Complete the chain** - Create all related items (crop, seed, packet, recipes) for full integration

---

## Related

- [Script Properties](/build-41/modding/reference/script-properties) - Item and recipe properties
- [Recipe Basics](/build-41/modding/recipes/recipe-basics) - Recipe creation fundamentals
- [Vanilla Recipe Anatomy](/build-41/modding/recipes/vanilla-recipe-anatomy) - Complete recipe parameter reference
