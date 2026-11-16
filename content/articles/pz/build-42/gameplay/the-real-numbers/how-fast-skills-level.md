---
id: build-42-how-fast-skills-level
slug: how-fast-skills-level
title: 'How fast skills level: XP, multipliers and how they stack'
game: pz
version: build-42
section: gameplay
category: the-real-numbers
difficulty: beginner
tags:
  - skills
  - xp
  - skill-books
  - traits
  - sandbox
excerpt: >-
  A normal skill needs 32,775 XP to reach level 10, Strength and Fitness 487,500. Your starting level, learner trait, skill book and sandbox multiplier all multiply every gain (42.22).
last_updated: '2026-11-15'
related_articles:
  - weight-encumbrance-and-strength
  - fatigue-sleep-and-endurance
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Outcast, you have stared at a skill bar that will not move and wondered what the game is doing. Every XP gain goes through the same short chain of multipliers, and you can read each one.

:::callout[The 1-minute version]{kind=key}
- A normal skill needs 32,775 XP to go from level 0 to level 10. Level 1 costs 75 XP, and level 10 alone costs 9,000.
- Strength and Fitness need 487,500 XP, about 15 times as much.
- Almost every gain is multiplied, and the multipliers multiply together: your starting level in that skill (x0.25 if you started at 0), Fast Learner or Slow Learner, a skill book you are reading, and the sandbox multiplier (x1.0 by default).
- A skill you did not start with learns at a quarter of the speed for the whole game, not only until level 1. Strength, Fitness and Running are exempt.
- You get no XP while asleep, and XP cannot go below 0 or above the level 10 total.
:::

:::facts
- **Normal skill to level 10** 32,775 XP
- **Strength or Fitness to level 10** 487,500 XP
- **Started at 0 / 1 / 2 / 3+ levels** x0.25 / x1.0 / x1.33 / x1.66
- **Skill book, volumes 1 to 5** up to x3 / x5 / x8 / x12 / x16 (x1.5 / x2.5 / x4 / x6 / x8 for Aiming, Reloading and Long Blade)
- **Strength or Fitness grace per training gain** about 50 game hours, which is about 3 hours 8 minutes of real time
- **Conversion** one game day is 1.5 real hours at the default day length, so one game hour is 3.75 real minutes
:::

:::flow[What happens to an XP gain]
- A skill action pays its base XP
- Starting-level factor
- Learner and other traits
- Skill book multiplier
- Sandbox multiplier
- Clamped between 0 and the level 10 total
:::

## 1. How much XP each level needs

Each skill stores ten level costs, and the game multiplies every one by 1.5 when it loads.

The base table for most skills is 50, 100, 200, 500, 1,000, 2,000, 3,000, 4,000, 5,000 and 6,000, and for Fitness and Strength it is 1,000 to 100,000. :cite[(`zombie/characters/skills/PerkFactory.java:105-106`, `zombie/characters/skills/PerkFactory.java:136-139`)] Each entry is multiplied by 1.5 and cut down to a whole number as the skill is added. :cite[(`zombie/characters/skills/PerkFactory.java:87-96`)] The total for a level is the sum of the costs up to it. :cite[(`zombie/characters/skills/PerkFactory.java:314-325`)]

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Normal skill, this level | 75 | 150 | 300 | 750 | 1,500 | 3,000 | 4,500 | 6,000 | 7,500 | 9,000 |
| Normal skill, total | 75 | 225 | 525 | 1,275 | 2,775 | 5,775 | 10,275 | 16,275 | 23,775 | 32,775 |
| Strength or Fitness, this level | 1,500 | 3,000 | 6,000 | 9,000 | 18,000 | 30,000 | 60,000 | 90,000 | 120,000 | 150,000 |
| Strength or Fitness, total | 1,500 | 4,500 | 10,500 | 19,500 | 37,500 | 67,500 | 127,500 | 217,500 | 337,500 | 487,500 |

## 2. The chain of multipliers

When almost anything gives you XP, the game applies the factors below in this order and then checks the limits.

**XP you get = base XP x starting-level factor x learner trait x other traits x book multiplier x sandbox multiplier**

A character who is asleep gets nothing. :cite[(`zombie/characters/IsoGameCharacter.java:17784`)] The result is clamped so your total never drops below 0 or passes the level 10 total. :cite[(`zombie/characters/IsoGameCharacter.java:17807`, `zombie/characters/IsoGameCharacter.java:17877-17886`)]

### Starting-level factor

Your starting level is how many levels your profession and traits gave you in that skill when the character was made, counted up to 3. It does not change as you level up; it changes only if a trait that grants skill levels is added or removed later. :cite[(`zombie/characters/IsoGameCharacter.java:11533-11549`, `zombie/characters/IsoGameCharacter.java:17720-17727`)]

| Levels you started with | Factor |
|---|---|
| 0 | x0.25 |
| 1 | x1.0 |
| 2 | x1.33 |
| 3 or more | x1.66 |

