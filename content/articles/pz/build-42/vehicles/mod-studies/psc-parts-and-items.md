---
id: build-42-psc-parts-and-items
slug: psc-parts-and-items
title: 'Project Summer Car -- items, fluids, recipes'
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: intermediate
tags:
  - vehicles
  - project-summer-car
  - items
  - fluids
  - craft-recipes
excerpt: What the mod actually adds to the game as content.
last_updated: '2026-09-29'
---
# Project Summer Car -- items, fluids, recipes

> Source: 03-parts-and-items-catalogue.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

What the mod actually *adds* to the game as content.

## Headline numbers

- **19 engine slots** simulated inside the vehicle Engine container
- **37 distinct part definitions** per quality family
- **4 quality families** -> **148 engine part items**
- **7 misc items** (fluid bottles, toolkit, init marker)
- **4 new fluids**
- **25 FBX world models** (`common/media/models_X/engineparts/`)
- **4 craft recipes**
- 7 languages (EN, DE, ES, KO, PTBR, RU, TR)

## Naming scheme

```
<PartName><SizeVariant>_<QualityFamily>
                 |            |
                 |            +-- 1 = Standard   (Realistic_Engine_Parts.txt)
                 |                2 = Heavy Duty (…_Heavy_Duty.txt)
                 |                3 = Sport      (…_Sport.txt)
                 |                4 = Other      (…_Other.txt)
                 +-- 1/2/3 for parts that come in performance grades
```

`Crankshaft2_3` = medium crankshaft, Sport family. The quality family suffix is
selected at spawn from `vehicle:getScript():getMechanicType()`, so each vehicle's
mechanic class pulls from its own family -- a truck's parts are not a sports
car's parts even at the same tier.

## The 19 slots

Grouped as the in-game panel groups them (`client/Engine_Menu.lua:229-455`).

### Engine Parts
| Part | Variants | Skill | Tags | What it does |
|------|----------|-------|------|--------------|
| Sparkplug | 1/2/3 | 2 | Critical, Electrical | Car won't run without them; helps starting |
| Cylinder Head | 1/2/3 | 7 | Critical | Determines HP |
| Head Gasket | 1 only | 7 | **NoRepair** | Seals head to block. Broken = oil/coolant mix both ways |
| Pistons | 1/2/3 | 7 | Critical | Determines HP |
| Crankshaft | 1/2/3 | 7 | Critical | Determines HP |
| Flywheel | 1/2/3 | 5 | Critical | Power to transmission; lighter = faster revs |
| Starter | 1 only | 4 | Electrical | No starter, no start |

### Drive Train
| Part | Variants | Skill | Notes |
|------|----------|-------|-------|
| Transmission | 1..5 | 5 | 5L ATF fluid container. **Gear ratios are published in the tooltip** |
| Torque Converter | 1/2/3 | 5 | Low / Medium / High stall |

Transmission ratio sets (from `Translate/EN/Tooltip.json`) -- these are the
numbers Realistic Car Physics consumes:

| Item | Speeds | Ratios |
|------|--------|--------|
| `Transmission1_x` | 3 | 2.6, 1.6, 1.0 |
| `Transmission2_x` | 4 | 2.6, 1.6, 1.23, 1.0 |
| `Transmission3_x` | 4 (high torque) | 3.0, 2.3, 1.7, 1.0 |
| `Transmission4_x` | 5 | 2.6, 1.6, 1.23, 1.0, 0.9 |
| `Transmission5_x` | 8 | 4.0, 2.5, 1.9, 1.5, 1.3, 1.1, 0.9, 0.8 |

Weight rises with capability: 3-speed 6 kg -> 5-speed 12 kg -> 8-speed 15 kg.

Torque converter stall behaviour, per tooltip: **low stall** = everyday driving,
**medium** = sport / higher-RPM engines, **high** = racing (worst fuel economy,
fastest acceleration).

### Fluids & Cooling
| Part | Variants | Skill | Fluid container |
|------|----------|-------|-----------------|
| Oil Pan | 1 only | 3 | 5.0 L MotorOil |
| Oil Filter | 1 only | 1 | -- |
| Radiator | 1/2/3 | 2 | 4.0 / 5.0 / 6.0 L Water |

Radiators show the tier mechanic clearly: as the tier rises, **capacity goes up
(4->5->6 L) while weight goes down (3->2->1.5 kg)** and `MaxItemSize` (the
performance scalar) goes 1.0 -> 1.5 -> 2.0. Same pattern on crankshafts (8->6->5 kg)
and cylinder heads (8->6->5 kg). Better parts are lighter *and* stronger.

