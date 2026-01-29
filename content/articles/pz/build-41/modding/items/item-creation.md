---
id: items-item-creation
slug: item-creation
title: "Item Creation Guide - Project Zomboid"
game: pz
version: build-41
section: modding
category: items
subcategory: null
difficulty: beginner
tags:
  - recipe
  - item
  - weapon
  - crafting
  - creation
  - guide
excerpt: "Ever looted a house and thought 'I wish there was a custom toolbox'? Every item in Project Zomboid was defined in a simple text file. Learn to create items that appear in-game with full functionality, from drainable containers to stackable ammunition."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "File Location"
    link: "#file-location"
  - text: "Basic Item Structure"
    link: "#basic-item-structure"
  - text: "Module Declaration"
    link: "#module-declaration"
  - text: "Minimal Item Example"
    link: "#minimal-item-example"
  - text: "Item Syntax Rules"
    link: "#item-syntax-rules"
  - text: "CRITICAL: Items Use Equals (`=`)"
    link: "#critical-items-use-equals-"
  - text: "Essential Properties"
    link: "#essential-properties"
  - text: "DisplayName"
    link: "#displayname"
  - text: "Weight"
    link: "#weight"
  - text: "Type"
    link: "#type"
  - text: "Icon"
    link: "#icon"
  - text: "DisplayCategory"
    link: "#displaycategory"
  - text: "Common Item Types"
    link: "#common-item-types"
  - text: "Normal Item (Standard)"
    link: "#normal-item-standard"
  - text: "Drainable Item (Uses/Charges)"
    link: "#drainable-item-usescharges"
  - text: "Stackable Item (Ammunition/Materials)"
    link: "#stackable-item-ammunitionmaterials"
  - text: "Tool Item"
    link: "#tool-item"
  - text: "Optional Properties"
    link: "#optional-properties"
  - text: "WorldStaticModel"
    link: "#worldstaticmodel"
  - text: "MetalValue"
    link: "#metalvalue"
  - text: "Tags"
    link: "#tags"
  - text: "Tooltip"
    link: "#tooltip"
  - text: "StaticModel"
    link: "#staticmodel"
  - text: "Complete Real-World Examples"
    link: "#complete-real-world-examples"
  - text: "Vanilla: 9mm Bullet Mold"
    link: "#vanilla-9mm-bullet-mold"
  - text: "Vanilla: GunPowder (Drainable)"
    link: "#vanilla-gunpowder-drainable"
  - text: "Vanilla: 9mm Ammunition"
    link: "#vanilla-9mm-ammunition"
  - text: "Workshop Mod: Metal Parts"
    link: "#workshop-mod-metal-parts"
  - text: "Progressive Building: Energy Bar Example"
    link: "#progressive-building-energy-bar-example"
  - text: "Version 1: Minimal Energy Bar"
    link: "#version-1-minimal-energy-bar"
  - text: "Version 2: Enhanced with Nutrition"
    link: "#version-2-enhanced-with-nutrition"
  - text: "Version 3: Complete with Category & Model"
    link: "#version-3-complete-with-category--model"
  - text: "Creating a Custom Item - Step by Step"
    link: "#creating-a-custom-item-step-by-step"
  - text: "Step 1: Create Script File"
    link: "#step-1-create-script-file"
  - text: "Step 2: Define Module"
    link: "#step-2-define-module"
  - text: "Step 3: Define Item"
    link: "#step-3-define-item"
  - text: "Step 4: Close Module"
    link: "#step-4-close-module"
  - text: "Step 5: Create Texture (Optional)"
    link: "#step-5-create-texture-optional"
  - text: "Using Your Item in Recipes"
    link: "#using-your-item-in-recipes"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Mistake 1: Using Colons Instead of Equals"
    link: "#mistake-1-using-colons-instead-of-equals"
  - text: "Mistake 2: Missing Required Properties"
    link: "#mistake-2-missing-required-properties"
  - text: "Mistake 3: Wrong Module Reference"
    link: "#mistake-3-wrong-module-reference"
  - text: "Mistake 4: Incorrect Weight Values"
    link: "#mistake-4-incorrect-weight-values"
  - text: "Mistake 5: Forgetting to Import Base Module"
    link: "#mistake-5-forgetting-to-import-base-module"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Testing Checklist"
    link: "#testing-checklist"
  - text: "Source Files"
    link: "#source-files"
next_steps:
  - title: "Vanilla Item Anatomy"
    path: /build-41/modding/items/vanilla-item-anatomy
  - title: "Module Dependencies"
    path: /build-41/modding/items/module-dependencies
  - title: "9mm Recipe Implementation"
    path: /build-41/modding/recipes/9mm-recipe-implementation
last_updated: 2026-01-28
---

# Item Creation Guide - Project Zomboid

Ever looted a house and thought "I wish there was a custom toolbox that held more items" or "Why isn't there a specialty ammunition for my favorite weapon?" Every item you've ever picked up in Project Zomboid—from rusty nails to shotguns—was defined in a simple text file. This guide teaches you how to create your own items that will appear in-game with full functionality.

