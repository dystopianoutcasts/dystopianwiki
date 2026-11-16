---
id: build-42-sound-and-noise-reference
slug: sound-and-noise-reference
title: 'Sound and noise reference'
game: pz
version: build-42
section: engine
category: sound-and-noise
difficulty: advanced
tags:
  - engine
  - sound
  - noise
  - reference
  - fmod
  - modding
excerpt: >-
  Lookup tables for sound and noise in 42.22: sound scripts by folder, FMOD parameters, who adds world sounds, the sound packets, Lua-callable members, sound events and the options with defaults.
last_updated: '2026-11-15'
related_articles:
  - how-sound-and-noise-work
  - world-sounds-and-what-hears-them
  - what-makes-noise-and-how-far
  - how-the-game-plays-audio
  - music-and-ambience
  - adding-and-replacing-sounds
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#sound-script-files-and-blocks) | [server owners](#sound-packets) | [players](#options-and-their-defaults)

:::callout[The 1-minute version]{kind=key}
- This page is lookup tables. The reasoning behind them is in [How the game plays audio](/pz/build-42/engine/sound-and-noise/how-the-game-plays-audio) and [World sounds and what hears them](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them).
- The sound script, FMOD parameter and item-field counts come from a script run over the capture. The table of who adds world sounds is read call by call from the Java and Lua, and its Lua call count is a search count.
- Of the six sound packets, `WorldSoundPacket` adds a world sound that zombies react to. The other five play or stop audio on other players' machines.
- A server owner should know that the checks on the sound packets are thin: the two that play a clip by name only require a name that is not empty, and `WorldSoundPacket` only checks who the source is.
:::

:::facts
- **Sound script files** 150, of which 147 hold `sound` blocks
- **Sound blocks** 3,596, each with one clip
- **`SoundKey` constants** 3,600 (3,599 made by `registerBase`)
- **Sound packets** 6
- **FMOD parameter classes** 81
:::

## Sound script files and blocks

The vanilla sound scripts are 150 files in `media/scripts/generated/sounds`, split into six sub-folders and four files in the folder itself.

| Folder | Files | `sound` blocks | Clips with `event` | Clips with `file` |
|---|---|---|---|---|
| (the folder itself: ambience, meta, music, ui) | 4 | 68 | 68 | 0 |
| animals | 22 | 176 | 176 | 0 |
| objects | 43 with blocks (44 files) | 351 | 351 | 0 |
| player | 26 | 702 | 702 | 0 |
| vehicles | 16 with blocks (18 files) | 168 | 168 | 0 |
| weapons | 32 | 2,076 | 2,076 | 0 |
| zombies | 4 | 55 | 54 | 1 |
| **Total** | **147 with blocks (150 files)** | **3,596** | **3,595** | **1** |

These were counted with a script over the capture, as lines that read `sound <name>` inside the sound folders. Three files hold no `sound` block: two `soundTimeline` files (a fridge file with 1 timeline block and the vehicle foley file with 4) and `vehicle_engine_rpm.txt`. The one `file` clip is in the zombie tutorial voice file and names a loose `.wav`. :cite[(`media/scripts/generated/sounds/zombies/sounds_zombie_voice_tutorial.txt:8`, `media/scripts/generated/sounds/objects/sounds_object_fridge_soundTimeline.txt:3-7`)]

Across all 3,596 blocks the keys used are `category` 3,596, `master` 50, `loop` 32 (all `true`) and `maxInstancesPerEmitter` 22, and no vanilla block sets `is3D`. Across the clips the keys used are `event` 3,595, `distanceMax` 280, `file` 1 and `volume` 1. The categories used are Item 2,075, Player 696, Object 351, Animals 184, Vehicle 168, Zombie 55, World 35, UI 19, Meta 12 and Music 1. The masters used are Ambient 31, VehicleEngine 18 and Music 1.

| Block or enum | Values | Code |
|---|---|---|
| `sound` block keys the loader reads | `category`, `is3D`, `loop`, `master`, `maxInstancesPerEmitter` | `zombie/scripting/objects/GameSoundScript.java:26-56` |
| `clip` block keys the loader reads | `event`, `file`, `volume`, `pitch`, `distanceMin`, `distanceMax`, `reverbFactor`, `reverbMaxRange`, `stopImmediate` | `zombie/scripting/objects/GameSoundScript.java:57-85` |
| `master` values | Primary (default), Ambient, Music, VehicleEngine | `zombie/audio/GameSound.java:102-107` |
| `SoundCategory` enum | Animals, AUTO, General, Item, Meta, Music, Object, Player, UI, Vehicle, World, Zombie | `zombie/scripting/objects/SoundCategory.java:10-22` |
| `SoundMasters` enum | Ambient, Music, VehicleEngine | `zombie/scripting/objects/SoundMasters.java:10-13` |
| `ActionSoundTime` enum | `action_start`, `animation_event`, `animation_start` | `zombie/scripting/objects/ActionSoundTime.java:12-15` |
| `soundTimeline` block | named for an event; each line is a marker name and a whole-number position | `zombie/scripting/objects/SoundTimelineScript.java:20-37` |

Java refers to many sounds through `SoundKey` constants, each one a fixed sound name. :cite[(`zombie/scripting/objects/SoundKey.java:11-12`)] A mod that defines a sound with the name of one of those constants changes what the game plays for it. Which constants have no matching vanilla block was not compared.

## FMOD parameters

