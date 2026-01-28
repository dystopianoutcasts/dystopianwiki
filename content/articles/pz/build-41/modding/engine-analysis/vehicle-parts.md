---
id: vehicle-parts
slug: vehicle-parts
title: "Vehicle Parts Reference"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: intermediate
tags:
  - vehicle
  - parts
  - lua
  - modding
  - intermediate
excerpt: "Practical guide to working with vehicle parts in Lua - getting parts, checking conditions, installing/removing items, and modifying part behavior."
related_articles:
  - vehicle-architecture
  - vehicle-engine
  - java-reflection-guide
table_of_contents:
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "Understanding the Java-Lua Bridge"
    link: "#understanding-the-java-lua-bridge"
  - text: "Getting a Vehicle Reference"
    link: "#getting-a-vehicle-reference"
  - text: "Working with Parts"
    link: "#working-with-parts"
  - text: "Part Condition"
    link: "#part-condition"
  - text: "Installing and Removing Parts"
    link: "#installing-and-removing-parts"
  - text: "Part Containers (Trunks, Gloveboxes)"
    link: "#part-containers-trunks-gloveboxes"
  - text: "Doors and Windows"
    link: "#doors-and-windows"
  - text: "Part ModData (Custom Data)"
    link: "#part-moddata-custom-data"
  - text: "Practical Example: Repair All Parts"
    link: "#practical-example-repair-all-parts"
  - text: "Practical Example: Vehicle Health Monitor"
    link: "#practical-example-vehicle-health-monitor"
  - text: "Key Methods Reference"
    link: "#key-methods-reference"
  - text: "Next Steps"
    link: "#next-steps"
next_steps:
  - title: "Java Reflection Guide"
    path: /pz/build-41/modding/engine-analysis/java-reflection-guide
  - title: "Vehicle Engine & Transmission"
    path: /pz/build-41/modding/engine-analysis/vehicle-engine
  - title: "Vehicle Architecture Overview"
    path: /pz/build-41/modding/engine-analysis/vehicle-architecture
last_updated: 2026-01-28
---

# Vehicle Parts & Installation

Ever wanted to programmatically swap out a car's engine, check all tire conditions, or add items to the trunk? This guide shows you how to work with vehicle parts using Lua - from getting part references to installing and removing components.

**You would use this when:**
- You're building a mechanic mod that repairs or upgrades vehicles
- You want to programmatically check vehicle condition (dashboards, diagnostics)
- You're creating custom vehicle storage systems
- You need to access part containers (trunks, gloveboxes)

## Prerequisites

- [Vehicle Architecture Overview](/pz/build-41/modding/engine-analysis/vehicle-architecture) - Understanding the vehicle system
- [Java Reflection Guide](/pz/build-41/modding/engine-analysis/java-reflection-guide) - For accessing fields without setters
- Basic Lua and understanding of PZ's Java-Lua bridge

> **Practical focus.** This guide is about doing things with vehicle parts. For the underlying architecture, see the Vehicle Architecture article.

---

## Understanding the Java-Lua Bridge

Before we dive in, let's understand how you access Java objects from Lua.

### How Kahlua Works

Project Zomboid uses **Kahlua**, a Lua interpreter written in Java. When you call a method on a Java object from Lua, Kahlua:

1. Receives your Lua call
2. Finds the matching Java method
3. Converts Lua values to Java types
4. Calls the Java method
5. Converts the result back to Lua

```lua
-- This Lua code:
local speed = vehicle:getCurrentSpeedKmHour()

-- Calls this Java method:
-- public float getCurrentSpeedKmHour() { ... }
```

### Public vs Private Fields

In Java:
- **public** fields/methods = **potentially** accessible from Lua (if exposed)
- **protected/private** = NOT directly accessible (need getter/setter methods OR reflection)

When we find a `public` field in decompilation, that's exciting - but it doesn't guarantee Lua access. TIS must explicitly expose it.

### Getters vs Setters

Most part properties have **getters** (read) but some lack **setters** (write):

| Property | Getter | Setter | Notes |
|----------|--------|--------|-------|
| Condition | `getCondition()` | `setCondition(v)` | Both available |
| Category | `getCategory()` | - | Read-only |
| Inventory Item | `getInventoryItem()` | `setInventoryItem(item, skill)` | Setter needs skill arg |
| Container | `getItemContainer()` | - | Read-only, use container methods |

