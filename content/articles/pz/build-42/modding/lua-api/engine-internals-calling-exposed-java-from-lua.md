---
id: build-42-engine-internals-calling-exposed-java-from-lua
slug: engine-internals-calling-exposed-java-from-lua
title: 'Engine internals: calling exposed Java from Lua'
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
  How Lua calls Java in Build 42.22: dot or colon, which classes are exposed, why an instance field reads nil, why a Java error is logged and not raised, and how to patch a Java method from Lua.
last_updated: '2026-11-16'
related_articles:
  - kahlua-what-project-zomboid-lua-does-not-have
  - key-globals-and-classes
  - lua-api-and-engine-overview
  - the-events-system
  - timed-actions
  - multiplayer-command-patterns
  - patching-vanilla-lua
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who call the game's Java from Lua and want to know what works, what fails quietly, and what is only for debug mode. The overview of the Lua runtime is [the Lua API overview](/pz/build-42/modding/lua-api/lua-api-and-engine-overview), and what the Lua language itself lacks is on [Kahlua: what the game's Lua does not have](/pz/build-42/modding/lua-api/kahlua-what-project-zomboid-lua-does-not-have).

:::callout[The 1-minute version]{kind=key}
- Call an instance method with a colon, `player:getInventory()`. Call a static method or read a static field with a dot, `IsoPlayer.getPlayers()`. Build an object with `ClassName.new(...)`.
- Using a dot on an instance method fails with "Expected a method call but got a function call".
- Lua can only call classes the game registered: 1,022 are listed, and 3 of those appear only when the game was started with `-debug`.
- Lua cannot read an object's instance fields: a read gives `nil`. A public static field is copied once, when its class is exposed.
- The helpers `getNumClassFields`, `getClassField` and `getClassFieldVal` work only with `-debug`. Without it they log "Not in debug" and return nothing.
- A Java exception inside a method you call is logged and the call returns nothing, so `pcall` still reports success.
- Patching a Java method from Lua changes only calls made from Lua, and only for the class whose own table you patched.
:::

:::facts
- **Exposed classes** 1,022 listed, 3 of them only with `-debug` (`Field`, `Method`, `Coroutine`)
- **Global functions** 725 distinct names
- **Methods and fields hidden from Lua** by `@HiddenFromLua`, which is checked on every method, field and constructor
- **Argument errors** raise a Lua error; **Java exceptions** inside the method are logged and not raised
:::

## 1. Two kinds of object: Lua tables and Java objects

**Your own classes are Lua tables, and the game's classes are Java objects that are not tables and do not behave like them.**

A Lua class is a table that derives from `ISBaseObject`. `derive` makes a new table, points its metatable at the parent, and stores your name in `Type`. :cite[(`media/lua/shared/ISBaseObject.lua:9-16`)] Timed actions and most of the UI work this way, and a timed action's rules are on [Timed actions](/pz/build-42/modding/lua-api/timed-actions).

A Java object is a different thing. The engine looks up its methods through a metatable it builds for the class, and its `type` is `userdata`, not `table`. :cite[(`se/krka/kahlua/vm/KahluaUtil.java:192-208`)] So `pairs(object)` fails with "Expected a table", and you cannot add a field to the object. :cite[(`se/krka/kahlua/stdlib/TableLib.java:82-88`)]

## 2. Calling Java: dot, colon and `new`

**A colon passes the object as the first argument and a dot does not, and the engine checks which one you used.**

- **Instance method:** `player:getInventory()`. The invoker for an instance method expects the object first, and when it is missing the call fails with "Expected a method call but got a function call". :cite[(`se/krka/kahlua/integration/expose/LuaJavaInvoker.java:46-56`)]
- **Static method:** `IsoPlayer.getPlayers()`. Public static methods are put on a table named for the class. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:286-299`, `zombie/characters/IsoPlayer.java:999`)]
- **Constructor:** `IsoZombie.new(getCell())`. Each public constructor of a class that is not abstract becomes `new` on that table. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:315-319`, `zombie/characters/IsoZombie.java:551`)]
- **Global functions:** `getPlayer()` and `getCell()` are bare names, made from the methods marked `@LuaMethod` with `global = true`. :cite[(`zombie/Lua/LuaManager.java:2727`, `se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:251-270`)] The common ones are on [Key globals and classes](/pz/build-42/modding/lua-api/key-globals-and-classes).

The class table is reachable by its simple name, such as `IsoPlayer`, and by its full package path with each dot a table level. A nested class has its `$` read as a dot. If two classes share a simple name, the first one registered keeps it. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:286-292`)] Each class table also has a field `class`, which holds the Java class. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:289`)]