There are 81 parameter classes in `zombie/audio/parameters`: 33 global, 47 local and one holder for moodle parameters.

Global parameters have one value for the game and local parameters have one value per playing instance. :cite[(`zombie/audio/FMODGlobalParameter.java:12-37`, `zombie/audio/FMODLocalParameter.java:12-46`)] The name in the first column is the FMOD parameter name, which can differ from the class name: `PowerSupply` is `Electricity` and `WaterSupply` is `Water`.

### Global parameters

| Parameter | Code |
|---|---|
| `CameraZoom` | `zombie/audio/parameters/ParameterCameraZoom.java:16` |
| `CharacterElevation` | `zombie/audio/parameters/ParameterCharacterElevation.java:16` |
| `ClosestExteriorWallDistance` | `zombie/audio/parameters/ParameterClosestExteriorWallDistance.java:17` |
| `ClosestWallDistance` | `zombie/audio/parameters/ParameterClosestWallDistance.java:17` |
| `Electricity` | `zombie/audio/parameters/ParameterPowerSupply.java:15` |
| `FogIntensity` | `zombie/audio/parameters/ParameterFogIntensity.java:15` |
| `HardOfHearing` | `zombie/audio/parameters/ParameterHardOfHearing.java:18` |
| `Inside` | `zombie/audio/parameters/ParameterInside.java:32` |
| `MoodlePanic` | `zombie/audio/parameters/ParameterMoodlePanic.java:17` |
| `MusicActionStyle` | `zombie/audio/parameters/ParameterMusicActionStyle.java:15` |
| `MusicIntensity` | `zombie/audio/parameters/ParameterMusicIntensity.java:18` |
| `MusicLibrary` | `zombie/audio/parameters/ParameterMusicLibrary.java:15` |
| `MusicState` | `zombie/audio/parameters/ParameterMusicState.java:16` |
| `MusicThreat` | `zombie/audio/parameters/ParameterMusicThreat.java:18` |
| `MusicToggleMute` | `zombie/audio/parameters/ParameterMusicToggleMute.java:15` |
| `MusicWakeState` | `zombie/audio/parameters/ParameterMusicWakeState.java:18` |
| `MusicZombiesTargeting` | `zombie/audio/parameters/ParameterMusicZombiesTargeting.java:19` |
| `MusicZombiesVisible` | `zombie/audio/parameters/ParameterMusicZombiesVisible.java:18` |
| `RainIntensity` | `zombie/audio/parameters/ParameterRainIntensity.java:15` |
| `RoomSize` | `zombie/audio/parameters/ParameterRoomSize.java:18` |
| `RoomType` | `zombie/audio/parameters/ParameterRoomType.java:28` |
| `RoomTypeEx` | `zombie/audio/parameters/ParameterRoomTypeEx.java:36` |
| `Season` | `zombie/audio/parameters/ParameterSeason.java:15` |
| `SnowIntensity` | `zombie/audio/parameters/ParameterSnowIntensity.java:15` |
| `Storm` | `zombie/audio/parameters/ParameterStorm.java:16` |
| `StreamerMode` | `zombie/audio/parameters/ParameterStreamerMode.java:15` |
| `Temperature` | `zombie/audio/parameters/ParameterTemperature.java:15` |
| `TimeOfDay` | `zombie/audio/parameters/ParameterTimeOfDay.java:16` |
| `Water` | `zombie/audio/parameters/ParameterWaterSupply.java:16` |
| `WeatherEvent` | `zombie/audio/parameters/ParameterWeatherEvent.java:16` |
| `WindIntensity` | `zombie/audio/parameters/ParameterWindIntensity.java:15` |
| `ZoneWaterSide` | `zombie/audio/parameters/ParameterZoneWaterSide.java:24` |

`ParameterZone` is one class that the ambient manager creates seven times, as `ZoneDeepForest`, `ZoneFarm`, `ZoneForest`, `ZoneNav`, `ZoneTown`, `ZoneTrailerPark` and `ZoneVegetation`. :cite[(`zombie/AmbientStreamManager.java:106-112`, `zombie/audio/parameters/ParameterZone.java:19-22`)] Together with the rows above, that is the 33 global classes.

### Local parameters

