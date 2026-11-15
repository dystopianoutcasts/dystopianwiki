---
id: build-42-how-moodles-work
slug: how-moodles-work
title: 'How moodles work'
game: pz
version: build-42
section: engine
category: character-stats
difficulty: intermediate
tags:
  - engine
  - moodles
  - stats
  - ui
excerpt: >-
  How the icons on the right of your screen are worked out from your stats, when they change, what each level does, and which moodles can never reach their top level.
last_updated: '2026-11-14'
related_articles:
  - how-character-stats-work
  - hunger-thirst-and-nutrition
  - stress-panic-boredom-and-unhappiness
  - sickness-pain-and-other-stats
  - stats-and-moodles-reference
  - modding-stats-and-moodles
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#what-each-moodle-does-the-short-list) | [server owners](#moodles-in-multiplayer) | [modders](#from-stat-to-level)

:::callout[The 1-minute version]{kind=key}
- A moodle is the game telling you "this number crossed a line". It looks at a stat, or at something like your carry weight or your wounds, and answers with a level from 0 to 4. Level 0 hides the icon.
- Base game has 26 moodle types. Each character gets one `Moodle` object per type.
- Most moodles use an "above the line" ladder: the lowest line gives level 1, then 2, 3 and 4. A value exactly on a line is still the lower level.
- There is no smoothing, so a stat that bounces across a line flips the level up and down with it.
- Reading the code (not seen in play), some moodles can never reach their top level: Hyperthermia tops out at 2, and Windchill never shows level 1.
- In multiplayer each machine works out the level from the stats it has, so a moodle can lag behind what just happened to you.
:::

:::facts
- **Moodle types** 26 in the base game
- **Levels** 0 to 4 (0 is hidden)
- **Pain moodle** recalculates only every 120th update
- **Cant Sprint** level 1 for 300 updates, then clears
- **Icon sizes** 6, from 32 to 128 pixels
- **Windchill** levels seen: 2, 3 and 4 only
:::

## The 26 moodle types

A moodle type is an identifier registered at startup, and the base game registers 26.

The types are registered in one list :cite[(`zombie/scripting/objects/MoodleType.java:14-39`)]. Mods may register more, which has a catch; see [Modding stats and moodles](/pz/build-42/engine/character-stats/modding-stats-and-moodles).

| Group | Types |
|---|---|
| Needs | Hungry, Thirst, Tired, Endurance, Food Eaten |
| Mind | Panic, Stress, Bored, Unhappy, Angry, Drunk |
| Body | Sick, Pain, Injured, Bleeding, Has a Cold, Wet, Heavy Load |
| Surroundings | Hyperthermia, Hypothermia, Windchill, Uncomfortable, Noxious Smell |
| Special | Dead, Zombie (shown after death), Cant Sprint |

Every character gets one `Moodle` object per type when it is created :cite[(`zombie/characters/Moodles/Moodles.java:26-30`)]. A `Moodle` holds its type, its level (0 to 4), and, for the two temperature moodles, a chevron count and direction.

## From stat to level

Each frame, for each type, `Moodle.Update()` decides a level, and most moodles use one of a few shapes.

**The usual "above the line" ladder.** Four lines, called lowest, moderate, highest and maximum. The code checks them from the bottom up and the last one that holds wins:

| If the value is above | The level is |
|---|---|
| the lowest line | 1 |
| the moderate line | 2 |
| the highest line | 3 |
| the maximum line | 4 |
| none | 0 |

Hungry is the plain example: hunger above 0.15 is level 1, above 0.25 level 2, above 0.45 level 3, above 0.7 level 4 :cite[(`zombie/characters/Moodles/Moodle.java:153-170`; lines in `zombie/characters/Moodles/MoodleStat.java:19`)]. The lines for each moodle live in `MoodleStat` as five numbers: a "minimum" and the four lines :cite[(`MoodleStat.java:16-35`)]. The comparison is strictly "above", so a value exactly on a line is still the lower level. The Uncomfortable and Heavy Load moodles are the exceptions: levels 2 to 4 use "at or above" :cite[(`Moodle.java:386-394`, `:544-555`)].

**Backwards.** Endurance runs the other way: 0.75, 0.5, 0.25 and 0.1 are lines you fall *below* :cite[(`Moodle.java:106-119`)].

**Counting.** Bleeding is simply the number of bleeding body parts, up to 4, and 4 if the neck is bleeding :cite[(`Moodle.java:280-289`)].

**Not a stat at all.** Heavy Load is the weight you carry divided by your carry limit :cite[(`:381-396`)]. Injured is 100 minus your health :cite[(`:328-344`)]. Has a Cold reads the cold strength. Food Eaten reads the Well Fed timer. Windchill reads the climate. Noxious Smell reads the corpse sickness rate and whether the building is toxic.

