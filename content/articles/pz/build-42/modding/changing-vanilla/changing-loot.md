---
id: build-42-changing-loot
slug: changing-loot
title: 'Changing loot: add, remove and reweight what vanilla containers hold'
game: pz
version: build-42
section: modding
category: changing-vanilla
difficulty: intermediate
tags:
  - loot
  - distributions
  - lua
  - events
  - multiplayer
excerpt: >-
  How to add, remove and reweight what vanilla containers hold, what the chance numbers really mean, when the game reads the tables, and why old containers keep their loot.
last_updated: '2026-11-14'
related_articles:
  - changing-vanilla-start-here
  - patching-vanilla-lua
  - overriding-scripts
  - editing-items-at-load
  - changing-recipes-and-crafting
  - what-needs-java-and-what-is-impossible
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders editing a container's loot](#adding-removing-reweighting) | [modders unsure what a chance means](#what-the-numbers-mean) | [multiplayer modders](#who-fills-containers)

You open a bathroom counter in a house and find toothpaste, a comb, a magazine. Why those? Because a table in a Lua file says that a bathroom counter may hold them, and says how likely each one is. Change the table and you change what the next counter holds.

This page shows how the tables are laid out, when the game reads them, how to add, remove and reweight entries, and gives a mod that does all three. It replaces the short note on [procedural distributions](/pz/build-42/modding/farming-and-animals/modding-procedural-distributions), which is still right about the file locations.

