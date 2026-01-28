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

Sometimes you discover a public field in the Java source that would be perfect for your mod, but there's no getter or setter method exposed to Lua. This guide explains how to access those fields directly using Java reflection.

**You would use this when:**
- You've confirmed a field exists in decompiled code but has no Lua getter/setter
- You need maximum performance (field access can be faster than method calls)
- You've tried other approaches and they don't work

## Prerequisites

- [When PZ Won't Let You Change Something](/pz/build-41/modding/engine-analysis/when-setters-dont-exist) - Understanding the problem
- [Decompilation Setup](/pz/build-41/modding/engine-analysis/decompilation-setup) - Finding fields to access

> **This is advanced material.** Most mods don't need reflection - the normal API is enough. But when you hit a wall, this is your escape hatch.

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

## Common Pitfalls

### 1. Forgetting setAccessible

```lua
-- WRONG: Will fail on private/protected fields
field:setInt(zombie, 3)

-- RIGHT: Always call setAccessible first
field:setAccessible(true)
field:setInt(zombie, 3)
```

### 2. Wrong Type Method

```lua
-- WRONG: speedType is int, not float
field:getFloat(zombie)  -- Error or wrong value

-- RIGHT: Match the Java type
field:getInt(zombie)
```

### 3. Field String Mismatch

```lua
-- WRONG: Partial match might hit wrong field
if fieldString:find("speed") then

-- RIGHT: Exact match
if fieldString == "public int zombie.characters.IsoZombie.speedType" then
```

### 4. Not Caching

```lua
-- WRONG: Searching every frame
Events.OnTick.Add(function()
    for i = 0, getNumClassFields(zombie) - 1 do
        -- This is SLOW
    end
end)

-- RIGHT: Cache once, use forever
Events.OnGameStart.Add(initializeFieldCache)
Events.OnTick.Add(function()
    cachedField:setInt(zombie, value)  -- This is FAST
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
