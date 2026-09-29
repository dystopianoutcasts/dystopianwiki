---
id: build-42-naming
slug: naming
title: Naming
game: pz
version: build-42
section: outcast-mods
category: outcast-ladders
difficulty: advanced
tags:
  - outcast-ladders
  - animation
  - clips
excerpt: 'The clip is called Bob_NF_LadderClimb, inside the asset as well as on disk.'
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
---
# Naming

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

The clip is called `Bob_NF_LadderClimb`, inside the asset as well as on disk.

Everything else in this mod uses the `OCL_` prefix. The `NF_` here is inherited
from when the animation was authored, and **renaming it is not free**: the name is
the `AnimationSet <name> {` declaration inside the `.X`, taken from the Blender
action, so it needs the action renamed and the clip re-exported — not just a file
rename.

Left as-is deliberately rather than silently. See the note in `README.md`.
