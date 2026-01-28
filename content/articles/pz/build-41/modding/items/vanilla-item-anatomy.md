---
id: items-vanilla-item-anatomy
slug: vanilla-item-anatomy
title: "Vanilla Item Anatomy - Complete Property Reference"
game: pz
version: build-41
section: modding
category: items
subcategory: null
difficulty: intermediate
tags:
  - recipe
  - item
  - weapon
  - animation
  - crafting
  - vanilla
  - anatomy
excerpt: "This document provides a comprehensive reference of all properties available for Project Zomboid items, based on vanilla game items.         Purpose: Determines fundamental item behavior (..."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Complete Item Template"
    link: "#complete-item-template"
  - text: "Core Properties"
    link: "#core-properties"
  - text: "Type"
    link: "#type"
  - text: "DisplayName"
    link: "#displayname"
  - text: "DisplayCategory"
    link: "#displaycategory"
  - text: "Weight"
    link: "#weight"
  - text: "Icon"
    link: "#icon"
  - text: "Visual Properties"
    link: "#visual-properties"
  - text: "WorldStaticModel"
    link: "#worldstaticmodel"
  - text: "StaticModel"
    link: "#staticmodel"
  - text: "Texture"
    link: "#texture"
  - text: "Behavior Properties"
    link: "#behavior-properties"
  - text: "Tags"
    link: "#tags"
  - text: "Tooltip"
    link: "#tooltip"
  - text: "Count"
    link: "#count"
  - text: "MetalValue"
    link: "#metalvalue"
  - text: "Drainable Item Properties"
    link: "#drainable-item-properties"
  - text: "UseDelta"
    link: "#usedelta"
  - text: "UseWhileEquipped"
    link: "#usewhileequipped"
  - text: "WeightEmpty"
    link: "#weightempty"
  - text: "Container Item Properties"
    link: "#container-item-properties"
  - text: "Capacity"
    link: "#capacity"
  - text: "WeightReduction"
    link: "#weightreduction"
  - text: "Weapon Item Properties"
    link: "#weapon-item-properties"
  - text: "MinDamage / MaxDamage"
    link: "#mindamage-maxdamage"
  - text: "WeaponSprite"
    link: "#weaponsprite"
  - text: "Food Item Properties"
    link: "#food-item-properties"
  - text: "HungerChange"
    link: "#hungerchange"
  - text: "ThirstChange"
    link: "#thirstchange"
  - text: "DaysFresh"
    link: "#daysfresh"
  - text: "DaysTotallyRotten"
    link: "#daystotallyrotten"
  - text: "Advanced Properties"
    link: "#advanced-properties"
  - text: "CanStoreWater"
    link: "#canstorewater"
  - text: "ReplaceOnUse"
    link: "#replaceonuse"
  - text: "UnhappyChange"
    link: "#unhappychange"
  - text: "StressChange"
    link: "#stresschange"
  - text: "Complete Real-World Examples"
    link: "#complete-real-world-examples"
  - text: "Normal Item: 9mm Bullet Mold"
    link: "#normal-item-9mm-bullet-mold"
  - text: "Drainable Item: Gunpowder"
    link: "#drainable-item-gunpowder"
  - text: "Stackable Item: 9mm Ammunition"
    link: "#stackable-item-9mm-ammunition"
  - text: "Container Item: Metal Workbench"
    link: "#container-item-metal-workbench"
  - text: "Tool with Tags: Pliers"
    link: "#tool-with-tags-pliers"
  - text: "Property Compatibility Matrix"
    link: "#property-compatibility-matrix"
  - text: "Source Files"
    link: "#source-files"
next_steps:
  - title: "Item Creation Guide"
    path: /build-41/modding/items/item-creation
  - title: "Module Dependencies"
    path: /build-41/modding/items/module-dependencies
  - title: "Vanilla Ammunition Items"
    path: /build-41/modding/items/ammunition-items
last_updated: 2026-01-09
---

# Vanilla Item Anatomy - Complete Property Reference

## Overview
This document provides a comprehensive reference of all properties available for Project Zomboid items, based on vanilla game items.