| Parameter | Code |
|---|---|
| `ActionProgressPercent` | `zombie/audio/parameters/ParameterActionProgressPercent.java:19` |
| `BroadcastGenre` | `zombie/audio/parameters/ParameterBroadcastGenre.java:16` |
| `BroadcastVoiceType` | `zombie/audio/parameters/ParameterBroadcastVoiceType.java:16` |
| `BulletHitSurface` | `zombie/audio/parameters/ParameterBulletHitSurface.java:18` |
| `CharacterInside` | `zombie/audio/parameters/ParameterCharacterInside.java:17` |
| `CharacterMovementSpeed` | `zombie/audio/parameters/ParameterCharacterMovementSpeed.java:18` |
| `CharacterMoving` | `zombie/audio/parameters/ParameterCharacterMoving.java:17` |
| `CharacterOnFire` | `zombie/audio/parameters/ParameterCharacterOnFire.java:17` |
| `CharacterVoicePitch` | `zombie/audio/parameters/ParameterCharacterVoicePitch.java:17` |
| `CharacterVoiceType` | `zombie/audio/parameters/ParameterCharacterVoiceType.java:17` |
| `CurrentZone` | `zombie/audio/parameters/ParameterCurrentZone.java:20` |
| `Deaf` | `zombie/audio/parameters/ParameterDeaf.java:18` |
| `DeviceVolume` | `zombie/audio/parameters/ParameterDeviceVolume.java:17` |
| `DragMaterial` | `zombie/audio/parameters/ParameterDragMaterial.java:30` |
| `Elevation` | `zombie/audio/parameters/ParameterElevation.java:17` |
| `EquippedBaggageContainer` | `zombie/audio/parameters/ParameterEquippedBaggageContainer.java:18` |
| `Exercising` | `zombie/audio/parameters/ParameterExercising.java:18` |
| `FenceTypeHigh` | `zombie/audio/parameters/ParameterFenceTypeHigh.java:15` |
| `FenceTypeLow` | `zombie/audio/parameters/ParameterFenceTypeLow.java:15` |
| `FirearmDistance` | `zombie/audio/parameters/ParameterFirearmDistance.java:19` |
| `FirearmInside` | `zombie/audio/parameters/ParameterFirearmInside.java:26` |
| `FirearmRoomSize` | `zombie/audio/parameters/ParameterFirearmRoomSize.java:20` |
| `FireSize` | `zombie/audio/parameters/ParameterFireSize.java:16` |
| `FootstepMaterial` | `zombie/audio/parameters/ParameterFootstepMaterial.java:30` |
| `FootstepMaterial2` | `zombie/audio/parameters/ParameterFootstepMaterial2.java:21` |
| `IsStashTile` | `zombie/audio/parameters/ParameterIsStashTile.java:18` |
| `LocalPlayer` | `zombie/audio/parameters/ParameterLocalPlayer.java:17` |
| `MeleeHitSurface` | `zombie/audio/parameters/ParameterMeleeHitSurface.java:19` |
| `Occlusion` | `zombie/audio/parameters/ParameterOcclusion.java:22` |
| `OverlapFoliageType` | `zombie/audio/parameters/ParameterOverlapFoliageType.java:20` |
| `PlayerDistance` | `zombie/audio/parameters/ParameterPlayerDistance.java:18` |
| `PlayerHealth` | `zombie/audio/parameters/ParameterPlayerHealth.java:18` |
| `ShoeType` | `zombie/audio/parameters/ParameterShoeType.java:23` |
| `SinkType` | `zombie/audio/parameters/ParameterSinkType.java:15` |
| `TripObstacleType` | `zombie/audio/parameters/ParameterTripObstacleType.java:14` |
| `VehicleBrake` | `zombie/audio/parameters/ParameterVehicleBrake.java:18` |
| `VehicleEngineCondition` | `zombie/audio/parameters/ParameterVehicleEngineCondition.java:19` |
| `VehicleGear` | `zombie/audio/parameters/ParameterVehicleGear.java:17` |
| `VehicleHitLocation` | `zombie/audio/parameters/ParameterVehicleHitLocation.java:19` |
| `VehicleLoad` | `zombie/audio/parameters/ParameterVehicleLoad.java:17` |
| `VehicleRoadMaterial` | `zombie/audio/parameters/ParameterVehicleRoadMaterial.java:22` |
| `VehicleRPM` | `zombie/audio/parameters/ParameterVehicleRPM.java:18` |
| `VehicleSkid` | `zombie/audio/parameters/ParameterVehicleSkid.java:20` |
| `VehicleSpeed` | `zombie/audio/parameters/ParameterVehicleSpeed.java:17` |
| `VehicleSteer` | `zombie/audio/parameters/ParameterVehicleSteer.java:19` |
| `VehicleTireMissing` | `zombie/audio/parameters/ParameterVehicleTireMissing.java:19` |
| `ZombieState` | `zombie/audio/parameters/ParameterZombieState.java:18` |

`ParameterMoodles` is not a parameter itself. It makes one local parameter for each of 20 moodles, named `Moodle` plus the moodle name (`MoodleBleeding`, `MoodleBored`, `MoodleDrunk`, `MoodleEndurance`, `MoodleFoodEaten`, `MoodleHasACold`, `MoodleHeavyLoad`, `MoodleHungry`, `MoodleHyperthermia`, `MoodleHypothermia`, `MoodleInjured`, `MoodlePain`, `MoodlePanic`, `MoodleSick`, `MoodleStress`, `MoodleThirst`, `MoodleTired`, `MoodleUnhappy`, `MoodleWet`, `MoodleWindchill`), and only players get it. :cite[(`zombie/audio/parameters/ParameterMoodles.java:22-45`, `zombie/characters/IsoPlayer.java:7261`)]

The sound packets set parameters by name from the packet's data: `FirearmInside`, `FirearmRoomSize`, `LocalPlayer`, `Occlusion` and `BulletHitSurface`. :cite[(`zombie/network/packets/sound/RangedWeaponSoundPacket.java:91-110`, `zombie/network/packets/sound/PlaySoundPacket.java:94-112`)]

## Who adds world sounds

This table lists the places that add a world sound with `addSound`, `addSoundRepeating` or the wrapper `addWorldSoundUnlessInvisible`, and all of them stress zombies unless the row says otherwise.

Radius is in tiles. Java call sites of `addSound` and `addSoundRepeating` outside `WorldSoundManager` and `WorldSoundPacket` are 74 lines, counted by a script, and that count includes the two Lua bindings in `LuaManager`. :cite[(`zombie/Lua/LuaManager.java:4008-4014`, `zombie/Lua/LuaManager.java:11763-11769`)] The Lua call lines were counted by search and come to about 40, with the debug and tutorial ones included.

