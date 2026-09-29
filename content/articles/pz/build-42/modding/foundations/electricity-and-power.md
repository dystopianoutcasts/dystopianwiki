---
id: build-42-electricity-and-power
slug: electricity-and-power
title: Electricity and Power
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
  There is no player-built wire-by-wire circuit network in vanilla. The core
  model is the generator power bubble, plus the pre-existing world grid that
  goes down after the in-game power shutoff.
last_updated: '2026-09-29'
related_articles:
  - orientation
  - combat-and-animation
  - misc-catch-all-systems
  - practical-b42-readiness-checklist
  - addendum-electricity-generator-power-model
---
# Electricity and Power

> Source: 07_VEHICLES_POWER_COMBAT_MISC.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

There is no player-built wire-by-wire circuit network in vanilla. The core model is the
**generator power bubble**, plus the pre-existing world grid that goes down after the
in-game power shutoff.

### 3.1 The generator power-bubble model

**CONFIRMED** -- A generator must be placed on the ground, connected, fueled (fuel > 0),
in good condition (condition > 0), and switched on to supply power within its radius.
You connect the generator **once** to toggle a "power bubble" -- you do NOT wire each
lamp or appliance individually. Everything electrical inside the bubble is powered.

**CONFIRMED** -- Default power bubble: **20 tiles horizontally and 3 floors up/down**
(one source phrases it as "20 tiles on all four axes and three floors up and down").

**CONFIRMED** -- Skill/knowledge gate to connect a generator: Electrical level 3, OR
read the "How to Use Generators" magazine, OR an occupation that grants it
(Electrician/Engineer). Reaching Electrical 3 auto-learns it.

**LIKELY** -- Placing a generator inside an existing (map-authored) structure reduces
its noise radius (e.g. 20 -> 15 tiles); player-built structures give no noise reduction.
Noise matters because generators attract zombies.

### 3.2 Generator types and stats

**LIKELY (42.19 data; 42.20 may retune)** -- Four generator models, worst -> best:

| Model         | Weight | Wear rate        | Noise radius |
|---------------|--------|------------------|--------------|
| Valutech      | 30     | very fast wear   | ~23 tiles    |
| Old           | 40     | slightly < Valu. | ~25 tiles    |
| Electromax    | 40     | noticeably slower| ~20 tiles    |
| Premium Tech  | 40     | slowest wear     | ~20 tiles    |

Note: sources agree all generators weigh 40 EXCEPT the lighter one (30) -- the "blue"/
Valutech unit. Exact model names and noise figures should be reconfirmed on 42.20.

### 3.3 Fuel, load, and condition

**CONFIRMED / LIKELY** -- Base draw with no load is on the order of ~20 ml/hour
(sources also cite an Apocalypse baseline near 0.1 fuel/hr scaled by device count --
figures vary by sandbox preset, so treat exact numbers as preset-dependent). Each
connected device adds proportional draw. Example composite load cited by a community
lab: popsicle fridge 0.016 L/h + TV 0.003 L/h + 6 lamps 0.0012 L/h + base 0.002 L/h ~=
0.0222 L/h total.

**CONFIRMED** -- Open "Generator Information" (right-click the running generator) to see
fuel %, condition, the list of powered objects, base gas draw, and total consumption.

**CONFIRMED** -- Condition degrades while running (rate depends on the model's wear
chance). If condition drops below ~20% the generator can catch fire or explode, and
running one in an enclosed space risks catastrophic failure (and, per the fuel/exhaust
model, danger to the player).

### 3.4 Appliances and the grid

**CONFIRMED** -- Electricity is a fuel type powering appliances: refrigerators, ovens,
washing machines, clothes dryers, televisions, and lights. Before the world's power
shutoff these run off the grid; after shutoff they only work inside a generator bubble.

**LIKELY** -- B42's deep crafting tech tree ends in "advanced electrical machines,"
implying electricity also gates high-tier crafting stations, not just comfort
appliances. Confirm which stations require power on 42.20.

### 3.5 Moddability

**UNCERTAIN** -- No clear public documentation surfaced for a Lua API to define custom
power sources or a custom wiring/circuit graph. The practical, LIKELY-supported path
for a mod is:
- Add new appliance items that participate in the existing generator-bubble system
  (the item is "electrical" and consumes when inside a powered bubble).
- Add new generator variants as `vehicle`/item-style scripts mirroring vanilla
  generator definitions.
- Use Lua hooks on `IsoGenerator`-style objects for behavior (community mods such as
  "Generator Powered Buildings" demonstrate Lua-level control over what a generator
  powers), but a true custom power-grid simulation is not a documented vanilla feature.

Flagged as a **gap** below -- the exact class/API names (IsoGenerator methods, appliance
power flags) were not confirmable through accessible sources and must be read from the
decompiled B42 Java or LuaDocs.
