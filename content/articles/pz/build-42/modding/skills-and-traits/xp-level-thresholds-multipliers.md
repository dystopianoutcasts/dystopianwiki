---
id: build-42-xp-level-thresholds-multipliers
slug: xp-level-thresholds-multipliers
title: 'XP, level thresholds & multipliers'
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - skills
  - traits
  - professions
  - xp
  - craftrecipe-gating
excerpt: >-
  How Build 42.22 turns XP into levels: the cost of each level, the order of the multipliers, the calls that grant XP, and which side (single player, client, server) does the work.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - the-build-42-skill-list
  - b41-b42-skill-changes
  - learning-paths
  - the-xp-grant-skill-query-lua-api
  - modding-add-a-skill
  - how-fast-skills-level
  - sandbox-options-character
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

The player-sized version of this page, with worked examples, is [How fast skills level](/pz/build-42/gameplay/the-real-numbers/how-fast-skills-level). This page is the modder's view: the calls, the order, and who runs them.

:::callout[The 1-minute version]{kind=key}
- A normal skill needs 32,775 XP in total to reach level 10. Strength and Fitness need 487,500.
- One function, `IsoGameCharacter.XP.AddXP`, does all the work. It multiplies the gain by a starting-level factor, the learner and other traits, a skill-book multiplier and the sandbox multiplier, in that order, and then clamps the total.
- In single player the call runs on your machine. On a dedicated server the server runs it. On a multiplayer client the Lua `addXp` function does nothing, so a mod must grant XP on the server. The Java `AddXP` does run on a client for its own player, and the server's next XP record replaces that result (read from the code, not tested).
- The server sends the whole XP record to each client about once a second, so a client's levels follow the server's.
- The two "no multiplier" calls are not the same: the Lua `addXpNoMultiplier` skips the whole boost step (starting level, traits, skill book and sandbox), and the Java `AddXPNoMultiplier` skips only the skill-book multiplier.
:::

:::facts
- **XP to level 10, normal skill** 32,775 (9,000 for the last level)
- **XP to level 10, Strength or Fitness** 487,500 (150,000 for the last level)
- **Starting-level factor, start at 0 / 1 / 2 / 3+** x0.25 / x1.0 / x1.33 / x1.66
- **Skill-book maximum, volumes 1 to 5** x3 / x5 / x8 / x12 / x16 (x1.5 / x2.5 / x4 / x6 / x8 for Aiming, Reloading and Long Blade)
- **Server resend of the XP record** every 1,000 ms of real time, not game time
:::

:::flow[What AddXP does with a gain]
- Stop if the character is asleep
- Strength protein factor
- Starting-level factor and traits
- Skill-book multiplier
- Sandbox multiplier
- Clamp to 0 and the level 10 total
- Raise or lower the level
:::

## 1. How much XP each level needs

**Each skill stores ten level costs, `xp1..xp10`, and the game multiplies every one by 1.5 when the skill is registered.**

Most skills register 50, 100, 200, 500, 1,000, 2,000, 3,000, 4,000, 5,000 and 6,000. Fitness and Strength register 1,000, 2,000, 4,000, 6,000, 12,000, 20,000, 40,000, 60,000, 80,000 and 100,000, and both are flagged passive. :cite[(`zombie/characters/skills/PerkFactory.java:105-148`)]

Each value is multiplied by 1.5 and cut to a whole number. :cite[(`zombie/characters/skills/PerkFactory.java:87-96`)] The XP total for a level is the sum of the costs up to it. :cite[(`zombie/characters/skills/PerkFactory.java:314-325`)]

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Normal skill, cost of this level | 75 | 150 | 300 | 750 | 1,500 | 3,000 | 4,500 | 6,000 | 7,500 | 9,000 |
| Normal skill, total | 75 | 225 | 525 | 1,275 | 2,775 | 5,775 | 10,275 | 16,275 | 23,775 | 32,775 |
| Strength or Fitness, cost of this level | 1,500 | 3,000 | 6,000 | 9,000 | 18,000 | 30,000 | 60,000 | 90,000 | 120,000 | 150,000 |
| Strength or Fitness, total | 1,500 | 4,500 | 10,500 | 19,500 | 37,500 | 67,500 | 127,500 | 217,500 | 337,500 | 487,500 |

