---
id: vanilla-recipe-anatomy
slug: vanilla-recipe-anatomy
title: Vanilla Recipe Anatomy - Complete Parameter Reference
excerpt: This document provides a complete breakdown of all parameters available in Project Zomboid recipes, based on vanilla game recipes. module ModuleName { imports { Base } recipe [Recipe Name] { // INPUT...
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: intermediate
tags:
  - lua
  - recipe
  - item
  - weapon
  - event
  - animation
  - sound
  - crafting
last_updated: 2026-01-09
---
# Vanilla Recipe Anatomy - Complete Parameter Reference

## Overview
This document provides a complete breakdown of all parameters available in Project Zomboid recipes, based on vanilla game recipes.

## Complete Recipe Template

```
module ModuleName {
    imports {
        Base
    }

    recipe [Recipe Name] {
        // INPUT SECTION (order matters)
        [keep] InputItem1/AlternativeItem1,
        [keep] InputItem2=quantity,
        [keep] [Recipe.GetItemTypes.Type],

        // OUTPUT SECTION
        Result:OutputItem,
        // OR
        Result:OutputItem=quantity,

        // CORE PARAMETERS
        Time:number,
        Category:CategoryName,
        Sound:SoundName,

        // OPTIONAL REQUIREMENTS
        NearItem:ObjectName,
        SkillRequired:SkillName=level,
        NeedToBeLearn:boolean,

        // CALLBACKS & SCRIPTING
        OnGiveXP:FunctionName,
        OnCreate:FunctionName,
        OnTest:FunctionName,
        OnCanPerform:FunctionName,

        // ANIMATION
        AnimNode:AnimationName,
        Prop1:ItemOrSource,
        Prop2:ItemOrSource,

        // ITEM BEHAVIOR
        CanBeDoneFromFloor:boolean,
        AllowFrozenItem:boolean,
        AllowRottenItem:boolean,
    }
}
```

## Parameter Descriptions

### Input Section

#### Basic Input
```
InputItem,                // Single item, consumed
InputItem=5,              // 5 units required, consumed
keep Tool,                // Reusable tool
```

#### Alternative Items (OR Logic)
```
Item1/Item2/Item3,        // Any one of these items works
Screwdriver/Knife,        // Either screwdriver OR knife
```

#### Item Type Matching
```
[Recipe.GetItemTypes.Hammer],     // Any item tagged as "Hammer"
[Recipe.GetItemTypes.Saw],        // Any item tagged as "Saw"
[Recipe.GetItemTypes.BluntWeapon], // Any blunt weapon
```

**Common Item Types:**
- `Hammer`
- `Saw`
- `Screwdriver`
- `Pliers`
- `WeldingMask`
- `BluntWeapon`
- `BladeWeapon`

### Output Section

#### Result
**Purpose:** Defines what item(s) the recipe creates

**Syntax:**
```
Result:OutputItem,           // Single item
Result:OutputItem=10,        // 10 items
```

**Examples:**
```
Result:Bullets9mm=10,        // Creates 10 bullets
Result:Plank=3,              // Creates 3 planks
Result:SpikedBat,            // Creates 1 spiked bat
```

### Core Parameters

#### Time
**Purpose:** How long the recipe takes to complete

**Unit:** Game ticks (roughly 1 tick = 1 second of real time at normal speed)

**Syntax:**
```
Time:100.0,                  // 100 game ticks
Time:230.0,                  // 230 ticks (about 3-4 minutes)
```

**Typical Values:**
- Quick actions: 10-50 ticks
- Simple crafts: 100-200 ticks
- Complex crafts: 300-500 ticks
- Major builds: 1000+ ticks

#### Category
**Purpose:** Where the recipe appears in the crafting UI

**Syntax:**
```
Category:CategoryName,
```

**Available Categories:**
- `Carpentry` - Woodworking
- `Cooking` - Food preparation
- `Electrical` - Electronic devices
- `Farming` - Agriculture
- `FirstAid` - Medical items
- `Fishing` - Fishing equipment
- `Metalwork` - Metal crafting
- `Tailoring` - Clothing/fabric
- `Weapons` - Weapon crafting
- `Chemistry` - Chemical/scientific

**Example:**
```
Category:Weapons,
```

#### Sound
**Purpose:** Audio played during crafting

**Syntax:**
```
Sound:SoundName,
```

**Common Sounds:**
- `Hammering`
- `Sawing`
- `Cooking`
- `Sewing`
- `Metalwork`
- `Forge`
- `Anvil`
- `BoxOfRoundsOpenOne`
- `ShotgunCrafting`
- `AmmoCrafting2`

### Optional Requirements

#### NearItem
**Purpose:** Requires player to be near a specific object/furniture

**Syntax:**
```
NearItem:ObjectName,
NearItem:Table1/Table2,      // Either table works
```

**Examples:**
```
NearItem:Armory Table,       // Enhanced Crafting table
NearItem:DogHouse,           // Vanilla object
NearItem:campfire,           // Vanilla campfire
```

#### SkillRequired
**Purpose:** Minimum skill level needed to craft

**Syntax:**
```
SkillRequired:SkillName=level,
```

**Available Skills:**
- `Carpentry`
- `Cooking`
- `Farming`
- `FirstAid`
- `Electrical`
- `MetalWelding`
- `Mechanics`
- `Tailoring`
- `Aiming`
- `Reloading`

**Examples:**
```
SkillRequired:MetalWelding=3,
SkillRequired:Carpentry=5,
SkillRequired:Cooking=2,
```

#### NeedToBeLearn
**Purpose:** Recipe requires reading a recipe book/magazine first

**Syntax:**
```
NeedToBeLearn:true,          // Requires learning
NeedToBeLearn:false,         // Available by default
```

**Example:**
```
recipe Advanced Weapon Mod {
    InputItems,
    Result:Output,
    NeedToBeLearn:true,      // Must find recipe book first
}
```

### Callbacks & Scripting

#### OnGiveXP
**Purpose:** Custom XP reward function

**Syntax:**
```
OnGiveXP:FunctionName,
```

**Vanilla Examples:**
```
OnGiveXP:Recipe.OnGiveXP.SawLogs,
OnGiveXP:Give25MWXP,
OnGiveXP:Give10MWXP,
```

**Effect:** Calls a Lua function to award skill XP to the player

#### OnCreate
**Purpose:** Custom function called when item is created

**Syntax:**
```
OnCreate:FunctionName,
```

**Vanilla Example:**
```
OnCreate:Recipe.OnCreate.SpikedBat,
```

**Use Cases:**
- Set custom item properties
- Add random variations
- Trigger events
- Special effects

#### OnTest
**Purpose:** Custom function to test if recipe should be available

**Syntax:**
```
OnTest:FunctionName,
```

**Use Cases:**
- Complex availability logic
- Check inventory for special items
- Weather/time-based crafting
- Mod compatibility checks

#### OnCanPerform
**Purpose:** Test if player can perform recipe right now

**Syntax:**
```
OnCanPerform:FunctionName,
```

### Animation Parameters

#### AnimNode
**Purpose:** Animation to play while crafting

**Syntax:**
```
AnimNode:AnimationName,
```

**Common Animations:**
- `BuildHigh` - Hammering upward
- `BuildLow` - Working downward
- `BuildMid` - Working at mid-level
- `Disassemble` - Taking apart
- `SawLog` - Sawing motion
- `BlowTorchMid` - Welding
- `Drink` - Drinking/pouring

**Example:**
```
AnimNode:BuildHigh,
```

#### Prop1 / Prop2
**Purpose:** Items to display in player's hands during animation

**Syntax:**
```
Prop1:ItemName,              // Show specific item
Prop1:Source=1,              // Show first input item
Prop2:Source=2,              // Show second input item
```

**Examples:**
```
Prop1:Hammer,                // Show hammer in hand
Prop2:Source=1,              // Show first input item
```

```
Prop1:BlowTorch,             // Show blowtorch
Prop2:Source=2,              // Show second input
```

### Item Behavior Parameters

#### CanBeDoneFromFloor
**Purpose:** Allow crafting with items on the ground (not in inventory)

**Syntax:**
```
CanBeDoneFromFloor:true,
```

**Example:**
```
recipe Saw Logs {
    Log,
    keep [Recipe.GetItemTypes.Saw],

    CanBeDoneFromFloor:true, // Can saw logs on the ground
    Result:Plank=3,
    Time:230.0,
}
```

#### AllowFrozenItem
**Purpose:** Allow frozen ingredients

**Syntax:**
```
AllowFrozenItem:true,
```

**Use Case:** Cooking recipes that work with frozen food

#### AllowRottenItem
**Purpose:** Allow rotten/spoiled ingredients

**Syntax:**
```
AllowRottenItem:true,
```

**Use Case:** Composting, bait making

## Complete Real-World Example

### Vanilla Recipe: Saw Logs
```
recipe Saw Logs {
    Log,
    keep [Recipe.GetItemTypes.Saw],

    CanBeDoneFromFloor:true,
    Result:Plank=3,
    Sound:Sawing,
    Time:230.0,
    Category:Carpentry,
    OnGiveXP:Recipe.OnGiveXP.SawLogs,
    AnimNode:SawLog,
    Prop1:Source=2,
    Prop2:Log,
}
```

**Breakdown:**
- **Input:** 1 Log (consumed), 1 Saw (kept)
- **Output:** 3 Planks
- **Time:** 230 ticks
- **Can be done from floor:** Yes
- **Sound:** Sawing
- **Animation:** SawLog with saw in hand
- **XP:** Carpentry XP via callback
- **Category:** Appears in Carpentry menu

### Mod Recipe: Scrap Guns Weapon Assembly
```
recipe Assemble Double Barrel Shotgun {
    AirTank,
    SheetMetal,
    MetalPipe/LeadPipe,
    LeadPipe/MetalPipe,
    Plank,
    LeatherStrips=5,
    BlowTorch=1,
    Wire=2,
    keep [Recipe.GetItemTypes.Pliers],
    keep [Recipe.GetItemTypes.WeldingMask],
    keep [Recipe.GetItemTypes.Hammer],
    keep [Recipe.GetItemTypes.Saw],

    Result:HDBS,
    Sound:ShotgunCrafting,
    Time:1900,
    Category:Weapons,
    SkillRequired:MetalWelding=3,
    OnGiveXP:Give25MWXP,
    AnimNode:BlowTorchMid,
    Prop1:BlowTorch,
    NeedToBeLearn:true,
}
```

**Breakdown:**
- **Inputs:** 8 consumed items, 4 kept tools
- **Alternatives:** MetalPipe OR LeadPipe (need 2 pipes)
- **Output:** 1 HDBS (shotgun)
- **Time:** 1900 ticks (long craft)
- **Skill Required:** MetalWelding level 3
- **Needs Learning:** Must read recipe first
- **Animation:** Welding with blowtorch
- **XP:** 25 MetalWelding XP
- **Category:** Weapons

## Parameter Priority

When multiple parameters conflict:
1. **OnTest** - Checked first (can hide recipe)
2. **SkillRequired** - Checked if recipe visible
3. **NeedToBeLearn** - Checked if skill met
4. **NearItem** - Checked when attempting craft
5. **OnCanPerform** - Final check before crafting

## Source Files
- **Vanilla Recipes:** `R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\recipes.txt`
- **Scrap Guns Recipes:** Workshop ID 2125659488
- **Research Date:**  
