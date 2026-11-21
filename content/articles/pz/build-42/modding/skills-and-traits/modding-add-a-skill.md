---
id: build-42-modding-add-a-skill
slug: modding-add-a-skill
title: 'Modding: add a SKILL'
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
  Add a new skill to Build 42.22 from an empty folder: the perks.txt block, the text keys, why it levels at a quarter speed, where it shows, and what changes in multiplayer.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - xp-level-thresholds-multipliers
  - learning-paths
  - the-xp-grant-skill-query-lua-api
  - recipe-gating-in-b42-scripts
  - concrete-b42-examples
  - skill-ui
  - sandbox-multiplayer-options
  - modding-add-a-trait
  - new-skill
  - script-comments-what-slashes-do
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

The shortest complete path, with five files and a skill that trains by itself, is [New skill or perk](/pz/build-42/modding/cookbook/new-skill). This page is the longer version: what the engine reads, the traps a new skill falls into, and what it does in multiplayer.

:::callout[The 1-minute version]{kind=key}
- A skill is a `perk` block in `media/perks.txt`, not a script block. The loader reads only `parent`, `translation`, `passive` and the ten costs `xp1` to `xp10` from it.
- The engine multiplies every cost by 1.5, so write vanilla's numbers (50 to 6,000), not the numbers the game shows.
- The skills tab lists a skill only when its `parent` is a skill other than `None`. The name comes from `IGUI_perks_` plus `translation`, and the tooltip from `IGUI_perks_` plus the id plus `_Description`.
- A new skill gains XP at a quarter of the rate until a trait or profession gives it a starting level with `XPBoosts`, and a gain that goes through the boost step fails when the server's global XP switch is off (read from the code, not run).
- Every machine loads the skill from its own copy of the mod. A machine without the mod drops that skill's XP and levels without an error.
:::

:::facts
- **Skill file** `media/perks.txt`, in the version folder first and in `common` only when the version folder has none
- **Keys the loader reads** `parent`, `translation`, `passive`, `xp1` to `xp10`
- **Cost factor** x1.5 on every cost, so `xp1 = 50` is 75 XP
- **XP speed with no starting level for the skill** x0.25
- **Skills tab key** L, the binding "Toggle Skill Panel"
- **Skill slots** 256 in the game's table; vanilla creates 47 ids in it, counting `None` and `MAX`
:::

## 1. Build the example mod

**This builds a mod called `MySkillMod` with one skill, Tinkering, under the vanilla Crafting group.**

The folders are the ones of the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): a `common` folder and a `42` folder next to each other, with `mod.info` in `42`. The game reads `mod.info` from the version folder first and from `common` second. :cite[(`zombie/gameStates/ChooseGameInfo.java:198-209`)]

```
Zomboid/mods/MySkillMod/
  common/
  42/
    mod.info
    poster.png
    media/
      perks.txt
      scripts/myskillmod_recipes.txt
      lua/shared/Translate/EN/IG_UI.json
```

**Step 1. `42/mod.info`.** Three lines are enough to load. :cite[(`zombie/gameStates/ChooseGameInfo.java:217-246`)]

```
name=My Skill Mod
id=MySkillMod
description=Adds the Tinkering skill.
```

**Step 2. `42/media/perks.txt`.** This defines the skill. The costs are vanilla's own, which the engine then multiplies by 1.5. :cite[(`zombie/characters/skills/PerkFactory.java:87-96`, `zombie/characters/skills/PerkFactory.java:117`)]

```
VERSION = 1,

perk MyTinkering
{
    parent = Crafting,
    translation = MyTinkering,
    passive = false,
    xp1 = 50, xp2 = 100, xp3 = 200, xp4 = 500, xp5 = 1000,
    xp6 = 2000, xp7 = 3000, xp8 = 4000, xp9 = 5000, xp10 = 6000,
}
```

The block id, `MyTinkering`, is the skill's id for Lua, for recipes and for traits. Pick one no other mod uses, because the id is also the name of a field in the Lua table `Perks`. :cite[(`zombie/characters/skills/CustomPerks.java:71-78`)] The parent `Crafting` is a vanilla group, so the skill appears under it. :cite[(`zombie/characters/skills/PerkFactory.java:116-117`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:265-285`)]

