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
  PZ's API is two layers: Lua objects — tables using ISBaseObject + derive
  (timed actions, UI, your own classes). [CONFIRMED — pzwiki Lua object, revid
  1390443] Java objects — direct links to...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-and-versioning
  - the-b42-mod-folder-model
  - lua-load-order-and-the-three-lua-folders
  - registries-lua-the-new-b42-13-identifier-system
  - the-events-system
  - key-globals-and-classes
  - moddata
  - multiplayer-command-patterns
  - timed-actions
  - ui
  - b41-b42-breaking-changes
  - hooks-for-new-b42-systems
  - debugging-lua-in-b42
  - recommended-tooling
---
# Engine internals: calling exposed Java from Lua  [CONFIRMED — pzwiki Lua (API), revid 1390433; Derive, revid 1387725]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

PZ's API is two layers:
1. **Lua objects** — tables using `ISBaseObject` + `derive` (timed actions, UI, your own classes). **[CONFIRMED — pzwiki Lua object, revid 1390443]**
2. **Java objects** — direct links to exposed Java classes via the Kahlua bridge (`IsoPlayer`, `ItemContainer`, `ScriptManager`, `LuaManager.GlobalObject`, etc.). These are **not** Lua tables and don't behave like them. **[CONFIRMED]**

**Calling conventions (canonical, from the wiki):**
- **Static method / no instance needed:** dot syntax — `ClassName.methodName(args)`, e.g. `IsoPlayer.getPlayers()`.
- **Instance method:** colon syntax — `instance:methodName(args)`, e.g. `player:getMoveSpeed()`. The colon passes `self` (the instance) as the first arg.
- **Globals from `LuaManager.GlobalObject`** are called as bare functions: `getPlayer()`, `getCell()`.
- **Constructor:** `ClassName.new(args)` — e.g. `local z = IsoZombie.new(getCell())`. Note a constructor builds an *instance object* for operations; it does not necessarily spawn a live entity (spawning uses dedicated methods). **[CONFIRMED]**

**Deriving your own Lua classes** (the basis for timed actions and UI):
```lua
local MyCustomObject = ISBaseObject:derive("MyCustomObject")  -- Type registers the "class name"

function MyCustomObject:new()
    local o = {}
    setmetatable(o, self)
    self.__index = self
    return o
end

function MyCustomObject:someMethod() end
```
`derive(Type)` creates a brand-new class with the parent's properties; `Type` is stored in the new class's `Type` member and is what MP/global registration keys off (see [Section 10](/pz/build-42/modding/lua-api/lua-api-and-engine-overview)). You can derive from anything already deriving from `ISBaseObject`, giving Lua-side subclassing. **[CONFIRMED — pzwiki Derive, revid 1387725]**

**Accessing Java fields (the reflection escape hatch, now concrete).** Public **static** fields of an exposed class are exposed to Lua in a global table of the same class name (`local x = IsoPlayer.DEATH_MUSIC_NAME`). **Instance fields are NOT directly exposed** — you either use reflection or a library:
```lua
-- reflection helper straight from the wiki
local function getJavaField(object, field)
    local offset = string.len(field)
    for i = 0, getNumClassFields(object) - 1 do
        local m = getClassField(object, i)
        if string.sub(tostring(m), -offset) == field then
            return getClassFieldVal(object, m)
        end
    end
    return nil
end
```
This reaches any field (private or public). The cheaper, cached alternative is the **Starlit Library**, which lets you write `object.field` directly. **Caveat the wiki flags:** you currently **cannot** access a class's *inherited* fields from one of its subclasses via this route. **[CONFIRMED — pzwiki Lua (API), revid 1390433]**

**Hooking a Java method (Lua-side calls only):**
```lua
local index = __classmetatables[ClassName.class].__index
local old_method = index.method
function index:method(...)
    old_method(self, ...)
    -- your extra behavior
end
```
This runs your code when the Java method is invoked **from Lua**. It will **not** fire when the method is called Java-side. Use for niche interception only. **[CONFIRMED — pzwiki Lua (API), revid 1390433]**

**Preferred extension style: decoration over overwrite.** The wiki *highly* recommends wrapping (decorating) an existing function rather than overwriting the file/function, to avoid clobbering other mods:
```lua
local original_add = add
function add(a, b)
    -- pre/post logic here
    return original_add(a, b)
end
```
**[CONFIRMED — pzwiki Lua (language), revid 1390437]**

**Performance rules (still ~10x-relevant):**
- Cache lookups outside loops (`local inv = player:getInventory()` once). Java calls from Lua carry bridge overhead. **[CONFIRMED — pzwiki Lua (API), revid 1390433]**
- Avoid `pairs`/`ipairs` on hot arrays; use a numeric `for i = 1, #t do` loop. For true (non-hashed) arrays use `table.newarray()`. **[CONFIRMED — pzwiki Lua (language), revid 1390437]**
- Minimize `print` in hot paths — excessive printing tanks FPS and can bloat `console.txt` to gigabytes. **[CONFIRMED — pzwiki Lua (language), revid 1390437]**
- Use `ZombRand` not `math.random` in MP-authoritative code.

**Finding what's callable:** read the game's `media/lua/` source plus the Unofficial B42 JavaDocs / `geromet.github.io/PZJavaDocs` (42.15) / demiurge LuaDocs. Do not trust memory of B41 signatures.

---

<a name="13-breaking"></a>
