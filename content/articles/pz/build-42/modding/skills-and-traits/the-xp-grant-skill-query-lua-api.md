---
id: build-42-the-xp-grant-skill-query-lua-api
slug: the-xp-grant-skill-query-lua-api
title: The XP-grant / skill-query Lua API
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
  The Lua calls that read a skill level, grant XP and react to a level change in Build 42.22, which side runs each one, and the XP calls that do nothing on a server or a client.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - xp-level-thresholds-multipliers
  - learning-paths
  - modding-add-a-skill
  - modding-add-a-trait
  - recipe-gating-in-b42-scripts
  - concrete-b42-examples
  - sandbox-multiplayer-options
  - skill-ui
  - skills-xp-and-learning
  - multiplayer-command-patterns
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** modders who read skill levels, grant XP or react to a level change from Lua. The multiplier order and the level costs are on [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers), and a worked mod is [Modding: add a SKILL](/pz/build-42/modding/skills-and-traits/modding-add-a-skill).

:::callout[The 1-minute version]{kind=key}
- Read a level with `player:getPerkLevel(Perks.X)` and the stored XP total with `player:getXp():getXP(Perks.X)`.
- Grant XP with the global `addXp(player, Perks.X, amount)`. It runs the grant in single player and on a dedicated server, and does nothing on a multiplayer client.
- The Java call `player:getXp():AddXP(Perks.X, amount)` acts only for a local player. On a dedicated server no player is local, so the call does nothing there.
- The `AddXP` event fires wherever the grant ran, except on a multiplayer client. The `LevelPerk` event fires when a level goes up or down.
- A skill a mod adds is in the `Perks` table by its id once the game has read `perks.txt`.
:::

:::facts
- **Level range** 0 to 10, and a level raise stops at 10
- **`AddXP` event** `(character, perk, amount)`, with `amount` after the multipliers; a sleeping character gets no XP at all
- **`LevelPerk` event** `(character, perk, level, increased)`
- **XP record resend** every 1,000 ms of real time (server to client)
:::

## 1. Reading a skill

**A skill's level and its XP total are two separate reads, and both return 0 for a skill the character has no record of.**

`player:getPerkLevel(Perks.Blacksmith)` returns the stored level, or 0 when the character has no entry for that skill. :cite[(`zombie/characters/IsoGameCharacter.java:4800-4803`)] A normal raise stops at level 10. :cite[(`zombie/characters/IsoGameCharacter.java:4854-4856`)]

`player:getXp():getXP(Perks.Blacksmith)` returns the skill's total XP, not the progress inside the current level, and 0 when there is none. :cite[(`zombie/characters/IsoGameCharacter.java:17963-17965`)] The skills tab proves the difference: it subtracts the totals of the earlier levels from this number to draw the bar. :cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:254-296`)]

Three more reads help a mod. `perk:getTotalXpForLevel(n)` gives the XP total a level needs. :cite[(`zombie/characters/skills/PerkFactory.java:314-325`)] `player:getXp():getPerkBoost(perk)` gives the starting boost level. :cite[(`zombie/characters/IsoGameCharacter.java:17716-17718`)] `player:getXp():getMultiplier(perk)` gives the stored skill-book multiplier, or 0 when there is none. :cite[(`zombie/characters/IsoGameCharacter.java:17711-17714`)]

To list every skill, loop over `PerkFactory.PerkList`, which holds vanilla and mod skills. Vanilla's own skills tab does exactly this. :cite[(`zombie/characters/skills/PerkFactory.java:17`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:265-285`)]

## 2. Granting XP

**Use the global `addXp`, because it picks the right path for single player and for a server, and the Java call does not.**

| Call | Single player | Dedicated server | Multiplayer client | Code |
|---|---|---|---|---|
| `addXp(player, perk, amount)` | grants | grants, through `GameServer.addXp` | does nothing | `zombie/Lua/LuaManager.java:11855-11867`, `zombie/network/GameServer.java:1884-1902` |
| `addXpNoMultiplier(player, perk, amount)` | grants without the boost step | same | does nothing | `zombie/Lua/LuaManager.java:11841-11853` |
| `getXp():AddXP(perk, amount)` | grants | does nothing | grants, for your own player | `zombie/characters/IsoGameCharacter.java:17743-17747`, `zombie/characters/IsoPlayer.java:6507-6509` |

A sleeping character gets no XP from any of these calls, or from a recipe's `xpAward`, because the whole grant sits inside a check that the character is awake. :cite[(`zombie/characters/IsoGameCharacter.java:17783-17784`)] Both globals also do nothing when the player is not in the world. :cite[(`zombie/Lua/LuaManager.java:11846`, `zombie/Lua/LuaManager.java:11860`)] `GameServer.addXp` does nothing, with no log line, when the player has no connection or is dead. :cite[(`zombie/network/GameServer.java:1892-1902`)]

The Java short forms act only when the character is a local player, and `isLocalPlayer` returns false for every player on a dedicated server. :cite[(`zombie/characters/IsoGameCharacter.java:17743-17759`, `zombie/characters/IsoPlayer.java:6507-6509`)] The two long forms with five or six arguments carry no such check, so a server mod could call one directly, but the global `addXp` also records the new total for the anti-cheat check and is the safer call. :cite[(`zombie/characters/IsoGameCharacter.java:17779-17783`, `zombie/network/GameServer.java:1897-1898`)]

