---
id: weapon-repair-repair-items-reference
slug: repair-items-reference
title: "Repair Items Reference (Fixers)"
game: pz
version: build-41
section: modding
category: weapon-repair
subcategory: null
difficulty: intermediate
tags:
  - lua
  - recipe
  - item
  - repair
  - weapon
  - items
  - reference
excerpt: "Complete reference for repair items (fixers) in Project Zomboid - organized by category with usage patterns, skill requirements, and modding examples for creating custom repair materials."
table_of_contents:
  - text: "Introduction"
    link: "#introduction"
  - text: "How to Use This Reference"
    link: "#how-to-use-this-reference"
  - text: "Common Repair Materials"
    link: "#common-repair-materials"
  - text: "Woodglue"
    link: "#woodglue"
  - text: "DuctTape"
    link: "#ducttape"
  - text: "Glue"
    link: "#glue"
  - text: "Scotchtape"
    link: "#scotchtape"
  - text: "Nails"
    link: "#nails"
  - text: "Firearm Repair Items"
    link: "#firearm-repair-items"
  - text: "Same Weapon Type"
    link: "#same-weapon-type"
  - text: "Vehicle Repair Items"
    link: "#vehicle-repair-items"
  - text: "BlowTorch"
    link: "#blowtorch"
  - text: "SheetMetal / SmallSheetMetal"
    link: "#sheetmetal-smallsheetmetal"
  - text: "Clothing Repair Items"
    link: "#clothing-repair-items"
  - text: "Fabric (Various Types)"
    link: "#fabric-various-types"
  - text: "Thread"
    link: "#thread"
  - text: "Needle"
    link: "#needle"
  - text: "Item Distribution"
    link: "#item-distribution"
  - text: "Repair Material Efficiency"
    link: "#repair-material-efficiency"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Tips for Modders"
    link: "#tips-for-modders"
last_updated: 2026-01-18
---

# Repair Items Reference (Fixers)

## Introduction

You're creating a repair system for your custom weapon and need to know which fixer items to use. Or you're looking at fixing.txt and see `Fixer : Woodglue=2; Woodwork=2` and wonder what makes Woodglue different from DuctTape. Or maybe you're trying to decide whether your repair mod should require rare materials or common ones, and you need to understand what's available.

If you're confused about repair items (fixers), you're not alone. Project Zomboid has dozens of repair materials spread across different categories (melee weapon fixers, firearm fixers, vehicle fixers, clothing fixers), each with different effectiveness, skill requirements, and availability. Figuring out which items can repair what, why firearms use other firearms for parts, and why some materials require 2 uses while others need 4 can feel overwhelming.

Here's the good news: once you understand the vanilla fixer categories and their patterns, you can make informed decisions for your own repair mods. This reference organizes all repair items by category, shows their usage patterns, and helps you quickly find the right fixer for your needs.

---

## How to Use This Reference

This is a lookup guide for repair items. Use it to:

### Step 1: Identify Your Repair Category
- **Making a melee weapon?** → Check Common Repair Materials
- **Making a firearm?** → Check Firearm Repair Items
- **Making a vehicle part?** → Check Vehicle Repair Items
- **Making clothing?** → Check Clothing Repair Items

### Step 2: Compare Fixer Properties
Look at the comparison tables in each category to understand:
- **Usage amount** (how many uses consumed per repair)
- **Skill requirements** (Woodwork, Aiming, Mechanics, etc.)
- **Effectiveness** (better materials repair more condition)

### Step 3: Choose Your Fixer
Pick a fixer that matches your item's theme and difficulty:
- **No-skill repairs** → DuctTape, Glue, Scotchtape (anyone can use)
- **Skilled repairs** → Woodglue, Same-weapon-type, SheetMetal (better results)
- **Balanced approach** → Offer both options in your fixing definition

---

## Common Repair Materials

### Woodglue

**Properties:**
- Requires: Woodwork skill (Level 1-2 depending on item)
- Usage: 2 uses per repair (typical)
- Best for: Wooden-handled weapons

**Used to Repair:**
- Axes (Axe, HandAxe, WoodAxe, PickAxe)
- Sledgehammers
- Baseball Bats
- Spears
- Other wooden tools

**Advantages:**
- Most effective for wooden weapons
- Better repair quality with Woodwork skill

