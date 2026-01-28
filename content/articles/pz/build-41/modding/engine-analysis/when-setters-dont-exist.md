---
id: when-setters-dont-exist
slug: when-setters-dont-exist
title: "When PZ Won't Let You Change Something"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: intermediate
tags:
  - vehicle
  - intermediate
  - reflection
  - advanced-concept
  - setters
excerpt: "What to do when there's no setter method - understand the problem and learn about Java reflection as a solution."
related_articles:
  - changing-vehicle-properties
  - java-reflection-guide
  - vehicle-parts
next_steps:
  - title: "Java Reflection Deep Dive"
    path: /pz/build-41/modding/engine-analysis/java-reflection-guide
  - title: "Vehicle Parts Reference"
    path: /pz/build-41/modding/engine-analysis/vehicle-parts
last_updated: 2026-01-28
---

# When PZ Won't Let You Change Something

## The Problem

You're making a vehicle mod. You want to make the engine quieter. You find online that there's an `engineLoudness` property. So you try:

```lua
vehicle:setEngineLoudness(50)  -- Make it quieter
```

And you get an error. The method doesn't exist.

You can READ the loudness:
```lua
local loudness = vehicle:getEngineLoudness()  -- This works!
print(loudness)  -- Shows 80
```

But you can't CHANGE it. What gives?

---

## Why This Happens

Project Zomboid is written in Java, but mods use Lua. The developers had to decide which Java properties to expose to Lua modders.

For each property, they could expose:
- A **getter** (read) method - like `getEngineLoudness()`
- A **setter** (write) method - like `setEngineLoudness()`
- Both, or neither

They exposed getters for most things (so mods can read data), but only created setters for things they wanted mods to change.

**Engine loudness?** They figured that's defined in the vehicle script file, not something mods should change at runtime. So no setter.

---

## What Properties Have No Setter?

Here are common ones you might want to change but can't:

| Property | Can Read? | Can Write? |
|----------|-----------|------------|
| Engine loudness | Yes | **No** |
| Engine power | Yes | **No** |
| Throttle | Yes | **No** |
| Braking force | No | **No** |
| Current speed | Yes | **No** (physics controlled) |
| Max speed | Yes | **No** (from script) |

---

## Your Options

### Option 1: Find Another Way

Sometimes there's a different method that achieves what you want:

| Instead of... | Try... |
|--------------|--------|
| Set engine quality directly | `setEngineQuality()` exists! |
| Force start engine | `engineDoStarting()` triggers the start process |
| Set speed directly | You can't, but you could damage tires to slow down |

### Option 2: Modify the Vehicle Script

If you want to change something permanent (like max speed), edit the vehicle script file instead of using Lua:

```
module MyMod {
    vehicle MyFasterCar extends Base.CarNormal {
        maxSpeed = 150f,
        engineLoudness = 40,
    }
}
```

This creates a new vehicle type with your values.

### Option 3: Java Reflection (Advanced)

If you REALLY need to change something at runtime that has no setter, there's a technique called "reflection" that can do it.

**Warning:** This is advanced. It's the "break glass in case of emergency" option.

---

## What Is Reflection?

Imagine PZ is a house. The developers gave you keys to certain doors (setter methods). But there are rooms with no doors - they didn't expect anyone to need in there.

Reflection is like being able to walk through walls. You can access ANY property, even if there's no door.

**In simple terms:** Reflection lets you read or write ANY property on ANY object, bypassing the normal restrictions.

---

## How Reflection Works (Conceptually)

1. You ask PZ: "What properties does this vehicle have?"
2. PZ gives you a list of ALL properties (even hidden ones)
3. You find the one you want (like `engineLoudness`)
4. You tell PZ: "I want to change this one directly"
5. You change it

The game provides functions to do this:
- `getNumClassFields(object)` - How many properties does this have?
- `getClassField(object, index)` - Give me property #5
- `field:setInt(object, value)` - Change this property to this value

---

## A Simple Reflection Example

Let's change engine loudness (which has no setter):

```lua
local function makeEngineQuieter(vehicle)
    -- Step 1: Find the engineLoudness property
    local loudnessField = nil
    
    for i = 0, getNumClassFields(vehicle) - 1 do
        local field = getClassField(vehicle, i)
        local fieldName = tostring(field)
        
        -- The field name looks like "protected int zombie.vehicles.BaseVehicle.engineLoudness"
        if fieldName:find("engineLoudness") then
            loudnessField = field
            break
        end
    end
    
    if not loudnessField then
        print("Couldn't find engineLoudness!")
        return
    end
    
    -- Step 2: Unlock it (required for protected/private fields)
    loudnessField:setAccessible(true)
    
    -- Step 3: Change it
    loudnessField:setInt(vehicle, 30)  -- Much quieter!
    
    print("Engine loudness set to 30!")
end
```

