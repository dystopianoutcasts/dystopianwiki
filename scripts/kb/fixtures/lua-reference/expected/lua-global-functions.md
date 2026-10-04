---
slug: lua-global-functions
title: 'Lua Global Functions (Build 9.99)'
game: pz
version: build-42
section: modding
category: reference
difficulty: intermediate
tags:
  - lua-api
  - reference
  - generated
excerpt: 'All 3 global Lua functions of Build 9.99, with their parameter and return types, generated from the code.'
last_updated: '2000-01-02'
related_articles:
  - lua-reference
  - lua-events
  - lua-class-directory
  - lua-classes-characters
---
# Lua global functions in Build 9.99

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

These 3 functions are in the Lua global table from the moment the game starts: call them by name, no `require`, no object. They all live in one Java class, `LuaManager.GlobalObject`, where each carries `@LuaMethod(global = true)`. 4 Java methods stand behind the 3 names, because some names have more than one form (overloads): the game picks the one whose parameters match what you pass.

Types are the Java types: a `String` is a Lua string, `int`, `float`, `double` and their boxed forms are Lua numbers, `boolean` is a Lua boolean, `KahluaTable` is a Lua table, and every other type is a Java object you call methods on. Parameter names come from the decompiled source; a parameter shown with a type only had no single matching declaration to take a name from.

A note follows a function only where the name does not say enough and we read what the code does.

> **Proof:** Code. zombie.Lua.LuaManager$GlobalObject, the methods with @LuaMethod(global = true), as LuaJavaClassExposer#exposeGlobalFunctions reads them. Build 9.99 (revision 0f0f0f0f0f).

## G

- `getFixture(): FixtureCharacter` or `getFixture(int index): FixtureCharacter`

## I

- `isFixture(Object): boolean` - True for fixture objects.

## N

- `newThing(ArrayList<String> names): void`
