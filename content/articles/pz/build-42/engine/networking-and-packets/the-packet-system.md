---
id: build-42-the-packet-system
slug: the-packet-system
title: 'The packet system'
game: pz
version: build-42
section: engine
category: networking-and-packets
difficulty: advanced
tags:
  - engine
  - multiplayer
  - networking
  - packets
  - modding
excerpt: >-
  How a Build 42.22 multiplayer message is described, sent, checked and handled: the packet list, each packet's settings, the server's checks in order, what a refusal leaves in the log, and single player.
last_updated: '2026-11-15'
related_articles:
  - how-multiplayer-works
  - connecting-and-logging-in
  - who-owns-what
  - where-each-capability-is-checked
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#the-life-of-one-packet) | [server owners](#what-a-refusal-leaves-in-the-log) | new players should start at [How multiplayer works](/pz/build-42/engine/networking-and-packets/how-multiplayer-works)

:::callout[The 1-minute version]{kind=key}
- Every kind of message is one entry in the `PacketType` list. Its id is its position in that list, and the list has 303 entries in 42.22.
- An entry takes its settings (priority, reliability, channel, the capability a sender needs, which side handles it) from a `@PacketSetting` on a packet class, or from the numbers written in the entry itself.
- On the server a packet passes these steps in order: capability check, parse, `isConsistent`, the anti-cheat list, then the handler.
- `isConsistent` only asks whether the things the packet names exist, so it is not a permission check. A packet refused for a missing capability is dropped, and it is logged or punished only if the matching anti-cheat option is on.
- The `MaxPacketsPerSecond` limit cancels sends on a client, but on the server it only writes a log line.
- Single player does not use this system: `spnetwork` handles three packet types and throws on any other.
:::

:::facts
- **Packet types** 303, ids 0 to 302
- **Declared by a class** 250 (with `@PacketSetting`), **declared inline** 53 (with a handler method)
- **Need `LoginOnServer`** 255 of 303; **need no capability** 6
- **Carry an anti-cheat list** 25 packets
- **Rate limit** `MaxPacketsPerSecond`, default 300, range 100 to 1000
- **Wire header** 1 byte (134) plus a 2-byte packet id
:::

## What a packet type is

A packet type is one name in a list, plus the rules for sending and handling it.

The list is the enum `PacketTypes.PacketType`, and a type's id is its position in it, counted from 0 at `Checksum` to 302 at `SyncEntityResource`. :cite[(`PacketTypes.java:320-323`, `PacketTypes.java:621-623`, `PacketTypes.java:747-749`)] Each entry has one of two shapes, and the shape decides the source of its settings.

::::cards
:::card[Class entry]{accent=orange}
`Name(SomePacket.class)`. The settings are read from the `@PacketSetting` annotation on that class. 250 entries are written this way.
:::
:::card[Inline entry]{accent=blue}
`Name(priority, reliability, Capability.X, serverMethod, clientMethod, loadingMethod)`. A `null` in a method slot means that side does not handle it. 53 entries are written this way, and their handlers are static methods of `GameServer` and `GameClient`.
:::
::::

The constructor copies the annotation's values onto the entry, and logs an error for a class that lacks one. :cite[(`PacketTypes.java:682-724`)] A script over the 250 class entries found the annotation on all of them.

The packet classes live in `zombie/network/packets/` (261 files, in the top folder and 11 subfolders), with field helpers in `fields/` (66 files). :cite[(`PacketTypes.java:321-623`)] The reference page in this series counts them by folder.

## The settings every packet carries

A packet's settings answer five questions: how urgent it is, whether it must arrive, which channel it travels on, who may send it, and which side handles it.

