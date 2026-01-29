---
id: weapon-repair-repair-system-overview
slug: repair-system-overview
title: "Project Zomboid Repair System Overview"
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
  - event
  - system
  - overview
excerpt: "Complete overview of Project Zomboid's repair system - how fixing.txt, FixingManager, and ISFixAction work together to enable item repairs with skills, materials, and success calculations."
table_of_contents:
  - text: "Introduction"
    link: "#introduction"
  - text: "Architecture"
    link: "#architecture"
  - text: "How Repairs Work"
    link: "#how-repairs-work"
  - text: "1. Defining Repairs (Script Layer)"
    link: "#1-defining-repairs-script-layer"
  - text: "2. Calculating Repairs (Java Layer)"
    link: "#2-calculating-repairs-java-layer"
  - text: "3. User Interface (Lua Layer)"
    link: "#3-user-interface-lua-layer"
  - text: "Condition System"
    link: "#condition-system"
  - text: "Item Properties"
    link: "#item-properties"
  - text: "Condition States"
    link: "#condition-states"
  - text: "Condition Degradation"
    link: "#condition-degradation"
  - text: "Skill Requirements"
    link: "#skill-requirements"
  - text: "Common Repair Skills"
    link: "#common-repair-skills"
  - text: "Skill Level Requirements (Examples)"
    link: "#skill-level-requirements-examples"
  - text: "Repair Items (Fixers)"
    link: "#repair-items-fixers"
  - text: "Common Repair Items"
    link: "#common-repair-items"
  - text: "Usage Amounts"
    link: "#usage-amounts"
  - text: "Special Mechanics"
    link: "#special-mechanics"
  - text: "Firearms Self-Repair"
    link: "#firearms-self-repair"
  - text: "GlobalItem (Consumable Tools)"
    link: "#globalitem-consumable-tools"
  - text: "ConditionModifier"
    link: "#conditionmodifier"
  - text: "HaveBeenRepaired Flag"
    link: "#havebeenrepaired-flag"
  - text: "Repair Limitations"
    link: "#repair-limitations"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
last_updated: 2026-01-18
---

# Project Zomboid Repair System Overview

## Introduction

You're creating a custom weapon mod and want it to be repairable. Or you've added a repair definition in fixing.txt but when you right-click the damaged item in-game, there's no repair option. Or maybe you see repairs work for vanilla weapons but can't figure out how the system connects fixing.txt definitions to the actual repair action.

If you're confused about how the repair system works, you're not alone. The repair system spans three different layers (script files, Java code, and Lua UI), each with different responsibilities. Understanding how fixing.txt definitions flow through FixingManager calculations and into ISFixAction timed actions can feel overwhelming, especially when debugging why your custom repair isn't showing up.

Here's the good news: once you understand how these three layers connect, creating custom repairs becomes straightforward. This guide shows you the complete repair workflow from definition to execution, with practical examples showing exactly how each piece works together.

---

## Architecture

The repair system in Project Zomboid consists of three main layers:

```
┌─────────────────────────────────────────────────────────┐
│                    SCRIPT LAYER                         │
│  fixing.txt / vehiclesfixing.txt                        │
│  Defines WHAT can be repaired and WITH what             │
│  - Require: Item type                                   │
│  - Fixer: Materials + skill requirements                │
│  - GlobalItem: Tools consumed during repair             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   JAVA LAYER                            │
│  FixingManager                                          │
│  Core repair logic, calculations, validation            │
│  - getFixes(): Find repair definitions                  │
│  - getCondRepaired(): Calculate restoration amount      │
│  - getChanceOfFail(): Calculate failure probability     │
│  - fixItem(): Execute repair, consume materials         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    LUA LAYER                            │
│  ISFixAction, ISInventoryPaneContextMenu, etc.          │
│  UI, timed actions, player interaction                  │
│  - Context menu: Show repair options                    │
│  - ISFixAction: Timed repair animation                  │
│  - Validation: Check materials, skills                  │
└─────────────────────────────────────────────────────────┘
```

**Why Three Layers?**

- **Script Layer (fixing.txt)**: Moddable definitions - you can add repairs without code
- **Java Layer (FixingManager)**: Core game logic - handles calculations and validation
- **Lua Layer (UI)**: Player interaction - shows options and performs timed actions

