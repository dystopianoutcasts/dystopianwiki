---
id: fundamentals-what-is-a-mod
slug: what-is-a-mod
title: "What Is a Mod?"
game: pz
version: build-41
section: modding
category: fundamentals
subcategory: null
difficulty: beginner
tags:
  - beginner
  - introduction
  - mod
  - modding
  - basics
  - getting-started
  - overview
excerpt: "A mod is simply a collection of files that add new content to Project Zomboid. No coding required - just text files with simple patterns. Learn by creating a custom weapon in this hands-on guide."
table_of_contents:
  - text: "What Is a Mod?"
    link: "#what-is-a-mod"
  - text: "What Can Mods Do?"
    link: "#what-can-mods-do"
  - text: "The Two Things Every Mod Needs"
    link: "#the-two-things-every-mod-needs"
  - text: "Creating Your First Mod: A Super Katana"
    link: "#creating-your-first-mod-a-super-katana"
  - text: "Understanding Item Properties"
    link: "#understanding-item-properties"
  - text: "Syntax: The Patterns That Matter"
    link: "#syntax-the-patterns-that-matter"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Mod Folder Structure"
    path: /build-41/modding/setup/mod-folder-structure
  - title: "The mod.info File"
    path: /build-41/modding/setup/mod-info-file
  - title: "Debug Mode"
    path: /build-41/modding/setup/debug-mode
last_updated: 2026-01-28
---

# What Is a Mod?

## What Is a Mod?

When you swing a Katana in Project Zomboid and it does 0.8-1.2 damage, or when you craft a wooden spear and it takes 100 seconds, those numbers come from text files that the game developers wrote. Mods are just more text files with the same patterns. When you write `MinDamage = 2.0` in your mod's text file, the game reads it the exact same way it reads the vanilla Katana's damage.

A **mod** (short for modification) is a collection of files that adds new content or changes existing game behavior. That's it. No magic, no compilation, no advanced programming degree required.

If you're reading this thinking "I'm not a coder, this isn't for me," I need you to stop right there. **Most modding in Project Zomboid doesn't require any coding at all.** The developers at The Indie Stone specifically designed the game so that regular people—people who just want to add cool stuff to their favorite game—can mod it with simple text files.

Let me show you exactly what a mod is by walking you through creating one. You'll have a working weapon mod in about 10 minutes.

---

## What Can Mods Do?

Before we dive in, here's what mods can add to Project Zomboid:

**Content you can add without programming:**
- **New items** - weapons, tools, food, materials, clothing
- **Recipes** - new ways to craft and combine items
- **Textures and icons** - custom visuals for your items
- **Sounds** - new audio for weapons and actions
- **Balance changes** - adjust damage, durability, weights

**Advanced features (require Lua programming):**
- Custom UI windows and panels
- New gameplay systems
- Special item behaviors
- Context menu additions

For this article, we're focusing on the first category: adding content with text files. No programming required.

---

## The Two Things Every Mod Needs

At its core, every mod has just two things:

1. **A `mod.info` file** - tells the game "I'm a mod, here's my name and description"
2. **A `media` folder** - contains your actual content

That's the foundation. Everything else builds on these two pieces.

**The Beautiful Secret:**

The Indie Stone **exposed** their game files. "Exposed" means they put the game's content out in the open as simple text files that we can read, copy, and modify. More importantly, they configured Project Zomboid to load YOUR text files using the same system that loads THEIR text files.

**No compiling. No special tools. Just text files.**

When you write a `.txt` file in the right format and put it in the right place, the game engine reads it and says "oh, here's a new item" and adds it to the game. The game doesn't care whether it's vanilla or modded—it just loads it all.

---

## Creating Your First Mod: A Super Katana

Enough theory. Let's make something real.

**Our goal:** Create a "Wicked Katana" that does double the damage of the regular Katana.

This looks like a lot of steps, but don't let that intimidate you. Each step is straightforward, and I'll explain every single piece. Let's take this one step at a time.

---

### Step 1: Find the Vanilla Katana Definition

First, we need to see how the original Katana is defined. This is like looking at a recipe before you cook—you want to know what ingredients and measurements are used.

**Find Project Zomboid's game files:**

