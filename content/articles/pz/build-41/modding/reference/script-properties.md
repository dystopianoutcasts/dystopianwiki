---
id: reference-script-properties
slug: script-properties
title: "Script Properties Reference"
game: pz
version: build-41
section: modding
category: reference
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - items
  - recipes
  - scripts
  - reference
  - properties
excerpt: "Complete reference of all script properties for items, recipes, weapons, and food in Project Zomboid Build 41."
table_of_contents:
  - text: "What Are Script Properties?"
    link: "#what-are-script-properties"
  - text: "Overview"
    link: "#overview"
  - text: "Script File Locations"
    link: "#script-file-locations"
  - text: "Item Properties"
    link: "#item-properties"
  - text: "Food Item Properties"
    link: "#food-item-properties"
  - text: "Weapon Item Properties"
    link: "#weapon-item-properties"
  - text: "Drainable Item Properties"
    link: "#drainable-item-properties"
  - text: "Container Properties"
    link: "#container-properties"
  - text: "Medical Item Properties"
    link: "#medical-item-properties"
  - text: "Misc Item Properties"
    link: "#misc-item-properties"
  - text: "Recipe Properties"
    link: "#recipe-properties"
  - text: "Ingredient Syntax"
    link: "#ingredient-syntax"
  - text: "Complete Item Example"
    link: "#complete-item-example"
  - text: "Complete Recipe Example"
    link: "#complete-recipe-example"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Best Practices"
    link: "#best-practices"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "Syntax Rules"
    link: "#syntax-rules"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-09
---

# Script Properties Reference

## What Are Script Properties?

You know when you define an item and write `Weight = 0.5,` or `HungerChange = -10,`? Those are **script properties** - the attributes that define how items and recipes behave in the game.

**Script properties are your item/recipe configuration language.** Every item in Project Zomboid - from hammers to hamburgers - is defined by script properties. Want a heavier weapon? Change `Weight`. Want food to last longer? Adjust `DaysFresh`. Properties are how you tell the game what your content does.

When I first started creating items, I was overwhelmed by the property lists. "What's the difference between `MinDamage` and `MaxDamage`? What does `UseDelta` mean? Do I need `WorldStaticModel` AND `StaticModel`?" I spent hours digging through vanilla scripts trying to understand what each property did. That's why this reference exists - to answer those questions in one place.

This is your complete property reference. Use it to understand what each property does, what values it accepts, and how to use it correctly.

---

## Overview

This reference documents all properties available in PZ script files (`.txt` files in `media/scripts/`). Scripts define items, recipes, vehicles, and other game content.

**What script properties control:**
- **Item behavior** - Weight, type, display name, icon
- **Food properties** - Nutrition, spoilage, cooking
- **Weapon stats** - Damage, durability, swing speed
- **Recipe requirements** - Ingredients, time, skills needed
- **Special features** - Containers, drainables, medical items

**How to use this reference:** This is organized by property category (food, weapons, etc.). Find your item type, then look up the properties you need.

---

## Script File Locations

```
media/scripts/
├── items.txt              # General items
├── items_food.txt         # Food items
├── items_weapons.txt      # Weapons
├── items_radio.txt        # Radio items
├── items_literature.txt   # Books, magazines
├── recipes.txt            # Crafting recipes
├── recipes_radio.txt      # Radio recipes
├── evolvedrecipes.txt     # Evolved recipes (cooking)
├── farming.txt            # Farming definitions
├── fixing.txt             # Repair definitions
├── vehicles/              # Vehicle definitions
└── clothing/              # Clothing definitions
```

**Organization tip:** You can define items in any `.txt` file, but organize by category for clarity.

---

## Item Properties

### Basic Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `Type` | string | Item category (required) | `Type = Food,` |
| `DisplayName` | string | In-game name shown to player | `DisplayName = Energy Bar,` |
| `DisplayCategory` | string | Inventory category | `DisplayCategory = Food,` |
| `Icon` | string | Texture name (no extension) | `Icon = Chocolate,` |
| `Weight` | float | Item weight | `Weight = 0.1,` |
| `Count` | int | Stack count when spawned | `Count = 5,` |
| `Tooltip` | string | Hover tooltip key | `Tooltip = Tooltip_food,` |

**Type is required** - Every item must have a Type property. It determines how the game handles the item.