A mod skill registers its own ten costs, and the same 1.5 multiplier applies. :cite[(`zombie/characters/skills/CustomPerks.java:59-68`)]

## 2. The order of the multipliers

**Every XP gain goes through the same fixed order, and a gain that skips the boost step skips all four multipliers.**

The function stops at once when the character is asleep. :cite[(`zombie/characters/IsoGameCharacter.java:17784`)] Next, a Strength gain is multiplied by 1.5 while protein is above 50 and below 300, and by 0.7 below -300, and a Fitness gain is dropped when the nutrition code says Fitness XP cannot be added. :cite[(`zombie/characters/IsoGameCharacter.java:17795-17804`)] A gain that is positive for a skill already at the level 10 total changes nothing. :cite[(`zombie/characters/IsoGameCharacter.java:17806-17808`)]

The boost step then builds one factor `mod` and multiplies the gain by it, by the skill-book multiplier if that is above 1, and by the sandbox multiplier. :cite[(`zombie/characters/IsoGameCharacter.java:17810-17873`)]

| Step | Factor | Skills left out | Code |
|---|---|---|---|
| Starting level, value 0 or no entry | x0.25 | Running (`Sprinting`), Strength, Fitness | `zombie/characters/IsoGameCharacter.java:17812-17817`, `zombie/characters/IsoGameCharacter.java:17830-17832`, `zombie/characters/IsoGameCharacter.java:17951-17957` |
| Starting level, value 1 | x1.0, or x1.25 for Running (`Sprinting`) | none | `zombie/characters/IsoGameCharacter.java:17818-17821` |
| Starting level, value 2 | x1.33 | Strength, Fitness | `zombie/characters/IsoGameCharacter.java:17822-17823`, `zombie/characters/IsoGameCharacter.java:17959-17961` |
| Starting level, value 3 or more | x1.66 | Strength, Fitness | `zombie/characters/IsoGameCharacter.java:17824-17826`, `zombie/characters/IsoGameCharacter.java:17959-17961` |
| Starting level, value below 0 (possible after a trait is removed) | x1.0, because no branch matches | none | `zombie/characters/IsoGameCharacter.java:11527-11549`, `zombie/characters/IsoGameCharacter.java:17812-17826` |
| Fast Learner trait | x1.3 | Strength, Fitness | `zombie/characters/IsoGameCharacter.java:17834-17836` |
| Slow Learner trait | x0.7 | Running, Strength, Fitness | `zombie/characters/IsoGameCharacter.java:17838-17840` |
| Pacifist trait | x0.75 on Axe, Long Blade, Short Blade, Short Blunt, Long Blunt, Spear and Aiming | every other skill | `zombie/characters/IsoGameCharacter.java:17842-17853` |
| Crafty trait | x1.3 on every skill under Crafting | every other skill | `zombie/characters/IsoGameCharacter.java:17855-17859` |
| Skill-book multiplier | the stored multiplier, used only when it is above 1 | none | `zombie/characters/IsoGameCharacter.java:17862-17865` |
| Sandbox multiplier | the global value, or the skill's own value when the global switch is off | none | `zombie/characters/IsoGameCharacter.java:17867-17873` |

The starting-level value is the number stored for the skill in the character's boost map. A trait or profession puts its `XPBoosts` into that map, and a skill with no entry counts as 0. The boost map is clamped to 3 when the character is made, so 3 means "3 or more". :cite[(`zombie/characters/SurvivorDesc.java:153-156`, `zombie/characters/IsoGameCharacter.java:11527-11549`, `zombie/characters/IsoGameCharacter.java:11551-11608`)]

