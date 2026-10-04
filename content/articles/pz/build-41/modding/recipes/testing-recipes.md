---
id: recipes-testing-recipes
slug: testing-recipes
title: "Testing Your Recipe"
game: pz
version: build-41
section: modding
category: recipes
subcategory: null
difficulty: beginner
tags:
  - beginner
  - recipe
  - testing
  - debug
  - learning-path
  - troubleshooting
excerpt: "Learn how to test and debug your Project Zomboid recipes using debug mode, console commands, and troubleshooting techniques."
table_of_contents:
  - text: "What Is Recipe Testing?"
    link: "#what-is-recipe-testing"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Setting Up Debug Mode"
    link: "#setting-up-debug-mode"
  - text: "The Testing Workflow"
    link: "#the-testing-workflow"
  - text: "Quick Debug Commands"
    link: "#quick-debug-commands"
  - text: "Common Issues and Fixes"
    link: "#common-issues-and-fixes"
  - text: "Reading console.txt"
    link: "#reading-consoletxt"
  - text: "Testing Without Restarting"
    link: "#testing-without-restarting"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Test Checklist"
    link: "#test-checklist"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Recipe Ingredients Deep Dive"
    path: /build-41/modding/recipes/recipe-ingredients
  - title: "Anatomy of an Item"
    path: /build-41/modding/items/item-anatomy
last_updated: 2026-01-28
---

# Testing Your Recipe

> You're going to learn how to verify your recipes work correctly using debug tools, console commands, and systematic testing. By the end, you'll be able to quickly test any recipe and debug issues when they arise.

---

## What Is Recipe Testing?

You know that moment when you've written a recipe, loaded up the game, opened the crafting menu, and... your recipe isn't there? Or worse, it's there but crashes the game when you try to craft it? That's why testing exists.

**Recipe testing is the process of:**
- Verifying your recipe loads without errors
- Checking that it appears in the correct crafting menu
- Confirming ingredients are consumed/kept correctly
- Ensuring the result item is what you expect
- Debugging issues when things don't work

Think of testing like being your own QA tester. You're not just checking "does it work?" - you're systematically verifying every aspect of the recipe to catch problems before players do.

**You would use recipe testing when:**
- Creating any new recipe
- Modifying existing recipes
- Debugging why a recipe isn't working
- Preparing to release a mod

If you're like me when I started modding, you probably write a recipe, load the game, and immediately feel anxious wondering "did it work?" Testing removes that anxiety by giving you tools to quickly verify everything works and pinpoint exactly what's wrong when it doesn't.

---

## Prerequisites

Before diving into testing, you should have:
- [Your First Recipe File](/build-41/modding/recipes/first-recipe-file) - A recipe to test
- [Recipe Creation Basics](/build-41/modding/recipes/recipe-basics) - Understanding of recipe structure

You should have at least one recipe written and ready to test.

---

## Setting Up Debug Mode

Debug mode is **essential** for recipe testing. It gives you access to the console, lets you spawn items instantly, and provides debug menus.

### Enabling Debug Mode in Steam

1. In your Steam library, right-click **Project Zomboid**
2. Select **Properties**
3. In the "Launch Options" field, enter: `-debug`
4. Close the properties window
5. Launch the game normally

**What you'll see:** When the game loads, you'll see "DEBUG" in the top-left corner of the screen.

**Why you need it:** Without debug mode, you can't use the console to spawn items, and testing becomes extremely tedious (you'd have to scavenge for every ingredient every time you want to test).

### Useful Debug Hotkeys

Once debug mode is enabled, these keys become available:

| Key | What It Does |
|-----|--------------|
| `~` (tilde) | Opens the Lua console - use this to run commands |
| `F11` | Opens the debug menu (less useful for recipe testing) |

> **Key Takeaway**
> Debug mode + console commands = fast testing. You can spawn ingredients in seconds instead of spending minutes scavenging.

---

## The Testing Workflow

Here's the systematic workflow for testing a recipe from start to finish.

### Step 1: Save Your Recipe File

Make sure your recipe file is saved in the correct location:

```
YourMod/
├── mod.info
└── media/
    └── scripts/
        └── recipes.txt            ← Your recipe file
```

