---
id: build-42-horsepower-and-fuel
slug: horsepower-and-fuel
title: Horsepower and fuel
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
excerpt: '(:230-271)'
last_updated: '2026-10-04'
related_articles:
  - thermal-model
  - oil-model
  - electrical-model-an-actual-amp-budget
  - cabin-climate-windchill
  - repair-system-procedural-failure-modes
  - install-uninstall
  - world-generation-the-part-economy
  - sandbox-surface
---
# Horsepower and fuel

> Source: 02-simulation-model.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### HP is derived from part condition AND part tier
```lua
avgEngineCond = avg(Pistons, CylinderHead, Crankshaft) / 100

-- performance tier read from MaxItemSize, abused as a quality scalar
partPerformance = avg(MaxItemSize of Pistons, CylinderHead, Crankshaft, Sparkplug)
performanceMod  = 1 + (sv.PerformancePartBoost * (partPerformance - 1))

scaledCondition = clamp((avgEngineCond - MinHPCondition)/(MaxHPCondition - MinHPCondition), 0, 1)
scaledCondition = lerp(sv.MinHP, sv.MaxHP, scaledCondition)

vehicle:setEngineFeature(
    enginequality * 100,
    engineLoudness,
    vehicle:getScript():getEngineForce() * scaledCondition * performanceMod)
```
(`:230-271`)

Note the hack: **`MaxItemSize` is repurposed as the performance rating.** Stock
parts are 1.0, larger values mean sport/racing. It's not a size at all -- it's a
free float field on every item that the engine doesn't otherwise use for these.

### Loudness scales inversely with condition
```lua
engineLoudness = script:getEngineLoudness()
               * SandboxVars.ZombieAttractionMultiplier
               * (1.7 - avgEngineCond)
```
(`:254-256`) -- a beater is up to 70% louder, so a bad engine is a *survival*
liability, not just a performance one. Best single design idea in the mod.

### Fuel
```lua
fuelUsagePerHour = 10                       -- L/h at peak output
fuelConsumption  = engineSpeed/maxRPM * fuelUsagePerHour * SandboxVars.CarGasConsumption
fuelConsumption *= vehicle:getEnginePower() / 4000    -- 400hp = "vanilla" baseline
fuelConsumption *= qualityMultiplier                  -- 2x on a wrecked engine
fuelConsumption *= max(getThrottle(vehicle), 0.2)
fuelConsumption /= BaseVehicle.getFakeSpeedModifier() -- so "fast" servers don't cheat fuel
```
(`:662-732`)

Plus a leak: below 30% gas tank condition you lose up to 0.05 L/min.

**This is where PSC and RCP interlock.** If `RealisticCarPhysics` is active, PSC
applies RCP's own torque curve to fuel burn so the two agree:
```lua
if REALISTICCARPHYSICS_ENABLED then
    torqueCurve = clamp(1.0 - ((engineSpeed - maxRPM)/1000.0), 0.3, 1)
    torqueCurve = torqueCurve * clamp((engineSpeed/maxRPM)*2, 0.5, 1)
    fuelConsumption = fuelConsumption * torqueCurve
    if SandboxVars.RealisticCarPhysics.HPWeightOverhaulBeta then
        if RCP_VehicleValues[vehicle:getScript():getFullType()] then
            fuelConsumption = fuelConsumption * 4
        end
    end
end
```

*Re-checked 2026-10-04 for Build 42.21: the `BaseVehicle` methods this page uses (`setEngineFeature`, `getEnginePower`, `getThrottle`, `getFakeSpeedModifier`) have the same signatures, so the claims here still hold.*
