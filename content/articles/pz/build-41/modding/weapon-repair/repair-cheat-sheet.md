---
id: weapon-repair-repair-cheat-sheet
slug: repair-cheat-sheet
title: "Weapon Repair Quick Reference Cheat Sheet"
game: pz
version: build-41
section: modding
category: weapon-repair
subcategory: null
difficulty: beginner
tags:
  - lua
  - item
  - repair
  - weapon
  - api
  - cheat
  - sheet
excerpt: "Quick reference cheat sheet for weapon repair system - common fixers, skill requirements, Lua API, fixing.txt syntax, and practical examples."
table_of_contents:
  - text: "Fixing.txt Syntax"
    link: "#fixingtxt-syntax"
  - text: "Common Fixers"
    link: "#common-fixers"
  - text: "Skill Requirements"
    link: "#skill-requirements"
  - text: "Lua API Quick Reference"
    link: "#lua-api-quick-reference"
  - text: "Key Files"
    link: "#key-files"
  - text: "Condition Formula"
    link: "#condition-formula"
  - text: "Quick Examples"
    link: "#quick-examples"
  - text: "Basic Weapon"
    link: "#basic-weapon"
  - text: "Skilled Repair"
    link: "#skilled-repair"
  - text: "Firearm"
    link: "#firearm"
  - text: "With GlobalItem"
    link: "#with-globalitem"
  - text: "Detection Capabilities"
    link: "#detection-capabilities"
  - text: "Weapon Properties"
    link: "#weapon-properties"
  - text: "Common Perks Enum"
    link: "#common-perks-enum"
  - text: "Repair Menu Trigger"
    link: "#repair-menu-trigger"
  - text: "Repair Action Duration"
    link: "#repair-action-duration"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Quick Start Guide"
    link: "#quick-start-guide"
last_updated: 2026-01-18
---

# Weapon Repair Quick Reference Cheat Sheet

## Introduction

You're in the middle of creating a repair mod and need to quickly check the syntax for fixing.txt. Or you're debugging a Lua repair script and can't remember the exact FixingManager API call. Or maybe you just want a quick reference for common fixer items and their uses.

This cheat sheet provides instant lookup for weapon repair modding - no explanations, just the facts you need to get back to coding.

**For detailed explanations, see:**
- [Fixing.txt Anatomy](fixing-txt-anatomy) - Complete syntax guide
- [Lua Repair Mechanics](lua-repair-mechanics) - Detailed Lua workflow
- [Repair Formulas](repair-formulas) - Mathematical breakdown

---

## Fixing.txt Syntax

```
fixing Fix [ItemType]
{
   Require : [ItemType],                  // Item being repaired
   GlobalItem : [Tool]=[Uses],            // Optional: consumed tool
   ConditionModifier : [decimal],         // Optional: repair effectiveness

   Fixer : [Item]=[Uses],                                    // No skill required
   Fixer : [Item]=[Uses]; [Skill]=[Level],                   // Single skill
   Fixer : [Item]=[Uses]; [Skill1]=[Level]; [Skill2]=[Level], // Multiple skills
}
```

## Common Fixers

| Fixer | Uses | Skill | Best For |
|-------|------|-------|----------|
| Woodglue | 2 | Woodwork 2 | Wooden weapons |
| DuctTape | 2 | None | Everything |
| Glue | 2 | None | Everything |
| Scotchtape | 4 | None | Emergency |
| Same Gun | 1 | Aiming 2-5 | Firearms |

## Skill Requirements

| Skill | Weapons |
|-------|---------|
| Woodwork 2 | Axes, Sledgehammers, Wooden bats |
| Aiming 2 | Shotguns, Revolvers |
| Aiming 3 | Pistols |
| Aiming 4 | Hunting/Varmint Rifles |
| Aiming 5 | Assault Rifles |
| Mechanics | Vehicles |
| MetalWelding | Welded vehicle parts |

## Lua API Quick Reference