---

## How Repairs Work

### 1. Defining Repairs (Script Layer)

Items become repairable by having an entry in `fixing.txt`:

```
fixing Fix Axe
{
   Require : Axe,                     // Item type being repaired
   Fixer : Woodglue=2; Woodwork=2,    // Skilled repair (2 woodglue uses, Woodwork 2)
   Fixer : DuctTape=2,                // No-skill repair (2 duct tape uses)
   Fixer : Glue=2,                    // Alternative no-skill repair
   Fixer : Scotchtape=4,              // Emergency repair (4 uses, less efficient)
}
```

**Key Components:**
- `Require` - The item type that can be repaired (must match item script name)
- `Fixer` - Items that can perform the repair, with optional skill requirements
- Each `Fixer` line = one repair option shown to player

**What Happens:**
When the game loads, FixingManager reads all fixing.txt files and stores these definitions in memory. When you right-click an item, it looks up that item's type in this database.

### 2. Calculating Repairs (Java Layer)

The `FixingManager` class handles all repair logic:

**getFixes(item)** - Returns available repair definitions for an item
```lua
local fixes = FixingManager.getFixes(item)  // Returns ArrayList of Fixing objects
// Each Fixing object contains the fixers (repair options) for that item
```

**getCondRepaired(item, player, fixing, fixer)** - Calculates condition restoration %
```lua
local condRestored = FixingManager.getCondRepaired(item, player, fixing, fixer)
// Returns percentage (0-100) of condition that will be restored
// Factors: player skill level, item condition, fixer type, ConditionModifier
```

**getChanceOfFail(item, player, fixing, fixer)** - Calculates failure probability
```lua
local failChance = FixingManager.getChanceOfFail(item, player, fixing, fixer)
// Returns percentage (0-100) chance repair will fail
// Lower skill = higher fail chance
```

**fixItem(item, character, fixing, fixer)** - Performs the actual repair
```lua
FixingManager.fixItem(item, character, fixing, fixer)
// Consumes fixer materials, updates item condition, sets HaveBeenRepaired flag
// This is the final action that actually changes the item
```

**Why Java?**
These calculations are in Java (not Lua) for performance and anti-cheat. Players can't easily modify repair formulas in Java like they could in Lua scripts.

### 3. User Interface (Lua Layer)

When a player right-clicks a damaged item:

**Step-by-step workflow:**

1. **ISInventoryPaneContextMenu** checks if item is broken/damaged
   ```lua
   if item:isBroken() or item:getCondition() < item:getConditionMax() then
       // Item needs repair, show repair menu
   end
   ```

2. **FixingManager.getFixes()** retrieves available repairs
   ```lua
   local fixes = FixingManager.getFixes(item)
   if fixes and not fixes:isEmpty() then
       // We have repair definitions for this item
   end
   ```

3. **Submenu displays repair options** with:
   - Required items and quantities ("2 Duct Tape", "2 Woodglue")
   - Required skill levels ("Woodwork 2")
   - Potential repair percentage ("Repairs 35%")
   - Success chance percentage ("95% chance of success")

4. **Player selects a fixer option**
   - Click "Use Duct Tape" from submenu

5. **ISFixAction queues the timed repair action**
   ```lua
   ISTimedActionQueue.add(ISFixAction:new(player, item, 60, fixing, fixer))
   // 60 ticks = ~2 seconds repair time
   ```

6. **During ISFixAction:perform()**:
   ```lua
   function ISFixAction:perform()
       FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)
       // Actually repairs the item, consumes materials
   end
   ```

**Why Lua?**
UI and player interaction are in Lua because it's easier to mod and customize. You can add custom repair menus or modify repair times without touching Java.

---

## Condition System

### Item Properties

Weapons have these durability-related properties in their script definitions:

```
item Axe
{
    Type = Weapon,
    DisplayName = Axe,
    ConditionMax = 15,                      // Maximum condition value (durability pool)
    ConditionLowerChanceOneIn = 15,         // Degradation rate (higher = more durable)
                                           // 1-in-15 chance per hit = 6.67% chance to lose 1 condition
    // ... other properties
}
```

