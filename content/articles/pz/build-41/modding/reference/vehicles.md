---
id: reference-vehicles
slug: vehicles
title: "Vehicle Script Reference"
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
excerpt: "Complete reference for Project Zomboid vehicle script definitions including physics, parts, passengers, and templates."
table_of_contents:
  - text: "What Are Vehicle Scripts?"
    link: "#what-are-vehicle-scripts"
  - text: "Overview"
    link: "#overview"
  - text: "File Structure"
    link: "#file-structure"
  - text: "Basic Vehicle Structure"
    link: "#basic-vehicle-structure"
  - text: "Core Vehicle Properties"
    link: "#core-vehicle-properties"
  - text: "Texture Properties"
    link: "#texture-properties"
  - text: "Sound Block"
    link: "#sound-block"
  - text: "Skin Block"
    link: "#skin-block"
  - text: "Wheel Definition"
    link: "#wheel-definition"
  - text: "Passenger Definition"
    link: "#passenger-definition"
  - text: "Area Definition"
    link: "#area-definition"
  - text: "Part Templates"
    link: "#part-templates"
  - text: "Part Definition"
    link: "#part-definition"
  - text: "Attachment Points"
    link: "#attachment-points"
  - text: "Model Definition"
    link: "#model-definition"
  - text: "Complete Vehicle Example"
    link: "#complete-vehicle-example"
  - text: "Common Mistakes"
    link: "#common-mistakes"
  - text: "Try It Yourself"
    link: "#try-it-yourself"
  - text: "Best Practices"
    link: "#best-practices"
  - text: "Key Takeaways"
    link: "#key-takeaways"
  - text: "Related"
    link: "#related"
last_updated: 2026-01-10
---

# Vehicle Script Reference

## What Are Vehicle Scripts?

You know when you drive a car in Project Zomboid and it has specific handling, engine sounds, storage capacity, and seat positions? All of that is defined by **vehicle scripts** - the configuration files that tell the game everything about a vehicle.

**Vehicle scripts are vehicle blueprints.** They define physics (mass, speed, braking), parts (engine, tires, doors), passengers (seat positions), interaction areas (where you access the engine, trunk, gas tank), sounds, and textures. Creating a custom vehicle means writing a vehicle script.

When I first looked at vehicle scripts, I was intimidated. "What is `physicsChassisShape`? How do I calculate wheel offsets? What's a `gearRatioR`?" Vehicle scripts are the most complex script type in Project Zomboid - they combine 3D model data, physics properties, and game mechanics all in one file. But once you understand the structure, it's actually a series of simple blocks: define the model, set physics properties, position wheels and seats, add parts.

This reference breaks down every component of vehicle scripts so you can understand vanilla vehicles or create your own.

---

## Overview

Vehicle scripts define all vehicle properties including physics, parts, seats, areas, sounds, and textures. Vehicle scripts are located in `media/scripts/vehicles/`.

**What vehicle scripts control:**
- **Physics** - Mass, speed, acceleration, braking, suspension
- **Wheels** - Position, size, steering
- **Passengers** - Seat positions, entry/exit points
- **Parts** - Engine, tires, doors, windows, battery, etc.
- **Areas** - Interaction zones (engine compartment, trunk, gas tank)
- **Sounds** - Engine, horn, ignition
- **Textures** - Vehicle paint, damage overlays, rust

**Complexity note:** Vehicle modding requires more than just scripts - you need 3D models, textures, and understanding of coordinate systems. This reference focuses on the script side.

---

## File Structure

```
media/scripts/vehicles/
├── template_*.txt        # Part templates (reusable components)
├── vehicle_*.txt         # Vehicle definitions
├── vehiclesfixing.txt    # Vehicle repair definitions
├── vehiclesitems.txt     # Vehicle-specific items
├── models_vehicles.txt   # 3D model definitions
└── sounds_vehicle.txt    # Sound definitions
```

**Organization:**
- **Templates** - Reusable part definitions (engine, doors, tires)
- **Vehicle files** - Complete vehicle definitions
- **Models/Sounds** - Supporting definitions

---

## Basic Vehicle Structure