### Item Types

```lua
Type = Normal,       -- Standard item
Type = Food,         -- Edible item (can be eaten)
Type = Weapon,       -- Melee weapon (can attack)
Type = Drainable,    -- Has uses (e.g., lighter, bottle)
Type = Clothing,     -- Wearable (goes in clothing slots)
Type = Container,    -- Can hold items (bag, backpack)
Type = Literature,   -- Readable (book, magazine)
Type = Key,          -- Key item (unlocks doors)
Type = KeyRing,      -- Key ring (holds keys)
Type = Map,          -- Map item
Type = Moveable,     -- Can be picked up/placed (furniture)
Type = Radio,        -- Radio device
Type = AlarmClock,   -- Alarm clock
Type = AlarmClockClothing, -- Wearable alarm (watch)
```

**Choosing Type:** The Type determines what properties are available and how the item works. Food items get nutrition properties, Weapons get damage properties, etc.

### Display Categories

```lua
DisplayCategory = Food,
DisplayCategory = Cooking,
DisplayCategory = WaterContainer,
DisplayCategory = Weapon,
DisplayCategory = Ammo,
DisplayCategory = Clothing,
DisplayCategory = Material,
DisplayCategory = Tool,
DisplayCategory = FirstAid,
DisplayCategory = Household,
DisplayCategory = Junk,
DisplayCategory = Literature,
DisplayCategory = Skill,
DisplayCategory = Item,
```

**DisplayCategory vs Type:** Type determines behavior, DisplayCategory determines which inventory tab the item appears in.

---

## Food Item Properties

### Nutrition

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `HungerChange` | float | Hunger reduction (negative reduces) | `HungerChange = -15,` |
| `ThirstChange` | float | Thirst reduction | `ThirstChange = -5,` |
| `Calories` | int | Caloric content | `Calories = 250,` |
| `Carbohydrates` | float | Carb content | `Carbohydrates = 35,` |
| `Proteins` | float | Protein content | `Proteins = 5,` |
| `Lipids` | float | Fat content | `Lipids = 10,` |

**Negative values reduce hunger/thirst** - This is counterintuitive! `HungerChange = -10` means eating reduces hunger by 10 (makes you less hungry).

### Mood Effects

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `UnhappyChange` | float | Unhappiness change (negative = better) | `UnhappyChange = -10,` |
| `StressChange` | float | Stress change | `StressChange = -5,` |
| `FatigueChange` | float | Fatigue change | `FatigueChange = -10,` |
| `EnduranceChange` | float | Endurance change | `EnduranceChange = 5,` |

**Tasty food reduces unhappiness** - `UnhappyChange = -10` makes player happier (reduces unhappiness).

### Spoilage

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `DaysFresh` | int | Days until starts rotting | `DaysFresh = 7,` |
| `DaysTotallyRotten` | int | Days until completely rotten | `DaysTotallyRotten = 14,` |
| `ReplaceOnRotten` | string | Item to become when rotten | `ReplaceOnRotten = Base.RottingFood,` |

**Freshness timeline:** DaysFresh = fresh period, DaysTotallyRotten = when it becomes inedible. The gap between them is the "stale but edible" period.

### Cooking

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `IsCookable` | bool | Can be cooked | `IsCookable = TRUE,` |
| `MinutesToCook` | int | Cooking time | `MinutesToCook = 20,` |
| `MinutesToBurn` | int | Time to burn after cooked | `MinutesToBurn = 60,` |
| `ReplaceOnCooked` | string | Item after cooking | `ReplaceOnCooked = Base.CookedSteak,` |
| `GoodHot` | bool | Tastes better when hot | `GoodHot = TRUE,` |
| `BadCold` | bool | Tastes bad when cold | `BadCold = TRUE,` |
| `BadInMicrowave` | bool | Shouldn't microwave | `BadInMicrowave = TRUE,` |
| `CannedFood` | bool | Is canned (needs opening) | `CannedFood = TRUE,` |

**Cooking chain:** IsCookable + MinutesToCook + ReplaceOnCooked = raw item becomes cooked item after cooking time.

