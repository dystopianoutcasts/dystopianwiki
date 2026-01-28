---
id: recipes-first-recipe-file
slug: first-recipe-file
title: "Your First Recipe File"
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: beginner
tags:
  - beginner
  - recipe
  - tutorial
  - hands-on
  - learning-path
  - getting-started
excerpt: "Step-by-step tutorial to create your first working recipe mod for Project Zomboid, from folder setup to in-game testing."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "What We're Making"
    link: "#what-were-making"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Step 1: Create the Scripts Folder"
    link: "#step-1-create-the-scripts-folder"
  - text: "Step 2: Create the Recipe File"
    link: "#step-2-create-the-recipe-file"
  - text: "Step 3: Write the Recipe"
    link: "#step-3-write-the-recipe"
  - text: "Step 4: Understanding Each Line"
    link: "#step-4-understanding-each-line"
  - text: "Step 5: Update mod.info"
    link: "#step-5-update-mod-info"
  - text: "Step 6: Test the Recipe"
    link: "#step-6-test-the-recipe"
  - text: "Troubleshooting"
    link: "#troubleshooting"
  - text: "Adding More Recipes"
    link: "#adding-more-recipes"
  - text: "Variations to Try"
    link: "#variations-to-try"
  - text: "Complete Working Example"
    link: "#complete-working-example"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Testing Your Recipe"
    path: /build-41/modding/recipes/testing-recipes
  - title: "Recipe Ingredients Deep Dive"
    path: /build-41/modding/recipes/recipe-ingredients
last_updated: 2026-01-09
---

# Your First Recipe File

## Overview

Time to write a real recipe. By the end of this guide, you'll have a working mod that adds a custom crafting recipe to Project Zomboid.

## What We're Making

A recipe to craft a **makeshift torch** from:
- A tree branch
- Ripped sheets
- A lighter (not consumed)

## Prerequisites

Before starting, ensure you have:
- A mod folder set up (see [Mod Folder Structure](/build-41/modding/setup/mod-folder-structure))
- A `mod.info` file (see [The mod.info File](/build-41/modding/setup/mod-info-file))
- VS Code or another text editor

## Step 1: Create the Scripts Folder

Your mod folder should look like this:

```
MyFirstMod/
├── mod.info
└── media/
    └── scripts/          <- Create this folder
```

Create the `scripts` folder inside `media`.

## Step 2: Create the Recipe File

1. Inside `media/scripts/`, create a new file: `my_recipes.txt`
2. Open it in VS Code

Your structure now:

```
MyFirstMod/
├── mod.info
└── media/
    └── scripts/
        └── my_recipes.txt    <- Your new file
```

## Step 3: Write the Recipe

Paste this into `my_recipes.txt`:

```
module Base {
    imports {
        Base
    }

    recipe Make Makeshift Torch {
        TreeBranch,
        RippedSheets=2,
        keep Lighter,

        Result:Torch,
        Time:60.0,
        Category:Survivalist,
    }
}
```

Save the file (`Ctrl+S`).

## Step 4: Understanding Each Line

```
module Base {
```
We're adding to the Base module where vanilla items live.

```
    imports {
        Base
    }
```
This lets us reference Base module items without prefixing.

```
    recipe Make Makeshift Torch {
```
The recipe name shown in the crafting menu.

```
        TreeBranch,
```
Requires one tree branch (consumed).

```
        RippedSheets=2,
```
Requires 2 ripped sheets (consumed).

```
        keep Lighter,
```
Requires a lighter but **doesn't consume it**.

```
        Result:Torch,
```
Produces a vanilla torch item.

```
        Time:60.0,
```
Takes 60 time units to craft.

```
        Category:Survivalist,
```
Appears in the Survivalist crafting category.

## Step 5: Update mod.info

Make sure your `mod.info` has at least:

```
name=My First Mod
id=MyFirstMod
description=Adds a makeshift torch recipe.
```

