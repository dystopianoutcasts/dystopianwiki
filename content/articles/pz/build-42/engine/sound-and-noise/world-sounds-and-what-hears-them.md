---
id: build-42-world-sounds-and-what-hears-them
slug: world-sounds-and-what-hears-them
title: 'World sounds and what hears them'
game: pz
version: build-42
section: engine
category: sound-and-noise
difficulty: advanced
tags:
  - engine
  - sound
  - noise
  - zombies
  - animals
  - multiplayer
excerpt: >-
  How the game keeps a list of noises with a place, a radius and a volume, how long one lasts, who is told about it, how zombies and animals score it, and what a server does with it.
last_updated: '2026-11-15'
related_articles:
  - how-sound-and-noise-work
  - what-makes-noise-and-how-far
  - how-the-game-plays-audio
  - adding-and-replacing-sounds
  - sound-and-noise-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#what-a-world-sound-is) | [server owners](#single-player-clients-and-the-server)

:::callout[The 1-minute version]{kind=key}
- A world sound is a small record: a tile, a radius, a volume, three flags and a source. It makes no audio at all. Zombies and animals react to these records, and the clip you hear is a separate system.
- A record lives for 16 world-sound updates and is removed on the 17th, about 0.27 seconds at the client's default 60 frames per second (about 1.6 seconds on a dedicated server, which locks 10). A thing that keeps making noise (a running generator, an engine) adds a fresh record again and again.
- A zombie hears a record when it stands inside the record's radius times its own hearing multiplier. Then a score decides which record it walks toward: the volume, reduced the farther away the zombie is.
- Walls are not tested when the score is worked out. Different rooms, and inside against outside, make the score worse. A wall matters later, when the zombie walks toward the spot and its line to it is blocked.
- In multiplayer the dedicated server does not run the zombie reaction. The client that owns a zombie does. Animals react on the server or in single player.
- The server accepts world-sound packets from clients and passes them on with only a thin check, which is a risk for server owners (see the warning below).
:::

:::facts
- **Lifetime** 16 updates: about 0.27 s at 60 FPS, about 0.53 s at 30 FPS, about 1.6 s on a dedicated server at 10 FPS
- **Flags** 3: zombies (4), humans (2), animals (1)
- **Zombie hearing** Pinpoint x3, Normal x1, Poor x0.45, then worn items and weather
- **Room penalty** distance fraction x1.2 in a different room, and x1.4 more if either side is outside any room
- **Radius 0 or less** no record is made
:::

## What a world sound is

A world sound is a record that says "a noise of this size happened here", and the game keeps these records apart from every audio clip.

The record holds a source (the thing that made it, or nothing), a position, a radius, a volume, a stress modifier, a minimum distance below which zombies ignore it, a repeating flag and three booleans for who is bothered. :cite[(`zombie/WorldSoundManager.java:546-562`)] The three booleans come from a flag value: 4 for zombies, 2 for humans and 1 for animals. :cite[(`zombie/WorldSoundFlags.java:8-10`, `zombie/WorldSoundManager.java:129-139`)]

Most overloads of `addSound` stress zombies and let the caller choose whether to add humans and animals, and the overload that takes the flag value directly accepts any combination. A radius of 0 or less returns nothing without making a record. :cite[(`zombie/WorldSoundManager.java:76-156`)] That is why a swing of a melee weapon is silent to zombies in vanilla: the swing code asks for the item's sound radius, and no vanilla melee item script sets one. :cite[(`zombie/characters/IsoLivingCharacter.java:134-136`, `zombie/inventory/types/HandWeapon.java:80`)] The hits that land do add records, listed in [What makes noise, and how far](/pz/build-42/engine/sound-and-noise/what-makes-noise-and-how-far).

## How long a world sound lasts

A record starts with a life of 16 and loses 1 each time the manager updates, so it is gone after 16 updates.

The update runs once per frame step while the game is not paused. It lowers the life by 1 each time and removes the record on the update after the life reaches 0, which is the 17th. :cite[(`zombie/WorldSoundManager.java:454-465`, `zombie/gameStates/IngameState.java:598-600`)]

Chunk lists are cleaned the same way. :cite[(`zombie/iso/IsoChunk.java:266-279`)] The client locks its frame rate at 60 by default, so 16 updates is about 0.27 seconds (16 / 60), and about 0.53 seconds at 30 FPS. A dedicated server locks 10 FPS, so about 1.6 seconds there. :cite[(`zombie/core/PerformanceSettings.java:19`, `zombie/network/GameServer.java:859`)]

Something that stays noisy simply adds a new record every update. A running generator, a vehicle engine, a ringing alarm clock and a playing radio all do this with `addSoundRepeating`, which also sets the repeating flag. :cite[(`zombie/WorldSoundManager.java:90-94`, `zombie/iso/objects/IsoGenerator.java:196-199`, `zombie/vehicles/VehicleEngine.java:296-299`)]