:::callout[The 1-minute version]{kind=key}
- Loot lives in two Lua tables in `media/lua/server/Items/`: room and container rules (`Distributions.lua`) and named procedural lists (`ProceduralDistributions.lua`).
- A list's `items` array is a flat run of name, chance, name, chance. Edit it as a list, and always add or remove a name and its number together.
- The game reads the tables once, when a world is created. Edit them in a `server\` file inside `OnPostDistributionMerge`.
- A chance of 10 is about one in ten per pass before modifiers, and about 6 percent per pass on default settings.
- Only containers filled after your edit change. Containers are filled on the server or in single player, never on a multiplayer client.
:::

:::facts
- **Spawn draw** a whole number from 0 to 9999 per item per pass
- **Default category multiplier** 0.6, so a chance of 10 shows up as about 6 percent per pass
- **Junk sub-table factor** 1.4, and it skips the category multiplier
- **Example crowbar chance** 2, about 2 percent per pass before modifiers
:::

## First, check the sandbox

A sandbox setting may already do the job, and a table edit is for "this item, in this container".

The sandbox has a global rolls multiplier, a list of item types that must never spawn, and a multiplier for each loot category. See the first rung of [Changing vanilla: start here](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here).

## Two tables, one pipeline

Loot comes from two kinds of Lua table in `media/lua/server/Items/`: room and container rules, and procedural lists.

**1. Room and container rules** (`Distributions.lua`). A global table keyed first by room name, then by container name. A leaf either holds a direct list (`rolls` and `items`) or points to one or more *procedural lists* by name:

```lua
bathroom = {
    counter = {
        procedural = true,
        procList = {
            {name="BathroomCounter", min=0, max=99},
            {name="BathroomCounterEmpty", min=0, max=99, forceForRooms="..."},
            {name="BathroomCounterMotel", min=0, max=99, forceForRooms="motelroom"},
        }
    },
},
```

The `bathroom` room is at :cite[(`media/lua/server/Items/Distributions.lua:4797-4809`)] (its `counter` container points at three procedural lists), and the table is inserted as `Distributions[1]` and also named `SuburbsDistributions`. :cite[(`:22597-22600`)]

**2. Procedural lists** (`ProceduralDistributions.lua`). A named list: a number of `rolls` and an `items` array of alternating name and chance. Many lists also have a `junk` sub-table with the same shape.

```lua
ProceduralDistributions.list = {
    BathroomCounter = {
        rolls = 4,
        items = {
            "Comb", 6,
            "DentalFloss", 4,
            "Soap2", 8,
            "ToiletPaper", 20,
            "Toothbrush", 10,
            "Toothpaste", 8,
            ...
        },
        junk = { rolls = 1, items = { "BleachEmpty", 1, ... } },
    },
}
```

The file opens with the global and its `list` :cite[(`media/lua/server/Items/ProceduralDistributions.lua:1-3`)], `BathroomCounter` has `rolls = 4` and the items shown :cite[(`:3618-3625`)], and it ends with its `junk` sub-table. :cite[(`:3675`)]

Most edits happen in the procedural lists, because they hold the item names. The rest of this page uses `BathroomCounter`.

## What the numbers mean

Before the sandbox modifiers, a chance behaves like a percentage per pass, and the modifiers then scale it.

Each time a container is filled, the game makes `rolls` passes over the list. For each item in each pass it draws a whole number from 0 to 9999 and the item spawns if the draw is below:

```
(chance * 100 * lootModifier + zombieDensity) * overTimeMultiplier
```

where `chance` is the number you wrote, scaled by 1.4 for the `junk` sub-table. So with no modifiers, a chance of `10` is a one in ten chance, per pass. That makes the older note's "not a percentage" only half right: before the sandbox modifiers, the number behaves like a percentage per pass. The modifiers (the sandbox category multipliers, the zombie density near the container, and the loot-over-time setting) then scale it, and `rolls` is itself multiplied by the sandbox rolls multiplier.

**What a stock server really shows.** Every default category multiplier is 0.6, and the game uses that per-category value directly as the loot modifier :cite[(`SandboxOptions.java:92-99`, `ItemPickerJava.java:478`)]. So on default settings, a chance of 10 shows up as about 6 percent per pass, not 10. Three more things move the number: entries in a `junk` sub-table skip the category multiplier (the modifier becomes 1.0) but gain the 1.4 factor :cite[(`ItemPickerJava.java:2086-2088`)]; an item with the `MORE_WHEN_NO_ZOMBIES` tag has its chance doubled when the world has no zombies :cite[(`:2074-2078`)]; and zombie density near the container is added before the over-time multiplier.

The game multiplies `rolls` by the sandbox multiplier, with a minimum of 1 :cite[(`zombie/inventory/ItemPickerJava.java:1023-1026`)], draws against `getActualSpawnChance` :cite[(`:1045`)], and applies the formula above :cite[(`:2097-2116`)]. A `junk` entry is multiplied by 1.4 :cite[(`:2063-2073`)], and the per-category loot modifier comes from the sandbox. :cite[(`:1497-1530`)]

So when you pick a number, compare with the numbers already in the list. A `ToiletPaper` at 20 is common here; `Antibiotics` at 0.5 is rare.

## When the game reads the tables

The engine does not read the tables when the Lua files load; it reads them once, when a world is created.

The order is:

:::flow[When the loot tables are read]
- The three distribution events fire: `OnPreDistributionMerge`, `OnDistributionMerge`, `OnPostDistributionMerge`
- `OnInitWorld` fires
- `ItemPickerJava.Parse()` reads the global tables into Java structures for the whole session
:::

World creation fires the three events :cite[(`zombie/iso/IsoWorld.java:1906-1908`)], then `OnInitWorld` :cite[(`:1913`)], then calls `ItemPickerJava.Parse()`. :cite[(`:1921`)] `Parse` reads `SuburbsDistributions` and `ProceduralDistributions` :cite[(`zombie/inventory/ItemPickerJava.java:143-176`)], and `ParseProceduralDistributions` walks `ProceduralDistributions.list`. :cite[(`:307-319`)]

What that means for you:

- **Your edits count if they are made before step 3.** Any time from the moment the vanilla table exists until then.
- **A `server\` file can edit the tables as it loads**, because vanilla's `server` files run first and the `server` Lua loads before the world is created. A `shared\` or `client\` file runs before `ProceduralDistributions.lua` has even been read, so `ProceduralDistributions.list` does not exist yet there.
- **The cleanest hook is `OnPostDistributionMerge`.** It runs after vanilla has finished merging mod tables and has created all the room name aliases (more below).
- **Edits after step 3 do nothing** until something calls the parse again.

The `server` Lua loads when the world is loading :cite[(`zombie/gameStates/GameLoadingState.java:156`)], and vanilla files run before mod files. :cite[(`zombie/Lua/LuaManager.java:1195-1201`)] The vanilla handlers are registered the same way. :cite[(`media/lua/server/Items/SuburbsDistributions.lua:208-210`)]

### Names that point at the same table

`SuburbsDistributions.lua` adds many aliases in `OnDistributionMerge`, so an edit made through either name shows up in both.

For example `SuburbsDistributions.hairdresser = SuburbsDistributions.aesthetic`. They are the same table under two names. Editing in `OnPostDistributionMerge` means the aliases exist, because `mergeDistributions` has already made them. :cite[(`media/lua/server/Items/SuburbsDistributions.lua:132-194`)]

### Who fills containers

Containers are filled on a single player's machine or on the server, never on a client in multiplayer, so loot tables matter where the world is simulated.

`fillContainerInternal` does nothing when `GameClient.client` is true. :cite[(`zombie/inventory/ItemPickerJava.java:566`)]

## Adding, removing, reweighting

The `items` array is a flat list of name, chance, name, chance, and you edit it as a list.

| You want to | You do | Watch for |
|---|---|---|
| Add | append the name, then the number | Use a full name (`MyMod.Thing`) for items outside `Base`. The engine looks up a bare name in `Base`. |
| Remove | remove the number and the name | Remove the number first, then the name, so the index stays right. |
| Reweight | change the number that follows the name | The number sits at name index plus one. |

The loader reads pairs; an item the game cannot find is skipped, and the game logs it only when debug mode is on. :cite[(`zombie/inventory/ItemPickerJava.java:398-418`, `:406-413`)] `FindItem(name)` defaults to `Base`. :cite[(`zombie/scripting/ScriptManager.java:1468-1470`)]

An item name that does not exist is skipped without an error in a normal game. If your added item never appears, check the name first.

## A complete example

The example mod adds a rare crowbar, removes toothpaste and cuts toilet paper in bathroom counters.

Folder:

```
BathroomTweaks\
  42\
    mod.info
    media\
      lua\
        server\
          Items\
            BathroomTweaks.lua
