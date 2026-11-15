---
id: build-42-hunger-thirst-and-nutrition
slug: hunger-thirst-and-nutrition
title: 'Hunger, thirst and nutrition: the real numbers'
game: pz
version: build-42
section: engine
category: character-stats
difficulty: intermediate
tags:
  - engine
  - stats
  - hunger
  - thirst
  - nutrition
  - weight
excerpt: >-
  How many game hours until you feel hungry or thirsty, what eating and drinking do to each stat, and how calories and body weight work behind the scenes.
last_updated: '2026-11-14'
related_articles:
  - how-character-stats-work
  - stress-panic-boredom-and-unhappiness
  - sickness-pain-and-other-stats
  - how-moodles-work
  - stats-and-moodles-reference
  - modding-stats-and-moodles
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#hunger-it-slows-as-it-climbs) | [modders](#nutrition-calories-carbs-proteins-lipids-weight)

:::callout[The 1-minute version]{kind=key}
- From a full stomach you reach the first Peckish moodle in about 5 game hours, Hungry in about 8, and Starving in about a day and a half. All times are game hours at the default Stats Decrease, awake and resting.
- Hunger slows as it climbs, so it approaches 1 and never quite arrives. Thirst grows at a flat rate and never slows: about 4 hours to the first moodle.
- Eating adds the food's own numbers, scaled by how much you ate. If your hunger is at 0 when you finish a bite, you also fill a Well Fed timer that stops hunger rising.
- Nutrition (calories, carbohydrates, proteins, lipids, weight) is a second system, switched by the Nutrition System sandbox option. The code default is off, but the five built-in presets turn it on.
- Below 35 kg you lose health every update.
:::

:::facts
- **Hunger gain** 0.035 x (1 - hunger) per game hour
- **First hunger moodle** 4.7 game hours (Peckish), 8.3 (Hungry), 34.8 (Starving)
- **Thirst gain** 0.0288 per game hour, 4.2 hours to the first moodle
- **Well Fed cap** 11,000, about 229 real seconds, about 1 game hour on the default 90-minute day
- **Start values** 800 calories, 80 kg
- **Weight floor** 35 kg
:::

All times below are **game hours**, at the default Stats Decrease (Normal), awake, resting, without Hearty Appetite or Light Eater. How the rates are built is in [How character stats work](/pz/build-42/engine/character-stats/how-character-stats-work).

## Hunger: it slows as it climbs

Hunger runs from 0 (full) to 1 (starving) and grows more slowly the hungrier you are.

While awake it grows by

**0.0000096 x (1 - hunger) x Stats Decrease x trait**, per frame multiplier unit, which is **0.035 x (1 - hunger) per game hour**.

The `(1 - hunger)` part is the surprise. The hungrier you are, the slower you get hungrier, so hunger approaches 1 and never quite arrives. That is why the climb from Very Hungry to Starving takes so long.

| Moodle level | Hunger above | Game hours from full | With Stats Decrease Very Fast (x2) | Slow (x0.8) |
|---|---|---|---|---|
| 1 Peckish | 0.15 | 4.7 | 2.4 | 5.9 |
| 2 Hungry | 0.25 | 8.3 | 4.2 | 10.4 |
| 3 Very Hungry | 0.45 | 17.3 | 8.7 | 21.6 |
| 4 Starving to Death | 0.70 | 34.8 | 17.4 | 43.5 |

The moodle lines are 0.15, 0.25, 0.45 and 0.7 :cite[(`zombie/characters/Moodles/MoodleStat.java:19`)]. Hours are solved from `h(t) = 1 - exp(-k t)` with `k = 0.0000096 x 3600 = 0.03456` per game hour; that step is our arithmetic, not a game value.

Traits change the `(1 - hunger)` factor: Hearty Appetite multiplies it by 1.5 and Light Eater by 0.75. So with Hearty Appetite the first moodle comes at about 3.1 hours instead of 4.7. The appetite factor `1 - hunger` is worked out in `updateStats_Awake` :cite[(`zombie/characters/IsoGameCharacter.java:10156-10247`, appetite factor at `:10306-10317`)].

How you spend your time changes the rate. Per game hour, starting from empty:

| What you are doing | Hunger gain per hour (x (1 - hunger)) |
|---|---|
| Awake, not well fed, standing, walking, anything but running or swinging | 0.0346 |
| Awake, not well fed, running or in a melee swing | 0.0230 |
| Awake and Well Fed (Food Eaten moodle level 1 or more), standing or walking | 0 |
| Awake, Well Fed, running or swinging | 0.0691 |
| Asleep, not well fed | 0.0036 |
| Asleep, Well Fed | 0 (the Well Fed form starts from the zero Well Fed constant) |

The four awake rows are the four hunger branches :cite[(`:10193-10247` of `IsoGameCharacter.java`)]. The asleep rows use `HungerIncreaseWhileAsleep`, or the Well Fed form :cite[(`zombie/characters/IsoPlayer.java:3131-3159`)]. The constants are `HungerIncrease = 0.0000032 * 3`, `HungerIncreaseWhenWellFed = 0`, `HungerIncreaseWhenExercise = 0.0000032 * 6` and `HungerIncreaseWhileAsleep = 0.0000010` :cite[(`media/lua/shared/defines.lua:14-17`)]. Per-hour figures are the constants times 3600.

Two oddities, both read straight from the code and neither seen in play: running while hungry adds *less* hunger than walking (a third of the exercise rate, which is lower than the resting rate), and running while Well Fed adds *more* than anything else. Looks like the two branches were swapped, but it is what the code does.

### What hunger does to you

The Hungry moodle level matters more than the number, because it changes four things.

