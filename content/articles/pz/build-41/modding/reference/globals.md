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
  - text: "What Are Global Functions?"
    link: "#what-are-global-functions"
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
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Best Practices"
    link: "#best-practices"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "Quick Reference Table"
    link: "#quick-reference-table"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-09
---

# Global Functions Reference

## What Are Global Functions?

You know when you write `getPlayer()` or `ZombRand(100)` in your mod without importing anything and it just works? Those are **global functions** - built-in functions that are available everywhere in your Lua scripts without any setup.

**Global functions are your instant toolkit.** They're the functions Project Zomboid provides out of the box for accessing players, world data, game time, random numbers, and core game systems. Every mod uses them. They're how you interact with the game.

When I first started modding, I saw experienced modders using `getPlayer()`, `getGameTime()`, `ZombRand()` and I wondered "where do these come from?" I searched for import statements, required modules - nothing. That's when I learned: these are **globals**. They're always there, ready to use. No imports, no setup, just call them.

This is your complete reference for every global function Project Zomboid provides. Think of this as your API quick reference - the functions you'll use in literally every mod you write.

---

## Overview

Global functions are available everywhere in PZ Lua. They provide access to core game systems without needing to import anything.

**What globals give you:**
- **Player access** - `getPlayer()`, `getSpecificPlayer(i)`
- **World access** - `getWorld()`, `getCell()`, `getSquare(x,y,z)`
- **Time access** - `getGameTime()`
- **Random numbers** - `ZombRand()`, `ZombRandFloat()`
- **Type checking** - `instanceof(obj, "ClassName")`
- **Core systems** - Script manager, sound manager, sandbox options
- **Utility functions** - String manipulation, inventory helpers, network checks

**How to use this reference:** This is organized by function category. Use the table of contents to jump to what you need, or scroll through to learn what's available.

---

## Player Functions

### getPlayer()

Returns the local player object (singleplayer or your character in MP).

```lua
local player = getPlayer()                  -- Get the player
if player then                              -- Always check for nil!
    print("Player: " .. player:getUsername())  -- Get player name
    print("Health: " .. player:getBodyDamage():getOverallBodyHealth())  -- Get health
end
```

**Returns:** `IsoPlayer` or `nil`

**When it returns nil:** During game startup before player spawns, or in some server-side contexts.

**Most common use:** Every mod that does anything with the player starts with `local player = getPlayer()`.

---

### getSpecificPlayer(index)

Returns a specific player by index (0-3 for splitscreen).

```lua
local player = getSpecificPlayer(0)         -- First player (same as getPlayer())
local player2 = getSpecificPlayer(1)        -- Second player (splitscreen)
```

**Parameters:**
- `index` (int) - Player index (0-3)

**Returns:** `IsoPlayer` or `nil`

**Use case:** Splitscreen support. In singleplayer, only index 0 exists.

---

### getNumActivePlayers()

Returns number of active players (splitscreen).

```lua
local count = getNumActivePlayers()         -- Get number of active players
for i = 0, count - 1 do                     -- Loop through all players
    local player = getSpecificPlayer(i)     -- Get each player
    if player then                          -- Check if player exists
        -- Handle each player
        print("Player " .. i .. ": " .. player:getUsername())
    end
end
```

**Returns:** `int`

**Use case:** Supporting splitscreen multiplayer (local co-op).

---

## World Functions

### getWorld()

Returns the game world object.

```lua
local world = getWorld()                    -- Get the world object
local weather = world:getWeather()          -- Access weather system
local month = getGameTime():getMonth()      -- Get current month
```

**Returns:** `IsoWorld`

**Common uses:**
- `world:getWeather()` - Weather system
- `world:getAllTiles()` - All loaded tiles
- `world:getMap()` - Map data

---

### getCell()

Returns the current cell (loaded area).

```lua
local cell = getCell()                      -- Get the current cell
local square = cell:getGridSquare(x, y, z)  -- Get specific square in cell
```

**Returns:** `IsoCell`

**What is a cell?** The loaded portion of the world around players. Contains all active game objects.

**Common uses:**
- `cell:getGridSquare(x, y, z)` - Get square by coords
- `cell:getZombieList()` - Get all zombies in cell
- `cell:getSurvivorList()` - Get all NPCs in cell

---

### getSquare(x, y, z)