| Source | Radius / volume | Conditions | Code |
|---|---|---|---|
| Shout (`Callout`) | 30 (megaphone 90, sneaking 6) | A held or worn shout item multiplies the radius, except when sneaking; volume equals radius; animals are stressed too | `zombie/characters/IsoGameCharacter.java:5141-5220` |
| Footstep | step volume x 10, rounded up (at least 1 when sneaking, halved in a room) | Added 1 time in 2 (sneaking: 1 in the smaller of 12 and 4 plus the Lightfoot level); never sent over the network | `zombie/characters/IsoGameCharacter.java:5646-5723` |
| Cough | 35 / 40 | Stresses humans | `zombie/characters/IsoGameCharacter.java:15516` |
| Sneeze or cough (body damage) | 20 / 20 (35 / 40 in one state) | No human stress | `zombie/characters/BodyDamage/BodyDamage.java:900-925` |
| Melee hit sounds | 4 / 4, 8 / 8, 16 / 16 or 10 / 10 | Which one depends on the kill type and a roll | `zombie/CombatManager.java:1170-1182` |
| A wielder landing a hit on a character | 5 / 1 | General hit path | `zombie/characters/IsoGameCharacter.java:6145` |
| Gunshot | weapon `SoundRadius` x `FirearmNoiseMultiplier`, halved indoors / weapon `SoundVolume` | Lua; stresses humans | `media/lua/shared/TimedActions/ISReloadWeaponAction.lua:443-450` |
| Melee swing | item `SoundRadius` (vanilla melee sets none) | A radius of 0 adds nothing | `zombie/characters/IsoLivingCharacter.java:134-139` |
| Fences, objects and trees hit or thumped | 10 to 40 / 20 to 40 | Several rows, each with its own numbers | `zombie/iso/IsoObject.java:1662`, `zombie/iso/IsoObject.java:5769-5809`, `zombie/iso/objects/IsoTree.java:201-215` |
| Doors | 20 / 20 (10 / 20 when a zombie breaks it) | Thump, weapon hit, destroy; opening or closing adds none | `zombie/iso/objects/IsoDoor.java:1035-1192` |
| Windows | 20 / 20 (10 / 20 when smashed) | Weapon hit, thump, smash | `zombie/iso/objects/IsoWindow.java:250-464` |
| Thumpables, barricades, composts | 20 / 20 (10 / 20 on break) | Thump, weapon hit, break | `zombie/iso/objects/IsoThumpable.java:1041-1205`, `zombie/iso/objects/IsoBarricade.java:385-434`, `zombie/iso/objects/IsoCompost.java:293-341` |
| Vehicle windows and collisions | 10 / 20 and 20 / 20 | Window break; collision thump | `zombie/vehicles/VehicleWindow.java:109`, `zombie/vehicles/BaseVehicle.java:3507` |
| Generator running | item `SoundRadius` (20, 20, 23, 25) / item `SoundVolume` (1), halved in a room | Repeating, not on a client; the backfire is 40 / 60 | `zombie/iso/objects/IsoGenerator.java:170-199`, `zombie/iso/objects/IsoGenerator.java:251` |
| Clothes washer and dryer | 20 or 10 / 10; 10 / 10 | Repeating, not on a client | `zombie/iso/objects/ClothingWasherLogic.java:216-219`, `zombie/iso/objects/ClothingDryerLogic.java:151-153` |
| Jukebox | 70 / 70 | Every 150 updates while playing | `zombie/iso/objects/IsoJukebox.java:142-149` |
| Radios and TVs | device range / 100 x device volume | Stresses humans above volume 50 | `zombie/radio/devices/DeviceData.java:850-931` |
| Alarm clocks and wristwatches | item `SoundRadius` (7 to 15) / 3 | Repeating, for up to 0.5 game hours, not on a client | `zombie/inventory/types/AlarmClock.java:127-169`, `zombie/inventory/types/AlarmClockClothing.java:137-173` |
| Noise traps and firecrackers | item `NoiseRange` (10 to 80) / 1 | Repeating while the noise lasts; the explosion uses `NoiseRange`, or 50 | `zombie/iso/objects/IsoTrap.java:331-334`, `zombie/iso/objects/IsoTrap.java:431` |
| New fire | 20 / 20 | One new fire in five | `zombie/iso/objects/IsoFireManager.java:226` |
| Vehicle engine | four repeating sounds, radius at least 8, volume at least 6 | Scaled by `CarEngineAttractionModifier` on a server | `zombie/vehicles/VehicleEngine.java:265-312` |
| Siren, horn and vehicle alarm | siren 100 / 60; horn and alarm 150 / 150 | The siren needs `SirenEffectsZombies` | `zombie/vehicles/BaseVehicle.java:7873-7880`, `zombie/vehicles/BaseVehicle.java:9003-9015`, `zombie/vehicles/VehicleAlarm.java:155-189` |
| Distant gunfire, building alarm, helicopter, falling ball | 600 / 600, 600 / 600, 500 / 500, 600 / 600 | Not on a client; a dedicated server uses `AmbientSoundManager` | `zombie/AmbientStreamManager.java:443-505`, `zombie/AmbientSoundManager.java:131-146`, `zombie/iso/Alarm.java:46-48`, `zombie/iso/Helicopter.java:214-216`, `zombie/iso/objects/IsoBall.java:92` |
| Thunder handler | 5000 / 5000 | No caller in the Java source or the vanilla Lua (search of `src` and `media/lua`) | `zombie/AmbientStreamManager.java:513-530`, `zombie/AmbientSoundManager.java:196-216` |
| Sleeper waking in panic | 6 / 1 | Sleep event | `zombie/ai/sadisticAIDirector/SleepingEvent.java:301-318` |
| Lua actions: build, barricade, shovel, plow, fishing, pick-up, remove | 6 to 20 / 1 to 20 | Each action sets its own numbers | `media/lua/client/BuildingObjects/TimedActions/ISBuildAction.lua:98-103`, `media/lua/shared/TimedActions/ISBarricadeAction.lua:66-73`, `media/lua/shared/Farming/TimedActions/ISPlowAction.lua:44` |
| Campfire and trap, server Lua | fire radius / fire radius; 40 / 10 | Server | `media/lua/server/Camping/SCampfireSystem.lua:162`, `media/lua/server/Traps/STrapGlobalObject.lua:130` |
| Animal calls | animal `idleSoundRadius` / `idleSoundVolume` | Only with the sandbox option `AnimalSoundAttractZombies` | `zombie/characters/animals/AnimalSoundState.java:87-92` |
| Debug window | 100 / 100 | Debug and tutorial code adds more | `media/lua/client/ISUI/ZombiePopulationWindow.lua:95` |

