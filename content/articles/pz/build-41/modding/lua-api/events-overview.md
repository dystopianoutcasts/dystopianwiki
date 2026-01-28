---
id: events-overview
slug: events-overview
title: "Events Overview"
game: pz
version: build-41
section: modding
category: lua-api
subcategory: null
difficulty: beginner
tags:
  - events
  - callbacks
  - basics
  - lua
  - api
excerpt: "Introduction to Project Zomboid's event-driven architecture with ~150 events for hooking into game systems."
table_of_contents:
  - text: "Introduction"
    link: "#introduction"
  - text: "Event System Architecture"
    link: "#event-system-architecture"
  - text: "Registering Callbacks"
    link: "#registering-callbacks"
  - text: "Removing Callbacks"
    link: "#removing-callbacks"
  - text: "Event Categories"
    link: "#event-categories"
  - text: "Most Used Events"
    link: "#most-used-events"
  - text: "Common Patterns"
    link: "#common-patterns"
  - text: "Performance Best Practices"
    link: "#performance-best-practices"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-10
---

# Events Overview

## Introduction

Project Zomboid uses an **event-driven architecture** where game systems broadcast events that mods can hook into. The `Events` table contains **~150 unique events** that fire during gameplay, UI interactions, and game state changes.

Instead of constantly checking for conditions, your mod can "listen" for specific game events and respond when they occur.

---

