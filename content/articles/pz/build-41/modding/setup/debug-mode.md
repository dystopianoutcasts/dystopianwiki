---
id: setup-debug-mode
slug: debug-mode
title: "Debug Mode"
game: pz
version: build-41
section: modding
category: setup
subcategory: null
difficulty: beginner
tags:
  - beginner
  - setup
  - debug
  - testing
  - console
  - developer
excerpt: "Enable Project Zomboid's debug mode to access powerful testing tools: spawn items, hot reload Lua, read error messages, and test your mods efficiently."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Enabling Debug Mode"
    link: "#enabling-debug-mode"
  - text: "Confirming Debug Mode"
    link: "#confirming-debug-mode"
  - text: "The Debug Console"
    link: "#the-debug-console"
  - text: "Debug Menu (F11)"
    link: "#debug-menu-f11"
  - text: "Hot Reloading Lua"
    link: "#hot-reloading-lua"
  - text: "Reading Error Messages"
    link: "#reading-error-messages"
  - text: "The Console Log File"
    link: "#the-console-log-file"
  - text: "Debug Print Statements"
    link: "#debug-print-statements"
  - text: "Testing Workflow"
    link: "#testing-workflow"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "AI Tools for Modding"
    path: /build-41/modding/ai-assisted/ai-for-modding
  - title: "Anatomy of a Recipe"
    path: /build-41/modding/recipes/recipe-anatomy
last_updated: 2026-01-09
---

# Debug Mode

## What Is Debug Mode?

You know that moment when your mod crashes the game, and you have no idea why? Or when you need to test a new recipe but don't want to spend 20 minutes gathering ingredients? Or when you change one line of Lua code and have to restart the entire game just to see if it worked?

**Debug mode solves all of these problems.** It's a special game mode that unlocks powerful testing tools: spawn any item instantly, see detailed error messages with line numbers, reload Lua scripts without restarting, teleport anywhere, and become invincible while testing. Without debug mode, mod development would take 10 times longer.

When I first started modding, I didn't know debug mode existed. I was restarting the game every single time I changed one line of code. It took 2-3 minutes per restart. I was testing a simple recipe that required 50 attempts to get right. That's over 2 hours of just waiting for the game to restart. Then someone told me about debug mode and hot reloading - I could test changes in seconds instead of minutes. It changed everything.

**This guide will show you how to enable debug mode, use the console to spawn items and reload scripts, read error messages to fix bugs faster, and set up an efficient testing workflow.** By the end, you'll wonder how you ever developed mods without it.

## Overview

Debug mode unlocks powerful testing tools in Project Zomboid. You can spawn items, teleport, see detailed error messages, and reload Lua scripts without restarting the game. Essential for mod development.

## Enabling Debug Mode

### Method 1: Launch Option (Recommended)

**Steam:**
1. Right-click Project Zomboid in Steam library
2. Select "Properties"
3. In "Launch Options" field, add: `-debug`
4. Close and launch the game

**GOG:**
1. Right-click the game shortcut
2. Select "Properties"
3. Add `-debug` to the target path

### Method 2: Debug File

1. Navigate to your PZ installation folder
2. Create a file named `debug` (no extension)
3. Leave it empty
4. Launch the game

**Steam typical path:**
```
<your Steam library>\steamapps\common\ProjectZomboid\debug
```

## Confirming Debug Mode

When debug mode is active, you'll see:
- "DEBUG" watermark in the corner of the screen
- Additional options in the main menu
- The debug console is available (~ key)

## The Debug Console

Press `~` (tilde) to open the Lua console.

### Basic Commands

| Command | What It Does |
|---------|-------------|
| `getPlayer()` | Returns your player object |
| `getPlayer():getInventory():AddItem("Base.Axe")` | Adds an axe to inventory |
| `getPlayer():setGodMod(true)` | Enables god mode |
| `reloadLuaFile("filename.lua")` | Reloads a specific Lua file |

### Spawning Items

```lua
-- Get your player object and add an axe to inventory
getPlayer():getInventory():AddItem("Base.Axe")

-- Add a hammer
getPlayer():getInventory():AddItem("Base.Hammer")

-- Add 5 canned beans (third parameter = quantity)
getPlayer():getInventory():AddItem("Base.CannedBeans", 5)
```

