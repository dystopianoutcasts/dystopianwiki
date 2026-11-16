---
id: build-42-modding-procedural-distributions
slug: modding-procedural-distributions
title: 'MODDING: procedural distributions (loot)'
game: pz
version: build-42
section: modding
category: farming-and-animals
difficulty: intermediate
tags:
  - animaldefinitions
  - farming
  - ranch-zones
  - foraging
  - husbandry
excerpt: >-
  How a farming or animal mod puts seeds, produce or feed into world loot in 42.22: the lists, the 18 optional list keys, the slider seeds use, and a seed-packet example.
last_updated: '2026-11-16'
related_articles:
  - agriculture-basics-from-seed-to-harvest
  - foraging-in-b42
  - modding-recipes-adding-a-crop-editing-an-animal-breed
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** [modders putting farm items in loot](#3-adding-farm-items-to-a-list)

Farming and animal mods often need their seeds, produce, feed or animal products to show up in world containers. The loot lists are the same ones as for any other item, so most of the work is in two other guides. This page is the farming view of them: what is special about farm items, and what the list keys do.

:::callout[The 1-minute version]{kind=key}
- Loot lives in `media/lua/server/Items/`: `Distributions.lua` (rooms and containers) and `ProceduralDistributions.lua` (named lists, more than 1,300 of them). A list has `rolls` and a flat `items` array of name, chance, name, chance.
- A chance behaves like a percent per pass before the sandbox sliders. The slider for seeds and gardening tools is Farming (0.6 by default, 2.0 in the Rising preset).
- Edit the lists from a `server` Lua file inside `OnPostDistributionMerge`, and only containers filled after that change. The guides below have the working example and the reasons.
- A mod item counts as Farming loot when its display category is Gardening or it carries the farming-loot tag. Use the full name (`MyMod.Item`) for items outside `Base`.
- Adding many entries raises how much every container holds. Add few, with low chances.
:::

:::facts
- **List keys** 18 optional keys, besides `rolls`, `items` and the `procList` of a procedural list :cite[(`zombie/inventory/ItemPickerJava.java:318-396`)]
- **Default Farming slider** 0.6, and 2.0 in the Rising preset :cite[(`zombie/SandboxOptions.java:107`, `media/lua/shared/Sandbox/Rising.lua:41`)]
- **Chance per roll** (listed chance x 100 x slider + zombie density bonus) x loot-over-time multiplier, out of 10,000; the bonus is 0 and the multiplier 1 at default settings :cite[(`zombie/inventory/ItemPickerJava.java:2097-2122`)]
- **Seed packets** appear in 6 farm and garden lists :cite[(`media/lua/server/Items/ProceduralDistributions.lua:14758`, `media/lua/server/Items/ProceduralDistributions.lua:15095`)]
:::

## 1. Where the numbers live

**The rules for rolling a list are on two other pages, so here is only the short version.**

The full roll (rolls, the 1.4 junk factor, diminished loot, respawn) is on [How loot is rolled and when it respawns](/pz/build-42/gameplay/the-real-numbers/how-loot-is-rolled-and-respawns). How to add, remove and reweight entries, with a complete mod, is on [Changing loot](/pz/build-42/modding/changing-vanilla/changing-loot). That page also says that the older note on this one was only half right: a chance is not a weight, it behaves like a percent per roll before modifiers, so a chance of 10 is about 6 percent on default settings. :cite[(`zombie/inventory/ItemPickerJava.java:2097-2116`, `SandboxOptions.java:92-99`)]

A list looks like this:

```lua
ProceduralDistributions.list.ExampleList = {
    rolls = 3,
    items = { "Item1", 10, "Item2", 5 },
    junk  = { rolls = 1, items = { } },
}
```

That is the shape the vanilla file uses: `ProceduralDistributions.list` holds each list by name, with `rolls`, `items` and often a `junk` sub-list. :cite[(`media/lua/server/Items/ProceduralDistributions.lua:1-6`, `media/lua/server/Items/ProceduralDistributions.lua:15095-15097`)] A loot mod that fires on filling a container can use the `OnFillContainer` event, which the game triggers after a container is filled with three arguments: the room name, the container type and the container. :cite[(`zombie/inventory/ItemPickerJava.java:594-619`, `zombie/Lua/LuaEventManager.java:730`)] Vanilla's own listener is a loot log. :cite[(`media/lua/server/Items/LootLog.lua:5-34`)]

## 2. The keys a list can carry

**Besides `rolls` and `items`, a list can carry 18 optional keys (and `procList` when it is procedural), and they change what the filled container looks like.**

The game reads these keys from each list when it parses the tables. :cite[(`zombie/inventory/ItemPickerJava.java:318-396`)]

| Key | What it does | Code |
|---|---|---|
| `procedural`, `procList` | The container picks from named lists, with forced picks by room, tile, zone or item | `zombie/inventory/ItemPickerJava.java:327-330`, `zombie/inventory/ItemPickerJava.java:433-462` |
| `junk` | A sub-list rolled with chance x 1.4, slider 1.0, and no zombie density bonus | `zombie/inventory/ItemPickerJava.java:385-388`, `zombie/inventory/ItemPickerJava.java:2071-2095` |
| `bags` | A sub-list rolled into any bag that spawns in this list, unless the bag carries the fill-exception tag | `zombie/inventory/ItemPickerJava.java:389-391`, `zombie/inventory/ItemPickerJava.java:1155-1158` |
| `fillRand` | A one-in-N chance that a container item (a bag) found in the list is itself filled | `zombie/inventory/ItemPickerJava.java:336-338`, `zombie/inventory/ItemPickerJava.java:1160` |
| `ignoreZombieDensity` | Skips the zombie density bonus for the list | `zombie/inventory/ItemPickerJava.java:356-358`, `zombie/inventory/ItemPickerJava.java:2121` |
| `isShop` | Marks the list as a shop, which skips the stash roll on its items | `zombie/inventory/ItemPickerJava.java:323-326`, `zombie/inventory/ItemPickerJava.java:1053-1056` |
| `stashChance` | Gives a spawned map item its chance to point to a stash | `zombie/inventory/ItemPickerJava.java:344-346`, `zombie/inventory/ItemPickerJava.java:1251-1253` |
| `maxMap` | Removes a spawned map item when the container already holds more than this many | `zombie/inventory/ItemPickerJava.java:340-342`, `zombie/inventory/ItemPickerJava.java:1314-1327` |
| `onlyOne` | Stops the fill after the first item that spawns | `zombie/inventory/ItemPickerJava.java:380-382`, `zombie/inventory/ItemPickerJava.java:1242-1244` |
| `canBurn`, `cookFood` | Cookable food is set cooked, or with `canBurn` burnt 25 times in 100 | `zombie/inventory/ItemPickerJava.java:360-366`, `zombie/inventory/ItemPickerJava.java:1175-1186` |
| `isTrash`, `isWorn`, `isRotten` | Run the matching damage function on each spawned item | `zombie/inventory/ItemPickerJava.java:368-378`, `zombie/inventory/ItemPickerJava.java:1187-1197` |
| `noAutoAge` | Skips the automatic aging of spawned food | `zombie/inventory/ItemPickerJava.java:332-334`, `zombie/inventory/ItemPickerJava.java:1121-1123` |
| `dontSpawnAmmo` | Keeps a spawned firearm from being loaded as loot | `zombie/inventory/ItemPickerJava.java:348-350`, `zombie/inventory/ItemPickerJava.java:1146-1150` |
| `gunStorage`, `defaultInventoryLoot` | Read from the table, not traced here | `zombie/inventory/ItemPickerJava.java:318-396` |

The older note that `onlyOne` was deprecated is not borne out: the keyword is read and stops the fill, and the vanilla files use it. :cite[(`zombie/inventory/ItemPickerJava.java:1242-1244`, `media/lua/server/Items/Distributions.lua:743`, `media/lua/server/Items/ProceduralDistributions.lua:15220`)] The older note that `maxMap` is "unsure" is now answered: it caps map items. The generic clutter lists, `ClutterTables`, are in the `Distribution_*Junk.lua` files. :cite[(`media/lua/server/Items/Distribution_BinJunk.lua:1-5`)]

## 3. Adding farm items to a list

**A seed or a gardening tool counts as Farming loot, so it follows the Farming slider, not Other.**

An item is Farming loot when its display category is Gardening (or GardeningWeapon), or it has the farming-loot tag. It is tested after Generators, Mementos, Medical, Mechanics and Material, before tools. :cite[(`zombie/scripting/objects/Item.java:3408-3412`, `zombie/inventory/ItemPickerJava.java:1562-1575`)] The slider is Farming, with a default of 0.6, and with `FarmingLootNew` also named in the sandbox text as "Items and weapons which are used in both animal and plant agriculture, such as Seeds, Trowels, or Shovels". :cite[(`zombie/SandboxOptions.java:107`, `media/lua/shared/Translate/EN/Sandbox.json:335-336`)] The presets set 0.6, except Rising with 2.0, and SixMonthsLater sets nothing so the Java default of 0.6 applies. :cite[(`media/lua/shared/Sandbox/Apocalypse.lua:41`, `media/lua/shared/Sandbox/Extinction.lua:41`, `media/lua/shared/Sandbox/Outbreak.lua:41`, `media/lua/shared/Sandbox/Rising.lua:41`, `media/lua/shared/Sandbox/SixMonthsLater.lua:33-49`)]

An item outside `Base` needs its module in front, as in `MyMod.MyItem` (the example below does this). The vanilla clutter and bag lists are in `Distribution_BagsAndContainers.lua` and the `Distribution_*Junk.lua` files.

Vanilla puts packets of many crops in six lists: `CrateFarming`, `CrateGardening`, `GardenStoreMisc`, `GigamartFarming`, `Homesteading` and `ToolStoreFarming`. :cite[(`media/lua/server/Items/ProceduralDistributions.lua:14758`, `media/lua/server/Items/ProceduralDistributions.lua:15095`, `media/lua/server/Items/ProceduralDistributions.lua:23508`, `media/lua/server/Items/ProceduralDistributions.lua:24597`, `media/lua/server/Items/ProceduralDistributions.lua:26976`, `media/lua/server/Items/ProceduralDistributions.lua:48986`)] `CrateGardening` rolls 4 times, and lists the carrot packet at 2. :cite[(`media/lua/server/Items/ProceduralDistributions.lua:15096`, `media/lua/server/Items/ProceduralDistributions.lua:15103`)] At default settings the zombie density bonus is 0 and the loot-over-time multiplier is 1, so that is 2 x 100 x 0.6 = 120 out of 10,000, or 1.2 percent per roll, and about 4.7 percent for at least one carrot packet in a crate. Those percentages are our arithmetic.

### Example: the Demo Carrot seed in garden crates

**This file adds one entry to `CrateGardening`; it belongs to a complete mod you already have.**

It is an extra file for the complete `RecipeDemoCrop` mod of the [new crop recipe](/pz/build-42/modding/cookbook/new-crop), which has the `mod.info`, the crop and the seed. Enable that mod as the recipe says (tick it in the Mods screen, or on a dedicated server list its id in `Mods=`, separated by `;`). Add this file next to its other Lua file:

**File `42/media/lua/server/Items/RecipeDemoCrop_loot.lua`**

```lua
local function addDemoSeed()
    local dist = ProceduralDistributions.list["CrateGardening"]
    if dist == nil then
        print("[RecipeDemoCrop] CrateGardening not found")
        return
    end
    -- Add the name, then its chance. 3 is about 1.8 percent per roll on default settings.
    table.insert(dist.items, "RecipeDemoCrop.CarrotSeed")
    table.insert(dist.items, 3)
    print("[RecipeDemoCrop] seed added to CrateGardening")
end

Events.OnPostDistributionMerge.Add(addDemoSeed)
```

The file uses `table.insert` twice, first for the name and then for the chance. The seed's script gives it `DisplayCategory = Gardening`, so it is Farming loot. :cite[(`media/scripts/generated/items/normal.txt:5214-5222`)]

To see it, start a new world with the mod on and open garden crates in a garden store or a farm.

For a quick test only, raise the chance to 200, which makes it spawn on every roll. The console line `[RecipeDemoCrop] seed added to CrateGardening` tells you the file ran. This example was not run in a game. The full reasons and the multiplayer note are on [Changing loot](/pz/build-42/modding/changing-vanilla/changing-loot).

**The bloat warning.** Every entry you add raises the average number of items in every container that rolls the list, and the crate gets fuller for everybody. A big mod that adds a hundred items to common lists makes loot feel padded. Keep to a handful of entries with small chances. Use one item with variants instead of many items, or fill the container yourself on `OnFillContainer`. Lowering your chance later only hides the problem.

:::callout[How we know]{kind=proof}
The list keys, the Farming category rule and the roll are read from the 42.22 Java and Lua cited beside them. The percentages are our own arithmetic. We did not run a game, so the example mod, the list counts in a real world and the bloat effect were not tested.

Not verified: what `gunStorage` and `defaultInventoryLoot` do, the effect of `isTrash`, `isWorn` and `isRotten` on each item type, and the names of the other lists that hold farm items outside the six above.
:::
