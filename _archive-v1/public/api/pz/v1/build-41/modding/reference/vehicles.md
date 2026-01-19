---
id: vehicles
slug: vehicles
title: Vehicle Script Reference
excerpt: Vehicle scripts define all vehicle properties including physics, parts, seats, areas, sounds, and textures. Vehicle scripts are located in `media/scripts/vehicles/`. media/scripts/vehicles/ ├──...
game: pz
version: build-41
section: modding
category: reference
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - vehicles
  - scripts
  - reference
  - mechanics
last_updated: 2026-01-10
---
# Vehicle Script Reference

## Overview

Vehicle scripts define all vehicle properties including physics, parts, seats, areas, sounds, and textures. Vehicle scripts are located in `media/scripts/vehicles/`.

## File Structure

```
media/scripts/vehicles/
├── template_*.txt        # Part templates (reusable)
├── vehicle_*.txt         # Vehicle definitions
├── vehiclesfixing.txt    # Vehicle repair definitions
├── vehiclesitems.txt     # Vehicle-specific items
├── models_vehicles.txt   # 3D model definitions
└── sounds_vehicle.txt    # Sound definitions
```

---

## Basic Vehicle Structure

```
module Base
{
    model Vehicles_MyVehicle
    {
        mesh = vehicles/Vehicles_MyVehicle,
        shader = vehicle_multiuv,
        invertX = FALSE,
        scale = 0.01,
    }
    
    vehicle MyVehicle
    {
        template! = MyVehicleTemplate,
        
        model
        {
            file = Vehicles_MyVehicle,
            scale = 1.8200,
            offset = 0.0000 0.2692 0.0000,
        }
        
        /* Passenger and part definitions */
    }
    
    template vehicle MyVehicleTemplate
    {
        /* All vehicle properties */
    }
}
```

---

## Core Vehicle Properties

### Basic Properties

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `mechanicType` | int | Mechanic skill type | `mechanicType = 1,` |
| `engineRepairLevel` | int | Skill to repair engine | `engineRepairLevel = 4,` |
| `playerDamageProtection` | float | Crash damage reduction | `playerDamageProtection = 1.0,` |
| `seats` | int | Total seat count | `seats = 4,` |
| `mass` | int | Vehicle mass (kg) | `mass = 800,` |

### Speed and Engine

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `maxSpeed` | float | Max speed (km/h) | `maxSpeed = 90f,` |
| `engineForce` | int | Engine power | `engineForce = 4000,` |
| `engineLoudness` | int | Engine noise (0-100) | `engineLoudness = 80,` |
| `engineQuality` | int | Engine reliability | `engineQuality = 70,` |
| `brakingForce` | int | Brake strength | `brakingForce = 90,` |

### Gear Ratios

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `gearRatioCount` | int | Number of gears | `gearRatioCount = 4,` |
| `gearRatioR` | float | Reverse gear ratio | `gearRatioR = 4.7,` |
| `gearRatio1` | float | First gear ratio | `gearRatio1 = 3.6,` |
| `gearRatio2` | float | Second gear ratio | `gearRatio2 = 2.2,` |
| `gearRatio3` | float | Third gear ratio | `gearRatio3 = 1.3,` |
| `gearRatio4` | float | Fourth gear ratio | `gearRatio4 = 1.0,` |

### Physics

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `extents` | vec3 | Collision box size | `extents = 0.8901 0.6484 2.6044,` |
| `physicsChassisShape` | vec3 | Physics shape | `physicsChassisShape = 0.8901 0.6484 2.6044,` |
| `centerOfMassOffset` | vec3 | Center of mass | `centerOfMassOffset = 0.0 0.30 0.0,` |
| `stoppingMovementForce` | float | Stop force | `stoppingMovementForce = 4.0f,` |
| `rollInfluence` | float | Roll resistance | `rollInfluence = 1.0f,` |

