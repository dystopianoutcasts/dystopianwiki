---
id: build-42-how-the-game-plays-audio
slug: how-the-game-plays-audio
title: 'How the game plays audio'
game: pz
version: build-42
section: engine
category: sound-and-noise
difficulty: advanced
tags:
  - engine
  - sound
  - audio
  - fmod
  - modding
  - multiplayer
excerpt: >-
  How the game turns a sound name into something you hear: FMOD banks, sound scripts, clips, emitters, FMOD parameters, distance and occlusion, and what a server sends to clients.
last_updated: '2026-11-15'
related_articles:
  - how-sound-and-noise-work
  - world-sounds-and-what-hears-them
  - music-and-ambience
  - adding-and-replacing-sounds
  - sound-and-noise-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#from-a-sound-name-to-a-playing-clip) | [server owners](#what-a-server-sends-to-clients)

:::callout[The 1-minute version]{kind=key}
- Audio is everything you hear. It is separate from the noise zombies hear, which is covered in [World sounds and what hears them](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them).
- The game plays sound through FMOD, a closed native library. The Java code only tells it what to play and which values to set, so this page describes what goes in and out, not what FMOD does inside.
- A sound script names a sound and lists clips. A clip names either an FMOD event from a sound bank or a loose file under `media/sound/`. If a clip names both, the event is used.
- The game loads four sound banks by fixed name from the install. A mod can add scripts and loose files but the Java has no call that loads another bank.
- A dedicated server plays no audio. Clients play the clips, and the server only relays a sound name and a position to the players near it.
- A sound name that the game does not know is not an error: when sound is enabled, it is looked up as an FMOD event and then as a loose `.ogg` or `.wav` file of that name.
:::

:::facts
- **Banks loaded by name** 4 (`ZomboidSound.strings`, `ZomboidMusic`, `ZomboidSound`, `ZomboidSoundMP`)
- **Sound blocks in vanilla scripts** 3,596, each with exactly one clip
- **Clips that name a loose file** 1 of 3,596
- **FMOD parameter classes** 81 (33 global, 47 local, 1 holder for moodles)
- **Zombie footstep sounds** 40 slots, each reused after 500 ms
:::

## The Java side of a closed library

FMOD is a native library, and the game reaches it through a thin Java binding, so the Java shows what the game asks for and never what FMOD does with it.

The game creates the FMOD system at startup, and if that fails, or if the game is launched with `-nosound`, it marks sound as disabled and uses dummy sound managers that play nothing. :cite[(`zombie/GameWindow.java:543-551`, `fmod/fmod/FMODManager.java:139-153`, `zombie/gameStates/MainScreenState.java:235`)] A dedicated server never plays audio: its characters get dummy sound emitters, and it does not look up FMOD events for clips. :cite[(`zombie/characters/IsoGameCharacter.java:804-806`, `zombie/GameSounds.java:76-79`)]

The binding exposes calls such as creating an event instance, setting a parameter by id or name, and moving a channel in 3D, and the game's own classes wrap them. :cite[(`fmod/fmod/FMODSoundEmitter.java:937-1010`)] Everything else on this page that says "FMOD decides" is a limit of this read, not a finding.

## Banks and events

A bank is a file of sound data and events, and the game loads exactly four of them by name from the install's `media/sound/banks` folder.

The four names are `ZomboidSound.strings`, `ZomboidMusic`, `ZomboidSound` and `ZomboidSoundMP`, each turned into `./media/sound/banks/<name>.bank`. :cite[(`fmod/fmod/FMODManager.java:147-150`, `fmod/fmod/FMODManager.java:159-161`)] A search of the whole Java source for bank loading found no other call, so a mod cannot add a bank by shipping one. The install here also holds a `radio.bank`, and the Java source has no reference to that name (not verified how it is loaded).

When a script is loaded, each clip that names an event is resolved to `event:/<name>`, and a second lookup tries `event:/Remote/<name>`, which is the version played for other players in multiplayer. :cite[(`zombie/GameSounds.java:76-92`, `fmod/fmod/FMODSoundEmitter.java:942-944`, `fmod/fmod/FMODSoundEmitter.java:1021-1023`)] The lookup uses the lowercase path. :cite[(`fmod/fmod/FMODManager.java:404-406`)] If the event does not exist, the clip cannot play, and the only trace is a line under the Sound debug type. :cite[(`zombie/GameSounds.java:83-86`, `fmod/fmod/FMODSoundEmitter.java:937-940`)]