The radius and volume of firearms come from the item scripts: 22 ranged weapon scripts, each with both `SoundRadius` and `SoundVolume`, with radii from 30 to 200 tiles. The 44 uses of `SoundRadius` in vanilla item scripts are 22 weapons, 2 alarm clocks, 16 wristwatches and 4 generators, and the 26 uses of `SoundVolume` are 22 weapons and 4 generators. :cite[(`media/scripts/generated/items/weapon.txt:11017`, `media/scripts/generated/items/weapon.txt:19805`, `zombie/scripting/objects/Item.java:2341-2346`)] `NoiseRange` is set in 14 item script lines and `NoiseDuration` in 12. :cite[(`zombie/scripting/objects/Item.java:2686-2689`)]

## Sound packets

Six packets in `zombie/network/packets/sound` carry sound over the network, and only one of them adds a world sound.

| Packet | Direction | What it does | Server check | Code |
|---|---|---|---|---|
| `PlaySound` | Client to server to other clients; also server to clients | Plays a named sound on a character or moving object. The server forwards it to the connections that are relevant to the object, over a radius of 70 or the longest clip `distanceMax` if that is larger | The name is not empty | `zombie/network/packets/sound/PlaySoundPacket.java:84-108`, `zombie/network/packets/sound/PlaySoundPacket.java:182-184`, `zombie/network/PacketTypes.java:498` |
| `PlayWorldSound` | Client to server to other clients; also server to clients | Plays a named sound at a tile. An `index` of -1 means a plain sound, and any other value means a trap explosion | The name is not empty | `zombie/network/packets/sound/PlayWorldSoundPacket.java:50-89`, `zombie/network/packets/sound/PlayWorldSoundPacket.java:122-124`, `zombie/network/PacketTypes.java:504` |
| `RangedWeaponSound` | Client to server to other clients | Plays a gunshot at a position and sets `FirearmInside`, `FirearmRoomSize`, `LocalPlayer` and `Occlusion` | The name is not blank, and the sender owns the player id | `zombie/network/packets/sound/RangedWeaponSoundPacket.java:66-110`, `zombie/network/packets/sound/RangedWeaponSoundPacket.java:135-139`, `zombie/network/PacketTypes.java:499` |
| `LoopedRangedWeaponSound` | Client to server to other clients | Starts or stops the looped fire sound of an automatic weapon | The sender owns the player id; to start, an aimed firearm with ammo is in the primary hand | `zombie/network/packets/sound/LoopedRangedWeaponSoundPacket.java:71-105`, `zombie/network/packets/sound/LoopedRangedWeaponSoundPacket.java:139-164`, `zombie/network/PacketTypes.java:500` |
| `WorldSoundPacket` | Client to server to other clients; also server to clients | Adds a world sound (position, radius, volume, flags, source) that zombies and animals react to | The source is not a player, or is an animal, or is the sender's own player | `zombie/network/packets/sound/WorldSoundPacket.java:115-204`, `zombie/network/PacketTypes.java:501` |
| `StopSound` | Client to server to other clients | Stops, or lets finish, a named sound on a character or vehicle | No check of its own; the server relays it | `zombie/network/packets/sound/StopSoundPacket.java:43-63`, `zombie/network/GameClient.java:2124-2131`, `zombie/network/PacketTypes.java:505` |

Three more messages play sound but are not in that package: `AddAmbient` (server to clients, a one-shot ambient), `ZombieSound` (server to clients, a zombie voice event) and `PlaySoundEveryPlayer` (server to every player that is not deaf, used for the ban and kick thunder). :cite[(`zombie/network/PacketTypes.java:502-506`, `zombie/network/GameServer.java:2210-2245`, `zombie/network/GameServer.java:2264-2267`, `zombie/commands/serverCommands/BanUserCommand.java:78-79`)]

None of the six sound packets sets `anticheats` in its packet settings, and the packet type copies whatever that setting holds. :cite[(`zombie/network/packets/sound/PlaySoundPacket.java:33-39`, `zombie/network/PacketTypes.java:716`)]

