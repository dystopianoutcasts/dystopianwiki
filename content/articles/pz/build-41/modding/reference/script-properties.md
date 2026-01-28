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
  - text: "Syntax Rules"
    link: "#syntax-rules"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-09
---

# Script Properties Reference

## Overview

This reference documents all properties available in PZ script files (`.txt` files in `media/scripts/`). Scripts define items, recipes, vehicles, and other game content.

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

### Item Types

```
Type = Normal,       -- Standard item
Type = Food,         -- Edible item
Type = Weapon,       -- Melee weapon
Type = Drainable,    -- Has uses (e.g., lighter)
Type = Clothing,     -- Wearable
Type = Container,    -- Can hold items
Type = Literature,   -- Readable
Type = Key,          -- Key item
Type = KeyRing,      -- Key ring
Type = Map,          -- Map item
Type = Moveable,     -- Can be picked up/placed
Type = Radio,        -- Radio device
Type = AlarmClock,   -- Alarm clock
Type = AlarmClockClothing, -- Wearable alarm
```

### Display Categories

```
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

### Mood Effects

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `UnhappyChange` | float | Unhappiness change (negative = better) | `UnhappyChange = -10,` |
| `StressChange` | float | Stress change | `StressChange = -5,` |
| `FatigueChange` | float | Fatigue change | `FatigueChange = -10,` |
| `EnduranceChange` | float | Endurance change | `EnduranceChange = 5,` |

### Spoilage

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `DaysFresh` | int | Days until starts rotting | `DaysFresh = 7,` |
| `DaysTotallyRotten` | int | Days until completely rotten | `DaysTotallyRotten = 14,` |
| `ReplaceOnRotten` | string | Item to become when rotten | `ReplaceOnRotten = Base.RottingFood,` |

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

### Evolved Recipes

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `EvolvedRecipe` | string | Evolved recipe type | `EvolvedRecipe = Base.Stew:5;Base.Soup:5,` |
| `EvolvedRecipeName` | string | Display name in recipe | `EvolvedRecipeName = Potato,` |
| `FoodType` | string | Food category | `FoodType = Vegetables,` |

---

## Weapon Item Properties

### Damage

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `MinDamage` | float | Minimum damage | `MinDamage = 0.3,` |
| `MaxDamage` | float | Maximum damage | `MaxDamage = 0.8,` |
| `CriticalChance` | float | Crit chance (0-100) | `CriticalChance = 25,` |
| `CritDmgMultiplier` | float | Critical damage multiplier | `CritDmgMultiplier = 2,` |
| `DoorDamage` | int | Damage to doors | `DoorDamage = 15,` |
| `TreeDamage` | int | Damage to trees | `TreeDamage = 5,` |

### Combat

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `HitChance` | int | Base hit chance | `HitChance = 30,` |
| `ToHitModifier` | float | Hit chance modifier | `ToHitModifier = 1.2,` |
| `PushBackMod` | float | Knockback force | `PushBackMod = 0.5,` |
| `KnockdownMod` | float | Knockdown chance | `KnockdownMod = 2,` |
| `MaxHitCount` | int | Max enemies per swing | `MaxHitCount = 3,` |
| `EnduranceMod` | float | Stamina cost modifier | `EnduranceMod = 1.5,` |
| `UseEndurance` | bool | Uses stamina | `UseEndurance = TRUE,` |

### Animation

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `SwingAnim` | string | Swing animation | `SwingAnim = Bat,` |
| `SwingTime` | float | Swing duration | `SwingTime = 2.5,` |
| `MinimumSwingTime` | float | Fastest swing | `MinimumSwingTime = 2,` |
| `SwingAmountBeforeImpact` | float | Swing progress at hit | `SwingAmountBeforeImpact = 0.02,` |
| `IdleAnim` | string | Idle animation | `IdleAnim = Idle_Weapon2,` |
| `RunAnim` | string | Run animation | `RunAnim = Run_Weapon2,` |

### Condition

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `ConditionMax` | int | Maximum durability | `ConditionMax = 15,` |
| `ConditionLowerChanceOneIn` | int | Break chance (1 in X) | `ConditionLowerChanceOneIn = 20,` |

### Sounds

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `SwingSound` | string | Swing sound | `SwingSound = SwingBlunt,` |
| `HitSound` | string | Hit sound | `HitSound = BaseballBatHit,` |
| `ImpactSound` | string | Impact sound | `ImpactSound = MetalHit,` |
| `BreakSound` | string | Break sound | `BreakSound = BreakWoodItem,` |
| `DoorHitSound` | string | Door hit sound | `DoorHitSound = HammerDoor,` |
| `HitFloorSound` | string | Ground hit sound | `HitFloorSound = MetalFloor,` |

### Ranged Weapon Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
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

---

## Drainable Item Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `UseDelta` | float | Amount used per use (0-1) | `UseDelta = 0.1,` |
| `UseWhileEquipped` | bool | Drains while held | `UseWhileEquipped = FALSE,` |
| `ReplaceOnDeplete` | string | Item when empty | `ReplaceOnDeplete = Base.EmptyJar,` |
| `ConsolidateOption` | string | Merge context option | `ConsolidateOption = ContextMenu_Merge,` |

---

## Container Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `Capacity` | int | Storage capacity | `Capacity = 20,` |
| `WeightReduction` | int | Weight reduction % | `WeightReduction = 70,` |
| `CanStoreWater` | bool | Can hold water | `CanStoreWater = TRUE,` |
| `RainFactor` | float | Rain collection rate | `RainFactor = 0.5,` |

---

## Medical Item Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `Medical` | bool | Is medical item | `Medical = TRUE,` |
| `BandagePower` | float | Bandage effectiveness | `BandagePower = 2,` |
| `CanBandage` | bool | Can bandage wounds | `CanBandage = TRUE,` |
| `PainReduction` | float | Pain reduction | `PainReduction = 50,` |
| `FluReduction` | float | Cold reduction | `FluReduction = 5,` |
| `ReduceFoodSickness` | int | Food sickness reduction | `ReduceFoodSickness = 50,` |

---

## Misc Item Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `WorldStaticModel` | string | 3D model when placed | `WorldStaticModel = Hammer,` |
| `StaticModel` | string | Inventory 3D model | `StaticModel = Hammer,` |
| `MetalValue` | int | Metal scrap value | `MetalValue = 20,` |
| `SurvivalGear` | bool | Essential survival item | `SurvivalGear = TRUE,` |
| `AlwaysWelcomeGift` | bool | Good for gifting | `AlwaysWelcomeGift = TRUE,` |
| `Tags` | string | Item tags | `Tags = HasMetal;SewingNeedle,` |
| `OBSOLETE` | bool | Mark item as obsolete | `OBSOLETE = TRUE,` |

### Wet Item Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `Wet` | bool | Item is wet | `Wet = TRUE,` |
| `WetCooldown` | int | Ticks to dry | `WetCooldown = 8000,` |
| `ItemWhenDry` | string | Item when dried | `ItemWhenDry = Base.DishCloth,` |

### Light Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `LightStrength` | float | Light brightness | `LightStrength = 0.8,` |
| `LightDistance` | int | Light radius | `LightDistance = 10,` |
| `ActivatedItem` | bool | Can be turned on | `ActivatedItem = TRUE,` |

### Replacement Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `ReplaceOnUse` | string | Replace after use | `ReplaceOnUse = Base.EmptyCan,` |
| `ReplaceOnUseOn` | string | Replace when used on | `ReplaceOnUseOn = WaterSource-WaterBowl,` |
| `DisappearOnUse` | bool | Delete after use | `DisappearOnUse = TRUE,` |

---

## Recipe Properties

### Basic Recipe Structure

```
recipe Recipe Name {
    Ingredient1,              -- Required ingredient
    Ingredient2/Ingredient3,  -- Alternative ingredients (OR)
    IngredientType=3,         -- Required count
    keep ToolItem,            -- Tool not consumed
    destroy DestroyItem,      -- Item destroyed (not result)
    
    Result:OutputItem,        -- What is crafted
    Result:OutputItem=3,      -- Multiple outputs
    Time:60.0,                -- Crafting time
    Category:Cooking,         -- Recipe category
}
```

### Core Recipe Properties

| Property | Syntax | Description | Example |
|----------|--------|-------------|----------|
| `Result` | `Result:ItemID` | Crafted item | `Result:EnergyBar,` |
| `Time` | `Time:float` | Crafting duration | `Time:60.0,` |
| `Category` | `Category:name` | Recipe category | `Category:Cooking,` |

### Recipe Categories

```
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

