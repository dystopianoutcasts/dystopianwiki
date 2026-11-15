---
id: build-42-new-skill
slug: new-skill
title: New skill or perk
game: pz
version: build-42
section: modding
category: cookbook
difficulty: intermediate
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: >-
  Build a mod that adds one skill, Demo Crafting, in its own group on the skills panel, with its own XP curve and a small Lua file that trains it so you can watch it level.
last_updated: '2026-11-15'
related_articles:
  - project-skeleton
  - new-trait
  - new-craftrecipe
  - modding-add-a-skill
  - xp-level-thresholds-multipliers
  - the-xp-grant-skill-query-lua-api
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- You build `RecipeDemoSkill`: a `perks.txt` file, one translation file, one Lua file, and the two files every mod has, `mod.info` and `poster.png`.
- The skill is Demo Crafting, inside a new group called Demo Group. The skills panel only lists a skill that has a parent, so the group is part of the recipe.
- The numbers you write in `perks.txt` are multiplied by 1.5 by the engine, so copy vanilla's own numbers, not the numbers the game shows.
- The Lua file adds 25 experience every in-game minute, so you can see the bar fill and the level rise without playing for hours.
:::

:::facts
- **Mod id** `RecipeDemoSkill`
- **Skill** `Perks.RecipeDemoSkill`, shown as Demo Crafting in the group Demo Group
- **Files** 5 (`mod.info`, `poster.png`, `perks.txt`, `IG_UI.json`, `Train.lua`)
- **Starts from** the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton)
:::

## What you will build

**A new skill that shows on the skills panel, levels up, and can be named in Lua.**

A skill in Build 42 is a block in a file called `perks.txt`, not in a script file. The game reads that file at start-up, creates the skill, and puts it in the Lua table `Perks`. You add the text for its name, and then Lua can give it experience and read its level.

The result is a skill group named Demo Group with one skill, Demo Crafting, that starts at level 0. After a few minutes in a game its bar fills and the level rises.

The depth is in [Modding: add a SKILL](/pz/build-42/modding/skills-and-traits/modding-add-a-skill), and the numbers are in [XP level thresholds](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers). This page is the short complete path.

## The files

**Five files make the mod, in the folder layout of the project skeleton.**

Start from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton): the same `common/` and `42/` folders and the same `poster.png`. The skeleton's `Boot.lua` is left out here.

```
Zomboid/mods/RecipeDemoSkill/
  common/            (optional, empty)
  42/
    mod.info
    poster.png
    media/
      perks.txt
      lua/
        shared/
          Translate/
            EN/
              IG_UI.json
        client/
          RecipeDemoSkill/
            Train.lua
```

The game looks for `perks.txt` at `media/perks.txt` in each enabled mod's version folder, and uses the same path in `common/` when the version folder has none. :cite[(`zombie/characters/skills/CustomPerks.java:35-48`)] The file is not a script file: the script loader searches only `media/scripts/`, so `perks.txt` sits one folder up. :cite[(`zombie/scripting/ScriptManager.java:1643-1645`)]

## Step by step

**Write the five files in this order: the mod info, the skill file, the text, then the Lua.**

### Step 1. `42/mod.info` and `42/poster.png`

Copy `poster.png` from your skeleton, and write `mod.info` with the new id. The keys are explained on the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton) page.

**File `42/mod.info`**

```
name=Recipe Demo Skill
id=RecipeDemoSkill
description=Adds one skill, Demo Crafting, in its own group on the skills panel.
poster=poster.png
author=Your Name
```

### Step 2. `42/media/perks.txt`

This defines the group and the skill. The numbers are the vanilla curve: vanilla passes `50, 100, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000` for its regular skills such as Carpentry. :cite[(`zombie/characters/skills/PerkFactory.java:117`)]

**File `42/media/perks.txt`**

