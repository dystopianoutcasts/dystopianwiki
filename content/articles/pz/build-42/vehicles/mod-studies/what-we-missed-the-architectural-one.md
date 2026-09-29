---
id: build-42-what-we-missed-the-architectural-one
slug: what-we-missed-the-architectural-one
title: · What we missed -- the architectural one
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
  BaseVehicle.updatePartStats() (:9065) is vanilla's own condition-to-physics
  pipeline, and we have been building a private reimplementation of it without
  noticing it exists.
last_updated: '2026-09-29'
related_articles:
  - the-inventory
  - what-each-source-is-authoritative-for
  - strengths-what-we-genuinely-do-better
  - weaknesses-what-is-genuinely-wrong
  - what-we-could-add-the-gap-revised
  - the-plan
  - the-one-line-version
---
# · What we missed -- the architectural one

> Source: 24-synthesis-and-assessment.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`BaseVehicle.updatePartStats()` (`:9065`) is **vanilla's own condition-to-physics
pipeline**, and we have been building a private reimplementation of it without
noticing it exists.

```java
for (int i = 0; i < this.getPartCount(); i++) {
   VehiclePart part = this.getPartByIndex(i);
   if (part.getInventoryItem() != null) {
      if (part.getInventoryItem().getBrakeForce() > 0.0F) {
         float newBrakeForce = VehiclePart.getNumberByCondition(
            part.getInventoryItem().getBrakeForce(),
            part.getInventoryItem().getCondition(), 5.0F);
         newBrakeForce += newBrakeForce / 50.0F * part.getMechanicSkillInstaller();
         ...
```

It walks every part slot, reads the **installed item's** fields --
`BrakeForce`, `WheelFriction`, `SuspensionCompression`, `SuspensionDamping`,
`EngineLoudness`, `Durability` -- scales each by that item's condition through
`getNumberByCondition`, and writes the result onto the vehicle. It even adds a
bonus derived from `getMechanicSkillInstaller()`: **vanilla already records who
installed a part and at what skill, and already rewards good work.**

`getNumberByCondition` (`VehiclePart.java:342`) is generous by design:

```java
cond += 20.0F * (100.0F - cond) / 100.0F;
return Math.round(Math.max(min, number * cond / 100.0F) * 100.0F) / 100.0F;
```

A part at 0% still yields 20% of its rating, floored at a per-stat minimum.

**Why this matters to us.** Our nineteen parts live *inside a container* on the
Engine part. `updatePartStats` reads `part.getInventoryItem()` -- the single item
occupying a slot -- and never looks inside containers. **Our parts are invisible
to vanilla's physics entirely.** That is precisely why we need a mirror at all.

So the real architectural choice, which we made implicitly by following PSC and
have never revisited:

| | Container of items (PSC, us) | Item in a part slot (vanilla) |
|---|---|---|
| Granularity | unlimited -- 19 parts, or 50 | one item per declared slot |
| Physics | **none automatic**; everything hand-mirrored | automatic, condition-scaled, free |
| Installer skill reward | must build it | already there |
| Conflict surface | none -- container is additive | `template vehicle` override, winner-take-all |
| Applies to modded cars | yes, via the template | yes, via the template |

**Hybrid recommendation SUPERSEDED, 2026-08-10.** Building it turned up a better
door, and the original advice would have been a lot of work for a worse result.

`BaseVehicle.setEngineFeature(quality, loudness, power)` is **public** (`:8071`)
and reachable from Lua. `getVehicleEngine()` is private, so that one method is
the entire API -- but it is enough, because `power` is not cosmetic
(`CarController.java:639`):

```java
this.engineForce = (float)(this.vehicleObject.getEnginePower()
                           * (0.5 + this.vehicleObject.getEngineSpeed() / 24000.0));
```

**Per vehicle instance, from pure Lua.** So the engine a player assembles can
decide how that individual car accelerates, with no part slots, no template
override, and no winner-take-all conflict surface. `quality` additionally drives
the engine sound and hotwire difficulty. Shipped in `OMO_Output`.

Two traps found on the way, both silent:

- **`setFeatures` stores `(int)(loudness * 0.37037036F)` while `setLoudness` --
  which `updatePartStats` calls -- stores it raw.** Reading loudness and passing
  it back shrinks it 63% per write. It would present as "zombies stopped
  noticing my car", which nobody would trace to an engine mod.
- **Loudness is genuinely the muffler's**, and vanilla's muffler mechanic works
  (`engineLoudness *= 1.0F + (100.0F - part.getEngineLoudness()) / 100.0F`, and
  a missing muffler doubles it at `:9122`). We preserve it rather than take it.

The part-slot route stays available and is still the right answer for **brakes,
suspension and tyres**, where `updatePartStats` is the only pipeline and there is
no `setBrakeForce` equivalent. It is simply not needed for the engine.

**Second thing we missed, smaller but it changes a commitment:** BetterVehicle-
Dynamics rewrites engine output in pure Lua --

```lua
v:Load(v:getName(), string.format("{ engineForce = %d, mass = %d }", force, mass))
```

`VehicleScript:Load` merges into an already-loaded script. The epic assumed
engine output needed the Java overlay. It does not. **Caveat, and it is a real
one:** this operates on the *script*, so it is per vehicle model, not per
individual car. A rebuilt engine cannot out-perform a wreck of the same model
through this lever. Per-instance output remains unsolved -- but the overlay's
justification just narrowed to gear control and tire pressure alone.
