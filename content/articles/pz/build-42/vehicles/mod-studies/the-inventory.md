---
id: build-42-the-inventory
slug: the-inventory
title: · The inventory
game: pz
version: build-42
section: vehicles
category: mod-studies
difficulty: advanced
tags:
  - vehicles
  - outcast-motors
  - assessment
  - roadmap
excerpt: 'Shipped and working, verified in game:'
last_updated: '2026-09-29'
related_articles:
  - what-each-source-is-authoritative-for
  - strengths-what-we-genuinely-do-better
  - weaknesses-what-is-genuinely-wrong
  - what-we-missed-the-architectural-one
  - what-we-could-add-the-gap-revised
  - the-plan
  - the-one-line-version
---
# · The inventory

> Source: 24-synthesis-and-assessment.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Shipped and working, verified in game:**

| Thing | Evidence |
|---|---|
| Hook chaining onto `Vehicles.Update.*` | measured, 116 calls across 4 parts |
| Engine part as a 100-capacity container | `engine bay container present` |
| 19 parts as real B42 items, persisted across save/load | Milestone B |
| Condition mirror, `min()` across 5 critical parts | `mirror wants 100 ... AGREE` |
| Populate guard (never mirror an empty bay) | designed, exercised |
| Three-mod cooperation via `OutcastLib.VehicleParts` | registration + both hooks |
| UI interception, our panel standing down for the UI mod | Milestone C |
| Animated hoods on 121 of 150 vanilla vehicles | OutcastMotorsAnimated |

**Shipped tooling:** 282 unit checks across 10 suites (green), 7 validator checks
(each proved by deliberate breakage), a content generator with `--check` drift
detection, an FBX node-scale prober, an icon renderer.

**Not built:** every simulation feature. Fluids, thermal, electrical, engine
output, assembly order, chassis systems. Also actions -- install, uninstall and
repair do not exist; the numpad probe is the only way to move a part.

That is the honest shape of it. **We have built a spine and no organs.** Project
Summer Car is ~9,000 lines that are almost entirely simulation riding a thin
spine. We are the mirror image.
