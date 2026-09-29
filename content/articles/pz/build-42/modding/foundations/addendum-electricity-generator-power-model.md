---
id: build-42-addendum-electricity-generator-power-model
slug: addendum-electricity-generator-power-model
title: 'ADDENDUM: Electricity / generator power model'
game: pz
version: build-42
section: modding
category: foundations
difficulty: intermediate
tags:
  - electricity
  - combat
  - animation
  - power
  - misc-systems
excerpt: >-
  Enriched from pzwiki cache (canonical). Sources: pzwiki.net/wiki/Generator
  (page-version 42.13.1, revid 1441065) and pzwiki.net/wiki/Electricity. Cached
  at...
last_updated: '2026-09-29'
related_articles:
  - orientation
  - electricity-and-power
  - combat-and-animation
  - misc-catch-all-systems
  - practical-b42-readiness-checklist
---
# ADDENDUM: Electricity / generator power model (pzwiki cache, CONFIRMED)

> Source: 07_VEHICLES_POWER_COMBAT_MISC.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Enriched from pzwiki cache (canonical). Sources: pzwiki.net/wiki/Generator (page-version 42.13.1, revid 1441065) and pzwiki.net/wiki/Electricity. Cached at `_raw_pzwiki_sources/07_vehicles_power_combat/Generator.wiki.txt` + `Electricity.wiki.txt`. This confirms and quantifies the "power bubble" model.

### The power model [CONFIRMED]
- A generator powers a **cylinder**: radius **20 tiles** on the x-y plane, reaching **3 floors above and 3 below** (height 7, base diameter 41), centered on the generator.
- Generators run on **gasoline** (fluid). Tank holds ~1 gas can (~10 L); fillable only while off; no siphon-out.
- Must be **placed on the ground, connected, fueled, and turned on**. Carried (not inventoried) -> encumbers the player (40, or 30 for ValuTech).
- **Connecting to a building's power** requires electrical level 3, OR the electrician/engineer occupation, OR having read the "How to Use Generators" magazine. This is the gate a power mod must respect.
- **Exhaust indoors damages health fast** (down to 1) -- interior placement is a design hazard.
- Sandbox option **"Generator Working In Exterior"** allows hooking generators to arbitrary world buildings (e.g. gas-station pumps).

### Fuel/load [CONFIRMED]
- Baseline consumption with no load: **0.002 L/h**. Powered devices within the radius add load.
- Per-device usage (L/h): Fridge or freezer 0.008; Fridge+freezer 0.013; Stove 0.009; Lights 0.0002; Television 0.003; Washer/dryer 0.009; Gas pump 0.003.
- Runtime = fuel remaining / total demand (in-game hours). "Generator Info" context menu shows total load.
- 4 variants (Lectro-Max/Premium/ValuTech/Old) differ in durability (36/30/25/24), sound, and audible range (20-25 tiles -> attracts zombies). Below ~20% condition, chance to catch fire/explode. Repaired with Electronics Scrap (4% + 0.5*electrical level per use).

### Modding implication
There is **no vanilla circuit-graph/wiring API** -- power is this generator-cylinder model plus the house electrical grid it connects to. A custom electricity/appliance mod hooks the generator + appliance-load model (and the electrical-skill/magazine gate above), not a node graph. Exact IsoGenerator Lua method names remain a [gap] -- read from vanilla scripts / unofficial B42 JavaDocs.