> **What You'll Learn**: By the end of this guide, you'll create a working drainable item (like gunpowder), understand item properties, and know how to reference your items in recipes. You'll see your custom items spawn in the game world and work just like vanilla items.

## Overview

Items in Project Zomboid are defined in script files within your mod's directory. These text files use a simple syntax that defines everything from a paperclip to a chainsaw. Once you understand the basic structure, you can create unlimited custom items.

The game reads these files at startup and creates item definitions that can spawn in the world, be used in recipes, and interact with the game's systems. No Java programming required—just text editing.

## File Location

Items must be defined in `.txt` files within your mod's `media/scripts/` directory.

**Example Path:**
```
YourMod/
└── Contents/
    └── mods/
        └── YourModName/
            └── media/
                └── scripts/
                    └── items.txt  // Your item definitions go here
```

> **Key Insight**: You can name the file anything you want (items.txt, weapons.txt, mymod.txt) and you can have multiple script files. The game reads all .txt files in the scripts folder.

## Basic Item Structure

### Module Declaration

All items must be wrapped in a module block. Think of a module as a **namespace** (named container) that prevents naming conflicts between mods.

```
module ModuleName {  // Opens the container for your items
    imports {
        Base  // Gives access to vanilla items
    }

    item ItemName {
        // Item properties here (what the item does and looks like)
    }
}
```

> **Why Modules Matter**: If two mods both create an item called "Knife", the module system distinguishes them: `ModA.Knife` vs `ModB.Knife`. Without modules, the game wouldn't know which knife you meant.

### Minimal Item Example

Here's the simplest possible working item:

```
module OutcastAdvCrft {  // Your mod's namespace
    imports {
        Base  // Required to use vanilla items in recipes
    }

    item SimpleItem {
        DisplayName = Simple Item,  // Name shown to players
        Weight = 1.0,               // Inventory weight (1.0 = medium)
        Type = Normal,              // Standard item behavior
        Icon = ItemIcon,            // Texture file name (without .png)
    }
}
```

> **Technical Note**: The module name (OutcastAdvCrft) becomes part of the item's **full identifier**: `OutcastAdvCrft.SimpleItem`. This is how you reference it in recipes.

## Item Syntax Rules

### CRITICAL: Items Use Equals (`=`)

This is the #1 source of confusion when starting out. Items and recipes use **different syntax**:

**ITEMS use equals (`=`):**
```
item Example {
    Weight = 1.0,      // Equals sign (=)
    Type = Normal,     // Equals sign (=)
    DisplayName = Example Item,
}
```

**RECIPES use colons (`:`) - NEVER mix these up!**
```
recipe Example {
    Result:OutputItem,   // Colon (:)
    Time:100.0,          // Colon (:)
}
```

> **Why Different Syntax?**: Items are **property declarations** (defining attributes), while recipes are **action specifications** (defining what happens). The game's parser treats them differently.

**Common Error Example:**
```
item BrokenItem {
    Weight: 1.0,  // ❌ WRONG - This will cause a parse error
    Type: Normal, // ❌ WRONG
}
```

## Essential Properties

These properties are required or highly recommended for all items:

### DisplayName

**Purpose:** The name shown to players in the inventory, on the ground, and in tooltips

**Syntax:**
```
DisplayName = Item Name,  // Can contain spaces, no quotes needed
```

**Examples:**
```
DisplayName = 9mm Bullets Mold,  // Multi-word name
DisplayName = Gunpowder,         // Single word
DisplayName = Survivor's Toolkit, // Can use apostrophes
```

> **Localization Tip**: For professional mods, you can use translation keys instead: `DisplayName = ItemName_MyCoolItem,` and define translations in a separate file. For simple mods, direct names work fine.

### Weight

**Purpose:** Item weight affects player encumbrance (how much you can carry)

**Unit:** Abstract weight units (not pounds or kilograms)

**Syntax:**
```
Weight = 0.5,  // Always a decimal number
```

**Real-World Examples:**
- Bullets: `0.01` - `0.05` (very light)
- Tools: `0.5` - `2.0` (medium weight)
- Heavy items: `5.0` - `20.0` (backpack, generators)

**Weight Guidelines:**
```
item LightItem {
    Weight = 0.05,  // Pencil, bullets, paperclip
}

item MediumItem {
    Weight = 1.0,   // Hammer, can of food, book
}

item HeavyItem {
    Weight = 10.0,  // Generator, fuel can, large backpack
}
```

> **Balance Consideration**: Weight affects gameplay significantly. A weight of 20.0 means players can only carry a few before becoming overburdened. Test your weight values in-game!

### Type

**Purpose:** Determines fundamental item behavior and what the game engine does with it

**Syntax:**
```
Type = ItemType,  // One of the predefined types
```

**Available Types:**
- `Normal` - Standard item (most items use this)
- `Drainable` - Container with uses (gas, water, gunpowder, paint)
- `Food` - Edible items (triggers hunger, nutrition, poison effects)
- `Weapon` - Melee/ranged weapons (enables combat properties)
- `Container` - Bags, boxes (can hold other items)
- `Key` - Keys and keycards (used for locks)
- `Clothing` - Wearable items (armor, temperature effects)
- `Literature` - Books, magazines (can be read for skill gains)

