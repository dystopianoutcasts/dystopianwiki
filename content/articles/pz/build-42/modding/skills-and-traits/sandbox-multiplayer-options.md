---
id: build-42-sandbox-multiplayer-options
slug: sandbox-multiplayer-options
title: Sandbox & multiplayer options
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
  Which Build 42.22 sandbox options change XP, skills, books and recipes, which ones do not exist, and what a server decides in multiplayer, including what a skill from a mod needs.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - xp-level-thresholds-multipliers
  - learning-paths
  - the-xp-grant-skill-query-lua-api
  - modding-add-a-skill
  - modding-add-a-trait
  - sandbox-options-character
  - skill-ui
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

Every sandbox option has its own entry on the [Character options](/pz/build-42/server/sandbox-options/sandbox-options-character) page. This page picks out the ones that touch skills, books and recipes, and then covers what changes when the game runs on a server.

:::callout[The 1-minute version]{kind=key}
- XP speed is one Global Multiplier plus one multiplier for each of 35 skills. The global one is used while "Use Global Multiplier" is on, and that switch is on by default.
- Seven options on the Character page change skill-related behavior: free trait points, the negative-trait penalty, seeing unlearned recipes, the literature cooldown, minutes per book page and two XP cutoffs.
- No sandbox option for an occupation head start, for skill loss on death or for a Strength and Fitness boost toggle appears in the 42.22 option list.
- In multiplayer the server grants XP and the clients receive the result about once a second. A client's own XP change does not last.
- A skill from a mod has no per-skill multiplier option, and with the global switch off a gain for it fails (read from the code, not run).
:::

:::facts
- **Global Multiplier** 0 to 1,000, default 1.0
- **"Use Global Multiplier"** default on, off in the Outbreak preset
- **Per-skill multiplier options** 35
- **XP record resend** every 1,000 ms of real time
- **Options in the 42.22 index** 269
:::

## 1. The XP multiplier options

**The game has one global XP multiplier and 35 skill multipliers, and it uses the skill ones only when the global switch is off.**

The Java declares `MultiplierConfig.Global` as a number from 0 to 1,000 with default 1.0, `MultiplierConfig.GlobalToggle` as a switch that starts enabled, and 35 options named `MultiplierConfig.` plus a skill's id. :cite[(`zombie/SandboxOptions.java:1838-1877`)] The settings screen shows them as "Global Multiplier" and "Use Global Multiplier". :cite[(`media/lua/shared/Translate/EN/Sandbox.json:371-375`)] Build 41's single `XpMultiplier` option is gone.

Inside `AddXP`, a gain that takes the boost step is multiplied by the global value when the switch is enabled, and by the option of that skill when it is disabled. :cite[(`zombie/characters/IsoGameCharacter.java:17783`, `zombie/characters/IsoGameCharacter.java:17867-17873`)] A gain that skips the boost step, such as `addXpNoMultiplier`, takes neither. The order of all the multipliers is in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

The game's default preset is Apocalypse, and Apocalypse, Extinction and Rising set the global value to 1.0 with the switch enabled. Outbreak turns the switch off and sets a value for each skill, and the 28 Minutes Later challenge also sets it to false. :cite[(`zombie/core/Core.java:377`, `media/lua/shared/Sandbox/Apocalypse.lua:242-244`, `media/lua/shared/Sandbox/Extinction.lua:242-244`, `media/lua/shared/Sandbox/Rising.lua:242-244`, `media/lua/shared/Sandbox/Outbreak.lua:242-280`, `media/lua/client/Challenge/28MinutesLater.lua:235`)] The older page called the per-skill multipliers "[LIKELY]". They are confirmed by the lines above.

A skill added by a mod has no option of its own, because the game declares only these 35. With the switch enabled, a mod skill takes the global value. With the switch disabled, which is the Outbreak preset or the 28 Minutes Later challenge, a gain for it that takes the boost step looks up an option that does not exist and fails with a null pointer error. :cite[(`zombie/SandboxOptions.java:571-573`, `zombie/characters/IsoGameCharacter.java:17870-17872`)] [Modding: add a SKILL](/pz/build-42/modding/skills-and-traits/modding-add-a-skill) has the warning and the untested fix. The server's XP check handles the same case differently: it reads the option by the skill's displayed name, and treats a missing option as a factor of 1. :cite[(`zombie/network/anticheats/AntiCheatXPUpdate.java:52-64`)]

## 2. Other options that touch skills and recipes

**Seven options on the Character page change how skills, books and recipes behave.**

| Option | What it does | Default | Code |
|---|---|---|---|
| `CharacterFreePoints` | Adds free trait points at character creation, from -100 to 100. | 0 | `media/lua/client/OptionScreens/CharacterCreationProfession.lua:858-859` |
| `NegativeTraitsPenalty` | Makes the points from negative traits diminish, in four steps. | 1, no penalty | `media/lua/client/OptionScreens/CharacterCreationProfession.lua:813`, `media/lua/client/OptionScreens/CharacterCreationProfession.lua:857` |
| `SeeNotLearntRecipe` | Shows recipes the character has not learned. | on | `zombie/characters/IsoGameCharacter.java:11715-11731`, `zombie/SandboxOptions.java:224` |
| `LiteratureCooldown` | Days before a read item gives its benefit again, from 1 to 365. | 90 in the Java; 45 in the default preset, Apocalypse, and 90, 90 and 30 in Extinction, Rising and Outbreak | `zombie/characters/IsoGameCharacter.java:15223-15232`, `media/lua/shared/Sandbox/Apocalypse.lua:156` |
| `MinutesPerPage` | In-game minutes to read one skill book page. | 2.0 | `media/lua/shared/TimedActions/ISReadABook.lua:488-489` |
| `LevelForMediaXPCutoff` | A skill at this level or above gets no XP from media. | 3 | `media/lua/shared/RadioCom/ISRadioInteractions.lua:7` |
| `LevelForDismantleXPCutoff` | A skill at this level or above gets no XP from scrapping furniture, except Electrical. | 0 | `media/lua/shared/Moveables/ISMoveableSpriteProps.lua:3821` |