### Steering

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `steeringIncrement` | float | Turn rate | `steeringIncrement = 0.04,` |
| `steeringClamp` | float | Max turn angle | `steeringClamp = 0.3,` |

### Suspension

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `suspensionStiffness` | int | Spring stiffness | `suspensionStiffness = 40,` |
| `suspensionCompression` | float | Compression rate | `suspensionCompression = 3.83,` |
| `suspensionDamping` | float | Damping rate | `suspensionDamping = 2.88,` |
| `maxSuspensionTravelCm` | int | Max travel (cm) | `maxSuspensionTravelCm = 10,` |
| `suspensionRestLength` | float | Rest length | `suspensionRestLength = 0.20f,` |

### Health

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `frontEndHealth` | int | Front health | `frontEndHealth = 150,` |
| `rearEndHealth` | int | Rear health | `rearEndHealth = 150,` |
| `wheelFriction` | float | Tire grip | `wheelFriction = 1.4f,` |

---

## Texture Properties

| Property | Type | Description |
|----------|------|-------------|
| `textureMask` | string | Color regions mask |
| `textureLights` | string | Light regions texture |
| `textureDamage1Overlay` | string | Light damage overlay |
| `textureDamage2Overlay` | string | Heavy damage overlay |
| `textureDamage1Shell` | string | Light shell damage |
| `textureDamage2Shell` | string | Heavy shell damage |
| `textureRust` | string | Rust texture |

```
textureMask = Vehicles/vehicle_carnormal_mask,
textureLights = Vehicles/vehicle_carnormal_lights,
textureDamage1Overlay = Vehicles/Veh_Blood_Mask,
textureDamage2Overlay = Vehicles/Veh_Blood_Hvy,
textureDamage1Shell = Vehicles/Veh_Damage1,
textureDamage2Shell = Vehicles/Veh_Damage2,
textureRust = Vehicles/Veh_Rust,
```

---

## Sound Block

```
sound
{
    engine = VehicleEngineCarNormal,
    engineStart = VehicleEngineCarNormal,
    engineTurnOff = VehicleEngineCarNormal,
    horn = VehicleHornStandard,
    ignitionFail = VehicleIgnitionFailCarNormal,
}
```

| Property | Description |
|----------|-------------|
| `engine` | Running engine sound |
| `engineStart` | Startup sound |
| `engineTurnOff` | Shutdown sound |
| `horn` | Horn sound |
| `ignitionFail` | Failed start sound |

---

## Skin Block

Define vehicle color variations:

```
skin
{
    texture = Vehicles/vehicle_carnormalshell,
}

skin
{
    texture = Vehicles/vehicle_carnormalshell_blue,
}

skin
{
    texture = Vehicles/vehicle_carnormalshell_red,
}
```

---

## Wheel Definition

```
wheel FrontLeft
{
    front = true,
    offset = 0.3626 -0.3022 0.8516,
    radius = 0.15f,
    width = 0.2f,
}

wheel FrontRight
{
    front = true,
    offset = -0.3626 -0.3022 0.8516,
    radius = 0.15f,
    width = 0.2f,
}

wheel RearLeft
{
    front = false,
    offset = 0.3626 -0.3022 -0.6099,
    radius = 0.15f,
    width = 0.2f,
}

wheel RearRight
{
    front = false,
    offset = -0.3626 -0.3022 -0.6099,
    radius = 0.15f,
    width = 0.2f,
}
```

| Property | Type | Description |
|----------|------|-------------|
| `front` | bool | Is front wheel (steering) |
| `offset` | vec3 | Position (X Y Z) |
| `radius` | float | Wheel radius |
| `width` | float | Wheel width |

---

## Passenger Definition

```
passenger FrontLeft
{
    position inside
    {
        offset = 0.1758 -0.1374 0.0879,
        rotate = 0.0000 0.0000 0.0000,
    }

    position outside
    {
        offset = 0.6209 -0.4121 0.1209,
        rotate = 0.0000 0.0000 0.0000,
        area = SeatFrontLeft,
    }
}
```