```
VERSION = 1,

perk RecipeDemoGroup
{
    parent = None,
    translation = RecipeDemoGroup,
    passive = false,
    xp1 = 50, xp2 = 100, xp3 = 200, xp4 = 500, xp5 = 1000,
    xp6 = 2000, xp7 = 3000, xp8 = 4000, xp9 = 5000, xp10 = 6000,
}

perk RecipeDemoSkill
{
    parent = RecipeDemoGroup,
    translation = RecipeDemoSkill,
    passive = false,
    xp1 = 50, xp2 = 100, xp3 = 200, xp4 = 500, xp5 = 1000,
    xp6 = 2000, xp7 = 3000, xp8 = 4000, xp9 = 5000, xp10 = 6000,
}
```

The loader needs `VERSION = 1`, and any other value, or none, is an error. :cite[(`zombie/characters/skills/CustomPerks.java:113-134`)] Every block must be a `perk` block, and the name after `perk` is the skill's id. :cite[(`zombie/characters/skills/CustomPerks.java:120-123`, `zombie/characters/skills/CustomPerks.java:137-142`)] The file is read with its line breaks removed and its `/* ... */` comments stripped before parsing. :cite[(`zombie/characters/skills/CustomPerks.java:93-97`, `zombie/characters/skills/CustomPerks.java:111`)]

| Line | What it does | Code |
|------|--------------|------|
| `perk RecipeDemoSkill` | The id of the skill. Lua reaches it as `Perks.RecipeDemoSkill`, and scripts name it the same way, for example in `xpAward` and `XPBoosts`. | `zombie/characters/skills/CustomPerks.java:71-77`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:468-481` |
| `parent = RecipeDemoGroup` | Puts the skill under a group. A skill with no parent, or `None`, is not listed in the skills panel. A group is a skill of its own with `parent = None`. | `zombie/characters/skills/CustomPerks.java:59-67`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:265-284` |
| `translation = RecipeDemoSkill` | The text key is `IGUI_perks_` plus this value. When the line is left out, the id is used. | `zombie/characters/skills/PerkFactory.java:83-84`, `zombie/characters/skills/CustomPerks.java:148-155` |
| `passive = false` | A passive skill, such as Fitness, uses a much steeper curve and sorts first in the panel. | `zombie/characters/skills/PerkFactory.java:136`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:33-45` |
| `xp1` to `xp10` | The experience each level needs, one after the other. A value that is not above 0 is ignored. | `zombie/characters/skills/CustomPerks.java:162-170`, `zombie/characters/skills/PerkFactory.java:314-325` |

The engine multiplies every one of those numbers by 1.5 when it creates the skill, so `xp1 = 50` means 75 experience for level 1, and the numbers in the table above are the same ones vanilla passes. :cite[(`zombie/characters/skills/PerkFactory.java:87-96`, `zombie/characters/skills/CustomPerks.java:66-67`)] Copy vanilla's numbers, as here. The older page printed `75, 150, 300 ...`, which are the totals the game shows, and writing those would multiply them again.

Level `N` needs the sum of the numbers up to level `N`. With these values level 1 is at 75 experience in total and level 2 is at 75 plus 150, which is 225. :cite[(`zombie/characters/skills/PerkFactory.java:314-325`)]

The skills are created before any script loads, so a recipe's `xpAward = RecipeDemoSkill:5` or a trait's `XPBoosts = RecipeDemoSkill=1` can name them. :cite[(`zombie/GameWindow.java:203-205`, `zombie/GameWindow.java:208-210`)] A craft recipe reads an unknown skill name as a warning and skips it. :cite[(`zombie/scripting/entity/components/crafting/CraftRecipe.java:474-476`)] Vanilla recipes use the same form, for example `xpAward = Woodwork:5`. :cite[(`media/scripts/generated/recipes/recipes_carpentry.txt:9`)]

### Step 3. `42/media/lua/shared/Translate/EN/IG_UI.json`

This gives the group and the skill their names, and the skill its tooltip. The game picks the table from the start of the key, so keys that start with `IGUI_` belong in `IG_UI.json`, not in `UI.json`. :cite[(`zombie/core/Translator.java:444-445`)] Vanilla keeps its skill names in the same file. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:201`)]

**File `42/media/lua/shared/Translate/EN/IG_UI.json`**