Gets a specific grid square by coordinates.

```lua
local square = getSquare(5000, 5000, 0)     -- Get square at coords
if square then                              -- Check if square exists (loaded)
    local objects = square:getObjects()     -- Get all objects on square
    for i = 0, objects:size() - 1 do        -- Loop through objects
        local obj = objects:get(i)          -- Get each object
        print(obj:getObjectName())          -- Print object name
    end
end
```

**Parameters:**
- `x` (int) - World X coordinate
- `y` (int) - World Y coordinate
- `z` (int) - Floor level (0 = ground, 1 = second floor, etc.)

**Returns:** `IsoGridSquare` or `nil`

**Returns nil when:** Square is not loaded (too far from player) or out of map bounds.

---

## Time Functions

### getGameTime()

Returns game time manager.

```lua
local gt = getGameTime()                    -- Get time manager
print("Day: " .. gt:getNightsSurvived())    -- Days survived
print("Month: " .. gt:getMonth())           -- Current month (0-11)
print("Hour: " .. gt:getTimeOfDay())        -- Hour (0-23)
print("Minute: " .. gt:getMinutes())        -- Minutes (0-59)
```

**Returns:** `GameTime`

**Common GameTime Methods:**
```lua
gt:getNightsSurvived()  -- Days survived (starts at 0)
gt:getMonth()           -- Current month (0 = January, 11 = December)
gt:getDay()             -- Day of month (1-31)
gt:getYear()            -- Current year (starts at 1)
gt:getTimeOfDay()       -- Hour (0-23, where 0 = midnight)
gt:getMinutes()         -- Minutes (0-59)
gt:getWorldAgeHours()   -- Total hours since world creation
```

**Example: Check if it's night**
```lua
local hour = getGameTime():getTimeOfDay()
if hour >= 18 or hour < 6 then              -- After 6pm or before 6am
    print("It's night time")
end
```

---

## Core Functions

### getCore()

Returns the game core settings.

```lua
local core = getCore()                      -- Get core settings
print("Debug: " .. tostring(core:getDebug()))  -- Check if debug mode on
print("Game Mode: " .. core:getGameMode())  -- Get game mode
```

**Returns:** `Core`

**Common Core Methods:**
```lua
core:getDebug()         -- Is debug mode enabled? (boolean)
core:getGameMode()      -- "Sandbox", "Survival", "Apocalypse", etc.
core:getScreenWidth()   -- Screen width in pixels
core:getScreenHeight()  -- Screen height in pixels
core:getZoom(0)         -- Current zoom level for player 0
```

---

### getSandboxOptions()

Returns sandbox settings.

```lua
local sandbox = getSandboxOptions()         -- Get sandbox settings
local zombieLore = sandbox:getZombieLore()  -- Get zombie settings
print("Zombie Speed: " .. tostring(zombieLore:getSpeed()))  -- 1=Sprinters, 2=Fast Shamblers, 3=Shamblers
```

**Returns:** `SandboxOptions`

**Common uses:**
- `sandbox:getZombieLore()` - Zombie behavior settings
- `sandbox:getOptionByName("OptionName")` - Get specific sandbox option
- Check game difficulty settings

---

## Script Functions

### getScriptManager()

Returns the script manager for item/recipe definitions.

```lua
local sm = getScriptManager()               -- Get script manager

-- Get item definition
local itemScript = sm:getItem("Base.Hammer")  -- Get Hammer item script
if itemScript then                          -- Check if item exists
    print("Display Name: " .. itemScript:getDisplayName())  -- Get translated name
    print("Weight: " .. itemScript:getWeight())  -- Get weight
end

-- Get recipe definition
local recipeScript = sm:getRecipe("Make Plank")  -- Get recipe by name
if recipeScript then                        -- Check if recipe exists
    print("Recipe Time: " .. recipeScript:getTime())  -- Get crafting time
end
```

**Returns:** `ScriptManager`

**Common ScriptManager Methods:**
```lua
sm:getItem("Base.ItemName")     -- Get item script by full ID
sm:getRecipe("Recipe Name")     -- Get recipe script by exact name
sm:getAllItems()                -- Get ArrayList of all items
sm:getAllRecipes()              -- Get ArrayList of all recipes
```

**Use cases:** Checking if items exist, getting item properties, verifying recipe requirements.