### Special Food Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `Alcoholic` | bool | Contains alcohol | `Alcoholic = TRUE,` |
| `AlcoholPower` | float | Alcohol strength | `AlcoholPower = 5,` |
| `Spice` | bool | Is a spice | `Spice = TRUE,` |
| `Poison` | bool | Is poisonous | `Poison = TRUE,` |
| `PoisonPower` | float | Poison strength | `PoisonPower = 25,` |
| `PoisonDetectionLevel` | int | Skill to detect poison | `PoisonDetectionLevel = 3,` |
| `DangerousUncooked` | bool | Dangerous if raw | `DangerousUncooked = TRUE,` |

**DangerousUncooked:** Used for raw meat that causes food poisoning if eaten uncooked.

### Evolved Recipes

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `EvolvedRecipe` | string | Evolved recipe type | `EvolvedRecipe = Base.Stew:5;Base.Soup:5,` |
| `EvolvedRecipeName` | string | Display name in recipe | `EvolvedRecipeName = Potato,` |
| `FoodType` | string | Food category | `FoodType = Vegetables,` |

**EvolvedRecipe syntax:** `RecipeName:Value;OtherRecipe:Value` - defines which recipes can use this ingredient and how much it adds.

---

## Weapon Item Properties

### Damage

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `MinDamage` | float | Minimum damage | `MinDamage = 0.3,` |
| `MaxDamage` | float | Maximum damage | `MaxDamage = 0.8,` |
| `CriticalChance` | float | Crit chance (0-100) | `CriticalChance = 25,` |
| `CritDmgMultiplier` | float | Critical damage multiplier | `CritDmgMultiplier = 2,` |
| `DoorDamage` | int | Damage to doors | `DoorDamage = 15,` |
| `TreeDamage` | int | Damage to trees | `TreeDamage = 5,` |

**Damage range:** Each hit deals random damage between MinDamage and MaxDamage.

### Combat

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `HitChance` | int | Base hit chance | `HitChance = 30,` |
| `ToHitModifier` | float | Hit chance modifier | `ToHitModifier = 1.2,` |
| `PushBackMod` | float | Knockback force | `PushBackMod = 0.5,` |
| `KnockdownMod` | float | Knockdown chance | `KnockdownMod = 2,` |
| `MaxHitCount` | int | Max enemies per swing | `MaxHitCount = 3,` |
| `EnduranceMod` | float | Stamina cost modifier | `EnduranceMod = 1.5,` |
| `UseEndurance` | bool | Uses stamina | `UseEndurance = TRUE,` |

**MaxHitCount:** How many zombies can be hit in one swing. 1 = single target, 3 = can hit up to 3 zombies.

### Animation

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `SwingAnim` | string | Swing animation | `SwingAnim = Bat,` |
| `SwingTime` | float | Swing duration | `SwingTime = 2.5,` |
| `MinimumSwingTime` | float | Fastest swing | `MinimumSwingTime = 2,` |
| `SwingAmountBeforeImpact` | float | Swing progress at hit | `SwingAmountBeforeImpact = 0.02,` |
| `IdleAnim` | string | Idle animation | `IdleAnim = Idle_Weapon2,` |
| `RunAnim` | string | Run animation | `RunAnim = Run_Weapon2,` |

**SwingTime:** Higher = slower weapon. Fast weapons = 2.0, slow weapons = 4.0+.

### Condition

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `ConditionMax` | int | Maximum durability | `ConditionMax = 15,` |
| `ConditionLowerChanceOneIn` | int | Break chance (1 in X) | `ConditionLowerChanceOneIn = 20,` |

**Durability:** ConditionMax = max condition, ConditionLowerChanceOneIn = chance to lose 1 condition per hit (1 in 20 = 5% chance).

### Sounds

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `SwingSound` | string | Swing sound | `SwingSound = SwingBlunt,` |
| `HitSound` | string | Hit sound | `HitSound = BaseballBatHit,` |
| `ImpactSound` | string | Impact sound | `ImpactSound = MetalHit,` |
| `BreakSound` | string | Break sound | `BreakSound = BreakWoodItem,` |
| `DoorHitSound` | string | Door hit sound | `DoorHitSound = HammerDoor,` |
| `HitFloorSound` | string | Ground hit sound | `HitFloorSound = MetalFloor,` |