```
{
    "IGUI_perks_RecipeDemoGroup": "Demo Group",
    "IGUI_perks_RecipeDemoSkill": "Demo Crafting",
    "IGUI_perks_RecipeDemoSkill_Description": "A skill added by the Recipe Demo Skill mod. It gains 25 experience every in-game minute."
}
```

The skills panel draws the group's name above its skills, and each skill's own name beside its bar. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:124-127`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:152`)] The tooltip over a bar reads the key `IGUI_perks_` plus the skill's id plus `_Description`, so write that key too. :cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:77`)] Vanilla has one for Cooking. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:5597`)] A key with no text shows the key itself, and in debug mode the log says `ERROR: Missing translation` with the key. :cite[(`zombie/core/Translator.java:489-506`)]

### Step 4. `42/media/lua/client/RecipeDemoSkill/Train.lua`

This file gives the skill experience once a minute, so you can watch it work. The event `EveryOneMinute` is raised once per in-game minute. :cite[(`api/events.jsonl:9`)]

**File `42/media/lua/client/RecipeDemoSkill/Train.lua`**

```lua
local function trainDemoSkill()
    local player = getPlayer()
    if not player then return end

    player:getXp():AddXP(Perks.RecipeDemoSkill, 25, false, false, false, false)

    local level = player:getPerkLevel(Perks.RecipeDemoSkill)
    local xp = player:getXp():getXP(Perks.RecipeDemoSkill)
    print("[RecipeDemoSkill] level " .. level .. ", xp " .. xp)
end

Events.EveryOneMinute.Add(trainDemoSkill)
```

`Perks.RecipeDemoSkill` is read inside the function, when it runs, because the game puts each custom skill into the `Perks` table by its id. :cite[(`zombie/characters/skills/CustomPerks.java:71-77`)] The long call is the form vanilla's debug panel uses. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:525`)] Its flags are, in order, call the Lua event, apply the experience boost, mark it as remote, and show halo text. :cite[(`zombie/characters/IsoGameCharacter.java:17783`)]

The flags matter. When the boost is applied, for most skills the amount is reduced to a quarter when the character has no boost entry for the skill, and it is then multiplied by a sandbox setting named after the skill. :cite[(`zombie/characters/IsoGameCharacter.java:17810-17832`, `zombie/characters/IsoGameCharacter.java:17867-17873`)]

A new skill has no entry unless a trait or profession adds one, and that lookup sits inside the boost branch. The call here turns the boost off, so it skips the lookup and the full 25 is added. :cite[(`zombie/characters/IsoGameCharacter.java:17810`, `zombie/characters/IsoGameCharacter.java:17867-17874`)] The short two-number call does nothing unless the character is a local player. :cite[(`zombie/characters/IsoGameCharacter.java:17743-17747`)] That is why the file is in `client/`.

The level comes from the experience: when the new total passes the next level's total, the character gains a level. :cite[(`zombie/characters/IsoGameCharacter.java:17897-17901`)] Experience stops at the total for level 10. :cite[(`zombie/characters/IsoGameCharacter.java:17806-17808`, `zombie/characters/IsoGameCharacter.java:17882-17885`)] The function is passed to `.Add` as a value, without calling it.

## Turn it on and see it work

**Enable the mod, start a game, wait a few in-game minutes, and open the skills panel.**

