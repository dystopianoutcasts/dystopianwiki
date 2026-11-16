---
id: build-42-debugging-lua-in-b42
slug: debugging-lua-in-b42
title: Debugging Lua in B42
game: pz
version: build-42
section: modding
category: lua-api
difficulty: intermediate
tags:
  - lua-api
  - events
  - moddata
  - timed-actions
  - multiplayer
excerpt: >-
  How to debug Lua in 42.22: start with -debug, where print and errors go, what the error messages say, why a Java error shows up as nothing, and why a handler may sit in the wrong folder.
last_updated: '2026-11-16'
related_articles:
  - in-game-debug-mode-and-dev-tools
  - kahlua-what-project-zomboid-lua-does-not-have
  - engine-internals-calling-exposed-java-from-lua
  - when-lua-reloads-leaving-a-game-and-resets
  - b41-b42-breaking-changes
  - lua-load-order-and-the-three-lua-folders
  - testing-loop-and-common-load-errors
  - recommended-tooling
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who have a Lua mod that errors, does nothing, or is being ported from Build 41. The overview of the Lua runtime is [the Lua API overview](/pz/build-42/modding/lua-api/lua-api-and-engine-overview). The debug menus themselves are on [In-game debug mode and dev tools](/pz/build-42/modding/foundations/in-game-debug-mode-and-dev-tools), and the load errors for script files are on [the testing loop](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors).

:::callout[The 1-minute version]{kind=key}
- Start the game with `-debug`. It sets the game's debug flag, which the debug menus, the Lua debugger and the field-reflection helpers all check.
- `print` writes to the game's log, and the game copies its output to `console.txt` in the `Zomboid` cache folder. The file is capped at 5,120 KB by default and starts over when it is full.
- A Lua error is written to the log with a Lua stack trace, and the message names what failed: "Object tried to call nil in ..." or "attempted index: ... of non-table".
- A Java exception inside a method you call is logged, and the call returns nothing, so look for `nil` after a call that should give a value.
- A handler that does nothing on a server may be in a `client` file, which a dedicated server never runs. A `server` file also runs on a multiplayer client.
:::

:::facts
- **Launch option** `-debug`
- **`console.txt` size cap** 5,120 KB by default, 20,480 KB on a dedicated server (`server-console.txt`)
- **Valid cap range** 512 to 102,400 KB
- **Where** the `Zomboid` folder in your user folder on Windows, or the path in `-cachedir=`
:::

## 1. Turn on debug mode

**The launch option `-debug` sets the debug flag, and the Lua debugger, the debug menus and the reflection helpers all test that flag.**

The game sets the flag when one start-up argument is exactly `-debug`. :cite[(`zombie/gameStates/MainScreenState.java:242-243`)] In Steam you type it in the Launch Options box; that is a Steam step, not game code. The menus, the Lua debugger key and the debug options file are on [the debug mode page](/pz/build-42/modding/foundations/in-game-debug-mode-and-dev-tools).

In debug mode the main menu has a **Reset Lua** button that runs the game's reset routine with the reason `Force`. :cite[(`media/lua/client/OptionScreens/MainScreen.lua:410-411`)] What a reset reloads and what survives it is on [When your Lua reloads](/pz/build-42/modding/lua-api/when-lua-reloads-leaving-a-game-and-resets). In debug mode, the three reflection helpers described on [the Java page](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua) also work.

## 2. Where `print` and errors go

**`print` goes to the game's log, which the game also writes to `console.txt`, and that file is capped.**

The Lua `print` joins its arguments with tabs and writes the line to the Lua log stream. :cite[(`se/krka/kahlua/stdlib/BaseLib.java:267-289`, `se/krka/kahlua/vm/KahluaThread.java:108`)] At start-up the game points standard output and error at both the console and the file `console.txt` in the cache folder. :cite[(`zombie/gameStates/MainScreenState.java:183-189`)] The cache folder is `Zomboid` in your user folder on Windows, and the option `-cachedir=` changes it. :cite[(`zombie/ZomboidFileSystem.java:205-214`, `zombie/gameStates/MainScreenState.java:166-167`)] A dedicated server writes `server-console.txt` there instead. :cite[(`zombie/network/GameServer.java:463-468`)]

The file does not grow without end. Its size cap is 5,120 KB, a value from 512 to 102,400 can be set with `-console_dot_txt_size_kb=`, and a dedicated server starts at 20,480. :cite[(`zombie/core/Core.java:168`, `zombie/core/Core.java:4474-4476`, `zombie/gameStates/MainScreenState.java:168-170`, `zombie/network/GameServer.java:431`)] When a write would pass the cap, the stream closes the file and opens it again empty, so the older lines are gone. :cite[(`zombie/core/logger/LimitSizeFileOutputStream.java:51-58`)] So a long test session can lose the lines you want; read the log soon after the error, or raise the cap.

In debug mode the in-game debug console also receives every `print`. :cite[(`zombie/ui/UIDebugConsole.java:123-125`)] Whether a log-level setting can silence the Lua stream was not checked. Printing in a hot loop costs file writes and pushes useful lines out of the capped file, so print on a change, not every tick; no timing was measured.

