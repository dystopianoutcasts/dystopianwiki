---
id: items-item-anatomy
slug: item-anatomy
title: "Anatomy of an Item"
game: pz
version: build-41
section: modding
category: items
subcategory: null
difficulty: beginner
tags:
  - beginner
  - item
  - anatomy
  - syntax
  - learning-path
  - fundamentals
excerpt: "Understand the structure and syntax of Project Zomboid item definitions by breaking down item scripts line by line."
table_of_contents:
  - text: "Why Understanding Item Anatomy Matters"
    link: "#why-understanding-item-anatomy-matters"
  - text: "The Simplest Item"
    link: "#the-simplest-item"
  - text: "Breaking It Down Line by Line"
    link: "#breaking-it-down-line-by-line"
  - text: "Item Syntax Rules"
    link: "#item-syntax-rules"
  - text: "Common Item Types"
    link: "#common-item-types"
  - text: "Essential Properties Reference"
    link: "#essential-properties-reference"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Reading Vanilla Items"
    link: "#reading-vanilla-items"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Your First Custom Item"
    path: /build-41/modding/items/first-item-file
  - title: "Creating Item Icons"
    path: /build-41/modding/items/item-icons
last_updated: 2026-01-28
---

# Anatomy of an Item

## Why Understanding Item Anatomy Matters

When you pick up a baseball bat in Project Zomboid, right-click it, and see "Equip Primary"—how does the game know this is a weapon you can swing? When you eat an apple and your hunger decreases by 10 points—how does the game know this food should reduce hunger?

The answer: **every item in the game is defined by a text file** that lists its properties. The baseball bat's text file says `Type = Weapon`, `MinDamage = 0.8`, `MaxDamage = 1.2`. The apple's file says `Type = Food`, `HungerChange = -10`. The game reads these files and knows exactly how to handle each item.

**Understanding item anatomy** means understanding the structure and syntax of these definitions. Once you can read item definitions, you can:
- **Create new items** by copying and modifying existing patterns
- **Debug problems** by spotting syntax errors
- **Learn from vanilla** by reading how The Indie Stone structured items
- **Understand documentation** that references item properties

This guide breaks down item definitions line by line, explaining every piece of syntax. By the end, you'll be able to look at any item definition and understand exactly what it does—and you'll know how to write your own.

Let's start with the absolute simplest item possible, then build up from there.

---

## The Simplest Item

Here's a minimal item definition—the bare minimum needed for the game to recognize an item:

```
module Base  // Namespace: this item belongs to "Base" module
{
    item MyItem  // Item ID: this creates an item called "MyItem"
    {
        Type = Normal,  // Item type: Normal = generic item (no special behavior)
        DisplayName = My Item,  // Display name: what players see in inventory
        Icon = MyItem,  // Icon: references MyItem.png texture file
        Weight = 1.0,  // Weight: 1.0 units (affects carrying capacity)
    }
}
```

**What this creates:**
- An item with full ID `Base.MyItem` (module + item name)
- Named "My Item" in-game (DisplayName with spaces)
- Using icon file `media/textures/Item/MyItem.png`
- Weighing 1.0 units (medium weight)

**That's it.** Six lines of code to create an item. Everything else is optional enhancements (damage, hunger, spoilage, etc.).

---

## Breaking It Down Line by Line

Let's examine each line to understand what it does and why it's needed.

### Line 1: Module Declaration

```
module Base {
```

**What it does:** Opens a module declaration.

**Module:** A namespace (container) for items. Prevents naming conflicts between mods.

**Why "Base"?**
- `Base` is the vanilla game's module
- Using `module Base` adds your items to vanilla's namespace
- Your item becomes `Base.MyItem` (accessible like vanilla items)

**Alternative:**
```
module MyMod {
    item MyItem { ... }
}
```
- Creates item ID `MyMod.MyItem`
- Keeps your items separate from vanilla
- Useful for large mods with many items

**Rule:** Every item MUST be inside a module. No exceptions.

---

### Line 2: Item Declaration

```
    item MyItem {
```

**What it does:** Declares a new item.

**Syntax breakdown:**
- `item` - Keyword (tells the game "this is an item definition")
- `MyItem` - Item ID (unique identifier, no spaces)
- `{` - Opens the property block

**Item ID rules:**
- **No spaces** - Use `MyItem` not `My Item`
- **Alphanumeric** - Letters and numbers only (underscores OK)
- **Case-sensitive** - `MyItem` ≠ `myitem` ≠ `MYITEM`
- **Unique** - No two items in the same module can have the same ID