**What These Mean:**
- `ConditionMax = 15`: Axe has 15 durability points total
- `ConditionLowerChanceOneIn = 15`: Each hit has 1-in-15 (6.67%) chance to lose 1 point
- **Expected lifespan**: 15 hits/point × 15 points = ~225 hits before breaking

### Condition States

| Condition | State | What Happens |
|-----------|-------|--------------|
| `condition == ConditionMax` | Perfect condition | No repair option shown |
| `0 < condition < ConditionMax` | Damaged (repairable) | "Repair" option appears in context menu |
| `condition == 0` | Broken (`isBroken() == true`) | Still repairable, but "Broken" icon shown |

**Key Point:** Even broken items (condition = 0) can be repaired. The condition system uses a 0-100 scale internally, but items can have different max values.

### Condition Degradation

When using a weapon, condition loss is calculated as:

```lua
-- Per weapon hit (from WeaponHitCharacter.lua)
if ZombRand(item:getConditionLowerChance() * 2 + character:getMaintenanceMod() * 2) == 0 then
    -- Weapon degrades
    item:setCondition(item:getCondition() - 1)  // Lose 1 condition point
else
    -- No degradation, reward player with XP
    character:getXp():AddXP(Perks.Maintenance, 1)  // Gain Maintenance skill
end
```

**Example Calculation:**
- Axe: `ConditionLowerChanceOneIn = 15`
- Player: Maintenance level 5 (modifier ~2.5)
- Formula: `ZombRand((15 * 2) + (2.5 * 2))` = `ZombRand(35)`
- Degradation chance: 1 in 35 = **2.86%** (much better than base 6.67%)
- **Result**: 97.14% chance to gain Maintenance XP instead of losing condition

**Factors:**
- Higher `ConditionLowerChanceOneIn` = less frequent degradation (confusing name!)
- Higher Maintenance skill = less frequent degradation (adds to the roll)
- When degradation doesn't occur, player gains Maintenance XP (reward system)

---

## Skill Requirements

### Common Repair Skills

| Skill | Used For | Why This Skill? |
|-------|----------|-----------------|
| **Woodwork** | Wooden-handled weapons (axes, sledgehammers, bats) | Carpentry knowledge for wood repair |
| **Aiming** | Firearms (pistols, rifles, shotguns) | Gun knowledge for disassembling/reassembling |
| **Mechanics** | Vehicle parts | Mechanical knowledge for car repairs |
| **MetalWelding** | Welded vehicle repairs | Welding skills for metal work |
| **Tailoring** | Clothing patches | Sewing skills for fabric repair |
| **Maintenance** | Passive: reduces condition loss on all weapons | General equipment care knowledge |

**Maintenance vs Other Skills:**
- **Maintenance**: Passive benefit (reduces degradation while using ANY weapon)
- **Other skills**: Required for specific repairs (must have Woodwork 2 to use Woodglue on axe)

### Skill Level Requirements (Examples)

| Weapon Type | Skill | Level Required | Why This Level? |
|-------------|-------|----------------|-----------------|
| Axe (with Woodglue) | Woodwork | 2 | Basic carpentry |
| Pistol | Aiming | 3 | Moderate gun knowledge |
| Shotgun | Aiming | 2 | Simpler mechanism |
| Hunting Rifle | Aiming | 4 | Complex rifle mechanism |
| Assault Rifle | Aiming | 5 | Military-grade complexity |
| Vehicle Engine | Mechanics | Varies by vehicle | More complex = higher level |

**Design Pattern:** More complex/powerful items require higher skills (balance through progression).

---

## Repair Items (Fixers)

### Common Repair Items

| Item | Skill Requirement | Uses | Best For | Effectiveness |
|------|-------------------|------|----------|---------------|
| **Woodglue** | Woodwork 1-2 | 2 | Wooden weapons | **High** (skilled repair) |
| **DuctTape** | None | 2 | General repairs | **Medium** (quick fix) |
| **Glue** | None | 2 | General repairs | **Medium** (quick fix) |
| **Scotchtape** | None | 4 | Emergency repairs | **Low** (inefficient) |
| **Same Weapon Type** | Aiming 2-5 | 1 | Firearms only | **Very High** (parts transfer) |
| **SheetMetal** | Mechanics 2 + MetalWelding 1 | 1 | Vehicle parts | **High** (professional repair) |