**Double-check:** Is the file extension `.txt`? Not `.lua`, not `.txt.txt`, but `.txt`.

### Step 2: Launch or Reload Project Zomboid

**If the game isn't running:** Launch it normally (with `-debug` enabled).

**If the game is already running:** You need to reload scripts:
- Press `Esc` → **Quit to Main Menu**
- This reloads all mods and scripts

**Important:** Recipe files (`.txt`) don't hot reload. You must return to the main menu or restart the game for changes to take effect.

### Step 3: Enable Your Mod

From the main menu:

1. Click **Mods**
2. Find your mod in the list (use the search if you have many mods)
3. Click to enable it (a checkmark appears)
4. Click **Back** to return to the main menu

**If your mod isn't in the list:** Your `mod.info` file might be missing or incorrect. Check that it's in your mod's root folder.

### Step 4: Start or Continue a Game

You have two options:

**Option A: Create a test save (recommended for first-time testing)**
- Click **New Game** → **Sandbox**
- Use default settings (or adjust zombie population to zero for easier testing)
- Start the game

**Option B: Continue an existing save (faster for repeated testing)**
- Click **Continue**
- Select your test save

**Pro tip:** Create a dedicated test save named "ModTest" or similar. Use this save repeatedly for all your testing.

### Step 5: Spawn Ingredients Using Console

Press `~` (tilde key) to open the Lua console. It appears at the top of the screen.

**To spawn a single item:**

```lua
getPlayer():getInventory():AddItem("Base.TreeBranch")
```

**To spawn multiple of one item:**

```lua
getPlayer():getInventory():AddItem("Base.RippedSheets", 5)  -- Spawns 5 ripped sheets
```

**To spawn several items (cleaner syntax):**

```lua
local p = getPlayer()               -- Get the player object
local inv = p:getInventory()        -- Get their inventory
inv:AddItem("Base.TreeBranch")      -- Add tree branch
inv:AddItem("Base.RippedSheets", 2) -- Add 2 ripped sheets
inv:AddItem("Base.Lighter")         -- Add lighter
```

**Item ID format:** Always `"ModuleName.ItemID"`. For vanilla items, use `"Base.ItemName"`.

**Common item IDs for testing:**
- `"Base.TreeBranch"`
- `"Base.Plank"`
- `"Base.Nails"`
- `"Base.Hammer"`
- `"Base.Saw"`
- `"Base.Lighter"`

**If you mistyped:** Just close the console and open it again. Old commands are saved in history (use up/down arrows to cycle through).

### Step 6: Open the Crafting Menu

Press `B` (the default crafting keybind).

The crafting menu opens, showing categories at the top: Survivalist, Carpentry, Cooking, etc.

### Step 7: Find Your Recipe

1. Click the **category** tab where your recipe should appear (based on the `Category:` property in your recipe)
2. Scroll through the list of recipes
3. Look for your recipe by name (the text you put after `recipe` keyword)

**If you see your recipe:** Great! It loaded successfully.

**If you don't see your recipe:** See the troubleshooting section below.

### Step 8: Verify the Recipe

Click on your recipe in the list.

**Check these things:**
- **Ingredients highlighted green?** You have the required items
- **Ingredients highlighted red?** You're missing items (this is expected if you didn't spawn everything)
- **Progress bar visible at bottom?** Recipe is craftable
- **Correct icon?** Result item icon looks right

### Step 9: Craft and Verify Result

1. Click the recipe to start crafting
2. Watch the progress bar fill
3. When complete, check your inventory

**Verify:**
- **Consumed items disappeared?** Items without `keep` should be gone
- **Kept items still there?** Items with `keep` should remain (but may have lost durability)
- **Result item appeared?** The item specified in `Result:` is in your inventory
- **Correct quantity?** If you specified `Result:Plank=3`, you got 3 planks

**If something is wrong:** See the troubleshooting section below.

> **Key Takeaway**
> The testing workflow is systematic: save → reload → enable mod → start game → spawn items → open crafting → verify → craft → check result.
> Follow this every time and you'll catch issues early.

---

## Quick Debug Commands

Here are essential console commands for testing recipes.

### Spawn an Item

```lua
getPlayer():getInventory():AddItem("Base.ItemName")
```

**Replace `ItemName` with the actual item ID.**