```lua
module Base                                 /* Module declaration */
{
    model Vehicles_MyVehicle                /* 3D model definition */
    {
        mesh = vehicles/Vehicles_MyVehicle, /* Path to 3D model file */
        shader = vehicle_multiuv,           /* Shader type for rendering */
        invertX = FALSE,                    /* Don't mirror the model */
        scale = 0.01,                       /* Scale factor (usually 0.01) */
    }

    vehicle MyVehicle                       /* Vehicle definition */
    {
        template! = MyVehicleTemplate,      /* Use this template (! = required) */

        model                               /* Model placement in world */
        {
            file = Vehicles_MyVehicle,      /* Reference to model above */
            scale = 1.8200,                 /* World scale */
            offset = 0.0000 0.2692 0.0000,  /* Y-offset from ground */
        }

        /* Passenger and part definitions go here */
    }

    template vehicle MyVehicleTemplate      /* Template with all properties */
    {
        /* All vehicle properties defined here */
    }
}
```

**Three-part structure:**
1. **model** block - Links 3D model file
2. **vehicle** block - Main vehicle definition, references template
3. **template vehicle** block - All vehicle properties (physics, parts, wheels, etc.)

**Why templates?** Templates let you define properties once and reuse them. Multiple vehicle variants can share the same template.

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

**mechanicType:** 1 = Standard, 2 = Heavy Duty (affects repair difficulty)

**playerDamageProtection:** 0.0 = no protection, 1.0 = standard protection, 2.0 = double protection

### Speed and Engine

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `maxSpeed` | float | Max speed (km/h) | `maxSpeed = 90f,` |
| `engineForce` | int | Engine power | `engineForce = 4000,` |
| `engineLoudness` | int | Engine noise (0-100) | `engineLoudness = 80,` |
| `engineQuality` | int | Engine reliability | `engineQuality = 70,` |
| `brakingForce` | int | Brake strength | `brakingForce = 90,` |

**engineForce:** Higher = more acceleration. 4000 = standard car, 6000+ = truck/SUV

**engineLoudness:** How far zombies hear the engine. 80 = standard, 120 = loud truck

### Gear Ratios

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `gearRatioCount` | int | Number of gears | `gearRatioCount = 4,` |
| `gearRatioR` | float | Reverse gear ratio | `gearRatioR = 4.7,` |
| `gearRatio1` | float | First gear ratio | `gearRatio1 = 3.6,` |
| `gearRatio2` | float | Second gear ratio | `gearRatio2 = 2.2,` |
| `gearRatio3` | float | Third gear ratio | `gearRatio3 = 1.3,` |
| `gearRatio4` | float | Fourth gear ratio | `gearRatio4 = 1.0,` |

**Gear ratios:** Higher = more torque (acceleration), lower = higher top speed. Standard progression: start high (3.6) and decrease to 1.0.

### Physics

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `extents` | vec3 | Collision box size | `extents = 0.8901 0.6484 2.6044,` |
| `physicsChassisShape` | vec3 | Physics shape | `physicsChassisShape = 0.8901 0.6484 2.6044,` |
| `centerOfMassOffset` | vec3 | Center of mass | `centerOfMassOffset = 0.0 0.30 0.0,` |
| `stoppingMovementForce` | float | Stop force | `stoppingMovementForce = 4.0f,` |
| `rollInfluence` | float | Roll resistance | `rollInfluence = 1.0f,` |

**extents:** X (width/2), Y (height/2), Z (length/2). Defines collision boundary.

**centerOfMassOffset:** Y-offset affects tipping. Higher = less stable, lower = more stable.

### Steering

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `steeringIncrement` | float | Turn rate | `steeringIncrement = 0.04,` |
| `steeringClamp` | float | Max turn angle | `steeringClamp = 0.3,` |

**steeringIncrement:** How fast the wheel turns. 0.04 = responsive, 0.02 = sluggish

**steeringClamp:** Maximum steering angle. 0.3 = tight turns, 0.1 = wide turns

### Suspension

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `suspensionStiffness` | int | Spring stiffness | `suspensionStiffness = 40,` |
| `suspensionCompression` | float | Compression rate | `suspensionCompression = 3.83,` |
| `suspensionDamping` | float | Damping rate | `suspensionDamping = 2.88,` |
| `maxSuspensionTravelCm` | int | Max travel (cm) | `maxSuspensionTravelCm = 10,` |
| `suspensionRestLength` | float | Rest length | `suspensionRestLength = 0.20f,` |