## Where the records are kept

Single player and clients keep each record in the list of every chunk it could reach, while a dedicated server keeps one global list.

When the code is not a server, a new record is added to every 8 by 8 tile chunk inside its largest possible reach, which is its radius times the larger of two numbers: 1 (or 3 when the sound stresses humans or animals) and the zombie hearing multiplier. :cite[(`zombie/WorldSoundManager.java:167-194`)] The look-ups for a zombie or an animal read the chunk list of the creature's own chunk, and a server reads the global list. :cite[(`zombie/WorldSoundManager.java:234-246`, `zombie/WorldSoundManager.java:259-269`, `zombie/WorldSoundManager.java:307-312`)]

Creating a record also fires the Lua event `OnWorldSound`, and the fish-school manager is told about the record unless the game is a client. :cite[(`zombie/WorldSoundManager.java:611-614`)] The event carries `x`, `y`, `z`, `radius`, `volume` and `source`. No vanilla Lua file listens to it, so it is free for a mod. :cite[(`api/events.jsonl`)]

## How radius and volume become attraction

A zombie scores each record it can reach as the record's volume times a falloff, and it goes for the highest score.

The reach is the record's radius times the zombie's hearing multiplier. Pinpoint hearing is 3, Normal 1 and Poor 0.45, and that number is then multiplied by what the zombie wears on its head and by the weather (rain takes up to 0.33 and fog up to 0.1 off). :cite[(`zombie/WorldSoundManager.java:518-530`, `zombie/characters/IsoGameCharacter.java:15467-15485`)] Distance is counted in squared tiles, and each floor of height counts as 3 tiles. :cite[(`zombie/WorldSoundManager.java:351-380`)]

Inside the reach, the score is `volume x (1 - distance squared / reach squared)`. For a Normal zombie 60 tiles from a volume 30, radius 100 gunshot in the same room, the fraction is 3600 / 10000 = 0.36, so the score is 30 x 0.64 = 19.2. The published [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) has the full hearing and sight formulas, so this page does not repeat them.

Three other rules cut a record out. A record whose source is a zombie scores 0, so zombies do not call each other. A record with a `zombieIgnoreDist` is ignored by zombies on the same floor that are closer than that distance. And a record of radius 0 scores 0. :cite[(`zombie/WorldSoundManager.java:354-364`, `zombie/WorldSoundManager.java:295-321`)]

## Walls, floors and rooms

The score never tests walls or floors; it only worsens the distance fraction when the two squares are in different rooms.

The distance fraction is multiplied by 1.2 when the sound's square and the zombie's square belong to different rooms, and by a further 1.4 when either of them is in no room, which is what "inside against outside" means in the code. The result is clamped between 0 and 1. :cite[(`zombie/WorldSoundManager.java:366-377`)] In the example above, a zombie in another room scores 30 x (1 - 0.432) = 17.04, and one that is outside while the sound is inside scores about 11.9.

A wall matters after the zombie has picked a record. When it reacts, it tests whether it has a clear line to the sound's square.

With a clear line it walks to the square, moved by a random amount that grows with distance. With a blocked line it walks to the square plus a random offset of up to 2 tiles either way in each direction. The limit is 5 when rain intensity is above 0.5, it is 2 less for the Pinpoint setting and 2 more for Poor, and it is kept between 2 and 10. :cite[(`zombie/characters/IsoZombie.java:1708-1717`, `zombie/characters/IsoZombie.java:1736-1757`)]

## How a zombie reacts

The zombie reaction runs on whichever machine moves the zombie, and never on a dedicated server.

The body of `RespondToSound` is wrapped in a not-a-server test, and in multiplayer it also skips remote zombies, so the client that owns a zombie runs it. :cite[(`zombie/characters/IsoZombie.java:1601-1606`)] The zombie asks for the record of its current source and for the biggest record near it, and it switches to the bigger one when its old attraction has timed out or is less than half the new one. :cite[(`zombie/characters/IsoZombie.java:1643-1668`)]

A random delay of 0 to 15 is then counted down with the game's thirty-FPS multiplier before it moves. At 60 FPS one unit is a thirtieth of a second, so the delay is up to about half a second. :cite[(`zombie/characters/IsoZombie.java:1625-1629`, `zombie/characters/IsoZombie.java:1694`, `zombie/GameTime.java:978-989`, `zombie/GameTime.java:1032-1033`)] A repeating sound within 5 tiles and in clear sight is dropped, so a zombie does not keep chasing a noise whose source is in plain view. A zombie that is thumping a barricade stops only for a record of radius 10 or more that is behind it. :cite[(`zombie/characters/IsoZombie.java:1671-1688`, `zombie/characters/IsoZombie.java:1770-1795`)]

