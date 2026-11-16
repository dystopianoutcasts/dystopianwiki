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
  Build 42.22 runs Kahlua, a smaller Lua 5.1-style engine. It has no next, io, debug, table.pack or math.random, and no exit event. The full list from the code, and how to test without hiding it.
last_updated: '2026-11-16'
related_articles:
  - lua-api-and-engine-overview
  - engine-internals-calling-exposed-java-from-lua
  - mod-file-traps-load-order-split-files-bom-xml
  - when-lua-reloads-leaving-a-game-and-resets
  - key-globals-and-classes
  - check-kahlua
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who copy Lua from a normal Lua tutorial, or who test mod logic outside the game. The overview of the runtime is [the Lua API overview](/pz/build-42/modding/lua-api/lua-api-and-engine-overview), and the call-a-Java-object side of the same engine is on [calling exposed Java from Lua](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua).

Outcast, the Lua inside Project Zomboid is not the Lua you installed on your computer. It is Kahlua, a Lua 5.1-style engine written in Java, and its library is smaller. Code that runs in a normal Lua can die on its first line in the game, so here is the list, read from the engine.

:::callout[The 1-minute version]{kind=key}
- There is no `next`, no `io`, no `debug`, no `xpcall`, no `dofile`, no `loadfile` and no `rawlen`. Use `pairs`, the game's file functions, and `table.isempty(t)` to ask whether a table is empty.
- There is no `table.pack`, `table.unpack` or `table.move`, and no `math.random` or `math.randomseed`. Use the global `unpack` and the game's `ZombRand`.
- `os` has only `date`, `time` and `difftime`. There is no `os.clock`, `os.getenv` or `os.exit`.
- The language is Lua 5.1: no `goto`, no `continue`, no `//`, and every number is a floating point number.
- The writer from `getFileWriter` has no `flush`, so close it to be sure your lines are on disk, and only five file types are allowed there. There is no event for the game exiting.
- When you test outside the game, make the stand-ins stricter than the game, never kinder.
:::

:::facts
- **Registered functions** base 18, math 24, string 14, table 8, coroutine 5, os 3
- **Added by `stdlib.lua`** 10 names, among them `assert`, `table.sort`, `string.len` and `math.max`
- **Reserved words** 21, and no `goto`
- **Files `getFileWriter` accepts** 5 extensions: `ini`, `cfg`, `txt`, `log`, `json`
- **`console.txt` cap** 5,120 KB by default
:::

## 1. Where the library comes from

**The game builds its Lua world from a fixed list of Java libraries, then runs one Lua file that defines a few more functions.**

The list is the platform's environment set-up: the math, base, random, string, coroutine, os and table libraries, plus the compiler that gives `loadstring`, and then the file `stdlib.lua` from the game's install folder. :cite[(`se/krka/kahlua/j2se/J2SEPlatform.java:45-60`, `se/krka/kahlua/luaj/compiler/LuaCompiler.java:21-31`)] The game creates its environment from that platform each time Lua starts or restarts. :cite[(`zombie/Lua/LuaManager.java:1095-1101`)]

After that the game only adds to the environment: its `require`, its Java classes and its global functions. :cite[(`zombie/Lua/LuaManager.java:1123-1135`)] So a function is missing from the game when no library registers it, `stdlib.lua` does not define it, and the vanilla Lua files do not either. The names registered by each library are in the code. :cite[(`se/krka/kahlua/stdlib/BaseLib.java:447-464`, `se/krka/kahlua/j2se/MathLib.java:362-385`, `se/krka/kahlua/stdlib/StringLib.java:1496-1509`, `se/krka/kahlua/stdlib/TableLib.java:245-252`, `se/krka/kahlua/stdlib/OsLib.java:323-326`, `se/krka/kahlua/stdlib/CoroutineLib.java:135-139`)]

`_VERSION` is not a real version string. It holds the unfilled template `Kahlua kahlua.major.kahlua.minor.kahlua.fix for Lua lua.version (J2SE)`, so do not test it. :cite[(`se/krka/kahlua/j2se/J2SEPlatform.java:48`)]

## 2. What is missing

**Every row marked missing below is absent from the registered libraries, from `stdlib.lua`, and from vanilla's Lua.**