- **Carrying:** level 2 takes 1 point off your weight limit, level 3 takes 2, level 4 takes 2 :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2013-2023`)]. See [Weight, encumbrance and strength](/pz/build-42/gameplay/the-real-numbers/weight-encumbrance-and-strength).
- **Healing:** your body heals a little every frame. At Hungry it heals at 65% of the normal rate, at Very Hungry at 40%, and at Starving not at all (0.002, 0.0013, 0.0008, 0 per frame multiplier unit) :cite[(`BodyDamage.java:2198-2231`, `:78-81`)]. Sleeping heals at 0.02, but not while Starving or dying of thirst :cite[(`:2233-2244`)].
- **Damage:** at level 4 the body loses health every frame, at one fiftieth of the "severe bad moodle" amount :cite[(`BodyDamage.java:2275-2278`, constant 0.0165 at `:83`)]. Thirst level 4 loses a tenth of it :cite[(`:2296-2299`)].
- **Cold recovery:** a cold does not clear while hunger is above 0.25 or thirst above 0.25 :cite[(`BodyDamage.java:942-954`)].

## Thirst: steady, no slowing

Thirst runs 0 to 1 and grows at a flat rate, about 4 game hours to the first moodle.

Awake: **0.0000080 per frame unit, which is 0.0288 per game hour**. The thermoregulator multiplies it when you are hot (the fluids multiplier), and running adds x1.2 for the local player only, never on a dedicated server :cite[(`IsoGameCharacter.java:10426`)]. Asleep it is one eighth as fast: 0.0036 per hour.

| Moodle level | Thirst above | Game hours from 0 (awake, resting) |
|---|---|---|
| 1 Slightly Thirsty | 0.12 | 4.2 |
| 2 Thirsty | 0.25 | 8.7 |
| 3 Parched | 0.70 | 24.3 |
| 4 Dying of Thirst | 0.84 | 29.2 |

Notice the jump: Parched starts at 0.7, a long way past Thirsty. Stats Decrease scales thirst the same way as hunger. The lines are 0.12, 0.25, 0.7 and 0.84 :cite[(`zombie/characters/Moodles/MoodleStat.java:25`)].

The rate comes from `updateThirst`: `ThirstIncrease x Stats Decrease x frame multiplier x running x delta-minutes x trait x thermoregulator fluids multiplier`, where asleep uses `ThirstSleepingIncrease` :cite[(`IsoGameCharacter.java:10382-10423`)]. The x1.2 is applied only for the local player running :cite[(`:10425-10427`)], the thirst multiplier comes from `getThirstMultiplier` :cite[(`:14075-14079`)], and the constants are `0.0000040 * 2` and `0.0000010` :cite[(`media/lua/shared/defines.lua:9-10`)].

High Thirst doubles the rate; Low Thirst halves it. Both are traits on the character :cite[(`IsoGameCharacter.java:10383-10390`)].

**Auto drink.** If the Auto Drink option is on, a character with thirst above 0.1 who is not asleep, aiming, falling or climbing will drink from the first water source in the bag, enough to cover twice the thirst. It runs on the server or in single player, never on a client. A Lua hook named `AutoDrink` replaces it :cite[(`zombie/characters/IsoGameCharacter.java:11650-11678`)]. The auto drink threshold 0.1 is a literal in the code :cite[(`:11661`)]; the `ThirstLevelToAutoDrink` constant in `defines.lua` is loaded but this code does not use it :cite[(`defines.lua:11`)].

## Eating and drinking: what each bite does

When you eat food, the engine adds the food's own numbers, scaled by how much of it you ate :cite[(`IsoGameCharacter.java:5746-5815`)].

| Stat | What happens | Code |
|---|---|---|
| Hunger, Thirst | Food hunger change and thirst change (negative values lower them). Cooked food counts 1.3x its hunger value; burnt food a third; food past its first "off" age 0.77x and past its second 0.45x, never below 0.01 | :cite[(`zombie/inventory/types/Food.java:1732-1755`)] |
| Endurance, Stress, Fatigue | Added by the food's own change values | |
| Boredom, Unhappiness | Added by the food's boredom and unhappy values; using a utensil changes them by x1.25 when they help and x0.75 when they hurt | :cite[(`BodyDamage.java:597-620`)] |
| Pain, Cold | The food's pain reduction and flu reduction build up banked time that works off over the next game hours | :cite[(`IsoGameCharacter.java:5785-5786`)] |
| Nutrition | Calories, carbohydrates, proteins and lipids (below) | |

**Burnt food** gives only one fifth of its calories and nutrients :cite[(`:5777-5783`)]. Drinks do the same through `DrinkFluid`; a drink's hunger part also fills the Well Fed timer :cite[(`:5883-5907`)]. One quirk there: a drink adds its *unhappy* value to **boredom as well as unhappiness** :cite[(`:5901-5902`)], which looks like a copy-and-paste slip.

**Over-eating.** The Eat action is refused once the Food Eaten moodle is at level 3 (Stuffed) :cite[(`media/lua/shared/TimedActions/ISEatFoodAction.lua:14`)]. Getting there takes the Well Fed timer.

### The Well Fed timer

If your hunger is at 0 when you finish a bite, the game adds to a "health from food" timer, and while it is above 0 you get the Food Eaten moodle.

The timer gets the food's hunger change times 13,000, doubled if the food is cooked, capped at 11,000 :cite[(`BodyDamage.java:625-635`, `:709-711`)].

| Food Eaten level | Timer above | Meaning |
|---|---|---|
| 1 Satiated | 0 | hunger stops rising while you walk or stand |
| 2 Well Fed | 1,600 | extra poison recovery, as below |
| 3 Stuffed | 3,200 | cannot eat more |
| 4 Full to Bursting | 4,800 | |

The timer runs down by one frame multiplier unit per frame, which is 48 per real second, so the full 11,000 cap lasts about **229 real seconds, about 1 game hour on the default 90-minute day**. The 229 seconds and 1 game hour are our conversion at normal speed with a 90-minute day (48 units per real second). A typical meal is much less: 0.3 of hunger eaten uncooked adds 3,900 (0.3 x 13,000), about 81 real seconds; cooked doubles it. It runs on real time, so a longer day makes it last more game hours.

Any Food Eaten level stops hunger rising at rest, and each level also speeds poison recovery by 0.00015 per frame unit :cite[(`BodyDamage.java:2261-2267`)]. Only levels 3 and 4 show on screen :cite[(`zombie/ui/MoodlesUI.java:440-444`)]. The timer ticks down and adds health each frame :cite[(`:2192-2196`)], and the levels come from the timer and `standardHealthFromFoodTime`, which is 1,600 :cite[(`zombie/characters/Moodles/Moodle.java:431-447`, `BodyDamage.java:84`)].

## Nutrition: calories, carbs, proteins, lipids, weight

Nutrition is a second system, switched on and off by the **Nutrition System** sandbox option.

**The code default is off** :cite[(`zombie/SandboxOptions.java:132`)]; the five built-in presets turn it on :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:64`, and the same line in `Extinction`, `Outbreak` and `Rising`; `SixMonthsLater` has it at line 39)]. A server's own settings decide. With it off, calories and weight stop changing, but food still adds to them :cite[(`IsoGameCharacter.java:5772-5776`)].

Starting values for a new player: calories 800, weight 80 kg, carbohydrates, proteins and lipids 0 :cite[(`Nutrition.java:58-62`)]. Weight can be set from traits at character creation (50, 60, 70, 95 or 105 kg).

