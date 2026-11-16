---
id: build-42-how-sound-and-noise-work
slug: how-sound-and-noise-work
title: 'How sound and noise work'
game: pz
version: build-42
section: engine
category: sound-and-noise
difficulty: beginner
tags:
  - engine
  - sound
  - noise
  - zombies
  - multiplayer
excerpt: >-
  What makes zombies come running, why a sound you hear is not always a noise they hear, how indoors and outdoors change it, and what a server can change.
last_updated: '2026-11-15'
related_articles:
  - world-sounds-and-what-hears-them
  - what-makes-noise-and-how-far
  - how-the-game-plays-audio
  - music-and-ambience
  - adding-and-replacing-sounds
  - sound-and-noise-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [new players](#what-draws-zombies) | [server owners](#what-a-server-changes) | [modders](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them)

:::callout[The 1-minute version]{kind=key}
- Zombies react to noise, which the game tracks as a radius and a volume at a spot. The clips you hear through your speakers are a different thing, and neither one needs the other.
- Gunshots carry farthest of the noises a player makes on purpose. Fighting, shouting, coughing, breaking doors and windows, running machines and vehicles all make noise. Walking and running make smaller noises, and sneaking makes the smallest.
- Opening or closing a door makes a sound you hear but no noise for zombies. Hitting or breaking a door does make noise.
- Being inside a building helps: your footsteps and a gunshot carry about half as far, and a zombie hears a noise from a different room less well.
- Poor hearing in the sandbox makes zombies hear less far, and Pinpoint makes them hear much farther. Your own hearing traits change what you hear, and not what zombies hear.
- In multiplayer, a player's own client sends the noise from gunshots and most building actions, and the server passes it on.
:::

:::facts
- **Zombie hearing setting** 5 choices: Pinpoint x3, Normal x1, Poor x0.45, and two random choices
- **Gunshot radius** 30 to 200 tiles in the 22 ranged weapon scripts
- **Footsteps** radius 7 / 11 / 14 for walk / run / sprint outdoors, 4 sneaking (default traits, with shoes: bare feet halve the step value)
- **Door open or close** no noise for zombies
- **Music, ambient and sound sliders** change what you hear only
:::

## The two systems in plain words

The game has an audio system that plays clips for you and a separate noise system that zombies and animals react to.

::::cards
:::card[Audio: what you hear]{accent=blue}
Sound scripts name clips, and a clip names either an FMOD event or a loose file. The game plays them through your speakers, and your volume sliders change them. :cite[(`zombie/scripting/objects/GameSoundScript.java:57-84`, `zombie/core/Core.java:243-256`)] Zombies do not hear audio.
:::
:::card[World sounds: what zombies hear]{accent=orange}
A world sound is a spot, a radius and a volume that the game keeps in a list for a short time. It has no audio. Zombies and animals react to the list. :cite[(`zombie/WorldSoundManager.java:546-562`)]
:::
::::

An action often does both. A gunshot plays a bang clip and adds a world sound, and either can happen without the other. :cite[(`media/lua/shared/TimedActions/ISReloadWeaponAction.lua:441-450`)] The audio side is on [How the game plays audio](/pz/build-42/engine/sound-and-noise/how-the-game-plays-audio), and the noise side is on [World sounds and what hears them](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them).

## What draws zombies

Zombies walk toward the strongest noise they can hear, so the size and distance of a noise decide whether a zombie comes.

A zombie hears a noise only when it is inside the noise's radius, multiplied by the zombie's own hearing setting. Among the noises it can hear, it goes for the highest score, which falls off with distance. :cite[(`zombie/WorldSoundManager.java:295-349`, `zombie/WorldSoundManager.java:518-530`)] A zombie does not react to a noise that another zombie made. :cite[(`zombie/WorldSoundManager.java:356-357`)]

The numbers for each noise are on [What makes noise, and how far](/pz/build-42/engine/sound-and-noise/what-makes-noise-and-how-far). The published [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) works the hearing formula in full.

:::chips
- Gunshots
- Landed melee hits
- Shouting
- Coughing and sneezing
- Footsteps
- Breaking doors and windows
- Generators and vehicles
- Alarm clocks and radios
- Thrown noisemakers
- Building and digging
:::

## A sound you hear is not always a noise they hear

Some loud-sounding things make no noise for zombies, and some noises you barely hear still reach them.

Opening or closing a door plays a clip but adds no noise, because the door code adds a noise only for a weapon hit, a zombie thump or a break. :cite[(`zombie/iso/objects/IsoDoor.java:1411`, `zombie/iso/objects/IsoDoor.java:1035`, `zombie/iso/objects/IsoDoor.java:1161`, `zombie/iso/objects/IsoDoor.java:1192-1193`)] A melee swing adds no noise in vanilla, because no vanilla melee weapon script sets a sound radius. :cite[(`zombie/characters/IsoLivingCharacter.java:134-136`, `zombie/WorldSoundManager.java:156-158`)]

The reverse also holds. The random distant gunshots and building alarms are world sounds of radius 600, so they can draw zombies even where you hear only a faint clip. :cite[(`zombie/AmbientStreamManager.java:443-490`, `zombie/iso/Alarm.java:46-48`)] Footsteps add a noise only some of the time, so a step you hear may add none. :cite[(`zombie/characters/IsoGameCharacter.java:5693-5702`)]

## Indoors and outdoors

The code makes noise carry less far from inside a building, and a zombie in another room scores a noise lower.

Three separate rules act here. Your footsteps are halved when you are in a room. A gunshot made by the Lua shot code is halved when the shooter is not outside. And a running generator is halved when it is in a room. :cite[(`zombie/characters/IsoGameCharacter.java:5693-5702`, `media/lua/shared/TimedActions/ISReloadWeaponAction.lua:443-446`, `zombie/iso/objects/IsoGenerator.java:192-194`)]

A fourth rule works on the zombie's side. If the noise and the zombie are in different rooms the distance counts for more, and if either of them is in no room it counts for more again. :cite[(`zombie/WorldSoundManager.java:366-377`)] The code does not test walls or floors when it scores a noise, only these room checks and the height. Rain and fog also shorten how far a zombie hears. :cite[(`zombie/characters/IsoGameCharacter.java:15480-15485`)]

## Hearing: the sandbox option and traits

The sandbox option Hearing sets how far zombies hear, and your own hearing traits change only what you hear.

The option has five choices: Pinpoint, Normal, Poor, Random, and Random between Normal and Poor. The engine default is Normal, and the Apocalypse preset sets Random between Normal and Poor. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:529-535`, `zombie/SandboxOptions.java:2110`, `media/lua/shared/Sandbox/Apocalypse.lua:207`)] Each zombie rolls its own value when the setting is Random. :cite[(`zombie/characters/IsoZombie.java:3895-3900`)]

Traits that affect noise are mostly about what you make. Graceful and Clumsy change your footstep noise, as do shoes, and the Lightfoot, Nimble and Sneak skills. :cite[(`zombie/characters/IsoGameCharacter.java:5658-5700`)] The Deaf trait stops the stress that loud noises add. :cite[(`zombie/characters/IsoGameCharacter.java:10319-10329`)] The Hard of Hearing, Keen Hearing and Deaf traits change how far you notice things, and the engine's own hearing multiplier for zombies does not read them. :cite[(`zombie/characters/IsoGameCharacter.java:15490-15497`, `zombie/WorldSoundManager.java:518-530`)]

## What a server changes

A server owner can scale gunshot noise, sirens, engines and animal calls, and the zombie hearing setting.

:::facts
- **Hearing** the sandbox choice above
- **Firearm Noise Multiplier** 0.2 to 2.0, default 1.0, applied by the Lua shot code :cite[(`zombie/SandboxOptions.java:253`, `media/lua/shared/TimedActions/ISReloadWeaponAction.lua:443`)]
- **Vehicle Sirens Attract Zombies** on by default :cite[(`zombie/SandboxOptions.java:205`)]
- **Animals Attract Zombies** off by default :cite[(`zombie/SandboxOptions.java:218`)]
- **Car engine attraction** server option, 0.0 to 10.0, default 0.5 :cite[(`zombie/network/ServerOptions.java:187-188`)]
- **Meta Event** controls the random distant gunshots :cite[(`zombie/GameTime.java:690`)]
:::

On a dedicated server the zombie reaction does not run on the server. The client that moves a zombie runs it, and the server passes world sounds between clients. :cite[(`zombie/characters/IsoZombie.java:1601-1606`, `zombie/network/packets/sound/WorldSoundPacket.java:154-204`)] Footsteps are never sent: they exist only on the machine of the player who took the step. :cite[(`zombie/characters/IsoGameCharacter.java:5702-5717`)]

> **Warning:** Server owners should know that the server accepts world-sound packets from clients with only a thin check, so a modified client could make noise of any size and place. Run only mods and clients you trust. The detail is on [World sounds and what hears them](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them). :cite[(`zombie/network/packets/sound/WorldSoundPacket.java:115-119`)]

## Where to go next

- The full counted table of noises: [What makes noise, and how far](/pz/build-42/engine/sound-and-noise/what-makes-noise-and-how-far).
- How the noise list works for modders: [World sounds and what hears them](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them).
- The audio side: [How the game plays audio](/pz/build-42/engine/sound-and-noise/how-the-game-plays-audio).
- Music and ambience: [Music and ambience](/pz/build-42/engine/sound-and-noise/music-and-ambience).

:::callout[How we know]{kind=proof}
Everything here comes from reading the 42.22 Java, Lua and scripts, and nothing was run in a game. The audio side is only outlined; its detail is on the audio page. We did not trace which machine adds each melee-hit noise in multiplayer, and the claim that your hearing traits do not change zombie hearing rests on the multiplier code not reading them.
:::