| You might reach for | In Project Zomboid 42.22 |
|---|---|
| `next` | **Missing.** Use `pairs`. To test for an empty table use `table.isempty(t)`. |
| `io` (any of it) | **Missing.** Use the game's file functions in section 7. |
| `debug` (the library) | **Missing.** The base library has `debugstacktrace` instead. |
| `xpcall`, `dofile`, `loadfile`, `rawlen` | **Missing.** `pcall` exists. |
| `table.pack`, `table.unpack`, `table.move` | **Missing.** Use the global `unpack`. |
| `math.random`, `math.randomseed` | **Missing.** Use the game's `ZombRand`, or `newrandom()` for your own generator. |
| `os.clock`, `os.getenv`, `os.exit` | **Missing.** `os` has `date`, `time` and `difftime` only. |
| `string.len`, `string.rep`, `string.gmatch` | Present, but written in Lua by `stdlib.lua`. |
| `math.max`, `math.min` | Present, written in Lua by `stdlib.lua`. |
| `table.sort` | Present, a quicksort written in Lua by `stdlib.lua`. |
| `assert`, `pairs`, `ipairs` | Present, set up by `stdlib.lua`. |
| `coroutine.wrap` | Present, from `stdlib.lua`. The Java part has `create`, `resume`, `yield`, `status` and `running`. |
| `loadstring` | Present. The compiler registers it, with `loadstream`. |

`next` and the other names are not in the registration lists. :cite[(`se/krka/kahlua/stdlib/BaseLib.java:447-464`, `se/krka/kahlua/stdlib/TableLib.java:245-252`, `se/krka/kahlua/stdlib/OsLib.java:323-326`, `se/krka/kahlua/j2se/MathLib.java:362-385`)] The names `stdlib.lua` adds are `assert`, `ipairs`, `pairs`, `table.sort`, `string.len`, `string.rep`, `string.gmatch`, `math.max`, `math.min` and `coroutine.wrap`, which is 10. The file is in the game's install folder, so it is not in our capture, and the lines are not cited.

The Java side registers the pair `pairs` and `ipairs` as `table.pairs` and `table.ipairs`, and `stdlib.lua` copies them to the globals. :cite[(`se/krka/kahlua/stdlib/TableLib.java:245-252`)] Both need a table, so `pairs` on a Java object raises "Expected a table". :cite[(`se/krka/kahlua/stdlib/TableLib.java:82-99`)]

Vanilla checks too. A search of `media/lua` finds no `io.`, no `math.random`, no `table.pack`, `table.unpack` or `table.move`, no `dofile`, no `rawlen`, and no `os.` call except `os.date`. It finds one bare `next(`, and that line is the next section.

### One vanilla call site is not proof

**A function that vanilla calls once, on a path nothing runs, proves nothing about whether it exists.**

`ISPriorityTable.lua` calls `next(list, k)` inside the function `keyIterator`. :cite[(`media/lua/shared/Util/ISPriorityTable.lua:159-165`)] No file calls `keyIterator` except an example in the file's own header comment. :cite[(`media/lua/shared/Util/ISPriorityTable.lua:1-55`)] That line would fail if it ever ran, because `next` is not defined anywhere, so look for where the game defines a function before you trust a single call.

## 3. What Kahlua adds

**Kahlua gives you a few things a normal Lua lacks, and vanilla adds more math helpers in Lua.**

The table library adds `table.isempty`, `table.wipe` and `table.newarray`. :cite[(`se/krka/kahlua/stdlib/TableLib.java:245-252`)] Strings gain `trim`, `split`, `contains` and `sort`. :cite[(`se/krka/kahlua/stdlib/StringLib.java:1506-1509`)] A trap is `split`: it passes your separator to Java's regular-expression splitter, so a separator of `.` or `|` is not plain text. :cite[(`se/krka/kahlua/stdlib/StringLib.java:1411-1422`)] `contains` is plain text and `sort(a, b)` is true when `a` sorts after `b`. :cite[(`se/krka/kahlua/stdlib/StringLib.java:705-711`, `se/krka/kahlua/stdlib/StringLib.java:1424-1428`)]

Random numbers come from `newrandom()`, which returns a Java `Random` with a `random` and a `seed` method. :cite[(`se/krka/kahlua/stdlib/RandomLib.java:26-37`, `se/krka/kahlua/stdlib/RandomLib.java:61-79`)] The game's `ZombRand` is described on [key globals and classes](/pz/build-42/modding/lua-api/key-globals-and-classes). The Java class `Math` is also exposed to Lua with a capital M, and vanilla calls `Math.round`. :cite[(`zombie/Lua/LuaManager.java:1710`, `media/lua/client/DebugUIs/SeamEditor/SeamEditorUI.lua:326`)]

