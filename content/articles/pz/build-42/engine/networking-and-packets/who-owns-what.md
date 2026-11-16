---
id: build-42-who-owns-what
slug: who-owns-what
title: 'Who owns what: players, zombies, animals, vehicles and the map'
game: pz
version: build-42
section: engine
category: networking-and-packets
difficulty: advanced
tags:
  - engine
  - multiplayer
  - networking
  - zombies
  - vehicles
  - modding
excerpt: >-
  In Build 42.22 multiplayer, which machine runs each part of the world: your own character, zombies handed to nearby clients, the driver's vehicle, animals, and the map chunks the server loads.
last_updated: '2026-11-15'
related_articles:
  - how-multiplayer-works
  - the-packet-system
  - connecting-and-logging-in
  - what-runs-on-the-server-in-build-42-multiplayer
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#players) | [server owners](#how-near-is-near-enough) | new players should start at [How multiplayer works](/pz/build-42/engine/networking-and-packets/how-multiplayer-works)

:::callout[The 1-minute version]{kind=key}
- Your own character is run by your own game. It sends its position to the server, which stores it and tells nearby players.
- A zombie is run by one client at a time, the "owner". The server picks the owner by who is grappling the zombie, who it targets, and who is closest, and it keeps a pick for at least 2 seconds.
- A vehicle is run by its driver's game while someone drives it, and by the server otherwise.
- The server sends many updates only to players near the thing that changed, judged from each player's reported position.
- Map chunks are loaded by the server in 8 by 8 chunk blocks around players, and each client asks the server for the chunks it needs.
- The `AnimalOwnership` packet exists, but nothing in the 42.22 Java sends it. How animals are shared between machines is not verified.
:::

:::facts
- **Cell** 8 by 8 chunks (64 by 64 squares), the unit the server loads
- **Nearby range** the client's chunk grid width, clamped to 12 to 20, halved and plus 2 chunks, at 8 tiles per chunk
- **Owner change** at least 2,000 ms apart for a zombie that already has an owner
- **Zombies per owner update** up to 300; reliable copy at most once a second (owner to server), once every 5 seconds (server to others)
- **Player updates** at most about every 200 ms unless something changed
- **Vehicle updates** the server's vehicle manager runs every 100 ms
:::

## The short answer

Each kind of thing has one machine that runs it at a time, and everyone else is told what it did.

| Thing | Who runs it | How others learn of it | Code |
|---|---|---|---|
| Your character | Your game | The server relays your update to players near you | :cite[(`PlayerPacket.java:192-228`)] |
| A zombie | The owner client the server chose | The server relays the owner's report | :cite[(`NetworkZombieManager.java:66-153`, `NetworkZombieSimulator.java:298-345`)] |
| A vehicle with a driver | The driver's game | The server relays the driver's report to nearby players | :cite[(`BaseVehicle.java:4019-4044`, `VehiclePhysicsPacket.java:154-187`)] |
| A vehicle with no driver | The server | The server sends vehicle updates | :cite[(`BaseVehicle.java:4035-4041`)] |
| An animal | Not verified | `AnimalUpdate` is handled by clients | :cite[(`AnimalUpdatePacket.java:31-37`)] |
| A world object | The side that does the action, then the server applies and relays it | A relay to players near the object | :cite[(`AddObjectToMapPacket.java:55-65`)] |
| Map chunks | The server | Chunk data is requested and downloaded | :cite[(`ServerMap.java:442-530`, `RequestZipListPacket.java:37-71`)] |

## Players

Your own character is simulated on your machine, and the server follows it.

The client sends `PlayerUpdate` packets from `NetworkPlayerAI`. The client sends one at most every 200 ms (5 a second) unless something forces an update: the player changed square, started or stopped turning, or the code asked for one. :cite[(`NetworkPlayerAI.java:51`, `NetworkPlayerAI.java:309-346`)] The reliable version goes out when something changed or a longer timer fires, and that timer is set to 600 ms after a reliable send. :cite[(`NetworkPlayerAI.java:50`, `NetworkPlayerAI.java:346`)]