When the arguments do not fit, the call raises a Lua error after logging it: "expected N arguments, got M", or "expected argument of type X, got Y". A method with several overloads tries them by argument type, and when none fits the error reads "No implementation found for function" with the name and the arguments you passed. :cite[(`se/krka/kahlua/integration/expose/LuaJavaInvoker.java:65-70`, `se/krka/kahlua/integration/expose/LuaJavaInvoker.java:121-125`, `se/krka/kahlua/integration/expose/MethodArguments.java:86-104`, `se/krka/kahlua/integration/expose/MultiLuaJavaInvoker.java:27-89`)]

## 3. Which classes and methods Lua can reach

**Lua can call only the classes the game registers by name, and for each one the public instance methods, including inherited ones.**

The game lists its exposed classes in one place and tells the exposer to expose only a class that is on that list. :cite[(`zombie/Lua/LuaManager.java:1700-1701`, `zombie/Lua/LuaManager.java:2723-2725`, `zombie/Lua/LuaManager.java:2750-2753`)] The index of the exposed surface lists 1,022 classes, 18 of which are registered by two helper classes, and 3 are registered only inside `if (Core.debug)`. :cite[(`zombie/Lua/LuaManager.java:2685-2689`, `api/lua_exposed.jsonl`)] Those three are `Field`, `Method` and `Coroutine`.

For each exposed class the exposer walks `getMethods()`, which includes the methods a class inherits, and puts each public non-static method that is not marked `@HiddenFromLua` into the class's own table. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:322-329`)] So an exposed subclass has its parents' public methods too: `zombie:getInventory()` works because `getInventory` is a public method that `IsoZombie` inherits.

Some things are refused whatever you do. A class with `@HiddenFromLua` is skipped, so is a method, field or constructor that carries it, and `Class`, `ClassLoader`, `Module`, `Runtime` and `Desktop` are refused, and so are classes in `java.lang.invoke` and `java.lang.reflect`, except `Method` and `Field` in debug mode. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:53-78`, `se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:296`, `se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:303`, `se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:316`)] In debug mode the game also exposes the `getName` and `getSimpleName` methods of `Class`. :cite[(`zombie/Lua/LuaManager.java:2693-2698`)]

## 4. Fields: static ones are copied, instance ones are out of reach

**Lua gets the public static fields of an exposed class as a one-time copy, and it cannot read an instance field at all.**

When a class is exposed, the engine reads each public static field once and stores the value on the class table, unless a method with that name is already there, which logs a warning. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:301-313`)] So `IsoPlayer.DEATH_MUSIC_NAME` works. :cite[(`zombie/characters/IsoPlayer.java:296`)] A static field that changes while the game runs shows the old value in Lua, because the copy is not refreshed.

An instance field has no entry in the object's method table, so a read finds nothing and gives `nil` with no error, and a write fails with "attempted index of non-table". :cite[(`se/krka/kahlua/vm/KahluaThread.java:1114-1141`, `se/krka/kahlua/vm/KahluaThread.java:1151-1177`)] If there is no getter, the value is out of reach, and a mistyped field name looks exactly like a field that is empty.

### The reflection helpers work only in debug mode

**`getNumClassFields`, `getClassField` and `getClassFieldVal` throw "Not in debug" unless the game was started with `-debug`.**

The three helpers, and `getNumClassFunctions` and `getClassFunction`, each begin by checking that the debug flag is on and that the object is not a `Class`, a `ClassLoader` or a method lookup. :cite[(`zombie/Lua/LuaManager.java:1681-1687`, `zombie/Lua/LuaManager.java:7649-7655`, `zombie/Lua/LuaManager.java:7657-7663`, `zombie/Lua/LuaManager.java:7667-7672`, `zombie/Lua/LuaManager.java:7677-7690`, `zombie/Lua/LuaManager.java:7833-7841`)] Outside debug mode the check throws, the engine logs it as in section 5, and the call returns nothing. A helper that loops with `getNumClassFields(object) - 1` then dies on `nil` arithmetic. Inside debug mode it can return a private field: `getClassFieldVal` returns the text `<private>` when the read fails. :cite[(`zombie/Lua/LuaManager.java:7833-7841`)]

```lua
-- debug mode only: read any field of a Java object by name
local function getJavaField(object, fieldName)
    local suffix = string.len(fieldName)
    for i = 0, getNumClassFields(object) - 1 do
        local field = getClassField(object, i)
        if string.sub(tostring(field), -suffix) == fieldName then
            return getClassFieldVal(object, field)
        end
    end
    return nil
end
```

Do not ship a mod that needs this. A player who is not in debug mode gets a logged exception and `nil`, so add a real getter on the Java side, or work from the values the exposed methods already give you.

## 5. A Java exception is logged, not raised

**When a Java method throws, the engine writes the Lua and Java stack traces to the log and the call returns nothing, so the Lua code carries on.**

