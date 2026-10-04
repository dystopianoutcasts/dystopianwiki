---
id: build-42-log-line-visibility
slug: log-line-visibility
title: Where a log line has to go to be readable
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
  Established 2026-08-26 by us, and it corrects an assumption this module
  was built on.
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
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# Where a log line has to go to be readable

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Established 2026-08-26 by us, and it corrects an assumption this module
was built on.

**You cannot read another player's `console.txt`, and you cannot read another
player's `Outcast.log`.** Both live on that person's machine. The only logs an
admin can actually obtain from a multiplayer session are the server's own set,
downloaded as a bundle:

```
DebugLog-server.txt   chat  cmd  connections  admin  user
item  map  pvp  PerkLog  ClientActionLog
```

**There is no `Outcast.log` in that bundle.** The server writes one -- `shared/`
runs in the server Lua state, so the sink is live there -- but it lands in the
server box's `Zomboid/Lua/` and is not part of what gets shipped to an admin.

### What that means for each destination

| destination | client | dedicated server |
|---|---|---|
| `print()` | `console.txt`, local only | **`DebugLog-server.txt` -- DOWNLOADABLE** |
| file sink | `Outcast.log`, local only | server's `Outcast.log`, **unreachable** |

So the sink's value is real but narrow: it is for **the machine you are sitting
at**. For diagnosing anybody else, `print()` is the only channel that arrives,
and on a dedicated server it is the one that matters.

`OL_Debug` already does both -- the gated logger and `note()` each `print()` and
`sinkWrite()` -- so consumers using either are covered without changing anything.
**This is written down because the reasoning at the top of `OL_Debug` is
client-centric** ("console.txt already receives everything print() emits, but it
is unusable"), and on a server that sentence inverts: the print destination is
the only usable one.

### The practical rule for consumers

**Anything needed to diagnose a player who is not you must reach `print()` from
the SERVER Lua state.** A line emitted only client-side is invisible to the
admin, however well it is formatted. If a check can run server-side, run it
there -- OutcastHusbandry's self-test is the worked example: it fires at server
boot, reaches `DebugLog-server.txt`, and that is the only reason anybody found
its mechanism had never worked.