**Examples:**
- [YES] `item MyKnife`
- [YES] `item SuperAxe`
- [YES] `item Energy_Bar`
- [NO] `item My Knife` (space)
- [NO] `item Super-Axe` (hyphen not allowed)

---

### Line 3: Type Property

```
        Type = Normal,
```

**What it does:** Defines the item's TYPE—the most important property.

**Type determines:**
- How the game treats this item
- Which properties are available
- What players can do with it

**Available types:**

| Type | For | Example Items |
|------|-----|---------------|
| `Normal` | Basic items with no special behavior | Materials, tools, wrappers |
| `Food` | Edible items with hunger/thirst values | Apple, bread, canned soup |
| `Weapon` | Melee or ranged weapons | Bat, knife, pistol |
| `Drainable` | Items with uses/durability | Glue, thread, duct tape |
| `Literature` | Readable items (books, magazines) | Skill books, magazines |
| `Clothing` | Wearable items | Shirt, pants, jacket |
| `Container` | Items that hold other items | Backpack, bag |

**Why this matters:**
- `Type = Food` enables food properties (HungerChange, Calories, spoilage)
- `Type = Weapon` enables combat properties (MinDamage, MaxRange)
- `Type = Normal` gives you a basic item (no special behavior)

**Most common:** Start with `Type = Normal` for generic items, then change to `Food` or `Weapon` when needed.

---

### Line 4: DisplayName Property

```
        DisplayName = My Item,
```

**What it does:** The name players see in-game.

**Important differences:**

| Property | Can Have Spaces? | Example |
|----------|------------------|---------|
| Item ID | No | `item MyItem` |
| DisplayName | Yes | `DisplayName = My Item` |

**Examples:**
- `DisplayName = Baseball Bat` ← Shows "Baseball Bat" in inventory
- `DisplayName = Can of Soup` ← Shows "Can of Soup"
- `DisplayName = Wicked Katana` ← Shows "Wicked Katana"

**Note:** DisplayName can include special characters, numbers, spaces—anything you want players to see.

---

### Line 5: Icon Property

```
        Icon = MyItem,
```

**What it does:** References the texture file for this item's icon.

**File path:**
```
media/textures/Item/MyItem.png
```

**Key rules:**
- **Don't include `.png`** in the property (game adds it automatically)
- **Case-sensitive** - `Icon = MyItem` looks for `MyItem.png` not `myitem.png`
- **64x64 pixels** recommended (vanilla standard)

**Examples:**
- `Icon = Chocolate` → Uses `media/textures/Item/Chocolate.png`
- `Icon = BaseballBat` → Uses `media/textures/Item/BaseballBat.png`
- `Icon = MyCustomIcon` → Uses `media/textures/Item/MyCustomIcon.png`

**Tip:** You can borrow vanilla icons by using vanilla icon names (Chocolate, Apple, Hammer, etc.) while developing. Create custom icons later.

---

### Line 6: Weight Property

```
        Weight = 1.0,
```

**What it does:** Defines how much the item weighs in inventory.

**Weight scale:**

| Weight | Feel | Example Items |
|--------|------|---------------|
| 0.1 | Very light | Bullets, bandages, small items |
| 0.3 | Light | Can of food, book |
| 0.5 | Light-medium | Water bottle, flashlight |
| 1.0 | Medium | Hammer, bottle, kitchen knife |
| 2.0 | Medium-heavy | Baseball bat, frying pan |
| 3.0 | Heavy | Crowbar, axe |
| 5.0 | Very heavy | Sledgehammer, plank |
| 10.0 | Extremely heavy | Generator, log |

**Why it matters:**
- Players have limited carrying capacity
- Heavy items slow movement
- Weight affects what players can realistically carry

**Balance tip:** Compare to vanilla items. A knife should be ~0.5, a bat ~2.0, a sledgehammer ~5.0.

---

### Line 7: Closing Braces

```
    }
}
```

**What it does:** Closes the item definition and module.

**Structure:**
```
module Base {         ← Opens module
    item MyItem {     ← Opens item
        ...           ← Properties
    }                 ← Closes item
}                     ← Closes module
```

**Common mistake:** Forgetting closing braces causes parser errors.

---

## Item Syntax Rules

### Rule 1: Use Equals Sign (NOT Colon)

Items use `=` for assignments:

