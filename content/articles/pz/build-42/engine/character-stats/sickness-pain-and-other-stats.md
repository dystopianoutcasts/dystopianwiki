---
id: build-42-sickness-pain-and-other-stats
slug: sickness-pain-and-other-stats
title: 'Sickness, pain, drunkenness and the other stats'
game: pz
version: build-42
section: engine
category: character-stats
difficulty: intermediate
tags:
  - engine
  - stats
  - sickness
  - pain
  - intoxication
  - poison
excerpt: >-
  What makes you Sick, how pain follows your wounds, how drunkenness builds and fades in real minutes, and what the other stats do, including four that do almost nothing.
last_updated: '2026-11-16'
related_articles:
  - how-character-stats-work
  - hunger-thirst-and-nutrition
  - stress-panic-boredom-and-unhappiness
  - how-moodles-work
  - stats-and-moodles-reference
  - modding-stats-and-moodles
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#sickness-three-stats-feed-one-moodle) | [modders](#four-stats-that-do-almost-nothing)

:::callout[The 1-minute version]{kind=key}
- The Sick moodle is one icon with several causes: bad food, rotting bodies, or the real thing. It reads the biggest of Food Sickness, Zombie Fever and Zombie Infection (divided by 100), plus the Sickness stat.
- Pain is built from your wounds, softened by painkillers. It climbs slowly toward the wounds' target and drops straight down when the target falls.
- Drunkenness falls at 0.2 a second on real time: from 100 to nothing takes about 8 real minutes. Every effect scales with the moodle level.
- Eating a food that is dangerous uncooked poisons you every time, unless you are already infected or it is burnt; eggs are the exception (chance 5, 0 with Iron Gut).
- Four stats (Morale, Sanity, Anger, Sickness) do almost nothing in an unmodded game, from our search of the Java and vanilla Lua.
:::

:::facts
- **Sick moodle** starts above 0.25, 0.5, 0.75, 0.9
- **Poison drain** about 0.048 a second; Food Sickness drain 0.072 a second at poison 0
- **Pain moodle** starts above 10, 20, 50, 75; re-read every 120th update (about 2 seconds at 60 frames a second)
- **Pill effect** about 3 real minutes
- **Intoxication fall** 0.2 a second, 12 a minute; 100 to nothing in about 8 real minutes
:::

For zombie infection, fatigue and body temperature there are existing pages; this one links them and does not repeat them: [How infection works](/pz/build-42/gameplay/the-real-numbers/how-infection-works), [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance), [Body temperature](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator), [Body damage, wounds and infection](/pz/build-42/modding/engine/body-damage-wounds-and-infection).

Rates here mostly run on real time at normal speed (48 frame-multiplier units a second); see [How character stats work](/pz/build-42/engine/character-stats/how-character-stats-work).

## Sickness: three stats feed one moodle

The Sick moodle reads the biggest of three stats plus the Sickness stat, so 25 points of any of the three gives the first level.

The **Sick** moodle reads one number:

**Sick value = (the biggest of Food Sickness, Zombie Fever and Zombie Infection) / 100 + the Sickness stat**

The moodle levels start above 0.25, 0.5, 0.75 and 0.9 (Queasy, Nauseous, Sick, Fever). So 25 points of any of the three gives the first level :cite[(`zombie/characters/Moodles/Moodle.java:191-209`; `BodyDamage.getApparentInfectionLevel`, `zombie/characters/BodyDamage/BodyDamage.java:1657-1660`)].

### Food poisoning

Two stats work as a pair: Poison is the toxin in your stomach, and Food Sickness is how ill it makes you.

**Poison** (0 to 100) is the toxin in your stomach. **Food Sickness** (0 to 100) is how ill it makes you.

**Poison comes from:**