### Spawn Multiple Items

```lua
getPlayer():getInventory():AddItem("Base.ItemName", 10)  -- Spawns 10
```

### Check If a Recipe Exists

```lua
local recipe = getScriptManager():getRecipe("Make Makeshift Torch")  -- Use your recipe name
if recipe then
    print("Recipe found!")
else
    print("Recipe NOT found")
end
```

**What this does:** Searches for a recipe by name. If it prints "Recipe found!", your recipe loaded successfully.

### List All Recipes

```lua
local recipes = getAllRecipes()                          -- Get all recipes
for i=0, recipes:size()-1 do                             -- Loop through them
    local r = recipes:get(i)
    print(r:getName())                                   -- Print each recipe name
end
```

**What this does:** Prints every recipe name in the game. Useful for verifying your recipe is in the list.

**To use:** Open the console, paste this code, press Enter. Recipe names will appear in the console output.

### Verify an Item Exists

```lua
local item = getScriptManager():getItem("Base.TreeBranch")  -- Check if item exists
if item then
    print("Item exists: " .. item:getDisplayName())         -- Print its display name
else
    print("Item NOT found")
end
```

**What this does:** Checks if an item ID is valid. Useful when your recipe uses items but you're not sure if the ID is correct.

---

## Common Issues and Fixes

Let's troubleshoot the most common problems and how to fix them.

### Issue 1: Recipe Doesn't Appear in Crafting Menu

**Symptoms:** You open the crafting menu, navigate to the category, but your recipe isn't in the list.

**Possible Causes:**

**Cause A: Mod Not Enabled**
- **Check:** Go to main menu → Mods. Is your mod checked?
- **Fix:** Enable your mod and restart the game

**Cause B: File Not in `media/scripts/`**
- **Check:** Is your recipe file in `YourMod/media/scripts/recipes.txt`?
- **Fix:** Move the file to the correct location

**Cause C: Wrong File Extension**
- **Check:** Is the file named `recipes.txt` or `recipes.txt.txt` or `recipes.lua`?
- **Fix:** Rename to exactly `recipes.txt`

**Cause D: Parse Error in Script**
- **Check:** Open `%UserProfile%\Zomboid\console.txt` and search for "error"
- **Fix:** Look for the line number, fix the syntax error (usually a missing comma or bracket)

**Cause E: Module Not Imported**
- **Check:** Does your recipe have `imports { Base }` at the top?
- **Fix:** Add the imports block:
  ```
  module Base {
      imports {
          Base
      }

      recipe YourRecipe {
          ...
      }
  }
  ```

**Cause F: Recipe Name Conflict**
- **Check:** Is there already a vanilla recipe with the same name?
- **Fix:** Rename your recipe to something unique

### Issue 2: Recipe Shows But Can't Craft ("Not Enough Ingredients")

**Symptoms:** Recipe appears in the menu, but ingredients are red or you can't click to craft.

**Possible Causes:**

**Cause A: Item ID Mismatch**
- **Problem:** Your recipe says `TreeBranch` but the actual item ID is `TreeBranch2` or has a typo
- **Check:** Use the "Verify an Item Exists" command from the Quick Debug Commands section
- **Fix:** Correct the item ID in your recipe to match exactly

**Cause B: Quantity Mismatch**
- **Problem:** Your recipe says `Nails=5` but you only spawned 3 nails
- **Check:** Count the items in your inventory
- **Fix:** Spawn more items to meet the quantity requirement

**Cause C: Wrong Module**
- **Problem:** Your recipe is in `MyMod` module but the item is in `Base` module
- **Check:** Are you using `module Base` or `module MyMod`?
- **Fix:** Use `module Base` for vanilla items, or adjust your imports

### Issue 3: Recipe Shows But Can't Craft ("Don't Know Recipe")

**Symptoms:** Recipe appears but says "Don't know recipe" or similar.

**Cause:** Your recipe has `NeedToBeLearn:true` property.

**What this means:** Players must read a recipe magazine before they can craft it.

**Fix:** Either:
- Remove `NeedToBeLearn:true` from your recipe
- OR spawn the corresponding recipe magazine

### Issue 4: Crafting Gives Wrong Item

**Symptoms:** Crafting completes but you get a different item than expected.