**Wrong (uses colon):**
```
item MyItem {
    Type: Normal,      // WRONG
    Weight: 1.0,       // WRONG
}
```

**Correct (uses equals):**
```
item MyItem {
    Type = Normal,     // CORRECT
    Weight = 1.0,      // CORRECT
}
```

**Why this matters:** This is the OPPOSITE of recipes (recipes use colons). Don't mix them up!

| Item Properties | Recipe Properties |
|----------------|-------------------|
| `Type = Normal,` | `Result:Item,` |
| `Weight = 1.0,` | `Time:50.0,` |

---

### Rule 2: Commas After Properties

Every property line ends with a comma:

**Wrong (missing comma):**
```
item MyItem {
    Type = Normal      // MISSING comma
    Weight = 1.0,
}
```

**Correct (has comma):**
```
item MyItem {
    Type = Normal,     // Has comma
    Weight = 1.0,      // Has comma
}
```

**Tip:** Always include commas, even on the last property. It prevents errors when you add more properties later.

---

### Rule 3: No Quotes Around Most Values

Most property values don't need quotes:

**Wrong (unnecessary quotes):**
```
item MyItem {
    DisplayName = "My Item",    // Don't need quotes
    Icon = "MyItem",            // Don't need quotes
}
```

**Correct (no quotes):**
```
item MyItem {
    DisplayName = My Item,      // No quotes
    Icon = MyItem,              // No quotes
}
```

**Exception:** Some advanced properties need quotes, but 95% of properties don't.

---

### Rule 4: Case Sensitivity

Everything is case-sensitive:

**Wrong (wrong capitalization):**
```
item myitem {              // Wrong: should be MyItem
    type = normal,         // Wrong: should be Type = Normal
    icon = myitem,         // Wrong: should be Icon = MyItem
}
```

**Correct (proper capitalization):**
```
item MyItem {              // Correct
    Type = Normal,         // Correct
    Icon = MyItem,         // Correct
}
```

**Rule:** Match capitalization exactly. `Type` ≠ `type`, `Normal` ≠ `normal`.

---

### Rule 5: Indentation (Optional but Recommended)

Indentation makes code readable:

**Hard to read (no indentation):**
```
module Base {
item MyItem {
Type = Normal,
Weight = 1.0,
}
}
```

**Easy to read (proper indentation):**
```
module Base {
    item MyItem {
        Type = Normal,
        Weight = 1.0,
    }
}
```

**Standard:** 4 spaces per indentation level (or 1 tab).

---

## Common Item Types

### Normal Item (Generic)

**Use for:** Materials, tools, wrappers, generic items with no special behavior.

```
item Crowbar
{
    Type = Normal,  // Generic item (no special behavior)
    DisplayName = Crowbar,  // Name shown to players
    Icon = Crowbar,  // Icon texture
    Weight = 2.0,  // Weight: 2.0 units (medium-heavy)
    DisplayCategory = Tool,  // Category: appears in Tool tab
}
```

**Key properties:**
- `Type = Normal` - No special behavior (can't eat, can't attack with)
- `DisplayCategory` - UI organization (optional)

---

### Food Item

**Use for:** Edible items with hunger/nutrition values.

```
item Apple
{
    Type = Food,  // Edible item
    DisplayName = Apple,  // Name: "Apple"
    Icon = Apple,  // Icon texture
    Weight = 0.2,  // Weight: very light

    /* Hunger and hydration */
    HungerChange = -10,  // Reduces hunger by 10 (negative = reduces)
    ThirstChange = 5,  // Increases thirst by 5 (positive = increases)

    /* Nutrition */
    Calories = 52,  // Energy value (52 calories)

    /* Spoilage */
    DaysFresh = 6,  // Fresh for 6 days
    DaysTotallyRotten = 12,  // Rotten after 12 days
}
```

**Key food properties:**
- `HungerChange` - **Negative reduces** hunger (what you want for food)
- `ThirstChange` - **Negative reduces** thirst (hydrating food)
- `Calories` - Energy value
- `DaysFresh/DaysTotallyRotten` - Spoilage timeline

**Important:** For food, negative HungerChange is GOOD (reduces hunger). This confuses many beginners.

---

### Weapon Item

**Use for:** Melee or ranged weapons.

