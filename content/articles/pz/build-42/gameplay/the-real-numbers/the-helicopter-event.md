---
id: build-42-the-helicopter-event
slug: the-helicopter-event
title: 'The helicopter event: how it picks its day and its target'
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - helicopter
  - events
  - zombies
  - sandbox
excerpt: >-
  When the helicopter comes in 42.22, who it follows, how long it stays over you, and why it brings a crowd: on the default setting, once, on a random day after 6 to 9 nights, with a 500-tile noise.
last_updated: '2026-11-15'
related_articles:
  - how-zombies-see-and-hear-you
  - how-long-zombies-remember-you
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, everyone remembers their first helicopter: the drone in the distance, then half the town on your doorstep. Here is when it comes, who it follows, and why the crowd arrives with it.

:::callout[The 1-minute version]{kind=key}
- On the default setting ("Once"), the game picks the day when the world is created: after 6 to 9 nights survived, starting between 9 AM and 6 PM, in a window 1 to 4 hours long.
- Once the window opens, it launches within a few in-game minutes on average, and it picks one player at random. Where you are and how much noise you make do not matter.
- It appears 1,000 tiles east and 1,000 tiles south of that player and flies at them. It stays over them for at most about a minute at normal speed, then leaves.
- About every ten real seconds while it is active (at the frame cap), it makes a noise that carries 500 tiles. That noise, not the helicopter itself, is what pulls the zombies toward you.
- Being indoors or in a forest does not hide you from it. It only changes where it flies.
- "Sometimes" brings the next one 11 to 16 days after the last, "Often" 7 to 10 days after, "Never" turns it off.
:::

:::facts
- **Day** after 6, 7, 8 or 9 nights survived (a night counts over at 7 AM)
- **Start hour and window** 9 AM to 6 PM, then 1 to 4 hours long
- **Launch** about 6 in 100 per real second once the window is open, so about 17 real seconds, or about 4 to 5 in-game minutes on the default 1 hour 30 minute day
- **Flight in** about 1,414 tiles at about 22.5 tiles per real second, so about 63 seconds
- **Stay** at most 60 seconds of hovering and searching in total
- **Noise** radius 500, about once every 10 real seconds at the frame cap; a machine running below its cap gets fewer
- **Whole visit** about 3 real minutes, about 50 in-game minutes on the default day
:::

## 1. When it comes

The game rolls the helicopter's day, hour and window once, when the world starts, and only if the setting is not "Never".

The day is after 6, 7, 8 or 9 nights survived, the start hour is 9 to 18 (9 AM to 6 PM), and the window is 1, 2, 3 or 4 hours long. :cite[(`zombie/GameTime.java:347-351`)] A night survived rolls over at 7 AM, so "day 6" runs from 7 AM after your sixth night to 7 AM the next morning. :cite[(`zombie/GameTime.java:572-573`)]

On that day, while the clock is inside the window and no helicopter is active, the game rolls a 1-in-800 chance scaled by the game speed. :cite[(`zombie/GameTime.java:493-497`, `zombie/GameTime.java:1024-1026`)] At normal speed that works out to about a 6% chance per real second, wherever you play it: the frame rate cancels out on a client, and a dedicated server runs at 10 cycles per second with the same result. :cite[(`zombie/GameTime.java:986`, `zombie/FPSTracking.java:46`, `zombie/network/GameServer.java:859`, `zombie/network/GameServer.java:1166`)] The average wait is about 17 real seconds, which is four or five in-game minutes on the default 1 hour 30 minute day. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:8`, `media/lua/shared/Translate/EN/Sandbox.json:30`)]

| Setting | What happens after a helicopter day | Code |
|---|---|---|
| Never | no helicopter at all | `zombie/GameTime.java:347` |
| Once (default) | nothing: it never comes again | `zombie/SandboxOptions.java:150` |
| Sometimes | the next one is 11 to 16 days after the last, at a new random hour and window | `zombie/GameTime.java:502-513` |
| Often | the next one is 7 to 10 days after the last, at a new random hour and window | `zombie/GameTime.java:502-513` |

The ranges in the last two rows are counted from the helicopter day itself: the game re-rolls on the first night after it, adding 10 to 15 (Sometimes) or 6 to 9 (Often) to that night count. :cite[(`zombie/GameTime.java:502-510`)] It does that whether or not the helicopter actually flew.

The game's own presets set the option like this: Apocalypse, Outbreak and Six Months Later use "Once", Extinction uses "Sometimes", and Rising uses "Never". :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:78`, `media/lua/shared/Sandbox/Outbreak.lua:78`, `media/lua/shared/Sandbox/SixMonthsLater.lua:52`, `media/lua/shared/Sandbox/Extinction.lua:78`, `media/lua/shared/Sandbox/Rising.lua:78`)] The 28 Minutes Later challenge turns it off and Top of the World uses "Once". :cite[(`media/lua/client/Challenge/28MinutesLater.lua:78`, `media/lua/client/Challenge/TopOfTheWorld.lua:85`)]

