---
id: reading-vehicle-stats
slug: reading-vehicle-stats
title: "Reading Vehicle Stats"
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
  - stats
  - fuel
  - speed
excerpt: "Learn to read vehicle information - speed, fuel level, engine state, and more. Build a simple dashboard mod."
related_articles:
  - your-first-vehicle-mod
  - vehicle-parts-basics
  - changing-vehicle-properties
next_steps:
  - title: "Working with Vehicle Parts"
    path: /pz/build-41/modding/engine-analysis/vehicle-parts-basics
  - title: "Changing Vehicle Properties"
    path: /pz/build-41/modding/engine-analysis/changing-vehicle-properties
last_updated: 2026-01-28
---

# Reading Vehicle Stats

## What Is This?

You know the dashboard in PZ that shows your speed, fuel, and engine condition? All that information comes from the vehicle object. This guide teaches you how to read that same info in your mods.

**You would use this when:**
- You want to warn players when fuel is low
- You're building a custom dashboard UI
- You need to check if the engine is running before doing something

---

## Prerequisites

Before this article, understand:
- [Your First Vehicle Mod](/pz/build-41/modding/engine-analysis/your-first-vehicle-mod) - Getting a vehicle reference

---

## The Simplest Example

Let's print the current speed when you press a key:

```lua
local function checkSpeed()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if vehicle then
        local speed = vehicle:getCurrentSpeedKmHour()
        print("Current speed: " .. speed .. " km/h")
    else
        print("You're not in a vehicle!")
    end
end

-- Run this when player presses a key
Events.OnCustomUIKey.Add(function(key)
    if key == Keyboard.KEY_F6 then
        checkSpeed()
    end
end)
```

**Line by line:**

| Line | What It Does |
|------|---------------|
| `getPlayer()` | Gets YOUR character (the one you control) |
| `player:getVehicle()` | Gets the vehicle you're sitting in (or nil if walking) |
| `vehicle:getCurrentSpeedKmHour()` | Returns the speed as a number like `45.5` |
| `Keyboard.KEY_F6` | The F6 key - you can change this to any key |

---

## Where Does This Go?

```
YourModName/
└── media/
    └── lua/
        └── client/
            └── VehicleStats.lua
```

**Try it:** Press F6 while driving. You'll see your speed in the console!

---

## Common Vehicle Stats

Here are the most useful things you can read from a vehicle:

### Speed

```lua
-- How fast are you going right now?
local speed = vehicle:getCurrentSpeedKmHour()
print("Speed: " .. speed .. " km/h")

-- What's the car's top speed?
local maxSpeed = vehicle:getMaxSpeed()
print("Max speed: " .. maxSpeed .. " km/h")
```

**In-game connection:** This is the number on your speedometer.

### Engine State

```lua
-- Is the engine running?
if vehicle:isEngineRunning() then
    print("Engine is ON")
else
    print("Engine is OFF")
end

-- Get the exact state (Idle, Starting, Running, Stalling, Failed)
local state = vehicle:getEngineState()
print("Engine state: " .. tostring(state))
```

**In-game connection:** You know how sometimes the engine sputters when starting? That's the "Starting" state. If the battery is dead, it goes to "Failed".

### Engine Condition

```lua
-- How healthy is the engine? (0-100)
local quality = vehicle:getEngineQuality()
print("Engine quality: " .. quality .. "%")

if quality < 20 then
    print("WARNING: Engine is about to die!")
end
```

**In-game connection:** This is why damaged cars are slower and louder. Low quality = bad performance.

### Fuel Level

Fuel is a bit different - it's stored in the gas tank part:

```lua
-- Get the gas tank
local tank = vehicle:getPartById("GasTank")

if tank then
    local container = tank:getItemContainer()
    if container then
        -- Fuel is 0.0 (empty) to 1.0 (full)
        local fuelPercent = container:getUsedDelta() * 100
        print("Fuel: " .. math.floor(fuelPercent) .. "%")
    end
end
```

