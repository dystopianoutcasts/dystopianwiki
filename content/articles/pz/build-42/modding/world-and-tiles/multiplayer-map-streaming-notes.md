---
id: build-42-multiplayer-map-streaming-notes
slug: multiplayer-map-streaming-notes
title: Multiplayer + map-streaming notes
game: pz
version: build-42
section: modding
category: world-and-tiles
difficulty: intermediate
tags:
  - tiles
  - multi-z
  - basements
  - map-modding
  - tiledefs
excerpt: >-
  What 42.22 does when a client needs map chunks: both game ports are UDP (there is no TCP map stream), requests are capped, and the server sends only chunks the client's copy lacks.
last_updated: '2026-11-15'
related_articles:
  - tile-system
  - zones-vehicle-parking-zones-foraging
  - map-tile-modder-migration-checklist
  - connecting-and-logging-in
  - who-owns-what
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- Both default game ports, 16261 and 16262, are UDP. The old page said 16262 was TCP "map-data streaming". The code has no TCP socket for the map; the only TCP listener in the network code is the RCON remote console.
- A client asks for chunks and sends the checksum of any copy it already holds. The server answers with the compressed chunk, with "not required" when the copy matches, or with "not ready".
- A client keeps at most 40 chunk requests in flight, and asks for chunks less than 10 chunks away from one of its players. When it has no player or no chunk for a player yet, it asks for every chunk.
- A server queues at most 4096 pending chunks for one player and gives a chunk 30 seconds to be generated before it answers "not ready".
- The server's default player cap is 32. The old page's "under 20 players", memory and disk advice came from hosting guides, and the code does not state them.
:::

:::facts
- **Game ports** 16261 and 16262, both UDP
- **Requests in flight per client** 40 at most
- **Pending chunks per player on the server** 4096 at most
- **Chunk generation wait** 30 seconds
- **Held-back out-of-range request** 5 seconds, up to 1024 of them
- **Player cap** 32 by default, 1 to 254
:::

Outcast, a bigger map means more chunks to send, so it is worth knowing what the 42.22 server does with each request. This page gives the limits the code states, and says plainly which of the old page's advice has no code behind it.

## 1. Both game ports are UDP

The server listens on two UDP ports, and the map does not travel over a TCP port.

`DefaultPort` is 16261 and `UDPPort` is 16262 by default. :cite[(`zombie/network/ServerOptions.java:70-71`)]

The server starts one UDP engine on both ports. In Steam mode only, its log line labels port 16261 "for Steam connection" and port 16262 "for UDPRakNet connection". Without Steam the log names only the default port. :cite[(`zombie/network/GameServer.java:1557-1565`)] 

When the server asks the router to open ports it asks for both as UDP. :cite[(`zombie/network/GameServer.java:764`, `zombie/network/GameServer.java:772`)] The only TCP listener in the network code is the remote console, which has its own port option. :cite[(`zombie/network/RCONServer.java:44`, `zombie/network/ServerOptions.java:116`)] A server owner opening only a TCP rule for 16262 would open the wrong protocol.

The connection side of the ports is on [Connecting and logging in](/pz/build-42/engine/networking-and-packets/connecting-and-logging-in).

## 2. A client asks, and the server answers one of three ways

The client sends a list of the chunks it needs with a checksum for each, and the server's answer is a chunk, "not required" or "not ready".

The request carries a number, the chunk's `wx` and `wy`, and the checksum of the client's copy. :cite[(`zombie/network/packets/RequestZipListPacket.java:36-49`)] A client that has not gone through the loading step is kicked for an invalid request. :cite[(`zombie/network/packets/RequestZipListPacket.java:52-55`)]

:::flow[One chunk request]
- Client sends RequestZipList with the chunk and its checksum
- Server loads or generates the chunk
- Server compares checksums
- SentChunk, or NotRequiredInZip, or ChunkNotReady
:::

When the server has the chunk loaded it compares the client's checksum with its own and sends the chunk only if they differ. :cite[(`zombie/network/PlayerDownloadServer.java:498-520`)] A chunk that exists on disk is checked against the stored checksum first. :cite[(`zombie/network/PlayerDownloadServer.java:529-545`)] A chunk that does not exist yet is queued until it is generated. :cite[(`zombie/network/PlayerDownloadServer.java:575-583`)] A chunk the map says is not valid gets "not required" at once. :cite[(`zombie/network/PlayerDownloadServer.java:130-134`)]