## 3. What an error looks like

**A Lua error is logged with a Lua stack trace before your `pcall` or the caller sees it, and the trace may print twice, because some messages dump it and then the main loop dumps it again.**

The two messages in the table dump a trace themselves before they fail, and the main-loop catch then dumps one again. :cite[(`se/krka/kahlua/vm/KahluaThread.java:625-626`, `se/krka/kahlua/vm/KahluaThread.java:1135-1137`, `se/krka/kahlua/vm/KahluaThread.java:894-898`)] When an error unwinds out of Lua code, the main loop writes the exception, then a block headed "dumping Lua stack trace", and then pops the frames. :cite[(`se/krka/kahlua/vm/KahluaThread.java:895-902`, `se/krka/kahlua/vm/KahluaThread.java:966-981`)] On a client in debug mode the debugger window also opens at the failing line, but only after you switch on the debug strip's "show the Lua debugger on error" toggle, because the flag behind it starts off. :cite[(`se/krka/kahlua/vm/KahluaThread.java:899-902`, `zombie/ui/UIManager.java:105`, `zombie/ui/UIManager.java:1120-1127`, `media/lua/client/DebugUIs/DebugToolstrip.lua:28-30`)] The common messages are these:

| Message | What it means | Code |
|---|---|---|
| `Object tried to call nil in <name>` | you called a name that holds `nil`: a missing function, a renamed method, or a typo; `<name>` is the function you were in | `se/krka/kahlua/vm/KahluaThread.java:620-634` |
| `attempted index: <key> of non-table: <value>` | you read a key of something that is not a table, often `nil` ("null" in the text) | `se/krka/kahlua/vm/KahluaThread.java:1133-1138` |
| `Expected a method call but got a function call` | you used a dot on an instance method of a Java object | `se/krka/kahlua/integration/expose/LuaJavaInvoker.java:46-52` |
| `expected N arguments, got M` | wrong argument count to a Java method | `se/krka/kahlua/integration/expose/LuaJavaInvoker.java:65-70` |
| `No implementation found for function` | no overload of a Java method fits the arguments | `se/krka/kahlua/integration/expose/MultiLuaJavaInvoker.java:89` |

The old page used the standard Lua wording, "attempt to call nil". Kahlua does not print that; search the log for "tried to call nil" and "attempted index". The top Lua frame in the trace is the place to look first.

An error is not always shown. A Java exception inside a method that you called is logged with its stack trace, and the call returns nothing, so there is no Lua error and `pcall` reports success. :cite[(`se/krka/kahlua/integration/expose/caller/MethodCaller.java:35-51`)] Treat an unexpected `nil` from a call that should return something as a failure, and read the log above it. A constructor that throws does raise. :cite[(`se/krka/kahlua/integration/expose/LuaJavaInvoker.java:142-152`)]

## 4. Porting a Build 41 mod

**Run the old mod in `-debug`, collect every "tried to call nil" and "attempted index", and look each name up in the vanilla Lua.**

There is no published list of renamed methods. The ones we proved, tile flags and world water, are on [B41 to B42 breaking changes](/pz/build-42/modding/lua-api/b41-b42-breaking-changes). For each other failing name, find how vanilla's Lua under `media/lua` calls the same object today and use that spelling. The folder and load-order errors that come before any Lua runs are on [the testing loop](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors).

## 5. Debugging multiplayer: where does the code run?

**A handler that does nothing on a dedicated server is often in a `client` file, and a `server` file also runs on a multiplayer client.**

A dedicated server loads `shared` and `server` and only checks the `client` files, so `client/` code never runs there. :cite[(`zombie/network/GameServer.java:1517-1519`, `zombie/Lua/LuaManager.java:1214-1223`)] The `server` folder is also loaded by a multiplayer client, because the loading screen does not test for one. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)] So use `isClient()` and `isServer()` to log which side ran a line. :cite[(`zombie/Lua/LuaManager.java:4415-4445`)]

```lua
print("MyMod: handler ran, isClient=" .. tostring(isClient()) .. " isServer=" .. tostring(isServer()))
```

In single player both calls return false, and `isMultiplayer()` is true when either is. The full rules are on [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java, the Kahlua classes from a local decompile of the same jar, and the vanilla Lua; no game was run. The messages are the strings in the Kahlua classes, so how they look in a given log, with its time stamps and prefixes, was not checked.

Corrected from the 42.21 page: it said `print` output only grows `console.txt`, and that the file can reach gigabytes; the file is capped and restarts. It used the standard Lua message "attempt to call nil", which Kahlua does not print. It said the main-menu reload path is the one that "re-runs shared and client"; the menu button runs the game's reset routine, described on the reload page. Dropped: the pzwiki confidence tags, and "run in debug to discover the 42.17 renames" as a claim about a version.

Not verified: whether a log-level setting hides `print`, what the in-game debug console shows beyond `print`, and how the debugger window behaves.
:::