**Example Usage:**
```
fixing Fix Axe
{
   Require : Axe,                     // Item being repaired
   Fixer : Woodglue=2; Woodwork=2,    // 2 woodglue uses, requires Woodwork 2
   Fixer : DuctTape=2,                // Alternative: no skill required
}
```

### DuctTape

**Properties:**
- Requires: No skill
- Usage: 2 uses per repair (typical)
- Best for: Quick repairs on any item

**Used to Repair:**
- Most melee weapons
- Sports equipment
- Garden tools
- Musical instruments

**Advantages:**
- No skill requirement (anyone can use)
- Universally available (found in many locations)
- Quick and easy emergency repairs

**Example Usage:**
```
fixing Fix BaseballBat
{
   Require : BaseballBat,             // Item being repaired
   Fixer : DuctTape=2,                // 2 uses, no skill needed
   Fixer : Glue=2,                    // Alternative general fixer
}
```

### Glue

**Properties:**
- Requires: No skill
- Usage: 2 uses per repair (typical)
- Best for: General repairs

**Used to Repair:**
- Same as DuctTape
- Most non-firearm weapons
- General equipment

**Notes:**
- WoodGlue and Glue are interchangeable in some recipes
- Defined in recipecode.lua as same type
- Found commonly in schools, offices, craft stores

**Example Usage:**
```
fixing Fix GardenFork
{
   Require : GardenFork,              // Garden tool
   Fixer : Glue=2,                    // General purpose glue
   Fixer : DuctTape=2,                // Alternative fixer
}
```

### Scotchtape

**Properties:**
- Requires: No skill
- Usage: 4 uses per repair (typical) - **Less efficient**
- Best for: Emergency repairs when nothing else available

**Used to Repair:**
- Same as DuctTape
- Most melee weapons

**Disadvantages:**
- Requires **double the uses** (4 vs 2) - less efficient
- Last resort material
- Lower repair effectiveness than DuctTape or Glue

**Example Usage:**
```
fixing Fix BaseballBat
{
   Require : BaseballBat,             // Item being repaired
   Fixer : DuctTape=2,                // Preferred: only 2 uses
   Fixer : Glue=2,                    // Alternative: also 2 uses
   Fixer : Scotchtape=4,              // Last resort: requires 4 uses
}
```

### Nails

**Properties:**
- Requires: No skill
- Usage: Varies by recipe
- Best for: Nailed weapon variants

**Used to Repair:**
- BaseballBatNails
- PlankNail
- Other nailed weapon variants

**Example Usage:**
```
fixing Fix BaseballBatNails
{
   Require : BaseballBatNails,        // Nailed baseball bat variant
   Fixer : Nails=10,                  // 10 nails required for repair
   Fixer : DuctTape=2,                // Alternative: tape repair
}
```

---

## Firearm Repair Items

Firearms use a unique self-repair system where the **same weapon type** is consumed for parts.

### Same Weapon Type

**Why Firearms Are Different:**
- Firearms can't be repaired with tape or glue (mechanical complexity)
- Instead, they use parts from identical weapon types
- Requires Aiming skill to disassemble and transfer parts
- The fixer weapon is **completely consumed** (removed from inventory)

**Pistols:**
```
fixing Fix Pistol
{
   Require : Pistol,                  // Item being repaired
   Fixer : Pistol; Aiming=3,          // Consume one pistol, requires Aiming 3
}
```
- Consume one pistol to repair another
- Requires Aiming skill level 3
- Useful for: Salvaging parts from damaged weapons

**Shotguns:**
```
fixing Fix Shotgun
{
   Require : Shotgun,                 // Item being repaired
   Fixer : Shotgun; Aiming=2,         // Use same shotgun type
   Fixer : ShotgunSawnoff; Aiming=2,  // Cross-compatible with sawn-off
}

fixing Fix ShotgunSawnoff
{
   Require : ShotgunSawnoff,          // Sawn-off variant
   Fixer : ShotgunSawnoff; Aiming=2,  // Use same type
   Fixer : Shotgun; Aiming=2,         // Or use regular shotgun for parts
}
```
- Shotgun and ShotgunSawnoff can repair each other (cross-compatible)
- Requires Aiming skill level 2
- **Design insight:** Sawn-off shotguns share parts with regular shotguns

**Rifles:**
```
fixing Fix HuntingRifle
{
   Require : HuntingRifle,            // Item being repaired
   Fixer : HuntingRifle; Aiming=4,    // Use same rifle type
   Fixer : VarmintRifle; Aiming=4,    // Cross-compatible with varmint rifle
}
```
- Requires Aiming skill level 4
- HuntingRifle and VarmintRifle are cross-compatible

