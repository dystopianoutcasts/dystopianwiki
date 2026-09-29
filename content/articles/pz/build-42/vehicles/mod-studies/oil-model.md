---
id: build-42-oil-model
slug: oil-model
title: Oil model
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
excerpt: '(:376-421)'
last_updated: '2026-09-29'
related_articles:
  - thermal-model
  - electrical-model-an-actual-amp-budget
  - horsepower-and-fuel
  - cabin-climate-windchill
  - repair-system-procedural-failure-modes
  - install-uninstall
  - world-generation-the-part-economy
  - sandbox-surface
---
# Oil model

> Source: 02-simulation-model.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### Contamination -- oil turns into a *different fluid*
```lua
oilContaminationRate = (1.4 - avgEngineCond) * 0.0015 * sv.OilDecayRate
if oilfilter then
    oilContaminationRate = oilContaminationRate * (130 - filterCond) * 0.01
end
...
oilpan:adjustSpecificFluidAmount(MotorOil, oilLevel - amountToContaminate)
oilpan:addFluid(UsedMotorOil, amountToContaminate)
```
(`:376-421`)

This is the standout mechanic. `MotorOil` and `UsedMotorOil` are two separate
registered fluids in the same container. Oil doesn't "wear out" as a number --
it **transmutes**, litre by litre, so an oil change is a real fluid operation:
drain the black stuff, pour in the yellow stuff. The oil filter reduces the
conversion rate to ~30% when fresh and degrades itself over time.

A comment in the source shows the author explicitly tuning the reward curve:
> `-- So this is like... 10x between new and worst engine rate.`
> `-- Now lets say you stay above 30%.. still 1:4 ratio vs 90% engine.`
> `-- I guess that isn't.. horrible? 1:3 might be better...`

They settled on the `1.4 -` variant for a 3.5:1 spread. Balance-by-ratio, not
by feel.

### Leaks
```lua
oilLoss = max(0, 0.7 - avgEngineCond) * 0.002 * sv.OilLeakRate   -- leaks below 70%
if not oilfilter then oilLoss = 0.2 end                          -- gushing
oilLoss = oilLoss + max(0, 25 - oilPanCondition) * 0.005 * sv.OilLeakRate
```
(`:428-435`)

### Head gasket -- cross-system contamination
```lua
headgasketloss = max(0, 0.3 - hgCondition*0.01) * 0.1
oilLoss = oilLoss + headgasketloss
oilpan:addFluid(Fluid.TaintedWater, headgasketloss * 0.5)   -- coolant into oil
radiator:adjustAmount(-headgasketloss)
radiator:addFluid(UsedMotorOil, headgasketloss * 0.5)       -- oil into coolant
```
(`:437-454`)

A blown head gasket physically mixes the two fluid systems in both directions.
You can *diagnose* it by looking at the coolant. That is the single most
immersive mechanic in the mod.

### Oil starvation
```lua
if oilLevel <= oilMax * 0.30 then
    DamageRandomPart(part, {Pistons, CylinderHead, Crankshaft}, oilLevel*50)
end
```
(`:463`) -- the "30% oil" rule from the workshop description, implemented as a
random-chance damage roll on the three most expensive parts.
