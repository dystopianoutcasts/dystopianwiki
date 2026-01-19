---
id: repair-cheat-sheet
slug: repair-cheat-sheet
title: Weapon Repair Quick Reference Cheat Sheet
excerpt: "fixing Fix [ItemType] { Require : [ItemType], GlobalItem : [Tool]=[Uses],           // Optional ConditionModifier : [decimal],         // Optional Fixer : [Item]=[Uses], Fixer : [Item]=[Uses];..."
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
last_updated: 2026-01-09
---
# Weapon Repair Quick Reference Cheat Sheet

## Fixing.txt Syntax

```
fixing Fix [ItemType]
{
   Require : [ItemType],
   GlobalItem : [Tool]=[Uses],           // Optional
   ConditionModifier : [decimal],         // Optional

   Fixer : [Item]=[Uses],
   Fixer : [Item]=[Uses]; [Skill]=[Level],
   Fixer : [Item]=[Uses]; [Skill1]=[Level]; [Skill2]=[Level],
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

-- Calculate repair quality
local condRestored = FixingManager.getCondRepaired(item, player, fixing, fixer)
local failChance = FixingManager.getChanceOfFail(item, player, fixing, fixer)

-- Perform repair
FixingManager.fixItem(item, character, fixing, fixer)

-- Item condition
item:getCondition()
item:setCondition(value)
item:getConditionMax()
item:isBroken()

-- Item state
item:getHaveBeenRepaired()
item:setHaveBeenRepaired(true)

-- Player skills
player:getPerkLevel(Perks.Maintenance)
player:getMaintenanceMod()
player:getXp():AddXP(perk, amount)
```

## Key Files

```
Scripts:
  media/scripts/fixing.txt              // Repair definitions
  media/scripts/vehiclesfixing.txt      // Vehicle repairs
  media/scripts/items_weapons.txt       // Weapon properties

Lua:
  lua/client/TimedActions/ISFixAction.lua
  lua/client/ISUI/ISInventoryPaneContextMenu.lua
  lua/server/Vehicles/VehicleCommands.lua
```

## Condition Formula

```lua
-- Degradation check per use:
if ZombRand(condLowerChance * 2 + maintenanceMod * 2) == 0 then
    condition = condition - 1
else
    AddXP(Perks.Maintenance, 1)
end

-- Engine repair per part:
condPerPart = min(1 + (skillAboveReq / 2), 5)
```

## Quick Examples

### Basic Weapon
```
fixing Fix MyWeapon
{
   Require : MyWeapon,
   Fixer : DuctTape=2,
   Fixer : Glue=2,
}
```

### Skilled Repair
```
fixing Fix MyAxe
{
   Require : MyAxe,
   Fixer : Woodglue=2; Woodwork=2,
   Fixer : DuctTape=2,
}
```

### Firearm
```
fixing Fix MyGun
{
   Require : MyGun,
   Fixer : MyGun; Aiming=3,
}
```

### With GlobalItem
```
fixing Fix MyArmor
{
   Require : MyArmor,
   GlobalItem : BlowTorch=2,
   ConditionModifier : 1.2,
   Fixer : SheetMetal=1; MetalWelding=2,
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
ConditionMax = 15,           // Max condition
ConditionLowerChanceOneIn = 15,  // Higher = more durable
```

## Common Perks Enum

```lua
Perks.Maintenance
Perks.Woodwork
Perks.Aiming
Perks.Mechanics
Perks.MetalWelding
Perks.Tailoring
Perks.Electrical
```

## Repair Menu Trigger

```lua
-- In ISInventoryPaneContextMenu
if item:isBroken() or item:getCondition() < item:getConditionMax() then
    -- Show repair menu
end
```

## Repair Action Duration

```lua
-- Default: 60 ticks (~2 seconds)
ISFixAction:new(player, item, 60, fixing, fixer)

-- Clothing: 150 - (tailoring * 6) ticks
-- Engine: Uses engine parts consumed
```

## Tips

1. **No fixing entry = not repairable**
2. **Firearms require same type** (no tape/glue)
3. **Skill affects quality AND success**
4. **GlobalItem = fuel consumed**
5. **ConditionModifier > 1 = better repair**
6. **Condition caps at 100**
7. **Maintenance skill reduces degradation**

## Minimal Mod Setup

```
MyMod/
├── mod.info
└── media/
    └── scripts/
        └── fixing_mymod.txt
```

**fixing_mymod.txt:**
```
fixing Fix MyModItem
{
   Require : MyModItem,
   Fixer : DuctTape=2,
}
```
 
