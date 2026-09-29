---
id: build-42-how-it-is-selected
slug: how-it-is-selected
title: How it is selected
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
  Vanilla points both climbrope/climb.xml and climbdownrope/climb.xml at
  Bob_ClimbRope. We add a node to each folder rather than replacing them:
last_updated: '2026-09-29'
related_articles:
  - the-clip
  - the-top-out-clip
  - changing-the-clip-needs-a-full-restart
  - the-export-was-the-format-and-only-the-format
  - the-dismount-trigger-confirmed-clip-pending
  - art-notes-for-the-next-blender-pass
  - untuned-and-how-to-tune-it
  - naming
---
# How it is selected

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Vanilla points both `climbrope/climb.xml` and `climbdownrope/climb.xml` at
`Bob_ClimbRope`. We **add** a node to each folder rather than replacing them:

```xml
<m_Conditions>
    <m_Name>OCLClimbSurface</m_Name>
    <m_Type>STRING</m_Type>
    <m_Value>ladder</m_Value>
</m_Conditions>
```

`AnimState.addNode` appends to a list ordered by `compareSelectionConditions` and
does **not** key by `m_Name`, so both nodes coexist and the condition decides.
A sheet rope keeps the rope animation; a ladder gets ours.

`m_Name` stays `climb`, matching vanilla, because node names are what
`findTransitionTo` matches against.

`OCL_Anim.update` sets the variable on the character every tick — not throttled,
because the climb state picks its node as the climb *begins*, and a throttled
write would let the first climb of a ladder play the rope shimmy. It is one
cached sprite lookup per player and writes only on change.

### Both directions

The prior-art ladder mod ships a `climbrope` node only, so **descending** a
ladder still plays the rope shimmy. We ship both, and
`scripts/validate-anims.ps1` fails the build if either is missing.
