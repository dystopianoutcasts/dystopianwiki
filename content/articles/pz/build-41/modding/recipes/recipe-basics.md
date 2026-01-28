---
id: recipes-recipe-basics
slug: recipe-basics
title: "Recipe Creation Basics"
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: beginner
tags:
  - recipe
  - item
  - weapon
  - sound
  - crafting
  - creation
  - basics
excerpt: "Recipes in Project Zomboid define how players can craft items by combining inputs to produce outputs. This guide covers the fundamental structure and syntax for creating recipes."
table_of_contents:
  - text: "What Are Recipe Basics?"
    link: "#what-are-recipe-basics"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Where Recipes Go"
    link: "#where-recipes-go"
  - text: "The Recipe Pattern"
    link: "#the-recipe-pattern"
  - text: "Input Items (What You Need)"
    link: "#input-items-what-you-need"
  - text: "Output (What You Get)"
    link: "#output-what-you-get"
  - text: "Parameters (Recipe Properties)"
    link: "#parameters-recipe-properties"
  - text: "Common Recipe Patterns"
    link: "#common-recipe-patterns"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Your First Recipe File"
    path: /build-41/modding/recipes/first-recipe-file
  - title: "Recipe Anatomy"
    path: /build-41/modding/recipes/recipe-anatomy
  - title: "Recipe Ingredients Deep Dive"
    path: /build-41/modding/recipes/recipe-ingredients
last_updated: 2026-01-28
---

# Recipe Creation Basics

> You're going to learn the fundamental patterns for creating recipes in Project Zomboid. By the end, you'll understand the building blocks that every recipe uses.

---

## What Are Recipe Basics?

You know when you combine items in Project Zomboid's crafting menu - like using a hammer and nails to build something, or opening a box of ammo to get individual bullets? Those actions are powered by **recipes** - files that tell the game "when the player combines these items, produce this result."

**Recipe basics are the fundamental patterns you'll use in every recipe you create:**
- How to specify what items go in (inputs)
- How to specify what items come out (outputs)
- How to control whether tools get used up or stay in inventory
- How to make recipes flexible (accepting multiple types of tools)

Think of recipe basics like learning to cook - once you know the fundamentals (how to chop, how to sauté, how heat works), you can apply those techniques to any dish. Recipe patterns are the same: once you understand the core patterns, you can create any crafting recipe you can imagine.

**You would use recipe basics when:**
- Creating any new crafting recipe
- Understanding how vanilla recipes work
- Figuring out why your recipe isn't working as expected
- Making recipes more flexible for players

If you're feeling a bit overwhelmed by all the different recipe syntax you've seen - the colons, equals signs, `keep` keywords, square brackets - that's completely normal. When I first started making recipes, I constantly mixed up when to use `:` versus `=`, and half my recipes wouldn't load because of syntax errors. But here's what I learned: there are only a handful of patterns you need to know, and once you understand them, recipe creation becomes simple.

---

## Prerequisites

Before diving into recipe basics, you should understand:
- [Mod Folder Structure](/build-41/modding/setup/mod-folder-structure) - Where recipe files go
- [The mod.info File](/build-41/modding/setup/mod-info-file) - Basic mod setup

Optional but helpful:
- [Recipe Anatomy](/build-41/modding/recipes/recipe-anatomy) - Deep dive into recipe structure

---

## Where Recipes Go

Recipe files must be placed in your mod's `media/scripts/` folder and must use the `.txt` extension.

**Your folder structure:**

```
YourMod/
├── mod.info                       ← Mod metadata
└── media/
    └── scripts/
        └── recipes.txt            ← Recipe definitions go here
```

**Why this specific location?** Project Zomboid scans `media/scripts/` for all `.txt` files when loading mods. Put your recipes anywhere else and the game won't find them.

**File naming:** You can name the file anything you want (`recipes.txt`, `my_recipes.txt`, `crafting.txt`), but it MUST end in `.txt`.

---

## The Recipe Pattern

Every recipe in Project Zomboid follows the same pattern. Let me show you the absolute minimum recipe, then we'll break down each part.

```
module Base {                              /* Organize items into the Base module */
    imports {                               /* Reference items from Base module */
        Base
    }

    recipe Open Box of 9mm Bullets {        /* Recipe name shown to players */
        Bullets9mmBox,                      /* Input: 1 ammo box (consumed) */

        Result:Bullets9mm=6,                /* Output: 6 individual bullets */
        Time:15.0,                          /* Takes 15 time units */
    }
}                                           /* Close the module */
```

**What this recipe does:** Player right-clicks an ammo box, selects "Open Box of 9mm Bullets," and after 15 time units, the box disappears and they get 6 bullets.

