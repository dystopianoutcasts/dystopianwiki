---
id: build-42-lua-gameplay-mod
slug: lua-gameplay-mod
title: Lua gameplay mod
game: pz
version: build-42
section: modding
category: cookbook
difficulty: intermediate
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build a mod with client and server Lua: a right-click entry sends a command, the server counts it in saved mod data and replies, and a custom Lua event announces the answer.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - custom-ui
  - the-events-system
  - multiplayer-command-patterns
  - moddata
  - lua-load-order-and-the-three-lua-folders
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoLua`: one shared Lua file, one server file, one client file, one translation file, and the two files every mod has, `mod.info` and `poster.png`.
- A right-click entry, **Send demo ping**, makes the client send a command. The server checks it, adds one to a counter kept in mod data, and sends the count back. The client turns the reply into a custom event of the mod's own and shows the count above your character.
- The reply takes a different path in single player and on a server, and the page shows both. A server reply sent with `sendServerCommand` is ignored in single player.
- The `server` folder loads on a multiplayer client too, so the server file ends early there.
:::

:::facts
- **Mod id** `RecipeDemoLua`
- **Command** module `RecipeDemoLua`, command `ping`, reply `pong`
- **Custom event** `RecipeDemoLuaReplied`
- **Files** 6 (`mod.info`, `poster.png`, `Shared.lua`, `Server.lua`, `Client.lua`, `UI.json`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A small round trip between the player's side and the server's side, with a custom event at the end.**

Right-click the ground and the menu has a new line, **Send demo ping**. Choosing it sends a command with a short text. The server answers with a number, how many pings it has counted, and the player sees the floating text **Server counted 1 pings** above the character. Each ping adds one, and the counter lives in the game's saved mod data.

Three ideas carry the recipe. The Lua folders decide where a file runs. A client command and a server command are two separate messages, each with a module name and a command name. And a custom event lets your own files talk to each other without calling each other directly.

The depth is in [The events system](/pz/build-42/modding/lua-api/the-events-system), [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns) and [ModData](/pz/build-42/modding/lua-api/moddata).

## The files

**Six files make the mod, one for each Lua folder and one for the text.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `common/` and `42/` folders and the same `poster.png`. The skeleton's `Boot.lua` is left out here.

```
Zomboid/mods/RecipeDemoLua/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      lua/
        shared/
          RecipeDemoLua/
            Shared.lua
          Translate/
            EN/
              UI.json
        server/
          RecipeDemoLua/
            Server.lua
        client/
          RecipeDemoLua/
            Client.lua
```

Each folder runs in a different place. A single-player game loads `shared` and `client` when the program starts, and `server` when a world begins. :cite[(`zombie/Lua/LuaManager.java:1253-1257`, `zombie/gameStates/GameLoadingState.java:155-156`)]

A dedicated server loads `shared` and `server`, and reads `client` only to compute a checksum. :cite[(`zombie/network/GameServer.java:1516-1520`)] The `server` folder is loaded by the loading screen of every game, so it also loads on a multiplayer client. :cite[(`zombie/gameStates/GameLoadingState.java:148-156`)] Within each folder vanilla's files load first, then the files of each mod, alphabetically. :cite[(`zombie/Lua/LuaManager.java:1200-1203`)]

## Step by step

**Write the six files in this order: the mod info, the shared file, the text, the server, then the client.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Lua
id=RecipeDemoLua
description=A client command, a server reply, a saved counter and a custom event.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/lua/shared/RecipeDemoLua/Shared.lua`

This file runs everywhere, so it holds what both sides share, the module name and the custom event. `LuaEventManager.AddEvent` makes a new event, and it is the same call vanilla uses to declare its own events. :cite[(`media/lua/client/Foraging/ISSearchManager.lua:34-36`, `media/lua/client/Foraging/forageClient.lua:47-48`)]

**File `42/media/lua/shared/RecipeDemoLua/Shared.lua`**

```lua
RecipeDemoLua = RecipeDemoLua or {}
RecipeDemoLua.MODULE = "RecipeDemoLua"

LuaEventManager.AddEvent("RecipeDemoLuaReplied")
```

The call returns the event that is already there when the name exists, and otherwise makes the event and adds it to the `Events` table, which is how `Events.RecipeDemoLuaReplied.Add` becomes possible. :cite[(`zombie/Lua/LuaEventManager.java:579-595`)] A trigger of a name nobody declared adds the event too, with a log line, but a subscriber needs `Events.<name>` to exist when it runs, so declare the event in `shared`, which loads first. :cite[(`zombie/Lua/LuaEventManager.java:234-241`)] Leaving a game clears every event and every handler, and the Lua files load again, so the declaration runs again for the next game. :cite[(`zombie/Lua/LuaEventManager.java:885-893`, `zombie/gameStates/IngameState.java:978`, `zombie/gameStates/IngameState.java:1009`)]