---

## Text and Localization

### getText(key)

Returns translated text from translation files.

```lua
local text = getText("UI_Yes")              -- "Yes" (or translated equivalent)
local msg = getText("IGUI_PlayerText_Dead") -- "Dead" (or translated)
```

**Parameters:**
- `key` (string) - Translation key

**Returns:** `string`

**If key doesn't exist:** Returns the key itself (e.g., "UI_Yes" if not found).

---

### getTextOrNull(key)

Like getText but returns nil if not found (instead of key).

```lua
local text = getTextOrNull("Custom_Key")    -- Get custom translation key
if text then                                -- Check if key exists
    print(text)                             -- Use translated text
else
    print("Key not found")                  -- Fallback
end
```

**Parameters:**
- `key` (string) - Translation key

**Returns:** `string` or `nil`

**Use case:** Checking if translation key exists before using it.

---

## Texture Functions

### getTexture(path)

Loads a texture from path.

```lua
local tex = getTexture("media/ui/Container_Desktop.png")  -- Load texture
if tex then                                 -- Check if texture loaded
    local width = tex:getWidth()            -- Get width in pixels
    local height = tex:getHeight()          -- Get height in pixels
end
```

**Parameters:**
- `path` (string) - Texture path relative to game root or mod folder

**Returns:** `Texture` or `nil`

**Returns nil when:** File doesn't exist or path is invalid.

---

## Random Functions

### ZombRand(max)

Returns random int from 0 to max-1.

```lua
local roll = ZombRand(100)                  -- Random from 0-99
local diceRoll = ZombRand(6) + 1            -- Random from 1-6 (dice roll)
```

**Parameters:**
- `max` (int) - Upper bound (exclusive)

**Returns:** `int`

**Important:** Max is **exclusive**. `ZombRand(100)` returns 0-99, not 0-100.

---

### ZombRand(min, max)

Returns random int from min to max-1.

```lua
local damage = ZombRand(10, 20)             -- Random from 10-19
```

**Parameters:**
- `min` (int) - Lower bound (inclusive)
- `max` (int) - Upper bound (exclusive)

**Returns:** `int`

---

### ZombRandFloat(min, max)

Returns random float between min and max.

```lua
local multiplier = ZombRandFloat(0.8, 1.2)  -- Random between 0.8 and 1.2
local damage = baseDamage * multiplier      -- Apply random multiplier
```

**Parameters:**
- `min` (float) - Lower bound (inclusive)
- `max` (float) - Upper bound (inclusive)

**Returns:** `float`

---

## Type Checking

### instanceof(obj, className)

Checks if object is instance of class.

```lua
local item = player:getInventory():getFirstType("Base.Apple")
if instanceof(item, "Food") then            -- Is this a Food item?
    print("This is food!")
    print("Hunger: " .. item:getHungerChange())
end

local obj = square:getObjects():get(0)
if instanceof(obj, "IsoZombie") then        -- Is this a zombie?
    print("This is a zombie!")
end

if instanceof(obj, "IsoPlayer") then        -- Is this a player?
    print("This is a player!")
end
```

**Parameters:**
- `obj` - Object to check
- `className` (string) - Class name to check against

**Returns:** `boolean`

**Common Class Names:**

**Characters:**
```lua
"IsoPlayer"         -- Player character
"IsoZombie"         -- Zombie
"IsoSurvivor"       -- NPC survivor
"IsoGameCharacter"  -- Any character (player, zombie, NPC)
```

**World Objects:**
```lua
"IsoObject"         -- Any world object
"IsoThumpable"      -- Player-built object
"IsoWindow"         -- Window
"IsoDoor"           -- Door
"IsoBarricade"      -- Barricade
```

**Items:**
```lua
"InventoryItem"     -- Any item (base class)
"Food"              -- Food item
"HandWeapon"        -- Weapon
"Clothing"          -- Clothing item
"DrainableComboItem" -- Drainable item (water bottle, generator, etc.)
"Literature"        -- Book/magazine
"Radio"             -- Radio device
```

---

## Utility Functions

### print(message)

Prints to console.txt log.

```lua
print("Debug: Something happened")          -- Basic log
print("Value: " .. tostring(someValue))     -- Log with value (convert to string)
```

**Where output goes:** `%UserProfile%\Zomboid\console.txt` (Windows) or `~/Zomboid/console.txt` (Linux/Mac).

