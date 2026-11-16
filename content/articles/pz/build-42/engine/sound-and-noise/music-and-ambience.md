---
id: build-42-music-and-ambience
slug: music-and-ambience
title: 'Music and ambience'
game: pz
version: build-42
section: engine
category: sound-and-noise
difficulty: intermediate
tags:
  - engine
  - sound
  - music
  - ambience
  - options
excerpt: >-
  What decides when the music swells, which options change it, where the random distant dog barks and screams come from, and how ambient hum, trees and flies are played.
last_updated: '2026-11-15'
related_articles:
  - how-the-game-plays-audio
  - how-sound-and-noise-work
  - adding-and-replacing-sounds
  - sound-and-noise-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [players](#the-options-that-change-it) | [modders](#how-music-is-chosen)

:::callout[The 1-minute version]{kind=key}
- Music is one FMOD event, `MusicCombined`, that plays all the time while the game runs. The game does not pick tracks. It feeds the event numbers that say how tense the moment is, and the event decides what to play. Which music files are inside the event is not visible in the Java.
- Two numbers drive it: intensity, which rises when you do risky things such as climbing through a window or crashing a vehicle, and threat, which rises with zombies that see or chase you, panic and low health. Each is cut into Low, Medium and High.
- The Music Library and Music Action Style options, the music volume slider and the Toggle Music key all change the same event.
- The occasional far-off dog bark, scream, owl or wolf is a random one-shot that the game places 1,000 tiles from a random living player. The Meta Event sandbox option controls how often it can happen, and it is rolled for once per day. In single player, the owl and wolf are skipped when the player is in a city during the world's first 29 days.
- The ambient volume option exists but the game's own method for it ignores the value.
- Ambient hum from doors, windows, trees, fridges and similar objects is played only for the closest few objects, and a mod does not need any of it to add its own sounds.
:::

:::facts
- **Music volume** 0 to 10, default 10
- **Ambient volume** 0 to 10, default 5, not applied by the volume method
- **Music Library** 1 Official, 2 Early Access, 3 Random (default 1)
- **Music Action Style** 1 Official, 2 Legacy (default 1)
- **Intensity and threat levels** below 34 Low, below 67 Medium, otherwise High
:::

## How music is chosen

The game plays one FMOD music event all the time and changes what it plays by setting numbers on it.

Each frame the sound manager makes sure the event named `MusicCombined` is playing, and it sets that event's volume to 1, or to 0 when music is toggled off. :cite[(`zombie/SoundManager.java:859-883`)] A sound script of that name exists, and its master is `Music`. :cite[(`media/scripts/generated/sounds/sounds_music.txt:3-12`)] Everything that picks a track is global FMOD parameters that the event reads. :cite[(`zombie/SoundManager.java:78-87`)]

The nine music parameters are `MusicState`, `MusicWakeState`, `MusicActionStyle`, `MusicLibrary`, `MusicToggleMute`, `MusicIntensity`, `MusicThreat`, `MusicZombiesVisible` and `MusicZombiesTargeting`. :cite[(`zombie/audio/parameters/ParameterMusicState.java:16`, `zombie/audio/parameters/ParameterMusicIntensity.java:18`, `zombie/audio/parameters/ParameterMusicThreat.java:18`, `zombie/audio/parameters/ParameterMusicZombiesVisible.java:18`, `zombie/audio/parameters/ParameterMusicZombiesTargeting.java:19`)] The game sets the state parameter to one of `MainMenu`, `Loading`, `InGame`, `PauseMenu` or `Tutorial`, and the wake state to `Awake`, `Sleeping`, `WakeNormal`, `WakeNightmare` or `WakeZombies`. :cite[(`zombie/SoundManager.java:515-559`)]

The old Lua music director still exists in the scripts. It picks a track from a "drama" number and plays it with `playMusic`, but the function the game calls each tick has its body commented out, so it does nothing as shipped. :cite[(`media/lua/server/NPCs/SadisticAIDirector/SadisticMusicDirector.lua:60-100`, `zombie/gameStates/IngameState.java:737`)] The `playMusic` method itself is still live, and the tutorial calls it with a track name. :cite[(`zombie/SoundManager.java:437-440`, `media/lua/client/Tutorial/Steps.lua:2051`)]

## Intensity: risky things you do

Intensity starts at 50, each recent event adds or subtracts a set amount until it times out, and the result is cut into Low, Medium or High.

The player's list of events adds up to a value between 0 and 100, and an event is removed after its duration. :cite[(`zombie/audio/MusicIntensityEvents.java:57-82`)] The Intensity parameter is Low below 34, Medium below 67 and High from there. :cite[(`zombie/audio/parameters/ParameterMusicIntensity.java:22-34`)]

The events and their numbers are data, set by a Lua file, so a mod can change them. :cite[(`media/lua/client/Music/MusicIntensityConfig.lua:1-33`, `zombie/audio/MusicIntensityConfig.java:27-50`)]

| Event | Intensity | Lasts |
|---|---|---|
| VehicleEnter | +50 | 2 minutes |
| ClimbThroughWindow, ClimbWall, VehicleCrash, VehicleHitCharacter, VehicleHitObject, VehicleTireExplode | +30 | 30 seconds |
| VehicleHorn, AlarmNearby, HealthPanel_SeeBite, HelicopterOverhead, RangedWeaponFailedToShoot, VehicleFailsToStartWithZombiesTargeting, WeaponBreaksDuringCombat, ZombieEntersPlayerBuilding | +20 | 30 seconds |
| HopFence, WindowOpen, WindowClose | +10 | 30 seconds |
| DoorOpen, DoorClose, SearchNewContainer | -10 | 30 seconds |
| VehicleStartsWithZombiesTargeting | -20 | 30 seconds |
| SeeUnexploredRoom | -30 | 1 minute |
| InsideBuilding | -40 | while you are in a room |

The table's columns come from the config file, with the durations converted from milliseconds. The game triggers these events from the code that does the thing: climbing, vehicle code, doors, windows, the alarm and helicopter, and a few Lua actions. :cite[(`media/lua/client/Music/MusicIntensityConfig.lua:4-31`, `zombie/iso/objects/IsoDoor.java:1415`, `zombie/iso/objects/IsoWindow.java:764`, `zombie/ai/states/ClimbThroughWindowState.java:93`, `zombie/vehicles/BaseVehicle.java:4732`, `zombie/iso/Alarm.java:141`, `zombie/iso/Helicopter.java:374`, `media/lua/client/Vehicles/TimedActions/ISEnterVehicle.lua:53`)] A Lua call to `triggerMusicIntensityEvent` with an id that is not in the config does nothing: the vanilla exit-vehicle action does this with `VehicleExit`. :cite[(`zombie/audio/MusicIntensityConfig.java:52-55`, `media/lua/client/Vehicles/TimedActions/ISExitVehicle.lua:37`)]

## Threat: who is after you

Threat adds up a few values about the player and about the zombies near them, each multiplied by a weight, and is cut into Low, Medium or High the same way.

The values are panic (the moodle level divided by 4), how hurt the player is (one minus health), and counts of zombies that are visible, or that are targeting the player and are near or far, moving or not. :cite[(`zombie/audio/MusicThreatStatuses.java:62-87`)] The weights are 20 for panic and health, 10 for visible zombies, and 10, 50, 500 and 1,000 for the four targeting groups. :cite[(`media/lua/client/Music/MusicThreatConfig.lua:1-14`)] Each zombie count is divided by 100 and capped at 1 before its weight is applied, so one moving zombie nearby adds 10 to the sum and 100 or more add the full 1,000. :cite[(`zombie/audio/MusicThreatStatuses.java:76-80`)]

A zombie is counted as targeting when it is visible and its target is this player. It counts as moving when it is walking toward, lunging or path-finding, and as near when it is closer than 10 tiles. :cite[(`zombie/characters/IsoPlayer.java:5822-5842`)] The visible count is limited to 50 before it reaches FMOD. :cite[(`zombie/audio/parameters/ParameterMusicZombiesVisible.java:22-25`)]

## The options that change it

The player's music options and one key change the music, and none of them changes what zombies hear.

:::chips
- musicVolume (0 to 10, default 10)
- musicLibrary (1 to 3, default 1)
- musicActionStyle (1 or 2, default 1)
- ambientVolume (0 to 10, default 5)
- Toggle Music key
:::

The music volume option sets the VCA called `Settings_Music`. :cite[(`zombie/SoundManager.java:822-833`, `zombie/core/Core.java:243-245`)] The Music Library menu lists Official, Early Access and Random, and Music Action Style lists Official and Legacy. The options are passed to FMOD as the `MusicLibrary` and `MusicActionStyle` parameters. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:1984-2012`, `zombie/audio/parameters/ParameterMusicLibrary.java:19-24`, `zombie/audio/parameters/ParameterMusicActionStyle.java:19-23`)] The Toggle Music key flips a flag, which stops any track started by `playMusic` and sends the `MusicToggleMute` parameter. :cite[(`zombie/SoundManager.java:859-868`, `zombie/audio/parameters/ParameterMusicToggleMute.java:19-21`)]

The ambient volume option has no slider in the main options screen. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:1898-2012`)] The game's method that applies it sets the VCA to 1 whatever value it is given, so the setting does not change the ambient level through that method. :cite[(`zombie/SoundManager.java:807-820`)] Whether another path scales ambient sound was not traced.

