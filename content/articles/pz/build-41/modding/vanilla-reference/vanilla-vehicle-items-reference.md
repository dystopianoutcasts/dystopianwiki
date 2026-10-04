---
id: vanilla-vehicle-items-reference
slug: vanilla-vehicle-items-reference
title: "Vanilla Vehicle Items Reference"
game: pz
version: build-41
section: modding
category: vanilla-reference
subcategory: null
difficulty: beginner
tags:
  - reference
  - vehicles
  - vanilla
  - items
  - mechanics
excerpt: "Complete reference for all 97 vehicle parts and maintenance items."
related_articles:
  - item-anatomy
last_updated: 2026-01-18
---

# Vanilla Vehicle Items Reference

## Introduction

You're creating a custom vehicle part mod and need to know what weight vanilla parts have. Or you're adding a new tire type and want it to feel balanced. Or maybe you're creating a custom vehicle and need to know what parts to reference.

If you're feeling overwhelmed by the vehicle part system in Project Zomboid, you're not alone. There are 97 different vehicle-related items including tires, brakes, engines, doors, windows, and maintenance tools. Each part comes in multiple quality tiers (Old, Normal, Performance) and vehicle types (standard, heavy duty, sport). Figuring out what's "normal" for weight, condition, or quality can feel confusing.

Here's the good news: this reference organizes all 97 vanilla vehicle items by type and tier, so you can quickly find similar parts and see what properties they use. I'll show you exactly how to use this reference to create balanced vehicle part mods.

## How to Use This Reference

When creating custom vehicle parts, follow this pattern:

### Step 1: Find Similar Vanilla Parts

Look through the item tables below and find parts similar to what you're creating:

- **Making a tire?** Look at tire entries (Valu-Tire, Regular Tire, Performance Tire)
- **Making an engine part?** Look at brake/suspension/muffler entries
- **Making body parts?** Look at door/window/hood entries
- **Making storage?** Look at trunk/glove box entries
- **Making tools?** Look at Tool category (jack, lug wrench, tire pump, wrench)

### Step 2: Compare Properties

Notice the patterns in vanilla vehicle parts:

| Property | Pattern | Examples |
|----------|---------|----------|
| **Weight by Part Type** | Consistent per part | All car batteries = 5, All front doors = 10, All tires = 15 |
| **Vehicle Type (1/2/3)** | All parts have 3 variants | 1 = standard, 2 = heavy duty, 3 = sport |
| **Quality Tiers** | Old < Normal < Performance | Old Brake (low), Regular Brake (standard), Performance Brake (high) |
| **Weight Scaling** | Heavier parts for heavier vehicles | Big Gas Tank: Type 1 = 15, Type 2 = 22, Type 3 = 14 |

### Step 3: Make Your Decision

Choose values that match vanilla patterns:

- **Weight** → Match similar vanilla parts (tire = 15, door = 10, window = 3, battery = 5)
- **Vehicle Types** → Create 3 variants (Type 1, 2, 3) like vanilla parts
- **Quality Tiers** → Follow Old/Normal/Performance naming if creating part variants
- **Naming Convention** → Use descriptive names (Front Door, Rear Window, Regular Brake)

## Vehicle System Overview

Vehicle parts in PZ use a quality tier system:

| Tier | Examples | Quality |
|------|----------|---------|
| **Old** | Valu-Tire, Old Brake | Low quality, prone to damage |
| **Normal** | Regular Tire, Regular Brake | Standard quality |
| **Modern/Performance** | Performance Tire | High quality, better stats |

## Key Properties

| Property | Description |
|----------|-------------|
| `VehicleType` | Vehicle class (1=standard, 2=heavy duty, 3=sport) |
| `ConditionMax` | Maximum condition points |
| `ConditionLowerStandard` | Wear rate on roads |
| `ConditionLowerOffroad` | Wear rate off-road |
| `MechanicsItem` | Appears in mechanics interface |
| `WheelFriction` | Tire grip (for tires) |
| `EngineLoudness` | Noise level (for engines) |
| `EnginePower` | Power output (for engines) |

## Quick Navigation

