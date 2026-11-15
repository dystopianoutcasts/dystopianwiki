---
id: build-42-stats-and-moodles-reference
slug: stats-and-moodles-reference
title: 'Stats and moodles: the reference tables'
game: pz
version: build-42
section: engine
category: character-stats
difficulty: advanced
tags:
  - engine
  - stats
  - moodles
  - reference
excerpt: >-
  Look-up tables for every character stat (range, default, what updates it) and every moodle (each level, its threshold and its effects), for readers who want the exact number.
last_updated: '2026-11-14'
related_articles:
  - how-character-stats-work
  - hunger-thirst-and-nutrition
  - stress-panic-boredom-and-unhappiness
  - sickness-pain-and-other-stats
  - how-moodles-work
  - modding-stats-and-moodles
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [stat look-up](#every-character-stat) | [moodle look-up](#every-moodle) | [constants](#per-frame-stat-constants)

:::callout[The 1-minute version]{kind=key}
- This page is look-up tables only. For the story behind each number, read [How character stats work](/pz/build-42/engine/character-stats/how-character-stats-work) and [How moodles work](/pz/build-42/engine/character-stats/how-moodles-work).
- The stat table lists the stats in bit order, which is also the save order and the sync mask order. Bit number is the position in the list, starting at 0.
- Unless stated, a moodle value must be above its threshold. Endurance falls below its thresholds, and Uncomfortable uses "at or above" at every level; Heavy Load does from level 2 (level 1 is strictly above).
- Some levels are not reachable in 42.22: Hyperthermia 3 and 4, and Windchill 1 as a final level.
- "Per game hour" figures are the constant times 3600; "per real second" figures are the constant times 48, at normal game speed.
:::

:::facts
- **Stats** 24, bits 0 to 23
- **Moodle types** 26
- **Levels** 0 to 4
- **Chevron count** clamped to 0 to 3
- **Icon sizes** 32, 48, 64, 80, 96, 128 pixels
:::

Citations are paths inside the capture's `src/` (Java) or `game_snapshot/` (Lua and translations).

## Every character stat

The table gives each stat's bit, field, range, default and what updates it.

Field names are the constants on `CharacterStat` (also the Lua name, `CharacterStat.HUNGER`). All are defined in `zombie/characters/CharacterStat.java`, lines 18 to 41, in the order of `ORDERED_STATS` (line 42), which is also the bit order for stat sync packets and the save order. Bit number is the position in that list, starting at 0.

| Bit | Field | Id | Range | Default | What updates it | Code |
|---|---|---|---|---|---|---|
| 0 | `ANGER` | Anger | 0 to 1 | 0 | Only lowered, -0.36 per game hour. Nothing raises it | :cite[(`IsoGameCharacter.java:10370-10371`)] |
| 1 | `BOREDOM` | Boredom | 0 to 100 | 0 | `BodyDamage.UpdateBoredom`; food, books; petting | :cite[(`BodyDamage.java:1915-1967`; `:608`, `:714`; `IsoPlayer.java:8817`)] |
| 2 | `DISCOMFORT` | Discomfort | 0 to 100 | 0 | `BodyDamage.UpdateDiscomfort` | :cite[(`BodyDamage.java:3187-3237`)] |
| 3 | `ENDURANCE` | Endurance | 0 to 1 | 1 | `IsoPlayer.updateEndurance` and sleeping; fitness; food. See the fatigue page | :cite[(`IsoPlayer.java:3065-3081`; `Fitness.java:191`; `IsoGameCharacter.java:5767`)] |
| 4 | `FATIGUE` | Fatigue | 0 to 1 | 0 | Awake; asleep; reset on a server with sleep off | :cite[(`IsoGameCharacter.java:10125-10127`, `:10156-10191`; `IsoPlayer.java:3082-3128`)] |
| 5 | `FITNESS` | Fitness | -1 to 1 | 0 | Set each frame to Fitness skill / 5 - 1 | :cite[(`IsoGameCharacter.java:10296-10298`, `:4859`)] |
| 6 | `FOOD_SICKNESS` | FoodSickness | 0 to 100 | 0 | Grows with poison and corpses; drains when poison is 0; food | :cite[(`BodyDamage.java:2268-2272`; `:2502`; `:2510-2512`; `IsoGameCharacter.java:5787-5790`)] |
| 7 | `HUNGER` | Hunger | 0 to 1 | 0 | `IsoGameCharacter.updateStats_Awake`, `IsoPlayer.updateStats_Sleeping`; eating | :cite[(`:10192-10247`; `IsoPlayer.java:3131-3159`; `IsoGameCharacter.java:5766`, `:5897`)] |
| 8 | `IDLENESS` | Idleness | 0 to 1 | 0 |  | :cite[(`IsoGameCharacter.java:10249-10283`)] |
| 9 | `INTOXICATION` | Intoxication | 0 to 100 | 0 | Raised by alcohol; lowered 0.0042 per frame unit | :cite[(`BodyDamage.java:472-510`; `:2191`)] |
| 10 | `MORALE` | Morale | 0 to 1 | 1 | `IsoGameCharacter.updateMorale` only adds, so it stays at 1 | :cite[(`:10286-10294`)] |
| 11 | `NICOTINE_WITHDRAWAL` | NicotineWithdrawal | 0 to 0.51 | 0 | Smokers; cleared by smoking | :cite[(`BodyDamage.java:1992-2006`; `RecipeCodeOnEat.java:34-36`)] |
| 12 | `PAIN` | Pain | 0 to 100 | 0 | Poison; pills | :cite[(`BodyDamage.java:2341-2363`, `:2436-2438`; `:570`, `:583`; `:512-552`)] |
| 13 | `PANIC` | Panic | 0 to 100 | 0 | Phobias and bleeding; beta blockers; Lua actions | :cite[(`BodyDamage.java:358-470`; `IsoGameCharacter.java:9098-9119`; `:9131-9133`)] |
| 14 | `POISON` | Poison | 0 to 100 | 0 | Poisoned, tainted, raw, spoiled food; fluids; drains 0.001 per frame unit | :cite[(`BodyDamage.java:554-703`; `IsoGameCharacter.java:5932`; `BodyDamage.java:2266-2267`)] |
| 15 | `SANITY` | Sanity | 0 to 1 | 1 | Lowered by Panic 2 to 4 and Tired 4. Nothing reads it | :cite[(`IsoGameCharacter.java:9158-9173`)] |
| 16 | `SICKNESS` | Sickness | 0 to 1 | 0 | No writer in the engine. Read by the Sick moodle, thermoregulator, foraging | :cite[(`Moodle.java:192-193`; `Thermoregulator.java:685-687`)] |
| 17 | `STRESS` | Stress | 0 to 1 | 0 | Kills; food | :cite[(`IsoGameCharacter.java:10158`, `:10319-10372`; `BodyDamage.java:3239-3252`; `CombatManager.java:1227`)] |
| 18 | `TEMPERATURE` | Temperature | 20 to 40 | 37 | Thermoregulator core | :cite[(`Thermoregulator.java:863-868`)] |
| 19 | `THIRST` | Thirst | 0 to 1 | 0 | `IsoGameCharacter.updateThirst`; drinking | :cite[(`:10382-10423`; `:5765`, `:5896`)] |
| 20 | `UNHAPPINESS` | Unhappiness | 0 to 100 | 0 | Food and books; antidepressants | :cite[(`BodyDamage.java:1969-1990`; `IsoGameCharacter.java:9138-9145`)] |
| 21 | `WETNESS` | Wetness | 0 to 100 | 0 | Merged each frame from body-part wetness | :cite[(`BodyDamage.java:793-811`)] |
| 22 | `ZOMBIE_FEVER` | ZombieFever | 0 to 100 | 0 | Fake infection | :cite[(`BodyDamage.java:2184-2189`, `:2413-2434`)] |
| 23 | `ZOMBIE_INFECTION` | ZombieInfection | 0 to 100 | 0 | Real infection clock | :cite[(`BodyDamage.java:2365-2394`)] |

Not in the stat table but saved with the player: calories (-2,200 to 3,700, start 800), carbohydrates, proteins and lipids (-500 to 1,000, start 0) and weight (35 and up, start 80 kg) in `Nutrition` :cite[(`Nutrition.java:58-62`, `:269-346`)].

Per-frame extras held on `Stats` that are not saved: visible and chasing zombie counts for panic and music, the "tripping" flag and angle, `lastEndurance`, and the endurance warning levels 0.5 and 0.25 :cite[(`Stats.java:15-37`)].

## Per-frame stat constants

These constants live in one Lua file, and the last column gives each one's line in it.

They are defined in `media/lua/shared/defines.lua` and loaded into the game at startup :cite[(`ZomboidGlobals.java:57-95`)].

| Name | Value | Used by |
|---|---|---|
| `HungerIncrease` | 0.0000096 | hunger (line 14) |
| `HungerIncreaseWhenExercise` | 0.0000192 | hunger while running or swinging (16) |
| `HungerIncreaseWhileAsleep` | 0.000001 | hunger asleep (17) |
| `HungerIncreaseWhenWellFed` | 0 | hunger when Well Fed (15) |
| `ThirstIncrease` | 0.000008 | thirst awake (9) |
| `ThirstSleepingIncrease` | 0.000001 | thirst asleep (10) |
| `FatigueIncrease` | 0.0000345 | fatigue awake (19) |
| `StressDecrease` | 0.00003 | stress awake (21) |
| `BoredomIncrease`, `BoredomDecrease` | 0.001, 0.0385 | boredom (23-24) |
| `UnhappinessIncrease` | 0.0005 | unhappiness (25) |
| `StressFromSoundsMultiplier` | 0.00002 | noise stress (27) |
| `StressFromBiteOrScratch` | 0.00005 | bites, scratches, infection (28) |
| `StressFromHemophobic`, `StressFromDiscomfort` | 0.0000003333, 0.00000013 | (29-30) |
| `AngerDecrease` | 0.0001 | anger (32) |
| `PoisonLevelDecrease`, `FoodSicknessDecrease` | 0.001, 0.0015 | poison and food sickness (42, 44) |
| `IdleIncrease`, `IdleDecrease` | 0.0005, 0.006 | idleness (55-56) |
| `WetnessIncrease`, `WetnessDecrease`, `CatchAColdIncreaseRate`, `CatchAColdDecreaseRate` | 0.015, 0.01, 0.003, 0.175 | wetness and cold (37-40) |

## Every moodle

Each moodle below lists its value, its rule, its level thresholds and its effects.

Translation names are in `media/lua/shared/Translate/EN/Moodles.json`. The key for a level name is `Moodles_<Name>_lvl<N>`; the key for its description is `Moodles_<Name>_desc_lvl<N>` :cite[(`zombie/characters/Moodles/Moodles.java:80`, `:91`)]. The tables list the name key; the description key follows the pattern.

`<Name>` is the type's translation name :cite[(`MoodleType.java:55-57`)]. "Lines" are the five numbers in `MoodleStat` :cite[(`MoodleStat.java:16-35`)]; "Rule" is the code in `Moodle.Update` (`Moodle.java`).

Unless stated, a value must be **above** the threshold, and the level is not worked out while the character has no health :cite[(`Moodle.java:134`, `:153`)].

Moodles are "bad" (type 2) except Food Eaten, "good" (1) :cite[(`Moodles.java:95-97`)].

### Endurance (`Moodles_Endurance`)

Value: the `ENDURANCE` stat; **falls below** each threshold :cite[(`Moodle.java:106-119`; `MoodleStat.java:16`; `Moodles.json:2-5`, `:88-91`)].

| Level | Name | Endurance at or below |
|---|---|---|
| 1 | Out of Breath | 0.75 |
| 2 | High Exertion | 0.5 |
| 3 | Excessive Exertion | 0.25 |
| 4 | Exhausted | 0.1 |

Effects: level 2 or more stops sprinting :cite[(`IsoGameCharacter.java:13551`)]; level 3 or more stops running :cite[(`:13525`)]; walk speed x0.95, x0.9, x0.8, x0.6 :cite[(`IsoPlayer.java:1048-1060`)]; base speed -0.15 and melee speed -0.07 per level :cite[(`IsoGameCharacter.java:9710`, `:9808`)]; idle speed +0.25 per level :cite[(`:9703`)]; defend chance -2 per level :cite[(`:13651`)]; climbing chance -5 per level :cite[(`:16709`)]; fall chance +3 per level :cite[(`:14188`)]; ranged to-hit penalty :cite[(`CombatManager.java:2606`)]. See [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance).

### Heavy Load (`Moodles_HeavyLoad`)

Value: carried weight / carry limit. Level 1 is strictly above; 2 to 4 are "at or above" :cite[(`Moodle.java:381-396`; `MoodleStat.java:35`; `Moodles.json:6-9`, `:148-151`)].

| Level | Name | Ratio |
|---|---|---|
| 1 | Weighed Down | above 1.0 |
| 2 | Overloaded | 1.25 or more |
| 3 | Very Overloaded | 1.5 or more |
| 4 | Extremely Overloaded | 1.75 or more |

Effects: base speed -0.15 and melee speed -0.07 per level :cite[(`IsoGameCharacter.java:9711`, `:9809`)]; extra path-speed slowdown by the over-limit ratio :cite[(`IsoPlayer.java:1066-1070`)]; fall chance +5, climb -8 per level :cite[(`IsoGameCharacter.java:14189`, `:16711`)], and the fence climb adds 13 per level :cite[(`ClimbOverFenceState.java:526`)]; vehicle discomfort +0.25 per level :cite[(`:15674`; `defines.lua:58`)]; at level 3 or 4, while moving and above 75 health, health damage and back strain :cite[(`BodyDamage.java:2301-2314`)]; exercise endurance cost x2 at level 3 and 4 (integer division) :cite[(`Fitness.java:189`)]. See [Weight, encumbrance and strength](/pz/build-42/gameplay/the-real-numbers/weight-encumbrance-and-strength).

### Angry (`Moodles_Angry`)

Value: `ANGER` :cite[(`Moodle.java:121-132`; `MoodleStat.java:17`; `Moodles.json:10-13`, `:92-95`)].

| Level | Name | Anger above |
|---|---|---|
| 1 | Irritated | 0.1 |
| 2 | Annoyed | 0.25 |
| 3 | Angry | 0.5 |
| 4 | Furious | 0.75 |

Effects: none found in Java or Lua apart from the sound parameter. Nothing raises Anger, so it does not appear without a mod.

### Stress (`Moodles_Stress`)

Value: `STRESS` + `NICOTINE_WITHDRAWAL`, capped at 1 :cite[(`Stats.java:133-136`; `Moodle.java:249-260`; `MoodleStat.java:24`; `Moodles.json:14-17`, `:96-99`)].

| Level | Name | Effective stress above |
|---|---|---|
| 1 | Tense | 0.25 |
| 2 | Agitated | 0.5 |
| 3 | Stressed Out | 0.75 |
| 4 | At Breaking Point | 0.9 |

Effects: from level 2, melee damage -0.1 per level :cite[(`CombatManager.java:873-875`)] and unhappiness growth :cite[(`BodyDamage.java:1979-1990`)]; ranged to-hit penalty :cite[(`CombatManager.java:2600-2604`)]; sleep delay x1.2 and sleeping-event chance +10 per level :cite[(`SleepingEvent.java:170-172`, `:217`)].

### Thirst (`Moodles_Thirst`)

Value: `THIRST` :cite[(`Moodle.java:262-278`; `MoodleStat.java:25`; `Moodles.json:18-21`, `:100-103`)].

| Level | Name | Thirst above |
|---|---|---|
| 1 | Slightly Thirsty | 0.12 |
| 2 | Thirsty | 0.25 |
| 3 | Parched | 0.7 |
| 4 | Dying of Thirst | 0.84 |

Effects: carry limit -1 (level 2), -2 (levels 3 and 4) :cite[(`BodyDamage.java:2025-2035`)]; healing reduced at level 2, more at 3, none at 4 :cite[(`:2198-2231`)]; at level 4 health damage of a tenth of the severe rate :cite[(`:2296-2299`)] and no healing while asleep :cite[(`:2240-2243`)]; a cold cannot clear above 0.25 :cite[(`:951-952`)].

### Tired (`Moodles_Tired`)

Value: `FATIGUE` :cite[(`Moodle.java:134-151`; `MoodleStat.java:18`; `Moodles.json:22-25`, `:104-107`)].

| Level | Name | Fatigue above |
|---|---|---|
| 1 | Drowsy | 0.6 |
| 2 | Tired | 0.7 |
| 3 | Very Tired | 0.8 |
| 4 | Ridiculously Tired | 0.9 |

Effects: ranged to-hit penalty :cite[(`CombatManager.java:2605`)]; defend chance -3 per level :cite[(`IsoGameCharacter.java:13653`)]; Sanity loss at level 4 :cite[(`:9170-9173`)]; stiffness gained from fitness exercises x(1 + level / 3, integer division) :cite[(`Fitness.java:222`)]. Sleep length and recovery: [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance).

### Hungry (`Moodles_Hungry`)

Value: `HUNGER` :cite[(`Moodle.java:153-170`; `MoodleStat.java:19`; `Moodles.json:26-29`, `:108-111`)].

| Level | Name | Hunger above |
|---|---|---|
| 1 | Peckish | 0.15 |
| 2 | Hungry | 0.25 |
| 3 | Very Hungry | 0.45 |
| 4 | Starving to Death | 0.7 |

Effects: carry limit -1, -2, -2 for levels 2, 3, 4 :cite[(`BodyDamage.java:2013-2023`)]; healing reduced at level 2 and 3, none at 4 :cite[(`:2198-2231`)]; level 4 health damage of a fiftieth of the severe rate :cite[(`:2275-2278`)]; a cold cannot clear above 0.25 :cite[(`:951`)].

### Panic (`Moodles_Panic`)

Value: `PANIC` :cite[(`Moodle.java:172-189`; `MoodleStat.java:20`; `Moodles.json:30-33`, `:112-115`)].

| Level | Name | Panic above |
|---|---|---|
| 1 | Nervous | 6 |
| 2 | Alarmed | 30 |
| 3 | Frightened | 65 |
| 4 | Terrified | 80 |

Effects: no lying down from level 1 :cite[(`ISWorldObjectContextMenuLogic.java:4210`)]; quick get-up from level 2 :cite[(`PlayerGetUpState.java:49`)]; melee damage -0.1 per level from level 2 :cite[(`CombatManager.java:868-870`)]; ranged to-hit penalty :cite[(`:2595-2599`)]; Sanity loss levels 2 to 4 :cite[(`IsoGameCharacter.java:9159-9165`)]; view cone -0.2 at level 4 :cite[(`:17166-17167`)]; window-closing fumbles :cite[(`CloseWindowState.java:114`)]; Adrenaline Junkie speed bonus at level 3 or more :cite[(`IsoGameCharacter.java:9714-9717`)]; the music threat reads the level :cite[(`MusicThreatStatuses.java:74`)]. See [Stress, panic, boredom and unhappiness](/pz/build-42/engine/character-stats/stress-panic-boredom-and-unhappiness).

### Sick (`Moodles_Sick`)

Value: max(`FOOD_SICKNESS`, `ZOMBIE_FEVER`, `ZOMBIE_INFECTION`) / 100 + `SICKNESS` :cite[(`BodyDamage.java:1657-1660`; `Moodle.java:191-209`; `MoodleStat.java:21`; `Moodles.json:34-37`, `:116-119`)].

| Level | Name | Sick value above |
|---|---|---|
| 1 | Queasy | 0.25 |
| 2 | Nauseous | 0.5 |
| 3 | Sick | 0.75 |
| 4 | Fever | 0.9 |

Effects: carry limit -1, -2, -3 for levels 2, 3, 4 :cite[(`BodyDamage.java:2037-2047`)]; healing reduced at level 2 and 3 :cite[(`:2198-2209`)]; poison damage needs level 1 or more :cite[(`:2256`)]; level 4 health damage when food sickness exceeds infection :cite[(`:2280-2289`)]. See [Sickness, pain and other stats](/pz/build-42/engine/character-stats/sickness-pain-and-other-stats) and [How infection works](/pz/build-42/gameplay/the-real-numbers/how-infection-works).

### Bored (`Moodles_Bored`)

Value: `BOREDOM` :cite[(`Moodle.java:211-228`; `MoodleStat.java:22`; `Moodles.json:38-41`, `:120-123`)].

| Level | Name | Boredom above |
|---|---|---|
| 1 | Getting Bored | 25 |
| 2 | Bored | 50 |
| 3 | Very Bored | 75 |
| 4 | Extremely Bored | 90 |

Effects: from level 2, unhappiness grows 0.0005 x level per frame unit unless reading :cite[(`BodyDamage.java:1969-1977`)]; a sound parameter.

### Unhappy (`Moodles_Unhappy`)

Value: `UNHAPPINESS` :cite[(`Moodle.java:230-247`; `MoodleStat.java:23`; `Moodles.json:42-45`, `:124-127`)].

| Level | Name | Unhappiness above |
|---|---|---|
| 1 | Sad | 20 |
| 2 | Weepy | 45 |
| 3 | Miserable | 60 |
| 4 | Hopeless | 80 |

Effects: every timed action takes (1 + level / 4) times as long :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:102`)].

### Bleeding (`Moodles_Bleeding`)

Value: the number of bleeding body parts, 4 if the neck bleeds. There is no `MoodleStat` for it :cite[(`Moodle.java:280-289`; `Moodles.json:46-49`, `:128-131`)].

| Level | Name | Bleeding parts |
|---|---|---|
| 1 | Minor Bleeding | 1 |
| 2 | Bleeding | 2 |
| 3 | Severe Bleeding | 3 |
| 4 | Massive Blood Loss | 4 or more, or the neck |

Effects: carry limit -1 at levels 2, 3 and 4 :cite[(`BodyDamage.java:2049-2059`)]; level 4 health damage at the severe rate :cite[(`:2291-2294`)].

### Wet (`Moodles_Wet`)

Value: `WETNESS` :cite[(`Moodle.java:291-308`; `MoodleStat.java:27`; `Moodles.json:50-53`, `:132-135`)].

| Level | Name | Wetness above |
|---|---|---|
| 1 | Moist | 15 |
| 2 | Wet | 40 |
| 3 | Soaking | 70 |
| 4 | Drenched | 90 |

Effects: discomfort +0.1 per level :cite[(`BodyDamage.java:3211`)]; a cold cannot clear at any Wet level :cite[(`:948`)].

### Has a Cold (`Moodles_HasACold`)

Value: the cold strength (0 when you have no cold) :cite[(`BodyDamage.java:1034-1036`; `Moodle.java:310-326`; `MoodleStat.java:28`; `Moodles.json:54-57`, `:136-139`)].

| Level | Name | Cold strength above |
|---|---|---|
| 1 | Runny Nose | 20 |
| 2 | The Sniffles | 40 |
| 3 | Head Cold | 60 |
| 4 | Nasty Cold | 75 |

Effects: sneezing and coughing from level 2, with shorter timers at levels 3 and 4 :cite[(`BodyDamage.java:1007-1011`, `:847-869`)]; a smoker without a cold also coughs on its own timer :cite[(`:1013-1030`)].

### Injured (`Moodles_Injured`)

Value: 100 minus body health :cite[(`Moodle.java:328-344`; `MoodleStat.java:29`; `Moodles.json:58-61`, `:140-143`)].

| Level | Name | Missing health above |
|---|---|---|
| 1 | A Little Hurt | 20 |
| 2 | Injured | 40 |
| 3 | Severe Injuries | 60 |
| 4 | Critical Injuries | 75 |

Effects: carry limit -1, -2, -3 for levels 2, 3, 4 :cite[(`BodyDamage.java:2061-2071`)]; the combat code wiggles the icon on a hit :cite[(`CombatManager.java:834`)].

### Pain (`Moodles_Pain`)

Value: `PAIN`, checked only every 120th update :cite[(`Moodle.java:346-379`; `MoodleStat.java:26`; `Moodles.json:62-65`, `:144-147`)].

| Level | Name | Pain above |
|---|---|---|
| 1 | Minor Pain | 10 |
| 2 | Pain | 20 |
| 3 | Severe Pain | 50 |
| 4 | Agony | 75 |

Effects: no lying down from level 2 while fatigue is 0.85 or less :cite[(`ISWorldObjectContextMenuLogic.java:4207`)]; sleep delay +1 + 0.2 x level hours :cite[(`SleepingEvent.java:166-168`)]; climbing -5 per level :cite[(`IsoGameCharacter.java:16712`)]; pain voice on first reaching level 3 :cite[(`Moodle.java:372-378`)]; shown to other players via the body sync :cite[(`BodyDamageSync.java:140-154`)].

### Drunk (`Moodles_Drunk`)

Value: `INTOXICATION` :cite[(`Moodle.java:398-415`; `MoodleStat.java:30`; `Moodles.json:66-69`, `:152-155`)]. Level 4's name is a profanity in the English file; read the key.

| Level | Name | Intoxication above |
|---|---|---|
| 1 | Tipsy | 10 |
| 2 | Inebriated | 30 |
| 3 | Plastered | 50 |
| 4 | (see key `Moodles_Drunk_lvl4`) | 70 |

Effects: random movement and tripping from level 2 :cite[(`IsoPlayer.java:2975-2998`)]; drunk driving from level 2 :cite[(`CarController.java:137`)]; every timed action x(1 + level / 4) :cite[(`ISBaseTimedAction.lua:105`)]; ranged to-hit penalty :cite[(`CombatManager.java:2607-2611`)]; defend chance -2, fall chance +3, climb -8 per level; the Hypothermia moodle is held back :cite[(`Moodle.java:502-508`)]. See [Sickness, pain and other stats](/pz/build-42/engine/character-stats/sickness-pain-and-other-stats).

### Dead and Zombie (`Moodles_Dead`, `Moodles_Zombie`)

Only level 4 exists for both, and neither has a `MoodleStat` :cite[(`Moodle.java:417-429`; `Moodles.json:70-71`, `:156-157`)].

| Moodle | Level | Name | When |
|---|---|---|---|
| Dead | 4 | Deceased | The character is dead, unless they carry a real (not fake) zombie infection of 0.001 or more |
| Zombie | 4 | Zombified | Dead and carrying a real zombie infection of 0.001 or more |

Effects: shown on the death screen; every other moodle goes to 0 when dead :cite[(`Moodle.java:92-94`)].

### Food Eaten (`Moodles_FoodEaten`)

Value: the Well Fed timer (`BodyDamage.healthFromFoodTimer`). It is the only "good" moodle, has no `MoodleStat`, and is hidden below level 3 on screen :cite[(`Moodle.java:431-447`; `Moodles.json:72-75`, `:158-161`; `MoodlesUI.java:440-446`)].

| Level | Name | Timer above |
|---|---|---|
| 1 | Satiated | 0 |
| 2 | Well Fed | 1,600 |
| 3 | Stuffed | 3,200 |
| 4 | Full to Bursting | 4,800 |

Effects: hunger stops rising at rest :cite[(`IsoGameCharacter.java:10194-10219`)]; poison recovers 0.00015 per level per frame faster :cite[(`BodyDamage.java:2261-2267`)]; eating is refused at level 3 or more :cite[(`ISEatFoodAction.lua:14`)]. See [Hunger, thirst and nutrition](/pz/build-42/engine/character-stats/hunger-thirst-and-nutrition).

### Hyperthermia (`Moodles_Hyperthermia`)

Value: `TEMPERATURE` (degrees C), when not 0. It has no `MoodleStat`, and its chevrons come from the thermoregulator :cite[(`Moodle.java:449-465`, `:467-494`; `Moodles.json:76-79`, `:162-165`)].

| Level | Name | Temperature above | Reachable? |
|---|---|---|---|
| 1 | Unpleasantly Hot | 37.5 | yes |
| 2 | Overheated | 39 | yes |
| 3 | Sunstruck | 40 | **no**: the stat is clamped to 40 |
| 4 | Hyperthermia | 41 | **no** |

Effects and the thermoregulator's part: [Body temperature](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator). Also +0.1 discomfort per level :cite[(`BodyDamage.java:3210`)].

### Hypothermia (`Moodles_Hypothermia`)

Value: `TEMPERATURE`, below the line. The `MoodleStat` holds 30, 70, 9 and 100, and the 9 and 100 are never read :cite[(`Moodle.java:496-523`; `MoodleStat.java:33`; `Moodles.json:80-83`, `:166-169`)].

| Level | Name | Temperature below | And |
|---|---|---|---|
| 1 | Chilly | 36.5 | intoxication 30 or less |
| 2 | Cold | 35 | intoxication 70 or less |
| 3 | Freezing | 30 | |
| 4 | Hypothermia | 25 | |

Effects: a cold cannot clear at level 1 or more :cite[(`BodyDamage.java:949`)]; discomfort +0.1 per level :cite[(`:3209`)]. More on the [temperature page](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator).

### Windchill (`Moodles_Windchill`)

Value: wind chill amount for the player (`Temperature.getWindChillAmountForPlayer`) :cite[(`Moodle.java:525-542`; `MoodleStat.java:34` (5, 10, 15, 20); `Moodles.json:84-87`, `:170-173`)].

| Level | Name | Wind chill above | Reachable? |
|---|---|---|---|
| 1 | Slight Windchill | 15, then overwritten | **never the final level** |
| 2 | Uncomfortable Windchill | 10 | yes (10 to 15) |
| 3 | Freezing Windchill | 15 | yes (15 to 20) |
| 4 | Horrific Windchill | 20 | yes |

Effects: none found beyond the icon and the sound parameter.

### Cant Sprint (`Moodles_CantSprint`)

Cant Sprint sits at level 1 for 300 updates after `IsoPlayer.moodleCantSprint` is set, and only level 1 exists :cite[(`Moodle.java:95-104`; `IsoPlayer.java:8381`; `Moodles.json:174`, `:175`)]. The "Restricted Movement" name; the game flags it when heavy clothing or bags stop sprinting.

### Uncomfortable (`Moodles_Uncomfortable`)

Value: `DISCOMFORT`, **at or above** :cite[(`Moodle.java:544-555`; `MoodleStat.java:31`; `Moodles.json:176-179`, `:180-183`)].

| Level | Name | Discomfort at or above |
|---|---|---|
| 1 | A Little Uncomfortable | 20 |
| 2 | Uncomfortable | 40 |
| 3 | Very Uncomfortable | 60 |
| 4 | Extremely Uncomfortable | 80 |

Effects: from level 1, stress grows :cite[(`BodyDamage.java:3239-3252`)]. Despite the description's "unhappy", no unhappiness is added.

### Noxious Smell (`Moodles_NoxiousSmell`)

Value: the corpse sickness rate, or being in a toxic building without protection. Only the 0.001 and 0.002 lines are used :cite[(`Moodle.java:557-576`; `MoodleStat.java:32`; `Moodles.json:184-187`, `:188-191`)].

| Level | Name | When |
|---|---|---|
| 1 | Bad Smell | corpse rate above 0 |
| 2 | Awful Odor | corpse rate above 0.001 |
| 3 | Overwhelming Stench | corpse rate above 0.002 |
| 4 | Deadly Fumes | in a toxic building without protection (tested first, so the corpse option does not gate it) |

Level 4 is tested first :cite[(`Moodle.java:560-564`)]. Effects: no lying down at level 1 or more :cite[(`ISWorldObjectContextMenuLogic.java:4213`)]; vehicle menu check :cite[(`ISVehicleMenu.lua:220`)]. The Decaying Corpse Health Impact option set to 1 turns the corpse part off :cite[(`Moodle.java:564`)].

## Moodle code summary

Some facts about the moodle code are worth keeping to hand.

- Types: 26 :cite[(`MoodleType.java:14-39`)]. Levels 0 to 4 :cite[(`Moodle.MoodleLevel`, `Moodle.java:583-589`)].
- Chevron count is clamped to 0 to 3 :cite[(`Moodle.java:63-75`)].
- UI sizes 32, 48, 64, 80, 96, 128 pixels :cite[(`MoodlesUI.java:46`)].
- Moodles are not registered with a threshold table that mods can extend: `MoodleStat` is private to the engine and not exposed to Lua :cite[(no `@UsedFromLua`; absent from `api/lua_exposed.jsonl`)].

:::callout[How we know]{kind=proof}
Every row is read from the 42.22 Java and Lua. The unreachable levels (Hyperthermia 3 and 4, Windchill 1) come from reading the code, not from play.
:::