| Block | Description |
|-------|-------------|
| `position inside` | Position when seated |
| `position outside` | Position when exiting |
| `offset` | XYZ coordinates |
| `rotate` | XYZ rotation |
| `area` | Linked interaction area |

---

## Area Definition

Areas define interaction zones:

```
area Engine
{
    xywh = 0.0000 1.5385 0.8901 0.4725,
}

area TruckBed
{
    xywh = 0.0000 -1.5385 0.8901 0.4725,
}

area GasTank
{
    xywh = 0.6813 -0.6099 0.4725 0.4725,
}

area SeatFrontLeft
{
    xywh = 0.6813 0.1209 0.4725 0.4725,
}

area TireFrontLeft
{
    xywh = 0.6813 0.8516 0.4725 0.4725,
}
```

| Property | Description |
|----------|-------------|
| `xywh` | X position, Y position, Width, Height |

---

## Part Templates

Vehicles use templates for common parts:

```
template = PassengerSeat4,
template = TrunkDoor,
template = Trunk/part/TruckBed,
template = Seat/part/SeatFrontLeft,
template = GloveBox,
template = GasTank,
template = Battery,
template = Engine,
template = Muffler,
template = EngineDoor,
template = Windshield/part/Windshield,
template = Window/part/WindowFrontLeft,
template = Door/part/DoorFrontLeft,
template = Tire,
template = Brake,
template = Suspension,
template = Radio,
template = Headlight,
```

### Template Files

| File | Parts Defined |
|------|---------------|
| `template_battery.txt` | Battery |
| `template_brake.txt` | Brake systems |
| `template_door.txt` | Doors |
| `template_engine.txt` | Engine |
| `template_gastank.txt` | Gas tanks |
| `template_glovebox.txt` | Glove boxes |
| `template_headlight.txt` | Headlights |
| `template_heater.txt` | Heaters |
| `template_muffler.txt` | Mufflers |
| `template_passenger.txt` | Passenger seats |
| `template_radio.txt` | Radios |
| `template_seat.txt` | Seats |
| `template_suspension.txt` | Suspension |
| `template_tire.txt` | Tires |
| `template_trunk.txt` | Trunks |
| `template_window.txt` | Windows |
| `template_windshield.txt` | Windshields |

---

## Part Definition

```
part GloveBox
{
    category = engine,
    
    container
    {
        capacity = 5,
    }
}

part Heater
{
    category = engine,

    lua
    {
        update = Vehicles.Update.Heater,
    }
}

part PassengerCompartment
{
    category = nodisplay,

    lua
    {
        update = Vehicles.Update.PassengerCompartment,
    }
}
```

### Part Categories

| Category | Description |
|----------|-------------|
| `engine` | Engine compartment parts |
| `bodywork` | Body panels |
| `window` | Windows and windshields |
| `seat` | Seating |
| `tire` | Wheels and tires |
| `nodisplay` | Hidden/internal parts |

### Part Lua Functions

| Function | Purpose |
|----------|----------|
| `update` | Called each tick |
| `init` | Called on spawn |
| `create` | Called on creation |
| `checkEngine` | Engine state check |
| `checkOperate` | Operation check |

---

## Attachment Points

For trailers:

```
attachment trailer
{
    offset = 0.0000 -0.2747 -1.3462,
    rotate = 0.0000 0.0000 0.0000,
    zoffset = -1,
}

attachment trailerfront
{
    offset = 0.0000 -0.2747 1.3187,
    rotate = 0.0000 0.0000 0.0000,
    zoffset = 1,
}
```

---

## Model Definition

```
model Vehicles_CarNormal
{
    mesh = vehicles/Vehicles_CarNormal,
    shader = vehicle_multiuv,
    invertX = FALSE,
    scale = 0.01,
}
```

| Property | Description |
|----------|-------------|
| `mesh` | Path to 3D model file |
| `shader` | Shader type |
| `invertX` | Mirror model |
| `scale` | Model scale |

