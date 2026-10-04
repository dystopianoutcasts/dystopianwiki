---
id: recipes-vanilla-recipe-anatomy
slug: vanilla-recipe-anatomy
title: "Complete Recipe Parameter Reference"
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
  - reference
excerpt: "Complete reference of all parameters available in Project Zomboid recipes, with examples from vanilla and popular mods."
table_of_contents:
  - text: "What Is This Reference?"
    link: "#what-is-this-reference"
  - text: "How to Use This Reference"
    link: "#how-to-use-this-reference"
  - text: "Complete Recipe Template"
    link: "#complete-recipe-template"
  - text: "Input Parameters"
    link: "#input-parameters"
  - text: "Output Parameters"
    link: "#output-parameters"
  - text: "Core Parameters"
    link: "#core-parameters"
  - text: "Optional Requirements"
    link: "#optional-requirements"
  - text: "Callbacks & Scripting"
    link: "#callbacks-scripting"
  - text: "Animation Parameters"
    link: "#animation-parameters"
  - text: "Item Behavior Parameters"
    link: "#item-behavior-parameters"
  - text: "Real-World Examples"
    link: "#real-world-examples"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Recipe Creation Basics"
    path: /build-41/modding/recipes/recipe-basics
  - title: "Recipe Ingredients Deep Dive"
    path: /build-41/modding/recipes/recipe-ingredients
last_updated: 2026-01-28
---

# Complete Recipe Parameter Reference

> You're going to learn every parameter available for Project Zomboid recipes. By the end, you'll have a complete reference for creating recipes of any complexity, from simple crafts to advanced weapon assembly.

---

## What Is This Reference?

You know when you look at a vanilla recipe file and see properties like `AnimNode:`, `OnGiveXP:`, or `CanBeDoneFromFloor:` and wonder "what does that do?" or "what other options are available?" This reference answers those questions.

**This document covers:**
- Every parameter you can use in recipes
- What each parameter does
- Syntax and examples for each
- Real vanilla and mod recipes as examples
- Common mistakes to avoid

Think of this as your recipe parameter dictionary. When you're creating a recipe and need to know "can I require the player to be near a table?" or "how do I add custom animations?", you look it up here.

**You would use this reference when:**
- Creating advanced recipes with special requirements
- Adding animations and sounds to recipes
- Setting up Lua callbacks for custom behavior
- Understanding vanilla recipes you're studying
- Troubleshooting why a parameter isn't working

If you've been creating basic recipes and now want to add polish - animations, sounds, skill requirements, custom XP rewards - this reference shows you every tool available.

---

## How to Use This Reference

**If you're new to recipes:**
Start with [Recipe Creation Basics](/build-41/modding/recipes/recipe-basics) first, then come back here when you need specific parameters.

**If you're looking for a specific parameter:**
Use the table of contents (click the hamburger menu) to jump directly to that parameter.

**If you're creating a complex recipe:**
Look at the "Real-World Examples" section to see how parameters combine in actual recipes.

**If you're debugging:**
Check the "Common Mistakes" section for issues you might be hitting.

---

## Complete Recipe Template

Here's every parameter available, organized by section. You don't need all of these - most recipes use only a handful.

```
module Base {                                /* Module declaration */
    imports {                                 /* Import other modules */
        Base
    }

    recipe Recipe Name {                      /* Recipe declaration */
        // ===== INPUT SECTION (ingredients and tools) =====
        Item1,                                /* Basic input (consumed) */
        Item2=5,                              /* Input with quantity */
        keep Tool,                            /* Tool (NOT consumed) */
        Item3/Item4,                          /* Alternative items (OR) */
        keep [Recipe.GetItemTypes.Hammer],    /* Item type matching */

        // ===== OUTPUT SECTION (what you get) =====
        Result:OutputItem,                    /* Single result */
        // OR
        Result:OutputItem=10,                 /* Multiple results */

        // ===== CORE PARAMETERS (almost always used) =====
        Time:100.0,                           /* Crafting time */
        Category:Carpentry,                   /* UI category */
        Sound:Hammering,                      /* Sound effect */

        // ===== OPTIONAL REQUIREMENTS =====
        NearItem:Table,                       /* Must be near object */
        SkillRequired:Carpentry=3,            /* Minimum skill level */
        NeedToBeLearn:true,                   /* Requires recipe book */

        // ===== CALLBACKS & SCRIPTING =====
        OnGiveXP:FunctionName,                /* Custom XP function */
        OnCreate:FunctionName,                /* Run when item created */
        OnTest:FunctionName,                  /* Check if recipe should show */
        OnCanPerform:FunctionName,            /* Check if can craft now */

        // ===== ANIMATION =====
        AnimNode:BuildHigh,                   /* Character animation */
        Prop1:Hammer,                         /* Item in hand 1 */
        Prop2:Source=1,                       /* Item in hand 2 */

        // ===== ITEM BEHAVIOR =====
        CanBeDoneFromFloor:true,              /* Allow items on ground */
        AllowFrozenItem:true,                 /* Allow frozen ingredients */
        AllowRottenItem:true,                 /* Allow rotten ingredients */
    }
}
```