Let's break down the pattern:

### Pattern Part 1: Module Wrapper

```
module Base {
    imports {
        Base
    }

    /* Your recipes go here */
}
```

**What it is:** A module is like a namespace - a way to organize items to avoid naming conflicts.

**Why we use `Base`:** The `Base` module is where all vanilla items live. When we put recipes in `Base`, we can reference vanilla items (like `Bullets9mmBox`) directly.

**Can you use a different module?** Yes, if you're creating custom items in your own module. But for recipes using vanilla items, stick with `Base`.

### Pattern Part 2: Recipe Declaration

```
recipe Open Box of 9mm Bullets {
```

**What it is:** The `recipe` keyword followed by the name players see in the crafting menu.

**Important:** "Open Box of 9mm Bullets" is the exact text that appears in-game. Not a code variable - the actual player-facing text.

### Pattern Part 3: Inputs (What Goes In)

```
        Bullets9mmBox,
```

**What it is:** The items required to craft this recipe. Listed at the top, before the properties.

**Default behavior:** Items are **consumed** (destroyed) unless marked with `keep`.

### Pattern Part 4: Outputs (What Comes Out)

```
        Result:Bullets9mm=6,
```

**What it is:** The item(s) the player receives when crafting completes.

**Notice the colon:** `Result:` is a **property**, so it uses a colon `:`. This is different from ingredient quantities which use equals `=`.

### Pattern Part 5: Parameters (Recipe Properties)

```
        Time:15.0,
```

**What they are:** Additional properties that control how the recipe behaves. `Time` is required - it controls how long crafting takes.

**All properties use colons:** `Time:`, `Category:`, `Sound:` - they all use `:` not `=`.

> **Key Takeaway**
> Every recipe follows this pattern: module wrapper → recipe declaration → inputs → Result → Time (and optional properties) → closing braces.
> Once you memorize this pattern, you can create any recipe.

---

## Input Items (What You Need)

Inputs are the items players must have in their inventory to craft the recipe. They're listed at the top of the recipe block, before any properties.

### Basic Input (Consumed)

```
recipe Example {
    TreeBranch,                        /* Requires 1 tree branch, consumed */

    Result:SharpedStick,
    Time:40.0,
}
```

**What happens:** The player needs 1 tree branch. When crafting completes, the tree branch disappears (is consumed/destroyed).

### Input with Quantity

```
recipe Example {
    Plank=3,                           /* Requires 3 planks, all consumed */

    Result:SmallCrate,
    Time:100.0,
}
```

**What happens:** Player needs 3 planks. All 3 disappear when crafting completes.

**The syntax:** `ItemID=number` where number is the quantity required.

### Reusable Input (Tools with `keep`)

```
recipe Example {
    Log,                               /* Consumed */
    keep Saw,                          /* NOT consumed - stays in inventory */

    Result:Plank=3,
    Time:150.0,
}
```

**What happens:** Player needs a log and a saw. The log is consumed, but the saw stays in the player's inventory after crafting.

**Why `keep`?** Tools like saws, hammers, and knives shouldn't be destroyed when you use them. The `keep` keyword tells the game "require this item but don't consume it."

**Most common use:** Always use `keep` for tools.

### Alternative Inputs (OR Logic)

```
recipe Example {
    TreeBranch,
    keep Knife/Screwdriver,            /* Either a knife OR screwdriver works */

    Result:SharpedStick,
    Time:40.0,
}
```

**What happens:** Player needs a knife or a screwdriver - either one will work. They don't need both.

**The slash `/` means "or"** - it provides alternatives. The first matching item in the player's inventory will be used.

**You can chain multiple alternatives:**

```
keep Hammer/Mallet/Stone,              /* Any of these three works */
```

### Item Type Matching (Any Item of a Type)

```
recipe Example {
    Log,
    keep [Recipe.GetItemTypes.Saw],    /* Any item tagged as "Saw" type */

    Result:Plank=3,
    Time:150.0,
}
```

**What happens:** Instead of requiring one specific saw (like `Saw` or `Hacksaw`), this accepts **any item that has the Saw tag** - hand saw, hacksaw, power saw, etc.

**Why it's useful:** Players might have different saws. This makes your recipe flexible.

**The pattern:** `[Recipe.GetItemTypes.X]` where X is the item type tag. Common types:
- `Hammer`
- `Saw`
- `Knife`
- `Screwdriver`

> **Key Takeaway**
> Inputs come first in the recipe, before properties. By default they're consumed, unless you use `keep`. Use `/` for alternatives and `[Recipe.GetItemTypes.X]` for flexible type matching.

