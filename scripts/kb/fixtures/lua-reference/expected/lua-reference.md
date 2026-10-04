---
slug: lua-reference
title: 'The Build 9.99 Lua Reference'
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
excerpt: 'How Lua reaches the Java engine in Build 9.99, and the complete generated reference: 5 classes, 3 global functions, 2 events.'
last_updated: '2000-01-02'
related_articles:
  - lua-events
  - lua-global-functions
  - lua-class-directory
  - lua-classes-characters
  - the-events-system
  - engine-internals-calling-exposed-java-from-lua
---
# The Build 9.99 Lua reference

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are at the end of this page.

Outcast, everything your mod does goes through what the engine hands to Lua. In Build 9.99 that is 5 Java classes, 3 global functions and 2 events. We generate the whole surface from the code, so it is complete by construction and regenerated after every update. These pages are the result. They hold names, types and where things are called from. They never quote the game's code.

## The pages

- [Lua events](/pz/build-42/modding/reference/lua-events): all 3 events with where each is fired, on which side, and its arguments.
- [Lua global functions](/pz/build-42/modding/reference/lua-global-functions): all 3 with their signatures.
- [Lua class directory](/pz/build-42/modding/reference/lua-class-directory): every exposed class, A to Z, linked to its entry.
- The exposed classes, by area:
  - [Characters, players, zombies and animals](/pz/build-42/modding/reference/lua-classes-characters) (2 classes)
  - [The world: squares, objects, map and weather](/pz/build-42/modding/reference/lua-classes-world) (1 class)
  - [Java and library classes](/pz/build-42/modding/reference/lua-classes-java-and-libraries) (2 classes)

## How Lua reaches Java

The game runs your Lua in Kahlua, a Lua interpreter written in Java. Lua cannot see a Java class until the game hands it over. That happens once, at start-up, in `LuaManager.Exposer.exposeAll()`: it puts a fixed list of classes into a set with `setExposed(SomeClass.class)`, then walks the set and builds a Lua table for each class. A class that is not in the set does not exist for Lua, even when you hold an object of that class: you get the object, but none of its methods.

For each class in the set, Kahlua does four things:

- **Instance methods.** It asks Java for the class's public methods (`Class.getMethods()`), which includes every public method inherited from parent classes and interfaces, interface default methods included. Each one becomes callable as `obj:method(...)`.
- **Static methods.** The public static methods go into a table named after the class, so you call `ClassName.method(...)`.
- **Static fields.** Public static fields are copied into the same table as values, once. Enum values arrive this way: `BodyPartType.Foot_L` is a static field of the enum.
- **Constructors.** Public constructors become `ClassName.new(...)`.

Global functions are separate: Kahlua scans the methods of one object, `LuaManager.GlobalObject`, and every method marked `@LuaMethod(global = true)` becomes a global Lua function under the annotation's name.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll; se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeLikeJava, #exposeMethods, #exposeStatics, #exposeGlobalFunctions (read from the game jar). Build 9.99 (revision 0f0f0f0f0f).

## Why Lua sees methods and not fields

Look at that list again: instance methods, static methods, static fields, constructors. Instance fields are not on it. Kahlua never exposes a field of an object, public or not. So `player.someField` reads `nil` with no error, even when the Java field is public, and a mod built on it silently does nothing. Use the getter: `player:getSomething()`. If there is no getter, Lua cannot read the value.

Static fields are copied once, when the class is exposed. If the game changes a static field later, Lua still holds the old value. Again, use a getter when there is one.

> **Proof:** Code. se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods (Class.getMethods, instance methods only) and #exposeStatics (Class.getFields, static only, value read once with Field.get). Build 9.99 (revision 0f0f0f0f0f).

## What "exposed" means here

- **In the set.** A class is exposed when `exposeAll` (or one of the two helpers it calls, `BuildingRoomsEditor.setExposed` and `UIWorldMap.setExposed`) puts it in the set. That gives 5 classes.
- **Debug only.** 1 of them (`Field`, `Method`, `Coroutine`) are added only when the game runs in debug mode, so a normal game exposes 4. They are listed, and marked.
- **@HiddenFromLua.** A method, field or constructor carrying this annotation is skipped, and a class carrying it is never exposed. The `@UsedFromLua` annotation you see in the code marks intent only: the exposer never reads it.
- **Inherited.** Because the exposer uses `getMethods()`, a method declared in a parent class or interface that is not exposed itself still works on the exposed class. Our class pages list those in full, marked with where they come from.
- **Refused.** Classes in `java.lang.reflect`, `java.lang.invoke` and class loaders are refused even if something adds them (in debug mode `Field` and `Method` are let through).