| Source | Poison added | Code |
|---|---|---|
| A food that carries poison (bleach and so on) | its poison power x the part eaten; halved with Iron Gut, doubled with Weak Stomach. Also pain of poison / 6 | |
| Tainted food | +20 x the part eaten, and pain of 10 / 6 | |
| Raw food that is dangerous uncooked (and you are not already infected, and it is not burnt) | +15 x the part eaten. The "illness chance" the code works out is only checked for being above 0, so this is **not a dice roll**: eating it always poisons you. Eggs are the exception: chance 5, and 0 with Iron Gut | |
| Spoiled food (past its rot age) | a dice roll against 100, scaled by how far past, then 5 x the food's hunger value x 10 x the part eaten; 2 x that if the roll fails. A player who is already infected gets **no** poison from spoiled food | :cite[(`BodyDamage.java:686-699`)] |
| Tainted water and fluids | the fluid's poison, x0.75 for tainted water; Iron Gut sets tainted water to 0 and halves other poison, except when the main fluid is bleach, which Iron Gut leaves at full strength; Weak Stomach x1.2 (tainted) or x2 | :cite[(`IsoGameCharacter.java:5894`, `:5916-5921`)] |

Food poison, tainted, raw and spoiled food are handled in `JustAteFood` :cite[(`BodyDamage.java:554-703`)], and fluids in the character class :cite[(`IsoGameCharacter.java:5911-5943`)].

**Then it works like this** (every frame, in `BodyDamage.Update`):

- Poison drains by 0.001 x frame multiplier, about **0.048 a second**, a little faster if you are Well Fed (+0.00015 per Food Eaten level, per frame) :cite[(`BodyDamage.java:2263-2267`)].
- While poison is above 0, Food Sickness **grows** by 0.001 x (2 + poison / 10, rounded) x frame multiplier. At poison 20 that is about 0.19 a second, so the first Sick level (25) takes about two real minutes.
- Poison above 10 and a Sick moodle of level 1 or more **damages your health**: 0.0035 x (poison / 10, at most 3) x frame multiplier.
- When poison is at 0, Food Sickness drains by 0.0015 x frame multiplier, **0.072 a second**. It does not drain while any poison is left.
- At Sick level 4 with Food Sickness above your infection, you also take the "severe bad moodle" health loss every frame (0.0165 x frame multiplier), and your carry limit drops by 3.

Poison drain, Food Sickness growth and poison damage all happen in one block of the body update :cite[(`:2254-2273` of `BodyDamage.java`)], and the Sick level 4 loss comes from the next block :cite[(`:2280-2289`)]. Food Sickness drains in a separate block :cite[(`:2510-2512`)], and the Well Fed bonus to the poison drain is applied with it :cite[(`:2261-2267`)]. The constants are `PoisonLevelDecrease = 0.0010` and `FoodSicknessDecrease = 0.0015` :cite[(`media/lua/shared/defines.lua:42-44`)], and `infectionGrowthRate = 0.001` :cite[(`BodyDamage.java:72`)]. Per-second figures are the constants times 48; that conversion is ours.

Foods and pills can lower Food Sickness and Poison by an amount, but only once every 120 to 230 frame-units (80 to 150 with Iron Gut, 200 to 280 with Weak Stomach); a buff timer blocks back-to-back doses :cite[(`IsoGameCharacter.java:5787-5798`)].

### Corpse sickness

Rotting bodies near you also add Food Sickness, once there are more than 5 corpses in range.

This is the **Decaying Corpse Health Impact** sandbox option (default 3; 1 turns it off) :cite[(`api/sandbox_options.jsonl`, `DecayingCorpseHealthImpact`; `BodyDamage.java:2460-2483`, `:2485-2513`)].