The third parameter is quantity. If omitted, it defaults to 1.

### Testing Your Mod's Items

If your mod adds `MyMod.CustomSword`:

```lua
-- Spawn your custom item using: ModuleName.ItemID
getPlayer():getInventory():AddItem("MyMod.CustomSword")
```

**Format:** `ModuleName.ItemID` where:
- `ModuleName` = The module name from your item script (`module MyMod`)
- `ItemID` = The item name from your item script (`item CustomSword`)

## Debug Menu (F11)

Press `F11` to access the debug menu. Key panels:

### General Debug
- **God Mode** - Invincibility
- **Invisible** - Zombies ignore you
- **Unlimited Carry** - No weight limit
- **Time Controls** - Speed up/slow down time

### Spawn Panel
- Search and spawn any item
- Spawn vehicles
- Spawn zombies
- Set item condition

### Character Panel
- Set skills to any level
- Add/remove traits
- Modify stats (hunger, thirst, etc.)

### Map Panel
- Teleport to coordinates
- Reveal full map
- Show chunk borders

## Hot Reloading Lua

The most useful feature for modders: reload Lua files without restarting.

### From Console

```lua
-- Reload a specific Lua file (path relative to media/lua/)
reloadLuaFile("client/MyMod/MyScript.lua")
```

**Path structure:** Relative to your mod's `media/lua/` folder.

**Example:** If your file is at:
```
MyMod/media/lua/client/MyMod/MyScript.lua
```

You would use:
```lua
reloadLuaFile("client/MyMod/MyScript.lua")
```

### From Debug Menu

1. Press F11
2. Go to "Lua" tab
3. Click "Reload Lua" 
4. Select specific files or reload all

**Note:** Hot reloading works for Lua only. Script files (.txt) require a game restart.

## Reading Error Messages

With debug mode enabled, errors appear in the console.

### Example Error

```
ERROR: General, 1234567890> ExceptionLogger.logException> Exception thrown 
java.lang.RuntimeException: attempted index of nil value 'item'
    at KahluaThread.lua:123
    at MyMod/MyScript.lua:45
```

**Reading this:**
- Error type: `attempted index of nil value 'item'`
- Location: `MyMod/MyScript.lua` line 45
- The variable `item` was nil when you tried to use it

### Common Errors

| Error | Meaning | Fix |
|-------|---------|-----|
| `attempted index of nil value` | Variable is nil | Check if object exists before using |
| `attempt to call a nil value` | Function doesn't exist | Check function name spelling |
| `unexpected symbol near` | Syntax error | Check for missing commas, brackets |
| `module not found` | File path wrong | Verify require() path |

## The Console Log File

All console output is saved to:

```
%UserProfile%\Zomboid\console.txt
```

Open this file to see:
- Startup messages
- Mod loading order
- Error messages
- Lua print() output

### Watching the Log Live

Use VS Code or a text editor that auto-refreshes, or use PowerShell:

```powershell
# Watch the last 50 lines of console.txt and auto-refresh when new lines are added
Get-Content "$env:USERPROFILE\Zomboid\console.txt" -Wait -Tail 50
```

**What this does:**
- `-Wait` keeps the command running and shows new lines as they're added
- `-Tail 50` shows only the last 50 lines (prevents overwhelming output)
- `$env:USERPROFILE` expands to your Windows user folder (e.g., `C:\Users\YourName`)

## Debug Print Statements

Add debugging output to your Lua:

```lua
function MyFunction()
    -- Always print when function starts (confirms it's being called)
    print("MyFunction started")

    -- Get the item in player's primary hand
    local item = getPlayer():getPrimaryHandItem()

    -- Print the item object (use tostring() for objects that might be nil)
    print("Primary item: " .. tostring(item))

    -- Check if item exists before accessing its methods
    if item then
        -- Print the item's type (safe because we checked for nil)
        print("Item type: " .. item:getType())
    else
        -- Print when no item is held (helps debug why code isn't working)
        print("No item in hand")
    end
end
```

**Where `print()` output appears:**
- The ~ console (live output)
- The `console.txt` file (permanent record)

**Pro tip:** Always use `tostring()` when printing objects that might be nil. `print("Item: " .. item)` will crash if `item` is nil, but `print("Item: " .. tostring(item))` will print "Item: nil" safely.

