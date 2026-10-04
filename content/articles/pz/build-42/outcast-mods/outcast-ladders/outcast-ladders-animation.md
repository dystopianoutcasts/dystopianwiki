---
id: build-42-outcast-ladders-animation
slug: outcast-ladders-animation
title: Outcast Ladders -- animation
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
  A purpose-built ladder climb, replacing the sheet-rope shimmy the engine would
  otherwise play.
last_updated: '2026-09-29'
related_articles:
  - how-it-is-selected
  - the-clip
  - the-top-out-clip
  - changing-the-clip-needs-a-full-restart
  - the-export-was-the-format-and-only-the-format
  - the-dismount-trigger-confirmed-clip-pending
  - art-notes-for-the-next-blender-pass
  - untuned-and-how-to-tune-it
  - naming
---
# Outcast Ladders -- animation

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

A purpose-built ladder climb, replacing the sheet-rope shimmy the engine would
otherwise play.

Authored separately in Blender. **This repo holds a deployment copy only** — do
not edit the `.glb` here.

| role | location |
|------|----------|
| editable source | `anims_X\Bob\ladder_climb\blend\ladder_climb.blend` in our 3D assets library (not published), action `Bob_NF_LadderClimb`, frames 0-30 |
| canonical export | `...\ladder_climb\export\Bob_NF_LadderClimb.X` |
| rig traps, read first | `...\ladder_climb\NOTES.md` |
| motion spec | `anims_X\LADDER_CLIMB_REFERENCE.md` in the same library |
| deployment copy | `Contents/mods/OutcastLadders/common/media/anims_X/Bob/` |

400,557 bytes, sha256 `3424f151…`, verified byte-identical to the library export.

The `.glb` era is over. Both `Bob_NF_LadderClimb.glb` (86,920 bytes, the original) and
its constant-channel-stripped variant (81,984 bytes) are retired to the library at
`...\ladder_climb\export\` as `.glb` and `.stripped.glb`. Nothing under `anims_X`
ships as glTF any more — see "The export was the format" below.

1. [How it is selected](/pz/build-42/outcast-mods/outcast-ladders/how-it-is-selected)
2. [The clip](/pz/build-42/outcast-mods/outcast-ladders/the-clip)
3. [The top-out clip](/pz/build-42/outcast-mods/outcast-ladders/the-top-out-clip)
4. [Changing the clip needs a FULL RESTART](/pz/build-42/outcast-mods/outcast-ladders/changing-the-clip-needs-a-full-restart)
5. [The export was the format, and only the format](/pz/build-42/outcast-mods/outcast-ladders/the-export-was-the-format-and-only-the-format)
6. [The dismount: trigger confirmed, clip pending](/pz/build-42/outcast-mods/outcast-ladders/the-dismount-trigger-confirmed-clip-pending)
7. [Art notes for the next Blender pass](/pz/build-42/outcast-mods/outcast-ladders/art-notes-for-the-next-blender-pass)
8. [Untuned, and how to tune it](/pz/build-42/outcast-mods/outcast-ladders/untuned-and-how-to-tune-it)
9. [Naming](/pz/build-42/outcast-mods/outcast-ladders/naming)