**suspensionStiffness:** Higher = stiffer ride (sports car), lower = softer (comfortable sedan)

### Health

| Property | Type | Description | Example |
|----------|------|-------------|----------|
| `frontEndHealth` | int | Front health | `frontEndHealth = 150,` |
| `rearEndHealth` | int | Rear health | `rearEndHealth = 150,` |
| `wheelFriction` | float | Tire grip | `wheelFriction = 1.4f,` |

**frontEndHealth/rearEndHealth:** Damage before vehicle disables. 150 = standard car, 300+ = truck

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

```lua
textureMask = Vehicles/vehicle_carnormal_mask,         /* Paintable regions */
textureLights = Vehicles/vehicle_carnormal_lights,     /* Headlights, taillights */
textureDamage1Overlay = Vehicles/Veh_Blood_Mask,       /* Blood splatters */
textureDamage2Overlay = Vehicles/Veh_Blood_Hvy,        /* Heavy blood */
textureDamage1Shell = Vehicles/Veh_Damage1,            /* Minor dents */
textureDamage2Shell = Vehicles/Veh_Damage2,            /* Major damage */
textureRust = Vehicles/Veh_Rust,                       /* Rust overlay */
```

**Damage progression:** As vehicle takes damage, damage overlays appear over the base texture.

---

## Sound Block

```lua
sound                                       /* Sound definition block */
{
    engine = VehicleEngineCarNormal,        /* Running engine sound */
    engineStart = VehicleEngineCarNormal,   /* Startup sound */
    engineTurnOff = VehicleEngineCarNormal, /* Shutdown sound */
    horn = VehicleHornStandard,             /* Horn sound */
    ignitionFail = VehicleIgnitionFailCarNormal, /* Failed start sound */
}
```

| Property | Description |
|----------|-------------|
| `engine` | Running engine sound |
| `engineStart` | Startup sound |
| `engineTurnOff` | Shutdown sound |
| `horn` | Horn sound |
| `ignitionFail` | Failed start sound |

**Sound names:** Defined in `sounds_vehicle.txt`. Common sounds: `VehicleEngineCarNormal`, `VehicleEngineTruck`, `VehicleHornStandard`

---

## Skin Block

Define vehicle color variations:

```lua
skin                                        /* Color variation 1 */
{
    texture = Vehicles/vehicle_carnormalshell, /* Base shell texture */
}

skin                                        /* Color variation 2 */
{
    texture = Vehicles/vehicle_carnormalshell_blue, /* Blue variant */
}

skin                                        /* Color variation 3 */
{
    texture = Vehicles/vehicle_carnormalshell_red, /* Red variant */
}
```

**Multiple skins:** Game randomly selects one when spawning vehicle. More skin blocks = more color variety.

---

## Wheel Definition

```lua
wheel FrontLeft                             /* Front left wheel */
{
    front = true,                           /* This is a steering wheel */
    offset = 0.3626 -0.3022 0.8516,         /* Position (X Y Z) */
    radius = 0.15f,                         /* Wheel radius */
    width = 0.2f,                           /* Wheel width */
}

wheel FrontRight                            /* Front right wheel */
{
    front = true,                           /* This is a steering wheel */
    offset = -0.3626 -0.3022 0.8516,        /* Position (mirrored X) */
    radius = 0.15f,                         /* Wheel radius */
    width = 0.2f,                           /* Wheel width */
}

wheel RearLeft                              /* Rear left wheel */
{
    front = false,                          /* This is NOT a steering wheel */
    offset = 0.3626 -0.3022 -0.6099,        /* Position (rear Z) */
    radius = 0.15f,                         /* Wheel radius */
    width = 0.2f,                           /* Wheel width */
}

wheel RearRight                             /* Rear right wheel */
{
    front = false,                          /* This is NOT a steering wheel */
    offset = -0.3626 -0.3022 -0.6099,       /* Position (mirrored X, rear Z) */
    radius = 0.15f,                         /* Wheel radius */
    width = 0.2f,                           /* Wheel width */
}
```