---

## Output (What You Get)

The `Result` property specifies what the player receives when crafting completes.

### Single Result

```
Result:Torch,                          /* Player gets 1 torch */
```

**The syntax:** `Result:ItemID,` where ItemID is the item to create.

### Multiple Results

```
Result:Plank=3,                        /* Player gets 3 planks */
```

**The syntax:** `Result:ItemID=number,` where number is the quantity to create.

### Why the Colon?

**`Result` is a property, not a quantity.** Properties always use colons `:`.

**Compare:**
- Input quantity: `Plank=3,` uses `=`
- Output property: `Result:Plank=3,` uses `:` followed by `=` for the quantity

This is confusing at first, but the pattern is:
- **Property names** use `:` → `Result:`, `Time:`, `Category:`
- **Quantities within properties** use `=` → `Result:Plank=3,`

---

## Parameters (Recipe Properties)

Parameters are properties that control recipe behavior. They come after inputs and the Result.

### Required: Time

```
Time:15.0,                             /* Takes 15 time units */
```

**What it does:** Controls how long crafting takes.

**The number:** Time units roughly correspond to in-game time. Higher = longer.
- `15.0` - Quick (opening ammo box)
- `50.0` - Medium (simple crafting)
- `230.0` - Slow (sawing logs)

**You can use decimals:** `Time:125.5,` works fine.

### Optional: Category

```
Category:Survivalist,                  /* Shows in Survivalist crafting tab */
```

**What it does:** Determines which tab the recipe appears under in the crafting menu.

**Common categories:**
- `Cooking` - Food preparation
- `Carpentry` - Wood crafting
- `Metalworking` - Metal items
- `Tailoring` - Clothing/fabric
- `Survivalist` - General survival crafting
- `Weapons` - Weapon crafting

**Why it matters:** Without a category, your recipe shows in the generic "All" tab, making it harder to find.

### Optional: Sound

```
Sound:Sawing,                          /* Plays sawing sound during crafting */
```

**What it does:** Plays an audio effect while the player crafts.

**Common sounds:**
- `Hammering` - Hammering sound
- `Sawing` - Sawing sound
- `Cooking` - Cooking/sizzling sound
- `BoxOfRoundsOpenOne` - Opening container sound

**Why it matters:** Sound makes crafting feel more immersive. Players hear the action happening.

> **Key Takeaway**
> `Time` is required. `Category` and `Sound` are optional but highly recommended. All properties use colons `:`, not equals signs `=`.

---

## Common Recipe Patterns

Here are the most common recipe patterns you'll use. These cover 90% of recipes you'll create.

### Pattern 1: Simple Conversion (One Item → Another)

Convert one item into another.

```
module Base {
    imports {
        Base
    }

    recipe Open Ammo Box {             /* Convert ammo box into bullets */
        Bullets9mmBox,                 /* Input: 1 ammo box (consumed) */

        Result:Bullets9mm=30,          /* Output: 30 bullets */
        Time:15.0,                     /* Quick action */
    }
}
```

**Use case:** Opening containers, converting bulk items to individual items, disassembling things.

### Pattern 2: Tool-Based Crafting (Material + Tool → Product)

Combine a material with a reusable tool.

```
module Base {
    imports {
        Base
    }

    recipe Saw Logs {                  /* Convert log into planks */
        Log,                           /* Input: 1 log (consumed) */
        keep [Recipe.GetItemTypes.Saw], /* Tool: any saw (NOT consumed) */

        Result:Plank=3,                /* Output: 3 planks */
        Time:230.0,                    /* Takes a while */
        Category:Carpentry,            /* Shows in Carpentry tab */
        Sound:Sawing,                  /* Sawing sound effect */
    }
}
```

**Use case:** Most crafting with tools - sawing, hammering, cutting, etc.

### Pattern 3: Multiple Inputs (Several Items → One Product)

Combine multiple items into a single result.

```
module Base {
    imports {
        Base
    }

    recipe Craft Makeshift Torch {     /* Combine materials into torch */
        TreeBranch,                    /* Material 1: branch (consumed) */
        RippedSheets=2,                /* Material 2: cloth (consumed) */
        keep Lighter,                  /* Tool: lighter (NOT consumed) */

        Result:Torch,                  /* Output: 1 torch */
        Time:60.0,                     /* Medium time */
        Category:Survivalist,          /* Survivalist tab */
    }
}
```

**Use case:** Assembling items from multiple components, crafting complex items.

### Pattern 4: Alternative Tools (Accept Multiple Tool Types)

Let players use any of several tools.