| Setting | What it decides | Values in 42.22 | Code |
|---|---|---|---|
| `priority` | How soon RakNet sends it | 0 immediate, 1 high, 2 medium, 3 low | :cite[(`RakNetPeerInterface.java:44-47`)] |
| `reliability` | Whether it is resent and kept in order | 0 unreliable, 1 unreliable sequenced, 2 reliable, 3 reliable ordered | :cite[(`RakNetPeerInterface.java:48-51`)] |
| `ordering` | The channel that keeps order within itself | Named channels 0 (general), 1 (items), 3 (objects), 4 (map), 5 (player), 7 (animal), 8 (vehicle), 9 to 14 (player injuries, damage, XP, stats, effects, health); up to 31 | :cite[(`PacketTypes.java:273-286`)] |
| `requiredCapability` | The role capability a sender needs | `LoginOnServer` for most; `None` for six | :cite[(`PacketSetting.java:20-25`, `PacketTypes.java:304-312`)] |
| `handlingType` | Which side runs it | Bit 1 server, bit 2 client, bit 4 client while loading | :cite[(`PacketSetting.java:35-57`)] |
| `anticheats` | Checks run on the server after parsing | Empty unless listed | :cite[(`PacketSetting.java:27-29`, `PacketTypes.java:773-783`)] |
| `isCached` | Skip a send identical to the last one | Set on no packet in 42.22 | :cite[(`PacketSetting.java:29-30`, `INetworkPacket.java:73-75`)] |

The send call turns these into a RakNet send. `send` passes the priority, reliability and ordering to the connection, and the connection hands the buffer to `peer.Send`. :cite[(`PacketTypes.java:731-740`, `core/raknet/UdpConnection.java:310-326`)] The two bytes in front of every packet are 134 and the type's id. :cite[(`PacketTypes.java:742-745`, `RakNetPeerInterface.java:43`)]

Of the 303 entries, 255 need `LoginOnServer` (any logged-in player), 6 need no capability, and 42 need a staff capability such as `BanUnbanUser` or `InspectPlayerInventory`. :cite[(`PacketTypes.java:321-623`)] The six that need none are `Login`, `GoogleAuthKey`, `GoogleAuth`, `GoogleAuthRequest`, `MetaData` and `Ping`. Which role holds which capability is on [Where each capability is checked](/pz/build-42/server/roles-and-access/where-each-capability-is-checked).

## The life of one packet

A packet is written by the sender, sent, parsed by the receiver, checked, handled and, if the handler decides so, relayed.

:::flow[One packet, from sender to handler]
- The sender builds the packet object and writes the header and body
- RakNet carries the bytes
- The receiver reads the id and finds the type
- The server checks capability, then parses
- The server checks `isConsistent` and the anti-cheat list
- The handler runs and may relay to other connections
:::

The sender side is one helper. `sendToConnection` starts a buffer, writes the header and the body, and sends it with the type's settings, and it cancels the buffer and logs "Packet X send error" if the write throws. :cite[(`INetworkPacket.java:66-83`)] The helpers around it choose the audience: one connection, all connections, or only connections for which `isRelevantTo(x, y)` is true. Each helper does nothing on the wrong side, so a server-only call made on a client sends nothing. :cite[(`INetworkPacket.java:85-195`)]

On the receiving end, byte 134 marks a game packet and the next two bytes are the id. The server hands it to `GameServer.addIncoming`, the client to `GameClient.addIncoming`. :cite[(`core/raknet/UdpEngine.java:300-312`, `GameServer.java:3113-3135`, `GameClient.java:1584-1609`)]

The server queues the packet by kind. Player updates go to one queue, vehicle physics to a second, and everything else to a high-priority queue. The main loop drains them in that order: the high-priority queue first, then player updates, then physics. :cite[(`GameServer.java:3130-3135`, `GameServer.java:885`, `GameServer.java:948`, `GameServer.java:964`)] While it drains the physics queue it checks the clock every 10 packets, and if the cycle has already used more than 70 ms it stops, counts the rest as dropped and logs "Server is too busy". :cite[(`GameServer.java:969-975`)]

Once a packet is taken from a queue, `onServerPacket` runs these steps. :cite[(`PacketTypes.java:751-792`)]

