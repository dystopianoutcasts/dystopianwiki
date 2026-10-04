---
id: build-42-strengths-what-we-genuinely-do-better
slug: strengths-what-we-genuinely-do-better
title: · Strengths -- what we genuinely do better
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
excerpt: Not flattery; these are things no other mod in the survey has.
last_updated: '2026-10-04'
related_articles:
  - the-inventory
  - what-each-source-is-authoritative-for
  - weaknesses-what-is-genuinely-wrong
  - what-we-missed-the-architectural-one
  - what-we-could-add-the-gap-revised
  - the-plan
  - the-one-line-version
---
# · Strengths -- what we genuinely do better

> Source: 24-synthesis-and-assessment.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Not flattery; these are things no other mod in the survey has.

**A mechanical guard culture.** Seven validator checks, each proved by breaking
it on purpose. A generator with drift detection so `GENERATED -- do not hand-edit`
is a fact rather than an aspiration. A vendored-file hash so a shared parser
cannot silently diverge between two mods. Nothing in the fourteen has anything
comparable; several ship hand-maintained tables with no consistency check at all.

**Decompile-grounded facts.** We know `getNearVehicle` filters on render
visibility, that `IsoCell.getVehicles()` is a Set that vanilla itself indexes
wrongly, that wear is a dice roll with a computable expectation, that
`setAngles` no-ops under one degree. The community works from observed behaviour
and folklore. When our two sources disagreed this week, we were right.

**Hook chaining.** A census across all fourteen mods found 600 `getModData` calls
and **zero** uses of `Vehicles.Update.*` chaining. Everyone else polls on
`OnPlayerUpdate`. Chaining is cheaper, runs on the server where the state lives,
and composes with other mods instead of racing them. This is a real technical
lead.

**Dependency inversion done properly.** `OutcastLib.VehicleParts` lets three mods
cooperate with none requiring another. Gores and BVD both ship registry APIs, but
Gores gates every file behind an obfuscated licence check and BVD's registry is
one-directional. Ours is the cleanest of the three.

**Restraint about what we own.** We derive the vanilla number rather than
replacing it, so a car with Outcast Motors installed still reads correctly to
every other mod. PSC established this and we kept it; several community mods did
not.

*Re-checked 2026-10-04 for Build 42.21: `IsoCell.getVehicles()` still returns a `Set`, so the claims here still hold.*