```
item BaseballBat
{
    Type = Weapon,  // Weapon item (can attack with)
    DisplayName = Baseball Bat,  // Name: "Baseball Bat"
    Icon = BaseballBat,  // Icon texture
    Weight = 2.0,  // Weight: 2.0 units (medium-heavy)

    /* Weapon categories */
    Categories = Blunt,  // Damage type: blunt (vs blade, spear, etc.)
    SubCategory = Swinging,  // Attack style: swinging

    /* Damage */
    MinDamage = 0.8,  // Minimum damage per hit
    MaxDamage = 1.2,  // Maximum damage per hit

    /* Combat stats */
    MaxRange = 1.3,  // Attack reach (tiles)
    ConditionMax = 15,  // Durability (hits before breaking)
    SwingTime = 3,  // Attack speed (lower = faster)

    /* Handling */
    TwoHandWeapon = TRUE,  // Requires both hands to use
}
```

**Key weapon properties:**
- `MinDamage/MaxDamage` - Damage range per hit
- `MaxRange` - How far you can reach
- `ConditionMax` - Durability (higher = lasts longer)
- `SwingTime` - Attack speed (lower number = faster)
- `TwoHandWeapon` - TRUE/FALSE (can't use flashlight with two-hand weapons)

---

### Drainable Item

**Use for:** Items with multiple uses (glue, thread, tape, water bottles).

```
item DuctTape
{
    Type = Drainable,  // Has uses (not single-use)
    DisplayName = Duct Tape,  // Name: "Duct Tape"
    Icon = DuctTape,  // Icon texture
    Weight = 0.3,  // Weight: light

    /* Drainable properties */
    UseDelta = 0.04,  // Consumes 4% per use (25 uses total)
    UseWhileEquipped = FALSE,  // Can't use while holding it
}
```

**Key drainable properties:**
- `UseDelta` - How much is consumed per use (0.04 = 4% = 25 uses total)
- `UseWhileEquipped` - Can you use it while holding it (usually FALSE)

**Math:** 1.0 ÷ UseDelta = total uses. Example: 1.0 ÷ 0.04 = 25 uses.

---

### Container Item

**Use for:** Items that hold other items (backpacks, bags).

```
item Schoolbag
{
    Type = Container,  // Can hold other items
    DisplayName = School Bag,  // Name: "School Bag"
    Icon = Schoolbag,  // Icon texture
    Weight = 1.0,  // Weight: 1.0 (bag itself)

    /* Container properties */
    Capacity = 15,  // Can hold 15 weight units
    WeightReduction = 70,  // Reduces weight of contents by 70%
}
```

**Key container properties:**
- `Capacity` - How much weight it can hold
- `WeightReduction` - % weight reduction for contents (70 = 70% lighter)

---

## Essential Properties Reference

### Universal Properties (All Items)

| Property | Type | Example | Purpose |
|----------|------|---------|---------|
| `Type` | Keyword | `Normal` | Item behavior type (required) |
| `DisplayName` | Text | `My Item` | In-game name (required) |
| `Icon` | Text | `MyIcon` | Texture filename (required) |
| `Weight` | Number | `1.0` | Inventory weight (required) |
| `DisplayCategory` | Text | `Tool` | UI category (optional) |

---

### Inventory/Display Properties

| Property | Type | Example | Purpose |
|----------|------|---------|---------|
| `Tooltip` | Text | `Tooltip_Axe` | Hover text translation key |
| `StaticModel` | Text | `Axe` | 3D model when equipped |
| `WorldStaticModel` | Text | `Axe_Ground` | 3D model when on ground |
| `DisplayCategory` | Text | `Weapon` | UI category for sorting |

---

### Condition/Durability Properties

| Property | Type | Example | Purpose |
|----------|------|---------|---------|
| `ConditionMax` | Number | `15` | Starting/max durability |
| `ConditionLowerChanceOneIn` | Number | `30` | Chance to lose durability (1 in N) |

---

### Food Properties (Type = Food)

| Property | Type | Example | Purpose |
|----------|------|---------|---------|
| `HungerChange` | Number | `-15` | Hunger change (negative = reduces) |
| `ThirstChange` | Number | `-5` | Thirst change (negative = reduces) |
| `Calories` | Number | `250` | Energy value |
| `Carbohydrates` | Number | `35` | Carbs in grams |
| `Proteins` | Number | `5` | Protein in grams |
| `Lipids` | Number | `10` | Fat in grams |
| `DaysFresh` | Number | `60` | Days until aging starts |
| `DaysTotallyRotten` | Number | `90` | Days until completely rotten |

---

### Weapon Properties (Type = Weapon)

| Property | Type | Example | Purpose |
|----------|------|---------|---------|
| `MinDamage` | Number | `0.8` | Minimum damage per hit |
| `MaxDamage` | Number | `1.2` | Maximum damage per hit |
| `MaxRange` | Number | `1.3` | Attack reach in tiles |
| `SwingTime` | Number | `3` | Attack speed (lower = faster) |
| `Categories` | Text | `Blunt` | Damage type category |
| `TwoHandWeapon` | Boolean | `TRUE` | Requires both hands |

---

### Drainable Properties (Type = Drainable)

| Property | Type | Example | Purpose |
|----------|------|---------|---------|
| `UseDelta` | Number | `0.04` | Amount consumed per use (4%) |
| `UseWhileEquipped` | Boolean | `FALSE` | Can use while holding |

---

## Common Mistakes

### Mistake 1: Using Colon Instead of Equals

**Doesn't work:**
```
item MyItem
{
    Type: Normal,      // WRONG: uses colon
    Weight: 1.0,       // WRONG: uses colon
}
```

**What happens:** Parser error. Game can't read the file.

**Works:**
```
item MyItem
{
    Type = Normal,     // CORRECT: uses equals
    Weight = 1.0,      // CORRECT: uses equals
}
```

**Why:** Items use `=` syntax. Recipes use `:` syntax. Don't mix them up!

---

### Mistake 2: Spaces in Item ID

**Doesn't work:**
```
module Base
{
    item My Item       // WRONG: space in ID
    {
        Type = Normal,
    }
}
```

**What happens:** Parser error or item doesn't spawn.

**Works:**
```
module Base
{
    item MyItem        // CORRECT: no spaces
    {
        Type = Normal,
        DisplayName = My Item,  // DisplayName CAN have spaces
    }
}
```

**Why:** Item IDs are code identifiers (no spaces allowed). DisplayName is player-facing text (spaces OK).

---

### Mistake 3: Missing Comma

**Syntax error:**
```
item MyItem
{
    Type = Normal,     // Has comma
    Weight = 1.0       // MISSING comma!
    Icon = MyItem,     // Won't parse correctly
}
```

**What happens:** Parser error. Game stops reading after Weight.

**Works:**
```
item MyItem
{
    Type = Normal,     // Has comma
    Weight = 1.0,      // Has comma
    Icon = MyItem,     // Has comma
}
```

**Why:** Commas separate properties. Missing comma = parser thinks it's all one property.

---

### Mistake 4: Wrong Capitalization

**Doesn't work:**
```
item myitem            // Wrong: should be MyItem
{
    type = normal,     // Wrong: should be Type = Normal
}
```

**What happens:** Item might not load or properties won't work.

**Works:**
```
item MyItem            // Correct capitalization
{
    Type = Normal,     // Correct capitalization
}
```

**Why:** Everything is case-sensitive. `Type` ≠ `type`, `Normal` ≠ `normal`.

---

### Mistake 5: Including .png in Icon Property

**Doesn't work:**
```
item MyItem
{
    Icon = MyItem.png,  // WRONG: includes extension
}
```

**What happens:** Game looks for `MyItem.png.png` (double extension) and can't find it.

**Works:**
```
item MyItem
{
    Icon = MyItem,      // CORRECT: no extension
}
```

**Why:** Game automatically adds `.png` extension when looking for icon files.

---

## Try It Yourself

Let's practice reading and understanding item definitions by examining a complete weapon.

### Challenge 1: Read This Item

```
item Axe
{
    Type = Weapon,
    DisplayName = Axe,
    Icon = Axe,
    Weight = 3.0,
    Categories = Axe,
    SubCategory = Swinging,
    MinDamage = 1.2,
    MaxDamage = 1.8,
    MaxRange = 1.4,
    SwingTime = 4,
    ConditionMax = 20,
    TwoHandWeapon = TRUE,
}
```

**Questions:**
1. What type of item is this?
2. What's the item's full ID? (Hint: module + item name)
3. Can you use a flashlight while holding this?
4. How much damage does it do?
5. How durable is it?

**Answers:**
1. Weapon (Type = Weapon)
2. Base.Axe (assuming module Base)
3. No (TwoHandWeapon = TRUE means both hands required)
4. Between 1.2 and 1.8 per hit (MinDamage/MaxDamage)
5. 20 hits before breaking (ConditionMax = 20)

---

### Challenge 2: Fix This Item

```
item EnergyBar
{
    Type = Food,
    DisplayName = Energy Bar
    Icon = Chocolate,
    Weight = 0.1,
    HungerChange = 15,
}
```

**Problems:**
1. Missing comma after DisplayName
2. HungerChange should be NEGATIVE to reduce hunger

**Fixed version:**
```
item EnergyBar
{
    Type = Food,
    DisplayName = Energy Bar,   // Added comma
    Icon = Chocolate,
    Weight = 0.1,
    HungerChange = -15,         // Changed to negative
}
```

---

### Challenge 3: Create Your Own Item

Try creating a simple tool item from scratch:
- Type: Normal
- Name: Flashlight
- Weight: 0.5
- Category: Tool

**Solution:**
```
module Base
{
    item Flashlight
    {
        Type = Normal,
        DisplayName = Flashlight,
        Icon = Flashlight,
        Weight = 0.5,
        DisplayCategory = Tool,
    }
}
```

---

## Reading Vanilla Items

The best way to learn is by reading vanilla item definitions.

### Where to Find Them

**Main vanilla item files:**
```
Steam/steamapps/common/ProjectZomboid/media/scripts/
├── items.txt              ← Main items (hundreds)
├── items_weapons.txt      ← All weapons
├── items_food.txt         ← All food
├── items_literature.txt   ← Books and magazines
├── items_furniture.txt    ← Furniture items
└── newitems.txt          ← Newer items
```

---

### How to Read Vanilla Files

1. **Open items.txt** in a text editor
2. **Search for an item** you know (Ctrl+F "Baseball Bat")
3. **Read the definition** line by line
4. **Compare similar items** (compare all bats, all axes, etc.)
5. **Copy patterns** you want to use

**Example search:** Look for `item BaseballBat` in items_weapons.txt to see how vanilla defines it.

---

### Learning From Vanilla

**Pattern 1: Compare similar items**
```
Find all axes:
- Axe
- HandAxe
- StoneAxe
- FireAxe
```
Compare their damage, weight, durability to understand balance.

**Pattern 2: Find property examples**
```
Search for "TwoHandWeapon = TRUE" to find all two-handed weapons
Search for "DaysFresh" to find all food with spoilage
Search for "UseDelta" to find all drainable items
```

**Pattern 3: Copy and modify**
```
1. Find item similar to what you want
2. Copy its definition
3. Change the ID and DisplayName
4. Modify properties to match your vision
5. Test in-game
```

---

## Key Takeaways

1. **Module wraps everything** - Sets the namespace for your items
   - `module Base` creates `Base.ItemName`
   - Required - every item must be in a module

2. **Type determines behavior** - Most important property
   - `Normal` = generic item
   - `Food` = edible, has nutrition
   - `Weapon` = can attack with
   - `Drainable` = has uses

3. **Use equals, not colons** - `Type = Normal,` not `Type: Normal,`
   - This is OPPOSITE of recipes (recipes use colons)
   - Don't mix them up

4. **Icon references texture file** - Without `.png` extension
   - `Icon = MyItem` → looks for `media/textures/Item/MyItem.png`
   - Case-sensitive

5. **Weight affects gameplay** - Balance carrying capacity
   - 0.1 = very light (bullet)
   - 1.0 = medium (hammer)
   - 5.0 = very heavy (sledgehammer)

6. **DisplayName can have spaces** - Item ID cannot
   - Item ID: `EnergyBar` (no spaces, code identifier)
   - DisplayName: `Energy Bar` (spaces OK, player-facing)

7. **Commas are required** - After every property
   - Missing comma = parser error
   - Safe to include comma on last property

8. **Case-sensitive** - Match capitalization exactly
   - `Type` ≠ `type`
   - `Normal` ≠ `normal`

9. **Read vanilla items** - Best way to learn patterns
   - Located in `ProjectZomboid/media/scripts/`
   - Copy patterns you like

10. **Start simple, add complexity** - Get it working first
    - V1: Type, DisplayName, Icon, Weight (minimum)
    - V2: Add category, tooltip, models
    - V3: Add type-specific properties (damage, hunger, etc.)

---

**What's next?** Now that you understand item anatomy:
- Create your first item ([First Item Tutorial](/build-41/modding/items/first-item-file))
- Learn about item properties in detail ([Item Properties Reference](/build-41/modding/items/item-properties))
- Add custom icons ([Item Icons Tutorial](/build-41/modding/items/item-icons))

You now have the foundation to read, understand, and create any item definition in Project Zomboid!