---

### require(module)

Loads and returns a Lua module.

```lua
local MyModule = require("MyMod/MyModule")  -- Load your module
MyModule.doSomething()                      -- Call module function
```

**Parameters:**
- `module` (string) - Module path (relative to `media/lua/`)

**Use case:** Organizing code into separate files.

---

### tostring(value)

Converts value to string.

```lua
local str = tostring(123)                   -- "123"
local str2 = tostring(true)                 -- "true"
local str3 = tostring(nil)                  -- "nil"
```

**Use case:** Converting numbers/booleans for logging or concatenation.

---

### tonumber(str)

Converts string to number.

```lua
local num = tonumber("123")                 -- 123
local float = tonumber("3.14")              -- 3.14
local bad = tonumber("abc")                 -- nil (invalid number)
```

**Returns:** `number` or `nil` (if string is not a valid number)

---

### type(value)

Returns the type of a value.

```lua
print(type(123))                -- "number"
print(type("hello"))            -- "string"
print(type({}))                 -- "table"
print(type(nil))                -- "nil"
print(type(function() end))     -- "function"
print(type(true))               -- "boolean"
```

**Returns:** `string`

**Use case:** Type checking for validation.

---

## LuaUtils Functions

The `luautils` table provides utility functions.

### luautils.split(str, sep)

Splits string by separator.

```lua
local parts = luautils.split("a,b,c", ",")  -- Split by comma
-- parts = {"a", "b", "c"}

for i, part in ipairs(parts) do             -- Loop through parts
    print(i .. ": " .. part)
end
```

**Parameters:**
- `str` (string) - String to split
- `sep` (string) - Separator character

**Returns:** `table` (array of strings)

---

### luautils.stringStarts(str, prefix)

Checks if string starts with prefix.

```lua
if luautils.stringStarts("Hello World", "Hello") then  -- Check prefix
    print("Starts with Hello!")
end
```

**Parameters:**
- `str` (string) - String to check
- `prefix` (string) - Prefix to check for

**Returns:** `boolean`

---

### luautils.stringEnds(str, suffix)

Checks if string ends with suffix.

```lua
if luautils.stringEnds("file.txt", ".txt") then  -- Check suffix
    print("Is a text file!")
end
```

**Parameters:**
- `str` (string) - String to check
- `suffix` (string) - Suffix to check for

**Returns:** `boolean`

---

### luautils.walkAdj(player, square)

Makes player walk to adjacent square.

```lua
local targetSquare = getSquare(x, y, z)     -- Get target square
luautils.walkAdj(player, targetSquare)      -- Make player walk there
```

**Parameters:**
- `player` (IsoPlayer) - Player to move
- `square` (IsoGridSquare) - Destination square

**Note:** Only works for adjacent squares (one square away).

---

### luautils.equipItems(player, item)

Equips item properly (handles two-handed weapons, clothing slots, etc.).

```lua
local weapon = player:getInventory():getFirstType("Base.Axe")
luautils.equipItems(player, weapon)         -- Equip the axe
```

**Parameters:**
- `player` (IsoPlayer) - Player to equip item
- `item` (InventoryItem) - Item to equip

---

## Inventory Functions

### getPlayerInventory(playerIndex)

Gets player's main inventory (though usually you use `getPlayer():getInventory()` instead).

```lua
local player = getPlayer()                  -- Get player
local inv = player:getInventory()           -- Get player's inventory

-- Add item
inv:AddItem("Base.Hammer")                  -- Add hammer to inventory

-- Check for item
if inv:contains("Base.Hammer") then         -- Check if player has hammer
    print("Has hammer!")
end

-- Get item
local item = inv:getFirstType("Base.Hammer")  -- Get first hammer in inventory

-- Remove item
if item then                                -- Check if item exists
    inv:Remove(item)                        -- Remove it from inventory
end
```

**Common Inventory Methods:**

**Adding/Removing:**
```lua
inv:AddItem("Module.ItemID")                -- Add item by full ID
inv:AddItems("Module.ItemID", count)        -- Add multiple
inv:Remove(item)                            -- Remove specific item
inv:RemoveOneOf("Module.ItemID")            -- Remove one of this type
```

