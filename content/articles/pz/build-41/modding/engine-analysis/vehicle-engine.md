---
id: vehicle-engine
slug: vehicle-engine
title: "Vehicle Engine Reference"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: advanced
tags:
  - vehicle
  - engine
  - transmission
  - lua
  - advanced
excerpt: "Deep dive into vehicle engine mechanics - engine states, RPM, speed, fuel consumption, hotwiring, and how to manipulate them via Lua."
related_articles:
  - vehicle-parts
  - vehicle-architecture
  - java-reflection-guide
table_of_contents:
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Understanding Field Access"
    link: "#understanding-field-access"
  - text: "Engine State Machine"
    link: "#engine-state-machine"
  - text: "Engine Quality and Performance"
    link: "#engine-quality-and-performance"
  - text: "Speed and Movement"
    link: "#speed-and-movement"
  - text: "Transmission System"
    link: "#transmission-system"
  - text: "Fuel System"
    link: "#fuel-system"
  - text: "Hotwiring and Security"
    link: "#hotwiring-and-security"
  - text: "Lights System"
    link: "#lights-system"
  - text: "Vehicle Mass"
    link: "#vehicle-mass"
  - text: "Practical Example: Vehicle Dashboard"
    link: "#practical-example-vehicle-dashboard"
  - text: "Key Methods Reference"
    link: "#key-methods-reference"
  - text: "Next Steps"
    link: "#next-steps"
next_steps:
  - title: "Java Reflection Guide"
    path: /pz/build-41/modding/engine-analysis/java-reflection-guide
  - title: "Vehicle Parts & Installation"
    path: /pz/build-41/modding/engine-analysis/vehicle-parts
  - title: "Vehicle Architecture Overview"
    path: /pz/build-41/modding/engine-analysis/vehicle-architecture
last_updated: 2026-01-28
---

# Vehicle Engine & Transmission

Want to build a turbo mod that boosts engine power? Create a custom fuel system? Or understand why that car won't start? This guide covers the engine and transmission systems in Project Zomboid vehicles - how they work internally and how to manipulate them via Lua.

