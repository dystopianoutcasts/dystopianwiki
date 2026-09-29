---
id: build-42-prior-art-and-what-to-take
slug: prior-art-and-what-to-take
title: 'Prior art, and what to take'
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
  VanillaVehiclesAnimated -- workshop 3281755175 is the Build 42 release
  (common/ + a B42-only 42/media/shaders, 15 families, 398 scripts, 130 meshes).
  Workshop 3774077235 is the older B41 layout.
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
---
# Prior art, and what to take

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**VanillaVehiclesAnimated** -- **workshop `3281755175` is the Build 42 release**
(`common/` + a B42-only `42/media/shaders`, 15 families, 398 scripts, 130
meshes). Workshop `3774077235` is the older B41 layout.

*Corrected 2026-08-10. This section previously read "B41 only, no B42 branch as
of 2026-08-07", which was true when written and load-bearing for our design --
it made `incompatible=VanillaVehiclesAnimated` look theoretical. It is not.
See `25-animation-mod-synthesis.md` §2.*

The runtime
script-injection technique in section 4 is theirs. Their bone naming
(`FrontDoor.L`), multi-armature-per-FBX layout and `scale = 0.004` are **not**
worth copying -- vanilla's own convention is better because the engine's content
uses it. Their meshes, rig and clips are their author's work and must not be
reused.

Their `VVA_transparentWindows` submod is genuinely clever: a fragment shader
that **discards pixels in a checkerboard pattern** instead of using real alpha,
sidestepping transparency sort order entirely. Their `VVA_cullseats` is a
warning -- once doors open, the interior is visible and every clipping problem
vanilla hid becomes yours.

**KI5** -- the most-installed vehicle content in the game, and the best working
reference for B42 because their fleet animates today. Structure is identical to
what section 3 describes: pipe-selected sub-objects, `static = TRUE` body,
anonymous vehicle-level `model { file = ... }`, `static = FALSE` panels with
`boneWeight`, four anim blocks, model declarations in
`media/scripts/vehicles/*.txt` under `module Base`. They ship whole vehicles, so
they never modify a vanilla car -- but they prove a **mod's** model declarations
in that folder load correctly, which is a useful control when yours do not.

Their clips are named `<part>_opening` (closed to open); TIS's are `<part>_closing`
(open to closed). Both work -- the four anim blocks reverse whichever you author.