### It can come back the same afternoon

The helicopter can launch again on the same afternoon, because the code that is meant to push the window back does nothing.

After a launch the code adds half an hour to the start hour, but the start hour is a whole number, so adding 0.5 and cutting back to a whole number gives the same hour. :cite[(`zombie/GameTime.java:95`, `zombie/GameTime.java:498`)] If the helicopter finishes its visit while the window is still open, the same roll can launch it again, and each visit has a fresh random target. :cite[(`zombie/GameTime.java:493-499`, `zombie/iso/Helicopter.java:305-319`)]

A visit takes roughly three real minutes (see "What it does"), which is about 50 in-game minutes on the default day, so a window of 1 to 4 in-game hours can hold more than one visit. We read this in the code and have not timed it in a game. If you see the helicopter come back on its day, this is the reason.

## 2. Who it picks

It picks one player at random, and nothing about that player (position, noise, what you are doing) changes the odds.

- **Single player and split screen:** one of the living local players. :cite[(`zombie/iso/Helicopter.java:61-72`, `zombie/iso/Helicopter.java:79`)]
- **Multiplayer:** one of the players connected to the server, wherever they are on the map. :cite[(`zombie/iso/Helicopter.java:58-60`, `zombie/network/GameServer.java:3590-3604`)] The list does not check whether a player is alive. If the pick is dead, the helicopter turns around and leaves. :cite[(`zombie/iso/Helicopter.java:120-136`)]
- **If nobody is there** (an empty server), nothing launches, and the check keeps trying for the rest of the window. :cite[(`zombie/iso/Helicopter.java:75-78`)]

## 3. What it does

The helicopter flies in, hovers over you for at most a minute, then flies out in a straight line.

:::flow[One visit, at normal game speed]
- Arriving: about 63 seconds
- Hovering over you, searching if it loses you: 60 seconds in total at most
- Leaving: about a minute, until no player is within 1,000 tiles
:::

1. **Arriving.** It starts 1,000 tiles east and 1,000 tiles south of the target, about 1,414 tiles away. :cite[(`zombie/iso/Helicopter.java:85-86`)] It heads for the target's current position at 0.75 tiles per step, and the engine takes 30 steps per real second at normal speed, so about 22.5 tiles per second, or about 63 seconds. :cite[(`zombie/iso/Helicopter.java:127-132`, `zombie/iso/Helicopter.java:218-219`, `zombie/GameTime.java:1032-1034`)]
2. **Hovering.** Within 2 tiles of you it starts circling: it picks points up to 50 tiles from you and flies between them at half that speed. :cite[(`zombie/iso/Helicopter.java:121-125`, `zombie/iso/Helicopter.java:153-160`)]
3. **Searching.** After 15 seconds in total of being hidden, it searches instead, picking points up to 100 tiles from you. :cite[(`zombie/iso/Helicopter.java:144-150`, `zombie/iso/Helicopter.java:166-181`)] You count as hidden when you are indoors (not on an outdoor square) or in a Forest or Deep Forest zone. :cite[(`zombie/iso/Helicopter.java:289-299`)] That 15 seconds adds up over the whole hover: stepping back into the open does not reset it. Only a search that finds you again does, and then it goes back to hovering. :cite[(`zombie/iso/Helicopter.java:171-173`)]
4. **Leaving.** After 60 seconds of hovering and searching in total, it leaves in a straight line, and it switches off once no player is within 1,000 tiles of it. :cite[(`zombie/iso/Helicopter.java:141-143`, `zombie/iso/Helicopter.java:169-170`, `zombie/iso/Helicopter.java:186-211`)] It keeps the speed of its last state, half a tile per step when it was hovering or searching, so clearing 1,000 tiles takes about a minute. :cite[(`zombie/iso/Helicopter.java:159`, `zombie/iso/Helicopter.java:180`, `zombie/iso/Helicopter.java:218-228`)] On a server, the check counts every connected player, not only its target. :cite[(`zombie/iso/Helicopter.java:188-197`)]

