---
id: build-42-fatigue-sleep-and-endurance
slug: fatigue-sleep-and-endurance
title: 'Fatigue, sleep and endurance: how fast they drain and recover'
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - fatigue
  - sleep
  - endurance
  - fitness
  - sandbox
excerpt: >-
  Endurance refills in real time: about 9.3 minutes standing at Fitness 5. Fatigue builds on game time: about 16 game hours awake to Tired. A full sleep takes about 12 game hours (42.22).
last_updated: '2026-11-15'
related_articles:
  - weight-encumbrance-and-strength
  - how-fast-skills-level
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, you have two different "tired" bars. Endurance is the one a sprint empties; fatigue is the one that sends you to bed. The game treats them very differently, and that explains a lot of arguments about rest. The numbers below are for the default sandbox and a new character at Fitness 5.

:::callout[The 1-minute version]{kind=key}
- Endurance recovers on real time, not game time. Standing still refills an empty bar in about 9.3 real minutes. Sitting or resting is five times faster, about 2 real minutes.
- Walking recovers endurance at a quarter of the standing rate while you are at half endurance or above. Below half, walking slowly drains it.
- Running empties a full bar in about 10 real minutes and sprinting in a little over a minute.
- Fatigue builds on game time. With full endurance you reach the Tired moodle after about 16 game hours awake (1 real hour), and about 3 times faster when your endurance is empty.
- Sleep clears fatigue in two stages: 0.7 over 5 game hours, then the last 0.3 over 7 game hours, in an average bed.
- On a default multiplayer server there is no fatigue at all: Sleep Allowed and Sleep Needed are both off, and the server resets fatigue to zero.
:::

:::facts
- **Standing, empty to full** about 560 real seconds (9.3 minutes) at Fitness 5
- **Sitting or resting** about 112 real seconds
- **Running / sprinting, full to empty** about 10 real minutes / about 68 real seconds
- **Awake, to Tired (0.6)** about 16 game hours with full endurance, which is 1 real hour
- **Asleep, 1.0 to 0** about 12 game hours, which is 45 real minutes if the game ran at normal speed
- **Conversion** one game day is 1.5 real hours at the default day length, so one game hour is 3.75 real minutes
:::

:::flow[Two different clocks]
- Endurance: real time at your current game speed
- Fatigue awake: game time
- Fatigue asleep: game time, after a short delay to fall asleep
- Sleep length: picked once when you lie down
:::

## 1. Endurance recovery

Whenever you are not running, the game adds endurance each update, and the update is tied to real seconds, not to the length of the day.

At the default game speed, and at 12 frames per second or more, the engine's per-update time step adds up to 48 for every real second; below 12 frames per second the step is capped at 5 per frame on a client, so the sum falls, and a dedicated server has no cap. That sum is why endurance comes back in the same number of real minutes whatever day length you play. :cite[(`zombie/GameTime.java:202-204`, `zombie/GameTime.java:970-987`, `zombie/FPSTracking.java:46-48`, `zombie/network/GameServer.java:1166`)] The basic gain is the base rate 0.000031 times Endurance Regeneration, your recovery factor, a fatigue term and that time step. :cite[(`media/lua/shared/defines.lua:7`, `zombie/characters/IsoPlayer.java:3326-3337`)]

| You are | Rate | Empty to full at Fitness 5 |
|---|---|---|
| Sitting on the ground, resting on furniture, or in a vehicle seat | x5, and the fatigue term is (1 - 0.8 x fatigue) | about 112 real seconds |
| Standing still | x1, and the fatigue term is (1 - 0.85 x fatigue) | about 560 real seconds (9.3 minutes) |
| Walking, endurance at half or above | x0.25, fatigue term (1 - fatigue) | about 37 real minutes |
| Walking, endurance below half | slowly drains instead, by a fixed amount per game update that is not scaled by time, so the speed depends on how many updates per second your game (or the server) runs | - |
| Asleep, single player, everyone asleep | x2, scaled to game time | about 3.7 game hours |

:cite[(`zombie/characters/IsoPlayer.java:3203-3226`, `zombie/characters/IsoPlayer.java:3326-3356`, `zombie/ZomboidGlobals.java:18`, `zombie/characters/IsoPlayer.java:3065-3079`)] The real-time figures are our own arithmetic on the numbers above, for a character with no fatigue.

The recovery factor comes from Fitness, your weight and your diet. :cite[(`zombie/characters/IsoGameCharacter.java:4644-4712`)]

| Fitness | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Recovery factor | 0.7 | 0.8 | 0.9 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 | 1.5 | 1.55 | 1.6 |

It is then multiplied by 0.4 if Obese, 0.7 if Overweight, 0.7 if Very Underweight, 0.3 if Emaciated, and by 0.5 or 0.2 when your stored fat or protein runs far below zero (below -1000 and -1500). :cite[(`zombie/characters/IsoGameCharacter.java:4689-4712`)]