### Skill Requirements

| Property | Syntax | Description | Example |
|----------|--------|-------------|----------|
| `SkillRequired` | `SkillRequired:Skill=Level` | Required skill | `SkillRequired:Cooking=3,` |
| `NeedToBeLearn` | `NeedToBeLearn:true` | Must learn recipe first | `NeedToBeLearn:true,` |

### Callbacks

| Property | Syntax | Description | Example |
|----------|--------|-------------|----------|
| `OnCreate` | `OnCreate:Function` | Called after crafting | `OnCreate:Recipe.OnCreate.Dismantle,` |
| `OnCanPerform` | `OnCanPerform:Function` | Checks if can craft | `OnCanPerform:Recipe.OnCanPerform.HasWater,` |
| `OnGiveXP` | `OnGiveXP:Function` | XP reward function | `OnGiveXP:Recipe.OnGiveXP.Cooking5,` |
| `OnTest` | `OnTest:Function` | Test function | `OnTest:Recipe.OnTest.IsRotten,` |

### Special Properties

| Property | Syntax | Description | Example |
|----------|--------|-------------|----------|
| `Sound` | `Sound:name` | Crafting sound | `Sound:Hammering,` |
| `AnimNode` | `AnimNode:name` | Crafting animation | `AnimNode:SawLog,` |
| `Heat` | `Heat:float` | Heat source needed | `Heat:0.5,` |
| `NearItem` | `NearItem:ItemType` | Must be near item | `NearItem:Anvil,` |
| `InSameInventory` | `InSameInventory:true` | Items in same container | `InSameInventory:true,` |
| `CanBeDoneFromFloor` | `CanBeDoneFromFloor:true` | Can craft on ground | `CanBeDoneFromFloor:true,` |
| `StopOnWalk` | `StopOnWalk:true` | Stops if player moves | `StopOnWalk:true,` |