**Possible Causes:**

**Cause A: Wrong Item ID in Result**
- **Problem:** `Result:Torch` when you meant `Result:Torch2`
- **Check:** Look at your recipe's `Result:` line
- **Fix:** Correct the item ID

**Cause B: Item Doesn't Exist**
- **Problem:** `Result:CustomItem` but you haven't created that item yet
- **Check:** Use the "Verify an Item Exists" command
- **Fix:** Create the item first, or use an existing vanilla item

### Issue 5: Game Crashes on Load

**Symptoms:** Game crashes when you try to start or when returning to main menu.

**Cause:** Parse error in your recipe file - usually a syntax mistake.

**How to diagnose:**

1. Open `%UserProfile%\Zomboid\console.txt`
2. Scroll to the bottom (most recent errors)
3. Look for:
   - `ERROR: ScriptParser:`
   - Line numbers
   - Messages like "Expected ',' or '}'"

**Example error:**

```
ERROR: ScriptParser: Error parsing scripts/recipes.txt at line 12
ERROR: ScriptParser: Expected ',' or '}'
```

**Translation:** Line 12 is missing a comma or closing brace.

**Fix:** Open your recipe file, go to line 12, add the missing comma or bracket.

### Issue 6: Tools Get Consumed When They Shouldn't

**Symptoms:** Your hammer or saw disappears after crafting once.

**Cause:** You forgot the `keep` keyword.

**Fix:** Add `keep` before the tool:

**Wrong:**
```
Hammer,              /* Hammer will be consumed */
```

**Correct:**
```
keep Hammer,         /* Hammer stays in inventory */
```

---

## Reading console.txt

The `console.txt` file is your best friend for debugging. It contains all error messages, script loading messages, and debug output.

### Location

```
Windows: %UserProfile%\Zomboid\console.txt
```

**To open:**
1. Press `Win+R` (Run dialog)
2. Type: `%UserProfile%\Zomboid`
3. Press Enter
4. Double-click `console.txt`

**Or:** Type the path into Windows Explorer: `%UserProfile%\Zomboid\console.txt`

### Finding Recipe Errors

Open `console.txt` in a text editor (Notepad, VS Code, etc.) and search (`Ctrl+F`) for:

**Search terms:**
- `script` - Shows script parsing messages
- `recipe` - Shows recipe-specific errors
- `error` - Shows all errors
- Your recipe file name (e.g., `recipes.txt`)

### Understanding Error Messages

**Error pattern:**
```
ERROR: ScriptParser: Error parsing scripts/recipes.txt at line 8
ERROR: ScriptParser: Expected ',' or '}'
```

**Translation:**
- **File:** `scripts/recipes.txt`
- **Line:** 8
- **Problem:** Missing comma or closing brace

**Common error messages:**

| Error Message | What It Means | How to Fix |
|---------------|---------------|------------|
| `Expected ',' or '}'` | Missing comma or closing brace | Add comma at end of line or closing `}` |
| `Unknown item 'ItemName'` | Item ID doesn't exist | Check item ID spelling/capitalization |
| `Duplicate recipe name` | Two recipes with same name | Rename one recipe to be unique |
| `Expected ':'` | Using `=` instead of `:` for properties | Change `Result=Item` to `Result:Item` |

---

## Testing Without Restarting

Unfortunately, **recipe file changes require reloading scripts**, which means you need to return to the main menu or restart the game.

**There is no hot reload for `.txt` script files.**

### The Fast Reload Method

When you make a change to your recipe:

1. Save the recipe file (`Ctrl+S`)
2. In-game, press `Esc` → **Quit to Main Menu** (NOT "Quit to Desktop")
3. From main menu, click **Continue** and select your test save
4. Game loads, scripts are reloaded, test your changes

**This is faster than:**
- Closing the entire game and restarting
- Starting a new game every time

**Pro tip:** Keep your recipe file open in a text editor side-by-side with the game. Make change → save → quit to menu → continue → test. This becomes muscle memory.

---

## Try It Yourself

Let's practice the testing workflow with a hands-on exercise.

### Exercise: Test a Simple Recipe

**Challenge:** Create and test a recipe for bundling rags.

**Step 1: Write the Recipe**

Create a file at `YourMod/media/scripts/test_recipe.txt`:

