---
id: build-42-vehicle-animation-reference-index
slug: vehicle-animation-reference-index
title: Vehicle part animation reference
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
  Compiled 2026-08-09, from building OutcastMotorsAnimated and debugging it
  through four in-game sessions. Supersedes 15-animated-vehicle-parts.md, which
  was written from script-reading alone and is...
last_updated: '2026-09-29'
related_articles:
  - the-headline-corrected
  - what-vanilla-ships
  - the-four-script-pieces
  - runtime-injection-how-to-do-this-to-a-vanilla-car
  - what-the-engine-requires-to-actually-animate
  - the-fbx-export-layer-where-two-of-the-four-failures-lived
  - the-rig
  - the-silent-failure-catalogue
  - still-unverified
  - prior-art-and-what-to-take
---
# Vehicle part animation reference

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Compiled 2026-08-09, from building OutcastMotorsAnimated and debugging it through
four in-game sessions. Supersedes `15-animated-vehicle-parts.md`, which was
written from script-reading alone and is correct about the mechanism but silent
about everything that actually went wrong.

**Every claim here was verified against the B42 decompile, the shipped game
files, a working third-party mod, or a running game.** Where something is
believed but untested it is marked so explicitly. That distinction is the whole
value of this document: the previous version's confident claims were all true,
and the mod still did not work for three sessions, because the failures were in
places nobody had thought to look.

Decompile paths are relative to the root of our decompile of the Build 42 engine (the Java package
folders, `zombie/...`).

1. [The headline, corrected](/pz/build-42/vehicles/animation/the-headline-corrected)
2. [What vanilla ships](/pz/build-42/vehicles/animation/what-vanilla-ships)
3. [The four script pieces](/pz/build-42/vehicles/animation/the-four-script-pieces)
4. [Runtime injection -- how to do this to a vanilla car](/pz/build-42/vehicles/animation/runtime-injection-how-to-do-this-to-a-vanilla-car)
5. [What the engine requires to actually animate](/pz/build-42/vehicles/animation/what-the-engine-requires-to-actually-animate)
6. [The FBX/export layer -- where two of the four failures lived](/pz/build-42/vehicles/animation/the-fbx-export-layer-where-two-of-the-four-failures-lived)
7. [The rig](/pz/build-42/vehicles/animation/the-rig)
8. [The silent-failure catalogue](/pz/build-42/vehicles/animation/the-silent-failure-catalogue)
9. [Still unverified](/pz/build-42/vehicles/animation/still-unverified)
10. [Prior art, and what to take](/pz/build-42/vehicles/animation/prior-art-and-what-to-take)
