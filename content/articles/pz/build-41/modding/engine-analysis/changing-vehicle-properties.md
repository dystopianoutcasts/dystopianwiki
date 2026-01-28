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

## What Is This?

So far we've been reading vehicle info. Now we're going to actually change things - repair damaged parts, fill the gas tank, fix the engine. This is where modding gets fun!

**You would use this when:**
- Building a mechanic mod that repairs vehicles
- Creating admin/debug commands
- Making a fuel station that fills tanks
- Building a car customization system

---

## Prerequisites

Before this article, understand:
- [Working with Vehicle Parts](/pz/build-41/modding/engine-analysis/vehicle-parts-basics) - Getting and checking parts
- [Reading Vehicle Stats](/pz/build-41/modding/engine-analysis/reading-vehicle-stats) - Basic vehicle info

---

## The Simplest Example

Let's repair the engine to 100%:

```lua
local function repairEngine()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if not vehicle then
        print("Get in a vehicle!")
        return
    end
    
    local engine = vehicle:getPartById("Engine")
    
    if engine then
        engine:setCondition(100)
        print("Engine repaired to 100%!")
    else
        print("No engine to repair!")
    end
end
```

**The key line:** `engine:setCondition(100)`

We used `getCondition()` to read. Now we use `setCondition()` to write.

---

## Reading vs Writing

In PZ modding, there's a pattern:

| To Read | To Write |
|---------|----------|
| `getCondition()` | `setCondition(value)` |
| `getEngineQuality()` | `setEngineQuality(value)` |
| `isHotwired()` | `setHotwired(true/false)` |
| `isEngineRunning()` | `engineDoStarting()` / `engineDoShuttingDown()` |

The "get" version reads the value. The "set" version changes it.

**BUT** - and this is important - not everything has a "set" version. We'll cover that later.

---

## What You Can Change Easily

### Part Condition

```lua
-- Repair any part
local part = vehicle:getPartById("TireFrontLeft")
part:setCondition(100)  -- Perfect condition

-- Damage a part
part:setCondition(50)   -- Half damaged

-- Destroy a part (but keep it installed)
part:setCondition(0)    -- Broken
```

### Engine Quality

```lua
-- Engine quality affects performance and sound
vehicle:setEngineQuality(100)  -- Like new
vehicle:setEngineQuality(20)   -- Barely running, very loud
```

**In-game connection:** Low engine quality makes the car slower, louder, and more likely to stall.

### Hotwired Status

```lua
-- Make it hotwired (no key needed)
vehicle:setHotwired(true)

-- Reset to needing a key
vehicle:setHotwired(false)
```

### Headlights

```lua
-- Turn on headlights
vehicle:setHeadlightsOn(true)

-- Turn them off
vehicle:setHeadlightsOn(false)
```

### Rust Level

```lua
-- Rust is 0.0 (no rust) to 1.0 (fully rusted)
vehicle:setRust(0.0)   -- Shiny and new
vehicle:setRust(0.5)   -- 50% rusted
vehicle:setRust(1.0)   -- Rust bucket
```

---

## Practical Example: Full Repair

Let's build a "repair everything" command:

```lua
local function repairAllParts()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if not vehicle then
        print("Get in a vehicle!")
        return
    end
    
    local parts = vehicle:getParts()
    local repaired = 0
    
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local condition = part:getCondition()
        
        -- Only repair parts that have condition and are damaged
        if condition >= 0 and condition < 100 then
            part:setCondition(100)
            repaired = repaired + 1
        end
    end
    
    -- Also fix engine quality
    vehicle:setEngineQuality(100)
    
    -- Remove rust
    vehicle:setRust(0.0)
    
    -- Tell the vehicle to recalculate everything
    vehicle:updatePartStats()
    
    print("Repaired " .. repaired .. " parts!")
    print("Engine quality: 100%")
    print("Rust removed!")
end

Events.OnCustomUIKey.Add(function(key)
    if key == Keyboard.KEY_F9 then
        repairAllParts()
    end
end)
```

**What's `updatePartStats()`?** When you change parts, the vehicle needs to recalculate things like total weight and performance. This tells it to do that.

**Try it:** Find a damaged car, press F9, and watch it get fixed!

---

## Adding Fuel

Fuel is stored in a container, so we change it differently:

```lua
local function fillTank()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if not vehicle then return end
    
    local tank = vehicle:getPartById("GasTank")
    if not tank then
        print("No gas tank!")
        return
    end
    
    local container = tank:getItemContainer()
    if not container then return end
    
    -- Set fuel to 100% (1.0 = full)
    container:setUsedDelta(1.0)
    
    print("Tank filled!")
end
```

