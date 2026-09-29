---
id: build-42-untuned-and-how-to-tune-it
slug: untuned-and-how-to-tune-it
title: 'Untuned, and how to tune it'
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
  m_SpeedScale is 1.00 and unverified. The treadmill only reads correctly if the
  engine advances the character two rungs per 30 frames at that scale.
last_updated: '2026-09-29'
related_articles:
  - how-it-is-selected
  - the-clip
  - the-top-out-clip
  - changing-the-clip-needs-a-full-restart
  - the-export-was-the-format-and-only-the-format
  - the-dismount-trigger-confirmed-clip-pending
  - art-notes-for-the-next-blender-pass
  - naming
---
# Untuned, and how to tune it

> Source: OutcastLadders/docs/ANIMATION.md (compiled 2026-08-04, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`m_SpeedScale` is **1.00 and unverified**. The treadmill only reads correctly if
the engine advances the character two rungs per 30 frames at that scale.

The engine's rate comes from `getClimbRopeSpeed`, and `ClimbSheetRopeState`
applies it as:

```java
float climbSpeed = isoGameCharacter.getClimbRopeSpeed(false);
isoGameCharacter.getSpriteDef().animFrameIncrease = climbSpeed;
float currentClimbHeight = isoGameCharacter.getZ() + climbSpeed / 10.0F * GameTime.instance.getMultiplier();
```

Note it drives `animFrameIncrease` from the same number, so clip playback and
vertical travel are already coupled — `m_SpeedScale` is a multiplier on top.
Vanilla's rope node uses `0.80`.

**Tune by eye against foot slip:** if the feet slide up the rungs the clip is too
slow relative to travel; if they slide down it is too fast.