The server stores the update, and it also keeps the reported position as that connection's "relevant position". :cite[(`PlayerPacket.java:192-207`)] Then it sends the update to each other connection that can see the player and is near the reported position. The reliable update also goes to connections whose role has a higher position than the sender's, or is the default admin role, even when they are not near. :cite[(`PlayerPacket.java:212-227`)] Server options such as `SneakModeHideFromOtherPlayers` change who counts as seeing a player. :cite[(`ServerOptions.java:130`)]

> **Warning:** The server takes the position, speed and state of your character from your game, and the checks on that data are the anti-cheat lists on the update packets. Server owners who want a tight server should keep those options on. They are covered in the anti-cheat pages that follow this series.

## Zombies

The server hands a zombie to one client at a time, and that client moves it.

The server decides once per zombie in `updateAuth`. A zombie that has an owner keeps it for at least 2,000 ms, and a zombie with no owner is judged at once; after that the choice goes down this list. :cite[(`NetworkZombieManager.java:66-69`)]

1. The player grappling the zombie, if that player is fully connected. :cite[(`NetworkZombieManager.java:90-96`)]
2. The player the zombie is targeting, if the zombie is within the owner range. :cite[(`NetworkZombieManager.java:98-107`)]
3. Otherwise the nearest relevant player, and the current owner is kept unless another player is closer by a factor of about 1.6. :cite[(`NetworkZombieManager.java:109-130`, `NetworkZombieManager.java:122`)]
4. If no client is near enough, the zombie has no owner. :cite[(`NetworkZombieManager.java:146-149`)]

A server option can replace this list. With `SwitchZombiesOwnershipEachUpdate` on (it is off by default) and more than one player online, the owner moves to the next connection on each update. :cite[(`NetworkZombieManager.java:69-88`, `ServerOptions.java:60-62`)] If the chosen player is a passenger in a vehicle whose 2D speed is above 2, the zombie goes to that vehicle's driver instead, when the driver is a player. :cite[(`NetworkZombieManager.java:156-176`)]

The owner then simulates the zombie and reports it. `NetworkZombieSimulator.send` collects up to 300 zombies per message and sends an unreliable packet, using the reliable one at most once a second. :cite[(`NetworkZombieSimulator.java:42`, `NetworkZombieSimulator.java:298-345`)] The server applies the reported position and state to its own copy (`applyZombie`), and `NetworkZombiePacker` sends it onward in `ZombieSynchronization` packets, with a reliable copy at most every 5 seconds. :cite[(`NetworkZombiePacker.java:72-89`, `NetworkZombiePacker.java:207-232`, `NetworkZombiePacker.java:51`)]

Every client also gets a `ZombieList` packet that names the zombies it owns, built from the server's list. :cite[(`NetworkZombieManager.java:210-228`)] When a connection ends, the server clears that player as a target and takes its zombies back so they can be given to someone else. :cite[(`NetworkZombieManager.java:230-247`)]

## Vehicles

A vehicle is run by the machine that holds its authorization, and the server checks who that is when a physics packet arrives.

`BaseVehicle` carries one of five authorization values: `Server`, `Local`, `Remote`, `LocalCollide` and `RemoteCollide`, and a new vehicle starts as `Server`. :cite[(`BaseVehicle.java:11863-11869`, `BaseVehicle.java:301`)] When a player takes the driver's seat on the server, a vehicle that is not part of a tow becomes `Local` for that player's online id (a towed or towing vehicle is joined to its partner instead), and when that player leaves it goes back to `Server`. :cite[(`BaseVehicle.java:4019-4041`)] On the other clients the same vehicle shows as `Remote`, because they are not the authorized player. :cite[(`BaseVehicle.java:4064-4091`)]

The two collide values cover a collision. A client can set `LocalCollide` on a vehicle that has no driver, and the server can set the same value for a named player. :cite[(`BaseVehicle.java:3981-4015`)]

When the authorized client reports where the vehicle is, the server accepts the report only if three things hold. The vehicle must exist and the sender must hold its authorization, the report must be newer than the last one, and its timestamp must be within 1,000 ms of the server's clock. :cite[(`VehiclePhysicsPacket.java:154-159`)] The server then copies the position, rotation, speed, engine and wheel values onto its vehicle and sends the same packet to the connections near it. :cite[(`VehiclePhysicsPacket.java:160-187`)] Both physics packets are the ones the server may drop when it is too busy, as described on [The packet system](/pz/build-42/engine/networking-and-packets/the-packet-system). :cite[(`GameServer.java:3130-3135`, `GameServer.java:964-985`)]

