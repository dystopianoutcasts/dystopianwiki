---
id: build-42-fluids-for-modders-start-here
slug: fluids-for-modders-start-here
title: 'Fluids for modders: start here'
game: pz
version: build-42
section: modding
category: fluids
difficulty: beginner
tags:
  - fluids
  - fluidcontainer
  - overview
excerpt: >-
  How Build 42 fluids work for a modder, the five things to know first, and a complete small mod (a new fluid and a flask that holds it) that you can build from an empty folder.
last_updated: '2026-11-15'
related_articles:
  - the-fluid-system
  - defining-a-fluid-names-poison-properties
  - fluid-container-calls-that-lie
  - drinking-tainted-water-and-boiling
  - fluids-in-multiplayer
  - what-a-mod-fluid-can-plug-into
  - new-fluid
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders who want a working fluid now](#build-a-working-fluid-mod-from-a-cold-start) | [modders who want the rules first](#five-things-to-know-first) | [server owners](#putting-it-on-a-dedicated-server)

:::callout[The 1-minute version]{kind=key}
- A fluid is stored in a `FluidContainer` component on an item (or on a world object), not on a vehicle part.
- A container can hold up to eight fluids at once, and a pour moves every fluid in proportion.
- Fluids do not age on their own. The per-tick fluid update touches only rain-catching containers (and entities flagged as meta, which this page did not examine); heat on an item is handled in the item's own update.
- Give your fluid a new name: a script whose name matches a vanilla fluid, in any letter case, replaces the vanilla definition.
- Some container calls do nothing, or do something else, without saying so; read the calls page before writing fluid Lua.
- The example mod below is written from the 42.22 code and has not been run in a game.
:::

:::facts
- **Fluids in one container** 8 at most :cite[(`FluidContainer.java:56`)]
- **Default capacity** 1.0 liter when the script sets none :cite[(`FluidContainerScript.java:34`)]
- **Smallest capacity** 0.05 liter; anything smaller is raised to it :cite[(`FluidContainer.java:692`)]
- **Pour time** 40 action-time units for each liter, never under 20 :cite[(`FluidUtil.java:31-32`)]
- **Vanilla fluid scripts** 61 `fluid` blocks in three files, counted by script
- **Vanilla items with a container** 133 `component FluidContainer` blocks in four item script files, counted by script
:::

## Five things to know first

Everything below follows from five facts about how the engine treats fluids.

**1. A fluid lives on an item, not on a vehicle part.** Item scripts can carry a `FluidContainer` component, and the Bucket is a vanilla example :cite[(`normal.txt:13889-13912`)]. The method that adds a component to an entity is package-private, so a mod's Lua cannot attach one at runtime :cite[(`GameEntity.java:260`)]. The vehicle script file has no component handling at all (a search of `VehicleScript.java` finds none), so a part script cannot declare one either. If your car needs oil, the oil sits in an item: the part's fitted item, or an item in the part's container. A vehicle part and an inventory item are both entities :cite[(`VehiclePart.java:44`, `InventoryItem.java:131`)], which is why an item can carry the component.

**2. A container holds up to eight fluids, and mixing is free.** A fluid can be added when the container has fewer than eight kinds or already holds that kind, when input is not locked, and when every fluid inside accepts the newcomer and the newcomer accepts them :cite[(`FluidContainer.java:906-916`)]. Draining takes from each fluid by its share of the mix :cite[(`FluidContainer.java:989`)], and a transfer moves each fluid by its share too :cite[(`FluidContainer.java:1171`)]. You do not write mixing code.

**3. Nothing goes stale on its own.** The fluid update system skips clients, and acts only on entities flagged as meta or on containers with a rain factor above zero :cite[(`FluidContainerUpdateSystem.java:42-56`, `FluidContainer.java:1352-1354`)]. For those, petrol in a rain-catching container that can be emptied evaporates a little each tick :cite[(`FluidContainerUpdateSystem.java:60-74`)], and rain adds tainted water, or clean water when the script says `FillsWithCleanWater` :cite[(`FluidContainerUpdateSystem.java:76-106`, `FluidContainerScript.java:177-178`)]. Heat is separate: an item above heat 1.6 turns tainted water into clean water and destroys petrol :cite[(`InventoryItem.java:1478-1503`)]. Clean oil turning dirty, or milk going off in a jug, is yours to write; see [Water and plumbing](/pz/build-42/engine/fire-water-and-power/water-and-plumbing) for the vanilla water rules.

**4. A fluid named like a vanilla one replaces it.** When a fluid script's name matches a `FluidType` name, ignoring case, the script is bound to the vanilla fluid and sets its definition :cite[(`FluidDefinitionScript.java:223-228`, `Fluid.java:156-181`)]. A name that matches nothing becomes a modded fluid, registered by that name :cite[(`FluidDefinitionScript.java:226-227`, `Fluid.java:157-167`)].

**5. Several calls do not do what their names say.** `addFluid` does nothing when the fluid name is wrong, the container is full, input is locked or the blend rules refuse it :cite[(`FluidContainer.java:936-938`, `:906-916`)], and it does not tell you. Read [FluidContainer calls that do not do what their names say](/pz/build-42/modding/fluids/fluid-container-calls-that-lie) before your first line of fluid code.

## Build a working fluid mod from a cold start

The mod below adds one fluid, Sweet Juice, one item, a Juice Flask, that holds it, and a few lines of Lua that fill a flask when a game starts.

You need Project Zomboid 42.22 and a text editor. The steps follow the same shape as the Fire Watch mod in [Modding fire, water and power](/pz/build-42/engine/fire-water-and-power/modding-fire-water-and-power). None of it has been run in a game; the checks at the end say what you should see.

### 1. Make the folders

Find your Zomboid user folder. On Windows it is `C:\Users\<your name>\Zomboid`. Inside it, make this tree:

```
Zomboid\
  mods\
    FluidDemo\
      common\                      <- an empty folder, kept by convention (not verified as required)
      42\
        mod.info
        media\
          scripts\
            fluiddemo.txt
          lua\
            client\
              FluidDemo.lua
```

The game lists a mod folder when it holds a `mod.info` in `common` or in the folder for the game version, so `common` is not needed for the game to list the mod :cite[(`ZomboidFileSystem.java:496-503`)]. We keep the empty `common` folder as a Workshop upload convention, which this page did not verify. See [The versioned layout](/pz/build-42/modding/foundations/the-versioned-layout-common-build-folders) for how `common` and `42` combine.

### 2. mod.info

Save this as `42\mod.info`. There must be no spaces around the `=` signs.

```
name=Fluid Demo
id=FluidDemo
description=A new fluid and a flask that holds it. Gives you one flask when a game starts.
```

The `id` is what a server's `Mods=` line must contain. The other fields are in [mod.info fields](/pz/build-42/modding/foundations/mod-info-fields-and-the-versioning-compatibility-system).

### 3. The scripts

Save this as `42\media\scripts\fluiddemo.txt`. The file holds the fluid and the item that can contain it.

```
module FluidDemo
{
    fluid SweetJuice
    {
        ColorReference = Orange,
        DisplayName = Sweet Juice,
        Categories
        {
            Beverage,
        }
        Properties
        {
            thirstChange = -20.0,
            hungerChange = -5.0,
            calories = 40.0,
        }
    }

    item JuiceFlask
    {
        DisplayName = Juice Flask,
        DisplayCategory = WaterContainer,
        ItemType = base:normal,
        Weight = 0.4,
        Icon = GlassBottle,
        IconFluidMask = GlassBottle_Mask,
        component FluidContainer
        {
            ContainerName = JuiceFlask,
            Capacity = 1.0,
        }
    }
}
```

What each line does:

| Line | What it does | Code |
|---|---|---|
| `fluid SweetJuice` | A name that matches no vanilla fluid becomes a modded fluid | `FluidDefinitionScript.java:223-228` |
| `ColorReference = Orange` | A named color; an unknown name throws when the color is read | `FluidDefinitionScript.java:236-237`, `:106-113`, `Colors.java:71`, `:260-262` |
| `DisplayName = Sweet Juice` | The game looks the text up as a translation key and shows the text itself when no key matches | `FluidDefinitionScript.java:234-235`, `Translator.java:879-882` |
| `Categories { Beverage }` | Each name is turned into a category with `valueOf`, so an unknown name throws an exception while the script loads | `FluidDefinitionScript.java:282-287`, `FluidCategory.java:17-28` |
| `Properties { ... }` | What one liter does to the drinker; the keys are the fixed list on [the fluid system page](/pz/build-42/modding/fluids/the-fluid-system) | `FluidDefinitionScript.java:313-347` |
| `item JuiceFlask` | An item script; B42 reads `ItemType`, and the display name is read from the script | `Item.java:1976`, `:1982` |
| `component FluidContainer` | Makes the item a container; with no `Fluids` block it starts empty | `FluidContainerScript.java:147-181`, `FluidContainer.java:96-122` |
| `Capacity = 1.0` | Liters; this is also the default | `FluidContainerScript.java:34` |

The icon names `GlassBottle` and `GlassBottle_Mask` are the ones the vanilla crafted bottle uses :cite[(`normal.txt:7243-7244`)], so the demo needs no art of its own.

When the mod loads and the fluid is missing, look in `console.txt` for an unknown-key error: an unknown key in a fluid script is logged as an error, and in debug mode it throws :cite[(`FluidDefinitionScript.java:252-257`)].

### 4. FluidDemo.lua

Save this as `42\media\lua\client\FluidDemo.lua`. Lines starting with two dashes are notes for humans.

```lua
-- Fluid Demo: fill a flask when a game starts, and write what happened to console.txt.

local function onGameStart()
    local player = getPlayer()
    -- Make one flask in the main inventory. AddItem returns the new item.
    local flask = player:getInventory():AddItem("FluidDemo.JuiceFlask")
    -- The flask's FluidContainer; nil if the item had no component.
    local fluid = flask:getFluidContainer()
    if not fluid then
        print("[FluidDemo] the flask has no FluidContainer, check the script")
        return
    end

    fluid:addFluid("SweetJuice", 0.5)   -- the name is case sensitive here
    print("[FluidDemo] juice: " .. fluid:getAmount() .. " of " .. fluid:getCapacity() .. " liters")

    fluid:addFluid("Water", 0.25)       -- a vanilla fluid; it mixes in
    print("[FluidDemo] with water: " .. fluid:getAmount() .. " liters, mixture = " .. tostring(fluid:isMixture()))
    print("[FluidDemo] main fluid: " .. fluid:getPrimaryFluid():getFluidTypeString())
end

Events.OnGameStart.Add(onGameStart)
```

The calls exist in the Lua API: `getFluidContainer`, `addFluid(String, float)`, `getAmount`, `getCapacity`, `isMixture` and `getPrimaryFluid` :cite[(`GameEntity.java:190`, `FluidContainer.java:920-922`, `:565`, `:537`, `:862`, `:799`)]. The fluid name given to `addFluid` is looked up by exact spelling, so a differently spelled name finds nothing and adds nothing :cite[(`Fluid.java:106-112`)]. The main fluid is the one with the largest amount, which is why Sweet Juice (0.5) stays ahead of Water (0.25) :cite[(`FluidContainer.java:799-815`)].

`OnGameStart` runs each time a game loads, so every load adds one more flask. The event has no parameters :cite[(`LuaEventManager.java:604`)].

### 5. Turn the mod on and load a game

1. Start Project Zomboid, open **Mods** on the main menu, and turn **Fluid Demo** on. If it is not in the list, the folder is in the wrong place.
2. Start a new single-player game, or load a save with the mod on its list.
3. When the game has loaded, open `console.txt` in your Zomboid folder.

### 6. What you should see

1. `console.txt` holds `[FluidDemo] juice: 0.5 of 1.0 liters` (the number format, such as 1 or 1.0, is not verified), then `[FluidDemo] with water: 0.75 liters, mixture = true`, then `[FluidDemo] main fluid: SweetJuice`.
2. A Juice Flask is in your main inventory. Hover over it: the tooltip is built by the fluid container and lists what it holds :cite[(`FluidContainer.java:242-390`)].
3. If a line is missing, check the table below.

### If it does not work

Most failures are a wrong folder, a mod that is off for the save, or a typo.

| You see | Likely cause | Fix |
|---|---|---|
| Fluid Demo is not in the Mods list | `mod.info` is not inside `42\` | Check the tree above |
| No `[FluidDemo]` lines at all | The mod is off for this save, or the Lua file is in the wrong folder | It must be in `media\lua\client` |
| `the flask has no FluidContainer` | The item script did not load | Look for `ERROR` lines about `fluiddemo.txt` in `console.txt` |
| `juice: 0 of 1.0 liters` | The fluid script did not load, so `addFluid` found no `SweetJuice` | Look for `Unknown key` or a category error in `console.txt` |
| The mixture line says `false` | The water was refused: the container was full, or the juice has blend rules | Remove any `BlendWhiteList` you added |

## Putting it on a dedicated server

A server needs the same mod folder, and its `Mods=` and `WorkshopItems=` settings name what to load.

The server reads `Mods` as a list separated by `;` and ignores empty entries :cite[(`GameServer.java:667-672`)]. It reads `WorkshopItems` the same way and keeps only valid Steam ids :cite[(`GameServer.java:693-700`)]. For this mod, put the mod id in the `Mods=` line, for example `Mods=FluidDemo`. If you later publish it to the Workshop, put its Workshop id in `WorkshopItems=`, and join several entries with `;`.

The fluid and item scripts load on both sides, so the flask exists on a server. The Lua file above is a single-player demo: it runs on a client and makes the flask there. A real server mod gives items from server code.

How a change reaches other players depends on where the container sits: see [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer). Giving the flask to a player on a dedicated server was not tried.

The vanilla pour and empty actions define `complete()`, which does the transfer where the code is not a client :cite[(`ISFluidTransferAction.lua:70`, `ISFluidEmptyAction.lua:99`)]. A stale `--todo sync mp` comment in the transfer action does not mean it fails in multiplayer :cite[(`ISFluidTransferAction.lua:84`)].

## Where each part is explained

The rest of the fluids section goes deeper on one question each.

| Page | Read it when |
|---|---|
| [The fluid system](/pz/build-42/modding/fluids/the-fluid-system) | You want the script syntax, the container fields and the Lua calls in one place |
| [Defining a fluid: names, Poison and Properties](/pz/build-42/modding/fluids/defining-a-fluid-names-poison-properties) | You are writing a `fluid` block |
| [FluidContainer calls that do not do what their names say](/pz/build-42/modding/fluids/fluid-container-calls-that-lie) | You are writing Lua that adds, removes or converts fluid |
| [Drinking, tainted water and boiling](/pz/build-42/modding/fluids/drinking-tainted-water-and-boiling) | Your fluid can be drunk, or your mod boils, cleans or poisons |
| [Fluids in multiplayer](/pz/build-42/modding/fluids/fluids-in-multiplayer) | Your mod changes fluid anywhere other than a single-player test |
| [What a mod fluid can plug into](/pz/build-42/modding/fluids/what-a-mod-fluid-can-plug-into) | You hope your fluid will burn, fuel or poison food like a vanilla one |
| [Hot items in multiplayer](/pz/build-42/modding/multiplayer/hot-items-in-multiplayer) | Anything in your mod needs a hot pot |
| [New fluid (cookbook)](/pz/build-42/modding/cookbook/new-fluid) | You want a second example to compare |

:::callout[How we know]{kind=proof}
Every code reference above was opened in the 42.22 capture. The mod was not run in a game, so the lines in step 6, the tooltip and the server steps are what the code says should happen.

**Not examined:** what a "meta" entity is and which entities are flagged as one. The claim that a vehicle script cannot declare a component rests on a search of `VehicleScript.java`, not on a cited line. The older version of this page cited 42.20 and 42.21; the facts that changed since are listed on [The fluid system](/pz/build-42/modding/fluids/the-fluid-system).
:::