## Random ambient events

Now and then the game adds a one-shot dog bark, scream, owl or wolf at a point 1,000 tiles from a random living player, and nothing in the world is placed there.

On each game update, and not on a client, there is a small chance of one, but only while the day's random-ambient flag is set, and the flag is set once per day. After one plays, the flag stays set only on Often, with a 1 in 3 chance.

The option's choices are Never, Sometimes (the default) and Often, and the code uses a chance of 1 in 9,000 per update for Sometimes and 1 in 6,000 for Often, each adjusted for frame rate. The flag is set again each day. :cite[(`zombie/GameTime.java:466-482`, `zombie/GameTime.java:681-699`, `media/lua/shared/Translate/EN/Sandbox.json:614-616`)]

During the day (after hour 7 and before 21) the choice is a dog bark or a scream, and at night it can also be an owl or a wolf. :cite[(`zombie/AmbientStreamManager.java:332-412`)] In single player, the owl and wolf are skipped when the player is not in a rural square during the world's first 29 days. The dedicated server's version has no such rule and can pick an owl or a wolf at night at any time. :cite[(`zombie/AmbientStreamManager.java:341-345`, `zombie/AmbientSoundManager.java:77-125`)]

The sound is a one-shot with a radius of 50 and a volume between 0.2 and 0.5, and the code that makes it adds no world sound, so zombies do not react to it. :cite[(`zombie/AmbientStreamManager.java:395-402`)] On a dedicated server the manager is a different class, `AmbientSoundManager`, which sends the sound to clients. :cite[(`zombie/network/GameServer.java:837-838`, `zombie/AmbientSoundManager.java:123-126`, `zombie/network/GameServer.java:3724-3740`)]