The Java defaults are in `SandboxOptions.java`, and the presets set the values that players get. :cite[(`zombie/SandboxOptions.java:224-235`, `media/lua/shared/Sandbox/Apocalypse.lua:84`, `media/lua/shared/Sandbox/Apocalypse.lua:147-158`)] Loot options also matter to a mod that adds books: `SkillBookLoot` and `RecipeResourceLoot`, scale how often skill books and recipe-teaching items spawn. Both are 0.6 in the default preset, Apocalypse. Extinction sets 0.4 for both, Rising 0.4 and 0.8, and Outbreak 1.0 and 0.6. :cite[(`zombie/SandboxOptions.java:89-91`, `media/lua/shared/Sandbox/Apocalypse.lua:24-25`, `media/lua/shared/Sandbox/Extinction.lua:24-25`, `media/lua/shared/Sandbox/Rising.lua:24-25`, `media/lua/shared/Sandbox/Outbreak.lua:24-25`)]

The older page named options that this version does not have. Among the 269 options in the 42.22 index, none sets an occupation head start, none sets skill loss on death, and none toggles a Strength and Fitness boost. :cite[(`api/sandbox_options.jsonl:1-269`)] The Skills tab still draws a starting-level color for Strength and Fitness, even though the engine leaves those two out of the starting-level speed factors. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:135-152`, `zombie/characters/IsoGameCharacter.java:17951-17961`)]

## 3. Multiplayer: who decides what

**The server decides XP and levels, and each client receives the result and loads mod skills from its own copy of the mod.**

A grant runs on the server in a dedicated server game, and the Lua `addXp` does nothing on a client. The sandbox values the server uses come from its own settings file, and a client loads the copy the server sends. :cite[(`zombie/Lua/LuaManager.java:11855-11867`, `zombie/network/GameServer.java:1529-1540`, `zombie/network/GameClient.java:2554-2557`)] The calls and their sides are in [The XP-grant and skill-query Lua API](/pz/build-42/modding/skills-and-traits/the-xp-grant-skill-query-lua-api).

Once every 1,000 ms of real time the server sends each connected player an XP record. :cite[(`zombie/characters/NetworkPlayerAI.java:765-770`, `zombie/network/packets/PlayerXpPacket.java:41-49`)] It holds the character's traits, XP for each skill, skill levels and skill-book multipliers, and the client loads it over its own copy. :cite[(`zombie/network/NetworkPlayerManager.java:17`, `zombie/network/NetworkPlayerManager.java:25-43`, `zombie/characters/IsoGameCharacter.java:17985-18042`, `zombie/network/packets/PlayerXpPacket.java:52-64`)] So a change a client makes to its own XP is overwritten within about a second. The client itself sends only three levels back, Sneak, Strength and Fitness. :cite[(`zombie/network/GameClient.java:2598-2606`)]

A skill book works the same way. The reading action's `complete` function runs on the server, and there it stores the multiplier with `addXpMultiplier`, which sends the new value to the player. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:323-340`, `zombie/characters/CharacterTimedActions/LuaTimedActionNew.java:176-182`, `zombie/network/GameServer.java:1904-1907`)]

For a skill from a mod, both sides must load it. The record names each skill by its id as text, and a machine without the skill skips that entry with no error. :cite[(`zombie/characters/IsoGameCharacter.java:17975-17983`, `zombie/characters/IsoGameCharacter.java:17993-17998`)] Ship the skill, its text and its scripts in one mod that the server and every client load. Traits and professions follow the same one-mod rule, and [Modding: add a TRAIT](/pz/build-42/modding/skills-and-traits/modding-add-a-trait) covers what changes when the game runs.

The trait script key `DisabledInMultiplayer` is stored on the definition, and we found nothing in the 42.22 Java or Lua that reads it. No vanilla trait sets it to true, so we cannot say it has any effect. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:66-67`, `zombie/characters/traits/CharacterTraitDefinition.java:120-122`)] How a server syncs a learned recipe to the client is not verified here.

:::callout[How we know]{kind=proof}
The option names, ranges and defaults are read from `SandboxOptions.java` and the presets, and the 269 count and the absence of the head-start, death-loss and Strength-Fitness options come from the generated option index. The behavior claims are read from the lines cited. We did not run a client against a server.

Dropped from the older page: the "[UNCERTAIN]" bullet about head-start and skill-loss options (no such option exists in this version), the Strength and Fitness toggle bullet taken from a Build 41.78 bug report (no such option exists), "XP grants from server Lua replicate to the client; `AddXP` on the client for a local player is the normal path" (the server's XP record replaces a client-side `AddXP`), and "new skills participate in the sandbox multiplier system automatically" (they take the global value only). Not verified: the effect of `DisabledInMultiplayer`, and how learned recipes reach a client.
:::