:cite[(`zombie/characters/IsoGameCharacter.java:17810-17832`, `zombie/characters/IsoGameCharacter.java:11589-11599`)] A skill with no entry at all is treated as a start at 0. :cite[(`zombie/characters/IsoGameCharacter.java:17829-17832`)]

- **Running** (the game calls it Sprinting) never gets the x0.25 penalty, and one starting level gives x1.25 instead of x1.0. :cite[(`zombie/characters/IsoGameCharacter.java:17816-17820`, `zombie/characters/IsoGameCharacter.java:17951-17957`)]
- **Strength and Fitness** ignore the table: always x1.0. Every character starts both at 5, plus or minus what its traits and profession give. :cite[(`zombie/characters/IsoGameCharacter.java:11554-11555`, `zombie/characters/IsoGameCharacter.java:17959-17961`)]

### Traits

| Trait | Effect | Does not apply to |
|---|---|---|
| Fast Learner | x1.3 | Strength, Fitness |
| Slow Learner | x0.7 | Strength, Fitness, Running |
| Pacifist | x0.75 on Axe, Long Blade, Short Blade, Short Blunt, Long Blunt, Spear and Aiming | every other skill |
| Crafty | x1.3 on every skill under Crafting | every other skill |

:cite[(`zombie/characters/IsoGameCharacter.java:17834-17859`, `zombie/characters/skills/PerkFactory.java:116-133`)] Crafting holds Carpentry, Carving, Cooking, Electrical and the other craft skills. The parent of each skill is set where the skills are created. :cite[(`zombie/characters/skills/PerkFactory.java:116-133`)]

### Skill books

Reading a skill book sets a multiplier for that one skill, and it grows in 10% steps as you read.

Each tenth of the book gives a tenth of the maximum, and the result counts only once it is above x1. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:103-118`, `zombie/characters/IsoGameCharacter.java:17862-17865`)] The maximum comes from the volume. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:485-505`)]

| Volume | Levels it covers | Boost lasts while you are | Maximum | Aiming, Reloading, Long Blade |
|---|---|---|---|---|
| 1 | 1-2 | level 0 and 1 | x3 | x1.5 |
| 2 | 3-4 | level 2 and 3 | x5 | x2.5 |
| 3 | 5-6 | level 4 and 5 | x8 | x4 |
| 4 | 7-8 | level 6 and 7 | x12 | x6 |
| 5 | 9-10 | level 8 and 9 | x16 | x8 |

:cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:164-188`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-12`)] The skills with books in vanilla are the craft and survival skills, Maintenance, Aiming, Reloading and Long Blade. :cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-198`)]

The boost ends the moment your XP leaves the book's range, which is when you reach its top level. :cite[(`zombie/characters/IsoGameCharacter.java:17888-17894`, `zombie/inventory/types/Literature.java:447-449`)] You get nothing from a book whose first level is more than one above yours, and a book whose top level you already reached is too easy. Illiterate characters cannot use skill books, and one skill holds one book multiplier at a time. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:39`, `media/lua/shared/TimedActions/ISReadABook.lua:50`, `media/lua/shared/TimedActions/ISReadABook.lua:83`, `media/lua/shared/TimedActions/ISReadABook.lua:129`)]

### The sandbox multiplier

The sandbox page "XP Multipliers" has a Global Multiplier (default 1.0, range 0 to 1000) and Use Global Multiplier (default on).

While Use Global Multiplier is enabled, every skill, Strength and Fitness included, uses the global number. Turn it off and each skill uses its own multiplier, all 1.0 by default. :cite[(`zombie/characters/IsoGameCharacter.java:17867-17873`, `zombie/SandboxOptions.java:1841-1844`, `media/lua/shared/Sandbox/Apocalypse.lua:242-246`, `media/lua/shared/Translate/EN/Sandbox.json:371-375`)]

The translation files still hold an "XP Multiplier Affects Passive Skills" text. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:360-361`)] A search of the 42.22 Java found no option by that name, so the line is left over. :cite[(`zombie/SandboxOptions.java:1799-1845`)]

## 3. A worked example

Sawing logs gives 5 Carpentry XP, and the same chain turns that into very different times to the next level.

The recipe pays its XP through the normal XP call, with the multipliers applied. :cite[(`media/scripts/generated/recipes/recipes_carpentry.txt:3-9`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1469-1485`)]

| Who saws | Sum | XP per saw | Saws needed |
|---|---|---|---|
| Started at Carpentry 0 | 5 x 0.25 | 1.25 | 60 to reach level 1 |
| Same, Volume 1 read to the end | 5 x 0.25 x 3 | 3.75 | 20 to reach level 1 |
| Same, plus Fast Learner | 5 x 0.25 x 1.3 x 3 | 4.875 | 16 to reach level 1 |
| Started with 3 levels of Carpentry | 5 x 1.66 | 8.3 | 91 to go from level 3 to level 4 |

The counts are our own arithmetic on 75 XP for level 1 and 750 XP between level 3 and level 4, rounded up.

## 4. What common actions pay