1. **Capability.** The packet is authorized when its capability is `None`, when the sender's role has it, or when the connection is the host of a hosted game. If not, the packet stops here. :cite[(`PacketTypes.java:304-316`)]
2. **Rate limit.** `isLimitExceeded` is asked, and on the server a "yes" only writes a log line. :cite[(`PacketTypes.java:754-756`, `PacketsCache.java:83-122`)]
3. **Handling bit.** The server continues only if the type has bit 1 set. A packet class that the server handles is reused from a per-connection cache unless it asks for a fresh object (`isPostponed` or `shouldInstantiate`). :cite[(`PacketTypes.java:758-764`)]
4. **Parse.** `parseServer` reads the body, by default through the shared `parse` method. :cite[(`INetworkPacket.java:35-37`)]
5. **`isConsistent`.** If it returns false the server logs a warning, calls `sync` (empty unless the class overrides it) and stops. :cite[(`PacketTypes.java:766-770`, `INetworkPacket.java:59-64`)]
6. **Anti-cheat list.** Each listed check that is not `None` and is enabled gets to reject the packet, which also logs a warning and calls `sync`. :cite[(`PacketTypes.java:773-783`)]
7. **`processServer`.** The class's own handler does the work, and it is the code that relays to other connections. :cite[(`PacketTypes.java:786`)]

A packet written as an inline entry skips steps 3 to 7 and calls its handler method directly after the capability and rate checks. :cite[(`PacketTypes.java:787-789`)]

The client path is shorter. `onClientPacket` needs bit 2, parses, drops the packet with a report if `isConsistent` is false, and then calls `processClient` (or `postpone` when the class says so). :cite[(`PacketTypes.java:794-822`)] While the client is still loading, packets go to `onClientLoadingPacket` instead, which needs bit 4, and any packet without a loading handler is parked until the client has sent its player connect. :cite[(`PacketTypes.java:824-855`, `GameClient.java:370-377`, `GameClient.java:384-392`)] Once running, the client also waits until a packet is 5 ms old before handling it. :cite[(`GameClient.java:397`)]

## What `isConsistent` and `sync` are for

`isConsistent` asks whether the packet makes sense on this machine, and `sync` is the hook for putting a sender back in step after a refusal.

The default for `isConsistent` is "yes", and the overrides check that the objects named in the packet can be found: for example a square must exist, and a zombie, player or animal id must resolve to a live object. :cite[(`fields/INetworkPacketField.java:24-26`, `fields/Square.java:61-63`, `fields/character/ZombieID.java:45-46`, `fields/character/PlayerID.java:77-78`)] A script found 104 files under `packets/` and 28 under `fields/` that declare it. It is not a permission check, because it never looks at who sent the packet.

`sync` is overridden in only three classes: `PlayerHit`, `VehicleEnterPacket` and `VehicleSwitchSeatPacket`. :cite[(`PacketTypes.java:766-770`, `PacketTypes.java:778-783`)] For every other packet a refusal ends with the warning and nothing is sent back, so a client whose packet was refused gets no reply. That fits what a mod sees: a command that fails a check simply does nothing unless the mod's own code answers.

## What a refusal leaves in the log

Each way a packet can be refused leaves a different trace in the log.

| Reason | What the server does | What is written | Code |
|---|---|---|---|
| Packet before login | Disconnects with `unacceptable-packet`. Only `Login`, `Ping`, `ScoreboardUpdate`, `GoogleAuth` and `GoogleAuthKey` are accepted from a connection with no user name | "Received packet type=... before Login, disconnecting ..." | :cite[(`GameServer.java:1615-1630`)] |
| Missing capability | Drops the packet. Counts and may kick or ban only if the `AntiCheatPermission` option is on | `Anti-cheat="Capability" ... reason="<Packet>: no capability"` | :cite[(`PacketTypes.java:304-316`, `AntiCheat.java:136-153`)] |
| Not consistent | Drops the packet, calls `sync` | Warning "The packet X is not consistent" | :cite[(`PacketTypes.java:766-770`, `INetworkPacket.java:62-64`)] |
| Anti-cheat rejects | Drops the packet, calls `sync` | Warning "The packet X is not valid", then the anti-cheat's own line | :cite[(`PacketTypes.java:776-783`)] |
| Handler throws | Logs the stack trace and counts a `PacketException` anti-cheat event | `Error with packet of type: ...` | :cite[(`GameServer.java:1634-1642`)] |
| Unknown packet id | Counts a `PacketType` anti-cheat event | "unknown Zed packet", and "Received unknown packet id" | :cite[(`GameServer.java:3121-3125`, `ZomboidNetData.java:37-41`)] |
| Unknown RakNet message | Counts a `PacketRakNet` anti-cheat event | "unknown RakNet packet" | :cite[(`core/raknet/UdpEngine.java:316-320`)] |
| Over the rate limit | Nothing; the packet is still handled | A "Packets limit has exceeded" warning | :cite[(`PacketsCache.java:100-107`, `PacketTypes.java:754-756`)] |

