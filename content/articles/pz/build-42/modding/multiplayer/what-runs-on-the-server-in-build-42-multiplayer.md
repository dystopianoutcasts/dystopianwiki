---
id: build-42-what-runs-on-the-server-in-build-42-multiplayer
slug: what-runs-on-the-server-in-build-42-multiplayer
title: What runs on the server in Build 42 multiplayer
game: pz
version: build-42
section: modding
category: multiplayer
difficulty: intermediate
tags:
  - multiplayer
  - server
  - timed-actions
  - vehicles
  - sync
excerpt: >-
  In Build 42 multiplayer a timed action's complete() runs on the server, the
  server folder loads on clients too, and a vehicle change reaches the client
  after the action says it is done. The facts that decide where your multiplayer
  code goes, read from the 42.21 code.
last_updated: '2026-10-04'
related_articles:
  - lua-load-order-and-the-three-lua-folders
  - multiplayer-command-patterns
  - timed-actions
  - vehicle-lua-hook-traps
  - reading-server-performance-numbers-honestly
---
# What runs on the server in Build 42 multiplayer

Outcast, this is the page we wish we had read before our first multiplayer test. Most of the multiplayer bugs we shipped came from one wrong guess about which machine runs which code. Single player cannot show you any of them, because in single player your machine is both sides. Here is what the Build 42 code actually does.

## A timed action's complete() runs on the server

In Build 42 a timed action is split in two. The player's game runs the animation and the waiting (`start`, `update`, `perform`). The part that changes the world, `complete()`, runs on the **server**:

1. When the action starts on the client, the client sends the server a request naming the action and its arguments.
2. The server rebuilds the same Lua action from that request by calling `<ActionType>.new(...)` with the arguments.
3. When the action's time is up, the server calls its `complete()`.
4. On a multiplayer client, `complete()` is skipped. In single player it runs locally as usual.

```java
// zombie.characters.CharacterTimedActions.LuaTimedActionNew#complete
if (!GameClient.client) {
   // ... calls the Lua complete()
}
```

That is why vanilla's `complete()` functions are full of sends such as `sendRemoveItemFromContainer`, `transmitPartItem` and `sendObjectChange`: it is the server telling everyone else what changed. It is also why vanilla's own Mechanics XP for installing a car part does land on a dedicated server: the `addXp` in `complete()` is server code.

**What it means for you:** put the world change and the XP in `complete()`, in a file both sides load (`shared/`), and make sure your action's `new()` can be rebuilt from the arguments the client sends. Use client-side events such as `OnMechanicActionDone` only for display.

> **Proof:** Code. `zombie.core.NetTimedAction#parse` (server only: looks up `<type>.new` and rebuilds the action) and `#perform` (calls the action's `complete`); `zombie.core.ActionManager#update` (calls `perform` when the action's time is up); `zombie.characters.CharacterTimedActions.LuaTimedActionNew#start` (client creates the network action) and `#complete` (skipped on a client). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

Remember the XP rule that goes with it: the global `addXp(player, perk, amount)` does nothing at all on a multiplayer client. On a server it sends the XP; in single player it adds it directly. So XP from mod code has to be given by server code.

