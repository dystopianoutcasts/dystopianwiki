---
id: build-42-changing-the-clip-needs-a-full-restart
slug: changing-the-clip-needs-a-full-restart
title: Changing the clip needs a FULL RESTART
game: pz
version: build-42
section: outcast-mods
category: outcast-ladders
difficulty: advanced
tags:
  - outcast-ladders
  - animation
  - clips
excerpt: A Lua reload does nothing. Neither does refreshAnimSets.
last_updated: '2026-10-04'
related_articles:
  - how-it-is-selected
  - the-clip
  - the-top-out-clip
  - the-export-was-the-format-and-only-the-format
  - the-dismount-trigger-confirmed-clip-pending
  - art-notes-for-the-next-blender-pass
  - untuned-and-how-to-tune-it
  - naming
---
# Changing the clip needs a FULL RESTART

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

<a id="reload"></a>

A Lua reload does nothing. Neither does `refreshAnimSets`.

| what it reloads | what it does not |
|-----------------|------------------|
| `refreshAnimSets(true)` resets `AnimationSet` and reloads every `AnimNodeAsset` — the **XML nodes** (`LuaManager.java:6079`) | the clip binaries |
| a Lua reload reloads Lua | everything else |

Animation clips are read once by `ModelManager.loadModAnimations` (`:1665`) at
startup and never re-read. **Editing a `.glb` or `.X` requires quitting and
relaunching the game.**

This cost an entire debugging round: the clip was stripped, the file on disk was
correct through the junction, and the game — running since before the edit —
kept playing the old one. "Nothing changed on reload" was the reload, not the
change.

Editing an **AnimSet XML** is the cheaper case: `OutcastLadders.reloadAnims()`
style refresh does apply to those. Editing the **clip** does not.
