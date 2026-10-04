---
id: build-42-log-file-location
slug: log-file-location
title: Where the log file goes
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
  Changed 2026-09-08 by our decision, and it supersedes the section
  below, which correctly diagnosed the problem and then only documented it.
last_updated: '2026-10-04'
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
  - log-line-visibility
  - engine-facts-that-bite-the-whole-family
  - open-spikes-collected
---
# Where the log file goes

> Source: OutcastLib/docs/API.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**Changed 2026-09-08 by our decision, and it supersedes the section
below**, which correctly diagnosed the problem and then only documented it.

`OL_Debug` now writes through the engine's own channel:

```lua
writeLog(name, text)   -- global, Lua-callable, LuaManager
```

which reaches `LoggerManager.getLogger(name).write(text)` and lands in
**`<Zomboid>/Logs/<launch stamp>_<name>.txt`** -- the same folder, and the same
naming, as `DebugLog-server.txt` and every other file in the bundle an admin
downloads.

That is the default. Since Build 42.21 two launch options change the name of
every file in `Logs/`, ours included: `-useTimeStampedLogFileNames=false` drops
the launch stamp, and `-debugLogFile=<prefix>` puts a prefix in front of the
channel name (`<launch stamp>_<prefix>_Outcast.txt`). Both are read by the
dedicated server and by the client. The folder stays `Logs/`.

> **Proof:** Code. `zombie.core.logger.LoggerManager#getLogFilePath`, `#setUseTimeStampedLogFileNames`, `#setLogFilePrefixRaw`; the options are parsed in `zombie.network.GameServer#main` and `zombie.gameStates.MainScreenState#main`. Build 42.21.0 (revision 4a0e9546ec).

Nothing in any consumer changes. `Debug.setFile("Outcast.log")` still opens the
log; the channel name is derived from the filename, so `Outcast.log` becomes
channel `Outcast` and the file becomes `Logs/2026-09-08_16-37_Outcast.txt`.
`Debug.fileTarget()` reports the new destination, so the boot line every
consumer already prints tells the truth without being touched.

### What the engine gives us for free, that we were building by hand

| | old `Lua/Outcast.log` sink | engine `Logs/` channel |
|---|---|---|
| reachable by an admin | **no** | **yes -- it is in the download bundle** |
| wall-clock timestamps | no, only seconds-since-open | **yes**, `[dd-MM-yy HH:mm:ss.SSS]` per line, from `ZLogger.writeUnsafe` |
| which launch it belongs to | not recorded | **in the filename**, `getStartupTimeStamp()` |
| history | one file, overwritten | **`logs_<date>_<time>/` folders** (`logs_<date>/` before 42.21), rotated by `LoggerManager.backupOldLogFiles` |
| survives a Lua reload | only because we built truncate/trim/backup for it | **free** |

**That last row is the one worth understanding.** `LoggerManager.s_loggers` is a
Java `static HashMap` holding live `ZLogger` instances with open streams, and
`startupTimeStamp` is a static computed once per process. `LuaManager.init()`
wipes the Lua environment and touches neither -- so every Lua state in a launch
appends to the same open file. The entire truncate-on-open saga, the append-only
rewrite, the trim and its `.prev.log` backup, all of it was solving a problem the
engine does not have.

That machinery is **kept as the fallback**, feature-detected on `writeLog`, and
it is still correct. It is simply no longer the path anyone takes.

### The seconds-since-open stamp is kept, deliberately

Lines carry both: `[08-09-26 16:37:02.145] [   12.40] [OutcastMotors] ...`. The
wall clock answers *when*, and the elapsed figure answers *how far into this Lua
state* -- which is what orders a boot sequence, and what made the 13-state file
readable at all.

### One thing to know before it surprises somebody

`ZLogger.checkSizeUnsafe` reopens the file with a **new `PrintStream` when it
passes 10,000 KB**, which truncates it. That is the engine's behaviour, not
ours, and it is the same for `DebugLog-server.txt`. At the volumes this family
produces -- 1,339 lines for a 13-state day -- it is a long way off, but it is
there and it is not something we can guard.

*Updated 2026-10-04 for Build 42.21: two new launch options can rename the log files, and the backup folders now carry the time as well as the date.*