**Mixed.** Stress reads stress plus nicotine withdrawal :cite[(`:249-260`)], and Sick reads the larger of food sickness, zombie fever and zombie infection, divided by 100, plus the Sickness stat :cite[(`:191-209`)].

The whole decision is made in one method (`Update`), with the lines per moodle in `MoodleStat` and the loop over every type in `Moodles` :cite[(`Moodle.java:90-579`, `MoodleStat.java:16-35`, `Moodles.java:65-71`)]. All the numbers are in the [reference](/pz/build-42/engine/character-stats/stats-and-moodles-reference).

### Guard rails

Four rules stop a moodle from being worked out in the normal way.

- **Dead characters.** If the character is dead, every moodle drops to 0 except Dead and Zombie :cite[(`Moodle.java:92-94`)].
- **Only while alive.** Most moodles are worked out only when the body health is not 0; otherwise they stay at 0 :cite[(for example `Moodle.java:134`, `:153`, `:172`)].
- **Pain is slow.** The Pain moodle recalculates only every 120th update and holds its old level in between :cite[(`Moodle.java:346-352`)]. So a sudden hit shows up on the Pain moodle up to a couple of seconds later.
- **Cant Sprint is a timer.** When the game flags it, the moodle sits at level 1 for 300 updates, wiggling, and then clears itself :cite[(`Moodle.java:95-104`)].

## When the level is recalculated

Every character update calls `Moodles.Update` once, so a level is never more than one frame old.

On a **client**, it runs for every non-zombie character it can see, including other players, using whatever stats the client holds. On a **server or in single player** it runs for each non-zombie after the stat changes for panic from phobias and bleeding :cite[(`zombie/characters/IsoGameCharacter.java:9094-9123`)]. It runs before the body damage update in the same frame, so the body reads the level from the last frame :cite[(`IsoGameCharacter.java:9223-9226`)].

There is no smoothing. A stat that bounces across a line flips the level up and down with it. A single change can jump several levels at once (a heavy pickup, a sudden poison).

If any level changed, the character's moodle UI is told to refresh :cite[(`Moodles.java:65-71`, `:52-59`)]. Death updates the moodles once more so Dead or Zombie appears :cite[(`zombie/characters/IsoPlayer.java:6594-6596`)].

## What the screen does with a level

The moodle bar is `MoodlesUI`, which keeps the display state for each type and re-sorts when told to refresh :cite[(`zombie/ui/MoodlesUI.java`)].

- **Level 0 is hidden.** Every type at level above 0 gets a slot, down the right edge. Food Eaten only shows from level 3 up :cite[(`MoodlesUI.java:440-446`)].
- **Color.** Good moodles run from gray toward the "good" highlight color as the level rises, bad ones toward the "bad" highlight color, by level / 4. In vanilla only **Food Eaten is good**; every other moodle counts as bad :cite[(`Moodles.java:95-97`; `MoodlesUI.java:309-331`)].
- **Wiggle.** When a moodle's level changes, its icon wiggles and then settles. Code can wiggle one on purpose, and combat does it when the moodle is costing you something :cite[(`MoodlesUI.java:402-410`, `:450`; `zombie/CombatManager.java:833-875`)].
- **Blinking.** If the player picks a moodle to blink in the options, its icon pulses :cite[(`MoodlesUI.java:335-349`)].
- **Tooltip.** Mouse-over shows the level's name and its description, read from the translation keys `Moodles_<Name>_lvl<N>` and `Moodles_<Name>_desc_lvl<N>` :cite[(`Moodles.java:73-93`; `MoodlesUI.java:376-391`)]. Names live in `media/lua/shared/Translate/EN/Moodles.json`.
- **Size.** Icons come in six sizes, 32 to 128 pixels, from the Moodle Size option :cite[(`MoodlesUI.java:46`, `:81-95`)].
- **Icons.** One icon per type, fixed in code :cite[(`zombie/ui/MoodleTextureSet.java:28-53`)]. The icon does not change with level; only the background color does.
- **Chevrons.** Hyperthermia and Hypothermia keep a chevron count (0 to 3) and direction from the thermoregulator :cite[(`Moodle.java:449-465`)]. We found no code in `MoodlesUI` that draws them, so in 42.22 they are data only (not verified in play).
- **Sound.** An audio parameter per moodle feeds the sound engine the level divided by 4, including Panic for the music :cite[(`zombie/audio/parameters/ParameterMoodles.java:85`; `zombie/audio/MusicThreatStatuses.java:74`)].