**Example:**
```
item StandardTool {
    Type = Normal,  // Standard item, no special behavior
}

item FuelContainer {
    Type = Drainable,  // Can be emptied/filled, has charge meter
}

item EnergyBar {
    Type = Food,  // Player can eat it, affects hunger/nutrition
}
```

> **Type Determines Properties**: Once you set Type = Food, new properties become available (HungerChange, Calories, DaysFresh). Each type unlocks different functionality.

### Icon

**Purpose:** Texture file for inventory display (what the item looks like in your inventory)

**Syntax:**
```
Icon = TextureFileName,  // Without the .png extension
```

**Examples:**
```
Icon = BulletMold,      // Looks for BulletMold.png
Icon = GunpowderJar,    // Looks for GunpowderJar.png
Icon = 40calAmmoBox,    // Looks for 40calAmmoBox.png
```

**Where Textures Go:**
```
YourMod/
└── media/
    └── textures/
        └── Item/  // Item textures folder
            └── BulletMold.png  // Your icon file (64x64 or 128x128)
```

> **Reusing Vanilla Icons**: You can use vanilla icon names (Icon = Hammer,) and your item will use the vanilla texture. Great for testing before creating custom art!

### DisplayCategory

**Purpose:** Organizes items in the inventory UI (which tab the item appears in)

**Syntax:**
```
DisplayCategory = CategoryName,  // One of the predefined categories
```

**Common Categories:**
- `Ammo` - Ammunition (bullets, shells, arrows)
- `Material` - Crafting materials (scrap metal, cloth, wood)
- `Weapon` - Weapons (guns, melee weapons)
- `Tool` - Tools (hammer, saw, wrench)
- `Container` - Containers (bags, boxes, crates)
- `Food` - Edible items
- `FirstAid` - Medical supplies (bandages, pills)
- `Literature` - Books and magazines
- `Clothing` - Wearable items

**Example:**
```
item CraftingSupply {
    DisplayCategory = Material,  // Appears in Materials tab
}

item MedicalItem {
    DisplayCategory = FirstAid,  // Appears in First Aid tab
}
```

> **UI Organization**: DisplayCategory only affects where players find items in the inventory tabs. It doesn't change item behavior—it's purely for organization.

## Common Item Types

### Normal Item (Standard)

The most basic item type for tools, materials, and miscellaneous objects:

```
item StandardItem {
    DisplayCategory = Material,           // Where it appears in inventory
    Weight = 0.5,                         // Half a weight unit (fairly light)
    Type = Normal,                        // Standard behavior, no special rules
    DisplayName = Standard Item,          // Name shown to player
    Icon = ItemIcon,                      // Inventory texture
    WorldStaticModel = Item_Ground,       // 3D model when dropped on ground
}
```

> **When to Use Normal**: If your item doesn't need to be eaten (Food), doesn't have uses/charges (Drainable), and isn't a weapon, use Type = Normal.

### Drainable Item (Uses/Charges)

Items with a **fill meter** that depletes as you use them (like a jar of paint or gasoline):

```
item GunPowder {
    DisplayCategory = Material,           // Crafting material category
    Weight = 0.1,                         // Full weight
    Type = Drainable,                     // Enables charge/uses system
    UseDelta = 0.1,                       // 10% consumed per use (10 uses total)
    UseWhileEquipped = FALSE,             // Can't use while holding in hands
    DisplayName = Gunpowder,              // Player-facing name
    Icon = GunpowderJar,                  // Jar icon
    WeightEmpty = 0.01,                   // Weight when completely empty
    WorldStaticModel = GunpowderJar,      // 3D model for ground
}
```

**Drainable Properties Explained:**
- `UseDelta = 0.1` means **10% per use** → 10 total uses (0.05 = 20 uses, 0.25 = 4 uses)
- `WeightEmpty` is the jar's weight after all contents are gone
- `UseWhileEquipped = FALSE` means it must be in inventory (not in hands) to use

> **Real-World Example**: A paint bucket with UseDelta = 0.2 gives 5 uses. Each recipe that needs paint consumes 20% of the bucket's charge.

### Stackable Item (Ammunition/Materials)

Items that group together in stacks (like bullets or nails):

```
item Bullets9mm {
    DisplayCategory = Ammo,               // Ammunition category
    Count = 5,                            // Default stack size when found
    Weight = 0.01,                        // Very light (per bullet)
    Type = Normal,                        // Standard item (no special behavior)
    DisplayName = 9mm Rounds,             // Player-facing name
    Icon = 40calAmmoBox,                  // Box of bullets icon
    MetalValue = 1,                       // Metal units when smelted
    WorldStaticModel = 9mmRounds,         // 3D model when dropped
}
```

**Stackable Properties Explained:**
- `Count = 5` means when you find this item, you get **5 bullets** in one stack
- `MetalValue = 1` allows smelting the bullet for 1 unit of scrap metal
- Weight is **per item**, so 5 bullets weighs 5 × 0.01 = 0.05