Each action sets its own base XP, so there is no single table, and these amounts are before the multipliers above.

- **Melee hit:** `damage x 0.9` (at most 3) to the weapon's skill, 1 Fitness if your endurance is above half, and Strength XP equal to how many targets that swing hit. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:50-107`, `zombie/characters/Stats.java:166-168`)]
- **Firearm hit:** the hit count in Aiming, times 2.7 while Aiming is below level 5. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:80-86`)]
- **Running or sprinting** above half endurance: at most once per real second, a 1 in 20 chance of 1 Fitness XP, and a separate 1 in 20 chance of 1 Running XP. The check uses the wall clock, so speeding up the game does not speed it up. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:10-24`, `zombie/characters/IsoPlayer.java:8980-8990`)]
- **Carrying more than half your weight limit while moving:** at most once per real second, a 1 in 20 chance of 2 Strength XP. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:33-37`)]
- **Aiming while moving on foot:** the same check for 1 Nimble XP. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:29-31`)]
- **Chopping a tree** with anything but bare hands: 2 Strength XP per hit. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:43-47`)]
- **TV, radio and tapes:** 50 XP for each skill point a broadcast line carries, only while the skill is below the sandbox "Maximum Media XP Level" (default 3). Almost every line in the recorded media carries 1; a few Aiming and Reloading lines carry 2. :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:4-21`, `media/lua/shared/Sandbox/Apocalypse.lua:153`, `media/lua/shared/Translate/EN/Sandbox.json:947-948`, `media/lua/shared/RecordedMedia/recorded_media.lua:9919`)]
- **Crafting:** whatever the recipe's `xpAward` says. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:1469-1485`)]
- **Barricading** pays flat XP that skips every multiplier: 3 Carpentry per plank, 6 Welding per metal sheet or set of metal bars. Taking a plank off pays a flat 2 Carpentry, plus 2 Strength that is multiplied as usual. :cite[(`media/lua/shared/TimedActions/ISBarricadeAction.lua:129`, `media/lua/shared/TimedActions/ISBarricadeAction.lua:141`, `media/lua/shared/TimedActions/ISBarricadeAction.lua:161`, `media/lua/shared/TimedActions/ISUnbarricadeAction.lua:143-144`)]

Strength XP is multiplied by 1.5 while your protein is between 50 and 300, and by 0.7 when it is below -300. :cite[(`zombie/characters/IsoGameCharacter.java:17796-17804`)] Fitness XP stops at Fitness 6 and up while you are Emaciated, Obese or Very Underweight, and at Fitness 9 and up while Overweight too. :cite[(`zombie/characters/BodyDamage/Nutrition.java:249-267`, `zombie/characters/IsoGameCharacter.java:17795`)]

## 5. Losing Strength and Fitness

If you stop training Strength or Fitness for a long time, each one slowly loses XP, and a long enough gap can cost levels.

Each XP gain in the skill moves a timer back by 3,000, down to -50,000, and the timer climbs by 10 every ten game minutes. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:170-187`, `media/lua/server/XpSystem/XpUpdate.lua:298`, `media/lua/server/XpSystem/XpUpdate.lua:318`, `zombie/Lua/LuaManager.java:11826-11839`)] So one gain buys about 50 game hours of grace (3 hours 8 minutes of real time), and a full bank lasts about 48 game days (about 73 real hours).

Above 20,000 you lose 1 XP each time the timer passes another multiple of 1,200, which is about every 20 game hours (75 real minutes), and the timer resets to 0 above 31,000, after which about 14 game days (21 real hours) pass before losses start again. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:293-325`, `zombie/Lua/LuaManager.java:11819-11824`)] Those are our own sums on the code's numbers. With 1,500 XP or more per level, you will rarely notice.

## 6. Multiplayer

The sums are the same, but the server does them. When vanilla Lua awards XP on a multiplayer client, the call does nothing; on the server it runs the full formula with the server's sandbox settings. :cite[(`zombie/Lua/LuaManager.java:11856-11867`, `zombie/network/GameServer.java:1892-1902`)] Skill book multipliers follow the same split. :cite[(`zombie/Lua/LuaManager.java:11869-11878`, `zombie/network/GameServer.java:1904-1907`)] A mod that hands out XP has to do it on the server.

## Where to go next

- [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers): the modder's view of the same system.
- [The XP-grant and skill-query Lua API](/pz/build-42/modding/skills-and-traits/the-xp-grant-skill-query-lua-api): if you want to award XP from a mod.
- [Weight, encumbrance and strength](/pz/build-42/gameplay/the-real-numbers/weight-encumbrance-and-strength): what Strength levels buy you.
- [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance): what Fitness does for your stamina.

:::callout[How we know]{kind=proof}
Every rule above is read from the 42.22 Java and Lua. The worked example, the real-time figures and the grace-period sums are our own arithmetic on those numbers; we did not time them in a running game.

Not tested: the recorded-media XP counts come from a count of the skill codes in the lua file, not from watching broadcasts. We also did not check mods that change the XP rules.
:::