1. Put the `RecipeDemoSkill` folder in `Zomboid/mods/`, so that `mod.info` is at `Zomboid/mods/RecipeDemoSkill/42/mod.info`.
2. Start the game with `-debug`, as the skeleton page shows. Choose **MODS**, check **Recipe Demo Skill**, choose **ACCEPT**, and start a new game.
3. Open the character information window and its skills view. Under **Demo Group** you see **Demo Crafting** with an empty bar. Point at the bar: the tooltip shows the level, the experience, and your description text. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:124-152`, `media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:60-77`)]
4. Let the game run. Each in-game minute adds 25, so the first level arrives at 75 experience, after three minutes, and the second at 225, after nine. `console.txt` holds one `[RecipeDemoSkill] level ..., xp ...` line for each minute.
5. To see the bar move faster, speed up the game time, or open the debug menu's player stats panel, which has an add-experience action for a chosen skill. :cite[(`media/lua/client/ISUI/PlayerStats/ISPlayerStatsUI.lua:781-791`)]

This recipe does not change multiplayer. A server that lists the mod loads the skill too, and every player needs the mod. These steps have not been run in a game, and the Lua file is written for a single local player only.

## If it does not work

**A skill fails in a few predictable ways, and each one leaves a clue.**

| What you see | Cause and fix | Code |
|--------------|---------------|------|
| The skill is not on the panel | The skill has no parent, or its parent is `None`. Give it a parent that is a group. | `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:265-284` |
| The skill's name shows as `IGUI_perks_RecipeDemoSkill` | The text is missing from `IG_UI.json`, or the key has a different `translation` value. In debug mode the log has `ERROR: Missing translation`. | `zombie/characters/skills/PerkFactory.java:84`, `zombie/core/Translator.java:489-506` |
| The tooltip shows the key `IGUI_perks_RecipeDemoSkill_Description` | The description key is missing. The tooltip builds it from the skill's id. | `media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:77` |
| An error `invalid or missing VERSION` | `perks.txt` does not start with `VERSION = 1,`. | `zombie/characters/skills/CustomPerks.java:119-134` |
| An error `unknown block type` | A block in `perks.txt` is not a `perk` block. | `zombie/characters/skills/CustomPerks.java:121-123` |
| A warning `missing or empty perk id` or `failed to parse custom perk` | A `perk` block has no name after the word `perk`. | `zombie/characters/skills/CustomPerks.java:126-128`, `zombie/characters/skills/CustomPerks.java:138-140` |
| The levels come much later than you expect | You wrote the totals the game shows. The engine multiplies the numbers by 1.5, so write vanilla's numbers. | `zombie/characters/skills/PerkFactory.java:87-96` |
| An error that names `Perks.RecipeDemoSkill` as nil | The skill was not created, so the `Perks` table has no entry. Check `perks.txt` first: the file must be at `media/perks.txt` in the version folder or in `common/`. | `zombie/characters/skills/CustomPerks.java:35-48`, `zombie/characters/skills/CustomPerks.java:71-77` |
| No `[RecipeDemoSkill]` lines | The mod is not checked, or the game is paused, or the character is asleep. Experience is not added while asleep. | `zombie/characters/IsoGameCharacter.java:17784` |

The skill file is read when the game starts, so restart the game after every change to `perks.txt`. The [testing loop page](/pz/build-42/modding/items-and-scripting/testing-loop-and-common-load-errors) covers the same loop for scripts.

## Going further

**Train the skill from a recipe, gate recipes on it, or learn the experience API.**

- [New craft recipe](/pz/build-42/modding/cookbook/new-craftrecipe) shows the recipe block, which can award experience with an `xpAward` line such as `xpAward = RecipeDemoSkill:5`.
- [New trait](/pz/build-42/modding/cookbook/new-trait) boosts a skill with `XPBoosts`, which also gives the trait's owner the boost entry this page's Lua call skips.
- [Modding: add a SKILL](/pz/build-42/modding/skills-and-traits/modding-add-a-skill) is the full reference page for skills.
- [The XP grant and skill query Lua API](/pz/build-42/modding/skills-and-traits/the-xp-grant-skill-query-lua-api) covers `AddXP`, levels and the multiplayer side.
- [XP level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers) lists the vanilla curve.

:::callout[How we know]{kind=proof}
The file format, the 1.5 multiplier, the panel behavior, the translation routing and the experience call come from the 42.22 engine and Lua code cited above. The mod in this page was built file for file in a test folder and passed the script checker and the Lua checker.

The script checker does not read `perks.txt`, so the skill file was checked only by reading the loader. It has not been run in a game: the panel, the tooltip and the `console.txt` lines are what you check yourself. The capture has no vanilla `perks.txt`, so the file's shape rests on the loader alone. We did not check what the debug panel shows for one, or how experience syncs in multiplayer.
:::