> **Stacking Behavior**: The game automatically stacks items with the same type. Count only determines how many spawn together initially.

### Tool Item

Items used in recipes with the `keep` keyword (reusable tools):

```
item Hammer {
    DisplayCategory = Tool,               // Tool category in inventory
    Weight = 1.0,                         // Medium weight
    Type = Normal,                        // Standard item behavior
    DisplayName = Hammer,                 // Name shown to player
    Icon = Hammer,                        // Hammer icon texture
    Tags = Hammer,                        // Tag for recipe matching
    WorldStaticModel = Hammer,            // 3D model when on ground
}
```

**Tool Properties Explained:**
- `Tags = Hammer` is crucial—recipes use `keep [Recipe.GetItemTypes.Hammer]` to match this item
- Tools are typically kept after recipes (not consumed)

**Recipe Example Using This Tool:**
```
recipe Build Wooden Wall {
    keep [Recipe.GetItemTypes.Hammer],  // Matches any item with Tags = Hammer
    Base.Plank=4,
    Base.Nails=8,

    Result:Base.WoodenWall,
    Time:100.0,
}
```

> **Tag System**: Tags are how recipes find tools. Multiple items can have the same tag (Hammer, Saw, Screwdriver), so players can use any item with that tag.

## Optional Properties

These properties add extra functionality but aren't required:

### WorldStaticModel

**Purpose:** 3D model displayed when the item is dropped on the ground

**Syntax:**
```
WorldStaticModel = ModelName,  // Must match a 3D model file
```

**Example:**
```
item GroundItem {
    WorldStaticModel = ShotGunShellsMold_Ground,  // Shows 3D model when dropped
}
```

> **Visual Feedback**: Without WorldStaticModel, dropped items show a generic placeholder. With it, they show a custom 3D model that players can see from a distance.

### MetalValue

**Purpose:** Metal content for smelting/recycling (used by metalworking recipes)

**Syntax:**
```
MetalValue = 15,  // Units of metal when smelted
```

**Example:**
```
item 9mmBulletsMold {
    MetalValue = 15,  // Smelting this yields 15 units of scrap metal
    Weight = 0.5,
    DisplayName = 9mm Bullets Mold,
}
```

> **Recycling System**: Items with MetalValue can be melted down in a furnace. Higher values yield more scrap metal. Typical values: nails (1), tools (5-15), engine parts (50-200).

### Tags

**Purpose:** Categorization for recipe matching (how recipes identify items)

**Syntax:**
```
Tags = Tag1;Tag2;Tag3,  // Semicolon-separated list
```

**Example:**
```
item Hammer {
    Tags = Hammer;BluntWeapon,  // Can be used as hammer OR weapon
}

item Screwdriver {
    Tags = Screwdriver;StabbingWeapon,  // Tool and weapon
}
```

**Usage in Recipes:**
```
recipe Build Shelf {
    keep [Recipe.GetItemTypes.Hammer],       // Matches Tags = Hammer
    keep [Recipe.GetItemTypes.Screwdriver],  // Matches Tags = Screwdriver
    Base.Plank=6,

    Result:Base.Shelf,
    Time:150.0,
}
```

> **Multiple Tags**: An item can have multiple tags. A wrench might have `Tags = Wrench;BluntWeapon;MetalBar` allowing it to be used as a tool, weapon, or metal source.

### Tooltip

**Purpose:** Translation key for hover tooltip text

**Syntax:**
```
Tooltip = Tooltip_ItemName,  // Key in translation files
```

**Example:**
```
item ComplexItem {
    Tooltip = Tooltip_crafting_MoldDescription,  // Shows custom tooltip on hover
}
```

> **When to Use**: Most items don't need custom tooltips. Use this when you need to explain non-obvious functionality (like "This mold is reusable" or "Requires level 5 Metalworking").

### StaticModel

**Purpose:** Model when equipped in hands or placed in the world

**Syntax:**
```
StaticModel = ModelName,  // 3D model reference
```

**Example:**
```
item EquippableItem {
    StaticModel = Hammer,  // Shows hammer model when equipped
}
```

> **Difference from WorldStaticModel**: WorldStaticModel is for ground, StaticModel is for equipped/placed items. Most items only need WorldStaticModel.

## Complete Real-World Examples

### Vanilla: 9mm Bullet Mold

A reusable tool for crafting ammunition:

```
item 9mmBulletsMold {
    DisplayCategory = Ammo,                       // Appears in Ammo tab
    Weight = 0.5,                                 // Half a weight unit
    Type = Normal,                                // Standard item
    DisplayName = 9mm Bullets Mold,               // Name shown to player
    Icon = BulletMold,                            // Bullet mold icon
    MetalValue = 15,                              // Can be smelted for 15 metal
    WorldStaticModel = ShotGunShellsMold_Ground,  // 3D model on ground
}
```

> **Reusable Tool Pattern**: Notice there's no `Tags` property, so recipes reference this directly as `Base.9mmBulletsMold` with the `keep` keyword to make it reusable.

### Vanilla: GunPowder (Drainable)

A consumable resource with 10 uses:

