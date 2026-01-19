---
id: events-lifecycle
slug: events-lifecycle
title: Lifecycle Events
excerpt: Lifecycle events control the flow of your mod from game boot to shutdown. Understanding when each event fires is crucial for proper initialization and cleanup. Events.OnGameBoot.Add(function()...
game: pz
version: build-41
section: modding
category: lua-api
subcategory: null
difficulty: intermediate
tags:
  - events
  - lifecycle
  - initialization
  - save
  - load
  - time
  - intermediate
last_updated: 2026-01-10
---
# Lifecycle Events

## Overview

Lifecycle events control the flow of your mod from game boot to shutdown. Understanding when each event fires is crucial for proper initialization and cleanup.

---

## Game Boot Events

### OnGameBoot
**When:** Game executable starts, before main menu
**Parameters:** None
**Use Case:** Early mod initialization, global setup before anything else loads

```lua
Events.OnGameBoot.Add(function()
    print("Game is booting up")
    -- Initialize global mod data
    -- Register custom Lua events
    -- Set up global tables
end)
```
**Files that listen:** 14+ vanilla files

---

### OnMainMenuEnter
**When:** Main menu screen is displayed
**Parameters:** None
**Use Case:** Menu modifications, pre-game setup, mod version checks

```lua
Events.OnMainMenuEnter.Add(function()
    print("Entered main menu")
    -- Add custom menu buttons
    -- Check for mod updates
end)
```
**Files that listen:** 8+ vanilla files

---

### OnPreMapLoad
**When:** Before map data loads
**Parameters:** None
**Use Case:** Map preparation, custom map data loading

```lua
Events.OnPreMapLoad.Add(function()
    -- Prepare custom map data
end)
```

---

### OnInitWorld
**When:** World is initializing
**Parameters:** None
**Use Case:** World data setup before game starts

```lua
Events.OnInitWorld.Add(function()
    -- Initialize world-level mod data
end)
```

---

## Game Start Events

### OnGameStart
**When:** New game starts OR save is loaded, player is ready
**Parameters:** None
**Use Case:** **Most common initialization point for mods**

```lua
Events.OnGameStart.Add(function()
    local player = getPlayer()
    print("Game started for", player:getUsername())
    
    -- Initialize your mod
    -- Setup UI elements
    -- Load saved mod data
end)
```
**Files that listen:** 39+ vanilla files (MOST USED EVENT)

---

### OnNewGame
**When:** New game is created (NOT on load)
**Parameters:** `player` (IsoPlayer), `square` (IsoGridSquare)
**Use Case:** First-time setup, starter items, initial mod state

```lua
Events.OnNewGame.Add(function(player, square)
    -- Give starter items (only on new game)
    player:getInventory():AddItem("Base.Hammer")
    
    -- Initialize fresh mod data
    player:getModData().myMod = {
        firstPlaythrough = true,
        startDay = getGameTime():getDay()
    }
end)
```

---

### OnCreatePlayer
**When:** Player character is created
**Parameters:** `playerIndex` (int), `player` (IsoPlayer)
**Use Case:** Player-specific initialization, per-player data setup

```lua
Events.OnCreatePlayer.Add(function(playerIndex, player)
    print("Player", playerIndex, "created:", player:getUsername())
    
    -- Initialize player-specific data
    local modData = player:getModData()
    modData.myMod = modData.myMod or {
        level = 1,
        experience = 0
    }
end)
```

---

### OnGameTimeLoaded
**When:** Game time data is loaded
**Parameters:** None
**Use Case:** Time-dependent initialization

```lua
Events.OnGameTimeLoaded.Add(function()
    local time = getGameTime()
    print("World age:", time:getWorldAgeHours(), "hours")
    print("Current day:", time:getDay())
end)
```

---

## Save/Load Events

### OnSave
**When:** Game is being saved
**Parameters:** None
**Use Case:** Persist mod data to save file

```lua
Events.OnSave.Add(function()
    -- Save mod data using ModData
    local data = ModData.getOrCreate("MyMod")
    data.lastSave = getGameTime():getWorldAgeHours()
    data.settings = MyMod.settings
    data.state = MyMod.state
end)
```

---

### OnPostSave
**When:** After game save completes
**Parameters:** None
**Use Case:** Post-save cleanup, confirmation messages

```lua
Events.OnPostSave.Add(function()
    print("Save complete!")
end)
```

---

### OnResetLua
**When:** Lua state is reset (debug/reload)
**Parameters:** `reason` (string)
**Use Case:** Re-initialization after Lua reload, cleanup

```lua
Events.OnResetLua.Add(function(reason)
    print("Lua reset:", reason)
    -- Re-register event handlers
    -- Reinitialize state
end)
```

---

## Time Events

### OnTick
**When:** Every game tick (most frequent)
**Parameters:** `tick` (double)
**Use Case:** High-frequency updates (use sparingly!)

```lua
-- WARNING: This runs every frame (30-60 times/second)
local tickCounter = 0
Events.OnTick.Add(function(tick)
    tickCounter = tickCounter + 1
    if tickCounter >= 60 then  -- ~1 second
        tickCounter = 0
        -- Do periodic work
    end
end)
```
**Files that listen:** 31+ vanilla files

---

### OnTickEvenPaused
**When:** Every tick, even when game is paused
**Parameters:** `tick` (double)
**Use Case:** UI updates during pause, background processing

---

### OnRenderTick
**When:** Every render frame
**Parameters:** None
**Use Case:** Visual effects, UI updates that need to sync with rendering

---

### EveryOneMinute
**When:** Every in-game minute
**Parameters:** None
**Use Case:** Periodic updates without performance impact

```lua
Events.EveryOneMinute.Add(function()
    local player = getPlayer()
    if player and player:isOutside() then
        -- Check weather effects once per minute
        checkWeatherEffects(player)
    end
end)
```

---

### EveryTenMinutes
**When:** Every 10 in-game minutes
**Parameters:** None
**Use Case:** Less frequent periodic updates

```lua
Events.EveryTenMinutes.Add(function()
    -- Update hunger effects
    -- Process pending crafts
end)
```

---

### EveryHours
**When:** Every in-game hour
**Parameters:** None
**Use Case:** Hourly updates, resource regeneration

```lua
Events.EveryHours.Add(function()
    local time = getGameTime()
    print("Hour:", time:getHour(), "Day:", time:getDay())
end)
```

---

### EveryDays
**When:** Every in-game day
**Parameters:** None
**Use Case:** Daily updates, respawning, statistics

```lua
Events.EveryDays.Add(function()
    local day = getGameTime():getDay()
    print("Day", day, "has begun")
    -- Daily reset
    -- Respawn resources
end)
```

---

### OnDawn
**When:** Dawn begins
**Parameters:** None
**Use Case:** Morning events, light-dependent features

```lua
Events.OnDawn.Add(function()
    print("The sun is rising")
end)
```
**Triggered in:** `season.lua:322`

---

### OnDusk
**When:** Dusk begins
**Parameters:** None
**Use Case:** Evening events, night preparation

```lua
Events.OnDusk.Add(function()
    print("Night is coming")
end)
```
**Triggered in:** `season.lua:318`

---

## Event Order

Understanding the order events fire is crucial:

### Game Boot Sequence
```
1. OnGameBoot           ← Game executable starts
2. OnMainMenuEnter      ← Main menu displayed
3. [Player creates/loads game]
4. OnPreMapLoad         ← Before map loads
5. OnInitWorld          ← World initializing
6. OnGameTimeLoaded     ← Time data ready
7. OnCreatePlayer       ← Player created
8. OnNewGame (if new)   ← Only on new game
9. OnGameStart          ← Player ready to play
```

### Save Sequence
```
1. OnSave               ← Save begins
2. [Game writes data]
3. OnPostSave           ← Save complete
```

### Time Event Frequency
```
OnTick              ← Every frame (~60/sec)
OnRenderTick        ← Every render frame
EveryOneMinute      ← Every in-game minute
EveryTenMinutes     ← Every 10 in-game minutes
EveryHours          ← Every in-game hour
EveryDays           ← Every in-game day
OnDawn/OnDusk       ← Specific times of day
```

---

## Common Patterns

### Initialization with Save Support

```lua
local MyMod = {}

-- Initialize on game start
Events.OnGameStart.Add(function()
    -- Load saved data or create new
    local saved = ModData.getOrCreate("MyMod")
    MyMod.data = saved.data or {}
    MyMod.settings = saved.settings or { enabled = true }
    MyMod.initialized = true
end)

-- New game specific setup
Events.OnNewGame.Add(function(player, square)
    MyMod.data = {
        startDay = getGameTime():getDay(),
        totalKills = 0
    }
end)

-- Save data
Events.OnSave.Add(function()
    if MyMod.initialized then
        local saved = ModData.getOrCreate("MyMod")
        saved.data = MyMod.data
        saved.settings = MyMod.settings
    end
end)
```

### Throttled Updates

```lua
local lastUpdate = 0
local UPDATE_INTERVAL = 60  -- 60 ticks = ~1 second

Events.OnTick.Add(function(tick)
    lastUpdate = lastUpdate + 1
    if lastUpdate >= UPDATE_INTERVAL then
        lastUpdate = 0
        -- Do your periodic work here
        performUpdate()
    end
end)

-- OR use EveryOneMinute for better performance
Events.EveryOneMinute.Add(function()
    performUpdate()
end)
```

### Multi-Stage Initialization

```lua
local MyMod = { stage = 0 }

Events.OnGameBoot.Add(function()
    MyMod.stage = 1
    -- Register global data
end)

Events.OnMainMenuEnter.Add(function()
    MyMod.stage = 2
    -- Setup menu elements
end)

Events.OnGameStart.Add(function()
    MyMod.stage = 3
    -- Full initialization
end)
```

---

## Related

- [Events Overview](/build-41/modding/lua-api/events-overview) - Introduction to events
- [Player Events](/build-41/modding/lua-api/events-player) - Player-specific events
- [Timed Actions](/build-41/modding/lua-api/timed-actions) - Custom action system 