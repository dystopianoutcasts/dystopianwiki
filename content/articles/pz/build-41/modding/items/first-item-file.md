---
id: items-first-item-file
slug: first-item-file
title: "Your First Custom Item"
game: pz
version: build-41
section: modding
category: items
subcategory: null
difficulty: beginner
tags:
  - beginner
  - item
  - tutorial
  - hands-on
  - learning-path
  - food
excerpt: "Step-by-step tutorial to create your first custom food item in Project Zomboid, from script file to in-game testing."
table_of_contents:
  - text: "Why Create Custom Items?"
    link: "#why-create-custom-items"
  - text: "What We're Making"
    link: "#what-were-making"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Step 1: Create the Items File"
    link: "#step-1-create-the-items-file"
  - text: "Step 2: Write the Item Definition"
    link: "#step-2-write-the-item-definition"
  - text: "Step 3: Understanding Each Property"
    link: "#step-3-understanding-each-property"
  - text: "Step 4: Test the Item"
    link: "#step-4-test-the-item"
  - text: "Step 5: Add More Properties"
    link: "#step-5-add-more-properties"
  - text: "Creating Multiple Items"
    link: "#creating-multiple-items"
  - text: "Testing Multiple Items"
    link: "#testing-multiple-items"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Troubleshooting"
    link: "#troubleshooting"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Creating Item Icons"
    path: /build-41/modding/items/item-icons
  - title: "Connecting Items and Recipes"
    path: /build-41/modding/items/item-recipe-connection
last_updated: 2026-01-28
---

# Your First Custom Item

## Why Create Custom Items?

When you open your inventory in Project Zomboid and see that chocolate bar, or canned soup, or baseball bat—every single one of those items was defined by someone writing a text file. They chose the weight, the hunger value, the spoilage time, the icon. And now you're going to do the same thing.

**Creating a custom item** is the foundation of modding in Project Zomboid. Want to add new weapons? Custom food? Crafting materials? Tools? It all starts here—with a simple text file that tells the game "this item exists, and here's how it works."

Why does this matter? Because once you understand how to create items, you unlock everything else:
- Create items → Add recipes that craft those items → Add Lua behaviors that make them special
- Create items → Spawn them in loot tables → Let players find them naturally
- Create items → Connect them to game systems → Make them interact with the world

This tutorial will walk you through creating your first custom item from scratch—an **Energy Bar** that restores hunger, provides calories, and eventually spoils. By the end, you'll know how to create any food item in the game, and you'll understand the pattern for creating weapons, tools, and materials.

Let's start simple, test it, then build up from there.

---

## What We're Making