**Step 3. `42/media/lua/shared/Translate/EN/IG_UI.json`.** This gives the skill its name and its tooltip. Keys that start with `IGUI_` are read from `IG_UI.json`, and the translator reads one `.json` file per language and file name from each mod's `common` and version folders. :cite[(`zombie/core/Translator.java:365`, `zombie/core/Translator.java:384-399`, `zombie/core/Translator.java:444-445`)]

```json
{
    "IGUI_perks_MyTinkering": "Tinkering",
    "IGUI_perks_MyTinkering_Description": "Repairing and improvising with whatever is to hand."
}
```

**Step 4. Give the skill a normal speed.** Without this step the skill levels at a quarter of the usual rate (section 3). The simplest way is a trait or a profession whose `XPBoosts` names the skill, for example `XPBoosts = MyTinkering=1`. The trait script reads the skill by its id, and the game creates the skill before it loads any script, so the id resolves. :cite[(`zombie/scripting/objects/CharacterTraitDefinitionScript.java:74-84`, `zombie/GameWindow.java:204-210`)] The whole trait, with its registry file and its text, is built in [Modding: add a TRAIT](/pz/build-42/modding/skills-and-traits/modding-add-a-trait).

**Step 5. Use the skill.** A recipe names the skill in `SkillRequired`, `xpAward` and `AutoLearnAll`, and a Lua file calls `addXp(player, Perks.MyTinkering, 10)`. The recipe, the skill book, the magazine and the grant are written out in [Concrete B42 examples](/pz/build-42/modding/skills-and-traits/concrete-b42-examples).

### What you should see

Enable the mod as the trait page shows and start a new game. Press L, which is the default for the binding "Toggle Skill Panel". :cite[(`media/lua/shared/keyBinding.lua:162-164`, `media/lua/server/XpSystem/XpUpdate.lua:150-153`)] Under the Crafting heading, a row named Tinkering has an empty bar of ten squares. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:124-152`)]

To make the bar move without playing for hours, grant XP with the debug player stats panel. Open it from the Debug menu's Player button, or from the admin panel. :cite[(`media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:22`, `media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua:263-266`)] The panel calls the Java `AddXP` on your own character, and on a multiplayer client it also sends the `/addxp` command. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:781-791`)]

The command is `/addxp "<name>" MyTinkering=100`, an unknown skill id makes it list the ids that exist, and it applies the multipliers only when `-true` is added. The command needs the `AddXP` capability, so a player without it gets nothing. :cite[(`zombie/commands/serverCommands/AddXPCommand.java:24-37`, `zombie/commands/serverCommands/AddXPCommand.java:58-85`)]

Nothing on this page has been run in a game.

## 2. What the perk block holds

**The loader reads one file per mod, checks a version line, and takes only four kinds of key from each `perk` block.**

The game looks for `media/perks.txt` in the mod's version folder, and in `common` only when the version folder has no such file. :cite[(`zombie/characters/skills/CustomPerks.java:35-48`)] A mod that keeps its skill file in a subfolder is not read. The file must hold a `VERSION = 1` value in its top block, anywhere before or between the perk blocks, and any other block than `perk` throws and ends the reading of that file. :cite[(`zombie/characters/skills/CustomPerks.java:104-107`, `zombie/characters/skills/CustomPerks.java:113-134`)]

| Key | What the loader does | Code |
|---|---|---|
| `parent` | The id of the group skill. An id the game does not know becomes `None`. | `zombie/characters/skills/CustomPerks.java:143-146`, `zombie/characters/skills/CustomPerks.java:59-64` |
| `translation` | The suffix of the name key. When left out, the skill's id is used. | `zombie/characters/skills/CustomPerks.java:148-155`, `zombie/characters/skills/PerkFactory.java:83-84` |
| `passive` | A true or false flag, false when left out. | `zombie/characters/skills/CustomPerks.java:157-160` |
| `xp1` to `xp10` | The cost of each level. A value that is not above 0 is ignored and stays 0. | `zombie/characters/skills/CustomPerks.java:162-170` |

