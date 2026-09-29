---
id: build-42-implementation-status
slug: implementation-status
title: Implementation status
game: pz
version: build-42
section: outcast-mods
category: outcast-lib
difficulty: advanced
tags:
  - outcast-lib
  - api
  - ol-init
  - containers
excerpt: >-
  Removed 2026-08-05: OL_Filter, OL_Index, OL_Classify, OL_Transfer. All four
  were written for OutcastStowAll and had zero callers once it was abandoned.
  They are parked complete and tested in...
last_updated: '2026-09-29'
related_articles:
  - ol-init
  - ol-containers
  - ol-reach
  - ol-squares
  - ol-compat
  - ol-options
  - ol-vehicleparts
  - ol-debug
  - log-file-location
  - log-line-visibility
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# Implementation status

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

| Module | State | Consumers |
|---|---|---|
| `OL_Init` | **implemented**, unit-tested | all |
| `OL_Containers` | **implemented**, unit-tested | SawAll, Proximity |
| `OL_Reach` | **implemented**, unit-tested | SawAll, RipAll (pending) |
| `OL_Squares` | **implemented**, unit-tested | SawAll, RipAll (pending) |
| `OL_Compat` | **implemented**, unit-tested | Proximity |
| `OL_Debug` | **implemented**, unit-tested | Proximity |
| `OL_Options` | **implemented**, unit-tested | Proximity, RipAll, SawAll |
| `OL_VehicleParts` | **implemented**, unit-tested | OutcastMotors, OutcastMotorsUI |

**Removed 2026-08-05: `OL_Filter`, `OL_Index`, `OL_Classify`, `OL_Transfer`.**
All four were written for OutcastStowAll and had zero callers once it was
abandoned. They are parked complete and tested in
`OutcastStowAll/abandoned-lib-modules/`, with a README covering restoration and
what their tests still encode. `tests/test_init.lua` asserts all four stay
absent, so bringing one back is a deliberate act that updates a test.

`OL_Filter` needs a specific correction: earlier versions of this document and
the README listed RipAll and SawAll as its consumers. **They never were.**
`isUnwanted` appears nowhere else in the family -- RipAll runs a four-way
classify using `isNoRecipes`, SawAll checks only `isFavorite`.

> **Why Cluster B lost its justification -- keep this, it is the useful part.**
>
> `OL_Index`, `OL_Classify` and `OL_Transfer` were admitted on the strength of
> two consumers: OutcastStowAll's Tier A router and OutcastProximity's C6.
> **Both were reimplementations of vanilla B42 features shipped in 42.13.0** --
> `ISUI/InventoryWindow/Handlers/TransferSameTypeMultiContainer.lua`, and
> `ISUI/LootWindow/Handlers/{TakeAll,TakeSameType,MoveToFloor,FloorTake*}.lua`,
> all registered by default and absent from B41 entirely.
>
> So rule 3 was never actually satisfied. It looked satisfied because the two
> consumers were counted without checking whether either needed to exist.
>
> **Root cause, worth more than the symptom: nobody surveyed vanilla before
> designing.** The competitive review covered five Workshop mods and zero vanilla
> handlers. B42 absorbed a great deal of what B41-era mods existed to do, and
> `media/lua/client/ISUI/{InventoryWindow,LootWindow}/Handlers/` is where most of
> it landed. **Read that directory at the front of the next feature**, before the
> Workshop survey, not after the code is written and tested.

Spikes **S1 and S2 are resolved from the sealed decompile** and the resolutions
are recorded in place below; neither needed a running game, and in S1's case
*neither of the two candidate answers was correct*. **S3 is partly resolved.**
S4 and S5 remain open and block nothing that is implemented.

Everything marked implemented is covered by `tests/test_*.lua` -- **279 checks
across 8 suites**, run with `lua test_all.lua` from `tests/`.

Conventions used below:

- `container` -- a Java `ItemContainer`
- `item` -- a Java `InventoryItem`
- `playerObj` -- an `IsoPlayer`; `playerNum` -- the integer index
- Functions return `nil` only where documented. **Never return an empty result
  to mean "failed"** (README rule 4).
- All modules live under the single `OutcastLib` global. No module registers
  its own global.
