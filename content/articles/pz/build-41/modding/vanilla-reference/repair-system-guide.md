---
id: repair-system-guide
slug: repair-system-guide
title: "Understanding Repair Systems in Project Zomboid"
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
excerpt: "Comprehensive guide to both repair systems in PZ: item fixing for weapons/tools, and vehicle parts for cars. Learn how to make custom weapons repairable."
related_articles:
  - vanilla-fixing-reference
  - weapon-properties-guide
  - vanilla-weapons-reference
last_updated: 2026-01-18
---

# Understanding Repair Systems in Project Zomboid

## Introduction

Your favorite baseball bat is down to 10% condition. You right-click it in your inventory, hoping to see a repair option. Sometimes it's there, sometimes it isn't. Sometimes you can repair with duct tape, sometimes with glue, sometimes you need to cannibalize another weapon. And vehicle parts? That's a completely different menu with its own rules.

If you're feeling overwhelmed trying to understand how repair works in Project Zomboid, you're not alone. The game has **two completely separate repair systems** that work in totally different ways, and there's no in-game explanation. This can seem mysterious when you're trying to make your custom weapon repairable.

Here's the good news: both systems follow simple patterns once you see them. I'll show you exactly how each system works, starting with the simplest possible repair entry you can create.

## What You're Actually Seeing In-Game

Before we dive into code, let's ground this in what you experience as a player:

**Item Repair (Weapons/Tools):**
- Right-click damaged baseball bat → "Repair Baseball Bat" appears
- Multiple repair options in a submenu: "Repair with Woodglue", "Repair with Duct Tape", etc.
- Choose one, your character performs the action, condition goes up
- Materials are consumed, item stays in inventory

**Vehicle Repair:**
- Open vehicle mechanics menu (V key near vehicle)
- See list of parts with condition bars (tire, hood, door, etc.)
- Uninstall damaged tire → it goes to inventory
- Install new tire → it goes onto vehicle
- Tools are used but not consumed

These are **completely different systems** in the code. You cannot use item repair methods on vehicles, or vehicle methods on items.

## The Two Repair Systems

| System | Used For | Definition File | Syntax |
|--------|----------|-----------------|--------|
| **Fixing** | Weapons, tools, instruments | `fixing.txt` | Uses `Fixer :` lines |
| **Vehicle Parts** | Vehicle components | `vehicles/*.txt` | Uses `table install`/`table uninstall` |

These systems are **completely separate** - you cannot use fixing entries for vehicle parts or vice versa.

---

## Your First Repairable Weapon (Simplest Example)

Let's start with the absolute minimum code to make a custom weapon repairable. This is the simplest working example:

**File:** `YourMod/media/scripts/items.txt`
```
module YourMod
{
    item CustomBat
    {
        Type = Weapon,                      // This makes it a weapon
        DisplayName = Custom Bat,           // Name players see
        ConditionMax = 15,                  // Max durability (required for repair!)
        MinDamage = 0.8,                    // Stats don't matter for repair
    }
}
```

**File:** `YourMod/media/scripts/fixing.txt`
```
module YourMod
{
    fixing Fix Custom Bat
    {
        Require : CustomBat,                // Must match your item's name exactly
        Fixer : DuctTape=2,                 // Need 2 Duct Tape to repair
    }
}
```

**That's it!** Now when players right-click a damaged Custom Bat, they'll see "Repair Custom Bat" → "Repair with Duct Tape".

**Why This Matters:** The `ConditionMax` property in your item is **critical**. Without it, the item can't be damaged, so repair won't be possible. The `Require` field in fixing must **exactly match** your item's name (after the module prefix).

---

## Item Repair: The Fixing System

### How It Works (Behind the Scenes)

When you right-click an item in inventory:

1. Game searches ALL `fixing` entries in ALL loaded mods
2. Finds entries where `Require` matches your item's type
3. Each `Fixer` line becomes a repair option in the context menu
4. When you select one, game checks if you have the materials/skills
5. If yes, repairs the item and consumes materials

### Anatomy of a Fixing Entry

```
fixing Fix Baseball Bat                // The entry name (can be anything, but make it descriptive)
{
    Require : BaseballBat,              // Item type ID to repair (this must match exactly!)

    Fixer : Woodglue=2; Woodwork=2,     // Option 1: need 2 Woodglue AND Woodwork skill level 2
    Fixer : DuctTape=2,                 // Option 2: need 2 Duct Tape (no skill required)
    Fixer : Glue=2,                     // Option 3: need 2 Glue (cheaper alternative)
    Fixer : Scotchtape=4,               // Option 4: need 4 Scotch Tape (emergency option)
}
```

> **Note:** You'll see multiple `Fixer` lines here. Each line is a **separate repair option** - the player chooses one from a context menu. This is NOT a list of required materials - it's a list of alternative methods.

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