**Assault Rifles:**
```
fixing Fix AssaultRifle
{
   Require : AssaultRifle,            // Item being repaired
   Fixer : AssaultRifle; Aiming=5,    // Use same type
   Fixer : AssaultRifle2; Aiming=5,   // Cross-compatible with variant
}
```
- Requires Aiming skill level 5 (highest skill requirement)
- Most complex firearm repair

**Revolvers:**
```
fixing Fix Revolver
{
   Require : Revolver,                // Item being repaired
   Fixer : Revolver; Aiming=2,        // Use same type
   Fixer : Revolver_Long; Aiming=2,   // Cross-compatible with long variant
   Fixer : Revolver_Short; Aiming=2,  // Cross-compatible with short variant
}
```
- All revolver types can repair each other (most flexibility)
- Requires Aiming skill level 2

---

## Vehicle Repair Items

### BlowTorch

**Properties:**
- Type: **GlobalItem** (fuel consumed, tool not removed)
- Usage: 2 uses per welded repair
- Requires: MetalWelding + Mechanics skills
- Not consumed, but loses durability

**Used to Repair:**
- Gas tanks
- Engine hoods
- Trunk lids
- Doors (welded variants)
- Most vehicle body parts

**Example Usage:**
```
fixing Fix CarGasTank
{
   Require : CarGasTank,                           // Vehicle part being repaired
   GlobalItem : BlowTorch=2,                       // Tool (loses 2 uses, not consumed)
   ConditionModifier : 1.2,                        // 20% more effective repair

   Fixer : SheetMetal=1; Mechanics=2; MetalWelding=1,      // Material consumed
   Fixer : SmallSheetMetal=2; Mechanics=2; MetalWelding=1, // Alternative (2x small)
}
```

**Key Distinction:**
- `GlobalItem` = Tool that loses durability (stays in inventory)
- `Fixer` = Material that is consumed (removed from inventory)

### SheetMetal / SmallSheetMetal

**Properties:**
- Standard material for welded repairs
- SheetMetal: 1 use, SmallSheetMetal: 2 uses (balance)
- Requires: Mechanics 2 + MetalWelding 1-3

**Used to Repair:**
- Most vehicle body parts
- Welded components
- Gas tanks, hoods, trunks, doors

**Efficiency Comparison:**
| Material | Uses Required | Equivalent |
|----------|---------------|------------|
| SheetMetal | 1 | Standard |
| SmallSheetMetal | 2 | 0.5x SheetMetal |

**Example Usage:**
```
fixing Fix CarDoor1
{
   Require : CarDoor1,                             // Vehicle door
   GlobalItem : BlowTorch=2,                       // Welding tool required

   Fixer : SheetMetal=1; Mechanics=2; MetalWelding=2,      // Full sheet
   Fixer : SmallSheetMetal=2; Mechanics=2; MetalWelding=2, // Two small pieces
}
```

---

## Clothing Repair Items

### Fabric (Various Types)

**Used with:** Thread + Needle

**Properties:**
- Consumed during patching
- Different fabrics for different results
- Common types: Denim, Leather, RippedSheets

**Example Usage:**
```lua
-- Clothing repairs use Lua recipes, not fixing.txt
-- Example from ISInventoryPaneContextMenu.lua
if item:getCategory() == "Clothing" then
    -- Requires: Needle (tool) + Thread + Fabric (consumed)
    -- Tailoring skill affects repair duration and quality
end
```

### Thread

**Properties:**
- Uses degraded per patch
- Required for all clothing repairs
- Consumable (removed when depleted)

### Needle

**Properties:**
- Required tool (not consumed)
- Enables clothing repair actions
- Must be in inventory to repair clothing

---

## Item Distribution

Repair items can be found in various locations throughout Project Zomboid:

| Item | Common Locations | Rarity |
|------|------------------|--------|
| DuctTape | Warehouses, garages, hardware stores | Common |
| Glue | Schools, offices, craft stores | Common |
| WoodGlue | Warehouses, carpentry shops | Uncommon |
| Scotchtape | Offices, homes, stores | Very Common |
| Nails | Hardware stores, construction sites | Common |
| BlowTorch | Mechanic shops, warehouses | Rare |
| SheetMetal | Junkyards, warehouses, factories | Uncommon |
| Thread | Homes, craft stores, clothing stores | Common |
| Needle | Homes, craft stores, medical facilities | Common |

