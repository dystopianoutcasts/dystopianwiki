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

Complete reference for all **97 vehicle-related items** in Project Zomboid Build 41.

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

## Source

Definitions from `media/scripts/vehicles/vehiclesitems.txt`