**Design Insight:**
- **No-skill fixers (tape/glue)**: Accessible to everyone, medium effectiveness
- **Skilled fixers (woodglue/same weapon)**: Require training, higher effectiveness
- **Emergency fixers (scotchtape)**: Always available, but inefficient (4 uses vs 2)

### Usage Amounts

Fixers have a "uses" value indicating how much is consumed:

```
Fixer : Woodglue=2          // Consumes 2 uses from Woodglue item
Fixer : Scotchtape=4        // Consumes 4 uses from Scotchtape (less efficient)
```

**What "Uses" Means:**
Drainable items (Woodglue, DuctTape, etc.) have a UseDelta property. Each repair consumes that much:
- DuctTape with `UseDelta = 0.1` (10 uses total)
- `Fixer : DuctTape=2` consumes 2 of those 10 uses (20% of the roll)

**Example:**
```lua
-- Before repair:
DuctTape:getUses() = 10     // Full roll

-- After repair with Fixer : DuctTape=2:
DuctTape:getUses() = 8      // 2 uses consumed
```

---

## Special Mechanics

### Firearms Self-Repair

Firearms cannot be repaired with tape or glue. They require the **same weapon type** for parts:

```
fixing Fix Pistol
{
   Require : Pistol,                  // Item being repaired
   Fixer : Pistol; Aiming=3,          // Must use another pistol for parts
                                     // Consumes the fixer pistol entirely
}
```

