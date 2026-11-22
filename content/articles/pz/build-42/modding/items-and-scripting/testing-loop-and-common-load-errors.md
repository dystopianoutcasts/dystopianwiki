---
id: build-42-testing-loop-and-common-load-errors
slug: testing-loop-and-common-load-errors
title: Testing loop and common load errors
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - testing
  - console-log
  - load-errors
  - item-scripts
excerpt: >-
  Where Build 42.22 writes its log, which script mistakes print a line and which fail silently, and how to check in game that an item or recipe loaded. Includes a break-it-on-purpose test mod.
last_updated: '2026-11-21'
related_articles:
  - script-file-anatomy
  - items-the-item-block-in-b42
  - item-block-merge-behaviour
  - tags
  - the-workstation-entity-system
  - skills-xp-and-learning
  - master-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** a modder whose script "does nothing" and who does not yet know where to look. Work through the test in part 1 once, so you have seen a load error before a real one costs you an evening.

:::callout[The 1-minute version]{kind=key}
- Read `console.txt` in the `Zomboid` folder of your user folder. The game writes it from the start of the run. A dedicated server writes `server-console.txt` there.
- On a client started without `-debug`, the script, recipe and craft-logic log channels start off, so several mistakes print nothing at all.
- With `-debug`, a script load error is raised as `Script load errors.` and the load stops, so fix errors one at a time.
- Two lines are worth searching for: `removing script due to load error`, and `mod "<id>" overrides`.
- Do not trust the log alone. Check in game that the item or recipe exists.
:::

:::facts
- **Log files** 3: `console.txt`, `server-console.txt`, `coop-console.txt`
- **Size limit of a log file** from 512 KB to 102,400 KB, so a long session can drop old lines
- **Channels that always print** General, Lua, Mod, Network, Multiplayer and ClientCommand
- **Channels that start off on a client** Script, Recipe, CraftLogic and DetailedInfo
:::

## 1. The testing loop

**Break one item on purpose, find the line in the log, fix it, and see the item appear.**

1. Make the folder `Zomboid/mods/LoadErrorDemo/` with `42/mod.info` and a `poster.png` copied from the [project skeleton](/pz/build-42/modding/cookbook/project-skeleton). The `mod.info` has `name=Load Error Demo` and `id=LoadErrorDemo`.
2. Make the file `Zomboid/mods/LoadErrorDemo/42/media/scripts/LoadErrorDemo_items.txt`. It adds a new item whose weight is not a number.

```
module Base
{
    item LoadErrorDemoRock
    {
        ItemType = base:normal,
        Weight = heavy,
    }
}
```

3. Start the game with `-debug`, as the skeleton page shows. Open **Mods**, check **Load Error Demo**, accept, and start a new game. Then close the game and open `console.txt`.
4. Search it for `[item] removing script due to load error = Base.LoadErrorDemoRock`. A stack trace follows it. :cite[(`zombie/scripting/objects/Item.java:2057-2058`, `zombie/scripting/ScriptBucket.java:198-207`)]
5. Change `Weight = heavy,` to `Weight = 2.0,`, and start again. Open the debug **Items List** (see [New item](/pz/build-42/modding/cookbook/new-item)) and search for `Rock`. The item is there now.

This test has not been run in a game; it follows from the code. With `-debug`, expect the load to stop with `Script load errors.` instead of reaching the main menu, and whether the game then closes is not verified. After the fix in step 5 the load completes. :cite[(`zombie/scripting/ScriptManager.java:1710-1712`)]

The scripts are loaded once, at the start. :cite[(`zombie/scripting/ScriptManager.java:1710`)] Restart the game after each change to a script file. The engine has a script reload function, and the debug entity window has a reload button for it, but this page has not tried them. :cite[(`zombie/scripting/ScriptManager.java:1734-1741`, `media/lua/client/DebugUIs/DebugMenu/Entity/ISEntityInstancesPanel.lua:60`)]

## 2. Where the log is

**The client's log is `console.txt` in the cache folder, which is the `Zomboid` folder in your user folder on Windows.**

