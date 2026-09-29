---
id: build-42-the-plan
slug: the-plan
title: · The plan
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
excerpt: Ordered by what unblocks or invalidates the most downstream work.
last_updated: '2026-09-29'
related_articles:
  - the-inventory
  - what-each-source-is-authoritative-for
  - strengths-what-we-genuinely-do-better
  - weaknesses-what-is-genuinely-wrong
  - what-we-missed-the-architectural-one
  - what-we-could-add-the-gap-revised
  - the-one-line-version
---
# · The plan

> Source: 24-synthesis-and-assessment.md (compiled 2026-08-10, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Ordered by what unblocks or invalidates the most downstream work.

### Now -- correctness, before any new feature

1. **Re-signal crash absorption onto `currentFrontEndDurability`**, Engine-
   condition delta retained for the hood-destroyed case. The current mechanic is
   confirmed non-functional against real collisions.
2. **Give the mirror a heartbeat.** A periodic line stating that it ran, what it
   compared, and that it found nothing. A null result must be reported, not
   inferred from silence.
3. **Rebuild the probe so it does not produce the stimulus it measures.** Where a
   real stimulus exists, use it; where it does not, say so in the readout.
4. **Add `restoreVehicle`.** Small, and the one that matters if this ever ships
   to a server -- uninstalling currently strands nineteen parts per vehicle.
   (A schema version already exists; see §4.)

### Next -- close the multiplayer gap before writing more code against it

5. **Promote Multiplayer Sync out of v0.2 into a v0.1 concern.** Not the full
   feature -- the *contract*. Decide now, and write down, which side owns each
   piece of state, which events fire on a dedicated server, and the transmit set
   after a part mutation (EVS's five calls). Every action written before this
   decision will be written twice.
6. **Stand up a dedicated-server test.** Three of our mods are blocked on exactly
   this and have been for weeks. It is now the single highest-value unblocking
   task in the family.

### Then -- the product

7. **Actions: install / uninstall / repair**, using the community idiom
   (`notAvailable` + full requirement tooltip + `ghs`/`bhs`), `OnMechanicActionDone`
   for MP completion, and the reconstructed vanilla XP key for anti-grind. This
   is what turns nineteen inert items into a mod.
8. **The muffler experiment.** One real part slot, `EngineLoudness` on the item,
   and confirm in game that a worn muffler measurably increases zombie
   attraction. If it works, the hybrid architecture is proved and brakes and
   suspension follow the same shape. If it does not, we have lost a day and
   learned something load-bearing.
9. **Then simulation** -- fluids first, because oil-as-transmutation is the
   mechanic everything else hangs off, and head-gasket cross-contamination is
   eight lines for the best diagnostic in the genre.

### Revise

10. **Reopen the OutcastMotorsUI handoff** for virtual-row injection (`23-` §2).
11. **Narrow the Java overlay scope** to gear control and tire pressure; engine
    force is reachable from Lua, with the per-script caveat.
