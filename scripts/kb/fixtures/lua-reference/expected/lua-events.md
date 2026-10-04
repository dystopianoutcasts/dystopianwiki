---
slug: lua-events
title: 'Lua Events (Build 9.99)'
game: pz
version: build-42
section: modding
category: reference
difficulty: intermediate
tags:
  - lua-api
  - events
  - reference
  - generated
excerpt: 'Every Lua event in Build 9.99, generated from the code: where each one is fired, on which side, and with which arguments.'
last_updated: '2000-01-02'
related_articles:
  - lua-reference
  - lua-global-functions
  - lua-class-directory
  - lua-classes-characters
  - the-events-system
---
# Lua events in Build 9.99

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Outcast, events are how your mod hears about the game: you hand a function to `Events.OnSomething.Add(fn)` and the game calls it when it fires that event. This page lists every event Build 9.99 registers (2) and every other event name that the Java code or the vanilla Lua fires (1 more), with each place that fires it.

For each event you get:

- **Side:** where the call that fires it runs, counted per call site. "client" means wherever a player is playing; "server" means the multiplayer server; "single player only" means both multiplayer flags are off. "unknown" means the call has no multiplayer guard and its class does not settle it, so it may run on either side: we do not guess. The full rules are on [the reference index](/pz/build-42/modding/reference/lua-reference#which-side-fires-an-event).
- **Arguments:** the Java types at the call, and the variable name where the call passes a plain variable. A `?` is an expression whose type the extractor could not read from the declarations around the call.
- **When:** only where we read the call site and it makes the timing clear. Everywhere else the page says only where the event is fired from, and the method name is your best clue.
- **Fired from:** the class and method (Java) or the file and function (vanilla Lua), with the line in that build.

Of the 3 call sites, 1 have an unknown side; 0 events have no call site with a known side.

> **Proof:** Code. zombie.Lua.LuaEventManager#AddEvents, every LuaEventManager.triggerEvent call in the Java code, every triggerEvent call in media/lua. Build 9.99 (revision 0f0f0f0f0f).

## Characters, players and zombies

Events fired from the character classes: updates, damage, death, skills and XP, clothing and equipment. (1 event)

### OnFixtureTick

**Side:** server at 1 call site, unknown at 1 call site. **Arguments (2):** `FixtureCharacter`, `double delta`. **When:** Fired every fixture tick.

- `FixtureCharacter#update` (Java, `zombie.characters`, line 42): side unknown (no guard at the call, and the class does not decide it).
- `GameServer#mainLoop` (Java, `zombie.network`, line 7): server, multiplayer only; class: server-side network class.

## Fired only from vanilla Lua

Events that no Java code fires: the vanilla Lua scripts fire them with `triggerEvent`, mostly from the UI and timed actions. Mods can fire them the same way. (1 event)

### OnFixtureLua

**Side:** client (and single player) (1 call site). **Registered by vanilla Lua,** not at start-up: `media/lua/client/Fixture/FixtureUI.lua` calls `LuaEventManager.AddEvent`. **Arguments (1):** `? self`.

- `FixtureUI:open` in `media/lua/client/Fixture/FixtureUI.lua` (Lua, line 20): client, and in single player; folder: media/lua/client, which the dedicated server loads for its checksum only.

## Registered but never fired

The game registers these names at start-up, so `Events.Name.Add` works, but in this build neither the Java code nor the vanilla Lua fires them. A handler added to one of them runs only if a mod fires the event itself. (1 event)

### OnFixtureNever

**Side:** not fired in this build.

## Fired with a name chosen at run time

1 call site fire an event whose name is not written in the code, so they cannot be tied to one event. They are the global `triggerEvent` functions that vanilla Lua and mods call:

- `LuaManager.GlobalObject#triggerEvent` (line 10)

## Hooks are not events

The game also keeps 1 hook in `LuaHookManager`: `FixtureHook`. A hook gives an answer back: `LuaHookManager.TriggerHook` returns true or false from the Lua handlers, and the Java code that called it branches on that answer. An event returns nothing. They are listed here so you can tell the two apart; they are not in the event list.

> **Proof:** Code. zombie.Lua.LuaHookManager#AddEvents and #TriggerHook. Build 9.99 (revision 0f0f0f0f0f).