Give the event a name of your own, as here. A name that already exists returns the existing event, so a vanilla name would share its handlers. :cite[(`zombie/Lua/LuaEventManager.java:579-583`)]

### Step 3. `42/media/lua/shared/Translate/EN/UI.json`

This holds the menu text and the floating text. The game picks the table from the start of the key, so keys that start with `UI_` belong in `UI.json`. :cite[(`zombie/core/Translator.java:436-437`)] The text `%1` stands for the first value passed to `getText`, and a whole number prints without a decimal point. :cite[(`zombie/core/Translator.java:917-918`, `zombie/core/Translator.java:551-558`)]

**File `42/media/lua/shared/Translate/EN/UI.json`**

```
{
    "UI_RecipeDemoLua_Ping": "Send demo ping",
    "UI_RecipeDemoLua_Reply": "Server counted %1 pings"
}
```

A key with no text shows the key itself, and in debug mode the log says `ERROR: Missing translation`. :cite[(`zombie/core/Translator.java:489-506`)]

### Step 4. `42/media/lua/server/RecipeDemoLua/Server.lua`

This is the server side: it receives the command, checks it, counts, and replies. The event `OnClientCommand` gives the module, the command, the player who sent it and the arguments. :cite[(`api/events.jsonl:39`)]

**File `42/media/lua/server/RecipeDemoLua/Server.lua`**

```lua
if isClient() then return end

local lastPingMs = {}

local function reply(player, command, args)
    if isServer() then
        sendServerCommand(player, RecipeDemoLua.MODULE, command, args)
    else
        triggerEvent("OnServerCommand", RecipeDemoLua.MODULE, command, args)
    end
end

local function onClientCommand(module, command, player, args)
    if module ~= RecipeDemoLua.MODULE then return end

    if command == "ping" then
        local who = tostring(player:getUsername())

        if player:isDead() then
            print("[RecipeDemoLua] server refused ping from " .. who .. ": the player is dead")
            return
        end

        if type(args) ~= "table" or type(args.note) ~= "string" then
            print("[RecipeDemoLua] server refused ping from " .. who .. ": no text note in the arguments")
            return
        end

        local now = getTimestampMs()
        if lastPingMs[who] and now - lastPingMs[who] < 1000 then
            print("[RecipeDemoLua] server refused ping from " .. who .. ": under one second since the last")
            return
        end
        lastPingMs[who] = now

        local note = string.sub(args.note, 1, 40)
        local data = ModData.getOrCreate("RecipeDemoLua")
        data.pings = (data.pings or 0) + 1
        print("[RecipeDemoLua] server counted ping " .. data.pings .. " from " .. who)
        reply(player, "pong", { count = data.pings, note = note })
    end
end

Events.OnClientCommand.Add(onClientCommand)
```

| Piece | What it does | Code |
|-------|--------------|------|
| `if isClient() then return end` | Ends the file early on a multiplayer client, where the `server` folder also loads. In single player and on a dedicated server `isClient()` is false. | `zombie/Lua/LuaManager.java:4435-4437`, `zombie/gameStates/GameLoadingState.java:155-156` |
| `module ~= RecipeDemoLua.MODULE` | Many mods send commands. The event reaches every handler, so each one must ignore other modules. | `api/events.jsonl:39` |
| `player` | The server takes the player from the connection that sent the command, not from the arguments, so a client cannot name another player. Use it as the identity of the sender. | `zombie/network/GameServer.java:2310-2343`, `zombie/spnetwork/SinglePlayerServer.java:179-205` |
| `player:isDead()` | Refuses the command from a dead character. Vanilla's server click handler makes the same check. | `media/lua/server/ISObjectClickHandler.lua:187` |
| `type(args) ~= "table"`, `type(args.note) ~= "string"` | The arguments come from the other side. Check the table and each value's type, log why a request is refused, and return. Vanilla's debug command does the same. The note is also cut to 40 characters. | `media/lua/shared/DebugCommands/DebugIsoRegionsEdit.lua:15-17` |
| `lastPingMs[who]` | A cooldown of one second per player, keyed by the sender's username, so one client cannot flood the server. Vanilla's foraging server keeps a timestamp from `getTimestampMs()` the same way. | `media/lua/server/Foraging/forageServer.lua:213` |
| `ModData.getOrCreate("RecipeDemoLua")` | Returns a table that the game keeps with the save, and makes it the first time. Vanilla's foraging server code calls it the same way. | `media/lua/server/Foraging/forageServer.lua:26` |
| `reply` with `isServer()` | On a server, sends a server command to the one player. In single player the same call does nothing, so the code raises `OnServerCommand` itself, which is what single player's own client does with a received reply. | `zombie/Lua/LuaManager.java:8912-8916`, `zombie/spnetwork/SinglePlayerClient.java:133-149` |