The game opens `console.txt` in the cache folder and sends everything printed to it. :cite[(`zombie/gameStates/MainScreenState.java:183-190`)] The cache folder is `<user home>/Zomboid` on Windows, and the launch option `-cachedir=` changes it. :cite[(`zombie/ZomboidFileSystem.java:205-212`, `zombie/gameStates/MainScreenState.java:166-167`)] A dedicated server writes `server-console.txt` there instead, and a hosted co-op session writes `coop-console.txt`. :cite[(`zombie/network/GameServer.java:464`, `zombie/network/CoopSlave.java:43`)]

Each file has a size limit, and the limit is kept between 512 KB and 102,400 KB. :cite[(`zombie/core/Core.java:4470-4476`)] A very long session can therefore lose its oldest lines, so read the log soon after you start.

## 3. What prints and what does not

**Which log channel a message uses decides whether you see it.**

A channel is a named stream of messages, and every channel starts at `Off`. :cite[(`zombie/debug/DebugType.java:95`)] The game then sets a default level for all of them: General with `-debug`, Warning on a dedicated server, and Off on a client without `-debug`. :cite[(`zombie/debug/DebugLog.java:83-98`)]

Whatever the mode, the game switches six channels on at the start: General, Lua, Mod, Network, Multiplayer and ClientCommand. :cite[(`zombie/debug/DebugLog.java:478-483`)] A message on the General channel, such as `removing script due to load error`, therefore reaches the log on a normal client.

On a dedicated server a message on the Script, Recipe or CraftLogic channel reaches the log at warning level and above, and DetailedInfo stays off without `-debug`. :cite[(`zombie/debug/DebugLog.java:83-98`, `zombie/network/GameServer.java:499`)] A client starts those channels off, and `-debug` alone does not turn them on: it only reads a debug log config file if one exists. :cite[(`zombie/debug/DebugType.java:95`, `zombie/debug/DebugLog.java:478-483`, `zombie/gameStates/MainScreenState.java:284-286`, `zombie/debug/DebugLog.java:487-496`)] To see them on a client, start the game with `-debuglog=Script,Recipe`, or turn them on in a debug log config. :cite[(`zombie/gameStates/MainScreenState.java:251-254`, `zombie/debug/DebugLog.java:280-291`)] The table says which channel each message uses.

## 4. Common load errors

**Most script mistakes fall into a few kinds, and the table gives the sign, the cause and the line that proves it.**

| What you see | Cause and fix | Code |
|---|---|---|
| `removing script due to load error = ...` and an item that is missing in game | A key in the item block threw while it loaded, for example a `Weight` that is not a number. The engine drops the whole item. Fix the value. | `zombie/scripting/objects/Item.java:2057-2058`, `zombie/scripting/ScriptBucket.java:198-207` |
| A key has no effect, and nothing is logged | The last key line before `}` has no comma, so the engine never turns it into a line. Put a comma after every key, the last one too. | `zombie/scripting/ScriptParser.java:36-45` |
| A key, an item or a whole module is skipped, with no message | A `//` line is not a comment: only `/* ... */` is stripped. It merges into the next key, block or module, which then is not recognized. Use `/* ... */` only. | `zombie/scripting/ScriptParser.java:59-90`, `zombie/scripting/ScriptParser.java:40-45`, `zombie/scripting/ScriptManager.java:1360` (a module) |
| `unknown script object "itme" in '<file>'` (on a server, or on a client with the Script channel on, `-debuglog=Script`) | A block word the module does not know, for example a typo in `item`. The block is skipped. | `zombie/scripting/objects/ScriptModule.java:1018-1026` |
| `adding unknown item param "X" = "Y", script: ...` (only in the detailed-info channel) | The item loader does not know the key, so it keeps it as mod data and the key does nothing. This is a misspelled key. | `zombie/scripting/objects/Item.java:2998-3015` |
| An item loads, and creating it fails later | The item has no valid `ItemType`, which is not an error at load. | `zombie/scripting/objects/Item.java:1494`, `zombie/scripting/objects/Item.java:1831-1835` |
| `mod "<id>" overrides <path>` | A file of your mod has the same relative path as an earlier file, vanilla's included, and replaces it. Rename your file. | `zombie/ZomboidFileSystem.java:672-677` |
| `Unknown key 'X' val(Y) in craft recipe: Name` (recipe channel) | A top-level key of the `craftRecipe` is not one the loader reads. In debug mode the load then throws. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:505-509` |
| `unknown recipe param: Base.Plank` | An input item has no square brackets. Write `[Base.Plank]`. The exception is thrown while the recipe is read, and the loader logs it with a stack trace and drops the recipe. | `zombie/scripting/entity/components/crafting/InputScript.java:764-770` |
| `Tag has no items: ...` | An input asks for a tag that no item carries, for example a misspelled tag. It is thrown in a later loading step, after the scripts are parsed. One catch covers that whole step, so the exception is logged with its stack trace, the rest of the step is skipped for every script type, and the load-error flag is set. | `zombie/scripting/entity/components/crafting/InputScript.java:891-896`, `zombie/scripting/ScriptManager.java:1793-1795` |
| `item not found` for an input, only with `-debug` | An input names an item id that does not exist. Outside debug mode the id is skipped without a message. | `zombie/scripting/entity/components/crafting/InputScript.java:880-888` |
| `Could not find output mapper: ...` | An output says `mapper:Name` with no `itemMapper Name` block. It is thrown while the recipe is read, so it is logged with a stack trace and the recipe is dropped. | `zombie/scripting/entity/components/crafting/OutputScript.java:320-325` |
| `TimedActionScript '...' could not be found in recipe ...` | The `timedAction` value names no `timedAction` block. It is thrown in the later loading step and, like the row above, skips the rest of that step. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:770-775`, `zombie/scripting/ScriptManager.java:1772-1795` |
| `Unknown skill "X" in recipe "Name"` (recipe channel) | A name in `SkillRequired`, `xpAward` or an `AutoLearn` key is not a skill. The entry is skipped. | `zombie/scripting/entity/components/crafting/CraftRecipe.java:399-415` |

