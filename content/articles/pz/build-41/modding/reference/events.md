---
id: reference-events
slug: events
title: "Complete Events Reference"
game: pz
version: build-41
section: modding
category: reference
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - lua
  - events
  - api
  - reference
  - callbacks
excerpt: "Complete reference of all 144 events in Project Zomboid Build 41, with parameters, examples, and use cases."
table_of_contents:
  - text: "What Are Events?"
    link: "#what-are-events"
  - text: "How Events Work"
    link: "#how-events-work"
  - text: "Event Categories"
    link: "#event-categories"
  - text: "Game Lifecycle Events"
    link: "#game-lifecycle-events"
  - text: "Player Events"
    link: "#player-events"
  - text: "Context Menu Events"
    link: "#context-menu-events"
  - text: "Time Events"
    link: "#time-events"
  - text: "World Events"
    link: "#world-events"
  - text: "Vehicle Events"
    link: "#vehicle-events"
  - text: "Crafting Events"
    link: "#crafting-events"
  - text: "Input Events"
    link: "#input-events"
  - text: "Weather Events"
    link: "#weather-events"
  - text: "Multiplayer Events"
    link: "#multiplayer-events"
  - text: "UI Events"
    link: "#ui-events"
  - text: "Global Object Events"
    link: "#global-object-events"
  - text: "Complete Event List"
    link: "#complete-event-list"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Best Practices"
    link: "#best-practices"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Global Functions Reference"
    path: /build-41/modding/reference/globals
  - title: "Script Properties Reference"
    path: /build-41/modding/reference/script-properties
last_updated: 2026-01-28
---

# Complete Events Reference

> You're going to learn about every event Project Zomboid fires, what triggers them, and how to use them. By the end, you'll know exactly which event to use for any mod behavior you want to create.

---

## What Are Events?

You know when you want your mod to "do something when the player picks up an item" or "run code when a zombie dies"? That's what events are for. They're Project Zomboid's way of telling your mod "hey, something just happened - do you want to react to it?"

**Events are callbacks** - functions you register that get called automatically when specific things happen in the game. Every single mod uses events. Without them, your mod would have no way to know when things happen.

Think of events like subscribing to notifications. When you subscribe to "OnPlayerDeath", you're telling the game "notify me whenever a player dies." When that happens, the game calls your function and gives you information about what happened.

**You would use events when:**
- Reacting to player actions (movement, combat, crafting)
- Monitoring game state (time passing, weather changing)
- Adding custom menu options (right-click menus)
- Responding to world changes (objects added/removed, zombies spawning)
- Syncing multiplayer data

If you've ever thought "I wish my mod could detect when X happens" - that's what events are for. When I first started modding, I tried to use tick loops to constantly check for things happening. It was slow, buggy, and terrible. Learning events changed everything - the game tells you exactly when things happen, no constant checking needed.

---

## How Events Work

Events follow a simple pattern: subscribe to an event, provide a callback function, and the game calls it when the event fires.

### Basic Pattern

```lua
-- Subscribe to an event
Events.EventName.Add(yourCallbackFunction)

-- Your callback receives event-specific parameters
local function yourCallbackFunction(param1, param2, ...)
    -- Your code runs when the event fires
end
```

### Simple Example

```lua
-- React when player dies
local function onDeath(player)                     -- Called automatically with player object
    print(player:getUsername() .. " has died")    -- Do something with the player
end

Events.OnPlayerDeath.Add(onDeath)                  -- Subscribe to the event
```

**What happens:**
1. Game runs, player is playing normally
2. Player dies (zombie bite, fall damage, etc.)
3. Game fires `OnPlayerDeath` event
4. Your `onDeath` function is called automatically
5. You receive the player object as a parameter
6. Your code runs

> **Key Takeaway**
> You don't call event callbacks yourself. You register them, and the game calls them when appropriate. Think of it like signing up for notifications - you subscribe once, then get notified automatically.

---

## Event Categories

Project Zomboid has 144 events organized into these categories:

| Category | Event Count | When They Fire |
|----------|-------------|----------------|
| **Game Lifecycle** | 12 | Game boot, start, save, load, quit |
| **Player** | 14 | Player creation, movement, death, equipment, XP |
| **Context Menus** | 2 | Right-click menus (inventory, world) |
| **Time** | 9 | Ticks, minutes, hours, days, dawn/dusk |
| **World** | 10 | Objects, containers, zombies, grid squares |
| **Vehicles** | 7 | Enter, exit, damage, mechanics |
| **Crafting** | 2 | Item creation, recipes |
| **Input** | 8 | Keyboard, mouse, gamepad |
| **Weather** | 8 | Climate, thunder, seasons |
| **Multiplayer** | 20+ | Connection, commands, chat, trading |
| **UI** | 6 | Screen drawing, resolution, creation |
| **Global Objects** | 4 | Mod data, global systems |
| **Miscellaneous** | 40+ | Steam, audio, special cases |

**Most commonly used events:**
- `OnGameStart` - Initialize your mod
- `OnFillInventoryObjectContextMenu` - Add right-click menu options
- `OnPlayerDeath` - React to player death
- `EveryTenMinutes` - Periodic updates
- `OnKeyPressed` - Custom key bindings

---

## Game Lifecycle Events

These events fire at different points in the game's startup, loading, and saving process.

### OnGameBoot

**When it fires:** Game first boots up (before main menu appears).

**Use for:** One-time initialization that needs to happen before anything else.

```lua
Events.OnGameBoot.Add(function()
    print("Game is booting up - this runs once")
    -- Load config files, register systems, etc.
end)
```

**Parameters:** None

**Common use:** Initializing global tables, loading configuration, registering custom systems.

### OnMainMenuEnter

**When it fires:** Player reaches the main menu.

**Use for:** Menu modifications, checking for updates.

```lua
Events.OnMainMenuEnter.Add(function()
    print("At main menu")
    -- Check for mod updates, modify main menu UI, etc.
end)
```

**Parameters:** None

### OnGameStart

**When it fires:** Game session starts (after world loads).

**Use for:** Per-game initialization. **One of the most commonly used events.**

```lua
Events.OnGameStart.Add(function()
    local player = getPlayer()                     -- Get the player
    print("Game started for: " .. player:getUsername())
    -- Initialize mod state, load player data, etc.
end)
```

**Parameters:** None

**Important:** This fires after loading completes, so the player and world are available.