## Sound scripts

A sound script is a `sound` block that gives a sound a name, a few settings, and one or more clips.

The script loader reads five block keys: `category`, `is3D`, `loop`, `master` and `maxInstancesPerEmitter`. :cite[(`zombie/scripting/objects/GameSoundScript.java:26-56`)] Inside a `clip` block it reads `event`, `file`, `volume`, `pitch`, `distanceMin`, `distanceMax`, `reverbFactor`, `reverbMaxRange` and `stopImmediate`. :cite[(`zombie/scripting/objects/GameSoundScript.java:57-85`)] A key it does not know is skipped without a message.

Three traps follow from how the loader reads each line. It splits every line at `=`, so a line with no `=` fails the whole script. For `stopImmediate`, the key alone decides: any value, even `false`, sets the flag. And `master` must be one of `Primary`, `Ambient`, `Music` or `VehicleEngine`, because anything else throws and the load fails. :cite[(`zombie/scripting/objects/GameSoundScript.java:26-56`, `zombie/audio/GameSound.java:102-107`)]

:::chips
- category (default General)
- is3D (default true)
- loop (default false)
- master (default Primary)
- maxInstancesPerEmitter (default -1)
:::

Clip defaults are volume 1, pitch 1, `distanceMin` 10 and `distanceMax` 10. :cite[(`zombie/audio/GameSoundClip.java:24-30`)] 280 of the 3,596 vanilla clips set `distanceMax`, counted by script.

Scripts load in a fixed order: the game's own files first, then the script files of all mods in one list, sorted by full path with files named `template_` first. :cite[(`zombie/scripting/ScriptManager.java:1658-1676`)] Sound blocks use the default script-type flags, which include a reset before each later body of the same name, so a later `sound` block with the same name replaces an earlier one. :cite[(`zombie/scripting/ScriptType.java:112-117`, `zombie/scripting/ScriptBucket.java:176-200`, `zombie/GameSounds.java:54-74`)]

Mod order does not decide which of two mods wins a script; path order does. The script checksum is computed on a client and on a server. :cite[(`zombie/scripting/ScriptManager.java:1665-1700`)] What happens when the two differ was not traced.

## From a sound name to a playing clip

Playing a sound by name picks one clip at random, then plays it as an FMOD event if the clip names one, or as a loose file if it names a file.

:::flow[One sound name to one playing clip]
- Code asks an emitter to play a name
- `GameSounds.getSound` finds the sound
- The sound picks one clip at random
- A clip with an `event` plays that bank event
- Otherwise a clip with a `file` plays that loose file
:::

The random pick is a plain random choice across all clips of the sound. :cite[(`zombie/audio/GameSound.java:50-52`, `fmod/fmod/FMODSoundEmitter.java:491-500`)] The branch that plays an event is checked first, so a clip with both an `event` and a `file` plays the event and ignores the file. :cite[(`fmod/fmod/FMODSoundEmitter.java:937-976`)]

An unknown name does not fail. The game creates an "AUTO" sound for it, tries `event:/<name>`, and then tries `media/sound/<name>.ogg` and `media/sound/<name>.wav`. :cite[(`zombie/GameSounds.java:101-146`)] It logs a warning at the Sound debug type, whether it found something or not. A sound that is played this way has the defaults of a new clip, so it has no distance settings of its own.

A loose file is found by its path relative to the game's `media` folder, lowercased, in a map that mods add their files to. :cite[(`zombie/ZomboidFileSystem.java:382-385`, `fmod/fmod/FMODManager.java:250-267`)] A mod's `media/sound/` files are added after the game's in mod load order, and when two files have the same relative path the later one wins. :cite[(`zombie/ZomboidFileSystem.java:656-700`)] The same table is why a mod can replace a vanilla loose file by shipping one at the same path. The game's own install has 211 `.ogg` and 401 `.wav` files loose under `media/sound/`, counted on disk.

## Emitters

An emitter is the object that holds a position and plays sounds from it, and the game uses a different kind of emitter for each source of sound.

