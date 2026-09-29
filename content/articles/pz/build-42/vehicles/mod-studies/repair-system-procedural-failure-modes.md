---
id: build-42-repair-system-procedural-failure-modes
slug: repair-system-procedural-failure-modes
title: Repair system -- procedural failure modes
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: advanced
tags:
  - vehicles
  - project-summer-car
  - simulation
  - thermal-model
  - fuel
excerpt: >-
  shared/Engine_Part_Repair.lua is the model for making repair feel like
  diagnosis rather than a progress bar.
last_updated: '2026-09-29'
related_articles:
  - thermal-model
  - oil-model
  - electrical-model-an-actual-amp-budget
  - horsepower-and-fuel
  - cabin-climate-windchill
  - install-uninstall
  - world-generation-the-part-economy
  - sandbox-surface
---
# Repair system -- procedural failure modes

> Source: 02-simulation-model.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`shared/Engine_Part_Repair.lua` is the model for making repair feel like
diagnosis rather than a progress bar.

Each damaged part accumulates **named failure modes**:
```lua
repairMethodCount = math.floor((110 - condition) / 20)
```
First appears at 90% condition, fifth at 10%. Modes are drawn without repeats
from a table of 11, filtered by tag:

| Failure mode | Requires tag | Repair options (skill, difficulty) |
|---|---|---|
| Small Dent | -- | Weld (MetalWelding 2) / Hammer (Mechanics 2) |
| Large Dent | -- | Weld (3) / Hammer (3) |
| Small Hole | -- | Weld + SmallSheetMetal (4) / Glue plate (4) |
| Large Hole | -- | Weld + SheetMetal (6) / Glue plate (6) |
| Bent | -- | Heat bend, 3 BlowTorch uses (6) / Hammer (6) |
| Bearings worn out | `EnginePartBearing` | Oil, 0.5 L MotorOil (Maintenance 2) |
| Electrical Issue | `EnginePartElectrical` | 2x ElectronicsScrap (Electricity 3) |
| Burnt Wiring | `EnginePartElectrical` | 3x ElectronicsScrap (Electricity 4) |
| Gunked up | -- | 0.5 L Petrol + Toothbrush / 0.1 L CleaningLiquid (Maintenance 1) |
| Missing Bolts | -- | 2x NutsBolts (Mechanics 2) |
| Stripped Bolts | -- | 2x NutsBolts (Mechanics 6) |

Success chance:
```lua
levelRequired = levelRequired + (timesRepaired / 2)   -- each botch raises the bar
if playerLevel < levelRequired then
    failure = lerp(80, 20, playerLevel/levelRequired)
else
    failure = 20 * (1 - (playerLevel-levelRequired)/(10-levelRequired))
end
failure = clamp(failure, 5, 100)                      -- never below 5% risk
```
Success: `+10..30` condition, +3 XP. Failure: `-0..20` condition, `PZ_MetalSnap`
sound, `timesRepaired++`, +1 XP. Ratcheting difficulty means a part can be
repaired into being unrepairable -- a real decision about when to stop.

Two parts carry `EnginePartNoRepair` and can never be fixed, only crafted new:
the **head gasket** and the **fan belt**.
