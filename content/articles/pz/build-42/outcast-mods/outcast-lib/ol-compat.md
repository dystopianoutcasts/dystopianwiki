---
id: build-42-ol-compat
slug: ol-compat
title: OL_Compat
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
  Cached wrapper over getActivatedMods():contains(modId). One lookup per id per
  session: a mod cannot be enabled mid-session, so rechecking is waste.
last_updated: '2026-09-29'
related_articles:
  - implementation-status
  - ol-init
  - ol-containers
  - ol-reach
  - ol-squares
  - ol-options
  - ol-vehicleparts
  - ol-debug
  - log-file-location
  - log-line-visibility
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# OL_Compat

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### `OutcastLib.Compat.has(modId) -> boolean`

Cached wrapper over `getActivatedMods():contains(modId)`. One lookup per id per
session: a mod cannot be enabled mid-session, so rechecking is waste.

**Raises if the mod list is not built yet** -- when `getActivatedMods` is absent
or returns `nil`. Returning `false` for "I could not check" is indistinguishable
from "not installed" at the call site, and a conflict guard that silently reads
`false` is precisely the failure mode this library exists to stop (rule 4). In
practice: call it from `OnGameStart` or later, never at file scope.
`OutcastProximity`'s guard already does (`OP_Compat.lua:45`).

### Named probes

One function per known conflict, so the mod id string lives in exactly one place:

```lua
OutcastLib.Compat.hasProximityInventory()   -- "ProximityInventory"   VERIFIED
OutcastLib.Compat.hasOutcastProximity()     -- "OutcastProximity"     VERIFIED
OutcastLib.Compat.hasEasyDropNLoot()        -- "KADropnLoot"          unverified
OutcastLib.Compat.hasInventoryTetris()      -- "InventoryTetris"      unverified
OutcastLib.Compat.hasCleanUI()              -- "CleanUI"              unverified
OutcastLib.Compat.hasSearchContainers()     -- "SearchContainers"     unverified
OutcastLib.Compat.hasReorderContainers()    -- "ReorderContainers"    unverified
```

### `OutcastLib.Compat.idOf(name) -> string|nil`
### `OutcastLib.Compat.unverified() -> array`

**A typo'd mod id is the worst bug shape this family has**: the probe reads
`false` forever, the guard never fires, and nothing anywhere says so. So ids are
tracked by how much is actually known about them.

*Verified* means the id was read out of that mod's own `mod.info` or out of
working code in this family -- **not inferred from a Workshop title, which is a
different string and frequently not the id at all.** The two verified ids come
from `OP_Config.lua:18` and from our own repo. The other five are transcribed
from design notes; none of those mods is installed on this machine, so they have
never been confirmed against anything.

`unverified()` returns `{ { name =, id = }, ... }` sorted by name. A consumer
whose behaviour genuinely depends on one of these should log the list once at
startup, so a probe reading `false` because the id is wrong stays
distinguishable from one reading `false` because the mod is absent. Move an entry
to verified only after reading the id out of that mod's `mod.info`.

`Compat.reset()` clears the session cache. Test-harness affordance; not called by
shipped code.