> **Key Takeaway**
> Most recipes only use: inputs, Result, Time, Category. Everything else is optional polish.

---

## Input Parameters

Inputs are the items required to craft the recipe. They come first, before all other properties.

### Basic Input

```
Item,                                        /* Single item (consumed) */
Item=5,                                      /* 5 units (all consumed) */
keep Tool,                                   /* Tool (NOT consumed) */
```

**What "consumed" means:** The item disappears from inventory when crafting completes.

**What "keep" means:** The item is required but stays in inventory (though it may lose durability).

### Alternative Items (OR Logic)

```
Knife/Screwdriver/IcePick,                  /* Any of these works */
Plank/Log,                                  /* Either plank OR log */
MetalPipe=2/LeadPipe=2,                     /* 2 of either pipe type */
```

**The `/` symbol means "or"** - player needs one of the options, not all of them.

### Item Type Matching

```
keep [Recipe.GetItemTypes.Hammer],          /* Any hammer */
keep [Recipe.GetItemTypes.Saw],             /* Any saw */
keep [Recipe.GetItemTypes.Knife],           /* Any knife */
```

**What this does:** Matches any item tagged with that type, including items from mods.

**Common item types:**

| Type | Matches |
|------|---------|
| `Hammer` | All hammers |
| `Saw` | All saws |
| `Screwdriver` | All screwdrivers |
| `Pliers` | All pliers |
| `WeldingMask` | Welding masks |
| `Knife` | All knives |
| `BluntWeapon` | Blunt weapons |
| `BladeWeapon` | Blade weapons |

---

## Output Parameters

### Result

**What it does:** Specifies what item the player receives when crafting completes.

**Syntax:**
```
Result:Item,                                /* Single item */
Result:Item=10,                             /* 10 items */
```

**Examples:**
```
Result:Plank=3,                             /* Player gets 3 planks */
Result:Torch,                               /* Player gets 1 torch */
Result:Bullets9mm=30,                       /* Player gets 30 bullets */
```

**Important:** You can only have one `Result:` line per recipe. If you need to produce multiple different items, create separate recipes.

---

## Core Parameters

These parameters are used in almost every recipe.

### Time

**What it does:** Controls how long crafting takes.

**Unit:** Game ticks (roughly 1 tick ≈ 1 second at normal game speed)

**Syntax:**
```
Time:100.0,                                 /* 100 ticks */
Time:230.0,                                 /* 230 ticks */
```

**Typical ranges:**

| Craft Type | Time Range |
|------------|------------|
| Quick actions (opening box) | 10-50 ticks |
| Simple crafts (sharpen stick) | 50-100 ticks |
| Medium crafts (make rope) | 100-200 ticks |
| Complex crafts (saw logs) | 200-300 ticks |
| Advanced crafts (weapon assembly) | 500-2000 ticks |

### Category

**What it does:** Determines which tab the recipe appears under in the crafting menu.

**Syntax:**
```
Category:CategoryName,
```

**Available categories:**

| Category | For |
|----------|-----|
| `Carpentry` | Woodworking |
| `Cooking` | Food preparation |
| `Electrical` | Electronic items |
| `Farming` | Agriculture |
| `FirstAid` | Medical items |
| `Fishing` | Fishing equipment |
| `Metalwork` | Metal crafting |
| `Tailoring` | Clothing/fabric |
| `Weapons` | Weapon crafting |
| `Survivalist` | General survival |
| `Chemistry` | Chemical/scientific |

**Without a category:** Recipe appears in generic "All" tab, making it harder to find.

### Sound

**What it does:** Plays audio during crafting for immersion.

**Syntax:**
```
Sound:SoundName,
```

**Common sounds:**

