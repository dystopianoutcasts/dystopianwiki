---
id: build-42-multiplayer-command-patterns
slug: multiplayer-command-patterns
title: Multiplayer command patterns
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
  B42 keeps the command RPC model. Commands are identified by a module (use your
  mod name) and a command name, and carry an args table. The transmitted args
  can only hold plain-old data (strings...
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
  - timed-actions
  - ui
  - engine-internals-calling-exposed-java-from-lua
  - b41-b42-breaking-changes
  - hooks-for-new-b42-systems
  - debugging-lua-in-b42
  - recommended-tooling
---
# Multiplayer command patterns (client/server)  [CONFIRMED — pzwiki Networking, revid 1436101 (page version 42.13.1)]

> Source: 03_LUA_API_AND_ENGINE.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

B42 keeps the command RPC model. Commands are identified by a **`module`** (use your mod name) and a **`command`** name, and carry an **`args`** table. The transmitted `args` can only hold **plain-old data (strings, booleans, numbers, tables)** — never a Java object instance such as an `IsoPlayer` or a container. **[CONFIRMED]**

**B42 authority change (important):** since **Build 42.13.1** the server handles most gameplay logic (player damage, item stats, etc.). Set those **server-side**, then call sync functions to push exactly what changed. Client-side mutation of authoritative state no longer sticks. **[CONFIRMED]**

**Canonical signatures (as the wiki writes them):**
```
-- client -> server
sendClientCommand(module, command, args)

-- server -> ALL clients
sendServerCommand(module, command, args)

-- server -> ONE client (pass the IsoPlayer instance first)
sendServerCommand(playerObj, module, command, args)
```
> **Correction:** the earlier note gave the client->server form as `sendClientCommand(player, module, command, args)`. The wiki's canonical client call is the **3-argument** `sendClientCommand(module, command, args)` — you do **not** pass the sender; the engine hands the sender `IsoPlayer` to `OnClientCommand` for you (see below). A player-first overload is not part of the documented client API. **[CONFIRMED — pzwiki Networking, revid 1436101]**

**Client side** (send a request, listen for the reply):
```lua
-- send
local args = { id = 42 }
sendClientCommand("MyMod", "requestThing", args)

-- receive server -> client
local function onServerCommand(module, command, args)
    if module == "MyMod" and command == "thingResult" then
        -- apply args to local state / UI  (access data via args.myValue)
    end
end
Events.OnServerCommand.Add(onServerCommand)
```

**Server side** (authoritative handling — note the extra `playerObj` param, which is the sender):
```lua
local function onClientCommand(module, command, playerObj, args)
    if module == "MyMod" and command == "requestThing" then
        -- validate, mutate authoritative state using playerObj
        sendServerCommand(playerObj, "MyMod", "thingResult", { ok = true })
    end
end
Events.OnClientCommand.Add(onClientCommand)
```
Confirmed signatures: `OnClientCommand(module, command, playerObj, args)` (server-side), `OnServerCommand(module, command, args)` (client-side). **[CONFIRMED]**

**Passing a player across the wire.** You can't send an `IsoPlayer`, so send its **`onlineID`** and resolve it on the far side:
```lua
-- CLIENT: include the id
sendClientCommand("MyMod", "cmd", { onlineID = player:getOnlineID() })

-- SERVER: resolve it
local function onClientCommand(module, command, playerObj, args)
    if module == "MyMod" and command == "cmd" then
        local target = getPlayerByOnlineID(args.onlineID)
    end
end
```
Note: when a client sends a command, its own sender `IsoPlayer` is already passed to `OnClientCommand`, so you usually don't need to send your own `onlineID`. **The `onlineID` is NOT persistent** — never use it to identify players/zombies across load/unload (for zombies see `PersistentOutfitID`). **[CONFIRMED]**

**Admin / environment checks:**
- Client side: `isAdmin()`. Server side: `IsoPlayer:getAccessLevel()`.
- Helper the wiki gives: `local function checkClientIsAdmin() return isClient() and isAdmin() or isSinglePlayer() end`. **[CONFIRMED]**

**Sync functions** (global methods the API exposes to push specific state after a server-side change). The wiki lists this section as a stub with one documented entry:
- `syncPlayerStats(IsoPlayer player, int syncParams)` — syncs various player stats; `syncParams` is an integer you build from `CharacterStat` (`zombie.characters.CharacterStat`). **[CONFIRMED — pzwiki Networking, revid 1436101 (stub; more sync fns exist but are undocumented here)]**

**Security rule (still applies in B42):** never trust the client. The server handler must re-validate everything (distance, inventory contents, permissions) before mutating the world — a malicious client can send arbitrary commands/args.

> **Alternative framework note:** some B42 mods use a `LuaNet`-style wrapper (`getModule(...)`, `module.addCommandHandler(...)`, `module.sendPlayer(...)`) instead of the raw `sendClientCommand`/`sendServerCommand` pair. That is a convenience layer, not a replacement — the raw API above is the baseline. **[CONFIRMED as one real pattern]**

---

<a name="10-timed-actions"></a>
