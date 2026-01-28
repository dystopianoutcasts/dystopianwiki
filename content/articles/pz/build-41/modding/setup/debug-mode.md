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
C:\Program Files (x86)\Steam\steamapps\common\ProjectZomboid\debug
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

## Key Takeaways

1. **Enable with `-debug`** launch option or debug file
2. **Press ~ for console** - spawn items, run Lua commands
3. **Press F11 for debug menu** - god mode, teleport, spawning
4. **Hot reload Lua** with `reloadLuaFile()` - no restart needed
5. **Check console.txt** for error messages and logs