```

`mod.info`:

```
name=Bathroom Tweaks
id=BathroomTweaks
description=Bathroom counters: a rare crowbar, no toothpaste, less toilet paper.
```

`42\media\lua\server\Items\BathroomTweaks.lua`:

```lua
-- Find an item's position in a flat "name, chance, name, chance" list.
-- Returns the index of the name, or nil.
local function findItem(items, name)
    for i = 1, #items, 2 do
        if items[i] == name then
            return i
        end
    end
    return nil
end

local function tweakBathroomCounters()
    -- The procedural list vanilla uses for bathroom counters.
    local dist = ProceduralDistributions.list["BathroomCounter"]
    if dist == nil then
        print("[BathroomTweaks] BathroomCounter not found")
        return
    end
    local items = dist.items

    -- 1. ADD: a crowbar, rare. Only if it is not already there.
    if findItem(items, "Crowbar") == nil then
        table.insert(items, "Crowbar")
        table.insert(items, 2)
    end

    -- 2. REMOVE: toothpaste. Remove the chance first, then the name.
    local i = findItem(items, "Toothpaste")
    if i ~= nil then
        table.remove(items, i + 1)
        table.remove(items, i)
    end

    -- 3. REWEIGHT: toilet paper from 20 down to 5.
    i = findItem(items, "ToiletPaper")
    if i ~= nil then
        items[i + 1] = 5
    end

    print("[BathroomTweaks] BathroomCounter updated")
end

