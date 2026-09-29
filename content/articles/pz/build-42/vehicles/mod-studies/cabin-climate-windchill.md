---
id: build-42-cabin-climate-windchill
slug: cabin-climate-windchill
title: Cabin climate -- windchill
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
  Vehicles.Update.PassengerCompartment (:857) counts every part with a window,
  counts how many are open or destroyed, then:
last_updated: '2026-09-29'
related_articles:
  - thermal-model
  - oil-model
  - electrical-model-an-actual-amp-budget
  - horsepower-and-fuel
  - repair-system-procedural-failure-modes
  - install-uninstall
  - world-generation-the-part-economy
  - sandbox-surface
---
# Cabin climate -- windchill

> Source: 02-simulation-model.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`Vehicles.Update.PassengerCompartment` (`:857`) counts every part with a window,
counts how many are open or destroyed, then:

```lua
speedFactor = (abs(speedKmH) + 10) / 100
windchill   = speedFactor * 10
pcData.windowtemperature = -windchill * math.min(3, windowOpen)
```

Up to 3 open windows matter; more is no worse. With all windows shut and no
heater, cabin temperature drifts up +0.5 C/min to a +5 C body-heat offset.

The heater core and A/C both hang off engine state:
- **Heater core**: only works once the block passes 50 C, 1x output at 100 C,
  nearly 2x at overheat. Effectiveness scales below 50% part condition.
- **A/C**: scales below 50% condition, and *also* below 33% fan belt condition.

There is a broken bit worth knowing: rain through a smashed windshield is
commented out with `--TODO: FIXME!!!!` (`:888`).