---

## Repair Material Efficiency

Compare fixer effectiveness for making informed modding decisions:

| Material | Uses Required | Skill Required | Effectiveness | Availability | Best Use Case |
|----------|---------------|----------------|---------------|--------------|---------------|
| Woodglue | 2 | Woodwork 2 | **High** | Uncommon | Wooden weapons (axe, bat) |
| DuctTape | 2 | None | **Medium** | Common | General repairs, no skill |
| Glue | 2 | None | **Medium** | Common | General repairs, no skill |
| Scotchtape | 4 | None | **Low** | Very Common | Emergency only (inefficient) |
| Same Weapon | 1 | Aiming 2-5 | **Very High** | Varies | Firearm repairs only |
| SheetMetal | 1 | Mech 2 + Weld 1 | **High** | Uncommon | Vehicle body parts |

**Design Insight:**
- **Skill-based fixers** (Woodglue, Same Weapon) = Better effectiveness, requires training
- **No-skill fixers** (DuctTape, Glue) = Accessible to everyone, medium effectiveness
- **Emergency fixers** (Scotchtape) = Always available, but inefficient (4 uses vs 2)

---

## Common Mistakes

### ❌ Wrong: Using Tape/Glue for Firearms

```
fixing Fix Pistol
{
   Require : Pistol,
   Fixer : DuctTape=2,                // WRONG! Firearms can't use tape
   Fixer : Glue=2,                    // WRONG! Firearms require same weapon type
}
```

**Why it's wrong:** Looking at vanilla `fixing.txt`, firearms NEVER use DuctTape or Glue. They exclusively use same weapon type for parts. Tape on a pistol makes no mechanical sense - firearms need internal components (springs, firing pins, extractors) from matching weapons.

✅ **Right:**

```
fixing Fix Pistol
{
   Require : Pistol,                  // Item being repaired
   Fixer : Pistol; Aiming=3,          // Use same weapon type for parts
}
```

**Rule:** Firearms must use `Fixer : [SameWeaponType]; Aiming=[Level]` pattern.

### ❌ Wrong: Using GlobalItem for Materials

```
fixing Fix BaseballBat
{
   Require : BaseballBat,
   GlobalItem : DuctTape=2,           // WRONG! DuctTape is a Fixer, not GlobalItem
}
```

**Why it's wrong:** `GlobalItem` is for **tools that lose durability** (BlowTorch, Wrench), not materials that get consumed. DuctTape should be completely removed from inventory after repair (Fixer), not just lose 2 uses.

✅ **Right:**

```
fixing Fix BaseballBat
{
   Require : BaseballBat,             // Item being repaired
   Fixer : DuctTape=2,                // Material consumed (removed after use)
}

// GlobalItem example (for comparison):
fixing Fix CarGasTank
{
   Require : CarGasTank,
   GlobalItem : BlowTorch=2,          // Tool loses 2 uses, stays in inventory
   Fixer : SheetMetal=1; Mechanics=2; MetalWelding=1,  // Material consumed
}
```

**Rule:** Use `GlobalItem` for tools, `Fixer` for materials.

### ❌ Wrong: Inconsistent Uses Amounts

```
fixing Fix MyCustomAxe
{
   Require : MyCustomAxe,
   Fixer : Woodglue=5; Woodwork=2,    // WRONG! Vanilla uses 2, not 5
   Fixer : DuctTape=1,                // WRONG! Vanilla uses 2, not 1
}
```

**Why it's wrong:** Vanilla fixing.txt uses consistent patterns: skilled fixers (Woodglue) = 2 uses, no-skill fixers (DuctTape, Glue) = 2 uses, emergency fixers (Scotchtape) = 4 uses. Deviating breaks player expectations and balance.

✅ **Right:**

```
fixing Fix MyCustomAxe
{
   Require : MyCustomAxe,             // Custom wooden weapon
   Fixer : Woodglue=2; Woodwork=2,    // Follows vanilla pattern (2 uses)
   Fixer : DuctTape=2,                // Follows vanilla pattern (2 uses)
   Fixer : Scotchtape=4,              // Emergency option (4 uses, less efficient)
}
```

**Vanilla Pattern:**
- Skilled materials: 2 uses
- General materials: 2 uses
- Emergency materials: 4 uses

### ❌ Wrong: Missing Skill Requirement for Skilled Fixer