## Testing Workflow

### For Lua Changes

1. Make changes in VS Code
2. Save the file
3. In-game, open console (~)
4. Type `reloadLuaFile("client/path/to/file.lua")`
5. Test your changes

### For Script Changes (.txt)

1. Make changes in VS Code
2. Save the file
3. Quit to main menu
4. "Continue" or start new game
5. Test your changes

### For mod.info Changes

1. Make changes
2. Completely restart PZ
3. Re-enable mod if needed

## Common Mistakes

### 1. Forgetting to Enable Debug Mode

❌ **Wrong:**
```
Launch game normally, press ~ key, nothing happens
```

✅ **Right:**
```
1. Add -debug to Steam launch options
2. Restart the game
3. Look for "DEBUG" watermark in corner
4. Press ~ to open console
```

**Why:** Debug mode must be explicitly enabled. The ~ key does nothing without `-debug` flag.

---

### 2. Using Wrong Path in reloadLuaFile()

❌ **Wrong:**
```lua
-- Using absolute path or including "media/lua/"
reloadLuaFile("C:/MyMod/media/lua/client/MyMod/MyScript.lua")
reloadLuaFile("media/lua/client/MyMod/MyScript.lua")
```

✅ **Right:**
```lua
-- Path relative to media/lua/ folder
reloadLuaFile("client/MyMod/MyScript.lua")
```

**Why:** `reloadLuaFile()` expects a path relative to `media/lua/`, not an absolute path.

---

### 3. Trying to Hot Reload Script Files (.txt)

❌ **Wrong:**
```lua
-- Trying to reload item script
reloadLuaFile("scripts/items.txt")
```

✅ **Right:**
```
1. Make changes to .txt script file
2. Quit to main menu
3. Start/continue game (reloads all scripts)
```

**Why:** Hot reloading only works for Lua files (.lua). Script files (.txt) require returning to main menu.

---

### 4. Not Using tostring() When Printing Objects

❌ **Wrong:**
```lua
local item = getPlayer():getPrimaryHandItem()
print("Item: " .. item)  -- CRASHES if item is nil!
```

✅ **Right:**
```lua
local item = getPlayer():getPrimaryHandItem()
print("Item: " .. tostring(item))  -- Safely prints "nil" if no item
```

**Why:** Lua's `..` concatenation operator crashes when trying to concatenate nil. `tostring()` converts nil to the string "nil".

---

### 5. Missing the Error Location in Console

❌ **Wrong:**
```
"There's an error somewhere in my mod, but I don't know where"
(Didn't read the stack trace)
```

✅ **Right:**
```
ERROR: MyMod/MyScript.lua:45
       ^ This tells you exactly: file name and line number
```

**Why:** Error messages include file paths and line numbers. Always read the stack trace to find the exact location.

---

## Try It Yourself

### Exercise 1: Spawn Items and Test Recipe

**Goal:** Use debug console to test a recipe without gathering ingredients.

**Steps:**
1. Enable debug mode and launch the game
2. Press `~` to open console
3. Spawn recipe ingredients:
   ```lua
   getPlayer():getInventory():AddItem("Base.Axe")
   getPlayer():getInventory():AddItem("Base.Plank", 3)
   getPlayer():getInventory():AddItem("Base.Nails", 10)
   ```
4. Open crafting menu and verify recipe appears

<details>
<summary><strong>Solution</strong></summary>

**Complete workflow:**
```lua
-- Open console (~)
getPlayer():getInventory():AddItem("Base.Axe")
getPlayer():getInventory():AddItem("Base.Plank", 3)
getPlayer():getInventory():AddItem("Base.Nails", 10)
```

**Verification:**
- Press `B` to open crafting menu
- Check if "Wooden Spear" appears in crafting list
- Recipe should be craftable with ingredients in inventory

**This is faster than:**
- Finding an axe (5 minutes)
- Chopping trees (2 minutes)
- Finding nails (10 minutes)
- **Total saved: ~17 minutes per test**
</details>

---

### Exercise 2: Hot Reload Lua After Making Changes

**Goal:** Change Lua code and reload without restarting the game.