| Sound | When to Use |
|-------|-------------|
| `Hammering` | Building, nailing |
| `Sawing` | Cutting wood/metal |
| `Cooking` | Food preparation |
| `Sewing` | Tailoring, fabric work |
| `Metalwork` | General metalworking |
| `Forge` | Forging, smelting |
| `Anvil` | Hammering metal |
| `BoxOfRoundsOpenOne` | Opening containers |
| `ShotgunCrafting` | Weapon assembly |

---

## Optional Requirements

These parameters add constraints to when/where recipes can be used.

### NearItem

**What it does:** Requires player to be standing near a specific object or furniture.

**Syntax:**
```
NearItem:ObjectName,
NearItem:Table1/Table2,                     /* Either table works */
```

**Examples:**
```
NearItem:campfire,                          /* Must be near a campfire */
NearItem:ArmoryTable,                       /* Enhanced Crafting table (modded) */
NearItem:DogHouse,                          /* Vanilla object */
```

**Use cases:**
- Cooking recipes requiring stoves/campfires
- Advanced crafts requiring workbenches
- Specialized recipes requiring unique objects

### SkillRequired

**What it does:** Sets minimum skill level needed to see and craft the recipe.

**Syntax:**
```
SkillRequired:SkillName=level,
```

**Available skills:**

| Skill | Level Range |
|-------|-------------|
| `Carpentry` | 0-10 |
| `Cooking` | 0-10 |
| `Farming` | 0-10 |
| `FirstAid` | 0-10 |
| `Electrical` | 0-10 |
| `MetalWelding` | 0-10 |
| `Mechanics` | 0-10 |
| `Tailoring` | 0-10 |

**Examples:**
```
SkillRequired:Carpentry=3,                  /* Needs Carpentry 3+ */
SkillRequired:MetalWelding=5,               /* Needs Metalworking 5+ */
```

**Multiple skills:**
```
SkillRequired:Carpentry=2,
SkillRequired:Electrical=1,                 /* Needs BOTH skills */
```

### NeedToBeLearn

**What it does:** Hides recipe until player reads a recipe magazine/book.

**Syntax:**
```
NeedToBeLearn:true,                         /* Must learn first */
NeedToBeLearn:false,                        /* Available by default */
```

**Use case:** Advanced or secret recipes that players must discover.

---

## Callbacks & Scripting

These parameters call Lua functions for custom behavior. Advanced feature.

### OnGiveXP

**What it does:** Calls a Lua function to award XP when crafting completes.

**Syntax:**
```
OnGiveXP:FunctionName,
```

**Vanilla examples:**
```
OnGiveXP:Recipe.OnGiveXP.SawLogs,          /* Carpentry XP for sawing */
OnGiveXP:Give25MWXP,                       /* 25 Metalworking XP */
```

**How it works:** The function receives the recipe, ingredients, and result, then awards appropriate skill XP.

### OnCreate

**What it does:** Calls a Lua function when the result item is created.

**Syntax:**
```
OnCreate:FunctionName,
```

**Use cases:**
- Set random item condition
- Add flavor text to item
- Trigger events
- Customize item properties

**Example:**
```
OnCreate:Recipe.OnCreate.SpikedBat,        /* Customize bat properties */
```

### OnTest

**What it does:** Calls a Lua function to determine if recipe should be visible.

**Syntax:**
```
OnTest:FunctionName,
```

**Use cases:**
- Complex availability logic
- Mod compatibility checks
- Time/weather-based crafting
- Custom unlock conditions

**The function returns true/false** - true shows the recipe, false hides it.

### OnCanPerform

**What it does:** Calls a Lua function to check if player can craft right now.

**Syntax:**
```
OnCanPerform:FunctionName,
```

**Difference from OnTest:**
- `OnTest` - "Should this recipe exist in the menu?"
- `OnCanPerform` - "Can the player craft this right now?"

---

## Animation Parameters

These parameters control character animations during crafting.

### AnimNode

**What it does:** Specifies which animation the character plays while crafting.

**Syntax:**
```
AnimNode:AnimationName,
```

**Common animations:**

| Animation | What It Looks Like |
|-----------|-------------------|
| `BuildHigh` | Hammering upward (building tall) |
| `BuildLow` | Working downward (ground level) |
| `BuildMid` | Working at mid-level (table height) |
| `Disassemble` | Taking apart |
| `SawLog` | Sawing motion |
| `BlowTorchMid` | Welding at mid-level |
| `Drink` | Drinking/pouring |

**Example:**
```
AnimNode:BuildHigh,
```

### Prop1 / Prop2

**What they do:** Specify items to show in the character's hands during animation.