| Property | Type | Description |
|----------|------|-------------|
| `front` | bool | Is front wheel (steering) |
| `offset` | vec3 | Position (X Y Z) |
| `radius` | float | Wheel radius |
| `width` | float | Wheel width |

**Wheel positioning:**
- **X**: Positive = right side, negative = left side
- **Y**: Height (usually negative, below vehicle center)
- **Z**: Positive = front, negative = rear

**front = true:** Front wheels steer when turning. Rear wheels don't.

---

## Passenger Definition

```lua
passenger FrontLeft                         /* Front left seat */
{
    position inside                         /* Position when seated */
    {
        offset = 0.1758 -0.1374 0.0879,     /* Seated position (X Y Z) */
        rotate = 0.0000 0.0000 0.0000,      /* Seated rotation */
    }

    position outside                        /* Position when exiting */
    {
        offset = 0.6209 -0.4121 0.1209,     /* Exit position (X Y Z) */
        rotate = 0.0000 0.0000 0.0000,      /* Exit rotation */
        area = SeatFrontLeft,               /* Linked interaction area */
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

**inside vs outside:** `inside` = where player sits, `outside` = where player spawns when exiting

**area link:** Must match an area definition for seat interaction to work.

---

## Area Definition

Areas define interaction zones:

```lua
area Engine                                 /* Engine compartment area */
{
    xywh = 0.0000 1.5385 0.8901 0.4725,     /* X, Y, Width, Height */
}

area TruckBed                               /* Truck bed storage area */
{
    xywh = 0.0000 -1.5385 0.8901 0.4725,    /* X, Y, Width, Height */
}

area GasTank                                /* Gas tank access area */
{
    xywh = 0.6813 -0.6099 0.4725 0.4725,    /* X, Y, Width, Height */
}

area SeatFrontLeft                          /* Front left seat entry area */
{
    xywh = 0.6813 0.1209 0.4725 0.4725,     /* X, Y, Width, Height */
}

area TireFrontLeft                          /* Front left tire area */
{
    xywh = 0.6813 0.8516 0.4725 0.4725,     /* X, Y, Width, Height */
}
```

| Property | Description |
|----------|-------------|
| `xywh` | X position, Y position, Width, Height |

**Area placement:** Areas define where player can interact with vehicle parts. Right-clicking near an area shows context menu options for that part.

---

## Part Templates

Vehicles use templates for common parts:

```lua
template = PassengerSeat4,                  /* 4 passenger seats */
template = TrunkDoor,                       /* Trunk with door */
template = Trunk/part/TruckBed,             /* Truck bed storage */
template = Seat/part/SeatFrontLeft,         /* Front left seat */
template = GloveBox,                        /* Glove box storage */
template = GasTank,                         /* Gas tank */
template = Battery,                         /* Battery */
template = Engine,                          /* Engine */
template = Muffler,                         /* Muffler */
template = EngineDoor,                      /* Hood */
template = Windshield/part/Windshield,      /* Windshield */
template = Window/part/WindowFrontLeft,     /* Window */
template = Door/part/DoorFrontLeft,         /* Door */
template = Tire,                            /* Tire (creates all 4) */
template = Brake,                           /* Brake system */
template = Suspension,                      /* Suspension */
template = Radio,                           /* Radio */
template = Headlight,                       /* Headlights */
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

**Why templates?** Standard parts (engine, battery, tires) work the same across vehicles. Templates avoid duplicating definitions.

---

## Part Definition

```lua
part GloveBox                               /* Glove box part */
{
    category = engine,                      /* Part category (for mechanic UI) */

    container                               /* This part has storage */
    {
        capacity = 5,                       /* Can hold 5 units */
    }
}

part Heater                                 /* Heater part */
{
    category = engine,                      /* Part category */

    lua                                     /* Lua update function */
    {
        update = Vehicles.Update.Heater,    /* Called each tick */
    }
}

part PassengerCompartment                   /* Internal part */
{
    category = nodisplay,                   /* Hidden from mechanic UI */

    lua                                     /* Lua update function */
    {
        update = Vehicles.Update.PassengerCompartment, /* Manages passenger comfort */
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

**category:** Determines which mechanic UI tab the part appears in.

### Part Lua Functions

| Function | Purpose |
|----------|----------|
| `update` | Called each tick |
| `init` | Called on spawn |
| `create` | Called on creation |
| `checkEngine` | Engine state check |
| `checkOperate` | Operation check |

**Lua integration:** Parts can run custom logic (heating, AC, special features) via Lua functions.

---

## Attachment Points

For trailers:

```lua
attachment trailer                          /* Rear hitch point */
{
    offset = 0.0000 -0.2747 -1.3462,        /* Position (X Y Z) */
    rotate = 0.0000 0.0000 0.0000,          /* Rotation */
    zoffset = -1,                           /* Z-axis offset */
}