```
item GunPowder {
    DisplayCategory = Material,        // Crafting material
    Weight = 0.1,                      // Full jar weight
    Type = Drainable,                  // Has charge meter
    UseDelta = 0.1,                    // 10% per use = 10 uses total
    UseWhileEquipped = FALSE,          // Must be in inventory (not hands)
    DisplayName = Gunpowder,           // Player-facing name
    Icon = GunpowderJar,               // Jar texture
    WeightEmpty = 0.01,                // Empty jar weighs almost nothing
    WorldStaticModel = GunpowderJar,   // 3D jar model
}
```

**Recipe Using This Item:**
```
recipe Craft 9mm Bullets {
    Base.GunPowder=5,  // Consumes 50% of the jar (5 uses out of 10)
    Base.ScrapMetal=1,

    Result:Base.Bullets9mm=10,
}
```

> **Math Check**: If UseDelta = 0.1 (10 uses total) and recipe needs 5 units, that's 5/10 = 50% of the jar consumed.

### Vanilla: 9mm Ammunition

Stackable ammunition that spawns in groups of 5:

```
item Bullets9mm {
    DisplayCategory = Ammo,            // Ammunition category
    Count = 5,                         // Spawn 5 bullets together
    Weight = 0.01,                     // Very light per bullet
    Type = Normal,                     // Standard item
    DisplayName = 9mm Rounds,          // Player-facing name
    Icon = 40calAmmoBox,               // Ammo box icon
    MetalValue = 1,                    // Can be smelted for 1 metal
    WorldStaticModel = 9mmRounds,      // 3D bullets on ground
}
```

> **Stacking Math**: Finding one "Bullets9mm" gives you 5 bullets weighing 5 × 0.01 = 0.05 total. Each bullet can be smelted for 1 metal unit.

### Workshop Mod: Metal Parts

Simple crafting material from a real workshop mod:

```
item MetalParts {
    DisplayCategory = Material,        // Crafting material tab
    Weight = 0.03,                     // Very light (3% of standard weight)
    Type = Normal,                     // Standard item behavior
    DisplayName = Metal Parts,         // Name in inventory
    Icon = MetalParts,                 // Custom icon (MetalParts.png)
    WorldStaticModel = MetalParts,     // Custom 3D model
}
```

> **Minimal Design**: This is about as simple as items get—just enough properties to work. No special behavior, tags, or metal value.

## Progressive Building: Energy Bar Example

Let's build an energy bar item in three stages, adding complexity each time:

### Version 1: Minimal Energy Bar

Just enough to work:

```
module OutcastAdvCrft {
    imports {
        Base  // Required to use vanilla items in recipes
    }

    item EnergyBar {
        Type = Food,                 // Makes it edible
        DisplayName = Energy Bar,    // Name in inventory
        Icon = Chocolate,            // Reuses vanilla chocolate icon
        Weight = 0.1,                // Light item
    }
}
```

