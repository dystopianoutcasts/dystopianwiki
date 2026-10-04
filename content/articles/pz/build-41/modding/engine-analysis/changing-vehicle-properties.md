---
id: changing-vehicle-properties
slug: changing-vehicle-properties
title: "Changing Vehicle Properties"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: intermediate
tags:
  - vehicle
  - intermediate
  - tutorial
  - setters
  - modification
excerpt: "Learn to modify vehicles - repair parts, add fuel, change engine quality. Discover what you can and can't change easily."
table_of_contents:
  - text: "What Is Vehicle Modification?"
    link: "#what-is-vehicle-modification"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "The Simplest Example"
    link: "#the-simplest-example"
  - text: "Reading vs Writing"
    link: "#reading-vs-writing"
  - text: "What You Can Change Easily"
    link: "#what-you-can-change-easily"
  - text: "Adding Fuel"
    link: "#adding-fuel"
  - text: "Starting and Stopping the Engine"
    link: "#starting-and-stopping-the-engine"
  - text: "Practical Example: Full Repair"
    link: "#practical-example-full-repair"
  - text: "What You Can't Change Easily"
    link: "#what-you-cant-change-easily"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Quick Reference"
    link: "#quick-reference"
  - text: "Key Takeaways"
    link: "#key-takeaways"
related_articles:
  - vehicle-parts-basics
  - reading-vehicle-stats
  - when-setters-dont-exist
  - vehicle-parts
next_steps:
  - title: "When PZ Won't Let You Change Something"
    path: /pz/build-41/modding/engine-analysis/when-setters-dont-exist
  - title: "Vehicle Parts Reference"
    path: /pz/build-41/modding/engine-analysis/vehicle-parts
last_updated: 2026-01-28
---

# Changing Vehicle Properties

> Learn how to repair, modify, and control vehicles programmatically - from fixing engines to filling gas tanks.

---

## What Is Vehicle Modification?

You find a car. The engine is at 15%. Two tires are flat. The battery is dead. In vanilla PZ, you'd spend hours gathering parts and tools. But what if you're making a mechanic mod? Or an admin command? Or a car dealership system that sells fully-repaired vehicles?

When I started vehicle modding, I spent an embarrassing amount of time trying to figure out why `vehicle.engineCondition = 100` didn't work. Turns out, PZ doesn't let you just set properties directly - you need to use special methods like `setCondition()`. Once I learned the pattern, vehicle modding became straightforward. There's a "get" method to read values and (usually) a "set" method to write them.

This article teaches you how to actually *change* vehicles, not just read their stats. We'll repair parts, add fuel, fix engines, and understand what you can and can't modify easily.

**You would use this when:**
- Building a mechanic mod that repairs vehicles
- Creating admin/debug commands
- Making a fuel station that fills tanks
- Building a car customization system
- Creating a vehicle spawn system that needs pristine cars

---

## Prerequisites

Before this article, you should understand:
- [Working with Vehicle Parts](./vehicle-parts-basics) - Getting and checking parts
- [Reading Vehicle Stats](./reading-vehicle-stats) - Basic vehicle information
- Basic Lua - variables, functions, if statements

You don't need to be an advanced modder - if you can read vehicle stats, you can modify them.

---

## The Simplest Example

Let's repair an engine to 100% condition. This is the most basic vehicle modification:

```lua
local function repairEngine()
    local player = getPlayer()                   -- Get the player
    local vehicle = player:getVehicle()          -- Get their vehicle

    if not vehicle then
        print("Get in a vehicle!")               -- Must be in vehicle
        return
    end

    local engine = vehicle:getPartById("Engine") -- Get engine part

    if engine then
        engine:setCondition(100)                 -- Repair to 100%
        print("Engine repaired to 100%!")
    else
        print("No engine to repair!")
    end
end
```

**The key line:** `engine:setCondition(100)`

We used `getCondition()` to *read* engine condition. Now we use `setCondition()` to *write* a new value.

> **Key Takeaway**
> Vehicle modification follows a pattern: `get` methods read values, `set` methods write them. If you can read something, there's usually (but not always) a way to set it.

