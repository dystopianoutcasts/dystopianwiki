---
slug: lua-classes-characters
title: 'Lua Classes: Characters, players, zombies and animals (Build 9.99)'
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
excerpt: 'The exposed characters, players, zombies and animals classes of Build 9.99: every method Lua can call, with parameter and return types, generated from the code.'
last_updated: '2000-01-02'
related_articles:
  - lua-reference
  - lua-events
  - lua-global-functions
  - lua-class-directory
---
# Lua Classes: Characters, players, zombies and animals

> **Generated from the code.** This page is generated from Build 9.99 (revision 0f0f0f0f0f) by `npm run kb:gen-ref`, not written by hand. When the game updates we re-extract the data and run it again, so the page always matches one exact build. The method and how to regenerate it are on [the reference index](/pz/build-42/modding/reference/lua-reference).

Everything that walks: players, zombies, animals, their bodies, stats, skills, moodles and traits. If your mod touches a character, the class you want is probably here.

This page holds 2 classes and 3 methods, from the package `zombie.characters`.

> **Proof:** Code. zombie.Lua.LuaManager$Exposer#exposeAll for the class list; Class#getMethods, #getFields and #getConstructors minus @HiddenFromLua, as se.krka.kahlua.integration.expose.LuaJavaClassExposer#exposeMethods and #exposeStatics read them. Build 9.99 (revision 0f0f0f0f0f).

## How to read this page

- **Methods** are called on an object with a colon: `player:getInventory()`. A method marked "from" a type comes from a parent class or interface that is not exposed itself, so it is listed here in full.
- **Also has the methods of** links to exposed parent classes and interfaces: their methods work on this class too, and are listed once, on their own entries.
- **Static functions** are called on the class table with a dot: `ClassName.name(...)`. Constructors are `ClassName.new(...)`.
- **Static fields** are copied into Lua once, when the class is exposed: Lua does not see later changes. Instance fields are never visible to Lua; use the getters.
- Every class also has the methods every Java object has (`equals`, `hashCode`, `toString`, `getClass` and the thread ones); they are not repeated here.
- Types are shortened to the class name; the full name of each exposed class is under its heading.

## Classes

### FixtureCharacter

`zombie.characters.FixtureCharacter`, class. Extends [FixtureObject](/pz/build-42/modding/reference/lua-classes-world#fixtureobject). Also has the methods of [FixtureObject](/pz/build-42/modding/reference/lua-classes-world#fixtureobject) (1), listed on their own entries.

Methods, called as `obj:name(...)`:

- `getVisual(): FixtureVisual` from `IFixtureVisual`
- `setHealth(float health): void`

Static functions, called as `FixtureCharacter.name(...)`:

- `getInstance(): FixtureCharacter`

Static fields (a copy of the value taken when the class is exposed): `MAX_HEALTH: float`.

### FixtureMood

`zombie.characters.FixtureMood`, enum.

Enum values (read as `FixtureMood.VALUE`): `Calm`, `Angry`.