The sandbox Endurance Regeneration setting multiplies all of it: Very Fast x1.8, Fast x1.3, Normal x1.0 (default), Slow x0.7, Very Slow x0.4. :cite[(`zombie/SandboxOptions.java:393-401`)]

Heavy Load at level 2 or more stops the standing and walking recovery completely, while sitting still recovers at the full sitting rate whatever you carry. :cite[(`zombie/characters/IsoPlayer.java:3326-3337`, `zombie/characters/IsoPlayer.java:3203-3212`)] Endurance is worked out on single player and on the server, and a multiplayer client skips it; the sitting recovery has no client check of its own, but its only caller is gated. :cite[(`zombie/characters/IsoPlayer.java:3229`, `zombie/characters/IsoPlayer.java:3358`)]

## 2. Endurance drain

Running costs 0.000052 per update and sprinting 0.000455, and a long list of factors multiplies both.

The factors in order:
- 1.4 normally, 2.9 if Overweight, 0.8 if Athletic; then x2.3 and x0.5; :cite[(`zombie/characters/IsoPlayer.java:3247-3256`)]
- a Fitness factor from 0.9 at Fitness 0 down to 0.6 at Fitness 5 and 0.43 at Fitness 10; :cite[(`zombie/characters/IsoGameCharacter.java:4560-4583`)]
- x2 when Hyperthermia is at its worst level; :cite[(`zombie/characters/IsoGameCharacter.java:4585-4592`)]
- 0.7 normally, 1.0 if Asthmatic; :cite[(`zombie/characters/IsoPlayer.java:3259-3262`)]
- x1.5 while sneaking; :cite[(`zombie/characters/IsoPlayer.java:3232-3235`)]
- the Heavy Load factor: x1.5, x1.9, x2.3 or x2.8 for levels 1 to 4. :cite[(`zombie/characters/IsoPlayer.java:3268-3274`)]

At Fitness 5 with nothing heavy, running from full to empty takes about 10 real minutes and sprinting about 68 real seconds. Those are our own sums. Dragging a corpse costs the same as sprinting. :cite[(`zombie/characters/IsoPlayer.java:3238-3246`, `media/lua/shared/defines.lua:5-6`)]

Walking is not free when you are overloaded: at Heavy Load level 3 or 4 even walking drains endurance, at a rate that depends on the level. :cite[(`zombie/characters/IsoPlayer.java:3280-3322`)] Swinging weapons costs endurance too, by weapon; that is a combat question for another page. :cite[(`zombie/CombatManager.java:1309-1325`, `zombie/CombatManager.java:3904-3925`)]

The Endurance moodle appears below 0.75 endurance and worsens below 0.5, 0.25 and 0.1. :cite[(`zombie/characters/Moodles/MoodleStat.java:16`)]

## 3. Fatigue while awake

Fatigue goes from 0 (fully rested) to 1, and it rises by game hour, not by real second.

Every game hour awake adds:

**0.124 x max(0.3, 1 - endurance) x Stats Decrease x trait factor x temperature factor, divided by 1.5 while sitting or resting**

:cite[(`zombie/characters/IsoGameCharacter.java:10156-10191`, `media/lua/shared/defines.lua:19`)] The 0.124 is the base rate 0.0000345 times 3,600, which is the sum of the per-update time step and the day-length term over one game hour; that sum does not depend on the day length. :cite[(`zombie/characters/IsoGameCharacter.java:10182-10188`, `zombie/GameTime.java:436-438`)]

| Endurance | Fatigue per game hour | Game hours from 0 to Tired (0.6) |
|---|---|---|
| Full (1.0) | 0.037 | about 16 (60 real minutes) |
| Half (0.5) | 0.062 | about 10 (36 real minutes) |
| Empty (0) | 0.124 | under 5 (18 real minutes) |

- **Traits:** Needs Less Sleep x0.7, Needs More Sleep x1.3. :cite[(`zombie/characters/IsoGameCharacter.java:10165-10171`)]
- **Temperature:** being too hot or too cold raises the factor above 1, more the further off you are. :cite[(`zombie/characters/BodyDamage/Thermoregulator.java:966-988`)]
- **Sandbox Stats Decrease:** Very Fast x2.0, Fast x1.6, Normal x1.0 (default), Slow x0.8, Very Slow x0.65. It also speeds up hunger and thirst. :cite[(`zombie/SandboxOptions.java:403-411`)]
- **Moodle:** Tired starts above 0.6, then worsens above 0.7, 0.8 and 0.9. :cite[(`zombie/characters/Moodles/MoodleStat.java:18`)]

Unlike endurance, this rate is set per game hour, so a longer day does not make you tire more slowly per day.

## 4. Sleep

Sleeping has three steps: the game picks how long you will sleep, you take a short random time to fall asleep, and then fatigue drains.

### How long you will sleep

When you lie down, the game picks your sleep length in game hours.