---

## Reading vs Writing

In PZ vehicle modding, there's a consistent pattern:

| To Read (Get) | To Write (Set) | What It Changes |
|---------------|----------------|-----------------|
| `getCondition()` | `setCondition(value)` | Part condition (0-100) |
| `getEngineQuality()` | `setEngineQuality(value)` | Engine quality (0-100) |
| `isHotwired()` | `setHotwired(bool)` | Whether car needs key |
| `isEngineRunning()` | `engineDoStarting()` / `engineDoShuttingDown()` | Engine on/off |
| `getRust()` | `setRust(value)` | Rust level (0.0-1.0) |
| `getHeadlightsOn()` | `setHeadlightsOn(bool)` | Headlights state |

The pattern is clear: replace "get" with "set" and provide a value.

**BUT** - and this is important - not everything has a "set" version. Some properties can't be changed easily. We'll cover that later in [What You Can't Change Easily](#what-you-cant-change-easily).

---

## What You Can Change Easily

Let's look at the most common vehicle modifications you'll want to make.

### Part Condition

Any part with condition can be repaired or damaged:

```lua
-- Get any part
local part = vehicle:getPartById("TireFrontLeft")

-- Repair to perfect condition
part:setCondition(100)   -- Brand new, 100%

-- Damage the part
part:setCondition(50)    -- Half damaged, 50%

-- Destroy the part (but keep it installed)
part:setCondition(0)     -- Broken, 0% but still there
```

**In-game effect:** When you set condition to 0, the part is broken but still physically installed. Players see it as "broken" in the vehicle mechanics menu.

---

### Engine Quality

Engine quality affects performance and how loud the engine sounds:

```lua
-- Make engine run like new
vehicle:setEngineQuality(100)   -- Perfect, quiet, powerful

-- Make engine barely functional
vehicle:setEngineQuality(20)    -- Loud, weak, rough
```

**In-game effect:** Low engine quality makes:
- The car slower to accelerate
- The engine much louder
- The car more likely to stall
- Lower top speed

---

### Hotwired Status

Whether the car needs a key:

```lua
-- Make it hotwired (no key needed, anyone can drive)
vehicle:setHotwired(true)

-- Reset to needing a key
vehicle:setHotwired(false)
```

**In-game effect:** Hotwired cars can be started without the key. Useful for admin commands that give players cars, or for mechanics that "unlock" abandoned vehicles.

---

### Headlights and Interior Lights

```lua
-- Turn on headlights
vehicle:setHeadlightsOn(true)

-- Turn them off
vehicle:setHeadlightsOn(false)

-- Interior/window lights
vehicle:setWindowLightsOn(true)   -- Turn on
vehicle:setWindowLightsOn(false)  -- Turn off
```

**In-game effect:** Lights turn on/off just like when a player presses the light key. Affects visibility and battery drain.

---

### Rust Level

Visual wear and tear:

```lua
-- Rust is a decimal from 0.0 to 1.0
vehicle:setRust(0.0)    -- Shiny and new, no rust
vehicle:setRust(0.5)    -- 50% rusted, moderate wear
vehicle:setRust(1.0)    -- Completely rusted, rust bucket
```

**In-game effect:** Higher rust changes the vehicle's appearance - more brown/orange coloring and visual decay. Purely cosmetic.

---

## Adding Fuel

Fuel is stored differently - in a container inside the gas tank part:

```lua
local function fillTank()
    local player = getPlayer()
    local vehicle = player:getVehicle()

    if not vehicle then return end

    -- Get the gas tank part
    local tank = vehicle:getPartById("GasTank")
    if not tank then
        print("No gas tank!")
        return
    end

    -- Get the fuel container inside the tank
    local container = tank:getItemContainer()
    if not container then return end

    -- Set fuel amount (0.0 = empty, 1.0 = full)
    container:setUsedDelta(1.0)    -- Fill to 100%

    print("Tank filled!")
end
```

**Why `setUsedDelta()`?** The gas tank part contains an item container that stores fuel. Fuel level is represented as a decimal from 0.0 (empty) to 1.0 (full). This method sets it directly.

**Common values:**
- `0.0` = Empty
- `0.25` = Quarter tank
- `0.5` = Half tank
- `0.75` = Three quarters
- `1.0` = Full

---

## Starting and Stopping the Engine

You can't just flip a switch - you need to trigger the start/stop process:

```lua
-- Start the engine
vehicle:engineDoStarting()

-- Stop the engine
vehicle:engineDoShuttingDown()
```

**Why not just `setEngineRunning(true)`?**

Starting an engine in PZ involves:
- Checking if the battery has charge
- Potentially failing to start (bad engine)
- Making starting sounds
- Running animations
- Consuming battery power

`engineDoStarting()` does all of that properly. Setting a boolean wouldn't handle the full start sequence.

---

## Practical Example: Full Repair

Let's build a "repair everything" command that restores a vehicle to mint condition:

```lua
local function repairAllParts()
    local player = getPlayer()
    local vehicle = player:getVehicle()

    if not vehicle then
        print("Get in a vehicle!")
        return
    end

    -- Get all parts
    local parts = vehicle:getParts()
    local repaired = 0

    -- Loop through each part
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local condition = part:getCondition()

        -- Only repair parts that have condition and are damaged
        if condition >= 0 and condition < 100 then
            part:setCondition(100)           -- Repair to perfect
            repaired = repaired + 1
        end
    end

    -- Fix engine quality
    vehicle:setEngineQuality(100)            -- Perfect engine

    -- Remove all rust
    vehicle:setRust(0.0)                     -- Brand new appearance

    -- IMPORTANT: Tell vehicle to recalculate stats
    vehicle:updatePartStats()                -- Recalc weight, performance, etc

    -- Report results
    print("Repaired " .. repaired .. " parts!")
    print("Engine quality: 100%")
    print("Rust removed!")
end

-- Bind to F9 key
Events.OnCustomUIKey.Add(function(key)
    if key == Keyboard.KEY_F9 then
        repairAllParts()
    end
end)
```

**What's `updatePartStats()`?**

When you change parts, the vehicle needs to recalculate:
- Total weight
- Maximum speed
- Performance values
- Other derived stats

Calling `updatePartStats()` tells the vehicle "I changed some parts, recalculate everything." Without this, the vehicle might still act like it's damaged even though parts show 100%.

**Try it:** Find a damaged car, get in, press F9, and watch it get repaired!

---

## What You Can't Change Easily

Here's where vehicle modding gets tricky. Not everything has a "set" method:

| What You Want | Can You Do It? |
|---------------|----------------|
| Repair a part | Yes - `setCondition()` |
| Change engine quality | Yes - `setEngineQuality()` |
| Fill the tank | Yes - `container:setUsedDelta()` |
| Hotwire the car | Yes - `setHotwired()` |
| Turn lights on/off | Yes - `setHeadlightsOn()` |
| Change engine loudness | No - no setter exists |
| Change engine power | No - no setter exists |
| Set current speed | No - physics controls this |
| Change max speed | No - defined in vehicle script |
| Modify trunk capacity | No - defined in vehicle script |

**Why can't I change some things?**

The PZ developers only created "set" methods for properties they wanted mods to change easily. Some things:
- Are controlled by physics (current speed)
- Are defined in vehicle script files (max speed, trunk size)
- Weren't intended to be changed at runtime (engine loudness, power)

**What can you do about it?**

For properties without setters, you have two options:
1. **Find an alternative approach** - Sometimes a different method achieves the same result
2. **Use Java Reflection** - An advanced technique that lets you access and modify private/hidden properties

Reflection is powerful but complex. If you need to change things without setters, see [When PZ Won't Let You Change Something](./when-setters-dont-exist).

---

## Common Mistakes

### Mistake 1: Forgetting to Call updatePartStats()

**Doesn't work:**
```lua
-- Repair all parts
for i = 0, parts:size() - 1 do
    parts:get(i):setCondition(100)
end
-- Forgot to call updatePartStats()
-- Car might still act damaged!
```

**What happens:** The parts show as repaired in the mechanics menu, but the car still drives like it's damaged - slow, poor handling, etc.

**Works:**
```lua
-- Repair all parts
for i = 0, parts:size() - 1 do
    parts:get(i):setCondition(100)
end

-- Tell vehicle to recalculate derived stats
vehicle:updatePartStats()  -- Now it knows everything changed!
```

**Why:** `updatePartStats()` recalculates weight, speed, handling - everything derived from part conditions.

---

### Mistake 2: Setting Condition on Missing Parts

**Doesn't work (crashes):**
```lua
-- Get tire (might not be installed)
local tire = vehicle:getPartById("TireFrontLeft")

-- Try to repair it without checking
tire:setCondition(100)  -- CRASH if tire is nil!
```

**What happens:** If the tire isn't installed, `getPartById()` returns `nil`. Calling methods on `nil` crashes.

**Works:**
```lua
-- Get tire
local tire = vehicle:getPartById("TireFrontLeft")

-- Check it exists AND has condition
if tire and tire:getCondition() >= 0 then
    tire:setCondition(100)  -- Safe to repair
else
    print("No tire installed!")
end
```

**Why check `>= 0`?** If `getCondition()` returns `-1`, the part slot exists but nothing is installed. You can't repair "nothing".

---

### Mistake 3: Setting Fuel Without Checking Container

**Doesn't work (crashes):**
```lua
local tank = vehicle:getPartById("GasTank")
local container = tank:getItemContainer()
container:setUsedDelta(1.0)  -- Crash if tank or container is nil!
```

**What happens:** If the gas tank is missing or has no container, this crashes.

**Works:**
```lua
local tank = vehicle:getPartById("GasTank")
if not tank then
    print("No gas tank!")
    return
end

local container = tank:getItemContainer()
if not container then
    print("Tank has no container!")
    return
end

-- Now safe to set fuel
container:setUsedDelta(1.0)
```

**Why:** Always check each step. Tank might be missing, or tank might exist but have no container (rare but possible).

---

### Mistake 4: Using Wrong Value Range

**Doesn't work (weird results):**
```lua
-- Trying to set rust to "half rusted"
vehicle:setRust(50)     -- Wrong! Rust is 0.0-1.0, not 0-100

-- Trying to set fuel to "half full"
container:setUsedDelta(50)  -- Wrong! Fuel is 0.0-1.0, not 0-100
```

**What happens:** Rust and fuel use decimals (0.0 to 1.0), not integers (0 to 100). Setting them to 50 means "5000%", which either gets clamped or causes weird behavior.

**Works:**
```lua
-- Half rusted (0.5 = 50%)
vehicle:setRust(0.5)

// Half full fuel tank (0.5 = 50%)
container:setUsedDelta(0.5)
```

**Remember the ranges:**
- Part condition: 0 to 100 (integers)
- Engine quality: 0 to 100 (integers)
- Rust: 0.0 to 1.0 (decimals)
- Fuel: 0.0 to 1.0 (decimals)

---

## Try It Yourself

Let's practice vehicle modification with a hands-on exercise.

### Your Goal

Create a "vehicle maintenance station" that repairs and refuels any vehicle near the player.

### Step 1: Create the Repair Function

```lua
-- File: media/lua/client/VehicleMaintenance.lua

local VehicleMaintenance = {}

function VehicleMaintenance.repairVehicle(vehicle)
    -- Repair all parts to 100%
    local parts = vehicle:getParts()
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        if part:getCondition() >= 0 then
            part:setCondition(100)
        end
    end

    -- Fix engine quality
    vehicle:setEngineQuality(100)

    -- Remove rust
    vehicle:setRust(0.0)

    -- Refuel
    local tank = vehicle:getPartById("GasTank")
    if tank then
        local container = tank:getItemContainer()
        if container then
            container:setUsedDelta(1.0)
        end
    end

    -- Recalculate stats
    vehicle:updatePartStats()

    print("Vehicle repaired and refueled!")
end
```

### Step 2: Find Nearby Vehicles

```lua
function VehicleMaintenance.findNearbyVehicles(player, radius)
    local px, py = player:getX(), player:getY()
    local vehicles = {}

    -- Get all vehicles in the cell
    local cell = getCell()
    local vehicleList = cell:getVehicles()

    for i = 0, vehicleList:size() - 1 do
        local vehicle = vehicleList:get(i)
        local vx, vy = vehicle:getX(), vehicle:getY()

        -- Calculate distance
        local dist = math.sqrt((px - vx)^2 + (py - vy)^2)

        -- If within radius, add to list
        if dist <= radius then
            table.insert(vehicles, vehicle)
        end
    end

    return vehicles
end
```

### Step 3: Create the Maintenance Command

```lua
function VehicleMaintenance.runMaintenance()
    local player = getPlayer()
    local radius = 10  -- Within 10 tiles

    -- Find nearby vehicles
    local vehicles = VehicleMaintenance.findNearbyVehicles(player, radius)

    if #vehicles == 0 then
        print("No vehicles nearby!")
        return
    end

    -- Repair each one
    for _, vehicle in ipairs(vehicles) do
        VehicleMaintenance.repairVehicle(vehicle)
    end

    print("Repaired " .. #vehicles .. " vehicle(s)!")
end

-- Bind to F10 key
Events.OnCustomUIKey.Add(function(key)
    if key == Keyboard.KEY_F10 then
        VehicleMaintenance.runMaintenance()
    end
end)
```

### Step 4: Test It

1. Load your mod
2. Find some damaged vehicles
3. Stand near them
4. Press F10
5. Check if they're repaired and refueled

### Step 5: Verify Success

Check if:
- Parts show 100% condition in mechanics menu
- Gas tank is full
- Engine quality is 100
- Rust is gone
- Vehicle drives normally (not sluggish)

**Optional Challenge:** Modify the code to only repair vehicles the player owns (check if player is the vehicle's driver).

---

## Quick Reference

Here's a cheat sheet for common vehicle modifications:

| What to Change | Method | Value Range | Example |
|----------------|--------|-------------|---------|
| Part condition | `part:setCondition(n)` | 0-100 | `part:setCondition(100)` |
| Engine quality | `vehicle:setEngineQuality(n)` | 0-100 | `vehicle:setEngineQuality(75)` |
| Rust level | `vehicle:setRust(n)` | 0.0-1.0 | `vehicle:setRust(0.3)` |
| Fuel amount | `container:setUsedDelta(n)` | 0.0-1.0 | `container:setUsedDelta(0.5)` |
| Hotwired state | `vehicle:setHotwired(bool)` | true/false | `vehicle:setHotwired(true)` |
| Headlights | `vehicle:setHeadlightsOn(bool)` | true/false | `vehicle:setHeadlightsOn(true)` |
| Interior lights | `vehicle:setWindowLightsOn(bool)` | true/false | `vehicle:setWindowLightsOn(false)` |

**After any modifications:** Call `vehicle:updatePartStats()` to recalculate derived stats.

---

## Key Takeaways

1. **"get" reads, "set" writes** - Replace `getCondition()` with `setCondition(value)` to modify
2. **Not everything has a setter** - Some properties can't be changed easily without reflection
3. **Always call `updatePartStats()` after changes** - Recalculates weight, performance, and derived stats
4. **Check parts exist before modifying** - Use `if part and part:getCondition() >= 0` to avoid crashes
5. **Fuel uses `setUsedDelta()`** - Because it's stored in a container, not directly on the part
6. **Different value ranges** - Condition is 0-100, rust and fuel are 0.0-1.0
7. **Use `engineDoStarting()` not `setEngineRunning()`** - Starting involves checks, sounds, and animations

---

## What's Next?

- [When PZ Won't Let You Change Something](./when-setters-dont-exist) - Learn about Java Reflection for properties without setters
- [Vehicle Parts Reference](./vehicle-parts) - Complete list of all parts and their methods

---

You can now repair and modify vehicles! For most modding needs, the "set" methods covered here are enough. But when you hit a property without a setter, reflection (covered in the next article) lets you change almost anything.