### Item State Properties

| Property | Syntax | Description | Example |
|----------|--------|-------------|----------|
| `AllowRottenItem` | `AllowRottenItem:true` | Can use rotten items | `AllowRottenItem:true,` |
| `AllowFrozenItem` | `AllowFrozenItem:true` | Can use frozen items | `AllowFrozenItem:true,` |
| `AllowDestroyedItem` | `AllowDestroyedItem:true` | Can use destroyed items | `AllowDestroyedItem:true,` |
| `RemoveResultItem` | `RemoveResultItem:true` | Don't give result | `RemoveResultItem:true,` |

### Tooltip

| Property | Syntax | Description | Example |
|----------|--------|-------------|----------|
| `Tooltip` | `Tooltip:key` | Tooltip translation key | `Tooltip:Tooltip_Recipe_NeedsWater,` |

---

## Ingredient Syntax

### Basic Ingredients

```
Chocolate,                    -- Single item
Chocolate/Nuts/Raisins,       -- Any one of these (OR)
Chocolate=3,                  -- Need 3 of item
Base.Chocolate,               -- Full module path
```

### Keep and Destroy

```
keep Hammer,                  -- Tool not consumed
keep [Recipe.GetItemTypes.Hammer], -- Any hammer-type
destroy OldItem,              -- Item destroyed (not returned)
```

### Item Type Functions

```
[Recipe.GetItemTypes.Hammer]     -- Any hammer
[Recipe.GetItemTypes.Saw]        -- Any saw
[Recipe.GetItemTypes.SharpKnife] -- Any sharp knife
[Recipe.GetItemTypes.Screwdriver] -- Any screwdriver
```

---

## Complete Item Example

```
module Base {
    item EnergyBar {
        Type = Food,
        DisplayName = Energy Bar,
        DisplayCategory = Food,
        Icon = Chocolate,
        Weight = 0.1,
        
        /* Nutrition */
        HungerChange = -15,
        ThirstChange = -5,
        Calories = 250,
        Carbohydrates = 35,
        Proteins = 5,
        Lipids = 10,
        
        /* Spoilage */
        DaysFresh = 60,
        DaysTotallyRotten = 90,
        
        /* Mood */
        UnhappyChange = -5,
        StressChange = -5,
        
        /* Misc */
        Tooltip = Tooltip_food,
        WorldStaticModel = EnergyBar,
    }
}
```

## Complete Recipe Example

```
module Base {
    imports {
        Base
    }
    
    recipe Make Energy Bar {
        Chocolate,
        Oats/Cereal,
        Honey,
        keep [Recipe.GetItemTypes.SharpKnife],
        
        Result:EnergyBar,
        Time:60.0,
        Category:Cooking,
        Sound:PrepareFood,
        SkillRequired:Cooking=2,
        OnGiveXP:Recipe.OnGiveXP.Cooking5,
    }
}
```

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

## Related

- [Events Reference](/build-41/modding/reference/events) - Game events and callbacks
- [Your First Custom Item](/build-41/modding/items/first-item-file) - Tutorial for creating items
- [Your First Recipe File](/build-41/modding/recipes/first-recipe-file) - Tutorial for creating recipes
