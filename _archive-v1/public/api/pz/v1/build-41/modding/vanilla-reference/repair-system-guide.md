---
id: repair-system-guide
slug: repair-system-guide
title: Understanding Repair Systems in Project Zomboid
excerpt: "Project Zomboid has **two completely different repair systems**: one for items (weapons, tools, instruments) and one for vehicles. This guide explains both systems in depth and how to make your..."
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: intermediate
tags:
  - repair
  - fixing
  - weapons
  - vehicles
  - maintenance
  - guide
last_updated: 2026-01-18
---
# Understanding Repair Systems in Project Zomboid

Project Zomboid has **two completely different repair systems**: one for items (weapons, tools, instruments) and one for vehicles. This guide explains both systems in depth and how to make your custom items work with them.

## The Two Repair Systems

| System | Used For | Definition File | Syntax |
|--------|----------|-----------------|--------|
| **Fixing** | Weapons, tools, instruments | `fixing.txt` | Uses `Fixer :` lines |
| **Vehicle Parts** | Vehicle components | `vehicles/*.txt` | Uses `table install`/`table uninstall` |

These systems are **completely separate** - you cannot use fixing entries for vehicle parts or vice versa.

---

## Item Repair: The Fixing System

### How It Works

1. Player right-clicks a damaged item in inventory
2. Game searches for `fixing` entries where `Require` matches the item's type
3. If found, shows repair options based on `Fixer` lines
4. Player selects repair option, item condition is restored

### Anatomy of a Fixing Entry

```
fixing Fix Baseball Bat
{
    Require : BaseballBat,              // Item type ID to repair

    Fixer : Woodglue=2; Woodwork=2,     // Option 1: materials + skill
    Fixer : DuctTape=2,                 // Option 2: just materials
    Fixer : Glue=2,                     // Option 3: alternative
    Fixer : Scotchtape=4,               // Option 4: alternative
}
```

### Key Properties

| Property | Description | Example |
|----------|-------------|----------|
| `Require` | Item type ID this fixing applies to | `Require : BaseballBat` |
| `Fixer` | One repair option (multiple allowed) | `Fixer : DuctTape=2` |

### Fixer Line Syntax

Each `Fixer` line defines ONE way to repair the item:

```
Fixer : Item=count; Skill=level
```

**Examples:**

| Fixer Line | Meaning |
|------------|----------|
| `Fixer : DuctTape=2` | Needs 2 Duct Tape |
| `Fixer : Woodglue=2; Woodwork=2` | Needs 2 Woodglue AND Woodwork level 2 |
| `Fixer : Nails` | Needs 1 Nail (count defaults to 1) |
| `Fixer : Glue=3; Metalworking=4` | Needs 3 Glue AND Metalworking level 4 |

### Making Your Custom Weapon Repairable

To make any weapon repairable, create a `fixing` entry:

```
module YourMod
{
    fixing Fix My Custom Katana
    {
        Require : MyCustomKatana,

        Fixer : DuctTape=3,
        Fixer : WeldingRods=2; Metalworking=3,
    }
}
```

**Important Notes:**
- The `Require` value must **exactly match** your item's type ID
- Item type ID format: `ModuleName.ItemName` (e.g., `Base.BaseballBat`)
- But in fixing entries, you just use the item name without module prefix

### How Repair Amount Is Calculated

Each repair restores a **fixed percentage** of the item's max condition. The repair amount depends on:

1. **Fixer count**: More materials = more repair
2. **Skill level**: Higher skill = bonus repair
3. **Item's ConditionMax**: The weapon's durability ceiling

The formula (from ISFixAction.lua):
```lua
repairAmount = (fixerCount * 10) + (skillLevel * 2)
```

So `Fixer : DuctTape=2` would repair 20 condition points, while `Fixer : Woodglue=2; Woodwork=4` would repair 28 points (20 from materials + 8 from skill bonus).

---

## Vehicle Repair: The Part System

Vehicle repair is **completely different** from item repair. Instead of "fixing" entries, vehicles use **part templates** with install/uninstall tables.

### How It Works

1. Player opens vehicle mechanics menu
2. Game shows all parts and their condition
3. Player can uninstall damaged parts
4. Player can install new/repaired parts
5. Some parts can be repaired while installed (welding)

### Anatomy of a Vehicle Part

```
part TireFrontLeft
{
    area = TireFrontLeft,
    wheel = FrontLeft,
    category = tire,
    itemType = Base.OldTire;Base.NormalTire;Base.ModernTire,
    
    table install
    {
        items
        {
            1 { type = Base.Jack, count = 1, keep = true }
            2 { type = Base.LugWrench, count = 1, keep = true, equip = primary }
        }
        time = 400,
        skills = Mechanics:1,
        test = Vehicles.InstallTest.Default,
        complete = Vehicles.InstallComplete.Tire,
    }
    
    table uninstall
    {
        items
        {
            1 { type = Base.Jack, count = 1, keep = true }
            2 { type = Base.LugWrench, count = 1, keep = true, equip = primary }
        }
        time = 400,
        skills = Mechanics:1,
    }
}
```

