---
id: build-42-ol-debug
slug: ol-debug
title: OL_Debug
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
  Returns a gated log(...) bound to prefix. No output unless that prefix is
  switched on. Arguments are tostring'd and space-joined, so callers never build
  strings themselves -- which matters...
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
  - log-file-location
  - log-line-visibility
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# OL_Debug

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

### `OutcastLib.Debug.logger(prefix, gate) -> function`

Returns a gated `log(...)` bound to `prefix`. No output unless that prefix is
switched on. Arguments are `tostring`'d and space-joined, so callers never build
strings themselves -- which matters, because building the string at the call site
costs concatenation even when the gate is off.

```lua
local log = OutcastLib.Debug.logger("OutcastStowAll", OST.getDebug)
log("routing", item:getFullType(), "->", dest:getType())
-- [OutcastStowAll] routing Base.Nails -> crate
```

### `OutcastLib.Debug.setEnabled(prefix, on)`
### `OutcastLib.Debug.isEnabled(prefix) -> boolean`

`on` may be a boolean or a **function returning one**. Pass the function form
when the switch is a live option the player can flip mid-session; pass the
boolean when it is read once at load. The family has mods of each kind.

The optional second argument to `logger` is the same value, set in one call.

**A gate that throws reads as off, and then latches off.** A consumer's option
getter can itself fail before its options file has loaded, and logging must never
be the thing that takes down a mod -- so the gate call is wrapped and a failure
means silence rather than a propagated error. This is the one place in the
library where a swallowed failure is correct, and it is narrow: it swallows the
*gate's* error, never a caller's.

On the first failure the gate is set to `false` permanently for the session and
one named line is printed saying so. **This is not tidiness -- Kahlua prints a
full Java + Lua stack trace for every `pcall`'d error.** Confirmed in game: the
M0 probe's deliberate version-floor test produced a 25-line dump despite being
caught. Without the latch, a broken gate would emit that trace on every single
log call and bury the console in the noise that logging was meant to stay out of.

The same fact is worth knowing at every call site: **`pcall` in PZ suppresses the
error, not the stack trace.** Do not use it speculatively in a hot path.

`Debug.reset()` clears every gate. Test-harness affordance; not called by shipped
code.