The chunk is compressed with a deflater and sent as `SentChunk` packets. :cite[(`zombie/network/PlayerDownloadServer.java:385`, `zombie/network/PlayerDownloadServer.java:435-452`)] Each player connection gets its own download object and its own worker thread. :cite[(`zombie/network/PlayerDownloadServer.java:56-62`, `zombie/network/GameServer.java:2736`)]

## 3. The limits

Both sides cap their queues, and a request can wait only so long.

On the client, new requests go out only while 20 or fewer are in flight, and the batch stops at 40. :cite[(`zombie/iso/WorldStreamer.java:112-136`)] A chunk is requested when it is less than 10 chunks away from a local player in both directions, or when the client has no player or no chunk for a player yet. :cite[(`zombie/iso/WorldStreamer.java:148-165`)] A chunk is 8 squares wide, so that is under 80 squares.

On the server a player may have 4096 pending chunks. Over that, the server answers "not ready" at once. :cite[(`zombie/network/PlayerDownloadServer.java:42`, `zombie/network/PlayerDownloadServer.java:97-100`)] A chunk that is not generated within 30 seconds gets "not ready" too. :cite[(`zombie/network/PlayerDownloadServer.java:39`, `zombie/network/PlayerDownloadServer.java:190-194`)]

A request is held back if it is farther from the player than twice the client's chunk grid width, measured in chunks. :cite[(`zombie/network/PlayerDownloadServer.java:41`, `zombie/network/PlayerDownloadServer.java:85-95`)] The server keeps up to 1024 held requests, drops the oldest with "not ready" beyond that, and accepts a held request anyway after 5 seconds. :cite[(`zombie/network/PlayerDownloadServer.java:40`, `zombie/network/PlayerDownloadServer.java:43`, `zombie/network/PlayerDownloadServer.java:108-127`, `zombie/network/PlayerDownloadServer.java:135-142`)]

The 30 and 5 second figures are wall-clock milliseconds in the code, so they are the same on a client and a server, and there is nothing to convert.

## 4. What this means for a map mod

A bigger map is more chunk requests, and the limits above are what a server does about them.

A mod that adds many cells does not change the limits, only how many requests a joining player makes. The exchange carries chunk data, and not the map's own files.

The `SentChunk` packet carries the deflated chunk file. :cite[(`zombie/network/PlayerDownloadServer.java:435-452`, `zombie/network/PlayerDownloadServer.java:498-545`)] The client finds the cell's lot header in the files it already has on disk. :cite[(`zombie/iso/IsoChunk.java:3476-3483`)] Basement placements are worked out on the client too, as the [basements page](/pz/build-42/modding/world-and-tiles/basements-the-underground-system) reads it. 

So a client needs the map mod's files locally, and joining a server does not download them. The map files are on the [map files page](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure).

:::callout[How we know]{kind=proof}
- Every citation above was read in the 42.22 decompile. Nothing was tested on a live server.
- Changed: the port protocol. The old page said UDP 16261 for the handshake and TCP 16262 for map streaming, from hosting guides. Both are UDP in the code, and nothing else streams the map (`zombie/network/GameServer.java:1557-1565`, `zombie/network/GameServer.java:764-772`).
- Changed: the player count. The old page said "above 32 players, poor streaming". The only figure in the code is the default cap of 32 (`zombie/network/ServerOptions.java:80`); the streaming limits above are per player, not per server.
- Dropped, not verified: "under 20 players", "start without mods, disable ragdolls", "8 to 9 GB of RAM", "use an SSD", and "multi-Z and basements increase streamed state". None is stated in the code read here.
:::

## Where to go next

- [Connecting and logging in](/pz/build-42/engine/networking-and-packets/connecting-and-logging-in)
- [Who owns what](/pz/build-42/engine/networking-and-packets/who-owns-what)
- [Map files](/pz/build-42/modding/world-and-tiles/map-files-map-info-spawnpoints-lua-folder-structure)
