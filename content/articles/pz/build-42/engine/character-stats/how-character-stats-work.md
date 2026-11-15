---
id: build-42-how-character-stats-work
slug: how-character-stats-work
title: 'How character stats work'
game: pz
version: build-42
section: engine
category: character-stats
difficulty: intermediate
tags:
  - engine
  - stats
  - multiplayer
  - saving
excerpt: >-
  What the 24 hidden numbers behind your survivor are, what moves them, why the server owns them in multiplayer, how they reach other players, and how they are saved.
last_updated: '2026-11-14'
related_articles:
  - hunger-thirst-and-nutrition
  - stress-panic-boredom-and-unhappiness
  - sickness-pain-and-other-stats
  - how-moodles-work
  - stats-and-moodles-reference
  - modding-stats-and-moodles
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [new players](#what-a-stat-is) | [server owners](#multiplayer-the-server-owns-the-numbers) | [modders](#what-moves-the-stats-each-frame)

:::callout[The 1-minute version]{kind=key}
- Every time your survivor gets hungry, jumpy or sore, one number crossed a line. Those numbers are the character stats: 24 plain decimal values, each with a fixed range and a starting value.
- The moodles in the top right of your screen are not the stats. They are a readout worked out from the stats each frame.
- Every write to a stat is clamped to its range, so nothing can push a stat out of range, from Java or Lua.
- Rates are a small constant times a per-frame multiplier, so they do not depend on frame rate. Many stats also cancel out day length; boredom, unhappiness, intoxication, panic and the "well fed" timer run on real time.
- In multiplayer only the server changes stats. It sends each player their own numbers once a second and sends other players only a few pieces.
- Stats are saved as a flat run of 24 floats, so the order of the list is part of the save format.
:::

:::facts
- **Stats** 24 in 42.22, ranges 0 to 1, 0 to 100, -1 to 1 and 20 to 40
- **Frame multiplier** 48 units per real second at normal speed
- **One game hour** 3.75 real minutes with the default 90-minute day
- **Hunger gain** about 0.035 per game hour for a rested survivor
- **Full stat sync** every 1,000 ms per player
:::

## What a stat is

A stat is one decimal number on a character, with a minimum, a maximum and a starting value.

Every character (player, zombie or animal) owns one `Stats` object. It holds a map from a stat to a float :cite[(`zombie/characters/Stats.java:24`)]. A stat is described by `CharacterStat`: an id, a minimum, a maximum and a default :cite[(`zombie/characters/CharacterStat.java:18-41`)]. Anything you have not set reads as its default, because `get` falls back to it :cite[(`zombie/characters/Stats.java:80`, `Stats.java:80`)].

Every write is clamped to the range: `Stats.set` runs the value through `stat.clamp(...)` before storing it :cite[(`Stats.java:84-89`)]. `add`, `remove` and `reset` all go through `set`, so there is no way to push a stat out of range, from Java or Lua. That matters in two places later: the temperature stat tops out at 40, and the nutrition values, which are not stats at all, have their own clamps.

| Group | Stats (range, default) |
|---|---|
| Needs | Hunger 0 to 1 (0), Thirst 0 to 1 (0), Fatigue 0 to 1 (0), Endurance 0 to 1 (1) |
| Mind | Stress 0 to 1 (0), Panic 0 to 100 (0), Boredom 0 to 100 (0), Unhappiness 0 to 100 (0), Idleness 0 to 1 (0), Anger 0 to 1 (0), Morale 0 to 1 (1), Sanity 0 to 1 (1), Nicotine withdrawal 0 to 0.51 (0) |
| Body | Pain 0 to 100 (0), Sickness 0 to 1 (0), Food sickness 0 to 100 (0), Poison 0 to 100 (0), Intoxication 0 to 100 (0), Fitness -1 to 1 (0) |
| Surroundings | Temperature 20 to 40 (37), Wetness 0 to 100 (0), Discomfort 0 to 100 (0) |
| Infection | Zombie fever 0 to 100 (0), Zombie infection 0 to 100 (0) |

The full list with what updates each one is in the [reference tables](/pz/build-42/engine/character-stats/stats-and-moodles-reference). Note the mixed scales: some stats run 0 to 1, others 0 to 100. A "Stress 0.5" and a "Panic 50" are not the same kind of half.

## What is not a stat

Three things you might expect to be stats are separate objects.

- **Nutrition** (calories, carbohydrates, proteins, lipids, body weight) is `BodyDamage.Nutrition`, owned by the player only :cite[(`zombie/characters/BodyDamage/Nutrition.java:24-29`)]. See [Hunger, thirst and nutrition](/pz/build-42/engine/character-stats/hunger-thirst-and-nutrition).
- **Health** is worked out from the body parts, not stored as a stat :cite[(`zombie/characters/BodyDamage/BodyDamage.java:2444-2457`)]. See [Body damage, wounds and infection](/pz/build-42/modding/engine/body-damage-wounds-and-infection).
- **Moodle levels** are derived each frame from the stats and cached in `Moodle` objects. See [How moodles work](/pz/build-42/engine/character-stats/how-moodles-work).

## What moves the stats each frame

There is no stat "tick" separate from the character update: each character's `update` calls `updateInternal` once per frame, and four steps run inside it in a fixed order.

Each character's `update` calls `updateInternal` once per frame :cite[(`zombie/characters/IsoGameCharacter.java:8886`)], and the order inside it is:

1. **Moodles first.** On a client, `moodles.Update()` runs for every non-zombie character :cite[(`IsoGameCharacter.java:9094`)]. On a server or in single player it runs after a few direct panic additions (agoraphobia, claustrophobia, bleeding) :cite[(`:9098-9123`)].
2. **The body.** `getBodyDamage().Update()` runs the thermoregulator, wetness, cold, boredom, strength, panic, discomfort and illness, then poison, pain and infection :cite[(`:9223-9226`; `zombie/characters/BodyDamage/BodyDamage.java:2141-2153`, `:2191-2437`)].
3. **Calculate stats.** `calculateStats()` runs endurance, thirst, stress, the awake or asleep stats (hunger, fatigue, idleness), morale and fitness :cite[(`IsoGameCharacter.java:9229`, `:10123-10137`)].
4. **Nutrition** is updated from the player update, not from `calculateStats` :cite[(`zombie/characters/IsoPlayer.java:2172-2174`)].

Two consequences you can use:

- **Moodle levels are one frame old when the body reads them.** The moodles update (step 1) runs before the body (step 2), so `BodyDamage` reasons with last frame's level.
- **A mod can replace step 3 wholesale.** `calculateStats` first asks the Lua hook `CalculateStats`; if any Lua function is registered on it, the whole block (endurance, thirst, stress, hunger, fatigue, morale, fitness) is skipped on the machine that runs it (the block includes `updateTripping` too). The hook returns true whenever a callback exists :cite[(`IsoGameCharacter.java:10129-10137`; `zombie/Lua/Event.java:32-75`)]. See [Modding stats and moodles](/pz/build-42/engine/character-stats/modding-stats-and-moodles).

All four steps live in the character update, the body update and the player update :cite[(`IsoGameCharacter.java:8886`, `:9094`, `:9098-9123`, `:9223-9230`, `:10123-10137`; `BodyDamage.java:2141-2153`; `IsoPlayer.java:2172-2174`; `zombie/Lua/Event.java:32-75`)].

## How fast: one rule for the rates

Almost every rate in the game is a small constant times a per-frame multiplier, so a rate does not depend on how fast your computer runs.

The multiplier, `GameTime.getMultiplier()`, is the real time of the frame scaled by game speed and by 0.8 :cite[(`zombie/GameTime.java:970-988`)]. The frame time is 60 divided by the frame rate :cite[(`zombie/FPSTracking.java:46`)]. At normal speed that works out to **48 units per real second**, however fast your computer runs. The 48 per second is derived: `getTimeDelta` is `multiplier / 0.8 / 60`, so a frame of `t` real seconds gives a multiplier of `48 t` at normal speed.

Many stats also multiply by `getDeltaMinutesPerDay()`, which is 30 divided by the day length in minutes (`30 / minutesPerDay`) :cite[(`GameTime.java:436-438`)]. Day length and that factor cancel out. So for those stats:

**change per game hour = constant x 3600**

(with the usual extra factors: the Stats Decrease sandbox option, traits, and the thermoregulator's multipliers). Hunger's constant is `0.0000032 x 3`, so a rested survivor gains about 0.035 hunger per game hour :cite[(`media/lua/shared/defines.lua:14`)]. That is the same on a 15-minute day and a 3-hour day.

The other group uses only the frame multiplier, with no day-length term. Boredom, unhappiness, intoxication, panic and the "well fed" timer are in that group: they run on **real time**, so a longer day does not slow them down. 

Where a number in this series says "per real second", this is why. With the default 90-minute day, one game hour is 3.75 real minutes. The default day length option is 4, which is 90 minutes :cite[(`SandboxOptions.java:413-423`; `api/sandbox_options.jsonl`, `DayLength`)].

The **Stats Decrease** sandbox option scales hunger, thirst and fatigue: x2.0, x1.6, x1.0 (default), x0.8, x0.65 for the five choices :cite[(`zombie/SandboxOptions.java:403-411`)].

The real seconds per frame are `0.016666668 * fpsMultiplier` :cite[(`:203` and `:1037` of `GameTime.java`)], `getMultiplier` applies the `* 0.8F` :cite[(`:970-988`)], and the rate constants are all defined in one Lua file :cite[(`media/lua/shared/defines.lua:1-63`, loaded by `zombie/ZomboidGlobals.java:57-95`)].

## Multiplayer: the server owns the numbers

In multiplayer only the server changes stats, and clients show whatever the server sends them.

- **Calculate stats skips clients.** `IsoPlayer.calculateStats` runs only when this is not a client :cite[(`IsoPlayer.java:3058-3062`)]. The awake and asleep stat updates run only on the server, or in single player for the local player :cite[(`IsoGameCharacter.java:10143`)]. Thirst has the same condition :cite[(`:10392`)].
- **The body skips clients too.** On a client, `BodyDamage.Update` returns straight away for any living player. For a remote player it first restores full health, so a client never plays out another player's injuries by itself :cite[(`BodyDamage.java:2106-2114`)].
- **Moodles run everywhere**, from whatever stat values that machine has :cite[(`IsoGameCharacter.java:9094`, `:9121`)].

How the numbers get to a player:

| Route | What it sends | How often | Code |
|---|---|---|---|
| `PlayerStats` packet | The player's whole `Stats` block, the Nutrition block, time since last smoke and the main body fields, to that player's own client | Every 1,000 ms per player | :cite[(`zombie/network/NetworkPlayerManager.java:17`, `:41-44`; `zombie/characters/NetworkPlayerAI.java:754-760`; `zombie/network/packets/character/PlayerStatsPacket.java:41-52`)] |
| `SyncPlayerStats` packet | Only the stats named in a bit mask, or the Nutrition block when the mask is -1 | When something happens: eating or drinking (hunger, thirst, endurance, stress, fatigue, pain), petting an animal, a fitness exercise, or a Lua call | :cite[(`IsoGameCharacter.java:5801-5812`, `:5948-5953`; `IsoPlayer.java:8820-8829`; `Fitness.java:194-196`; `zombie/Lua/LuaManager.java:11897-11901`)] |
| `BodyDamageUpdate` packets | To other players that are watching: overall health, the **Pain moodle level**, the fake-infection flag, the zombie infection value and the body parts | Every 500 ms for health, every 2,000 ms for damage | :cite[(`NetworkPlayerManager.java:16-18`; `zombie/network/BodyDamageSync.java:140-175`)] |

So another player's client does not get your hunger or stress. It gets the pieces above. Their moodles for you are worked out from the values it has, which for most stats are defaults (not verified in play).

The bit mask in `SyncPlayerStats` is one bit per stat, in the fixed order of `CharacterStat.ORDERED_STATS` (bit 0 is Anger, bit 23 is Zombie infection) :cite[(`SyncPlayerStatsPacket.java:36-44`)]. Several vanilla Lua scripts use old masks that no longer match; see [Modding stats and moodles](/pz/build-42/engine/character-stats/modding-stats-and-moodles).

A client can also *ask* to change stats, but only with the `CanModifyBodyStats` capability (an admin role). That is the debug and admin route :cite[(`SyncPlayerStatsPacket.java:22-28`; `LuaManager.java:11907-11920`)].

## How stats are saved

Stats are saved as a flat run of 24 floats, one per stat in `ORDERED_STATS` order, with no names and no header.

Stats are written and read back as that flat run :cite[(`Stats.java:52-63`, loaded by `:40-51`)]. The floats sit inside the character block of the save file, followed by the body damage and XP :cite[(`IsoGameCharacter.java:5381-5383`, load at `:5240-5242`)]. Nutrition is saved separately by the player: calories, proteins, lipids, carbohydrates, then weight :cite[(`Nutrition.java:184-190`; `IsoPlayer.java:1469`)].

Because the format is positional, the order of `ORDERED_STATS` is part of the save format. The body damage block also holds the cold, food-health timer, pain reduction and infection clocks :cite[(`BodyDamage.java:310-322`)]. Not saved in the stats block: the visible-zombie counters, the "tripping" flag and the pending effect timers (these are plain fields of `Stats` and the character, not in the stat map) :cite[(`Stats.java:27-38`)].

## Odd corners worth knowing

Some stats are almost decoration, anything can change a stat, and zombies and animals have their own stats objects.

- **Four stats are almost decoration.** Morale never moves off 1, Sanity has no reader in the engine, Anger is never raised, and the Sickness stat has no writer. Details in [Sickness, pain and other stats](/pz/build-42/engine/character-stats/sickness-pain-and-other-stats).
- **Stats can be changed by anything.** Vanilla Lua scripts change them directly, for example stress when crafting or hauling items :cite[(`media/lua/shared/TimedActions/ISCraftAction.lua:25`, `media/lua/client/TimedActions/ISInventoryTransferAction.lua:143`)].
- **Zombies and animals have stats objects too**, but animals run their own hunger and thirst through the animal systems :cite[(`zombie/characters/animals/datas/AnimalData.java:368-369`)]. This series covers players.

## Where to go next

Players: start with [Hunger, thirst and nutrition](/pz/build-42/engine/character-stats/hunger-thirst-and-nutrition), then [Stress, panic, boredom and unhappiness](/pz/build-42/engine/character-stats/stress-panic-boredom-and-unhappiness). Fatigue and endurance already have their own page: [Fatigue, sleep and endurance](/pz/build-42/gameplay/the-real-numbers/fatigue-sleep-and-endurance). Modders: [Modding stats and moodles](/pz/build-42/engine/character-stats/modding-stats-and-moodles).

:::callout[How we know]{kind=proof}
Every number comes from reading the 42.22 Java and Lua. Not verified in play: what another player's client shows for your stats (most are defaults). The 48 units per real second is derived from `getTimeDelta`, not read as a constant.
:::
