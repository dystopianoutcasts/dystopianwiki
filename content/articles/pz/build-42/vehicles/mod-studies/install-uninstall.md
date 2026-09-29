---
id: build-42-install-uninstall
slug: install-uninstall
title: Install / uninstall
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
excerpt: 'shared/ISInstallEnginePart.lua:'
last_updated: '2026-09-29'
related_articles:
  - thermal-model
  - oil-model
  - electrical-model-an-actual-amp-budget
  - horsepower-and-fuel
  - cabin-climate-windchill
  - repair-system-procedural-failure-modes
  - world-generation-the-part-economy
  - sandbox-surface
---
# Install / uninstall

> Source: 02-simulation-model.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`shared/ISInstallEnginePart.lua`:
```lua
time = 300 * levelRequired / max(0.7, playerMechanicsLevel)   -- min 200 ticks
failure = same 80->20 curve as repair, on Perks.Mechanics
```
On a failed install: `setCondition(cond - ZombRand(failure))` and a metal-snap
sound -- you damage the part putting it in. XP award is
`mechanicSkill * 0.05 * partCondition`, so installing a good hard part teaches
more than jamming in a junk one.

Per-slot skill requirements (`client/Engine_Menu.lua:229-455`):

| Skill | Parts |
|-------|-------|
| 0 | All fluids (oil, coolant, ATF, power steering) |
| 1 | Oil filter |
| 2 | Sparkplugs, Radiator, Fan belt |
| 3 | Oil pan, Brake booster |
| 4 | Starter, Alternator, Water pump, Power steering pump, A/C, Heater core |
| 5 | Flywheel, Transmission, Torque converter |
| 7 | Cylinder head, Head gasket, Pistons, Crankshaft |

The gradient is the progression curve. Mechanics 0 can change fluids; Mechanics 7
can rebuild the bottom end.
