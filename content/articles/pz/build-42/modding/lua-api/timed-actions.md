---
id: build-42-timed-actions
slug: timed-actions
title: Timed actions
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
  Timed actions drive "hold to do X" interactions. They use ISBaseTimedAction (a
  subclass of ISBaseObject) as a base and are derived to make your own. Once
  instanced with new, add them to...
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
  - ui
  - engine-internals-calling-exposed-java-from-lua
  - b41-b42-breaking-changes
  - hooks-for-new-b42-systems
  - debugging-lua-in-b42
  - recommended-tooling
---
# Timed actions (ISBaseTimedAction)  [CONFIRMED core + B42.13 MP requirement — pzwiki Timed Action (Lua), revid 1322383 (v42.13.2); Derive, revid 1387725]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Timed actions drive "hold to do X" interactions. They use **`ISBaseTimedAction`** (a subclass of `ISBaseObject`) as a base and are **derived** to make your own. Once instanced with `new`, add them to `ISTimedActionQueue` and the game handles them one after another. Instancing a timed action also creates a `LuaTimedActionNew` Java object; the action's `update` method is called from Java **every tick**. **[CONFIRMED]**

**NEW B42 REQUIREMENT (this was missing before):** since **Build 42.13.0**, timed actions must be **stored globally** to work in **multiplayer**. To avoid polluting the global namespace / conflicting with other mods, prefix the `Type` and expose it via `_G` plus `require`:
```lua
-- prefix the Type with your mod name to reduce conflicts
local MyCustomTimedAction = ISBaseTimedAction:derive("MyMod_MyCustomTimedAction")

-- ... define isValid / start / update / perform / new ...

-- REQUIRED for MP: register it globally under its Type
_G[MyCustomTimedAction.Type] = MyCustomTimedAction

-- allow importing it via require in other files
return MyCustomTimedAction
```
A B41-style timed action that is only a file-local table will **not work in B42 multiplayer**. **[CONFIRMED — pzwiki Timed Action (Lua), revid 1322383]**

**Typical method skeleton** (structure carried from B41; the pzwiki page defers the full default-method list to LuaDocs, so treat the exact field/method set as LuaDocs-authoritative):
```lua
function MyCustomTimedAction:isValid()   -- re-checked each tick; abort if false
    return self.character:getInventory():contains("MyMod.Thing")
end

function MyCustomTimedAction:start()     -- on begin (e.g. self:setActionAnim("Loot"))
end

function MyCustomTimedAction:update() end   -- per tick while running (called from Java)

function MyCustomTimedAction:perform()   -- on completion
    ISBaseTimedAction.perform(self)      -- MUST call parent to end cleanly
end

function MyCustomTimedAction:new(character, item)
    local o = ISBaseTimedAction.new(self, character)
    o.item = item
    o.maxTime = 100          -- ticks; -1 for indefinite
    o.stopOnWalk = true
    o.stopOnRun = true
    return o
end

-- queue it:
ISTimedActionQueue.add(MyCustomTimedAction:new(getPlayer(), item))
```
**[LIKELY on the exact `isValid/start/update/perform/new` field set — pzwiki defers to demiurge LuaDocs `classISBaseTimedAction`; CONFIRMED on the derive + global-storage + queue-add flow]**

---

<a name="11-ui"></a>
