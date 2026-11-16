---
id: build-42-recommended-tooling
slug: recommended-tooling
title: Recommended tooling
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
  What the 42.22 game fixes for any editor setup: Lua 5.1 syntax, how require finds files, where the log goes. The outside tools (EmmyLua, Umbrella, JavaDocs sites) are listed as not verified.
last_updated: '2026-11-16'
related_articles:
  - debugging-lua-in-b42
  - kahlua-what-project-zomboid-lua-does-not-have
  - engine-internals-calling-exposed-java-from-lua
  - lua-load-order-and-the-three-lua-folders
  - key-globals-and-classes
  - in-game-debug-mode-and-dev-tools
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders setting up an editor for Build 42 Lua. The game's side of the setup is checked below. The outside tools are not, and they are marked that way, with the date.

:::callout[The 1-minute version]{kind=key}
- Set your Lua language server to Lua 5.1. The game's parser has the 5.1 reserved words and nothing newer, and no integers.
- `require("Name")` finds `Name.lua` under the `media/lua` folders, so a language server's require pattern should list `shared/?.lua`, `client/?.lua` and `server/?.lua`.
- A Java call that fails gives `nil` and an error in the log, so nil checks that a type checker calls redundant can be needed.
- The log is `console.txt` in the `Zomboid` cache folder, and `-debug` turns on the debug tools.
- Not verified, 2026-11-16: every outside tool named below, including EmmyLua, the Umbrella stubs, the configuration file and the documentation sites.
:::

:::facts
- **Lua dialect** 5.1 style, 21 reserved words, numbers are doubles
- **`require` folders searched** the Lua folders registered so far, in the order registered
- **Log file** `console.txt`, capped at 5,120 KB by default
- **Outside tools** 0 verified for 42.22
:::

## 1. What the game fixes for any editor

**The game decides the Lua dialect, how `require` resolves a name, and where the log is written, so set your tools to match those.**

The parser has 21 reserved words and no `goto`, `continue`, integer division or bit operators, so a language server set to a newer Lua will accept code that Build 42 cannot compile. :cite[(`org/luaj/kahluafork/compiler/LexState.java:1612-1650`)] `setfenv` and `getfenv` exist, which are Lua 5.1 functions. :cite[(`se/krka/kahlua/stdlib/BaseLib.java:447-464`)] The full list of what the library lacks is on [Kahlua: what the game's Lua does not have](/pz/build-42/modding/lua-api/kahlua-what-project-zomboid-lua-does-not-have).

`require("Name")` adds `.lua` when it is missing, then tries the registered Lua folder paths, such as `media/lua/shared/`, one after the other, and runs the file it finds first. :cite[(`zombie/Lua/LuaManager.java:5711-5727`)] A pattern list of `shared`, `client` and `server` in your language server matches that. The registration order and what a mod's path means are on [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

A failed Java call returns nothing, and the error goes to the log instead of to your code, so a value that a stub declares non-nil can still be `nil`. :cite[(`se/krka/kahlua/integration/expose/caller/MethodCaller.java:35-51`)] That is why a rule that flags `if value then` as unnecessary is worth switching off for Java results. The old page's example, `getPlayer()` returning nil when the player is dead, was not confirmed: the code returns nil when no player instance is set, and the dead case was not checked. :cite[(`zombie/characters/IsoPlayer.java:843-845`)]

The log is `console.txt` in the `Zomboid` cache folder, and `-debug` is the launch option for the debug tools. :cite[(`zombie/gameStates/MainScreenState.java:183-189`, `zombie/gameStates/MainScreenState.java:242-243`)] Both are on [Debugging Lua in B42](/pz/build-42/modding/lua-api/debugging-lua-in-b42). To check what a name does, read the vanilla Lua under `media/lua` and the exposed-class rules on [the Java page](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua).

## 2. Outside tools (not verified, 2026-11-16)

**Everything in this section comes from the 42.21 page, which copied the PZ wiki as of July 2026, and none of it was re-checked for 42.22.**

:::chips[Named by the old page, not verified]
EmmyLua
LuaLs (sumneko)
Umbrella stubs
Unofficial B42 JavaDocs
geromet PZJavaDocs (42.15)
ProjectZomboidLuaDocs
PZEventStubs
Starlit Library
Events Plus API
Doggy's Library
DOME
:::

The old page called the **EmmyLua** extension the main choice, with the **Umbrella** type stubs generated from the game's Java, and said **LuaLs** was the earlier choice. It said the official JavaDocs cover only Build 41.77, and that unofficial Build 42 JavaDocs exist, one of them at Build 42.15.

It also named community libraries for gaps in the raw API: Starlit Library for cached access to Java fields, Events Plus API and Doggy's Library for custom events, and DOME for reaching file-local Lua objects. Check any of them against the 42.22 code before you rely on it. The field-access claim in particular conflicts with the reflection rules on [the Java page](/pz/build-42/modding/lua-api/engine-internals-calling-exposed-java-from-lua).

The old page also gave a language-server settings file. Only the parts that match section 1 are worth copying, and the rest was not checked:

```json
{
    "workspace": {
        "workspaceRoots": ["Contents/mods/YourMod/42/media/lua"]
    },
    "runtime": {
        "requirePattern": ["shared/?.lua", "client/?.lua", "server/?.lua"],
        "version": "Lua5.1"
    },
    "diagnostics": {
        "disable": ["unnecessary-if"]
    }
}
```

The `workspaceRoots` path assumes the Workshop layout `Contents/mods/<YourMod>/42/`, which is the layout of [the folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model). The key names are the language server's own, so check them against its documentation.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the Kahlua classes from a local decompile of the same jar; no game was run and no outside tool was installed. Section 1 is the only checked part.

Corrected from the 42.21 page: the claim that a dead player makes `getPlayer()` return nil is not confirmed, and the "400+ events (tracks 42.13)" description of an event catalog is dropped, because the game registers 263 events at 42.22 and a third-party list is not ours to vouch for. Dropped: the confidence tags and the wiki revision numbers, the "Konijima project-zomboid-studio" scaffolding tool, the Modding Migration Guide and its sample archive, and the schema URL in the settings file, none of which could be checked.

Not verified: every outside tool and its status in 2026-11-16, and whether the settings file is accepted by the current language server.
:::
