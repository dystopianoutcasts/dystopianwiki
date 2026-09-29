---
id: build-42-runtime-injection-how-to-do-this-to-a-vanilla-car
slug: runtime-injection-how-to-do-this-to-a-vanilla-car
title: Runtime injection -- how to do this to a vanilla car
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
  template vehicle X is winner-take-all: overriding one replaces the entire part
  definition. To attach a model to a vanilla car from a script file you would
  have to redeclare the whole family template.
last_updated: '2026-09-29'
related_articles:
  - the-headline-corrected
  - what-vanilla-ships
  - the-four-script-pieces
  - what-the-engine-requires-to-actually-animate
  - the-fbx-export-layer-where-two-of-the-four-failures-lived
  - the-rig
  - the-silent-failure-catalogue
  - still-unverified
  - prior-art-and-what-to-take
---
# Runtime injection -- how to do this to a vanilla car

> Source: 17-vehicle-animation-reference.md (compiled 2026-08-09, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

`template vehicle X` is winner-take-all: overriding one replaces the entire part
definition. To attach a model to a vanilla car from a script file you would have
to redeclare the whole family template.

**You do not have to.** `VehicleScript.Load(name, text)` parses a block into an
already-loaded script object, and every relevant loader is get-or-create:

| Function | Line | Behaviour |
|---|---|---|
| `Load` | `VehicleScript.java:141` | does not clear `this.parts` |
| `LoadPart` | `:916` | `getPartById`, mutates in place |
| `LoadAnim` | `:829` | `getAnimationById`, mutates in place |
| `LoadModel` | `:700` | `getModelById`, mutates in place |

So this is additive:

```lua
local script = ScriptManager.instance:getVehicle("CarNormal")
script:Load("CarNormal", [[
{
    model { file = OMA_Vehicles_CarNormal_Body, }
    part EngineDoor
    {
        model Default { file = OMA_Vehicles_CarNormal_Hood, }
        anim Close { anim = Hood_closing, rate = 2.5, }
    }
}
]])
```

Two things about that text are load-bearing:

**The outer braces are required.** `Load` does
`ScriptParser.parse(text).children.get(0)` -- it loads the FIRST CHILD of the
parse result, so the payload must sit inside one anonymous wrapper block.

**The bare `model` block replaces the car's body.** A vehicle's body model block
has no id; `ScriptParser.java:27` gives such a block `id = null`, and
`getModelById` has an explicit branch for it (`VehicleScript.java:1546`):

```java
if (StringUtils.isNullOrWhitespace(model.id) && StringUtils.isNullOrWhitespace(id)) {
   return model;
}
```

So it **finds and mutates** the existing body model rather than appending a
second one, and because `LoadModel` only assigns keys that are present, `scale`
and `offset` survive untouched. Without that branch this technique would render
two overlapping cars.

Fire it on `OnInitGlobalModData` -- after scripts are parsed, before the world
spawns vehicles. That is where VanillaVehiclesAnimated does it on B41.

### Where the compatibility cost actually is

The part attachment is nearly free. **The body swap is not**: it conflicts with
any other mod replacing the same vanilla body meshes, last writer winning. It is
also unavoidable -- a hood cannot open away from a shell that still has one.

Mods that ship their own vehicles (KI5) are untouched, because their script ids
are never named.