-- Run after the game has merged all distribution tables, before it reads them.
Events.OnPostDistributionMerge.Add(tweakBathroomCounters)
```

How it works, line by line:

| Part | What it does |
|---|---|
| `for i = 1, #items, 2` | Walks the list two steps at a time, so `i` is always a name. `#items` is the length of the list. |
| `ProceduralDistributions.list["BathroomCounter"]` | The vanilla list. The square brackets name it with a string. |
| `table.insert(items, "Crowbar")` then `table.insert(items, 2)` | Adds a name and then its chance, to the end. A chance of 2 means about 2 percent per pass, before modifiers. |
| `table.remove(items, i + 1)` then `table.remove(items, i)` | Removes the chance first, then the name. If you removed the name first, the chance would slide into its place and the pairs would break. |
| `items[i + 1] = 5` | Replaces the number after the name. |
| `Events.OnPostDistributionMerge.Add(...)` | Runs your function at the right moment. |

Why `Crowbar`? It exists as a vanilla item in `Base`, so the bare name works. :cite[(`media/scripts/generated/items/weapon.txt:7873`)]

**See the result.** A rare chance is hard to judge by eye, so test with a temporary loud setting first.

1. For the test only, change the crowbar line to `table.insert(items, 200)`. With the default category multiplier of 0.6 the spawn test becomes `200 * 100 * 0.6 = 12000`, which is above the highest draw (9999), so a crowbar spawns on every pass :cite[(`ItemPickerJava.java:1045`, `:2115`)]. Put the value back to 2 when the test works.
2. Turn on debug mode (see [Changing vanilla: start here](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here), step 4) and start a **new** world, or walk to an area you have not loaded before. Containers that were already filled keep their contents, because the tables are read when a container is filled. That a saved container is not refilled: not verified, but it follows from the fill step being the only place the tables are used. The sandbox has an `HoursForLootRespawn` option :cite[(`SandboxOptions.java:136`)]; how it re-rolls one container: not verified, so a new world is the reliable route.
3. Look in `console.txt` for `[BathroomTweaks] BathroomCounter updated`. If it is missing, the file is in the wrong folder or the mod is off.
4. Walk into any house bathroom and open the counter (the container named `counter` in a `bathroom` room). You should find crowbars, no toothpaste, and little toilet paper.
5. Open the debug menu's Items list :cite[(`ISDebugMenu.lua:23`)] only to compare how an item looks; it does not show container loot tables. A loot viewer panel exists in the admin tools :cite[(`media/lua/client/ISUI/AdminPanel/LootZed/ISLootZed.lua`)]; how to open it: not verified.

> **Multiplayer:** put this file on the server (the mod is enabled on the server). The server fills containers, so the table edit has to be there. Clients also load the mod, and the checksum check means both sides need the same files; see [Editing items at load](/pz/build-42/modding/changing-vanilla/editing-items-at-load).

## Editing every list at once

To touch an item everywhere, loop over `ProceduralDistributions.list`.

```lua
local function removeEverywhere(name)
    for listName, dist in pairs(ProceduralDistributions.list) do
        for _, part in ipairs({ dist, dist.junk }) do
            local items = part and part.items
            if items then
                for i = #items - 1, 1, -2 do
                    if items[i] == name then
                        table.remove(items, i + 1)
                        table.remove(items, i)
                    end
                end
            end
        end
    end
end
```

It walks each list and its `junk`, from the end, in steps of two, and takes out every pair with that name. Run it inside `OnPostDistributionMerge`. The sandbox `LootItemRemovalList` does the same without any code, so use that if a player-facing setting is enough.

`LootItemRemovalList` is a sandbox option :cite[(`zombie/SandboxOptions.java:110`)]; a listed item gets a loot modifier of zero :cite[(`zombie/inventory/ItemPickerJava.java:1506-1512`)], and a zero modifier means a zero spawn chance. :cite[(`:2103-2104`)]

## The merge helper: what it does and does not do

The game lets a mod add a whole table to the global `Distributions` list, but the merge only copies missing keys and appends `items`; it never changes a number or removes anything.

