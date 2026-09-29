---
id: build-42-lessons-and-guards
slug: lessons-and-guards
title: Lessons and guards
game: pz
version: build-42
section: vehicles
category: reference
difficulty: intermediate
tags:
  - lessons-learned
  - validators
  - vehicle-mods
  - guards
excerpt: >-
  Every bug that cost real time on the vehicle mods, what CLASS it belonged to,
  and the mechanical guard that now catches it.
last_updated: '2026-09-29'
---
# Lessons and guards

> Source: 22-lessons-and-guards.md (compiled 2026-09-01, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Every bug that cost real time on the vehicle mods, what CLASS it belonged to, and
the mechanical guard that now catches it.

**The meta-lesson, stated once because it is the only one that generalises:**
documentation prevented none of these. A validator caught them. Prefer a
mechanical guard to a written rule, every time.

---

## 1 · The dominant failure mode: half the surface works

Nearly every bug below shares a shape. Something **partially** succeeds, so the
obvious check passes and the real behaviour is wrong.

- Item scripts **parsed and registered** with B41's `Type = Normal`, so
  `getScriptManager():getItem()` found all nineteen and reported a confident
  `19/19`. But the item had no resolvable type, `InventoryItemFactory.CreateItem`
  returned null, and `ItemContainer.AddItem` handed back null **logging nothing**.
  An item that exists, can be looked up, and cannot be created.
  **B42 wants `ItemType = base:normal`.** `Type =` appears zero times in vanilla.
- Meshes **rendered**, at ninety-one times the correct size.
- Icons **existed**, showing six-poly placeholders eleven minutes older than the
  real meshes.
- Hooks **registered**, into a table nothing had wrapped.
- The mirror **ran**, and undid every repair as it went.

**When a check passes, ask which half of the surface it actually exercised.**

## 2 · Deleting a temporary file took shipped wiring with it

`Hooks.install()` was called only by the Milestone A canary, a deliberately
temporary instrument. Deleting it -- as always planned -- removed the only shipped
call. Handlers kept registering into a table that was never wrapped onto
`Vehicles.Update`, so the runtime guard silently never ran.

**135 unit checks stayed green**, because every test calls `install()` itself. A
suite structurally cannot catch missing wiring in shipped files.

**Guard:** `validate-data.ps1` greps shipped Lua for the calls that must exist --
`Hooks.install`, `runBootChecks`, `reportBoot`, `setBackend`, `Engine.step`,
`Populate.fill`. Proved by deleting the call again.

**Generalise:** before deleting any temporary instrument, grep for what else it
was the sole caller of.

## 3 · A check whose failure looks like bad luck is not a check

The first clobber canary asked "did part condition drop while driving?" It
reported `0/4 ... WE CLOBBERED`.

But vanilla wear is a **dice roll** -- about 0.42% per call for suspension at
60 km/h. Across four parts and a five-minute drive, **zero drops is roughly a 35%
outcome with chaining working perfectly.** The check cried wolf a third of the
time.

**Fix:** count a deterministic event instead. Chain `Vehicles.LowerCondition`
and count invocations -- zero means clobbered, non-zero means the chain holds, no
third answer.

**Generalise:** prefer counting a deterministic event to observing a stochastic
outcome. If a check can fail by chance, it will, and it trains you to ignore it.

## 4 · Comparing observed against expected requires the same population

The rewritten canary summed expected drops over **every** `LowerCondition` call
-- nine parts across three handlers -- but observed drops over the **four**
suspension parts it watched. It reported "expected 1.77" where the like-for-like
figure was about 0.8. Observing zero against 0.8 is unremarkable; against 1.77 it
looks like a signal.

**Generalise:** when a check compares observed to expected, verify both sides are
summed over the same set before trusting the gap.

## 5 · The mirror undid every repair

`absorbExternalDamage` computed `want - have` and absorbed the difference. But
`want > have` has two causes demanding opposite responses:

1. a crash lowered `have` -- real damage, absorb it
2. parts just got **better** and the mirror has not written yet -- nothing happened

Case 2 was treated as damage, so **a repair was partly undone the instant it was
made**. Caught in a log: restoring nineteen parts from 64 to 100 was immediately
followed by `absorbed 36 engine damage onto 3 part(s)`.

**Fix:** measure against what *this mod last wrote*, not against what state
justifies. Only an outside actor can move a value away from what you put there.

**Generalise:** when reconciling your state against someone else's, record your
own last write. "Different from expected" and "changed by someone else" are not
the same question.

## 6 · Vanilla's own code can be wrong

`ISVehicleBloodUI.lua:80-81` indexes `getVehicles()` -- a `Set` -- with
`vehicles:get(i-1)`. It cannot ever have worked. It is in a debug-only blood UI,
so nobody hit it.

Copying it crashed the Milestone B probe.

**Generalise:** "vanilla does it" is evidence, not proof. Weight it lower in
debug UIs, which is exactly the code a modder is most likely to crib from.

## 7 · Two exporters, opposite conventions, both "correct"

PZ applies a mesh's per-node `Lcl Scaling` and **ignores `UnitScaleFactor`**. So
the right `scale =` depends on which the exporter wrote into -- a property of the
file, not of anyone's intent.

Blender's `apply_scale_options` being *unset* rather than *set wrongly* let two
pipelines diverge with neither carrying a visibly wrong constant. Both imported as
correct metres in Blender, which is why it stayed invisible until it rendered.

The first fix hardcoded `0.004` and would have become a trap the moment the
export was corrected: node scaling would go to 1, the divisor would still be 100,
and every part would render at two millimetres.

**Fix:** measure node scaling per file and divide. The compensation cancels
itself -- 0.004 today, 0.4 after a re-export, no coordination.

**Generalise:** where a constant compensates for someone else's convention,
measure the convention instead of encoding the constant.

## 8 · Icons rendered from stale meshes

All nineteen icons were rendered eleven minutes before the real meshes arrived.
The world model showed a crankshaft; the inventory showed a grey cylinder.
`validate-data.ps1` passed throughout, because it asked whether the icon *file
existed*.

**Guard:** a check that no icon is older than the mesh it depicts. Crude mtime
comparison, deliberately -- hashing render output is not reproducible across
Blender versions, and the failure it must never miss is exactly "mesh newer than
icon".

Related, same class: the icon renderer read `cam.matrix_world` immediately after
setting rotation and location. **Blender does not refresh that until the next
depsgraph evaluation**, so it returned the identity and the fit was computed in
world space. Flat parts framed correctly by luck; a tall one overflowed. Fix:
`bpy.context.view_layer.update()` before reading.

## 9 · Generated files that were not generated

The content files carried `GENERATED from OMO_Slots.lua. Do not hand-edit` --
and no generator existed. They had been produced once by hand and the header was
aspiration.

That is worse than an honest hand-written file: the header stops a maintainer
fixing a typo in place while nothing regenerates it, so it rots exactly where it
is hardest to correct.

**Guard:** a real generator with a `--check` mode that writes nothing and exits
non-zero on drift, wired into the validator. Either the claim is true or it is
not made.

## 10 · Ordering that bricks every car in the world

The condition mirror derives engine condition from parts. Every bay starts empty.
An empty bay has zero critical parts, which the mirror correctly reports as 0,
which stops the car starting.

Unguarded, **the mirror would disable every vehicle in the world** -- with both
halves behaving exactly as specified.

**Guard:** a populated mark on the vehicle, checked before the mirror runs; and
`Engine.step` refuses to run at all while the stub backend is installed, since
the stub reports everything present at 100 and would silently heal every damaged
engine in the world.

**Generalise:** when two correct components compose into a catastrophe, the guard
belongs at the seam, not inside either one.

## 11 · The diagnostic that named the wrong cause

A probe reported `no vehicle in reach` and blamed distance. The tester was at 2.5
tiles against a 4-tile limit; the real cause was
`getNearVehicle()`'s visibility filter (`20-vehicle-engine-reference.md` §3).

**Generalise:** a diagnostic that names one cause when the function has four is
worse than one that lists all four -- it sends the reader to fix the wrong thing.

## 12 · The exploit that a gate did not close

The engine bay container was gated on the hood being open. But an open container
is an ordinary loot window with Take All: a player could swap a crankshaft with
**no tools, no skill check and no time**, making the entire Mechanics 1-to-7
gradient unenforceable, and handing every car a free 100-capacity trunk.

**Gating when a thing opens does not gate what can be done once it is open.**

Fix: refuse container access entirely and route everything through a panel that
can demand a wrench, a skill level and ninety seconds -- with one exception, so
that standing down never seals a player's parts inside a container nothing can
open. **Refusing to work is acceptable; confiscating belongings is not.**

---

## The guards that now exist

| Guard | Catches |
|---|---|
| `generate-content.lua --check` | generated files edited by hand or drifted from source |
| asset-reference check | a `mesh =`, `Icon =` or `texture =` that resolves to nothing |
| vanilla-template diff | a game update changing the file our override reproduces |
| icon-vs-mesh mtime | icons rendered from an older mesh |
| wiring grep | shipped Lua missing a call the suite provides for itself |
| vendored-file hash | a shared parser diverging between mods |
| weight-budget assertion | a full engine that cannot fit in its own bay |
| `checkNear` everywhere | Lua 5.4 integer subtype vs Kahlua |

Each was proved by deliberately breaking it. **A validator that has never failed
is not known to work.**