- Nothing happens until there are more than 5 corpses in range. Then the rate is the Food Sickness drain constant (0.0015) times a factor for the option (2: x0.01, 3: x0.07, 4: x0.11, 5: x1), times the number of corpses beyond 5 (capped by the fly sound's maximum).
- Masks cut the rate by their defense; Resilient x0.75, Prone to Illness x1.25.
- The **Noxious Smell** moodle reads that rate: level 1 up to 0.001, level 2 above 0.001, level 3 above 0.002, and level 4 only inside a toxic building without protection :cite[(`Moodle.java:557-576`)]. At the default option, 10 corpses is level 1 and 15 is level 2.
- Noxious Smell level 1 or more stops you lying down to sleep and changes the vehicle menu :cite[(`zombie/iso/ISWorldObjectContextMenuLogic.java:4213`; `media/lua/client/Vehicles/ISUI/ISVehicleMenu.lua:220`)].

### The Sickness stat

The 0 to 1 **Sickness** stat is separate from all of the above, and nothing in the engine writes it.

It is read by the Sick moodle, by the thermoregulator (it raises the body's target temperature by 2 degrees times the stat) :cite[(`zombie/characters/BodyDamage/Thermoregulator.java:683-689`)] and by foraging :cite[(`media/lua/shared/Foraging/forageSystem.lua:1782`)]. A mod or the debug menu can set it; the game itself leaves it at 0.

## Pain (0 to 100)

Pain is built from your wounds, not from hits directly, and it climbs slowly toward the wounds' target but drops straight down to it.

Every frame the body adds up each body part's pain times that part's pain weight, minus your **pain reduction** (from painkillers and food), and treats the result as a target.

- If the target is **above** your pain, pain climbs by 1/500th of the gap each frame: slowly.
- If the target is **below**, pain drops straight to it: instantly.
- While a painkiller's effect timer runs, pain also falls by 0.023 per 30-fps unit (about 0.7 a second) and the target is ignored.
- Pain reduction itself fades by 0.005 x the frame multiplier a frame.
- If nothing changed pain this frame, it drops by 0.25 per 30-fps unit (about 7.5 a second).

That last rule, with the instant fall, makes pain sit close to the wounds' target and recover quickly once they are treated. Pain is worked out from a target with a slow rise, an instant fall, an effect timer and a reduction fade :cite[(`BodyDamage.java:2341-2363`)], and the 0.25 rule keeps it close to the target :cite[(`:2436-2438`)]. Poisoned or tainted food adds poison / 6 straight to pain. How each body part's own pain is raised is in the [wounds page](/pz/build-42/modding/engine/body-damage-wounds-and-infection).

**Pills:** a Pills item sets a 5,400-unit effect timer (about 3 real minutes), gives 0.45 pain-meds strength (0.15 when you are drunk above 10) :cite[(`:512-552`; `IsoGameCharacter.java:5567-5570`, `PainMeds`: timer 5400)]. The "about 3 real minutes" is 5,400 / 30 per second; that conversion is ours. A method that would take 30 pain off at once, `JustTookPainMeds`, exists but nothing in Java or vanilla Lua calls it :cite[(`:718-720` and `:92`)]. Alcohol grants a little of the same effect (0.2 per part drunk).

**The moodle** starts above **10**, then 20, 50 and 75 :cite[(`MoodleStat.java:26`)], and it only re-reads the stat **every 120th update** (about 2 seconds at 60 frames a second), holding its level in between. The first time it reaches level 3 from below, your character plays the pain voice :cite[(`Moodle.java:346-379`)].

**What it does**

- You cannot lie down to sleep at Pain level 2 or more unless fatigue is above 0.85 :cite[(`ISWorldObjectContextMenuLogic.java:4207`)]. Pain delays falling asleep by 1 + 0.2 x level hours :cite[(`zombie/ai/sadisticAIDirector/SleepingEvent.java:166-168`)].
- Climbing gets harder: each Pain level is worth -5 in the climb chance :cite[(`IsoGameCharacter.java:16712`)], and the fence climb adds 5 per level to its fail roll :cite[(`ClimbOverFenceState.java:527`)].
- Pain in the hands and forearms lengthens timed actions: the time is multiplied by 1 + (their combined part pain) / 300 :cite[(`media/lua/shared/TimedActions/ISBaseTimedAction.lua:107-116`)].
- Other players see your **Pain moodle level**, because it is one of the values in the body-damage sync :cite[(`zombie/network/BodyDamageSync.java:140-154`)].

## Drunkenness (Intoxication 0 to 100)

Drunkenness jumps when you drink and falls at 0.2 a second, so 100 to nothing takes about 8 real minutes.

**Raising it.** Alcoholic food and drink call `JustDrankBooze` (or `JustDrankBoozeFluid` for fluid containers). Intoxication goes up by **400 x** a "dose" number: roughly the share of the drink consumed (food) or its alcohol content (fluid). Beer and low-alcohol drinks count a quarter; a drink when hunger is above 0.8 counts 1.25 (food) or 1.1 (fluid), above 0.6 counts 1.1 (food) or 1.25 (fluid). Drinks also give a little sleeping-tablet, beta-blocker, antidepressant and painkiller effect :cite[(`BodyDamage.java:472-510`, `:99-100`)].

The two hunger bonuses are swapped between food and fluid versions, which looks like a slip; we have not seen it in play.

**Lowering it.** 0.0042 x the frame multiplier a frame, which is **0.2 a second, 12 a minute**, on real time :cite[(`:2191`)]. From 100 to nothing takes about 8 real minutes.

| Moodle level | Intoxication above | Real minutes to sober up to the line below, from the top of the level |
|---|---|---|
| 1 Tipsy | 10 | about 1.7 from 30 to 10 |
| 2 Inebriated | 30 | about 1.7 from 50 |
| 3 Plastered | 50 | about 1.7 from 70 |
| 4 (max) | 70 | about 2.5 from 100 to 70 |

The lines are 10, 30, 50 and 70 :cite[(`MoodleStat.java:30`, `:33`)]. The sober-up column is our arithmetic from 0.2 a second.

**What it does** (every effect scales with the moodle level):

- **Movement:** from level 2, your inputs lag, and each frame a chance of `intoxication in 160` randomizes your walking direction. Running or sprinting can trip you: a chance of `intoxication x level in 2000` per check :cite[(`zombie/characters/IsoPlayer.java:2975-2998`, also `IsoPlayer.java:2975-2998`)].
- **Driving:** from level 2, vehicle steering is delayed and wanders :cite[(`zombie/core/physics/CarController.java:137`, `:902-912`)].
- **Actions:** every timed action takes (1 + level / 4) times as long :cite[(`ISBaseTimedAction.lua:105`)].
- **Combat:** ranged to-hit penalty by level and distance; defend chance -2 per level; fall chance +3 and climb fail -8 per level; a narrower view cone from level 2 :cite[(`CombatManager.java:2607-2611`; `IsoGameCharacter.java:13654`, `:14187`, `:16710`, `:17165`)].
- **Comfort and cold:** discomfort is reduced by up to half at 100 :cite[(`BodyDamage.java:3208`)]; and the Hypothermia moodle is held back while you are drunk: level 1 needs intoxication at 30 or less, level 2 needs 70 or less :cite[(`Moodle.java:502-508`, `Moodle.java:398-415`, `:496-523`)]. This matches the published [temperature page](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator), which says "not while drunk enough" without the numbers.
- **Boredom** falls fast above 20 (see [Stress, panic, boredom and unhappiness](/pz/build-42/engine/character-stats/stress-panic-boredom-and-unhappiness)).

## The remaining stats, one by one

Wetness, discomfort, fitness, nicotine, idleness, temperature and the infection stats each have their own rule, summed up below.

| Stat | What moves it | Notes | Code |
|---|---|---|---|
| **Wetness** 0 to 100 | Each frame it merges toward the average wetness of your body parts, which rain, water and drying move | Moodle starts above 15, 40, 70, 90. Soaked clothes cost warmth and raise the catch-a-cold meter through the thermoregulator. Wet level 1 or more also stops a cold from clearing and adds 0.1 per level to discomfort | :cite[(`BodyDamage.java:722-811`, `:812-830`, `:948`, `:3211`)] |
| **Discomfort** 0 to 100 | A target is built from bed quality asleep (0.2 to 0.5), clothing discomfort, dragging a corpse (0.3), 0.1 per Hypothermia, Hyperthermia and Wet level, and vehicle discomfort, then eased by drunkenness; the stat glides to it | Moves toward a *higher* target only 2.5% as fast as toward a lower one, so it builds slowly and clears quickly. Asleep it snaps to the target. Moodle at 20, 40, 60, 80 (">=" here, not ">"). Level 1 or more adds stress | :cite[(`BodyDamage.java:3187-3237`, `:3239-3252`)] |
| **Fitness** -1 to 1 | Set every frame to Fitness skill level / 5 - 1, so level 0 is -1 and level 10 is +1 | Read by the thermoregulator | :cite[(`IsoGameCharacter.java:10296-10298`)] |
| **Nicotine withdrawal** 0 to 0.51 | Smokers only: a timer since the last smoke grows 0.0001 x the frame multiplier; past 1, withdrawal grows by 0.00005 / 8 x (1 to 10, one more each 10 units of timer) x the frame multiplier | Adds to the stress the moodle sees; cleared by smoking | :cite[(`BodyDamage.java:1992-2006`, `RecipeCodeOnEat.java:34-36`)] |
| **Idleness** 0 to 1 | Described in the boredom page | Drives boredom | |
| **Temperature** 20 to 40 | The thermoregulator's core temperature | Maxes at 40, so Hyperthermia tops out at level 2; see the temperature page | :cite[(`Thermoregulator.java:863-868`)] |
| **Zombie fever, Zombie infection** 0 to 100 | Infection clock and fever; see [How infection works](/pz/build-42/gameplay/the-real-numbers/how-infection-works) | Fake infection (mortality set to Never) raises fever and then fades it | |

## Four stats that do almost nothing

Morale, Sanity, Anger and Sickness have no real use in an unmodded game; we searched the Java and the vanilla Lua for every use of each.

- **Morale** (0 to 1, default 1): the only code that touches it adds to it each frame (a clamped 0 to 1), so it never goes below 1. Nothing reads it :cite[(`IsoGameCharacter.java:10286-10294`)].
- **Sanity** (0 to 1, default 1): panic at level 2 or more and the Tired moodle at level 4 slowly lower it; nothing reads it back :cite[(`IsoGameCharacter.java:9158-9173`)]. The only other reference is the debug panel.
- **Anger** (0 to 1): the engine only lowers it (-0.36 per game hour) and the Angry moodle reads it, but no engine code raises it, so in an unmodded game it should stay at 0 (not verified in play) :cite[(`IsoGameCharacter.java:10370-10371`)]. The vanilla radio script that tries to set Anger (code `ANG`, line 92), Morale (`MOR`, 98), Sanity (`SAN`, 101) and Sickness (`SIC`, 102) calls `stats["set" .. name]`, and `Stats` has no `setAnger`, `setMorale`, `setSanity` or `setSickness` any more, so that route is dead in 42.22. The method list for class `Stats` shows no such setters :cite[(`media/lua/shared/RadioCom/ISRadioInteractions.lua:60-76`, `:92-102`; `api/lua_exposed.jsonl`)].
- **Sickness** (0 to 1): covered above; only read, never written. `ISDrinkFromBottle.lua:88` calls `stats:getSickness()`, which does not exist on `Stats` either, so that tainted-water check would error (not verified in play).

Mods can use all four as free "variables on the character": they are saved, synced with a bit mask and shown in debug tools.

Next: [How moodles work](/pz/build-42/engine/character-stats/how-moodles-work).

:::callout[How we know]{kind=proof}
Everything here is read from the 42.22 Java and Lua. For the four near-useless stats we searched `zombie/**/*.java` for `CharacterStat.MORALE|SANITY|ANGER|SICKNESS` (only the lines cited) and `media/lua/**` (`ISStatsAndBody.lua` debug sliders, `forageSystem.lua:1782`). Not verified:
- The per-body-part pain weights and how wounds feed each part's pain (see the wounds page).
- Whether pain truly "sits near the target" in play. The code reads that way; we have not logged it.
- The exact frame rate that sets "every 120th update" in real seconds. It is per update, so about 2 seconds at 60 updates a second.
- The values in the Tipsy-to-Plastered sober-up column are our arithmetic from 0.2 a second.
:::