- [VehicleMaintenance](#vehiclemaintenance) (92 items)
- [Tool](#tool) (4 items)
- [Security](#security) (1 items)

## VehicleMaintenance

| Item | Weight | Vehicle Type | ID |
|------|--------|--------------|-----|
| Average Muffler | 10.0 | 1 | `Base.NormalCarMuffler1` |
| Average Muffler | 10.0 | 2 | `Base.NormalCarMuffler2` |
| Average Muffler | 10.0 | 3 | `Base.NormalCarMuffler3` |
| Big Gas Tank | 15.0 | 1 | `Base.BigGasTank1` |
| Big Gas Tank | 22.0 | 2 | `Base.BigGasTank2` |
| Big Gas Tank | 14.0 | 3 | `Base.BigGasTank3` |
| Big Trunk | 40.0 | 1 | `Base.BigTrunk1` |
| Big Trunk | 50.0 | 2 | `Base.BigTrunk2` |
| Big Trunk | 30.0 | 3 | `Base.BigTrunk3` |
| Big Trunk | 30.0 | 1 | `Base.TrailerTrunk1` |
| Car Battery | 5 | 1 | `Base.CarBattery1` |
| Car Battery | 5 | 2 | `Base.CarBattery2` |
| Car Battery | 5 | 3 | `Base.CarBattery3` |
| Double Rear Door | 20.0 | 1 | `Base.RearCarDoorDouble1` |
| Double Rear Door | 20.0 | 2 | `Base.RearCarDoorDouble2` |
| Double Rear Door | 20.0 | 3 | `Base.RearCarDoorDouble3` |
| Front Door | 10.0 | 1 | `Base.FrontCarDoor1` |
| Front Door | 10.0 | 2 | `Base.FrontCarDoor2` |
| Front Door | 10.0 | 3 | `Base.FrontCarDoor3` |
| Front Window | 3.0 | 1 | `Base.FrontWindow1` |
| Front Window | 3.0 | 2 | `Base.FrontWindow2` |
| Front Window | 3.0 | 3 | `Base.FrontWindow3` |
| Glove Box | 3.0 | 1 | `Base.GloveBox1` |
| Glove Box | 4.0 | 2 | `Base.GloveBox2` |
| Glove Box | 2.0 | 3 | `Base.GloveBox3` |
| Hood | 15.0 | 1 | `Base.EngineDoor1` |
| Hood | 15.0 | 2 | `Base.EngineDoor2` |
| Hood | 15.0 | 3 | `Base.EngineDoor3` |
| Old Brake | 3.0 | 1 | `Base.OldBrake1` |
| Old Brake | 3.0 | 2 | `Base.OldBrake2` |
| Old Brake | 3.0 | 3 | `Base.OldBrake3` |
| Old Muffler | 10.0 | 1 | `Base.OldCarMuffler1` |
| Old Muffler | 10.0 | 2 | `Base.OldCarMuffler2` |
| Old Muffler | 10.0 | 3 | `Base.OldCarMuffler3` |
| Performance Brake | 3.0 | 1 | `Base.ModernBrake1` |
| Performance Brake | 3.0 | 2 | `Base.ModernBrake2` |
| Performance Brake | 3.0 | 3 | `Base.ModernBrake3` |
| Performance Muffler | 10.0 | 1 | `Base.ModernCarMuffler1` |
| Performance Muffler | 10.0 | 2 | `Base.ModernCarMuffler2` |
| Performance Muffler | 10.0 | 3 | `Base.ModernCarMuffler3` |
| Performance Suspension | 3.0 | 1 | `Base.ModernSuspension1` |
| Performance Suspension | 3.0 | 2 | `Base.ModernSuspension2` |
| Performance Suspension | 3.0 | 3 | `Base.ModernSuspension3` |
| Performance Tire | 15.0 | 1 | `Base.ModernTire1` |
| Performance Tire | 15.0 | 2 | `Base.ModernTire2` |
| Performance Tire | 15.0 | 3 | `Base.ModernTire3` |
| Rear Door | 10.0 | 1 | `Base.RearCarDoor1` |
| Rear Door | 10.0 | 2 | `Base.RearCarDoor2` |
| Rear Door | 10.0 | 3 | `Base.RearCarDoor3` |
| Rear Window | 3.0 | 1 | `Base.RearWindow1` |
| Rear Window | 3.0 | 2 | `Base.RearWindow2` |
| Rear Window | 3.0 | 3 | `Base.RearWindow3` |
| Rear Windshield | 8.0 | 1 | `Base.RearWindshield1` |
| Rear Windshield | 8.0 | 2 | `Base.RearWindshield2` |
| Rear Windshield | 8.0 | 3 | `Base.RearWindshield3` |
| Regular Brake | 3.0 | 1 | `Base.NormalBrake1` |
| Regular Brake | 3.0 | 2 | `Base.NormalBrake2` |
| Regular Brake | 3.0 | 3 | `Base.NormalBrake3` |
| Regular Suspension | 2.0 | 1 | `Base.NormalSuspension1` |
| Regular Suspension | 2.0 | 2 | `Base.NormalSuspension2` |
| Regular Suspension | 2.0 | 3 | `Base.NormalSuspension3` |
| Regular Tire | 15.0 | 1 | `Base.NormalTire1` |
| Regular Tire | 15.0 | 2 | `Base.NormalTire2` |
| Regular Tire | 15.0 | 3 | `Base.NormalTire3` |
| Small Gas Tank | 11.0 | 1 | `Base.SmallGasTank1` |
| Small Gas Tank | 14.0 | 2 | `Base.SmallGasTank2` |
| Small Gas Tank | 10.0 | 3 | `Base.SmallGasTank3` |
| Small Trunk | 30.0 | 1 | `Base.SmallTrunk1` |
| Small Trunk | 20.0 | 2 | `Base.VanSeatsTrunk2` |
| Small Trunk | 40.0 | 2 | `Base.SmallTrunk2` |
| Small Trunk | 20.0 | 3 | `Base.SmallTrunk3` |
| Spare Engine Parts | 0.4 | - | `Base.EngineParts` |
| Standard Gas Tank | 13.0 | 1 | `Base.NormalGasTank1` |
| Standard Gas Tank | 17.0 | 2 | `Base.NormalGasTank2` |
| Standard Gas Tank | 12.0 | 3 | `Base.NormalGasTank3` |
| Standard Seat | 15.0 | 1 | `Base.NormalCarSeat1` |
| Standard Seat | 15.0 | 2 | `Base.NormalCarSeat2` |
| Standard Seat | 15.0 | 3 | `Base.NormalCarSeat3` |
| Standard Trunk | 35.0 | 1 | `Base.NormalTrunk1` |
| Standard Trunk | 45.0 | 2 | `Base.NormalTrunk2` |
| Standard Trunk | 25.0 | 3 | `Base.NormalTrunk3` |
| Trailer Trunk | 30.0 | 2 | `Base.TrailerTrunk2` |
| Trailer Trunk | 30.0 | 3 | `Base.TrailerTrunk3` |
| Trunk Lid | 15.0 | 1 | `Base.TrunkDoor1` |
| Trunk Lid | 15.0 | 2 | `Base.TrunkDoor2` |
| Trunk Lid | 15.0 | 3 | `Base.TrunkDoor3` |
| Valu-Tire | 15.0 | 1 | `Base.OldTire1` |
| Valu-Tire | 15.0 | 2 | `Base.OldTire2` |
| Valu-Tire | 15.0 | 3 | `Base.OldTire3` |
| Windshield | 8.0 | 1 | `Base.Windshield1` |
| Windshield | 8.0 | 2 | `Base.Windshield2` |
| Windshield | 8.0 | 3 | `Base.Windshield3` |

## Tool

| Item | Weight | Vehicle Type | ID |
|------|--------|--------------|-----|
| Car Battery Charger | 2 | - | `Base.CarBatteryCharger` |
| Jack | 1.5 | - | `Base.Jack` |
| Lug Wrench | 1 | - | `Base.LugWrench` |
| Tire Pump | 2 | - | `Base.TirePump` |

## Security

| Item | Weight | Vehicle Type | ID |
|------|--------|--------------|-----|
| Car Key | 0 | - | `Base.CarKey` |

---

## Common Mistakes

### Wrong: Creating Only One Vehicle Type Variant

```
item MyCustomTire
{
    Type = VehicleMaintenance,
    DisplayName = Custom Tire,
    Weight = 15.0,
    VehicleType = 1,                        // WRONG! Only Type 1, missing Type 2 and 3
}
```

**Why it's wrong:** Looking at vanilla tires (Valu-Tire, Regular Tire, Performance Tire), EVERY tire type has 3 variants for VehicleType 1, 2, and 3. Players need tires for all vehicle classes. Your custom tire only works on standard cars (Type 1), not heavy duty (Type 2) or sport (Type 3) vehicles.

**Right:**

```
item MyCustomTire1
{
    Type = VehicleMaintenance,               // Vehicle part type
    DisplayName = Custom Tire,
    Weight = 15.0,                           // Matches all vanilla tires
    VehicleType = 1,                         // Standard vehicles
    ConditionMax = 100,                      // Maximum condition
    WheelFriction = 90,                      // Tire grip
}

item MyCustomTire2
{
    Type = VehicleMaintenance,
    DisplayName = Custom Tire,
    Weight = 15.0,                           // Same weight across types
    VehicleType = 2,                         // Heavy duty vehicles
    ConditionMax = 100,
    WheelFriction = 90,
}

item MyCustomTire3
{
    Type = VehicleMaintenance,
    DisplayName = Custom Tire,
    Weight = 15.0,                           // Consistent weight
    VehicleType = 3,                         // Sport vehicles
    ConditionMax = 100,
    WheelFriction = 90,
}
```

### Wrong: Inconsistent Part Weight

```
item MyCustomDoor1
{
    Type = VehicleMaintenance,
    DisplayName = Custom Front Door,
    Weight = 5.0,                           // WRONG! Too light for a door
    VehicleType = 1,
}
```

**Why it's wrong:** Looking at vanilla doors (Front Door, Rear Door), ALL doors weigh 10.0. Doors are large metal pieces - they're heavy. Your custom door at 5.0 weight is half the weight of every vanilla door.

**Right:**

```
item MyCustomDoor1
{
    Type = VehicleMaintenance,               // Vehicle part type
    DisplayName = Custom Front Door,
    Weight = 10.0,                           // Matches all vanilla doors
    VehicleType = 1,                         // Standard vehicles
    MechanicsItem = true,                    // Appears in mechanics interface
    ConditionMax = 100,                      // Maximum condition
}
```

### Wrong: Missing Quality Tier Naming

```
item MyCustomBrake1
{
    Type = VehicleMaintenance,
    DisplayName = Custom Brake,             // WRONG! No quality indicator in name
    Weight = 3.0,
    VehicleType = 1,
}
```

**Why it's wrong:** Looking at vanilla brakes, they use quality tier naming: Old Brake (low quality), Regular Brake (standard), Performance Brake (high quality). This helps players identify part quality at a glance. Your "Custom Brake" doesn't indicate quality level.

**Right:**

```
item MyCustomRegularBrake1
{
    Type = VehicleMaintenance,               // Vehicle part type
    DisplayName = Regular Custom Brake,      // Includes quality tier
    Weight = 3.0,                            // Matches vanilla brake weight
    VehicleType = 1,                         // Standard vehicles
    ConditionMax = 100,                      // Standard condition
}

item MyCustomPerformanceBrake1
{
    Type = VehicleMaintenance,
    DisplayName = Performance Custom Brake,  // Clear quality indicator
    Weight = 3.0,                            // Same weight, better performance
    VehicleType = 1,
    ConditionMax = 120,                      // Higher condition than regular
}
```

## Try It Yourself

Let's create a custom tire using vanilla vehicle part patterns.

### Step 1: Research Similar Parts

Look at the VehicleMaintenance table above and find tires:
- All tires weigh 15.0 (Valu-Tire, Regular Tire, Performance Tire)
- All tires have 3 vehicle type variants (1, 2, 3)
- Tires use VehicleType to determine compatibility

### Step 2: Create the Item File

Create `media/scripts/my_vehicle_items.txt`:

```
module MyMod
{
    imports
    {
        Base
    }

    item OffroadTire1
    {
        Type = VehicleMaintenance,               // Vehicle maintenance part
        DisplayName = Offroad Tire,
        Icon = tire,                             // Using vanilla tire icon
        Weight = 15.0,                           // Matches all vanilla tires
        VehicleType = 1,                         // Standard vehicles
        ConditionMax = 120,                      // Durable offroad tire
        ConditionLowerOffroad = 0.5,             // Better offroad wear (lower = less wear)
        WheelFriction = 95,                      // High grip
        MechanicsItem = true,                    // Shows in mechanics menu
    }

    item OffroadTire2
    {
        Type = VehicleMaintenance,
        DisplayName = Offroad Tire,
        Icon = tire,
        Weight = 15.0,                           // Consistent weight
        VehicleType = 2,                         // Heavy duty vehicles
        ConditionMax = 120,
        ConditionLowerOffroad = 0.5,
        WheelFriction = 95,
        MechanicsItem = true,
    }

    item OffroadTire3
    {
        Type = VehicleMaintenance,
        DisplayName = Offroad Tire,
        Icon = tire,
        Weight = 15.0,                           // Consistent weight
        VehicleType = 3,                         // Sport vehicles
        ConditionMax = 120,
        ConditionLowerOffroad = 0.5,
        WheelFriction = 95,
        MechanicsItem = true,
    }
}
```

### Step 3: Test in Game

1. Start Project Zomboid in debug mode
2. Press **F** to spawn an Offroad Tire (Type 1, 2, or 3)
3. Find a vehicle matching the tire's vehicle type
4. Press **V** near the vehicle to open mechanics menu
5. Install the offroad tire

**What You Should See:**
- Offroad Tire appears in inventory with tire icon
- Shows "Offroad Tire" in mechanics menu
- Can be installed on matching vehicle type
- Better offroad performance than regular tires
- Item weighs 15.0 (same as vanilla tires)

### Why This Works

This offroad tire uses vanilla patterns:
- **Weight (15.0)** matches ALL vanilla tires
- **3 vehicle type variants** covers all vehicle classes (1, 2, 3)
- **ConditionMax (120)** is higher than regular tires (more durable)
- **ConditionLowerOffroad (0.5)** provides better offroad performance
- **MechanicsItem = true** makes it appear in mechanics interface

---

## Source

Definitions from `media/scripts/vehicles/vehiclesitems.txt`