**Searching:**
```lua
inv:contains("Module.ItemID")               -- Check if has item (boolean)
inv:getFirstType("Module.ItemID")           -- Get first matching item
inv:getFirstTypeRecurse("Module.ItemID")    -- Search containers too
inv:getItemCount("Module.ItemID")           -- Count items
inv:getItems()                              -- Get all items (ArrayList)
```

**Capacity:**
```lua
inv:getCapacity()                           -- Max capacity in units
inv:getCapacityWeight()                     -- Current weight in units
inv:getMaxWeight()                          -- Max weight limit
```

---

## Sound Functions

### getSoundManager()

Returns the sound manager.

```lua
local soundManager = getSoundManager()
soundManager:PlayWorldSound("ZombieEating", square, 0, 10, 1, false)
```

**Returns:** `SoundManager`

### Common Sound Usage

```lua
-- Play UI sound (interface clicks, etc.)
getSoundManager():PlayUISound("UIActivate")

-- Play world sound at location
local square = player:getCurrentSquare()
getSoundManager():PlayWorldSound("HammerNail", square, 0, 15, 1, false)
-- Parameters: sound name, square, ???, radius, volume, ???
```

**Common sound names:**
- `"UIActivate"` - UI click
- `"HammerNail"` - Hammering
- `"ZombieEating"` - Zombie eating
- `"MaleBurp"` - Burp sound
- `"PZ_MetalHit"` - Metal impact

---

## Network Functions (Multiplayer)

### isClient()

Returns true if running as client.

```lua
if isClient() then                          -- Are we the client?
    print("This is a multiplayer client")
end
```

**Returns:** `boolean`

---

### isServer()

Returns true if running as server.

```lua
if isServer() then                          -- Are we the server?
    print("This is the server")
end
```

**Returns:** `boolean`

---

### isCoopHost()

Returns true if hosting a co-op game.

```lua
if isCoopHost() then                        -- Are we hosting co-op?
    print("Hosting co-op")
end
```

**Returns:** `boolean`

---

### isSinglePlayer()

Returns true if singleplayer.

```lua
if isSinglePlayer() then                    -- Are we in singleplayer?
    print("Singleplayer game")
end
```

**Returns:** `boolean`

---

### sendClientCommand(module, command, args)

Sends command from client to server.

```lua
if isClient() then                          -- Only on client
    sendClientCommand("MyMod", "DoSomething", {data = 123})  -- Send command to server
end
```

**Parameters:**
- `module` (string) - Your mod name
- `command` (string) - Command name
- `args` (table) - Data to send

**Requires:** Server-side command handler registered with `Events.OnClientCommand.Add()`

---

### sendServerCommand(player, module, command, args)

Sends command from server to specific client.

```lua
if isServer() then                          -- Only on server
    sendServerCommand(player, "MyMod", "UpdateData", {value = 456})  -- Send to specific player
end
```

**Parameters:**
- `player` (IsoPlayer) - Target player
- `module` (string) - Your mod name
- `command` (string) - Command name
- `args` (table) - Data to send

**Requires:** Client-side command handler registered with `Events.OnServerCommand.Add()`

---

## Debug Functions

Only available when debug mode is enabled.

### isDebugEnabled()

Returns true if debug mode is on.

```lua
if isDebugEnabled() then                    -- Is debug mode active?
    print("Debug mode active")
    -- Show extra debug info
end
```

**Returns:** `boolean`

---

### isAdmin()

Returns true if player is admin.

```lua
if isAdmin() then                           -- Is player admin?
    print("Player is admin")
    -- Allow admin commands
end
```

**Returns:** `boolean`

---

## Common Mistakes

### 1. Not Checking for Nil

**Problem:** Calling methods on nil objects crashes your mod.

**Wrong:**
```lua
local player = getPlayer()
print(player:getUsername())                 -- CRASH if player is nil!
```

**Right:**
```lua
local player = getPlayer()
if player then                              -- Always check for nil first
    print(player:getUsername())             -- Safe to use now
end
```

**Why it matters:** During game startup or in some contexts, `getPlayer()` returns nil. Always check!

---

### 2. Wrong ZombRand Bounds

**Problem:** Misunderstanding that max is exclusive.

**Wrong:**
```lua
local damage = ZombRand(10)                 -- Gives 0-9, not 1-10!
```

