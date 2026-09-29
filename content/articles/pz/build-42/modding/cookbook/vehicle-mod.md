---
id: build-42-vehicle-mod
slug: vehicle-mod
title: Vehicle
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  What you build: a drivable vehicle (vehicle script block with model, wheels,
  parts, passengers, physics).
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
  - new-clothing
  - new-craftrecipe
  - new-workstation
  - new-fluid
  - item-repair
  - evolved-recipe
  - new-trait
  - new-profession
  - new-skill
  - new-animal
  - new-crop
  - lua-gameplay-mod
  - custom-ui
  - custom-moodle
  - sound-mod
  - radio-channel
  - translations
  - map-building-basement
  - workshop-verified-corrections
---
# Vehicle

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a drivable vehicle (`vehicle` script block with model, wheels, parts, passengers, physics).

**Files + placement:** `42/media/scripts/vehicles.txt` inside a `module`; a `model` script + mesh under `common/media/models_X/`; skin texture under `media/textures/Vehicles/`; name key in `IG_UI.json` (`IGUI_VehicleName<Key>`).

**Representative skeleton** (structure from `Vehicle_scripts.wiki.txt`; field names/defaults from `vehicle.txt`):

```
module Base
{
    vehicle MyCar
    {
        mechanicType   = 1,               -- 1 standard, 2 heavy-duty, 3 performance
        engineForce    = 3600,
        engineRPMType  = firebird,
        mass           = 650,
        seats          = 4,
        engineQuality  = 60,
        maxSpeed       = 70f,
        brakingForce   = 60,
        gearRatioCount = 4,
        gearRatioR = 4.7, gearRatio1 = 3.6, gearRatio2 = 2.2, gearRatio3 = 1.3, gearRatio4 = 1.0,
        steeringClamp  = 0.3,
        wheelFriction  = 1.6f,
        rollInfluence  = 1.0f,
        extents        = 1.75 1 4.7,
        physicsChassisShape = 1.75 0.85 4.7,
        centerOfMassOffset  = 0.0 0.30 0.0,

        model { file = Vehicles_MyCar, scale = 2.15, offset = 0 0.20 0, }   -- 1st model = the vehicle
        skin  { texture = Vehicles/Vehicle_MyCar_Shell, }
        sound { horn = vehicle_horn1, }

        wheel FrontLeft  { front = true,  offset = 0.32f 0.14f 0.60f,  radius = 0.3f, width = 0.2f, }
        wheel FrontRight { front = true,  offset = -0.32f 0.14f 0.60f, radius = 0.3f, width = 0.2f, }
        wheel RearLeft   { front = false, offset = 0.32f 0.14f -0.67f, radius = 0.3f, width = 0.2f, }
        wheel RearRight  { front = false, offset = -0.32f 0.14f -0.67f, radius = 0.3f, width = 0.2f, }

        passenger FrontLeft {
            position inside  { offset = 0.2 0 -0.0121,    rotate = 0.0 0.0 0.0, }
            position outside { offset = 0.5698 0 -0.0121, rotate = 0.0 0.0 0.0, }
        }
        -- FrontRight / RearLeft / RearRight passengers...

        part TruckBed { itemType = Base.SmallTrunk, container { capacity = 40, } }
    }
}
```

**Key top-level fields** (all CONFIRMED from `vehicle.txt`, current ~42.16.3):

| Field | Meaning | Tag |
|-------|---------|-----|
| `mechanicType` | Class: 1 standard / 2 heavy-duty / 3 performance (wiki adds 0=Burnt, LIKELY). | CONFIRMED |
| `engineForce` | Engine power/torque per wheel (~10x the displayed HP; default 3000). | CONFIRMED |
| `engineRPMType` | RPM/sound type (default `jeep`). | CONFIRMED |
| `engineQuality` | Start/hotwire chance (<65 = weather affects start; default 100). | CONFIRMED |
| `mass` | Physics mass (car ~800, pickup ~1100; **>1400 can immobilize/sink wheels**; default 800). | CONFIRMED |
| `seats` | Seat count (needs a seat part with a `container` `seat` param; default 2). | CONFIRMED |
| `maxSpeed` / `maxSpeedReverse` | Speed caps (defaults 20 / 40). | CONFIRMED |
| `gearRatioCount` + `gearRatioR`/`gearRatio1..8` | Gearing (vanilla 4, sports 5, max 9). | CONFIRMED |
| `steeringClamp` / `steeringIncrement` | Max steering angle / turn speed. | CONFIRMED |
| `wheelFriction` | Turn/stop friction (vanilla 1.2-1.9; **>1.8 can flip**; default 800). | CONFIRMED |
| `rollInfluence` | Rollover resistance (0-1; default 0.1). | CONFIRMED |
| `stoppingMovementForce` / `offRoadEfficiency` | Drag / off-road HP retention. | CONFIRMED |
| `suspension*` / `maxSuspensionTravelCm` | Suspension tuning. | CONFIRMED |
| `physicsChassisShape` + `useChassisPhysicsCollision` | Collision box; if false, use `physics` sub-blocks as hitbox. | CONFIRMED |
| `extents` / `centerOfMassOffset` / `shadowExtents` | Interaction box / COM / shadow. | CONFIRMED |
| `playerDamageProtection` | Crash-damage multiplier to player. | CONFIRMED |
| `carModelName` | Name translation key (`IGUI_VehicleName<Key>`). | CONFIRMED |
| `template` / `template!` | Reuse (or inline with `!`) template script data. | CONFIRMED |

**Sub-blocks** (children of `vehicle`, CONFIRMED): `model` (first = vehicle's own model; `file` references a global `model` script), `skin`, `sound`, `wheel` (**only IDs `FrontLeft`/`FrontRight`/`RearLeft`/`RearRight` function**), `part` (`itemType`, `container`, `door`, `window`, `anim`...), `passenger` (`position inside`/`position outside`), `physics` (IDs `box`/`sphere`/`mesh`; only used when `useChassisPhysicsCollision = false`), `attachment`, `lightbar`, `area`.

**Gotchas.** Prefer `frontEndDurability`/`rearEndDurability` -- `frontEndHealth`/`rearEndHealth` are parsed but do nothing (`hasSiren`, `storageCapacity`, `textureMaskEnable` are useless). Vehicle axes are X=width, Y=height, Z=length (LIKELY). Only the four named wheel IDs work. **Physics is capped for Lua** -- the Lua API can't inject forces onto physics bodies, so behavior overhauls need Java/Mixin (doc 07). Most `wheel`/`part`/`passenger` params are typed "Unknown" in ScriptsDocs -- confirm against vanilla scripts.

**Deep reference:** `_raw_scriptsdocs/vehicle.txt`, `wheel.txt`, `part.txt`, `passenger.txt`, `physics.txt`, `model.txt`; `_raw_pzwiki_sources/08_creation_toolkit/Vehicle_scripts.wiki.txt`, `Model_scripts.wiki.txt`; doc 07 (vehicles/power/combat).

---

<a name="gaps"></a>
