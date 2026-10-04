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
  - text: "What Is a Recipe File?"
    link: "#what-is-a-recipe-file"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "The Simplest Working Recipe"
    link: "#the-simplest-working-recipe"
  - text: "Step 1: Create the Scripts Folder"
    link: "#step-1-create-the-scripts-folder"
  - text: "Step 2: Create the Recipe File"
    link: "#step-2-create-the-recipe-file"
  - text: "Step 3: Write Your First Recipe"
    link: "#step-3-write-your-first-recipe"
  - text: "Understanding Each Part"
    link: "#understanding-each-part"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Building On The Basics"
    link: "#building-on-the-basics"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Testing Your Recipe"
    path: /build-41/modding/recipes/testing-recipes
  - title: "Recipe Ingredients Deep Dive"
    path: /build-41/modding/recipes/recipe-ingredients
last_updated: 2026-01-28
---

# Your First Recipe File

> You're about to create your first custom crafting recipe for Project Zomboid. By the end of this guide, you'll have a working mod that adds a recipe players can actually use in-game.

---

## What Is a Recipe File?

You know when you open the crafting menu in Project Zomboid (press `B`) and see all those recipes for making spears, bandaging wounds, or cooking food? Every single one of those recipes is defined in a recipe file somewhere in the game's code.

**A recipe file tells the game:**
- What ingredients you need
- What you get when you craft it
- How long it takes
- Where it shows up in the crafting menu

When you create your own recipe file, you're adding new crafting recipes that appear right alongside the vanilla ones. Your makeshift torch recipe will show up in the same crafting menu where players find "Make Spear" or "Rip Sheets."

**You would use recipe files when:**
- Adding new craftable items to the game
- Creating alternative ways to craft existing items
- Making survival mods (custom tools, weapons, food)
- Building crafting-focused mods

If you're feeling a bit overwhelmed by the idea of "writing code," I get it. When I created my first recipe, I stared at a blank file for 10 minutes, not sure where to start. But here's the good news: recipe files are actually one of the simplest types of mods you can make. We're going to start with just 13 lines of code that actually work.

---

## Prerequisites

Before starting, make sure you have:
- [Mod Folder Structure](/build-41/modding/setup/mod-folder-structure) - A basic mod folder set up
- [The mod.info File](/build-41/modding/setup/mod-info-file) - A working `mod.info` file
- A text editor (VS Code recommended)

---

## The Simplest Working Recipe

Let's start with the absolute minimum - a recipe that actually works in Project Zomboid. We're going to create a recipe for a **makeshift torch**.

Here's the complete code:

```
module Base {                              /* Declare we're adding to the Base module */
    imports {                               /* Tell the game which modules we'll reference */
        Base                                /* We're using items from the Base module */
    }

    recipe Make Makeshift Torch {           /* Create a recipe named "Make Makeshift Torch" */
        TreeBranch,                         /* Requires 1 tree branch (consumed) */
        RippedSheets=2,                     /* Requires 2 ripped sheets (consumed) */
        keep Lighter,                       /* Requires 1 lighter (NOT consumed - stays in inventory) */

        Result:Torch,                       /* Produces 1 torch when crafted */
        Time:60.0,                          /* Takes 60 time units to craft */
        Category:Survivalist,               /* Shows up in the Survivalist crafting tab */
    }
}                                           /* Close the module */
```

That's it. These 13 lines are enough to add a working crafting recipe to Project Zomboid. Let's break down what each part means, line by line.

> **Key Takeaway**
> You don't need dozens of lines of code to create a working mod. This simple recipe is complete and functional - everything else is just additions to this foundation.

---

## Step 1: Create the Scripts Folder

First, we need to put our recipe file in the right place. Project Zomboid looks for recipe files in a specific folder: `media/scripts/`.

Your mod folder should look like this:

```
MyFirstMod/
├── mod.info                    ← You already have this
└── media/                      ← Create this folder
    └── scripts/                ← Create this folder too
```

**Why "media/scripts"?** This is where PZ expects to find all `.txt` script files - recipes, items, vehicles, and more. The game won't find your recipes if they're anywhere else.

**To create these folders:**
1. Open your mod folder (where your `mod.info` file is)
2. Create a new folder named `media`
3. Inside `media`, create a folder named `scripts`

---

## Step 2: Create the Recipe File

Now let's create the actual recipe file.

