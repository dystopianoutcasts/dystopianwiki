---
id: build-42-ol-options
slug: ol-options
title: OL_Options
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
excerpt: 'Returns a getter bound to one mod:'
last_updated: '2026-09-29'
related_articles:
  - implementation-status
  - ol-init
  - ol-containers
  - ol-reach
  - ol-squares
  - ol-compat
  - ol-vehicleparts
  - ol-debug
  - log-file-location
  - log-line-visibility
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# OL_Options

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### `OutcastLib.Options.reader(modId, defaults) -> function(id) -> value`

Returns a getter bound to one mod:

```lua
local optionValue = OutcastLib.Options.reader(OP.MOD_ID, OP.DEFAULTS)
function OP.getRadius() return optionValue("radius") end
```

**This existed three times, byte-identical.** Normalising the mod alias,
`OP_Options.lua:39`, `ORA_Options.lua:43` and `OSA_Options.lua:33` all hash to
the same value -- not "similar", the same function written out three times. That
is `install-junctions.ps1` happening again in Lua: three copies, one name's
difference, and no gate that would catch them drifting.

The library does **not** build option panels. Every panel differs -- different
controls, labels and ranges -- and the only identical part is reading a value
back out with a fallback.

The getter **never returns `nil`**. It falls back to `defaults[id]` when the
panel has not been built yet, or `ModOptions.ini` is missing or unreadable, so no
caller needs to guard. That is why all three copies existed.

#### `id` must be a key of `defaults`, and this is now enforced

The three originals coupled the option id to the `DEFAULTS` key by convention
with nothing checking it -- SawAll registers `"unstack"` and reads
`DEFAULTS.unstack`. A renamed option id therefore served the default forever,
which is indistinguishable from a player who never touched the setting.

An id with no default now **raises**: the contract is "never returns `nil`", and
for such an id there is nothing to return.

#### A missing option complains exactly once

When the panel exists but the id is not in it, the getter prints one line and
then serves the default silently for the rest of the session.

Once, not per call, and not never. Getters run per frame, and **Kahlua prints a
full Java + Lua stack trace for anything raised, even under `pcall`** -- verified
in game -- so a per-call complaint would bury the console. But staying silent
would reinstate exactly the renamed-id failure above.

This is the same latch used by `Debug.isEnabled`, for the same reason.

#### Caching

Only a *hit* is cached. The panel is built during load, so an early miss must not
be remembered as "this mod has no options" for the whole session.

`Options.reset()` clears both caches. Test-harness affordance; not called by
shipped code.

> **Note on the fourth idiom.** OutcastStowAll solved this differently -- holding
> option objects and reading through a `pcall`'d `value()`. That is not the
> canonical form and was not adopted: `pcall` on every read is precisely what the
> Kahlua stack-trace behaviour punishes. StowAll is abandoned, so the question is
> moot, but the reasoning is recorded so it is not re-litigated.
