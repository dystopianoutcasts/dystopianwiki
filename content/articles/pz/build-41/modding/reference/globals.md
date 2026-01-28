---
id: reference-globals
slug: globals
title: "Global Functions Reference"
game: pz
version: build-41
section: modding
category: reference
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - lua
  - globals
  - api
  - reference
  - functions
excerpt: "Complete reference of global functions available in Project Zomboid Lua scripting, including player, world, time, and utility functions."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Player Functions"
    link: "#player-functions"
  - text: "World Functions"
    link: "#world-functions"
  - text: "Time Functions"
    link: "#time-functions"
  - text: "Core Functions"
    link: "#core-functions"
  - text: "Script Functions"
    link: "#script-functions"
  - text: "Text and Localization"
    link: "#text-and-localization"
  - text: "Texture Functions"
    link: "#texture-functions"
  - text: "Random Functions"
    link: "#random-functions"
  - text: "Type Checking"
    link: "#type-checking"
  - text: "Utility Functions"
    link: "#utility-functions"
  - text: "LuaUtils Functions"
    link: "#luautils-functions"
  - text: "Inventory Functions"
    link: "#inventory-functions"
  - text: "Sound Functions"
    link: "#sound-functions"
  - text: "Network Functions (Multiplayer)"
    link: "#network-functions-multiplayer"
  - text: "Debug Functions"
    link: "#debug-functions"
  - text: "Quick Reference Table"
    link: "#quick-reference-table"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-09
---

# Global Functions Reference

## Overview

Global functions are available everywhere in PZ Lua. They provide access to core game systems without needing to import anything.

## Player Functions

### getPlayer()
Returns the local player object (singleplayer or your character in MP).

```lua
local player = getPlayer()
if player then
    print("Player: " .. player:getUsername())
    print("Health: " .. player:getBodyDamage():getOverallBodyHealth())
end
```
**Returns:** `IsoPlayer` or `nil`

### getSpecificPlayer(index)
Returns a specific player by index (0-3 for splitscreen).

```lua
local player = getSpecificPlayer(0)  -- First player
local player2 = getSpecificPlayer(1) -- Second player (splitscreen)
```
**Parameters:**
- `index` (int) - Player index (0-3)

**Returns:** `IsoPlayer` or `nil`

### getNumActivePlayers()
Returns number of active players (splitscreen).

```lua
local count = getNumActivePlayers()
for i = 0, count - 1 do
    local player = getSpecificPlayer(i)
    -- Handle each player
end
```
**Returns:** `int`

---

## World Functions

### getWorld()
Returns the game world object.

```lua
local world = getWorld()
local weather = world:getWeather()
local month = getGameTime():getMonth()
```
**Returns:** `IsoWorld`

### getCell()
Returns the current cell (loaded area).

```lua
local cell = getCell()
local square = cell:getGridSquare(x, y, z)
```
**Returns:** `IsoCell`

### getSquare(x, y, z)
Gets a specific grid square by coordinates.

```lua
local square = getSquare(5000, 5000, 0)
if square then
    local objects = square:getObjects()
    -- Do something with objects
end
```
**Parameters:**
- `x` (int) - World X coordinate
- `y` (int) - World Y coordinate
- `z` (int) - Floor level (0 = ground)

**Returns:** `IsoGridSquare` or `nil`

---

## Time Functions

### getGameTime()
Returns game time manager.

```lua
local gt = getGameTime()
print("Day: " .. gt:getNightsSurvived())
print("Month: " .. gt:getMonth())
print("Hour: " .. gt:getTimeOfDay())
print("Minute: " .. gt:getMinutes())
```
**Returns:** `GameTime`

**Common GameTime Methods:**
```lua
gt:getNightsSurvived()  -- Days survived
gt:getMonth()           -- Current month (0-11)
gt:getDay()             -- Day of month
gt:getYear()            -- Current year
gt:getTimeOfDay()       -- Hour (0-23)
gt:getMinutes()         -- Minutes (0-59)
gt:getWorldAgeHours()   -- Total hours played
```

---

## Core Functions

### getCore()
Returns the game core settings.

```lua
local core = getCore()
print("Debug: " .. tostring(core:getDebug()))
print("Game Mode: " .. core:getGameMode())
```
**Returns:** `Core`

**Common Core Methods:**
```lua
core:getDebug()         -- Is debug mode on?
core:getGameMode()      -- "Sandbox", "Survival", etc.
core:getScreenWidth()   -- Screen width
core:getScreenHeight()  -- Screen height
core:getZoom(0)         -- Current zoom level
```

### getSandboxOptions()
Returns sandbox settings.

