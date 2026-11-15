---
id: build-42-modding-stats-and-moodles
slug: modding-stats-and-moodles
title: 'Modding stats and moodles'
game: pz
version: build-42
section: engine
category: character-stats
difficulty: advanced
tags:
  - engine
  - modding
  - stats
  - moodles
  - lua
  - multiplayer
excerpt: >-
  How to read and change hunger, panic, pain and the rest from Lua, which side must do it in multiplayer, and why a custom moodle cannot work without Java.
last_updated: '2026-11-14'
related_articles:
  - how-character-stats-work
  - hunger-thirst-and-nutrition
  - stress-panic-boredom-and-unhappiness
  - sickness-pain-and-other-stats
  - how-moodles-work
  - stats-and-moodles-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders reading and changing stats](#read-a-stat) | [server owners](#which-side-must-make-the-change) | [modders who want a custom moodle](#adding-a-custom-moodle)

:::callout[The 1-minute version]{kind=key}
- A stat is one call to read (`stats:get`) and one to change (`set`, `add`, `remove`). Every write is clamped to the stat's range.
- In multiplayer the server owns the stats. A change made on a client is overwritten by the full stats block the server sends each player, and sync masks for the server's `syncPlayerStats` should be built with `getBitMaskForStat`.
- Several vanilla scripts use old sync masks that point at different stats than their comments say.
- A `Hook.*` is not a normal event: if any function is registered, the engine treats the hook as handled and ignores your return value. `Hook.CalculateStats` replaces the whole stat block on that machine.
- A custom stat is not saved or synced. A custom moodle can be registered but can never show, because its level stays at 0 and it has no icon or thresholds (this follows from the code; not tested).
- Moodle thresholds, levels, icons and the formulas behind each level are fixed in Java.
:::

:::facts
- **Stat constants** 24 on `CharacterStat`
- **Moodle levels** 0 to 4
- **Full stats packet** every 1,000 ms per player
- **Panic drain in the example** engine drains about 1.8 per real second; the example removes 40 a game minute
- **Stats Decrease** x2 to x0.65
:::

If you want a food that calms the nerves, a trait that makes you hungrier, or a status icon of your own, you are working with the stats and the moodles. Most of it is easy; a few things are shut, and one of them (a moodle of your own) is a trap in the current cookbook page. Read [How character stats work](/pz/build-42/engine/character-stats/how-character-stats-work) first if "server owns the numbers" is new to you.

Nothing here was run in a game; the claims come from the 42.22 code, and the example is checked against the exposed API, not played.

## Read a stat

Every character has `getStats()`, and a stat is named by a constant on `CharacterStat`.

```lua
local stats = player:getStats()
local hunger = stats:get(CharacterStat.HUNGER)   -- 0 to 1
local panic  = stats:get(CharacterStat.PANIC)    -- 0 to 100
```

- `player` is any `IsoPlayer`. In single player, `getPlayer()` gives you the first one.
- `CharacterStat.HUNGER` is one of 24 constants (the full list with ranges is in the [reference](/pz/build-42/engine/character-stats/stats-and-moodles-reference)). They are exposed to Lua as static fields :cite[(`api/lua_exposed.jsonl`, class `zombie.characters.CharacterStat`)].
- Always check the range for the stat you read: hunger runs 0 to 1, panic 0 to 100.

## What is exposed on `Stats`

Lua can read a stat, set it, add to it, remove from it, reset it and check its range.

All of these are callable from Lua :cite[(`api/lua_exposed.jsonl`, class `zombie.characters.Stats`; source `zombie/characters/Stats.java`)].

| Call | What it does | Code |
|---|---|---|
| `get(stat)` | The value (the stat's default if never set) | :cite[(`:80`)] |
| `set(stat, value)` | Set it, clamped to the range. Returns true if it changed | :cite[(`:84`)] |
| `add(stat, amount)` | `set(stat, current + amount)` | :cite[(`:91`)] |
| `remove(stat, amount)` | `add(stat, -amount)` | :cite[(`:95`)] |
| `reset(stat)` | Set it to the default | :cite[(`:99`)] |
| `isAtMinimum(stat)`, `isAtMaximum(stat)`, `isAboveMinimum(stat)` | Range checks | :cite[(`:103-111`)] |
| `getNicotineStress()` | Stress plus nicotine withdrawal, capped at 1 | :cite[(`:133`)] |
| `resetStats()` | Every stat back to its default | :cite[(`:115`)] |

Because every write is clamped, you cannot push a stat past its range. `add(CharacterStat.HUNGER, 5)` leaves hunger at 1.

For **nutrition** use `player:getNutrition()`: `getCalories`, `setCalories`, `getCarbohydrates`, `getProteins`, `getLipids`, `getWeight`, `setWeight`, and the setters :cite[(`api/lua_exposed.jsonl`, class `zombie.characters.BodyDamage.Nutrition`)]. The setters clamp :cite[(`Nutrition.java:269-346`)].

For **moodle levels** use `player:getMoodles():getMoodleLevel(MoodleType.PANIC)`, which returns 0 to 4, or the shortcut `player:getMoodleLevel(MoodleType.PANIC)` on a player :cite[(`Moodles.java:44-46`; `IsoPlayer.java:8251-8253`)]. The other exposed `Moodles` calls are `getMoodleDisplayString`, `getMoodleDescriptionString`, `isMaxMoodleLevel`, `getGoodBadNeutral`, `setMoodlesStateChanged` and `UI_RefreshNeeded` :cite[(`Moodles.java:32-63`)].

## A complete small example

This example takes 40 points off panic once per game minute for anyone at Panic level 2 or more (panic above 30), and it works in single player and on a server.

Goal: once per game minute, if the player is Alarmed or worse (Panic moodle level 2 or more, panic above 30), take 40 points off panic.

**Set up the mod first.** Follow the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): a mod folder with a mandatory (even if empty) `common/` folder and a `42/` folder holding `mod.info`. Then save the script as `42/media/lua/server/CalmUnderPressure.lua` inside it, and enable the mod in the game (or server) mod list. (The folder layout comes from the skeleton page, not from this capture.)

The engine drains panic by itself at about 1.8 per real second, so a small change hides. The example removes 40 a minute and also shows a message so you can see it work:

```lua
-- 42/media/lua/server/CalmUnderPressure.lua
-- Once per game minute, take the edge off panic for anyone at Panic level 2 or more.
-- The "server" folder also loads on multiplayer clients, so the first line of the
-- handler stops clients from running it. In single player isClient() is false,
-- so the code runs there too.

local PANIC_RELIEF = 40  -- panic points removed per game minute (large on purpose, so you can see it)

local function calmPlayer(player)
    if player == nil or player:isDead() then return end

    -- Panic moodle level 2 means panic is above 30 (MoodleStat.PANIC: 6, 30, 65, 80).
    if player:getMoodles():getMoodleLevel(MoodleType.PANIC) >= 2 then
        player:getStats():remove(CharacterStat.PANIC, PANIC_RELIEF)
        print("CalmUnderPressure: calmed " .. tostring(player:getUsername()))   -- goes to console.txt
        -- Floating text over the head. transmitHaloNote, not setHaloNote: on a server it sends
        -- the note to the clients, and in single player it shows it locally
        -- (zombie/characters/IsoGameCharacter.java:7023-7034). setHaloNote alone only changes
        -- the copy on the machine that runs it, so on a dedicated server nobody would see it.
        player:transmitHaloNote("Calmer")    -- default display time, the form vanilla uses at media/lua/shared/Moveables/ISMoveableSpriteProps.lua:2369

        -- On a dedicated server, tell that player's client the new value now,
        -- instead of waiting up to one second for the next full stats packet.
        if isServer() then
            local mask = SyncPlayerStatsPacket.getBitMaskForStat(CharacterStat.PANIC)
            syncPlayerStats(player, mask)
        end
    end
end

local function everyMinute()
    if isClient() then return end   -- multiplayer clients do nothing

    if isServer() then
        local players = getOnlinePlayers()          -- Java ArrayList of IsoPlayer
        for i = 0, players:size() - 1 do
            calmPlayer(players:get(i))
        end
    else
        for i = 0, getNumActivePlayers() - 1 do     -- single player (and split screen)
            calmPlayer(getSpecificPlayer(i))
        end
    end
end

Events.EveryOneMinute.Add(everyMinute)
```

Line by line:

- `isClient()` is true only on a multiplayer client. `isServer()` is true only on a dedicated server. Single player is false for both, so the `else` branch covers it. The [multiplayer page](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer) explains why `if isClient() then return end` is the right guard.
- `getMoodleLevel(MoodleType.PANIC)` is the level 0 to 4. Using the moodle level keeps your threshold in step with the engine's.
- `remove(CharacterStat.PANIC, 40)` lowers panic by 40, never below 0. `print` writes a line to `console.txt` (in your Zomboid user folder; on a server, the server console log). `setHaloNote` shows the floating text over the character.
- `getBitMaskForStat` is a static method on `SyncPlayerStatsPacket`, exposed to Lua :cite[(`SyncPlayerStatsPacket.java:36`)]. `syncPlayerStats` sends the named stats to that player, only on a server :cite[(`zombie/Lua/LuaManager.java:11893-11901`)].
- `Events.EveryOneMinute` fires once per game minute :cite[(`zombie/Lua/LuaEventManager.java:709`)].

To test: load a save, run at a zombie until the Panic icon shows Alarmed (level 2, panic above 30), and wait up to one game minute. You should see "Calmer" and the console line. If nothing happens, search `console.txt` for errors and check the file is in `42/media/lua/server/`.

## Which side must make the change

In multiplayer the server owns the stats, so a change has to be made on the server and then synced.

(See the first article for the code.) That decides everything:

| You want to | Do it | Code |
|---|---|---|
| Change a stat for a player | On the server, in a server file or a timed action's `complete()`, then call `syncPlayerStats` | |
| Change a stat from a client | It will be overwritten. The server sends the whole stats block to each player every 1,000 ms and the client loads it over its own values | :cite[(`NetworkPlayerManager.java:17`, `:41-44`; `PlayerStatsPacket.java:56-69`)] |
| Ask the server from an admin tool | `sendPlayerStat(player, stat)` or `sendPlayerNutrition(player)`; they work only for a role with the `CanModifyBodyStats` capability | :cite[(`LuaManager.java:11903-11921`; `SyncPlayerStatsPacket.java:22-28`)] |
| Change nutrition and sync it | `syncPlayerStats(player, -1)` on the server sends the Nutrition block | :cite[(`SyncPlayerStatsPacket.java:65-67`, `:85-87`)] |

**The bit mask.** `syncPlayerStats(player, mask)` takes one bit per stat, in `ORDERED_STATS` order: Anger is bit 0, Boredom 1, Discomfort 2, Endurance 3, Fatigue 4, Fitness 5, Food sickness 6, Hunger 7, Idleness 8, Intoxication 9, Morale 10, Nicotine 11, Pain 12, Panic 13, Poison 14, Sanity 15, Sickness 16, Stress 17, Temperature 18, Thirst 19, Unhappiness 20, Wetness 21, Zombie fever 22, Zombie infection 23. **Always build the mask with `getBitMaskForStat`.** Add masks together to send several stats.

### Stale masks in vanilla Lua

Several vanilla scripts still send masks from an older stat order, so in 42.22 they point at different stats than their comments say.

| Script | Mask and comment | What bit it really is |
|---|---|---|
| `shared/TimedActions/ISApplyBandage.lua:107-108`, and the cataplasm, burn-clean, bullet, glass and stitch actions | `0x00000100`, "Stat_Panic" | Bit 8, **Idleness**. Panic is bit 13 (`0x2000`) |
| `server/Farming/SFarmingSystem.lua:502-503` | `0x00000002`, "Stat_Endurance" | Bit 1, **Boredom**. Endurance is bit 3 (`0x8`) |
| `shared/TimedActions/ISDrinkFromBottle.lua:82` | `SyncPlayerStatsPacket.Stat_Thirst` | No such field on the exposed class (only `getBitMaskForStat`, `parse`, `setData`, `write`), so it is nil in Lua. We did not check how `syncPlayerStats` treats nil |

The effect is that those actions apply their change on the server but sync a different stat to the player, so a player might not see the new panic or endurance until the next one-second full sync. This matches the engine side as far as we read; we have not watched a game. Copy the style, not the numbers.

## Events and hooks that matter

Slow stat rules belong in a game-time event, and a `Hook.*` replaces engine code instead of adding to it.

| Name | Kind | When | Notes | Code |
|---|---|---|---|---|
| `Events.OnPlayerUpdate` | event | Every update of a player | Cheap handlers only | :cite[(`IsoPlayer.java:2298`)] |
| `Events.EveryOneMinute`, `EveryTenMinutes`, `EveryHours` | event | Game time | Best place for slow stat rules | :cite[(`LuaEventManager.java:709-712`)] |
| `Events.OnPlayerGetDamage(character, type, amount)` | event | When the body takes health loss | Types fired by the stat code: `POISON`, `HUNGRY`, `SICK`, `BLEEDING`, `THIRST`, `HEAVYLOAD`, `INFECTION`, plus `LOWWEIGHT`. See [Body damage, wounds and infection](/pz/build-42/modding/engine/body-damage-wounds-and-infection) | :cite[(`BodyDamage.java:2317-2339`, `:2369`, `:2382`; `Nutrition.java:342`)] |
| `Events.OnSleepingTick(i, hours)` | event | During sleep | | :cite[(`LuaEventManager.java:845`)] |
| `Hook.AutoDrink.Add(fn)` | hook | Before the character auto-drinks | Any registered function **cancels the default auto drink** | :cite[(`IsoGameCharacter.java:11660`)] |
| `Hook.CalculateStats.Add(fn)` | hook | Before the stat block | Any registered function **replaces the whole calculation on that machine** | :cite[(`IsoGameCharacter.java:10129`)] |

**Be careful with `Hook.*`.** A hook is not a normal event. The engine runs your functions and treats the hook as "handled" whenever any function is registered; the return value is ignored, because the hook always returns true when callbacks exist :cite[(`zombie/Lua/Event.java:32-75`)]. (The published [Lua events page](/pz/build-42/modding/reference/lua-events) says hook handlers return an answer to Java; that is wrong, and is being fixed.) With `Hook.CalculateStats`, the skipped block is endurance, tripping, thirst, stress, hunger, fatigue, idleness, morale and fitness :cite[(`IsoGameCharacter.java:10129-10137`)]. It is **per machine**: clients never run `calculateStats` for players :cite[(`IsoPlayer.java:3058-3062`)] and zombies override it as a no-op :cite[(`IsoZombie.java:3465`)], so the hook belongs on the server (and single player). If you register it you must do all of that yourself. For tweaks, use `EveryOneMinute` or the tuning levers below.

For events listed with their parameters see the [Lua events reference](/pz/build-42/modding/reference/lua-events).

## Tuning without Java

Four levers change stat rates without touching Java: sandbox options, the `ZomboidGlobals` constants, `BodyDamage` setters and traits.

These are real levers, all from the code. We have not tested each in a game.

1. **Sandbox.** Stats Decrease (x2 to x0.65) scales hunger, thirst and fatigue :cite[(`SandboxOptions.java:403-411`)]. Nutrition System turns calories and weight on or off :cite[(`:132`)]. Decaying Corpse Health Impact, Firearm Moodle Multiplier and Wound Infection Damage Factor are also options :cite[(`api/sandbox_options.jsonl`)].
2. **`ZomboidGlobals`.** The rate constants live in a Lua table, `ZomboidGlobals`, defined in `media/lua/shared/defines.lua:1-63`. Java copies them into static fields in `ZomboidGlobals.Load()`, which runs after the Lua files have loaded :cite[(`zombie/GameWindow.java:989-990`; `zombie/ZomboidGlobals.java:57-95`; `zombie/core/Core.java:3558`; `zombie/network/GameServer.java:1545`)]. So a shared Lua file that runs at load time can edit `ZomboidGlobals.HungerIncrease` and the like, and Java will pick up the new number. Values must stay numbers (the loader casts them to `Double`). Edit at load time, not later: `Load()` also runs again when the game returns from a session to the menu :cite[(`zombie/gameStates/IngameState.java:1083`)], so keep the edit in a file that runs at load; we found no re-read in the middle of a session.
3. **`BodyDamage` setters.** Exposed on `player:getBodyDamage()`: `setPanicIncreaseValue`, `setPanicReductionValue`, `setDrunkIncreaseValue`, `setDrunkReductionValue`, `setInfectionGrowthRate`, `setStandardHealthAddition`, `setHealthFromFood`, `setHealthReductionFromSevereBadMoodles`, `setStandardHealthFromFoodTime`, `setPainReduction`, `setColdReduction`, `setHealthFromFoodTimer` :cite[(`api/lua_exposed.jsonl`; defaults at `BodyDamage.java:72-100`)]. On a server these must be set on the server's copy of the body.
4. **Traits.** Many rates already read traits (Hearty Appetite, Light Eater, High Thirst, Brave, Cowardly and so on), so a trait is often the cleaner route than an override.

## Adding a custom stat

A custom stat can be created from Lua, but it is not saved and not synced.

`CharacterStat.register(id, min, max, default)` is exposed, so Lua can create a stat object, and `Stats.get`, `set` and `add` accept it :cite[(`api/lua_exposed.jsonl`, class `CharacterStat`, method `register`; `CharacterStat.java:80-82`)]. But **a custom stat is not saved and not synced**: saving and syncing walk the fixed `ORDERED_STATS` array and nothing else :cite[(`Stats.java:40-63`, `SyncPlayerStatsPacket.java:36-44`)]. It lives in memory on whichever machine you set it on and is gone at the next save and load. Keep a durable value in the player's mod data instead and copy it in at login. (This follows from the code; not tested.)

## Adding a custom moodle

You can register a custom moodle type, but it can never show on screen.

**What the current cookbook says.** The [Custom moodle](/pz/build-42/modding/cookbook/custom-moodle) page shows `MoodleType.register("mymod:Focused")` in `media/registries.lua`, strings in `Moodles.json`, and marks the behavior as unknown. Here is the 42.22 answer for the unknown part, and four corrections.

**What works.** `MoodleType.register("mymod:Focused")` in `42/media/registries.lua` registers the type. A mod's `registries.lua` is run by `ModRegistries.init` :cite[(`zombie/scripting/objects/ModRegistries.java:16-31`; `zombie/core/Core.java:3528`; `zombie/gameStates/IngameState.java:1053`)]. The id needs a namespace: a bare `"Focused"` has the namespace `base` and is rejected :cite[(`MoodleType.java:67-69`; `RegistryReset.java:22-29`; `ResourceLocation.java:33-36`)]. Every character then gets a `Moodle` object for it :cite[(`Moodles.java:26-30`)].

**What does not work: it can never show.** Three separate reasons, each enough on its own:

1. `Moodle.Update` has a branch for each built-in type and none for yours. A custom moodle's level stays at 0 forever, because there is no default branch :cite[(`Moodle.java:90-579`)]. There is no Lua setter for a level: `Moodle` is exposed only with its constructor, `getLevel`, `getMoodleType`, `Update` and the chevron calls, and `Moodles` has no call that returns a `Moodle` object :cite[(`api/lua_exposed.jsonl`)].
2. The thresholds table `MoodleStat` is private to Java and not exposed to Lua, so you cannot add lines for your type :cite[(`MoodleStat.java:14-35`)].
3. The icons are a fixed table in code. A custom type has no texture, so `MoodleTextureSet.getTexture` returns null :cite[(`zombie/ui/MoodleTextureSet.java:28-57`)]. The UI would fail on it if the level were ever above 0 :cite[(`MoodlesUI.java:334`, `:373-375`)].

**Corrections to the cookbook page** (all read from code; marked not tested):

- `getMoodles():getMoodle(...)` does not exist. `Moodles` exposes no such call :cite[(`Moodles.java:32-63`)].
- The translation keys are `Moodles_<id>_lvl<N>` and `Moodles_<id>_desc_lvl<N>` :cite[(`Moodles.java:80`, `:91`)]. The recipe's `Moodles_mymod_Focused_desc1` has the wrong shape. And `<id>` is the string you registered, so for `"mymod:Focused"` the key is `Moodles_mymod:Focused_lvl1`, with the colon, not an underscore, because the registry stores the raw string as the translation name :cite[(`MoodleType.java:68`)].
- The "GAP" in the recipe is now closed: there is no behavior to wire from Lua. Registration is harmless but pointless on its own.
- The extra B42 icons the recipe lists (Concentrating, Dizzy and so on) are not referenced by any code we found, since the texture set loads a fixed list :cite[(`MoodleTextureSet.java:28-53`)].

**What to do instead.** Draw your own small status icon with the UI classes ([Custom UI](/pz/build-42/modding/cookbook/custom-ui)): an `ISUIElement` that reads your own value each frame and shows or hides a texture. You get your own position and look, but not the engine's moodle bar, wiggle, tooltip or colors. If you need a real, engine-level moodle, that is a Java patch. Mods that ship one replace classes in the install directory (the capability tier L3, high cost) and must be kept in step with every game patch.

## What cannot be changed without Java

Thresholds, what each level does, the stat list and the sync list are all fixed in Java.

- **Moodle thresholds, levels and icons.** All hard-coded (`MoodleStat.java`, `Moodle.java`, `MoodleTextureSet.java`). The numbers in the [reference](/pz/build-42/engine/character-stats/stats-and-moodles-reference) are final.
- **What a level does.** Carry limits, speed, aim and damage penalties are fixed inside `BodyDamage`, `IsoGameCharacter`, `CombatManager` and others. You can change the inputs (stats, constants), not the formulas.
- **The stat list, ranges and defaults.** `CharacterStat` is a fixed class; the save order depends on it.
- **How pain climbs, how fast Food Sickness grows, and the other shaped formulas.** Only their constants (see the levers above) are reachable.
- **Per-player-vs-others sync.** What other players see of you (health, Pain level, infection) is fixed in `BodyDamageSync`.

:::callout[How we know]{kind=proof}
Everything here is read from the 42.22 Java and Lua; nothing was run in a game. Not verified:
- Every lever above, in an actual game.
- What `syncPlayerStats` does when passed nil (the `Stat_Thirst` case).
- Whether `CharacterStat.register` is reachable from `registries.lua` or only from normal Lua files, and how it behaves in multiplayer.
:::