Vanilla's shared Lua adds `math.sign`, `math.length2`, `math.length2sq`, `math.rangesOverlap`, `math.isBetweenInclusive` and `math.clamp`, so those names exist in the game and not in a normal Lua. :cite[(`media/lua/shared/env.lua:157-188`)]

## 4. The language is Lua 5.1, with floating point numbers

**The parser has the 21 Lua 5.1 reserved words and nothing newer, and every number is a double.**

The lexer's word list holds `and`, `break` and so on to `while`, 21 words, and its other tokens are `..`, `...`, `==`, `>=`, `<=` and `~=`. :cite[(`org/luaj/kahluafork/compiler/LexState.java:1612-1650`)] So `goto`, `continue`, `//` for integer division, bit operators and `!=` are not part of the language, and a name like `continue` is an ordinary variable name.

Kahlua has one number type. The type function reports a Java `Double` as `number`, so `3` and `3.0` are the same value. :cite[(`se/krka/kahlua/vm/KahluaUtil.java:192-208`)] A normal Lua 5.4 has integers, so compare numbers with a tolerance when you test outside the game. `getmetatable` and `setfenv` are in the base library, which is another sign of the 5.1 shape. :cite[(`se/krka/kahlua/stdlib/BaseLib.java:447-464`)]

## 5. Java objects: methods yes, fields no

**When Lua holds a Java object it can call the object's public methods, and reading one of its fields gives `nil` every time.**

Kahlua puts the public instance methods of an exposed class into a table that the object's metatable searches, and nothing else. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:322-329`)] A key that is not in that table reads as `nil` with no error, and assigning to one raises "attempted index of non-table". :cite[(`se/krka/kahlua/vm/KahluaThread.java:1114-1141`, `se/krka/kahlua/vm/KahluaThread.java:1151-1177`)] So a value with no getter is out of reach. The detail, including static fields and the debug-only escape hatch, is on [calling exposed Java from Lua](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua).

The same rule explains a shape trap. `getCell():getVehicles()` returns a Java `Set` held in a `HashSet`, which has `size()` and `iterator()` but no `get(i)`. :cite[(`zombie/iso/IsoCell.java:166`, `zombie/iso/IsoCell.java:2739-2741`)] The usual `for i = 0, v:size() - 1 do v:get(i) end` loop fails with "tried to call nil", so use the iterator.

```lua
local it = getCell():getVehicles():iterator()
while it:hasNext() do
    local vehicle = it:next()
end
```

Vanilla has this same loop on that set in the vehicle blood panel, `vehicles:get(i-1)`. :cite[(`media/lua/client/Vehicles/ISUI/ISVehicleBloodUI.lua:77-81`)] From the code it fails when that "apply to all" branch runs; we did not run it. A missing method reads as `nil` instead of raising, so `if coll.iterator then ... end` is a free way to check what you were handed.

## 6. pcall hides the error, not the noise

**By the time `pcall` returns false, the engine has already written the error and a Lua stack trace to the log.**

When an error unwinds out of Lua code, the main loop logs the exception, writes the Lua stack trace, and only then pops the frames up to the caller. :cite[(`se/krka/kahlua/vm/KahluaThread.java:895-929`)] `pcall` then returns `false`, the message, the stack trace and the exception. :cite[(`se/krka/kahlua/vm/KahluaThread.java:1413-1450`)] A `pcall` around something that fails every tick therefore fills the log with stack traces while your code keeps running.

In debug mode on a client the same catch block also calls the debugger, which opens at the failing line only after you switch on the debug strip's toggle for it. :cite[(`se/krka/kahlua/vm/KahluaThread.java:899-902`, `zombie/ui/UIManager.java:1120-1127`)] Do not wrap engine calls in `pcall` "just in case". Where you must guard something that can keep failing, switch it off after its first failure and report it once.

An exception thrown inside a Java method that you called is a different path. The game logs it and the call returns nothing, so `pcall` reports success. That is explained on the Java page linked in section 5. :cite[(`se/krka/kahlua/integration/expose/caller/MethodCaller.java:35-51`)]

## 7. An error in a wrapped function stops the callers outside it

**When several mods wrap one vanilla function, an error in one layer ends every layer outside it, not only your own code.**