```lua
local sandbox = getSandboxOptions()
local zombieLore = sandbox:getZombieLore()
print("Zombie Speed: " .. tostring(zombieLore:getSpeed()))
```
**Returns:** `SandboxOptions`

---

## Script Functions

### getScriptManager()
Returns the script manager for item/recipe definitions.

```lua
local sm = getScriptManager()

-- Get item definition
local itemScript = sm:getItem("Base.Hammer")
if itemScript then
    print("Display Name: " .. itemScript:getDisplayName())
end

-- Get recipe definition
local recipeScript = sm:getRecipe("Make Plank")
if recipeScript then
    print("Recipe Time: " .. recipeScript:getTime())
end
```
**Returns:** `ScriptManager`

**Common ScriptManager Methods:**
```lua
sm:getItem("Base.ItemName")     -- Get item script
sm:getRecipe("Recipe Name")     -- Get recipe script
sm:getAllItems()                -- Get all items
sm:getAllRecipes()              -- Get all recipes
```

---

## Text and Localization

### getText(key)
Returns translated text from translation files.

```lua
local text = getText("UI_Yes")  -- "Yes"
local msg = getText("IGUI_PlayerText_Dead")  -- "Dead"
```
**Parameters:**
- `key` (string) - Translation key

**Returns:** `string`

### getTextOrNull(key)
Like getText but returns nil if not found (instead of key).

```lua
local text = getTextOrNull("Custom_Key")
if text then
    print(text)
else
    print("Key not found")
end
```

---

## Texture Functions

### getTexture(path)
Loads a texture from path.

```lua
local tex = getTexture("media/ui/Container_Desktop.png")
if tex then
    local width = tex:getWidth()
    local height = tex:getHeight()
end
```
**Parameters:**
- `path` (string) - Texture path relative to game root

**Returns:** `Texture` or `nil`

---

## Random Functions

### ZombRand(max)
Returns random int from 0 to max-1.

```lua
local roll = ZombRand(100)  -- 0-99
local diceRoll = ZombRand(6) + 1  -- 1-6
```
**Parameters:**
- `max` (int) - Upper bound (exclusive)

**Returns:** `int`

### ZombRand(min, max)
Returns random int from min to max-1.

```lua
local damage = ZombRand(10, 20)  -- 10-19
```
**Parameters:**
- `min` (int) - Lower bound (inclusive)
- `max` (int) - Upper bound (exclusive)

**Returns:** `int`

### ZombRandFloat(min, max)
Returns random float between min and max.

```lua
local multiplier = ZombRandFloat(0.8, 1.2)
local damage = baseDamage * multiplier
```
**Parameters:**
- `min` (float) - Lower bound
- `max` (float) - Upper bound

**Returns:** `float`

---

## Type Checking

### instanceof(obj, className)
Checks if object is instance of class.

```lua
if instanceof(item, "Food") then
    print("This is food!")
end

if instanceof(object, "IsoZombie") then
    print("This is a zombie!")
end

if instanceof(object, "IsoPlayer") then
    print("This is a player!")
end
```
**Parameters:**
- `obj` - Object to check
- `className` (string) - Class name to check against

**Returns:** `boolean`

**Common Class Names:**
```
IsoPlayer       - Player character
IsoZombie       - Zombie
IsoSurvivor     - NPC survivor
IsoGameCharacter - Any character
IsoObject       - Any world object
IsoThumpable    - Player-built object
IsoWindow       - Window
IsoDoor         - Door
InventoryItem   - Any item
Food            - Food item
HandWeapon      - Weapon
Clothing        - Clothing item
DrainableComboItem - Drainable item
```

---

## Utility Functions

### print(message)
Prints to console.txt log.

```lua
print("Debug: Something happened")
print("Value: " .. tostring(someValue))
```

### require(module)
Loads and returns a Lua module.

```lua
local MyModule = require("MyMod/MyModule")
MyModule.doSomething()
```

### tostring(value)
Converts value to string.

```lua
local str = tostring(123)  -- "123"
local str2 = tostring(true)  -- "true"
```

### tonumber(str)
Converts string to number.

```lua
local num = tonumber("123")  -- 123
local float = tonumber("3.14")  -- 3.14
```

### type(value)
Returns the type of a value.

```lua
print(type(123))       -- "number"
print(type("hello"))   -- "string"
print(type({}))        -- "table"
print(type(nil))       -- "nil"
print(type(function() end))  -- "function"
```

---

## LuaUtils Functions

The `luautils` table provides utility functions.

### luautils.split(str, sep)
Splits string by separator.

```lua
local parts = luautils.split("a,b,c", ",")
-- parts = {"a", "b", "c"}
```