```
fixing Fix Axe
{
   Require : Axe,
   Fixer : Woodglue=2,                // WRONG! Woodglue should require Woodwork skill
}
```

**Why it's wrong:** Vanilla `fixing.txt` **always pairs Woodglue with Woodwork skill** (`Woodglue=2; Woodwork=2`). Woodglue without skill requirement contradicts the design - skilled fixers are meant to reward trained characters with better repairs.

✅ **Right:**

```
fixing Fix Axe
{
   Require : Axe,                     // Wooden weapon
   Fixer : Woodglue=2; Woodwork=2,    // Skilled option (better repair quality)
   Fixer : DuctTape=2,                // No-skill option (accessible to all)
}
```

**Design Pattern:** Offer **both** skilled and no-skill options to give players meaningful choice.

---

## Try It Yourself

Let's create a custom weapon with multiple fixer options to understand how different materials work.

### Step 1: Define Custom Weapon

Create `media/scripts/my_weapon.txt`:

```
module MyMod
{
    imports
    {
        Base                          // Import Base module for vanilla fixers
    }

    item ReinforcedCrowbar
    {
        Type = Weapon,
        DisplayName = Reinforced Crowbar,
        Icon = Crowbar,
        MinDamage = 1.0,              // Slightly better than vanilla crowbar
        MaxDamage = 2.0,
        ConditionMax = 20,            // More durable (vanilla: 15)
        ConditionLowerChanceOneIn = 20,  // Degrades slower
        Categories = Blunt,
    }
}
```

### Step 2: Create Repair Definition with Multiple Fixers

Create `media/scripts/my_fixing.txt`:

```
module MyMod
{
    imports
    {
        Base                          // Import Base module for fixers
    }

    fixing Fix ReinforcedCrowbar
    {
        Require : ReinforcedCrowbar,  // Item being repaired

        // Option 1: Skilled repair (best quality)
        Fixer : Base.MetalFile=1; Maintenance=3,  // Requires Maintenance 3, file consumed

        // Option 2: Standard no-skill repairs (good quality)
        Fixer : Base.DuctTape=2,      // 2 uses, no skill required
        Fixer : Base.Glue=2,          // 2 uses, no skill required

        // Option 3: Emergency repair (lower quality, more uses)
        Fixer : Base.Scotchtape=4,    // 4 uses (less efficient), no skill required
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to spawn items:
   - Type "Reinforced Crowbar" to spawn your weapon
   - Type "Metal File" (skilled fixer)
   - Type "Duct Tape" (no-skill fixer)
   - Type "Scotch Tape" (emergency fixer)
3. Use the crowbar to damage it (attack zombies/objects)
4. Right-click damaged crowbar → "Repair Reinforced Crowbar"

### Step 4: Verify Fixer Behavior

**What You Should See:**

**Repair Menu Shows:**
- ✅ "Use Metal File" (if you have Maintenance 3 skill)
- ✅ "Use Duct Tape" (always available)
- ✅ "Use Glue" (always available)
- ✅ "Use Scotch Tape" (always available, but requires 4 uses)

**After Repair:**
- Metal File: **1 use consumed** from Metal File item (check inventory)
- Duct Tape: **2 uses consumed** from Duct Tape roll
- Scotch Tape: **4 uses consumed** from Scotch Tape roll
- Crowbar condition restored (higher restoration with skilled repair)

**Skill Check:**
- If you DON'T have Maintenance 3: Metal File option is **grayed out**
- If you DO have Maintenance 3: Metal File option is **available** and restores more condition

### Step 5: Experiment with Variations

Try modifying the fixing definition to explore:

**A. Require BlowTorch as GlobalItem:**
```
fixing Fix ReinforcedCrowbar
{
   Require : ReinforcedCrowbar,
   GlobalItem : Base.BlowTorch=2,    // Requires blowtorch (2 uses consumed)
   Fixer : Base.SheetMetal=1; Mechanics=2; MetalWelding=1,  // Welded repair
}
```
- **Result:** Must have BlowTorch in inventory, loses 2 uses but stays

**B. Add Multiple Skill Requirements:**
```
fixing Fix ReinforcedCrowbar
{
   Require : ReinforcedCrowbar,
   Fixer : Base.SheetMetal=1; Mechanics=2; MetalWelding=2,  // Requires BOTH skills
}
```
- **Result:** Player needs both Mechanics 2 AND MetalWelding 2

**C. Use ConditionModifier:**
```
fixing Fix ReinforcedCrowbar
{
   Require : ReinforcedCrowbar,
   ConditionModifier : 1.5,          // 50% more effective repair
   Fixer : Base.DuctTape=2,
}
```
- **Result:** Repair restores 50% more condition than normal

### Why This Works

This repair definition follows vanilla patterns:

1. **Multiple fixer options** give players choice (skilled vs accessible)
2. **Skill requirements** reward trained characters with better repairs
3. **Usage amounts** follow vanilla conventions (2 for standard, 4 for emergency)
4. **Module imports** properly reference Base module fixers
5. **Item types** match the weapon's theme (metal tool = metal fixers make sense)

---

## Tips for Modders

### Defining Custom Fixers

You can use any item as a fixer in your mod:

```
module MyMod
{
    imports
    {
        Base                          // Import Base module for vanilla items
    }