```lua
table.insert(Distributions, myTable)
```

At `OnDistributionMerge`, vanilla walks each added table and calls `MergeDistributionRecursive` against the main one. Reading that function:

- A key the main table lacks is copied in.
- An `items` array that exists in both is **appended**. This is how you add loot.
- A number or text value that exists in both is **not changed**. The merge cannot change `rolls`, and it cannot change a chance already in the list.
- It never removes anything.
- Array tables other than `items` (such as `procList`) are merged position by position, not appended. Adding a procedural list to a room's `procList` this way will not behave like an insert. Edit `procList` directly instead.
- Add your table at the end (`table.insert(Distributions, myTable)`), not at position 1, because vanilla assumes its own table is first.

The merge itself is `MergeDistributionRecursive` :cite[(`media/lua/server/Items/SuburbsDistributions.lua:114-130`)], and `mergeDistributions` takes `Distributions[1]` as the game's own and merges the rest. :cite[(`:136-146`)] This is from reading the code, not from running it.

## Helper functions that vanilla ships

`SuburbsDistributions.lua` defines three global helpers, `ClearAllDistributionItems`, `RemoveItemFromDistribution` and `ReplaceItemInDistribution`, and the last one has a bug.

- `RemoveItemFromDistribution(dist, itemName, chance, recursive)` removes matching pairs. It works the same way as the loop above.
- `ReplaceItemInDistribution` has a bug when you give it a replacement chance. In the matching branch it writes the replacement chance into the slot of the *name* (`_dist[k][i] = _replaceChance`), not the slot after it. The pair is left broken. Replace without a new chance, or write your own loop.

The three helpers are defined in the same file :cite[(`media/lua/server/Items/SuburbsDistributions.lua:17`, `:34`, `:73`)], and the faulty lines are in the replace helper. :cite[(`:92-94`)] Read, not run.

## Reacting to a filled container

When the game fills a container it fires `OnFillContainer` with the room name, the container type and the container, so a handler can change that one container afterward.

```lua
Events.OnFillContainer.Add(function(roomName, containerType, container)
    -- inspect or change "container" here
end)
```

The game fires the event after it fills a container :cite[(`zombie/inventory/ItemPickerJava.java:598`, `:618`)], and Lua can listen to it. :cite[(`zombie/Lua/LuaEventManager.java:730`)]

Use it for rules the table cannot express ("only in houses with a certain feature"). It costs a Lua call per filled container, so keep it light.

## Common mistakes

Five mistakes to avoid.

| Mistake | What happens | Fix |
|---|---|---|
| Edit in a `shared\` file at the top level | `ProceduralDistributions.list` is `nil`; your file errors. | Use the `server\` folder, and an event. |
| Edit in a `client\` only mod in multiplayer | The server fills containers; nothing changes. | The edit must run on the server. |
| `table.insert(items, "MyMod.Thing")` with no number | The pairs shift and every chance after it is wrong. | Always insert a name and a number together. |
| Added item has a typo | Skipped without an error. | Turn on debug mode and look for `ignoring invalid ItemPicker item type`. |
| You add many items | Each added item raises the expected number of items per container. | Keep chances low, or add one item that stands for several. |

That message is the one the loader logs for an invalid item. :cite[(`zombie/inventory/ItemPickerJava.java:408-413`)]

## Where to go next

- [Editing items at load](/pz/build-42/modding/changing-vanilla/editing-items-at-load).
- [Patching vanilla Lua](/pz/build-42/modding/changing-vanilla/patching-vanilla-lua) for wrapping, and for why the vanilla `Distributions` files must not be replaced.
- [Changing vanilla: start here](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here).

:::callout[How we know]{kind=proof}
Read from the 42.22 Lua and Java; nothing here was run in a game. Not verified: that a saved container is never refilled, how `HoursForLootRespawn` re-rolls a container, how to open the loot viewer panel, and the merge helper and `ReplaceItemInDistribution` behavior (read, not run).
:::