### When Setters Don't Exist

For fields without setters, you can use **Java reflection** to access them directly:

```lua
-- Find and cache the field
for i = 0, getNumClassFields(part) - 1 do
    local field = getClassField(part, i)
    if tostring(field):find("condition") then
        MyMod.conditionField = field
        field:setAccessible(true)
        break
    end
end

-- Use it directly
MyMod.conditionField:setInt(part, 100)  -- Force condition to 100
```

See [Java Reflection Guide](/pz/build-41/modding/engine-analysis/java-reflection-guide) for the complete pattern used in production mods.

---

## Getting a Vehicle Reference

Before working with parts, you need a vehicle reference.

### From a Player

```lua
-- Get the vehicle the player is in
local player = getPlayer()
local vehicle = player:getVehicle()

if vehicle then
    print("Player is in: " .. vehicle:getScriptName())
end
```

### From World Position

```lua
-- Get vehicle at a specific square
local square = getCell():getGridSquare(x, y, z)
local vehicle = square:getVehicleContainer()
```

### From Vehicle ID

```lua
-- Get vehicle by its unique ID
local vehicle = getVehicleById(vehicleId)
```

### All Vehicles in Cell

```lua
-- Iterate all vehicles
local vehicles = getCell():getVehicles()
for i = 0, vehicles:size() - 1 do
    local vehicle = vehicles:get(i)
    print(vehicle:getScriptName())
end
```

---

## Working with Parts

### Getting All Parts

```lua
local function listAllParts(vehicle)
    local parts = vehicle:getParts()
    
    print("Vehicle has " .. parts:size() .. " parts:")
    
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local id = part:getId()           -- Part identifier (e.g., "Engine")
        local condition = part:getCondition()  -- 0-100
        local category = part:getCategory()    -- e.g., "engine", "tire"
        
        print(string.format("  %s (%s): %d%%", id, category or "none", condition))
    end
end

-- Usage
local vehicle = getPlayer():getVehicle()
if vehicle then
    listAllParts(vehicle)
end
```

### Getting a Specific Part

```lua
-- By part ID
local engine = vehicle:getPartById("Engine")
local battery = vehicle:getPartById("Battery")
local frontLeftTire = vehicle:getPartById("TireFrontLeft")

-- Check if part exists and has item installed
if engine and engine:getInventoryItem() then
    print("Engine installed, condition: " .. engine:getCondition())
else
    print("No engine installed!")
end
```

### Common Part IDs

| Part ID | Category | Description |
|---------|----------|-------------|
| `Engine` | engine | Engine block |
| `Battery` | battery | Car battery |
| `GasTank` | gastank | Fuel tank |
| `TireFrontLeft` | tire | Front left wheel |
| `TireFrontRight` | tire | Front right wheel |
| `TireRearLeft` | tire | Rear left wheel |
| `TireRearRight` | tire | Rear right wheel |
| `DoorFrontLeft` | door | Driver door |
| `DoorFrontRight` | door | Passenger door |
| `SeatFrontLeft` | seat | Driver seat |
| `SeatFrontRight` | seat | Passenger seat |
| `Muffler` | muffler | Exhaust system |
| `Radio` | radio | Car radio |
| `Heater` | heater | Heating system |
| `Windshield` | window | Front windshield |
| `WindowFrontLeft` | window | Driver window |

---

## Part Condition

### Reading Condition

```lua
local function checkPartConditions(vehicle)
    local warnings = {}
    local parts = vehicle:getParts()
    
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local condition = part:getCondition()
        
        -- Condition thresholds
        if condition >= 0 and condition < 20 then
            table.insert(warnings, part:getId() .. " is critically damaged!")
        elseif condition >= 20 and condition < 50 then
            table.insert(warnings, part:getId() .. " needs repair.")
        end
    end
    
    return warnings
end
```

### Setting Condition (Admin/Debug)

```lua
-- Set a part's condition directly
local engine = vehicle:getPartById("Engine")
if engine then
    engine:setCondition(100)  -- Full condition
    
    -- If there's an installed item, update it too
    local item = engine:getInventoryItem()
    if item then
        item:setCondition(100)
    end
end
```

### Damaging Parts

