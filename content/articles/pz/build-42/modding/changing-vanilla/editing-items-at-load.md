---
id: build-42-editing-items-at-load
slug: editing-items-at-load
title: 'Editing items at load: DoParam, the right moment, and tags'
game: pz
version: build-42
section: modding
category: changing-vanilla
difficulty: intermediate
tags:
  - items
  - lua
  - doparam
  - timing
  - multiplayer
  - tags
excerpt: >-
  How to change an existing item's stats from Lua with DoParam, which start-up moment works, why a server-only file can silently never run, and what a mod can do with item tags.
last_updated: '2026-11-14'
related_articles:
  - changing-vanilla-start-here
  - patching-vanilla-lua
  - overriding-scripts
  - changing-loot
  - changing-recipes-and-crafting
  - what-needs-java-and-what-is-impossible
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders who need Lua instead of a block](#what-doparam-is) | [multiplayer modders](#multiplayer-does-the-server-need-the-same-change) | [modders working with tags](#tags)

You pick up a plank and its tooltip says 3.0 kg. That number is stored in the plank's script object, a Java object created at start-up from the text in a script file. [Overriding scripts](/pz/build-42/modding/changing-vanilla/overriding-scripts) shows the easy way to change it: a short script block. This page is for the cases where a block cannot do it, for example:

- the new value depends on something you only know at run time (a sandbox setting, whether another mod is loaded);
- you want to change many items by a rule ("every item in this category is 20 percent lighter");
- you want to set the same value on several items without copying a block for each.

Then you edit the live script object from Lua, once, at start-up. The call is `DoParam`.

:::callout[The 1-minute version]{kind=key}
- Use a script block when a fixed value does the job. Use `DoParam` only when the value depends on run time or applies by a rule.
- `getScriptManager():getItem("Base.Plank"):DoParam("Weight", "1.5")` edits the script item. Any key a script can set, `DoParam` can set.
- Do the edit in a `shared\` file, inside an `OnGameBoot` handler. A handler registered from a `server\` file is added too late on a client and never runs.
- Both sides must make the same edit, so put it in `shared\` or in a script block.
- Tags can be added but not removed, and an unknown tag does nothing, quietly.
:::

:::facts
- **Plank weight in the example** 3.0 in vanilla, 1.5 after the edit
- **Iron bar weight in the example** 2.0 in vanilla, 1.0 after the edit
- **Tag spelling in 42.22** `base:hasmetal`; no namespace reads as `base`
:::

## Use a script block when you can

A script block is data, merged by the engine on every side with no timing to get wrong, so reach for Lua only when the block cannot say what you need.

If a fixed value does the job, [stay with the script](/pz/build-42/modding/changing-vanilla/overriding-scripts).

## What DoParam is

`DoParam` is a method on the script item that takes one setting, in the same words a script file uses, and applies it to that item.

```lua
local plank = getScriptManager():getItem("Base.Plank")
plank:DoParam("Weight = 1.5")
```

- `getScriptManager()` returns the engine's script registry.
- `getItem("Base.Plank")` looks up the script item by its full name (module, dot, item name). It returns nothing if there is no such item.
- `plank:DoParam("Weight = 1.5")` sets the weight. The colon is a method call; the string is `key = value`.

`getScriptManager` is a Lua global :cite[(`zombie/Lua/LuaManager.java:5518-5521`)], and `getItem` looks up an item by name. :cite[(`zombie/scripting/ScriptManager.java:766-768`)] `DoParam(String)` splits on `=`, trims both halves, and calls the two-argument form :cite[(`zombie/scripting/objects/Item.java:1936-1948`)]; `DoParam(String, String)` is public :cite[(`:1950`)]; `Weight` sets `actualWeight`, never below zero :cite[(`:2057-2062`)]; and `Item` is exposed to Lua. :cite[(`zombie/Lua/LuaManager.java:2332`)]

Facts worth knowing:

- **It is the very code that reads a script file.** `Item.Load` calls `DoParam` for each `key = value` line. So any key a script can set, `DoParam` can set, with the same spelling and the same value format. That is `Load`. :cite[(`zombie/scripting/objects/Item.java:1425-1442`)]
- **A second `=` in the value silently cuts it off.** The one-string form splits the text on every `=` and keeps only the part before the second one :cite[(`Item.java:1940-1942`; `Item.Load` does the same, `:1431-1433`)]. `DoParam("Key", "a=b")` with two arguments avoids it, because it never splits.
- **A bad value throws.** `DoParam` prints the exception and throws `InvalidParameterException`. In Lua that stops your function. Check the console. :cite[(`:1936-1948`)]
- **It changes the shared script object.** Items made from it afterward should read the new value (they are built from this object; I did not trace item creation, so not verified).

## The right moment

Your edit has to land after the item exists and before anything copies or caches what you are changing, and the start-up order decides that.

On a client (single player, or a multiplayer player):

:::flow[Client start-up order]
- `ModRegistries.init()` runs each mod's `media/registries.lua`
- `ScriptManager.Load()` reads every script file; items exist from here
- `LuaManager.LoadDirBase()` runs the `shared` Lua, then the `client` Lua
- The `OnGameBoot` event fires
- Later, when you load a world, the `server` Lua runs, and then the world is created
:::

On a dedicated server the order is: scripts, then `shared`, `client` (checksum only) and `server` Lua, then `OnGameBoot`.

The citations are: `ModRegistries.init` :cite[(`zombie/GameWindow.java:208`)], `ScriptManager.instance.Load` :cite[(`:210`)], `initShared` then `LoadDirBase` :cite[(`:987-989`)], `OnGameBoot` :cite[(`:666`)], the `server` Lua loading with the world :cite[(`zombie/gameStates/GameLoadingState.java:156`)], and on a dedicated server the scripts :cite[(`zombie/network/GameServer.java:1495`)], the Lua folders :cite[(`:1517-1519`)] and `OnGameBoot`. :cite[(`:1544`)]

Two facts follow.

**1. A `shared` file can edit items directly, or wait for `OnGameBoot`.** Scripts are loaded before any Lua file runs, so `getItem` works at the top level of a `shared` file. The common choice is to do the edit inside an `OnGameBoot` handler. That makes it explicit that "the game is booted, scripts are done", and it runs after every mod's `shared` files have loaded, so another mod's shared tables exist.

**2. Do not register `OnGameBoot` from a `server` folder file.** On a client, `OnGameBoot` fires at boot, but `server` files are loaded later, when a world loads. A handler added then is added too late and never runs for that session. (On a dedicated server the order is the other way, so it does run there.) Put item edits in `shared\`.

This second point is derived from the order of the lines cited above. It is not something I ran in a game.

`OnGameBoot` also fires again when the player returns to the main menu. :cite[(`zombie/gameStates/IngameState.java:1085`, `zombie/core/Core.java:3560`)] But `LuaEventManager.Reset()` has already cleared every handler by then :cite[(`IngameState.java:978`)], so your handler only runs again if the Lua files are loaded again (a Lua reset). Because of that, make your edit safe to run twice: setting `Weight` is, and adding a tag twice is harmless because tags are a set, but anything that appends to a list would pile up.

**What goes wrong when you are too late:**

- **Tags.** The engine builds a list of all items that carry a given tag the first time anyone asks, and keeps it. A tag you add after that list was built is invisible to that lookup. :cite[(`zombie/scripting/ScriptManager.java:1513-1527`)] The per-tag list is created lazily and stored, and it is cleared in a reset. :cite[(`:1575`)]
- **Anything already created from the old value.** Items that exist in a world already hold what they copied. Whether a saved item re-reads a script value when it loads: not verified. The only data I confirmed is that an item's weight is written to a save only when it has a custom weight, not in the ordinary case. The save code writes weight only when `isCustomWeight()` is true. :cite[(`zombie/inventory/InventoryItem.java:1748-1750`)]

## Multiplayer: does the server need the same change?

Yes, both sides load their own scripts and run their own Lua, so put the edit where both sides run it.

Nothing in the start-up path above downloads item stats from the server. (I did not find a sync step; I did not search the whole network layer, so treat "nothing syncs" as not verified.)

The server also checks that the files match. When a client connects, it sends a checksum of its Lua files and script files; the server compares it with its own, and a mismatch gets the player kicked after a timeout (unless they hold a bypass role). The checksum covers the Lua files by their text, so your `DoParam` mod is "the same" when both sides have the same files. The Lua files go into the checksum :cite[(`zombie/Lua/LuaManager.java:1219`)], the script files too :cite[(`zombie/scripting/ScriptManager.java:1693`)], and the server runs the comparison when the client connects. :cite[(`zombie/network/packets/service/ChecksumPacket.java:236-258`)]

So the rule is: **put the edit where both sides run it.** That is a script block, or a `shared\` Lua file. A `client\`-only edit leaves the server on the vanilla value, and a server-only edit leaves each client showing the vanilla one.

## Tags

A tag is a label on an item that recipes and code test for, such as "has metal" or "is a hammer", and three facts matter to a mod.

**Tags are objects, and the script spelling has a namespace.** In 42.22 vanilla writes tags as `base:hasmetal`. A tag written without a namespace is read as `base`. One vanilla item reads `Tags = base:hasmetal;base:showcondition;base:smeltablesteelsmall,` :cite[(`media/scripts/generated/items/normal.txt:2440`)], and `of` defaults to `base`. :cite[(`zombie/scripting/objects/ResourceLocation.java:33-36`)]

**A script or `DoParam` can add tags but not remove them.** `Tags` adds each listed tag to the item's set. Nothing in the item loader clears it. The set itself is returned by `getTags()`; whether Lua can remove a tag by calling `remove` on that set: not verified. The loader adds with `itemTags.add` :cite[(`zombie/scripting/objects/Item.java:2353-2359`)], and `getTags` returns the set. :cite[(`:791-793`)]

**An unknown tag does nothing, quietly.** The tag is looked up in a registry; an id that is not registered comes back as `null`, and `null` goes into the item's set. There is no error. If your tag has no effect, check the spelling and namespace. The lookup is `get` in `ItemTag`, a plain map lookup in `Registry`. :cite[(`zombie/scripting/objects/ItemTag.java:484-486`, `zombie/scripting/objects/Registry.java:50-52`, `Item.java:2358`)]

**New tags belong to your mod's namespace and are registered early.** A tag is created by `ItemTag.register`, which refuses the `base` namespace. The engine runs a mod's `media/registries.lua` before it reads scripts, and looks in the version folder first. That is where registration of your own ids goes. The exact call to write there: not verified in a running game; see [Item tags from Lua](/pz/build-42/modding/items-and-scripting/item-tags-from-lua) for what `register` does and does not do. The engine runs `registries.lua` from the version folder, else the common folder :cite[(`zombie/scripting/objects/ModRegistries.java`)]; it runs before the scripts load (at `:210`) :cite[(`zombie/GameWindow.java:208`)]; and registration refuses the `base` namespace. :cite[(`zombie/scripting/objects/RegistryReset.java:22-26`)]

To ask whether an item has a tag from Lua, vanilla writes `hammer:hasTag(ItemTag.CRUDE)` :cite[(`media/lua/client/BuildingObjects/TimedActions/ISBuildAction.lua:224`)] for one item, and `getInventory():containsTag(ItemTag.SAW)` :cite[(`:82`)] to ask a container.

## A complete example: lighter metal and wood, only if the player wants it

The example is one `shared` Lua file that lowers two weights at `OnGameBoot` and logs the before and after.

Folder:

```
LightLoad\
  42\
    mod.info
    media\
      lua\
        shared\
          LightLoad.lua
```

`mod.info`:

```
name=Light Load
id=LightLoad
description=Planks and iron bars weigh less.
```

`42\media\lua\shared\LightLoad.lua`:

```lua
-- The changes we want: full item name -> the new weight.
local newWeights = {
    ["Base.Plank"]   = 1.5,
    ["Base.IronBar"] = 1.0,
}

local function lightenItems()
    for fullName, weight in pairs(newWeights) do
        -- Look the item up. It is nil if another mod removed it.
        local item = getScriptManager():getItem(fullName)
        if item == nil then
            print("[LightLoad] item not found: " .. fullName)
        else
            local before = item:getActualWeight()
            -- Two-argument form: key and value, no "=" splitting.
            item:DoParam("Weight", tostring(weight))
            print("[LightLoad] " .. fullName .. " " .. before .. " -> " .. item:getActualWeight())
        end
    end
end

-- Run once, after every script is loaded.
Events.OnGameBoot.Add(lightenItems)
```

What the parts do:

| Part | What it does |
|---|---|
| `local newWeights = { ... }` | A table of "name = value". The square brackets are needed because the key has a dot in it. |
| `pairs(newWeights)` | Walks the table, giving the name and the value. |
| `getScriptManager():getItem(fullName)` | Finds the script item, or `nil`. |
| `item:getActualWeight()` | Reads the weight as it is now, so the log shows before and after. |
| `item:DoParam("Weight", tostring(weight))` | Sets the weight. The value goes in as text, the way a script file writes it. |
| `Events.OnGameBoot.Add(lightenItems)` | Asks the game to call `lightenItems` once when it has booted. |

**See the result:** start the game, then open `console.txt` in your `Zomboid` folder and search for `[LightLoad]`. You should see lines like `Base.Plank 3 -> 1.5` and `Base.IronBar 2 -> 1` (the game may print `3.0` instead of `3`). In game, put a plank in your inventory (debug mode's item list is the quickest way) and check its weight.

The vanilla values are `Plank` with `Weight = 3.0,` :cite[(`media/scripts/generated/items/weapon.txt:9259`)] and `IronBar` with `Weight = 2.0,` :cite[(`:8562`)]. `Item.getActualWeight` is :cite[(`zombie/scripting/objects/Item.java:541`)].

**If nothing prints:** the file is in the wrong folder, `mod.info` is missing, or the mod is not enabled. If it prints `item not found`, check the spelling of the full name, including the `Base.` in front.

## Common mistakes

Four mistakes to avoid.

| Mistake | What happens | Fix |
|---|---|---|
| The file is in `server\` and uses `OnGameBoot` | On a client the handler is added after the event fired. Nothing changes. | Move it to `shared\`. |
| `DoParam("Key = a=b")` with a value that contains `=` | The value is silently cut at the second `=`. | Use the two-argument form. |
| The tag has a typo | No error. The tag just is not there. | Print `item:getTags()` to check, or copy the spelling from a vanilla script. |
| You changed the item on the client only | The two sides disagree, and the checksum check can also flag the mismatch if files differ. | Put the edit in `shared\`. |

## Where to go next

- [Changing loot](/pz/build-42/modding/changing-vanilla/changing-loot).
- [When Lua reloads](/pz/build-42/modding/lua-api/when-lua-reloads-leaving-a-game-and-resets) for what happens to your edit when Lua is reloaded.
- [Changing vanilla: start here](/pz/build-42/modding/changing-vanilla/changing-vanilla-start-here).

:::callout[How we know]{kind=proof}
Read from the 42.22 engine source and vanilla files; nothing here was run in a game. Not verified: that items made after the edit read the new value, how saved items re-read script values, that nothing in the network layer syncs item stats, whether Lua can remove a tag, the exact registration call in `registries.lua`, and the claim that a `server\` file registers `OnGameBoot` too late (derived from line order).
:::
