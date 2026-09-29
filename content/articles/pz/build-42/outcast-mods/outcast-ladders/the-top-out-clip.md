---
id: build-42-the-top-out-clip
slug: the-top-out-clip
title: The top-out clip
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
  Bob_NF_LadderTopOut.X, 455,000 bytes, sha256 5303f3c2…, 65 frames, one-shot.
  Source: PZ_3D_Assets\anims_X\Bob\ladder_topout\. Same export recipe as the
  climb, frame range 0–64.
last_updated: '2026-09-29'
related_articles:
  - how-it-is-selected
  - the-clip
  - changing-the-clip-needs-a-full-restart
  - the-export-was-the-format-and-only-the-format
  - the-dismount-trigger-confirmed-clip-pending
  - art-notes-for-the-next-blender-pass
  - untuned-and-how-to-tune-it
  - naming
---
# The top-out clip

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

<a id="topout"></a>

`Bob_NF_LadderTopOut.X`, 455,000 bytes, sha256 `5303f3c2…`, 65 frames, one-shot.
Source: `PZ_3D_Assets\anims_X\Bob\ladder_topout\`. Same export recipe as the climb,
frame range 0–64.

**It ships, but nothing plays it yet.** There is no AnimSet node — see "the trigger"
below. The clip is in the mod so it loads and can be referenced the moment the
trigger exists; it is inert until then.

### Root motion: on `Bip01`, with `Translation_Data` left at zero

The clip travels `(0, +0.3750, +0.9300)` in world space and all of it is on `Bip01`.
That is deliberate, and it is *not* the final answer.

Vanilla's travelling one-shots split the two channels, and the split is not
proportional:

```
Bob_ClimbFence_Start    Bip01 net (+0.049, -0.174, +0.596)   Translation_Data net (0, 0, -0.295)
Bob_ClimbFence_Loop     Bip01 net ( 0,      0,      0     )   Translation_Data net (0, 0,  0    )
Bob_ClimbFence_Success  Bip01 net (-0.049, +0.174, -0.596)   Translation_Data net (0, 0, -0.787)
```

Note Start and Success have exactly opposing `Bip01` nets — over the full sequence
the hips return to the same skeletal offset, and the character's *net world travel*
comes entirely from `Translation_Data` (-0.295 + -0.787 = -1.082, about one tile).
`Bip01` carries the large in-skeleton rise and fall; `Translation_Data` carries the
entity displacement.

So ours will eventually need the same decomposition. It is not done yet because the
correct split depends on **which state plays the clip and whether that state
consumes deferred motion** — and that is unknown until the trigger exists. Shipping
the travel on `Bip01` alone has the safe failure mode: worst case the body rises
without the entity following and `finishClimbing`'s absolute `setZ` corrects it.
Splitting it now, wrongly, risks the displacement applying twice.

Re-deriving it later is a channel edit plus a re-export — no re-posing — using
`Translation_Data.location(f) = Rtd⁻¹ · (worldBip01(f) − worldBip01(0))`, because the
two bones' rest frames are aligned neither to the world nor to each other.

One supporting detail: vanilla declares `<m_deferredBoneAxis>Y</m_deferredBoneAxis>`
on exactly the nodes whose clips carry deferred motion (`start`, `struggle`,
`success`, `fail`) and omits it on `rope.xml`, whose clip `Bob_ClimbWindowGrab` has
`Translation_Data` constant at zero. The field tracks whether the clip actually
travels.

### The trigger does not exist yet

Vanilla's fence climb-over lives in `AnimSets/player/climbwall/` — despite the
folder name — and is driven by `ClimbFenceStarted`, `ClimbFenceOutcome` and
`ClimbFenceStruggle`, with `success.xml` playing `Bob_ClimbFence_Success`.

The working hypothesis is that our top-of-column object (`OCL_Top.lua`) already sets
`HoppableN` / `HoppableW`, which is what `getWallHoppableTo` looks for, so
`calculateClimbOutcome` may already be returning `Fence` and `finishClimbing` may
already be calling `climbOverFence` at the top of every ladder. If that holds, the
node belongs in `climbwall/` conditioned on `OCLClimbSurface == "ladder"`, added
alongside vanilla exactly as the `climbrope` node was, and no new state code is
needed.

**That is a hypothesis, not a finding.** It needs checking against the engine
before anything is written, because a `climbwall/` node with a condition that does
not scope correctly would hijack *all* fence climbing, not just ladders.

### Frames 0–19 were re-baked before export

The action was built in two passes — frames 0–20 kept from an earlier version,
20–64 rebuilt — and `Bip01_Pelvis`, `Bip01_Spine1` and `Bip01_Neck` were left with
rotation keys at frame 0 and then nothing until frame 20. Blender fills that gap
with a bezier ease; the engine fills it linearly. The two disagree by up to
**0.005 BU**, peaking at frame 12 — right in the press phase.

That is small (about 9 mm) but it means the game would not have played what was
reviewed in Blender. All 51 sparse channels were densified to per-frame keys
sampled off the existing curves, so the exported keys now *are* the reviewed
motion and the interpolation model no longer matters. Measured pose change from
densifying: **5e-07 BU**. Backup at `blend/ladder_topout_PRE_DENSIFY.blend`.

Round-trip check after densifying: re-imported the `.X` and compared all 35 bones
across all 65 frames against the authored poses — worst error **1.6e-05 BU**, zero
frames above 1e-4. Before densifying, 19 frames were above it.
