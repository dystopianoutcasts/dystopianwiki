---
id: build-42-world-generation-the-part-economy
slug: world-generation-the-part-economy
title: World generation -- the part economy
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
excerpt: server/Project_Summer_Part_Spawning.lua decides what you actually find.
last_updated: '2026-09-29'
related_articles:
  - thermal-model
  - oil-model
  - electrical-model-an-actual-amp-budget
  - horsepower-and-fuel
  - cabin-climate-windchill
  - repair-system-procedural-failure-modes
  - install-uninstall
  - sandbox-surface
---
# World generation -- the part economy

> Source: 02-simulation-model.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`server/Project_Summer_Part_Spawning.lua` decides what you actually find.

### Condition distribution is a biased double-roll
```lua
BiasFactor = clamp(zone.baseVehicleQuality + 0.3, 0.7, 1.5)
if vehicle:isInTrafficJam() then BiasFactor = 0.7 end
BiasFactor = 1 / BiasFactor              -- invert to use as exponent

if sv.LowOrHigh < (rand^BiasFactor) then
    cond = LowCondition + ((rand^BiasFactor)^(1/LowToMid)) * (MidCondition-LowCondition)
else
    cond = MidCondition + ((rand^BiasFactor)^(1/MidToHigh)) * (HighCondition-MidCondition)
end
```
Two-segment distribution (low-mid, mid-high) with per-segment bias exponents, all
sandbox-exposed. Defaults: Low 0.1, Mid 0.5, High 0.9.

### Part tier selection is context-aware
```lua
-- Transmission by engine RPM type
"firebird"     -> Transmission4 (5-speed)
"SemiTruckRPM" -> Transmission5 (8-speed)
otherwise      -> Transmission1..3 random (3sp / 4sp / 4sp-hightorque)

-- Torque converter matched to the engine
"firebird" -> stall 2 or 3 (medium/high)
otherwise  -> stall 1 or 2 (low/medium)

-- Upgraded parts (Radiator/Sparkplug/Crankshaft/CylinderHead/Pistons/Flywheel)
isGoodCar() -> 1 in 5 chance of an upgraded variant
otherwise   -> 1 in 30
```
So a survivor's stashed sports car genuinely tends to have better internals than
a traffic-jam sedan. The quality tier suffix comes from
`vehicle:getScript():getMechanicType()` -- i.e. **the car's own mechanic type
picks which of the 4 quality families the parts come from.**

### Fluids spawn as realistic mixtures
```lua
fluidAmount = cond + rand(0, ConditionRandom) - rand(0, ConditionRandom)  -- bell curve
if container has MotorOil then
    addFluid("UsedMotorOil", rand(0, 0.5) * freeCapacity)   -- dirty oil already in there
end
if container has Water then
    adjustAmount(fluidAmount * capacity * 0.5)
    addFluid("Antifreeze", rand(0.5, 1.7) * fluidAmount * capacity * 0.5)
end
```
Found cars come with **partly-used oil and a random water/antifreeze ratio**, not
clean fluids. Small touch, big immersion payoff.

### Optional spawn takeover
With `TakeOverSpawning = true` PSC also:
- empties `SmashedCarDefinitions.cars` (deletes all undriveable wrecks)
- rewrites `chanceToSpawnBurnt` on all four traffic-jam zones + junkyard
- strips random *body* parts from cars (guarded: never trunk/rear doors, because
  removing them breaks rear windows and trunk access on animated vehicles)
