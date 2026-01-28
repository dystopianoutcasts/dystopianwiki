---
id: engine-analysis-lua-modding-api
slug: lua-modding-api
title: "Lua Modding API Deep Dive"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: advanced
tags:
  - advanced
  - lua
  - api
  - luamanager
  - kahlua
  - modding
  - decompilation
excerpt: "Deep analysis of LuaManager.java (~8,893 lines), the heart of PZ modding. Covers Kahlua VM integration, @LuaMethod exposure, event system, hot reloading, and performance optimization patterns."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Architecture"
    link: "#architecture"
  - text: "Core Functions"
    link: "#core-functions"
  - text: "@LuaMethod Annotation"
    link: "#luamethod-annotation"
  - text: "Global Functions Exposed"
    link: "#global-functions-exposed"
  - text: "Mod State Management"
    link: "#mod-state-management"
  - text: "Hot Reloading"
    link: "#hot-reloading"
  - text: "Debug Tools"
    link: "#debug-tools"
  - text: "Type Conversion"
    link: "#type-conversion"
  - text: "Event System"
    link: "#event-system"
  - text: "Performance Considerations"
    link: "#performance-considerations"
  - text: "Modding Patterns"
    link: "#modding-patterns"
  - text: "Capabilities Summary"
    link: "#capabilities-summary"
  - text: "Key Files Reference"
    link: "#key-files-reference"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Core Systems Architecture"
    path: /pz/build-41/modding/engine-analysis/core-systems-architecture
  - title: "Events Overview"
    path: /pz/build-41/modding/lua-api/events-overview
  - title: "Decompilation Setup"
    path: /pz/build-41/modding/engine-analysis/decompilation-setup
last_updated: 2026-01-28
---

# Lua Modding API Deep Dive

## Overview

Every line of Lua code you write in your mods flows through one massive Java file: `LuaManager.java`. At ~8,893 lines, it's the heart of PZ modding - the bridge between your Lua scripts and the game's Java engine.

This article documents what we've learned by reading that file, so you don't have to.

**You would use this when:**
- You want to understand how your Lua code actually talks to the game
- You're debugging something and need to know what's happening under the hood
- You want to optimize your mod's performance
- You're looking for undocumented functions or capabilities

> **This is a deep technical reference with 14 sections.** You don't need to understand all of it - most modders never need this level of detail. But when you do need it, it's here.

## Prerequisites

This is advanced content. You should be comfortable with:
- [Events Overview](/pz/build-41/modding/lua-api/events-overview) - How events work
- [Decompilation Setup](/pz/build-41/modding/engine-analysis/decompilation-setup) - How to read PZ's source
- Basic Lua programming

> **LuaManager.java is the heart of PZ modding.** All mod functionality flows through this class.

## Architecture

### Lua VM Integration

PZ uses the **Kahlua Lua VM**, a Java-based Lua interpreter:

```java
public static KahluaConverterManager converterManager  // Type conversion
public static J2SEPlatform platform                    // Java platform
public static KahluaTable env                          // Global Lua environment
public static KahluaThread thread                      // Main Lua thread
public static LuaCaller caller                         // Function caller
```

### Java-Lua Bridge

The bridge uses reflection to expose Java methods to Lua:

```java
public static LuaManager.Exposer exposer  // Exposes Java classes to Lua
```

## Core Functions

### Lua Execution

| Method | Purpose |
|--------|----------|
| `RunLua(String)` | Execute Lua code |
| `RunLua(String, boolean)` | Execute with error handling |
| `getDotDelimitedClosure(String)` | Get Lua function reference |

**Usage from Java:**
```java
LuaManager.RunLua("print('Hello from Java')");
```

### Mod Loading

| Method | Purpose |
|--------|----------|
| `LoadDir(String)` | Load mod directory |
| `LoadDirBase(String)` | Load base mod files |
| `LoadDirBase(String, boolean)` | Load with validation |
| `searchFolders(URI, File)` | Search for mod files |

