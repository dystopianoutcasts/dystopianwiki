---
id: build-42-connecting-and-logging-in
slug: connecting-and-logging-in
title: 'Connecting and logging in'
game: pz
version: build-42
section: engine
category: networking-and-packets
difficulty: intermediate
tags:
  - engine
  - multiplayer
  - networking
  - login
  - server
excerpt: >-
  What happens between pressing Join and playing in Build 42.22: the password, the account, the login queue, the mod and Workshop checks, the checksum, the downloads, bans, and why a join fails.
last_updated: '2026-11-15'
related_articles:
  - how-multiplayer-works
  - the-packet-system
  - who-owns-what
  - server-options-chat-voice-and-connections
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [server owners](#why-a-join-fails) | [modders](#what-a-mod-can-hook) | players can start with [the join in order](#the-join-in-order) and [why a join fails](#why-a-join-fails)

:::callout[The 1-minute version]{kind=key}
- A join has two gates. RakNet checks the server password first. Then the `Login` packet is checked by the server: game version, account, bans, player cap and, if the server sets a limit, ping.
- If the server option `LoginQueueEnabled` is on (it is off by default), the client waits its turn before it loads.
- The server sends its mod list, sandbox settings and options. The client refuses to continue if a listed mod is not installed.
- On a Steam client, missing Workshop items are offered for download first.
- While the world loads, the client's Lua, script and animation checksums are compared with the server's, if `DoLuaChecksum` is on (it is on by default).
- Every refusal reaches the player as a message made from a translation key. Two reasons have no key in any of the 29 language folders, so the player sees the key itself.
:::

:::facts
- **Default ports** 16261 (`DefaultPort`) and 16262 (`UDPPort`)
- **Player cap** `MaxPlayers`, default 32, range 1 to 254
- **Login queue** off by default; turn timeout 60 s (range 20 to 1,200 s)
- **Checksum timeout** 60 s on the client
- **Ping limit** off by default (`PingLimit` 0); when set, it can refuse a login, and it can kick a running player after 20 slow one-second samples out of the last 60
- **Slot** each connection gets a player id of slot times 4
:::

## The join in order

A join runs five stages: connect, log in, wait in line, check mods, then load the world.

:::flow[From Join to playing]
- The client opens a connection with the server password
- It sends `Login`: version, name, password
- The server checks it and sends the connection details
- The client checks mods, Workshop items and checksums
- The client loads the world and sends `PlayerConnect`
:::

The client starts in `ConnectionManager`, which queues the request, sets the game mode to multiplayer and calls `GameClient.doConnect`. :cite[(`ConnectionManager.java:60-170`, `ConnectionManager.java:199-225`)] If the typed password is to be hashed, the hash is made on the client before anything is sent. :cite[(`ConnectionManager.java:208-211`)]

The first gate is the RakNet connection itself. The client passes the server password to `udpEngine.Connect`, and the server hands the same value, hashed, to `SetIncomingPassword`. :cite[(`GameClient.java:265-272`, `core/raknet/UdpEngine.java:72`)] A wrong password is refused by RakNet, and the client shows "Wrong server password given". :cite[(`core/raknet/UdpEngine.java:249-257`, `GameClient.java:360-362`)]

Once RakNet accepts the connection, a non-Steam client sends `Login` at once. The packet holds the user name, the password, the client's version string and the authentication type. :cite[(`core/raknet/UdpEngine.java:163-170`, `LoginPacket.java:243-258`)] A Steam client waits for its Steam session before it does so. :cite[(`core/raknet/UdpEngine.java:194-198`)]

The server's answer is the connection details: a block holding the server's settings, the map, the Workshop items and mods, the options, the sandbox settings, the game time, and the world dictionary. :cite[(`ConnectionDetails.java:19-40`)] It goes out in parts when it is larger than 1,024 bytes. :cite[(`RequestDataPacket.java:168-180`)] The server also gives the connection a player slot, and the player id is the slot number times 4. :cite[(`GameServer.java:2715-2736`)]

## Passwords and accounts

A server accepts a login only after its version, account and ban checks all pass, and each check can stop the join with its own message.

The server first compares the client's version string with its own, and a difference ends the join with "ClientVersionMismatch" and both version numbers. :cite[(`LoginPacket.java:55-68`)] Then it asks the account database about the name and password. :cite[(`LoginPacket.java:142-143`)] That call rejects, in this order: a name with non-ASCII characters (when `AllowNonAsciiUsername` is off), an invalid name, an IP on the banned list (not on Steam, and not localhost), and an empty password when the server is open (unless the authentication type is 2). :cite[(`ServerWorldDatabase.java:1033-1065`, `ServerOptions.java:49`, `ServerOptions.java:176`)]

For an existing account it then checks the account's role and authentication type. A role without `LoginOnServer` is a ban, a different authentication type sets "WrongAuthenticationMethod", which a later password mismatch can overwrite, and a wrong password gives "InvalidUsernamePassword" (or "DuplicateAccount" when the typed password was empty). :cite[(`ServerWorldDatabase.java:1078-1111`)] For a new name, the server creates the account if the option `Open` is true, or if Steam says that Steam id is allowed, and it enforces `MaxAccountsPerUser`. :cite[(`ServerWorldDatabase.java:1126-1139`, `ServerOptions.java:125`)]

After the account passes, the login packet runs four more checks. :cite[(`LoginPacket.java:146-197`)]

1. The same name must not already be connected ("AlreadyConnected").
2. The server must have room: the player count must be below `MaxPlayers`, unless the role has `CanAlwaysJoinServer` ("ServerFull").
3. A name that matches an existing account only by upper and lower case is refused ("InvalidUsername").
4. If `PingLimit` is above 0 and the player's average ping is over it, the join is refused ("Ping"), unless the role has `CantBeKickedIfTooLaggy`. :cite[(`PingManager.java:31-34`)]

If the account has a second factor the server asks for it with `GoogleAuthRequest`, and otherwise it calls `receiveClientConnect`. :cite[(`LoginPacket.java:199-223`)]

A hosted game (see [How multiplayer works](/pz/build-42/engine/networking-and-packets/how-multiplayer-works)) that also runs in Steam mode uses a shorter branch of the same method. That branch needs both conditions, skips the password check, and has its own copy of the "server full" and "too busy" refusals. :cite[(`LoginPacket.java:85-134`)] A hosted game without Steam takes the normal path, and whoever connects first becomes the host. :cite[(`LoginPacket.java:168-170`)] When Steam is enabled, a connection with no validated Steam session is refused with "AccessDenied". :cite[(`LoginPacket.java:136-139`)]

The "too busy" refusal exists only in the hosted Steam branch, because that is the only place the option `DenyLoginOnOverloadedServer` is read. :cite[(`LoginPacket.java:110-117`)] A search of the whole source finds no other read, so a dedicated server never refuses a login for being busy. In the hosted copy the code disconnects the connection but does not return, so the lines after it still run. We read this and did not test what the player sees. :cite[(`LoginPacket.java:110-133`)]

## Waiting in the login queue

With `LoginQueueEnabled` on, one player at a time is allowed to load, and the rest wait in line.

The client asks for a place with `LoginQueueRequest` as it enters its loading-queue screen. :cite[(`LoadingQueueState.java:35-47`)] A normal player is queued when someone is loading, someone is waiting, or the server is already at `MaxPlayers`, and otherwise joins at once. A role with the `PriorityLogin` capability waits in a separate queue that is served first, and is queued only when someone is loading or other priority players are waiting. :cite[(`LoginQueue.java:42-90`, `LoginQueue.java:170-188`)] Waiting players receive their place, and the server repeats the place to everyone every 20 seconds. :cite[(`LoginQueue.java:24`, `LoginQueue.java:91-103`, `LoginQueue.java:165-167`)]

The player at the front keeps the slot until their connection is fully connected or `LoginQueueConnectTimeout` seconds pass. :cite[(`LoginQueue.java:148-160`, `LoginQueue.java:175`, `ServerOptions.java:144`)] A client that never reaches the end of the join is disconnected with "connection-attempt-timeout", unless it is in the queue. :cite[(`GameServer.java:1131-1143`)]

## Mods, Workshop items and the checksum

The client must have every mod the server lists, and its Lua, scripts and animations must match the server's.

On a Steam client the opening check is Workshop. The client lists the server's items, and if any is missing or out of date it raises `OnServerWorkshopItems` so a screen can ask the player to download them. :cite[(`ConnectToServerState.java:225-266`, `ConnectToServerState.java:268-318`)] It then subscribes to and downloads each item, and stops with an error if one fails. :cite[(`ConnectToServerState.java:353-379`)]

Next the client runs `CheckMods` against the mod list the server sent. A missing mod ends the join with the message "Mod "<name>" is not installed", followed by the mod id and the Workshop id. :cite[(`ConnectToServerState.java:381-412`)] The server owner sets the two lists with the server options `Mods` and `WorkshopItems`. :cite[(`ServerOptions.java:73`, `ServerOptions.java:134`)]

The checksum comes later, while the world loads. When `DoLuaChecksum` is enabled, the client sends a total checksum of its Lua, its scripts and its animations. :cite[(`IsoWorld.java:1929-1960`, `ChecksumPacket.java:231-262`)] The server compares each against its own, and it skips the comparison for a role with the `BypassLuaChecksum` capability. :cite[(`ChecksumPacket.java:231-247`, `LoginPacket.java:173`)] On a mismatch the two sides walk the files in groups of 10 until they can name the file that differs, and whether it is "different", "not on server" or "not on client". :cite[(`NetChecksum.java:85`, `ChecksumPacket.java:45-50`)]

The wait is limited to 60 seconds on the client, which then disconnects with "UI_GameLoad_TimedOut". :cite[(`IsoWorld.java:316`, `IsoWorld.java:1942-1948`)] The server also keeps a mismatching connection for 60 seconds and then times it out, but only if the `AntiCheatChecksum` option is enabled, which it is by default. :cite[(`AntiCheatChecksumUpdate.java:12-26`, `ServerOptions.java:212`)] A published page reports that a mod whose animation files are reached through a folder link causes a mismatch, and we did not re-test that on 42.22: see [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).

## What the client downloads

The client downloads the server's settings first and the map afterward, chunk by chunk.

The settings arrive in the connection details described above. The map does not: as the player moves, the client sends `RequestZipList` with the chunk coordinates it needs and the CRC of any copy it already holds. :cite[(`RequestZipListPacket.java:37-71`)] The server's `PlayerDownloadServer` loads each chunk, compresses it and sends it, or answers `NotRequiredInZip` when the client's copy matches. :cite[(`PlayerDownloadServer.java:38-62`, `PlayerDownloadServer.java:219-262`)]

A request from a connection that did not go through the loading step is refused: the server kicks it with "The server received an invalid request". :cite[(`RequestZipListPacket.java:52-55`)] Which chunks the server loads for a player is covered in [Who owns what](/pz/build-42/engine/networking-and-packets/who-owns-what).

## Bans and kicks

A ban stops a login before the world loads, and a kick ends a connection that is already running.

A ban is stored in one of three places: the account's role (a role without `LoginOnServer`), a banned-IP table (non-Steam only) or a banned-Steam-id table. :cite[(`ServerWorldDatabase.java:1047`, `ServerWorldDatabase.java:1086-1091`, `ServerWorldDatabase.java:1158`)] A staff ban through `BanUser` also writes a userlog entry and kicks the player at once, and the call is refused for a target whose role has `CantBeBannedByUser`. :cite[(`BanSystem.java:26-69`)]

A kick is a `Kicked` packet followed by a forced disconnect. :cite[(`GameServer.java:3311-3314`, `core/raknet/UdpConnection.java:383-390`)] The client turns the packet into the `OnConnectFailed` event while it is still joining, or into a server chat message once it is playing. :cite[(`KickedPacket.java:68-90`)]

## Why a join fails

Each refusal is a short code that the client turns into a translated message, and the table pairs the two.

| Code sent | English message | Raised when | Code |
|---|---|---|---|
| (RakNet) invalid password | Wrong server password given | The server password does not match | :cite[(`core/raknet/UdpEngine.java:249-257`, `media/lua/shared/Translate/EN/UI.json:1092`)] |
| `ClientVersionMismatch` | Client version (%1) does not match server version (%2) | The version strings differ | :cite[(`LoginPacket.java:55-68`, `media/lua/shared/Translate/EN/UI.json:1093`)] |
| `NonAsciiCharacters` | Username contains non-Ascii characters. | The name has non-ASCII characters and `AllowNonAsciiUsername` is off | :cite[(`ServerWorldDatabase.java:1036-1039`, `media/lua/shared/Translate/EN/UI.json:1096`)] |
| `InvalidUsername` | Invalid username given | The name is not valid, or matches another account only by case | :cite[(`ServerWorldDatabase.java:1040-1043`, `LoginPacket.java:183-187`, `media/lua/shared/Translate/EN/UI.json:1095`)] |
| `Banned`, `BannedReason` | You are banned from this server. Reason: %1 | The role, IP or Steam id is banned | :cite[(`LoginPacket.java:225-232`, `media/lua/shared/Translate/EN/UI.json:1090-1091`)] |
| `UserPasswordRequired` | An account password is required | The password is empty on an open server, unless the authentication type is 2 | :cite[(`ServerWorldDatabase.java:1061-1065`, `media/lua/shared/Translate/EN/UI.json:1098`)] |
| `UnknownUsername` | Unknown account username given | The account does not exist and the server is not open | :cite[(`ServerWorldDatabase.java:1141-1143`, `media/lua/shared/Translate/EN/UI.json:1097`)] |
| `InvalidUsernamePassword`, `DuplicateAccount` | Wrong username or password given; An account with that username already exists | The password does not match | :cite[(`ServerWorldDatabase.java:1099-1110`, `media/lua/shared/Translate/EN/UI.json:1099-1100`)] |
| `WrongAuthenticationMethod` | No translation in the capture, so the key is shown | The account's authentication type differs and no later password check changes the reason | :cite[(`ServerWorldDatabase.java:1093-1110`)] |
| `MaxAccountsReached` | No more accounts may be created for this client | `MaxAccountsPerUser` is reached | :cite[(`ServerWorldDatabase.java:1126-1134`, `media/lua/shared/Translate/EN/UI.json:1101`)] |
| `AlreadyConnected` | User is already connected to the server | The name is already online | :cite[(`LoginPacket.java:146-157`, `media/lua/shared/Translate/EN/UI.json:1088`)] |
| `ServerFull` | The server is full | No slot, or `MaxPlayers` reached | :cite[(`LoginPacket.java:177-181`, `GameServer.java:2715-2721`, `media/lua/shared/Translate/EN/UI.json:1094`)] |
| `Ping` | Your ping is too high for connection to this server. | `PingLimit` is set and the ping is over it | :cite[(`LoginPacket.java:189-197`, `media/lua/shared/Translate/EN/UI.json:1106`)] |
| `Server is too busy.` | No translation in the capture, so the key is shown | A hosted Steam game only: `DenyLoginOnOverloadedServer` is on and the server is dropping packets | :cite[(`LoginPacket.java:110-117`)] |
| (client check) `ModRequired` | Mod "%1" is not installed | A listed mod is missing | :cite[(`ConnectToServerState.java:381-412`, `media/lua/shared/Translate/EN/UI.json:1104`)] |
| (client check) `DebugNotAllowed` | Debug connection is not allowed for non admin. | A debug-mode client lacks `ConnectWithDebug` | :cite[(`ConnectToServerState.java:192-203`, `media/lua/shared/Translate/EN/UI.json:1762`)] |

The translation works by joining the prefix `UI_OnConnectFailed_` to the code, and the parts after `##` become `%1`, `%2` and `%3`. :cite[(`AccessDeniedPacket.java:48-52`)] A missing key makes `Translator.getText` return the key itself, so an English player sees "UI_OnConnectFailed_WrongAuthenticationMethod" or the matching key for the busy message. We searched every language folder (29) and found neither key. :cite[(`Translator.java:489-508`)]

Every step also leaves a line in the server's logs. The `connections` log holds one line per step in the form `event="..." message="..."` with the connection's details, and the `user` log holds "attempting to join", "allowed to join" and "access denied". :cite[(`ConnectionManager.java:165-182`, `LoginPacket.java:56-143`)] A server owner who is asked "why can't I join?" can find the player's name in these logs and read the last refusal.

> **Warning:** The server password is a RakNet password that the client hashes before sending, and it is not an account password. Server owners should not use the same value for both.

## What a mod can hook

A mod sees the join through client events, and none of them fires on a server.

| Event | Arguments | Fires | Code |
|---|---|---|---|
| `OnConnected` | none | On the client, after the connection details have been read and the world dictionary loaded | :cite[(`ConnectToServerState.java:170-174`)] |
| `OnConnectFailed` | a message string | On the client, from RakNet failures, refusals, kicks while joining and the client's own checks | :cite[(`GameClient.java:333-365`, `AccessDeniedPacket.java:48-52`, `KickedPacket.java:68-80`)] |
| `OnDisconnect` | none | On the client, when RakNet reports a disconnection notice | :cite[(`GameClient.java:355`)] |
| `OnConnectionStateChanged` | a state name and up to two more values | On the client: "Connected", "ClientVersionMismatch", and the queue place ("FormatMessage", "PlaceInQueue", place) | :cite[(`ConnectToServerState.java:114`, `core/raknet/UdpEngine.java:264`, `QueuePacket.java:166`)] |
| `OnServerWorkshopItems` | a step name and details | On a Steam client, during the Workshop check | :cite[(`ConnectToServerState.java:310-317`, `ConnectToServerState.java:374`)] |
| `OnServerStarted` | none | On the server, once, after the server is listening | :cite[(`GameServer.java:1581`)] |

The event list comes from the capture's event index, and the arguments from the trigger calls. :cite[(`api/events.jsonl`)]

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and the translation files, and no join was run. Not verified: the Steam-specific parts that live in native code (the Steam ticket and the relay), what the player sees after the "too busy" refusal in a hosted Steam game, and the meaning of RakNet's own message numbers beyond the names listed in the capture.
:::