A `name = ...` line, which older guides show, is not read. :cite[(`zombie/characters/skills/CustomPerks.java:137-174`)]

Four details are easy to miss.
- **Costs of 0:** a skill with no `xpN` values has a level 10 total of 0, so `AddXP` finds the skill already full and adds nothing. :cite[(`zombie/characters/IsoGameCharacter.java:17806-17808`, `zombie/characters/skills/PerkFactory.java:314-325`)]
- **The 1.5 factor:** the totals the game shows are the costs times 1.5. A guide that printed 75, 150, 300 and so on as the costs would give 112, 225 and 450 for levels 1 to 3, and a level 10 total of 49,162 XP instead of 32,775. :cite[(`zombie/characters/skills/PerkFactory.java:87-96`)]
- **Comments:** only `/* ... */` comments are removed, and this reader joins the lines with no line break before it parses, so any other comment text is glued onto what follows. See [Script comments: what the slashes do](/pz/build-42/modding/gotchas/script-comments-what-slashes-do). :cite[(`zombie/characters/skills/CustomPerks.java:91-97`, `zombie/characters/skills/CustomPerks.java:110-112`, `zombie/scripting/ScriptParser.java:59-94`)]
- **A vanilla id:** a block whose id is a vanilla skill's id does not create a skill. It re-registers that skill with the block's parent, translation and costs, and adds the same skill to `PerkList` a second time. What the skills tab then shows is not tested. :cite[(`zombie/characters/skills/CustomPerks.java:51-68`, `zombie/characters/skills/PerkFactory.java:98`)]

Skills live in a table of 256 slots, and vanilla creates 47 ids in it, counting `None` and `MAX`. A skill past slot 256 is not tested. :cite[(`zombie/characters/skills/PerkFactory.java:20`, `zombie/characters/skills/PerkFactory.java:336-382`)]

The `passive` flag changes less than older guides said. It does not change the cost curve, because the curve is whatever `xp1` to `xp10` hold. Fitness and Strength are passive and register large costs, and a passive skill of yours registers the numbers you write. :cite[(`zombie/characters/skills/PerkFactory.java:136-139`)]

The flag is read in three places, all in the skills tab: it sorts a passive heading first, it stops a click on the bar from raising the level, and it changes how a full bar is drawn. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:33-45`, `media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:48`, `media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:189-195`)]

## 3. Why a new skill levels slowly

**A skill that no trait or profession boosts gains XP at one quarter of the normal rate.**

The boost step looks for the skill in the character's starting-level map. For a mod skill, no entry and an entry of 0 both give a factor of 0.25.

Sprinting, Strength and Fitness are excepted from that reduction, and Strength and Fitness from the 1.33 and 1.66 rows below, but a mod skill never is. :cite[(`zombie/characters/IsoGameCharacter.java:17951-17961`)] :cite[(`zombie/characters/IsoGameCharacter.java:17810-17832`)] A mod skill has no entry unless a trait or profession adds one with `XPBoosts`. At character creation the boost is also a starting level: the character is raised to that many levels of the skill, and the stored entry is at most 3. :cite[(`zombie/characters/IsoGameCharacter.java:11594-11606`)] The factors for an entry are:

| Starting level of the skill | Factor | Code |
|---|---|---|
| none, or 0 (for a mod skill) | x0.25 | `zombie/characters/IsoGameCharacter.java:17812-17817`, `zombie/characters/IsoGameCharacter.java:17830-17832` |
| 1 | x1.0 | `zombie/characters/IsoGameCharacter.java:17818-17821` |
| 2 (for a mod skill) | x1.33 | `zombie/characters/IsoGameCharacter.java:17822-17823` |
| 3 or more (for a mod skill) | x1.66 | `zombie/characters/IsoGameCharacter.java:17824-17826` |

The factor applies to every gain that goes through the boost step, which includes `addXp` and a recipe's `xpAward`. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:1464-1488`)] `addXpNoMultiplier` skips the whole step, and with it the factor. :cite[(`zombie/Lua/LuaManager.java:11841-11853`)] The other factors, such as Fast Learner, are in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers). One of them concerns a mod skill: the Crafty trait multiplies by 1.3 every skill whose parent is Crafting, so the example skill above gets it. :cite[(`zombie/characters/IsoGameCharacter.java:17855-17859`)]

