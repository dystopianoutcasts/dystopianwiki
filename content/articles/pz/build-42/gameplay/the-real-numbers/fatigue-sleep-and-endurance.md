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
  Endurance runs on real time: standing still refills an empty bar in about
  9.3 real minutes at Fitness 5, sitting does it five times faster. Fatigue runs
  on game time: about 16 in-game hours awake to reach Tired. Sleep clears 0.7
  fatigue in 5 hours and the last 0.3 in 7. On a default multiplayer server
  there is no fatigue at all. Read from the 42.21 code.
last_updated: '2026-10-04'
---
# Fatigue, sleep and endurance: how fast they drain and recover

Outcast, you have two different "tired" bars. Endurance is the one a sprint empties; fatigue is the one that sends you to bed. The game treats them very differently, and the difference explains a lot of arguments about rest. Here are the Build 42.21 numbers for the default sandbox and a new character (Fitness 5).

## The short answer

- **Endurance recovers on real time, not game time.** Standing still refills an empty bar in about **9.3 real minutes** (about 2.5 in-game hours on the default 90-minute day). **Sitting down or resting is five times faster: about 2 real minutes.** Walking recovers at a quarter of the standing rate while you are above half endurance; below half, walking slowly drains it.
- **Running empties a full bar in about 10 real minutes**, sprinting in a little over a minute.
- **Fatigue builds on game time.** Fully rested, with full endurance, you reach the Tired moodle (fatigue 0.6) after about **16 in-game hours awake**. It builds more than three times faster when your endurance is empty.
- **Sleep clears fatigue in two stages:** 0.7 over 5 hours while you are above 0.3, then the last 0.3 over 7 hours, in a normal bed. A floor makes that 0.6 times as fast; a good bed with a pillow 1.15 times.
- **How long you sleep** is a random whole number of hours, about 10 to 13 times your fatigue plus one, then adjusted for bed and traits, and always between 3 and 16.
- **On a default multiplayer server there is no fatigue at all:** the server options Sleep Allowed and Sleep Needed are both off, and the server resets fatigue to zero.

## Endurance

### Recovery

Every moment you are not moving, the game adds:

**0.000031 x Endurance Regeneration x recovery factor x (1 - 0.85 x fatigue) x the time step**

The time step is tied to real seconds at your current game speed, not to the length of the day. That is why endurance comes back in the same number of real minutes whatever day length you play, while fatigue and hunger follow the in-game clock.

| You are | Rate | Empty to full at Fitness 5 |
|---|---|---|
| Sitting on the ground, resting on furniture, or in a vehicle seat | x5, and the fatigue term is (1 - 0.8 x fatigue) | about 112 real seconds |
| Standing still | x1 | about 560 real seconds (9.3 minutes) |
| Walking, endurance above half | x0.25, fatigue term (1 - fatigue) | about 37 real minutes |
| Walking, endurance at half or below | slowly drains instead: a fixed amount per game update, not scaled by time, so the speed depends on how many updates per second your game (or the server) runs | - |
| Asleep (single player) | x2, scaled to game time | about 3.7 in-game hours |

The recovery factor comes from Fitness, your weight and your diet:

| Fitness | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Recovery factor | 0.7 | 0.8 | 0.9 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 | 1.5 | 1.55 | 1.6 |

It is then multiplied by 0.4 if Obese, 0.7 if Overweight, 0.7 if Very Underweight, 0.3 if Emaciated, and by 0.5 or 0.2 when your stored fat or protein runs far below zero (below -1000 and -1500).

The sandbox **Endurance Regeneration** setting multiplies all of it: Very Fast x1.8, Fast x1.3, Normal x1.0 (default), Slow x0.7, Very Slow x0.4.

Heavy Load at level 2 or more stops the standing and walking recovery completely. Sitting still recovers at the full sitting rate whatever you carry.