```lua
-- Get repairs available for item
local fixes = FixingManager.getFixes(item)

-- Calculate repair quality (returns 0-100%)
local condRestored = FixingManager.getCondRepaired(item, player, fixing, fixer)
local failChance = FixingManager.getChanceOfFail(item, player, fixing, fixer)

-- Perform repair (consumes materials, updates condition)
FixingManager.fixItem(item, character, fixing, fixer)

-- Item condition
item:getCondition()           // Current condition (0-100)
item:setCondition(value)      // Set condition
item:getConditionMax()        // Max condition (usually 100)
item:isBroken()               // True if condition == 0

-- Item state
item:getHaveBeenRepaired()    // True if previously repaired
item:setHaveBeenRepaired(true) // Set repair flag

-- Player skills
player:getPerkLevel(Perks.Maintenance)  // Get skill level
player:getMaintenanceMod()              // Get maintenance modifier
player:getXp():AddXP(perk, amount)      // Grant XP
```

## Key Files

```
Scripts:
  media/scripts/fixing.txt              // Repair definitions
  media/scripts/vehiclesfixing.txt      // Vehicle repairs
  media/scripts/items_weapons.txt       // Weapon properties

Lua:
  lua/client/TimedActions/ISFixAction.lua          // Main repair action
  lua/client/ISUI/ISInventoryPaneContextMenu.lua   // Repair UI
  lua/server/Vehicles/VehicleCommands.lua          // Server-side vehicle repairs
```

## Condition Formula

```lua
-- Degradation check per use:
if ZombRand(condLowerChance * 2 + maintenanceMod * 2) == 0 then
    condition = condition - 1  // Degrades
else
    AddXP(Perks.Maintenance, 1)  // Gain XP instead
end

-- Engine repair per part:
condPerPart = min(1 + (skillAboveReq / 2), 5)  // Max 5 per part
```

## Quick Examples

### Basic Weapon
```
fixing Fix MyWeapon
{
   Require : MyWeapon,       // Item type
   Fixer : DuctTape=2,       // 2 duct tape uses
   Fixer : Glue=2,           // 2 glue uses
}
```

### Skilled Repair
```
fixing Fix MyAxe
{
   Require : MyAxe,          // Item type
   Fixer : Woodglue=2; Woodwork=2,  // Requires Woodwork 2
   Fixer : DuctTape=2,       // No skill required
}
```

### Firearm
```
fixing Fix MyGun
{
   Require : MyGun,          // Item type
   Fixer : MyGun; Aiming=3,  // Use same gun for parts
}
```

### With GlobalItem
```
fixing Fix MyArmor
{
   Require : MyArmor,                 // Item type
   GlobalItem : BlowTorch=2,          // Requires blowtorch (2 uses consumed)
   ConditionModifier : 1.2,           // 20% more effective
   Fixer : SheetMetal=1; MetalWelding=2,  // Material + skill
}
```

## Detection Capabilities

| What | How | Detectable |
|------|-----|------------|
| Can repair? | FixingManager.getFixes() | Yes |
| Repair quality | getCondRepaired() | Yes |
| Success chance | getChanceOfFail() | Yes |
| Already repaired | getHaveBeenRepaired() | Yes |
| Current condition | getCondition() | Yes |
| Is broken | isBroken() | Yes |

## Weapon Properties

```
ConditionMax = 15,                   // Max condition (total durability points)
ConditionLowerChanceOneIn = 15,      // Degradation rate (higher = more durable)
```

## Common Perks Enum

```lua
Perks.Maintenance    // Reduces degradation, improves repair
Perks.Woodwork       // Carpentry skill
Perks.Aiming         // Firearm accuracy
Perks.Mechanics      // Vehicle repair
Perks.MetalWelding   // Welding skill
Perks.Tailoring      // Clothing repair
Perks.Electrical     // Electronics
```

## Repair Menu Trigger

```lua
-- In ISInventoryPaneContextMenu
if item:isBroken() or item:getCondition() < item:getConditionMax() then
    // Show repair menu
end
```

## Repair Action Duration