When an anti-cheat event counts, the line it writes reads `Anti-cheat="<name>" is triggered for connection="<user>" server-option="<option>" reason="<text>" counter=n/max action="<policy>"`. It goes to the server log, the "user" log, the admin chat and the event reports. :cite[(`AntiCheat.java:104-125`)] A kick or ban happens when the counter reaches the check's limit and the option's policy is Kick (2) or Ban (1). :cite[(`AntiCheat.java:136-153`, `AntiCheat.java:191-196`)]

Whether an event counts at all depends on the option. Every `AntiCheat*` server option except `AntiCheatNoClip` and `AntiCheatPacketException` defaults to 2 (kick), and those two default to 4 (disabled). :cite[(`ServerOptions.java:203-212`, `AntiCheat.java:78-80`)] What each check tests belongs to the anti-cheat pages that follow this series.

> **Warning:** A client may send any packet type whose capability its role holds, and a packet with no anti-cheat list is checked only by its own handler. Server owners should keep `MaxPacketsPerSecond` and the anti-cheat options at their defaults unless they have a reason, and should watch the server log for repeated "no capability" lines.

## Where RakNet begins

The Java side hands RakNet a byte buffer with settings and gets bytes back, and everything below that is a native library.

`RakNetPeerInterface` declares native methods for starting a peer, connecting (also to a Steam server), setting the incoming password, and sending a buffer with a priority, a reliability and a channel. :cite[(`RakNetPeerInterface.java:67-100`)] It also defines the numbers of RakNet's own system messages, such as "connection request accepted" (16), "invalid password" (24) and "disconnection notification" (21). :cite[(`RakNetPeerInterface.java:6-25`)] On the receiving side the method `UdpEngine.decode` reads the leading byte of every incoming buffer and either handles one of these or, for 134, hands the packet to the game code. :cite[(`core/raknet/UdpEngine.java:179-324`)]

What RakNet does with priority, reliability and channels is not documented here, because that code is not in the capture. The server password is the one setting that crosses the boundary in another form: it is hashed and handed to RakNet as the incoming connection password, so a wrong server password is refused by RakNet before any game packet exists. :cite[(`core/raknet/UdpEngine.java:72`, `core/raknet/UdpEngine.java:129-131`, `core/raknet/UdpEngine.java:249-257`)]

## Single player and hosted games

Single player runs a tiny in-process version of this system, and a hosted game runs the full one.

In single player `GameWindow` updates `SinglePlayerServer` and `SinglePlayerClient` each frame. :cite[(`GameWindow.java:300-301`)] The server half accepts only `ClientCommand` and `GlobalObjects`, and the client half accepts `ClientCommand` (as a server command), `GlobalObjects` and `ObjectChange`, and throws on anything else. :cite[(`SinglePlayerServer.java:148-163`, `SinglePlayerClient.java:70-92`)] This is why a mod's client and server commands work in single player while no other packet type does: `OnClientCommand` and `OnServerCommand` fire through this path. :cite[(`SinglePlayerServer.java:179-199`, `SinglePlayerClient.java:108-149`)]

A hosted ("co-op") game is different. The host's game starts a second Java process running `zombie.network.GameServer -coop` and then connects to it like any other client, so every rule on this page applies to it. :cite[(`CoopMaster.java:72-129`, `GameClient.java:265-272`)] The first connection to a hosted server counts as the host, and a host passes every capability check. :cite[(`LoginPacket.java:98`, `LoginPacket.java:168`, `PacketTypes.java:306`)] The shorter login branch for hosted games needs a hosted game and Steam mode together; a hosted game without Steam takes the normal login branch. :cite[(`LoginPacket.java:85`, `LoginPacket.java:168-170`)]

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java: `PacketTypes`, `PacketSetting`, `INetworkPacket`, `GameServer`, `GameClient`, the `core/raknet` and `spnetwork` classes. The counts come from a script over the enum entries and the annotations, run once and then deleted. Not verified: how RakNet applies priority, reliability and channels (native code), which of the 8 types with handling type 0 reach the anti-cheat lists that six of them carry. No packet was sent in a running game.
:::