### Ranged Weapon Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `AmmoType` | string | Ammunition type | `AmmoType = Base.Bullets9mm,` |
| `ClipSize` | int | Magazine capacity | `ClipSize = 15,` |
| `MaxAmmo` | int | Max ammo | `MaxAmmo = 15,` |
| `ReloadTime` | int | Reload duration | `ReloadTime = 25,` |
| `AimingTime` | int | Time to aim | `AimingTime = 15,` |
| `FireRange` | int | Max range in tiles | `FireRange = 15,` |
| `FirePower` | float | Base damage | `FirePower = 1.2,` |
| `MinRange` | float | Minimum range | `MinRange = 0.5,` |
| `MaxRange` | float | Maximum range | `MaxRange = 15,` |
| `IsAimedFirearm` | bool | Is aimed weapon | `IsAimedFirearm = TRUE,` |
| `JamGunChance` | float | Jam probability | `JamGunChance = 2,` |
| `SoundRadius` | int | Noise radius | `SoundRadius = 80,` |
| `SoundVolume` | int | Sound volume | `SoundVolume = 80,` |
| `StopPower` | float | Stopping power | `StopPower = 1.5,` |
| `PiercingBullets` | bool | Bullets pierce | `PiercingBullets = TRUE,` |

**Firearms:** Require `IsAimedFirearm = TRUE` and proper ammo type to function.

---

## Drainable Item Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `UseDelta` | float | Amount used per use (0-1) | `UseDelta = 0.1,` |
| `UseWhileEquipped` | bool | Drains while held | `UseWhileEquipped = FALSE,` |
| `ReplaceOnDeplete` | string | Item when empty | `ReplaceOnDeplete = Base.EmptyJar,` |
| `ConsolidateOption` | string | Merge context option | `ConsolidateOption = ContextMenu_Merge,` |

**UseDelta:** 0.1 = 10% used per action (10 uses total), 0.05 = 20 uses total.

**Drainable items:** Water bottles, lighters, generators - anything with "charges" or "uses".

---

## Container Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `Capacity` | int | Storage capacity | `Capacity = 20,` |
| `WeightReduction` | int | Weight reduction % | `WeightReduction = 70,` |
| `CanStoreWater` | bool | Can hold water | `CanStoreWater = TRUE,` |
| `RainFactor` | float | Rain collection rate | `RainFactor = 0.5,` |

**WeightReduction:** 70 = items in this container weigh 70% less. Backpacks typically have 70-80% reduction.

**RainFactor:** 0.5 = collects 50% of rainfall when placed outside.

---

## Medical Item Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `Medical` | bool | Is medical item | `Medical = TRUE,` |
| `BandagePower` | float | Bandage effectiveness | `BandagePower = 2,` |
| `CanBandage` | bool | Can bandage wounds | `CanBandage = TRUE,` |
| `PainReduction` | float | Pain reduction | `PainReduction = 50,` |
| `FluReduction` | float | Cold reduction | `FluReduction = 5,` |
| `ReduceFoodSickness` | int | Food sickness reduction | `ReduceFoodSickness = 50,` |

**Medical items:** Require `Medical = TRUE` to work with health system.

---

## Misc Item Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `WorldStaticModel` | string | 3D model when placed | `WorldStaticModel = Hammer,` |
| `StaticModel` | string | Inventory 3D model | `StaticModel = Hammer,` |
| `MetalValue` | int | Metal scrap value | `MetalValue = 20,` |
| `SurvivalGear` | bool | Essential survival item | `SurvivalGear = TRUE,` |
| `AlwaysWelcomeGift` | bool | Good for gifting | `AlwaysWelcomeGift = TRUE,` |
| `Tags` | string | Item tags | `Tags = HasMetal;SewingNeedle,` |
| `OBSOLETE` | bool | Mark item as obsolete | `OBSOLETE = TRUE,` |

**Tags:** Semicolon-separated list used for recipes and game logic. Example: `Tags = SharpKnife;CanOpenCans`

### Wet Item Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `Wet` | bool | Item is wet | `Wet = TRUE,` |
| `WetCooldown` | int | Ticks to dry | `WetCooldown = 8000,` |
| `ItemWhenDry` | string | Item when dried | `ItemWhenDry = Base.DishCloth,` |

### Light Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `LightStrength` | float | Light brightness | `LightStrength = 0.8,` |
| `LightDistance` | int | Light radius | `LightDistance = 10,` |
| `ActivatedItem` | bool | Can be turned on | `ActivatedItem = TRUE,` |