## Complete Item Template

```
module ModuleName {
    imports {
        Base
    }

    item ItemName {
        // CORE PROPERTIES
        Type = ItemType,
        DisplayName = Item Name,
        DisplayCategory = Category,
        Weight = number,
        Icon = IconName,

        // VISUAL
        WorldStaticModel = ModelName,
        StaticModel = ModelName,
        Texture = TextureName,

        // BEHAVIOR
        Tags = Tag1;Tag2;Tag3,
        Tooltip = Tooltip_Key,
        Count = stackSize,
        MetalValue = number,

        // DRAINABLE SPECIFIC
        UseDelta = number,
        UseWhileEquipped = boolean,
        WeightEmpty = number,

        // CONTAINER SPECIFIC
        Capacity = number,
        WeightReduction = number,

        // WEAPON SPECIFIC
        MinDamage = number,
        MaxDamage = number,
        WeaponSprite = SpriteName,

        // FOOD SPECIFIC
        HungerChange = number,
        ThirstChange = number,
        DaysFresh = number,
        DaysTotallyRotten = number,

        // ADVANCED
        CanStoreWater = boolean,
        ReplaceOnUse = ItemName,
        UnhappyChange = number,
        StressChange = number,
    }
}
```

## Core Properties

### Type
**Purpose:** Determines fundamental item behavior (CANNOT be changed after creation)

**Syntax:**
```
Type = TypeName,
```

**Available Types:**

| Type | Description | Use Cases |
|------|-------------|-----------|
| `Normal` | Standard item | Tools, materials, ammo |
| `Drainable` | Has uses/charges | Gunpowder, gas, paint |
| `Food` | Edible item | Food, drinks |
| `Weapon` | Melee/ranged weapon | Guns, melee weapons |
| `Container` | Storage item | Bags, boxes, backpacks |
| `Key` | Key or access card | Keys, keycards |
| `Clothing` | Wearable item | Shirts, pants, armor |
| `Literature` | Readable item | Books, magazines, maps |

**Example:**
```
Type = Normal,
Type = Drainable,
```

### DisplayName
**Purpose:** Name shown to player

**Syntax:**
```
DisplayName = Item Name,
```

**Examples:**
```
DisplayName = 9mm Bullets Mold,
DisplayName = Gunpowder,
DisplayName = Box of 9mm Rounds,
```

**Localization Note:** This can reference translation keys for multi-language support.

### DisplayCategory
**Purpose:** Category for UI organization

**Syntax:**
```
DisplayCategory = CategoryName,
```

**Common Categories:**
- `Ammo` - Ammunition and related
- `Material` - Crafting materials
- `Weapon` - Weapons
- `Tool` - Tools
- `Container` - Containers/bags
- `Food` - Edible items
- `FirstAid` - Medical supplies
- `Literature` - Books/magazines
- `Clothing` - Wearable items
- `Electronics` - Electronic devices

### Weight
**Purpose:** Item weight (affects encumbrance)

**Unit:** Abstract weight units

**Syntax:**
```
Weight = number,
```

**Typical Ranges:**
- Tiny items (bullets, pills): `0.01` - `0.05`
- Small items (tools, books): `0.1` - `1.0`
- Medium items (weapons, containers): `1.0` - `5.0`
- Heavy items (furniture, machinery): `5.0` - `50.0`

**Examples:**
```
Weight = 0.01,    // 9mm bullet
Weight = 0.5,     // Bullet mold
Weight = 1.0,     // Hammer
Weight = 20.0,    // Industrial propane tank
```

### Icon
**Purpose:** Texture file for inventory display

**Syntax:**
```
Icon = TextureFileName,
```

**Examples:**
```
Icon = BulletMold,
Icon = GunpowderJar,
Icon = 40calAmmoBox,
```

**Location:** Icon files are PNG images in `media/textures/` or `media/textures/Item_` directory.

## Visual Properties

### WorldStaticModel
**Purpose:** 3D model when item is on ground

**Syntax:**
```
WorldStaticModel = ModelName,
```