**Syntax:**
```
Prop1:ItemName,                             /* Show specific item */
Prop1:Source=1,                             /* Show first input item */
Prop2:Source=2,                             /* Show second input item */
```

**Examples:**
```
Prop1:Hammer,                               /* Show hammer in hand */
Prop2:Source=1,                             /* Show first ingredient */
```

```
Prop1:BlowTorch,                            /* Show blowtorch */
Prop2:Log,                                  /* Show log */
```

**Why use Source=N?**
- `Source=1` shows the first ingredient from your recipe
- `Source=2` shows the second ingredient
- Useful when you don't know the exact item (like with alternatives)

---

## Item Behavior Parameters

These parameters modify how recipes interact with items.

### CanBeDoneFromFloor

**What it does:** Allows crafting with items on the ground (not in inventory).

**Syntax:**
```
CanBeDoneFromFloor:true,
```

**Use case:** Heavy items like logs, furniture, large containers.

**Example:**
```
recipe Saw Logs {
    Log,
    keep [Recipe.GetItemTypes.Saw],

    CanBeDoneFromFloor:true,                /* Can saw logs on ground */
    Result:Plank=3,
    Time:230.0,
}
```

**Why this matters:** Players don't have to carry heavy logs in inventory to saw them.

### AllowFrozenItem

**What it does:** Allows using frozen food/items as ingredients.

**Syntax:**
```
AllowFrozenItem:true,
```

**Use case:** Cooking recipes that work with frozen food.

### AllowRottenItem

**What it does:** Allows using rotten/spoiled items as ingredients.

**Syntax:**
```
AllowRottenItem:true,
```

**Use cases:**
- Composting recipes
- Bait-making
- Recipes where freshness doesn't matter

---

## Real-World Examples

Let's see how these parameters combine in actual recipes.

### Example 1: Vanilla "Saw Logs"

```
module Base {
    imports {
        Base
    }

    recipe Saw Logs {
        Log,                                /* 1 log (consumed) */
        keep [Recipe.GetItemTypes.Saw],     /* Any saw (NOT consumed) */

        CanBeDoneFromFloor:true,            /* Can use logs on ground */
        Result:Plank=3,                     /* Produces 3 planks */
        Sound:Sawing,                       /* Sawing sound */
        Time:230.0,                         /* Takes 230 ticks */
        Category:Carpentry,                 /* Carpentry tab */
        OnGiveXP:Recipe.OnGiveXP.SawLogs,   /* Awards Carpentry XP */
        AnimNode:SawLog,                    /* Sawing animation */
        Prop1:Source=2,                     /* Show saw in hand */
        Prop2:Log,                          /* Show log */
    }
}
```

**Why this recipe works:**
- Uses item type matching for saws (mod-compatible)
- Floor crafting for heavy logs (user-friendly)
- Sound and animation for immersion
- Custom XP callback for progression
- Props show what player is doing

### Example 2: Mod Recipe "Assemble Shotgun"

```
module Base {
    imports {
        Base
    }

    recipe Assemble Double Barrel Shotgun {
        AirTank,                            /* Consumed materials */
        SheetMetal,
        MetalPipe/LeadPipe,                 /* Either pipe works */
        LeadPipe/MetalPipe,                 /* Need 2 total pipes */
        Plank,
        LeatherStrips=5,
        BlowTorch=1,
        Wire=2,
        keep [Recipe.GetItemTypes.Pliers],  /* Tools (NOT consumed) */
        keep [Recipe.GetItemTypes.WeldingMask],
        keep [Recipe.GetItemTypes.Hammer],
        keep [Recipe.GetItemTypes.Saw],

        Result:HDBS,                        /* Custom shotgun item */
        Sound:ShotgunCrafting,              /* Custom sound */
        Time:1900,                          /* Long craft (31+ minutes) */
        Category:Weapons,                   /* Weapons tab */
        SkillRequired:MetalWelding=3,       /* Needs Metalworking 3 */
        OnGiveXP:Give25MWXP,                /* 25 Metalworking XP */
        AnimNode:BlowTorchMid,              /* Welding animation */
        Prop1:BlowTorch,                    /* Show blowtorch */
        NeedToBeLearn:true,                 /* Must find recipe book */
    }
}
```

**Why this recipe works:**
- Complex materials with alternatives (flexible)
- Multiple tools required (realistic)
- Long craft time (balances powerful result)
- Skill gate (progression)
- Must learn (discovery aspect)
- Welding animation and sound (immersion)

---

## Common Mistakes