```lua
local function damagePart(vehicle, partId, amount)
    local part = vehicle:getPartById(partId)
    if part then
        local current = part:getCondition()
        local newCondition = math.max(0, current - amount)
        part:setCondition(newCondition)
        
        -- Sync the installed item condition
        local item = part:getInventoryItem()
        if item then
            item:setCondition(newCondition)
        end
        
        return true
    end
    return false
end

-- Example: damage engine by 25 points
damagePart(vehicle, "Engine", 25)
```

---

## Installing and Removing Parts

### Check If Part Can Be Installed

```lua
local function canInstallItem(vehicle, partId, item, playerSkill)
    local part = vehicle:getPartById(partId)
    if not part then return false, "Part slot doesn't exist" end
    
    -- Check if slot is empty
    if part:getInventoryItem() then
        return false, "Part already installed"
    end
    
    -- Check item type compatibility
    local itemTypes = part:getItemType()  -- ArrayList of valid types
    if itemTypes then
        local validType = false
        for i = 0, itemTypes:size() - 1 do
            if item:getFullType() == itemTypes:get(i) then
                validType = true
                break
            end
        end
        if not validType then
            return false, "Wrong item type for this slot"
        end
    end
    
    -- Check mechanic skill requirement
    local scriptPart = part:getScriptPart()
    if scriptPart then
        local requiredSkill = scriptPart:getSkillMechanic() or 0
        if playerSkill < requiredSkill then
            return false, "Need Mechanics " .. requiredSkill
        end
    end
    
    return true
end
```

### Installing a Part (Simplified)

```lua
local function installPart(vehicle, partId, item, mechanicSkill)
    local part = vehicle:getPartById(partId)
    if not part then return false end
    
    -- The game's method handles all the details
    part:setInventoryItem(item, mechanicSkill)
    
    -- Trigger update
    vehicle:updatePartStats()
    
    return true
end
```

### Removing a Part

```lua
local function removePart(vehicle, partId)
    local part = vehicle:getPartById(partId)
    if not part then return nil end
    
    local item = part:getInventoryItem()
    if item then
        -- Remove from vehicle
        part:setInventoryItem(nil)
        vehicle:updatePartStats()
        
        -- Return the item so it can be added to inventory
        return item
    end
    
    return nil
end

-- Example usage
local removedTire = removePart(vehicle, "TireFrontLeft")
if removedTire then
    -- Add to player inventory
    getPlayer():getInventory():AddItem(removedTire)
end
```

---

## Part Containers (Trunks, Gloveboxes)

### Checking for Storage

```lua
local function getStorageParts(vehicle)
    local storageParts = {}
    local parts = vehicle:getParts()
    
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local container = part:getItemContainer()
        
        if container then
            table.insert(storageParts, {
                part = part,
                container = container,
                capacity = container:getCapacity(),
                usedWeight = container:getCapacityWeight()
            })
        end
    end
    
    return storageParts
end
```

### Adding Items to Vehicle Storage

```lua
local function addItemToTrunk(vehicle, item)
    local trunk = vehicle:getPartById("TruckBed")  -- or "TrunkDoor"
    if not trunk then return false end
    
    local container = trunk:getItemContainer()
    if not container then return false end
    
    -- Check capacity
    local itemWeight = item:getWeight()
    local freeSpace = container:getCapacity() - container:getCapacityWeight()
    
    if itemWeight <= freeSpace then
        container:AddItem(item)
        return true
    end
    
    return false
end
```

---

## Doors and Windows

### Door State

```lua
local function getDoorInfo(vehicle, partId)
    local part = vehicle:getPartById(partId)
    if not part then return nil end
    
    local door = part:getDoor()
    if not door then return nil end
    
    return {
        isOpen = door:isOpen(),
        isLocked = door:isLocked(),
        lockBroken = door:isLockBroken()
    }
end

-- Check driver door
local doorInfo = getDoorInfo(vehicle, "DoorFrontLeft")
if doorInfo then
    print("Door open: " .. tostring(doorInfo.isOpen))
    print("Door locked: " .. tostring(doorInfo.isLocked))
end
```

### Locking/Unlocking

```lua
local function lockAllDoors(vehicle)
    local parts = vehicle:getParts()
    
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local door = part:getDoor()
        
        if door and not door:isLockBroken() then
            door:setLocked(true)
        end
    end
end
```

### Window State

```lua
local function getWindowInfo(vehicle, partId)
    local part = vehicle:getPartById(partId)
    if not part then return nil end
    
    local window = part:getWindow()
    if not window then return nil end
    
    return {
        isOpen = window:isOpen(),
        isDestroyed = window:isDestroyed(),
        health = window:getHealth()
    }
end
```