**Examples:**
```
WorldStaticModel = ShotGunShellsMold_Ground,
WorldStaticModel = GunpowderJar,
WorldStaticModel = 9mmRounds,
```

### StaticModel
**Purpose:** 3D model when equipped or placed

**Syntax:**
```
StaticModel = ModelName,
```

### Texture
**Purpose:** Alternative texture specification

**Syntax:**
```
Texture = TextureName,
```

## Behavior Properties

### Tags
**Purpose:** Categorization for recipe matching and game logic

**Syntax:**
```
Tags = Tag1;Tag2;Tag3,
```

**Common Tags:**
- `Hammer`
- `Saw`
- `Screwdriver`
- `Pliers`
- `BluntWeapon`
- `BladeWeapon`
- `File`
- `MetalCutter`

**Example:**
```
item Hammer {
    Tags = Hammer;BluntWeapon,
}
```

**Usage in Recipes:**
```
recipe Example {
    keep [Recipe.GetItemTypes.Hammer],  // Matches any item with "Hammer" tag
}
```

### Tooltip
**Purpose:** Hover tooltip text (translation key)

**Syntax:**
```
Tooltip = Tooltip_ItemName,
```

**Example:**
```
Tooltip = Tooltip_weapon_HandAxe,
```

### Count
**Purpose:** Stack size for stackable items

**Syntax:**
```
Count = number,
```

**Examples:**
```
Count = 5,      // 9mm bullets (5 per stack)
Count = 6,      // Shotgun shells (6 per stack)
Count = 1,      // Non-stackable (default)
```

### MetalValue
**Purpose:** Metal content for smelting/recycling

**Syntax:**
```
MetalValue = number,
```

**Examples:**
```
MetalValue = 15,    // Bullet mold (15 metal units)
MetalValue = 1,     // Single bullet (1 metal unit)
```

**Usage:** Players can smelt/melt items with MetalValue to recover metal.

## Drainable Item Properties

For items with `Type = Drainable`:

### UseDelta
**Purpose:** Amount consumed per use

**Range:** 0.0 to 1.0 (percentage)

**Syntax:**
```
UseDelta = 0.1,     // 10% per use (10 uses total)
UseDelta = 0.05,    // 5% per use (20 uses total)
```

**Example:**
```
item GunPowder {
    Type = Drainable,
    UseDelta = 0.1,     // 10 uses before empty
}
```

### UseWhileEquipped
**Purpose:** Can be used while in hands

**Syntax:**
```
UseWhileEquipped = TRUE,
UseWhileEquipped = FALSE,
```

### WeightEmpty
**Purpose:** Weight when fully drained

**Syntax:**
```
WeightEmpty = number,
```

**Example:**
```
item GunPowder {
    Weight = 0.1,        // Full weight
    WeightEmpty = 0.01,  // Empty container weight
}
```

## Container Item Properties

For items with `Type = Container`:

### Capacity
**Purpose:** Storage capacity (weight units)

**Syntax:**
```
Capacity = number,
```

**Examples:**
```
Capacity = 10,      // Small bag
Capacity = 50,      // Large backpack
Capacity = 100,     // Workbench/crate
```

### WeightReduction
**Purpose:** Weight reduction percentage for contents

**Range:** 0 to 100

**Syntax:**
```
WeightReduction = 50,    // 50% weight reduction
WeightReduction = 90,    // 90% weight reduction
```

**Example:**
```
item Backpack {
    Type = Container,
    Capacity = 50,
    WeightReduction = 50,   // Contents weigh half as much
}
```

## Weapon Item Properties

For items with `Type = Weapon`:

### MinDamage / MaxDamage
**Purpose:** Damage range

**Syntax:**
```
MinDamage = number,
MaxDamage = number,
```

**Example:**
```
item Hammer {
    Type = Weapon,
    MinDamage = 0.8,
    MaxDamage = 1.2,
}
```

### WeaponSprite
**Purpose:** Sprite animation for weapon

**Syntax:**
```
WeaponSprite = SpriteName,
```

## Food Item Properties

