---
id: engine-analysis-vehicle-architecture
slug: vehicle-architecture
title: "Vehicle Architecture Reference"
game: pz
version: build-41
section: modding
category: engine-analysis
subcategory: null
difficulty: advanced
tags:
  - advanced
  - vehicle
  - basevehicle
  - architecture
  - decompilation
  - physics
excerpt: "Deep analysis of Project Zomboid's vehicle system architecture from BaseVehicle.java decompilation. Covers physics integration, parts system, engine states, multiplayer sync, and modding access points."
table_of_contents:
  - text: "Overview"
    link: "#overview"
  - text: "Prerequisites"
    link: "#prerequisites"
  - text: "How to Use This Information"
    link: "#how-to-use-this-information"
  - text: "Core Classes"
    link: "#core-classes"
  - text: "Key Fields Discovered"
    link: "#key-fields-discovered"
  - text: "Parts System"
    link: "#parts-system"
  - text: "Wheel System"
    link: "#wheel-system"
  - text: "Physics Integration"
    link: "#physics-integration"
  - text: "Multiplayer Networking"
    link: "#multiplayer-networking"
  - text: "Passengers"
    link: "#passengers"
  - text: "Audio System"
    link: "#audio-system"
  - text: "Engine RPM System"
    link: "#engine-rpm-system"
  - text: "Vehicle Script Integration"
    link: "#vehicle-script-integration"
  - text: "Vehicle Lifecycle"
    link: "#vehicle-lifecycle"
  - text: "Modding Access"
    link: "#modding-access"
  - text: "Related Classes"
    link: "#related-classes"
  - text: "Key Takeaways"
    link: "#key-takeaways"
next_steps:
  - title: "Java Reflection Guide"
    path: /pz/build-41/modding/engine-analysis/java-reflection-guide
  - title: "Vehicle Parts & Installation"
    path: /pz/build-41/modding/engine-analysis/vehicle-parts
  - title: "Vehicle Engine & Transmission"
    path: /pz/build-41/modding/engine-analysis/vehicle-engine
  - title: "Core Systems Architecture"
    path: /pz/build-41/modding/engine-analysis/core-systems-architecture
last_updated: 2026-01-28
---

# Vehicle Architecture Overview

## Overview

Ever tried to mod a vehicle and wondered why changing the engine didn't make it faster? Or why your "indestructible" car still took damage? The answers are buried in `BaseVehicle.java` - ~3,000 lines of physics, networking, and state management.

This article provides a deep dive into Project Zomboid's vehicle system based on decompilation of the `vehicles/` package. Understanding this architecture is essential for creating vehicle mods, custom parts, and modifying vehicle behavior.

**You would use this when:**
- You're creating custom vehicles and need to understand the part system
- You want to modify vehicle physics (speed, mass, handling)
- You're debugging why your vehicle mod doesn't work as expected
- You need to access fields that don't have Lua setter methods

## Prerequisites

- [Decompilation Setup](/pz/build-41/modding/engine-analysis/decompilation-setup) - How to read PZ's Java source
- [Java Reflection Guide](/pz/build-41/modding/engine-analysis/java-reflection-guide) - Accessing fields without setters
- Basic understanding of vehicle scripts (.txt files)

> **This is a reference article.** It documents what we found in the source code. You don't need to memorize it all - use it as a lookup when you're working on vehicle mods.

---

## How to Use This Information

Before diving into the technical details, let's understand HOW you can use what we've discovered.

### What "Public" Means for Modders

When you see fields like this in decompiled Java code:

```java
public short VehicleID = -1;              // PUBLIC - potentially accessible
protected String scriptName;              // PROTECTED - not directly accessible
private float maxSpeed;                   // PRIVATE - not directly accessible
```

**What these mean:**

| Modifier | In Java | In Lua | What You Can Do |
|----------|---------|--------|------------------|
| `public` | Anyone can access | **Maybe** - if TIS exposed it | Check for getter/setter methods |
| `protected` | Package + subclasses | **No** direct access | Need reflection or exposed methods |
| `private` | Same class only | **No** direct access | Need reflection or exposed methods |