```
module Base {
    imports {
        Base
    }

    recipe Sharpen Stick {             /* Sharpen stick with any sharp tool */
        TreeBranch,                    /* Material: branch (consumed) */
        keep Knife/Screwdriver/IcePick, /* Tool: any of these (NOT consumed) */

        Result:SharpedStick,           /* Output: sharpened stick */
        Time:40.0,                     /* Quick action */
        Category:Survivalist,          /* Survivalist tab */
    }
}
```

**Use case:** Recipes where multiple tool types make sense (any sharp tool, any hammer, etc.).

### Pattern 5: Disassembly (Break Down Item → Get Materials)

Break down an item to recover materials.

```
module Base {
    imports {
        Base
    }

    recipe Disassemble Chair {         /* Break chair for wood */
        WoodenChair,                   /* Input: chair (consumed) */
        keep Hammer,                   /* Tool: hammer (NOT consumed) */
        keep Saw,                      /* Tool: saw (NOT consumed) */

        Result:Plank=2,                /* Output: 2 planks recovered */
        Time:150.0,                    /* Takes a while */
        Category:Carpentry,            /* Carpentry tab */
    }
}
```

**Use case:** Salvaging materials, recycling items, scavenging.

> **Key Takeaway**
> These five patterns cover most recipes. Simple conversion, tool-based crafting, multiple inputs, alternative tools, and disassembly. Learn these and you can create almost any recipe.

---

## Common Mistakes

Let's look at the mistakes beginners make most often, and how to fix them.

### Mistake 1: Using Equals Instead of Colon for Properties

❌ **Doesn't work:**

```
recipe Example {
    TreeBranch,

    Result=SharpedStick,               /* Wrong! Should be colon */
    Time=40.0,                         /* Wrong! Should be colon */
}
```

**What you'll see:** Recipe won't load, parsing errors.

**Why it breaks:** Properties (`Result`, `Time`, `Category`, etc.) MUST use colons `:`, not equals signs `=`.

✅ **Works:**

```
recipe Example {
    TreeBranch,

    Result:SharpedStick,               /* Correct: colon for property */
    Time:40.0,                         /* Correct: colon for property */
}
```

**The rule:**
- Properties use `:` → `Result:`, `Time:`, `Category:`
- Quantities use `=` → `Plank=3`, `Result:Plank=3`

This is THE #1 source of recipe errors. Get this right and half your problems disappear.

### Mistake 2: Putting Properties Before Inputs

❌ **Doesn't work:**

```
recipe Example {
    Result:SharpedStick,               /* Wrong order! */
    Time:40.0,

    TreeBranch,                        /* Inputs should come first */
}
```

**What you'll see:** Recipe won't parse, errors in console.

**Why it breaks:** Inputs must come before properties. That's the recipe structure.

✅ **Works:**

```
recipe Example {
    TreeBranch,                        /* Inputs first */

    Result:SharpedStick,               /* Properties after */
    Time:40.0,
}
```

**The pattern:** Inputs → Result → Time → other properties.

### Mistake 3: Forgetting `keep` for Tools

❌ **Doesn't work (probably):**

```
recipe Saw Logs {
    Log,
    Saw,                               /* Oops - saw gets destroyed! */

    Result:Plank=3,
    Time:150.0,
}
```

**What you'll see:** Recipe works, but the saw disappears after one use. Players get angry because their expensive saw is gone.

**Why it breaks:** Without `keep`, items are consumed. The saw gets destroyed.

✅ **Works:**

```
recipe Saw Logs {
    Log,
    keep Saw,                          /* Tool stays in inventory */

    Result:Plank=3,
    Time:150.0,
}
```

**The rule:** Always use `keep` for tools (hammers, saws, knives, etc.).

### Mistake 4: Missing Commas

❌ **Doesn't work:**

```
recipe Example {
    TreeBranch,
    keep Knife                         /* Missing comma! */

    Result:SharpedStick,
    Time:40.0,
}
```

**What you'll see:** Parsing error, recipe won't load.

**Why it breaks:** Every line inside the recipe needs a comma at the end.

✅ **Works:**

```
recipe Example {
    TreeBranch,
    keep Knife,                        /* Added comma */

    Result:SharpedStick,
    Time:40.0,
}
```

**Pro tip:** Add commas everywhere. Get in the habit.

### Mistake 5: Wrong Module or Missing Imports

❌ **Doesn't work:**

```
module Base {
    /* Missing imports block! */

    recipe Example {
        TreeBranch,                    /* Game doesn't know where TreeBranch is */

        Result:SharpedStick,
        Time:40.0,
    }
}
```

**What you'll see:** Recipe might not load, or might not recognize item names.

**Why it breaks:** The imports block tells the game where to look for items.

