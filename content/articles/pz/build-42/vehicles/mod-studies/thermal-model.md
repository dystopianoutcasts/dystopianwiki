---
id: build-42-thermal-model
slug: thermal-model
title: Thermal model
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
excerpt: 'PSC simulates two temperatures, not one: engine block and radiator coolant.'
last_updated: '2026-09-29'
related_articles:
  - oil-model
  - electrical-model-an-actual-amp-budget
  - horsepower-and-fuel
  - cabin-climate-windchill
  - repair-system-procedural-failure-modes
  - install-uninstall
  - world-generation-the-part-economy
  - sandbox-surface
---
# Thermal model (a real two-body heat exchanger)

> Source: 02-simulation-model.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

PSC simulates **two** temperatures, not one: engine block and radiator coolant.

### Heat in
```lua
local maxRPM = 4500                       -- 6000 for "firebird" RPM type
local rpmScale = vehicle:getEngineSpeed() / maxRPM
idleHeat = 0.05
if partData.temperature < 85 then idleHeat = 0.35 end   -- cold engines warm fast
partData.temperature = partData.temperature
    + (math.max(idleHeat, getThrottle(vehicle)) * rpmScale * elapsedMinutes * tempScale)
```
(`:281-294`, `tempScale = 5`)

### Passive cooling, gated by the hood
```lua
local engineDoor = vehicle:getPartById("EngineDoor")
cooling = 1                                        -- no hood defined (bikes)
if engineDoor then
    if not engineDoor:getInventoryItem() then cooling = 0.5   -- hood missing
    else cooling = math.min(100, engineDoor:getCondition()+50.0)/100.0
    end
end
partData.temperature = partData.temperature
    - (0.001 * elapsedMinutes * tempScale * (temp - ambient))
```
(`:298-309`) -- Newton's law of cooling against live `getClimateManager():getTemperature()`.
A missing hood **halves** cooling capacity. Counter-intuitive but deliberate.

### Radiator loop -- the interesting part
```lua
cooling = cooling * radiatorQuality * radiatorCondition
                  * math.min(1, radiatorFluidLevel/0.8)   -- degrades below 80% full

heatTransfer = min(1, waterPumpCondition * 0.01)
heatTransfer = heatTransfer * heatTransfer                -- squared: pump matters a lot
heatTransfer = heatTransfer * min(1, fanBeltCondition * 0.03)  -- belt below 33% is bad
```
(`:318-329`)

Then a **thermostat**:
```lua
if partData.temperature < 110 then
    heatTransfer = heatTransfer * clamp((temp-90) * 0.05, 0.02, 1)
end
```
(`:346-348`) -- below 90 C the coolant loop is effectively closed (2%), opening
progressively to fully open at 110 C. That is a genuine automotive thermostat,
and it's why cold starts warm up realistically.

Heat is then equalized between the two bodies weighted by fluid mass:
```lua
avgTemp = ((radTemp * radFluidLevel) + (engineTemp * engineCapacity))
          / (radFluidLevel + engineCapacity)
radTemp    = lerp(radTemp,    avgTemp, heatTransfer)
engineTemp = lerp(engineTemp, avgTemp, heatTransfer)
```
(`:356-358`)

### Failure cascade
| Threshold | Effect |
|-----------|--------|
| **> 125 C** | Radiator vents coolant: `-0.01 L/min` and `-1 C/min` |
| **> 140 C** | Oil contamination x5, plus `DamageRandomPart` across pistons / cylinder head / head gasket / sparkplug / water pump |
| Radiator condition < 25% | Continuous coolant loss scaled by `(0.25 - condition)` |

Both temps are sanity-clamped to `[-100, 200]` on every entry (`:220`).
