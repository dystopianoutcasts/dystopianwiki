---
id: java-reflection-guide
slug: java-reflection-guide
title: "Java Reflection Deep Dive"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: advanced
tags:
  - java
  - reflection
  - lua
  - kahlua
  - advanced
  - performance
  - fields
excerpt: "How to access Java fields directly from Lua when no getter/setter exists, using Java reflection through Kahlua."
related_articles:
  - vehicle-architecture
  - vehicle-parts
  - vehicle-engine
  - isozombie-reference
last_updated: 2026-01-28
---

# Java Reflection for Lua Modders

You've decompiled the Java source. You found the perfect field - `public int speedType` - sitting right there in the code. You try `zombie.speedType` in Lua. Nil. You try `zombie:getSpeedType()`. Error: method doesn't exist. The field is right there in the Java class, publicly accessible, and Lua can't touch it. Why?

I remember hitting this wall with vehicle mods. I could see `engineQuality` in `BaseVehicle.java` - a public field controlling engine condition. But no getter, no setter, no way to access it from Lua. I spent hours trying every API combination. Then I discovered Java reflection - the escape hatch that lets you access any field in any Java object, whether TIS exposed it or not.

This guide shows you how to break through that wall.

## What is Java Reflection?

**Java reflection** is a feature that lets code inspect and modify fields/methods at runtime, even private ones. Project Zomboid exposes reflection functions to Lua, which means you can access any Java field directly - even if TIS never meant for you to.

**You would use this when:**
- You've confirmed a field exists in decompiled code but has no Lua getter/setter
- You need maximum performance (direct field access is faster than method calls)
- You've tried other approaches and they don't work

## Prerequisites

