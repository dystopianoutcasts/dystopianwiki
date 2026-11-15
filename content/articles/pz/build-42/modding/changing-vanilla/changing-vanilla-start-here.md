---
id: build-42-changing-vanilla-start-here
slug: changing-vanilla-start-here
title: 'Changing vanilla: start here'
game: pz
version: build-42
section: modding
category: changing-vanilla
difficulty: beginner
tags:
  - overriding
  - patching
  - compatibility
  - sandbox
  - lua
  - java
excerpt: >-
  How to pick the lightest way to change something the base game already does, from a sandbox setting up to a Java patch, and how to keep your change from breaking other mods.
last_updated: '2026-11-14'
related_articles:
  - patching-vanilla-lua
  - overriding-scripts
  - editing-items-at-load
  - changing-loot
  - changing-recipes-and-crafting
  - what-needs-java-and-what-is-impossible
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders choosing a method](#the-ladder) | [modders worried about other mods](#keeping-your-change-compatible) | [first-timers](#try-it-your-first-change-in-five-minutes)

Outcast, sooner or later you will want the game to do something a little differently. Planks too heavy, a recipe too slow, bathroom counters that never hold a crowbar, an eating animation that takes forever. You do not need to rebuild the game for any of that. In most cases you change one small thing and leave the rest alone.

This series is about how. This first page is the map: six ways to change vanilla, from the lightest to the heaviest, when to use each, and how to keep your change from fighting with other people's mods. The next six pages go deep on each way.

:::callout[The 1-minute version]{kind=key}
- There are six ways to change vanilla. Start on the lowest rung that does the job and climb only when it cannot.
- Rung 1 is a sandbox setting and rung 2 is a data or script override. Rung 2 is where most mods live.
- Rung 3 is a Lua hook (react to an event), rung 4 is a Lua function patch, rung 5 is a Java class patch, and rung 6 is impossible.
- Add, do not replace. Wrap Lua functions instead of replacing them, and never ship a file at a vanilla path.
- In multiplayer the server and client must match, so keep changes in `shared\` or in scripts.
:::

:::facts
- **Ways to change vanilla** 6 rungs
- **Plank weight in the example** 3.0 in vanilla, 1.5 with the mod
- **Loot rolls multiplier** range 0.1 to 100, default 1.0
:::

:::flow[The ladder, lightest to heaviest]
- Sandbox setting
- Data or script override
- Lua hook
- Lua function patch
- Java class patch
- Impossible
:::

## The ladder

Start on the lowest rung that does the job and climb only when it cannot.

| Rung | What you do | Capability tier | Typical use |
|---|---|---|---|
| 1. Sandbox setting | Ask the player (or server admin) to change a game setting, or add a setting of your own | none, it is plain data | "Loot is too common" |
| 2. Data or script override | Ship a script `.txt` or a Lua data table that adds to or edits vanilla data | none, it is plain data | Change an item's weight, a recipe's time, a container's loot |
| 3. Lua hook | Run your code when the game fires an event | L2 `EVENT_ONLY` | "When loot spawns in a container, add a note" |
| 4. Lua function patch | Wrap or replace a vanilla Lua function, or call an exposed Java method | L0 `LUA_DIRECT`, L1 `LUA_INDIRECT` | Eating takes half as long |
| 5. Java class patch | Ship a loose `.class` file that the game loads instead of its own | L3 `JAVA_PATCH` | Change a rule that lives in Java and has no hook |
| 6. Impossible | Hardcoded, compiled into a native library, or fixed at compile time | L4 `IMPOSSIBLE` | Zombie path search, the lighting engine |

The tiers in the right-hand column are the vocabulary the engine records use for "possible or not possible". Rungs 1 and 2 sit under that ladder because they never touch engine code at all, so they have no tier. Rungs 3 to 6 are exactly the tiers L2, L0 and L1, L3 and L4.

:::callout[Note]{kind=key}
"Lighter" does not mean "weaker". A one-line script override can change something no amount of Lua can. It just means fewer things can go wrong, and fewer other mods are affected.
:::

## Rung 1: a sandbox setting

Before you write anything, check whether the game already has a knob.

Sandbox options include a loot rolls multiplier, a list of item types that must never spawn as loot, and a loot multiplier per category (medical, ammo, ranged weapons, "other" and more). The rolls multiplier is `RollsMultiplier` (range 0.1 to 100, default 1.0) :cite[(`zombie/SandboxOptions.java:109`)], the never-spawn list is `LootItemRemovalList` :cite[(`zombie/SandboxOptions.java:110`)], the per-category multipliers include `MedicalLootNew` and `AmmoLootNew` :cite[(`zombie/SandboxOptions.java:92-99`)], and the removal list is checked by item type. :cite[(`zombie/SandboxOptions.java:1297`)]

If your mod needs a knob of its own, the engine reads a file named `media/sandbox-options.txt` from each active mod. It looks in the mod's version folder first (`42\media\`), and only if the file is not there does it look in `common\media\`. :cite[(`zombie/sandbox/CustomSandboxOptions.java:38`, `:42`)]

Use this rung when the change should be the player's choice. It is also the friendliest to other mods, because nothing is overwritten.

## Rung 2: a data or script override

Most of vanilla's content is data (items, recipes, sounds, models, loot tables), and you can add to it or edit it.

- **Scripts** are the `.txt` files under `media\scripts\`. If you write an `item Plank` block inside `module Base`, the game finds the vanilla `Plank` and merges your keys into it. See [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts).
- **Loot tables** are plain Lua tables. You edit the tables, and the game reads them later. See [Changing loot](/pz/build-42/modding/changing-vanilla/changing-loot).
- **Recipes** are script blocks too, with a few traps. See [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting).

This is where most mods should live. The edits are small, they are readable, and the engine merges them for you.

## Rung 3: a Lua hook

A hook is a function you hand to one of the game's announcements, so you can react but not change how the game decides.

The game announces things that happen: the game booted, a container was filled, the world was created.

```lua
Events.OnGameBoot.Add(function() print("The game has booted") end)
```

Hooks cannot change how the game decides things. They let you react. If you need to change a number the engine already computed, a hook alone is not enough. Hooks are also how you do rung 2 at the right moment, for example [editing items at load](/pz/build-42/modding/changing-vanilla/editing-items-at-load).

The names of the events come from one list in the engine. That list includes `OnGameBoot` :cite[(`zombie/Lua/LuaEventManager.java:598`)], and the three distribution events `OnPreDistributionMerge`, `OnDistributionMerge` and `OnPostDistributionMerge`. :cite[(`:792-794`)]

## Rung 4: a Lua function patch

Your mod can wrap a vanilla Lua function without touching the engine.

Much of the game's behavior is written in Lua. Your mod can keep the original function and replace it with one that calls the original and adds a twist, and the rest of the game never notices.

A timed action, an inventory menu, the whole crafting window: all Lua. Because Lua functions live in tables you can reach, this works without touching the engine. That is [patching vanilla Lua](/pz/build-42/modding/changing-vanilla/patching-vanilla-lua).

This rung also covers calling Java methods the game exposes to Lua, such as `getScriptManager():getItem("Base.Plank"):DoParam("Weight = 1.5")`. The Java class is registered for Lua (it is on the engine's explicit exposed list, cited below; it also carries the `@UsedFromLua` marker :cite[(`zombie/scripting/objects/Item.java:74-75`)]), so the call is allowed. The exposed list holds `setExposed(Item.class)` :cite[(`zombie/Lua/LuaManager.java:2332`)], and `DoParam` is public. :cite[(`zombie/scripting/objects/Item.java:1950`)]

## Rung 5: a Java class patch

Some rules live in Java and have no hook and no Lua copy, and the only way to change one is to supply a replacement `.class` file.

This works because of how the game is launched, but it is fragile, nobody can install it for you, and it can break the day the game updates. Read [What needs Java, and what is impossible](/pz/build-42/modding/changing-vanilla/what-needs-java-and-what-is-impossible) before you try.

## Rung 6: impossible

Some things cannot be changed by any mod, because they run in compiled native libraries or are fixed numbers inside compiled code.

The native libraries cover the pathfinder, the zombie population simulation, the lighting engine, physics, networking and audio. The last article in this series lists them and says what each one owns, so you can stop looking.

## Which rung do I need?

Ask these five questions in order and stop at the first yes.

1. **Is there a sandbox option for it?** Use it.
2. **Is it data?** (an item stat, a recipe line, a loot chance) Edit the data. Stay on rung 2.
3. **Do you only need to react to something?** Use a hook.
4. **Is the behavior in a Lua file you can read?** Patch that function.
5. **Is it in Java and there is no exposed method?** Check the last article. It may be rung 5, or it may be impossible.

If you are unsure where a behavior lives, search the vanilla Lua folder first (`media\lua\` in the game install). If the words you see on screen are in a Lua file, rung 4 is open to you.

## Keeping your change compatible

Players run many mods at once, and these habits cost almost nothing but keep your change alive among them.

**Add, do not replace.** A new item with a new name cannot collide with anything. A new recipe cannot collide either. Editing vanilla should be the smaller part of your mod.

**Change the one value you mean to change.** A partial script block for an item or a craft recipe touches only the keys you wrote. This is not true of the replace-type blocks (`model`, `sound`, `mannequin` and a few more): a second block for those wipes the first, so write them in full. See [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts). Do not copy the whole vanilla block into your mod: you would freeze every other value at today's number, so a game update could never fix it. For recipes it is worse. Repeating a whole recipe under the same name appends its inputs a second time (see [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting)).

**Wrap, do not replace, Lua functions.** Keep the original in a `local`, call it, and add your behavior around it. If two mods both wrap the same function, the chain works. If one of them replaces it, the other mod's change is gone.

**Never ship a file at a vanilla path.** The engine takes the last file with a given path and drops every other copy. If your mod contains `media\lua\client\ISUI\ISToolTipInv.lua`, vanilla's version never runs. See the warning in [Patching vanilla Lua](/pz/build-42/modding/changing-vanilla/patching-vanilla-lua).

**Give your files names no one else will pick.** Two mods that both ship `media\scripts\items.txt` collide: only one of those two files is read. Put your mod's name in the file name (`MyMod_items.txt`). Each relative path is loaded once (the `done` set) :cite[(`zombie/scripting/ScriptManager.java:1682-1691`)], and a later mod's file with the same relative path replaces the earlier entry, with the engine logging "mod ... overrides ...". :cite[(`zombie/ZomboidFileSystem.java:672-677`)]

**Guard against missing things.** If another mod removed an item, `getItem` returns nothing. Check for `nil` before you use it, print a one-line message, and carry on.

**Do not depend on another mod's turn unless you say so.** Between mods, Lua files load in the order of the mod list, and a mod listed in your `mod.info` `require=` line loads first. Scripts do not follow that order; see [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts). A required mod is placed before the mod that requires it :cite[(`zombie/ZomboidFileSystem.java:827-855`)], and each mod's Lua files are added in mod-list order. :cite[(`zombie/Lua/LuaManager.java:1159-1201`)]

**Multiplayer: the server and the client must match.** The server compares a checksum of the Lua files and script files with each connecting client's. If they differ, the player is flagged and will be kicked after a timeout. This is why a mod change belongs in `shared\`, or in scripts, and not in a file only one side has. :cite[(`zombie/network/packets/service/ChecksumPacket.java:236-258`)] Administrators with a bypass capability are exempt. :cite[(`:242`)]

## Try it: your first change in five minutes

Make the plank lighter without writing any Lua.

1. Create this folder tree in your local mods folder (on Windows this is under your `Zomboid\mods\` folder):

```
LightPlanks\
  42\
    mod.info
    media\
      scripts\
        LightPlanks_items.txt
```

2. `mod.info` holds three lines (no comma at the end of any line):

```
name=Light Planks
id=LightPlanks
description=Planks weigh less.
```

3. `LightPlanks_items.txt` holds this:

```
module Base
{
    item Plank
    {
        Weight = 1.5,
    }
}
```

What each part does: `module Base` says "this is the base game's namespace". `item Plank` names the vanilla item. `Weight = 1.5,` is the one thing you want different. Everything else about the plank (name, model, damage, tags) stays vanilla, because the engine merges your block onto it.

4. Turn on debug mode so you can spawn a plank. In Steam, right-click Project Zomboid, choose Properties, find Launch Options on the General tab, type `-debug`, and start the game. (Debug mode is a general launch option; it is not something this capture shows.) Once in game, the engine's debug menu is available (:cite[(`media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:86`)] checks `getCore():getDebug()`), and it has an "Items" button that opens the item list (:cite[(`ISDebugMenu.lua:23`)] opens `ISItemsListViewer`). The exact key or icon that opens the debug menu: not verified here; look for the bug icon on the left side of the game screen.
5. Enable the mod. On the main menu, choose Mods (the label comes from `UI_mainscreen_mods`, :cite[(`media/lua/client/OptionScreens/MainScreen.lua:503`)]), check the box for "Light Planks", and go back. Then start a new game. The mod list for the game is read when the game starts, so enable it before you press Play. The exact wording of the checkbox and any "reset Lua" prompt: not verified.
6. In game, open the debug menu, click Items, search for `Plank`, and add one to your inventory. Open its tooltip. The vanilla weight is 3.0, so you should see 1.5.

Vanilla defines `Plank` with `Weight = 3.0,` in its item scripts. :cite[(`media/scripts/generated/items/weapon.txt:9255`, `:9259`)] The merge is explained and cited in [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts).

If it does not work: check that the file ends in `.txt`, that the file is under `42\media\scripts\`, and that `Weight = 1.5,` really sits inside the `item Plank` braces. A script with a typo can remove the whole item from the game; the next page explains why.

## Where to go next

The next six pages go deep on each rung.

- [Patching vanilla Lua](/pz/build-42/modding/changing-vanilla/patching-vanilla-lua): wrap functions, remove handlers, and why you should never replace a vanilla file.
- [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts): what happens when you define something vanilla also defines.
- [Editing items at load](/pz/build-42/modding/changing-vanilla/editing-items-at-load): change items from Lua, and when.
- [Changing loot](/pz/build-42/modding/changing-vanilla/changing-loot): add, remove and reweight loot.
- [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting): recipes, with the traps.
- [What needs Java, and what is impossible](/pz/build-42/modding/changing-vanilla/what-needs-java-and-what-is-impossible): the top two rungs.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source and vanilla files. Not verified: that debug mode is enabled by the `-debug` launch option (a general launch option, not shown by this capture), the key or icon that opens the debug menu, and the exact wording of the Mods checkbox and any "reset Lua" prompt.
:::
