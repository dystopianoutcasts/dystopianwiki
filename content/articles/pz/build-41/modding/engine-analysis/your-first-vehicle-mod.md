---
id: your-first-vehicle-mod
slug: your-first-vehicle-mod
title: "Your First Vehicle Mod"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: beginner
tags:
  - vehicle
  - beginner
  - tutorial
  - lua
  - first-mod
excerpt: "Create your first vehicle mod - display the car name when you get in. No prior Lua experience needed."
related_articles:
  - reading-vehicle-stats
  - vehicle-parts-basics
next_steps:
  - title: "Reading Vehicle Stats"
    path: /pz/build-41/modding/engine-analysis/reading-vehicle-stats
  - title: "Working with Vehicle Parts"
    path: /pz/build-41/modding/engine-analysis/vehicle-parts-basics
last_updated: 2026-01-28
---

# Your First Vehicle Mod

## What We're Building

You know when you get into a car in Project Zomboid and the dashboard appears? We're going to make a mod that prints the car's name to the console when you sit in the driver's seat.

It's simple, but it teaches you the foundation for ALL vehicle modding.

**You would use this when:** You want to learn how vehicle mods work, or you're building something that needs to know when a player enters a vehicle.

---

## Prerequisites

Before this article, you should:
- Know how to create a basic mod folder (mod.info file)
- Have enabled the Lua debugger in PZ options (so you can see print messages)

If you haven't made any mod before, that's okay - we'll show the folder structure.

---

## The Simplest Example

Here's the complete mod - just 8 lines:

```lua
-- This runs whenever a player enters a vehicle
local function onEnterVehicle(player)
    local vehicle = player:getVehicle()
    if vehicle then
        local name = vehicle:getScriptName()
        print("You got into: " .. name)
    end
end

Events.OnEnterVehicle.Add(onEnterVehicle)
```

**Line by line:**

| Line | Code | What It Does |
|------|------|---------------|
| 1 | `-- This runs...` | A comment - the game ignores this, it's just for humans |
| 2 | `local function onEnterVehicle(player)` | Creates a function that receives the player who entered |
| 3 | `local vehicle = player:getVehicle()` | Asks "what vehicle is this player in?" |
| 4 | `if vehicle then` | Only continue if they're actually in a vehicle |
| 5 | `local name = vehicle:getScriptName()` | Get the vehicle's name (like "Base.CarNormal") |
| 6 | `print("You got into: " .. name)` | Show it in the console |
| 7 | `end` | Closes the `if` |
| 8 | `end` | Closes the function |
| 10 | `Events.OnEnterVehicle.Add(...)` | Tell PZ: "run my function when someone enters a vehicle" |

---

## Where Does This Go?

```
YourModName/
├── mod.info
└── media/
    └── lua/
        └── client/                    ← Your file goes here
            └── VehicleGreeter.lua     ← Name it whatever you want
```

**Why the `client` folder?**

PZ has three Lua folders:
- `client/` - Code that runs on your screen (UI, messages, local player)
- `server/` - Code that runs the game world (spawning, rules)
- `shared/` - Code both need

Our mod shows a message on YOUR screen when YOU enter a vehicle. That's client-side.

---

## What Happens When You Run It

1. You start PZ with your mod enabled
2. You walk up to a car and press E to get in
3. PZ fires the `OnEnterVehicle` event
4. Your function runs and receives your player
5. It gets the vehicle, gets the name, prints it
6. You see `You got into: Base.CarNormal` in the console

**Try it:** 
1. Create the folder structure above
2. Paste the code into `VehicleGreeter.lua`
3. Create a basic `mod.info` file
4. Enable your mod and start a game
5. Get into any vehicle
6. Press `~` to open the console - you should see your message!

---

## Common Mistakes

### Mistake: "Nothing happens when I get in a car"

**Check these:**

1. Is your mod enabled in the mod menu?
2. Is the file in `client/` (not `server/` or `shared/`)?
3. Did you open the console (`~` key) to see the message?
4. Is there a typo in `Events.OnEnterVehicle`? (capital letters matter!)

### Mistake: "Error: attempt to index nil value"

```lua
-- WRONG: Forgot to check if vehicle exists
local function onEnterVehicle(player)
    local name = player:getVehicle():getScriptName()  -- Crashes if not in vehicle!
end

-- RIGHT: Always check first
local function onEnterVehicle(player)
    local vehicle = player:getVehicle()
    if vehicle then
        local name = vehicle:getScriptName()
    end
end
```

**Why:** Sometimes the event fires when you're not fully in the vehicle yet. Always check!

### Mistake: "I see the message twice"

This happens in multiplayer or split-screen. Each player triggers the event. If you only want YOUR player:

```lua
local function onEnterVehicle(player)
    -- Only run for the local player, not other players
    if player ~= getPlayer() then return end
    
    local vehicle = player:getVehicle()
    if vehicle then
        print("You got into: " .. vehicle:getScriptName())
    end
end
```

---

## Understanding the Colon `:` 

You might wonder why we write `player:getVehicle()` with a colon.

In Lua for PZ:
- **Colon `:`** = "Hey object, do this thing" (calling a method)
- **Dot `.`** = "Give me this property"

```lua
-- Colon: Asking the player to DO something (get their vehicle)
local vehicle = player:getVehicle()

-- Colon: Asking the vehicle to DO something (get its name)
local name = vehicle:getScriptName()
```

Don't worry about memorizing this - you'll get used to it by copying examples.

---

## Making It More Interesting

Now that the basics work, let's show more info:

```lua
local function onEnterVehicle(player)
    if player ~= getPlayer() then return end
    
    local vehicle = player:getVehicle()
    if vehicle then
        local name = vehicle:getScriptName()
        local speed = vehicle:getMaxSpeed()
        
        print("=== VEHICLE INFO ===")
        print("Name: " .. name)
        print("Max Speed: " .. speed .. " km/h")
    end
end

Events.OnEnterVehicle.Add(onEnterVehicle)
```

**Try it:** Add this, get in different vehicles, and compare their max speeds!

---

## Key Takeaways

1. **Events connect your code to the game** - `Events.OnEnterVehicle.Add()` is how PZ knows to run your code
2. **Always check if things exist** - `if vehicle then` prevents crashes
3. **The colon `:` calls methods** - `player:getVehicle()` asks the player object to give you the vehicle
4. **Client folder for player-facing code** - Anything the player sees goes in `client/`

---

## What's Next?

- [Reading Vehicle Stats](/pz/build-41/modding/engine-analysis/reading-vehicle-stats) - Check fuel, engine condition, speed
- [Working with Vehicle Parts](/pz/build-41/modding/engine-analysis/vehicle-parts-basics) - Access tires, doors, engine

---

**You just made your first vehicle mod!** This same pattern - listen for an event, get the vehicle, do something with it - is the foundation for every vehicle mod out there.
