---
slug: lua-reference
title: 'The Build 42.21 Lua Reference'
game: pz
version: build-42
section: modding
category: reference
difficulty: intermediate
tags:
  - lua-api
  - reference
  - events
  - generated
excerpt: 'How Lua reaches the Java engine in Build 42.21, and the complete generated reference: 1,017 classes, 728 global functions, 262 events.'
last_updated: '2026-10-04'
related_articles:
  - lua-events
  - lua-global-functions
  - lua-class-directory
  - lua-classes-characters-1
  - the-events-system
  - engine-internals-calling-exposed-java-from-lua
---
# The Build 42.21 Lua reference

> **Generated from the code.** This page is generated from Build 42.21 (revision 4a0e9546ec) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are at the end of this page.

Outcast, everything your mod does goes through what the engine hands to Lua. In Build 42.21 that is 1,017 Java classes, 728 global functions and 262 events. We generate the whole surface from the code, so it is complete by construction and regenerated after every update. These pages are the result. They hold names, types and where things are called from. They never quote the game's code.

## The pages

- [Lua events](/pz/build-42/modding/reference/lua-events): all 281 events with where each is fired, on which side, and its arguments.
- [Lua global functions](/pz/build-42/modding/reference/lua-global-functions): all 728 with their signatures.
- [Lua class directory](/pz/build-42/modding/reference/lua-class-directory): every exposed class, A to Z, linked to its entry.
- The exposed classes, by area:
  - [Characters, players, zombies and animals, part 1 of 3](/pz/build-42/modding/reference/lua-classes-characters-1) (41 classes)
  - [Characters, players, zombies and animals, part 2 of 3](/pz/build-42/modding/reference/lua-classes-characters-2) (8 classes)
  - [Characters, players, zombies and animals, part 3 of 3](/pz/build-42/modding/reference/lua-classes-characters-3) (24 classes)
  - [The world: squares, objects, map and weather, part 1 of 4](/pz/build-42/modding/reference/lua-classes-world-1) (59 classes)
  - [The world: squares, objects, map and weather, part 2 of 4](/pz/build-42/modding/reference/lua-classes-world-2) (42 classes)
  - [The world: squares, objects, map and weather, part 3 of 4](/pz/build-42/modding/reference/lua-classes-world-3) (113 classes)
  - [The world: squares, objects, map and weather, part 4 of 4](/pz/build-42/modding/reference/lua-classes-world-4) (111 classes)
  - [Items and inventory](/pz/build-42/modding/reference/lua-classes-items) (28 classes)
  - [Entities, components and crafting](/pz/build-42/modding/reference/lua-classes-entities) (124 classes)
  - [Script objects, part 1 of 4](/pz/build-42/modding/reference/lua-classes-scripts-1) (64 classes)
  - [Script objects, part 2 of 4](/pz/build-42/modding/reference/lua-classes-scripts-2) (14 classes)
  - [Script objects, part 3 of 4](/pz/build-42/modding/reference/lua-classes-scripts-3) (35 classes)
  - [Script objects, part 4 of 4](/pz/build-42/modding/reference/lua-classes-scripts-4) (44 classes)
  - [Vehicles](/pz/build-42/modding/reference/lua-classes-vehicles) (10 classes)
  - [AI states and combat, part 1 of 2](/pz/build-42/modding/reference/lua-classes-ai-and-combat-1) (42 classes)
  - [AI states and combat, part 2 of 2](/pz/build-42/modding/reference/lua-classes-ai-and-combat-2) (10 classes)
  - [UI and input](/pz/build-42/modding/reference/lua-classes-ui-and-input) (39 classes)
  - [Sound and radio](/pz/build-42/modding/reference/lua-classes-sound-and-radio) (47 classes)
  - [Multiplayer, network and chat](/pz/build-42/modding/reference/lua-classes-network) (31 classes)
  - [Game, core and utilities, part 1 of 2](/pz/build-42/modding/reference/lua-classes-game-and-core-1) (88 classes)
  - [Game, core and utilities, part 2 of 2](/pz/build-42/modding/reference/lua-classes-game-and-core-2) (13 classes)
  - [Java and library classes](/pz/build-42/modding/reference/lua-classes-java-and-libraries) (30 classes)

## How Lua reaches Java

The game runs your Lua in Kahlua, a Lua interpreter written in Java. Lua cannot see a Java class until the game hands it over. That happens once, at start-up, in `LuaManager.Exposer.exposeAll()`: it puts a fixed list of classes into a set with `setExposed(SomeClass.class)`, then walks the set and builds a Lua table for each class. A class that is not in the set does not exist for Lua, even when you hold an object of that class: you get the object, but none of its methods.

For each class in the set, Kahlua does four things:

- **Instance methods.** It asks Java for the class's public methods (`Class.getMethods()`), which includes every public method inherited from parent classes and interfaces, interface default methods included. Each one becomes callable as `obj:method(...)`.
- **Static methods.** The public static methods go into a table named after the class, so you call `ClassName.method(...)`.
- **Static fields.** Public static fields are copied into the same table as values, once. Enum values arrive this way: `BodyPartType.Foot_L` is a static field of the enum.
- **Constructors.** Public constructors become `ClassName.new(...)`.

Global functions are separate: Kahlua scans the methods of one object, `LuaManager.GlobalObject`, and every method marked `@LuaMethod(global = true)` becomes a global Lua function under the annotation's name.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll; se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeLikeJava, #exposeMethods, #exposeStatics, #exposeGlobalFunctions (read from the game jar). Build 42.21 (revision 4a0e9546ec).

## Why Lua sees methods and not fields

Look at that list again: instance methods, static methods, static fields, constructors. Instance fields are not on it. Kahlua never exposes a field of an object, public or not. So `player.someField` reads `nil` with no error, even when the Java field is public, and a mod built on it silently does nothing. Use the getter: `player:getSomething()`. If there is no getter, Lua cannot read the value.

Static fields are copied once, when the class is exposed. If the game changes a static field later, Lua still holds the old value. Again, use a getter when there is one.

> **Proof:** Code. se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods (Class.getMethods, instance methods only) and #exposeStatics (Class.getFields, static only, value read once with Field.get). Build 42.21 (revision 4a0e9546ec).

## What "exposed" means here

- **In the set.** A class is exposed when `exposeAll` (or one of the two helpers it calls, `BuildingRoomsEditor.setExposed` and `UIWorldMap.setExposed`) puts it in the set. That gives 1,017 classes.
- **Debug only.** 3 of them (`Field`, `Method`, `Coroutine`) are added only when the game runs in debug mode, so a normal game exposes 1,014. They are listed, and marked.
- **@HiddenFromLua.** A method, field or constructor carrying this annotation is skipped, and a class carrying it is never exposed. The `@UsedFromLua` annotation you see in the code marks intent only: the exposer never reads it.
- **Inherited.** Because the exposer uses `getMethods()`, a method declared in a parent class or interface that is not exposed itself still works on the exposed class. Our class pages list those in full, marked with where they come from.
- **Refused.** Classes in `java.lang.reflect`, `java.lang.invoke` and class loaders are refused even if something adds them (in debug mode `Field` and `Method` are let through).

> **Proof:** Code. se.krka.kahlua.integration.expose.LuaJavaClassExposer#isDisallowed and #exposeMethods; zombie.Lua.LuaManager$Exposer#exposeAll. Build 42.21 (revision 4a0e9546ec).

## The reflection ban

Some older mods reach private Java fields through reflection. In the current code the seven global functions that do it (`getNumClassFunctions`, `getClassFunction`, `getNumClassFields`, `getClassField`, `getClassFieldVal`, `getMethodParameter`, `getMethodParameterCount`) call `LuaManager.validateReflectionAccess` first, which throws "Not in debug" unless the game runs in debug mode, and refuses `Class`, `ClassLoader` and method-handle lookups even then. On a normal game, and on every server not in debug mode, reflection from Lua is off. The patch notes never mentioned it. Our records date the change to 42.15; the oldest Build 42 capture we hold is 42.20, so the code we can show is 42.20 and 42.21, where it is the same.

> **Proof:** Code. zombie.Lua.LuaManager#validateReflectionAccess and its 7 call sites in zombie.Lua.LuaManager$GlobalObject. Build 42.21 (revision 4a0e9546ec).

## The numbers

| | Build 42.21 | Build 42.20 |
|---|---|---|
| Exposed classes | 1,017 (3 in debug mode only) | 1,013 |
| Methods listed on the class pages | 26,967 | - |
| Global functions | 728 (759 Java methods) | 726 |
| Events registered at start-up | 262 | 260 |
| Other event names fired by Java or vanilla Lua | 19 | - |
| Registered events nothing fires | 35 | - |
| Event call sites | 513 (307 with an unknown side) | - |
| Hooks | 8 | - |

The methods listed are each class's own methods plus those it inherits from parents that are not exposed; methods inherited from an exposed parent are counted once, on the parent. Build 42.20 (revision a2947723ca) is counted the same way, by our engine diff between the two builds.

## What changed since 42.20