1. Inside `media/scripts/`, create a new file called `my_recipes.txt`
2. Open it in your text editor

**Important:** The file MUST have a `.txt` extension. Not `.lua`, not `.js`, not `.script` - it has to be `.txt`. That's the file type Project Zomboid uses for recipe definitions.

Your folder structure should now look like this:

```
MyFirstMod/
├── mod.info
└── media/
    └── scripts/
        └── my_recipes.txt      ← Your new file
```

**Note:** You can name the file anything you want, as long as it ends in `.txt`. I'm using `my_recipes.txt` because it's descriptive, but you could call it `recipes.txt`, `crafting.txt`, or even `cool_stuff.txt` - PZ will load it regardless.

---

## Step 3: Write Your First Recipe

Now for the actual recipe code. Copy and paste this into your `my_recipes.txt` file:

```
module Base {                              /* Declare we're adding to the Base module */
    imports {                               /* Tell the game which modules we'll reference */
        Base                                /* We're using items from the Base module */
    }

    recipe Make Makeshift Torch {           /* Create a recipe named "Make Makeshift Torch" */
        TreeBranch,                         /* Requires 1 tree branch (consumed) */
        RippedSheets=2,                     /* Requires 2 ripped sheets (consumed) */
        keep Lighter,                       /* Requires 1 lighter (NOT consumed - stays in inventory) */

        Result:Torch,                       /* Produces 1 torch when crafted */
        Time:60.0,                          /* Takes 60 time units to craft */
        Category:Survivalist,               /* Shows up in the Survivalist crafting tab */
    }
}                                           /* Close the module */
```

Save the file (`Ctrl+S` or `Cmd+S`).

That's the complete recipe. Let's understand what each line does.

---

## Understanding Each Part

This looks like a lot of symbols and keywords, but if we take it one line at a time, it's actually pretty straightforward. Let's break it down piece by piece.

### The Module Declaration

```
module Base {
```

This line is called a **declaration** - programmer-speak for "I'm about to tell you what something is." This particular declaration tells the game "I'm about to define things that belong to the Base module."

**What's a module?** Think of it like a folder that organizes related items. The `Base` module is where all of Project Zomboid's vanilla items live - things like `Base.TreeBranch`, `Base.Lighter`, `Base.Torch`. We're adding our recipe to the Base module so we can use those vanilla items.

**Why "Base"?** We're using items that already exist in the game (tree branches, lighters, torches). Since those items belong to the Base module, we add our recipe to Base too. If we were creating brand new custom items, we might use our own module name instead.

The `{` symbol (opening curly brace) means "everything after this, up until the closing brace, belongs to this module." Think of it like opening a container - everything goes inside until we close it.

| Symbol | What It Means |
|--------|---------------|
| `{` | Opens a container - everything inside belongs together |
| `}` | Closes a container |

### The Imports Section

```
    imports {
        Base
    }
```

This tells the game "I'm going to reference items from the Base module, so please make them available."

**What's an import?** It's like telling PZ: "Hey, I'm going to mention items like TreeBranch and Lighter. Those items are in the Base module, so make sure you know where to find them."

Without this import, we'd have to write `Base.TreeBranch` and `Base.Lighter` every time. With the import, we can just write `TreeBranch` and `Lighter` - the game knows we mean the Base versions.

### The Recipe Declaration

```
    recipe Make Makeshift Torch {
```

This declares a new **recipe** - a craftable item definition. **"Make Makeshift Torch"** is the name that appears in the player's crafting menu.

When a player opens their crafting menu and looks under the Survivalist category, they'll see "Make Makeshift Torch" as an option. That's exactly what we typed here - it's not a code variable, it's the actual text the player sees.

### The Ingredients (What You Need)

```
        TreeBranch,
```

This line says "the player needs one tree branch to craft this recipe." After crafting, the tree branch is **consumed** - it disappears from the player's inventory and gets used up.

**Why no number?** When you don't specify a quantity, the game assumes you mean 1. So `TreeBranch,` means "1 TreeBranch."

```
        RippedSheets=2,
```

This line says "the player needs 2 ripped sheets." The `=2` specifies the quantity. After crafting, both sheets are consumed.

**The equals sign** (`=`) here means "this many." So `RippedSheets=2` means "2 ripped sheets."

```
        keep Lighter,
```

This line says "the player needs a lighter, but don't consume it." The `keep` keyword (a special instruction word) means the item is required to craft the recipe, but it stays in the player's inventory afterward.