The Skills tab shows the value as the color of the skill's name and as a tooltip line. The tooltip says "+75%", "+100%" or "+125%" for values 1, 2 and 3, which do not match the factors above (x1.0, x1.33, x1.66). Against a start at 0, the factors are 4 times, 5.32 times and 6.64 times as fast, which is our division. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:135-151`, `media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:82-94`)]

After the factors, the new total is clamped to 0 and to the level 10 total. :cite[(`zombie/characters/IsoGameCharacter.java:17876-17885`)] The player-sized page has the worked examples, and the traits that set the boost map are in [Vanilla trait reference](/pz/build-42/modding/skills-and-traits/trait-reference).

## 3. Skill-book multipliers

**A skill book stores a multiplier on the character for one band of levels, and the engine removes it when XP leaves the band.**

The Lua function `addXpMultiplier(player, perk, multiplier, minLevel, maxLevel)` stores the multiplier. :cite[(`zombie/Lua/LuaManager.java:11869-11881`, `zombie/characters/IsoGameCharacter.java:17695-17705`)] After each gain, the engine deletes the stored multiplier if the XP crosses the start of the band downward, or reaches the total for the band's top level. :cite[(`zombie/characters/IsoGameCharacter.java:17888-17895`)] The band of a book is `LvlSkillTrained` to `LvlSkillTrained + NumLevelsTrained - 1`. :cite[(`zombie/inventory/types/Literature.java:447-449`)]

While you read, `ISReadABook.checkMultiplier` sets the multiplier to one tenth of the book's maximum for each tenth of the pages read, and it replaces the stored value only when the new one is larger. When the reading finishes, the action stores the full maximum. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:103-118`, `media/lua/shared/TimedActions/ISReadABook.lua:337-348`)] The maximum comes from the book's `LvlSkillTrained`: each of 1, 3, 5, 7 and 9 picks a maximum from the table below, and any other level prints an error and uses 1. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:491-505`)]

| Book volume (`LvlSkillTrained`) | Levels it covers | 21 skills | Aiming, Reloading, Long Blade | Code |
|---|---|---|---|---|
| 1 (1) | 1-2 | x3 | x1.5 | `media/lua/server/XpSystem/XPSystem_SkillBook.lua:5`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:166` |
| 2 (3) | 3-4 | x5 | x2.5 | `media/lua/server/XpSystem/XPSystem_SkillBook.lua:6`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:167` |
| 3 (5) | 5-6 | x8 | x4 | `media/lua/server/XpSystem/XPSystem_SkillBook.lua:7`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:168` |
| 4 (7) | 7-8 | x12 | x6 | `media/lua/server/XpSystem/XPSystem_SkillBook.lua:8`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:169` |
| 5 (9) | 9-10 | x16 | x8 | `media/lua/server/XpSystem/XPSystem_SkillBook.lua:9`, `media/lua/server/XpSystem/XPSystem_SkillBook.lua:170` |

:cite[(`media/lua/server/XpSystem/XPSystem_SkillBook.lua:3-196`)] The 21 skills are the other crafting, survival and farming skills and Maintenance. Reading stops with a halo message, and the multiplier does not grow, when the book's first level is more than one above the reader's level, when its top level is below the reader's level plus one, or when the reader has the Illiterate trait. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:38-66`)] The reading rules are in [Learning](/pz/build-42/modding/skills-and-traits/learning-paths).

## 4. The calls that grant XP

**Lua's `addXp` is the one safe entry point, because it picks the right code path for single player and for a server.**

The Java calls are made on the character's XP object, `getXp():AddXP`, and the Lua calls are globals.