A server owner should know that the two packets that play a clip by name check only that the name is not empty, and that the check on `WorldSoundPacket` puts no bound on position, radius, volume or flags. Any connected client can make nearby players hear a sound that they have, or add a world sound anywhere. The vanilla client itself sends these for gunshots and most building actions, so the server cannot tell those from other packets. The server option `BanKickGlobalSound` only turns the ban and kick thunder on or off. :cite[(`zombie/network/ServerOptions.java:177`)]

## Lua-callable members

The api index marks which members Lua can call, and the tables below group them by job, with names as the index spells them.

Lua reaches the sound classes through a few globals: `getSoundManager()` (returns the `BaseSoundManager`), `getWorldSoundManager()`, `addSound(source, x, y, z, radius, volume)`, `AddWorldSound(player, radius, volume)`, `playServerSound(name, square)`, `sendPlaySound(name, loop, object)`, `isSoundPlaying(handle)`, `stopSound(handle)`, `pauseSoundAndMusic()`, `resumeSoundAndMusic()`, `reloadSoundFiles()`, `getFMODSoundBank()`, `getBaseSoundBank()`, `getFMODEventPathList()` and `getSLSoundManager()`. :cite[(`zombie/Lua/LuaManager.java:2874-2877`, `zombie/Lua/LuaManager.java:3914-3920`, `zombie/Lua/LuaManager.java:3991-3996`, `zombie/Lua/LuaManager.java:4008-4037`, `zombie/Lua/LuaManager.java:7126-7150`, `zombie/Lua/LuaManager.java:8000`, `zombie/Lua/LuaManager.java:10009`, `zombie/Lua/LuaManager.java:11033`)] Characters and tiles also have `playSound` and `playSoundLocal`, and characters and vehicles have `getEmitter`. :cite[(`zombie/characters/IsoGameCharacter.java:1587-1589`, `zombie/characters/IsoGameCharacter.java:11885-11893`, `zombie/iso/IsoGridSquare.java:9703-9718`)]

### SoundManager (71 names, 83 entries)

The index lists 83 Lua-callable members of `SoundManager` under 71 names, and 75 for `BaseSoundManager`, which is what `getSoundManager()` returns. :cite[(`zombie/SoundManager.java:73-110`, `zombie/BaseSoundManager.java:1-30`)]

| Group | Members | Notes |
|---|---|---|
| UI and one-off sounds | `playUISound`, `isPlayingUISound` x2, `stopUISound`, `setUiSoundMuted`, `isUiSoundMuted`, `getUIEmitter` | `playUISound` plays locally through the UI emitter and sends nothing. :cite[(`zombie/SoundManager.java:202-253`)] |
| Legacy play calls that work | `PlaySound` (3 arguments), `PlayWorldSound` x3, `PlayWorldSoundImpl`, `PlayWorldSoundWav` x3, `PlayWorldSoundWavImpl`, `StopSound` | They play by name, and the pitch, radius and gain arguments are not used. On a client `PlayWorldSound` also sends the packet. :cite[(`zombie/SoundManager.java:566-675`)] |
| Legacy calls that do nothing | `PlaySound` (4 arguments), `PlaySoundEvenSilent`, `PlayJukeboxSound`, `PlaySoundWav` x3, `PlayMusic`, `playAmbient`, `playMusicNonTriggered`, `CheckDoMusic`, `PlayAsMusic` (4 arguments) | They return null or have an empty body. :cite[(`zombie/SoundManager.java:442-461`, `zombie/SoundManager.java:511-513`, `zombie/SoundManager.java:561-607`)] |
| Impact sounds | `playImpactSound` x2, `playDamageSound`, `playDestructionSound` | Pick a sound by ammo and material. :cite[(`zombie/SoundManager.java:893-960`)] |
| Music | `playMusic`, `DoMusic`, `stopMusic`, `StopMusic`, `IsMusicPlaying`, `isPlayingMusic`, `getCurrentMusicName`, `getCurrentMusicLibrary`, `getMusicPosition`, `setMusicState`, `setMusicWakeState` | `setMusicState` accepts five names and `setMusicWakeState` five. :cite[(`zombie/SoundManager.java:437-560`)] |
| Volumes | `get` and `set` for sound, ambient, music and vehicle engine volume | `setAmbientVolume` ignores its argument. :cite[(`zombie/SoundManager.java:793-848`)] |
| Other | `FadeOutMusic`, `PrepareMusic`, `Start`, `BlendVolume` x2, `BlendThenStart`, `pauseSoundAndMusic` x2, `resumeSoundAndMusic`, `registerEmitter`, `unregisterEmitter`, `isListenerInRange`, `getFMODParameters`, `getAmbientPieces`, `playNightAmbient`, `isRemastered`, `CacheSound`, `Purge`, `stop`, `Update`, `update1` to `update4`, `update3D`, `startEvent`, `updateEvent`, `stopEvent`, `debugScriptSounds`, `dumpEventInstancesToTextFile` | The engine calls most of these each frame, and they were not read one by one. :cite[(`zombie/SoundManager.java:314-413`, `zombie/SoundManager.java:685-791`)] |
| Field | `instance` | The shared manager |

### BaseSoundEmitter (33 names, 41 entries)

A character's emitter, a tile's emitter and a vehicle's emitter all share this set. :cite[(`zombie/audio/BaseSoundEmitter.java:17-100`)]

