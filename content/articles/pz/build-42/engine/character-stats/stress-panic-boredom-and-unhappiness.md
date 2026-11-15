---
id: build-42-stress-panic-boredom-and-unhappiness
slug: stress-panic-boredom-and-unhappiness
title: 'Stress, panic, boredom and unhappiness: the real numbers'
game: pz
version: build-42
section: engine
category: character-stats
difficulty: intermediate
tags:
  - engine
  - stats
  - stress
  - panic
  - boredom
  - unhappiness
excerpt: >-
  What raises and lowers stress, panic, boredom and unhappiness, with the real rates, and what each does to your survivor: worse aim, weaker swings and slower actions.
last_updated: '2026-11-14'
related_articles:
  - how-character-stats-work
  - hunger-thirst-and-nutrition
  - sickness-pain-and-other-stats
  - how-moodles-work
  - stats-and-moodles-reference
  - modding-stats-and-moodles
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#putting-it-together) | [modders](#panic-0-to-100)

:::callout[The 1-minute version]{kind=key}
- Panic spikes when zombies come into view and drains in seconds: a fresh survivor clears one zombie's 7 in about 4 seconds.
- Stress builds slowly from noise, wounds and discomfort, and drains over game hours while you are awake. Sleep does not lower it.
- Boredom grows when you idle and runs on real time. Idle indoors at full idleness, it reaches the first Bored moodle in about 9 real minutes.
- Unhappiness is the slow tail: boredom and stress feed it from level 2, and comfort, food, books and pets lower it.
- Panic and stress cost ranged to-hit and, from level 2, melee damage. Unhappiness makes every timed action take (1 + level / 4) times as long.
:::

:::facts
- **Panic** 0 to 100; moodle above 6, 30, 65, 80; clears at 1.8 a second (plus 1.8 per month survived, up to 5 months)
- **Stress** 0 to 1; moodle above 0.25, 0.5, 0.75, 0.9; falls 0.108 per game hour awake
- **Boredom** 0 to 100; moodle above 25, 50, 75, 90; first moodle in about 9 real minutes idle indoors
- **Unhappiness** 0 to 100; moodle above 20, 45, 60, 80; +0.024 per real second per Bored level
- **Idle indoors to Unhappy** roughly 24 real minutes
:::

Rates come in two flavors, explained in [How character stats work](/pz/build-42/engine/character-stats/how-character-stats-work). "Per game hour" figures use the day-length cancelling rule. "Per real second" figures run on real time at normal speed (48 frame-multiplier units a second), so doubling game speed doubles them.

## Panic (0 to 100)

Panic is the fast one: each new zombie in view adds 7, and it drains in seconds.

The Panic moodle starts above **6**, then 30, 65 and 80 :cite[(`zombie/characters/Moodles/MoodleStat.java:20`)].

**What raises it**