> **Proof:** Code. `zombie.characters.IsoPlayer#updateEndurance` (standing: `imobileEnduranceReduce * getEnduranceRegenMultiplier() * getRecoveryMod() * (1 - fatigue * 0.85)`; walking: divided by 4 with `1 - fatigue`, only below ENDURANCE moodle level 2, else `runningEnduranceReduce / 7.0 * sneakMultiplier` with no time multiplier; both only at HEAVY_LOAD 1 or less), `#updateEnduranceWhileSitting` and `#updateEnduranceWhileInVehicle` (`sittingEnduranceMultiplier` 5.0, `1 - fatigue * 0.8`, no load check), `#updateStats_Sleeping` (2.0, times `getDeltaMinutesPerDay()` when all players sleep); `zombie.characters.IsoGameCharacter#getRecoveryMod`; `zombie.SandboxOptions#getEnduranceRegenMultiplier`; `ImobileEnduranceIncrease = 0.0000930/3` in `media/lua/shared/defines.lua`; `zombie.GameTime#getMultiplier` (no day-length term). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Drain

Running costs **0.000052** per time step and sprinting **0.000455**, both multiplied by:

- 1.4 normally, 2.9 if Overweight, 0.8 if Athletic; then x2.3 and x0.5;
- a Fitness factor from 0.9 at Fitness 0 down to 0.6 at Fitness 5 and 0.43 at Fitness 10;
- 0.7 normally, 1.0 if Asthmatic;
- x1.5 while sneaking;
- x2 when Hyperthermia is at its worst level;
- the Heavy Load factor: x1.5, x1.9, x2.3 or x2.8 for levels 1 to 4.

At Fitness 5 with nothing heavy, running from full to empty takes about 10 real minutes and sprinting about 68 real seconds. Dragging a corpse costs the same as sprinting. Swinging weapons costs endurance too, by weapon; that is a combat question for another page.

The Endurance moodle appears below 0.75 endurance and worsens below 0.5, 0.25 and 0.1.

> **Proof:** Code. `zombie.characters.IsoPlayer#updateEndurance` (`runningEnduranceReduce`, `sprintingEnduranceReduce` also for corpse dragging, `enddelta` 1.4 / 2.9 / 0.8 then x2.3, x0.5, `getPacingMod()`, `getHyperthermiaMod()`, asthma 1.0 vs 0.7, sneak 1.5, weight factor); `zombie.characters.IsoGameCharacter#getPacingMod`; `RunningEnduranceReduce` and `SprintingEnduranceReduce` in `media/lua/shared/defines.lua`; `zombie.characters.Moodles.MoodleStat` (`ENDURANCE` 0.75, 0.5, 0.25, 0.1). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Fatigue while awake

Fatigue goes from 0 (fully rested) to 1. Every in-game hour awake adds:

**0.124 x max(0.3, 1 - endurance) x Stats Decrease x trait factor x temperature factor, divided by 1.5 while sitting or resting**

| Endurance | Fatigue per in-game hour | Hours from 0 to Tired (0.6) |
|---|---|---|
| Full (1.0) | 0.037 | about 16 |
| Half (0.5) | 0.062 | about 10 |
| Empty (0) | 0.124 | under 5 |

- **Traits:** Needs Less Sleep x0.7, Needs More Sleep x1.3.
- **Temperature:** being too hot or too cold raises the factor above 1, more the further off you are.
- **Sandbox Stats Decrease:** Very Fast x2.0, Fast x1.6, Normal x1.0 (default), Slow x0.8, Very Slow x0.65. It also speeds up hunger and thirst.
- **Moodle:** Tired starts above 0.6, then worsens above 0.7, 0.8 and 0.9.

Unlike endurance, this rate is set per in-game hour, so a longer day does not make you tire more slowly per day.

> **Proof:** Code. `zombie.characters.IsoGameCharacter#updateStats_Awake` (`fatigueIncrease * getStatsDecreaseMultiplier() * max(0.3, 1 - endurance) * getMultiplier() * getDeltaMinutesPerDay() * trait * getFatiqueMultiplier()`, divided by 1.5 when sitting or resting); `FatigueIncrease = 0.0000345` in `media/lua/shared/defines.lua`; `zombie.characters.BodyDamage.Thermoregulator#updateBodyMultipliers` (fatigue multiplier rises with the heat or cold totals); `zombie.SandboxOptions#getStatsDecreaseMultiplier`; `zombie.characters.Moodles.MoodleStat` (`TIRED` 0.6, 0.7, 0.8, 0.9). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Sleep

### How long you will sleep

When you lie down, the game picks your sleep length in in-game hours:

1. A random whole number from 10 x fatigue up to (but not including) 13 x fatigue, rounded down, **plus 1**. At fatigue 0.75 that is 7 or 8, so 8 or 9 hours.
2. Good bed: 1 hour less. Bad bed (a car seat counts as one): 1 hour more. Floor: x0.7.
3. Insomniac x0.5, Needs Less Sleep x0.75, Needs More Sleep x1.18.
4. Never less than 3 hours or more than 16.

You also wake up after 16 hours asleep no matter what. You cannot lie down while zombies are visible or chasing you. You also cannot while panicked, or while in pain (Pain moodle level 2 or more) at fatigue 0.85 or below, unless a strong dose of sleeping pills is working.

> **Proof:** Code. `media/lua/client/ISUI/ISWorldObjectContextMenu.lua`, `ISWorldObjectContextMenu.onSleepWalkToComplete` (`ZombRand(fatigue * 10, fatigue * 13) + 1`, bed and trait adjustments, clamp 3 to 16, the zombie check, and the panic and pain checks skipped when `getSleepingTabletEffect()` is 2000 or more) and `getBedQuality` (vehicle seat is `badBed`, no bed is `floor`, a pillow in hand or nearby adds `Pillow`); `zombie.Lua.LuaManager$GlobalObject#ZombRand` (integer range, top excluded); `zombie.characters.IsoPlayer#processWakingUp` (wake after `getAsleepTime() > 16`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### Falling asleep

Fatigue only starts dropping once you have really fallen asleep. That delay is random, up to:

- 0.3 in-game hours normally, 1 hour if Insomniac;
- plus 1 hour and 0.2 per pain level if you are in pain;
- x1.2 if stressed;
- x1.3 bad bed, x1.25 bad bed with pillow, x0.8 good bed, x0.6 good bed with pillow, x1.6 floor, x1.45 floor with pillow;
- x0.5 for a Night Owl;
- 0.1 hours flat on sleeping pills;
- never more than 2 hours.

> **Proof:** Code. `zombie.ai.sadisticAIDirector.SleepingEvent#doDelayToSleep` (`Rand.Next(0.0F, delay)`, the modifiers above, cap 2.0); `zombie.characters.IsoPlayer#updateStats_Sleeping` (fatigue only drops once `timeOfSleep > delayToActuallySleep`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

### How fast sleep clears fatigue

While you are really asleep, every in-game hour removes:

- **0.14 fatigue per hour while fatigue is above 0.3** (0.7 spread over 5 hours);
- **0.043 per hour at 0.3 or below** (0.3 spread over 7 hours);

each multiplied by the bed and trait factors:

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

Insomniac x0.5, Night Owl x1.4. Needs Less Sleep shortens both stages to 0.75 of their length (3.75 and 5.25 hours), Needs More Sleep stretches them to 1.18 (5.9 and 8.26 hours).

So from completely exhausted (1.0) to fully rested in an average bed takes **12 in-game hours**; from just Tired (0.6) it takes about 9.

> **Proof:** Code. `zombie.characters.IsoPlayer#updateStats_Sleeping` (`elapsedHours / hoursNeeded * 0.3` with 7 hours at 0.3 or below, `* 0.7` with 5 hours above; `bedQualityMultiplier` table; INSOMNIAC 0.5, NIGHT_OWL 1.4; NEEDS_LESS_SLEEP 0.75, NEEDS_MORE_SLEEP 1.18 on the hours). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Multiplayer

Two server options decide whether fatigue exists at all: **Sleep Allowed** and **Sleep Needed**, both off by default. While either is off, the server resets every player's fatigue to zero on each update, so nobody gets tired. Endurance works as described above, worked out by the server.

> **Proof:** Code. `zombie.network.ServerOptions` (`SleepAllowed` false, `SleepNeeded` false); `zombie.characters.IsoGameCharacter#calculateStats` (on the server, `stats.reset(CharacterStat.FATIGUE)` when either is off); `zombie.characters.IsoPlayer#updateEndurance` (skipped on clients). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [Weight, encumbrance and strength](/pz/build-42/gameplay/the-real-numbers/weight-encumbrance-and-strength): what Heavy Load does to your endurance.
- [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level): Fitness XP, which raises your recovery factor.