✅ **Works:**

```
module Base {
    imports {                          /* Added imports */
        Base
    }

    recipe Example {
        TreeBranch,

        Result:SharpedStick,
        Time:40.0,
    }
}
```

**The rule:** Always include the imports block at the top of your module.

---

## Try It Yourself

Let's practice creating recipes. Try these exercises before looking at the answers.

### Exercise 1: Create a Simple Conversion Recipe

**Challenge:** Create a recipe that disassembles a box of nails into individual nails.

**Requirements:**
- Input: `NailsBox` (consumed)
- Output: `Nails` with quantity 10
- Time: 20 time units
- Category: Survivalist

Try writing the recipe yourself before looking at the answer below.

---

**Answer:**

```
module Base {
    imports {
        Base
    }

    recipe Open Nail Box {
        NailsBox,

        Result:Nails=10,
        Time:20.0,
        Category:Survivalist,
    }
}
```

### Exercise 2: Create a Tool-Based Recipe

**Challenge:** Create a recipe that uses a hammer to convert a large metal sheet into small metal sheets.

**Requirements:**
- Input: `MetalSheetLarge` (consumed)
- Tool: Any hammer (NOT consumed)
- Output: `MetalSheetSmall` with quantity 4
- Time: 100 time units
- Category: Metalworking
- Sound: Hammering

Try it yourself first!

---

**Answer:**

```
module Base {
    imports {
        Base
    }

    recipe Cut Metal Sheet {
        MetalSheetLarge,
        keep [Recipe.GetItemTypes.Hammer],

        Result:MetalSheetSmall=4,
        Time:100.0,
        Category:Metalworking,
        Sound:Hammering,
    }
}
```

### Exercise 3: Spot the Errors

This recipe has 3 errors. Can you find them?

```
module Base {
    recipe Make Rope {
        RippedSheets=4

        Result=Rope,
        Time:80.0
        Category:Survivalist,
    }
}
```

---

**Answers:**

1. **Missing imports block**
   - Need `imports { Base }` at the top

2. **Missing comma after ingredient**
   - Should be: `RippedSheets=4,`

3. **Using equals instead of colon for Result**
   - Should be: `Result:Rope,`

**Corrected version:**

```
module Base {
    imports {                          /* Fixed: Added imports */
        Base
    }

    recipe Make Rope {
        RippedSheets=4,                /* Fixed: Added comma */

        Result:Rope,                   /* Fixed: Changed = to : */
        Time:80.0,
        Category:Survivalist,
    }
}
```

---

## Key Takeaways

Let's recap the essential recipe basics:

1. **Recipe files go in `media/scripts/` with `.txt` extension**
   - Not anywhere else, not with any other extension

2. **Every recipe follows the same pattern**
   - Module wrapper with imports
   - Recipe declaration
   - Inputs (consumed by default)
   - Result property
   - Time property (required)
   - Optional properties
   - Closing braces

3. **Properties use colons, quantities use equals**
   - Property: `Result:`, `Time:`, `Category:`
   - Quantity: `Plank=3`, `Result:Plank=3,`
   - Never mix them up!

4. **Inputs come before properties**
   - List all ingredients first
   - Then list Result, Time, and other properties
   - Wrong order = broken recipe

5. **Use `keep` for tools that shouldn't be consumed**
   - `keep Hammer,` - hammer stays in inventory
   - Without `keep`, items are destroyed
   - Always use `keep` for reusable tools

6. **Use `/` for alternative items**
   - `Knife/Screwdriver,` - either one works
   - `[Recipe.GetItemTypes.X]` - any item of type X works
   - Makes recipes more flexible

7. **Required: Time. Recommended: Category and Sound**
   - `Time` is mandatory
   - `Category` helps players find your recipe
   - `Sound` makes crafting feel immersive

8. **Common patterns cover most recipes**
   - Simple conversion
   - Tool-based crafting
   - Multiple inputs
   - Alternative tools
   - Disassembly
   - Learn these patterns and you're set

You now understand the fundamental building blocks of Project Zomboid recipes. These patterns - inputs, outputs, properties, tools - are the foundation you'll use in every recipe you create.

---

## What's Next?

Ready to create your first recipe? Here's where to go:

- [Your First Recipe File](/build-41/modding/recipes/first-recipe-file) - Step-by-step walkthrough of creating a working recipe mod from scratch
- [Recipe Anatomy](/build-41/modding/recipes/recipe-anatomy) - Deep dive into recipe structure and syntax
- [Recipe Ingredients Deep Dive](/build-41/modding/recipes/recipe-ingredients) - Advanced ingredient techniques and options