**Why keep?** A lighter is a tool - you're using it to light the torch, but the lighter itself isn't getting used up. Tools like knives, hammers, and saws are almost always marked with `keep` because you use them but don't destroy them.

**Important:** Notice the comma `,` after each ingredient line. Every line in the recipe needs to end with a comma. This is how the game knows where one instruction ends and the next begins.

### The Result (What You Get)

```
        Result:Torch,
```

This line says "when the player finishes crafting, they receive a Torch item."

**Notice the colon** `:` instead of an equals sign. For **properties** (characteristics or settings of the recipe) like `Result`, `Time`, and `Category`, we use a colon `:` not an equals sign `=`. That's just how the recipe syntax works - it's a rule you'll get used to.

| When to Use | Symbol | Example |
|-------------|--------|---------|
| Ingredient quantities | `=` | `RippedSheets=2,` |
| Recipe properties | `:` | `Result:Torch,` |

### The Crafting Time

```
        Time:60.0,
```

This says "crafting takes 60 time units." In Project Zomboid, higher numbers mean longer crafting time. `60.0` is about medium speed - not instant, but not super slow either.

**Why the .0?** The game expects a decimal number (called a "float" in programming). You can write `60` but adding `.0` makes it clear it's a time value. Either works, but `.0` is more explicit.

### The Category (Where It Shows Up)

```
        Category:Survivalist,
```

This says "show this recipe in the Survivalist category of the crafting menu."

When players open their crafting menu, they'll see tabs like Survivalist, Carpentry, Cooking, etc. This line determines which tab your recipe appears under. If you left this out, players could still craft your recipe, but they'd have a hard time finding it - it would show up in a generic "All" category.

### Closing Braces (Closing the Containers)

```
    }
}
```

These closing curly braces close the containers we opened earlier:
- The first `}` closes the recipe definition
- The second `}` closes the module definition

Think of these like closing parentheses - every opening `{` needs a matching closing `}`. If you forget a closing brace, the game won't understand where things end.

> **Key Takeaway**
> The pattern is: declaration → opening brace `{` → content → closing brace `}`.
> We use this pattern twice: once for the module, once for the recipe inside it.
> This is like Russian nesting dolls - a recipe inside a module.

That's all there is to it. This 13-line recipe is complete and ready to use.

---

## Try It Yourself

Let's verify your recipe actually works in-game. Follow these steps carefully:

### 1. Launch Project Zomboid

Start the game normally.

### 2. Enable Your Mod

1. From the main menu, click **Mods**
2. Find "My First Mod" (or whatever you named it in your `mod.info`)
3. Check the box to enable it
4. Click **Done**

If you don't see your mod in the list, double-check that your `mod.info` file is in the right place (the root of your mod folder).

### 3. Start a New Game

For testing, I recommend starting a new game in Sandbox mode. Set the following options to make testing easier:

- **Starter Kit:** Select one (gives you a backpack of supplies)
- **Loot Abundance:** Set to "Abundant" so items are easier to find

### 4. Collect the Ingredients

You need:
- **1 Tree Branch** - Found on the ground near trees, or break small trees with a weapon
- **2 Ripped Sheets** - Rip sheets from beds, windows, or clothing
- **1 Lighter** - Found in kitchens, gas stations, vehicles, or zombie pockets

**Testing shortcut:** If you want to test faster without scavenging, enable debug mode and spawn the items instantly:

1. Add `-debug` to your Steam launch options for Project Zomboid
2. In-game, press `~` (tilde key) to open the debug console
3. Type these commands (press Enter after each):

```lua
getPlayer():getInventory():AddItem("Base.TreeBranch")
getPlayer():getInventory():AddItem("Base.RippedSheets", 2)
getPlayer():getInventory():AddItem("Base.Lighter")
```

The items will appear in your inventory immediately.

### 5. Open the Crafting Menu

Press `B` (the default keybind) to open the crafting menu.

### 6. Find Your Recipe

1. Look for the **Survivalist** tab at the top of the crafting window
2. Click it to see all Survivalist recipes
3. Scroll through the list - you should see "Make Makeshift Torch"

If you see your recipe in the list, that means it loaded successfully!

### 7. Craft It

1. Click "Make Makeshift Torch" in the recipe list
2. Watch the progress bar at the bottom fill up (takes about 60 time units)
3. When the bar completes, you'll have a Torch in your inventory!