| Group | Members | Notes |
|---|---|---|
| Play, sent to other players on a client | `playSound` x6 (name; name with character; name with x, y, z; name with tile; name with a flag; name with object), `playSoundLooped` | On a client these send `PlaySound` or `PlayWorldSound`, and on a dedicated server most return 0. :cite[(`fmod/fmod/FMODSoundEmitter.java:396-489`)] |
| Play, local only | `playSoundImpl` x3, `playSoundLoopedImpl`, `playClip`, `playAmbientSound`, `playAmbientLoopedImpl` | Send nothing. The two ambient calls return 0 on a dedicated server. :cite[(`fmod/fmod/FMODSoundEmitter.java:491-545`)] |
| Stop | `stopSound`, `stopSoundLocal`, `stopSoundDelayRelease`, `stopSoundByName`, `stopOrTriggerSound`, `stopOrTriggerSoundLocal`, `stopOrTriggerSoundByName`, `stopAll` | Triggering lets an event finish from a sustain point, if it has one. |
| Parameters | `setParameterValue`, `setParameterValueByName`, `isUsingParameter`, `setTimelinePosition`, `triggerCue`, `hasSustainPoints` | Only events have parameters. |
| Control | `setPos`, `setVolume`, `setVolumeAll`, `setPitch`, `set3D`, `setPlayRemoteEvents`, `randomStart` | |
| State | `isPlaying` x2, `isEmpty`, `hasSoundsToStart`, `restart`, `tick` | |

### GameSounds (18 members)

| Members | Notes |
|---|---|
| `getSound`, `getOrCreateSound` | Make an "AUTO" sound for an unknown name. :cite[(`zombie/GameSounds.java:97-146`)] |
| `isKnownSound`, `getCategories`, `getSoundsInCategory` | Look-ups. :cite[(`zombie/GameSounds.java:93-95`, `zombie/GameSounds.java:236-258`)] |
| `addSound` | Adds a `GameSound` and replaces one of the same name. :cite[(`zombie/GameSounds.java:54-74`)] |
| `ScriptsLoaded`, `OnReloadSound`, `Reset` | Run by the script loader. :cite[(`zombie/GameSounds.java:158-170`, `zombie/GameSounds.java:228-234`)] |
| `loadINI`, `saveINI` | Read and write per-sound user volume in `sounds.ini` in the cache folder. :cite[(`zombie/GameSounds.java:260-293`)] |
| `previewSound`, `stopPreview`, `isPreviewPlaying`, `fix3DListenerPosition` | Menu preview. |
| Fields `soundIsPaused`, `VCA_VOLUME`, `VERSION` | |

### WorldSoundManager (17 names, 26 entries)

These are `addSound` x6, `addSoundRepeating` x4, `getBiggestSoundZomb`, `getHearingMultiplier` x2, `getNew`, `getSoundAnimal`, `getSoundAttract`, `getSoundAttractAnimal`, `getSoundZomb`, `getStressFromSounds`, `init`, `initFrame`, `release`, `render`, `update`, `KillCell` and the field `instance`. What each does is in [World sounds and what hears them](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them). The animal pick `getSoundAnimal` applies no room penalty, while the animal attract score `getSoundAttractAnimal` does multiply the distance fraction by 1.2 and 1.4 for different or missing rooms. :cite[(`zombie/WorldSoundManager.java:259-293`, `zombie/WorldSoundManager.java:382-410`)] Of the `addSound` overloads, the one with 12 arguments has a `remote` argument that its body never reads. :cite[(`zombie/WorldSoundManager.java:76-139`)]

## Sound events

Four Lua events concern sound, and neither `OnWorldSound` nor `OnAmbientSound` has a vanilla Lua listener.

| Event | Arguments | Fired | Vanilla Lua listeners | Code |
|---|---|---|---|---|
| `OnWorldSound` | `x`, `y`, `z`, `radius`, `volume`, `source` | When a world sound record is created, in single player, on a client that receives one, or on a server | 0 | `zombie/WorldSoundManager.java:611` |
| `OnAmbientSound` | `name`, `x`, `y` | When an ambient one-shot is made: on a dedicated server by `AmbientSoundManager`, in single player and on clients by `AmbientStreamManager` | 0 | `zombie/AmbientSoundManager.java:292`, `zombie/AmbientStreamManager.java:812` |
| `OnLoadSoundBanks` | none | At start-up, after the base Lua is loaded | 1 (`SoundBanks.lua`) | `zombie/GameWindow.java:991`, `media/lua/shared/SoundBanks/SoundBanks.lua:398` |
| `OnThunderEvent` | `x`, `y`, `doStrike`, `doLightning`, `doRumble` | When a thunder event is queued, from the network on a client or locally | 1 (a debug panel) | `zombie/iso/weather/ThunderStorm.java:409`, `media/lua/client/DebugUIs/DebugMenu/Climate/ThunderDebug.lua:20` |

The vanilla listener of `OnLoadSoundBanks` registers old-style sound tables (voices, footsteps and base sounds) with the sound bank. :cite[(`media/lua/shared/SoundBanks/SoundBanks.lua:380-398`)] The radio event `OnLoadRadioScripts` belongs to [radio and television](/pz/build-42/modding/engine/radio-and-television). `OnWorldSound` and `OnAmbientSound` are free for a mod to use.

## Options and their defaults

Client options are saved in the player's options file, sandbox options are set per world, and server options are set per server.

### Client options

