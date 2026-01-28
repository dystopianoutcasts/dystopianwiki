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

You're driving down the highway in your hard-earned car. Suddenly it sputters and stops. You forgot to check the fuel. If only there was a warning system! Or maybe you want to create a custom speedometer, or track how much damage your engine has taken. All that information is right there in the vehicle object, waiting to be read.

I remember my first vehicle mod - a simple "low fuel" alert. I spent an hour searching for a `getFuel()` method that didn't exist. Turns out you need to get the fuel tank part first, then read from that. Once I understood the pattern, reading any vehicle stat became trivial.

Let me show you how to read speed, fuel, engine condition, and everything else the game tracks.

## What This Guide Covers

You know the dashboard in PZ that shows your speed, fuel, and engine condition? All that information comes from the vehicle object. This guide teaches you how to read that same info in your mods.

**You would use this when:**
- You want to warn players when fuel is low
- You're building a custom dashboard UI
- You need to check if the engine is running before doing something
- You're creating vehicle-based game mechanics

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

### ❌ Wrong: Dividing by Zero

```lua
-- Crashes if maxSpeed is 0!
local ratio = currentSpeed / maxSpeed
```

**Why it fails:** Division by zero causes an error. Some vehicles might have maxSpeed of 0.

✅ **Right: Check Before Dividing**
```lua
-- Safe division
if maxSpeed > 0 then
    local ratio = currentSpeed / maxSpeed              -- Only divide if safe
end
```

### ❌ Wrong: Assuming Parts Exist

```lua
-- Assumes every vehicle has a gas tank!
local fuelPercent = vehicle:getPartById("GasTank"):getItemContainer():getUsedDelta()
```

**Why it fails:** Some vehicles (bikes, special modded vehicles) might not have gas tanks. This crashes.

✅ **Right: Check Each Step**
```lua
-- Check every step of the chain
local tank = vehicle:getPartById("GasTank")           -- Get tank part
if tank then                                          -- Does tank exist?
    local container = tank:getItemContainer()         -- Get fuel container
    if container then                                 -- Does container exist?
        local fuelPercent = container:getUsedDelta()  -- Now safe to read fuel
    end
end
```

### ❌ Wrong: Not Checking if in Vehicle

```lua
-- Assumes player is in vehicle!
local speed = player:getVehicle():getCurrentSpeedKmHour()  -- Crashes if walking!
```

**Why it fails:** `getVehicle()` returns `nil` if player is not in a vehicle. Calling methods on `nil` crashes.

✅ **Right: Check for Vehicle First**
```lua
-- Always check if vehicle exists
local vehicle = player:getVehicle()                   -- Get vehicle reference
if vehicle then                                       -- Is player in a vehicle?
    local speed = vehicle:getCurrentSpeedKmHour()     -- Now safe to read speed
end
```

---

## Try It Yourself: Build a Vehicle Dashboard

Let's create a simple mod that displays vehicle stats on screen.

**Goal:** Show speed, fuel percentage, and engine condition while driving.

### Step 1: Create the Mod

Create `C:\Users\[YOU]\Zomboid\mods\SimpleDashboard\mod.info`:
```
name=Simple Vehicle Dashboard
id=SimpleDashboard
description=Displays speed, fuel, and engine stats
```

### Step 2: Create the Dashboard Code

Create `C:\Users\[YOU]\Zomboid\mods\SimpleDashboard\media\lua\client\Dashboard.lua`:

```lua
-- Dashboard.lua
-- Shows vehicle stats on screen

local function drawDashboard()
    local player = getPlayer()                               -- Get player
    local vehicle = player:getVehicle()                      -- Get vehicle (might be nil)

    if not vehicle then return end                           -- Only draw if in vehicle

    -- Get stats (with safety checks!)
    local speed = vehicle:getCurrentSpeedKmHour()           -- Speed in km/h

    -- Get fuel percentage (safely)
    local fuelPercent = 0                                    -- Default to 0
    local tank = vehicle:getPartById("GasTank")
    if tank then
        local container = tank:getItemContainer()
        if container then
            fuelPercent = container:getUsedDelta() * 100    -- Convert to percentage
        end
    end

    -- Get engine condition
    local engineQuality = vehicle:getEngineQuality()         -- 0-100

    -- Display stats in console (press ~ to see)
    print(string.format("Speed: %.1f km/h | Fuel: %.1f%% | Engine: %.1f%%",
        speed, fuelPercent, engineQuality))
end

-- Update every second
Events.EveryOneMinute.Add(drawDashboard)
```

### Step 3: Test It

1. Launch PZ with your mod
2. Get in a vehicle
3. Press `~` to open console
4. Drive around and watch the stats update

### Step 4: Make It Better

Try adding more stats:
```lua
-- Is engine running?
local engineRunning = vehicle:isEngineRunning()
print("Engine: " .. (engineRunning and "ON" or "OFF"))

-- Headlights on?
local headlights = vehicle:getHeadlightsOn()
print("Lights: " .. (headlights and "ON" or "OFF"))
```

**You just:**
1. Read multiple vehicle stats safely
2. Handled nil values properly
3. Created a useful debugging tool

This is the foundation for any vehicle-based mod.

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