**What you should see happen:**
- The tree branch disappears from your inventory (consumed)
- The 2 ripped sheets disappear (consumed)
- The lighter stays in your inventory (because we used `keep`)
- A new torch appears in your inventory

**Try using the torch:** Right-click the torch and select "Light." Your character will light it, and you'll have a portable light source!

If you successfully crafted the torch - **congratulations!** You just created your first working Project Zomboid mod. That's a real accomplishment.

---

## Common Mistakes

Let's look at the most common errors beginners make when creating recipe files. I made every single one of these when I started, so don't feel bad if you hit them too.

### Mistake 1: Forgetting the Comma

This is the #1 mistake everyone makes.

**Doesn't work:**

```
recipe Make Makeshift Torch {
    TreeBranch,
    RippedSheets=2
    keep Lighter,

    Result:Torch
    Time:60.0,
}
```

**What you'll see:** The game won't load your recipe, or you'll see cryptic errors in `console.txt` like `unexpected symbol near 'keep'` or `unexpected symbol near 'Time'`.

**Why it breaks:** The recipe parser (the part of the game that reads recipe files) expects a comma after every line. Without commas, the game doesn't know where one instruction ends and the next begins. It tries to read `RippedSheets=2 keep` as one instruction, which makes no sense, so it gives up.

**Works:**

```
recipe Make Makeshift Torch {
    TreeBranch,
    RippedSheets=2,          ← Added comma
    keep Lighter,

    Result:Torch,            ← Added comma
    Time:60.0,
}
```

**Why:** Every single line inside the recipe needs a comma at the end. This is a pattern you'll see everywhere in PZ scripting. Get in the habit of adding commas after every line - you can't have too many commas here, but one missing comma will break everything.

### Mistake 2: Using Equals Instead of Colon

**Doesn't work:**

```
recipe Make Makeshift Torch {
    TreeBranch,
    RippedSheets=2,
    keep Lighter,

    Result=Torch,            ← Wrong! Should be colon
    Time=60.0,               ← Wrong! Should be colon
}
```

**What you'll see:** Your mod might load, but the recipe won't appear in-game. Or you might see errors about invalid syntax.

**Why it breaks:** For recipe properties (`Result`, `Time`, `Category`, etc.), you must use a colon `:` not an equals sign `=`. That's just the syntax rule for how recipe files work.

**Works:**

```
recipe Make Makeshift Torch {
    TreeBranch,
    RippedSheets=2,
    keep Lighter,

    Result:Torch,            ← Colon for properties
    Time:60.0,               ← Colon for properties
}
```

**The pattern to remember:**
- Ingredient quantities use `=` → `RippedSheets=2`
- Recipe properties use `:` → `Result:Torch`

**Why is it different?** Because ingredients and properties are different types of instructions. Ingredients are "what you need" and properties are "characteristics of the recipe." The different symbols help the game tell them apart.

### Mistake 3: Wrong File Location

**Doesn't work:**

```
MyFirstMod/
├── mod.info
└── my_recipes.txt           ← Wrong! Too high up
```

or

```
MyFirstMod/
├── mod.info
└── media/
    └── my_recipes.txt       ← Wrong! Missing scripts folder
```

**What you'll see:** Your recipe doesn't appear in-game. No error messages, it just doesn't exist. The game silently ignores it because it's not looking in that folder.

**Why it breaks:** Project Zomboid only looks for recipe files in `media/scripts/`. If you put them anywhere else - even just one folder level off - PZ won't find them.

**Works:**

```
MyFirstMod/
├── mod.info
└── media/
    └── scripts/
        └── my_recipes.txt   ← Correct! Inside media/scripts/
```

**Why:** The game has specific folders where it looks for specific file types:
- Recipes → `media/scripts/`
- Items → `media/scripts/`
- Lua code → `media/lua/`
- Textures → `media/textures/`

This folder structure is how PZ organizes mods. Always put recipes in `media/scripts/`.

### Mistake 4: Wrong File Extension

**Doesn't work:**

- `my_recipes.lua` (wrong extension)
- `my_recipes.txt.txt` (Windows hiding the real extension)
- `my_recipes` (no extension)
- `my_recipes.js` (wrong extension)

**What you'll see:** Your recipe won't load. PZ only reads `.txt` files when looking for recipes and item definitions.

