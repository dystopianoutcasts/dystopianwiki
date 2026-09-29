---
id: build-42-ol-squares
slug: ol-squares
title: OL_Squares
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
  The three-pass per-square container sweep, structurally identical across the
  three call sites today (ORA_Scan.addSquareContainers,
  OSA_Scan.squareContainers, OSA_Scan.squareContainersUnfiltered)...
last_updated: '2026-09-29'
related_articles:
  - implementation-status
  - ol-init
  - ol-containers
  - ol-reach
  - ol-compat
  - ol-options
  - ol-vehicleparts
  - ol-debug
  - log-file-location
  - log-line-visibility
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# OL_Squares

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### `OutcastLib.Squares.containersOn(square, opts) -> number`

The three-pass per-square container sweep, structurally identical across the
three call sites today (`ORA_Scan.addSquareContainers`,
`OSA_Scan.squareContainers`, `OSA_Scan.squareContainersUnfiltered`). Appends into
a caller-supplied collection and returns **how many it added**, so a caller can
tell "this square held nothing" from "this square was never walked".

```lua
opts = {
  into      = <collection>,     -- required; :add() called on each accepted container
  seen      = {},               -- required; identity dedupe, shared across squares
  playerObj = playerObj,        -- required
  accept    = function(c) ... end,   -- optional extra predicate, per consumer
  acceptBody= function(mover) ... end -- optional; defaults to skipping animal corpses
}
```

Every required option raises by name when missing.

**The lock test is built in.** All three call sites apply
`Containers.isUnlocked` and the check is identical in every one, so it is not
optional. Everything else is `opts.accept` -- SawAll's `floor`-type exclusion and
2.5-tile `CRAFT_REACH` clamp are policy and stay in SawAll (rule 2).

**`acceptBody` defaults to skipping animal corpses, and the two mods did not
actually diverge here.** `ORA_Scan.lua:74` and `OSA_Scan.lua:59-61` are
character-for-character the same predicate --
`not (instanceof(mover, "IsoDeadBody") and mover:isAnimal())` -- written in two
places. Earlier drafts of this document listed them as a divergence to preserve;
they are not one. The option remains for a future consumer that genuinely
differs, and both current consumers get their existing behaviour by passing
nothing.

#### Dedupe is mark-then-test

A container is marked `seen` the first time it is offered, **before** any
predicate runs, so a rejected container is never re-tested on a later square.

This is SawAll's existing shape (`OSA_Scan.lua:99-103`), chosen over RipAll's
test-then-mark (`ORA_Scan.lua:54-59`) because SawAll owns the expensive
predicate. The two differ only for a predicate whose answer can change between
squares for the same container; the lock test cannot, and SawAll's distance clamp
is measured from the *player* rather than the square, so it cannot either. **No
current call site can observe the difference.** Any future `accept` that is
square-dependent must not rely on being re-asked.

### `OutcastLib.Squares.seenFrom(collection, seen) -> table`

Pre-seeds a `seen` table from a collection that already holds containers.
Accepts a Java-style collection (`:size()`/`:get()`) or a plain Lua array.

**Required for the RipAll retrofit.** RipAll keeps no separate `seen` table -- it
dedupes against the result list itself (`ORA_Scan.lua:56`), and that list arrives
already populated by `ISInventoryPaneContextMenu.getContainers`. Handing
`containersOn` a fresh empty `seen` would re-add every container the inventory UI
had already contributed. So the retrofit reads:

```lua
local seen = OutcastLib.Squares.seenFrom(containers)
```

Both halves of this are pinned by tests in `tests/test_squares.lua` -- one
asserting the naive version double-adds, one asserting `seenFrom` prevents it.

Three passes, in this order:

1. `square:getStaticMovingObjects()` -> `mover:getContainer()`, gated by `acceptBody`.
2. `square:getObjects()` -> `object:getContainerByIndex(i)` for `i` in `0 .. getContainerCount()-1`.
3. `square:getWorldObjects()` -> `worldObject:getItem()`, and **only if
   `instanceof(item, "InventoryContainer")`**, `item:getInventory()`.

**Pass 3's type test is mandatory and must come first.** `getInventory()` is
declared on `InventoryContainer` (`InventoryContainer.java:56`), not on
`InventoryItem`; calling it on a plain garment on the ground is a hard error.
Same order vanilla uses at `ISInventoryPage.lua:1698`.

**Not a divergence, despite the naming.** RipAll inlines
`not (instanceof(mover, "IsoDeadBody") and mover:isAnimal())` at
`ORA_Scan.lua:74`; SawAll wraps the identical expression in a local named
`isLootableBody` at `OSA_Scan.lua:59-61`. Two names, one predicate. It is the
built-in default -- see `acceptBody` above.

**Loose world items are deliberately not collected.** They are world objects,
not container contents. The engine builds its own `floor` container covering the
adjacent squares at craft time (`BaseCraftingLogic.java:799`) and clears any
container of that type it finds in the list, so a wider synthetic one would be
wiped -- and removing an item from a fake container leaves the sprite on the
ground. Bags on the floor are real containers and are safe. Each consumer
gathers loose items its own way.