**Why This Mechanic?**
- Firearms are mechanically complex (can't fix with tape)
- Uses parts from identical weapon (springs, firing pins, extractors)
- Sacrificing one gun to repair another creates meaningful choice
- Requires Aiming skill to disassemble/reassemble

**What Happens:**
1. Player has: Pistol A (damaged, 30 condition) + Pistol B (good, 80 condition)
2. Player repairs Pistol A using Pistol B as fixer
3. Result: Pistol A restored (60 condition), **Pistol B completely removed from inventory**

### GlobalItem (Consumable Tools)

Some repairs require tools that consume fuel/uses but aren't removed:

```
fixing Fix CarGasTank
{
   Require : CarGasTank,              // Vehicle part
   GlobalItem : BlowTorch=2,          // Tool required (loses 2 uses, not removed)
   ConditionModifier : 1.2,           // 20% more effective repair

   Fixer : SheetMetal=1; Mechanics=2; MetalWelding=1,  // Material (consumed)
}
```

**GlobalItem vs Fixer:**
- **GlobalItem**: Tool that loses durability but stays in inventory (blowtorch, wrench)
- **Fixer**: Material that is completely consumed and removed (sheet metal, duct tape)

**Example:**
```lua
-- Before repair:
BlowTorch condition = 100
SheetMetal count = 5

-- After repair:
BlowTorch condition = 98        // Lost 2 condition (GlobalItem : BlowTorch=2)
SheetMetal count = 4            // Consumed 1 sheet (Fixer : SheetMetal=1)
```

### ConditionModifier

Some repairs have effectiveness multipliers:

```
ConditionModifier : 1.2,          // 20% more effective (restores more condition)
ConditionModifier : 0.5,          // 50% less effective (emergency repair)
```

**How It Works:**
```lua
-- Base repair without modifier:
ConditionRestored = 30           // Would restore 30 condition

-- With ConditionModifier : 1.2:
ConditionRestored = 30 * 1.2 = 36  // Restores 36 condition (20% bonus)

-- With ConditionModifier : 0.5:
ConditionRestored = 30 * 0.5 = 15  // Restores 15 condition (50% penalty)
```

**Use Cases:**
- Vehicle welded repairs: `ConditionModifier : 1.2` (professional tool bonus)
- Emergency tape repairs: `ConditionModifier : 0.8` (quick fix penalty)

### HaveBeenRepaired Flag

Items track whether they've been repaired:

```lua
item:getHaveBeenRepaired()      // Returns true if item was repaired before
item:setHaveBeenRepaired(true)  // Set after first repair
```

**What This Does:**
- **Affects XP gain**: Prevents grinding XP by repeatedly breaking/repairing same item
- **May affect repair effectiveness**: Some systems give diminishing returns on repaired items
- **Visual indicator**: UI can show "Repaired" icon to warn players

**Example:**
```lua
-- First repair:
if not item:getHaveBeenRepaired() then
    player:getXp():AddXP(Perks.Mechanics, 5)  // Full XP for first repair
    item:setHaveBeenRepaired(true)            // Mark as repaired
end

-- Subsequent repairs:
if item:getHaveBeenRepaired() then
    player:getXp():AddXP(Perks.Mechanics, 1)  // Reduced XP to prevent grinding
end
```

---

## Repair Limitations

1. **Maximum Condition**: Items cannot exceed their `ConditionMax` value
   - Axe with `ConditionMax = 15` can't be repaired above 15 condition
   - Repairs cap at max, excess is wasted

2. **Skill Requirements**: Must meet minimum skill level for skilled repairs
   - Woodglue repair requires Woodwork 2 - option is grayed out if you don't have it
   - Can still use no-skill options (DuctTape) even at skill level 0

3. **Item Availability**: Must have required fixer items in inventory
   - No Woodglue in inventory = can't use Woodglue repair option
   - Fixer must have enough uses (can't use depleted DuctTape roll)

4. **Success Chance**: Repairs can fail based on skill level
   - Lower skill = higher failure chance
   - Failure still consumes materials but doesn't restore condition
   - Firearms: failure is rare with sufficient Aiming skill
   - Vehicles: failure can damage part further (lose 5-10 condition)

5. **Failure Penalties**: Failed vehicle part repairs cost 5-10 condition points
   - Vehicle repairs are high-risk: failure makes part worse
   - Melee weapons: failure just wastes materials (no penalty to item)

---

## Common Mistakes

### ❌ Wrong: Fixing Definition Without Matching Item

```
fixing Fix MyCustomAxe
{
   Require : MyCustomAxe,             // Item type name
   Fixer : Woodglue=2; Woodwork=2,
   Fixer : DuctTape=2,
}

// But in item script:
module MyMod
{
    item CustomAxe                    // WRONG! Name mismatch
    {
        Type = Weapon,
        DisplayName = Custom Axe,
    }
}
```

**Why it's wrong:** The `Require : MyCustomAxe` in fixing.txt must EXACTLY match the item name in your item script. Here, fixing.txt says `MyCustomAxe` but the item is named `CustomAxe` - this mismatch means the repair won't be found.

✅ **Right:**

```
// Option 1: Match fixing.txt to item name
fixing Fix CustomAxe                  // Matches item name exactly
{
   Require : CustomAxe,               // Matches item name exactly
   Fixer : Woodglue=2; Woodwork=2,
   Fixer : DuctTape=2,
}

item CustomAxe                        // Item name
{
    Type = Weapon,
    DisplayName = Custom Axe,
}

// Option 2: Include module prefix if needed
fixing Fix MyMod.CustomAxe
{
   Require : MyMod.CustomAxe,         // Full module.item path
   Fixer : Base.Woodglue=2; Woodwork=2,
   Fixer : Base.DuctTape=2,
}
```

**Rule:** The `Require` value must match the item's full name (with module prefix if item is in a custom module).

### ❌ Wrong: Calling FixingManager Without Validation

```lua
function MyRepair:perform()
    -- Directly call fixItem without checking anything
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)  // WRONG! No validation
    ISBaseTimedAction.perform(self)
end
```

**Why it's wrong:** Looking at vanilla ISFixAction, it ALWAYS validates before calling `fixItem()`. Without validation, you risk:
- Calling fixItem on nil values (crash)
- Repairing items no longer in inventory (duplication exploit)
- Consuming materials that don't exist (negative item counts)

✅ **Right:**

```lua
function MyRepair:perform()
    -- Validate everything before calling Java API
    if not self.item then
        ISBaseTimedAction.perform(self)
        return
    end

    if not self.character:getInventory():contains(self.item) then
        -- Item was dropped/moved during repair action
        ISBaseTimedAction.perform(self)
        return
    end

    if not self.character:getInventory():contains(self.fixer) then
        -- Fixer material was used/dropped during action
        ISBaseTimedAction.perform(self)
        return
    end

    -- All validated, safe to repair
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)
    ISBaseTimedAction.perform(self)
end
```

**Validation Checklist:**
- Item exists and is in inventory
- Fixer exists and is in inventory
- Character still has required skill level
- Fixing and fixer objects are not nil

### ❌ Wrong: Assuming Repairs Always Succeed

```lua
function MyRepair:perform()
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)

    -- Assume repair succeeded
    self.character:Say("Weapon fully repaired!")  // WRONG! Repair might have failed
end
```

**Why it's wrong:** Repairs have a success chance based on skill level. Lower skill = higher failure chance. The repair might fail, consuming materials but NOT restoring condition.

✅ **Right:**

```lua
function MyRepair:perform()
    local conditionBefore = self.item:getCondition()

    -- Perform repair
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)

    local conditionAfter = self.item:getCondition()

    if conditionAfter > conditionBefore then
        -- Repair succeeded
        self.character:Say("Successfully repaired weapon!")
    else
        -- Repair failed (materials consumed but no condition restored)
        self.character:Say("Repair failed, but I learned something...")
    end

    ISBaseTimedAction.perform(self)
end
```

**Check Success:**
- Compare condition before and after repair
- If condition increased, repair succeeded
- If condition unchanged, repair failed (materials still consumed)

### ❌ Wrong: Not Handling GlobalItem Tools

```lua
fixing Fix MyMetalWeapon
{
   Require : MyMetalWeapon,
   GlobalItem : BlowTorch=2,          // Requires blowtorch
   Fixer : SheetMetal=1; MetalWelding=2,
}

-- But in Lua repair code:
function MyRepair:isValid()
    -- Check for fixer (SheetMetal)
    return self.character:getInventory():contains(self.fixer)  // WRONG! Forgot to check GlobalItem
end
```

**Why it's wrong:** If the repair has a `GlobalItem` requirement (like BlowTorch), you must check that the player has it before allowing the repair. Vanilla ISFixAction checks for both fixer AND global item.

✅ **Right:**

```lua
function MyRepair:isValid()
    if not ISBaseTimedAction.isValid(self) then
        return false
    end

    -- Check fixer material exists
    if not self.character:getInventory():contains(self.fixer) then
        return false
    end

    -- Check GlobalItem if repair requires it
    if self.fixing:getGlobalItem() then
        local globalItem = self.character:getInventory():getItemFromType(self.fixing:getGlobalItem())
        if not globalItem then
            return false  // Missing required tool
        end

        if globalItem:getUsedDelta() <= 0 then
            return false  // Tool is depleted
        end
    end

    return true
end
```

**GlobalItem Checks:**
- Does player have the tool? (`getItemFromType()`)
- Does tool have enough uses? (`getUsedDelta() > 0`)
- Both fixer AND global item must be validated

---

## Try It Yourself

Let's trace through a complete repair workflow to understand how all three layers work together.

### Step 1: The Setup

You have:
- Custom Axe (damaged, 5/15 condition)
- Duct Tape (full roll, 10 uses)
- Woodglue (half used, 5 uses)
- Woodwork skill level 2

Fixing definition:
```
fixing Fix CustomAxe
{
   Require : CustomAxe,               // Your custom axe
   Fixer : Woodglue=2; Woodwork=2,    // Skilled repair (2 woodglue, Woodwork 2)
   Fixer : DuctTape=2,                // Quick repair (2 duct tape, no skill)
}
```

### Step 2: Right-Click the Damaged Axe

**What happens in ISInventoryPaneContextMenu:**

```lua
-- Step 2.1: Check if item needs repair
if item:getCondition() < item:getConditionMax() then
    -- Item is damaged (5 < 15), show repair menu

    -- Step 2.2: Get repair definitions from FixingManager (Java)
    local fixes = FixingManager.getFixes(item)
    -- Returns: Fixing object with Require=CustomAxe

    if fixes and not fixes:isEmpty() then
        -- Step 2.3: Loop through each fixer option
        for i=0, fixes:size()-1 do
            local fixing = fixes:get(i)
            local fixers = fixing:getFixers()  // Get list of fixer options

            for j=0, fixers:size()-1 do
                local fixer = fixers:get(j)

                -- Step 2.4: Check if player has this fixer
                local fixerItem = player:getInventory():getItemFromType(fixer:getFixerName())

                if fixerItem then
                    -- Step 2.5: Calculate repair preview
                    local condRestored = FixingManager.getCondRepaired(item, player, fixing, fixer)
                    local failChance = FixingManager.getChanceOfFail(item, player, fixing, fixer)

                    -- Step 2.6: Build menu text
                    local menuText = "Use " .. fixerItem:getDisplayName()
                    menuText = menuText .. " (Repairs " .. condRestored .. "%)"
                    menuText = menuText .. " (" .. (100 - failChance) .. "% success)"

                    -- Step 2.7: Add to submenu
                    subMenu:addOption(menuText, player, doRepair, item, fixing, fixer)
                end
            end
        end
    end
end
```

**What You See:**
- "Repair Custom Axe" submenu appears
  - "Use Woodglue (Repairs 35%) (95% success)" [Woodwork 2 required]
  - "Use Duct Tape (Repairs 25%) (90% success)"

### Step 3: Select "Use Woodglue"

**What happens when you click:**

```lua
function doRepair(player, item, fixing, fixer)
    -- Step 3.1: Create timed action (Lua)
    local action = ISFixAction:new(player, item, 60, fixing, fixer)
    -- 60 ticks = ~2 seconds repair time

    -- Step 3.2: Queue the action
    ISTimedActionQueue.add(action)
    -- Player sees repair animation, can't move
end
```

**What You See:**
- Repair progress bar appears
- Character plays "use item" animation for ~2 seconds

### Step 4: Repair Completes

**What happens in ISFixAction:perform():**

```lua
function ISFixAction:perform()
    -- Step 4.1: Final validation
    if not self.item or not self.character:getInventory():contains(self.item) then
        ISBaseTimedAction.perform(self)  // Cancel if item missing
        return
    end

    -- Step 4.2: Call Java FixingManager to actually repair
    FixingManager.fixItem(self.item, self.character, self.fixing, self.fixer)
    -- This does:
    -- - Rolls success chance (95% for Woodglue + Woodwork 2)
    -- - If success: Calculates condition restored (35% of max = 5.25 points)
    -- - Updates item condition: 5 → 10.25 (capped at 15 max)
    -- - Consumes 2 Woodglue uses: 5 uses → 3 uses
    -- - Sets HaveBeenRepaired flag on item
    -- - Grants Maintenance XP to player

    -- Step 4.3: Play sound
    self.character:playSound("RepairItem")

    -- Step 4.4: Clean up
    ISBaseTimedAction.perform(self)
end
```

**What You See:**
- Repair sound plays
- Axe condition: 5 → 10 (restored ~35%)
- Woodglue uses: 5 → 3 (consumed 2 uses)
- Maintenance skill gains XP

### Step 5: Verify the Result

**Check in-game:**
1. Hover over Custom Axe: Shows condition 10/15 (was 5/15)
2. Hover over Woodglue: Shows 3/10 uses remaining (was 5/10)
3. Check Skills menu: Maintenance XP increased
4. Axe tooltip shows "Repaired" icon (HaveBeenRepaired flag set)

### Why This Works

**Three layers working together:**

1. **Script Layer (fixing.txt)**:
   - Defined `Require : CustomAxe` matching your item
   - Provided two repair options (Woodglue, DuctTape)
   - Set skill requirements (Woodwork 2 for Woodglue)

2. **Java Layer (FixingManager)**:
   - Found repair definition via `getFixes()`
   - Calculated 35% restoration via `getCondRepaired()`
   - Calculated 95% success via `getChanceOfFail()`
   - Executed repair via `fixItem()` - consumed materials, updated condition

3. **Lua Layer (UI + Actions)**:
   - Displayed repair options in context menu
   - Showed preview (35% repair, 95% success)
   - Created timed action (ISFixAction)
   - Validated materials, called Java repair, played animation

**The key insight:** Each layer has a specific job. Script defines possibilities, Java calculates results, Lua presents options and executes actions.

---

## Next Steps

Now that you understand how the repair system works:

1. See [Fixing.txt Anatomy](fixing-txt-anatomy) for complete syntax guide
2. Check [Repair Items Reference](repair-items-reference) for all vanilla fixers
3. Read [Lua Repair Mechanics](lua-repair-mechanics) for detailed Lua workflow
4. Study [Repair Formulas](repair-formulas) for mathematical calculations