## Event System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Java Engine                              │
│  (Defines most events, triggers from game code)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ triggerEvent()
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   LuaEventManager                            │
│  - Manages event registration                                │
│  - Routes events to registered handlers                      │
│  - LuaEventManager.AddEvent("EventName") for Lua events      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Events.EventName                          │
│  - Events.EventName.Add(function)                            │
│  - Events.EventName.Remove(function)                         │
└─────────────────────────────────────────────────────────────┘
```

Most events are defined in the Java engine and triggered by game code. The `LuaEventManager` routes these events to Lua handlers registered via the `Events` table.

---

## Registering Callbacks

To listen for an event, use the `Events` table:

```lua
-- Anonymous function (simple but can't be removed)
Events.OnGameStart.Add(function()
    print("The game has started!")
end)

-- Named function (recommended - can be removed)
local function onGameStart()
    print("The game has started!")
end
Events.OnGameStart.Add(onGameStart)
```

### Event Parameters

Many events pass parameters to your callback. Always check the documentation for each event:

```lua
Events.OnPlayerDeath.Add(function(player)
    print(player:getUsername() .. " has died!")
end)

Events.OnCreatePlayer.Add(function(playerIndex, player)
    print("Player " .. playerIndex .. " created: " .. player:getUsername())
end)
```

### Removing Callbacks

To remove a callback, you must have a reference to the function:

```lua
local function myHandler()
    -- Do something once
    Events.OnGameStart.Remove(myHandler)
end

Events.OnGameStart.Add(myHandler)
```

---

## Event Categories

| Category | Events | Description | Article |
|----------|--------|-------------|----------|
| **Lifecycle** | 15 | Game boot, start, save, load | [Lifecycle Events](/build-41/modding/lua-api/events-lifecycle) |
| **Player** | 12 | Movement, death, updates, XP | [Player Events](/build-41/modding/lua-api/events-player) |
| **Input** | 10 | Keyboard, mouse, joypad | [Input Events](/build-41/modding/lua-api/events-input) |
| **UI** | 8 | Context menus, UI creation | [UI Events](/build-41/modding/lua-api/events-ui) |
| **World** | 12 | Objects, time, weather | [World Events](/build-41/modding/lua-api/events-world) |
| **Vehicles** | 8 | Enter, exit, damage | [Vehicle Events](/build-41/modding/lua-api/events-vehicle) |
| **Zombies** | 4 | Death, updates, hits | [Combat Events](/build-41/modding/lua-api/events-combat) |
| **Multiplayer** | 20 | Connection, chat, factions | [Multiplayer Events](/build-41/modding/lua-api/events-multiplayer) |
| **Time** | 6 | Ticks, minutes, hours, days | [Lifecycle Events](/build-41/modding/lua-api/events-lifecycle) |
| **Foraging** | 5 | Search mode, icons | Foraging Events |

---

## Most Used Events

These are the events you'll use in almost every mod:

### OnGameStart
**The most common initialization point for mods.** Fires when a new game starts or save is loaded.

```lua
Events.OnGameStart.Add(function()
    local player = getPlayer()
    print("Game started for", player:getUsername())
    -- Initialize your mod here
end)
```
**Listeners:** 39+ vanilla files use this event

---

### OnCreatePlayer
Player character is created. Good for per-player initialization.

```lua
Events.OnCreatePlayer.Add(function(playerIndex, player)
    player:getModData().myMod = { level = 1 }
end)
```

---

### OnFillWorldObjectContextMenu
Right-click context menu on world objects. Essential for adding custom actions.

```lua
Events.OnFillWorldObjectContextMenu.Add(function(playerIndex, context, worldobjects, test)
    for _, obj in ipairs(worldobjects) do
        if instanceof(obj, "IsoThumpable") then
            context:addOption("My Action", obj, myFunction)
        end
    end
end)
```

---

### OnFillInventoryObjectContextMenu
Right-click context menu on inventory items.

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(playerIndex, context, items)
    for _, item in ipairs(items) do
        if item:getFullType() == "Base.Hammer" then
            context:addOption("Special Action", item, myFunction)
        end
    end
end)
```

---

### OnKeyPressed
Key press detection. Perfect for hotkeys.

```lua
Events.OnKeyPressed.Add(function(key)
    if key == Keyboard.KEY_F5 then
        print("F5 pressed!")
    end
end)
```
**Listeners:** 31+ vanilla files use this event

---

## Common Patterns

### Initialization Pattern

```lua
local MyMod = {}
MyMod.isInitialized = false

local function initMod()
    if MyMod.isInitialized then return end
    MyMod.isInitialized = true
    
    -- Setup your mod
    print("MyMod initialized!")
end

Events.OnGameStart.Add(initMod)
```

### Per-Player Data Pattern

```lua
Events.OnCreatePlayer.Add(function(playerIndex, player)
    local modData = player:getModData()
    if not modData.myMod then
        modData.myMod = {
            level = 1,
            experience = 0,
            settings = {}
        }
    end
end)
```

### Periodic Update Pattern

```lua
-- Using EveryOneMinute instead of OnTick for better performance
Events.EveryOneMinute.Add(function()
    local player = getPlayer()
    if player then
        -- Periodic updates here
    end
end)
```

### One-Time Event Pattern

```lua
local function oneTimeHandler()
    print("This only runs once")
    Events.OnGameStart.Remove(oneTimeHandler)
end
Events.OnGameStart.Add(oneTimeHandler)
```

---

## Performance Best Practices

### 1. Avoid High-Frequency Events

```lua
-- BAD: OnTick runs every frame (30-60 times/second)
Events.OnTick.Add(function(tick)
    -- Heavy computation here = lag
end)

-- GOOD: Use less frequent events
Events.EveryOneMinute.Add(function()
    -- Runs once per in-game minute
end)
```

### 2. Early Exit When Possible

```lua
Events.OnPlayerUpdate.Add(function(player)
    -- Exit early if not relevant
    if not player:isOutside() then return end
    if not player:isMoving() then return end
    
    -- Only process when needed
    checkWeatherEffects(player)
end)
```

### 3. Cache Expensive Operations

```lua
local cachedItems = nil
local cacheTime = 0

Events.EveryTenMinutes.Add(function()
    -- Only recalculate every 10 minutes
    cachedItems = calculateItems()
    cacheTime = getTimestamp()
end)
```

### 4. Use Specific Events

```lua
-- BAD: Checking death in OnPlayerUpdate
Events.OnPlayerUpdate.Add(function(player)
    if player:isDead() then handleDeath(player) end
end)

-- GOOD: Use the specific event
Events.OnPlayerDeath.Add(function(player)
    handleDeath(player)
end)
```

### 5. Clean Up Callbacks

```lua
-- Remove listeners when no longer needed
function MyMod.shutdown()
    Events.OnTick.Remove(MyMod.tickHandler)
    Events.OnGameStart.Remove(MyMod.initHandler)
end
```

---

## Related

- [Lifecycle Events](/build-41/modding/lua-api/events-lifecycle) - Game boot, start, save events
- [Player Events](/build-41/modding/lua-api/events-player) - Player-specific events
- [Context Menus](/build-41/modding/lua-api/context-menus) - ISContextMenu system
- [Timed Actions](/build-41/modding/lua-api/timed-actions) - ISBaseTimedAction for custom actions
- [Events Reference](/build-41/modding/reference/events) - Complete event list