- **Classes added:** `GridSquareEdge`, `GridSquareEdgeFacingDirection`, `KeybindId`, `TradingState`. Removed: none.
- **Global functions added:** `deleteDatabase`, `getMaxUsernameLength`, `getMinUsernameLength`, `sendAddObjectToMap`. Removed: `getRadioText`, `getTextList`. A mod still calling a removed function now stops with an error when it calls it.
- **Events added:** `LogLevelPerk`, `OnTileObjectAdded`. Removed: none.
- **Inside the classes:** the engine diff between the two builds counts 61 exposed classes with changed public methods: 184 new method names, 26 changed signatures, 27 removed from the class that declared them. Some moved rather than vanished: `getOppositeSquare()` left the door, window, window frame, thumpable and barricade classes and is now a default method of the new interface `GridSquareEdgeElement`. Because the exposer uses `getMethods()`, it is still callable on all of them (the class pages list it, marked as coming from that interface). Others are gone or renamed: `Core.getOptionFocusloss` and `setOptionFocusloss` are now `getOptionPauseOnFocusloss` and `setOptionPauseOnFocusloss`, and `IsoGridSquare.getDoor` and `getWindow` now take a boolean.
- **Keys:** vanilla Lua moved to the new `KeybindId` class, whose static fields name each binding (`getCore():isKey(KeybindId.TOGGLE_SAFETY, key)`). The string forms are still there: `getCore():isKey(name, key)`, `getCore():getKey(name)` and the global `isKeyDown(name)`.
- **Text:** `getText` and `getTextOrNull` take any number of extra arguments.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll, zombie.Lua.LuaEventManager#AddEvents and the @LuaMethod(global = true) methods, counted in both builds and compared. Build 42.21 (revision 4a0e9546ec).

## Which side fires an event

In multiplayer, the server and each client run their own copy of the game, and an event fires only in the process whose code reached the call. For each call site the extractor decides the side by these rules, in this order:

1. A guard around the call decides first: GameServer.server (Lua: isServer()) true means the multiplayer server only; GameClient.client (Lua: isClient()) true means a multiplayer client only; GameServer.server false means wherever a player is (single player and multiplayer clients); GameClient.client false means the multiplayer server and single player; both false means single player only. Guards read: enclosing if / else-if / else conditions, a brace-less if on the call, and an earlier `if (...) return` in an enclosing block.
2. With no guard, the class decides: zombie.network.GameServer, zombie.network.server and ServerGUI, and a packet method processServer, mean the multiplayer server; zombie.network.GameClient and a packet method processClient mean a multiplayer client (a packet rule is used only when nothing else in that class calls the method); zombie.spnetwork (the in-process stand-in for the network in single player) means single player only. zombie.ui and zombie.input mean client: that one is inferred from the package, not read from a call path.
3. With no guard, the Lua folder decides: media/lua/client is never run by the dedicated server (GameServer loads it for its checksum only), so client; media/lua/shared and media/lua/server run on both, so a call there with no guard is unknown.
4. Everything else is unknown: a call in shared code with no guard can run on either side, and we do not guess which.

Rule 2's last sentence is the only inference. Everything else is read from the code. With these rules, 307 of the 513 call sites, and 132 events (all of their call sites), stay "unknown". That is honest, not a gap we filled: an unguarded call in shared code can run wherever its caller runs, and following every caller is a bigger job than one page. When the side matters to your mod, test on a dedicated server and read the server's log.

> **Proof:** Code. zombie.network.GameServer (loads media/lua/client with the checksum-only flag, so the dedicated server never runs it), zombie.gameStates.GameLoadingState (loads media/lua/server on clients), and the guards at each call site. Build 42.21 (revision 4a0e9546ec).

## How the pages are split

- Events and global functions are one page each.
- Classes are grouped by area, by Java package (for example `zombie.characters` is "Characters", `zombie.iso` and the other map packages are "The world"). An area whose class entries would pass 150 kB is cut into parts at class boundaries, in package order, so a page stays quick to load and every class is whole on one page. A single class bigger than that gets a part of its own.
- The directory lists every class A to Z with a link to its entry.

## How this is made, and how to regenerate it

Two scripts in the wiki repository do it, and you can read them:

1. `scripts/kb/extract/extract-lua-surface.ts` runs against a local copy of the game's decompiled code. It reads the class list from `exposeAll`, then asks Java itself (reflection on the game jar, the same calls Kahlua makes) for the methods, fields and constructors of each class. It finds every place an event is fired, in the Java code and in the vanilla Lua, and judges the side as above. It writes one data file, `scripts/kb/data/lua-surface-42.21.json`, with names, types, counts and locations only.
2. `scripts/kb/gen-lua-reference.ts` turns that data file into these pages: `npm run kb:gen-ref`. A short hand-written notes file next to the data adds the "when" notes, each tied to the call site we read.

After a game update: re-capture the engine, run the extractor against the new capture, run `npm run kb:gen-ref`, and the pages describe the new build.