### OnNewGame

**When it fires:** Starting a brand new game (not loading a save).

**Use for:** First-time setup, tutorials, welcome messages.

```lua
Events.OnNewGame.Add(function()
    print("Fresh game started - this is a new save")
    -- Give starting items, show tutorial, etc.
end)
```

**Parameters:** None

**Difference from OnGameStart:** `OnGameStart` fires every time (new or loaded game). `OnNewGame` only fires for brand new games.

### OnPreMapLoad

**When it fires:** Before the map loads.

**Use for:** Pre-loading setup that needs to happen before map data exists.

```lua
Events.OnPreMapLoad.Add(function()
    print("About to load map")
    -- Prepare for map loading
end)
```

**Parameters:** None

### OnGameTimeLoaded

**When it fires:** After game time data loads.

**Use for:** Time-based calculations that need accurate game time.

```lua
Events.OnGameTimeLoaded.Add(function()
    local gameTime = getGameTime()
    local day = gameTime:getNightsSurvived()
    print("Day " .. day .. " of the apocalypse")
end)
```

**Parameters:** None

### OnSave

**When it fires:** Game is saving.

**Use for:** Saving mod data to persist between sessions.

```lua
Events.OnSave.Add(function()
    -- Save your mod's data
    local modData = ModData.getOrCreate("MyMod")
    modData.playerScore = calculateScore()
    ModData.transmit("MyMod")
end)
```

**Parameters:** None

**Important:** This is when you save mod data. Don't try to save at other times.

### OnPostSave

**When it fires:** After saving completes.

**Use for:** Post-save cleanup or notifications.

```lua
Events.OnPostSave.Add(function()
    print("Save complete")
end)
```

**Parameters:** None

### OnResetLua

**When it fires:** Lua scripts are reset/reloaded (debug mode).

**Use for:** Reinitializing state after script reload.

```lua
Events.OnResetLua.Add(function()
    -- Reinitialize your mod state
    print("Lua reset - reinitializing mod")
end)
```

**Parameters:** None

**When this happens:** Mainly in debug mode when you reload scripts during development.

---

## Player Events

Events related to player characters - creation, movement, actions, death, equipment.

### OnCreatePlayer

**When it fires:** Player character is created.

**Use for:** Per-player initialization.

```lua
Events.OnCreatePlayer.Add(function(playerIndex, player)
    print("Created player " .. playerIndex)        -- Player number (0-3 for splitscreen)
    print("Username: " .. player:getUsername())    -- Player's name
    -- Initialize player-specific data
end)
```

**Parameters:**
- `playerIndex` (int) - Player number (0 for main player, 1-3 for splitscreen)
- `player` (IsoPlayer) - The player object

### OnPlayerUpdate

**When it fires:** Every frame for each player. **Very frequent - use carefully!**

**Use for:** Frame-by-frame player logic (animations, effects, constant checks).