**Mod Loading Pipeline:**
1. **Discovery** - Search for mod directories
2. **Validation** - Check mod integrity
3. **Loading** - Execute mod Lua files
4. **Registration** - Register functions and events
5. **Activation** - Enable mod functionality

### File System

```java
getLuaCacheDir()                    // Get Lua cache directory
getModFileWriter(...)               // Write to mod files
getFileWriter(...)                  // General file writing
getSandboxFileWriter(...)           // Sandbox-safe writing
```

## @LuaMethod Annotation

Java methods exposed to Lua use the `@LuaMethod` annotation:

```java
@LuaMethod(name = "getHealth", global = false)
public float getHealth() {
    return this.health;
}
```

**Annotation Properties:**
- `name` - Lua function name
- `global` - Is it a global function?

### Finding @LuaMethod Functions

Search the decompiled source for `@LuaMethod` to discover all exposed functions:

```bash
grep -r "@LuaMethod" ./decompiled/
```

## Global Functions Exposed

### Model Loading

```java
@LuaMethod(name = "loadVehicleModel", global = true)
@LuaMethod(name = "loadStaticZomboidModel", global = true)
@LuaMethod(name = "loadSkinnedZomboidModel", global = true)
@LuaMethod(name = "loadZomboidModel", global = true)
@LuaMethod(name = "setModelMetaData", global = true)
@LuaMethod(name = "reloadModelsMatching", global = true)
```

**Lua Usage:**
```lua
loadVehicleModel("vehicleName")
loadStaticZomboidModel("modelName")
```

### Audio System

```java
@LuaMethod(name = "getSLSoundManager", global = true)
@LuaMethod(name = "getRadioAPI", global = true)
```

**Lua Usage:**
```lua
local soundMgr = getSLSoundManager()
local radioAPI = getRadioAPI()
```

### Steam Workshop

```java
querySteamWorkshopItemDetails(ArrayList<String>, LuaClosure, Object)
```

## Mod State Management

### Internal Tracking

```java
public static ArrayList<String> loaded           // Loaded mods
private static final HashSet<String> loading     // Currently loading
public static HashMap<String, Object> loadedReturn  // Return values
public static boolean checksumDone               // Validation status
public static ArrayList<String> loadList         // Load order
static ArrayList<String> paths                   // Search paths
```

### Checking Loaded Mods

```lua
-- From Lua
local loadedCount = getLoadedLuaCount()
for i = 0, loadedCount - 1 do
    local modPath = getLoadedLua(i)
    print(modPath)
end
```

## Hot Reloading

PZ supports hot reloading of Lua files during development:

```java
reloadLuaFile(String)        // Reload specific file
reloadServerLuaFile(String)  // Reload server file
```

**Lua Usage:**
```lua
-- Reload a specific file
reloadLuaFile("MyMod/media/lua/client/MyScript.lua")
```

## Debug Tools

### Debugging Functions

```java
debugLuaTable(Object, int)     // Debug tables with depth
debugLuaTable(Object)          // Simple table debug
getLineNumber(LuaCallFrame)    // Get current line
getFilenameOfCallframe(...)    // Get current file
```

### Debugger Integration

```java
getLuaDebuggerErrorCount()     // Error count
getLuaDebuggerErrors()         // Get all errors
doLuaDebuggerAction(String)    // Execute debugger action
```

**Lua Usage:**
```lua
local errors = getLuaDebuggerErrors()
for i, err in ipairs(errors) do
    print("Error: " .. err)
end
```

## Type Conversion

The `KahluaConverterManager` handles automatic type conversion:

### Java to Lua

| Java Type | Lua Type |
|-----------|----------|
| `int`, `float`, `double` | number |
| `String` | string |
| `boolean` | boolean |
| `ArrayList`, arrays | table |
| Java objects | userdata |

### Lua to Java

| Lua Type | Java Type |
|----------|----------|
| number | Double (auto-converts) |
| string | String |
| boolean | Boolean |
| table | KahluaTable |
| function | LuaClosure |

## Event System

Events are the primary hook mechanism for mods:

### How Events Work

1. **Java fires event** - Engine calls Lua
2. **Lua handlers run** - Registered functions execute
3. **Results return** - Some events expect returns

### Common Event Pattern

```lua
-- Register for event
Events.OnZombieUpdate.Add(function(zombie)
    -- Handle zombie update
end)

-- Remove handler
Events.OnZombieUpdate.Remove(myHandler)
```

### Event Dispatch (Java side)

```java
// Simplified representation
public void triggerEvent(String eventName, Object... args) {
    LuaClosure closure = getEventHandler(eventName);
    if (closure != null) {
        caller.call(closure, args);
    }
}
```

## Performance Considerations

### Lua-Java Call Overhead

Every Lua-to-Java call has overhead:

1. **Type conversion** - Arguments converted
2. **Reflection** - Method lookup
3. **Execution** - Java code runs
4. **Return conversion** - Results converted back

**Best Practice:** Minimize calls in tight loops:

```lua
-- Bad: Many Java calls
for i = 1, 1000 do
    local x = zombie:getX()  -- Java call
    local y = zombie:getY()  -- Java call
    -- process
end

-- Better: Cache values
local x = zombie:getX()
local y = zombie:getY()
for i = 1, 1000 do
    -- use cached x, y
end
```

### Direct Field Access

When fields are public, direct access is faster than method calls:

```lua
-- Slower: Method call
local speed = zombie:getSpeedType()

-- Faster: Direct field (if public)
local speed = zombie.speedType
```

## Modding Patterns

### Pattern 1: Event-Driven

```lua
local MyMod = {}

function MyMod.onGameStart()
    print("Game started!")
end

function MyMod.onZombieUpdate(zombie)
    -- Handle zombie
end

Events.OnGameStart.Add(MyMod.onGameStart)
Events.OnZombieUpdate.Add(MyMod.onZombieUpdate)
```

### Pattern 2: Module System

```lua
-- MyMod/media/lua/shared/MyModule.lua
MyModule = MyModule or {}

function MyModule.initialize()
    -- Setup
end

function MyModule.getVersion()
    return "1.0.0"
end

return MyModule
```

### Pattern 3: Class-like Objects

```lua
local MyClass = ISBaseObject:derive("MyClass")

function MyClass:new()
    local o = ISBaseObject:new()
    setmetatable(o, self)
    self.__index = self
    return o
end

function MyClass:doSomething()
    -- Implementation
end

return MyClass
```

## Capabilities Summary

### What Mods Can Do

1. **Load and execute Lua** at runtime
2. **Access Java systems** through exposed APIs
3. **Register event handlers** for game events
4. **Modify game behavior** through callbacks
5. **Load custom assets** (models, sounds, textures)
6. **Create custom UI** elements
7. **Modify character behavior** and AI
8. **Add custom mechanics** and systems
9. **Integrate with Steam Workshop**
10. **Debug and profile** code execution

### Limitations

1. **Performance impact** of Lua execution
2. **Memory management** for loaded mods
3. **Thread safety** in multiplayer
4. **Mod compatibility** and load order
5. **Security** for untrusted mods

## Key Files Reference

### LuaManager.java Structure

| Section | Lines | Purpose |
|---------|-------|----------|
| Imports | 1-50 | Dependencies |
| Static fields | 51-150 | Global state |
| Initialization | 151-500 | Setup code |
| Mod loading | 501-1500 | Load system |
| Execution | 1501-3000 | Run Lua code |
| Type conversion | 3001-5000 | Java-Lua bridge |
| Events | 5001-7000 | Event system |
| Utilities | 7001-8893 | Helper functions |

## Key Takeaways

1. **LuaManager is ~8,893 lines** - The modding heart
2. **Kahlua VM** powers Lua execution
3. **@LuaMethod exposes Java** to Lua
4. **Events are the primary hook** mechanism
5. **Hot reloading** enables rapid development
6. **Type conversion is automatic** but has overhead
7. **Direct field access** beats method calls
8. **Cache Java calls** in tight loops