An **Energy Bar** with:
- **Restores hunger** (-15 hunger, same as a chocolate bar)
- **Gives calories** (250 calories for survival)
- **Provides nutrition** (carbs, protein, fat)
- **Takes time to spoil** (60 days fresh, 90 days rotten)
- **Uses a vanilla icon** (we'll borrow the chocolate icon to start)
- **Can be found and eaten** in-game

By the end, you'll have three items:
1. **Energy Bar** - Regular version
2. **Deluxe Energy Bar** - Premium version (more nutrition, reduces stress)
3. **Energy Bar Wrapper** - Empty wrapper (for crafting recipes later)

---

## Prerequisites

Before starting, make sure you have:

1. **A mod folder** set up with the basic structure
   - If you haven't done this, see [Mod Folder Structure](/build-41/modding/setup/mod-folder-structure)
2. **A mod.info file** that tells PZ about your mod
   - See [The mod.info File](/build-41/modding/setup/mod-info-file)
3. **Debug mode enabled** for spawning and testing items
   - See [Debug Mode](/build-41/modding/setup/debug-mode)

Your mod folder should look like this:
```
MyFirstMod/
├── mod.info
└── media/
    (empty for now - we'll add files next)
```

---

## Step 1: Create the Items File

In your mod folder, create the following structure:

```
MyFirstMod/
├── mod.info
└── media/
    └── scripts/
        └── my_items.txt    ← Create this file
```

**Steps:**
1. Navigate to your mod folder
2. Create a `media` folder (if it doesn't exist)
3. Inside `media`, create a `scripts` folder
4. Inside `scripts`, create a file called `my_items.txt`

> **Why this location?** The game looks for item definitions in `media/scripts/`. Any `.txt` file in this folder will be loaded by the game. You can name it anything you want (`items.txt`, `my_items.txt`, `food_items.txt`), but it MUST be inside `media/scripts/` and MUST have a `.txt` extension.

---

## Step 2: Write the Item Definition

Open `my_items.txt` in your text editor and paste this:

```
module Base
{
    item EnergyBar
    {
        Type = Food,  // Tells the game this is food (can be eaten)
        DisplayName = Energy Bar,  // Name shown in inventory and tooltips
        Icon = Chocolate,  // Uses vanilla chocolate bar icon (temporary)
        Weight = 0.1,  // Weight in inventory (0.1 = very light)

        /* Hunger and Thirst */
        HungerChange = -15,  // Reduces hunger by 15 (negative = reduces)
        ThirstChange = -5,  // Reduces thirst by 5 (slightly hydrating)

        /* Nutrition (calories and macros) */
        Calories = 250,  // Energy content (compare: Apple=52, Steak=271)
        Carbohydrates = 35,  // Carbs in grams
        Proteins = 5,  // Protein in grams
        Lipids = 10,  // Fat in grams

        /* Spoilage */
        DaysFresh = 60,  // Stays fresh for 60 in-game days
        DaysTotallyRotten = 90,  // Completely rotten after 90 days

        /* UI */
        DisplayCategory = Food,  // Category in inventory/loot screens
    }
}
```

**Save the file.**

---

## Step 3: Understanding Each Property

Let's break down what each line does:

### Module Declaration
```
module Base
{
```
**What it does:** Adds your item to the `Base` namespace (the vanilla game's namespace).

**Full item ID:** `Base.EnergyBar`

**Why Base?** Using `module Base` adds your items to the same namespace as vanilla items, making them compatible with existing recipes and systems. You could use your own namespace (`module MyMod`), but then you'd need to update all recipes to reference `MyMod.EnergyBar` instead of `Base.EnergyBar`.

---

### Item Declaration
```
    item EnergyBar
    {
```
**What it does:** Declares a new item with the ID `EnergyBar`.

**Item ID rules:**
- No spaces (use `EnergyBar`, not `Energy Bar`)
- Case-sensitive (`EnergyBar` ≠ `energybar`)
- This ID is used everywhere: recipes, spawning, Lua scripts

---

### Type Property
```
        Type = Food,
```
**What it does:** Defines what KIND of item this is.

**Available types:**
- `Food` - Can be eaten, has hunger/nutrition
- `Weapon` - Can attack zombies, has damage
- `Drainable` - Has uses/durability (water bottles, batteries)
- `Normal` - Generic item (materials, wrappers)

**Why Food?** We want this to be edible, so we use `Type = Food`. This enables all the food-related properties (HungerChange, Calories, spoilage).

---

### DisplayName
```
        DisplayName = Energy Bar,
```
**What it does:** The name players see in-game.

**Examples:**
- `DisplayName = Energy Bar` → Shows "Energy Bar" in inventory
- `DisplayName = Deluxe Energy Bar` → Shows "Deluxe Energy Bar"

**Note:** DisplayName CAN have spaces (unlike the item ID).

---

### Icon
```
        Icon = Chocolate,
```
**What it does:** Tells the game which icon texture to use.

**For now:** We're borrowing the vanilla chocolate bar icon (`Chocolate`).

**Later:** You can create custom icons ([Item Icons Tutorial](/build-41/modding/items/item-icons))

**Common vanilla icons you can borrow:**
- `Chocolate` - Chocolate bar
- `Crisps` - Chips/snacks
- `Cereal` - Cereal box
- `TinnedBeans` - Canned food
- `Apple` - Fruit
- `Bread` - Bread loaf

---

### Weight
```
        Weight = 0.1,
```
**What it does:** Item weight in inventory.

**Scale:**
- `0.1` = Very light (energy bar, bandage)
- `0.5` = Light (book, can of food)
- `1.0` = Medium (hammer, axe)
- `3.0` = Heavy (crowbar, plank)
- `10.0` = Very heavy (generator, log)

**Why 0.1?** Energy bars are small and light. This lets players carry dozens without getting over-encumbered.

---

### HungerChange
```
        HungerChange = -15,
```
**What it does:** How much this item changes the player's hunger.

**Important:** Negative values REDUCE hunger (which is what you want for food).

**Scale:**
- `-5` = Light snack (cookie)
- `-15` = Decent snack (chocolate, energy bar)
- `-30` = Meal (sandwich)
- `-50` = Large meal (steak, pasta)

**Why -15?** Similar to vanilla chocolate bars. Enough to reduce hunger noticeably but not fill you up completely.

---

### ThirstChange
```
        ThirstChange = -5,
```
**What it does:** How much this item changes the player's thirst.

**Important:** Negative values REDUCE thirst.

**Scale:**
- `-5` = Slightly hydrating (fruit, energy bar)
- `-10` = Moderately hydrating (juice)
- `-30` = Very hydrating (water bottle)
- `-80` = Extremely hydrating (full water bottle)

**Why -5?** Energy bars contain some moisture. Not very hydrating, but helps a little.

---

### Nutrition Properties
```
        Calories = 250,
        Carbohydrates = 35,
        Proteins = 5,
        Lipids = 10,
```
**What they do:** Define the nutritional content.

**Calories:** Energy value. Higher = more energy for the player.
- `52` = Apple (low)
- `250` = Energy bar (medium)
- `400` = Pasta (high)

**Carbohydrates, Proteins, Lipids:** Macronutrients. Players with the **Nutritionist** trait can see these values and benefit from balanced meals.

**Why these values?** Realistic for an energy bar (high carbs for quick energy, some protein, some fat).

---

### Spoilage Properties
```
        DaysFresh = 60,
        DaysTotallyRotten = 90,
```
**What they do:** Define how long the item lasts before spoiling.

**DaysFresh:** How many in-game days the item stays "Fresh"
**DaysTotallyRotten:** How many days until it's "Completely Rotten" (inedible)

**Timeline:**
- Days 0-60: Fresh (green indicator)
- Days 60-90: Aging (yellow indicator, still edible)
- Day 90+: Rotten (red indicator, causes sickness if eaten)

**Why 60/90?** Energy bars have preservatives and are shelf-stable. Compare to fresh food (bread: 7 days fresh, 14 days rotten).

---

### DisplayCategory
```
        DisplayCategory = Food,
```
**What it does:** UI category in inventory screens and loot windows.

**Available categories:**
- `Food` - Food tab
- `Weapon` - Weapon tab
- `Literature` - Books/magazines
- `Clothing` - Clothes/armor
- `Container` - Bags/containers
- `Material` - Crafting materials

**Why Food?** So players can find it in the Food tab when sorting inventory.

---

## Step 4: Test the Item

Now let's see if it works!

### Enable and Load

1. **Launch Project Zomboid**
2. **Go to the Mods menu**
3. **Enable your mod** (check the box next to your mod name)
4. **Start or continue a game**

---

### Spawn the Item

Once in-game, open the **debug console** (press `~` or `F11` depending on your setup).

Type this command:
```lua
getPlayer():getInventory():AddItem("Base.EnergyBar")
```

Press Enter.

**What this does:**
- `getPlayer()` - Gets your player character
- `:getInventory()` - Gets the player's inventory
- `:AddItem("Base.EnergyBar")` - Adds one Energy Bar to inventory

**Check your inventory** (press `I`). You should see your Energy Bar!

---

### Test Eating

1. **Right-click the Energy Bar** in your inventory
2. **Select "Eat"**
3. **Watch your hunger bar** - it should decrease by 15 points
4. **Check the item info** (hover over it) - you should see nutrition details

**If it works:** Congratulations! You've created your first custom item!

**If it doesn't work:** Check [Troubleshooting](#troubleshooting) below.

---

## Step 5: Add More Properties

Let's make our energy bar more interesting by adding happiness and stress reduction (comfort food!).

Update `my_items.txt` to this:

```
module Base
{
    item EnergyBar
    {
        Type = Food,  // Edible item
        DisplayName = Energy Bar,  // Name in inventory
        Icon = Chocolate,  // Borrowed vanilla icon
        Weight = 0.1,  // Very light

        /* ===== NUTRITION ===== */
        HungerChange = -15,  // Reduces hunger by 15
        ThirstChange = -5,  // Slightly hydrating
        Calories = 250,  // Energy content
        Carbohydrates = 35,  // Carbs (grams)
        Proteins = 5,  // Protein (grams)
        Lipids = 10,  // Fat (grams)

        /* ===== SPOILAGE ===== */
        DaysFresh = 60,  // Fresh for 60 days
        DaysTotallyRotten = 90,  // Rotten after 90 days

        /* ===== UI ===== */
        DisplayCategory = Food,  // Food category
        Tooltip = Tooltip_food,  // Shows food-related hover info

        /* ===== MOOD (NEW!) ===== */
        UnhappyChange = -5,  // Reduces unhappiness (comfort food)
        StressChange = -5,  // Reduces stress
    }
}
```

**New properties:**
- `UnhappyChange = -5` - Reduces unhappiness by 5 (eating tasty food makes you happier)
- `StressChange = -5` - Reduces stress by 5 (comfort food effect)
- `Tooltip = Tooltip_food` - Shows detailed food tooltip on hover

**Reload and test:**
1. Quit the game
2. Restart and reload your mod
3. Spawn a new Energy Bar
4. Eat it and watch your mood improve!

---

## Creating Multiple Items

You can define multiple items in the same file. Let's add a premium version and an empty wrapper.

Replace the contents of `my_items.txt` with this:

```
module Base
{
    /* ===== ENERGY BAR (Regular) ===== */
    item EnergyBar
    {
        Type = Food,  // Edible item
        DisplayName = Energy Bar,  // Name shown in-game
        Icon = Chocolate,  // Uses vanilla chocolate icon
        Weight = 0.1,  // Weight: 0.1 units (very light)

        /* Hunger and hydration */
        HungerChange = -15,  // Reduces hunger by 15 points
        ThirstChange = -5,  // Reduces thirst by 5 points

        /* Nutrition */
        Calories = 250,  // 250 calories
        Carbohydrates = 35,  // 35g carbs
        Proteins = 5,  // 5g protein
        Lipids = 10,  // 10g fat

        /* Spoilage */
        DaysFresh = 60,  // Stays fresh for 60 days
        DaysTotallyRotten = 90,  // Completely rotten after 90 days

        /* UI */
        DisplayCategory = Food,  // Appears in Food category
    }

    /* ===== ENERGY BAR DELUXE (Premium) ===== */
    item EnergyBarDeluxe
    {
        Type = Food,  // Edible item
        DisplayName = Deluxe Energy Bar,  // Premium version name
        Icon = Chocolate,  // Same icon for now (can customize later)
        Weight = 0.15,  // Slightly heavier than regular (more ingredients)

        /* Hunger and hydration (BETTER than regular) */
        HungerChange = -25,  // Reduces hunger more (vs -15 for regular)
        ThirstChange = -5,  // Same hydration

        /* Nutrition (HIGHER than regular) */
        Calories = 400,  // More calories (vs 250 for regular)
        Carbohydrates = 45,  // More carbs
        Proteins = 10,  // Double the protein
        Lipids = 15,  // More fat

        /* Spoilage (SHORTER than regular - fresh ingredients) */
        DaysFresh = 45,  // Spoils faster (45 vs 60 days)
        DaysTotallyRotten = 70,  // Rotten faster (70 vs 90 days)

        /* UI */
        DisplayCategory = Food,  // Food category

        /* Mood (BONUS: premium = happiness) */
        UnhappyChange = -10,  // Reduces unhappiness by 10 (tastes great!)
    }

    /* ===== ENERGY BAR WRAPPER (Empty wrapper for crafting) ===== */
    item EnergyBarWrapper
    {
        Type = Normal,  // NOT food (just a wrapper)
        DisplayName = Energy Bar Wrapper,  // Name shown in-game
        Icon = PlasticBag,  // Uses vanilla plastic bag icon
        Weight = 0.01,  // Almost weightless (just packaging)
        DisplayCategory = Material,  // Material category (for crafting)
    }
}
```

**What we added:**
1. **EnergyBarDeluxe** - Premium version with:
   - More nutrition (+150 calories, double protein)
   - Better hunger reduction (-25 vs -15)
   - Happiness boost (-10 unhappiness)
   - Spoils faster (premium = fresh ingredients)

2. **EnergyBarWrapper** - Empty wrapper with:
   - `Type = Normal` (not food)
   - Nearly weightless (0.01)
   - Can be used in crafting recipes later

---

## Testing Multiple Items

Let's spawn all three items at once using Lua.

Open the debug console (`~`) and type:

```lua
-- Get player's inventory
local inv = getPlayer():getInventory()

-- Add all three items
inv:AddItem("Base.EnergyBar")  -- Regular version
inv:AddItem("Base.EnergyBarDeluxe")  -- Premium version
inv:AddItem("Base.EnergyBarWrapper")  -- Empty wrapper
```

Press Enter.

**Check your inventory.** You should see:
- **Energy Bar** (regular icon)
- **Deluxe Energy Bar** (same icon, different name)
- **Energy Bar Wrapper** (plastic bag icon)

**Test them:**
- Eat the **Energy Bar** - reduces hunger by 15
- Eat the **Deluxe Energy Bar** - reduces hunger by 25 AND makes you happier
- Try to eat the **Wrapper** - can't eat it (Type = Normal, not Food)

---

## Common Mistakes

### Mistake 1: Using Colon Instead of Equals

❌ **Doesn't work:**
```
item EnergyBar
{
    Type: Food,  // WRONG: uses colon
    DisplayName: Energy Bar,  // WRONG: uses colon
}
```

**What happens:** Parser error. The game can't read the file and your mod won't load.

✅ **Works:**
```
item EnergyBar
{
    Type = Food,  // CORRECT: uses equals sign
    DisplayName = Energy Bar,  // CORRECT: uses equals sign
}
```

**Why:** Project Zomboid's script syntax uses `=` for assignments, not `:`. This is different from JSON or some other formats you might be used to.

---

### Mistake 2: Missing Comma After Property

❌ **Syntax error:**
```
item EnergyBar
{
    Type = Food,  // Has comma
    DisplayName = Energy Bar  // MISSING comma!
    Weight = 0.1,  // Won't be parsed correctly
}
```

**What happens:** Parser error. The game stops reading after `DisplayName` because it expects a comma.

✅ **Works:**
```
item EnergyBar
{
    Type = Food,  // Has comma
    DisplayName = Energy Bar,  // Has comma (safe)
    Weight = 0.1,  // Has comma
}
```

**Why:** Every property needs a comma separator (except technically the last one, but it's safe to always include commas). Missing commas cause parse errors.

**Pro tip:** Always put commas after every property, even the last one. It prevents errors when you add more properties later.

---

### Mistake 3: Spaces in Item ID

❌ **Doesn't work:**
```
module Base
{
    item Energy Bar  // WRONG: has space in ID
    {
        DisplayName = Energy Bar,
    }
}
```

**What happens:** Parser error or the item won't spawn correctly.

✅ **Works:**
```
module Base
{
    item EnergyBar  // CORRECT: no spaces
    {
        DisplayName = Energy Bar,  // DisplayName CAN have spaces
    }
}
```

**Why:** Item IDs must be single words (no spaces) because they're used as identifiers in code. The `DisplayName` property is what players see, so it CAN have spaces.

**Pattern:**
- Item ID: `EnergyBar` (no spaces, code identifier)
- DisplayName: `Energy Bar` (spaces OK, player-facing)

---

### Mistake 4: Wrong Module Reference When Spawning

❌ **Doesn't work:**
```lua
-- In debug console:
getPlayer():getInventory():AddItem("EnergyBar")  // MISSING module!
```

**What happens:** Nothing spawns. Console shows "item not found" error.

✅ **Works:**
```lua
-- In debug console:
getPlayer():getInventory():AddItem("Base.EnergyBar")  // Includes module
```

**Why:** Items are namespaced. When you define `module Base { item EnergyBar }`, the full ID becomes `Base.EnergyBar`. You must use the full ID when spawning or referencing items.

**Pattern:**
- Module: `Base`
- Item: `EnergyBar`
- Full ID: `Base.EnergyBar`

---

### Mistake 5: Wrong File Extension

❌ **Doesn't work:**
```
media/scripts/my_items.txt.txt  // Double extension
media/scripts/my_items.doc       // Word document
media/scripts/my_items           // No extension
```

**What happens:** Game doesn't load the file because it's not `.txt`.

✅ **Works:**
```
media/scripts/my_items.txt  // Correct extension
```

**Why:** The game only loads `.txt` files from `media/scripts/`. Make sure your file is actually named `my_items.txt` and not `my_items.txt.txt` (which happens if you have file extensions hidden in Windows).

**How to check (Windows):**
1. Open File Explorer
2. Go to View → Show → File name extensions
3. Verify the file is named `my_items.txt` (not `my_items.txt.txt`)

---

## Troubleshooting

### Item Doesn't Appear in Inventory

**Symptoms:** You spawn the item but nothing appears.

**Fixes:**
1. **Check mod is enabled**
   - Go to Mods menu
   - Verify your mod has a checkmark
   - Restart the game if you just enabled it

2. **Verify file location**
   - File MUST be in `media/scripts/`
   - File MUST have `.txt` extension
   - File name can be anything but MUST be `.txt`

3. **Check console.txt for errors**
   - Location: `C:\Users\[YourName]\Zomboid\console.txt`
   - Look for "ERROR" or "EXCEPTION" messages
   - Common errors: syntax error, missing comma, wrong module

4. **Verify item ID is correct**
   - If you defined `module Base { item EnergyBar }`, the ID is `Base.EnergyBar`
   - If you defined `module MyMod { item EnergyBar }`, the ID is `MyMod.EnergyBar`

---

### Can't Eat the Item

**Symptoms:** Item appears in inventory but right-click doesn't show "Eat" option.

**Fixes:**
1. **Verify Type = Food**
   ```
   Type = Food,  // MUST be exactly this
   ```

2. **Check HungerChange exists**
   ```
   HungerChange = -15,  // MUST be present for food
   ```

3. **Ensure item isn't rotten**
   - Spawn a fresh item
   - Or increase `DaysFresh` to a very high number for testing

4. **Reload the game**
   - Quit completely
   - Restart PZ
   - Enable mod and load game

---

### Item Has No Icon (Question Mark Icon)

**Symptoms:** Item appears but shows a white question mark icon.

**Fixes:**
1. **Check Icon property exists**
   ```
   Icon = Chocolate,  // MUST be present
   ```

2. **Verify icon name matches vanilla**
   - Common vanilla icons: `Chocolate`, `Crisps`, `Apple`, `Bread`, `TinnedBeans`
   - Case-sensitive: `Chocolate` works, `chocolate` doesn't

3. **For custom icons:**
   - Check texture path is correct
   - Verify icon file exists in `media/textures/Item_[IconName].png`
   - See [Item Icons Tutorial](/build-41/modding/items/item-icons)

---

### Item Properties Don't Work

**Symptoms:** Item appears and can be eaten, but hunger doesn't change or spoilage doesn't work.

**Fixes:**
1. **Check property spelling**
   - `HungerChange` (not `HungerReduction` or `Hunger`)
   - Case-sensitive

2. **Verify syntax**
   ```
   HungerChange = -15,  // Equals sign, comma at end
   ```

3. **Check negative/positive values**
   - To REDUCE hunger: `HungerChange = -15` (negative)
   - To INCREASE hunger: `HungerChange = 15` (positive)

4. **Reload completely**
   - Quit game
   - Delete old save (or start new game)
   - Restart and test fresh

---

## Key Takeaways

1. **Items go in `media/scripts/`** as `.txt` files
   - Location: `YourMod/media/scripts/your_items.txt`
   - Extension: MUST be `.txt`
   - Name: Can be anything (items.txt, my_items.txt, etc.)

2. **Use equals, not colons** - `Type = Food,` not `Type: Food,`
   - Syntax: `Property = Value,`
   - Always include comma after each property

3. **Type determines behavior** - `Type = Food` makes it edible
   - `Food` = Can eat, has nutrition, spoils
   - `Weapon` = Can attack with
   - `Normal` = Generic item (no special behavior)
   - `Drainable` = Has uses/durability

4. **Item IDs can't have spaces** - `EnergyBar` not `Energy Bar`
   - Item ID: `EnergyBar` (code identifier, no spaces)
   - DisplayName: `Energy Bar` (player-facing, spaces OK)

5. **Borrow vanilla icons to start** - `Icon = Chocolate` uses vanilla icon
   - Test with vanilla icons first
   - Create custom icons later ([Icon Tutorial](/build-41/modding/items/item-icons))

6. **Test with debug console** - `AddItem("Base.YourItem")`
   - Press `~` or `F11` for console
   - Command: `getPlayer():getInventory():AddItem("Base.ItemID")`
   - Use full ID including module (Base.ItemID, not just ItemID)

7. **Negative values reduce** - `HungerChange = -15` reduces hunger
   - Negative = reduce (good for food)
   - Positive = increase (bad effects)

8. **Food items need nutrition properties** - HungerChange, Calories, etc.
   - Minimum: `Type = Food`, `HungerChange`
   - Recommended: Add Calories, Carbs, Protein, Lipids
   - Optional: Spoilage (DaysFresh, DaysTotallyRotten)

9. **Multiple items in one file is OK** - Define as many as you want
   - Pattern: `module Base { item Item1 {} item Item2 {} }`
   - Organize by type or category

10. **Start simple, add complexity** - Get it working first, enhance later
    - V1: Basic properties (Type, DisplayName, Icon)
    - V2: Add nutrition, spoilage
    - V3: Add mood effects, custom icons

---

**What's next?** Now that you've created your first item, you can:
- Add custom icons ([Item Icons Tutorial](/build-41/modding/items/item-icons))
- Create recipes that craft your items ([Recipe Tutorial](/build-41/modding/recipes/recipe-basics))
- Add Lua behaviors that make items do special things ([Lua Basics](/build-41/modding/lua/lua-basics))

Congratulations! You've created your first custom item in Project Zomboid!
