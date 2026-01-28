---
id: events-overview
slug: events-overview
title: "Understanding Events"
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
  - beginner
excerpt: "Learn how to make your mod respond to things happening in Project Zomboid - when players do things, when time passes, when the world changes."
table_of_contents:
  - text: "What Are Events?"
    link: "#what-are-events"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Where Does This Go?"
    link: "#where-does-this-go"
  - text: "The Simplest Example"
    link: "#the-simplest-example"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "How Events Work"
    link: "#how-events-work"
  - text: "Events With Parameters"
    link: "#events-with-parameters"
  - text: "Most Used Events"
    link: "#most-used-events"
  - text: "Event Categories"
    link: "#event-categories"
  - text: "Common Patterns"
    link: "#common-patterns"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Performance Tips"
    link: "#performance-tips"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "What's Next?"
    link: "#whats-next"
next_steps:
  - title: "Context Menus"
    path: /pz/build-41/modding/lua-api/context-menus
  - title: "Timed Actions"
    path: /pz/build-41/modding/lua-api/timed-actions
  - title: "Events Reference"
    path: /pz/build-41/modding/reference/events
last_updated: 2026-01-28
---

# Understanding Events

## What Are Events?

We've all noticed things that happen in Project Zomboid: a zombie dies and drops loot, we press a key and our inventory opens, time passes and our character gets hungry, we right-click something and a menu appears.

Behind each of these moments, the game announces: "Hey, something just happened!" These announcements are called **events**.

**Events let our mod respond to things happening in the game.** Instead of constantly checking "did the player die? did the player die? did the player die?" 60 times per second, we can just say "tell me when the player dies" and the game will let us know.

When I first learned about events, I thought I'd need to memorize hundreds of them. But here's the good news: there are really only 5-10 events we'll use in most mods. We'll start with just one.

**We'd use events when we want to:**
- Do something when the game starts (initialize our mod)
- Add options to right-click menus
- Respond to player actions (death, level up, etc.)
- Run code periodically (every minute, every hour)
- React to keyboard/mouse input

---

## Prerequisites

Before this article, we should understand:
- Basic Lua syntax (variables, functions)
- How to create a mod folder with mod.info

If we've made any mod that prints text to the console, we're ready.

---

## Where Does This Go?

Event code can go in **client**, **server**, or **shared** depending on what the event does:

```
MyMod/
├── mod.info
└── media/
    └── lua/
        ├── client/              ← UI events, key presses, local player
        │   └── MyClientMod.lua
        ├── server/              ← World changes, spawning, admin
        │   └── MyServerMod.lua
        └── shared/              ← Runs on both (careful!)
            └── MySharedMod.lua
```

