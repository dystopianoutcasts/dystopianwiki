---
id: vehicle-parts-basics
slug: vehicle-parts-basics
title: "Working with Vehicle Parts"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: beginner
tags:
  - vehicle
  - parts
  - beginner
  - tutorial
  - condition
excerpt: "Learn to access vehicle parts - check tire condition, see if doors are open, find damaged components. Build a vehicle health checker."
related_articles:
  - your-first-vehicle-mod
  - reading-vehicle-stats
  - changing-vehicle-properties
  - vehicle-parts
next_steps:
  - title: "Changing Vehicle Properties"
    path: /pz/build-41/modding/engine-analysis/changing-vehicle-properties
  - title: "Vehicle Parts Reference"
    path: /pz/build-41/modding/engine-analysis/vehicle-parts
last_updated: 2026-01-28
---

# Working with Vehicle Parts

## What Are Vehicle Parts?

You know how in PZ you can open the hood and see the engine, battery, and other components? Each of those is a "part". When you look at a car's Mechanics menu and see condition percentages for the engine, tires, and doors - that's the parts system.

**You would use this when:**
- You want to warn players about damaged parts
- You're building a mechanic mod that repairs things
- You need to check if a door is open or locked
- You want to know if the trunk has space

---

## Prerequisites

Before this article, understand:
- [Your First Vehicle Mod](/pz/build-41/modding/engine-analysis/your-first-vehicle-mod) - Getting a vehicle reference
- [Reading Vehicle Stats](/pz/build-41/modding/engine-analysis/reading-vehicle-stats) - Basic vehicle info

---

## The Simplest Example

Let's check if the engine is damaged:

```lua
local function checkEngine()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if not vehicle then
        print("Get in a vehicle first!")
        return
    end
    
    -- Get the engine part
    local engine = vehicle:getPartById("Engine")
    
    if engine then
        local condition = engine:getCondition()
        print("Engine condition: " .. condition .. "%")
    else
        print("This vehicle has no engine!")
    end
end
```

**Line by line:**

| Line | What It Does |
|------|---------------|
| `vehicle:getPartById("Engine")` | Finds the part named "Engine" on this vehicle |
| `engine:getCondition()` | Gets its condition (0 = destroyed, 100 = perfect) |

---

## Part Names You Can Use

Every vehicle part has an ID. Here are the common ones:

| Part ID | What It Is | In-Game |
|---------|------------|----------|
| `Engine` | Engine block | Under the hood |
| `Battery` | Car battery | Powers the starter |
| `GasTank` | Fuel tank | Holds your gas |
| `TireFrontLeft` | Front left wheel | Driver side front |
| `TireFrontRight` | Front right wheel | Passenger side front |
| `TireRearLeft` | Back left wheel | Driver side back |
| `TireRearRight` | Back right wheel | Passenger side back |
| `DoorFrontLeft` | Driver door | Your door |
| `DoorFrontRight` | Passenger door | Passenger's door |
| `Windshield` | Front windshield | Glass you look through |
| `TrunkDoor` | Trunk lid | Back of the car |

**Tip:** If `getPartById()` returns `nil`, that part doesn't exist on this vehicle. Not all cars have all parts!

---

## Practical Example: Tire Checker

Let's build something useful - a mod that tells you if any tires need replacing:

```lua
local function checkTires()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if not vehicle then return end
    
    -- List of all tire part IDs
    local tireIds = {
        "TireFrontLeft",
        "TireFrontRight", 
        "TireRearLeft",
        "TireRearRight"
    }
    
    print("=== TIRE CHECK ===")
    
    for i = 1, #tireIds do
        local tireId = tireIds[i]
        local tire = vehicle:getPartById(tireId)
        
        if tire then
            local condition = tire:getCondition()
            
            if condition < 0 then
                print(tireId .. ": MISSING!")
            elseif condition < 20 then
                print(tireId .. ": " .. condition .. "% - REPLACE SOON!")
            else
                print(tireId .. ": " .. condition .. "% - OK")
            end
        else
            print(tireId .. ": Not on this vehicle")
        end
    end
end

Events.OnCustomUIKey.Add(function(key)
    if key == Keyboard.KEY_F7 then
        checkTires()
    end
end)
```

**Try it:** Press F7 while in a car. You'll see the condition of all four tires!

**What's that `#tireIds`?** In Lua, `#` gives you the length of a list. So `#tireIds` is 4.

**What's that `< 0` check?** When a part is missing (no tire installed), `getCondition()` returns `-1`. That's how the game says "nothing here".

---

## Checking Doors

Doors are parts too, but they have extra features - they can be open, locked, or have a broken lock:

```lua
local function checkDriverDoor()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if not vehicle then return end
    
    local doorPart = vehicle:getPartById("DoorFrontLeft")
    
    if not doorPart then
        print("No driver door!")
        return
    end
    
    -- Parts that are doors have a special "door" object
    local door = doorPart:getDoor()
    
    if door then
        print("Door open: " .. tostring(door:isOpen()))
        print("Door locked: " .. tostring(door:isLocked()))
        print("Lock broken: " .. tostring(door:isLockBroken()))
    end
end
```