A client that calls the Java form changes only its own copy. The server's next XP record, sent once every 1,000 ms of real time, replaces it. :cite[(`zombie/network/NetworkPlayerManager.java:17`, `zombie/network/NetworkPlayerManager.java:25-43`, `zombie/characters/NetworkPlayerAI.java:765-770`, `zombie/network/packets/PlayerXpPacket.java:41-49`, `zombie/network/packets/PlayerXpPacket.java:52-64`)] The full rules, the multiplier order and the difference between the two "no multiplier" calls are on the page about [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

In multiplayer, an action that finishes on the client reaches `addXp` through a command the server receives. The pattern is in [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns), and a worked grant is in [Concrete B42 examples](/pz/build-42/modding/skills-and-traits/concrete-b42-examples).

## 3. Reacting to XP and level changes

**The hooks are the `AddXP` event after a grant and the `LevelPerk` event after a level changes.**

`Events.AddXP.Add(fn)` calls `fn(character, perk, amount)`, where `amount` is the XP actually added after the multipliers and the clamp. :cite[(`zombie/characters/IsoGameCharacter.java:17876-17885`, `zombie/characters/IsoGameCharacter.java:17943-17945`)] It fires wherever the grant ran, except on a multiplayer client. The event does not fire while the character is asleep, since the grant itself is skipped, or when a positive gain meets a skill already at its level 10 total. :cite[(`zombie/characters/IsoGameCharacter.java:17784`, `zombie/characters/IsoGameCharacter.java:17808`)]

`Events.LevelPerk.Add(fn)` calls `fn(character, perk, level, increased)`. The fourth argument is true for a raise and false for a loss. :cite[(`zombie/characters/IsoGameCharacter.java:4823-4837`, `zombie/characters/IsoGameCharacter.java:4862`, `zombie/characters/IsoGameCharacter.java:4875`)] A multiplayer client that receives the server's XP record fires `LogLevelPerk` instead of `LevelPerk` for a changed level. :cite[(`zombie/characters/IsoGameCharacter.java:18010-18021`)]

Vanilla listens to both events in `XpUpdate.lua`. Its `LevelPerk` listener asks the script manager to auto-learn recipes for every level change of any skill, so a mod skill takes part in `AutoLearnAll` and `AutoLearnAny` with no extra code. :cite[(`media/lua/server/XpSystem/XpUpdate.lua:196-198`, `media/lua/server/XpSystem/XpUpdate.lua:387-389`)] That file sits under `lua/server/`, which a multiplayer client also loads. :cite[(`zombie/gameStates/GameLoadingState.java:155-156`)]

## 4. The Perks table and mod skills

**Every skill is a field of the Lua table `Perks`, and a skill from `perks.txt` is added to it before any Lua file loads.**

The game reads each mod's `perks.txt`, creates its skills, and sets each one in `Perks` by id. :cite[(`zombie/characters/skills/CustomPerks.java:32-78`)] That happens before the script files and the Lua files load, on a normal start, on a dedicated server and each time the game resets its Lua. :cite[(`zombie/GameWindow.java:204-210`, `zombie/GameWindow.java:986-989`, `zombie/network/GameServer.java:1467-1468`, `zombie/network/GameServer.java:1495-1519`, `zombie/core/Core.java:3470-3547`)] So `Perks.MyTinkering` is safe inside a function, and a recipe or a trait script can name the skill. A skill id the game does not know is read as "no skill": a recipe logs a warning and a trait skips the name. :cite[(`zombie/characters/skills/PerkFactory.java:392-394`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415`, `zombie/scripting/objects/CharacterTraitDefinitionScript.java:78-80`)]

On the engine side, `PerkFactory` registers every skill with its parent, its translation key, its passive flag and its ten level costs, and its public static `AddPerk` methods exist. :cite[(`zombie/characters/skills/PerkFactory.java:37-100`)] The `perks.txt` route is the one that works with the rest of the game: only skills it creates are flagged as custom, and only flagged skills are removed when the game resets between worlds. :cite[(`zombie/characters/skills/CustomPerks.java:51-57`, `zombie/characters/skills/PerkFactory.java:160-178`)] A skill made by a direct `AddPerk` call is not tested here.

To ask whether a character holds a mod trait, pass the registered trait object to `hasTrait`. The registry pattern is built end to end in [Modding: add a TRAIT](/pz/build-42/modding/skills-and-traits/modding-add-a-trait). :cite[(`zombie/characters/IsoGameCharacter.java:5585-5587`)]

:::callout[Warning]{kind=warn}
Any logged-in client can send any command a server mod listens to, as often as it likes, so a server handler that calls `addXp` must decide the amount itself and check on the server that the action happened. Never take the amount from the table the client sent.
:::

:::callout[How we know]{kind=proof}
Every call, event and side rule above is read from the 42.22 Java and Lua in the lines cited. We did not run a client against a server, so "does nothing on a multiplayer client" and "does nothing on a dedicated server" for the Java form are read from the code, not observed.

Dropped from the older page: the tags "[CONFIRMED]" and "[LIKELY]" that came from a wiki and a javadoc, the example of the registry call and `OnNewGame` (the trait page now holds both), the claim that `AddXP` "triggers the `AddXP` event" on every side (it does not fire on a multiplayer client), and the advice that `AddXP` on the client for a local player is the normal path (the next server XP record overwrites it). Corrected: the `AddXP` and `LevelPerk` events now state their sides. Not tested: a skill made by a direct `PerkFactory.AddPerk` call.
:::