---

## Complete Vehicle Example

```
module Base
{
    model Vehicles_CustomCar
    {
        mesh = vehicles/Vehicles_CustomCar,
        shader = vehicle_multiuv,
        invertX = FALSE,
        scale = 0.01,
    }
    
    vehicle CustomCar
    {
        template! = CustomCarTemplate,
        
        model
        {
            file = Vehicles_CustomCar,
            scale = 1.82,
            offset = 0.0 0.27 0.0,
        }
        
        template = PassengerSeat4,
        
        passenger FrontLeft
        {
            position inside { offset = 0.18 -0.14 0.09, rotate = 0 0 0, }
            position outside { offset = 0.62 -0.41 0.12, rotate = 0 0 0, area = SeatFrontLeft, }
        }
        
        passenger FrontRight
        {
            position inside { offset = -0.18 -0.14 0.09, rotate = 0 0 0, }
            position outside { offset = -0.62 -0.41 0.12, rotate = 0 0 0, area = SeatFrontRight, }
        }
        
        area SeatFrontLeft { xywh = 0.68 0.12 0.47 0.47, }
        area SeatFrontRight { xywh = -0.68 0.12 0.47 0.47, }
        area Engine { xywh = 0.0 1.54 0.89 0.47, }
        area GasTank { xywh = 0.68 -0.61 0.47 0.47, }
    }
    
    template vehicle CustomCarTemplate
    {
        mechanicType = 1,
        engineRepairLevel = 4,
        playerDamageProtection = 1.0,
        
        skin { texture = Vehicles/vehicle_customshell, }
        
        sound
        {
            engine = VehicleEngineCarNormal,
            engineStart = VehicleEngineCarNormal,
            engineTurnOff = VehicleEngineCarNormal,
            horn = VehicleHornStandard,
            ignitionFail = VehicleIgnitionFailCarNormal,
        }
        
        textureMask = Vehicles/vehicle_custom_mask,
        textureLights = Vehicles/vehicle_custom_lights,
        extents = 0.89 0.65 2.60,
        physicsChassisShape = 0.89 0.65 2.60,
        mass = 800,
        centerOfMassOffset = 0.0 0.30 0.0,
        engineForce = 4000,
        maxSpeed = 90f,
        engineLoudness = 80,
        engineQuality = 70,
        brakingForce = 90,
        seats = 2,
        
        gearRatioCount = 4,
        gearRatioR = 4.7,
        gearRatio1 = 3.6,
        gearRatio2 = 2.2,
        gearRatio3 = 1.3,
        gearRatio4 = 1.0,
        
        wheel FrontLeft { front = true, offset = 0.36 -0.30 0.85, radius = 0.15f, width = 0.2f, }
        wheel FrontRight { front = true, offset = -0.36 -0.30 0.85, radius = 0.15f, width = 0.2f, }
        wheel RearLeft { front = false, offset = 0.36 -0.30 -0.61, radius = 0.15f, width = 0.2f, }
        wheel RearRight { front = false, offset = -0.36 -0.30 -0.61, radius = 0.15f, width = 0.2f, }
        
        template = Seat/part/SeatFrontLeft,
        template = Seat/part/SeatFrontRight,
        template = GloveBox,
        template = GasTank,
        template = Battery,
        template = Engine,
        template = EngineDoor,
        template = Door/part/DoorFrontLeft,
        template = Door/part/DoorFrontRight,
        template = Windshield/part/Windshield,
        template = Window/part/WindowFrontLeft,
        template = Window/part/WindowFrontRight,
        template = Tire,
        template = Brake,
        template = Suspension,
        template = Radio,
        template = Headlight,
    }
}
```

---

## Related

- [Fixing Script Reference](/build-41/modding/reference/fixing) - Repair definitions
- [Script Properties](/build-41/modding/reference/script-properties) - Item and recipe properties
- [Events Reference](/build-41/modding/reference/events) - Vehicle-related events 