```lua
// Default: 60 ticks (~2 seconds)
ISFixAction:new(player, item, 60, fixing, fixer)

// Clothing: 150 - (tailoring * 6) ticks
//   Level 0: 150 ticks (~5 seconds)
//   Level 10: 90 ticks (~3 seconds)

// Engine: Duration based on parts consumed
```

---

## Common Mistakes

### ❌ Wrong: Using Equals Instead of Colon

```
fixing Fix MyWeapon
{
   Require = MyWeapon,      // WRONG! Use colon
   Fixer = DuctTape=2,      // WRONG! Use colon
}
```

✅ **Right:**
```
fixing Fix MyWeapon
{
   Require : MyWeapon,      // Colon after property name
   Fixer : DuctTape=2,      // Colon, then equals for uses
}
```

### ❌ Wrong: Comma Instead of Semicolon

```
fixing Fix MyWeapon
{
   Require : MyWeapon,
   Fixer : Woodglue=2, Woodwork=2,  // WRONG! Comma doesn't separate skills
}
```

✅ **Right:**
```
fixing Fix MyWeapon
{
   Require : MyWeapon,
   Fixer : Woodglue=2; Woodwork=2,  // Semicolon separates item from skill
}
```

### ❌ Wrong: No Validation Before FixingManager Call

```lua
function MyRepair:perform()
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)
    // WRONG! No validation
end
```

✅ **Right:**
```lua
function MyRepair:perform()
    // Validate before calling Java API
    if not self.item or not self.character:getInventory():contains(self.item) then
        ISBaseTimedAction.perform(self)
        return
    end
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)
end
```

### ❌ Wrong: Setting Condition Without Clamping

```lua
item:setCondition(item:getCondition() + 50)  // WRONG! Might exceed max
```

✅ **Right:**
```lua
local newCond = math.min(item:getCondition() + 50, item:getConditionMax())
item:setCondition(newCond)  // Clamped to max
```

---

## Quick Start Guide

### Step 1: Create Mod Structure

```
MyMod/
├── mod.info
└── media/
    └── scripts/
        └── fixing_mymod.txt
```

### Step 2: Add Repair Definition

**fixing_mymod.txt:**
```
module MyMod
{
    item CustomAxe
    {
        Type = Weapon,
        DisplayName = Custom Axe,
        MinDamage = 1.3,
        MaxDamage = 3,
        ConditionMax = 15,
        ConditionLowerChanceOneIn = 15,
    }

    fixing Fix CustomAxe
    {
        Require : CustomAxe,           // Item being repaired
        Fixer : DuctTape=2,            // No skill required
        Fixer : Woodglue=2; Woodwork=2, // Requires Woodwork 2
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to spawn Custom Axe
3. Damage it by using it
4. Right-click → "Repair Custom Axe"
5. Select fixer (Duct Tape or Woodglue)

**Expected:** Condition restores, materials consumed, repair menu shows skill requirements.

---

## Tips

1. **No fixing entry = not repairable** - Every repairable item needs a fixing definition
2. **Firearms require same type** - Can't use tape/glue on guns, only same gun type
3. **Skill affects quality AND success** - Higher skill = better repair + less failure chance
4. **GlobalItem = fuel consumed** - Tools like blowtorch lose durability, not removed
5. **ConditionModifier > 1 = better repair** - Multiplies repair effectiveness
6. **Condition caps at 100** - Can't exceed max condition
7. **Maintenance skill reduces degradation** - Level up Maintenance to make items last longer
8. **Semicolon separates skills from item** - `Fixer : Item=Uses; Skill=Level,`
9. **Comma ends the fixer line** - Terminates the statement
10. **Module paths matter** - Reference items from other modules: `ModuleName.ItemName`

---

## For More Detail

- [Fixing.txt Anatomy](fixing-txt-anatomy) - Complete syntax guide with examples
- [Lua Repair Mechanics](lua-repair-mechanics) - Detailed Lua workflow and API
- [Repair Formulas](repair-formulas) - Mathematical breakdown of repair calculations
- [Repair Items Reference](repair-items-reference) - All vanilla fixer items
