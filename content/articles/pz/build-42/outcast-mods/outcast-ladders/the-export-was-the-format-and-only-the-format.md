---
id: build-42-the-export-was-the-format-and-only-the-format
slug: the-export-was-the-format-and-only-the-format
title: 'The export was the format, and only the format'
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
  Symptom, now believed fixed but NOT yet retested in game: the character
  dropped to ground level and climbed from there. Selection was correct and limb
  motion was right; only placement was wrong.
last_updated: '2026-09-29'
related_articles:
  - how-it-is-selected
  - the-clip
  - the-top-out-clip
  - changing-the-clip-needs-a-full-restart
  - the-dismount-trigger-confirmed-clip-pending
  - art-notes-for-the-next-blender-pass
  - untuned-and-how-to-tune-it
  - naming
---
# The export was the format, and only the format

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

<a id="collapse"></a>

**Symptom, now believed fixed but NOT yet retested in game:** the character
dropped to ground level and climbed from there. Selection was correct and limb
motion was right; only placement was wrong.

The cause was **shipping a `.glb`**. Vanilla holds 2,209 files under `anims_X` and
**every one is `.X`**. The engine *scans* `.glb` (`ModelManager.java:1906`), so the
clip loaded and its name resolved — but scanning is not correctly interpreting a
skinned rig, and there is no vanilla precedent for glTF on that path.

The clip now ships as text `.X` written by `io_directx_x` with `pz_compat`, and is
**structurally identical to vanilla** on every axis that was ever suspect:

| | vanilla `Bob_ClimbRope.X` | ours `Bob_NF_LadderClimb.X` |
|---|---|---|
| header | `xof 0303txt 0032` | same |
| top-level frames | `Dummy01`, `Translation_Data`, `Body` | same |
| `Dummy01` transform | +90 deg about X | same |
| key naming | `AnimationKey R` / `S` / `T` | same |
| track order per bone | S, R, T | same |
| tick range | 0 .. 4800 | same |
| every bone has full R/S/T | yes | yes |
| `Bip01` T | 31 keys, animated | 31 keys, animated |
| `Translation_Data` | constant zero | constant zero |

The only remaining difference is bone count — 45 vanilla vs 35 ours — because
vanilla's rig carries `*Nub` terminator bones ours does not have. The working
`Bob_OCP_Punch_Rear.X` also has 35, so this is a rig difference, not an export one.

### Two earlier diagnoses were wrong. Both are recorded here on purpose.

**"Height is on the wrong axis."** The `.glb` put hip height on Z with Y constant,
and glTF being Y-up made that look decisive. But the `.X` form — the one that
works — *also* keeps bone data in Blender space under a `Dummy01` conversion node,
and vanilla does exactly the same. The axis was never misplaced; it was parked
where every vanilla clip parks it. What differed was whether the loader knew how to
walk it, and the `.X` loader does.

**"Vanilla animates no root translation, so strip `Bip01`."** False, and it would
have deleted the hip bob. Vanilla keys `Bip01` translation on all 31 frames. See
the correction under "The clip" above.

Neither of these was a careless read. The first came from a real structural
difference in a real broken file; the second from "nets to 0.00000", which is true
and does not mean what it was taken to mean. The lesson worth keeping is narrower
than either: **when a known-good file of the same kind exists, diff against it
before theorising.** `Bob_OCP_Punch_Rear.X` and `Bob_ClimbRope.X` were both
available the whole time, and either one answers both questions in a minute.

### Ruled out

- **The AnimSet.** The node is selected; our clip plays, not the rope shimmy.
- **The 92 constant channels.** Stripping them (105 -> 13) was tested and did not
  fix the collapse. The stripping is now **reverted** — vanilla and the working
  punch clip both write a full R/S/T track for every bone, so a complete channel
  set is the correct shape, not a defect.
- **A stale file.** Verified byte-for-byte through the junction after a full
  restart.
- **`Bip01` translation.** Vanilla does it too. Not the cause.

### `Translation_Data` is the deferred root-motion channel

<a id="root-motion"></a>

Still true, still worth knowing, but it does **not** explain the collapse:

```java
AnimNode.java:98           public String deferredBoneName = "Translation_Data";
AnimNode.java:96           @XmlElement name = "m_DeferredBoneName"
AnimNode.java:102          public BoneAxis deferredBoneAxis = BoneAxis.Y;
ImportedSkeleton.java:327  boolean isTranslationBone =
                               startsWithIgnoreCase(f.boneName, "Translation_Data");
```

`ImportedSkeleton:327` exempts that bone from the importer's bone-rotate modifier
while every other bone's position is corrected — it is deliberately special-cased.

The right reading of the pair:

- **`Translation_Data`** carries *deferred* motion — displacement the engine
  extracts and applies to the entity's world position. Vanilla's looping climb
  leaves it at constant zero, and so does ours.
- **`Bip01`** carries hip placement *within* the skeleton. Vanilla animates it.
  Animating it is how you get a hip bob, and it is not root motion.

So the two are not alternatives, and "move the displacement from `Bip01` to
`Translation_Data`" is only correct for a clip that genuinely travels — i.e. the
top-out, not the climb. For the climb, `Bip01` was always the right bone.

`m_DeferredBoneName` and `m_deferredBoneAxis` are AnimSet XML fields if a clip ever
needs a different channel or axis; the defaults are `Translation_Data` and `Y`.

### The engine owns final placement on a climb

`ClimbSheetRopeState.finishClimbing`:

```java
isoGameCharacter.setZ(climbData.targetClimbHeight);
isoGameCharacter.setCurrent(climbData.targetGridSquare);
```

Position is set **absolutely**, not integrated. So a clip on this path cannot
double-apply its displacement — it is simply overwritten. Useful to know before
authoring any transition that hands off from a climb.

### How the current file was produced

Blender 5.2, `io_directx_x` (enable `bl_ext.blender_org.io_directx_x` — it ships
disabled), with `Armature` and `Body` selected and nothing else:

```python
bpy.ops.export_scene.directx_x(
    filepath=out, check_existing=False, use_selection=True,
    export_format='TEXT_X', pz_compat=True,
    anim_frame_start=0, anim_frame_end=30,
    export_animation=True, export_armature=True, export_weights=True,
    write_templates=True)
```

`pz_compat` is the setting that matters. It forces 4800 ticks per second, names the
tracks `AnimationKey R` / `S` / `T`, and emits them in vanilla's S, R, T order.
Without it you get plain unnamed keys at scene FPS — which is what
`Bob_OCP_Punch_Rear.X` has, and that file works, so the engine tolerates both. We
match vanilla because there is no reason not to.

`use_selection` is not optional: the authoring blend also contains the ladder
geometry, IK empties and cameras, none of which belong in a clip.

**One change was made to the blend for this export.** The 14 driven bones had no
scale F-curves, so the exporter emitted no `S` track for them, while vanilla and
the punch clip carry a full R/S/T set on every bone. Constant identity scale keys
were added at frames 0 and 30. This also cleaned up 2.0e-05 of scale residue on
three leg bones — leaked by the `pose_bone.matrix` write-back trap documented in
the `pz-animation` skill. No pose data was touched; backup at
`blend/ladder_climb_PRE_SCALEKEYS.blend`.