The recipe lines are written out on [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe), and the loader's key list is on [The big picture](/pz/build-42/modding/items-and-scripting/the-big-picture).

## 5. When the log is clean and the recipe is still missing

**A recipe can load and still not be offered, because the check that hides it is a gate, not an error.**

The bench, the learning and the skill are three separate checks, and each one makes the recipe unavailable without a load error. :cite[(`zombie/entity/components/crafting/recipe/CraftRecipeManager.java:340-358`)] The messages `Player doesn't have required skill for ...` and `Player doesn't know recipe ...` go to the recipe monitor and the craft-logic channel, not to the plain log on a normal client. Check the three in this order:

1. **Bench:** the recipe's `Tags` shares a tag with the bench's `Recipes` list, or the recipe uses `AnySurfaceCraft` or `InHandCraft`. See [The workstation / entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system).
2. **Learning:** `NeedToBeLearn = true` hides the recipe until the character learns it. See [Skills, XP, and learning](/pz/build-42/modding/items-and-scripting/skills-xp-and-learning).
3. **Skill:** the character's level is at least the `SkillRequired` level.

## 6. Confirm it in game

**Ask the game whether the script exists, instead of guessing from the log.**

- **Item:** open the debug **Items List** and search for it, or call `getItem("Base.LoadErrorDemoRock")` in the debug Lua console. The call is the global `getItem`, which looks the name up and returns the script item. :cite[(`zombie/Lua/LuaManager.java:8556-8562`, `zombie/inventory/InventoryItemFactory.java:66`)]
- **Recipe:** call `getScriptManager():getCraftRecipe("Base.YourRecipe")`. The older `getRecipe` call looks in the legacy recipe list and does not find a craftRecipe block. :cite[(`zombie/scripting/ScriptManager.java:775`, `zombie/scripting/ScriptManager.java:1059-1072`)]
- **Checker:** the recipe checker named on [New craftRecipe](/pz/build-42/modding/cookbook/new-craftrecipe) reads your scripts before the game starts.

:::callout[How we know]{kind=proof}
The log file names, size limit, channel rules and every error line were read from the 42.22 source.

The test mod in part 1 has not been run in a game. Not verified: the exact text of the stack trace, whether `Script load errors.` leaves the game at the main menu or closes it, the script reload button, and the `getItem` call in the Lua console. Dropped from the old page: "start a new save because Build 42 caches scripts" and "spaces in a recipe id break Lua lookups", for which no line was found; the fluid-name collision warning, which was not traced; and the two editor extensions, which are outside the game files. Corrected: `getRecipe` does not find a craftRecipe block.
:::