**Why it breaks:** The game filters files by extension. When it scans `media/scripts/`, it only pays attention to `.txt` files. Everything else gets ignored.

**Works:**

- `my_recipes.txt`
- `recipes.txt`
- `anything_you_want.txt`

**Windows warning:** If you create a file called `my_recipes.txt` but actually see `my_recipes.txt.txt` in the folder (or if Windows shows `my_recipes` without the `.txt`), you might have "Hide extensions for known file types" enabled. This can be confusing. Either:
- Disable "Hide extensions" in Windows Explorer settings (recommended)
- Or name your file just `my_recipes` and Windows will add `.txt` automatically

### Mistake 5: Typo in Item Names

**Doesn't work:**

```
recipe Make Makeshift Torch {
    Treebranch,              ← Wrong! Should be TreeBranch (capital B)
    RippedSheets=2,
    keep Lighter,

    Result:Torch,
    Time:60.0,
}
```

**What you'll see:** The recipe appears in your crafting menu, but when you try to craft it, you can't - even when you have the correct items in your inventory. The game is looking for an item called "Treebranch" (lowercase 'b') which doesn't exist.

**Why it breaks:** Item names are **case-sensitive** - uppercase and lowercase letters matter. `TreeBranch` and `Treebranch` are completely different things to the game. If you use the wrong capitalization, the game looks for an item that doesn't exist.

**Works:**

```
recipe Make Makeshift Torch {
    TreeBranch,              ← Correct! Capital T, capital B
    RippedSheets=2,
    keep Lighter,

    Result:Torch,
    Time:60.0,
}
```

**How to avoid this:** Look at vanilla recipe files to see the exact spelling and capitalization of items. You can find vanilla recipes in your game installation folder:

```
<your Steam library>\steamapps\common\ProjectZomboid\media\scripts\
```

Open some of the `.txt` files in there and see how Indie Stone spells and capitalizes item names. That's your reference guide.

### Mistake 6: Mismatched Braces

**Doesn't work:**

```
module Base {
    imports {
        Base
    }

    recipe Make Makeshift Torch {
        TreeBranch,
        Result:Torch,
        Time:60.0,
    }
    ← Missing closing brace for module!
```

**What you'll see:** The game might not load your recipe file at all, or you'll see parsing errors in `console.txt`.

**Why it breaks:** Every opening brace `{` needs a matching closing brace `}`. If you forget one, the game doesn't know where the module or recipe ends.

**Works:**

```
module Base {
    imports {
        Base
    }

    recipe Make Makeshift Torch {
        TreeBranch,
        Result:Torch,
        Time:60.0,
    }
}                            ← Closing brace for module
```

**Counting tip:** Count your braces. You should have equal numbers of `{` and `}`. In our recipe:
- 1 opening for module, 1 closing for module
- 1 opening for imports, 1 closing for imports
- 1 opening for recipe, 1 closing for recipe
- Total: 3 opening `{`, 3 closing `}`

---

## Building On The Basics

Now that you have a working recipe, let's explore what else you can do. We'll build on the foundation step by step.

### Version 2: Adding Multiple Recipes

You can put multiple recipes in the same file. Just add another recipe block inside the same module:

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
        keep KitchenKnife,

        Result:SharpedStick,
        Time:40.0,
        Category:Survivalist,
    }
}
```

**What changed:** We added a second recipe for sharpening a stick. Both recipes exist in the same module, separated by a blank line for readability.

**The blank line isn't required** - it's just there to make the file easier for humans to read. The game ignores blank lines.

**Why this is useful:** You can organize related recipes together in one file. For example, all your torch-related recipes, or all your woodworking recipes, could go in one `.txt` file.

### Version 3: Using Alternative Ingredients

What if a player could use either a kitchen knife OR a hunting knife to sharpen the stick? Use the `/` symbol:

```
    recipe Sharpen Stick {
        TreeBranch,
        keep KitchenKnife/HuntingKnife,      ← Either knife works

        Result:SharpedStick,
        Time:40.0,
        Category:Survivalist,
    }
```

**What the `/` means:** "OR" - the player can use a kitchen knife or a hunting knife, whichever they have. They only need one. The first one the game finds in their inventory will be used for the recipe.

You can chain multiple alternatives together:

```
    keep KitchenKnife/HuntingKnife/BreadKnife/ButterKnife,