::::cards
:::card[Characters]{accent=blue}
Each character has three FMOD emitters: one for voice, one for footsteps and one for everything else. Calling `playSound` on a character sends it through the "extra" emitter. :cite[(`zombie/characters/CharacterSoundEmitter.java:28-45`, `zombie/characters/CharacterSoundEmitter.java:160-170`)]
:::
:::card[World positions]{accent=orange}
A one-off sound at a tile takes a free emitter from a pool in the world, sets its position, and plays on it. :cite[(`zombie/iso/IsoWorld.java:475-492`, `zombie/iso/IsoGridSquare.java:9703-9712`)]
:::
:::card[Items]{accent=purple}
Items that make a sound while carried or placed are tracked by the item sound manager, which can group them so that only the closest of a group plays. It does nothing on a dedicated server. :cite[(`zombie/inventory/ItemSoundManager.java:34-61`, `zombie/inventory/ItemSoundManager.java:115-140`)]
:::
:::card[Objects and walls]{accent=cream}
Ambient hum from doors, windows, fridges, trees and other objects plays from a fixed set of 16 slots, and a second set of 16 slots handles ambient walls. :cite[(`zombie/audio/ObjectAmbientEmitters.java:83`, `zombie/audio/FMODAmbientWalls.java:67`)] More in [Music and ambience](/pz/build-42/engine/sound-and-noise/music-and-ambience).
:::
:::card[Zombies and animals]{accent=blue}
Zombie footsteps go through 40 slots that are reused after 500 ms, and zombie thumps through 40 slots reused after 100 ms. Animal footsteps use 20 slots at 500 ms. The nearest creatures to a listener get the slots. :cite[(`zombie/characters/BaseZombieSoundManager.java:36-88`, `zombie/characters/ZombieFootstepManager.java:15`, `zombie/characters/ZombieThumpManager.java:18`, `zombie/characters/AnimalFootstepManager.java:16`)]
:::
:::card[Vehicles]{accent=orange}
Engines, horns, sirens and alarms have their own sound classes, and the server syncs which of them are active. This unit does not cover them in detail. :cite[(`zombie/network/fields/vehicle/VehicleSounds.java:17-30`)]
:::
::::

A script can also cap how many copies of one sound an emitter plays. With `maxInstancesPerEmitter` set above 0, starting another copy first stops or releases enough older ones to stay under the limit. :cite[(`fmod/fmod/FMODSoundEmitter.java:256-290`, `fmod/fmod/FMODSoundEmitter.java:933-935`)] 22 vanilla sound blocks set it, counted by script.

## FMOD parameters

A parameter is a named number that the game pushes into FMOD so an event can change with the situation, such as footstep material, whether you are inside, or a moodle level.

There are two kinds. A global parameter has one value for the whole game, and a local parameter has one value per playing event instance. The game updates a parameter only when its value has changed since the last update. :cite[(`zombie/audio/FMODGlobalParameter.java:12-37`, `zombie/audio/FMODLocalParameter.java:12-46`, `zombie/audio/FMODParameter.java:40-46`)] When an event starts, the emitter's parameter updater feeds the parameters that the event uses. :cite[(`zombie/SoundManager.java:130-146`)]

The parameter classes live in `zombie/audio/parameters`. :cite[(`zombie/audio/parameters/ParameterFootstepMaterial.java:1-20`)] They include movement and room values (`Inside`, `RoomSize`, `CharacterMoving`), weather and time (`RainIntensity`, `TimeOfDay`, `Season`), moodles, vehicles (`VehicleSpeed`, `VehicleRPM`) and the music values covered in [Music and ambience](/pz/build-42/engine/sound-and-noise/music-and-ambience). The full list, with kind, is in the [reference](/pz/build-42/engine/sound-and-noise/sound-and-noise-reference).

A mod can set a value on one playing instance, by name, with `setParameterValueByName`. :cite[(`zombie/audio/BaseSoundEmitter.java:42-44`)] It only has an effect when the clip's FMOD event uses a parameter of that name, which `numClipsUsingParameter` can check. :cite[(`zombie/audio/GameSound.java:71-85`)] A clip that names a loose file has no parameters.

## Distance and occlusion

Java decides a clip's distance range and a rough occlusion value, and FMOD turns them into what you hear.

