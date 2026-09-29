---
id: build-42-what-we-could-add-the-gap-revised
slug: what-we-could-add-the-gap-revised
title: '· What we could add -- the gap, revised'
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
excerpt: >-
  The takeaways doc named the gap as "everything that isn't the engine", and
  that still holds. What has changed is that three of those are now much cheaper
  than we thought, because vanilla models...
last_updated: '2026-09-29'
related_articles:
  - the-inventory
  - what-each-source-is-authoritative-for
  - strengths-what-we-genuinely-do-better
  - weaknesses-what-is-genuinely-wrong
  - what-we-missed-the-architectural-one
  - the-plan
  - the-one-line-version
---
# · What we could add -- the gap, revised

> Source: 24-synthesis-and-assessment.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The takeaways doc named the gap as "everything that isn't the engine", and that
still holds. What has changed is that three of those are now much cheaper than we
thought, because vanilla models them already and `updatePartStats` will do the
work:

- **Exhaust / muffler.** `EngineLoudness` on the item, condition-scaled, doubled
  when missing. Loudness attracts zombies. This is the highest
  consequence-per-line mechanic available to us and it is nearly free.
- **Brakes.** `BrakeForce` on the item, condition-scaled, plus an installer-skill
  bonus. PSC has the booster and no brake system.
- **Suspension.** `SuspensionCompression` / `SuspensionDamping`, same pipeline.
  PSC's spawn code explicitly avoids suspension because removing it makes cars
  fly -- a problem that does not arise if we scale rather than remove.

Still genuinely unclaimed and genuinely expensive: fuel delivery, steering rack,
differential.

Three smaller additions worth carrying:

- **`getEngineQuality()` is an untouched second axis.** Separate from Engine part
  condition, clamped 0-100, serialised, and it already feeds a chance roll at
  `:8493`. Rebuild raises quality; wear lowers condition. Our mirror writes only
  condition. STA_EngineRebuild uses quality as its whole design.
- **`getVehicleZoneAt(x, y, z)`** returns a live mutable zone. Part quality can
  vary by region without touching distributions -- a part economy with geography.
- **Virtual-row injection** (`23-` §2) means any of the above can appear in
  vanilla's own mechanics window for four hooks, instead of a bespoke panel.