**Light items:** Flashlights, candles, lanterns - requires `ActivatedItem = TRUE` to toggle on/off.

### Replacement Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `ReplaceOnUse` | string | Replace after use | `ReplaceOnUse = Base.EmptyCan,` |
| `ReplaceOnUseOn` | string | Replace when used on | `ReplaceOnUseOn = WaterSource-WaterBowl,` |
| `DisappearOnUse` | bool | Delete after use | `DisappearOnUse = TRUE,` |

**ReplaceOnUseOn syntax:** `TargetType-ResultItem` - When used on water source, becomes water bowl.

---

## Recipe Properties

### Basic Recipe Structure

```lua
recipe Recipe Name {                        /* Name shown in crafting menu */
    Ingredient1,                            /* Required ingredient (consumed) */
    Ingredient2/Ingredient3,                /* Alternative ingredients (OR) */
    IngredientType=3,                       /* Required count of 3 */
    keep ToolItem,                          /* Tool not consumed */
    destroy DestroyItem,                    /* Item destroyed (not result) */

    Result:OutputItem,                      /* What is crafted */
    Result:OutputItem=3,                    /* Multiple outputs */
    Time:60.0,                              /* Crafting time */
    Category:Cooking,                       /* Recipe category */
}
```

### Core Recipe Properties

| Property | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `Result` | `Result:ItemID` | Crafted item | `Result:EnergyBar,` |
| `Time` | `Time:float` | Crafting duration | `Time:60.0,` |
| `Category` | `Category:name` | Recipe category | `Category:Cooking,` |

**Time units:** Time:60.0 = 60 time units (roughly 1-2 seconds in-game).

### Recipe Categories

```lua
Category:Cooking,
Category:Carpentry,
Category:Health,
Category:Survivalist,
Category:Metalworking,
Category:Tailoring,
Category:Electrical,
Category:Mechanics,
Category:Farming,
```

**Category determines crafting tab** - Recipes appear in the tab matching their category.

### Skill Requirements

| Property | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `SkillRequired` | `SkillRequired:Skill=Level` | Required skill | `SkillRequired:Cooking=3,` |
| `NeedToBeLearn` | `NeedToBeLearn:true` | Must learn recipe first | `NeedToBeLearn:true,` |

**NeedToBeLearn:** Recipe must be read from magazine/book before appearing.

### Callbacks

| Property | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `OnCreate` | `OnCreate:Function` | Called after crafting | `OnCreate:Recipe.OnCreate.Dismantle,` |
| `OnCanPerform` | `OnCanPerform:Function` | Checks if can craft | `OnCanPerform:Recipe.OnCanPerform.HasWater,` |
| `OnGiveXP` | `OnGiveXP:Function` | XP reward function | `OnGiveXP:Recipe.OnGiveXP.Cooking5,` |
| `OnTest` | `OnTest:Function` | Test function | `OnTest:Recipe.OnTest.IsRotten,` |

**Callbacks are optional** - Used for complex logic. Most recipes don't need them.

### Special Properties

| Property | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `Sound` | `Sound:name` | Crafting sound | `Sound:Hammering,` |
| `AnimNode` | `AnimNode:name` | Crafting animation | `AnimNode:SawLog,` |
| `Heat` | `Heat:float` | Heat source needed | `Heat:0.5,` |
| `NearItem` | `NearItem:ItemType` | Must be near item | `NearItem:Anvil,` |
| `InSameInventory` | `InSameInventory:true` | Items in same container | `InSameInventory:true,` |
| `CanBeDoneFromFloor` | `CanBeDoneFromFloor:true` | Can craft on ground | `CanBeDoneFromFloor:true,` |
| `StopOnWalk` | `StopOnWalk:true` | Stops if player moves | `StopOnWalk:true,` |

**Heat:** Requires heat source (campfire, oven, etc.). Heat:1.0 = max heat, Heat:0.5 = medium heat.

### Item State Properties