### luautils.stringStarts(str, prefix)
Checks if string starts with prefix.

```lua
if luautils.stringStarts("Hello World", "Hello") then
    print("Starts with Hello!")
end
```

### luautils.stringEnds(str, suffix)
Checks if string ends with suffix.

```lua
if luautils.stringEnds("file.txt", ".txt") then
    print("Is a text file!")
end
```

### luautils.walkAdj(player, square)
Makes player walk to adjacent square.

```lua
local targetSquare = getSquare(x, y, z)
luautils.walkAdj(player, targetSquare)
```

### luautils.equipItems(player, item)
Equips item properly.

```lua
luautils.equipItems(player, weapon)
```

---

## Inventory Functions

### getPlayerInventory(playerIndex)
Gets player's main inventory.

```lua
local inv = getPlayer():getInventory()

-- Add item
inv:AddItem("Base.Hammer")

-- Check for item
if inv:contains("Base.Hammer") then
    print("Has hammer!")
end

-- Get item
local item = inv:getFirstType("Base.Hammer")

-- Remove item
if item then
    inv:Remove(item)
end
```

**Common Inventory Methods:**
```lua
inv:AddItem("Module.ItemID")    -- Add item by full ID
inv:contains("Module.ItemID")   -- Check if has item
inv:getFirstType("Module.ItemID")  -- Get first matching item
inv:getFirstTypeRecurse("Module.ItemID")  -- Search containers too
inv:getItemCount("Module.ItemID")  -- Count items
inv:Remove(item)                -- Remove specific item
inv:getItems()                  -- Get all items (ArrayList)
inv:getCapacity()               -- Max capacity
inv:getCapacityWeight()         -- Current weight
```

---

## Sound Functions

### getSoundManager()
Returns the sound manager.

```lua
local soundManager = getSoundManager()
soundManager:PlayWorldSound("ZombieEating", square, 0, 10, 1, false)
```

### Common Sound Usage

```lua
-- Play UI sound
getSoundManager():PlayUISound("UIActivate")

-- Play world sound at location
local square = player:getCurrentSquare()
getSoundManager():PlayWorldSound("HammerNail", square, 0, 15, 1, false)
```

---

## Network Functions (Multiplayer)

### isClient()
Returns true if running as client.

```lua
if isClient() then
    print("This is a multiplayer client")
end
```

### isServer()
Returns true if running as server.

```lua
if isServer() then
    print("This is the server")
end
```

### isCoopHost()
Returns true if hosting a co-op game.

```lua
if isCoopHost() then
    print("Hosting co-op")
end
```

### isSinglePlayer()
Returns true if singleplayer.

```lua
if isSinglePlayer() then
    print("Singleplayer game")
end
```

### sendClientCommand(module, command, args)
Sends command from client to server.

```lua
if isClient() then
    sendClientCommand("MyMod", "DoSomething", {data = 123})
end
```

### sendServerCommand(player, module, command, args)
Sends command from server to client.

```lua
if isServer() then
    sendServerCommand(player, "MyMod", "UpdateData", {value = 456})
end
```

---

## Debug Functions

Only available when debug mode is enabled.

### isDebugEnabled()
Returns true if debug mode is on.

```lua
if isDebugEnabled() then
    print("Debug mode active")
end
```

### isAdmin()
Returns true if player is admin.

```lua
if isAdmin() then
    print("Player is admin")
end
```

---

## Quick Reference Table

| Function | Returns | Description |
|----------|---------|-------------|
| `getPlayer()` | IsoPlayer | Local player |
| `getSpecificPlayer(i)` | IsoPlayer | Player by index |
| `getWorld()` | IsoWorld | Game world |
| `getCell()` | IsoCell | Current cell |
| `getSquare(x,y,z)` | IsoGridSquare | Grid square |
| `getGameTime()` | GameTime | Time manager |
| `getCore()` | Core | Game settings |
| `getSandboxOptions()` | SandboxOptions | Sandbox settings |
| `getScriptManager()` | ScriptManager | Item/recipe scripts |
| `getText(key)` | string | Translated text |
| `getTexture(path)` | Texture | Load texture |
| `ZombRand(max)` | int | Random 0 to max-1 |
| `ZombRandFloat(min,max)` | float | Random float |
| `instanceof(obj,class)` | boolean | Type check |
| `isClient()` | boolean | Is MP client |
| `isServer()` | boolean | Is MP server |
| `isSinglePlayer()` | boolean | Is singleplayer |

## Related

- [Events Reference](/build-41/modding/reference/events) - Game events
- [Script Properties](/build-41/modding/reference/script-properties) - Item/recipe properties