```
module Base {
    imports {
        Base
    }

    recipe Bundle Rags {
        RippedSheets=3,

        Result:RagBundle,
        Time:30.0,
        Category:Survivalist,
    }
}
```

**Note:** `RagBundle` is a fictional item for this exercise. In a real mod, you'd need to create this item first.

**Step 2: Enable Debug Mode**

Add `-debug` to your Steam launch options if you haven't already.

**Step 3: Load the Game**

1. Launch Project Zomboid
2. Main menu → **Mods** → Enable your mod
3. **New Game** or **Continue** a test save

**Step 4: Spawn Ingredients**

Open console (`~`) and run:

```lua
getPlayer():getInventory():AddItem("Base.RippedSheets", 5)  -- Spawn 5 (we only need 3)
```

**Step 5: Test the Recipe**

1. Press `B` to open crafting menu
2. Click **Survivalist** tab
3. Find "Bundle Rags" in the list

**Questions to answer:**
- Does the recipe appear?
- Are the ripped sheets highlighted green?
- Can you click to start crafting?

**Step 6: Verify Errors (Intentional)**

This recipe will fail because `RagBundle` doesn't exist as an item. But that's okay - you're practicing the testing workflow.

**Check `console.txt` for error messages about the missing item.**

---

## Test Checklist

Before releasing your mod or moving on to the next recipe, verify all these points:

### Functional Tests

- [ ] Recipe appears in the correct category
- [ ] Recipe name is clear and descriptive
- [ ] All required ingredients are recognized
- [ ] Ingredients without `keep` are consumed
- [ ] Ingredients with `keep` remain in inventory (but may lose durability)
- [ ] Result item is correct
- [ ] Result quantity is correct (if you specified a quantity)
- [ ] Crafting time feels appropriate (not instant, not too slow)
- [ ] No errors appear in `console.txt`

### Compatibility Tests

- [ ] Works with a fresh save (not just your test save)
- [ ] Works when mod is enabled from game start
- [ ] Works alongside other mods (if applicable)
- [ ] Recipe doesn't conflict with vanilla recipe names

### Polish Tests

- [ ] Recipe has a `Category:` property (not in generic "All" category)
- [ ] Recipe has a `Sound:` property if appropriate
- [ ] Time value feels balanced for the effort/value
- [ ] Tool requirements make logical sense

---

## Key Takeaways

Let's recap the essential testing techniques:

1. **Debug mode is essential**
   - Add `-debug` to Steam launch options
   - Gives you access to console and debug menus

2. **Use the console to spawn items**
   - `getPlayer():getInventory():AddItem("Base.ItemName")`
   - Spawn ingredients in seconds instead of scavenging
   - Essential for rapid testing

3. **Follow the systematic workflow**
   - Save → reload → enable mod → start game → spawn items → craft → verify
   - Don't skip steps or you'll miss issues

4. **Script changes require reload**
   - Quit to main menu → Continue game
   - No hot reload for `.txt` files
   - Get used to this cycle

5. **console.txt tells you everything**
   - Located at `%UserProfile%\Zomboid\console.txt`
   - Search for "error", "script", or your filename
   - Line numbers tell you exactly where problems are

6. **Test incrementally**
   - Add one recipe at a time
   - Test each recipe before adding the next
   - Easier to isolate problems

7. **Common issues have common fixes**
   - Recipe not appearing? Check mod enabled, file location, parse errors
   - Can't craft? Check item IDs, quantities, imports
   - Game crashes? Check console.txt for syntax errors

8. **Create a dedicated test save**
   - Use the same save repeatedly
   - Faster than creating new games
   - Consistent testing environment

You now have all the tools to quickly and systematically test any recipe. Testing might feel tedious at first, but it becomes fast and natural with practice. The 30 seconds you spend testing saves you hours of debugging later.

---

## What's Next?

Ready to create more complex recipes or learn related topics?

- [Recipe Ingredients Deep Dive](/build-41/modding/recipes/recipe-ingredients) - Master advanced ingredient patterns
- [Anatomy of an Item](/build-41/modding/items/item-anatomy) - Create custom items for your recipes
- [Your First Custom Item](/build-41/modding/items/first-item-file) - Make the result items you need