> **Warning:** While someone drives, the server uses the driver's reported vehicle position and speed. The `Speed` check on the physics packets is the guard on that data, so server owners should keep `AntiCheatSpeed` enabled.

## Animals

Animals are run by code that does not run on a client, but the details of how they are shared out are not verified.

The damage and death code in `IsoAnimal` runs only when the machine is not a client. :cite[(`IsoAnimal.java:1149-1166`)] The animal packets are handled in both directions (`AnimalPacket`, `AnimalUpdate`, `AnimalCommand`) except `AnimalOwnership`, which only a client handles. :cite[(`AnimalOwnershipPacket.java:18-62`)]

Nothing sends `AnimalOwnership` in 42.22: a search of all of `src` and the Lua in the capture finds the name only in the packet's own class and in the packet list. So there is no animal owner in the way a zombie has one, and how a client learns of an animal that the server moves is not verified. :cite[(`PacketTypes.java:321-623`)]

## World objects, items and the map

For world objects the pattern is the same as for the other packets: the server applies the change and relays it to nearby connections.

For example `AddObjectToMap` creates the object on the server and then sends the same change to every connection near the square. :cite[(`AddObjectToMapPacket.java:55-65`)] That packet needs the `AddItem` capability, so ordinary players cannot send it. :cite[(`AddObjectToMapPacket.java:29`)] How a player's own actions and items reach the server is covered in [Timed actions and items over the network](/pz/build-42/engine/networking-and-packets/timed-actions-and-items-over-the-network).

The map is the server's. `ServerMap` loads the 64 by 64 square cells around each connected player in background threads, and it only keeps cells that are marked relevant. :cite[(`ServerMap.java:70-71`, `ServerMap.java:232-256`, `ServerMap.java:442-490`)] `ClientServerMap` records, per player, which of those cells are loaded and is sent to the client. :cite[(`ClientServerMap.java:34-45`, `ClientServerMap.java:72-90`)]

A client gets the chunk data by asking. It sends the chunk coordinates and the checksum of any copy it holds, and the server sends the chunk, or says that the copy is current. :cite[(`RequestZipListPacket.java:37-71`, `PlayerDownloadServer.java:219-262`)] Global mod data and other saved state are covered in [Mod data that survives a save](/pz/build-42/engine/saves-and-persistence/mod-data-that-survives-a-save).

## How near is near enough

Many updates go only to connections near the thing, and one test decides what near means.

`isRelevantTo(x, y)` is true when the point is inside the connection's `connectArea` for any of its four players (none is set at connect), or within `relevantRange` times 8 tiles of a player's reported position on both axes. :cite[(`core/raknet/UdpConnection.java:218-235`, `GameServer.java:2860`)] The square is therefore centered on the player, and it is as wide as twice that distance.

The range comes from the client. The client sends its chunk grid width when it connects, the server clamps it to 12 to 20, and the relevant range is half that width plus 2 chunks. :cite[(`ConnectPacket.java:51`, `GameServer.java:2844-2845`)] 

The width itself is computed from the screen size, and the engine takes the larger of width over 1920 and height over 1080, capped at 1. A value of 1, from a 1920 by 1080 screen or larger, gives 19, which is a range of 11 chunks, or 88 tiles each way. :cite[(`IsoChunkMap.java:114-125`)] A smaller screen gives a smaller width and so a smaller range. The result for any one screen was worked out from the formula and not run in a game.

The same range decides zombie owners and which connections get an update, so a player with a small window is told about less of the world than one with a large window. :cite[(`NetworkZombieManager.java:98-107`, `NetworkZombieManager.java:116-130`)] That follows from the code; we have not measured it.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 decompiled Java. The numbers (2,000 ms, 300 zombies, 5 seconds, 1.6, 1,000 ms, 200 ms) are constants in the cited lines. Not verified: how animals are simulated and shared, which code sets a connection's `connectArea`, the relevant range for a given screen in a running game, and any behavior that depends on RakNet's own ordering and resending.
:::
