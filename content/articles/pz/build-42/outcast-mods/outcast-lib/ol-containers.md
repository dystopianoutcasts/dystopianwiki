---
id: build-42-ol-containers
slug: ol-containers
title: OL_Containers
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
excerpt: True when the container is not a player-locked IsoThumpable.
last_updated: '2026-09-29'
related_articles:
  - implementation-status
  - ol-init
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
# OL_Containers

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### `OutcastLib.Containers.isUnlocked(container, playerObj) -> boolean`

True when the container is not a player-locked `IsoThumpable`.

Extracted verbatim from the identical check in `ORA_Scan.lua:46-52` and
`OSA_Scan.lua:82-85`:

```lua
local parent = container:getParent()
if parent and instanceof(parent, "IsoThumpable")
   and parent:isLockedToCharacter(playerObj) then return false end
return true
```

**Scope note.** This is the *only* part of the two mods' container predicates
that is identical. SawAll's `containerUsable` additionally excludes `floor` type
and applies a `CRAFT_REACH` distance clamp; both stay in SawAll (README rule 2).

### `OutcastLib.Containers.outermost(container) -> container`

`container:getOutermostContainer() or container`. Never returns `nil` for a
non-nil argument.

### `OutcastLib.Containers.isSyntheticAggregate(container) -> boolean`

True for a read-only aggregate container created by a proximity-style mod.
**The test is `getType() == "proxInv"` and nothing else.**

`OutcastLib.Containers.SYNTHETIC_TYPE` holds the string.

**Load-bearing.** With any proximity mod active, a synthetic container sits in
`ISInventoryPage.backpacks` holding *references* to items that also live in the
real containers. Any code that indexes or counts `backpacks` without this guard
double-counts every item, and any code that picks a destination may select a
container that rejects all writes. This is the same defect class as the crafting
ingredient duplication that `CraftingFix.lua` exists to prevent.

**S2 RESOLVED -- the capacity-0 arm was rejected, not merely found unnecessary.**

- *Redundant.* Both aggregators tag their container with the type string:
  upstream builds `ItemContainer.new("proxInv", nil, nil)`
  (`ProximityInventory.lua:65-71`) and OutcastProximity uses the same string
  deliberately (`OP_Config.lua:35`) so third-party mods that already special-case
  `proxInv` keep working. The type test covers both.
- *Harmful.* A real container legitimately at capacity 0 would be misclassified
  as synthetic and silently dropped from every destination list. Excluding a real
  container with nothing to say why is the exact wrong-answer shape README rule 4
  forbids; the type test cannot produce one.

Regression test: `tests/test_containers.lua`, "capacity-0 real container is NOT
synthetic".

### `OutcastLib.Containers.roomFor(container, playerObj) -> number`

Remaining weight capacity. Returns a number, never `nil`; `0` means full. The
result **may be negative** for an over-filled container and is deliberately not
clamped -- a caller asking "how much fits" and one asking "how overloaded is
this" want different numbers from the same call. Clamp at the call site.

**S1 RESOLVED -- and neither candidate in the original spike was right.**

```lua
container:getEffectiveCapacity(playerObj) - container:getCapacityWeight()
```

- `getEffectiveCapacity` (`ItemContainer.java:202`) is `getCapacity()` adjusted
  for the Organized / Disorganized traits. It does **not** net out contents, so
  the subtraction is required -- this is not a single call.
- The subtrahend is `getCapacityWeight()` (`:2258`), **not** `getContentsWeight()`
  (`:2243`) as the spike proposed. `getContentsWeight` naively sums
  `getUnequippedWeight()` over the items. `getCapacityWeight` additionally
  handles the three cases that matter here: a player parent returns
  `chr.getInventoryWeight()`, a corpse parent returns
  `deadBody.getInventoryWeight()`, and unlimited-carry or ghost mode returns `0`.
  Using `getContentsWeight` would report the wrong room for the player's own
  inventory and for every corpse.

This is the pairing vanilla itself uses everywhere it asks the question --
`ActionManager.lua:11`, `forageSystem.lua:1657`, `ISBaseIcon.lua:105`.

### `OutcastLib.Containers.destinations(playerNum, opts) -> array`

**Order is total and stable, and consumers may rely on it.** Sorted by distance
ascending, then by an intrinsic key `x:y:z:type`, then by object identity. Each
record carries the `key` and `tie` values used, so a consumer re-sorting a
filtered subset reproduces the same order.

This is a guarantee, not an accident. `table.sort` is unstable and demonstrably
reorders equal keys (input `abcdefgh` -> `aefgdbch`), while
`ISInventoryPage:update` rebuilds `backpacks` on every direction change and
every square change (`ISInventoryPage.lua:501-508`) -- so distance alone would
let two equally-distant containers swap places between one call and the next.
A consumer breaking ties by array position, which is the obvious thing to do,
would then send identical items to different containers on consecutive presses.

The container buttons the player is currently looking at, filtered for use as
**transfer targets**.

```lua
opts = {
  includeFloor      = false,   -- default false
  includePlayerSide = false,   -- default false: excludes inventory and worn bags
  playerObj         = nil,     -- REQUIRED; raises without it
}
```

Always excludes `isSyntheticAggregate` containers and locked ones. Returns an
array of `{ container = c, dist = n }`, nearest first, so a caller can tie-break
by distance without a second pass.

**Reads both pages, not just the inventory page.** Nearby crates appear on the
loot page while the player's own bags appear on the inventory page, and a "where
can I put this" list needs the union. `backpacks` is a plain Lua array of button
objects each carrying `.inventory` (`ISInventoryPage.lua:1486`, `:1506`), and the
traversal falls back through `page.inventoryPane.inventoryPage` -- the path
`ORA_Scan.lua:170-175` already ships. A container listed on both pages is
returned once.

**Confirmed in game (2026-08-04), not just from source.** This traversal was the
least-verified code in the library, because "is `backpacks` reachable by this
path at this moment" is a UI lifecycle question no decompile answers. The M0
probe, standing next to kitchen shelves, returned exactly one transfer target --
`shelves`, `dist=0.84`, `room=38.50` against `capacity=40`. So the page walk, the
player-side exclusion and the distance are all correct against real objects.

**A zero result is usually correct, not a failure.** With only the player's own
inventory panel open, every container found is player-side and
`includePlayerSide=false` excludes them all. That is the intended answer for a
"where can I put this" query. Do not read zero as a broken traversal without
first re-asking with `includePlayerSide = true`.

`dist` comes from `container:getSquare():DistToProper(playerObj)`. `getSquare()`
already resolves through the outermost container, vehicle part, source grid and
parent object (`ItemContainer.java`), so bags-in-bags and vehicle containers
answer correctly. A container with genuinely no square sorts last (`math.huge`).

**Raises when neither page is built**, rather than returning `{}`. "The inventory
UI does not exist yet" and "there is nowhere to put anything" are different
answers and an empty array cannot distinguish them (rule 4). Call it from a
context menu or later, not during load.

This is the whole of what OutcastStowAll and OutcastProximity need for container
discovery -- **neither performs a radius sweep.** Vanilla already built the 3x3
list. See `OL_Reach` for the mods that genuinely need more.