1. A random whole number from 10 x fatigue up to, but not including, 13 x fatigue, plus 1. Both bounds are cut to whole numbers first, so at fatigue 0.75 the pick is 7 or 8, and the result 8 or 9 hours. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:1056`, `zombie/Lua/LuaManager.java:7027-7032`, `zombie/core/random/RandAbstract.java:39-55`)]
2. Good bed: 1 hour less. Bad bed (a car seat counts as one): 1 hour more. Floor: x0.7. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:1058-1067`, `media/lua/client/ISUI/ISWorldObjectContextMenu.lua:2951-2968`)]
3. Insomniac x0.5, Needs Less Sleep x0.75, Needs More Sleep x1.18. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:1068-1076`)]
4. Never less than 3 hours or more than 16. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:1077-1078`)]

You also wake up after 16 hours asleep no matter what. :cite[(`zombie/characters/IsoPlayer.java:3178-3180`)]

Two things stop you from lying down. You cannot while zombies are visible, chasing you or very close, and you cannot while panicked, or while in pain (Pain moodle level 2 or more) at fatigue 0.85 or below, unless a strong dose of sleeping pills is working. :cite[(`media/lua/client/ISUI/ISWorldObjectContextMenu.lua:1034-1051`, `media/lua/client/ISUI/ISWorldObjectContextMenu.lua:1036`)]

### Falling asleep

Fatigue only starts dropping once you have really fallen asleep, and that delay is random, up to a limit.

- 0.3 game hours normally, 1 hour if Insomniac;
- plus 1 hour and 0.2 per pain level if you are in pain;
- x1.2 if stressed;
- x1.3 bad bed, x1.25 bad bed with pillow, x0.8 good bed, x0.6 good bed with pillow, x1.6 floor, x1.45 floor with pillow;
- x0.5 for a Night Owl;
- 0.1 hours flat on sleeping pills;
- never more than 2 hours.

:cite[(`zombie/ai/sadisticAIDirector/SleepingEvent.java:159-203`, `zombie/characters/IsoPlayer.java:3112-3115`)]

### How fast sleep clears fatigue

While you are really asleep, every game hour removes 0.14 fatigue while fatigue is above 0.3 (0.7 spread over 5 hours), and 0.043 at 0.3 or below (0.3 spread over 7 hours).

Each is multiplied by the bed and trait factors. :cite[(`zombie/characters/IsoPlayer.java:3083-3125`)]

| Where you sleep | Factor |
|---|---|
| Floor | 0.6 |
| Floor with pillow | 0.75 |
| Bad bed (or car seat) | 0.9 |
| Bad bed with pillow | 0.95 |
| Average bed | 1.0 |
| Average bed with pillow | 1.05 |
| Good bed | 1.1 |
| Good bed with pillow | 1.15 |

Insomniac x0.5, Night Owl x1.4. Needs Less Sleep shortens both stages to 0.75 of their length (3.75 and 5.25 hours), and Needs More Sleep stretches them to 1.18 (5.9 and 8.26 hours). :cite[(`zombie/characters/IsoPlayer.java:3075-3125`)]

So from completely exhausted (1.0) to fully rested in an average bed takes 12 game hours (45 real minutes at normal speed); from just Tired (0.6) it takes about 9. Those are our sums. In single player, when every player is asleep, the game speeds up by a large factor, so the real wait is much shorter. :cite[(`zombie/GameTime.java:970-973`)]

## 5. Multiplayer

Fatigue exists on a server only when the options Sleep Allowed and Sleep Needed are both on, and both are off by default.

While either is off, the server resets every player's fatigue to zero on each update, so nobody gets tired. :cite[(`zombie/network/ServerOptions.java:127-128`, `zombie/characters/IsoGameCharacter.java:10123-10127`)] Endurance works as described above, worked out by the server. :cite[(`zombie/characters/IsoPlayer.java:3229`)] The "all players asleep" speed-up and the x2 sleeping endurance scaling use the local players only, so a dedicated server does not take that path; we did not measure what that does to the sleeping endurance rate. :cite[(`zombie/characters/IsoPlayer.java:1003-1017`, `zombie/characters/IsoPlayer.java:3065-3069`)]

## Where to go next

- [Weight, encumbrance and strength](/pz/build-42/gameplay/the-real-numbers/weight-encumbrance-and-strength): what Heavy Load does to your endurance.
- [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level): Fitness XP, which raises your recovery factor.
- [Hunger, thirst and nutrition](/pz/build-42/engine/character-stats/hunger-thirst-and-nutrition): the other needs that run beside fatigue.
- [How the character stats work](/pz/build-42/engine/character-stats/how-character-stats-work): the update loop these numbers run in.

:::callout[How we know]{kind=proof}
Every rule above is read from the 42.22 Java and Lua. The real-time figures (9.3 minutes, 10 minutes, 68 seconds, 16 hours) are our own arithmetic: the engine adds up to 48 time-step units per real second at normal game speed, and we divided the code's rates by that.

Not tested: the real-time recovery and drain times in a running game, and the sleeping endurance rate on a dedicated server, which depends on its update rate. We also did not read the nightmare and zombie sleeping events that can wake you.
:::