| Property | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `AllowRottenItem` | `AllowRottenItem:true` | Can use rotten items | `AllowRottenItem:true,` |
| `AllowFrozenItem` | `AllowFrozenItem:true` | Can use frozen items | `AllowFrozenItem:true,` |
| `AllowDestroyedItem` | `AllowDestroyedItem:true` | Can use destroyed items | `AllowDestroyedItem:true,` |
| `RemoveResultItem` | `RemoveResultItem:true` | Don't give result | `RemoveResultItem:true,` |

**AllowRottenItem:** Useful for composting or animal food recipes where rotten ingredients are acceptable.

### Tooltip

| Property | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `Tooltip` | `Tooltip:key` | Tooltip translation key | `Tooltip:Tooltip_Recipe_NeedsWater,` |

---

## Ingredient Syntax

### Basic Ingredients

```lua
Chocolate,                                  /* Single item required */
Chocolate/Nuts/Raisins,                     /* Any one of these (OR logic) */
Chocolate=3,                                /* Need 3 of item */
Base.Chocolate,                             /* Full module path */
```

**OR logic:** Slash separates alternatives. Player needs one of the listed items.

### Keep and Destroy

```lua
keep Hammer,                                /* Tool not consumed (stays in inventory) */
keep [Recipe.GetItemTypes.Hammer],          /* Any hammer-type (not consumed) */
destroy OldItem,                            /* Item destroyed (not returned as result) */
```

**keep keyword:** Marks tools that aren't consumed. Without `keep`, ingredients are consumed.

### Item Type Functions

```lua
[Recipe.GetItemTypes.Hammer]                /* Any hammer */
[Recipe.GetItemTypes.Saw]                   /* Any saw */
[Recipe.GetItemTypes.SharpKnife]            /* Any sharp knife */
[Recipe.GetItemTypes.Screwdriver]           /* Any screwdriver */
```

**GetItemTypes:** Accepts any item with matching tag. More flexible than specific item IDs.

---

## Complete Item Example

```lua
module Base {                               /* Module declaration */
    item EnergyBar {                        /* Item definition */
        Type = Food,                        /* This is food */
        DisplayName = Energy Bar,           /* Name shown to player */
        DisplayCategory = Food,             /* Shows in Food inventory tab */
        Icon = Chocolate,                   /* Icon to use (Chocolate.png) */
        Weight = 0.1,                       /* Light item */

        /* Nutrition values */
        HungerChange = -15,                 /* Reduces hunger by 15 */
        ThirstChange = -5,                  /* Reduces thirst by 5 */
        Calories = 250,                     /* 250 calories */
        Carbohydrates = 35,                 /* 35g carbs */
        Proteins = 5,                       /* 5g protein */
        Lipids = 10,                        /* 10g fat */

        /* Spoilage timing */
        DaysFresh = 60,                     /* Stays fresh 60 days */
        DaysTotallyRotten = 90,             /* Rotten after 90 days */

        /* Mood effects */
        UnhappyChange = -5,                 /* Reduces unhappiness */
        StressChange = -5,                  /* Reduces stress */

        /* Misc properties */
        Tooltip = Tooltip_food,             /* Tooltip translation key */
        WorldStaticModel = EnergyBar,       /* 3D model when dropped */
    }
}
```

---

## Complete Recipe Example

```lua
module Base {                               /* Module declaration */
    imports {                               /* Import other modules */
        Base                                /* We need Base module items */
    }

    recipe Make Energy Bar {                /* Recipe name */
        Chocolate,                          /* Requires chocolate (consumed) */
        Oats/Cereal,                        /* Requires oats OR cereal (consumed) */
        Honey,                              /* Requires honey (consumed) */
        keep [Recipe.GetItemTypes.SharpKnife],  /* Requires knife (NOT consumed) */

        Result:EnergyBar,                   /* Produces energy bar */
        Time:60.0,                          /* Takes 60 time units */
        Category:Cooking,                   /* Shows in Cooking tab */
        Sound:PrepareFood,                  /* Plays food prep sound */
        SkillRequired:Cooking=2,            /* Requires Cooking level 2 */
        OnGiveXP:Recipe.OnGiveXP.Cooking5,  /* Gives 5 Cooking XP */
    }
}
```

---

## Common Mistakes

### 1. Items Use = Instead of : for Properties

**Problem:** Using colon syntax in items (recipe syntax).

❌ **Wrong:**
```lua
item Hammer {
    Weight:0.5,                             /* Wrong! Items use = */
}
```