**What's happening:**
1. We loop through ALL fields on the vehicle
2. We find the one named "engineLoudness"
3. We "unlock" it with `setAccessible(true)`
4. We change it with `setInt()`

---

## Why This Is Slow (And How to Fix It)

That loop runs through potentially hundreds of fields. If you do this every frame, your game will lag.

**The solution:** Find the field ONCE when the game starts, save it, and reuse it:

```lua
-- Global storage for the field we found
MyMod = MyMod or {}
MyMod.engineLoudnessField = nil

-- Find it once when game starts
local function setupReflection()
    -- We need any vehicle to scan its fields
    -- This is a trick: create a temporary one
    local player = getPlayer()
    if not player then return end
    
    local vehicle = player:getVehicle()
    if not vehicle then return end
    
    for i = 0, getNumClassFields(vehicle) - 1 do
        local field = getClassField(vehicle, i)
        if tostring(field):find("engineLoudness") then
            MyMod.engineLoudnessField = field
            field:setAccessible(true)
            print("Found engineLoudness field!")
            break
        end
    end
end

-- Now this is fast - no loop needed
local function makeEngineQuieter(vehicle)
    if MyMod.engineLoudnessField then
        MyMod.engineLoudnessField:setInt(vehicle, 30)
        print("Engine quieter!")
    else
        print("Reflection not set up yet!")
    end
end
```

---

## Different Types Need Different Methods

The `setInt()` function is for integers. Different property types need different methods:

| Property Type | Read Method | Write Method |
|---------------|-------------|---------------|
| int (whole number) | `field:getInt(obj)` | `field:setInt(obj, value)` |
| float (decimal) | `field:getFloat(obj)` | `field:setFloat(obj, value)` |
| boolean (true/false) | `field:getBoolean(obj)` | `field:setBoolean(obj, value)` |
| Other | `field:get(obj)` | `field:set(obj, value)` |

**How do you know which type?** The field name tells you:
- `"public int zombie.vehicles.BaseVehicle.engineLoudness"` - it's an int
- `"public float zombie.vehicles.BaseVehicle.throttle"` - it's a float
- `"public boolean zombie.vehicles.BaseVehicle.headlightsOn"` - it's a boolean

---

## Should You Use Reflection?

**Use it when:**
- There's no other way to achieve what you need
- You've tried script files and other methods first
- Performance matters and you cache the fields properly

**Don't use it when:**
- A setter method exists (use that instead!)
- You can modify vehicle scripts instead
- You're not sure what you're changing (test carefully!)

---

## Common Mistakes

### Mistake: Using the wrong type method

```lua
-- WRONG: engineLoudness is an int, not a float
MyMod.loudnessField:setFloat(vehicle, 30)  -- Might crash or give wrong value

-- RIGHT: Match the type
MyMod.loudnessField:setInt(vehicle, 30)
```

### Mistake: Not caching the field

```lua
-- WRONG: Searching every time - VERY slow
Events.OnTick.Add(function()
    for i = 0, getNumClassFields(vehicle) - 1 do
        -- This runs hundreds of times per second!
    end
end)

-- RIGHT: Search once, reuse forever
Events.OnGameStart.Add(setupReflection)  -- Find it once
Events.OnTick.Add(function()
    -- Use the cached field - fast!
    if MyMod.loudnessField then
        MyMod.loudnessField:setInt(vehicle, 30)
    end
end)
```

### Mistake: Forgetting setAccessible(true)

```lua
-- WRONG: Protected fields need to be unlocked
field:setInt(vehicle, 30)  -- Might fail!

-- RIGHT: Always unlock first
field:setAccessible(true)
field:setInt(vehicle, 30)  -- Works!
```

---

## Key Takeaways

1. **No setter? You have options** - Script files, different methods, or reflection
2. **Reflection is a last resort** - Try other options first
3. **Cache your fields** - Don't search every time you need them
4. **Match the type** - Use `setInt` for ints, `setFloat` for floats, etc.
5. **Always `setAccessible(true)`** - Required for protected/private fields

---

## What's Next?

- [Java Reflection Deep Dive](/pz/build-41/modding/engine-analysis/java-reflection-guide) - Complete reference for advanced users
- [Vehicle Parts Reference](/pz/build-41/modding/engine-analysis/vehicle-parts) - All the methods that DO have setters

---

**Reflection is powerful but complex.** Most vehicle mods don't need it - the normal methods are enough. But when you hit a wall, now you know there's a way through.