For items with `Type = Food`:

### HungerChange
**Purpose:** How much hunger it reduces (negative) or increases (positive)

**Syntax:**
```
HungerChange = -20,     // Reduces hunger by 20
```

### ThirstChange
**Purpose:** How much thirst it affects

**Syntax:**
```
ThirstChange = -10,     // Reduces thirst by 10
```

### DaysFresh
**Purpose:** Days until food starts rotting

**Syntax:**
```
DaysFresh = 3,
```

### DaysTotallyRotten
**Purpose:** Days until completely rotten

**Syntax:**
```
DaysTotallyRotten = 6,
```

## Advanced Properties

### CanStoreWater
**Purpose:** Can hold water

**Syntax:**
```
CanStoreWater = TRUE,
```

**Use Case:** Water bottles, pots, containers

### ReplaceOnUse
**Purpose:** Item to replace with after use

**Syntax:**
```
ReplaceOnUse = ItemName,
```

**Example:**
```
item SodaCan {
    ReplaceOnUse = EmptySodaCan,
}
```

### UnhappyChange
**Purpose:** Moodle effect (happiness)

**Syntax:**
```
UnhappyChange = -10,    // Makes happier
UnhappyChange = 10,     // Makes sadder
```

### StressChange
**Purpose:** Moodle effect (stress)

**Syntax:**
```
StressChange = -20,     // Reduces stress
StressChange = 10,      // Increases stress
```

## Complete Real-World Examples

### Normal Item: 9mm Bullet Mold
```
item 9mmBulletsMold {
    DisplayCategory = Ammo,
    Weight = 0.5,
    Type = Normal,
    DisplayName = 9mm Bullets Mold,
    Icon = BulletMold,
    MetalValue = 15,
    WorldStaticModel = ShotGunShellsMold_Ground,
}
```

### Drainable Item: Gunpowder
```
item GunPowder {
    DisplayCategory = Material,
    Weight = 0.1,
    Type = Drainable,
    UseDelta = 0.1,
    UseWhileEquipped = FALSE,
    DisplayName = Gunpowder,
    Icon = GunpowderJar,
    WeightEmpty = 0.01,
    WorldStaticModel = GunpowderJar,
}
```

### Stackable Item: 9mm Ammunition
```
item Bullets9mm {
    DisplayCategory = Ammo,
    Count = 5,
    Weight = 0.01,
    Type = Normal,
    DisplayName = 9mm Rounds,
    Icon = 40calAmmoBox,
    MetalValue = 1,
    WorldStaticModel = 9mmRounds,
}
```

### Container Item: Metal Workbench
```
item MetalWorkbench {
    Type = Container,
    DisplayCategory = Container,
    DisplayName = Metal Workbench,
    Weight = 35,
    Capacity = 100,
    Icon = MetalWorkbench,
}
```

### Tool with Tags: Pliers
```
item Pliers {
    DisplayCategory = Tool,
    Weight = 0.1,
    Type = Normal,
    DisplayName = Pliers,
    Icon = Pliers,
    Tags = Pliers,
    WorldStaticModel = Pliers,
}
```

## Property Compatibility Matrix

| Property | Normal | Drainable | Food | Weapon | Container |
|----------|--------|-----------|------|--------|-----------|
| Weight | ✓ | ✓ | ✓ | ✓ | ✓ |
| Icon | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tags | ✓ | ✓ | ✓ | ✓ | ✓ |
| Count | ✓ | ✗ | ✗ | ✗ | ✗ |
| UseDelta | ✗ | ✓ | ✗ | ✗ | ✗ |
| Capacity | ✗ | ✗ | ✗ | ✗ | ✓ |
| MinDamage | ✗ | ✗ | ✗ | ✓ | ✗ |
| HungerChange | ✗ | ✗ | ✓ | ✗ | ✗ |

## Source Files
- **Vanilla Items:** `R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\items.txt`
- **Vanilla New Items:** `R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\newitems.txt`
- **Vanilla Weapons:** `R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\items_weapons.txt`
- **Research Date:** 2025-11-06