The same manager makes the loud ambient events that zombies do hear, such as a distant gunshot or a house alarm. Distant gunfire is a daily roll: 1 in 3 on Sometimes and 1 in 2 on Often, with the time of day picked between hours 7 and 25 of the day. :cite[(`zombie/GameTime.java:681-690`)] Those are covered in [What makes noise, and how far](/pz/build-42/engine/sound-and-noise/what-makes-noise-and-how-far). The manager's lists for indoor, outdoor, day, night and rain loops are filled only by `addBlend`, and nothing in the Java or the vanilla Lua calls it, so those lists stay empty as shipped. :cite[(`zombie/AmbientStreamManager.java:413-435`)]

What plays instead is one event, `WorldAmbiance`, from the lowest-numbered player who is not deaf. :cite[(`zombie/AmbientStreamManager.java:747-775`)] The ambient manager owns 30 parameter objects that feed it: weather, season, time of day, temperature, wind, camera zoom, zones (town, forest, farm and others), room type and size, wall distance, power and water supply, and moodle panic. :cite[(`zombie/AmbientStreamManager.java:96-125`, `zombie/AmbientStreamManager.java:148-210`)] Deaf and hard-of-hearing traits set their own parameters. :cite[(`zombie/audio/parameters/ParameterHardOfHearing.java:22-29`, `zombie/audio/parameters/ParameterDeaf.java:23-25`)]