:::callout[Warning]{kind=warn}
When the sandbox switch "Use Global Multiplier" is off, a gain for a mod skill that goes through the boost step looks up a sandbox option named `MultiplierConfig.` plus the skill's id. The game declares such an option only for its own 35 skills, so the lookup returns nothing and the next call on it is a null pointer error. :cite[(`zombie/characters/IsoGameCharacter.java:17867-17873`, `zombie/SandboxOptions.java:571-573`, `zombie/SandboxOptions.java:1843-1877`)] The Outbreak preset turns that switch off, so a server that picks it is affected, and so is, for example, the 28 Minutes Later challenge. :cite[(`media/lua/shared/Sandbox/Outbreak.lua:242-244`, `media/lua/client/Challenge/28MinutesLater.lua:235`)]

This is read from the code and was not run. A mod can declare an option of that exact name in its own `media/sandbox-options.txt`, which the lookup would then find, but that route is not tested either. :cite[(`zombie/sandbox/CustomSandboxOptions.java:30-48`, `zombie/SandboxOptions.java:1116-1122`, `zombie/SandboxOptions.java:1144-1155`)] Test a mod skill with the switch off before you ship it.
:::

## 4. Where the skill shows

**The skills tab lists every skill that has a parent other than `None`, under a heading that is the parent's name.**

The tab loops over every registered skill, and a skill with the parent `None` is left out of the rows. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:265-285`)] Each parent becomes a heading with its children under it. The children are sorted by name, and a passive heading is sorted before the others. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:33-45`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:57-60`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:124-134`)]

So a skill needs a parent to be seen.

Vanilla's headings are the skills `Combat`, `Firearm`, `Crafting`, `Survivalist`, `PhysicalCategory` and `FarmingCategory`, and `Agility` has no children, so it shows no heading. :cite[(`zombie/characters/skills/PerkFactory.java:105-148`)]

To make a group of your own, write a second block with `parent = None` and give your skills that block's id as their parent. The group's own level costs do not matter to the tab. A group with no children is not shown. The older page's `perk MyPerkCat` example did this.

The name text comes from `IGUI_perks_` plus `translation`, and a missing key shows the key itself. :cite[(`zombie/characters/skills/PerkFactory.java:83-84`, `zombie/core/Translator.java:489-506`)] The tooltip over the bar reads `IGUI_perks_` plus the skill's id plus `_Description`. It also reads an optional `_Description1` to `_Description10` key for a line about one level. :cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:77-81`)]

The name key uses `translation` and the tooltip key uses the id, so the two differ whenever you set a `translation` other than the id. Vanilla shows it: Woodwork is named by `IGUI_perks_Carpentry` and described by `IGUI_perks_Woodwork_Description`. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:199-200`, `media/lua/shared/Translate/EN/IG_UI.json:5595`)] The rest of the tab is on [Skill UI](/pz/build-42/modding/skills-and-traits/skill-ui).

## 5. Using the skill in recipes, books and Lua

**Everything that names the skill uses its id, the id is case sensitive, and a misspelled id in a recipe removes the gate instead of failing.**

A recipe's `SkillRequired`, `xpAward`, `AutoLearnAll` and `AutoLearnAny` look the id up in the skill table. A name the game does not know is logged as a warning and skipped, so a misspelled `SkillRequired` leaves a recipe with no gate. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:416-445`, `zombie/characters/skills/PerkFactory.java:392-394`)] The repo's recipe checker does not know mod skills and reports a mod skill as "not in PerkFactory", so run it with the vanilla skill names while you test the grammar.

