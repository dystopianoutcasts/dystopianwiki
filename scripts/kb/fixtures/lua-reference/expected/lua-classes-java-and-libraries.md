---
slug: lua-classes-java-and-libraries
title: 'Lua Classes: Java and library classes (Build 9.99)'
game: pz
version: build-42
section: modding
category: reference
difficulty: advanced
tags:
  - lua-api
  - reference
  - generated
  - classes
excerpt: 'The exposed java and library classes classes of Build 9.99: every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2000-01-02'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Java and library classes

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Standard Java classes (lists, maps, numbers, files) and library classes (JOML vectors, the Kahlua runtime) that the game hands to Lua.

This page holds 2 classes and 3 methods, from the packages `java.util`, `se.krka.kahlua.vm`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 9.99 (revision 0f0f0f0f0f).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### ArrayList

`java.util.ArrayList`, class. Extends `AbstractList`.

Methods, called as `obj:name(...)`:

- `add(E e): boolean`
- `size(): int`

Constructors: `ArrayList.new()`, `ArrayList.new(int)`.

### Coroutine

`se.krka.kahlua.vm.Coroutine`, class. **Exposed only when the game runs in debug mode.**

Methods, called as `obj:name(...)`:

- `getStatus(): String`