Records of radius 50 or more that stress zombies are also passed to the native population manager, with the radius scaled by the hearing setting. The native side is closed code, so what it does with them is not verified. :cite[(`zombie/popman/ZombiePopulationManager.java:496-512`)]

## What animals do

An animal reacts to records that stress humans or animals, and it runs away from them.

An animal picks the loudest record that has either flag, using the same falloff and room penalties, and a wild animal hears three times the radius. :cite[(`zombie/WorldSoundManager.java:259-293`, `zombie/WorldSoundManager.java:382-410`)] It ignores radios and televisions, and a tame animal ignores vehicles. It runs away from the sound, and a player who has called out can instead call a friendly animal to them. :cite[(`zombie/characters/animals/IsoAnimal.java:796-826`)] This runs in the branch that is not a client, so it runs on the server or in single player. :cite[(`zombie/characters/animals/IsoAnimal.java:418-449`)]

Animal calls can attract zombies too, but only when the sandbox option "Animals Attract Zombies" is switched on (it is off by default). :cite[(`zombie/SandboxOptions.java:218`, `zombie/characters/animals/AnimalSoundState.java:87-92`)]

## What it does to people

Records that stress humans add stress to every nearby player who is not deaf.

The stress comes from a sum over the global list: for each such record, 1 minus the distance (x plus y, the floor is not counted) divided by the radius, times its stress modifier. The sum is multiplied by a small global factor and added to the Stress stat. :cite[(`zombie/WorldSoundManager.java:412-433`, `zombie/characters/IsoGameCharacter.java:10319-10329`, `media/lua/shared/defines.lua:27`)] Animals take no stress from it.

## Single player, clients and the server

Each machine adds the records it needs, and the server passes on the records that clients send.

:::flow[One noise from cause to zombie, in multiplayer]
- A player shoots, hits a door, or a generator runs
- The code calls `addSound` with a radius, a volume and flags
- The record is added on that machine and sent when `doSend` is true
- The server adds it to its list and relays it to nearby connections
- Each client adds it to its chunk lists
- The client that owns a zombie scores it and walks the zombie toward the spot
:::

When a client sends a record, the server adds it to its own list, tells the sender's character to count as calling out if it stresses animals, and forwards it to every other connection whose area includes the sound. :cite[(`zombie/WorldSoundManager.java:200-206`, `zombie/network/packets/sound/WorldSoundPacket.java:154-204`, `zombie/network/GameServer.java:3296-3309`)] A client that receives a record adds it with sending turned off. :cite[(`zombie/network/packets/sound/WorldSoundPacket.java:121-152`)] Some records are never sent: footsteps are added with sending off, so they exist only on the machine that took the step. :cite[(`zombie/characters/IsoGameCharacter.java:5702-5717`)]

Some noises come from Lua on the player's own client (gunshots and most building actions), and others from object code that runs on the server. For example, zombies thumping a door run on the server or in single player only. :cite[(`media/lua/shared/TimedActions/ISReloadWeaponAction.lua:450`, `zombie/iso/objects/IsoDoor.java:1017-1035`)]

> **Warning:** Server owners should know that the server accepts world-sound packets from clients and relays them with a thin check. It confirms only that a player-sourced record names the sender's own player, and it does not limit the position, radius, volume or flags. A modified client could therefore make noises of any size anywhere that the server will relay. The same holds for clip-playing packets, which need only a non-empty sound name. Run only mods and clients you trust. :cite[(`zombie/network/packets/sound/WorldSoundPacket.java:115-119`, `zombie/network/PacketTypes.java:765-777`, `zombie/network/packets/sound/PlaySoundPacket.java:182-184`)]

## Adding a world sound from a mod

A mod adds a world sound with the global `addSound` or the `getWorldSoundManager()` object, and the step-by-step is in [Adding and replacing sounds](/pz/build-42/engine/sound-and-noise/adding-and-replacing-sounds).

The global `addSound(source, x, y, z, radius, volume)` calls the six-argument overload, which stresses zombies only and sends the record. :cite[(`zombie/Lua/LuaManager.java:11763-11769`)] `AddWorldSound(player, radius, volume)` does the same at a player's tile with no source. :cite[(`zombie/Lua/LuaManager.java:4008-4014`)] The full overload list with their Lua visibility is in the reference.

:::callout[How we know]{kind=proof}
Every rule above comes from reading the 42.22 Java and Lua, and nothing was run in a game. We did not read the native population manager, and we did not trace which side runs each weapon-hit noise in multiplayer. The seconds figures are worked out from the frame-rate locks, not measured.
:::
