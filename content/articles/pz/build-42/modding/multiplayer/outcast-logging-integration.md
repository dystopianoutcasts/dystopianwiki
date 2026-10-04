---
id: build-42-outcast-logging-integration
slug: outcast-logging-integration
title: Outcast Lib -- logging integration
game: pz
version: build-42
section: modding
category: multiplayer
difficulty: intermediate
tags:
  - outcast-lib
  - logging
  - multiplayer
excerpt: 'A shared, timestamped, downloadable log for Project Zomboid Build 42 mods.'
last_updated: '2026-10-04'
---
# Outcast Lib -- logging integration

> Source: OutcastLib/docs/LOGGING-INTEGRATION.md (compiled 2026-09-08, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**A shared, timestamped, downloadable log for Project Zomboid Build 42 mods.**

Version 1.0 -- 2026-09-08
Applies to OutcastLib v2 (Steam Workshop id `3778987608`), Build 42.20.0+

---

## 0. If you read nothing else

Three lines get your mod logging into a file a server admin can actually download:

```lua
local OL = OutcastLib
OL.Debug.setFile("Outcast.log", "YourModId")        -- once, at load
OL.Debug.note("YourModId", "loaded, version 1.2")   -- ungated: always written
```

Add `require=OutcastLib` to your `mod.info`. That is the whole integration.

**Your lines land in** `Zomboid/Logs/<launch>_Outcast.txt` -- the same folder as
`DebugLog-server.txt`, which means it is inside the log bundle a server admin
downloads from their host panel.

**For error codes that must be visible when debug mode is off, use
`Debug.note()`.** It ignores every gate. See section 5.

---

## 1. The problem this solves

Most PZ mods log with `print()`. On a client that goes to `console.txt`. That is
fine when you are sitting at the machine, and useless in every other case:

- **You cannot read another player's `console.txt`.** It is on their computer.
- **You cannot read another player's mod log**, wherever the mod writes it.
- On a **dedicated server**, the only files an admin can obtain are the server's
  own bundle: `DebugLog-server.txt`, `chat`, `cmd`, `connections`, `admin`,
  `user`, `item`, `map`, `pvp`, `PerkLog`, `ClientActionLog`.

So when a player reports "your mod broke", you usually have nothing. The player
is not going to find `Zomboid/console.txt`, and if they do it is thousands of
lines of engine output with your mod somewhere inside it.

OutcastLib writes through the game's own logger, so your lines land **in that
downloadable bundle**, with a real timestamp on every line, in a file named for
the launch it belongs to.

### What you get per line

```
[08-09-26 16:37:02.145] [   12.40] [YourModId] engine failed to start: no spark plug.
 ^ wall clock, engine-added   ^ seconds into this Lua state   ^ your prefix
```

The wall clock answers *when*. The elapsed figure answers *how far into this Lua
state*, which is what orders a boot sequence. Both are useful and you get both
for free.

### And what the engine does around it

- **Filename carries the launch**: `2026-09-08_16-37_Outcast.txt`, so two
  sessions never mix.
- **Old launches are archived** into `logs_<date>/` folders automatically at
  startup.
- **A Lua reload does not lose anything.** Returning to the main menu
  re-executes every Lua file, but the logger is a Java object that survives it,
  so the file keeps appending.

---

## 2. Requirements and installation

| | |
|---|---|
| Game build | Build 42, `versionMin=42.20.0` |
| OutcastLib | Workshop id `3778987608` |
| Your `mod.info` | must contain `require=OutcastLib` |

### mod.info

```ini
name=Your Mod
id=YourModId
description=...
author=...
versionMin=42.20.0
require=OutcastLib
```

**`require=` resolves against what is INSTALLED, not the order of `Mods=`.** If
OutcastLib is missing, the game marks your mod unavailable and says so in the
log rather than failing later in a confusing way.

### Dedicated servers

The server needs the library **downloaded**, which is `WorkshopItems=`, not
`Mods=`:

```ini
WorkshopItems=3778987608;<your id>;...
Mods=OutcastLib;YourModId;...
```

`WorkshopItems=` makes the server fetch it. `Mods=` makes it active. Omitting it
from `WorkshopItems=` is what produces `required mod "OutcastLib" not found`.

---

## 3. Quick start, in full

Put this in a file under `media/lua/shared/YourModId/`:

```lua
YourMod = YourMod or {}
local M = YourMod

M.MOD_ID  = "YourModId"
M.VERSION = "1.2.0"

-- Your own debug switch. A sandbox option, a mod option, or just a boolean.
function M.isDebug() return M.debugEnabled == true end

local function lib()
    -- Resolved LAZILY, never cached at file scope. See section 8.
    return OutcastLib and OutcastLib.Debug or nil
end

-- Gated: costs nothing when debug is off.
-- The logger is built ONCE and reused. logger() allocates a closure, so calling
-- it on every log line would allocate per line -- avoidable, and the kind of
-- thing that ends up inside an update loop by accident.
local gatedLog
function M.log(...)
    local d = lib()
    if d then
        gatedLog = gatedLog or d.logger(M.MOD_ID)
        gatedLog(...)
    elseif M.isDebug() then
        print("[" .. M.MOD_ID .. "]", ...)
    end
end

-- UNGATED: always written, even with debug off. Use for errors.
function M.note(...)
    local d = lib()
    if d then d.note(M.MOD_ID, ...) else print("[" .. M.MOD_ID .. "]", ...) end
end

function M.startLogging()
    local d = lib()
    if d == nil then
        print("[" .. M.MOD_ID .. "] OutcastLib not present -- console only.")
        return
    end
    d.setEnabled(M.MOD_ID, M.isDebug)         -- function form: re-read live
    d.setFile("Outcast.log", M.MOD_ID)        -- see section 7 before changing this
    M.note(M.MOD_ID .. " " .. M.VERSION .. " loaded. Log: " .. tostring(d.fileTarget()))
end

Events.OnGameStart.Add(M.startLogging)
Events.OnServerStarted.Add(M.startLogging)    -- so a dedicated server logs too
```

**Register both events.** A client fires `OnGameStart`; a dedicated server fires
`OnServerStarted`. If you only register the first, your mod is silent on the
server -- which is the one place the logs are readable.

---

## 4. The two channels

OutcastLib gives you exactly two ways to write a line. The difference is whether
a switch can silence it.

### `Debug.logger(prefix [, gate])` -- GATED

Returns a function. Writes nothing at all when the prefix is switched off, so you
can leave calls in shipped code and pay nothing.

```lua
local log = OutcastLib.Debug.logger("YourModId", YourMod.isDebug)
log("scanning", 42, "containers")     -- silent unless the gate says yes
```

Use for: verbose diagnostics, per-tick values, traces, anything you would be
embarrassed to ship switched on.

### `Debug.note(prefix, ...)` -- UNGATED

Writes **always**, ignoring every gate, and flushes immediately.

```lua
OutcastLib.Debug.note("YourModId", "config file missing, using defaults")
```

Use for: the handful of facts that must be visible when logging is off. Your boot
line, and **errors**.

> **Why it exists.** A session was once logged with the debug option off, which
> is the default, and the resulting log contained only the file header. That is
> indistinguishable at a glance from a mod that crashed, or never loaded. The one
> line that would have explained it was itself gated.

---

## 5. Error codes visible outside debug mode

This is the case OutcastLib is best at, and `Debug.note` is the tool.

### The pattern

```lua
-- Keep codes in one table so they are greppable and cannot drift.
M.ERR = {
    NO_CONFIG      = "E001",
    BAD_ITEM_TYPE  = "E002",
    SERVER_ONLY    = "E003",
}

--- Report a fault. ALWAYS written, debug on or off.
--- @param code   string  one of M.ERR
--- @param detail string  what actually happened, with the value in it
function M.fault(code, detail)
    OutcastLib.Debug.note(M.MOD_ID, code .. ": " .. tostring(detail))
end
```

Call it where the fault is detected:

```lua
local item = getScriptManager():getItem(fullType)
if item == nil then
    M.fault(M.ERR.BAD_ITEM_TYPE, "no such item: " .. tostring(fullType))
    return
end
```

Which produces, in a file the admin can download:

```
[08-09-26 16:41:19.882] [  184.02] [YourModId] E002: no such item: Base.Frobnicator
```

### Rules that make error logs actually usable

1. **Put the value in the message.** `E002: no such item: Base.Frobnicator` can
   be acted on. `E002: bad item type` cannot.
2. **One code per distinct cause**, not per call site. If two call sites report
   the same code, the message must distinguish them.
3. **Report the expected value as well as the measured one.** `condition 0 of an
   expected 1..100` tells the reader whether your assumption or the data is
   wrong. A line reporting only what happened relies on the reader knowing what
   should have happened, and that is what usually fails.
4. **Do not report the same fault every tick.** Latch it -- see below.
5. **Never gate an error.** If it is worth a code, it is worth `note()`.

### Latching a repeating fault

A fault inside an update loop will otherwise write thousands of identical lines
and bury everything else.

```lua
local complained = {}

function M.faultOnce(code, detail)
    if complained[code] then return end
    complained[code] = true
    OutcastLib.Debug.note(M.MOD_ID, code .. ": " .. tostring(detail)
        .. " (reported once per session)")
end
```

### A caution about `pcall`

**Kahlua prints a full Java and Lua stack trace for every `pcall`'d error, even
though the error is caught.** Catching an exception does not make it quiet. So:

- do not call something that throws on every tick and rely on `pcall` to hide it
- latch the guard off after the first failure, and say once that you did

---

## 6. API reference

Everything lives under `OutcastLib.Debug`. Arguments are `tostring`'d and joined
with a single space, so you never build strings at the call site.

### `Debug.logger(prefix [, gate]) -> function`

Returns a gated log function bound to `prefix`.
`prefix` must be a non-empty string or it raises.
`gate`, if given, is passed to `setEnabled`.

### `Debug.note(prefix, ...) -> string`

Writes one line ignoring all gates, flushes, returns the line.
`prefix` must be a non-empty string or it raises.

### `Debug.setEnabled(prefix, on)`

`on` may be a **boolean** (read once) or a **function returning a boolean**
(re-read on every call -- use this when the player can flip the option
mid-session).

> If your gate function throws, OutcastLib treats it as *off*, latches it off for
> the session, and prints one line saying so. Logging will never be the thing
> that takes your mod down.

### `Debug.isEnabled(prefix) -> boolean`

### `Debug.setFile(filename [, consumerName]) -> filename`

Opens the shared log. **Read section 7 before calling with anything other than
`"Outcast.log"`.** `consumerName` is only used to name you in a redirect warning.
Passing `nil` as the filename stops the sink, flushing first.

### `Debug.fileTarget() -> string|nil`

Where lines are **actually** going. Use this in your boot line rather than a
hardcoded filename -- it stays correct when the destination changes, and it has
already changed once.

### `Debug.flush() -> number|nil`

Rarely needed. `note()` flushes on its own, and the engine channel is unbuffered.

### `OutcastLib.require(minVersion, consumerName) -> OutcastLib`

Version handshake. Raises a named error if the installed library is older.

```lua
local OL = OutcastLib.require(2, "YourModId")
```

**It answers "is the shape I depend on compatible", not "is this new enough to
have feature X".** Additive features do not bump the version -- see section 8.

---

## 7. The one rule that protects everyone

**Call `setFile("Outcast.log")`, or do not call `setFile` at all.**

There is exactly **one** file sink in the library, shared by every mod. Calling
it with a different name does not open a second stream -- it **redirects
everyone's output**, yours and every other mod's, to your file:

```
[OutcastLib] file log redirected from 'Outcast.log' to 'MyMod.log' by MyModId.
             There is only one file sink; the last caller wins.
```

The engine channel is derived from that name, so every mod's lines would move to
`Logs/<launch>_MyMod.txt`. It is not destructive and it is announced, but it is
almost certainly not what you meant.

**Several mods calling `setFile("Outcast.log")` is the expected case.** The
second and later callers are no-ops. That is the design: one shared file, one
timeline, so a reader can correlate your mod with the others by timestamp instead
of by hand.

If you genuinely need your own separate file, say so to the OutcastLib maintainer
rather than calling `setFile` with a new name -- a per-mod channel is a small
change to the library and a large surprise to everyone if done from outside.

---

## 8. Defensive integration

### Resolve the library lazily

```lua
-- WRONG: captured at file scope, before load order is settled.
local Debug = OutcastLib.Debug

-- RIGHT: resolved when used.
local function lib() return OutcastLib and OutcastLib.Debug or nil end
```

Mods load in the order of the mod list, not by name. `require=OutcastLib`
guarantees the library loads first, but a file of yours that is executed during
load may still run before you expect. Resolving on use costs one table lookup and
removes the question.

> **Proof:** Code. `zombie.Lua.LuaManager#LoadDirBase(String, boolean)` (vanilla files sorted by path, then each mod in `zombie.ZomboidFileSystem#getModIDs` order, its files sorted only within that mod) and `zombie.ZomboidFileSystem#loadMods(List)` with `#loadModAndRequired` (the mod list in its own order, each mod's `require=` mods added just ahead of it). Build 42.21.0 (revision 4a0e9546ec).

### Feature-detect. Do not version-check

Additive features do not bump `OutcastLib.VERSION`, so a version check cannot
tell you whether a method exists. **Check the method you are about to call:**

```lua
local d = OutcastLib and OutcastLib.Debug
if d and type(d.note) == "function" then
    d.note(M.MOD_ID, "...")
end
```

**Check the feature, not the container.** `OutcastLib.Debug ~= nil` tells you the
module is there; it tells you nothing about whether the function you want is on
it.

### Fail soft

If OutcastLib is absent, fall back to `print()`. Your mod should degrade, not
break:

```lua
function M.note(...)
    local d = lib()
    if d and type(d.note) == "function" then d.note(M.MOD_ID, ...)
    else print("[" .. M.MOD_ID .. "]", ...) end
end
```

### Say something at load, always

Print one ungated line saying your mod loaded and whether it will say anything
else. Without it, "the log is empty" and "the mod never loaded" look identical.

```lua
M.note(M.MOD_ID .. " " .. M.VERSION .. " loaded. Debug=" .. tostring(M.isDebug())
    .. ". Log: " .. tostring(lib().fileTarget()))
```

---

## 9. Where the lines actually go

| destination | on a client | on a dedicated server |
|---|---|---|
| `print()` | `console.txt`, local only | `DebugLog-server.txt` -- **downloadable** |
| OutcastLib channel | `Logs/<launch>_Outcast.txt` | `Logs/<launch>_Outcast.txt` -- **downloadable** |

OutcastLib does **both**: every line is `print()`ed and written to the channel.
So your output reaches the server bundle twice over, and you do not have to think
about it.

**The rule that follows:** anything needed to diagnose a player who is not you
must be emitted from code that runs **server-side**. A line written only on a
client is invisible to the admin however well it is formatted. If a check can run
server-side, run it there.

### Practical notes

- The engine truncates and reopens any log file once it passes **10,000 KB**.
  That is engine behaviour, identical for `DebugLog-server.txt`, and not
  something a mod can guard. Do not write per-frame.
- Allowed log extensions are `ini`, `cfg`, `txt`, `log`, and since Build 42.21
  also `json`. The extension is taken from the **last** dot, so `Outcast.log.1`
  is rejected while `Outcast.prev.log` is fine.

> **Proof:** Code. `zombie.Lua.LuaManager.GlobalObject#getFileWriter` checks `ALLOWED_FILE_EXTENSIONS` (`ini`, `cfg`, `txt`, `log`, `json`) against `zombie.ZomboidFileSystem#getFileExtension` (text after the last dot). Build 42.21.0 (revision 4a0e9546ec).

- Build 42.21 added two launch options that change the name of every log file,
  `DebugLog-server.txt` and ours included. `-debugLogFile=<name>` puts `<name>_`
  in front of the logger's name, and `-useTimeStampedLogFileNames=false` drops
  the `<launch>_` timestamp. With neither option the names are the ones on this
  page. If the files on your host are named differently, read the server's
  launch line before anything else.

> **Proof:** Code. `zombie.core.logger.LoggerManager#getLogFilePath`, `#setLogFilePrefixRaw`, `#setUseTimeStampedLogFileNames`; both options read in `zombie.network.GameServer#main` and `zombie.gameStates.MainScreenState#main`. Build 42.21.0 (revision 4a0e9546ec).

---

## 10. Engine facts worth knowing

These are verified against the Build 42 decompile and each one has cost somebody
a day.

**Project Zomboid's Lua exposes Java METHODS. It does not expose public instance
fields.** A class being reachable from Lua does not make its fields reachable. A
bare `public int` with no getter reads as **`nil`, silently** -- no error, no
trace, nothing to grep for. One mod's offline mechanic was inert on every server
it ever ran on because of this. If a value is only a public field, you cannot
read it; look for a getter, and confirm the getter is on the class you think it
is.

**A returned object is only useful if its own class is exposed too.** Copying a
Java idiom like `something.asConfigOption().getValueAsString()` into Lua fails if
the intermediate class is not exposed, even when the outer call works.

**Kahlua prints a full stack trace for every `pcall`'d error.** Catching it does
not silence it. Latch guards off after the first failure.

**A `nil` that means "unreachable" looks exactly like a `nil` that means "not set
yet".** This is the most expensive shape in PZ modding. When a value is
unexpectedly `nil`, establish which of the two it is before building on it.

---

## 11. Complete template

Save as `media/lua/shared/YourModId/YourMod_Log.lua`.

```lua
YourMod = YourMod or {}
local M = YourMod

M.MOD_ID  = "YourModId"
M.VERSION = "1.0.0"

M.ERR = {
    NO_CONFIG     = "E001",
    BAD_ITEM_TYPE = "E002",
}

M.debugEnabled = false
function M.isDebug() return M.debugEnabled == true end

local function lib() return OutcastLib and OutcastLib.Debug or nil end

local function has(fn)
    local d = lib()
    return d and type(d[fn]) == "function" and d or nil
end

--- Gated. Silent unless debug is on.
-- Built once and cached: logger() allocates a closure, so calling it per line
-- would allocate per line.
local gatedLog
function M.log(...)
    local d = has("logger")
    if d then
        gatedLog = gatedLog or d.logger(M.MOD_ID)
        gatedLog(...)
    elseif M.isDebug() then print("[" .. M.MOD_ID .. "]", ...) end
end

--- Ungated. Always written.
function M.note(...)
    local d = has("note")
    if d then d.note(M.MOD_ID, ...)
    else print("[" .. M.MOD_ID .. "]", ...) end
end

--- A fault with a code. Always written.
function M.fault(code, detail)
    M.note(tostring(code) .. ": " .. tostring(detail))
end

--- A fault reported once per session.
local complained = {}
function M.faultOnce(code, detail)
    if complained[code] then return end
    complained[code] = true
    M.fault(code, tostring(detail) .. " (reported once per session)")
end

function M.startLogging()
    local d = lib()
    if d == nil then
        print("[" .. M.MOD_ID .. "] OutcastLib not installed -- console only. "
            .. "Add require=OutcastLib to mod.info and install Workshop 3778987608.")
        return
    end
    if type(d.setEnabled) == "function" then d.setEnabled(M.MOD_ID, M.isDebug) end
    if type(d.setFile)    == "function" then d.setFile("Outcast.log", M.MOD_ID) end

    local where = (type(d.fileTarget) == "function" and d.fileTarget()) or "console only"
    M.note(M.MOD_ID .. " " .. M.VERSION .. " loaded. Debug=" .. tostring(M.isDebug())
        .. ". Log: " .. tostring(where))
end

if Events then
    if Events.OnGameStart     then Events.OnGameStart.Add(M.startLogging) end
    if Events.OnServerStarted then Events.OnServerStarted.Add(M.startLogging) end
end
```

---

## 12. Checklist

- [ ] `require=OutcastLib` in `mod.info`
- [ ] Workshop id `3778987608` in the server's `WorkshopItems=`
- [ ] Library resolved **lazily**, not captured at file scope
- [ ] Methods **feature-detected** before use, not version-checked
- [ ] Falls back to `print()` when the library is absent
- [ ] `setFile("Outcast.log")` -- never a different filename
- [ ] Registered on **both** `OnGameStart` and `OnServerStarted`
- [ ] One ungated boot line, using `fileTarget()` rather than a hardcoded name
- [ ] Errors use `note()`, never `logger()`
- [ ] Repeating faults are latched
- [ ] Error messages carry the offending **value**, and the expected one where
      there is one
- [ ] The gated logger is built **once** and reused, not rebuilt per call
- [ ] Nothing logs per frame

---

## 13. Getting help

OutcastLib is Workshop id `3778987608`, Build 42 only, no dependencies of its
own. It adds no gameplay and has no network surface -- nothing it does can
desync.

If you need something the library does not offer -- a per-mod channel, a
structured error format, a helper this guide does not describe -- ask rather than
working around it. A change made once inside the library is better than four mods
each solving it differently, which is the situation the library exists to
prevent.

*Corrected 2026-10-04: mods do not load alphabetically. They load in mod-list order, each mod's `require=` mods first; only the files inside one mod are sorted by name.*

*Updated 2026-10-04 for Build 42.21: `json` joins the allowed log extensions; two new launch options can rename log files; the mod load order was re-checked and is unchanged.*