The code that runs a method catches every throwable, calls the Lua stack-trace dumper and the Java exception logger, and returns. :cite[(`se/krka/kahlua/integration/expose/caller/MethodCaller.java:35-51`)] This holds for instance methods, static methods and the global functions alike. A `pcall` around such a call returns `true`, and the return value is `nil`. A constructor has no such catch, so a constructor that throws raises a Lua error instead. :cite[(`se/krka/kahlua/integration/expose/caller/ConstructorCaller.java:22-24`, `se/krka/kahlua/integration/expose/LuaJavaInvoker.java:142-152`)]

So treat a `nil` result from a call that should return something as a possible failure, and read the log. The wrong-arguments error in section 2 is a different path and does raise. How the log is written, and what `pcall` does with a Lua error, are on the [Kahlua page](/pz/build-42/modding/lua-api/kahlua-what-project-zomboid-lua-does-not-have).

## 6. Hooking a Java method from Lua

**You can replace what a Java method does for Lua callers by editing the method table of its class, and Java's own calls of the method are not touched.**

Every exposed class has an entry in the global table `__classmetatables`, keyed by the class, and its `__index` table holds the method invokers. :cite[(`se/krka/kahlua/vm/KahluaUtil.java:133-135`, `se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:102-117`, `se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:220-233`)] The class table's `class` field is the key.

```lua
local index = __classmetatables[IsoPlayer.class].__index
local originalGetInventory = index.getInventory
function index:getInventory(...)
    -- your code before
    return originalGetInventory(self, ...)
end
```

Four limits matter. First, this runs only when Lua makes the call, and a call made inside Java does not see your function.

Second, each exposed class has its own table that already holds every public method, inherited ones too, so replacing a method in the `IsoGameCharacter` table does not change what an `IsoPlayer` object calls: the player's own table answers first. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:154-168`, `se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:322-329`)] Only a name the child's table lacks falls through to the parent's table, so a brand-new function added to `IsoGameCharacter` does reach an `IsoPlayer`. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:220-232`)] Patch the class of the objects you hold.

Third, a method with several overloads is stored as one object that picks by argument, so forward all arguments with `...` as above. :cite[(`se/krka/kahlua/integration/expose/LuaJavaClassExposer.java:170-188`)] Fourth, two mods that patch the same method wrap each other in load order, and an error in an inner layer ends the outer ones, as described on the Kahlua page. Vanilla's Lua does not use `__classmetatables`, and this was read from the code and not run in a game.

## 7. Prefer wrapping a Lua function over rewriting its file

**Keep the old function, define a new one, and call the old one inside, so you do not replace other mods' changes.**

```lua
local originalAdd = add
function add(a, b)
    -- before
    return originalAdd(a, b)
end
```

Replacing a vanilla file by path wins for the whole file, as [Lua load order](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders) explains. Wrapping lets several mods change one function. The worked patterns are on [Patching vanilla Lua](/pz/build-42/modding/changing-vanilla/patching-vanilla-lua).

## 8. Keep Java calls out of hot loops

**Each Java call converts its arguments and runs through reflection, so cache a lookup you use more than once.**

A call checks the argument count, converts each argument, and then invokes a `java.lang.reflect.Method`. :cite[(`se/krka/kahlua/integration/expose/LuaJavaInvoker.java:42-130`, `se/krka/kahlua/integration/expose/caller/MethodCaller.java:35-39`)] So write `local inventory = player:getInventory()` once, outside the loop, and use `inventory` inside it. No timing was measured for this page, so how much it saves is not stated. Printing in a hot path is a cost too, and the log file size is on the Kahlua page.

## 9. Finding what is callable

**The vanilla Lua under `media/lua` is the check for a name and its arguments, since a missing method reads as `nil`.**

Search the vanilla files for the method call you want, and copy the shape. For a class with no vanilla caller, `if object.methodName then` tells you at run time whether the method exists on what you were handed. Outside reference sites for Java and Lua docs exist, and their coverage of Build 42.22 was not checked for this page.

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; the Kahlua classes come from a local decompile of the same jar. No game was run. The exposed-class and global counts come from the capture's index (`api/lua_exposed.jsonl`, `api/INDEX.md`).

Corrected from the 42.21 page: the field-reflection helper only works in debug mode, which the page did not say; Java exceptions are logged and not raised; `ClassName.class` is the key into `__classmetatables`; and the class-per-table copy of inherited methods limits what a patch reaches. Dropped as unverified: the constructor "does not spawn a live entity" remark, the claims that Starlit Library gives cached field access and that you cannot reach inherited fields, "avoid `pairs` and `ipairs` on hot arrays", the `table.newarray` speed advice, "print can bloat `console.txt` to gigabytes" (it is capped, see the Kahlua page), "use `ZombRand` not `math.random`" (there is no `math.random`), and the third-party JavaDoc and LuaDoc sites.

Not verified: how the patch in section 6 behaves in a running game. The Key globals page left open whether an exposed class gives Lua its parents' methods; section 3 answers it from the exposer, and that reading was not run.
:::