attachment trailerfront                     /* Front hitch point */
{
    offset = 0.0000 -0.2747 1.3187,         /* Position (X Y Z) */
    rotate = 0.0000 0.0000 0.0000,          /* Rotation */
    zoffset = 1,                            /* Z-axis offset */
}
```

**Trailer attachments:** Define where trailers can connect. Most vehicles have rear attachment, some (trucks) have front attachment.

---

## Model Definition

```lua
model Vehicles_CarNormal                    /* Model ID */
{
    mesh = vehicles/Vehicles_CarNormal,     /* Path to 3D model file */
    shader = vehicle_multiuv,               /* Shader type for rendering */
    invertX = FALSE,                        /* Don't mirror the model */
    scale = 0.01,                           /* Scale factor (almost always 0.01) */
}
```

| Property | Description |
|----------|-------------|
| `mesh` | Path to 3D model file |
| `shader` | Shader type |
| `invertX` | Mirror model |
| `scale` | Model scale |

**shader:** Almost always `vehicle_multiuv` for vehicles.

**scale:** 0.01 converts model units to game units (models exported at 100x scale).

---

## Complete Vehicle Example

```lua
module Base                                 /* Module declaration */
{
    model Vehicles_CustomCar                /* 3D model definition */
    {
        mesh = vehicles/Vehicles_CustomCar, /* Path to 3D model */
        shader = vehicle_multiuv,           /* Standard vehicle shader */
        invertX = FALSE,                    /* Don't mirror */
        scale = 0.01,                       /* Standard scale */
    }

    vehicle CustomCar                       /* Vehicle definition */
    {
        template! = CustomCarTemplate,      /* Use template (! = required) */

        model                               /* Model placement */
        {
            file = Vehicles_CustomCar,      /* Reference model above */
            scale = 1.82,                   /* World scale multiplier */
            offset = 0.0 0.27 0.0,          /* Y-offset from ground */
        }

        template = PassengerSeat4,          /* Add 4 passenger seats from template */

        passenger FrontLeft                 /* Front left seat */
        {
            position inside { offset = 0.18 -0.14 0.09, rotate = 0 0 0, }
            position outside { offset = 0.62 -0.41 0.12, rotate = 0 0 0, area = SeatFrontLeft, }
        }

        passenger FrontRight                /* Front right seat */
        {
            position inside { offset = -0.18 -0.14 0.09, rotate = 0 0 0, }
            position outside { offset = -0.62 -0.41 0.12, rotate = 0 0 0, area = SeatFrontRight, }
        }

        area SeatFrontLeft { xywh = 0.68 0.12 0.47 0.47, }      /* Seat entry area */
        area SeatFrontRight { xywh = -0.68 0.12 0.47 0.47, }    /* Seat entry area */
        area Engine { xywh = 0.0 1.54 0.89 0.47, }              /* Engine access area */
        area GasTank { xywh = 0.68 -0.61 0.47 0.47, }           /* Gas tank access area */
    }