**Why `setUsedDelta()`?** Fuel is stored as a decimal from 0.0 (empty) to 1.0 (full). This sets it directly.

---

## Starting and Stopping the Engine

You can't just set `engineRunning = true`. Instead, you trigger the start/stop process:

```lua
-- Start the engine
vehicle:engineDoStarting()

-- Stop the engine
vehicle:engineDoShuttingDown()
```

**Why not just `setEngineRunning(true)`?** Starting an engine involves checking the battery, possibly failing, making sounds, etc. `engineDoStarting()` does all of that properly.

---

## What You CAN'T Change Easily

Here's where it gets tricky. Some things don't have "set" methods:

| What You Want | Can You Do It? |
|---------------|----------------|
| Repair a part | Yes - `setCondition()` |
| Change engine quality | Yes - `setEngineQuality()` |
| Fill the tank | Yes - `container:setUsedDelta()` |
| Hotwire the car | Yes - `setHotwired()` |
| Change engine loudness | **No** - no setter exists |
| Change engine power | **No** - no setter exists |
| Set current speed | **No** - physics controls this |
| Change max speed | **No** - defined in script |

**Why can't I change some things?**

The developers only created "set" methods for things they wanted mods to change. Some things:
- Are controlled by physics (speed)
- Are defined in vehicle scripts (max speed)
- Weren't intended to be changed at runtime (engine loudness)

---

## When You Hit a Wall

If you try to call a method that doesn't exist:

```lua
vehicle:setEngineLoudness(50)  -- ERROR: This method doesn't exist!
```

You'll get an error. The game will tell you the method doesn't exist.

**What can you do?**

1. **Check if there's another way** - Maybe a different method achieves what you want
2. **Use Java Reflection** - An advanced technique that lets you access hidden properties

Reflection is complex, but it lets you change almost anything. If you need it, see [When PZ Won't Let You Change Something](/pz/build-41/modding/engine-analysis/when-setters-dont-exist).

---

## Common Mistakes

### Mistake: Forgetting to call updatePartStats()

```lua
-- WRONG: Parts are fixed but vehicle doesn't know
for i = 0, parts:size() - 1 do
    parts:get(i):setCondition(100)
end
-- Car might still act damaged!

-- RIGHT: Tell the vehicle to recalculate
for i = 0, parts:size() - 1 do
    parts:get(i):setCondition(100)
end
vehicle:updatePartStats()  -- Now it knows!
```

### Mistake: Setting condition on a missing part

```lua
-- WRONG: If there's no tire installed, this crashes
local tire = vehicle:getPartById("TireFrontLeft")
tire:setCondition(100)  -- Crash if tire is nil!

-- RIGHT: Check first
local tire = vehicle:getPartById("TireFrontLeft")
if tire and tire:getCondition() >= 0 then
    tire:setCondition(100)
end
```

**Why check `>= 0`?** If `getCondition()` returns -1, the part slot exists but nothing is installed. You can't repair "nothing".

---

## Quick Reference: What You Can Change

| Property | Method | Values |
|----------|--------|--------|
| Part condition | `part:setCondition(n)` | 0-100 |
| Engine quality | `vehicle:setEngineQuality(n)` | 0-100 |
| Rust | `vehicle:setRust(n)` | 0.0-1.0 |
| Fuel | `container:setUsedDelta(n)` | 0.0-1.0 |
| Hotwired | `vehicle:setHotwired(bool)` | true/false |
| Headlights | `vehicle:setHeadlightsOn(bool)` | true/false |
| Interior lights | `vehicle:setWindowLightsOn(bool)` | true/false |

---

## Key Takeaways

1. **"get" reads, "set" writes** - `getCondition()` vs `setCondition()`
2. **Not everything has a setter** - Some properties can't be changed easily
3. **Call `updatePartStats()` after changes** - Tells the vehicle to recalculate
4. **Check parts exist before modifying** - Don't call methods on nil!
5. **Fuel uses `setUsedDelta()`** - Because it's stored in a container

---

## What's Next?

- [When PZ Won't Let You Change Something](/pz/build-41/modding/engine-analysis/when-setters-dont-exist) - Learn about reflection for advanced changes
- [Vehicle Parts Reference](/pz/build-41/modding/engine-analysis/vehicle-parts) - Complete list of all methods

---

**You can now repair and modify vehicles!** But what about things without setters? That's where reflection comes in - an advanced technique for the really tricky stuff.