**Important:** Just because a field is `public` in Java doesn't mean it's accessible from Lua. TIS must explicitly expose it through the Kahlua bridge (PZ's Lua interpreter).

### Getters and Setters

Most fields are accessed through **getter** and **setter** methods:

```lua
-- GETTER: Read a value
local quality = vehicle:getEngineQuality()  -- Calls Java method

-- SETTER: Write a value  
vehicle:setEngineQuality(100)               -- Calls Java method
```

**The reality:**
- Most fields have **getters** (read access)
- Many fields **lack setters** (no write access)
- Some fields are **read-only by design**

### When Setters Don't Exist

If you find a field but there's no setter method:

```lua
-- This field exists in Java:
-- protected int enginePower;

-- But there's no setEnginePower() method!
vehicle:setEnginePower(5000)  -- ERROR: method doesn't exist
```

**Solution: Java Reflection**

You can bypass the missing setter using reflection:

```lua
-- Find and cache the field once
for i = 0, getNumClassFields(vehicle) - 1 do
    local field = getClassField(vehicle, i)
    if tostring(field):find("enginePower") then
        MyMod.enginePowerField = field
        field:setAccessible(true)
        break
    end
end

-- Then use it to read/write directly
local currentPower = MyMod.enginePowerField:getInt(vehicle)
MyMod.enginePowerField:setInt(vehicle, 5000)
```

See [Java Reflection Guide](/pz/build-41/modding/engine-analysis/java-reflection-guide) for complete details.

### Field Access Quick Reference

| Field | Getter | Setter | If No Setter |
|-------|--------|--------|-------------|
| `engineQuality` | `getEngineQuality()` | `setEngineQuality(v)` | - |
| `engineState` | `getEngineState()` | via `engineDoStarting()` | Use state methods |
| `throttle` | `getThrottle()` | **None** | Reflection |
| `mass` | `getMass()` | via `updateTotalMass()` | Recalculates from parts |
| `rust` | `getRust()` | `setRust(v)` | - |
| `hotwired` | `isHotwired()` | `setHotwired(v)` | - |

---

## Core Classes

### Class Hierarchy

```
IsoMovingObject
└── BaseVehicle (~3000+ lines)
    ├── VehiclePart (~800 lines)
    ├── VehicleDoor
    ├── VehicleWindow
    ├── VehicleLight
    └── VehicleEngineRPM
```

### BaseVehicle.java

**Location:** `zombie/vehicles/BaseVehicle.java`
**Lines:** ~3,000+
**Extends:** `IsoMovingObject`
**Implements:** `Thumpable`, `IFMODParameterUpdater`

**Purpose:** Core vehicle entity class containing all vehicle logic

## Key Fields Discovered

### Identity & State

```java
public short VehicleID = -1;              // Unique vehicle ID
public int sqlID = -1;                    // Database ID
protected String scriptName;              // Script definition name
protected VehicleScript script;           // Parsed script data
protected boolean bCreated;               // Is fully created
public boolean addedToWorld = false;      // In world
```

### Physics & Movement

```java
public float throttle = 0.0F;             // Current throttle
public double engineSpeed;                // Engine RPM
public TransmissionNumber transmissionNumber;  // Current gear
private float maxSpeed;                   // Max vehicle speed
private float mass = 0.0F;                // Current mass
private float initialMass = 0.0F;         // Base mass
private float brakingForce = 0.0F;        // Braking power
private float currentSteering = 0.0F;     // Wheel angle
private boolean isBraking = false;        // Braking state
protected CarController physics;          // Bullet physics controller
```

### Durability & Damage

```java
public int frontEndDurability = 100;      // Front armor
public int rearEndDurability = 100;       // Rear armor
public int currentFrontEndDurability = 100;
public int currentRearEndDurability = 100;
public float rust = 0.0F;                 // Rust level (0-1)
```

### Visual & Color

```java
public float colorHue = 0.0F;             // HSV hue
public float colorSaturation = 0.0F;      // HSV saturation
public float colorValue = 0.0F;           // HSV value
protected int skinIndex = -1;             // Texture variant
```

### Engine State

```java
public engineStateTypes engineState;      // Current engine state
public long engineLastUpdateStateTime;
protected int engineQuality;              // Engine quality (affects performance)
protected int engineLoudness;             // Engine noise level
protected int enginePower;                // Engine power rating
```

### Engine State Types

```java
public enum engineStateTypes {
    Idle,
    Starting,
    Running,
    Stalling,
    Failed
}
```

### Lights & Signals

```java
public boolean headlightsOn = false;
public boolean stoplightsOn = false;
public boolean windowLightsOn = false;
public boolean soundHornOn = false;
public boolean soundBackMoveOn = false;
public final LightbarLightsMode lightbarLightsMode;
public final LightbarSirenMode lightbarSirenMode;
```

### Security

```java
private boolean keyIsOnDoor = false;
private boolean hotwired = false;
private boolean hotwiredBroken = false;
private boolean keysInIgnition = false;
private boolean alarmed = false;
private int alarmTime = -1;
```

## Parts System

### VehiclePart.java

**Purpose:** Represents individual vehicle components

```java
public final class VehiclePart {
    protected BaseVehicle vehicle;        // Parent vehicle
    protected String partId;              // Part identifier
    protected VehicleScript.Part scriptPart;  // Script definition
    protected ItemContainer container;    // Storage (if applicable)
    protected InventoryItem item;         // Installed item
    protected int condition = -1;         // Part condition (0-100)
    protected VehiclePart parent;         // Parent part
    protected ArrayList<VehiclePart> children;  // Child parts
    protected String category;            // Part category
    protected VehicleDoor door;           // Door component
    protected VehicleWindow window;       // Window component
    protected VehicleLight light;         // Light component
    
    // Performance stats from installed item
    protected float wheelFriction = 0.0F;
    private float suspensionDamping = 0.0F;
    private float suspensionCompression = 0.0F;
    private float engineLoudness = 0.0F;
}
```

### Part Categories

Common part categories from script analysis:

| Category | Examples |
|----------|----------|
| `engine` | Engine block |
| `battery` | Battery |
| `gastank` | Fuel tank |
| `tire` | Wheels/tires |
| `seat` | Driver/passenger seats |
| `door` | Doors |
| `window` | Windows |
| `hood` | Hood |
| `trunk` | Trunk lid |
| `muffler` | Exhaust |
| `radio` | Radio |
| `heater` | Heater |

### Parts Array

```java
// In BaseVehicle
protected final ArrayList<VehiclePart> parts = new ArrayList<>();
protected VehiclePart battery;  // Quick reference
protected final ArrayList<VehiclePart> lights = new ArrayList<>();
```

## Wheel System

### Wheel Constants

```java
public static final int MAX_WHEELS = 4;
public static final int PHYSICS_PARAM_COUNT = 27;
```

### WheelInfo

```java
public final WheelInfo[] wheelInfo = new WheelInfo[4];

public class WheelInfo {
    float suspensionLength;
    float steering;
    float rotation;
    boolean skidding;
    // ... more physics data
}
```

## Physics Integration

### Bullet Physics

PZ uses **Bullet Physics** for vehicle simulation:

```java
import zombie.core.physics.Bullet;
import zombie.core.physics.CarController;
import zombie.core.physics.Transform;
import zombie.core.physics.WorldSimulation;

protected CarController physics;  // Bullet car controller
```

### Transform Data

```java
public final Transform jniTransform = new Transform();
public float jniSpeed;                    // Speed from physics
public boolean jniIsCollide;              // Collision detected
public final Vector3f jniLinearVelocity = new Vector3f();
```

### Physics Parameters

```java
private static final float[] wheelParams = new float[24];  // 6 params * 4 wheels
private static final float[] physicsParams = new float[27];
```

## Multiplayer Networking

### Authorization

```java
public enum Authorization {
    Server,     // Server controls
    Client,     // Client controls (driver)
    Local       // Single player
}

public Authorization netPlayerAuthorization = Authorization.Server;
public short netPlayerId = -1;
public int netPlayerTimeout = 0;
```

### Interpolation

```java
public VehicleInterpolation interpolation = null;

// Connection state for each player
public final ServerVehicleState[] connectionState = new ServerVehicleState[512];
```

### Packet Size

```java
static final byte POSITION_ORIENTATION_PACKET_SIZE = 102;
```

## Passengers

### Passenger Data

```java
protected Passenger[] passengers = new Passenger[1];  // Resized based on script

public class Passenger {
    IsoGameCharacter character;
    int seat;
    boolean isDriver;
    // ... animation data
}
```

## Audio System

### Sound Emitters

```java
public BaseSoundEmitter hornemitter = null;
private BaseSoundEmitter emitter;
public long skidSound;
public long ramSound;
public final long[] new_EngineSoundId = new long[8];
```

### Audio Parameters

Dedicated parameter classes for FMOD audio:

```java
ParameterVehicleBrake
ParameterVehicleEngineCondition
ParameterVehicleGear
ParameterVehicleLoad
ParameterVehicleRPM
ParameterVehicleRoadMaterial
ParameterVehicleSkid
ParameterVehicleSpeed
ParameterVehicleSteer
ParameterVehicleTireMissing
```

## Engine RPM System

### VehicleEngineRPM.java

```java
public class VehicleEngineRPM {
    public static final int MAX_GEARS = 8;
    private String m_name;
    public final EngineRPMData[] m_rpmData = new EngineRPMData[8];
}

public class EngineRPMData {
    float afterGearChange;  // RPM after shifting
    float gearChange;       // RPM at gear change point
}
```

## Vehicle Script Integration

### VehicleScript.java

Defines vehicle properties from `.txt` script files:

```java
public class VehicleScript {
    String name;
    float mass;
    float engineForce;
    float maxSpeed;
    float engineLoudness;
    int mechanicType;
    
    ArrayList<Part> parts;
    ArrayList<Seat> seats;
    ArrayList<Wheel> wheels;
    ArrayList<Area> areas;
}
```

## Vehicle Lifecycle

### Creation Flow

```
1. VehicleScript loaded from .txt file
2. BaseVehicle instantiated
3. Parts created from script
4. Physics body created (Bullet)
5. Added to world
6. Model loaded and rendered
```

### Update Loop

```
Each frame:
1. Physics simulation (Bullet)
2. Transform update
3. Part condition checks
4. Engine state update
5. Audio parameter update
6. Network sync (if MP)
7. Rendering
```

## Modding Access

### Lua Accessible Fields

Many fields are accessible via Lua through exposed methods:

```lua
-- Get vehicle data (GETTERS - always available)
local speed = vehicle:getCurrentSpeedKmHour()
local engine = vehicle:getEngineQuality()
local rust = vehicle:getRust()

-- Get parts
local parts = vehicle:getParts()
for i = 0, parts:size() - 1 do
    local part = parts:get(i)
    local condition = part:getCondition()
end

-- Modify vehicle (SETTERS - check if they exist!)
vehicle:setRust(0.5)  -- 50% rust
vehicle:setEngineQuality(100)
```

### Fields Without Setters

Some useful fields don't have setters. Use [Java Reflection](/pz/build-41/modding/engine-analysis/java-reflection-guide) to access them:

```lua
-- Example: Access throttle directly (no setter exists)
MyMod.VehicleFields = {}

function MyMod.cacheVehicleFields(vehicle)
    for i = 0, getNumClassFields(vehicle) - 1 do
        local field = getClassField(vehicle, i)
        local str = tostring(field)
        
        if str:find("throttle") then
            MyMod.VehicleFields.throttle = field
            field:setAccessible(true)
        elseif str:find("brakingForce") then
            MyMod.VehicleFields.brakingForce = field
            field:setAccessible(true)
        end
    end
end

-- Usage after caching:
local throttle = MyMod.VehicleFields.throttle:getFloat(vehicle)
MyMod.VehicleFields.throttle:setFloat(vehicle, 0.8)  -- 80% throttle
```

### Script Modification

Modify vehicles through script files:

```
module Base {
    vehicle MyCustomCar {
        mechanicType = 2,
        offRoadEfficiency = 1.1,
        engineForce = 5000,
        maxSpeed = 120f,
        engineLoudness = 80,
        mass = 1200,
        
        part Engine {
            category = engine,
            // ...
        }
    }
}
```

## Related Classes

| Class | Purpose |
|-------|----------|
| `VehicleManager` | Vehicle spawning and tracking |
| `VehicleCache` | Performance caching |
| `VehicleDBHelper` | Database save/load |
| `VehicleStorySpawner` | World generation |
| `VehicleInterpolation` | MP movement smoothing |
| `SurroundVehicle` | Zombie interaction |

## Key Takeaways

1. **BaseVehicle is ~3000+ lines** - Complex but well-organized
2. **Bullet Physics** powers vehicle simulation
3. **Parts are modular** - Install/uninstall affects stats
4. **Scripts define vehicles** - .txt files, not code
5. **Engine state machine** - Idle/Starting/Running/Stalling/Failed
6. **MP uses interpolation** - Smooth client movement
7. **Up to 4 wheels** - Hardcoded maximum
8. **8 gear maximum** - Engine RPM data limit