## Step 6: Test the Recipe

1. Launch Project Zomboid
2. Go to **Mods** from the main menu
3. Find "My First Mod" and enable it
4. Start a new game (or continue if you have debug mode)
5. Collect the ingredients: tree branch, ripped sheets, lighter
6. Open the crafting menu (`B` by default)
7. Look under "Survivalist" category
8. Find "Make Makeshift Torch"
9. Craft it!

## Troubleshooting

### Recipe Doesn't Appear

**Check:** Is your mod enabled?
- Go to Mods menu and verify it's checked

**Check:** Is the file in the right place?
- Must be in `media/scripts/` not just `media/`

**Check:** Is the file extension correct?
- Must be `.txt` not `.txt.txt`

### Error When Loading

**Check console.txt** for errors:
```
%UserProfile%\Zomboid\console.txt
```

**Common error:** Missing comma
```
❌ Time:60.0
✓ Time:60.0,
```

**Common error:** Using equals instead of colon
```
❌ Result=Torch,
✓ Result:Torch,
```

### Can't Find Ingredients

Use debug mode to spawn items:

1. Enable debug mode (`-debug` launch option)
2. Press `~` to open console
3. Type:
```lua
getPlayer():getInventory():AddItem("Base.TreeBranch")
getPlayer():getInventory():AddItem("Base.RippedSheets", 2)
getPlayer():getInventory():AddItem("Base.Lighter")
```

## Adding More Recipes

Add multiple recipes to the same file:

```
module Base {
    imports {
        Base
    }

    recipe Make Makeshift Torch {
        TreeBranch,
        RippedSheets=2,
        keep Lighter,

        Result:Torch,
        Time:60.0,
        Category:Survivalist,
    }

    recipe Sharpen Stick {
        TreeBranch,
        keep KitchenKnife/HuntingKnife,

        Result:SharpedStick,
        Time:40.0,
        Category:Survivalist,
    }

    recipe Bundle Newspapers {
        Newspaper=5,

        Result:NewspaperBundle,
        Time:20.0,
        Category:Survivalist,
    }
}
```

## Variations to Try

### Change Ingredients

Try different items:
```
recipe Light Campfire {
    Kindling/Twigs,
    keep Matches/Lighter,
    keep Notchedplank,

    Result:CampfireLit,
    Time:100.0,
}
```

### Multiple Results

Produce multiple items:
```
recipe Disassemble Pallet {
    Pallet,
    keep Hammer,

    Result:Plank=4,
    Time:120.0,
}
```

### Alternative Ingredients

Accept multiple item types:
```
recipe Repair Clothes {
    RippedSheets/DenimStrips,
    keep Needle,
    Thread,

    Result:PatchedClothes,
    Time:80.0,
}
```

The `/` means "or" - either ripped sheets OR denim strips.

## Complete Working Example

Here's a complete `my_recipes.txt` with three recipes:

```
module Base {
    imports {
        Base
    }

    /* Makeshift Torch - Basic fire source */
    recipe Make Makeshift Torch {
        TreeBranch,
        RippedSheets=2,
        keep Lighter,

        Result:Torch,
        Time:60.0,
        Category:Survivalist,
    }

    /* Rag Rope - Utility item */
    recipe Make Rag Rope {
        RippedSheets=4,

        Result:Rope,
        Time:80.0,
        Category:Survivalist,
    }

    /* Disassemble Chair - Get materials back */
    recipe Disassemble Chair {
        WoodenChair,
        keep Hammer,
        keep Saw,

        Result:Plank=2,
        Time:150.0,
        Category:Carpentry,
    }
}
```

## Key Takeaways

1. **Recipe files go in `media/scripts/`**
2. **Use `.txt` extension**
3. **Module and imports at the top**
4. **Colons for properties** (`Result:`, `Time:`)
5. **Commas after every line**
6. **`keep` for reusable tools**
7. **Test with debug mode** for easy item spawning