> **Proof:** Code. se.krka.kahlua.integration.expose.LuaJavaClassExposer#isDisallowed and #exposeMethods; zombie.Lua.LuaManager$Exposer#exposeAll. Build 9.99 (revision 0f0f0f0f0f).

## The reflection ban

Some older mods reach private Java fields through reflection. In the current code the seven global functions that do it (`getNumClassFunctions`, `getClassFunction`, `getNumClassFields`, `getClassField`, `getClassFieldVal`, `getMethodParameter`, `getMethodParameterCount`) call `LuaManager.validateReflectionAccess` first, which throws "Not in debug" unless the game runs in debug mode, and refuses `Class`, `ClassLoader` and method-handle lookups even then. On a normal game, and on every server not in debug mode, reflection from Lua is off. Fixture history sentence.

> **Proof:** Code. zombie.Lua.LuaManager#validateReflectionAccess and its 7 call sites in zombie.Lua.LuaManager$GlobalObject. Build 9.99 (revision 0f0f0f0f0f).

## The numbers

| | Build 9.99 | Build 9.98 |
|---|---|---|
| Exposed classes | 5 (1 in debug mode only) | 4 |
| Methods listed on the class pages | 7 | - |
| Global functions | 3 (4 Java methods) | 3 |
| Events registered at start-up | 2 | 1 |
| Other event names fired by Java or vanilla Lua | 1 | - |
| Registered events nothing fires | 1 | - |
| Event call sites | 3 (1 with an unknown side) | - |
| Hooks | 1 | - |

The methods listed are each class's own methods plus those it inherits from parents that are not exposed; methods inherited from an exposed parent are counted once, on the parent. Build 9.98 (revision 0e0e0e0e0e) is counted the same way, by our engine diff between the two builds.

## What changed since 9.98

- **Classes added:** `FixtureWidget`. Removed: none.
- **Global functions added:** `newThing`. Removed: `oldThing`. A mod still calling a removed function now stops with an error when it calls it.
- **Events added:** `OnFixtureLua`. Removed: none.
- **Fixture change:** something moved.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll, zombie.Lua.LuaEventManager#AddEvents and the @LuaMethod(global = true) methods, counted in both builds and compared. Build 9.99 (revision 0f0f0f0f0f).

## Which side fires an event

In multiplayer, the server and each client run their own copy of the game, and an event fires only in the process whose code reached the call. For each call site the extractor decides the side by these rules, in this order:

1. Fixture rule one.
2. Fixture rule two.

Rule 2's last sentence is the only inference. Everything else is read from the code. With these rules, 1 of the 3 call sites, and 0 events (all of their call sites), stay "unknown". That is honest, not a gap we filled: an unguarded call in shared code can run wherever its caller runs, and following every caller is a bigger job than one page. When the side matters to your mod, test on a dedicated server and read the server's log.

> **Proof:** Code. zombie.network.GameServer (loads media/lua/client with the checksum-only flag, so the dedicated server never runs it), zombie.gameStates.GameLoadingState (loads media/lua/server on clients), and the guards at each call site. Build 9.99 (revision 0f0f0f0f0f).

## How the pages are split

- Events and global functions are one page each.
- Classes are grouped by area, by Java package (for example `zombie.characters` is "Characters", `zombie.iso` and the other map packages are "The world"). An area whose class entries would pass 150 kB is cut into parts at class boundaries, in package order, so a page stays quick to load and every class is whole on one page. A single class bigger than that gets a part of its own.
- The directory lists every class A to Z with a link to its entry.

## How this is made, and how to regenerate it

Two scripts in the wiki repository do it, and you can read them:

1. `scripts/kb/extract/extract-lua-surface.ts` runs against a local copy of the game's decompiled code. It reads the class list from `exposeAll`, then asks Java itself (reflection on the game jar, the same calls Kahlua makes) for the methods, fields and constructors of each class. It finds every place an event is fired, in the Java code and in the vanilla Lua, and judges the side as above. It writes one data file, `scripts/kb/data/lua-surface-9.99.json`, with names, types, counts and locations only.
2. `scripts/kb/gen-lua-reference.ts` turns that data file into these pages: `npm run kb:gen-ref`. A short hand-written notes file next to the data adds the "when" notes, each tied to the call site we read.

After a game update: re-capture the engine, run the extractor against the new capture, run `npm run kb:gen-ref`, and the pages describe the new build.