    template vehicle CustomCarTemplate     /* Template with all properties */
    {
        mechanicType = 1,                   /* Standard mechanic type */
        engineRepairLevel = 4,              /* Requires Mechanics 4 to repair engine */
        playerDamageProtection = 1.0,       /* Standard crash protection */

        skin { texture = Vehicles/vehicle_customshell, }  /* Color variation */

        sound                               /* Sound block */
        {
            engine = VehicleEngineCarNormal,
            engineStart = VehicleEngineCarNormal,
            engineTurnOff = VehicleEngineCarNormal,
            horn = VehicleHornStandard,
            ignitionFail = VehicleIgnitionFailCarNormal,
        }

        textureMask = Vehicles/vehicle_custom_mask,
        textureLights = Vehicles/vehicle_custom_lights,
        extents = 0.89 0.65 2.60,           /* Collision box */
        physicsChassisShape = 0.89 0.65 2.60, /* Physics shape */
        mass = 800,                         /* Mass in kg */
        centerOfMassOffset = 0.0 0.30 0.0,  /* Center of mass */
        engineForce = 4000,                 /* Engine power */
        maxSpeed = 90f,                     /* Max speed km/h */
        engineLoudness = 80,                /* Engine noise */
        engineQuality = 70,                 /* Engine reliability */
        brakingForce = 90,                  /* Brake strength */
        seats = 2,                          /* Total seats */

        gearRatioCount = 4,                 /* 4 forward gears */
        gearRatioR = 4.7,                   /* Reverse gear ratio */
        gearRatio1 = 3.6,                   /* First gear */
        gearRatio2 = 2.2,                   /* Second gear */
        gearRatio3 = 1.3,                   /* Third gear */
        gearRatio4 = 1.0,                   /* Fourth gear (top speed) */

        wheel FrontLeft { front = true, offset = 0.36 -0.30 0.85, radius = 0.15f, width = 0.2f, }
        wheel FrontRight { front = true, offset = -0.36 -0.30 0.85, radius = 0.15f, width = 0.2f, }
        wheel RearLeft { front = false, offset = 0.36 -0.30 -0.61, radius = 0.15f, width = 0.2f, }
        wheel RearRight { front = false, offset = -0.36 -0.30 -0.61, radius = 0.15f, width = 0.2f, }

        template = Seat/part/SeatFrontLeft,  /* Add parts from templates */
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

## Common Mistakes

### 1. Mismatched Wheel Offsets

**Problem:** Wheels positioned incorrectly, causing floating or clipping.

**Wrong:**
```lua
wheel FrontLeft { offset = 0.36 -0.30 0.85, }
wheel FrontRight { offset = 0.36 -0.30 0.85, }  /* Same X! Should be mirrored */
```

**Right:**
```lua
wheel FrontLeft { offset = 0.36 -0.30 0.85, }
wheel FrontRight { offset = -0.36 -0.30 0.85, } /* Negative X for right side */
```

**Rule:** Right-side wheels have negative X offset, left-side wheels have positive X.

---

### 2. Missing Area Definitions

**Problem:** Seats don't have linked areas, can't interact with seat.

**Wrong:**
```lua
passenger FrontLeft
{
    position outside { area = SeatFrontLeft, }
}
/* Missing area definition! */
```

**Right:**
```lua
passenger FrontLeft
{
    position outside { area = SeatFrontLeft, }
}

area SeatFrontLeft { xywh = 0.68 0.12 0.47 0.47, }  /* Define the area */
```

**Rule:** Every passenger position must have a matching area definition.

---

### 3. Front/Rear Wheel Confusion

**Problem:** Setting all wheels to front = true causes weird steering.

**Wrong:**
```lua
wheel RearLeft { front = true, }           /* Rear wheels shouldn't steer! */
wheel RearRight { front = true, }
```

**Right:**
```lua
wheel RearLeft { front = false, }          /* Only front wheels steer */
wheel RearRight { front = false, }
```

**Rule:** Only front wheels should have `front = true`. Rear wheels are `front = false`.

---

### 4. Unrealistic Physics Values

**Problem:** Vehicle handles unrealistically.

**Wrong:**
```lua
mass = 100,                                /* Too light! */
engineForce = 50000,                       /* Too powerful! */
maxSpeed = 500f,                           /* Too fast! */
```

**Right:**
```lua
mass = 800,                                /* Realistic car weight */
engineForce = 4000,                        /* Standard engine power */
maxSpeed = 90f,                            /* Realistic top speed */
```

**Balance guide:**
- **mass:** 600-1000 = sedan, 1200-1800 = SUV/truck, 2000+ = large truck
- **engineForce:** 3000-5000 = car, 5000-7000 = truck
- **maxSpeed:** 80-110 = car, 60-90 = truck

---

### 5. Forgetting Gear Ratio Count

**Problem:** Defining more gears than gearRatioCount.

**Wrong:**
```lua
gearRatioCount = 3,                        /* Says 3 gears */
gearRatio1 = 3.6,
gearRatio2 = 2.2,
gearRatio3 = 1.3,
gearRatio4 = 1.0,                          /* But defines 4! */
```

**Right:**
```lua
gearRatioCount = 4,                        /* Matches number of gear ratios */
gearRatio1 = 3.6,
gearRatio2 = 2.2,
gearRatio3 = 1.3,
gearRatio4 = 1.0,
```

**Rule:** `gearRatioCount` must equal the number of `gearRatioN` properties defined.

---

## Try It Yourself

### Exercise 1: Create a Fast Sports Car Template

Modify the base car template to create a sports car with:
- mass: 700 (lighter)
- engineForce: 5000 (more powerful)
- maxSpeed: 120f (faster)
- steeringIncrement: 0.06 (more responsive)

<details>
<summary>Solution</summary>

```lua
template vehicle SportsCarTemplate
{
    mechanicType = 1,
    engineRepairLevel = 5,              /* Harder to repair (complex engine) */
    mass = 700,                         /* Lighter weight */
    engineForce = 5000,                 /* More power */
    maxSpeed = 120f,                    /* Faster top speed */
    engineLoudness = 90,                /* Louder engine */
    brakingForce = 110,                 /* Better brakes */
    steeringIncrement = 0.06,           /* More responsive steering */
    steeringClamp = 0.35,               /* Sharper turns */

    gearRatioCount = 5,                 /* 5 gears for higher top speed */
    gearRatio1 = 3.8,
    gearRatio2 = 2.5,
    gearRatio3 = 1.8,
    gearRatio4 = 1.3,
    gearRatio5 = 1.0,                   /* Fifth gear for top speed */

    /* ... rest of template ... */
}
```

**Key changes:**
- Lower mass = better acceleration
- Higher engineForce = more power
- Higher maxSpeed = faster
- More gears = smoother acceleration
- Better steering = sportier handling
</details>

---

### Exercise 2: Position Rear Seats

Add rear seat passengers to a 4-door car:
- RearLeft seat at X:0.18, Y:-0.14, Z:-0.40
- RearRight seat at X:-0.18, Y:-0.14, Z:-0.40
- Define matching areas for both seats

<details>
<summary>Solution</summary>

```lua
passenger RearLeft
{
    position inside
    {
        offset = 0.18 -0.14 -0.40,      /* Rear left seated position */
        rotate = 0 0 0,
    }

    position outside
    {
        offset = 0.62 -0.41 -0.30,      /* Exit position (near rear) */
        rotate = 0 0 0,
        area = SeatRearLeft,            /* Link to area */
    }
}

passenger RearRight
{
    position inside
    {
        offset = -0.18 -0.14 -0.40,     /* Rear right seated position (mirrored X) */
        rotate = 0 0 0,
    }

    position outside
    {
        offset = -0.62 -0.41 -0.30,     /* Exit position (mirrored X) */
        rotate = 0 0 0,
        area = SeatRearRight,           /* Link to area */
    }
}

area SeatRearLeft { xywh = 0.68 -0.30 0.47 0.47, }  /* Rear left interaction area */
area SeatRearRight { xywh = -0.68 -0.30 0.47 0.47, } /* Rear right interaction area */
```

**Key points:**
- Rear seats have negative Z (behind front seats)
- X is mirrored for left/right
- Areas must match passenger area references
</details>

---

### Exercise 3: Create a Heavy Truck Template

Create a truck template with:
- mass: 1500 (heavy)
- engineForce: 6000 (powerful)
- maxSpeed: 70f (slower than car)
- engineLoudness: 100 (very loud)
- larger wheels (radius: 0.20)

<details>
<summary>Solution</summary>

```lua
template vehicle TruckTemplate
{
    mechanicType = 2,                   /* Heavy duty mechanic type */
    engineRepairLevel = 3,
    mass = 1500,                        /* Much heavier than car */
    engineForce = 6000,                 /* More torque */
    maxSpeed = 70f,                     /* Lower top speed */
    engineLoudness = 100,               /* Very loud (attracts zombies) */
    brakingForce = 80,                  /* Slower braking (heavier) */

    gearRatioCount = 4,
    gearRatioR = 5.0,                   /* Higher reverse ratio (more torque) */
    gearRatio1 = 4.0,                   /* Lower gears (more torque) */
    gearRatio2 = 2.5,
    gearRatio3 = 1.5,
    gearRatio4 = 1.0,

    wheel FrontLeft { front = true, offset = 0.40 -0.35 1.00, radius = 0.20f, width = 0.25f, }
    wheel FrontRight { front = true, offset = -0.40 -0.35 1.00, radius = 0.20f, width = 0.25f, }
    wheel RearLeft { front = false, offset = 0.40 -0.35 -0.70, radius = 0.20f, width = 0.25f, }
    wheel RearRight { front = false, offset = -0.40 -0.35 -0.70, radius = 0.20f, width = 0.25f, }

    /* ... rest of template ... */
}
```

**Key changes:**
- mechanicType = 2 for heavy duty
- Higher mass and engineForce
- Lower maxSpeed (trucks aren't fast)
- Larger wheels for truck
- Lower gears for better torque
</details>

---

## Best Practices

### 1. Copy and Modify Vanilla Vehicles

**Start with a similar vanilla vehicle:**
1. Find similar vehicle in `media/scripts/vehicles/`
2. Copy the entire file
3. Modify values for your needs

**Why:** Vanilla vehicles have correct coordinate systems, tested physics, and working part templates.

### 2. Mirror X Coordinates Correctly

**For symmetrical vehicles:**
- Left side: positive X
- Right side: negative X (same absolute value)

```lua
wheel FrontLeft { offset = 0.36 -0.30 0.85, }
wheel FrontRight { offset = -0.36 -0.30 0.85, }  /* Same Y and Z, X mirrored */
```

### 3. Balance Physics Realistically

**Use these ranges as guides:**

**Mass:**
- Small car: 600-900 kg
- Sedan: 900-1200 kg
- SUV/Truck: 1200-1800 kg
- Large truck: 1800-2500 kg

**Engine Force:**
- Economy car: 3000-3500
- Standard car: 3500-4500
- Sports car: 4500-5500
- Truck: 5000-7000

**Max Speed:**
- Truck: 60-80 km/h
- Standard car: 80-100 km/h
- Sports car: 100-140 km/h

### 4. Test Incrementally

**Don't test everything at once:**
1. Start with minimal template (just physics)
2. Test movement and handling
3. Add parts one at a time
4. Test after each addition

**Why:** Easier to debug when you know which change broke something.

### 5. Use Part Templates

**Don't define parts from scratch:**
```lua
template = Engine,                      /* Use standard engine template */
template = Battery,                     /* Use standard battery template */
template = Tire,                        /* Use standard tire template */
```

**Why:** Templates are tested, balanced, and include all necessary properties.

### 6. Document Coordinate Systems

**Add comments for coordinates:**
```lua
wheel FrontLeft {
    offset = 0.36 -0.30 0.85,          /* X: right of center, Y: below center, Z: front */
    radius = 0.15f,
}
```

**Why:** Vehicle coordinates are confusing. Comments help when returning to the file later.

### 7. Maintain Area Coverage

**Ensure all vehicle sides have areas:**
- Front: Engine area
- Sides: Door/window areas
- Rear: Trunk/gas tank areas
- Tires: Tire areas for each wheel

**Missing areas = inaccessible parts.**

---

## Key Takeaways

1. **Three-part structure** - model + vehicle + template
2. **Coordinates are relative** - X (left/right), Y (up/down), Z (front/back)
3. **Right side is negative X** - Mirror coordinates for symmetry
4. **Only front wheels steer** - front = true only for front wheels
5. **Areas link to interactions** - Every passenger needs a matching area
6. **Use part templates** - Don't reinvent engine, battery, tires, etc.
7. **Balance against vanilla** - Copy similar vehicles and modify
8. **Test incrementally** - Add features one at a time

---

## Related

- [Fixing Script Reference](/build-41/modding/reference/fixing) - Repair definitions
- [Script Properties](/build-41/modding/reference/script-properties) - Item and recipe properties
- [Events Reference](/build-41/modding/reference/events) - Vehicle-related events