✅ **Right:**
```lua
item Hammer {
    Weight = 0.5,                           /* Right! Items use = */
}
```

**Rule:** Items use `=`, recipes use `:`.

---

### 2. Forgetting Commas

**Problem:** Missing trailing commas causes parse errors.

❌ **Wrong:**
```lua
item Hammer {
    Weight = 0.5                            /* Missing comma! */
    Type = Weapon                           /* This won't parse */
}
```

✅ **Right:**
```lua
item Hammer {
    Weight = 0.5,                           /* Has comma */
    Type = Weapon,                          /* Has comma */
}
```

**Rule:** Every property line ends with a comma.

---

### 3. Wrong Negative Signs for Food

**Problem:** Making food increase hunger instead of reduce it.

❌ **Wrong:**
```lua
item Apple {
    Type = Food,
    HungerChange = 10,                      /* Increases hunger (makes you hungrier!) */
}
```

✅ **Right:**
```lua
item Apple {
    Type = Food,
    HungerChange = -10,                     /* Reduces hunger (makes you less hungry) */
}
```

**Rule:** Negative values reduce hunger/thirst/unhappiness (which is what you want).

---

### 4. Missing Type Property

**Problem:** Not specifying item type.

❌ **Wrong:**
```lua
item Hammer {
    DisplayName = Hammer,
    Weight = 0.5,
    /* Missing Type! */
}
```

✅ **Right:**
```lua
item Hammer {
    Type = Weapon,                          /* Required! */
    DisplayName = Hammer,
    Weight = 0.5,
}
```

**Rule:** Type is required for all items.

---

### 5. Using Wrong Category Names

**Problem:** Using non-existent category names.

❌ **Wrong:**
```lua
recipe Make Stuff {
    Ingredient1,
    Result:Output,
    Time:60.0,
    Category:CustomCategory,                /* Not a valid category! */
}
```

✅ **Right:**
```lua
recipe Make Stuff {
    Ingredient1,
    Result:Output,
    Time:60.0,
    Category:Survivalist,                   /* Valid category */
}
```

**Valid categories:** Cooking, Carpentry, Health, Survivalist, Metalworking, Tailoring, Electrical, Mechanics, Farming.

---

## Try It Yourself

### Exercise 1: Create a Custom Food Item

Create a protein bar with these properties:
- Type: Food
- Display name: "Protein Bar"
- Weight: 0.15
- Reduces hunger by 20
- Reduces thirst by 3
- 300 calories, 40g carbs, 15g protein, 5g fat
- Stays fresh for 90 days, rotten after 120 days
- Reduces stress by 3

<details>
<summary>Solution</summary>

```lua
module MyMod {
    item ProteinBar {
        Type = Food,
        DisplayName = Protein Bar,
        DisplayCategory = Food,
        Icon = Chocolate,
        Weight = 0.15,

        HungerChange = -20,
        ThirstChange = -3,
        Calories = 300,
        Carbohydrates = 40,
        Proteins = 15,
        Lipids = 5,

        DaysFresh = 90,
        DaysTotallyRotten = 120,

        StressChange = -3,
    }
}
```

**Key points:**
- Negative values for HungerChange/ThirstChange/StressChange (reduces these)
- DaysTotallyRotten > DaysFresh
- All properties end with commas
</details>

---

### Exercise 2: Create a Melee Weapon

Create a crowbar with these properties:
- Type: Weapon
- Weight: 1.5
- MinDamage: 0.8, MaxDamage: 1.2
- ConditionMax: 20
- Can hit 2 enemies per swing
- Swing time: 2.5

<details>
<summary>Solution</summary>

```lua
module MyMod {
    item Crowbar {
        Type = Weapon,
        DisplayName = Crowbar,
        DisplayCategory = Weapon,
        Icon = Crowbar,
        Weight = 1.5,

        MinDamage = 0.8,
        MaxDamage = 1.2,
        ConditionMax = 20,
        MaxHitCount = 2,
        SwingTime = 2.5,

        SwingAnim = Bat,
        WeaponSprite = Crowbar,
        Categories = Blunt,
    }
}
```

**Key points:**
- Weapon Type required for combat properties
- MinDamage < MaxDamage
- MaxHitCount = how many zombies can be hit
- SwingAnim and Categories control animation
</details>

