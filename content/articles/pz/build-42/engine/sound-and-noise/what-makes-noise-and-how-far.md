---
id: build-42-what-makes-noise-and-how-far
slug: what-makes-noise-and-how-far
title: 'What makes noise, and how far it carries'
game: pz
version: build-42
section: engine
category: sound-and-noise
difficulty: intermediate
tags:
  - engine
  - sound
  - noise
  - zombies
  - weapons
  - multiplayer
excerpt: >-
  Which of your actions and which machines make a noise that zombies and animals can hear, how far each one carries, and which loud-sounding things make none.
last_updated: '2026-11-15'
related_articles:
  - how-sound-and-noise-work
  - world-sounds-and-what-hears-them
  - how-the-game-plays-audio
  - sound-and-noise-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [players](#noises-you-make-yourself) | [server owners](#gunshots) | [modders](#machines-vehicles-and-fire)

:::callout[The 1-minute version]{kind=key}
- A noise zombies can hear is a "world sound": a radius in tiles and a volume. A zombie hears it when it is inside the radius, multiplied by its own hearing setting (Normal x1, Poor x0.45, Pinpoint x3).
- Firearms have the largest radii among the noises a player makes on purpose: the 22 ranged weapon scripts carry a radius from 30 to 200 tiles. The Lua shot code multiplies that by the Firearm Noise Multiplier sandbox option and halves it when the shooter is not outside.
- A landed melee hit makes a small noise of radius 8, sometimes 10 or 16. In the vanilla scripts the swing itself makes none.
- Footsteps with default traits carry 7 tiles walking, 11 running and 14 sprinting, and about half of that inside a room. Sneaking carries 4.
- Opening or closing a door makes no world sound. Breaking one does, and so does hitting one with a weapon.
- Machines that keep running (generators, vehicle engines, washers, radios) keep adding noise while they run.
- On a server, noise made by the player's own Lua (gunshots, most building actions) is sent by that player's client.
:::

:::facts
- **Ranged weapon scripts** 22, all with `SoundRadius` 30 to 200 and `SoundVolume` 15 to 250
- **Melee hit noises** radius 4, 8, 10 or 16
- **Footsteps** radius 7 / 11 / 14 walking / running / sprinting, default traits, outdoors
- **Generator scripts** 4, radius 20 to 25, halved indoors
- **Radius 0 or less** no noise is made at all
:::

## How to read the numbers

Each noise below is given as radius in tiles and volume, and a zombie hears it only when it stands inside the radius times its hearing multiplier.

The radius says how far the noise carries and the volume says how strongly it pulls, so a big radius with a small volume pulls weakly. How the two become a score is on [World sounds and what hears them](/pz/build-42/engine/sound-and-noise/world-sounds-and-what-hears-them), and the published [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you) works the full hearing formula. The engine default for the Hearing option is Normal, and the Apocalypse preset sets it to "Random between Normal and Poor". :cite[(`zombie/WorldSoundManager.java:518-530`, `zombie/SandboxOptions.java:2110`, `media/lua/shared/Sandbox/Apocalypse.lua:207`)]

A noise stresses nearby players only when its stress-humans flag is set, whatever its source. A noise whose source is a zombie is heard by no zombie. :cite[(`zombie/WorldSoundManager.java:356-357`, `zombie/WorldSoundManager.java:412-420`)]

## Noises you make yourself

Your steps, your voice, your coughs and your fights all add small noises of their own.

**Footsteps.** A step has a base value by movement, multiplied by 1.4, by the Graceful and Clumsy traits, by shoes, and by the Lightfoot and Nimble skills, and the radius is that number times 10, rounded up. :cite[(`zombie/characters/IsoPlayer.java:7173-7205`, `zombie/characters/IsoGameCharacter.java:5658-5700`)] It is halved inside a room, and only one step in two (when sneaking, one in 4 plus the Lightfoot level, at most 12) adds a noise at all. :cite[(`zombie/characters/IsoGameCharacter.java:5693-5702`)] The footstep noise is added with sending turned off, so it exists only on the machine that took the step. :cite[(`zombie/characters/IsoGameCharacter.java:5702-5717`)]

| Movement | Base value | Radius outdoors | Radius in a room | Code |
|---|---|---|---|---|
| Walk or strafe | 0.5 | 7 | 3 | :cite[(`zombie/characters/IsoPlayer.java:7173-7205`)] |
| Run | 0.75 | 11 | 5 | :cite[(`zombie/characters/IsoPlayer.java:7173-7205`)] |
| Sprint | 1.0 | 14 | 7 | :cite[(`zombie/characters/IsoPlayer.java:7173-7205`)] |
| Sneak walk or sneak run | 0.25 | 4 | 2 | :cite[(`zombie/characters/IsoPlayer.java:7173-7205`)] |

The table is worked out for a character with shoes, no Graceful or Clumsy trait, and level 0 in Lightfoot, Nimble and Sneak. :cite[(`zombie/characters/IsoGameCharacter.java:4438-4460`, `zombie/characters/IsoGameCharacter.java:4484-4506`, `zombie/characters/IsoGameCharacter.java:4535-4557`)] A zombie's own steps add records too, but with a zombie as the source, no zombie scores them. :cite[(`zombie/characters/IsoZombie.java:2941`)]

**Voice and body.**

| Noise | Radius | Volume | Code |
|---|---|---|---|
| Shout (call out) | 30, or 90 with a megaphone | same as radius | :cite[(`zombie/characters/IsoGameCharacter.java:5141-5220`)] |
| Whisper while sneaking | 6, or 18 with a megaphone | same as radius | :cite[(`zombie/characters/IsoGameCharacter.java:5152-5153`)] |
| Cough | 35 | 40 | :cite[(`zombie/characters/IsoGameCharacter.java:15516`)] |
| Sneeze or cough from the body-damage sneeze state | 20, or 35 in state 2 | 20, 25 or 40 | :cite[(`zombie/characters/BodyDamage/BodyDamage.java:900-925`)] |
| Waking in panic | 6 | 1 | :cite[(`zombie/ai/sadisticAIDirector/SleepingEvent.java:301`, `zombie/ai/sadisticAIDirector/SleepingEvent.java:310`, `zombie/ai/sadisticAIDirector/SleepingEvent.java:318`)] |

A shout is multiplied by the shout multiplier of a held or worn item (not when sneaking). The scripts set 2.0 for `Hat_Cowboy_Plastic` and `Whistle`, 1.9 for `Whistle_Bone` and 1.5 for `Harmonica`. :cite[(`zombie/characters/IsoGameCharacter.java:5174-5187`, `media/scripts/generated/items/clothing.txt:3171`, `media/scripts/generated/items/normal.txt:5108`, `media/scripts/generated/items/normal.txt:5123`, `media/scripts/generated/items/normal.txt:5139`)] The shout also scares animals. :cite[(`zombie/characters/IsoGameCharacter.java:5205-5220`)]

**Melee.** A landed melee hit adds a radius 8 noise. If a one-in-three roll fails, or the player is shoving at the floor, it adds a radius 10 noise too. Otherwise it adds a radius 16 noise one time in 7. The close-range knife kill adds only a radius 4 noise. :cite[(`zombie/CombatManager.java:1170-1182`)] A hit that a wielder lands on a character also adds a radius 5, volume 1 noise. :cite[(`zombie/characters/IsoGameCharacter.java:6145`)] The swing code asks for the item's sound radius, and no vanilla melee script sets one, so a swing adds no noise. :cite[(`zombie/characters/IsoLivingCharacter.java:134-136`, `zombie/WorldSoundManager.java:156-158`)]

## Gunshots

A shot adds a noise of the weapon script's `SoundRadius` times the Firearm Noise Multiplier, halved when the shooter is not outside.

The shot is made by Lua: it multiplies the weapon's radius by the sandbox option, halves it when the character is not outside, uses the weapon's volume, and stresses humans. :cite[(`media/lua/shared/TimedActions/ISReloadWeaponAction.lua:443-450`)] The option runs from 0.2 to 2.0 with a default of 1.0, and the Extinction preset sets 1.25. :cite[(`zombie/SandboxOptions.java:253`, `media/lua/shared/Sandbox/Extinction.lua:176`)] A search of the source and the vanilla Lua found no other user of this option, so a mod that adds its own gunshot noise is not scaled by it.

:::chips
- Radius 30: 2 cap guns
- Radius 60: 1 revolver
- Radius 70: 2 weapons
- Radius 100: 2 weapons
- Radius 120: 3 weapons
- Radius 150: 3 rifles
- Radius 160: 1 rifle
- Radius 170: 3 rifles
- Radius 200: 5 shotguns
:::

::bar[Cap guns (2 scripts)]{value=30 max=200 text="radius 30" accent=blue}
::bar[Revolver_Short (1)]{value=60 max=200 text="radius 60" accent=blue}
::bar[Pistol, Revolver (2)]{value=100 max=200 text="radius 100" accent=orange}
::bar[Assault and varmint rifles (3)]{value=150 max=200 text="radius 150" accent=orange}
::bar[Shotguns (5)]{value=200 max=200 text="radius 200" accent=orange}

The full list is below, read from the item scripts. The weapon scripts hold 409 items and 22 of them are `Ranged = true`, and every one of those has both fields. No other weapon script sets `SoundRadius`. :cite[(`media/scripts/generated/items/weapon.txt:11091`, `zombie/scripting/objects/Item.java:2341-2346`)]

| Script | Radius | Volume | Code |
|---|---|---|---|
| `Revolver_CapGun` | 30 | 15 | :cite[(`media/scripts/generated/items/weapon.txt:19805`, `:19866`)] |
| `Rifle_CapGun` | 30 | 15 | :cite[(`media/scripts/generated/items/weapon.txt:19885`, `:19950`)] |
| `Revolver_Short` | 60 | 25 | :cite[(`media/scripts/generated/items/weapon.txt:11881`, `:11943`)] |
| `Pistol2` | 70 | 50 | :cite[(`media/scripts/generated/items/weapon.txt:11548`, `:11613`)] |
| `TrapperCarbine` | 70 | 50 | :cite[(`media/scripts/generated/items/weapon.txt:20410`, `:20481`)] |
| `Pistol` | 100 | 30 | :cite[(`media/scripts/generated/items/weapon.txt:11464`, `:11529`)] |
| `Revolver` | 100 | 65 | :cite[(`media/scripts/generated/items/weapon.txt:11716`, `:11779`)] |
| `Pistol3` | 120 | 75 | :cite[(`media/scripts/generated/items/weapon.txt:11632`, `:11697`)] |
| `Revolver_Long` | 120 | 75 | :cite[(`media/scripts/generated/items/weapon.txt:11798`, `:11862`)] |
| `L92_Carbine` | 120 | 75 | :cite[(`media/scripts/generated/items/weapon.txt:20147`, `:20212`)] |
| `AssaultRifle` | 150 | 35 | :cite[(`media/scripts/generated/items/weapon.txt:11017`, `:11091`)] |
| `JS14_Rifle` | 150 | 35 | :cite[(`media/scripts/generated/items/weapon.txt:19970`, `:20040`)] |
| `VarmintRifle` | 150 | 200 | :cite[(`media/scripts/generated/items/weapon.txt:12131`, `:12202`)] |
| `L94_Rifle` | 160 | 200 | :cite[(`media/scripts/generated/items/weapon.txt:20232`, `:20299`)] |
| `AssaultRifle2` | 170 | 30 | :cite[(`media/scripts/generated/items/weapon.txt:11111`, `:11184`)] |
| `HuntingRifle` | 170 | 200 | :cite[(`media/scripts/generated/items/weapon.txt:11374`, `:11444`)] |
| `MSR7T_Rifle` | 170 | 200 | :cite[(`media/scripts/generated/items/weapon.txt:20319`, `:20390`)] |
| `Shotgun` | 200 | 200 | :cite[(`media/scripts/generated/items/weapon.txt:11962`, `:12031`)] |
| `JS3T_Shotgun` | 200 | 200 | :cite[(`media/scripts/generated/items/weapon.txt:20060`, `:20131`)] |
| `DoubleBarrelShotgun` | 200 | 200 | :cite[(`media/scripts/generated/items/weapon.txt:11204`, `:11274`)] |
| `DoubleBarrelShotgunSawnoff` | 200 | 200 | :cite[(`media/scripts/generated/items/weapon.txt:11290`, `:11358`)] |
| `ShotgunSawnoff` | 200 | 250 | :cite[(`media/scripts/generated/items/weapon.txt:12047`, `:12112`)] |

Thrown noisemakers are scripts too, and they set `NoiseRange` instead. They are in the machines section below.

## Doors, windows, barricades and trees

Hitting or breaking a building piece adds a noise of radius 20 or 10, and a zombie thumping on one adds a noise that only people react to.

| What happens | Radius | Volume | Code |
|---|---|---|---|
| A player or animal hits a door, window, barricade, crate or compost bin with a weapon | 20 | 20 | :cite[(`zombie/iso/objects/IsoDoor.java:1161`, `zombie/iso/objects/IsoWindow.java:250`, `zombie/iso/objects/IsoThumpable.java:1198`, `zombie/iso/objects/IsoBarricade.java:434`, `zombie/iso/objects/IsoCompost.java:341`)] |
| A player breaks a door | 20 | 20 | :cite[(`zombie/iso/objects/IsoDoor.java:1179-1194`)] |
| A zombie thumps a door, window, barricade, crate or compost bin | 20 | 20 | :cite[(`zombie/iso/objects/IsoDoor.java:1035`, `zombie/iso/objects/IsoWindow.java:447`, `zombie/iso/objects/IsoThumpable.java:1041`, `zombie/iso/objects/IsoBarricade.java:385`, `zombie/iso/objects/IsoCompost.java:293`)] |
| A zombie breaks a door | 10 | 20 | :cite[(`zombie/iso/objects/IsoDoor.java:1192-1193`)] |
| A window is smashed, or a zombie or animal breaks a thumpable | 10 | 20 | :cite[(`zombie/iso/objects/IsoWindow.java:277`, `zombie/iso/objects/IsoWindow.java:464`, `zombie/iso/objects/IsoThumpable.java:2787`)] |
| A vehicle window breaks | 10 | 20 | :cite[(`zombie/vehicles/VehicleWindow.java:109`)] |
| A weapon hits a tree | 20 | 20 | :cite[(`zombie/iso/objects/IsoTree.java:215`)] |
| A vehicle hits a tree or an object | 20 | 20 | :cite[(`zombie/iso/objects/IsoTree.java:201`, `zombie/iso/IsoObject.java:1732`)] |
| A zombie bends a fence | 40 | 40 | :cite[(`zombie/iso/IsoObject.java:5809`)] |

A zombie's thump has the zombie as its source, so no zombie reacts to it, and its stress-humans flag is set, so it stresses nearby players. :cite[(`zombie/iso/IsoObject.java:5800`, `zombie/WorldSoundManager.java:356-357`, `zombie/WorldSoundManager.java:416-420`)] The records made when a zombie breaks something have no source, so that rule does not apply to them. :cite[(`zombie/iso/objects/IsoWindow.java:464`)] On a server, the zombie-thump noise on a door runs on the server or in single player, because the client branch returns before it. :cite[(`zombie/iso/objects/IsoDoor.java:1017-1035`)]

## Machines, vehicles and fire

Machines add a repeating noise while they run, and some thrown items add one for a set time.

| Source | Radius | Volume | Notes | Code |
|---|---|---|---|---|
| Generator (4 scripts) | 20, 20, 23, 25 | 1 | From the item script; halved in a room; added every update while running (see [Electricity and generators](/pz/build-42/engine/fire-water-and-power/electricity-and-generators)) | :cite[(`zombie/iso/objects/IsoGenerator.java:170-199`, `media/scripts/generated/items/normal.txt:4813`, `media/scripts/generated/items/normal.txt:4830`, `media/scripts/generated/items/normal.txt:4847`, `media/scripts/generated/items/normal.txt:4864`)] |
| Generator backfire | 40 | 60 | Low condition only | :cite[(`zombie/iso/objects/IsoGenerator.java:240-251`)] |
| Clothes washer | 10, or 20 with noisy items | 10 | While running | :cite[(`zombie/iso/objects/ClothingWasherLogic.java:216-219`)] |
| Clothes dryer | 10 | 10 | While running | :cite[(`zombie/iso/objects/ClothingDryerLogic.java:151-153`)] |
| Jukebox | 70 | 70 | Pulses once every 150 updates while playing | :cite[(`zombie/iso/objects/IsoJukebox.java:142-149`)] |
| Radio, TV, other devices | Set by the device | 100 x the device volume | See [Radio and television](/pz/build-42/modding/engine/radio-and-television) | :cite[(`zombie/radio/devices/DeviceData.java:862-867`)] |
| Alarm clock | 15 (`AlarmClock2`), 7 (`Pocketwatch`) | 3 | Rings up to half a game hour | :cite[(`zombie/inventory/types/AlarmClock.java:123-134`, `media/scripts/generated/items/alarmclock.txt:13`, `media/scripts/generated/items/alarmclock.txt:24`)] |
| Wristwatch alarms (16 scripts) | 7 | 3 | Same code as the alarm clock | :cite[(`zombie/inventory/types/AlarmClockClothing.java:137`, `media/scripts/generated/items/alarmclockclothing.txt:17`)] |
| Burning fire starting | 20 | 20 | About one new fire in five | :cite[(`zombie/iso/objects/IsoFireManager.java:225-227`)] |
| Thrown `NoiseTrap` family (6 scripts) | 17 | 1 | For `NoiseDuration` 30 | :cite[(`media/scripts/generated/items/weapon.txt:635`, `zombie/iso/objects/IsoTrap.java:331-334`)] |
| Thrown `SmokeBomb` family (6 scripts) | 10 | 1 | For `NoiseDuration` 10 | :cite[(`media/scripts/generated/items/weapon.txt:1015`)] |
| `Firecracker`, `Firecracker_Crafted` | 80, 60 | 1 | Set when it explodes | :cite[(`media/scripts/generated/items/weapon.txt:19718`, `media/scripts/generated/items/weapon.txt:19747`, `zombie/iso/objects/IsoTrap.java:430-434`)] |

A noisemaker or smoke bomb repeats its noise about once per game minute for the length of its duration. :cite[(`zombie/iso/objects/IsoTrap.java:316-334`)] Both the duration and the repeat scale with the sandbox day length, so the real time is the same at every day length: `NoiseDuration` 30 is about 1.25 real minutes (duration / 24 minutes), `NoiseDuration` 10 about 25 seconds, and the repeat is about every 2.5 real seconds. We worked this out from the code and did not run a game to confirm it.

**Vehicles.** A vehicle whose engine is not idle adds four engine noises each update, scaled by how loud the engine part is and how fast the vehicle goes. :cite[(`zombie/vehicles/VehicleEngine.java:229-300`)] The radii are the engine loudness (at least 8), half of it, a quarter of it and a sixth of it, with a volume of a third of the loudness (at least 6). The first three are added only now and then. :cite[(`zombie/vehicles/VehicleEngine.java:265-300`)] A server option, `CarEngineAttractionModifier`, multiplies the loudness on a dedicated server only, and its default is 0.5. :cite[(`zombie/network/ServerOptions.java:187-188`, `zombie/vehicles/VehicleEngine.java:270-273`)] A siren adds radius 100, volume 60 once a second when the sandbox option "Vehicle Sirens Attract Zombies" is switched on (it is on by default). :cite[(`zombie/vehicles/BaseVehicle.java:7873-7880`, `zombie/SandboxOptions.java:205`)] The horn and the car alarm each add radius 150, volume 150, and only when the vehicle script enables them (`hornEnable`, `alarmEnable`). :cite[(`zombie/vehicles/BaseVehicle.java:9005-9008`, `zombie/vehicles/VehicleAlarm.java:157`, `zombie/vehicles/VehicleAlarm.java:155-160`, `zombie/vehicles/VehicleAlarm.java:184-189`)] The parts that set engine loudness are on the [vehicles pages](/pz/build-42/vehicles/reference/vehicle-engine-numbers-mods-must-know).

## Noises the world makes on its own

Random gunfire, helicopters and building alarms add noises far larger than anything a player makes.

| Event | Radius | Volume | Code |
|---|---|---|---|
| Random distant gunshot, placed 500 tiles from a random living player | 600 | 600 | :cite[(`zombie/AmbientStreamManager.java:443-490`, `zombie/GameTime.java:484-491`)] |
| Building alarm | 600 | 600 | :cite[(`zombie/iso/Alarm.java:46-48`)] |
| Helicopter | 500 | 500 | :cite[(`zombie/iso/Helicopter.java:214-216`)] |
| Ball that falls out of the world | 600 | 600 | :cite[(`zombie/iso/objects/IsoBall.java:92`)] |

The gunshot events depend on the Meta Event sandbox option, and an admin command can trigger one. :cite[(`zombie/GameTime.java:690`, `zombie/commands/serverCommands/GunShotCommand.java:36`)] The code also has a thunder noise of radius 5000, but no Java or vanilla Lua file calls it, so only a mod could trigger it. :cite[(`zombie/AmbientStreamManager.java:513-530`)] On a dedicated server the instance is a different class that adds the same radius 600 gunshot noise. :cite[(`zombie/network/GameServer.java:837`, `zombie/AmbientSoundManager.java:131-146`)]

## Actions that add a noise from Lua

Many player actions in vanilla Lua call `addSound` themselves, and each runs on the player's own client.

| Action | Radius | Volume | Code |
|---|---|---|---|
| Building (crafting sound branch) | 15 | 15 | :cite[(`media/lua/client/BuildingObjects/TimedActions/ISBuildAction.lua:98-103`)] |
| Barricading, or removing a metal barricade | 20 x the hammer or welding sound modifier | same as radius | :cite[(`media/lua/shared/TimedActions/ISBarricadeAction.lua:66-73`, `media/lua/shared/TimedActions/ISUnbarricadeAction.lua:43-44`)] |
| Multi-stage build | 20 | 1 | :cite[(`media/lua/shared/BuildingObjects/TimedActions/ISMultiStageBuild.lua:37`)] |
| Digging, plowing | 10 | 1 | :cite[(`media/lua/shared/BuildingObjects/TimedActions/ISShovelGround.lua:47`, `media/lua/shared/Farming/TimedActions/ISPlowAction.lua:44`)] |
| Fishing rod and fishing net actions | 20 | 1 | :cite[(`media/lua/shared/Fishing/FishingRod.lua:317`, `media/lua/shared/TimedActions/Fishing/TimedActions/ISCheckFishingNetAction.lua:20`)] |
| Destroying objects, pick axe on ground cover | 20 or 10 | 10 | :cite[(`media/lua/shared/TimedActions/ISDestroyStuffAction.lua:69`, `media/lua/shared/TimedActions/ISPickAxeGroundCoverItem.lua:51`)] |
| Picking up or removing broken glass | 20 or 6 | 1 | :cite[(`media/lua/shared/TimedActions/ISPickupBrokenGlass.lua:22`, `media/lua/shared/TimedActions/ISRemoveBrokenGlass.lua:23`)] |
| Removing bushes or grass | 20 or 10 | 10, 1 or 5 | :cite[(`media/lua/shared/TimedActions/ISRemoveBush.lua:41`, `media/lua/shared/TimedActions/ISRemoveGrass.lua:30`)] |
| Moving furniture | 10 | 5 | :cite[(`media/lua/shared/Moveables/ISMoveableSpriteProps.lua:3176`)] |
| A lit campfire (server) | The fire's radius | same as radius | :cite[(`media/lua/server/Camping/SCampfireSystem.lua:153-163`)] |

## What makes a sound but no noise

A clip you hear and a noise zombies hear are separate, and several loud-seeming actions only play the clip.

Opening or closing a door adds no world sound, because the door code adds one only when a weapon hits it, a zombie thumps it and when it breaks. :cite[(`zombie/iso/objects/IsoDoor.java:1035`, `zombie/iso/objects/IsoDoor.java:1161`, `zombie/iso/objects/IsoDoor.java:1192-1193`)] A melee swing adds none, as above. A noise with a radius of 0 or less is dropped on the spot. :cite[(`zombie/WorldSoundManager.java:156-158`)] The opposite also happens: the random gunshot noises are real world sounds that you may only hear as a faint clip.

:::callout[How we know]{kind=proof}
Every number comes from reading the 42.22 Java, the vanilla Lua and the item scripts, and nothing was run in a game. The weapon counts come from a script over `weapon.txt`, which has 409 item blocks. The list of noise makers comes from a search of every `addSound` and `addSoundRepeating` call in the Java source and `addSound` in the vanilla Lua. We did not trace which machine adds each melee-hit noise in multiplayer, and the real-time figures for noisemakers are worked out from the sandbox day length, not measured.
:::
