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
  In 42.22 multiplayer a timed action's complete() runs on the server, the server folder loads on clients too, and a vehicle change reaches the client after the action says done. Where your code goes.
last_updated: '2026-11-21'
related_articles:
  - lua-load-order-and-the-three-lua-folders
  - multiplayer-command-patterns
  - timed-actions
  - vehicle-lua-hook-traps
  - reading-server-performance-numbers-honestly
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [modders](#1-a-timed-actions-complete-runs-on-the-server) | [server owners](#10-your-evidence-is-in-the-server-log-so-log-from-the-server)

Outcast, this is the page we wish we had read before our first multiplayer test. Most of the multiplayer bugs we shipped came from one wrong guess about which machine runs which code. Single player cannot show you any of them, because in single player your machine is both sides.

:::callout[The 1-minute version]{kind=key}
- A timed action's `complete()` runs on the server in multiplayer, and is skipped on a multiplayer client. In single player it runs locally. Put the world change and the XP there.
- A Lua action class that has no `complete` function is not sent to the server at all; it runs on the client only.
- `media/lua/server/` also loads on a multiplayer client and in single player. It means "loads when a world loads", not "server only".
- `OnGameStart` is raised in the game's screen code, which a dedicated server never enters; `OnServerStarted` is raised only by the server process. Register startup code, your logger included, on both.
- When a mechanics job ends, the client can see "action done" before the car's part has changed. Wait for the replicated value, with a time limit.
- `BaseVehicle:getId()` is a runtime number that a different car can get later. Key anything you keep on `getSqlId()`.
- Answer a server-side refusal with a command to that one player, or the action just looks like a broken mod.
:::

:::facts
- **Vehicle sync** marked vehicles are sent at most every 100 ms, so about 10 times a second
- **Server loop** the dedicated server's frame rate is locked to 10, so one pass every 100 ms
- **Where `complete()` runs** server and single player; never a multiplayer client
- **Dev links** one copy per mod id: a linked mod that ships `AnimSets` or `actiongroups` can stop you joining
- **Default `ClientCommandFilter`** `-vehicle.*;+vehicle.damageWindow;+vehicle.fixPart;+vehicle.installPart;+vehicle.uninstallPart`
:::

The 100 ms limit and the locked frame rate come from the code. :cite[(`VehicleManager.java:40`, `GameServer.java:859`)]

## 1. A timed action's complete() runs on the server

In Build 42 a timed action is split in two: the player's game runs the animation and the waiting, and the server runs the part that changes the world.

The client runs `start`, `update` and `perform`.

When the action starts on a multiplayer client, the client creates a network request that names the action and its arguments. :cite[(`LuaTimedActionNew.java:133-142`, `ActionManager.java:216-219`)] The server rebuilds the same Lua action by calling `<ActionType>.new(...)` with those arguments. :cite[(`NetTimedAction.java:149-174`)] The server accepts the request only when that call returns an action whose `character` is the sending player; otherwise it answers Reject. :cite[(`NetTimedActionPacket.java:73-93`)]

When the action's time is up, the server calls the action's `complete()`. A `true` answer marks it Done and sends that to the player; `false` or an error marks it Rejected. :cite[(`ActionManager.java:76-103`, `NetTimedAction.java:138-147`)] A `complete()` that returns nothing, or anything that is not a boolean, comes back from the Kahlua call as null; unboxing it into the method's `boolean` result throws inside the `try`, which logs "Perform failed" and returns false, so the action is Rejected. :cite[(`NetTimedAction.java:139-146`, `se/krka/kahlua/integration/LuaCaller.java:62-65`, `se/krka/kahlua/vm/KahluaThread.java:1322-1337`)] That last step is the Java rule for unboxing a null and was not run in the game.

On a multiplayer client, `complete()` is skipped. In single player it runs locally as usual. :cite[(`LuaTimedActionNew.java:176-181`)]

```java
// LuaTimedActionNew.java:176-181
public void complete() {
   super.complete();
   if (!GameClient.client) {
      LuaManager.caller.pcall(..., this.table.rawget("complete"), this.table);
   }
}
```

The constructor turns the network sync off for a Lua class that has no `complete` function, so that class runs on the client only. :cite[(`LuaTimedActionNew.java:85-87`, `LuaTimedActionNew.java:102`)] The full state machine is on [Timed actions and items over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network).

That is why vanilla's `complete()` functions are full of sends such as `sendRemoveItemFromContainer`, `transmitPartItem` and `sendObjectChange`: it is the server telling everyone else what changed. It is also why vanilla's own Mechanics XP for installing a car part lands on a dedicated server: the `addXp` call in `complete()` is server code.

**What it means for you:** put the world change and the XP in `complete()`, in a file both sides load (`shared/`), and make sure your action's `new()` can be rebuilt from the arguments the client sends. Use client-side events such as `OnMechanicActionDone` only for display. That event is raised on the machine that receives a "mechanic action done" object change. :cite[(`IsoGameCharacter.java:10824-10827`)]

The global `addXp(player, perk, amount)` does nothing on a multiplayer client. On a server it sends the XP; in single player it adds it directly. In both of those cases it also does nothing unless the player exists in the world. :cite[(`Lua/LuaManager.java:11856-11867`)] So XP from mod code has to be given by server code.

## 2. The server folder loads on clients too

`media/lua/server/` is not "server only": it loads whenever a world loads, on a multiplayer client, in single player and on a dedicated server alike.

The game loads `shared/` and `client/` at startup, and again after a Lua reload. :cite[(`GameWindow.java:989`, `LuaManager.java:1253-1257`, `Core.java:3547`)] It loads `server/` when a world is loading, and that call is not guarded by `GameClient.client`. :cite[(`GameLoadingState.java:155-156`)] A dedicated server loads `shared/` and `server/`, and reads `client/` for the checksum only. :cite[(`GameServer.java:1517-1519`)]

What really makes a file server-only is a line at its top, `if isClient() then return end`, which is how vanilla's own vehicle commands start. Do not use `isServer()` for that: `isServer()` is false in single player, so your "server" code would never run there. :cite[(`Lua/LuaManager.java:4415-4437`)]

The real constraint is timing. A `shared/` file runs before any `server/` file exists, so it must look up a `server/` table inside a function, when it is needed, not grab it at load time. For the folder rules in full see [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders).

## 3. Startup events: one for the game, one for the server

`OnGameStart` and `OnServerStarted` are raised by different code, so startup code that must run everywhere has to be registered on both.

`OnGameStart` is raised only in `IngameState.enter()`, which a game screen runs. The dedicated server creates an `IngameState` object and calls its `update()`, but never `enter()`. :cite[(`IngameState.java:775`, `GameServer.java:860`, `GameServer.java:1068`)] `OnServerStarted` is raised only in `GameServer.startServer()`, which the server process's `main` calls. :cite[(`GameServer.java:1581`, `GameServer.java:847`)] Two more startup events differ by side. `OnGameBoot` is raised once on the client when the game starts and once on the server process before its worlds load, and the client raises it again after a Lua reload. :cite[(`GameWindow.java:666`, `GameServer.java:1544`, `IngameState.java:1085`)] `OnInitGlobalModData` is raised from `GlobalModData.init()`, which the world calls while it initializes; that runs wherever a world loads, so on a client, in single player and on a server. :cite[(`GlobalModData.java:58-61`, `IsoWorld.java:2028-2030`)]

If the thing you register at startup is your logger, forgetting one of the two events means the server log you look for after a bad session is simply not there.

## 4. The action says Done before the car has changed

When a mechanics job finishes on the server, two things go back to the player's game, and they do not arrive together.

- The "action done" message goes out at once, in the same step that ran `complete()`. :cite[(`ActionManager.java:80-92`)]
- The change to the vehicle part (`transmitPartItem`, `transmitPartCondition`) only marks the part as changed, and does so on the server only. :cite[(`BaseVehicle.java:8252-8267`)] The vehicle manager sends marked vehicles later, inside its update, which is limited to once every 100 ms. :cite[(`VehicleManager.java:40`, `VehicleManager.java:138-139`)] The server loop runs the game state, and so the action manager, before it calls the vehicle manager's update. :cite[(`GameServer.java:1068-1069`, `IngameState.java:1665-1668`)]

So when the client sees its action queue go empty, the part can still read as it was. A client-side sequence ("uninstall, then install the next one") that checks the part straight away will think the job failed. Wait for the replicated value to change, with a time limit, and treat "unchanged" as "not yet", never as "interrupted". Single player never shows this, because `complete()` runs locally first.

## 5. Engine changes do not reach clients unless the server sends them

`BaseVehicle:setEngineFeature(quality, loudness, power)` changes the engine on the machine that calls it and sends nothing.

The engine is written to the network only when `transmitEngine()` has marked it, and `transmitEngine()` does nothing unless it runs on the server. :cite[(`BaseVehicle.java:8181-8183`, `BaseVehicle.java:9239-9243`, `VehicleUpdatePacket.java:216-218`)]

```java
// BaseVehicle.java:9239-9243
public void transmitEngine() {
   if (GameServer.server) {
      this.updateFlags = (short)(this.updateFlags | 4);
   }
}
```

So: call `setEngineFeature` on the server, then `transmitEngine()`. A client calling `setEngineFeature` changes only itself. Vanilla's own repair does exactly that pair. :cite[(`VehiclePart.java:1006-1011`)]

Without it, the server is right and every client is wrong until some unrelated engine state change happens to send the engine along. We shipped a power mod without it and found it by reading, not testing.

**And loudness reads low on clients.** `setEngineFeature` stores loudness multiplied by about 0.37. :cite[(`BaseVehicle.java:8181-8183`, `VehicleEngine.java:90-94`)] The engine packet sends the stored value, and the client feeds it back into `setEngineFeature`, which scales it again. :cite[(`network/fields/vehicle/VehicleEngine.java:68-74`, `network/fields/vehicle/VehicleEngine.java:61`)] So after an engine packet a client's `getEngineLoudness()` reads about 37% of the server's. :cite[(`BaseVehicle.java:8190-8192`)] Other paths store it unscaled: a full load of the car stores the raw value, so the client value can jump around. :cite[(`VehicleEngine.java:100-102`, `VehicleEngine.java:168-175`)] Do not try to correct it in mod code: read loudness on the server only. World sounds are not affected, because the engine's own update, sounds included, runs only when the machine is not a client. :cite[(`VehicleEngine.java:199-200`, `VehicleEngine.java:234`)]

## 6. A car's getId() is not the same car next time

`vehicle:getId()` is a small runtime number that a different car can get later, so a table or log keyed on it can merge two cars.

The server hands the number out from a list of free ids when the car's physics are created, and a car that leaves the world gives its number back; the next car to be created is handed the most recently freed number. :cite[(`BaseVehicle.java:808-810`, `VehicleIDMap.java:98-102`, `VehicleIDMap.java:56-65`, `VehicleManager.java:68-71`)] The id is a `short`. :cite[(`BaseVehicle.java:8519-8521`)] On one of our server sessions the same id belonged first to one car and then to a completely different one. For anything that must survive, key on `getSqlId()`, the car's id in the save database, which is restored from the vehicle database when the car loads. :cite[(`BaseVehicle.java:472-474`, `VehiclesDB2.java:576`, `VehiclesDB2.java:645`)]

Vanilla's own engine warm-up code keys a table of elapsed minutes on `getId()`; that table is kept only while the game runs. :cite[(`media/lua/server/Vehicles/Vehicles.lua:526-553`)]

A part's Lua update is handed the minutes since that part last updated, and an update that comes after a long gap carries the whole gap. :cite[(`VehicleParts.java:377-395`)] If your mod charges something "per minute while running" (fuel, wear, a battery), cap what one update can charge, or a car left alone across town pays hours at once when someone walks up to it. Part updates run when the machine is not a client: on the server and in single player. :cite[(`VehicleParts.java:401-403`)]

On a loaded car, the full part update runs when any of three things is true: the car "needs parts update", its mechanics window is open, or its alarm is active. Otherwise only the parts with a powered device, a lit light or a lightbar get updated. :cite[(`BaseVehicle.java:3547-3551`, `BaseVehicle.java:7921-7936`)] The "needs parts update" flag is set when someone sits in the driver seat, when the engine is running, and when an animal rides in the car. :cite[(`BaseVehicle.java:1822-1826`, `BaseVehicle.java:7508-7512`, `BaseVehicle.java:3258`)]

Vanilla's engine Lua clears the flag again once the engine part has cooled to zero with nobody driving. :cite[(`media/lua/server/Vehicles/Vehicles.lua:556-558`)] The mechanics-window path is covered on [Replacing a vanilla window](/pz/build-42/modding/ui/replacing-a-vanilla-window).

A car in a part of the map nobody has loaded is updated by a stand-in object only in single player: the manager that updates those runs only when the game is neither a client nor a server. :cite[(`IngameState.java:691-693`, `VirtualVehicleManager.java:54-60`)] See [Vehicle Lua hook traps](/pz/build-42/vehicles/reference/vehicle-lua-hook-traps).

## 7. When the server says no, tell the player

When server code re-checks something the client asked for, it can disagree, and if it just returns, nothing tells the player why.

The server may hold an older position for the car, or see a different list of nearby objects. The action then finishes, nothing happens, and it looks like a broken mod.

Always answer. The four-argument `sendServerCommand(player, module, command, args)` sends to that one player's game only; the three-argument form sends to every connection. Both do nothing outside a server. :cite[(`Lua/LuaManager.java:8898-8916`, `GameServer.java:3539-3544`, `GameServer.java:3580-3587`)]

Have the client show the refusal. A refused timed action itself carries no reason to the client. :cite[(`NetTimedActionPacket.java:85-93`)]

## 8. Dependencies: installed is what counts

If your mod's `mod.info` says `require=OtherMod`, the game loads `OtherMod` before yours if it is installed, even when the server's `Mods=` line does not list it.

The load walks each mod's `require` list and loads the required mod first; a mod that is not found is reported with the warning "required mod ... not found". :cite[(`ZomboidFileSystem.java:826-855`)] The lookup goes through the installed mods and is filtered by whether the mod is available: its game-version range fits, and everything it requires is installed and fits too. :cite[(`ChooseGameInfo.java:166-169`, `ChooseGameInfo.java:632-650`, `ChooseGameInfo.java:661-680`)] The warning therefore appears when the required mod is not installed, fails its own version range, or has a requirement of its own that is missing. On a dedicated server, a mod that cannot be found is also removed from the server's mod list. :cite[(`ZomboidFileSystem.java:835-840`)]

So the deployment question is "is it installed, at a version this build accepts?", not "is it in `Mods=`?". To reproduce a missing dependency for a test, remove or rename the mod's folder; leaving it out of `Mods=` is not enough. This page does not say what the `Mods=` line does on its own, because we did not read where a server parses it.

## 9. Before your first multiplayer test: remove your dev links

Many of us develop with a link (a Windows junction) from the game's `mods` or `Workshop` folder to our working copy, and in multiplayer that breaks the join in two ways we hit ourselves.

- **A mod that ships `media/AnimSets` or `media/actiongroups`, reached through a link, stops you joining any server.** In multiplayer, client and server checksum those files. :cite[(`AdvancedAnimator.java:792-803`, `AdvancedAnimator.java:852-858`)] The code shows two things: the checksum resolves the mod folder to its real target, and it finds the `AnimSets` folders by listing the parent folder for a matching name, which does not resolve links. :cite[(`AdvancedAnimator.java:798-800`, `ZomboidFileSystem.java:133-139`)] That these two together make the path mismatch between client and server is our inference from the code, not something we traced; the evidence that the join fails is the game test in the closing box. When the lookup cannot find a path, the checksum throws `couldn't find "<path>"`. :cite[(`AdvancedAnimator.java:831-842`)] The join hangs on the loading screen and then disconnects (seen in game, see the closing box). Single player never runs this checksum.
- **The same mod present twice** (your linked copy and the subscribed Workshop copy) can stop the world loading when the mod re-opens a vanilla item to change it: an item script refuses a second mod id with `Cannot override modID`. On 42.22 that refusal is only thrown on a client in debug mode, which is how many of us test. :cite[(`GameEntityScript.java:256-263`, `scripting/objects/Item.java:75`)]

The fix for both is one copy per mod id: remove the links (in Windows, `cmd /c rmdir "<link>"` removes a junction without touching its target; do not use a recursive delete on a junction), and let the subscribed Workshop copy be the only one.

## 10. Your evidence is in the server log, so log from the server

On a real server you will usually see the server's logs and nothing else, so anything you want to know about a remote round has to be written by code that runs on the server.

Players rarely send you their `console.txt`, so a mod that only writes diagnostics on the client is invisible in every session you did not play yourself. If a client-side mod needs to be readable, have the client send a small report to server code that writes it down, and never trust that report for anything else.

Two things you may expect to find in the server log and will not:

- **Part installs and uninstalls are not client commands.** They are timed actions (section 1), so they never pass through the server's client-command log. The default `ClientCommandFilter` server option lists `vehicle.installPart`, `vehicle.uninstallPart` and `vehicle.fixPart`, but vanilla's `vehicle` command table has no command by any of those names. :cite[(`ServerOptions.java:166`, `media/lua/server/Vehicles/VehicleCommands.lua:10-399`)] The filter decides which commands the server writes to its command log. A `+` entry keeps a command in that log, and the default `-vehicle.*` keeps out the rest of the `vehicle` module. :cite[(`GameServer.java:2272-2290`, `GameServer.java:2318-2335`, `GameServer.java:4399-4409`)]
- **The action log is written at the client's request.** The `ClientActionLogs` list names the actions that are logged; the client matches its action type against the list text when the action performs, then sends a log request that the server writes. By default the list names entering and leaving a vehicle and taking engine parts. :cite[(`ServerOptions.java:168-170`, `media/lua/shared/Logs/ISLogSystem.lua:39-70`, `media/lua/shared/TimedActions/ISBaseTimedAction.lua:68-71`)]

So if you need proof that an install happened on the server, write your own log line in server code. The option names and defaults are on [the server options pages](/pz/build-42/server/server-options/server-options-players-and-admins).

:::callout[How we know]{kind=proof}
- **Code, 42.22.** Every claim above except the next two items was read from the decompiled 42.22 engine and the vanilla Lua on 2026-11-21.
- **Game test, 42.20 and earlier (not re-run on 42.22).** Both dev-link join failures were seen joining a dedicated server from our own client with linked mods in August 2026, and both went away after the links were removed. The evidence was the client's connection log and console.
- **Inferred, not traced:** why a linked mod fails the checksum (section 9) is our reading of the two cited functions.
- **Not tested:** the stale part reading after "action done" (section 4) comes from code order, not from watching a dedicated server. The loudness drift (section 5) comes from the packet code, not from a measurement. The id reuse story in section 6 is one of our own session logs.
:::