```

This means "any of these knives will work." The player needs at least one, but any of them will satisfy the requirement.

**Why this is useful:** It makes recipes more flexible. Instead of forcing players to find one specific rare item, you let them use whatever they have available.

### Version 4: Multiple Results

Some recipes produce more than one item. For example, disassembling a pallet gives you several planks:

```
    recipe Disassemble Pallet {
        Pallet,
        keep Hammer,

        Result:Plank=4,          ← Produces 4 planks, not just 1
        Time:120.0,
        Category:Carpentry,
    }
```

**What changed:** We added `=4` to the Result. This means the player gets 4 planks when they complete the recipe, not just 1.

**The pattern:** Just like ingredients can have quantities (`RippedSheets=2`), results can too (`Plank=4`).

### Version 5: Complete Example With Comments

Here's a complete example showing multiple recipes with different features:

```
module Base {
    imports {
        Base
    }

    /* Makeshift Torch - Basic survival light source */
    recipe Make Makeshift Torch {
        TreeBranch,
        RippedSheets=2,
        keep Lighter,

        Result:Torch,
        Time:60.0,
        Category:Survivalist,
    }

    /* Rag Rope - Turn cloth into utility rope */
    recipe Make Rag Rope {
        RippedSheets=4,

        Result:Rope,
        Time:80.0,
        Category:Survivalist,
    }

    /* Disassemble Chair - Salvage wood from furniture */
    recipe Disassemble Chair {
        WoodenChair,
        keep Hammer,
        keep Saw,

        Result:Plank=2,          /* Gets 2 planks back */
        Time:150.0,
        Category:Carpentry,
    }
}
```

**What's new here:** I added comments using `/* comment */` syntax. Comments are text the game ignores - they're just notes for humans reading the code. You can use them to remind yourself what each recipe does.

> **Key Takeaway**
> The syntax patterns you learned with the first recipe apply everywhere:
> - Ingredients use commas
> - Properties use colons
> - Quantities use equals signs
> - `keep` means "don't consume"
> - `/` means "or" (alternatives)
> - Everything needs a closing comma

Once you understand the pattern, you can create any recipe you can imagine.

---

## Key Takeaways

Let's recap what we learned:

1. **Recipe files go in `media/scripts/` and must use the `.txt` extension**
   - Not in the root mod folder
   - Not in `media/` directly
   - Must be `.txt`, not `.lua` or anything else

2. **Every recipe needs a module wrapper and imports block**
   ```
   module Base {
       imports {
           Base
       }

       recipe [Name] {
           /* ingredients and properties */
       }
   }
   ```

3. **Ingredients use commas, properties use colons**
   - Ingredient: `TreeBranch,` or `RippedSheets=2,`
   - Property: `Result:Torch,` or `Time:60.0,`
   - Don't mix them up!

4. **The `keep` keyword prevents items from being consumed**
   - Use for tools: `keep Hammer,`
   - Use for reusable items: `keep Lighter,`
   - The item is required but stays in inventory

5. **The `/` symbol means "or" for alternatives**
   - `keep Hammer/Screwdriver,` means either tool works
   - `Plank/Log,` means either ingredient works

6. **Item names must match exactly (case-sensitive)**
   - `TreeBranch` works
   - `Treebranch` doesn't work
   - Check vanilla files for correct spelling

7. **Test in debug mode to spawn items quickly**
   - Use `-debug` Steam launch option
   - Use console commands: `getPlayer():getInventory():AddItem("Base.ItemName")`
   - Much faster than scavenging in-game

8. **Every line needs a comma, every brace needs a closing brace**
   - Missing comma = parsing error
   - Missing closing brace = file won't load
   - Count your symbols!

You just created a working Project Zomboid mod from scratch. That's a real accomplishment - many people give up before they get this far. The recipe you made is simple, but it's also complete and functional. Everything else you'll learn about recipes is just building on these fundamentals.

---

## What's Next?

Ready to dig deeper? Here's where to go from here:

- [Testing Your Recipe](/build-41/modding/recipes/testing-recipes) - Learn efficient testing strategies, debug commands, and how to troubleshoot when things break
- [Recipe Ingredients Deep Dive](/build-41/modding/recipes/recipe-ingredients) - Explore all the ways to specify ingredients: quantities, alternatives, skill requirements, and more
- [Recipe Anatomy](/build-41/modding/recipes/recipe-anatomy) - Understand all the properties you can use: skills, sounds, animations, and advanced features