In single player the hover and search timers run at your game speed, so fast-forwarding shortens them. On a dedicated server they always count real seconds. :cite[(`zombie/iso/Helicopter.java:109-116`, `zombie/iso/Helicopter.java:140`)]

**The noise.** On every update while it is active, there is a small chance, tuned to about once every ten real seconds at the frame cap, that it makes a world sound at its position with a radius of 500 tiles. :cite[(`zombie/iso/Helicopter.java:214-216`, `zombie/core/random/RandInterface.java:32-39`)] The chance is per frame, so game speed does not change it, and the frame-rate cap on a client or the 10 cycles per second on a server are already built into it. A client running below its cap makes the noise less often, because the chance is scaled by the cap and not by the frames it actually draws. :cite[(`zombie/core/random/RandInterface.java:32-39`)] The sound is sent to the other machines in multiplayer. :cite[(`zombie/WorldSoundManager.java:176-181`)] Zombies that hear it head for where the helicopter was, and because it hovers around you, those sounds land on and around you. How a zombie answers a sound is on [What makes noise, and how far it carries](/pz/build-42/engine/sound-and-noise/what-makes-noise-and-how-far).

## 4. So how do you lose it?

You cannot hide from it: it follows its target wherever they go, and it leaves after a minute over them whatever they do.

Being indoors or in a forest only changes its pattern, from points within 50 tiles of you to points within 100. The noise still carries 500 tiles, so the zombies still come your way. What you can choose is where you are on that day: the fewer zombies within 500 tiles, the smaller the crowd.

## 5. Multiplayer

The server runs the whole event, and there is one helicopter for the whole server, not one per player.

The server rolls the launch, chooses the target and moves the helicopter, then sends its position to every client, which only plays the sound. :cite[(`zombie/GameTime.java:484`, `zombie/iso/Helicopter.java:105-107`, `zombie/iso/Helicopter.java:230-232`, `zombie/network/GameServer.java:1822-1833`, `zombie/iso/IsoWorld.java:332`)]

## Where to go next

- [How loot is rolled, and when it respawns](/pz/build-42/gameplay/the-real-numbers/how-loot-is-rolled-and-respawns), for what is left in town after the horde has passed.
- [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance), for how long you can keep running from it.
- [How far zombies see and hear you](/pz/build-42/gameplay/the-real-numbers/how-zombies-see-and-hear-you), for what a zombie does with a noise once it hears one.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 code. We did not run a game to time a visit, so the three-minute visit, the same-afternoon return and the 6% launch chance are worked out from the code, not measured. 

We have not watched this on a dedicated server. The conversion to real time uses 30 movement steps per real second and 48 game updates per real second at normal speed (the game caps its frame multiplier at 5, which only matters below about 12 frames per second). :cite[(`zombie/FPSTracking.java:46-49`)] :cite[(`zombie/GameTime.java:986`, `zombie/GameTime.java:1032-1034`)] The sandbox tooltip says the helicopter passes over "the Event Zone", but nothing in the helicopter or launch code reads a zone: the target is a player. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:607`)] Whether any other code moves it is not verified.
:::