    item CustomRepairKit
    {
        Type = Normal,
        DisplayName = Weapon Repair Kit,
        Icon = RepairKit,
        Weight = 0.5,
        UseDelta = 0.1,               // Degrades with use (10 uses total)
    }

    fixing Fix MyWeapon
    {
        Require : MyWeapon,           // Your custom weapon
        Fixer : CustomRepairKit=1; Maintenance=2,  // 1 use of custom kit, requires skill
        Fixer : Base.DuctTape=2,      // Alternative: vanilla fixer (no skill)
    }
}
```

**Design Considerations:**
- **Custom repair kits** let you control rarity (spawn rates)
- **UseDelta** determines how many repairs before kit is depleted
- **Skill requirements** gate effectiveness for progression

### Creating Repair Kits

Define a custom item that serves as a dedicated repair material:

```lua
-- In items script (media/scripts/my_items.txt)
module MyMod
{
    item WeaponRepairKit
    {
        Type = Normal,
        DisplayName = Weapon Repair Kit,
        Icon = RepairKit,
        Weight = 0.5,
        UseDelta = 0.1,               // 10 uses before depleted
    }

    item AdvancedRepairKit
    {
        Type = Normal,
        DisplayName = Advanced Repair Kit,
        Icon = RepairKitAdvanced,
        Weight = 1.0,
        UseDelta = 0.05,              // 20 uses before depleted (more durable)
    }
}
```

Then reference it in fixing.txt:
```
module MyMod
{
    fixing Fix MyWeapon
    {
        Require : MyWeapon,           // Your weapon
        Fixer : WeaponRepairKit=1; Maintenance=2,       // Basic kit (skill 2)
        Fixer : AdvancedRepairKit=1; Maintenance=4,     // Advanced kit (skill 4, better repair)
        Fixer : Base.DuctTape=2,      // Emergency fallback (no skill)
    }
}
```

**Why This Pattern Works:**
- **Tiered repair options** create progression (basic kit → advanced kit)
- **Different skill levels** reward character development
- **UseDelta** controls item longevity (0.1 = 10 uses, 0.05 = 20 uses)
- **Fallback options** (DuctTape) ensure players always have some repair method

### Balancing Fixer Rarity

Control item distribution through `distributions.lua`:

```lua
-- In media/lua/server/Items/Distributions.lua
-- Example: Add custom repair kit to specific locations
table.insert(ProceduralDistributions.list["ToolStoreTools"].items, "MyMod.WeaponRepairKit");
table.insert(ProceduralDistributions.list["ToolStoreTools"].items, 5);  -- Spawn weight (5 = uncommon)

-- For advanced kit, make it rarer
table.insert(ProceduralDistributions.list["GunStoreDisplayCase"].items, "MyMod.AdvancedRepairKit");
table.insert(ProceduralDistributions.list["GunStoreDisplayCase"].items, 1);  -- Spawn weight (1 = rare)
```

**Rarity Guidelines:**
- Common fixers (DuctTape, Glue): Spawn weight 10-20
- Uncommon fixers (Woodglue, custom kits): Spawn weight 3-5
- Rare fixers (Advanced kits, specialized tools): Spawn weight 1-2

---

## For More Detail

- [Fixing.txt Anatomy](fixing-txt-anatomy) - Complete syntax guide for repair definitions
- [Repair System Overview](repair-system-overview) - How repair mechanics work in-game
- [Lua Repair Mechanics](lua-repair-mechanics) - Detailed Lua workflow and API
- [Repair Formulas](repair-formulas) - Mathematical breakdown of repair calculations