### Mistake 1: Using Equals Instead of Colon for Parameters

**Wrong:**
```
Result=Plank,                               /* Wrong symbol */
Time=100,                                   /* Wrong symbol */
Category=Carpentry,                         /* Wrong symbol */
```

**Correct:**
```
Result:Plank,                               /* Colon for parameters */
Time:100,                                   /* Colon for parameters */
Category:Carpentry,                         /* Colon for parameters */
```

**The rule:** Parameters use colons `:`, quantities use equals `=`.

### Mistake 2: Quantity on Kept Tools

**Wrong:**
```
keep Hammer=2,                              /* Can't specify quantity with keep */
```

**Correct:**
```
keep Hammer,                                /* Just the tool */
```

**If you need multiple tools:** List them separately:
```
keep Hammer,
keep Saw,
```

### Mistake 3: Multiple Result Lines

**Wrong:**
```
Result:Plank,
Result:Nails,                               /* Can't have two Result lines */
```

**Correct:**
```
Result:Plank=3,                             /* One result with quantity */
```

**If you truly need multiple different items:** Create separate recipes.

### Mistake 4: Wrong Animation/Sound Names

**Wrong:**
```
AnimNode:Hammering,                         /* Not a valid AnimNode */
Sound:SawingWood,                           /* Not a valid Sound */
```

**Correct:**
```
AnimNode:BuildHigh,                         /* Valid AnimNode */
Sound:Sawing,                               /* Valid Sound */
```

**How to find valid names:** Look at vanilla recipe files for reference.

---

## Try It Yourself

### Exercise: Create an Advanced Weapon Mod Recipe

**Challenge:** Create a recipe for modifying a baseball bat with nails.

**Requirements:**
- Input: Baseball bat, Nails (quantity 10), kept hammer
- Output: Spiked bat
- Time: 150 ticks
- Category: Weapons
- Sound: Hammering
- Animation: BuildLow (working on table)
- Show hammer in Prop1

Try writing the recipe before looking at the solution.

---

**Solution:**

```
module Base {
    imports {
        Base
    }

    recipe Spike Baseball Bat {
        BaseballBat,                        /* Bat (consumed) */
        Nails=10,                           /* 10 nails (consumed) */
        keep [Recipe.GetItemTypes.Hammer],  /* Hammer (NOT consumed) */

        Result:SpikedBat,                   /* Produces spiked bat */
        Time:150.0,                         /* Medium craft time */
        Category:Weapons,                   /* Weapons tab */
        Sound:Hammering,                    /* Hammering sound */
        AnimNode:BuildLow,                  /* Working at table level */
        Prop1:Hammer,                       /* Show hammer in hand */
    }
}
```

---

## Key Takeaways

1. **Core parameters are essential**
   - Always include: Result, Time
   - Almost always include: Category, Sound
   - Everything else is optional

2. **Inputs come first, before all parameters**
   - List ingredients and tools
   - Then list Result, Time, etc.
   - Order matters for inputs

3. **Parameters use colons, quantities use equals**
   - Parameter: `Time:100,` `Result:Item,`
   - Quantity: `Nails=5,` `Result:Plank=3,`

4. **Item type functions are powerful**
   - `[Recipe.GetItemTypes.Hammer]` matches any hammer
   - Makes recipes mod-compatible
   - Use for tools almost always

5. **Callbacks require Lua knowledge**
   - OnGiveXP, OnCreate, OnTest, OnCanPerform
   - Advanced feature - study vanilla examples first
   - Not needed for basic recipes

6. **Animations add polish**
   - AnimNode for character animation
   - Prop1/Prop2 for items in hands
   - Sound for audio feedback
   - Makes crafting feel real

7. **Balance matters**
   - Long Time for valuable items
   - SkillRequired for progression
   - NeedToBeLearn for discovery
   - Match complexity to reward

8. **Reference vanilla recipes**
   - Located in `ProjectZomboid/media/scripts/`
   - See how parameters combine
   - Copy patterns that work

You now have a complete reference for every recipe parameter. Use this document as your go-to resource when creating recipes - whether simple or complex.

---

## What's Next?

Ready to apply this knowledge?

- [Recipe Creation Basics](/build-41/modding/recipes/recipe-basics) - Master the fundamentals
- [Recipe Ingredients Deep Dive](/build-41/modding/recipes/recipe-ingredients) - Advanced ingredient techniques
- [Testing Your Recipe](/build-41/modding/recipes/testing-recipes) - Debug and verify recipes
