---
id: build-42-moddata
slug: moddata
title: ModData
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
  ModData tables are plain Lua tables the game persists for you across sessions
  — no manual save call needed. Only plain-old data persists: strings, booleans,
  numbers, and (nested) tables. Do not...
last_updated: '2026-09-29'
related_articles:
  - tl-dr-the-5-things-that-will-break-your-b41-mod
  - b42-status-and-versioning
  - the-b42-mod-folder-model
  - lua-load-order-and-the-three-lua-folders
  - registries-lua-the-new-b42-13-identifier-system
  - the-events-system
  - key-globals-and-classes
  - multiplayer-command-patterns
  - timed-actions
  - ui
  - engine-internals-calling-exposed-java-from-lua
  - b41-b42-breaking-changes
  - hooks-for-new-b42-systems
  - debugging-lua-in-b42
  - recommended-tooling
---
# ModData  [CONFIRMED — pzwiki Mod data, revid 1317225 (page version 42.13.1)]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

ModData tables are **plain Lua tables** the game persists for you across sessions — no manual save call needed. **Only plain-old data persists: strings, booleans, numbers, and (nested) tables.** Do not store Java object references. **[CONFIRMED]**

**Object mod data** (attached to any `IsoObject` instance — a player, a tile, an item):
```lua
local player = getPlayer()
local modData = player:getModData()   -- a table you read/write
modData.myString = "Hello World"
modData.myNumber = 42
modData.myTable  = {1, 2, 3}
modData.myBoolean = true
```
**[CONFIRMED]**

**Global mod data** (not tied to an object; keyed by a unique string via the `ModData` class):
```lua
local modData = ModData.getOrCreate("MyModDataID")
modData.counter = modData.counter or 0
```
**[CONFIRMED]**

**Caching pattern** (the reference is stable for the whole session — cache it once at save launch):
```lua
local modData

Events.OnInitGlobalModData.Add(function()
    modData = ModData.getOrCreate("MyModDataID")   -- correct place to init/cache
end)

Events.OnWeaponHitCharacter.Add(function(attacker, target, weapon, damage)
    modData.lastUsedWeapon = weapon:getFullType()  -- persists automatically
end)
```
**[CONFIRMED — this is the wiki's canonical example, verbatim pattern]**

**Gotchas the wiki calls out explicitly:**
- **`OnSave` trap:** accessing mod data during the `OnSave` event does **not** touch the current save's mod data but the *next session's* — anything you write there may leak into the next session (as long as you don't close the game). Don't mutate ModData in `OnSave`. **[CONFIRMED]**
- **MP client persistence:** in online multiplayer, **GlobalModData is not saved on clients** (client-only save), so it will **not persist on reconnect**. Store anything that must survive reconnect server-side. **[CONFIRMED]**

**Networking / sync.** Global and object mod data are **NOT** automatically synchronized between server and clients — by design (gives you control over bandwidth, and enables client-only persistent data). This corrects the earlier claim that per-object item modData "syncs when the item/container syncs": treat *nothing* as auto-synced.

There is a **native sync path** with limits: the `ModData` class has a **`transmit`** function that sends the *entire* table for a given key from client->server or server->client. You must manually intercept the transmitted data with the **`OnReceiveGlobalModData(key, modData)`** event. Because the whole table is serialized and sent at once, this is **only suitable for small amounts of data** — it was shown to be problematic/costly at scale. For larger data, use the command system in [Section 9](/pz/build-42/modding/lua-api/lua-api-and-engine-overview) instead. **[CONFIRMED — pzwiki Mod data, revid 1317225]**

```lua
-- SENDER (client or server): push the whole table for this key across the wire
ModData.transmit("MyModDataID")

-- RECEIVER: intercept it
Events.OnReceiveGlobalModData.Add(function(key, modData)
    if key == "MyModDataID" then
        -- apply modData locally
    end
end)
```

> This closes the earlier **[UNCERTAIN]** about whether B42 changed the ModData transmit API: `transmit` + `OnReceiveGlobalModData` is the current, documented mechanism. **[CONFIRMED]**

---

<a name="9-mp-commands"></a>