---

### Exercise 3: Create a Crafting Recipe

Create a recipe to make bandages from ripped sheets:
- Requires 2 ripped sheets
- Requires scissors (not consumed)
- Produces 3 bandages
- Takes 30 time units
- Category: Health
- Requires no skill

<details>
<summary>Solution</summary>

```lua
module MyMod {
    imports { Base }

    recipe Make Bandages {
        RippedSheets=2,
        keep Scissors,

        Result:Bandage=3,
        Time:30.0,
        Category:Health,
    }
}
```

**Key points:**
- `=2` specifies count of 2
- `keep` means scissors not consumed
- `Result:Bandage=3` means 3 bandages produced
- Recipes use `:` syntax, items use `=`
</details>

---

## Best Practices

### 1. Copy Similar Vanilla Items

**Start with a vanilla example:**
1. Find similar vanilla item in `media/scripts/`
2. Copy its properties
3. Modify values for your item

**Why:** Vanilla items are balanced and functional. Starting from them prevents common errors.

### 2. Balance Against Vanilla

**Compare your items to vanilla:**
- Food: Compare hunger/calories/spoilage to similar foods
- Weapons: Compare damage/durability to similar weapons
- Containers: Match vanilla capacity/weight reduction

**Rule of thumb:** Custom items should be slightly weaker than vanilla equivalents.

### 3. Use Meaningful Names

**Good names:**
- `CustomProteinBar` - Clear what it is
- `SteelCrowbar` - Descriptive
- `LargeBackpack` - Indicates size

**Bad names:**
- `Item1` - Not descriptive
- `MyStuff` - Vague
- `SuperWeapon` - Not informative

### 4. Organize Properties by Category

**Group related properties:**
```lua
item Food {
    /* Basic */
    Type = Food,
    DisplayName = Item,
    Weight = 0.1,

    /* Nutrition */
    HungerChange = -10,
    Calories = 100,

    /* Spoilage */
    DaysFresh = 7,
    DaysTotallyRotten = 14,
}
```

**Why:** Easier to read and maintain.

### 5. Comment Complex Properties

**Add comments for non-obvious values:**
```lua
item CustomWeapon {
    MinDamage = 0.8,                        /* Balanced for mid-game */
    SwingTime = 2.5,                        /* Slightly slower than bat */
    ConditionMax = 15,                      /* Breaks after ~300 hits */
}
```

### 6. Test In-Game

**Always test your items:**
1. Spawn item with admin commands
2. Verify properties work as expected
3. Check for balance issues

**Common issues found by testing:**
- Weight too high/low
- Damage too strong/weak
- Spoilage times incorrect

### 7. Use Full Module Paths

**Be explicit with module prefixes:**
```lua
ReplaceOnCooked = Base.CookedSteak,         /* Clear which module */
```

**Avoid:**
```lua
ReplaceOnCooked = CookedSteak,              /* Ambiguous if multiple modules */
```

---

## Key Takeaways

1. **Items use `=`, recipes use `:`** - Different syntax for each
2. **Type is required** - Every item must have a Type property
3. **Negative values reduce** - HungerChange = -10 reduces hunger (good!)
4. **All properties end with commas** - Syntax error without them
5. **Use valid categories** - Only predefined categories work for recipes
6. **Balance against vanilla** - Compare your items to similar vanilla items
7. **`keep` preserves tools** - Without `keep`, ingredients are consumed
8. **Test in-game** - Properties that look good on paper may not work as expected

---

## Syntax Rules

1. **Items use `=` for properties**: `Weight = 0.1,`
2. **Recipes use `:` for properties**: `Time:60.0,`
3. **All properties end with comma**: `DisplayName = Energy Bar,`
4. **Comments use `/* */` or `//`**
5. **Module declaration**: `module Base { ... }`
6. **Imports for cross-module**: `imports { Base }`
7. **Case sensitive**: `Type` not `type`
8. **No spaces in IDs**: `EnergyBar` not `Energy Bar`

---

## Related

- [Events Reference](/build-41/modding/reference/events) - Game events and callbacks
- [Your First Custom Item](/build-41/modding/items/first-item-file) - Tutorial for creating items
- [Your First Recipe File](/build-41/modding/recipes/first-recipe-file) - Tutorial for creating recipes