The checks matter because any logged-in client can send any command to any listener, whatever the menu shows, so the server treats every command as untrusted input.

Vanilla makes the same split in its own code: it sends a server command when `isServer()` is true and does the client work directly otherwise. :cite[(`media/lua/shared/Items/ItemUtils.lua:29-33`, `media/lua/server/BuildingObjects/ISBuildUtil.lua:289-294`)] The version of `sendServerCommand` that takes a player sends to that player's connection only. :cite[(`zombie/network/GameServer.java:3580-3588`)] The version without a player sends to every connection. :cite[(`zombie/network/GameServer.java:3539-3544`)]

The arguments table carries strings, numbers, booleans and nested tables, and a few game objects, such as inventory items, but not a player. A key or value of any other kind is logged as `can't save key,value` and left out. :cite[(`zombie/network/TableNetworkUtils.java:153-181`, `zombie/network/GameServer.java:3524-3527`)] The function is passed to `.Add` as a value, without calling it.

### Step 5. `42/media/lua/client/RecipeDemoLua/Client.lua`

This is the client side: it sends the command, receives the reply, turns it into the custom event, and reacts to that event.

**File `42/media/lua/client/RecipeDemoLua/Client.lua`**

```lua
local function sendPing()
    local player = getPlayer()
    if not player then return end

    sendClientCommand(player, RecipeDemoLua.MODULE, "ping", { note = "hello from the client" })
    print("[RecipeDemoLua] client sent ping")
end

local function onServerCommand(module, command, args)
    if module ~= RecipeDemoLua.MODULE then return end

    if command == "pong" then
        triggerEvent("RecipeDemoLuaReplied", args.count, args.note)
    end
end

local function onReplied(count, note)
    print("[RecipeDemoLua] client got reply " .. count .. ": " .. note)

    local player = getPlayer()
    if player then
        player:setHaloNote(getText("UI_RecipeDemoLua_Reply", count))
    end
end

local function onFillWorldObjectContextMenu(player, context, worldobjects, test)
    if test then return ISWorldObjectContextMenu.setTest() end
    context:addOption(getText("UI_RecipeDemoLua_Ping"), nil, sendPing)
end

Events.OnServerCommand.Add(onServerCommand)
Events.RecipeDemoLuaReplied.Add(onReplied)
Events.OnFillWorldObjectContextMenu.Add(onFillWorldObjectContextMenu)
```

| Piece | What it does | Code |
|-------|--------------|------|
| `sendClientCommand(player, module, command, args)` | Sends the command from a local player. In single player it goes through the game's own message path to the server code, and on a multiplayer client it goes over the network. The version with no player also exists. | `zombie/Lua/LuaManager.java:8882-8896`, `zombie/Lua/LuaManager.java:8866-8876` |
| `Events.OnServerCommand` | Receives every server command, with the module, the command and the arguments. | `api/events.jsonl:194`, `zombie/network/GameClient.java:1000` |
| `triggerEvent("RecipeDemoLuaReplied", ...)` | Raises your custom event with two values. `triggerEvent` is a global that takes the event name and up to four values. | `zombie/Lua/LuaManager.java:5278-5300`, `zombie/Lua/LuaManager.java:5306-5320` |
| `Events.RecipeDemoLuaReplied.Add(onReplied)` | Subscribes to your own event like any other event. Vanilla's foraging code raises and listens to its own events the same way. | `media/lua/client/Foraging/ISSearchManager.lua:1445`, `media/lua/client/Foraging/forageClient.lua:48` |
| `player:setHaloNote(text)` | Shows floating text over the character on the machine that calls it. A server that wants players to see the text uses `transmitHaloNote`, which sends it. | `media/lua/shared/RadioCom/ISRadioInteractions.lua:27`, `zombie/characters/IsoGameCharacter.java:7028-7034` |
| `OnFillWorldObjectContextMenu` | Adds the menu line, as in the [custom UI recipe](/pz/build-42/modding/cookbook/custom-ui). | `media/lua/client/ISUI/ISWorldObjectContextMenu.lua:122-128`, `media/lua/client/ISUI/ISWorldObjectContextMenu.lua:213` |

In single player the server code receives the command in its own update, and not at the moment of the call, so the reply comes a moment after the ping. :cite[(`zombie/spnetwork/SinglePlayerServer.java:179-205`)]

## Turn it on and see it work

**Enable the mod, start a game, right-click the ground, and choose the new line.**