**Right:**
```lua
local damage = ZombRand(10) + 1             -- Gives 1-10
-- Or use two-parameter form:
local damage = ZombRand(1, 11)              -- Gives 1-10 (max is exclusive)
```

**Rule:** `ZombRand(max)` returns `0` to `max-1`. If you want 1-10, use `ZombRand(10) + 1`.

---

### 3. Incorrect instanceof Usage

**Problem:** Using wrong class names or not storing result.

**Wrong:**
```lua
if instanceof(item, "Apple") then           -- Wrong! "Apple" is not a class name
    -- This will never be true
end
```

**Right:**
```lua
if instanceof(item, "Food") then            -- Right! "Food" is a class name
    print("This is food")
end

-- Or check specific item type:
if item:getFullType() == "Base.Apple" then  -- Check exact item type
    print("This is an apple")
end
```

**Class vs Item:** `instanceof` checks class (Food, Weapon, etc.), not specific item IDs (Apple, Hammer, etc.).

---

### 4. Forgetting Module Prefix in getItem

**Problem:** Not using full item ID with module prefix.

**Wrong:**
```lua
local script = getScriptManager():getItem("Hammer")  -- Returns nil!
```

**Right:**
```lua
local script = getScriptManager():getItem("Base.Hammer")  -- Works!
```

**Rule:** Always use `Module.ItemName` format, not just `ItemName`.

---

### 5. Using getText Without Checking

**Problem:** Assuming all translation keys exist.

**Wrong:**
```lua
local text = getText("MyMod_CustomKey")
-- If key doesn't exist, text = "MyMod_CustomKey" (not helpful!)
```

**Right:**
```lua
local text = getTextOrNull("MyMod_CustomKey")  -- Returns nil if not found
if text then
    -- Use translated text
else
    -- Use fallback
    text = "Default Text"
end
```

**Or provide fallback:**
```lua
local text = getText("MyMod_CustomKey")     -- Gets key if not found
if text == "MyMod_CustomKey" then           -- Check if key was missing
    text = "Default Text"                   -- Use fallback
end
```

---

## Try It Yourself

### Exercise 1: Player Health Monitor

Create a function that checks player health and prints a warning if below 50%:
- Get the player
- Get overall body health (0-100)
- If below 50, print warning with current health
- Handle nil player gracefully

<details>
<summary>Solution</summary>

```lua
function checkPlayerHealth()
    local player = getPlayer()              -- Get player
    if not player then                      -- Check for nil
        print("No player found")
        return
    end

    local bodyDamage = player:getBodyDamage()  -- Get body damage system
    local health = bodyDamage:getOverallBodyHealth()  -- Get health (0-100)

    if health < 50 then                     -- Check if below 50%
        print("WARNING: Low health! Current: " .. health)
    end
end
```

**Key points:**
- Always check player for nil
- Use `getBodyDamage()` to access health system
- Health is 0-100 scale
</details>

---

### Exercise 2: Time-Based Event

Create a function that checks if it's between 9am and 5pm (daytime working hours):
- Get game time
- Get current hour
- Return true if between 9am and 5pm
- Print whether it's working hours or not

<details>
<summary>Solution</summary>

```lua
function isWorkingHours()
    local gt = getGameTime()                -- Get time manager
    local hour = gt:getTimeOfDay()          -- Get hour (0-23)

    if hour >= 9 and hour < 17 then         -- 9am to 5pm (17 is 5pm)
        print("Working hours: Yes")
        return true
    else
        print("Working hours: No")
        return false
    end
end

-- Call it
isWorkingHours()
```

**Key points:**
- `getTimeOfDay()` returns 0-23 (midnight to 11pm)
- Use `>=` for start time, `<` for end time (9am-5pm = 9-16, since 17 is after 5pm starts)
</details>

---

### Exercise 3: Random Loot Table

Create a function that randomly selects loot from a weighted table:
- Items: Hammer (common, 50%), Axe (uncommon, 30%), Gun (rare, 20%)
- Use ZombRand to pick item based on weights
- Add the selected item to player inventory

<details>
<summary>Solution</summary>

