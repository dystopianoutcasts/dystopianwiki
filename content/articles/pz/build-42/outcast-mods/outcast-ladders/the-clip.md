---
id: build-42-the-clip
slug: the-clip
title: The clip
game: pz
version: build-42
section: outcast-mods
category: outcast-ladders
difficulty: advanced
tags:
  - outcast-ladders
  - animation
  - clips
excerpt: 'In-place treadmill, 31 frames, looping.'
last_updated: '2026-09-29'
related_articles:
  - how-it-is-selected
  - the-top-out-clip
  - changing-the-clip-needs-a-full-restart
  - the-export-was-the-format-and-only-the-format
  - the-dismount-trigger-confirmed-clip-pending
  - art-notes-for-the-next-blender-pass
  - untuned-and-how-to-tune-it
  - naming
---
# The clip

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

In-place **treadmill**, 31 frames, looping.

`Bob_ClimbRope` carries zero **net** root motion, so the engine supplies the
vertical travel and the clip is a pure cycle. Ours is authored the same way:
contacts slide downward in local space at the engine's climb rate so they read as
locked to the rungs.

> **Correction, 2026-08-02.** This section previously said vanilla "animates no
> root translation at all", and that was read from "every F-curve nets to
> 0.00000". Nets to zero is not the same as unkeyed, and the difference mattered
> for a full debugging round. Measured directly out of
> `media/anims_X/Bob/Bob_ClimbRope.X`:
>
> ```
> Bip01            R  31 keys
> Bip01            T  31 keys   axis2 0.441675 .. 0.530683   net +0.000000
> Translation_Data T   2 keys   constant (0, 0, 0)
> ```
>
> Vanilla keys `Bip01` translation on **every frame**, carrying an 0.089 BU hip
> bob, with hip height on the same axis ours uses. Our clip's 0.0566 BU bob over
> `z = 0.3717 .. 0.4283` is the same construction with a slightly lower hip.
> **Keying `Bip01.location` is normal and correct.** See below for what this
> costs the earlier diagnosis.

**Gait:** P5 four-beat diagonal, `RF -> LH -> LF -> RH`, two rungs per cycle,
contact 60% / flight 40%, never fewer than three points of contact.

Full derivation, the verification gates it passed, and the rig traps that shaped
it are in the library `NOTES.md`. Two worth knowing even if you never open
Blender:

- **Bob faces +Y.** Do not re-derive this — the toe bones and a naive mesh-extent
  test both give the wrong answer. The first version of this clip was authored
  backwards for exactly that reason, and passed every internal-consistency check
  while being wrong.
- **The rig is Character Studio stubs.** Blender IK does not work on it; the clip
  uses an analytic two-bone solver.