> **Understanding the Syntax:** You'll see `Item`, `count`, `Skill`, and `level` in the syntax above. **These are placeholders** - stand-ins showing the pattern. Here's what they actually mean in Project Zomboid:
>
> - **Item**: The repair material's item ID (e.g., `DuctTape`, `Woodglue`, `WeldingRods`, `Nails`)
> - **count**: How many of that item you need (e.g., `2` means need 2 duct tapes)
> - **Skill**: The skill name required (e.g., `Woodwork`, `Metalworking`, `Aiming`)
> - **level**: The skill level needed (e.g., `3` means you must have level 3 in that skill)
>
> **Concrete PZ examples:**
> - `Fixer : DuctTape=2` means "need 2 Duct Tape items"
> - `Fixer : Woodglue=3; Woodwork=4` means "need 3 Woodglue AND Woodwork skill level 4"
> - `Fixer : Nails` means "need 1 Nails" (count defaults to 1 if omitted)
>
> *(These are just stand-ins to show the pattern - always use actual PZ item names and skill names in your mod)*

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
module YourMod                          // Your mod's module name
{
    fixing Fix My Custom Katana         // Entry name (for your reference only)
    {
        Require : MyCustomKatana,       // The item name (WITHOUT "YourMod." prefix!)

        Fixer : DuctTape=3,             // Option 1: need 3 Duct Tape
        Fixer : WeldingRods=2; Metalworking=3,  // Option 2: need 2 Welding Rods + skill
    }
}
```

**Important Notes:**
- The `Require` value must **exactly match** your item's name (without the module prefix)
- Your item is defined as `YourMod.MyCustomKatana` but you write `Require : MyCustomKatana` (no module)
- This is different from recipes - fixing entries don't use the full module.item format

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
part TireFrontLeft                      // Part definition name
{
    area = TireFrontLeft,               // Physical location on vehicle (front left corner)
    wheel = FrontLeft,                  // Wheel position (affects steering/power)
    category = tire,                    // Part category (groups similar parts together)
    itemType = Base.OldTire;Base.NormalTire;Base.ModernTire,  // Any of these items can be installed here

    table install                       // What's needed to INSTALL this part
    {
        items                           // Tools required for installation
        {
            1 { type = Base.Jack, count = 1, keep = true }         // Need 1 Jack (not consumed)
            2 { type = Base.LugWrench, count = 1, keep = true, equip = primary }  // Need 1 Lug Wrench (held in hand)
        }
        time = 400,                     // Installation time in game ticks (~6 minutes)
        skills = Mechanics:1,           // Need Mechanics skill level 1
        test = Vehicles.InstallTest.Default,      // Check function (can player install this?)
        complete = Vehicles.InstallComplete.Tire, // Completion function (runs when done)
    }

    table uninstall                     // What's needed to REMOVE this part
    {
        items                           // Tools required for removal
        {
            1 { type = Base.Jack, count = 1, keep = true }         // Need 1 Jack (not consumed)
            2 { type = Base.LugWrench, count = 1, keep = true, equip = primary }  // Need 1 Lug Wrench (held in hand)
        }
        time = 400,                     // Removal time in game ticks (~6 minutes)
        skills = Mechanics:1,           // Need Mechanics skill level 1
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
        Type = Weapon,                          // This makes it a weapon
        DisplayName = Reinforced Machete,       // Name players see
        Categories = LongBlade,                 // Weapon category (affects skills used)
        SubCategory = Swinging,                 // Subcategory (melee type)

        MinDamage = 1.0,                        // Minimum damage per hit
        MaxDamage = 1.8,                        // Maximum damage per hit
        MaxRange = 1.2,                         // Attack range in tiles
        BaseSpeed = 1.1,                        // Attack speed modifier

        ConditionMax = 20,                      // Max durability (REQUIRED for repair!)
        ConditionLowerChanceOneIn = 35,         // Chance to lose condition per hit (1/35)
    }
}
```

> **Note:** We've shown just the essential properties here. Real weapons have many more properties (Icon, Weight, sound effects, etc.), but these are all you need to make a repairable weapon.

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

## Common Mistakes

### Wrong: Using Module Prefix in Require

```
fixing Fix Custom Bat
{
    Require : YourMod.CustomBat,        // WRONG! Don't include module prefix
    Fixer : DuctTape=2,
}
```

**Why it's wrong:** The `Require` field expects just the item name, not the full `Module.ItemName` format. This will fail silently - no error, but repair won't work.

**Right:**

```
fixing Fix Custom Bat
{
    Require : CustomBat,                // Correct! Just the item name
    Fixer : DuctTape=2,
}
```

---

### Wrong: Forgetting ConditionMax on Item

```
item CustomBat
{
    Type = Weapon,
    DisplayName = Custom Bat,
    MinDamage = 0.8,
    // Missing ConditionMax!
}
```