```lua
function giveRandomLoot()
    local player = getPlayer()              -- Get player
    if not player then return end           -- Safety check

    local roll = ZombRand(100)              -- Roll 0-99

    local item
    if roll < 50 then                       -- 0-49 = 50% chance
        item = "Base.Hammer"                -- Common
    elseif roll < 80 then                   -- 50-79 = 30% chance
        item = "Base.Axe"                   -- Uncommon
    else                                    -- 80-99 = 20% chance
        item = "Base.Shotgun"               -- Rare
    end

    player:getInventory():AddItem(item)     -- Add to inventory
    print("Gave player: " .. item)
end
```

**Key points:**
- Roll 0-99 for 100 outcomes
- Cumulative ranges: 0-49 (50%), 50-79 (30%), 80-99 (20%)
- Always check player exists before adding items
</details>

---

## Best Practices

### 1. Always Check for Nil

**Check objects exist before using them:**
```lua
local player = getPlayer()
if not player then return end               -- Early return pattern

-- Now safe to use player
local health = player:getBodyDamage():getOverallBodyHealth()
```

**Objects that can be nil:**
- `getPlayer()` - During startup or in some contexts
- `getSquare(x, y, z)` - If square not loaded
- `getSpecificPlayer(i)` - If player index doesn't exist
- `inventory:getFirstType("Item")` - If item not found

### 2. Use Early Returns

**Instead of deep nesting, return early:**

**Avoid:**
```lua
function doSomething()
    local player = getPlayer()
    if player then
        local inv = player:getInventory()
        if inv then
            local item = inv:getFirstType("Base.Hammer")
            if item then
                -- Finally do something
            end
        end
    end
end
```

**Better:**
```lua
function doSomething()
    local player = getPlayer()
    if not player then return end           -- Early return

    local inv = player:getInventory()
    if not inv then return end              -- Early return

    local item = inv:getFirstType("Base.Hammer")
    if not item then return end             -- Early return

    -- Do something with item (no nesting!)
end
```

### 3. Cache Globals in Hot Paths

**If calling globals many times in a loop, cache them:**
```lua
-- Called once per frame (60 times/second)
function onTick()
    local player = getPlayer()              -- Cache at start
    if not player then return end

    for i = 1, 100 do
        -- Use cached player instead of calling getPlayer() 100 times
        doSomethingWith(player)
    end
end
```

### 4. Use getSpecificPlayer for Splitscreen

**Support splitscreen by iterating all players:**
```lua
function handleAllPlayers()
    local playerCount = getNumActivePlayers()
    for i = 0, playerCount - 1 do           -- Loop 0 to count-1
        local player = getSpecificPlayer(i)
        if player then
            -- Handle each player
        end
    end
end
```

### 5. Wrap Network Code Properly

**Only run client/server code in correct context:**
```lua
-- Client-side only
if isClient() then
    sendClientCommand("MyMod", "RequestData", {})
end

-- Server-side only
if isServer() then
    sendServerCommand(player, "MyMod", "SendData", {data = 123})
end

-- Singleplayer or server
if not isClient() then
    -- Singleplayer or dedicated server code
end
```

### 6. Use instanceof for Type Checking

**Check object types before casting:**
```lua
local obj = square:getObjects():get(0)

if instanceof(obj, "IsoZombie") then
    -- Safe to use zombie-specific methods
    local health = obj:getHealth()
elseif instanceof(obj, "IsoPlayer") then
    -- Safe to use player-specific methods
    local inv = obj:getInventory()
end
```

### 7. Log for Debugging

**Use print() liberally during development:**
```lua
function myFunction()
    print("myFunction called")              -- Entry point
    local player = getPlayer()
    print("Player: " .. tostring(player))   -- Check if nil
    if not player then return end

    local health = player:getBodyDamage():getOverallBodyHealth()
    print("Health: " .. health)             -- Log values
end
```

---

## Key Takeaways

1. **Global functions need no imports** - Available everywhere automatically
2. **Always check for nil** - `getPlayer()`, `getSquare()`, etc. can return nil
3. **ZombRand max is exclusive** - `ZombRand(100)` gives 0-99, not 0-100
4. **Use full item IDs** - `"Base.Hammer"`, not `"Hammer"`
5. **instanceof checks class** - Use `"Food"`, not `"Apple"`
6. **Cache globals in loops** - Don't call `getPlayer()` 100 times, cache it once
7. **Wrap network code** - Check `isClient()` / `isServer()` before sending commands
8. **Early returns beat nesting** - Check and return early, don't nest 5 levels deep

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
