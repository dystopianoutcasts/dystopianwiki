---
id: testing-recipes
slug: testing-recipes
title: Testing Your Recipe
excerpt: You've written a recipe - now let's test it. This guide covers how to load your mod, verify the recipe works, and debug common issues. 1. Save your script file 2. Launch PZ (or return to main menu)...
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
last_updated: 2026-01-09
---
# Testing Your Recipe

## Overview

You've written a recipe - now let's test it. This guide covers how to load your mod, verify the recipe works, and debug common issues.

## Quick Testing Workflow

```
1. Save your script file
2. Launch PZ (or return to main menu)
3. Enable mod in Mods menu
4. Start/continue game
5. Spawn ingredients (debug mode)
6. Try crafting
7. Check console.txt for errors
```

## Setting Up for Testing

### Enable Debug Mode

Debug mode is essential for recipe testing:

**Steam:** Add `-debug` to launch options

1. Right-click PZ in Steam > Properties
2. Launch options: `-debug`
3. Launch game

You'll see "DEBUG" in the corner when active.

### Useful Debug Hotkeys

| Key | Function |
|-----|----------|
| `~` | Open Lua console |
| `F11` | Debug menu |

## Testing Step by Step

### Step 1: Enable Your Mod

1. From main menu, go to **Mods**
2. Find your mod in the list
3. Click to enable (checkmark appears)
4. Click "Back" to save

### Step 2: Start a Game

You can:
- Start a new game (safest for testing)
- Continue an existing game (faster)

**Tip:** Create a dedicated test save for mod development.

### Step 3: Spawn Ingredients

Open console (`~`) and spawn what you need:

```lua
local p = getPlayer()
local inv = p:getInventory()
inv:AddItem("Base.TreeBranch")
inv:AddItem("Base.RippedSheets", 5)
inv:AddItem("Base.Lighter")
```

Or spawn individually:
```lua
getPlayer():getInventory():AddItem("Base.Hammer")
```

### Step 4: Open Crafting Menu

1. Press `B` (default crafting key)
2. Navigate to your recipe's category
3. Find your recipe by name

### Step 5: Craft and Verify

- Does the recipe appear?
- Are ingredients highlighted correctly?
- Does crafting complete?
- Is the result what you expected?

## Common Issues and Fixes

### Recipe Doesn't Appear in Menu

**Possible causes:**

1. **Mod not enabled**
   - Check Mods menu

2. **File not in `media/scripts/`**
   - Verify folder structure

3. **Parse error in script**
   - Check console.txt for errors

4. **Wrong file extension**
   - Must be `.txt` not `.lua`

5. **Module not imported**
   - Add `imports { Base }` if using Base items

### Recipe Shows But Can't Craft

**"Not enough ingredients"**
- Verify item IDs match exactly
- Check quantity requirements (=2 means need 2)

**"Don't know recipe"**
- Recipe has `NeedToBeLearn:true`
- Spawn the recipe magazine or remove that line

**"Missing tools"**
- Tools with `keep` keyword must exist
- Check tool item IDs

### Crafting Gives Wrong Item

- Verify `Result:` item ID is correct
- Check you're in the Base module
- Ensure item exists in vanilla

### Game Crashes on Load

**Check console.txt for:**
- "Error parsing script"
- Line numbers of the error
- Missing comma or bracket

## Reading console.txt

Located at:
```
%UserProfile%\Zomboid\console.txt
```

### Finding Recipe Errors

Search for:
- `script` - Script parsing messages
- `recipe` - Recipe-specific errors
- `error` - General errors

### Example Error

```
ERROR: ScriptParser: Error parsing scripts/my_recipes.txt at line 8
ERROR: ScriptParser: Expected ',' or '}'
```

**Translation:** Line 8 is missing a comma.

## Quick Debug Commands

### List All Recipes

```lua
local recipes = getAllRecipes()
for i=0, recipes:size()-1 do
    local r = recipes:get(i)
    print(r:getName())
end
```

### Check If Recipe Exists

```lua
local recipe = getScriptManager():getRecipe("Make Makeshift Torch")
if recipe then
    print("Recipe found!")
else
    print("Recipe NOT found")
end
```

### Verify Item Exists

```lua
local item = getScriptManager():getItem("Base.TreeBranch")
if item then
    print("Item exists: " .. item:getDisplayName())
else
    print("Item NOT found")
end
```

## Testing Multiple Recipes

For mods with many recipes:

1. **Test one at a time** - Add recipes incrementally
2. **Use meaningful names** - Easier to find in menus
3. **Log what you test** - Track what works

## Testing Without Restarting

### Script Changes

Unfortunately, script file changes (`.txt`) require:
- Return to main menu
- Or restart PZ entirely

There's no hot reload for scripts.

### Quick Restart Method

1. Make script changes
2. In-game: Press `Esc` > "Quit"
3. Main menu: "Continue" your save
4. Test your changes

## Test Checklist

Before releasing your mod, verify:

- [ ] Recipe appears in correct category
- [ ] All ingredients are consumed/kept correctly
- [ ] Result item is correct
- [ ] Time feels appropriate
- [ ] No errors in console.txt
- [ ] Works with a fresh save (not just test save)
- [ ] Works with mod enabled from game start

## Key Takeaways

1. **Debug mode is essential** - Use `-debug` launch option
2. **Spawn ingredients with console** - `getPlayer():getInventory():AddItem()`
3. **Check console.txt** - It tells you exactly what's wrong
4. **Script changes need restart** - No hot reload for .txt files
5. **Test incrementally** - Add recipes one at a time 