## Moodles that cannot reach their top level

Some moodles have levels the code never produces; we read this from the code without seeing each in play.

- **Hyperthermia 3 and 4.** They need a temperature above 40 and 41, but the Temperature stat is clamped to 40. So Hyperthermia tops out at level 2. The [temperature page](/pz/build-42/modding/engine/body-temperature-and-the-thermoregulator) reached the same conclusion; it holds in 42.22 :cite[(`Moodle.java:467-488`; `CharacterStat.java:36`)].
- **Windchill 1.** The code sets level 1 above 15, level 2 above 10, then level 3 above 15 again. Anything above 15 is overwritten by level 3, so levels seen are 2 (above 10), 3 (above 15) and 4 (above 20). Windchill below 10 shows nothing and level 1 never appears :cite[(`Moodle.java:525-542`)].
- **Hypothermia's third number.** `MoodleStat` stores 30, 70, 9 and 100 for Hypothermia, but the code uses hard-coded temperatures (36.5, 35, 30, 25) and only the 30 and 70 as drunkenness limits. The 9 and the 100 are never read :cite[(`MoodleStat.java:33`; `Moodle.java:496-523`)].
- **Dead level 1 to 3.** Dead and Zombie have only a level 4 and a single translation key :cite[(`Moodles.json:70-71`)].

## What each moodle does: the short list

Moodles are read all over the engine, and the big ones are below with what each level does.

Per-level detail is in the [reference](/pz/build-42/engine/character-stats/stats-and-moodles-reference).

| Moodle | Main effects | Code |
|---|---|---|
| Endurance | Level 2: no sprinting. Level 3: no running. Walk speed x0.95, 0.9, 0.8, 0.6; base speed -0.15 per level; melee speed -0.07 per level | :cite[(`IsoGameCharacter.java:13525`, `:13551`; `IsoPlayer.java:1048-1060`; `IsoGameCharacter.java:9710`, `:9808`)] |
| Heavy Load | Same speed and melee penalties; fall and climb chances worse; at level 3 or 4 while moving, health damage and back strain | :cite[(`BodyDamage.java:2301-2314`)] |
| Hungry, Thirst, Sick, Bleeding, Injured | Lower your carry limit; slower or no healing; at level 4, health damage | :cite[(`BodyDamage.java:2011-2081`; `:2198-2231`, `:2275-2299`)] |
| Panic, Stress, Tired, Drunk | Ranged to-hit penalties; Panic and Stress cut melee damage by 0.1 per level from level 2; Drunk and Unhappy make every timed action take (1 + level / 4) times as long | :cite[(`CombatManager.java:2593-2613`; `:868-875`; `ISBaseTimedAction.lua:99-105`)] |
| Pain | Blocks sleep from level 2; harder climbing; delays falling asleep | :cite[(`ISWorldObjectContextMenuLogic.java:4207`; `IsoGameCharacter.java:16712`)] |
| Food Eaten | Stops hunger rising at rest; speeds poison recovery; at level 3 blocks eating more | :cite[(`IsoGameCharacter.java:10194`; `ISEatFoodAction.lua:14`)] |
| Wet, Hypothermia, Hyperthermia | Add 0.1 per level to discomfort | :cite[(`BodyDamage.java:3209-3211`)] |
| Windchill, Angry, Bored | Little or nothing in the engine beyond the sound parameter and, for Bored, feeding Unhappiness | :cite[(`BodyDamage.java:1969-1977`)] |

Moodle effects on aim use the Firearm Moodle Multiplier sandbox option (0 to 10, default 1): `0` turns the penalties off :cite[(`CombatManager.java:2613`; `api/sandbox_options.jsonl`)].

## Moodles in multiplayer

Each machine works out the moodle level for a character from the stats that machine has, so what you see can lag or differ.

For your own character that is the stats the server last sent you, once a second plus the immediate updates after eating or drinking (see [How character stats work](/pz/build-42/engine/character-stats/how-character-stats-work)). That is why a moodle can lag behind what just happened to you. For other players, the client gets only a few values (health, Pain level, infection), so moodles it shows for them are not reliable (not verified in play).

:::callout[How we know]{kind=proof}
All of this comes from reading the 42.22 Java and Lua. Not verified:
- Whether the chevrons are drawn anywhere (we searched Java and Lua for readers and found none).
- Whether any vanilla or common mod code calls `Moodle.Update` directly.
- The exact in-game order of the icons: the UI keeps them in a hash map, so the order is not defined by the code we read.
- Whether moodles on other players are reliable, and whether each unreachable level is truly unseen in play.
:::