### Accessories
| Part | Skill | What it does |
|------|-------|--------------|
| Fan Belt | 2 | **NoRepair.** Drives water pump, PS pump, alternator, A/C. Single point of failure for four systems |
| Alternator | 4 | Recharges battery; 120 A max, needs the belt |
| Water Pump | 4 | Circulates coolant; effect is *squared* in the heat model |
| Power Steering Pump | 4 | 1.0 L ATF. Sluggish steering when failing |
| Brake Booster | 3 | Manifold vacuum assist. Without it, very little braking force |
| Air Conditioner | 4 | Cabin cooling, needs belt >33% |
| Heater Core | 4 | Cabin heat off engine coolant, only above 50 C block temp |

The fan belt is the design keystone: it's cheap, unrepairable, craftable from
leather, and taking it out disables charging, cooling, steering assist and A/C
simultaneously.

## Fluids (`media/scripts/Engine_fluids.txt`)

| Fluid | Colour | Notes |
|-------|--------|-------|
| `MotorOil` | Yellow | Fresh oil |
| `UsedMotorOil` | Black | What fresh oil *becomes* |
| `ATF` | Red | Transmission + power steering |
| `Antifreeze` | Green | Mixed with vanilla `Water` in the radiator |

All four are `Hazardous, Industrial, Beverage` with `ThirstChange = -20.0` and
`Poison { maxEffect = Deadly, minAmount = 0.2, diluteRatio = 0.1 }`. Categorising
them as `Beverage` is what makes them pourable/drinkable through the vanilla
fluid UI -- and yes, you can drink them, and yes, it kills you.

Head-gasket failure also injects vanilla `Fluid.TaintedWater` into the oil pan.

## Misc items (`Realistic_Misc.txt`)

| Item | Purpose |
|------|---------|
| `BottleATF` | ATF container |
| `BottleMotorOil` | Oil bottle |
| `BottleMotorOilCan` | Larger oil can |
| `BottleAntifreeze1` / `BottleAntifreeze2` | Two antifreeze containers |
| `ToolKit` | "pliers, screwdrivers and wrenches" |
| `EnginePartInitMarker` | Invisible sentinel, never damaged, marks a populated engine |

## Loot distribution

`Project_Summer_Car_Server.lua:35-53` injects into four procedural lists --
`MechanicSpecial`, `ToolCabinetMechanics`, `MechanicShelfTools`, `GarageMechanics`:

| Item | Weight |
|------|--------|
| BottleATF | 6 |
| BottleMotorOil | 4 |
| BottleAntifreeze1 / 2 | 3 each |
| BottleMotorOilCan | 2 |
| ToolKit | 0.3 |

Engine parts themselves are **not** in loot tables. They only exist inside
vehicles. To get a part you must pull it out of a car -- which is exactly the
scavenging loop the mod wants.

## Craft recipes (`EnginePart_Recipes.txt`)

Only 4 recipes exist, and only for the two unrepairable parts:

**Head Gasket** (x4, one per quality family)
```
Mechanic:4, 300 ticks, xpAward Mechanic:10, category Mechanical
inputs: 1x Aluminum
        1x CylinderHead(1|2|3)_<family>   mode:keep flags[MayDegradeLight]
        1x tags[BallPeenHammer]           mode:keep flags[Prop1;MayDegradeLight]
```
You hammer a new gasket **against the cylinder head it's for** -- that's why the
recipe is family-specific and why it keeps the head.

**Fan Belt** (x4)
```
Tailoring:4, 300 ticks, xpAward Tailoring:10, category Mechanical
inputs: 3x LeatherStrips  mode:destroy
        2x tags[HeavyThread]
        1x tags[Scissors;SharpKnife]  mode:keep
        1x tags[SewingNeedle]         mode:keep
        1x tags[Awl]                  mode:keep
```
A **Tailoring** recipe for a car part. Sewing a leather drive belt is a great
post-apocalyptic detail and forces a non-mechanic skill into the car pipeline.

## What is deliberately absent

No turbo, no intake/exhaust manifold, no air filter, no camshaft, no fuel pump,
no injectors, no clutch (auto-only transmissions), no differential, no brakes-as-
parts, no suspension parts.

But `TEH Assembly Order` already carries dependency entries for
`EngineIntakeManifold`, `EngineExhaustManifold`, `EngineAirFilter` and
`EngineTurbocharger` -- so a forced-induction expansion was planned or exists in
a newer PSC build than the 42.15 copy on disk. The workshop page's "18 simulated
part types and 4 fluid systems" matches what's here.
