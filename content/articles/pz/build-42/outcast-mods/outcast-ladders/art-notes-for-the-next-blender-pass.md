---
id: build-42-art-notes-for-the-next-blender-pass
slug: art-notes-for-the-next-blender-pass
title: Art notes for the next Blender pass
game: pz
version: build-42
section: outcast-mods
category: outcast-ladders
difficulty: advanced
tags:
  - outcast-ladders
  - animation
  - clips
excerpt: >-
  Everything here is a .blend problem, not a code one. Recorded from playtesting
  so the next authoring session has a list rather than a memory. The source is
  PZ_3D_Assets\anims_X\Bob\.
last_updated: '2026-09-29'
related_articles:
  - how-it-is-selected
  - the-clip
  - the-top-out-clip
  - changing-the-clip-needs-a-full-restart
  - the-export-was-the-format-and-only-the-format
  - the-dismount-trigger-confirmed-clip-pending
  - untuned-and-how-to-tune-it
  - naming
---
# Art notes for the next Blender pass

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

<a id="art-backlog"></a>

Everything here is a **`.blend` problem**, not a code one. Recorded from
playtesting so the next authoring session has a list rather than a memory.
The source is `PZ_3D_Assets\anims_X\Bob\`.

The climb and the top-out were judged **good enough to ship** on 2026-08-04.
These are polish, in rough order of how much they hurt:

| clip | note |
|------|------|
| `Bob_NF_LadderClimb` | **The arm reads badly.** Most visible mid-cycle, reaching for the next rung. Not yet opened — `ladder_climb.blend`, and note there is already a `_PRE_KNEEFIX` backup beside it, so the legs have had one pass. |
| `Bob_NF_LadderTopOut` | **Knees bent and spread** — and [the source file says why](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation). It is not a leg problem: the middle of the clip is a belly-over-the-parapet haul with the pelvis 0.07 above the deck, played in game at standing height. No amount of leg tweaking fixes a pose that only makes sense from below. |
| both | The hips now land on the idle pose because [the root was detrended](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation). That was a **numeric** fix on the export. Folding the same correction into the `.blend` would make `rebase-root-motion.py` a no-op safety net instead of a required build step. |

Both `.blend` files are rigged the same way: **35 bones, fully baked FK, no
constraints.** There are no controls, so any change is a re-pose or a re-bake.
The `IK_LF`/`IK_LH`/`IK_RF`/`IK_RH` empties are staging guides left in the
scene, not a control rig.

### What the source file actually shows

<a id="topout-source"></a>

Opened `PZ_3D_Assets\anims_X\Bob\ladder_topout\blend\ladder_topout.blend` and
measured it. 65 frames at 30fps, one action, **35 bones baked FK** — the `IK_*`
empties in the scene are staging guides, not live constraints, so there are no
controls to tweak. Every value below is world space with the deck at z = 0.980
and the rungs 0.1725 apart.

| frames | what happens |
|--------|--------------|
| 0–20 | climbing the last four rungs. Feet 0.222/0.050 -> 0.401/0.228, hands reach the lip at 0.930 |
| 20–28 | hands and feet planted, pelvis creeping up. The set-up beat |
| 30–44 | **the haul.** Pelvis 0.679 -> 1.048, feet dragged up the wall |
| 46–54 | right foot lands on the deck. Left leg still hanging at 0.68 |
| 56–64 | left foot up, hands release, stand |

And the number that settles it — how far the **pelvis** is above the deck:

```
f44  +0.068     f50  +0.091     f56  +0.100     f64  +0.385
```

Standing, the pelvis sits about **0.505** above the feet. So for the middle
third of this clip the character is **lying on the roof**, chest down, one knee
up, the other leg hanging over the edge. It is a belly-over-the-parapet haul,
and against the ledge it was authored for it reads perfectly well.

**The game plays that pose with the character already standing at deck height.**
A haul-over drawn at the height it was hauling *to* is a sprawl — which is
exactly the "knees bent and spread, looks really strange" from playtesting. The
knees are not the fault. The whole middle of the clip is a pose that only makes
sense from below.

It also cannot be salvaged by trimming. The feet do not reach the top rung until
frame 46, by which point the body is already draped over the ledge — there is no
slice of this clip that begins with the character upright at deck height.

### The dismount clip that should exist

<a id="dismount-brief"></a>

`Bob_NF_LadderTopOut` is a **full ledge climb** — hands on the lip, body hanging
below, haul up. That is a fine animation and it is the wrong one for this job,
because by the time it plays the engine has already carried the character the
whole level. Its 0.93 of root rise was a storey of double-count, and detrending
it away left the limbs performing a haul with nothing to haul against.

The clip that fits, if it gets authored:

| | |
|---|---|
| **duration** | 0.7–1.0s, not 2.2s. It is a step, not a climb. |
| **root start** | `(0.000, 0.035, 0.420)` — the pose `Bob_NF_LadderClimb` holds, so the handover is invisible |
| **root end** | `(0.003, -0.012, 0.505)` — the idle pose, so the blend out is invisible |
| **root in between** | small and monotonic. Anything larger is a lift the engine has already done. |
| **the motion** | trailing foot up onto the deck, weight transfer forward, straighten. The drama is in the limbs and the timing, not in root travel. |
| **`Translation_Data`** | leave at zero. The forward travel is [driven from Lua](/pz/build-42/outcast-mods/outcast-ladders/outcast-ladders-animation) against the clip clock, and deferred motion would fight it. |

Reversed, the same clip is the descent: stand, turn, lower onto the rungs. Which
is why it wants to read cleanly played backwards — worth scrubbing it both ways
in Blender before exporting.

If that clip exists, `m_SpeedScale` can come up, `TOPOUT_MOVE_FROM_PC` /
`_TO_PC` can tighten around it, and the whole transition stops being a
compromise.