| Option | Range | Default | Code |
|---|---|---|---|
| `soundVolume` | 0 to 10 | 10 | `zombie/core/Core.java:243` |
| `musicVolume` | 0 to 10 | 10 | `zombie/core/Core.java:244` |
| `ambientVolume` | 0 to 10 | 5 (not applied by the volume method) | `zombie/core/Core.java:245`, `zombie/SoundManager.java:807-820` |
| `jumpScareVolume` | 0 to 10 | 10 | `zombie/core/Core.java:246` |
| `musicActionStyle` | 1 or 2 | 1 | `zombie/core/Core.java:247` |
| `musicLibrary` | 1 to 3 | 1 | `zombie/core/Core.java:248` |
| `vehicleEngineVolume` | 0 to 10 | 10 | `zombie/core/Core.java:256` |
| `vehicleStreamerMode` | on or off | off | `zombie/core/Core.java:257` |
| `voiceEnable`, `voiceMode`, `voiceVADMode`, `voiceAGCMode`, `voiceRecordDeviceName`, `voiceVolumeMic`, `voiceVolumePlayers` (voice chat) | on or off, 1 to 3, 1 to 4, 1 to 3, text, 0 to 10, 0 to 10 | true, 3, 3, 2, empty, 10, 5 | `zombie/core/Core.java:249-255` |

The streamer mode option has the tooltip "Changes vehicle sirens to avoid copyright claims." :cite[(`media/lua/shared/Translate/EN/UI.json:166-167`)]

### Sandbox options

| Option | Range | Default | What it changes | Code |
|---|---|---|---|---|
| `ZombieLore.Hearing` | 1 to 5 | 2 (Normal) | Zombie hearing: Pinpoint, Normal, Poor, Random, Random between Normal and Poor | `zombie/SandboxOptions.java:2110` |
| `FirearmNoiseMultiplier` | 0.2 to 2.0 | 1.0 | Multiplies the radius of gunshots | `zombie/SandboxOptions.java:253` |
| `SirenEffectsZombies` | on or off | on | Sirens attract zombies | `zombie/SandboxOptions.java:205` |
| `SirenShutoffHours` | 0 to 168 | 0 | Game hours before a siren stops | `zombie/SandboxOptions.java:200` |
| `AnimalSoundAttractZombies` | on or off | off | Animal calls attract zombies | `zombie/SandboxOptions.java:218` |
| `MetaEvent` | 1 to 3 | 2 (Sometimes) | How often distant gunshots and random ambient sounds happen | `zombie/SandboxOptions.java:151` |
| `Helicopter` | 1 to 4 | 2 | How often the helicopter passes | `zombie/SandboxOptions.java:150` |
| `Alarm` | 1 to 6 | 4 | House alarm frequency | `zombie/SandboxOptions.java:129` |
| `CarAlarm` | 1 to 6 | 4 | Vehicle alarm frequency | `zombie/SandboxOptions.java:198` |
| `ZombieConfig.FollowSoundDistance` | 10 to 1000 | 100 | Sent to the native population manager; the tooltip says it is the distance a zombie walks toward the last sound, which is not verified | `zombie/SandboxOptions.java:2052` |
| `DecayingCorpseHealthImpact` | 1 to 5 | 3 | Also decides whether corpse flies play | `zombie/SandboxOptions.java:165` |

### Server options

| Option | Range | Default | What it changes | Code |
|---|---|---|---|---|
| `CarEngineAttractionModifier` | 0.0 to 10.0 | 0.5 | Multiplies the noise radius of vehicle engines on a server | `zombie/network/ServerOptions.java:187-188` |
| `BanKickGlobalSound` | on or off | on | Plays thunder to every player on a ban or kick | `zombie/network/ServerOptions.java:177` |
| `VoiceEnable`, `VoiceMinDistance`, `VoiceMaxDistance`, `Voice3D` | on or off, 0 to 100000, 0 to 100000, on or off | on, 10, 100, on | Voice chat | `zombie/network/ServerOptions.java:138-141` |

## Sound fields in vanilla scripts

Item, recipe and vehicle scripts name sounds in many fields, and each of these takes the name of a sound block.

The script-field index counts these uses: `SwingSound` 408, `UnequipSound` 409, `EquipSound` 472, `HitSound` 375, `HitFloorSound` 354, `DoorHitSound` 354, `DropSound` 332, `BreakSound` 631 (items) and 17 (components), `OpenSound`, `CloseSound` and `PutInSound` 306 each, `CookingSound` 203, `ImpactSound` 129, `SoundMap` 111, `CustomDrinkSound` 102, `CustomEatSound` 127, `BulletHitArmourSound` and `WeaponHitArmourSound` 213 each, `SoundRadius` 44, `SoundVolume` 26, `NoiseRange` 14 and `NoiseDuration` 12. Ranged weapon scripts add `AimReleaseSound`, `BringToBearSound`, `ClickSound`, `EjectAmmoSound`, `InsertAmmoSound`, `RackSound`, `ShellFallSound` and `SoundGain`, each with a count between 16 and 22. Timed actions use `sound`, `completionSound` and `soundTime`. :cite[(`api/script_fields.jsonl`, `zombie/scripting/objects/Item.java:2341-2346`)]

:::callout[How we know]{kind=proof}
- The sound-script counts, categories, masters and keys come from a script that walked the 150 files. The parameter and field tables come from the capture's own indexes and from the class files.
- The table of who adds world sounds is read from the Java and Lua, and its radius and volume values are the arguments at each call. Rows that group several call sites say so.
- Not verified: the exact count of Lua `addSound` call lines (a search count), which `SoundKey` constants have no vanilla block, and anything about `radio.bank`.
:::