For a clip that names an event, `distanceMin` and `distanceMax` are set as the event's minimum and maximum distance properties, but only when the script gave them. :cite[(`fmod/fmod/FMODSoundEmitter.java:949-957`)] A local parameter named `Occlusion` carries Java's answer for how blocked the sound is: 0 when the sound's tile is in line of sight for a local player, 1 when it is not, taking the lowest value over the local players. :cite[(`zombie/audio/parameters/ParameterOcclusion.java:27-61`)]

For a clip that names a loose file, Java sets the channel's 3D position and distances itself, using the clip's `distanceMin` and `distanceMax` (10 each unless the script says otherwise), and works out occlusion values from rooms, floors, doors and line of sight, capped at 0.9. A sound called `HouseAlarm` is a hard-coded exception with no occlusion. :cite[(`fmod/fmod/FMODSoundEmitter.java:1239-1301`, `fmod/fmod/FMODSoundEmitter.java:1400-1492`)] If a script sets `is3D = false`, or the emitter sits at tile 0,0, a file clip is not placed in 3D at all. :cite[(`fmod/fmod/FMODSoundEmitter.java:1246-1256`)]

:::callout[Volume sliders]{kind=design}
The player options `soundVolume`, `musicVolume` and `vehicleEngineVolume` each set the volume of an FMOD VCA, a group control, from 0 to 1 in steps of 0.1. The matching method for `ambientVolume` ignores its argument and sets the VCA to 1, and its getter always returns 1. The ambient option still exists and is saved, but this method does not apply it. :cite[(`zombie/SoundManager.java:793-848`, `zombie/core/Core.java:243-256`)]
:::

## What a server sends to clients

A dedicated server plays nothing, so for audio it relays names and positions, and each client plays the clip itself.

When a client plays a sound on a character, it sends a `PlaySound` packet with the sound name, and the server forwards it to other connections for which the position is relevant: inside that player's loaded map area, or within the radius of the player's position, measured as a square box. When a client plays a one-off sound at a tile, it sends `PlayWorldSound`. :cite[(`fmod/fmod/FMODSoundEmitter.java:396-409`, `fmod/fmod/FMODSoundEmitter.java:478-489`)] The server takes the forwarding radius from the sound's clips, at least 70 and at most the largest `distanceMax` among them, which is why the server also loads the sound scripts. :cite[(`zombie/network/packets/sound/PlaySoundPacket.java:84-108`, `zombie/network/packets/sound/PlayWorldSoundPacket.java:50-77`, `zombie/core/raknet/UdpConnection.java:270-288`)] Every packet, with its direction and checks, is in the [reference](/pz/build-42/engine/sound-and-noise/sound-and-noise-reference).

A server owner should know that the only check on `PlaySound` and `PlayWorldSound` is that the name is not empty. :cite[(`zombie/network/packets/sound/PlaySoundPacket.java:182-184`, `zombie/network/packets/sound/PlayWorldSoundPacket.java:122-124`)] Any connected client can make nearby clients play any sound name that those clients know. Nothing here changes what zombies hear, because these are audio packets, not world sounds.

The server also sends a few sounds of its own: the radius-limited `PlayWorldSound` for sounds that the server itself starts, `AddAmbient` for one-off ambient events, `ZombieSound` for zombie voice events, and `PlaySoundEveryPlayer`. :cite[(`zombie/network/GameServer.java:2165-2185`, `zombie/network/GameServer.java:2210-2245`, `zombie/network/GameServer.java:2264-2267`, `zombie/network/GameServer.java:3732-3738`)]

:::callout[How we know]{kind=proof}
- Every claim above is read from the 42.22 capture. The counts of sound blocks, clips, `distanceMax`, `master` and `maxInstancesPerEmitter` come from a script run over the 150 files in `media/scripts/generated/sounds`. A few more `sound` lines sit in the vehicle scripts, and those are sub-blocks of a vehicle, not sound scripts, so they are left out.
- The banks, loose files and `radio.bank` are read from the install on this machine. The brief for this unit expected a `banks/Desktop` folder. On this install the banks sit in `banks`, and `banks/Desktop` holds one unused copy of a music bank.
- Not verified: how `radio.bank` is loaded, what the script checksum does when a client and server differ, and anything about what FMOD does with a value after the Java hands it over.
:::