**Why `doorPart:getDoor()`?** Not all parts have door features. Only door parts do. This gets the special door object that knows about locks and opening.

---

## Checking All Parts at Once

Instead of checking parts one by one, you can loop through ALL parts:

```lua
local function checkAllParts()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if not vehicle then return end
    
    -- Get all parts as a list
    local parts = vehicle:getParts()
    
    print("=== ALL PARTS ===")
    print("This vehicle has " .. parts:size() .. " parts")
    
    -- Loop through each part
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local id = part:getId()
        local condition = part:getCondition()
        
        -- Only show parts with condition (skip decorative parts)
        if condition >= 0 then
            print(id .. ": " .. condition .. "%")
        end
    end
end
```

**Why does the loop start at 0?** PZ uses Java lists internally, and Java counts from 0. So the first part is `parts:get(0)`, not `parts:get(1)`.

**Why `parts:size() - 1`?** If there are 5 parts, they're numbered 0, 1, 2, 3, 4. We stop at `size - 1` (which is 4).

---

## Practical Example: Vehicle Health Report

Let's build a complete health checker:

```lua
local function vehicleHealthReport()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if not vehicle then
        print("Get in a vehicle!")
        return
    end
    
    local parts = vehicle:getParts()
    local critical = {}   -- Parts under 20%
    local warning = {}    -- Parts 20-50%
    
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local condition = part:getCondition()
        
        if condition >= 0 then  -- Has a condition value
            if condition < 20 then
                table.insert(critical, part:getId() .. " (" .. condition .. "%)")
            elseif condition < 50 then
                table.insert(warning, part:getId() .. " (" .. condition .. "%)")
            end
        end
    end
    
    -- Show results
    print("=== VEHICLE HEALTH ===")
    print("Vehicle: " .. vehicle:getScriptName())
    
    if #critical > 0 then
        print("")
        print("CRITICAL (replace now!):")
        for i = 1, #critical do
            print("  - " .. critical[i])
        end
    end
    
    if #warning > 0 then
        print("")
        print("WARNING (repair soon):")
        for i = 1, #warning do
            print("  - " .. warning[i])
        end
    end
    
    if #critical == 0 and #warning == 0 then
        print("All parts in good condition!")
    end
end

Events.OnCustomUIKey.Add(function(key)
    if key == Keyboard.KEY_F8 then
        vehicleHealthReport()
    end
end)
```

**Try it:** Press F8 in any vehicle. You'll see a health report showing damaged parts!

**What's `table.insert()`?** It adds something to the end of a list. `table.insert(critical, "Engine")` adds "Engine" to the critical list.

---

## Quick Reference

| What You Want | Code |
|--------------|------|
| Get a specific part | `vehicle:getPartById("Engine")` |
| Get ALL parts | `vehicle:getParts()` |
| Part's condition | `part:getCondition()` |
| Part's name | `part:getId()` |
| Is it a door? | `part:getDoor()` (returns nil if not a door) |
| Is door open? | `part:getDoor():isOpen()` |
| Is door locked? | `part:getDoor():isLocked()` |

---

## Common Mistakes

### Mistake: Forgetting that loops start at 0

```lua
-- WRONG: Skips the first part!
for i = 1, parts:size() do
    local part = parts:get(i)  -- Crashes on last iteration!
end

-- RIGHT: Start at 0, end at size-1
for i = 0, parts:size() - 1 do
    local part = parts:get(i)
end
```

### Mistake: Calling getDoor() on non-door parts

```lua
-- WRONG: Engine isn't a door!
local engine = vehicle:getPartById("Engine")
local door = engine:getDoor()  -- Returns nil
print(door:isOpen())  -- CRASH: can't call isOpen on nil

-- RIGHT: Check first
local doorPart = vehicle:getPartById("DoorFrontLeft")
local door = doorPart:getDoor()
if door then
    print(door:isOpen())
end
```

---

## Key Takeaways

1. **`getPartById("Name")` gets one part** - Use the part IDs from the table above
2. **`getParts()` gets all parts** - Loop with `for i = 0, parts:size() - 1`
3. **`getCondition()` tells you part health** - 0-100, or -1 if missing
4. **Doors have special features** - Use `getDoor()` to check open/locked status
5. **Always check if things exist** - Parts and doors can be nil

---

## What's Next?

- [Changing Vehicle Properties](/pz/build-41/modding/engine-analysis/changing-vehicle-properties) - Actually modify parts and stats
- [Vehicle Parts Reference](/pz/build-41/modding/engine-analysis/vehicle-parts) - Complete list of all methods

---

**You can now inspect any vehicle!** Next, we'll learn how to actually change things - repair parts, add fuel, and more.
