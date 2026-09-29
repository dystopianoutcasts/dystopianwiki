---
id: build-42-sandbox-surface
slug: sandbox-surface
title: Sandbox surface
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
excerpt: '56 options across 2 pages. The tuning knobs that matter:'
last_updated: '2026-09-29'
related_articles:
  - thermal-model
  - oil-model
  - electrical-model-an-actual-amp-budget
  - horsepower-and-fuel
  - cabin-climate-windchill
  - repair-system-procedural-failure-modes
  - install-uninstall
  - world-generation-the-part-economy
---
# Sandbox surface

> Source: 02-simulation-model.md (compiled 2026-08-05, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

56 options across 2 pages. The tuning knobs that matter:

| Option | Default | Effect |
|--------|---------|--------|
| `PerformancePartBoost` | 0.5 | How much top-tier parts add HP |
| `MinHP` / `MaxHP` | 0 / 1 | HP multiplier at worst/best condition |
| `EngineImpactDamage` / `Count` | 1 / 4 | Crash damage magnitude / spread |
| `OilDecayRate` / `OilLeakRate` / `OilFilterDecayRate` | 1 / 1 / 1 | Maintenance tempo |
| `ChargeRate` | 1 | Alternator charge speed |
| `BatteryChargedChance` / `Bias` / `GoodChance` | 0.8 / 2 / 0.5 | Dead-battery frequency |
| `PartChanceHighCondChance` | 1 | Lower it for "everything good has been looted" |
| `SmartOilIndicator` | true | Oil light responds to *quality*, not just level |
| `RepairParts` | true | Turn off if another mod owns part repair |