The easy way: In Steam, right-click Project Zomboid → **Manage** → **Browse Local Files**

This opens the game folder. Look for the `media` folder (it's alphabetical, so it'll be around the M's if you scroll).

The typical path looks like:
```
<your Steam library>\steamapps\common\ProjectZomboid\media
```

**Find the weapons file:**

Navigate to:
```
ProjectZomboid/media/scripts/items_weapons.txt
```

Open this file in any text editor. Notepad works, but VS Code or Notepad++ are better (they highlight syntax and make reading easier).

**Search for the Katana:**

Press **Ctrl+F** and search for "item Katana" (not just "Katana" - we want the item definition).

You'll find this:

```
item Katana
{
    DisplayCategory = Weapon,
    MaxRange = 1.4,
    WeaponSprite = Katana,
    MinAngle = 0.8,
    Type = Weapon,
    MinimumSwingTime = 3,
    HitFloorSound = KatanaHit,
    ImpactSound = KatanaHit,
    DoorHitSound = KatanaHit,
    HitSound = KatanaHit,
    SwingSound = KatanaSwing,
    KnockBackOnNoDeath = TRUE,
    SwingAmountBeforeImpact = 0.02,
    Categories = LongBlade,
    Weight = 2,
    ConditionLowerChanceOneIn = 15,
    PushBackMod = 0.5,
    SubCategory = Swinging,
    ConditionMax = 10,
    MaxHitCount = 3,
    DoorDamage = 8,
    SwingAnim = Bat,
    CriticalChance = 30,
    CritDmgMultiplier = 10,
    DisplayName = Katana,
    MinRange = 0.61,
    SwingTime = 3,
    HitAngleMod = -30,
    KnockdownMod = 0,
    Icon = Katana,
    RunAnim = Run_Weapon2,
    BreakSound = KatanaBreak,
    TreeDamage = 1,
    MinDamage = 0.8,
    MaxDamage = 1.2,
    BaseSpeed = 1,
    WeaponLength = 0.4,
    DamageCategory = Slash,
    DamageMakeHole = TRUE,
    TwoHandWeapon = TRUE,
    AttachmentType = BigBlade,
}
```

Look at that. It's just a list of properties with values. No scary code. No mysterious symbols. Just `PropertyName = Value` repeated over and over.

> **Key Takeaway:** Items in Project Zomboid are defined with simple `Property = Value` pairs inside curly braces. Change the values, change the item.

---

### Step 2: Understanding What You're Looking At

This might look overwhelming with 30+ properties, but let's break it down. You don't need to understand every property to start modding—just the key ones.

**The item declaration:**
```
item Katana
```
This is the **internal name**—what the game uses to identify this item. When you spawn items with debug mode or reference them in recipes, you use this name.

**The curly braces `{}`:**

Think of curly braces like a container. Everything between `{` and `}` belongs to this item. It's saying "all these properties define the Katana."

**The properties:**

Each line like `MinDamage = 0.8` sets one characteristic of the item. The format is always:
```
PropertyName = Value,
```

**The key damage properties:**
- `MinDamage = 0.8` - Minimum damage per hit
- `MaxDamage = 1.2` - Maximum damage per hit
- `CriticalChance = 30` - 30% chance to crit
- `CritDmgMultiplier = 10` - Critical hits do 10x damage

To make our super katana, we'll just change those damage numbers.

> **Technical term:** **Parsing** - When the game "parses" these files, it means it reads through them line by line, looking for patterns like `PropertyName = Value,`. The game expects specific patterns. If you break the pattern (forget a comma, misspell a property name), the item won't load.

---

### Step 3: Create Your Mod's Folder Structure

Now let's create your mod. You need to make folders in a specific place so the game can find them.

**Where do mods go?**

On Windows, navigate to:
```
%UserProfile%\Zomboid\mods\
```

If the `mods` folder doesn't exist, create it.

**Create your mod folder:**

Inside `mods\`, create a new folder called `WickedWeapons` (or any name you like—no spaces!).

**Create the required structure:**

Inside `WickedWeapons\`, create:
```
WickedWeapons/
├── mod.info                  // Identifies your mod
└── media/                    // Contains your content
    └── scripts/              // Contains item/recipe definitions
        └── wicked_weapons.txt  // Your weapon definitions
```

**Important naming note:**

DO NOT name your file `items_weapons.txt` (the same as vanilla). If you do, you risk overwriting vanilla content or causing conflicts. Always use unique names like `wicked_weapons.txt`, `yourmodname_items.txt`, etc.

---

### Step 4: Understanding Modules

Before we write the weapon, we need to understand **modules**. This is one of those concepts that sounds technical but is actually simple.

A **module** is a named container that holds items. Think of it like a folder that organizes items and prevents naming conflicts.

The vanilla game uses a module called `Base` for most items. When you spawn a Hammer in debug mode, its full name is `Base.Hammer` (module dot item name).

**Here's the basic structure:**

```
module Base  // The container name
{
    imports {  // Import other modules if needed
        Base
    }

    item YourItemHere  // Your item
    {
        // properties go here
    }
}
```

**Why use your own module name?**

You *could* put your items in `module Base`, which would make them `Base.WickedKatana`. But there are hundreds of items in the Base module, making yours hard to find.

**Better approach - use your own module:**

```
module WickedWeapons  // Your custom module name
{
    imports {
        Base  // Import vanilla items so you can reference them
    }

    item WickedKatana
    {
        // properties
    }
}
```

Now your item's full name is `WickedWeapons.WickedKatana`. Much easier to find when testing!

**Module naming rules:**
- No spaces (use `WickedWeapons`, not `Wicked Weapons`)
- Start with a letter
- Only letters, numbers, and underscores
- Keep it short—you'll type this name often

**What does `imports { Base }` do?**

This imports the Base module so you can reference vanilla items. If you create a recipe that needs `Base.Plank`, the import makes that reference work. You almost always want to import Base.

> **Key Takeaway:** Modules are named containers that organize items and prevent naming conflicts. Using your own module name (like `WickedWeapons`) makes your items easier to find than putting them in the generic `Base` module.

---

### Step 5: Write the Wicked Katana

Open `wicked_weapons.txt` in your text editor.

Now we'll create our super katana. I've organized the properties into logical groups with comments to explain what each section does:

```
module WickedWeapons  // Our custom module
{
    imports {
        Base  // Import vanilla items
    }

    item WickedKatana  // Internal name (used in debug/recipes)
    {
        /* ===== DISPLAY ===== */
        DisplayName = Wicked Katana,  // Name players see in-game
        DisplayCategory = Weapon,  // Category in spawn menus
        Icon = Katana,  // Uses vanilla Katana icon

        /* ===== TYPE & CATEGORY ===== */
        Type = Weapon,  // Tells the game this is a weapon
        SubCategory = Swinging,  // Weapon subtype for organization
        Categories = LongBlade,  // Skill category (levels LongBlade skill)
        DamageCategory = Slash,  // Type of damage (Slash, Blunt, Pierce)
        DamageMakeHole = TRUE,  // Makes holes in corpses
        TwoHandWeapon = TRUE,  // Requires both hands to use
        AttachmentType = BigBlade,  // Attachment slot type

        /* ===== VISUAL ===== */
        WeaponSprite = Katana,  // Uses vanilla Katana 3D model

        /* ===== RANGE ===== */
        MinRange = 0.61,  // Minimum attack range
        MaxRange = 1.4,  // Maximum attack range
        MinAngle = 0.8,  // Minimum angle for hits
        WeaponLength = 0.4,  // Length of weapon (affects reach)

        /* ===== SPEED & ANIMATION ===== */
        SwingTime = 3,  // Time to complete one swing
        MinimumSwingTime = 3,  // Minimum time between swings
        BaseSpeed = 1,  // Base attack speed multiplier
        SwingAnim = Bat,  // Animation to use when swinging
        RunAnim = Run_Weapon2,  // Animation when running with weapon
        SwingAmountBeforeImpact = 0.02,  // Timing of impact in swing

        /* ===== DAMAGE (DOUBLED!) ===== */
        MinDamage = 1.6,  // Minimum damage (vanilla: 0.8)
        MaxDamage = 2.4,  // Maximum damage (vanilla: 1.2)
        CriticalChance = 30,  // 30% chance to crit
        CritDmgMultiplier = 10,  // Critical hits do 10x damage

        /* ===== COMBAT MODIFIERS ===== */
        MaxHitCount = 3,  // Can hit up to 3 zombies per swing
        PushBackMod = 0.5,  // How much it pushes zombies back
        KnockdownMod = 0,  // Chance to knock zombies down
        KnockBackOnNoDeath = TRUE,  // Push back even if doesn't kill
        HitAngleMod = -30,  // Angle modifier for hit detection

        /* ===== DURABILITY ===== */
        ConditionMax = 10,  // Maximum durability
        ConditionLowerChanceOneIn = 15,  // 1-in-15 chance to lose durability per hit

        /* ===== WEIGHT ===== */
        Weight = 2,  // Weight in inventory units

        /* ===== ENVIRONMENTAL DAMAGE ===== */
        DoorDamage = 8,  // Damage to doors
        TreeDamage = 1,  // Damage to trees

        /* ===== SOUNDS ===== */
        SwingSound = KatanaSwing,  // Sound when swinging
        HitSound = KatanaHit,  // Sound when hitting zombie
        HitFloorSound = KatanaHit,  // Sound when hitting ground
        ImpactSound = KatanaHit,  // Impact sound effect
        DoorHitSound = KatanaHit,  // Sound when hitting doors
        BreakSound = KatanaBreak,  // Sound when weapon breaks
    }
}
```

**What we changed:**
- `item WickedKatana` - New internal name
- `DisplayName = Wicked Katana` - What players see in-game
- `MinDamage = 1.6` (doubled from 0.8)
- `MaxDamage = 2.4` (doubled from 1.2)

**What we kept:**
- `Icon = Katana` - Uses vanilla Katana icon
- `WeaponSprite = Katana` - Uses vanilla 3D model
- All other properties - Same speed, range, durability as vanilla

We're reusing the vanilla graphics, which is perfectly fine. You could create custom icons and models later, but this works great for now.

Save the file. You've just created your first mod!

> **Key Takeaway:** Modding is often just copying a vanilla item, changing a few values (like damage), and giving it a new name. The game handles everything else.

---

## Understanding Item Properties

That was a lot of properties! You don't need to memorize all of them, but let's understand the main categories so you know what to look for.

### Display Properties
| Property | What It Does | Example |
|----------|--------------|---------|
| `DisplayName` | Name shown to players | `Wicked Katana` |
| `DisplayCategory` | Category in spawn/loot menus | `Weapon` |
| `Icon` | Icon image file name | `Katana` (uses `Katana.png`) |

### Type Properties
| Property | What It Does | Example |
|----------|--------------|---------|
| `Type` | Item type - tells game how to handle it | `Weapon`, `Food`, `Normal` |
| `SubCategory` | Weapon subtype for organization | `Swinging`, `Firearm`, `Blunt` |
| `Categories` | Skill category (what skill it levels) | `LongBlade`, `SmallBlunt` |
| `DamageCategory` | How it damages things | `Slash`, `Blunt`, `Pierce` |

### Damage Properties
| Property | What It Does | Example |
|----------|--------------|---------|
| `MinDamage` | Minimum damage per hit | `1.6` |
| `MaxDamage` | Maximum damage per hit | `2.4` |
| `CriticalChance` | % chance to land a critical hit | `30` (means 30%) |
| `CritDmgMultiplier` | Multiplier for critical hits | `10` (means 10x damage) |

### Combat Properties
| Property | What It Does | Example |
|----------|--------------|---------|
| `MaxHitCount` | Max zombies hit in one swing | `3` |
| `PushBackMod` | How much it pushes zombies back | `0.5` |
| `KnockdownMod` | Chance to knock zombies down | `0` (0 = never) |
| `MaxRange` | Maximum attack range | `1.4` |
| `MinRange` | Minimum attack range | `0.61` |

### Durability Properties
| Property | What It Does | Example |
|----------|--------------|---------|
| `ConditionMax` | Maximum durability | `10` |
| `ConditionLowerChanceOneIn` | 1-in-X chance to lose durability per hit | `15` (1-in-15) |

**You don't need to understand every property to mod.** Start by finding a similar vanilla item, copying it, and changing just the values you care about (usually damage, name, and maybe durability).

---

## Syntax: The Patterns That Matter

Since these are text files (not code), the game's engine **parses** them—it reads through line by line, expecting specific patterns. If you break the pattern, the game won't understand your file and the item won't load.

Here are the rules that matter:

### Rule 1: Commas After Each Property

Each property line should end with a comma, except the very last property (where a comma is optional but allowed).

**Correct:**
```
MinDamage = 1.6,
MaxDamage = 2.4,  // Comma here
Weight = 2,  // Last property can have comma or not
```

**Wrong (missing commas):**
```
MinDamage = 1.6
MaxDamage = 2.4  // Missing commas!
Weight = 2
```

**What you'll see:** Parsing error, item won't load.

---

### Rule 2: Curly Braces Must Match

Every opening `{` needs a closing `}`.

**Correct:**
```
item Katana
{
    MinDamage = 1.6,
}  // Closes the item
```

**Wrong:**
```
item Katana
{
    MinDamage = 1.6,
// Missing closing brace!
```

**What you'll see:** Parsing error. The game won't know where your item definition ends.

---

### Rule 3: Module Wraps Everything

The module declaration wraps all items:

**Correct:**
```
module WickedWeapons
{
    imports { Base }

    item WickedKatana { }
    item WickedSpear { }
}  // Closes the module
```

**Wrong:**
```
item WickedKatana { }  // Outside a module - won't work!
```

---

### Rule 4: No Special Characters in Names

Internal names (module names, item names) should only use:
- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscores (_)

**Good names:**
- `WickedKatana`
- `Super_Hammer_2000`
- `MyModWeapon`

**Bad names:**
- `Wicked Katana` (space - will cause errors)
- `Hammer!` (exclamation point - will fail)
- `Über-Sword` (special character - won't work)

---

### Rule 5: Case Matters

`MinDamage` is not the same as `mindamage` or `MINDAMAGE`. The game expects exact spelling and capitalization.

**Correct:**
```
MinDamage = 1.6,
MaxDamage = 2.4,
```

**Wrong:**
```
mindamage = 1.6,  // Won't work!
MAXDAMAGE = 2.4,  // Won't work!
```

---

## Common Mistakes

Let's look at the mistakes beginners make and how to fix them.

### Mistake 1: Missing Commas

❌ **Doesn't work:**
```
item WickedKatana
{
    DisplayName = Wicked Katana  // Missing comma!
    MinDamage = 1.6  // Missing comma!
    MaxDamage = 2.4
}
```

**What you'll see:** Parsing error. The game can't tell where one property ends and the next begins.

✅ **Works:**
```
item WickedKatana
{
    DisplayName = Wicked Katana,  // Comma added
    MinDamage = 1.6,  // Comma added
    MaxDamage = 2.4,  // Optional comma on last property
}
```

**Why:** Commas separate properties. Without them, the parser breaks.

---

### Mistake 2: Mismatched Braces

❌ **Doesn't work:**
```
module WickedWeapons
{
    item WickedKatana
    {
        MinDamage = 1.6,
    }
// Missing closing brace for the module!
```

**What you'll see:** Parsing error. The game expects a closing `}` for the module.

✅ **Works:**
```
module WickedWeapons
{
    item WickedKatana
    {
        MinDamage = 1.6,
    }
}  // Closes the module
```

**Why:** Every `{` needs a matching `}`. Think of them like parentheses in math—they must be balanced.

---

### Mistake 3: Misspelled Property Names

❌ **Doesn't work:**
```
item WickedKatana
{
    Mindamage = 1.6,  // Lowercase 'd' - wrong!
    MaxDammage = 2.4,  // Extra 'm' - wrong!
}
```

**What you'll see:** The item loads, but those properties are ignored (treated as unknown properties). Your weapon will have default damage values, not your custom ones.

✅ **Works:**
```
item WickedKatana
{
    MinDamage = 1.6,  // Correct capitalization
    MaxDamage = 2.4,  // Correct spelling
}
```

**Why:** Property names must match exactly. The game looks for `MinDamage`, not `Mindamage` or `mindamage`.

---

### Mistake 4: Spaces in Names

❌ **Doesn't work:**
```
module Wicked Weapons  // Space in module name!
{
    item Wicked Katana  // Space in item name!
    {
        MinDamage = 1.6,
    }
}
```

**What you'll see:** Parsing error. The game gets confused by the spaces.

✅ **Works:**
```
module WickedWeapons  // No spaces
{
    item WickedKatana  // No spaces (use capital letters to separate words)
    {
        MinDamage = 1.6,
    }
}
```

**Note:** `DisplayName` CAN have spaces because it's a string value:
```
DisplayName = Wicked Katana,  // This is fine!
```

**Why:** Internal names (module, item) are identifiers that the game's code references. They can't have spaces. Display names are just text shown to players, so spaces are allowed.

---

### Mistake 5: Forgetting to Import Base

❌ **Doesn't work (if you need vanilla items):**
```
module WickedWeapons
{
    // No imports!

    recipe Make Wicked Katana
    {
        Base.Plank,  // ERROR! Base is not imported
        Result:WickedKatana,
    }
}
```

**What you'll see:** Recipe won't work. The game doesn't know what `Base.Plank` is.

✅ **Works:**
```
module WickedWeapons
{
    imports {
        Base  // Import vanilla items
    }

    recipe Make Wicked Katana
    {
        Base.Plank,  // Now this works!
        Result:WickedWeapons.WickedKatana,
    }
}
```

**Why:** If you reference items from other modules (like `Base.Plank`), you need to import that module first.

---

## Try It Yourself

Let's test your Wicked Katana to make sure it works.

### Step 1: Create the mod.info File

In your `WickedWeapons` folder (the root, not inside `media`), create a file called `mod.info`.

Open it in your text editor and write:

```
name=Wicked Weapons
id=WickedWeapons
description=Adds powerful custom weapons to the game. Created by [Your Name].
```

**What each line means:**
- `name=` - Display name shown in the mod list
- `id=` - Internal ID (should match your module name)
- `description=` - Description shown in the mod menu

Save the file.

---

### Step 2: Verify Your Folder Structure

Your mod should look like this:

```
Zomboid/mods/WickedWeapons/
├── mod.info
└── media/
    └── scripts/
        └── wicked_weapons.txt
```

If your structure doesn't match, reorganize it now.

---

### Step 3: Enable the Mod

1. Launch Project Zomboid
2. On the main menu, click **Mods**
3. Find "Wicked Weapons" in the list on the left
4. Check the box to enable it
5. Click **Done**
6. Restart the game when prompted

---

### Step 4: Test with Debug Mode

1. Start a new sandbox game (or load an existing save)
2. Press the debug key (default: backslash `\` or tilde `~`) to open the debug menu
3. Click **Items** to open the Item Spawner
4. In the search box, type "Wicked"
5. You should see `WickedWeapons.WickedKatana` in the list
6. Click it to spawn the item
7. Pick it up and try it on a zombie

**Success!** If your Wicked Katana appears and does double damage (1.6-2.4 instead of 0.8-1.2), your mod works!

---

### Step 5: Verify It's Actually Stronger

To check the damage:
1. Right-click the Wicked Katana in your inventory
2. Mouse over it (don't click)
3. The tooltip shows stats—look for "Damage: 1.6 - 2.4"

Compare this to a vanilla Katana (damage: 0.8 - 1.2) to confirm yours is stronger.

---

## Key Takeaways

1. **Mods are just folders** containing a `mod.info` file and a `media` folder with content files

2. **Items are defined in text files** using simple `Property = Value,` patterns

3. **The workflow is: find vanilla → copy → modify → save** - that's 90% of item modding

4. **Modules are containers** that organize items and prevent naming conflicts

5. **Syntax matters:**
   - Commas after each property
   - Matching curly braces
   - Exact spelling and capitalization
   - No spaces in internal names

6. **You don't need to know every property** - copy vanilla items and change only what you need

7. **You don't need to be a programmer** - this is data entry with patterns, not coding

---

**What's next?** Now that you've created your first item, you can:
- Create more custom weapons with different stats
- Add custom icons (covered in [Item Icons](../../items/item-icons))
- Create recipes to craft your items
- Learn about the full mod folder structure in [Mod Folder Structure](../setup/mod-folder-structure)

You're a modder now. Welcome to the community!
