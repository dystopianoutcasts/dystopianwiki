---
id: build-42-still-unverified
slug: still-unverified
title: Still unverified
game: pz
version: build-42
section: vehicles
category: animation
difficulty: advanced
tags:
  - vehicle-animation
  - rig
  - fbx
  - silent-failures
excerpt: >-
  Marked honestly, because the previous version of this document was confidently
  wrong by omission.
last_updated: '2026-10-04'
related_articles:
  - the-headline-corrected
  - what-vanilla-ships
  - the-four-script-pieces
  - runtime-injection-how-to-do-this-to-a-vanilla-car
  - what-the-engine-requires-to-actually-animate
  - the-fbx-export-layer-where-two-of-the-four-failures-lived
  - the-rig
  - the-silent-failure-catalogue
  - prior-art-and-what-to-take
---
# Still unverified

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Marked honestly, because the previous version of this document was confidently
wrong by omission.

- ~~**Whether a Blender-exported panel cut from a vanilla body wants `vehicle`
  or `vehicle_multiuv`.**~~ **ANSWERED: it wants the body's own shader.** The
  reason it appeared not to was that vanilla ships no skinned `.vert` for three
  of the six, so the panel could not be drawn at all. Ship the missing vertex
  program; do not substitute a different shader, which silently drops `norandom`
  and tints liveried panels. See 6.3 and `18-...md` section 1.5.
- ~~**Whether a rig without `Vehicle_bone` animates.**~~ **ANSWERED: yes, it
  does.** `VVA/Normal/hood.fbx` is a single bone with no root bone and no body
  in the file, and it animates a vanilla taxi correctly. An earlier answer here
  claimed the opposite and was withdrawn the same day -- see 7.1 for the three
  rig rules invented on this project and disproved.
- **Whether declaring `boneWeight` fixes a panel that renders and animates in
  the wrong place.** THE open question as of 2026-08-10. It is the one
  declaration separating our file from VVA's working one (5.4), the evidence is
  strong, and the test has not been run.
- ~~**Whether `anim Opened { animate = FALSE }` restores a saved-open state on
  chunk load.**~~ **ANSWERED for the saved state: it does.** On a taxi with our
  animated panels, a door, the trunk and the hood were left open, the game was
  quit and reloaded, and all three were still open. That was a real question,
  because the panel injection runs again on every load and `animate = FALSE`
  holds a frame of the clip rather than a yes/no. Whether the opening movement
  visibly replays as chunks load was not recorded; watch for it on a crowded car
  park.

> **Proof:** Game test. Door, trunk and hood left open on a CarTaxi with the Outcast Motors Animated panels, game quit and reloaded, all three still open, recorded in the mod's notes on 2026-08-23. Build 42.20.

- ~~Whether part animation replicates in multiplayer.~~ **ANSWERED: it does
  not.** See section 5.5.
- **Whether a part model override survives a car being damaged** into its
  `SMASH_`/`CRASH_` variant, which swaps the whole shell.
- **Performance at density.** A car park of skinned vehicle meshes is more draw
  calls than vanilla ever renders.

*Updated 2026-10-04: an open door, trunk and hood came back open after a save and reload (game test, 2026-08-23); whether the opening replays visibly on chunk load is still open.*