**What This Does:**
- ✅ Appears in game
- ✅ Can be eaten
- ❌ No nutrition values (won't affect hunger)
- ❌ No category (appears in unsorted items)
- ❌ No 3D model (generic placeholder on ground)

### Version 2: Enhanced with Nutrition

Add gameplay functionality:

```
module OutcastAdvCrft {
    imports {
        Base
    }

    item EnergyBar {
        Type = Food,                  // Edible item
        DisplayName = Energy Bar,     // Name in inventory
        Icon = Chocolate,             // Vanilla icon
        Weight = 0.1,                 // Light snack

        // NEW: Nutrition properties
        HungerChange = -15,           // Reduces hunger by 15 (negative = reduces)
        Calories = 250,               // Adds 250 calories to player
        Carbohydrates = 30,           // 30 units of carbs
        Proteins = 5,                 // 5 units of protein
        Lipids = 8,                   // 8 units of fat

        // NEW: Freshness
        DaysFresh = 60,               // Stays fresh for 60 in-game days
        DaysTotallyRotten = 90,       // Becomes rotten after 90 days
    }
}
```

**What Changed:**
- ✅ Now reduces hunger when eaten
- ✅ Adds calories and nutrition
- ✅ Spoils over time (realistic food behavior)
- ❌ Still no inventory category
- ❌ Still no 3D model

### Version 3: Complete with Category & Model

Production-ready item:

```
module OutcastAdvCrft {
    imports {
        Base
    }

    item EnergyBar {
        Type = Food,                     // Edible item
        DisplayName = Energy Bar,        // Name in inventory
        Icon = Chocolate,                // Vanilla icon
        Weight = 0.1,                    // Light snack

        // Nutrition (keeps player alive)
        HungerChange = -15,              // Reduces hunger by 15
        Calories = 250,                  // 250 calorie energy boost
        Carbohydrates = 30,              // Quick energy from carbs
        Proteins = 5,                    // Muscle nutrition
        Lipids = 8,                      // Fat for long-term energy

        // Freshness (spoilage system)
        DaysFresh = 60,                  // Fresh for 2 months
        DaysTotallyRotten = 90,          // Rotten after 3 months

        // NEW: UI Organization
        DisplayCategory = Food,          // Appears in Food tab

        // NEW: World appearance
        WorldStaticModel = Chocolate,    // Shows chocolate model on ground

        // NEW: Additional realism
        UnhappyChange = -5,              // Eating makes player slightly happier
        ThirstChange = -2,               // Slightly reduces thirst
    }
}
```

**Final Features:**
- ✅ Complete nutrition system
- ✅ Organized in Food category
- ✅ 3D model when dropped
- ✅ Affects mood and thirst
- ✅ Ready for release

> **Progressive Learning**: Start with Version 1 to test basic functionality, then add features one version at a time. This makes debugging easier when something breaks.

## Creating a Custom Item - Step by Step

### Step 1: Create Script File

Create `media/scripts/items.txt` in your mod folder:

**Full Path Example:**
```
C:/Users/YourName/Zomboid/mods/MyFirstMod/media/scripts/items.txt
```

**Or Steam Workshop Structure:**
```
workshop_content/108600/YOUR_MOD_ID/Contents/mods/MyFirstMod/media/scripts/items.txt
```

### Step 2: Define Module

Open items.txt and declare your module:

```
module OutcastAdvCrft {  // Replace with your mod name
    imports {
        Base  // Allows using vanilla items (Base.Hammer, etc.)
    }
```

> **Naming Convention**: Module names usually match your mod name. Use PascalCase (OutcastAdvCrft) or underscores (My_Mod_Name), avoid spaces.

### Step 3: Define Item

Add your item inside the module:

```
    item CustomGunpowder {
        DisplayCategory = Material,        // Where it appears
        Weight = 0.1,                      // Inventory weight
        Type = Drainable,                  // Has charge meter
        UseDelta = 0.1,                    // 10 uses (10% per use)
        UseWhileEquipped = FALSE,          // In inventory only
        DisplayName = Custom Gunpowder,    // Player-facing name
        Icon = GunpowderJar,               // Reuse vanilla icon
        WeightEmpty = 0.01,                // Weight when empty
        WorldStaticModel = GunpowderJar,   // 3D model
    }
```

### Step 4: Close Module

Don't forget the closing brace:

```
}  // Closes the module block
```

**Complete File:**
```
module OutcastAdvCrft {
    imports {
        Base
    }

    item CustomGunpowder {
        DisplayCategory = Material,
        Weight = 0.1,
        Type = Drainable,
        UseDelta = 0.1,
        UseWhileEquipped = FALSE,
        DisplayName = Custom Gunpowder,
        Icon = GunpowderJar,
        WeightEmpty = 0.01,
        WorldStaticModel = GunpowderJar,
    }
}
```

### Step 5: Create Texture (Optional)

If using a custom icon (not a vanilla reuse):

1. Create PNG file: `media/textures/Item/CustomIcon.png`
2. Recommended size: **64x64** or **128x128** pixels
3. Format: PNG with transparency
4. Reference in item: `Icon = CustomIcon,`

**Texture Folder Structure:**
```
MyFirstMod/
└── media/
    ├── scripts/
    │   └── items.txt
    └── textures/
        └── Item/
            └── CustomIcon.png  // Your custom icon
```

> **Testing Tip**: Start with a vanilla icon (`Icon = Hammer,`) to verify your item works, then create custom art later.

## Using Your Item in Recipes

Once defined, reference your item with the module prefix:

```
module OutcastAdvCrft {
    imports {
        Base  // Required to use Base.* items
    }

    recipe Use Custom Item {
        OutcastAdvCrft.CustomGunpowder=10,  // Your custom item (10 uses)
        Base.ScrapMetal,                     // Vanilla item (consumed)
        keep Base.Hammer,                    // Vanilla tool (kept)

        Result:Base.Bullets9mm=10,           // Output: 10 bullets
        Time:100.0,                          // Takes 100 time units
        Sound:Hammering,                     // Hammering sound effect
    }
}
```

**Syntax Breakdown:**
- `OutcastAdvCrft.CustomGunpowder=10` → Your drainable item, needs 10 uses (100% of jar)
- `Base.ScrapMetal` → Vanilla item, consumed entirely
- `keep Base.Hammer` → Vanilla tool, **not consumed** (reusable)
- `Result:` uses a **colon** (recipes use colons, items use equals!)

> **Module System Recap**: Custom items need the module prefix (OutcastAdvCrft.ItemName), vanilla items use Base (Base.ItemName).

## Common Mistakes

### Mistake 1: Using Colons Instead of Equals

**❌ WRONG:**
```
item BrokenItem {
    Weight: 1.0,      // Colon causes parse error
    Type: Normal,     // Game won't load this item
    DisplayName: My Item,
}
```

**✅ CORRECT:**
```
item WorkingItem {
    Weight = 1.0,     // Equals sign (=)
    Type = Normal,    // Equals sign (=)
    DisplayName = My Item,
}
```

**Why This Happens:** Beginners confuse item syntax (equals) with recipe syntax (colons). The parser expects different formats for different file sections.

**Error Message You'll See:**
```
ERROR: Script error in items.txt line 15: Expected '=' but found ':'
```

### Mistake 2: Missing Required Properties

**❌ WRONG:**
```
item IncompleteItem {
    DisplayName = My Cool Item,
    // Missing Weight and Type - game crashes on load
}
```

**✅ CORRECT:**
```
item CompleteItem {
    DisplayName = My Cool Item,
    Weight = 1.0,     // REQUIRED
    Type = Normal,    // REQUIRED
    Icon = CoolItem,  // STRONGLY RECOMMENDED
}
```

**Why This Happens:** New modders assume DisplayName is enough, but the game needs Weight and Type to function properly.

**Error Message You'll See:**
```
ERROR: Item 'IncompleteItem' missing required property 'Weight'
ERROR: Item 'IncompleteItem' missing required property 'Type'
```

### Mistake 3: Wrong Module Reference

**❌ WRONG:**
```
recipe BrokenRecipe {
    WrongModule.ItemName,   // Module doesn't exist - recipe fails
}
```

**✅ CORRECT:**
```
recipe WorkingRecipe {
    OutcastAdvCrft.ItemName,  // Your actual module name
    Base.ItemName,             // Vanilla items use Base
}
```

**Why This Happens:** Typos in module names or forgetting which module your item belongs to.

**Error Message You'll See:**
```
ERROR: Unknown item 'WrongModule.ItemName' in recipe 'BrokenRecipe'
```

**How to Fix:**
1. Check your module declaration: `module OutcastAdvCrft {`
2. Use exact same name: `OutcastAdvCrft.ItemName`
3. Case-sensitive! `outcastadvcrft.ItemName` won't work

### Mistake 4: Incorrect Weight Values

**❌ WRONG:**
```
item UnrealisticItem {
    Weight = 0,       // Zero weight breaks encumbrance calculations
    Type = Normal,
}
```

```
item RidiculousItem {
    Weight = 1000,    // Player can't carry anything else
    Type = Normal,
}
```

**✅ CORRECT:**
```
item RealisticItem {
    Weight = 0.5,     // Reasonable weight for a tool
    Type = Normal,
}
```

**Why This Matters:**
- `Weight = 0` causes bugs with inventory sorting
- Extremely high weights make items unusable (player overburdened instantly)
- Balance is crucial for gameplay

**Weight Guidelines:**
- 0.01 - 0.1: Small items (bullets, keys, paper)
- 0.5 - 2.0: Tools and weapons
- 5.0 - 10.0: Heavy items (car batteries, full backpacks)
- 10.0+: Very heavy items (generators, furniture)

### Mistake 5: Forgetting to Import Base Module

**❌ WRONG:**
```
module OutcastAdvCrft {
    // Missing imports block

    recipe Use Vanilla Item {
        Base.Hammer,  // ERROR: Base is not recognized
    }
}
```

**✅ CORRECT:**
```
module OutcastAdvCrft {
    imports {
        Base  // Now Base.* items are accessible
    }

    recipe Use Vanilla Item {
        Base.Hammer,  // Works correctly
    }
}
```

**Why This Happens:** Forgetting the imports block means the module can't see vanilla items.

**Error Message You'll See:**
```
ERROR: Unknown module 'Base' in recipe
```

## Try It Yourself

### Challenge 1: Create a Custom Tool

Create a reusable wrench that can be used in recipes:

```
module YourModName {
    imports {
        Base
    }

    item CustomWrench {
        DisplayCategory = Tool,         // Appears in Tool tab
        Weight = 0.8,                   // Medium weight for a tool
        Type = Normal,                  // Standard item
        DisplayName = Custom Wrench,    // Name in inventory
        Icon = Wrench,                  // Reuse vanilla wrench icon
        Tags = Wrench,                  // For recipe matching
        WorldStaticModel = Wrench,      // 3D model on ground
    }
}
```

**Test It:**
1. Launch the game with debug mode enabled
2. Spawn your item: `/additem YourModName.CustomWrench`
3. Drop it and verify the 3D model appears
4. Create a recipe that uses `keep [Recipe.GetItemTypes.Wrench]`

### Challenge 2: Create a Consumable Food Item

Create a protein bar with nutrition values:

```
module YourModName {
    imports {
        Base
    }

    item ProteinBar {
        Type = Food,                    // Edible item
        DisplayName = Protein Bar,      // Name shown to player
        Icon = CandyPackage2,           // Reuse candy package icon
        Weight = 0.15,                  // Slightly heavier than energy bar
        DisplayCategory = Food,         // Food tab in inventory

        HungerChange = -20,             // Reduces hunger significantly
        Calories = 300,                 // High calorie content
        Proteins = 20,                  // High protein (muscle recovery)
        Carbohydrates = 15,             // Moderate carbs
        Lipids = 10,                    // Moderate fat

        DaysFresh = 90,                 // Fresh for 90 days (long shelf life)
        DaysTotallyRotten = 120,        // Rotten after 120 days
        UnhappyChange = -3,             // Slightly improves mood
    }
}
```

**Test It:**
1. Spawn the item: `/additem YourModName.ProteinBar`
2. Check your hunger level (press heart icon)
3. Eat the protein bar
4. Verify hunger decreased by 20

### Challenge 3: Create a Drainable Container

Create a custom paint bucket with 20 uses:

```
module YourModName {
    imports {
        Base
    }

    item PaintBucket {
        Type = Drainable,                  // Has charge meter
        DisplayName = Paint Bucket,        // Name in inventory
        Icon = PaintBlue,                  // Reuse vanilla paint icon
        Weight = 0.5,                      // Full bucket weight
        WeightEmpty = 0.1,                 // Empty bucket much lighter
        DisplayCategory = Material,        // Material tab

        UseDelta = 0.05,                   // 5% per use = 20 uses total
        UseWhileEquipped = FALSE,          // Must be in inventory
        WorldStaticModel = PaintBlue,      // 3D model when dropped
    }
}
```

**Math Check:** UseDelta = 0.05 means each use consumes 5%, so 100% / 5% = **20 uses total**.

**Test It:**
1. Spawn the item: `/additem YourModName.PaintBucket`
2. Right-click and observe the charge meter (should show 100%)
3. Use it in a recipe that consumes drainable items
4. Check the charge meter decreased

### Challenge 4: Create an Ammunition Recipe Chain

Create a bullet mold, ammunition, and crafting recipe:

```
module YourModName {
    imports {
        Base
    }

    // Step 1: Reusable mold
    item 45calBulletMold {
        DisplayCategory = Ammo,
        Weight = 0.6,
        Type = Normal,
        DisplayName = .45 Bullet Mold,
        Icon = BulletMold,                      // Reuse vanilla mold icon
        MetalValue = 15,                        // Can be smelted
        WorldStaticModel = ShotGunShellsMold_Ground,
    }

    // Step 2: Stackable ammunition
    item Bullets45cal {
        DisplayCategory = Ammo,
        Count = 8,                              // Spawn 8 bullets at once
        Weight = 0.012,                         // Slightly heavier than 9mm
        Type = Normal,
        DisplayName = .45 Caliber Rounds,
        Icon = Bullets45Box,                    // Vanilla .45 ammo icon
        MetalValue = 1,                         // Small metal value
        WorldStaticModel = Bullets45Box,
    }

    // Step 3: Crafting recipe
    recipe Craft .45 Bullets {
        keep YourModName.45calBulletMold,       // Reusable tool (not consumed)
        keep Base.Hammer,                       // Another reusable tool
        Base.ScrapMetal=1,                      // Consumed (metal for bullets)
        Base.GunPowder=8,                       // Consumed (8 uses of gunpowder)

        Result:YourModName.Bullets45cal=8,      // Craft 8 bullets
        Time:200.0,                             // Takes 200 time units
        Sound:Hammering,                        // Hammering sound during craft
        SkillRequired:MetalWelding=3,           // Need level 3 Metalworking
    }
}
```

**Complete System:** This creates a full ammunition crafting chain—find/craft the mold, gather materials, craft bullets.

**Test It:**
1. Spawn all ingredients:
   - `/additem YourModName.45calBulletMold`
   - `/additem Base.Hammer`
   - `/additem Base.ScrapMetal`
   - `/additem Base.GunPowder`
2. Open crafting menu (press B)
3. Find "Craft .45 Bullets" recipe
4. Verify it produces 8 bullets and keeps the mold

## Testing Checklist

When creating items, verify:

- [ ] **Module name matches your mod ID** - Check mod.info and module declaration match
- [ ] **Weight is reasonable** - Not 0, not 100, appropriate for item type
- [ ] **Type is appropriate** - Food for edibles, Drainable for containers, Normal for standard items
- [ ] **Icon file exists** - Or uses a valid vanilla icon name
- [ ] **DisplayName is clear** - No [Object object] or debug text
- [ ] **Item can be spawned in debug mode** - `/additem ModuleName.ItemName` works
- [ ] **Item appears in correct UI category** - Check DisplayCategory is set
- [ ] **Recipes using the item work correctly** - Test crafting recipes
- [ ] **Item has 3D model on ground** - Drop it and verify WorldStaticModel appears
- [ ] **Drainable items show charge meter** - Right-click shows percentage remaining
- [ ] **Food items affect hunger** - Eat and check stats changed
- [ ] **Tools can be kept in recipes** - Use `keep` keyword and verify tool remains

**Debug Commands:**
- `/additem ModuleName.ItemName` - Spawn your item
- `/setstat hunger 50` - Set hunger to test food
- `/godmode` - Invincibility for testing

## Source Files

**Vanilla Reference Files:**
- `R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\items.txt` - Main vanilla items
- `R:\Games\Steam\steamapps\common\ProjectZomboid\media\scripts\newitems.txt` - Newer vanilla items

**Workshop Mod Reference:**
- Workshop ID: 2680473910 (Advanced Crafting mod with good examples)

**Research Date:** 2025-11-06

---

> **Next Steps**: Now that you understand item creation, explore [Vanilla Item Anatomy](vanilla-item-anatomy) to see detailed breakdowns of complex items, or jump into [Module Dependencies](module-dependencies) to understand cross-mod item references.