---

## Part ModData (Custom Data)

You can store custom data on parts using ModData:

```lua
-- Store custom data
local function setPartCustomData(vehicle, partId, key, value)
    local part = vehicle:getPartById(partId)
    if part then
        local modData = part:getModData()
        modData[key] = value
    end
end

-- Read custom data
local function getPartCustomData(vehicle, partId, key)
    local part = vehicle:getPartById(partId)
    if part and part:hasModData() then
        return part:getModData()[key]
    end
    return nil
end

-- Example: Track how many times engine was repaired
setPartCustomData(vehicle, "Engine", "repairCount", 5)
local repairs = getPartCustomData(vehicle, "Engine", "repairCount")
```

---

## Practical Example: Repair All Parts

```lua
local function repairAllParts(vehicle, targetCondition)
    targetCondition = targetCondition or 100
    local repaired = 0
    local parts = vehicle:getParts()
    
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local currentCondition = part:getCondition()
        
        -- Only repair if below target and has an item
        if currentCondition >= 0 and currentCondition < targetCondition then
            if part:getInventoryItem() then
                part:setCondition(targetCondition)
                part:getInventoryItem():setCondition(targetCondition)
                repaired = repaired + 1
            end
        end
    end
    
    -- Update vehicle stats after repairs
    vehicle:updatePartStats()
    
    return repaired
end

-- Usage (admin command)
Events.OnCustomUIKey.Add(function(key)
    if key == Keyboard.KEY_F8 then
        local vehicle = getPlayer():getVehicle()
        if vehicle then
            local count = repairAllParts(vehicle, 100)
            print("Repaired " .. count .. " parts")
        end
    end
end)
```

---

## Practical Example: Vehicle Health Monitor

```lua
local VehicleMonitor = {}

function VehicleMonitor.getHealthReport(vehicle)
    local report = {
        overall = 0,
        critical = {},
        warning = {},
        good = {}
    }
    
    local totalCondition = 0
    local partCount = 0
    local parts = vehicle:getParts()
    
    for i = 0, parts:size() - 1 do
        local part = parts:get(i)
        local condition = part:getCondition()
        
        -- Skip parts without condition (-1 means N/A)
        if condition >= 0 then
            partCount = partCount + 1
            totalCondition = totalCondition + condition
            
            local info = {
                id = part:getId(),
                condition = condition,
                category = part:getCategory() or "unknown"
            }
            
            if condition < 20 then
                table.insert(report.critical, info)
            elseif condition < 50 then
                table.insert(report.warning, info)
            else
                table.insert(report.good, info)
            end
        end
    end
    
    if partCount > 0 then
        report.overall = math.floor(totalCondition / partCount)
    end
    
    return report
end

-- Usage
local vehicle = getPlayer():getVehicle()
if vehicle then
    local health = VehicleMonitor.getHealthReport(vehicle)
    print("Overall health: " .. health.overall .. "%")
    print("Critical parts: " .. #health.critical)
end
```

---

## Key Methods Reference

### VehiclePart Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getId()` | string | Part identifier |
| `getCategory()` | string | Part category |
| `getCondition()` | int | Condition 0-100 (-1 if N/A) |
| `setCondition(value)` | void | Set condition |
| `getInventoryItem()` | InventoryItem | Installed item (or nil) |
| `setInventoryItem(item, skill)` | void | Install/remove item |
| `getItemContainer()` | ItemContainer | Storage container (or nil) |
| `getDoor()` | VehicleDoor | Door component (or nil) |
| `getWindow()` | VehicleWindow | Window component (or nil) |
| `getModData()` | KahluaTable | Custom data storage |
| `hasModData()` | boolean | Has custom data? |
| `getVehicle()` | BaseVehicle | Parent vehicle |

### BaseVehicle Part Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getParts()` | ArrayList | All parts |
| `getPartById(id)` | VehiclePart | Specific part |
| `updatePartStats()` | void | Recalculate stats |
| `updateTotalMass()` | void | Recalculate mass |

---

## Next Steps

- [Vehicle Engine & Transmission](/pz/build-41/modding/engine-analysis/vehicle-engine) - Engine simulation
- [Vehicle Architecture](/pz/build-41/modding/engine-analysis/vehicle-architecture) - Full system overview
