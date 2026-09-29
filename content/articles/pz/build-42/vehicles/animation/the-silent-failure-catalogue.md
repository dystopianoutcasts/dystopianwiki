---
id: build-42-the-silent-failure-catalogue
slug: the-silent-failure-catalogue
title: The silent-failure catalogue
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
  This is the section worth reading twice. Every one of these renders as
  "nothing happens" with no error from the mod or the engine, and several are
  indistinguishable from each other.
last_updated: '2026-09-29'
related_articles:
  - the-headline-corrected
  - what-vanilla-ships
  - the-four-script-pieces
  - runtime-injection-how-to-do-this-to-a-vanilla-car
  - what-the-engine-requires-to-actually-animate
  - the-fbx-export-layer-where-two-of-the-four-failures-lived
  - the-rig
  - still-unverified
  - prior-art-and-what-to-take
---
# The silent-failure catalogue

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

This is the section worth reading twice. **Every one of these renders as "nothing
happens" with no error from the mod or the engine**, and several are
indistinguishable from each other.

| Cause | Symptom | How to tell |
|---|---|---|
| `//` line comment in a script file | whole file fails to parse, nothing in it registers | grep for `//`; see 8.1 |
| model declaration not registered | part renders nothing, no mesh error | `ScriptManager.getModelScript(id)` returns nil |
| mesh sub-object name wrong | part renders nothing | this one DOES log `No such mesh` |
| node `Lcl Scaling` not 1 | car ~100x, invisible, shadow correct | read `Lcl Scaling` vs `UnitScaleFactor` |
| `static` wrong / mesh has no bones | renders at bind pose, never moves | no `AnimationPlayer` exists |
| clip name mismatch | pose never changes | clip absent from `animationClips` |
| bone name mismatch in FBX | panel renders, does not move | inspect the FBX |
| origin re-centred by the modeller | panel flies away when the bone rotates | inspect the FBX |
| another mod won the body model | our panel floats over their shell | read the body model id back |

### 8.1 PZ script files have no `//` comment

**`ScriptParser.stripComments` (`ScriptParser.java:58`) handles `/* */` and
nothing else.** There is no `//` handling anywhere in the parser.

A single `//` line makes the **entire file** fail to parse. Nothing in it
registers. And because no model declaration exists, no mesh load is ever
attempted, so `findMesh` never logs `No such mesh` either -- the one error the
engine would have given you is suppressed by the earlier failure.

This cost three in-game sessions on OutcastMotorsAnimated. 26 annotation
comments in a generated script meant every car pointed its body model at a name
nothing resolved. The cars vanished; their scripted shadows drew normally;
editing the mesh path, the scale and the shader inside those declarations
changed nothing, **because the declarations were never in play**. It is
indistinguishable from a bad mesh, and it caused a genuine 100x scaling defect
to be found, fixed, verified byte-for-byte, and produce no visible change.

Neither vanilla nor KI5 uses `//` in a single script file.

### 8.2 Verify outcomes, not existence

Every validator on that project checked whether things **existed** -- the mesh
file, the four contract strings inside it, the shader, the referenced model id.
All passed throughout. None asked whether the value was **sane** or whether
anything **resolved** it.

The two checks that would have found both bugs in minutes:

```lua
-- does the engine know this declaration at all?
ScriptManager.instance:getModelScript("OMA_Vehicles_CarNormal_Body")

-- is the mesh a plausible size?
raw_extent * nodeScale * modelScale * vehicleScale  -- expect ~1.9 x 4.8 x 1.2 m
```
