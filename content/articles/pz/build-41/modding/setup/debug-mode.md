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
getPlayer():getInventory():AddItem("Base.Axe")
getPlayer():getInventory():AddItem("Base.Hammer")
getPlayer():getInventory():AddItem("Base.CannedBeans", 5)
```

The third parameter is quantity.

### Testing Your Mod's Items

If your mod adds `MyMod.CustomSword`:

```lua
getPlayer():getInventory():AddItem("MyMod.CustomSword")
```

Use your module name and item ID from your script files.

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
reloadLuaFile("client/MyMod/MyScript.lua")
```

Path is relative to your mod's `media/lua/` folder.

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
Get-Content "$env:USERPROFILE\Zomboid\console.txt" -Wait -Tail 50
```

## Debug Print Statements

Add debugging output to your Lua:

```lua
function MyFunction()
    print("MyFunction started")
    
    local item = getPlayer():getPrimaryHandItem()
    print("Primary item: " .. tostring(item))
    
    if item then
        print("Item type: " .. item:getType())
    else
        print("No item in hand")
    end
end
```

`print()` output appears in:
- The ~ console
- The console.txt file

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
