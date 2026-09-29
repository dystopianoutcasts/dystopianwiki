---
id: build-42-open-spikes-collected
slug: open-spikes-collected
title: 'Open spikes, collected'
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
  S1 and S2 are resolved from the sealed decompile alone -- no running game was
  needed for either, and S1's recorded answer was wrong in the original spike.
  Neither OL_Containers nor anything...
last_updated: '2026-09-29'
related_articles:
  - implementation-status
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
---
# Open spikes, collected

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

| # | Module | Question | State |
|---|---|---|---|
| S1 | `OL_Containers` | `getEffectiveCapacity(playerObj)` vs `getCapacity()` / `getContentsWeight()`; does the former already net out contents? | **RESOLVED** -- see `roomFor`. It does not net out contents, and the subtrahend is `getCapacityWeight()`, which was not one of the two candidates. |
| S2 | `OL_Containers` | Is the capacity-0 arm of `isSyntheticAggregate` needed, or does the `proxInv` type check suffice? | **RESOLVED** -- type check alone. The capacity-0 arm was rejected as both redundant and harmful; see `isSyntheticAggregate`. |
| S3 | `OL_Transfer` | Is `getPlayerInventory(playerNum).inventoryPane` safe for `transferItemsByWeight` outside a pane click? | **PARTLY RESOLVED** -- see below. |
| S4 | `OL_Classify` | Is `Set<ItemTag>` iterable from Lua? (Not needed by this design.) | open, blocks nothing |
| S5 | `OL_Index` | Should the fullType index collapse condition/quality variants? A half-full drainable and a full one share a fullType but may not stack sensibly. | open, blocks `OL_Index` design |

S1 and S2 are resolved **from the sealed decompile alone** -- no running game was
needed for either, and S1's recorded answer was wrong in the original spike.
Neither `OL_Containers` nor anything downstream of it is blocked any longer.

### S3, as far as source can settle it

Reading `ISInventoryPane:transferItemsByWeight` (`ISInventoryPane.lua:632-654`),
the method touches exactly two things on `self`: `self.player` (the player
number) and `self:sortItemsByTypeAndWeight`. It reads no UI state, no selection,
no geometry. That strongly implies the pane instance is safe to use outside a
pane click, because there is nothing click-shaped in it to be stale.

**Still needs confirming in game:** that `getPlayerInventory(playerNum)` has a
non-nil `inventoryPane` at the moment a context-menu callback runs. That is a
lifecycle question about the UI, and the decompile cannot answer it.

**And a hazard the original spike did not mention.** The corpse branch does
`ISTimedActionQueue.add(ISGrabCorpseItem:new(...))` followed by **`break`** --
so hitting one corpse item silently abandons every remaining item in that group.
`OL_Transfer` must detect this and report it in `report.skipped` /
`report.byReason`, or a run that transfers 3 of 20 items will cheerfully claim
20. This is rule 4 applied to somebody else's control flow.