```lua
Events.OnPlayerUpdate.Add(function(player)
    -- This runs EVERY FRAME - keep it lightweight!
    if player:isRunning() then
        -- Do something while running
    end
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player being updated

**Warning:** This fires every frame (60+ times per second). Heavy operations here will cause lag.

### OnPlayerMove

**When it fires:** Player moves.

**Use for:** Movement tracking, footstep effects, location-based triggers.

```lua
Events.OnPlayerMove.Add(function(player)
    local x = player:getX()                        -- Current X coordinate
    local y = player:getY()                        -- Current Y coordinate
    local z = player:getZ()                        -- Current floor level
    -- Track movement, check for trigger zones, etc.
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player who moved

### OnPlayerDeath

**When it fires:** Player dies. **Commonly used for cleanup and death penalties.**

**Use for:** Death reactions, cleanup, achievements, permadeath logic.

```lua
Events.OnPlayerDeath.Add(function(player)
    print(player:getUsername() .. " has died")
    -- Clean up player data, save death statistics, etc.
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player who died

### AddXP

**When it fires:** Player gains XP in any skill.

**Use for:** Custom XP modifiers, skill tracking, achievements.

```lua
Events.AddXP.Add(function(player, perk, amount)
    local skillName = tostring(perk)               -- Skill/perk name
    print("Gained " .. amount .. " XP in " .. skillName)
    -- Track XP gains, modify XP amounts, etc.
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player gaining XP
- `perk` (Perk) - The skill/perk (Enum value)
- `amount` (float) - XP amount gained

### LevelPerk

**When it fires:** Skill/perk levels up or down.

**Use for:** Level-up rewards, skill-based unlocks, congratulations messages.

```lua
Events.LevelPerk.Add(function(player, perk, level, levelUp)
    if levelUp then                                -- Check if leveling up (not down)
        local skillName = tostring(perk)
        print("Leveled up " .. skillName .. " to level " .. level)
        -- Give rewards, unlock recipes, etc.
    end
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player
- `perk` (Perk) - The skill/perk
- `level` (int) - New level
- `levelUp` (boolean) - True if leveled up, false if leveled down

### OnEquipPrimary

**When it fires:** Player equips an item in primary hand.

**Use for:** Equipment tracking, bonuses, stat changes.

```lua
Events.OnEquipPrimary.Add(function(player, item)
    if item then                                   -- Check if item exists (not unequipping)
        print("Equipped: " .. item:getName())
        -- Apply equipment bonuses, track weapon type, etc.
    else
        print("Unequipped primary hand")
    end
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player
- `item` (InventoryItem) - The equipped item (or nil if unequipping)

### OnEquipSecondary

**When it fires:** Player equips an item in secondary hand.

**Use for:** Off-hand equipment tracking.

```lua
Events.OnEquipSecondary.Add(function(player, item)
    if item then
        print("Off-hand: " .. item:getName())
    end
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player
- `item` (InventoryItem) - The equipped item (or nil if unequipping)

### OnPlayerAttackFinished

**When it fires:** Player completes an attack animation.

**Use for:** Post-attack effects, combo systems, stamina systems.

```lua
Events.OnPlayerAttackFinished.Add(function(player, weapon)
    print("Attack finished with " .. weapon:getName())
    -- Apply post-attack effects, check for combo, etc.
end)
```

**Parameters:**
- `player` (IsoPlayer) - The attacker
- `weapon` (HandWeapon) - The weapon used

---

## Context Menu Events

Events for adding options to right-click menus. **Essential for item interactions.**

### OnFillInventoryObjectContextMenu

**When it fires:** Player right-clicks items in inventory. **Most commonly used for custom item actions.**

**Use for:** Adding "Use", "Craft", "Combine" options to items.

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(playerIndex, context, items)
    -- Check if we have the right items
    if items and #items > 0 then
        local item = items[1]                      -- First selected item

        -- Add custom menu option
        context:addOption(
            "My Custom Action",                    -- Text shown in menu
            items,                                  -- Items to pass to function
            myCustomFunction                        -- Function to call
        )
    end
end)

local function myCustomFunction(items)
    -- This runs when player clicks the menu option
    local item = items[1]
    print("Custom action on: " .. item:getName())
end
```

**Parameters:**
- `playerIndex` (int) - Player number (0-3)
- `context` (ISContextMenu) - The menu to add options to
- `items` (table) - Array of selected items

**Common pattern:** Check item types, add appropriate menu options, handle the action.

### OnFillWorldObjectContextMenu

**When it fires:** Player right-clicks objects in the world (not inventory).

**Use for:** Adding interactions with furniture, doors, containers, world objects.

```lua
Events.OnFillWorldObjectContextMenu.Add(function(playerIndex, context, worldObjects, test)
    -- test = true means just checking if menu should appear (don't do heavy work)
    if test then return end

    -- Check what was clicked
    for _, obj in ipairs(worldObjects) do
        local square = obj:getSquare()             -- Grid square under object

        -- Add custom option for this object
        context:addOption(
            "Examine Object",                      -- Menu text
            worldObjects,                          -- Objects to pass
            examineObject                          -- Function to call
        )
    end
end)

local function examineObject(worldObjects, player)
    -- Handle the action
    print("Examining object")
end
```

**Parameters:**
- `playerIndex` (int) - Player number
- `context` (ISContextMenu) - The menu
- `worldObjects` (table) - Objects under cursor
- `test` (boolean) - True if just testing (don't do heavy work)

---

## Time Events

Events that fire based on time passing - ticks, minutes, hours, days.

### OnTick

**When it fires:** Every game tick. **Very frequent - use sparingly!**

**Use for:** Frame-perfect timing, constant updates (use other time events if possible).

```lua
Events.OnTick.Add(function()
    -- This runs EVERY TICK - keep it extremely lightweight!
    -- Prefer EveryTenMinutes or EveryOneMinute for most work
end)
```

**Parameters:** None

**Warning:** Runs dozens of times per second. Heavy operations here will destroy performance.

### OnTickEvenPaused

**When it fires:** Every tick, even when game is paused.

**Use for:** UI updates that need to work while paused.

```lua
Events.OnTickEvenPaused.Add(function()
    -- Runs even when paused - good for UI
end)
```

**Parameters:** None

### OnRenderTick

**When it fires:** Every render frame.

**Use for:** Drawing, rendering, visual effects.

```lua
Events.OnRenderTick.Add(function()
    -- Drawing/rendering code goes here
end)
```

**Parameters:** None

### EveryOneMinute

**When it fires:** Every in-game minute. **Good for frequent periodic checks.**

**Use for:** Regular updates that don't need to be every tick.

```lua
Events.EveryOneMinute.Add(function()
    print("One in-game minute passed")
    -- Check conditions, update timers, etc.
end)
```

**Parameters:** None

**Much better than OnTick for most periodic work.**

### EveryTenMinutes

**When it fires:** Every 10 in-game minutes. **Commonly used for periodic updates.**

**Use for:** Regular maintenance, condition checks, spawning.

```lua
Events.EveryTenMinutes.Add(function()
    -- Good for periodic checks without hammering performance
    local player = getPlayer()
    if player:isOutside() then
        -- Do outdoor-specific update
    end
end)
```

**Parameters:** None

**Best balance** between frequency and performance for most periodic tasks.

### EveryHours

**When it fires:** Every in-game hour.

**Use for:** Hourly updates, slow decay, weather checks.

```lua
Events.EveryHours.Add(function()
    print("An hour has passed")
    -- Hourly maintenance, condition updates, etc.
end)
```

**Parameters:** None

### EveryDays

**When it fires:** Every in-game day (at midnight).

**Use for:** Daily resets, day counts, long-term timers.

```lua
Events.EveryDays.Add(function()
    local gameTime = getGameTime()
    local day = gameTime:getNightsSurvived() + 1   -- Day count (starts at 0)
    print("Day " .. day .. " of the apocalypse")
    -- Daily resets, spawn cycles, etc.
end)
```

**Parameters:** None

### OnDawn

**When it fires:** At dawn (sun rises).

**Use for:** Day-specific spawning, vampire mods, solar power.

```lua
Events.OnDawn.Add(function()
    print("The sun rises - time: " .. getGameTime():getTimeOfDay())
    -- Day-only effects, solar recharge, etc.
end)
```

**Parameters:** None

### OnDusk

**When it fires:** At dusk (sun sets).

**Use for:** Night-specific effects, danger increases, lighting.

```lua
Events.OnDusk.Add(function()
    print("Night falls")
    -- Night-only effects, increased danger, etc.
end)
```

**Parameters:** None

---

## World Events

Events related to the game world - zombies, objects, containers, grid squares.

### OnZombieDead

**When it fires:** Zombie dies.

**Use for:** Death effects, loot drops, statistics.

```lua
Events.OnZombieDead.Add(function(zombie)
    local x = zombie:getX()
    local y = zombie:getY()
    print("Zombie killed at " .. x .. ", " .. y)
    -- Spawn loot, track kills, create effects, etc.
end)
```

**Parameters:**
- `zombie` (IsoZombie) - The dead zombie

### OnZombieUpdate

**When it fires:** Every frame for each zombie. **Very frequent - use carefully!**

**Use for:** Per-zombie AI modifications, visual effects.

```lua
Events.OnZombieUpdate.Add(function(zombie)
    -- This runs EVERY FRAME for EVERY ZOMBIE - be very careful!
    -- Only use if you absolutely need frame-perfect zombie updates
end)
```

**Parameters:**
- `zombie` (IsoZombie) - The zombie being updated

**Warning:** This fires for every zombie every frame. With 100 zombies, that's 6000+ calls per second.

### OnHitZombie

**When it fires:** Zombie is hit.

**Use for:** Hit effects, damage modifications, feedback.

```lua
Events.OnHitZombie.Add(function(zombie, attacker, bodyPart, weapon)
    print("Hit zombie with " .. weapon:getName())
    -- Apply special effects, modify damage, play sounds, etc.
end)
```

**Parameters:**
- `zombie` (IsoZombie) - The zombie hit
- `attacker` (IsoPlayer/IsoGameCharacter) - Who hit it
- `bodyPart` (BodyPart) - Which body part was hit
- `weapon` (HandWeapon) - Weapon used

### OnContainerUpdate

**When it fires:** Container contents change (items added/removed).

**Use for:** Container monitoring, auto-sorting, special containers.

```lua
Events.OnContainerUpdate.Add(function(container)
    -- Container inventory changed
    local itemCount = container:getItems():size()
    print("Container now has " .. itemCount .. " items")
end)
```

**Parameters:**
- `container` (ItemContainer) - The container that changed

### OnObjectAdded

**When it fires:** Object added to the world.

**Use for:** Tracking spawned objects, custom object behavior.

```lua
Events.OnObjectAdded.Add(function(object)
    print("Object added: " .. tostring(object))
    -- Initialize custom object behavior, track spawns, etc.
end)
```

**Parameters:**
- `object` (IsoObject) - The added object

### OnObjectAboutToBeRemoved

**When it fires:** Before object is removed from world.

**Use for:** Cleanup, saving object state, loot drops.

```lua
Events.OnObjectAboutToBeRemoved.Add(function(object)
    print("Object being removed")
    -- Save state, spawn drops, cleanup, etc.
end)
```

**Parameters:**
- `object` (IsoObject) - The object being removed

### OnDestroyIsoThumpable

**When it fires:** Player-built object (door, wall, furniture) is destroyed.

**Use for:** Custom destruction effects, material recovery.

```lua
Events.OnDestroyIsoThumpable.Add(function(thumpable, destroyer)
    print("Built object destroyed")
    -- Spawn materials, create debris, etc.
end)
```

**Parameters:**
- `thumpable` (IsoThumpable) - The destroyed object
- `destroyer` (IsoGameCharacter) - Who destroyed it

### LoadGridsquare

**When it fires:** Grid square loads into memory.

**Use for:** Per-square initialization, custom spawning.

```lua
Events.LoadGridsquare.Add(function(square)
    -- Square just loaded
    local x = square:getX()
    local y = square:getY()
    print("Loaded square at " .. x .. ", " .. y)
end)
```

**Parameters:**
- `square` (IsoGridSquare) - The loaded square

---

## Vehicle Events

Events related to vehicles - entering, exiting, damage, mechanics.

### OnEnterVehicle

**When it fires:** Player enters a vehicle.

**Use for:** Vehicle bonuses, UI changes, tracking.

```lua
Events.OnEnterVehicle.Add(function(player)
    print(player:getUsername() .. " entered vehicle")
    local vehicle = player:getVehicle()            -- Get the vehicle they entered
    -- Apply vehicle effects, show vehicle UI, etc.
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player entering

### OnExitVehicle

**When it fires:** Player exits a vehicle.

**Use for:** Cleanup, removing vehicle bonuses.

```lua
Events.OnExitVehicle.Add(function(player)
    print(player:getUsername() .. " exited vehicle")
    -- Remove vehicle effects, hide vehicle UI, etc.
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player exiting

### OnSwitchVehicleSeat

**When it fires:** Player switches seats in vehicle.

**Use for:** Seat-specific logic.

```lua
Events.OnSwitchVehicleSeat.Add(function(player)
    local vehicle = player:getVehicle()
    local seat = vehicle:getSeat(player)           -- Which seat they're in now
    print("Switched to seat: " .. tostring(seat))
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player switching

### OnUseVehicle

**When it fires:** Player uses vehicle controls (horn, lights, etc).

**Use for:** Custom vehicle interactions.

```lua
Events.OnUseVehicle.Add(function(player, vehicle, pressedNotTapped)
    -- Player interacted with vehicle
    print("Used vehicle")
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player
- `vehicle` (BaseVehicle) - The vehicle
- `pressedNotTapped` (boolean) - True if long press, false if tap

### OnVehicleDamageTexture

**When it fires:** Vehicle appearance updates due to damage.

**Use for:** Visual damage effects, repair tracking.

```lua
Events.OnVehicleDamageTexture.Add(function(player)
    -- Vehicle appearance changed
    print("Vehicle damaged")
end)
```

**Parameters:**
- `player` (IsoPlayer) - The driver/owner

### OnVehicleHorn

**When it fires:** Vehicle horn honked.

**Use for:** Custom horn effects, zombie attraction.

```lua
Events.OnVehicleHorn.Add(function(player, vehicle, pressed)
    if pressed then                                -- Horn pressed
        print("HONK!")
        -- Attract zombies, play custom sound, etc.
    else                                            -- Horn released
        print("Horn released")
    end
end)
```

**Parameters:**
- `player` (IsoPlayer) - The player
- `vehicle` (BaseVehicle) - The vehicle
- `pressed` (boolean) - True if pressed, false if released

### OnMechanicActionDone

**When it fires:** Mechanic action completes (install part, repair, etc).

**Use for:** Custom repair rewards, tracking.

```lua
Events.OnMechanicActionDone.Add(function(player, success, vehicleId, partId)
    if success then
        print("Repair successful on part: " .. partId)
        -- Give XP bonus, unlock achievements, etc.
    else
        print("Repair failed")
    end
end)
```

**Parameters:**
- `player` (IsoPlayer) - The mechanic
- `success` (boolean) - Whether it succeeded
- `vehicleId` (int) - Vehicle ID
- `partId` (string) - Part that was worked on

---

## Crafting Events

Events for crafting and item creation.

### OnMakeItem

**When it fires:** Player crafts an item via recipe.

**Use for:** Crafting bonuses, custom item properties, tracking.

```lua
Events.OnMakeItem.Add(function(item, player, recipe)
    print("Crafted: " .. item:getName())
    local recipeName = recipe:getName()            -- Recipe used
    -- Set custom properties, give bonuses, track crafts, etc.
end)
```

**Parameters:**
- `item` (InventoryItem) - The crafted item
- `player` (IsoPlayer) - The crafter
- `recipe` (Recipe) - The recipe used

### OnDynamicMovableRecipe

**When it fires:** Dynamic/movable recipe used (furniture, etc).

**Use for:** Custom furniture creation.

```lua
Events.OnDynamicMovableRecipe.Add(function(movableRecipe, item, player)
    -- Dynamic crafting (furniture, etc)
    print("Created dynamic item")
end)
```

**Parameters:**
- `movableRecipe` - The recipe
- `item` (InventoryItem) - Result item
- `player` (IsoPlayer) - The crafter

---

## Input Events

Events for keyboard, mouse, and gamepad input.

### OnKeyPressed

**When it fires:** Key is held down. **Fires continuously while key is down.**

**Use for:** Continuous actions while key held.

```lua
Events.OnKeyPressed.Add(function(key)
    if key == Keyboard.KEY_F then                  -- Check which key (use Keyboard.KEY_*)
        print("F is being pressed")
        -- Do something while F is held
    end
end)
```

**Parameters:**
- `key` (int) - Key code (use `Keyboard.KEY_*` constants)

**Note:** This fires repeatedly while key is down. For single press detection, use `OnKeyStartPressed`.

### OnKeyStartPressed

**When it fires:** Key is first pressed (initial press only).

**Use for:** Single key press actions, hotkeys.

```lua
Events.OnKeyStartPressed.Add(function(key)
    if key == Keyboard.KEY_I then                  -- Inventory key example
        print("I pressed once")
        -- Open menu, toggle setting, etc.
    end
end)
```

**Parameters:**
- `key` (int) - Key code

**Better than OnKeyPressed** for most single-press actions (opening menus, toggling, etc).

### OnKeyKeepPressed

**When it fires:** Key continues to be held (after initial press).

**Use for:** Detecting sustained key press.

```lua
Events.OnKeyKeepPressed.Add(function(key)
    -- Key is still being held
end)
```

**Parameters:**
- `key` (int) - Key code

### OnCustomUIKey

**When it fires:** Custom UI key binding pressed.

**Use for:** Mod-specific hotkeys.

```lua
Events.OnCustomUIKey.Add(function(key)
    -- Custom key handling
    print("Custom UI key: " .. key)
end)
```

**Parameters:**
- `key` (int) - Key code

### OnMouseDown

**When it fires:** Left mouse button pressed.

**Use for:** Click detection, custom mouse handling.

```lua
Events.OnMouseDown.Add(function(x, y)
    print("Left click at " .. x .. ", " .. y)
    -- Custom click handling
end)
```

**Parameters:**
- `x` (int) - Mouse X position (screen coordinates)
- `y` (int) - Mouse Y position (screen coordinates)

### OnRightMouseDown

**When it fires:** Right mouse button pressed.

**Use for:** Custom right-click behavior.

```lua
Events.OnRightMouseDown.Add(function(x, y)
    print("Right click at " .. x .. ", " .. y)
    -- Custom right-click handling
end)
```

**Parameters:**
- `x` (int) - Mouse X position
- `y` (int) - Mouse Y position

---

## Weather Events

Events for weather, climate, and seasons.

### OnClimateManagerInit

**When it fires:** Climate system initializes.

**Use for:** Climate system modifications.

```lua
Events.OnClimateManagerInit.Add(function(climate)
    print("Climate system initialized")
    -- Modify climate behavior, access climate manager, etc.
end)
```

**Parameters:**
- `climate` (ClimateManager) - The climate manager

### OnClimateTick

**When it fires:** Every climate update tick.

**Use for:** Weather-based effects, climate monitoring.

```lua
Events.OnClimateTick.Add(function(climate)
    local temp = climate:getTemperature()          -- Current temperature
    local isRaining = getRainManager():isRaining() -- Check if raining
    -- Weather-dependent logic
end)
```

**Parameters:**
- `climate` (ClimateManager) - The climate manager

### OnThunderEvent

**When it fires:** Thunder/lightning event.

**Use for:** Lightning effects, fear systems, power outages.

```lua
Events.OnThunderEvent.Add(function(x, y, strike)
    if strike then                                 -- Actual lightning strike
        print("Lightning strike at " .. x .. ", " .. y)
        -- Create fire, startle player, etc.
    else                                            -- Just thunder sound
        print("Thunder rumbles")
    end
end)
```

**Parameters:**
- `x` (int) - X coordinate (if strike)
- `y` (int) - Y coordinate (if strike)
- `strike` (boolean) - True if lightning strike, false if just thunder

### OnWeatherPeriodStart

**When it fires:** Weather period begins.

**Use for:** Weather change notifications.

```lua
Events.OnWeatherPeriodStart.Add(function(period)
    print("Weather changing to new period")
    -- Notify player, prepare for weather change, etc.
end)
```

**Parameters:**
- `period` (WeatherPeriod) - The starting weather period

### OnWeatherPeriodStage

**When it fires:** Weather stage transitions (within a period).

**Use for:** Gradual weather effects.

```lua
Events.OnWeatherPeriodStage.Add(function(period)
    -- Weather stage changed (gradual transition)
end)
```

**Parameters:**
- `period` (WeatherPeriod) - The weather period

### OnWeatherPeriodComplete

**When it fires:** Weather period ends.

**Use for:** End-of-weather cleanup.

```lua
Events.OnWeatherPeriodComplete.Add(function(period)
    print("Weather period ended")
    -- Cleanup weather effects, etc.
end)
```

**Parameters:**
- `period` (WeatherPeriod) - The completed period

### OnInitSeasons

**When it fires:** Season system initializes.

**Use for:** Season modifications.

```lua
Events.OnInitSeasons.Add(function()
    print("Seasons initialized")
    -- Modify seasonal behavior
end)
```

**Parameters:** None

---

## Multiplayer Events

Events for multiplayer, networking, and server communication. **(Multiplayer mods only)**

### OnConnected

**When it fires:** Client connects to server.

**Use for:** Connection initialization, syncing data.

```lua
Events.OnConnected.Add(function()
    print("Connected to server")
    -- Request server data, sync mod state, etc.
end)
```

**Parameters:** None

### OnConnectFailed

**When it fires:** Connection attempt fails.

**Use for:** Error handling, retry logic.

```lua
Events.OnConnectFailed.Add(function(error)
    print("Connection failed: " .. error)
    -- Show error message, attempt retry, etc.
end)
```

**Parameters:**
- `error` (string) - Error message

### OnDisconnect

**When it fires:** Disconnected from server.

**Use for:** Cleanup, save state.

```lua
Events.OnDisconnect.Add(function()
    print("Disconnected from server")
    -- Save local state, cleanup, etc.
end)
```

**Parameters:** None

### OnServerStarted

**When it fires:** Server starts (server-side only).

**Use for:** Server initialization.

```lua
Events.OnServerStarted.Add(function()
    print("Server started")
    -- Initialize server-side systems
end)
```

**Parameters:** None

### OnClientCommand

**When it fires:** Server receives command from client.

**Use for:** Handling client requests (server-side).

```lua
Events.OnClientCommand.Add(function(module, command, player, args)
    if module == "MyMod" then                      -- Check if command is for your mod
        if command == "doSomething" then           -- Check command type
            -- Handle the command
            local data = args.data                  -- Access command arguments
            print(player:getUsername() .. " requested: " .. command)
        end
    end
end)
```

**Parameters:**
- `module` (string) - Module name
- `command` (string) - Command name
- `player` (IsoPlayer) - Player who sent it
- `args` (table) - Command arguments

### OnServerCommand

**When it fires:** Client receives command from server.

**Use for:** Handling server updates (client-side).

```lua
Events.OnServerCommand.Add(function(module, command, args)
    if module == "MyMod" then
        if command == "updateData" then
            -- Handle server update
            local newData = args.data
        end
    end
end)
```

**Parameters:**
- `module` (string) - Module name
- `command` (string) - Command name
- `args` (table) - Command arguments

---

## UI Events

Events for UI rendering, creation, and screen changes.

### OnCreateUI

**When it fires:** Main UI is created (after game starts).

**Use for:** Adding custom UI elements.

```lua
Events.OnCreateUI.Add(function()
    print("UI created - add custom elements here")
    -- Create custom UI, add windows, etc.
end)
```

**Parameters:** None

### OnPreUIDraw

**When it fires:** Before UI draws each frame.

**Use for:** Drawing behind UI.

```lua
Events.OnPreUIDraw.Add(function()
    -- Draw behind UI
    -- Use render functions here
end)
```

**Parameters:** None

### OnPostUIDraw

**When it fires:** After UI draws each frame.

**Use for:** Drawing on top of UI.

```lua
Events.OnPostUIDraw.Add(function()
    -- Draw on top of UI
    -- Overlays, custom displays, etc.
end)
```

**Parameters:** None

### OnResolutionChange

**When it fires:** Screen resolution changes.

**Use for:** Repositioning UI, recalculating layouts.

```lua
Events.OnResolutionChange.Add(function(oldW, oldH, newW, newH)
    print("Resolution changed from " .. oldW .. "x" .. oldH .. " to " .. newW .. "x" .. newH)
    -- Reposition UI elements, recalculate layouts, etc.
end)
```

**Parameters:**
- `oldW` (int) - Old width
- `oldH` (int) - Old height
- `newW` (int) - New width
- `newH` (int) - New height

---

## Global Object Events

Events for global mod data and systems.

### OnCGlobalObjectSystemInit

**When it fires:** Client global object system initializes.

**Use for:** Client-side global system setup.

```lua
Events.OnCGlobalObjectSystemInit.Add(function()
    print("Client global objects ready")
    -- Initialize client global systems
end)
```

**Parameters:** None

### OnSGlobalObjectSystemInit

**When it fires:** Server global object system initializes.

**Use for:** Server-side global system setup.

```lua
Events.OnSGlobalObjectSystemInit.Add(function()
    print("Server global objects ready")
    -- Initialize server global systems
end)
```

**Parameters:** None

### OnInitGlobalModData

**When it fires:** Global mod data initializes (on game start or load).

**Use for:** Initializing persistent mod data.

```lua
Events.OnInitGlobalModData.Add(function(isNewGame)
    local modData = ModData.getOrCreate("MyMod")   -- Get or create mod data table

    if isNewGame then                               -- Brand new game
        print("New game - initializing fresh mod data")
        modData.score = 0                           -- Set default values
        modData.highScore = 0
    else                                             -- Loading existing game
        print("Loading game - mod data exists")
        print("Score: " .. (modData.score or 0))   -- Use existing values
    end
end)
```

**Parameters:**
- `isNewGame` (boolean) - True if new game, false if loading

**Most important event for persistent mod data.**

### OnReceiveGlobalModData

**When it fires:** Client receives global mod data from server (multiplayer).

**Use for:** Syncing mod data in multiplayer.

```lua
Events.OnReceiveGlobalModData.Add(function(key, data)
    print("Received mod data: " .. key)
    -- Update local copy of global data
end)
```

**Parameters:**
- `key` (string) - Data key
- `data` (table) - The data

---

## Complete Event List

All 144 events in Build 41, organized by category:

### Game/System (15)
OnGameBoot, OnMainMenuEnter, OnGameStart, OnNewGame, OnPreMapLoad, OnGameTimeLoaded, OnInitWorld, OnLoadMapZones, OnLoadedMapZones, OnSave, OnPostSave, OnResetLua, OnModsModified, OnChallengeQuery, OnGameStateEnter

### Player (12)
OnCreatePlayer, OnCreateSurvivor, OnPlayerUpdate, OnPlayerMove, OnPlayerDeath, OnPlayerAttackFinished, AddXP, LevelPerk, OnEquipPrimary, OnEquipSecondary, OnCharacterCreateStats, OnClothingUpdated

### Zombies (3)
OnZombieDead, OnZombieUpdate, OnHitZombie

### World/Objects (8)
OnContainerUpdate, OnObjectAdded, OnObjectAboutToBeRemoved, OnDestroyIsoThumpable, LoadGridsquare, OnWaterAmountChange, OnDoTileBuilding2, OnDoTileBuilding3

### Vehicles (7)
OnEnterVehicle, OnExitVehicle, OnSwitchVehicleSeat, OnUseVehicle, OnVehicleDamageTexture, OnVehicleHorn, OnMechanicActionDone

### Combat (5)
OnWeaponHitTree, OnWeaponHitXp, OnWeaponSwingHitPoint, OnPressRackButton, OnPressReloadButton

### Crafting (2)
OnMakeItem, OnDynamicMovableRecipe

### UI/Input (16)
OnCreateUI, OnFillInventoryObjectContextMenu, OnFillWorldObjectContextMenu, OnPreUIDraw, OnPostUIDraw, OnResolutionChange, OnKeyPressed, OnKeyStartPressed, OnKeyKeepPressed, OnCustomUIKey, OnMouseDown, OnRightMouseDown, OnPressWalkTo, OnObjectLeftMouseButtonDown, OnObjectLeftMouseButtonUp, OnObjectRightMouseButtonDown, OnObjectRightMouseButtonUp

### Time (9)
OnTick, OnTickEvenPaused, OnRenderTick, EveryOneMinute, EveryTenMinutes, EveryHours, EveryDays, OnDawn, OnDusk

### Weather (8)
OnClimateManagerInit, OnClimateTick, OnClimateTickDebug, OnThunderEvent, OnWeatherPeriodStart, OnWeatherPeriodStage, OnWeatherPeriodComplete, OnInitSeasons

### Multiplayer (24)
OnConnected, OnConnectFailed, OnConnectionStateChanged, OnDisconnect, OnServerStarted, OnServerStartSaving, OnServerFinishSaving, OnClientCommand, OnServerCommand, OnAdminMessage, OnCoopJoinFailed, OnCoopServerMessage, OnLoginState, OnLoginStateSuccess, OnServerStatisticReceived, OnAcceptInvite, AcceptedFactionInvite, ReceiveFactionInvite, SyncFaction, AcceptedSafehouseInvite, ReceiveSafehouseInvite, OnSafehousesChanged, AcceptedTrade, RequestTrade, TradingUIAddItem, TradingUIRemoveItem, TradingUIUpdateState

### Chat/Social (10)
OnAddMessage, OnChatWindowInit, SwitchChatStream, OnScoreboardUpdate, OnMiniScoreboardUpdate

### Gamepad (7)
OnGamepadConnect, OnGamepadDisconnect, OnJoypadActivate, OnJoypadActivateUI, OnJoypadDeactivate, OnJoypadReactivate, OnJoypadBeforeDeactivate, OnJoypadBeforeReactivate, OnJoypadRenderUI

### Global Objects (4)
OnCGlobalObjectSystemInit, OnSGlobalObjectSystemInit, OnInitGlobalModData, OnReceiveGlobalModData

### Misc (14)
OnDeviceText, OnDistributionMerge, OnPreDistributionMerge, OnPostDistributionMerge, OnDoSpecialTooltip, onEnableSearchMode, onUpdateIcon, OnGetDBSchema, OnGetTableResult, MngInvReceiveItems, OnInitRecordedMedia, OnLoadRadioScripts, OnLoadSoundBanks, OnReceiveUserlog, OnSetDefaultTab, OnTabAdded, OnTabRemoved, OnTemplateTextInit, ServerPinged, ViewTickets

### Steam (12)
OnSteamFriendStatusChanged, OnSteamGameJoin, OnSteamRefreshInternetServers, OnSteamRulesRefreshComplete, OnSteamServerFailedToRespond2, OnSteamServerResponded, OnSteamServerResponded2, OnSteamWorkshopItemCreated, OnSteamWorkshopItemNotCreated, OnSteamWorkshopItemUpdated, OnSteamWorkshopItemNotUpdated, OnServerWorkshopItems

---

## Common Mistakes

### Mistake 1: Heavy Work in OnTick/OnPlayerUpdate

**Wrong - Performance Killer:**

```lua
Events.OnTick.Add(function()
    -- This runs 60+ times per second!
    for i = 1, 1000 do
        -- Expensive calculations
    end
    -- Will cause severe lag
end)
```

**Correct - Use Appropriate Timing:**

```lua
Events.EveryTenMinutes.Add(function()
    -- Runs every 10 minutes instead
    for i = 1, 1000 do
        -- Same work, but only every 10 minutes
    end
    -- No performance impact
end)
```

**The rule:** Use the least frequent event that works for your use case. OnTick should be extremely rare.

### Mistake 2: Not Checking for Nil

**Wrong - Will Crash:**

```lua
Events.OnEquipPrimary.Add(function(player, item)
    print("Equipped: " .. item:getName())     -- Crashes if unequipping (item is nil)
end)
```

**Correct - Always Check:**

```lua
Events.OnEquipPrimary.Add(function(player, item)
    if item then                               -- Check if item exists
        print("Equipped: " .. item:getName())
    else
        print("Unequipped")
    end
end)
```

**The rule:** Many events can pass nil parameters. Always check before using them.

### Mistake 3: Not Using Guard Clauses

**Wrong - Wastes Performance:**

```lua
Events.OnPlayerUpdate.Add(function(player)
    -- Runs all this code every frame
    if player and not player:isDead() then
        -- Do something
    end
end)
```

**Correct - Exit Early:**

```lua
Events.OnPlayerUpdate.Add(function(player)
    if not player then return end              -- Exit immediately if no player
    if player:isDead() then return end         -- Exit immediately if dead

    -- Only runs if player exists and is alive
    -- Do something
end)
```

**The rule:** Exit early if conditions aren't met. Don't nest your entire function in if statements.

### Mistake 4: Forgetting to Remove Event Handlers

**Wrong - Memory Leak:**

```lua
-- Add handler but never remove it
local function myHandler()
    -- Do stuff
end

Events.OnGameStart.Add(myHandler)
-- Handler stays forever, even if you don't need it
```

**Correct - Remove When Done:**

```lua
local function myHandler()
    -- Do stuff

    -- If this only needs to run once:
    Events.OnGameStart.Remove(myHandler)       -- Remove self after running
end

Events.OnGameStart.Add(myHandler)
```

**The rule:** If a handler only needs to run once or for a limited time, remove it when done.

### Mistake 5: Wrong Event for Context Menus

**Wrong - Won't Work:**

```lua
Events.OnGameStart.Add(function()
    -- Trying to add menu options here doesn't work
    -- Menu hasn't been created yet
end)
```

**Correct - Use Appropriate Event:**

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(playerIndex, context, items)
    -- This is the right place for inventory menu options
    context:addOption("My Option", items, myFunction)
end)
```

**The rule:** Use `OnFillInventoryObjectContextMenu` for inventory menus, `OnFillWorldObjectContextMenu` for world menus.

---

## Try It Yourself

Let's practice using events with real examples.

### Exercise 1: Create a Simple Death Message

**Challenge:** When a player dies, print a custom message with their name and how many days they survived.

**Requirements:**
- Use OnPlayerDeath event
- Get player's username
- Get days survived from game time
- Print a message

Try writing it yourself first!

---

**Solution:**

```lua
Events.OnPlayerDeath.Add(function(player)
    local name = player:getUsername()              -- Get player name
    local gameTime = getGameTime()                 -- Get game time object
    local days = gameTime:getNightsSurvived() + 1  -- Days survived (starts at 0)

    print(name .. " survived " .. days .. " days before dying")
end)
```

### Exercise 2: Create a Periodic Health Check

**Challenge:** Every 10 in-game minutes, check if the player's health is below 50% and print a warning.

**Requirements:**
- Use EveryTenMinutes event
- Get player
- Check health
- Print warning if low

---

**Solution:**

```lua
Events.EveryTenMinutes.Add(function()
    local player = getPlayer()                     -- Get the player
    if not player then return end                  -- Guard clause

    local bodyDamage = player:getBodyDamage()      -- Get body damage object
    local health = bodyDamage:getOverallBodyHealth() -- Get health (0-100)

    if health < 50 then                            -- Check if below 50%
        print("WARNING: Health is low! (" .. math.floor(health) .. "%)")
    end
end)
```

### Exercise 3: Add a Custom Item Menu Option

**Challenge:** Add a "Inspect" option to the right-click menu for all items that prints the item's name and weight.

**Requirements:**
- Use OnFillInventoryObjectContextMenu
- Add menu option
- Create function to handle the option
- Print item details

---

**Solution:**

```lua
-- The menu function - called when player clicks the option
local function inspectItem(items)
    local item = items[1]                          -- Get first item
    local name = item:getName()                    -- Item name
    local weight = item:getWeight()                -- Item weight

    print("Item: " .. name)
    print("Weight: " .. weight)
end

-- Add the menu option
Events.OnFillInventoryObjectContextMenu.Add(function(playerIndex, context, items)
    if items and #items > 0 then                   -- Check if items exist
        context:addOption(
            "Inspect",                             -- Menu text
            items,                                  -- Items to pass to function
            inspectItem                             -- Function to call
        )
    end
end)
```

---

## Best Practices

### Performance - Choose the Right Timing Event

```lua
-- BAD: Heavy work every tick
Events.OnTick.Add(function()
    expensiveCalculation()                         -- Runs 60+ times per second
end)

-- GOOD: Use appropriate interval
Events.EveryTenMinutes.Add(function()
    expensiveCalculation()                         -- Runs every 10 minutes
end)
```

**Event hierarchy** (most frequent to least):
1. OnTick / OnPlayerUpdate - Every frame (60+ per second)
2. OnRenderTick - Every render frame
3. EveryOneMinute - Every in-game minute
4. EveryTenMinutes - Every 10 minutes ← **Sweet spot for most periodic work**
5. EveryHours - Hourly
6. EveryDays - Daily

**Rule:** Use the least frequent event that works for your needs.

### Cleanup - Remove Handlers When Done

```lua
-- Store function reference
local function oneTimeSetup()
    -- Do initialization
    print("Setup complete")

    -- Remove self - only runs once
    Events.OnGameStart.Remove(oneTimeSetup)
end

-- Add handler
Events.OnGameStart.Add(oneTimeSetup)
```

**Why:** Prevents memory leaks and unnecessary function calls.

### Guard Clauses - Exit Early

```lua
Events.OnPlayerUpdate.Add(function(player)
    -- Exit early if conditions not met
    if not player then return end                  -- No player
    if player:isDead() then return end             -- Player dead
    if player:isAsleep() then return end           -- Player sleeping

    -- Only runs if all conditions met
    -- Do actual work here
end)
```

**Why:** Better performance, cleaner code, avoids nil errors.

### Nil Checking - Always Validate

```lua
Events.OnEquipPrimary.Add(function(player, item)
    -- item can be nil when unequipping!
    if item then
        -- Safe to use item
        print("Equipped: " .. item:getName())
    end
end)
```

**Why:** Many events can pass nil. Always check before using optional parameters.

### Event Namespacing - Organize Your Handlers

```lua
-- Group related handlers in a table
MyMod = MyMod or {}
MyMod.Events = {}

-- Store handlers with descriptive names
MyMod.Events.onPlayerDeath = function(player)
    -- Death handling
end

MyMod.Events.onGameStart = function()
    -- Initialization
end

-- Register them
Events.OnPlayerDeath.Add(MyMod.Events.onPlayerDeath)
Events.OnGameStart.Add(MyMod.Events.onGameStart)
```

**Why:** Easier to organize, debug, and remove handlers later.

---

## Key Takeaways

1. **Events are callbacks**
   - You subscribe, the game calls your function
   - Don't call event callbacks yourself
   - Think of it like subscribing to notifications

2. **Choose appropriate timing events**
   - OnTick = Every frame (use sparingly!)
   - EveryTenMinutes = Sweet spot for most periodic work
   - OnGameStart = Initialization
   - Right event = good performance

3. **Always check for nil**
   - Many events can pass nil parameters
   - Check before using: `if item then ... end`
   - Guard clauses at the start of functions

4. **Context menu events are special**
   - OnFillInventoryObjectContextMenu = Inventory right-clicks
   - OnFillWorldObjectContextMenu = World right-clicks
   - Use these to add custom actions

5. **Most commonly used events**
   - OnGameStart - Initialization
   - OnPlayerDeath - Death handling
   - OnFillInventoryObjectContextMenu - Item actions
   - EveryTenMinutes - Periodic updates
   - OnKeyStartPressed - Hotkeys

6. **Performance matters**
   - Don't use OnTick unless absolutely necessary
   - Use guard clauses to exit early
   - Remove handlers when done
   - Profile your code

7. **There are 144 events total**
   - You'll use about 10-15 regularly
   - Reference this document when you need specific events
   - Check vanilla code for examples

8. **Events fire automatically**
   - You register once
   - Game calls your function when event fires
   - You receive event-specific parameters
   - React to what happened

You now have a complete reference of Project Zomboid's event system. Use this as your go-to resource when you need to know "which event fires when X happens."

---

## What's Next?

Ready to use events in your mods?

- [Global Functions Reference](/build-41/modding/reference/globals) - Functions available in events
- [Script Properties Reference](/build-41/modding/reference/script-properties) - Item and recipe properties
- [Your First Lua Script](/build-41/modding/lua/first-script) - Create a mod that uses events