Vanilla's level-change listener asks for auto-learn on every level change of every skill, so `AutoLearnAll = MyTinkering:3` works with no extra code. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:431-445`, `media/lua/server/XpSystem/XpUpdate.lua:196-198`, `media/lua/server/XpSystem/XpUpdate.lua:387-389`)] The grant calls and the events are in [The XP-grant and skill-query Lua API](/pz/build-42/modding/skills-and-traits/the-xp-grant-skill-query-lua-api).

A skill book for the skill needs one more thing than the item. The item's `SkillTrained` is a key of the Lua table `SkillBook`, and the table has no entry for your skill until your own server Lua file adds one. A book whose key is missing raises a Lua error when the player opens its context menu. :cite[(`media/lua/shared/TimedActions/ISReadABook.lua:38`, `media/lua/client/ISUI/ISInventoryPaneContextMenu.lua:1061`)]

The game loads `lua/shared` and `lua/client` first and `lua/server` later, and each folder loads vanilla's files before the files of each mod, sorted by path with case ignored, so your file can add to the table. :cite[(`zombie/Lua/LuaManager.java:1195-1203`, `zombie/Lua/LuaManager.java:1253-1257`, `zombie/gameStates/GameLoadingState.java:156`)] See [Lua load order and the three lua folders](/pz/build-42/modding/lua-api/lua-load-order-and-the-three-lua-folders). The entry is written in [Concrete B42 examples](/pz/build-42/modding/skills-and-traits/concrete-b42-examples).

## 6. Multiplayer and saves

**Each machine reads the skill from its own copy of the mod, and the server decides the XP.**

The server and every client run `CustomPerks.init` on their own mods. :cite[(`zombie/network/GameServer.java:1467-1468`, `zombie/GameWindow.java:204-205`)] The XP record that the server sends names each skill by its id as text, and a machine that does not have the skill skips that entry without an error. :cite[(`zombie/characters/IsoGameCharacter.java:17975-17983`, `zombie/characters/IsoGameCharacter.java:17993-17998`)] A client without the mod therefore never shows the skill, and a client with a different copy of `perks.txt` computes its own level costs, since the costs come from the local file.

The same record is what the game saves, so a world that was saved with the skill and is loaded without the mod drops the skill's XP and level, with no error. :cite[(`zombie/characters/IsoGameCharacter.java:5242`, `zombie/characters/IsoGameCharacter.java:5383`, `zombie/characters/IsoGameCharacter.java:18010-18017`)]

A client sends only three skill levels to the server: Sneak, Strength and Fitness. The level of a mod skill reaches the client through the server's XP record, which the server resends about once a second. :cite[(`zombie/network/GameClient.java:2598-2606`, `zombie/network/NetworkPlayerManager.java:17`, `zombie/network/NetworkPlayerManager.java:25-43`, `zombie/characters/NetworkPlayerAI.java:765-770`, `zombie/network/packets/PlayerXpPacket.java:41-49`)] So XP for a mod skill must be granted on the server, with `addXp`. The full rules are in [Sandbox and multiplayer options](/pz/build-42/modding/skills-and-traits/sandbox-multiplayer-options).

:::callout[How we know]{kind=proof}
The keys, the location, the multipliers, the lists and the packet rules are read from the 42.22 Java and Lua in the lines cited, and the example files were compared with vanilla's own `perks`-style registration lines and script files.

Not tested, because we did not start a game: the whole walk-through, the failure of a mod skill when the global switch is off, the effect of reusing a vanilla skill id, a skill past slot 256, and the Lua error of a skill book with no `SkillBook` entry. The Outbreak preset and the 28 Minutes Later challenge are vanilla ways to reach the switch-off case, and we did not play either.

Dropped or corrected from the older page: the `name = MyPerk` key (not read); the claim that a passive skill uses "the far steeper XP curve" (the costs are what you write); the costs 75, 150, 300 and so on, which the engine would multiply again; the translation file `IG_UI_EN.txt` (the translator reads `IG_UI.json`); the question "`common/media` or `42/media`, and a subfolder or not" (the version folder first, then `common`, and only `media/perks.txt`); the claim that a new skill "participates in the sandbox multiplier system automatically" (it fails when the global switch is off); and the older page's references to sections 4, 8, 11 and 14 of a source document that is not part of the wiki.
:::