**Rule of thumb:**
- **OnKeyPressed**, **OnFillInventoryObjectContextMenu** → `client/` (player's screen)
- **OnClientCommand**, server admin events → `server/`
- **OnGameStart** → usually `client/` for single-player mods

When in doubt, start with `client/`. We'll know if it's wrong because the event won't fire or we'll get an error.

---

## The Simplest Example

Let's make the game print a message when it starts:

```lua
-- This function will be "called back" when the game starts
local function onGameStart()
    print("Hello from my mod!")
end

-- Tell the game: "Call my function when OnGameStart happens"
Events.OnGameStart.Add(onGameStart)
```

**Line by line:**

| Line | What It Does |
|------|-------------|
| `local function onGameStart()` | Define a function - our code to run |
| `print("Hello from my mod!")` | What we want to happen |
| `Events.OnGameStart.Add(onGameStart)` | Subscribe to the event |

The last line is where the magic happens. `Events` is a table containing all the game's events. `OnGameStart` is one specific event. `.Add()` tells the game "add my function to the list of things to call."

The function we pass to `.Add()` is called a **callback** - it's our code that gets "called back" when the event happens. We'll see this term everywhere in modding.

> **Key Takeaway:** The pattern is always: `Events.EventName.Add(ourFunction)`. That's it. Everything else is just learning which events exist and what parameters they pass.

---

## Try It Yourself

**Step 1:** Create a file at `MyMod/media/lua/client/TestEvents.lua`

```lua
local function onGameStart()
    print("=== MY MOD LOADED ===")
    print("Events are working!")
end

Events.OnGameStart.Add(onGameStart)
```

**Step 2:** Create `MyMod/mod.info` if we don't have one:

```
name=Test Events Mod
id=TestEventsMod
description=Testing the event system
```

**Step 3:** Enable the mod and start a game (new or load existing)

**Step 4:** Open the console (press `~` or check the Zomboid folder for `console.txt`)

**Step 5:** Look for our messages: `=== MY MOD LOADED ===`

If we see it, events are working! If not, check:
- Is the mod enabled in the mod list?
- Is the file in the right folder (`client/`)?
- Any typos in `Events.OnGameStart`?

---

## How Events Work

Here's what happens behind the scenes:

```
1. Game reaches a moment (player dies, key pressed, etc.)
         ↓
2. Game announces: "The OnPlayerDeath event is happening!"
         ↓
3. Every function registered with Events.OnPlayerDeath.Add()
   gets called, one by one
         ↓
4. Our callback runs with whatever data the event provides
```

This is sometimes called "subscribing" to an event - we're saying "I want to be notified when this happens."

> **Key Takeaway:** We don't call our callback function directly. We register it, and the game calls it for us when the event fires.

---

## Events With Parameters

Many events pass information to our callback. For example, `OnPlayerDeath` tells us WHICH player died:

```lua
local function onPlayerDeath(player)
    -- 'player' is passed to us by the event
    print(player:getUsername() .. " has died!")
end

Events.OnPlayerDeath.Add(onPlayerDeath)
```

Different events pass different parameters. `OnCreatePlayer` passes two:

```lua
local function onCreatePlayer(playerIndex, player)
    -- playerIndex = which player (0 for first, 1 for split-screen second, etc.)
    -- player = the actual player object
    print("Player " .. playerIndex .. " created: " .. player:getUsername())
end

Events.OnCreatePlayer.Add(onCreatePlayer)
```

How do we know what parameters an event passes? Check the documentation for that specific event, or look at how vanilla code uses it. We don't need to memorize all of them - we look them up when we need them.

---

## Most Used Events

Out of ~150 events in PZ, we'll use these ones constantly:

### OnGameStart
**When:** A new game starts or a save is loaded.
**Use for:** Initializing our mod, setting up data.

```lua
Events.OnGameStart.Add(function()
    print("Game started!")
    -- Set up our mod here
end)
```

### OnKeyPressed
**When:** Any key is pressed.
**Use for:** Custom hotkeys.

```lua
Events.OnKeyPressed.Add(function(key)
    if key == Keyboard.KEY_F5 then
        print("F5 was pressed!")
    end
end)
```

### OnFillInventoryObjectContextMenu
**When:** Player right-clicks an item in their inventory.
**Use for:** Adding custom actions to items.

```lua
Events.OnFillInventoryObjectContextMenu.Add(function(playerIndex, context, items)
    -- 'context' is the menu we add options to
    -- 'items' is what was right-clicked
    context:addOption("My Custom Action", items, myFunction)
end)
```

### OnFillWorldObjectContextMenu
**When:** Player right-clicks something in the world.
**Use for:** Adding actions to world objects (doors, furniture, etc.).

```lua
Events.OnFillWorldObjectContextMenu.Add(function(playerIndex, context, worldobjects, test)
    -- worldobjects = what was right-clicked in the world
    context:addOption("Examine", worldobjects, examineObject)
end)
```

### EveryOneMinute / EveryTenMinutes / EveryHours
**When:** Periodically, based on in-game time.
**Use for:** Regular updates without destroying performance.

```lua
Events.EveryOneMinute.Add(function()
    -- This runs once per in-game minute
    -- Much better than OnTick for most things
end)
```

> **Key Takeaway:** Start with OnGameStart for initialization and OnKeyPressed for testing. Add context menu events when we want right-click actions. Use periodic events instead of OnTick whenever possible.

---

## Event Categories

For reference, here's how events are organized:

| Category | Count | Examples |
|----------|-------|----------|
| **Lifecycle** | ~15 | OnGameStart, OnSave, OnLoad |
| **Player** | ~12 | OnPlayerDeath, OnPlayerUpdate, OnCreatePlayer |
| **Input** | ~10 | OnKeyPressed, OnMouseDown, OnMouseMove |
| **UI** | ~8 | OnFillInventoryObjectContextMenu, OnCreateUI |
| **World** | ~12 | OnObjectAdded, OnZombieUpdate |
| **Time** | ~6 | OnTick, EveryOneMinute, EveryHours |
| **Multiplayer** | ~20 | OnConnected, OnDisconnect, OnServerCommand |

We don't need to know all of these. We learn them as we need them.

---

## Common Patterns

### Initialize Once Pattern

Make sure our setup code only runs once:

```lua
local initialized = false

local function initMod()
    if initialized then return end
    initialized = true
    
    print("Mod initialized!")
    -- Setup code here
end

Events.OnGameStart.Add(initMod)
```

### Store Data on Player Pattern

Save custom data that persists with the player:

```lua
Events.OnCreatePlayer.Add(function(playerIndex, player)
    local modData = player:getModData()
    if not modData.myMod then
        modData.myMod = {
            level = 1,
            experience = 0
        }
    end
end)
```

### Remove After Running Pattern

For one-time events:

```lua
local function runOnce()
    print("This only runs once!")
    Events.OnGameStart.Remove(runOnce)  -- Remove ourselves
end

Events.OnGameStart.Add(runOnce)
```

---

## Common Mistakes

### Mistake: Forgetting to Add the function

```lua
-- WRONG: Defined the function but never registered it
local function onGameStart()
    print("Hello!")
end
-- Oops, we forgot Events.OnGameStart.Add(onGameStart)

-- RIGHT: Define AND register
local function onGameStart()
    print("Hello!")
end
Events.OnGameStart.Add(onGameStart)
```

**What we'll see:** Nothing happens. No error, just silence.

### Mistake: Typo in event name

```lua
-- WRONG: OnGamestart (lowercase 's')
Events.OnGamestart.Add(myFunction)  -- ERROR!

-- RIGHT: OnGameStart (capital 'S')
Events.OnGameStart.Add(myFunction)
```

**What we'll see:** "attempt to index nil value" error

### Mistake: Wrong number of parameters

```lua
-- WRONG: OnCreatePlayer passes TWO parameters, not one
Events.OnCreatePlayer.Add(function(player)
    print(player:getUsername())  -- This might work but playerIndex is lost
end)

-- RIGHT: Accept all parameters the event provides
Events.OnCreatePlayer.Add(function(playerIndex, player)
    print(player:getUsername())
end)
```

**What we'll see:** Might work, might crash, might have wrong values. Best to match the expected parameters.

### Mistake: Using OnTick for everything

```lua
-- BAD: OnTick runs 30-60 times per SECOND
Events.OnTick.Add(function()
    checkPlayerHealth()  -- This will cause lag
end)

-- GOOD: Use less frequent events
Events.EveryOneMinute.Add(function()
    checkPlayerHealth()  -- Runs once per in-game minute
end)
```

**What we'll see:** Lag, especially in multiplayer or with many mods.

---

## Performance Tips

1. **Use EveryOneMinute instead of OnTick** - OnTick runs every frame. EveryOneMinute is plenty for most checks.

2. **Exit early** - If our code only applies in certain situations, check that first:

```lua
Events.OnPlayerUpdate.Add(function(player)
    if not player:isOutside() then return end  -- Exit if indoors
    -- Only process outdoor players
end)
```

3. **Use specific events** - Instead of checking for death in OnPlayerUpdate, use OnPlayerDeath.

4. **Remove listeners we don't need** - If an event was one-time, remove the callback.

---

## Key Takeaways

1. **Events let our mod respond to game happenings** - player actions, time passing, key presses
2. **The pattern is simple:** `Events.EventName.Add(ourFunction)`
3. **Our function is a "callback"** - the game calls it back when the event happens
4. **Start with OnGameStart and OnKeyPressed** - they're the easiest to test
5. **Use EveryOneMinute instead of OnTick** - much better for performance
6. **We don't need to memorize all ~150 events** - learn them as we need them

Events are the backbone of PZ modding. Once we're comfortable with them, we can hook into almost any part of the game.

---

## What's Next?

- [Context Menus](/pz/build-41/modding/lua-api/context-menus) - Add options to right-click menus
- [Timed Actions](/pz/build-41/modding/lua-api/timed-actions) - Progress bar actions like crafting
- [Events Reference](/pz/build-41/modding/reference/events) - Complete list of all events