**Why it's wrong:** Without `ConditionMax`, the item can't be damaged, so it can never need repair. The repair option will never appear.

**Right:**

```
item CustomBat
{
    Type = Weapon,
    DisplayName = Custom Bat,
    MinDamage = 0.8,
    ConditionMax = 15,                  // Now the item can be damaged and repaired
}
```

---

### Wrong: Thinking Multiple Fixer Lines Are Required Together

```
// Player sees this and thinks they need BOTH Woodglue AND DuctTape
fixing Fix Baseball Bat
{
    Require : BaseballBat,
    Fixer : Woodglue=2,
    Fixer : DuctTape=2,
}
```

**Why it's confusing:** Multiple `Fixer` lines create **alternative options**, not a combined requirement. The player chooses ONE.

**Right (with clarification):**

```
fixing Fix Baseball Bat
{
    Require : BaseballBat,
    Fixer : Woodglue=2,                 // Option 1: OR repair with Woodglue
    Fixer : DuctTape=2,                 // Option 2: OR repair with Duct Tape
}
// Player sees TWO context menu options and picks one
```

---

### Wrong: Misspelling Skill Names

```
fixing Fix Custom Bat
{
    Require : CustomBat,
    Fixer : Woodglue=2; Woodworking=2,  // WRONG! It's "Woodwork" not "Woodworking"
}
```

**Why it's wrong:** Skill names must be spelled exactly as the game expects. `Woodworking` won't match the skill `Woodwork`, so the repair will work (no error) but won't give any skill bonus or check for the skill requirement.

**Right:**

```
fixing Fix Custom Bat
{
    Require : CustomBat,
    Fixer : Woodglue=2; Woodwork=2,     // Correct! Matches the actual skill name
}
```

**Common skill name gotchas:**
- `Woodwork` (not Woodworking)
- `Metalworking` (this one IS correct)
- `Aiming` (for firearms, not Shooting or Firearms)

---

## Try It Yourself

Let's create a fully working repairable weapon from scratch and test it in-game.

### Step 1: Create Your Item

1. In your mod folder, create `media/scripts/items.txt`
2. Add this code:

```
module TestMod
{
    item TestHammer
    {
        Type = Weapon,
        DisplayName = Test Hammer,
        Icon = Hammer,
        Weight = 1.5,

        ConditionMax = 10,
        ConditionLowerChanceOneIn = 20,

        MinDamage = 0.7,
        MaxDamage = 1.0,
        MinRange = 0.61,
        MaxRange = 1.0,
        BaseSpeed = 1.0,
    }
}
```

### Step 2: Create Repair Entry

3. In your mod folder, create `media/scripts/fixing.txt`
4. Add this code:

```
module TestMod
{
    fixing Fix Test Hammer
    {
        Require : TestHammer,
        Fixer : DuctTape=1,
        Fixer : Nails=3,
    }
}
```

### Step 3: Test In-Game

5. Load the game with your mod enabled
6. Use Debug Mode (instructions in debug-mode article) to spawn your hammer:
   - Press ESC → Click "Spawn Item"
   - Search for "Test Hammer"
   - Click it to add to inventory

7. Damage your hammer:
   - Go find some zombies
   - Hit them until hammer is below max condition

8. Test repair:
   - Spawn some Duct Tape (search "Duct Tape" in debug)
   - Right-click your damaged Test Hammer
   - You should see "Repair Test Hammer" → "Repair with Duct Tape"
   - Select it and watch condition increase

### Step 4: Verify Multiple Options

9. Spawn Nails (search "Nails")
10. Right-click hammer again
11. You should now see TWO repair options:
    - "Repair with Duct Tape"
    - "Repair with Nails"

12. Try both and notice they repair different amounts (because Nails requires 3, it repairs more)

### What You Should See

- **Context menu appears:** Repair options show up when item is damaged
- **Multiple options:** Each `Fixer` line creates a separate menu item
- **Materials consumed:** After repair, check your inventory - materials are gone
- **Condition restored:** Item's condition bar should increase (not to full, just partially)

### If It Doesn't Work

- **No repair option appears:** Check `ConditionMax` is set and item is actually damaged
- **Option appears but does nothing:** Check `Require` matches your item name exactly (no module prefix)
- **Wrong skill required:** Check skill name spelling (`Woodwork` not `Woodworking`)

---

## Summary

- **Item repair** uses `fixing.txt` with `Fixer` lines
- **Vehicle repair** uses part templates with install/uninstall tables
- These are **completely separate systems**
- To make custom weapons repairable, add a `fixing` entry
- Match the `Require` field exactly to your item's type ID (no module prefix)
- Each `Fixer` line is an alternative repair method (player chooses one)
- Always include `ConditionMax` on items you want to be repairable