| Call | What it does | Side that acts | Code |
|---|---|---|---|
| `addXp(player, perk, amount)` (Lua global) | Grants XP with all the multipliers. | Single player runs `AddXP` directly. A dedicated server runs `GameServer.addXp`. A multiplayer client does nothing. | `zombie/Lua/LuaManager.java:11855-11867`, `zombie/network/GameServer.java:1888-1902` |
| `addXpNoMultiplier(player, perk, amount)` (Lua global) | Grants XP with no starting-level, trait, book or sandbox factor. The Strength protein factor and the clamp still apply. | Same split as `addXp`. | `zombie/Lua/LuaManager.java:11841-11853`, `zombie/network/GameServer.java:1888-1902` |
| `addXpMultiplier(player, perk, multiplier, minLevel, maxLevel)` (Lua global) | Stores a skill-book style multiplier. | The server also sends it to the player. A client does nothing. | `zombie/Lua/LuaManager.java:11869-11881`, `zombie/network/GameServer.java:1904-1907` |
| `getXp():AddXP(perk, amount)` (Java) | Grants XP with all the multipliers. | Acts only when the character is a local player. On a multiplayer client that is your own player, so it runs there. On a dedicated server no player is local, so it does nothing there: use `addXp`. | `zombie/characters/IsoGameCharacter.java:17743-17747`, `zombie/characters/IsoPlayer.java:6507-6509` |
| `getXp():AddXP(perk, amount, noMultiplier)` (Java) | With `noMultiplier` true, skips the starting-level, trait, book and sandbox factors. | Acts only for a local player. | `zombie/characters/IsoGameCharacter.java:17755-17759` |
| `getXp():AddXPNoMultiplier(perk, amount)` (Java) | Removes the skill-book multiplier for this one gain, and keeps every other factor. | Acts only for a local player. | `zombie/characters/IsoGameCharacter.java:17767-17777` |

The six-argument `AddXP(perk, amount, callLua, doXPBoost, remote, haloText)` is the real function, and the shorter forms call it.

The body never reads `callLua` or `remote`, so passing false for either does not stop the `AddXP` event. The event fires wherever the call runs unless this is a multiplayer client. :cite[(`zombie/characters/IsoGameCharacter.java:17779-17783`, `zombie/characters/IsoGameCharacter.java:17943-17945`)]

`GameServer.addXp` calls the six-argument form, so a server grant does not need the character to be a local player. It does nothing, with no log line, when the player has no connection or is dead. For a connected, living player the grant goes through, because the permission check passes when the connection owns the player. :cite[(`zombie/network/GameServer.java:1892-1902`, `zombie/network/GameServer.java:1431-1433`)]