1. Put the `RecipeDemoLua` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoLua/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Lua**, choose **ACCEPT**, and start a new game.
3. Right-click the ground. The menu has the line **Send demo ping**. Choose it.
4. The floating text **Server counted 1 pings** appears over your character, and `console.txt` holds three lines in this order: `[RecipeDemoLua] client sent ping`, `[RecipeDemoLua] server counted ping 1 from ...`, and `[RecipeDemoLua] client got reply 1: hello from the client`.
5. Choose the line again. The number goes up each time. Leave the game and load it again: the number should continue from where it was, because the counter is in mod data. This page did not run that step.

On a dedicated server, copy the mod into the server's own `mods` folder and put `Mods=RecipeDemoLua` in the settings file. Separate several entries with `;`, and do the same for `WorkshopItems=` when a mod comes from the Workshop.

Every player needs the mod too, because the menu line and the reply handler are client code. The server's own console log then holds the `server counted ping` line, and each player's `console.txt` holds the other two, because a `print` lands in the log of the machine that runs it. The server prints the username it holds for the sender, which this page did not check. These server steps have not been run in a game.

## If it does not work

**A command round trip fails in a few predictable ways, and the log lines of this recipe show where it stopped.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| No **Send demo ping** line on the menu | The mod is not checked, or `Client.lua` is not under `media/lua/client/`. Check `console.txt` for a Lua error that names `Client.lua`. | `zombie/Lua/LuaManager.java:1253-1257` |
| An error that names `RecipeDemoLua` as nil | `Shared.lua` did not load, so `RecipeDemoLua.MODULE` does not exist. Check that it sits under `media/lua/shared/`. | `zombie/Lua/LuaManager.java:1255-1256` |
| An error that says `RecipeDemoLuaReplied` is nil, or that `Add` was called on nil | The event was not declared before the client file ran. Keep `AddEvent` in `shared`, which loads first. | `zombie/Lua/LuaEventManager.java:579-595`, `zombie/Lua/LuaManager.java:1255-1256` |
| `client sent ping`, and then nothing | The server code did not run or did not get the command. In single player, check that the mod is checked and `Server.lua` is under `media/lua/server/`. On a server, check the `Mods=` line and that the module name is spelled the same on both sides. | `zombie/gameStates/GameLoadingState.java:155-156`, `zombie/spnetwork/SinglePlayerServer.java:179-205` |
| `server refused ping: no text note in the arguments` | The arguments were missing, or the `note` value is not text. The server checks its input and says why it stopped. | `zombie/network/TableNetworkUtils.java:161-177` |
| `can't save key,value=...` | A value in the arguments cannot be sent, such as a player object. Send plain data, such as an id or a name, and look the object up on the other side. | `zombie/network/TableNetworkUtils.java:179-181`, `zombie/network/GameServer.java:3525-3527` |
| `server counted ping`, and then no reply in single player | The reply used `sendServerCommand`, which does nothing outside a server. Raise `OnServerCommand` yourself, as `reply` does. | `zombie/Lua/LuaManager.java:8912-8916` |
| `server counted ping`, and then no reply on a server | The reply went to a player the server could not find, or the client has no handler for the module. Check that the client file is loaded and the module name matches. | `zombie/network/GameServer.java:3580-3588` |
| The reply arrives twice | Your handler was added twice, for example the same `Events.X.Add` line runs in two files. Each call adds another handler, and nothing checks for a duplicate. | `zombie/Lua/Event.java:105-107` |

Lua files are read when the game loads, so restart the game after every change to a `.lua` or `.json` file. The [debugging Lua page](/pz/build-42/modding/lua-api/debugging-lua-in-b42) covers the log and the debug tools.

## Going further

**Learn the patterns behind each piece, then add a real feature.**

- [The events system](/pz/build-42/modding/lua-api/the-events-system) lists the events and how handlers are called.
- [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns) covers what the server must check and how timed actions fit in.
- [ModData](/pz/build-42/modding/lua-api/moddata) covers saving, syncing and the global and object forms.
- [Lua load order and the three Lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders) explains the load order in more detail.
- [Custom UI](/pz/build-42/modding/cookbook/custom-ui) builds a panel that could show the reply.

:::callout[How we know]{kind=proof}
The folder loading, the event calls, the command calls and the translation behavior come from the 42.22 engine and Lua code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the Lua checker.

It has not been run in a game, in single player or on a server: the menu line, the floating text and the log lines are what you check yourself. We did not run a dedicated server, so the server steps and the multiplayer path are read from the code only. Whether the counter survives a save and load, and how mod data syncs to clients, are not verified here. Dropped from the older page, because 42.22 was not re-read for them: the list of common events, the mod data sync calls, the claims about timed actions and anti-cheat, and the advice about `pcall`.
:::
