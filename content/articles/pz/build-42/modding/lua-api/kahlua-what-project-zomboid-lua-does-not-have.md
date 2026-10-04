---
id: build-42-kahlua-what-project-zomboid-lua-does-not-have
slug: kahlua-what-project-zomboid-lua-does-not-have
title: "Kahlua: what Project Zomboid's Lua does not have"
game: pz
version: build-42
section: modding
category: lua-api
difficulty: intermediate
tags:
  - lua
  - kahlua
  - stdlib
  - testing
  - files
excerpt: >-
  Project Zomboid runs Kahlua, a smaller Lua than the one on your computer. No
  next, no io, no table.pack, no math.random, no shutdown event, no file flush.
  The full list read from the 42.21 game, and the test-harness trap that let us
  ship code the game cannot run.
last_updated: '2026-10-04'
related_articles:
  - lua-api-and-engine-overview
  - engine-internals-calling-exposed-java-from-lua
  - mod-file-traps-load-order-split-files-bom-xml
  - check-kahlua
---
# Kahlua: what Project Zomboid's Lua does not have

Outcast, the Lua inside Project Zomboid is not the Lua you installed on your computer. It is Kahlua, a Lua 5.1-era engine written in Java, and it has a smaller library. Code that runs perfectly in a normal Lua can die on its first line in the game. We crashed a live mod on `next()`, and our test suite passed the whole time. Here is the list, read from the game itself.

## Where the library comes from

The game builds its Lua world in two steps: Java registers a set of libraries, then the game runs a small Lua file, `stdlib.lua` in the game's install folder, which adds a few more functions written in Lua. So some "standard" functions exist only because that file defines them.

> **Proof:** Code. `se.krka.kahlua.j2se.J2SEPlatform#setupEnvironment` (registers `MathLib`, `BaseLib`, `RandomLib`, `StringLib`, `CoroutineLib`, `OsLib`, `TableLib`, `LuaCompiler`, then runs `stdlib.lua`), reached from `zombie.Lua.LuaManager#init`; read from the game's jar with `javap`, since Kahlua is not in our decompile. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What is missing

| You might reach for | In Project Zomboid |
|---|---|
| `next` | **Does not exist.** Use `pairs`. Empty check: `for _ in pairs(t) do return false end return true` |
| `io` (any of it) | **Does not exist.** Use the game's file functions, below. |
| `table.pack`, `table.unpack`, `table.move` | **Do not exist.** Use the global `unpack`. |
| `dofile`, `rawlen` | **Do not exist.** |
| `math.random`, `math.randomseed` | **Do not exist.** Use the game's `ZombRand(min, max)` and `ZombRandFloat`. |
| `os.clock`, `os.getenv`, `os.exit` | **Do not exist.** `os` has only `date`, `time` and `difftime`. |
| `string.len`, `string.rep`, `string.gmatch` | Exist, defined in `stdlib.lua`. |
| `math.max`, `math.min` | Exist, defined in `stdlib.lua`. |
| `table.sort` | Exists, a quicksort in `stdlib.lua`. |
| `assert`, `pairs`, `ipairs` (globals) | Exist, set up in `stdlib.lua`. |
| `coroutine.wrap` | Exists, from `stdlib.lua`. The Java part has `create`, `resume`, `yield`, `status`, `running`. |
| `loadstring` | **Exists.** We had written that it did not. It is registered by the Lua compiler. |

Extras Kahlua has that normal Lua does not: `table.wipe`, `table.isempty`, `table.newarray`, and on strings `trim`, `split`, `contains` and `sort`.

> **Proof:** Code. Name tables in the game jar: `se.krka.kahlua.stdlib.BaseLib` (pcall, print, select, type, tostring, tonumber, getmetatable, setmetatable, error, unpack, setfenv, getfenv, rawequal, rawset, rawget, collectgarbage, debugstacktrace, bytecodeloader), `TableLib` (concat, insert, remove, newarray, pairs, isempty, wipe, ipairs), `OsLib` (date, difftime, time), `CoroutineLib` (create, resume, yield, status, running), `StringLib`, `MathLib` (no `random`), `RandomLib` (only `newrandom`), `se.krka.kahlua.luaj.compiler.LuaCompiler#register` (`loadstring`, `loadstream`); the install's `stdlib.lua`; no definition of `next`, `io`, `table.pack`, `table.unpack`, `table.move`, `dofile` or `rawlen` anywhere in the Java or the vanilla Lua. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### One vanilla call site is not proof

While hunting for `next`, we found vanilla calling it once, in `ISPriorityTable.lua`, inside an iterator function. We took that as proof `next` existed. It does not: that line would throw if it ever ran, and it evidently never does. A function used once in vanilla, on a path nobody exercises, proves nothing. Look for where the game defines it.

> **Proof:** Code. `media/lua/shared/Util/ISPriorityTable.lua`, `self.keyIterator` (the only bare `next(` call in the vanilla Lua). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Java objects: methods yes, fields no

When Lua holds a Java object, it can call the object's public methods. It cannot read its public instance fields: Kahlua binds methods, and copies only public static fields, once, into the class table. Reading an instance field gives `nil`, every time, without an error. If there is no getter, the value is out of reach.

The same rule explains a shape trap: `getCell():getVehicles()` returns a Java `Set`, which has `size()` but no `get(i)`. The usual `for i = 0, v:size() - 1 do v:get(i) end` loop dies with "tried to call nil". Use the iterator:

```lua
local it = getCell():getVehicles():iterator()
while it:hasNext() do
    local vehicle = it:next()
end
```

And since a missing method reads as `nil` instead of raising, `if coll.iterator then ... end` is a free way to check what you were handed.

> **Proof:** Code. `se.krka.kahlua.integration.expose.LuaJavaClassExposer` (`exposeMethods` binds methods; `exposeStatics` binds only fields that are public and static); `zombie.iso.IsoCell#getVehicles` (returns a `Set`, backed by a `HashSet`); `zombie.Lua.LuaManager` exposes `HashSet` and `Iterator`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## pcall hides the error, not the noise

`pcall` catches the error, but Kahlua has already printed it. Every error inside the Lua engine is logged with a Java exception and a Lua stack trace before it is handed back to your `pcall`. So a `pcall` around something that fails every tick fills the console with stack traces while your code carries on as if nothing happened. Do not wrap engine calls in `pcall` "just in case". Where you genuinely must guard something that can keep failing, switch it off after the first failure and report it once.

> **Proof:** Code. `se.krka.kahlua.vm.KahluaThread#luaMainloop` (its catch-all handler calls `ExceptionLogger.logException` and builds the stack trace before unwinding to `pcall`); `KahluaThread#pcall` itself does not log. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## An error in a wrapped vanilla function takes others down with it

Mods often wrap a vanilla function: keep the old one, replace it with yours, call the old one inside. When several mods wrap the same function, they form a chain. If your layer raises an error, everything **outside** your layer in the chain stops too, not just your code. We once saw a stack trace run through our radial menu wrapper and two other mods' wrappers before reaching vanilla: our bug was removing two other mods' menu entries. Check your inputs inside a wrapper and return the old function's result rather than letting an error escape.

> **Proof:** Game test. Seen in a player's game during a multiplayer session (the radial menu runs on the player's side): one error in our wrapper of the vehicle radial menu, a stack passing through two other mods' wrappers of the same function, and their menu entries missing. Build 42.20.

## Writing files

There is no `io`. The game gives you `getFileWriter(name, createIfMissing, append)` (and `getModFileWriter`, `getFileReader`, `fileExists`). What we learned about the writer:

- **No flush.** The writer has `write`, `writeln` and `close`, nothing else, and nothing reaches the disk until `close`. Do not keep one open "and flush later": buffer lines in a Lua table and open, append, close in batches.
- **Only some extensions.** The name must end in `ini`, `cfg`, `txt`, `log` or `json`, in lower case; anything else, or a path with `..` in it, returns `nil` instead of raising. Check for `nil`.
- **Where it goes.** A name is placed in the `Lua` folder of the Zomboid user folder (`~/Zomboid/Lua/`).
- **There is no shutdown event.** No `OnGameExit` exists in Build 42; we checked every event the game registers. `if Events.OnGameExit then ... end` is the worst version: the guard makes a dead hook look healthy. Quitting saves, and the game raises `OnPostSave` after that save, so use `OnPostSave`, plus `EveryOneMinute` as a backstop for crashes, and `OnDisconnect` for a client leaving a server.

> **Proof:** Code. `zombie.Lua.LuaManager.GlobalObject.LuaFileWriter` (only `write`, `writeln`, `close`; the `PrintWriter` has no autoflush); `zombie.Lua.LuaManager.GlobalObject#getFileWriter` (`ALLOWED_FILE_EXTENSIONS = Set.of("ini", "cfg", "txt", "log", "json")`, `hasRelativePath`, `getLuaCacheDir()`); `zombie.Lua.LuaEventManager` (262 registered events, none on exit); `zombie.GameWindow#exit` (saves, then `triggerEvent("OnPostSave")`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The trap that let it ship: a kinder test harness

Many of us test mod logic outside the game with a normal Lua and some stand-ins (test doubles) for the game's objects. That is a good habit, with one rule: **the stand-ins must be stricter than the game, never kinder.**

Our `next()` crash passed 21 assertions in a stock Lua 5.4, because stock Lua has `next`. Our `getVehicles():get(i)` crash passed 100 assertions, because our stand-in for the vehicle set was a list with a `get`. The suite was not silent about those bugs: it vouched for them.

- Before running mod code in an outside Lua, remove what Kahlua lacks (`next`, `io`, `table.pack`, `table.unpack`, `table.move`, `dofile`, `rawlen`, `math.random`) and trim `os` to `date`, `time` and `difftime`, so the harness fails where the game would.
- Model each game object with exactly the methods the game gives it, and add one assertion on the stand-in's own shape (for example that the vehicle set has no `get`), so a later edit cannot quietly make it kind again.
- Prove each such test by breaking the code on purpose and watching it go red.
- Watch the numbers too: Lua 5.4 has a separate integer type, Kahlua has only floating point numbers. Compare numbers with a tolerance.

Our [check-kahlua.py](/pz/build-42/modding/tooling/check-kahlua) tool checks a mod's Lua for the missing functions.

> **Proof:** Game test. The `next()` call crashed a shipped mod on its first update in game while its off-game suite passed; the `get(i)` loop threw on the first radial menu open in a multiplayer session while its suite, built on a list-shaped stand-in, passed. Build 42.20.
