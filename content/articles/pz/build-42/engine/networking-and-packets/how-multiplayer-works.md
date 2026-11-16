---
id: build-42-how-multiplayer-works
slug: how-multiplayer-works
title: 'How multiplayer works'
game: pz
version: build-42
section: engine
category: networking-and-packets
difficulty: beginner
tags:
  - engine
  - multiplayer
  - networking
  - server
  - lag
excerpt: >-
  What the server decides and what your own game decides in Build 42.22 multiplayer, how often things update, what lag and a busy server do, hosted games against dedicated servers, and voice chat.
last_updated: '2026-11-15'
related_articles:
  - connecting-and-logging-in
  - the-packet-system
  - who-owns-what
  - server-options-chat-voice-and-connections
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [players](#what-the-server-decides-and-what-your-game-decides) | [server owners](#what-a-busy-server-does) | [modders](/pz/build-42/engine/networking-and-packets/the-packet-system)

:::callout[The 1-minute version]{kind=key}
- Your own character moves on your own computer, and the server follows what your game reports. Zombies and driven vehicles also run on a nearby player's computer, and the server stores what that computer reports.
- The server runs the world: the map, saves and what other players are told. A dedicated server runs 10 updates a second.
- If a server falls behind (a cycle over about 70 ms while it handles vehicle packets), it drops vehicle updates and tells the admin chat. Only a hosted Steam game also refuses new logins when it is busy.
- In the code we read, your own character is not held back by the server, so a high ping mostly changes how late you see other players and vehicles. A server owner can set a ping limit to remove players whose ping stays high.
- A "hosted" (co-op) game starts a separate server program on the host's computer, and everyone, including the host, joins it like a normal server.
- Voice chat is on by default and uses the same connection as the game.
:::

:::facts
- **Server update** 100 ms per cycle, which is about 10 a second
- **Client frame rate** 60 FPS by default, and it can be set higher
- **Busy server** a cycle over about 70 ms while it handles vehicle packets
- **Players** `MaxPlayers` defaults to 32, and ranges from 1 to 254
- **Ping check** one sample a second; kick after 20 slow samples out of the last 60, when `PingLimit` is set
- **Voice distance** `VoiceMinDistance` 10, `VoiceMaxDistance` 100 by default
:::

## What the server decides and what your game decides

The server decides the world and who is told about what, while your own game decides how your own character moves.

::::cards
:::card[The server]{accent=orange}
Runs the map: loads the parts around each player, keeps the saves, applies changes to the world and tells nearby players about them. It also decides who a zombie belongs to.
:::
:::card[Your game]{accent=blue}
Runs your character and sends its position to the server several times a second. It also runs any zombies handed to it, and the vehicle you drive.
:::
::::

Your character is moved by your own game, so when you press a key you do not wait for the server. The server stores each update and passes it to nearby players. :cite[(`PlayerPacket.java:192-228`, `NetworkPlayerAI.java:309-346`)] We found no code in the player update path that sends a position back to the player who sent it. :cite[(`PlayerPacket.java:192-228`)]

Zombies and driven vehicles follow the same idea. The server picks a nearby player's game to run each zombie, and a driver's game runs the vehicle while someone drives. How the server chooses is on [Who owns what](/pz/build-42/engine/networking-and-packets/who-owns-what).

## How often things update

Each kind of thing updates at its own rhythm, and the table gives each one per second.

| What | Interval | Per second | Code |
|---|---|---|---|
| Server cycle (dedicated server) | about 100 ms | about 10 | :cite[(`GameServer.java:858-859`, `UpdateLimit.java:15-19`, `UpdateLimit.java:49-61`)] |
| Your character's update to the server | At most every 200 ms unless something changed | up to about 5 | :cite[(`NetworkPlayerAI.java:51`, `NetworkPlayerAI.java:309`)] |
| A zombie owner's report to the server | Sent when the owner has zombies to report, up to 300 zombies per message; the reliable form at most once every 1,000 ms | not a fixed rate | :cite[(`NetworkZombieSimulator.java:42`, `NetworkZombieSimulator.java:51`, `NetworkZombieSimulator.java:298-345`)] |
| The server's vehicle manager | about 100 ms | about 10 | :cite[(`VehicleManager.java:40`)] |
| Passengers update | about 1,000 ms | about 1 | :cite[(`VehicleManager.java:41`)] |
| Ping sample | about 1,000 ms | about 1 | :cite[(`PingManager.java:20`, `PingManager.java:29`)] |

The conversion is the same in each row: 1,000 ms divided by the interval. The limiter lets a cycle run only when strictly more than the interval has passed, so the real rates sit slightly under the figures. :cite[(`UpdateLimit.java:49-61`)] The server sets its frame lock to 10 and its update limiter to 100 ms, so a dedicated server runs about 10 updates a second. :cite[(`GameServer.java:858-859`)] A client draws at its frame rate, which is 60 FPS unless the player changes it. :cite[(`PerformanceSettings.java:19`)]

A client also holds each packet for 5 ms before it handles it. :cite[(`GameClient.java:397`)] That delay is small next to a 100 ms server cycle.

## Lag and what you see

In the code we read, lag changes what you see of other players and vehicles more than it changes your own character.

Your game shows other players by moving a copy of each toward the position the server reports. When the copy is far from the reported spot, in the conditions the code checks, the client teleports it there. :cite[(`PlayerPacket.java:126-154`)] 

Other people's vehicles are drawn by interpolating between the positions the driver reported. :cite[(`VehiclePhysicsPacket.java:143-150`)] A late packet therefore shows up as someone or something jumping when the next one arrives. We read this in the code and did not measure it in a game.

"Rubber-banding" is a common word for being pulled back to an earlier position. In the player update path we read, the server relays the update and sends nothing back to the sender, so we found no code that pulls your own character back. :cite[(`PlayerPacket.java:192-228`)] What players call rubber-banding is not verified here, and we did not test it in a running game.

A server owner can set the ping limit (the option `PingLimit`), in milliseconds. At 0, the default, nothing is checked. Above 0, a player whose ping is over the limit is refused at login, and a running player is kicked once 20 of the last 60 one-second samples are over it. :cite[(`ServerOptions.java:81`, `PingManager.java:20-60`, `LoginPacket.java:189-197`)] Staff roles can be exempt through a role capability, `CantBeKickedIfTooLaggy`. :cite[(`PingManager.java:31-34`)]

## What a busy server does

A server that cannot finish its cycle in time sheds work in a fixed order, and tells the admin chat.

Each cycle the server handles queued packets in three groups: everything else first, then player updates, then vehicle physics. While it handles the physics group it checks the clock every 10 packets, and if the cycle has already used more than 70 ms it stops, counts the rest as dropped and logs "Server is too busy. Server will drop updates of vehicle's physics. Server is closed for new connections." :cite[(`GameServer.java:885`, `GameServer.java:948`, `GameServer.java:964-985`)] The same text goes to the admin chat. :cite[(`GameServer.java:971-975`)]

A dedicated server does not refuse logins for being busy. The only place the option `DenyLoginOnOverloadedServer` is read is the login branch of a hosted Steam game, which then answers "Server is too busy." :cite[(`LoginPacket.java:85-117`, `ServerOptions.java:76`)] A search of the whole source finds no other read. A vehicle that is driven on a busy server may therefore look jumpy for other players, since its updates are the ones dropped. That is our reading of the code, not something we measured.

The server also limits how many packets of one kind a connection can send in a second, with `MaxPacketsPerSecond` (default 300). On a client that limit cancels the send, but on the server it only writes a warning. :cite[(`ServerOptions.java:216`, `PacketTypes.java:731-733`, `PacketTypes.java:754-756`)]

## Hosted games and dedicated servers

A hosted game and a dedicated server run the same server program, and they differ in who starts it.

On a dedicated server an owner starts `GameServer`, and players join with a server address and port. The ports come from the `DefaultPort` and `UDPPort` options, 16261 and 16262 by default, and the server prints which one clients should use. :cite[(`ServerOptions.java:70-71`, `GameServer.java:1560-1567`)]

In a hosted game ("co-op") the host's game starts that same program as a second process and then connects to it as a client. :cite[(`CoopMaster.java:72-129`, `GameClient.java:265-272`)] The first connection counts as the host. When that connection closes, the server stops. 

The login code for a hosted game has a shorter branch that needs a hosted game and Steam mode together, and a hosted game without Steam uses the normal branch. :cite[(`LoginPacket.java:85`, `LoginPacket.java:168-170`)] :cite[(`LoginPacket.java:98`, `LoginPacket.java:168`, `GameServer.java:3099-3104`)] The server also stops if, while players are connected, the host's game has not answered its 5-second pings for 60 seconds. :cite[(`CoopSlave.java:155-170`, `GameServer.java:1198-1204`)]

Two rules differ in a hosted game. The anti-cheat checks run only if the host's game has them enabled, and the host passes every capability check. :cite[(`AntiCheat.java:78-80`, `PacketTypes.java:306`)] Single player is a third case: it has no server process, and it runs a very small in-game copy of the packet system. :cite[(`GameWindow.java:300-301`, `SinglePlayerServer.java:148-163`)]

The word "coop" has a second meaning in the engine. The `AllowCoop` option (on by default) lets a second local player join through the same client, and it has nothing to do with a hosted game. :cite[(`ServerOptions.java:126`, `ConnectCoopPacket.java:73`)]

## Voice chat

Voice chat is a part of the same RakNet connection, and the server controls whether it is on and how far it carries.

The options are `VoiceEnable` (on by default), `VoiceMinDistance` (10), `VoiceMaxDistance` (100) and `Voice3D` (enabled). :cite[(`ServerOptions.java:138-141`)] Voice channels open and close through RakNet's voice messages on the game connection, so no separate port is needed for it. :cite[(`core/raknet/UdpEngine.java:284-300`)] We did not read the voice code beyond that, so the unit of the distances and how the audio is mixed are not verified.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java and no game or server was run. Not verified: how a lagging connection looks in play (the jumps described are our reading of the code), what units `VoiceMinDistance` and `VoiceMaxDistance` use, and how RakNet itself behaves under packet loss, because it is a native library.

Older pages.

The page [Multiplayer status in 42.20 stable](/pz/build-42/modding/foundations/multiplayer-status-in-42-20-stable) says the full anti-cheat suite is enabled and names "Speed, Hit, NoClip, Inventory". In 42.22 there is no anti-cheat called Inventory, and the defaults for `AntiCheatNoClip` and `AntiCheatPacketException` are disabled while the others default to kick. :cite[(`AntiCheat.java:19-39`, `ServerOptions.java:203-212`)] The same page quotes a recommendation of about 20 player slots, which is a third-party figure. The engine's own default for `MaxPlayers` is 32. :cite[(`ServerOptions.java:80`, `ServerOptions.java:522-523`)]

The page [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer) matches the 42.22 capture on the points we checked: `OnServerStarted` is raised in one place, the vehicle manager runs every 100 ms, and the default `ClientCommandFilter` text is the same. :cite[(`GameServer.java:1581`, `VehicleManager.java:40`, `ServerOptions.java:165-167`)]
:::