## Hum, trees, flies and stories

The remaining ambience is small loops tied to objects, and each has a fixed limit on how many play at once.

::::cards
:::card[Object hum]{accent=blue}
Doors, windows, fridges, tents, trees, drips and similar objects play an ambient loop for the nearest few. There are 16 slots. Each loop has a power rule: not required, interior hydro, exterior OK or street light. :cite[(`zombie/audio/ObjectAmbientEmitters.java:83-100`, `zombie/audio/ObjectAmbientEmitters.java:240-247`)]
:::
:::card[Ambient walls]{accent=orange}
A second set of 16 slots plays loops for door, window and open-wall openings near the player, so a room sounds different from outside. :cite[(`zombie/audio/FMODAmbientWalls.java:67-68`)]
:::
:::card[Trees and bushes]{accent=purple}
A bush rustle plays when a moving thing is within 20 tiles of a listener and is standing on a square with a tree or bush, or is about to step onto one. Only the 10 closest squares play at once. Dedicated servers skip it. :cite[(`zombie/iso/IsoMovingObject.java:774-796`, `zombie/iso/IsoMovingObject.java:810-818`, `zombie/audio/TreeSoundManager.java:20-22`, `zombie/audio/TreeSoundManager.java:86`)]
:::
:::card[Corpse flies]{accent=cream}
A looped `CorpseFlies` sound plays near corpses when the Decaying Corpse Health Impact sandbox option is not None and the rate of sickness from corpses is above the food-sickness decrease. :cite[(`zombie/FliesSound.java:48-50`, `zombie/FliesSound.java:240-256`)]
:::
:::card[Story sounds]{accent=blue}
`SLSoundManager` is a story-sound class that Lua can reach through `getSLSoundManager`. The radio class keeps a field for it that is set to null, and no code that turns the manager on was found. Radio and television are on [their own page](/pz/build-42/modding/engine/radio-and-television). :cite[(`zombie/radio/StorySounds/SLSoundManager.java:21-40`, `zombie/radio/ZomboidRadio.java:67`)]
:::
::::

## Listing every music and ambience sound

Vanilla has one music sound (`MusicCombined`) and 36 sounds in the ambience script file. The ambience file is `sounds_ambience.txt`, and counting its blocks gives 36. :cite[(`media/scripts/generated/sounds/sounds_ambience.txt:1-20`)]

:::callout[How we know]{kind=proof}
- The numbers in the intensity table are read from the config file. The nine music parameter names come from the `super("...")` call in each class. The 30 ambient parameter objects are the declared fields in the ambient manager, counted by line. Seven of them are zone parameters.
- Not verified: which tracks sit inside `MusicCombined` and `WorldAmbiance`, what the FMOD events do with the numbers, whether another path applies `ambientVolume`, and what turns story sounds on.
- Checked by a search of the whole Java source and the vanilla Lua: no caller of `addBlend`, and no body in the Lua music director's tick.
:::