A mod wraps a function by keeping the old one, defining a new one and calling the old one inside. When a layer raises an error, the main loop pops the Lua frames above it for as long as each frame was called from Lua, and then throws the error to Java. :cite[(`se/krka/kahlua/vm/KahluaThread.java:906-937`)] The outer wrappers never get to finish, and their menu entries or results are lost.

So check your inputs inside a wrapper and return the old function's result rather than let an error escape. Where the throw lands depends on the caller: a handler on an event is isolated by the event system. :cite[(`zombie/Lua/Event.java:59-70`)]

## 8. Writing files

**There is no `io`, and the game's writer has three methods: `write`, `writeln` and `close`.**

`getFileWriter(name, createIfMissing, append)` opens a file in the `Lua` folder of the game's cache folder, which is `Zomboid` in your user folder on Windows, and it creates the folders on the way. :cite[(`zombie/Lua/LuaManager.java:6697-6727`, `zombie/Lua/LuaManager.java:1273-1281`, `zombie/ZomboidFileSystem.java:205-214`)] The writer wraps a `PrintWriter` and has no `flush`, so only `close()` is sure to put your last lines on disk. :cite[(`zombie/Lua/LuaManager.java:12822-12841`)] Buffer lines in a Lua table, and open, append and close in batches.

Only some names work, and the failures are quiet. The name must end in `ini`, `cfg`, `txt`, `log` or `json` in lower case, and a name with `..` in it is refused. In both cases the function returns `nil` instead of raising. :cite[(`zombie/Lua/LuaManager.java:1044`, `zombie/Lua/LuaManager.java:6698`, `zombie/Lua/LuaManager.java:8489-8496`)]

Check for `nil`. The other file calls are `getFileReader`, `fileExists`, `getModFileReader` and `getModFileWriter`. The mod writer saves into the mod's `common` folder and has no extension list. :cite[(`zombie/Lua/LuaManager.java:6102-6137`, `zombie/Lua/LuaManager.java:5917-5948`)]

**There is no exit event.** No `OnGameExit` is in the list of events the game registers, and that list is in one place. :cite[(`zombie/Lua/LuaEventManager.java:598-860`)] So `if Events.OnGameExit then ... end` is the worst version: the guard makes a dead hook look healthy. What fires on a save and on leaving is on [when your Lua reloads](/pz/build-42/modding/lua-api/when-lua-reloads-leaving-a-game-and-resets).

## 9. Testing outside the game: be stricter than the game

**A test stand-in must be stricter than the game, never kinder, or the test vouches for code the game cannot run.**

Many of us test mod logic in a normal Lua with stand-ins for the game's objects. A stock Lua has `next`, and a stand-in for the vehicle set that is a plain list has a `get`, so a suite can pass on code that fails on its first line in the game.

- Before running mod code in an outside Lua, remove what Kahlua lacks (`next`, `io`, `debug`, `xpcall`, `table.pack`, `table.unpack`, `table.move`, `dofile`, `loadfile`, `rawlen`, `math.random`) and trim `os` to `date`, `time` and `difftime`, so the harness fails where the game would.
- Model each game object with exactly the methods the game gives it, and add one assertion on the stand-in's own shape (for example that the vehicle set has no `get`), so a later edit cannot make it kind again.
- Break the code on purpose and watch the test go red, to prove the test can fail.
- Lua 5.4 has integers and Kahlua has only floating point numbers, so compare numbers with a tolerance.

Our [check-kahlua.py](/pz/build-42/modding/tooling/check-kahlua) tool checks a mod's Lua for the missing functions; it has known false alarms, for example on `loadstring` and `coroutine.wrap`, which do exist.

:::callout[How we know]{kind=proof}
Read from the 42.22 engine: the Kahlua classes come from a local decompile of the same jar, since the capture leaves them out, and `stdlib.lua` was read from the game's install folder (3,183 bytes), which the capture does not hold. No game was run. The vanilla counts are across `media/lua`.

Corrected from the 42.21 page: the file writer's extension list holds for `getFileWriter` only, since `getModFileWriter` has none; the page called `loadstring` registered by the compiler, which still holds. New in this check: `debug` and `xpcall` are also missing, `table.isempty` is the way to test for an empty table, and `string.split` takes a regular expression.

Not verified: that `stdlib.lua` is the same file in a Steam install other than ours, how a wrapped-function error looked in a player's game (a 42.20 multiplayer session, not re-run), and the story of a shipped mod that crashed on `next()` while its off-game suite passed. Those stories are why the test advice is here; the code reasons above stand without them. The old page's assertion counts (21 and 100) are dropped.
:::