| Cause | Panic added |
|---|---|
| Each zombie that newly comes into view | +7 per zombie (`panicIncreaseValue`), times your traits. In a vehicle the count of new zombies is halved first (integer division, so one new zombie adds nothing) |
| Trait: Cowardly | x2. Brave x0.3. Desensitized x0.15, and then panic is reset to 0 every frame anyway |
| Beta blockers working | x(1 - delta), at least 0 |
| Agoraphobic outdoors | +0.5 per 30-fps unit, about 15 a second |
| Claustrophobic indoors | up to +0.6 per 30-fps unit, scaled by how small the room is: nothing at 70 squares or more, about 0.086 per unit in a vehicle |
| Bleeding | (0.2, or 0.4 if Hemophobic) x (1 - body health / 100) x number of bleeding parts, per 30-fps unit |
| A zombie that was playing dead lunges | +21 (three zombies' worth) |
| Applying a bandage, cataplasm or stitches, removing glass or a bullet, as a Hemophobic with a bleeding wound | +50 (in the Lua action) |
| A nightmare in your sleep | +70 (and +0.5 stress); another event gives +30 to 60 |

The constants 7.0, 0.035 and 0.06 are defined in the body damage class, with the raise and reduce logic in the same file :cite[(`zombie/characters/BodyDamage/BodyDamage.java:96-98`, `:358-439`)]. New zombies this frame are counted, and Desensitized resets panic, in `UpdatePanicState` :cite[(`:451-470`)]. Phobias and bleeding add panic in the character update :cite[(`zombie/characters/IsoGameCharacter.java:9098-9119`)], and beta blockers are applied there too :cite[(`:9131-9133`)]. The playing-dead lunge adds its 21 :cite[(`zombie/ai/states/FakeDeadAttackState.java:44`)], nightmares add theirs :cite[(`zombie/ai/sadisticAIDirector/SleepingEvent.java:299-309`, `:428`)], and the bandage action and the other treatment actions add the `+50` :cite[(`media/lua/shared/TimedActions/ISApplyBandage.lua:104-108`)].

**What lowers it.** A frame with no new zombies *reduces* panic by 0.06 per 30-fps unit, which is **1.8 a second**. Add another 1.8 a second for every whole month survived, up to 5 months. Asleep it is doubled. So a fresh survivor clears one zombie's 7 in about 4 seconds, and a veteran with 5 months behind them clears it in under a second. Beta blockers add 0.6 per 30-fps unit while they work (`betaEffect`). The 1.8 a second is `0.06 x (48 / 1.6)`; that conversion is ours.

**What it does**

- **Aim and swing:** each Panic level costs ranged to-hit by a base amount plus a distance term (`CombatManager.getMoodlesPenalty`), and from level 2 each level takes 0.1 off melee damage :cite[(`CombatManager.java:868-870`, `:2593-2613`)]. The Firearm Moodle Multiplier sandbox option scales the ranged penalty; 0 turns it off.
- **Sight:** at level 4 your field-of-view cone loses 0.2 :cite[(`IsoGameCharacter.java:17166-17168`)].
- **Sanity:** the Sanity stat loses a tiny amount each frame at level 2, 3 and 4 (3.2, 4.8 and 8 x 10^-7) and regains 10^-7 at level 0 :cite[(`:9158-9168`)]. Nothing in the engine reads Sanity (see [Sickness, pain and other stats](/pz/build-42/engine/character-stats/sickness-pain-and-other-stats)).
- **Sleep, bed and windows:** you cannot lie down at Panic level 1 or more :cite[(`zombie/iso/ISWorldObjectContextMenuLogic.java:4210`)]; you get up quickly from level 2 :cite[(`zombie/ai/states/PlayerGetUpState.java:49-51`)]; closing a window fumbles more often :cite[(`zombie/ai/states/CloseWindowState.java:114`)].
- **Boredom:** above 5 panic, boredom is reset to 0 :cite[(`BodyDamage.java:1965-1967`)].
- **Adrenaline Junkie:** at level 3 or more it speeds you up by (level + 1) / 20 :cite[(`IsoGameCharacter.java:9714-9717`)].
- **Sound:** the heartbeat plays whenever panic is above 0, with volume equal to panic / 100 :cite[(`IsoPlayer.java:7125-7137`)], and the music system reads the Panic level.

## Stress (0 to 1)

Stress is a slow tide: noise, wounds and discomfort push it up, and only time awake pulls it down.

The Stress moodle starts above **0.25**, then 0.5, 0.75 and 0.9 :cite[(`MoodleStat.java:24`)], and it reads stress plus **nicotine withdrawal**, capped at 1 :cite[(`Stats.getNicotineStress`, `zombie/characters/Stats.java:133-136`)].

| Raises it | Amount |
|---|---|
| Loud noise near you (gunshots, alarms, and so on) | each noise adds (1 - distance / radius) x its stress value x 0.00002 *per frame*. This one is **not** scaled by the frame multiplier, so it is faster on a faster computer. Deaf characters ignore it |
| A bitten wound | +0.18 per game hour |
| A scratched wound | +0.18 per game hour, on top |
| Being infected (or fake infected) | +0.18 per game hour, on top |
| Hemophobic near blood | total blood x 0.0000003333 per unit time, scaled by the blood on you |
| Feeling Uncomfortable (moodle level 1 or more) | discomfort x 3 (more when over 100) x 0.00000013 per unit: about 0.056 per game hour at discomfort 40, 0.11 at 80 |
| Looting corpses, as a character that is not Desensitized | a small amount a frame (Lua) |
| A nightmare | +0.5 |
| Nicotine withdrawal (Smokers) | counts as extra stress, up to +0.51 |

| Lowers it | Amount |
|---|---|
| Time awake | -0.108 per game hour (stress decrease 0.00003 x 3600). Sleep does **not** lower stress |
| Killing a zombie with a weapon | -0.02 |
| Food, drink and pills | their own stress value |
| Petting an animal | -0.15 to -0.35, once per game hour |
| Harvesting flowers | -(number picked / 2) |

From full stress (1.0) at 0.108 an hour awake, you reach Tense (0.5 or below) in about 4.6 game hours, the icon clears below 0.25 at about 6.9 hours, and stress is near 0 at about 9. Bites and scratches stack: a bitten, scratched, infected survivor gains 0.54 an hour and loses 0.108, so stress only goes up.

The awake decrease is in the stat update :cite[(`IsoGameCharacter.java:10158-10160`)], and all the raises (sounds, bitten, scratched, infected, Hemophobic) are in the same file :cite[(`:10319-10372`)]. Discomfort stress is added by the body damage class :cite[(`zombie/characters/BodyDamage/BodyDamage.java:3239-3252`)], noise stress comes from `getStressFromSounds` :cite[(`zombie/WorldSoundManager.java:412-433`)], and a kill takes off 0.02 :cite[(`zombie/CombatManager.java:1227`)]. Petting is allowed once an hour :cite[(`zombie/characters/IsoPlayer.java:8810-8832`)], flowers lower stress in the farming system :cite[(`media/lua/server/Farming/SFarmingSystem.lua:339-343`)], and corpse looting adds it in the craft action :cite[(`media/lua/shared/TimedActions/ISCraftAction.lua:19-26`)]. The stress rate constants are defined in one Lua file :cite[(`media/lua/shared/defines.lua:21`, `:27-30`)].

**What it does.** From level 2 up, each level takes 0.1 off melee damage :cite[(`CombatManager.java:873-875`)] and costs ranged to-hit :cite[(`:2600-2604`)]. From level 2 it feeds unhappiness. Higher stress lengthens your delay before falling asleep (x1.2 at any level) and raises the chance of a sleeping event (+10 per level) :cite[(`SleepingEvent.java:170-172`, `:217`)]. Foraging also reads it :cite[(`media/lua/shared/Foraging/forageSystem.lua:1804`)].

## Boredom (0 to 100)

Boredom rises when your survivor idles or sits still and falls when they are active, talk, or are near people.

All its rates are per real second at normal speed. The Bored moodle starts above **25**, then 50, 75 and 90 :cite[(`MoodleStat.java:22`)].

| Situation | Change in boredom, per real second |
|---|---|
| Indoors (or standing on one square a long time), idle | +0.048 x idleness (idleness is 0 to 1, below) |
| Indoors, doing something | +0.0048 x idleness |
| Outdoors, active | -0.185 |
| In a vehicle that is stopped | +0.048 (0.0096 while reading) |
| In a vehicle that is moving | -0.92 |
| Speaking aloud (not shouting) | -1.85 |
| Other survivors nearby | -0.185 |
| Busy with a long action while barely idle | -0.92 |
| Intoxication above 20 (any place) | -3.7 |
| Panic above 5 (any place) | reset to 0 |

The rows for speaking, other survivors and being busy apply in the indoor-or-idle branch only :cite[(`BodyDamage.java:1933-1959`)]. Every branch above is in the same method :cite[(`BodyDamage.java:1915-1967`)], and reading is handled elsewhere :cite[(`:713-716`)].

**Idleness** is a 0 to 1 helper. While idle and not in combat, it grows by 0.0005 x 3600 = 1.8 per game hour once you have stood on the same square for a while (the idle-square counter at 1,800), and by an extra third of that rate when you are in a room. It falls by 21.6 per game hour when you move. In practice: idle indoors at full idleness, boredom reaches the first moodle (25) in about **9 real minutes** and the second in about 17. Idleness is worked out in the stat update :cite[(`IsoGameCharacter.java:10249-10283`)].

Other things that change it: eating and reading (the item's boredom value), petting an animal (-15 to -35, once an hour), harvesting flowers, any fall that counts as more than light (reset to 0), and the "after-meal" recipe code (-5) :cite[(`IsoPlayer.java:2774-2777`; `zombie/scripting/logic/RecipeCodeOnEat.java:61-62`)].

The constants are `BoredomIncrease = 0.0010`, `BoredomDecrease = 0.0385`, `IdleIncrease = 0.0005` and `IdleDecrease = 0.0060` :cite[(`media/lua/shared/defines.lua:23-25`, `:55-56`)]. Per-second figures are the constants times 48; that conversion is ours.

## Unhappiness (0 to 100)

Unhappiness is the slow, sad one: boredom and stress feed it, and only comfort, food, books and company take it down.

The Unhappy moodle starts above **20**, then 45, 60 and 80 :cite[(`MoodleStat.java:23`)].

**What raises it**

- **Bored at level 2 or more**, unless you are reading: +0.0005 x level x 48 = **0.024 per real second per level** (so 20 takes about 7 real minutes at Bored level 2).
- **Stressed at level 2 or more**, unless reading: half that rate per level.
- **Food, drink, books** with an unhappy value, and the Lua action for looting corpses (`rate / 100` per frame).
- The Uncomfortable moodle's text says it makes you unhappy; the code adds **stress**, not unhappiness :cite[(`BodyDamage.java:3239-3252`)].

Bored and stress feed unhappiness in the body damage class :cite[(`BodyDamage.java:1969-1990`)], food adds its value there :cite[(`:620`)], and books do too :cite[(`:713-716`)].

**What lowers it:** comfort food and drink, reading a book that cheers you, petting an animal (-15 to -35 once an hour), harvesting flowers, and antidepressants (Beta Anti-Depress): 0.03 per 30-fps unit for the length of the effect, after a first-take delay :cite[(`IsoGameCharacter.java:9138-9145`, `:5558-5565`)].

**What it does.** The engine's only direct effect is on speed: every timed action takes **(1 + level / 4)** times as long, so a Hopeless survivor (level 4) takes twice as long to do anything, and Drunk stacks with it the same way :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:99-105`)]. Nothing else in the Java code reads the Unhappy level (apart from a sound parameter). The antidepressant effect is applied in the character update :cite[(`IsoGameCharacter.java:9138-9149`)].

## Putting it together

Panic costs you aim fast, while idle time feeds a slow slide into unhappiness that slows every action.

- A zombie in view makes panic jump, panic makes you miss, and a long run of noise or wounds keeps stress above Agitated for hours.
- Idle indoors with nothing to read, and you will be Bored in about 9 real minutes, but Unhappy needs Bored level 2 first (about 17 minutes) plus about 7 more, so roughly 24 real minutes. Reading, talking to yourself, a pet and a walk outside break the loop.
- Stress above level 1 and Bored above level 1 both push unhappiness; unhappiness slows every action. The cheapest repair is a book or a snack with a cheerful unhappy value.

Next: [Sickness, pain and other stats](/pz/build-42/engine/character-stats/sickness-pain-and-other-stats).

:::callout[How we know]{kind=proof}
Everything here is read from the 42.22 Java and Lua. `MoodleType.UNHAPPY` appears only in `zombie/audio/parameters/ParameterMoodles.java` (a sound parameter) and in the moodle code, which is how we know nothing else reads Unhappy. Not verified:
- Per-real-second numbers assume normal game speed. At 2x or 4x speed they scale up (`GameTime.getMultiplier`).
- Which noises carry a stress value (`WorldSound.stresshumans`, `stressMod`) comes from the places that make each sound and was not traced here.
- How many zombies count as "newly in view" per frame comes from the zombie vision code (`Stats.numVisibleZombies`), which this page does not cover.
:::