Vanilla's own Java grants follow the same split. Endurance training in `IsoPlayer` and a recipe's `xpAward` both call `GameServer.addXp` on a server and `AddXP` when the code is not running on a client. :cite[(`zombie/characters/IsoPlayer.java:2222-2229`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1464-1488`)]

A client that calls the Java `AddXP` itself changes only its own copy. The `PlayerXp` packet from the server clears the client's XP map and loads the server's, so the client's own change lasts until the next packet. :cite[(`zombie/characters/IsoGameCharacter.java:17985-17999`, `zombie/network/packets/PlayerXpPacket.java:52-64`)]

:::callout[Warning]{kind=warn}
A multiplayer client that calls the Lua `addXp` function gets no XP and no error. Grant XP on the server.

The server also runs `AntiCheatXPUpdate` every 60 seconds. It compares each skill's XP with the value it last recorded, and flags growth above 1,000 times the skill's multipliers. :cite[(`zombie/network/anticheats/AntiCheatXPUpdate.java:66-118`, `zombie/characters/NetworkCharacterAI.java:433-439`)] 

A grant through `GameServer.addXp` cannot trip it, because the grant copies the current XP into the check's record right after `AddXP`. Loading a `PlayerXp` packet and the `/addxp` command do the same. :cite[(`zombie/network/GameServer.java:1897-1898`, `zombie/characters/NetworkCharacterAI.java:316-322`, `zombie/characters/IsoGameCharacter.java:18041`, `zombie/commands/serverCommands/AddXPCommand.java:90`)] 

The check can still see XP that reaches the server's XP record by a route that does not call `updateXpChecker`. We did not trace every such route. What the server does when it trips is a server option, described in [The anti-cheat checks](/pz/build-42/engine/anti-cheat/the-anti-cheat-checks).
:::

## 5. Who decides a level, and what the server sends

**The side that runs `AddXP` decides the level, and in normal play a multiplayer client receives the result.**

Inside `AddXP`, a loop calls `LevelPerk` while the new total passes the next level's total, and a second loop calls `LoseLevel` while the total falls below the current level's total. :cite[(`zombie/characters/IsoGameCharacter.java:17897-17924`)] Each raise calls `LevelPerk`, which adds one level, caps it at 10, fires the `LevelPerk` event, and a client that runs it also sends its levels to the server. A lowering calls `LoseLevel`, which removes one level and fires the same event with false. :cite[(`zombie/characters/IsoGameCharacter.java:4822-4883`)]

The server then keeps the client current in three ways.
- **The whole XP record:** once per second of real time the server sends each connected player a `PlayerXp` packet. It holds the character's traits, the XP of each skill, the skill levels and the book multipliers. The client loads it over its own copy. :cite[(`zombie/network/NetworkPlayerManager.java:17`, `zombie/network/NetworkPlayerManager.java:25-43`, `zombie/characters/NetworkPlayerAI.java:765-772`, `zombie/network/packets/PlayerXpPacket.java:40-64`, `zombie/characters/IsoGameCharacter.java:18044-18072`)]
- **A new book multiplier:** `GameServer.addXpMultiplier` stores the multiplier and sends an `AddXPMultiplier` packet. :cite[(`zombie/network/GameServer.java:1904-1907`, `zombie/network/packets/AddXPMultiplierPacket.java:60-66`)]
- **The level-up sound:** the server sends an object change to the player. :cite[(`zombie/characters/IsoGameCharacter.java:17902-17909`)]

In normal play the client sends only three levels to the server: Sneak, Strength and Fitness. The server stores them as the player's remote levels and passes them to the other clients. :cite[(`zombie/network/GameClient.java:2598-2606`, `zombie/network/GameServer.java:4295-4318`)]

A second path exists for admins. The Lua function `SyncXp(player)` on a client sends a full `PlayerXp` packet, the packet needs the capability to modify player stats in the player stats screen, and vanilla's player stats screen calls it after it adds or removes a trait. :cite[(`zombie/Lua/LuaManager.java:11924-11929`, `zombie/network/packets/PlayerXpPacket.java:24-29`, `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:596`, `media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:671`)] A server should keep that capability to trusted roles only.

When the client loads a `PlayerXp` packet and a skill level has changed, it fires the `LogLevelPerk` event, not `LevelPerk`. :cite[(`zombie/characters/IsoGameCharacter.java:18010-18021`)]

Vanilla's `XpUpdate.lua` listens to `LevelPerk`. Each time a level changes it asks the script manager to auto-learn recipes, and it swaps the Strength and Fitness traits. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:196-238`, `media/lua/server/XpSystem/XpUpdate.lua:387-389`)] Vanilla's grants run `AddXP` only in single player and on the server, so that is where these run for vanilla XP. The recipe side is in [Learning](/pz/build-42/modding/skills-and-traits/learning-paths).

## 6. The sandbox multiplier

**The XP multipliers are one global value, plus one value for each of the 35 skills that the game uses only when the global switch is off.**

Build 41's single `XpMultiplier` option is gone. The Java declarations are `MultiplierConfig.Global` (0 to 1000, default 1.0) and `MultiplierConfig.GlobalToggle` (default true), followed by 35 per-skill options. :cite[(`zombie/SandboxOptions.java:1799-1836`, `zombie/SandboxOptions.java:1841-1842`)] The settings screen calls the group "XP Multipliers", and its labels are "Global Multiplier" and "Use Global Multiplier". :cite[(`media/lua/shared/Translate/EN/Sandbox.json:371-375`)] 

