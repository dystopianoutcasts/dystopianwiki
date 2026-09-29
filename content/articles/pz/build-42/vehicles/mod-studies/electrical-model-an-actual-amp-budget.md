---
id: build-42-electrical-model-an-actual-amp-budget
slug: electrical-model-an-actual-amp-budget
title: Electrical model -- an actual amp budget
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
excerpt: PSC replaces vanilla's abstract battery drain with amp-minute accounting.
last_updated: '2026-09-29'
related_articles:
  - thermal-model
  - oil-model
  - horsepower-and-fuel
  - cabin-climate-windchill
  - repair-system-procedural-failure-modes
  - install-uninstall
  - world-generation-the-part-economy
  - sandbox-surface
---
# Electrical model -- an actual amp budget

> Source: 02-simulation-model.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

PSC replaces vanilla's abstract battery drain with amp-minute accounting.

```lua
-- draws, accumulated by consumers via VehicleUtils.chargeBattery()
headlights   -0.000025/min   -- "10A"
lightbar     -0.000025/min   -- 5A
siren        -0.000025/min   -- 5A
heater/AC    -0.000035/min   -- blower fan
engine running          +10A constant load
```

```lua
local ampScaler = 200000
batteryLoad = modData.batteryDraw * ampScaler

fanBelt    = min(1, fanBeltCond * 0.03)     -- degrades below 33%
alternator = min(1, alternatorCond * 0.02)  -- degrades below 50%

alternatorAmps = alternator * fanBelt
                 * min(1, engineSpeed/2000)      -- ~60A at idle, 120A max
                 * 120 * elapsedMinutes

systemSum = alternatorAmps - batteryLoad
ampMinuteScaler = 60 * 100                   -- 100 Ah battery
```
(`:568-631`)

Charging is non-linear -- `chargeSpeed = (1.2 - charge) * 50`, i.e. 10-60 A
tapering as the battery fills, giving a 3-6 hour full charge. That's a real
lead-acid charge curve.

The consequence the workshop page calls out -- *"if the battery light turns red
while running, your alternator is not charging enough"* -- falls straight out of
this: a worn alternator or belt produces less than the 10 A running load and the
battery drains **while the engine is on**.

Battery spawn is also its own distribution (`Vehicles.Create.Battery`, `:487`):
`BatteryChargedChance` (0.8) gates whether it's charged at all, `BatteryGoodChance`
(0.5) decides whether a dead one is also 0-condition, and `BatteryChargedBias` (2)
skews the charge via `1 - rand^bias`.