- [When PZ Won't Let You Change Something](/pz/build-41/modding/engine-analysis/when-setters-dont-exist) - Understanding the problem
- [Decompilation Setup](/pz/build-41/modding/engine-analysis/decompilation-setup) - Finding fields to access

> **This is advanced material.** Most mods don't need reflection - the normal API is enough. But when you hit a wall, this is your escape hatch. Don't worry if it feels complex at first - the pattern is actually quite simple once you see it working.

## Quick Start: Access a Hidden Field

Let's start with the simplest possible example: reading a field that has no getter.

```lua
-- Example: Read zombie's speedType field (normally hidden)
local zombie = getPlayer():getCell():getZombieList():get(0)  -- Get any zombie

-- Step 1: Find the field
local fieldCount = getNumClassFields(zombie)                 -- How many fields does zombie have?
local speedField = nil                                       -- We'll store the field here

for i = 0, fieldCount - 1 do                                -- Loop through all fields
    local field = getClassField(zombie, i)                   -- Get field object
    local fieldName = tostring(field):match("%.(%w+)$")      -- Extract name from string

    if fieldName == "speedType" then                         -- Found it!
        speedField = field
        break
    end
end

-- Step 2: Read the field value
if speedField then
    speedField:setAccessible(true)                           -- Unlock it (needed for private fields)
    local speed = speedField:getInt(zombie)                  -- Read the integer value
    print("Zombie speed: " .. speed)                         -- Output: "Zombie speed: 2" (or 1, 3, etc.)
end
```

**That's the core pattern:** Find field → setAccessible(true) → get/set value.

Everything else in this guide is optimization and best practices around that simple pattern.

> **Key Takeaway:** Reflection is just field lookup. You're searching through the Java object's fields by name, then reading/writing them directly. It bypasses Lua's normal API but uses the same underlying Java fields.

---

## Understanding Java Access Modifiers

When you decompile PZ's Java code, you'll see keywords like `public`, `private`, and `protected` before field declarations:

```java
public class IsoZombie {
    public int speedType;           // Accessible from Lua
    private float health;           // NOT accessible from Lua
    protected String name;          // NOT accessible from Lua
    public boolean isCrawler;       // Accessible from Lua
}
```

### What Each Modifier Means for Modders

| Modifier | Java Access | Lua Access | Can You Use It? |
|----------|------------|------------|------------------|
| `public` | Anyone | Yes, if exposed | Usually via getter/setter |
| `protected` | Same package + subclasses | No | Needs reflection |
| `private` | Same class only | No | Needs reflection |

**The key insight:** Even `public` fields aren't automatically available in Lua. TIS must explicitly expose them through the Kahlua bridge.

---

## The Kahlua Bridge

Project Zomboid uses **Kahlua**, a Lua interpreter written in Java. When you call `zombie:getHealth()` in Lua, Kahlua translates that to a Java method call.

### What Gets Exposed?

- **Methods** - Most public methods are exposed (getters, setters, actions)
- **Some fields** - TIS exposes certain fields directly
- **Many fields** - NOT exposed, even if public in Java

### The Problem

You find this in decompiled code:

```java
public class IsoZombie {
    public int speedType;  // Controls zombie speed (0-3)
}
```

But in Lua:

```lua
local zombie = getPlayer():getCell():getZombieList():get(0)
print(zombie.speedType)  -- nil! Field not exposed
print(zombie:getSpeedType())  -- Error! Method doesn't exist
```

**Solution:** Java reflection lets you access these fields anyway.

---

## Java Reflection in Lua

PZ exposes reflection functions that let you access any field on any Java object:

### Core Functions

| Function | Purpose |
|----------|--------|
| `getNumClassFields(object)` | Returns count of all fields on object |
| `getClassField(object, index)` | Returns field object at index |
| `field:setAccessible(true)` | Unlocks private/protected fields |
| `field:getInt(object)` | Read integer field value |
| `field:setInt(object, value)` | Write integer field value |
| `field:getFloat(object)` | Read float field value |
| `field:setFloat(object, value)` | Write float field value |
| `field:getBoolean(object)` | Read boolean field value |
| `field:setBoolean(object, value)` | Write boolean field value |
| `field:get(object)` | Read any field (returns Java object) |
| `field:set(object, value)` | Write any field |

---

## Step-by-Step: The OutcastZones Pattern

This pattern was developed for the OutcastZones mod to achieve **10x performance improvement** over traditional methods. Here's how it works:

### Step 1: Create a Field Cache

Don't look up fields every time - cache them once at startup:

```lua
MyMod = MyMod or {}
MyMod.CachedFields = {}
```

### Step 2: Initialize Fields on Game Start

```lua
function MyMod.initializeFields()
    -- Create a temporary object to scan its fields
    local tempZombie = IsoZombie.new(nil)
    
    -- Loop through ALL fields on the object
    local fieldCount = getNumClassFields(tempZombie)
    
    for i = 0, fieldCount - 1 do
        local field = getClassField(tempZombie, i)
        local fieldString = tostring(field)
        
        -- Field string format: "modifier type package.Class.fieldName"
        -- Example: "public int zombie.characters.IsoZombie.speedType"
        
        if fieldString == "public int zombie.characters.IsoZombie.speedType" then
            MyMod.CachedFields.speedType = field
        elseif fieldString == "public boolean zombie.characters.IsoZombie.isCrawler" then
            MyMod.CachedFields.isCrawler = field
        end
    end
    
    -- Make fields accessible (required for private/protected)
    if MyMod.CachedFields.speedType then
        MyMod.CachedFields.speedType:setAccessible(true)
    end
    if MyMod.CachedFields.isCrawler then
        MyMod.CachedFields.isCrawler:setAccessible(true)
    end
    
    print("MyMod: Field cache initialized")
end

-- Initialize when game starts
Events.OnGameStart.Add(MyMod.initializeFields)
```

### Step 3: Use Cached Fields

```lua
function MyMod.setZombieSpeed(zombie, speedType)
    -- speedType: 0=Shambler, 1=Fast Shambler, 2=Runner, 3=Sprinter
    if MyMod.CachedFields.speedType then
        MyMod.CachedFields.speedType:setInt(zombie, speedType)
    end
end

function MyMod.getZombieSpeed(zombie)
    if MyMod.CachedFields.speedType then
        return MyMod.CachedFields.speedType:getInt(zombie)
    end
    return -1
end

function MyMod.makeCrawler(zombie, isCrawler)
    if MyMod.CachedFields.isCrawler then
        MyMod.CachedFields.isCrawler:setBoolean(zombie, isCrawler)
    end
end
```

### Step 4: Use in Your Mod

```lua
-- Example: Make all zombies in a zone sprinters
function MyMod.makeZoneSprinters(x, y, z, radius)
    local cell = getCell()
    if not cell then return end
    
    local zombieList = cell:getZombieList()
    for i = 0, zombieList:size() - 1 do
        local zombie = zombieList:get(i)
        local zx, zy = zombie:getX(), zombie:getY()
        
        if math.abs(zx - x) < radius and math.abs(zy - y) < radius then
            MyMod.setZombieSpeed(zombie, 3)  -- 3 = Sprinter
        end
    end
end
```

---

## Why Cache Fields?

### Performance Comparison

```lua
-- SLOW: Looking up field every time
for i = 0, 1000 do
    for j = 0, getNumClassFields(zombie) - 1 do
        local field = getClassField(zombie, j)
        if tostring(field):find("speedType") then
            field:setInt(zombie, 3)
        end
    end
end

-- FAST: Using cached field (10x faster)
for i = 0, 1000 do
    MyMod.CachedFields.speedType:setInt(zombie, 3)
end
```

The OutcastZones mod found **10x performance improvement** by caching field references instead of looking them up every call.

---

## Finding Field Names

### Method 1: Print All Fields

```lua
function MyMod.printAllFields(object)
    local count = getNumClassFields(object)
    print("=== Fields for " .. tostring(object) .. " ===")
    for i = 0, count - 1 do
        local field = getClassField(object, i)
        print(i .. ": " .. tostring(field))
    end
end

-- Usage:
local zombie = getCell():getZombieList():get(0)
MyMod.printAllFields(zombie)
```

### Method 2: Search for Specific Field

```lua
function MyMod.findField(object, searchName)
    local count = getNumClassFields(object)
    for i = 0, count - 1 do
        local field = getClassField(object, i)
        local fieldStr = tostring(field)
        if fieldStr:lower():find(searchName:lower()) then
            print("Found: " .. fieldStr)
            return field
        end
    end
    print("Field not found: " .. searchName)
    return nil
end

-- Usage:
local speedField = MyMod.findField(zombie, "speedType")
```

### Method 3: Check Decompiled Source

If you have access to decompiled Java source, search for the field directly:

```java
// In IsoZombie.java
public int speedType;  // This is the exact field name
```

---

## Type-Specific Getters and Setters

| Java Type | Getter | Setter |
|-----------|--------|--------|
| `int` | `field:getInt(obj)` | `field:setInt(obj, value)` |
| `float` | `field:getFloat(obj)` | `field:setFloat(obj, value)` |
| `double` | `field:getDouble(obj)` | `field:setDouble(obj, value)` |
| `boolean` | `field:getBoolean(obj)` | `field:setBoolean(obj, value)` |
| `long` | `field:getLong(obj)` | `field:setLong(obj, value)` |
| `byte` | `field:getByte(obj)` | `field:setByte(obj, value)` |
| `short` | `field:getShort(obj)` | `field:setShort(obj, value)` |
| `char` | `field:getChar(obj)` | `field:setChar(obj, value)` |
| Object | `field:get(obj)` | `field:set(obj, value)` |

---

## Common Mistakes

Let me show you the mistakes that will crash your mod or destroy performance.

### ❌ Wrong: Forgetting setAccessible

```lua
-- Tries to access field without unlocking
field:setInt(zombie, 3)  -- ERROR on private/protected fields!
```

**Why it fails:** Java security prevents access to non-public fields. You must explicitly unlock them.

✅ **Right: Always Call setAccessible First**
```lua
-- Unlock the field first
field:setAccessible(true)                                -- Required for private/protected
field:setInt(zombie, 3)                                  -- Now it works
```

### ❌ Wrong: Using Wrong Type Method

```lua
-- speedType is 'int' in Java
field:getFloat(zombie)  -- Returns wrong value or errors!
```

**Why it fails:** Java types must match exactly. Using `getFloat()` on an `int` field gives garbage data.

✅ **Right: Match the Java Type**
```lua
-- Check Java source: 'public int speedType'
field:getInt(zombie)                                     -- Correct type method
```

### ❌ Wrong: Partial Field Name Match

```lua
-- Searches for any field with "speed" in name
if fieldString:find("speed") then
    -- Might match speedType, speedMod, baseSpeed, etc!
end
```

**Why it fails:** Multiple fields might contain your search term. You grab the wrong one.

✅ **Right: Exact Field String Match**
```lua
-- Match the complete field string
if fieldString == "public int zombie.characters.IsoZombie.speedType" then
    -- Only matches the exact field we want
end
```

### ❌ Wrong: Not Caching Field Lookups

```lua
-- Searches through ALL fields EVERY frame!
Events.OnTick.Add(function()
    for i = 0, getNumClassFields(zombie) - 1 do          -- 100+ fields scanned 60 times/sec!
        local field = getClassField(zombie, i)
        -- ... find and use field
    end
end)
```

**Why it fails:** Field lookup is expensive. Doing it every frame causes massive lag.

✅ **Right: Cache Once, Use Forever**
```lua
-- Cache fields on game start (once)
local cachedSpeedField = nil
Events.OnGameStart.Add(function()
    cachedSpeedField = findFieldOnce(zombie, "speedType")  -- Search once
end)

-- Use cached field (fast)
Events.OnTick.Add(function()
    if cachedSpeedField then
        cachedSpeedField:setInt(zombie, value)          -- No search needed!
    end
end)
```

---

## When to Use Reflection

### Use Reflection When:

- No getter/setter method exists in Lua
- You need maximum performance (field access is faster than method calls)
- You're modifying internal state that TIS didn't expose
- You've verified the field exists in decompiled source

### Don't Use Reflection When:

- A getter/setter already exists (use it instead)
- You're not sure what the field does (test first!)
- The field is clearly marked internal/temporary
- There's a Lua API that accomplishes the same thing

---

## Real-World Example: Vehicle Speed

From [Vehicle Engine System](/pz/build-41/modding/engine-analysis/vehicle-engine):

```lua
-- Some vehicle fields may not have setters exposed
-- Use reflection to access them directly

MyVehicleMod.VehicleFields = {}

function MyVehicleMod.initVehicleFields()
    local tempVehicle = getPlayer():getVehicle()
    if not tempVehicle then return end
    
    for i = 0, getNumClassFields(tempVehicle) - 1 do
        local field = getClassField(tempVehicle, i)
        local fieldStr = tostring(field)
        
        -- Cache fields you need
        if fieldStr:find("engineSpeed") then
            MyVehicleMod.VehicleFields.engineSpeed = field
            field:setAccessible(true)
        end
    end
end
```

---

## Try It Yourself: Debug Field Printer

Let's build a useful debugging tool that prints all fields on any object. This is invaluable when exploring the Java API.

**Goal:** Create a mod that prints all accessible fields on a zombie when you press a key.

### Step 1: Create the Mod

Create `C:\Users\[YOU]\Zomboid\mods\FieldDebugger\mod.info`:
```
name=Field Debugger
id=FieldDebugger
description=Prints all fields on objects for reflection debugging
```

### Step 2: Write the Field Printer

Create `C:\Users\[YOU]\Zomboid\mods\FieldDebugger\media\lua\client\FieldDebugger.lua`:

```lua
-- FieldDebugger.lua
-- Prints all fields and their values from any Java object

local function printAllFields(obj, objName)
    print("=== Fields for " .. objName .. " ===")

    local fieldCount = getNumClassFields(obj)            -- Get number of fields
    local successCount = 0                               -- Track how many we can read

    for i = 0, fieldCount - 1 do
        local field = getClassField(obj, i)              -- Get field object
        local fieldStr = tostring(field)                 -- Get full field string
        local fieldName = fieldStr:match("%.(%w+)$")     -- Extract just the name

        if fieldName then
            field:setAccessible(true)                    -- Unlock it

            -- Try to read the value (may fail for some types)
            local success, value = pcall(function()
                return field:get(obj)                    -- Generic getter
            end)

            if success then
                print("  " .. fieldName .. " = " .. tostring(value))
                successCount = successCount + 1
            else
                print("  " .. fieldName .. " = (couldn't read)")
            end
        end
    end

    print("=== Read " .. successCount .. " of " .. fieldCount .. " fields ===")
end

-- Press F to print zombie fields
local function onKeyPressed(key)
    if key == getCore():getKey("Interact") then          -- F key
        local player = getPlayer()
        if not player then return end

        -- Get nearest zombie
        local zombies = player:getCell():getZombieList()
        if zombies:size() > 0 then
            local zombie = zombies:get(0)
            printAllFields(zombie, "IsoZombie")
        else
            print("No zombies nearby")
        end
    end
end

Events.OnKeyPressed.Add(onKeyPressed)
```

### Step 3: Test It

1. Launch PZ with your mod
2. Start a game and find some zombies
3. Press F (Interact key) near a zombie
4. Check the console (press `~`) to see all fields printed

### Step 4: Explore!

Try printing fields for different objects:

```lua
-- Player fields
printAllFields(getPlayer(), "IsoPlayer")

-- Vehicle fields (if in a vehicle)
local vehicle = player:getVehicle()
if vehicle then
    printAllFields(vehicle, "BaseVehicle")
end

-- Item fields
local item = player:getPrimaryHandItem()
if item then
    printAllFields(item, "InventoryItem")
end
```

**What You Just Built:**
1. A reflection-based field inspector
2. A reusable debugging tool for ANY Java object
3. The foundation for discovering hidden fields you can modify

This tool is how I discover new fields for mods. Use it whenever you're exploring the API and want to see what's available.

---

## Summary

1. **Public doesn't mean accessible** - TIS must expose fields through Kahlua
2. **Reflection bypasses this** - Access any field on any Java object
3. **Cache your fields** - 10x performance improvement
4. **Match types exactly** - Use getInt for int, getFloat for float, etc.
5. **Always setAccessible(true)** - Required for private/protected fields
6. **Test thoroughly** - Modifying internal state can have unexpected effects

---

## Related Articles

- [Vehicle Architecture Overview](/pz/build-41/modding/engine-analysis/vehicle-architecture) - BaseVehicle public fields
- [Vehicle Parts System](/pz/build-41/modding/engine-analysis/vehicle-parts) - Using parts in Lua
- [Vehicle Engine System](/pz/build-41/modding/engine-analysis/vehicle-engine) - Engine fields and methods
- [IsoZombie Reference](/pz/build-41/modding/engine-analysis/isozombie-reference) - Zombie public fields

---

*Last Updated: 2026-01-28*