The game's default preset is Apocalypse, and Apocalypse sets Global 1.0 with the switch enabled. Extinction and Rising do the same.

Outbreak turns the switch off and sets per-skill values. A challenge's own Lua file can also set `MultiplierConfig`, so a challenge game can differ from the preset. :cite[(`media/lua/client/Challenge/28MinutesLater.lua:234-236`, `zombie/core/Core.java:377`, `media/lua/shared/Sandbox/Apocalypse.lua:242-244`, `media/lua/shared/Sandbox/Extinction.lua:242-244`, `media/lua/shared/Sandbox/Rising.lua:242-244`, `media/lua/shared/Sandbox/Outbreak.lua:242-280`)] Every option is in [Sandbox options: character and XP](/pz/build-42/server/sandbox-options/sandbox-options-character).

The per-skill option name is `MultiplierConfig.` plus the skill's engine id, for example `MultiplierConfig.Woodwork`.

The code reads that option without a check for a missing one. :cite[(`zombie/characters/IsoGameCharacter.java:17867-17873`, `zombie/characters/skills/PerkFactory.java:327-330`, `zombie/SandboxOptions.java:1856`)] A mod skill has no such option. With the global switch off, a gain for a mod skill would read a missing option, which we expect raises an error. This is read from the code and not tested.

## 7. XP numbers that look like multipliers

**Aiming and Reloading are slowed by the Lua that grants their XP, not by a multiplier in the engine.**

A figure that circulates says Aiming and Reloading "suffer an overall 0.37037x multiplier" from level 5. The Java code has no such multiplier. :cite[(`zombie/characters/IsoGameCharacter.java:17810-17873`)] Aiming hit XP is the hit count, times 2.7 while Aiming is below 5. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:80-86`)] 

Reloading pays more below 5 than at 5 and above. Each row grants XP only when the code is not running on a client.

| Reload action | Reloading below 5 | Reloading 5 or more | Code |
|---|---|---|---|
| Finish loading a firearm | 4 XP every time | 1 XP, on 1 chance in 3 | `media/lua/shared/TimedActions/ISReloadWeaponAction.lua:198-209` |
| Insert a magazine | 4 XP every time | 1 XP, on 1 chance in 3 | `media/lua/shared/TimedActions/ISInsertMagazine.lua:79-91` |
| Load a bullet into a magazine | 4 XP, on 1 chance in 2 | 1 XP, on 1 chance in 5 | `media/lua/shared/TimedActions/ISLoadBulletsInMagazine.lua:117-126` |

These amounts are before the multipliers above, and they sit in `media/lua/shared/TimedActions/`.

:::callout[How we know]{kind=proof}
The thresholds are counted from the registration lines and recomputed with a script. The multiplier order, the call table, the level loops and the packets are read from the 42.22 Java and Lua in the lines cited. The Build 41 comparison is on [B41 to B42 skill changes](/pz/build-42/modding/skills-and-traits/b41-b42-skill-changes).

Not tested: we did not run a client against a server, so the once-a-second `PlayerXp` resend and the silent no-op of `addXp` on a client are read from the code. The `SixMonthsLater` preset sets no `MultiplierConfig` at all, so the Java defaults apply there; that is a search, not a cited line. The error for a mod skill with the global switch off is our reading of a missing null check in decompiled code, not an observed crash. What a server does after the XP check trips depends on its option, and we did not run it.

Dropped from the older page: the claim that the starting boost is "now confirmed" from a wiki and 41.78, the "global XP rate is [LIKELY]" note (now read from the code), and the wiki-sourced "buggy displayed percentages" wording. The tooltip mismatch above is read from the Lua. The 0.37037 claim is corrected in section 7.
:::