**You would use this when:**
- You're modifying engine performance (power, speed, fuel consumption)
- You're building hotwiring or security systems
- You want to understand the engine state machine (why won't it start?)
- You need to create custom dashboard/HUD elements showing engine stats

## Prerequisites

- [Vehicle Architecture Overview](/pz/build-41/modding/engine-analysis/vehicle-architecture) - Understanding the vehicle system
- [Vehicle Parts Reference](/pz/build-41/modding/engine-analysis/vehicle-parts) - Working with vehicle parts
- [Java Reflection Guide](/pz/build-41/modding/engine-analysis/java-reflection-guide) - For fields without setters

> **Advanced material.** Engine internals involve state machines, physics, and networking. Take it section by section.

---

## Understanding Field Access

Before we dive in, understand that not all engine properties have setters. Here's what you can and can't do directly:

### Fields WITH Setters (Easy to Modify)

| Field | Getter | Setter |
|-------|--------|--------|
| Engine Quality | `getEngineQuality()` | `setEngineQuality(v)` |
| Hotwired | `isHotwired()` | `setHotwired(v)` |
| Regulator | `getRegulator()` | `setRegulator(v)` |
| Regulator Speed | `getRegulatorSpeed()` | `setRegulatorSpeed(v)` |
| Headlights | `getHeadlightsOn()` | `setHeadlightsOn(v)` |

### Fields WITHOUT Setters (Need Reflection)

| Field | Getter | No Setter! | Solution |
|-------|--------|------------|----------|
| Throttle | `getThrottle()` | - | [Use reflection](/pz/build-41/modding/engine-analysis/java-reflection-guide) |
| Engine Speed (RPM) | `getEngineSpeed()` | - | Physics-driven, read-only |
| Engine Loudness | `getEngineLoudness()` | - | [Use reflection](/pz/build-41/modding/engine-analysis/java-reflection-guide) |
| Engine Power | `getEnginePower()` | - | [Use reflection](/pz/build-41/modding/engine-analysis/java-reflection-guide) |
| Braking Force | - | - | [Use reflection](/pz/build-41/modding/engine-analysis/java-reflection-guide) |

### Accessing Fields Without Setters

```lua
-- Cache fields once at startup
MyMod.EngineFields = {}

function MyMod.cacheEngineFields(vehicle)
    for i = 0, getNumClassFields(vehicle) - 1 do
        local field = getClassField(vehicle, i)
        local str = tostring(field)
        
        if str:find("engineLoudness") then
            MyMod.EngineFields.loudness = field
            field:setAccessible(true)
        elseif str:find("enginePower") then
            MyMod.EngineFields.power = field
            field:setAccessible(true)
        end
    end
end

-- Usage: Modify engine loudness directly
MyMod.EngineFields.loudness:setInt(vehicle, 50)  -- Quieter engine!
```

See [Java Reflection Guide](/pz/build-41/modding/engine-analysis/java-reflection-guide) for the complete pattern.

---

## Engine State Machine

The engine has five possible states:

```
┌──────────────────────────────────────────────────────────────┐
│                    ENGINE STATES                              │
│                                                               │
│   ┌────────┐    Start    ┌──────────┐   Success  ┌─────────┐│
│   │  Idle  │────────────▶│ Starting │───────────▶│ Running ││
│   └────────┘             └──────────┘             └─────────┘│
│       ▲                       │                       │      │
│       │                       │ Fail                  │      │
│       │                       ▼                       │      │
│       │                  ┌──────────┐                 │      │
│       │                  │  Failed  │                 │      │
│       │                  └──────────┘                 │      │
│       │                                               │      │
│       │                  ┌──────────┐                 │      │
│       └──────────────────│ Stalling │◀────────────────┘      │
│                          └──────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

### Engine States in Code

```java
// From BaseVehicle.java
public enum engineStateTypes {
    Idle,       // Engine off
    Starting,   // Attempting to start
    Running,    // Engine running
    Stalling,   // Engine dying
    Failed      // Start attempt failed
}

public engineStateTypes engineState = engineStateTypes.Idle;
```

### Checking Engine State in Lua

```lua
local function getEngineState(vehicle)
    local state = vehicle:getEngineState()
    
    -- Returns a string: "Idle", "Starting", "Running", "Stalling", "Failed"
    return tostring(state)
end

-- Check if engine is running
local function isEngineRunning(vehicle)
    return vehicle:isEngineRunning()
end

-- Check if engine is started (alias)
local function isEngineStarted(vehicle)
    return vehicle:isEngineStarted()
end
```

### Starting the Engine

```lua
local function tryStartEngine(vehicle, player)
    -- Check if can start
    if vehicle:isEngineRunning() then
        return true, "Already running"
    end
    
    -- Check for battery
    local battery = vehicle:getPartById("Battery")
    if not battery or not battery:getInventoryItem() then
        return false, "No battery"
    end
    
    if battery:getCondition() < 20 then
        return false, "Battery too weak"
    end
    
    -- Check for engine
    local engine = vehicle:getPartById("Engine")
    if not engine or not engine:getInventoryItem() then
        return false, "No engine"
    end
    
    -- Attempt start (handled by game)
    vehicle:engineDoStarting()
    
    return true, "Starting..."
end
```

### Stopping the Engine

```lua
local function stopEngine(vehicle)
    if vehicle:isEngineRunning() then
        vehicle:engineDoShuttingDown()
        return true
    end
    return false
end
```

---

## Engine Quality and Performance

### Key Engine Properties

```java
// From BaseVehicle.java - these affect performance
protected int engineQuality;      // Overall quality (0-100)
protected int engineLoudness;     // Noise level
protected int enginePower;        // Power rating
```

### Reading Engine Stats

```lua
local function getEngineStats(vehicle)
    return {
        quality = vehicle:getEngineQuality(),      -- 0-100
        loudness = vehicle:getEngineLoudness(),    -- Affects zombie attraction
        power = vehicle:getEnginePower(),          -- Affects speed/acceleration
        running = vehicle:isEngineRunning(),
        state = tostring(vehicle:getEngineState())
    }
end

-- Example
local stats = getEngineStats(vehicle)
print("Engine quality: " .. stats.quality .. "%")
print("Engine loudness: " .. stats.loudness)
```

### Modifying Engine Quality

```lua
-- Set engine quality directly (admin/debug)
local function setEngineQuality(vehicle, quality)
    quality = math.max(0, math.min(100, quality))
    vehicle:setEngineQuality(quality)
end

-- Example: Degrade engine over time
Events.EveryTenMinutes.Add(function()
    local player = getPlayer()
    local vehicle = player:getVehicle()
    
    if vehicle and vehicle:isEngineRunning() then
        local current = vehicle:getEngineQuality()
        if current > 0 then
            vehicle:setEngineQuality(current - 1)
        end
    end
end)
```

---

## Speed and Movement

### Speed Methods

```lua
local function getSpeedInfo(vehicle)
    return {
        -- Current speed in km/h
        speedKmh = vehicle:getCurrentSpeedKmHour(),
        
        -- Current speed in mph (calculated)
        speedMph = vehicle:getCurrentSpeedKmHour() * 0.621371,
        
        -- Maximum speed from script
        maxSpeed = vehicle:getMaxSpeed(),
        
        -- Is vehicle moving?
        isMoving = math.abs(vehicle:getCurrentSpeedKmHour()) > 0.5
    }
end

-- Example usage
local speed = getSpeedInfo(vehicle)
print(string.format("Speed: %.1f km/h (max: %.1f)", speed.speedKmh, speed.maxSpeed))
```

### Throttle Control

```lua
-- Read current throttle (0.0 to 1.0)
local throttle = vehicle:getThrottle()

-- Check if accelerating
if throttle > 0 then
    print("Accelerating at " .. (throttle * 100) .. "%")
end
```

### Speed Limiter (Cruise Control)

```lua
-- The game has a built-in regulator system
local function setSpeedLimit(vehicle, maxSpeedKmh)
    if maxSpeedKmh and maxSpeedKmh > 0 then
        vehicle:setRegulator(true)
        vehicle:setRegulatorSpeed(maxSpeedKmh)
    else
        vehicle:setRegulator(false)
    end
end

-- Example: Limit to 50 km/h
setSpeedLimit(vehicle, 50)

-- Remove limit
setSpeedLimit(vehicle, nil)
```

---

## Transmission System

### Transmission Numbers

```java
// From TransmissionNumber.java
public enum TransmissionNumber {
    R,  // Reverse
    N,  // Neutral  
    D1, // Drive 1 (lowest gear)
    D2, // Drive 2
    D3, // etc.
    D4,
    D5,
    D6,
    D7,
    D8  // Highest gear (max 8 gears)
}
```

### Checking Current Gear

```lua
local function getCurrentGear(vehicle)
    local transmission = vehicle:getTransmissionNumber()
    return tostring(transmission)  -- "R", "N", "D1", "D2", etc.
end

-- Numeric gear (for calculations)
local function getGearNumber(vehicle)
    local gear = tostring(vehicle:getTransmissionNumber())
    
    if gear == "R" then return -1 end
    if gear == "N" then return 0 end
    
    -- Extract number from "D1", "D2", etc.
    local num = gear:match("D(%d+)")
    return tonumber(num) or 0
end
```

### Engine RPM

```lua
-- Get current engine RPM
local function getEngineRPM(vehicle)
    return vehicle:getEngineSpeed()  -- Returns double
end

-- Example: RPM warning
local rpm = getEngineRPM(vehicle)
if rpm > 6000 then
    print("WARNING: High RPM!")
elseif rpm < 1000 and vehicle:isEngineRunning() then
    print("WARNING: Low RPM, might stall!")
end
```

### RPM Data per Gear

The game uses `VehicleEngineRPM` and `EngineRPMData` to define gear change points:

```lua
-- The RPM data is defined in vehicle scripts and loaded at runtime
-- Each gear has:
--   gearChange: RPM at which to shift up
--   afterGearChange: RPM after shifting

-- You can access this through the vehicle's script
local script = vehicle:getScript()
if script then
    -- Script contains engineRPM data
    local engineRPM = script:getEngineRPM()
    -- ... (complex access)
end
```

---

## Fuel System

### Checking Fuel Level

```lua
local function getFuelInfo(vehicle)
    local tank = vehicle:getPartById("GasTank")
    if not tank then
        return nil
    end
    
    local container = tank:getItemContainer()
    if not container then
        return nil
    end
    
    return {
        currentFuel = container:getUsedDelta(),  -- 0.0 to 1.0
        tankCondition = tank:getCondition(),
        percentFull = math.floor(container:getUsedDelta() * 100)
    }
end

-- Example
local fuel = getFuelInfo(vehicle)
if fuel then
    print("Fuel: " .. fuel.percentFull .. "%")
    if fuel.percentFull < 10 then
        print("WARNING: Low fuel!")
    end
end
```

### Adding Fuel

```lua
local function addFuel(vehicle, amount)
    local tank = vehicle:getPartById("GasTank")
    if not tank then return false end
    
    local container = tank:getItemContainer()
    if not container then return false end
    
    local current = container:getUsedDelta()
    local newLevel = math.min(1.0, current + amount)
    
    container:setUsedDelta(newLevel)
    return true
end

-- Fill tank completely
addFuel(vehicle, 1.0)

-- Add 25%
addFuel(vehicle, 0.25)
```

### Fuel Consumption Rate

```lua
-- Fuel consumption depends on:
-- 1. Engine quality (lower = more fuel)
-- 2. Speed (faster = more fuel)
-- 3. Vehicle mass (heavier = more fuel)
-- 4. Engine power setting

-- You can estimate consumption:
local function estimateFuelConsumption(vehicle)
    local engineQuality = vehicle:getEngineQuality()
    local speed = vehicle:getCurrentSpeedKmHour()
    
    -- Base consumption modified by quality
    local qualityMod = 1.0 + ((100 - engineQuality) / 100)
    
    -- Speed modifier (exponential at high speeds)
    local speedMod = 1.0 + (speed / 100) ^ 1.5
    
    return qualityMod * speedMod  -- Relative consumption rate
end
```

---

## Hotwiring and Security

### Key Properties

```java
// From BaseVehicle.java
private boolean keyIsOnDoor = false;
private boolean hotwired = false;
private boolean hotwiredBroken = false;
private boolean keysInIgnition = false;
private boolean alarmed = false;
private int alarmTime = -1;
```

### Checking Security State

```lua
local function getSecurityInfo(vehicle)
    return {
        hasKeyInIgnition = vehicle:isKeysInIgnition(),
        isHotwired = vehicle:isHotwired(),
        isHotwiredBroken = vehicle:isHotwiredBroken(),
        hasAlarm = vehicle:isAlarmed(),
        keyOnDoor = vehicle:isKeyIsOnDoor()
    }
end

-- Example
local security = getSecurityInfo(vehicle)
if security.isHotwired then
    print("Vehicle has been hotwired")
end
if security.hasAlarm then
    print("WARNING: Vehicle has an alarm!")
end
```

### Hotwiring a Vehicle

```lua
-- Note: Actual hotwiring requires specific conditions and skills
local function canHotwire(vehicle, player)
    -- Already hotwired or has key?
    if vehicle:isHotwired() or vehicle:isKeysInIgnition() then
        return false, "Already accessible"
    end
    
    -- Check electrical skill
    local electricSkill = player:getPerkLevel(Perks.Electricity)
    if electricSkill < 1 then
        return false, "Need Electrical skill"
    end
    
    -- Check for screwdriver
    local hasScrewdriver = player:getInventory():containsTypeRecurse("Screwdriver")
    if not hasScrewdriver then
        return false, "Need a screwdriver"
    end
    
    return true
end

-- Force hotwire (admin/debug)
local function forceHotwire(vehicle)
    vehicle:setHotwired(true)
end
```

### Triggering Alarm

```lua
local function triggerAlarm(vehicle)
    if vehicle:isAlarmed() then
        -- Alarm triggers automatically when entering without key
        -- Can also be triggered manually:
        vehicle:triggerAlarm()
    end
end
```

---

## Lights System

### Reading Light States

```lua
local function getLightStates(vehicle)
    return {
        headlights = vehicle:getHeadlightsOn(),
        stoplights = vehicle:getStoplightsOn(),
        interiorLights = vehicle:getWindowLightsOn(),
        horn = vehicle:isSoundHornOn(),
        reverseSignal = vehicle:isSoundBackMoveOn()
    }
end
```

### Controlling Lights

```lua
-- Toggle headlights
local function toggleHeadlights(vehicle)
    local current = vehicle:getHeadlightsOn()
    vehicle:setHeadlightsOn(not current)
end

-- Set all lights
local function setAllLights(vehicle, state)
    vehicle:setHeadlightsOn(state)
    vehicle:setStoplightsOn(state)
    vehicle:setWindowLightsOn(state)
end
```

### Lightbar (Police/Emergency)

```lua
-- Check if vehicle has lightbar
local function hasLightbar(vehicle)
    local lightbar = vehicle:getPartById("Lightbar")
    return lightbar ~= nil
end

-- Control lightbar
local function setLightbar(vehicle, lightsOn, sirenOn)
    -- The game uses mode objects for lightbar control
    local lightMode = vehicle:getLightbarLightsMode()
    local sirenMode = vehicle:getLightbarSirenMode()
    
    -- Enable/disable (actual API may vary)
    if lightsOn then
        lightMode:enable()
    else
        lightMode:disable()
    end
end
```

---

## Vehicle Mass

### Understanding Mass

```lua
-- Vehicle mass affects:
-- 1. Acceleration (heavier = slower)
-- 2. Fuel consumption (heavier = more fuel)
-- 3. Collision damage (heavier = more damage dealt)
-- 4. Towing capability

local function getMassInfo(vehicle)
    return {
        currentMass = vehicle:getMass(),       -- With contents
        baseMass = vehicle:getInitialMass(),   -- Empty vehicle
        cargoMass = vehicle:getMass() - vehicle:getInitialMass()
    }
end
```

### Forcing Mass Update

```lua
-- After adding/removing parts or cargo
vehicle:updateTotalMass()
```

---

## Practical Example: Vehicle Dashboard

```lua
local Dashboard = {}

function Dashboard.getFullStatus(vehicle)
    if not vehicle then return nil end
    
    local status = {
        -- Identity
        name = vehicle:getScriptName(),
        id = vehicle:getId(),
        
        -- Engine
        engine = {
            state = tostring(vehicle:getEngineState()),
            running = vehicle:isEngineRunning(),
            quality = vehicle:getEngineQuality(),
            rpm = vehicle:getEngineSpeed()
        },
        
        -- Movement
        movement = {
            speed = vehicle:getCurrentSpeedKmHour(),
            maxSpeed = vehicle:getMaxSpeed(),
            gear = tostring(vehicle:getTransmissionNumber()),
            throttle = vehicle:getThrottle()
        },
        
        -- Fuel
        fuel = Dashboard.getFuelPercent(vehicle),
        
        -- Security
        security = {
            hotwired = vehicle:isHotwired(),
            alarmed = vehicle:isAlarmed(),
            keysIn = vehicle:isKeysInIgnition()
        },
        
        -- Lights
        lights = {
            headlights = vehicle:getHeadlightsOn(),
            interior = vehicle:getWindowLightsOn()
        }
    }
    
    return status
end

function Dashboard.getFuelPercent(vehicle)
    local tank = vehicle:getPartById("GasTank")
    if tank then
        local container = tank:getItemContainer()
        if container then
            return math.floor(container:getUsedDelta() * 100)
        end
    end
    return 0
end

function Dashboard.printStatus(vehicle)
    local status = Dashboard.getFullStatus(vehicle)
    if not status then
        print("No vehicle")
        return
    end
    
    print("=== " .. status.name .. " ===")
    print(string.format("Engine: %s (%d%% quality)", 
        status.engine.state, status.engine.quality))
    print(string.format("Speed: %.1f / %.1f km/h [%s]",
        status.movement.speed, status.movement.maxSpeed, status.movement.gear))
    print(string.format("Fuel: %d%%", status.fuel))
    print(string.format("Lights: %s | Hotwired: %s",
        status.lights.headlights and "ON" or "OFF",
        status.security.hotwired and "YES" or "NO"))
end

-- Usage
Events.OnCustomUIKey.Add(function(key)
    if key == Keyboard.KEY_F9 then
        local vehicle = getPlayer():getVehicle()
        Dashboard.printStatus(vehicle)
    end
end)
```

---

## Key Methods Reference

### Engine Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `isEngineRunning()` | boolean | Is engine on? |
| `isEngineStarted()` | boolean | Is engine started? |
| `getEngineState()` | enum | Current state |
| `getEngineQuality()` | int | Quality 0-100 |
| `setEngineQuality(v)` | void | Set quality |
| `getEngineLoudness()` | int | Noise level |
| `getEnginePower()` | int | Power rating |
| `getEngineSpeed()` | double | Current RPM |
| `engineDoStarting()` | void | Attempt start |
| `engineDoShuttingDown()` | void | Stop engine |

### Movement Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getCurrentSpeedKmHour()` | float | Speed in km/h |
| `getMaxSpeed()` | float | Max speed |
| `getThrottle()` | float | Throttle 0-1 |
| `getTransmissionNumber()` | enum | Current gear |
| `getMass()` | float | Current mass |
| `getInitialMass()` | float | Base mass |

### Security Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `isHotwired()` | boolean | Is hotwired? |
| `setHotwired(v)` | void | Set hotwired |
| `isKeysInIgnition()` | boolean | Keys in? |
| `isAlarmed()` | boolean | Has alarm? |
| `triggerAlarm()` | void | Trigger alarm |

---

## Next Steps

- [Vehicle Parts & Installation](/pz/build-41/modding/engine-analysis/vehicle-parts) - Working with parts
- [Vehicle Architecture](/pz/build-41/modding/engine-analysis/vehicle-architecture) - Full system overview