**Setup:**
Create a simple test mod at `MyTestMod/media/lua/client/test.lua`:
```lua
function TestFunction()
    print("Version 1")
end

Events.OnGameStart.Add(TestFunction)
```

**Steps:**
1. Start game with mod enabled, see "Version 1" in console
2. Edit file to print "Version 2"
3. In-game, open console (~)
4. Type: `reloadLuaFile("client/test.lua")`
5. Trigger function again (or restart game event)

<details>
<summary><strong>Solution</strong></summary>

**Full workflow:**

1. **Initial version:**
```lua
function TestFunction()
    print("Version 1")
end
Events.OnGameStart.Add(TestFunction)
```

2. **Make change:**
```lua
function TestFunction()
    print("Version 2 - Changed!")
end
Events.OnGameStart.Add(TestFunction)
```

3. **Hot reload in console:**
```lua
reloadLuaFile("client/test.lua")
```

4. **Test by manually calling function:**
```lua
TestFunction()  -- Should print "Version 2 - Changed!"
```

**Result:** No game restart needed. Changes applied immediately.
</details>

---

### Exercise 3: Debug a Nil Error

**Goal:** Use print statements to find why a variable is nil.

**Buggy code:**
```lua
function GetItemWeight()
    local player = getPlayer()
    local item = player:getPrimaryHandItem()
    local weight = item:getActualWeight()  -- Crashes here!
    print("Weight: " .. weight)
end
```

**Task:** Add print statements to debug why it crashes.

<details>
<summary><strong>Solution</strong></summary>

**Fixed code with debug prints:**
```lua
function GetItemWeight()
    -- Print when function starts
    print("GetItemWeight() called")

    -- Get player and verify
    local player = getPlayer()
    print("Player object: " .. tostring(player))

    -- Get primary hand item and verify
    local item = player:getPrimaryHandItem()
    print("Primary item: " .. tostring(item))

    -- Check if item exists before accessing methods
    if not item then
        print("ERROR: No item in primary hand!")
        return nil
    end

    -- Now safe to get weight
    local weight = item:getActualWeight()
    print("Weight: " .. tostring(weight))

    return weight
end
```

**What the prints reveal:**
```
GetItemWeight() called
Player object: IsoPlayer
Primary item: nil              <- Found the problem!
ERROR: No item in primary hand!
```

**The bug:** Function assumes player is always holding an item. The fix is to check `if not item then return nil end` before accessing `item:getActualWeight()`.
</details>

---

## Best Practices

1. **Always enable debug mode during development** - The time saved from hot reloading and spawning items far outweighs the setup time. Never develop without it.

2. **Use print() liberally when debugging** - Add print statements at the start of every function, before important operations, and after calculations. Remove them once code works.

3. **Watch console.txt in a second monitor or window** - Use a text editor with auto-refresh or the PowerShell command. You'll catch errors immediately instead of discovering them later.

4. **Hot reload after every Lua change** - Get in the habit: Save file → Switch to game → Open console → `reloadLuaFile()` → Test immediately. Makes iteration 10x faster.

5. **Use god mode and unlimited carry during testing** - Press F11, enable "God Mode" and "Unlimited Carry". Prevents dying or being encumbered while testing your mod.

6. **Learn common error patterns** - "attempted index of nil value" = forgot to check for nil. "attempt to call a nil value" = function doesn't exist or typo. These appear constantly.

7. **Keep a spawning cheat sheet** - Create a text file with common spawn commands for your mod's items. Copy-paste them into console instead of typing each time.

---

## Key Takeaways

1. **Enable with `-debug`** launch option (Steam Properties → Launch Options) or create empty `debug` file in install folder
2. **Press ~ for console** - spawn items instantly, run Lua commands, check for errors
3. **Press F11 for debug menu** - god mode, unlimited carry, teleport, item/zombie spawning GUI
4. **Hot reload Lua** with `reloadLuaFile("path/to/file.lua")` - test changes in seconds, no restart needed
5. **Script files (.txt) require main menu reload** - quit to menu and continue to reload item/recipe scripts
6. **Check console.txt** at `%UserProfile%\Zomboid\console.txt` for full error messages and print output
7. **Always use tostring()** when printing objects that might be nil - prevents crashes in debug code
8. **Debug workflow is: Edit → Save → Hot reload → Test** - with practice, this takes 5-10 seconds per iteration