### Key Differences from Fixing

| Aspect | Item Fixing | Vehicle Parts |
|--------|-------------|---------------|
| **Repairs item in place?** | Yes | No (must uninstall/install) |
| **Uses consumables?** | Yes | Tools only (kept) |
| **Requires skills?** | Optional | Usually required |
| **Multiple options?** | Yes (Fixer lines) | No (one way) |
| **Location matters?** | No | Yes (part areas) |

### Vehicle Part Properties

| Property | Description |
|----------|-------------|
| `area` | Physical location on vehicle |
| `category` | Part type (tire, door, engine, etc.) |
| `itemType` | Item types that can be installed here |
| `requireInstalled` | Parts that must be installed first |
| `skills` | Skill requirements (e.g., `Mechanics:2`) |
| `time` | Installation time in ticks |
| `keep = true` | Tool is not consumed |

---

## Connecting Weapons to Repair Materials

### Pattern: Wooden Items

Wooden weapons (bats, sticks, axes) typically use:

```
Fixer : Woodglue=2; Woodwork=2,    // Best option (skill-gated)
Fixer : DuctTape=2,                 // Universal fallback
Fixer : Glue=2,                     // Budget option
Fixer : Scotchtape=4,               // Emergency option
```

### Pattern: Metal Items

Metal weapons (crowbars, pipes) typically use:

```
Fixer : DuctTape=2,
Fixer : Scotchtape=3,
```

### Pattern: Firearms

Firearms use a unique approach - **parts from the same weapon type**:

```
fixing Fix Pistol
{
    Require : Pistol,
    Fixer : Pistol; Aiming=3,        // Need another pistol + Aiming skill
}
```

This means you cannibalize a working gun to repair another!

### Pattern: Composite Items (Nailed Bat)

Items with multiple materials need their components:

```
fixing Fix Nailed Baseball Bat
{
    Require : BaseballBatNails,
    
    Fixer : Woodglue=2; Woodwork=2,
    Fixer : DuctTape=2,
    Fixer : Glue=2,
    Fixer : Scotchtape=4,
    Fixer : Nails,                   // Can also fix with nails
}
```

---

## Creating a Complete Repairable Weapon

### Step 1: Define Your Weapon

```
module MyMod
{
    item ReinforcedMachete
    {
        Type = Weapon,
        DisplayName = Reinforced Machete,
        Categories = LongBlade,
        SubCategory = Swinging,
        
        MinDamage = 1.0,
        MaxDamage = 1.8,
        MaxRange = 1.2,
        BaseSpeed = 1.1,
        
        ConditionMax = 20,
        ConditionLowerChanceOneIn = 35,
        
        // ... other properties
    }
}
```

### Step 2: Add Repair Options

```
module MyMod
{
    fixing Fix Reinforced Machete
    {
        Require : ReinforcedMachete,
        
        // Metal blade repair
        Fixer : WeldingRods=2; Metalworking=3,
        
        // Handle repair
        Fixer : DuctTape=2,
        Fixer : Glue=3,
        
        // Emergency repair
        Fixer : Scotchtape=5,
    }
}
```

### Step 3: Consider Skill Balance

- **No skill required**: Anyone can use this method
- **Low skill (1-2)**: Basic crafters can access
- **Medium skill (3-5)**: Requires some investment
- **High skill (6+)**: Specialist only

---

## Common Repair Materials Reference

| Material | Item ID | Typical Use |
|----------|---------|-------------|
| Duct Tape | `DuctTape` | Universal, no skill needed |
| Woodglue | `Woodglue` | Wooden items, needs Woodwork |
| Glue | `Glue` | General purpose |
| Scotch Tape | `Scotchtape` | Emergency, needs more |
| Welding Rods | `WeldingRods` | Metal items, needs Metalworking |
| Nails | `Nails` | Nailed weapons |
| Twine | `Twine` | Spears, fishing equipment |

---

## Troubleshooting

### "Repair option doesn't appear"

1. Check `Require` matches your item's ID exactly
2. Ensure the item has a `ConditionMax` property
3. Item must have condition below max to show repair option

### "Repair uses wrong skill"

The skill in the `Fixer` line must be spelled exactly:
- `Woodwork` (not Woodworking)
- `Metalworking` (correct)
- `Aiming` (for firearms)

### "Vehicle part won't repair"

Vehicle parts don't use the fixing system. You must:
1. Uninstall the damaged part
2. Install a new/repaired part
3. Or use welding if supported by that part type

---

## Summary

- **Item repair** uses `fixing.txt` with `Fixer` lines
- **Vehicle repair** uses part templates with install/uninstall tables
- These are **completely separate systems**
- To make custom weapons repairable, add a `fixing` entry
- Match the `Require` field exactly to your item's type ID
- Each `Fixer` line is an alternative repair method 