> **Proof:** Code. `zombie.Lua.LuaManager.GlobalObject#addXp` (`if (GameServer.server) ... else if (!GameClient.client) ...`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The server folder loads on clients too

`media/lua/server/` is not "server only". The name is old. It means "loads when a world loads":

- `shared/` and `client/` load when the game starts.
- `server/` loads when a world is loading, on a multiplayer client, on a single-player game, and on a dedicated server alike. There is no client check on that call.
- A dedicated server also reads `client/`, but only to checksum it; it does not run it.

What really makes a file server-only is a line at its top, `if isClient() then return end`, which is how vanilla's own vehicle commands start. Do not use `isServer()` for that: it is false in single player, so your "server" code would never run there.

The real constraint is timing. A `shared/` file runs before any `server/` file exists, so it must look up a `server/` table inside a function, when it is needed, not grab it at load time.

For the folder rules in full see [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

> **Proof:** Code. `zombie.Lua.LuaManager#LoadDirBase()` (`shared`, `client` at startup); `zombie.gameStates.GameLoadingState#enter` (`LoadDirBase("server")`, not guarded by `GameClient.client`); `zombie.network.GameServer#doMinimumInit` (`shared`, `client` checksum only, `server`); `LuaManager.GlobalObject#isServer` and `#isClient` (both false in single player). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Startup events: one for the game, one for the server

`OnGameStart` is raised only when a game screen is entered, which a dedicated server never does. `OnServerStarted` is raised only by the server process (a dedicated server, or the hosting game in co-op). Anything that must run at startup everywhere has to be registered on both. If that thing is your logger, forgetting it means the server log you look for after a bad session is simply not there.

> **Proof:** Code. `zombie.gameStates.IngameState#enter` (the only `triggerEvent("OnGameStart")`); `zombie.network.GameServer#startServer` (the only `triggerEvent("OnServerStarted")`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## The action says Done before the car has changed

When a mechanics job finishes on the server, two things go back to the player's game, and they do not arrive together:

- The "action done" message goes out at once, in the same step that ran `complete()`.
- The change to the vehicle part (`transmitPartItem`, `transmitPartCondition`) only marks the part as changed. The vehicle manager sends marked vehicles later in the same server frame, and at most once every 100 ms.

So when the client sees its action queue go empty, the part can still read as it was. A client-side sequence ("uninstall, then install the next one") that checks the part straight away will think the job failed. Wait for the replicated value to change, with a time limit, and treat "unchanged" as "not yet", never as "interrupted". Single player never shows this, because `complete()` runs locally first.

> **Proof:** Code. `zombie.core.ActionManager#update` (sends the action's Done state right after `perform`); `zombie.vehicles.BaseVehicle#transmitPartItem` and `#transmitPartCondition` (server only, set flags); `zombie.vehicles.VehicleManager#serverUpdate` (`UpdateLimit(100L)`); `zombie.network.GameServer#main` (the game state update, which runs the action manager, comes before `VehicleManager.instance.serverUpdate()`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Engine changes do not reach clients unless the server sends them

`BaseVehicle:setEngineFeature(quality, loudness, power)` changes the engine on the machine that calls it and sends nothing. The engine is only written to the network when `transmitEngine()` has marked it, and `transmitEngine()` does nothing unless it runs on the server:

```java
public void transmitEngine() {
   if (GameServer.server) {
      this.updateFlags = (short)(this.updateFlags | 4);
   }
}
```

So: call `setEngineFeature` on the server, then `transmitEngine()`. A client calling `setEngineFeature` changes only itself. Vanilla's own repair does exactly that pair. Without it, the server is right and every client is wrong until some unrelated engine state change happens to send the engine along. We shipped a power mod without it and found it by reading, not testing.

**And loudness reads low on clients.** `setEngineFeature` stores loudness multiplied by about 0.37. The engine packet sends the stored value, and the client feeds it back into `setEngineFeature`, which scales it again. So after an engine packet a client's `getEngineLoudness()` reads about 37% of the server's. Other paths (a full load of the car, a part change that recomputes stats) store it unscaled, so the client value can jump around. Do not try to correct it in mod code: read loudness on the server only. World sounds are not affected, because the engine's own update, sounds included, runs only on the server.

> **Proof:** Code. `zombie.vehicles.BaseVehicle#setEngineFeature` and `#transmitEngine`; `zombie.network.packets.vehicle.VehicleUpdatePacket#write` (engine written only when flag 4 is set); `zombie.network.fields.vehicle.VehicleEngine#write` and `#parse` (calls `setEngineFeature` with the received values); `zombie.vehicles.VehicleEngine#setFeatures` (`loudness * 0.37037036F`), `#setLoudness` and `#load` (raw), `#update` (only when not a client); `zombie.vehicles.VehiclePart#repair` (`setEngineFeature` then `transmitEngine`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## A car's getId() is not the same car next time

`vehicle:getId()` is a small runtime number the server hands out from a list of free ids. When a car streams out, its id goes back on the list, and the next car to stream in can get it. On one of our server sessions the same id belonged first to one car and then to a completely different one. Any table or log keyed on `getId()` can merge two cars. For anything that must survive, key on `getSqlId()`, the car's id in the save database.

> **Proof:** Code. `zombie.vehicles.VehicleIDMap#allocateID` (reuses the last freed id) and `#remove` (frees it); `zombie.vehicles.VehicleManager#sendVehicles` (allocates); `zombie.vehicles.BaseVehicle#getId` (a `short`) and `#getSqlId` (restored from the vehicle database on load). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

Also: a part's Lua update is handed the minutes since that part last updated, and a car nobody is near does not update at all. The first update after a long absence carries the whole gap. If your mod charges something "per minute while running" (fuel, wear, a battery), cap what one update can charge, or a car left running across town pays hours at once when someone walks up to it. Part updates run only on the server and in single player.

> **Proof:** Code. `zombie.vehicles.VehicleParts#updatePart` (passes `elapsedHours * 60` since `part.getLastUpdated()`, which is saved with the car) and `#update` (not on a client). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

A car in a part of the map nobody has loaded can still be updated, as a stand-in object that is not a normal vehicle. See [Vehicle Lua hook traps](/pz/build-42/vehicles/reference/vehicle-lua-hook-traps).

## When the server says no, tell the player

When your server code re-checks something the client asked for, it can legitimately disagree: it may hold an older position for the car, or see a different list of nearby objects. If it just returns, the player's action finishes, nothing happens, and nobody knows why. It looks like a broken mod.

Always answer. The four-argument `sendServerCommand(player, module, command, args)` sends to that one player's game only; the three-argument form sends to everyone. Have the client show the refusal.

> **Proof:** Code. `zombie.Lua.LuaManager.GlobalObject#sendServerCommand(IsoPlayer, String, String, KahluaTable)` and `zombie.network.GameServer#sendServerCommand(IsoPlayer, ...)` (looks up that player's connection and sends to it alone); both forms do nothing outside a server. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Your evidence is in the server log, so log from the server

On a real server you will usually see the server's logs and nothing else: players rarely send you their `console.txt`. So a mod that only writes diagnostics on the client is invisible in every session you did not play yourself. Anything you want to know about a remote round has to be written by code that runs on the server. If a client-side mod needs to be readable, have the client send a small report to server code that writes it down, and never trust that report for anything else.

Two things you may expect to find in the server log and will not:

- **Part installs and uninstalls are not client commands.** They are timed actions (above), so they never pass through the server's client-command log. The default `ClientCommandFilter` server option even lists `vehicle.installPart` and `vehicle.uninstallPart`, but vanilla never sends commands by those names. The separate action log (`ClientActionLogs`) only covers the actions it names, and by default those are entering and leaving a vehicle and taking engine parts.
- So if you need proof that an install happened on the server, write your own log line in server code.

> **Proof:** Code. `zombie.network.GameServer#receiveClientCommand` and `#initClientCommandFilter`; `zombie.network.ServerOptions` (`ClientCommandFilter` default `-vehicle.*;+vehicle.damageWindow;+vehicle.fixPart;+vehicle.installPart;+vehicle.uninstallPart`, `ClientActionLogs` default `ISEnterVehicle;ISExitVehicle;ISTakeEngineParts;`); `media/lua/server/Vehicles/VehicleCommands.lua` (no `installPart` or `uninstallPart`); `media/lua/shared/Logs/ISLogSystem.lua`, `logAction`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Dependencies: installed is what counts

If your mod's `mod.info` says `require=OtherMod`, the game loads `OtherMod` before yours **if it is installed**, even when the server's `Mods=` line does not list it. The lookup scans the installed mods and never reads `Mods=`. The "required mod not found" warning only appears when the required mod is not installed, fails its own version range, or has a missing requirement of its own.

So the deployment question is "is it installed, at a version this build accepts?", not "is it in `Mods=`?". To reproduce a missing dependency for a test, remove or rename the mod's folder; leaving it out of `Mods=` is not enough.

> **Proof:** Code. `zombie.ZomboidFileSystem#loadModAndRequired` and `#loadModsAux` (each `require` resolved through `ChooseGameInfo.getAvailableModDetails` and loaded first); `zombie.gameStates.ChooseGameInfo#getAvailableModDetails` (installed mods, filtered by `Mod#isAvailable`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Before your first multiplayer test: remove your dev links

Many of us develop with a link (a Windows junction) from the game's `mods` or `Workshop` folder to our working copy, so edits show up without copying. That is fine in single player. In multiplayer it breaks the join in two ways we hit ourselves:

- **A mod that ships `media/AnimSets` or `media/actiongroups`, reached through a link, stops you joining any server.** In multiplayer, client and server checksum those files. The checksum builds each file's path from the link's real target on one side and from the link itself on the other, so the two never match, the path stays absolute, and the lookup fails with `couldn't find "<path>.xml"`. The join hangs on the loading screen and then disconnects. Single player never runs this checksum.
- **The same mod present twice** (your linked copy and the subscribed Workshop copy) can stop the world loading when the mod re-opens a vanilla item to change it: the world dictionary refuses to give one item two mod ids, `Cannot override modID`. On 42.21 that refusal is only thrown in debug mode, which is how many of us test.

The fix for both is one copy per mod id: remove the links (in Windows, `cmd /c rmdir "<link>"` removes a junction without touching its target; do not use a recursive delete on a junction), and let the subscribed Workshop copy be the only one. The server requires the published version anyway, so that is the version you should be testing.

> **Proof:** Code. `zombie.core.skinnedmodel.advancedanimation.AdvancedAnimator#load` (only when `GameServer.server || GameClient.client`), `#loadModMedia` (base from `File#getCanonicalFile`, files found through `ZomboidFileSystem#getCanonicalFile(File, String)`, which matches names with `listFiles` and does not resolve links) and `#buildChecksum` (throws `couldn't find`); `zombie.scripting.entity.GameEntityScript#setModID` (throws `Cannot override modID` only on a client with `Core.debug`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Game test. Both failures seen joining a dedicated server from our own client with linked mods in August 2026, and both gone after the links were removed; the evidence was the client's connection log and console. Build 42.20.