| Value | Range | What drains it, per game hour (x weight / 80 for calories) |
|---|---|---|
| Calories | -2,200 to 3,700 | 57.6 at rest, 10.8 asleep, 280.8 walking, 468 running, 608 sprinting |
| Carbohydrates | -500 to 1,000 | 12.6 |
| Lipids | -500 to 1,000 | 4.1 |
| Proteins | -500 to 1,000 | 3.1 |
| Weight (kg) | 35 and up | see below |

Calories also scale with the thermoregulator's energy multiplier when resting or asleep (cold makes you burn more; see [Body temperature](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator)), and with a timed action's own calorie modifier. Swinging a weapon, climbing a fence or climbing through a window sets that modifier to 8, but only the resting formula uses it (moving and running reset it).

The drain is in `update`: it is off when the sandbox option is off, skipped for a character in god mode, and the drains are per game second so times 3600 per hour :cite[(`zombie/characters/BodyDamage/Nutrition.java:64-79`)]. The calorie drain is 0.016 rest, 0.003 asleep, 0.13 x 0.6 walking, 0.13 running, 0.13 x 1.3 sprinting, all x weight/80 :cite[(`:81-121`)]. Each value is clamped to its range :cite[(`:269-331`)], and `update` is called from the player update :cite[(`IsoPlayer.java:2172-2174`)].

### Gaining and losing weight

You gain weight when calories run high, lose it when they run low, and below 35 kg you start losing health.

- **You gain weight** when calories are above `1000 + (weight - 80) x 40`. The Weight Gain trait lowers the 1000 to 700 below 90 kg; Weight Loss raises it to 1800 above 70 kg. The gain is 1.3 x 10^-5 kg per game second, times calories / 4,000 (capped at 1, `Nutrition.java:147`), and doubled when carbohydrates or lipids are over 400, tripled over 700. At 2,000 calories that is about 0.56 kg a game day; at the 3,700 ceiling with carbs over 700, over 3 kg a day :cite[(`Nutrition.java:123-182`)].
- **You lose weight** when calories are below `(weight - 70) x 30`, or below 0 if that comes out positive. The loss is 8.5 x 10^-6 kg per game second times calories over 2,500 (capped at 1): at -1,000 calories about 0.3 kg a day; at the -2,200 floor about 0.65 kg a day.
- **Below 35 kg** weight stops at 35 and every update takes health off at the severe-moodle rate, firing `OnPlayerGetDamage` with the type `LOWWEIGHT` :cite[(`Nutrition.java:337-346`)].

Every 2,000 updates the weight is turned into a trait: 100 kg or more Obese; 85 up to 100 Overweight; above 65 up to 75 Underweight; above 50 up to 65 Very Underweight; 50 or less Emaciated. Between 75 and 85 kg you have none :cite[(`Nutrition.java:177-180`, `:222-247`)].

What the traits do is spread around: Obese x0.4, Overweight x0.7, Very Underweight x0.7, Emaciated x0.3 on endurance recovery :cite[(`IsoGameCharacter.java:4691-4705`)]; Fitness XP is blocked at Fitness level 9 or more with a weight trait, and at Fitness 6 or more when Emaciated, Obese or Very Underweight :cite[(`Nutrition.java:257-267`)]. Strength XP is x1.5 with proteins between 50 and 300 and x0.7 below -300 :cite[(`IsoGameCharacter.java:17796-17803`)].

**A dead branch:** the same endurance-recovery function also halves or cuts to a fifth the recovery when lipids or proteins fall below -1,000 or -1,500 :cite[(`IsoGameCharacter.java:4707-4718`)]. But the lipids and proteins setters clamp at -500, so those two branches can never fire :cite[(`Nutrition.java:285-298`, `:321-331`)].

Next: [Stress, panic, boredom and unhappiness](/pz/build-42/engine/character-stats/stress-panic-boredom-and-unhappiness).

:::callout[How we know]{kind=proof}
Everything here is read from the 42.22 Java and Lua; the running and Well Fed hunger oddities are read from code and not seen in play. Not verified:
- What a Well Fed character's hunger does in fast-forward or while all players sleep (the multiplier is 200 times larger there, `GameTime.java:971-972`); we have not traced the sleep fast-forward path.
- Whether the running and swinging hunger rates are intended; the code reads as given above.
- Food scripts' own numbers (the hunger change of a can of beans, and so on) come from item scripts, not from this capture's Java; see the item references.
:::