**In-game connection:** This is the fuel gauge on your dashboard.

**Why so complicated?** In PZ, fuel is literally stored in a container (like items in your inventory). The gas tank "part" has that container.

---

## Practical Example: Low Fuel Warning

Let's make a mod that warns you every minute if fuel is low:

```lua
local function checkFuel()
    local player = getPlayer()
    if not player then return end
    
    local vehicle = player:getVehicle()
    if not vehicle then return end
    
    -- Get the gas tank
    local tank = vehicle:getPartById("GasTank")
    if not tank then return end
    
    local container = tank:getItemContainer()
    if not container then return end
    
    -- Check fuel level
    local fuelPercent = container:getUsedDelta() * 100
    
    if fuelPercent < 15 then
        -- Show a message on screen
        player:Say("I should find some gas soon...")
    end
end

-- Check every minute (every 60 seconds = 3600 ticks)
Events.EveryOneMinute.Add(checkFuel)
```

**Try it:** Drive around until your fuel drops below 15%. Your character will say they need gas!

---

## Why We Check Everything

You might wonder why we write so many `if` checks:

```lua
if not player then return end
if not vehicle then return end
if not tank then return end
```

**The reason:** Your code runs every minute, even when:
- The player is still loading (no player yet)
- The player is walking (no vehicle)
- The vehicle has no gas tank (some vehicles don't)

Without these checks, your mod would crash. **Always assume something might not exist.**

---

## Quick Reference: Reading Stats

| What You Want | Code | Returns |
|--------------|------|----------|
| Current speed | `vehicle:getCurrentSpeedKmHour()` | Number (like `45.5`) |
| Max speed | `vehicle:getMaxSpeed()` | Number |
| Is engine on? | `vehicle:isEngineRunning()` | true/false |
| Engine condition | `vehicle:getEngineQuality()` | 0-100 |
| Engine state | `vehicle:getEngineState()` | Idle/Starting/Running/Stalling/Failed |
| Is hotwired? | `vehicle:isHotwired()` | true/false |
| Are keys in? | `vehicle:isKeysInIgnition()` | true/false |
| Vehicle name | `vehicle:getScriptName()` | Text (like `Base.CarNormal`) |

---

## Common Mistakes

### Mistake: Dividing by zero / getting weird numbers

```lua
-- WRONG: Speed might be 0
local ratio = currentSpeed / maxSpeed  -- Crashes if maxSpeed is 0!

-- RIGHT: Check first
if maxSpeed > 0 then
    local ratio = currentSpeed / maxSpeed
end
```

### Mistake: Checking fuel on a vehicle with no tank

Some vehicles (like bikes or special modded ones) might not have gas tanks:

```lua
-- WRONG: Assumes tank exists
local fuelPercent = vehicle:getPartById("GasTank"):getItemContainer():getUsedDelta()

-- RIGHT: Check each step
local tank = vehicle:getPartById("GasTank")
if tank then
    local container = tank:getItemContainer()
    if container then
        local fuelPercent = container:getUsedDelta()
    end
end
```

---

## Key Takeaways

1. **`getCurrentSpeedKmHour()` for speed** - The number you see on the speedometer
2. **`isEngineRunning()` for engine state** - true if the engine is on
3. **Fuel is in a container inside the GasTank part** - Not directly on the vehicle
4. **Always check if things exist** - Use `if tank then` before accessing tank methods

---

## What's Next?

- [Working with Vehicle Parts](/pz/build-41/modding/engine-analysis/vehicle-parts-basics) - Check tire condition, doors, windows
- [Changing Vehicle Properties](/pz/build-41/modding/engine-analysis/changing-vehicle-properties) - Actually modify the vehicle

---

**You can now read any stat from a vehicle!** Next, we'll learn about the parts system - how to check if tires are damaged, doors are open, or the trunk is full.
