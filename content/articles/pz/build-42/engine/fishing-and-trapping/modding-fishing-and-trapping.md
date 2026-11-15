---
id: build-42-modding-fishing-and-trapping
slug: modding-fishing-and-trapping
title: 'Modding fishing and trapping'
game: pz
version: build-42
section: engine
category: fishing-and-trapping
difficulty: advanced
tags:
  - engine
  - fishing
  - trapping
  - modding
  - multiplayer
excerpt: >-
  How to add a fish, a bait and a trap animal through plain Lua tables, with complete mod files, events, the multiplayer rules and what only a Java patch can change.
last_updated: '2026-11-14'
related_articles:
  - how-fishing-works
  - fish-and-where-to-find-them
  - fishing-nets-and-other-methods
  - how-trapping-works
  - fishing-and-trapping-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders new to PZ](#the-mod-file-by-file) | [modders who know Lua](#what-is-a-table-and-what-is-java) | [server owners](#multiplayer-who-must-do-what)

:::callout[The 1-minute version]{kind=key}
- Both the fishing system and the trapping system are driven by plain Lua tables that a mod can add to, so a new fish, bait or trap animal needs no Java: you add rows and the vanilla code does the rest.
- Fish and bait tables go in a `shared/` Lua file, the trap table goes in a `server/` Lua file, and the mod must be installed on the server and on every client.
- A new fish needs `initFishSizeData()` after its setters, and a new bait must join its group before the fish is made.
- The school constants, chum power, the explosion damage formula and its caps are in Java, and a mod can only call into them. Spear fishing has no catch logic to extend.
- The example Golden Carp Demo mod was written from reading the code and was not run in a game for this page.
:::

:::facts
- **Example mod** Golden Carp Demo: one fish, one bait (Glow Grub), one trap animal (Chipmunk)
- **Level 0 weight limit** 1.4 kg, so a 1.0 kg fish can be caught by a new angler
- **Radius and power caps** 15 and 100, in Java
- **Mod folders** `common/` (may be empty) and `42/`
:::

You have read how fish bite and how traps roll. Now you want your own fish, your own bait, or an animal that walks into a cage.

The good news: both systems are driven by **plain Lua tables** that a mod can add to. No Java, no new code paths. You add rows to a table and the vanilla code does the rest.

By the end of this page you will have a small mod that adds **one fish** (the Golden Carp), **one bait** (the Glow Grub) and **one trap animal** (the Chipmunk), and you will see each of them in a running game.

Citations are named from `game_snapshot/media/lua/` for Lua, `src/` for Java and `game_snapshot/media/` for scripts. All 42.22 capture. "Not verified" means read in code, not run.

## What is a table, and what is Java

Most of the fishing and trapping numbers are Lua tables a mod can reach, and the school, chum and explosion rules are Java.

Before you write anything, here is the map of what you can and cannot reach.

| You want to change | Where it lives | Reachable from a mod? |
|--------------------|----------------|-----------------------|
| Which fish exist, their size, weight, bait weights | `Fishing.fishes` (`shared/Fishing/fishing_properties.lua:216`) | **Yes, Lua table** |
| Which items count as bait, and whether they are used up | `Fishing.lure.*` groups (`fishing_properties.lua:6-63`) | **Yes** |
| Hooks, lines, rods, broken-rod stub, net catches, trash | `Fishing.hook`, `.line`, `.rods`, `.breakRodReplacement`, `.fishNet`, `.fishNetWithBait`, `.trashItems` (`fishing_properties.lua:666-707`) | **Yes** |
| Level limits, size odds, weather, temperature, time factors | `Fishing.Utils.*` (`shared/Fishing/FishingUtils.lua:161-272`) | **Yes** (tables and functions) |
| River and no-fish rectangles | `Fishing.RiverZones`, `Fishing.NoFishZones` (`shared/Fishing/FishingZones.lua:4-29`) | **Yes** (see the caution below) |
| Trap animals, baits, zones, chances | `TrapAnimals` (`server/Traps/TrapDefinition.lua:50-337`) | **Yes** |
| Trap types | `Traps` (`TrapDefinition.lua:1-47`) | **Yes, but each needs new tile sprites** |
| Bomb, noise and smoke numbers | Item script fields (`weapon.txt`) | **Yes, in scripts** |
| How many fish a school holds, the 0.995 hash, chum power, noise radius | `FishSchoolManager.java` | **No: Java** |
| Explosion damage formula, radius cap 15, power cap 100, sensor check rate | `IsoTrap.java` | **No: Java** |
| Spear fishing catches | Not found anywhere | **No: nothing exists to extend** |

The engine class `FishSchoolManager` is exposed to Lua :cite[(`zombie/Lua/LuaManager.java:2232`)]. That lets a mod *call* `addChum`, `addSoundNoise`, `catchFish` and read `getFishAbundance` and `getTrashAbundance` :cite[(`FishSchoolManager.java:351-455`)]. It does not let a mod change the constants inside them.

## The mod, file by file

The mod is one folder with a `mod.info`, two script files, two Lua files and three translation files.

You build one mod folder. Where it goes while you develop (the rule for the layout is in [Project skeleton](/pz/build-42/modding/cookbook/project-skeleton)):

```
Zomboid/Workshop/GoldenCarpDemo/
  Contents/
    mods/
      GoldenCarpDemo/
        common/                       <- mandatory, may be empty
        42/
          mod.info
          media/
            scripts/
              goldencarp_items.txt
              goldencarp_models.txt
            lua/
              shared/
                GoldenCarpFishing.lua
                Translate/
                  EN/
                    language.json
                    ItemName.json
                    IG_UI.json
              server/
                GoldenCarpTraps.lua
```

Why `42/`? The game loads `common/` first, then the folder for your game version, which wins on the same file name.

Why `common/` even though it is empty? Without it the game does not see the mod. Create the empty folder by hand.

Why two different Lua folders? **Fish tables go in `shared/`**, because both the server and every player's game need them. **The trap table goes in `server/`**, next to the vanilla file it extends.

The client loads `server/` files as well: vanilla's `CTrapGlobalObject` (a client file) reads `TrapAnimals`, and `ISTrapMenu` (a menu, in `server/`) runs on clients. The files that must not run on clients start with `if isClient() then return end` :cite[(`server/Traps/STrapSystem.lua:1`, `STrapGlobalObject.lua:1`)],. `TrapDefinition.lua` does not start that way :cite[(`client/Traps/CTrapGlobalObject.lua:23`; `server/Traps/ISUI/ISTrapMenu.lua:18-80`)].

### 1. `42/mod.info`

```
name=Golden Carp Demo
id=GoldenCarpDemo
description=Adds one fish, one fishing bait and one trap animal.
author=you
```

Four lines, all lowercase keys, no trailing comma. `id` must be unique. The full list of keys is in the project skeleton page.

### 2. `42/media/scripts/goldencarp_items.txt`

This defines the two new items. We borrow the look of vanilla items so you do not need any art for the first test.

```
module Base
{
    item GoldenCarp
    {
        DisplayCategory = Food,
        ItemType = base:food,
        Weight = 0.4,
        Icon = Fish_Bluegill,
        EatType = 2handforced,
        BadCold = true,
        BadInMicrowave = true,
        DangerousUncooked = true,
        GoodHot = true,
        IsCookable = true,
        OnCreate = Fishing.onCreateFish,
        RemoveUnhappinessWhenCooked = true,
        MinutesToCook = 20,
        MinutesToBurn = 60,
        DaysFresh = 4,
        DaysTotallyRotten = 8,
        HungerChange = -15.0,
        UnhappyChange = 20,
        Calories = 159.0,
        Carbohydrates = 1.0,
        Lipids = 1.0,
        Proteins = 35.0,
        StaticModel = Bluegill_Ground,
        WorldStaticModel = Bluegill_Ground,
        CookingSound = FryingFood,
        Tags = base:fishmeat;base:uncutfish,
    }

    item GlowGrub
    {
        DisplayCategory = Food,
        ItemType = base:food,
        Weight = 0.01,
        Icon = Worm,
        EvolvedRecipe = AddBaitToChum:1,
        HungerChange = -1.0,
        UnhappyChange = 20,
        Calories = 3.0,
        Carbohydrates = 0.0,
        Lipids = 0.1,
        Proteins = 0.5,
        FishingLure = true,
        StaticModel = Worm_Ground,
        WorldStaticModel = Worm_Ground,
        IsCookable = true,
        MinutesToCook = 5,
        MinutesToBurn = 25,
        CookingSound = FryingFood,
        Tags = base:cantcompost;base:nocookingxp,
        DaysFresh = 4,
        DaysTotallyRotten = 8,
    }
}
```

What matters here: the rest is copied from vanilla :cite[(`scripts/generated/items/food.txt:7320-7350` for the Bluegill and `:8632-8655` for the Worm)].

- `OnCreate = Fishing.onCreateFish` runs when a fish is made by the debug spawner or found as loot. It looks the fish up in `Fishing.fishes` and gives it a size :cite[(`shared/Fishing/fishing_properties.lua:709-760`)]. If it cannot find the fish it prints an error in the log.
- `FishingLure = true` is what makes the right-click menu offer the item as a lure :cite[(`zombie/iso/ISWorldObjectContextMenuLogic.java:3208-3217`)].
- `Icon = Fish_Bluegill` and the two `Bluegill_Ground` lines reuse the vanilla bluegill's picture and ground model. That is why the Golden Carp will look like a bluegill. Swap them for your own art later.

### 3. `42/media/scripts/goldencarp_models.txt`

When you land a fish, your character holds it up, and the game asks for three models named after the item.

The names are the item name, then `_Hand`, then `_Little`, `_Medium` or `_Big` :cite[(`shared/Fishing/Fish.lua:226`)]. Without them the hand model is missing. We reuse the bluegill's mesh and texture :cite[(`scripts/generated/models_fish.txt:639-658`)].

```
module Base
{
    model GoldenCarp_Hand_Little
    {
        mesh = Fish_Bluegill_Sunfish_Hand,
        texture = WorldItems/Fish_Bluegill,
        scale = 0.25,
    }

    model GoldenCarp_Hand_Medium
    {
        mesh = Fish_Bluegill_Sunfish_Hand,
        texture = WorldItems/Fish_Bluegill,
        scale = 0.5,
    }

    model GoldenCarp_Hand_Big
    {
        mesh = Fish_Bluegill_Sunfish_Hand,
        texture = WorldItems/Fish_Bluegill,
        scale = 0.75,
    }
}
```

### 4. `42/media/lua/shared/GoldenCarpFishing.lua`

This is the heart of the fish and bait. Read it once through; the explanation follows.

```lua
-- Make sure the vanilla fishing tables exist before we add to them.
require "Fishing/fishing_properties"

-- Guard: if this file is ever loaded twice, do not add the fish twice.
if not Fishing.GoldenCarpDemo then
    Fishing.GoldenCarpDemo = true

    local GLOW = "Base.GlowGrub"

    -- 1. The new bait. It joins the "Insect" group. amountOfFoodHunger = -1
    --    means the whole item is used up when you attach it.
    Fishing.lure.Insect[GLOW] = { chanceModifier = 1.0, amountOfFoodHunger = -1 }

    -- 2. The new fish.
    local carp = Fishing.FishConfig:new("Base.GoldenCarp")
    carp:setLocation(true, true)   -- allowed in river and lake
    carp:setMaxLength(35)          -- cm; the minimum length defaults to 10
    carp:setTrophyLength(60)
    carp:setMaxWeight(1.0)         -- kg. Level 0 may catch fish up to 1.4 kg.
    carp:setTrophyWeight(4)
    carp:setWeightFactor(2)        -- hunger = weight / 2
    carp:initFishSizeData()        -- must come after the lines above

    -- 3. How much the carp likes each bait group (same idea as vanilla).
    carp:addLures(Fishing.lure.Insect, 0.3)
    carp:addLures(Fishing.lure.Minnows, 0.5)
    carp:addLures(Fishing.lure.Leeches, 0.5)
    carp:addLures(Fishing.lure.Worms, 0.5)
    carp:addLures(Fishing.lure.Flesh, 0.1)
    carp:addLures(Fishing.lure.Plant, 0.3)
    carp.lure["Base.JigLure"] = 0.5
    carp.lure["Base.MinnowLure"] = 0.5

    -- 4. The carp loves the Glow Grub: a weight far above anything else.
    carp.lure[GLOW] = 5.0

    -- 5. Every other fish treats the Glow Grub as poor bait.
    for _, f in ipairs(Fishing.fishes) do
        f.lure[GLOW] = 0.1
    end

    -- 6. Finally, add the carp to the list the game draws from.
    table.insert(Fishing.fishes, carp)
end
```

Line by line:

- `Fishing.lure.Insect[GLOW] = {...}` registers the bait. The game builds one big lookup, `Fishing.lure.All`, from all groups when a game starts, and again when a server starts :cite[(`fishing_properties.lua:65-76`)]. Our file runs before either event, so the bait is in it. Attaching a lure reads `Fishing.lure.All[...]` and crashes if the item is missing :cite[(`shared/TimedActions/Fishing/TimedActions/AIAttachLureAction.lua:70`)].
- `Fishing.FishConfig:new(...)` and the `set...` calls are the same ones the vanilla file uses :cite[(`fishing_properties.lua:89-137`)]. Each setter returns nothing; they just store a number.
- **`initFishSizeData()` must come last among the setters.** It builds the table of lengths and weights from the numbers above it :cite[(`fishing_properties.lua:146-180`)]. If you skip it, the first catch fails with an error on a nil table.
- Max weight 1.0 kg is deliberate. A fish only enters the pool if its top weight is no more than your level's limit :cite[(`shared/Fishing/FishingUtils.lua:161-172`; `Fish.lua:97`)]. Level 0's limit is 1.4 kg, so a 1.0 kg fish can be caught by a brand-new angler. See the [level table](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them) for the others.
- `addLures(group, coeff)` copies every item **currently in** the group, multiplied by `coeff`. That is why the new bait goes into the group *before* the fish is made (step 1 before step 3). It also means older fish do not know about our bait, which is why step 5 adds it to them by hand.
- The weights are shares of a pool, not percents :cite[(`Fish.lua:96-125`)]. At level 0 with a Glow Grub, the pool is the seven level-0 vanilla fish at 0.1 each plus the carp at 5.0, so the carp is about 88 percent of fish catches (5.0 / 5.7, our arithmetic).
- Setting a bait weight of 0 puts the fish in the pool but gives it no share. Leaving the bait out of a fish's table keeps it out of the pool entirely.

### 5. `42/media/lua/server/GoldenCarpTraps.lua`

This adds an animal to the trap table, modeled on the vanilla squirrel, a catch with no live version, so it collects as a plain dead item.

```lua
-- The vanilla file defines the TrapAnimals table. Load it first.
require "Traps/TrapDefinition"

-- Guard against adding the animal twice.
local function hasAnimal(typeName)
    for _, a in ipairs(TrapAnimals) do
        if a.type == typeName then return true end
    end
    return false
end

if not hasAnimal("chipmunk") then
    local chipmunk = {}
    chipmunk.type = "chipmunk"
    chipmunk.item = "Base.DeadSquirrel"   -- the item you get (reused, no new art)
    chipmunk.minHour = 0                  -- min = max means "active all day"
    chipmunk.maxHour = 0
    chipmunk.minSize = 5                  -- random hunger value, in hundredths
    chipmunk.maxSize = 25

    -- Zones the animal lives in, with the chance in percent.
    chipmunk.zone = {}
    local woods = { "Forest", "DeepForest", "BirchForest", "BirchMixForest",
                    "FarmForest", "FarmMixForest", "PRForest", "PHForest",
                    "PHMixForest", "OrganicForest", "Vegitation" }
    for _, z in ipairs(woods) do
        chipmunk.zone[z] = 40
    end

    -- Which traps work, with the base chance in percent.
    chipmunk.traps = {}
    chipmunk.traps["Base.TrapCage"] = 40
    chipmunk.traps["Base.TrapBox"] = 40

    -- Which baits work, with the chance in percent.
    chipmunk.baits = {}
    chipmunk.baits["Base.Peanuts"] = 60
    chipmunk.baits["Base.Cereal"] = 50

    table.insert(TrapAnimals, chipmunk)
end
```

Every field is read by the trap code:

- `type` is stored in the trap's data and looked up again by name whenever the trap loads :cite[(`server/Traps/STrapGlobalObject.lua:494-499`; the client does the same, `client/Traps/CTrapGlobalObject.lua:21-27`)]. Use a name nothing else uses.
- `item` is what you get when you collect it dead. Because there is no `aliveAnimals` list, the code takes the "no animal object, make a food item" path :cite[(`STrapGlobalObject.lua:269-287`, `:328-366`)].
- `minSize` and `maxSize` become the item's hunger value, `-size/100`, and its XP is `size / 3`, at least 3 :cite[(`STrapGlobalObject.lua:333-341`)].
- `zone`, `traps` and `baits` are the three lookups of the hourly roll :cite[(`STrapGlobalObject.lua:368-388`)]. With the cage (40) plus peanuts (60) the first roll is 100 percent, so only the zone chance (40) limits it: about 40 percent per hour in a forest, at level 0, before the other animals are counted.
- The trap records the zone types at the square when you place it, and only the types that some animal lists :cite[(`shared/Traps/TrapSystem.lua:9-27`)]. Because our file loads at game start, traps you place later include the zones we added.

### 6. Translations

The game shows item names from translation files, which in 42.22 are JSON, one file per kind, with no language code in the file name.

The language folder carries a small `language.json` :cite[(`shared/Translate/EN/language.json`)]. The cookbook's `language.txt` form is the older one.

Whether a mod folder needs its own `language.json` was not verified. We include it to be safe. See [Translations](/pz/build-42/modding/cookbook/translations) for the rules.

`42/media/lua/shared/Translate/EN/language.json`:

```json
{
    "version": "1",
    "language_name": "English"
}
```

`42/media/lua/shared/Translate/EN/ItemName.json` (key is the item's full type):

```json
{
    "Base.GoldenCarp": "Golden Carp",
    "Base.GlowGrub": "Glow Grub"
}
```

`42/media/lua/shared/Translate/EN/IG_UI.json` (the fishing window's tooltip for a caught fish reads `IGUI_<full type>_Description` :cite[(`client/PZAPI/ui/organisms/FishWindow.lua:17`)], and the vanilla keys have that shape :cite[(`shared/Translate/EN/IG_UI.json`)]):

```json
{
    "IGUI_Base.GoldenCarp_Description": "The Golden Carp loves a Glow Grub. Nothing else comes close."
}
```

## Turn it on and load a save

You put the mod under the Workshop folder, start in debug mode, enable it and load a world with Very Abundant fishing.

1. **Install.** Put the `GoldenCarpDemo` folder under `Zomboid/Workshop/`. This is the same place your other development mods live.
2. **Start the game in debug mode.** Add `-debug` to the game's launch options. Debug mode adds the Lua console and the trap menu entry used below.
3. **Enable the mod.** On the main menu, open **Mods**, check **Golden Carp Demo**, and go back.
4. **Load a world.** Start a **new** sandbox game, or load an existing save and make sure the mod is checked for it. In the sandbox options, set **Fishing Abundance** to **Very Abundant** for the test :cite[(`api/sandbox_options.jsonl`, `FishAbundance`)].
5. **On a dedicated server,** add the mod to the server's ini file (`Zomboid/Server/<servername>.ini`): put `GoldenCarpDemo` in the `Mods=` line, and if the mod comes from the Workshop, its item id in the `WorkshopItems=` line (both are server options :cite[(`zombie/network/ServerOptions.java:73`, `:134`)]). Separate several ids with semicolons, for example `Mods=SomeMod;GoldenCarpDemo`: the server splits both lines on `;` :cite[(`zombie/network/GameServer.java:669`, `:695`)]. Every player needs the mod too. The exact ini folder was not verified.
6. **If the mod does not show up,** check the folder names. The mod root must contain `common/` and `42/`, and `mod.info` must be inside `42/`. The log is `Zomboid/console.txt`.

I could not run the game for this page, so the exact menu wording is from memory of the standard flow and is not verified.

## See each result

You check the fish with a console command and a real catch, the bait by attaching it, and the trap animal with the debug entry or the real roll.

### The fish (a quick check, then a real catch)

A console command adds a Golden Carp to your pack, and a real catch needs a rod, a hook and a Glow Grub.

**Quick check.** Open the Lua console and run:

```lua
getPlayer():getInventory():AddItem("Base.GoldenCarp")
```

A fish named like "Small Golden Carp" appears in your pack, with the bluegill icon (the name logic is size word plus the display name :cite[(`fishing_properties.lua:709-760`)]). If you see an error about "no fish definition found" in the log, the Lua file did not load: see the checklist at the end.

**A real catch.** Get a rod and a hook, and add a Glow Grub to your pack with the console line `getPlayer():getInventory():AddItem("Base.GlowGrub")`. Right-click the rod, choose the lure menu, and attach the Glow Grub (the lure menu is `ISInventoryPaneContextMenu.addLure` :cite[(`client/ISUI/ISInventoryPaneContextMenu.lua:1437-1440`)]). Stand at the water, look for splashes (a school, see the [fish article](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them)) and cast. Because of the 5.0 weight, most fish you land will be Golden Carp, named like "Medium Golden Carp - 22cm", with a hand model. An admin or debug user can toggle the **Fishing Cheat** in the admin power panel to shorten the waits :cite[(`client/ISUI/AdminPanel/ISAdminPowerUI.lua:122-127`; `shared/Fishing/Bobber.lua:43-45`, `:136-138`, `:231`)]. The cheat only speeds the bites; you still need a school nearby for a fish rather than trash.

After your first Golden Carp, open the fishing window (right-click water, "Fishing"). The carp's row is now filled in with its icon :cite[(`client/PZAPI/ui/organisms/FishWindow.lua:40-60`)]. The tooltip text from `IG_UI.json` shows only when you hover the row **and your Fishing level is 6 or higher** :cite[(`FishWindow.lua:40-43`)].

### The bait

The Glow Grub appears in the lure menu only because of `FishingLure = true` and the entry in `Fishing.lure.Insect`.

You already used it above. Try a different lure on the same water: the carp becomes rare.

### The trap animal

In debug mode you place a cage trap, use the Add Animal entry, and check the trap to get a dead squirrel item.

1. In debug mode, craft or spawn a cage trap (`getPlayer():getInventory():AddItem("Base.TrapCage")`) and place it in a forest zone (right-click the trap in your pack, "Place Trap").
2. Right-click the placed trap. Because you are in debug mode, an **Add Animal** entry appears (**single player only**: the entry has no server permission check, so do not use it on a server (see [How trapping works](/pz/build-42/engine/fishing-and-trapping/how-trapping-works))). It lists every animal whose table accepts that trap, and "chipmunk" is on it :cite[(`server/Traps/ISUI/ISTrapMenu.lua:79-87`)].
3. Click it. The trap switches to its closed sprite.
4. Right-click the trap and choose **Check Trap**. You get a dead squirrel item (we reused the vanilla item), sized by our 5 to 25 range.

To see the **real** roll instead of the debug entry, put Peanuts in the trap, then walk at least 80 tiles away so the trap square is no longer loaded (the loaded area is 104 to 152 tiles across), and wait a few game hours (see [How trapping works](/pz/build-42/engine/fishing-and-trapping/how-trapping-works), the hourly roll). The trap's closed sprite tells you something is inside.

## Multiplayer: who must do what

The mod must be on the server and on every client, and the fish and trap tables must load on both sides.

| Piece | Where the file must be | Why | Code |
|-------|------------------------|-----|------|
| Fish table, bait table (shared file) | The server and **every client** | The server picks the fish and builds the item; clients run the fight and read the fish list | `shared/Fishing/Bobber.lua:127-133`; `FishingRod.lua:113-114`; `FishWindow.lua:238-259` |
| Lure attach and use-up | Server and clients | The action's `complete` reads `Fishing.lure.All`; the server then tells the client | `AIAttachLureAction.lua:61-83`; `client/ServerCommands.lua:9-56` |
| Items and models (scripts) | Server and clients | Normal script loading | |
| Trap animal table | Server and clients | The server rolls and stores the type; the client looks the type up in the same table to show the menu | `STrapGlobalObject.lua:494-499`; `CTrapGlobalObject.lua:21-27` |
| Translations | Clients | Display only | |

So the mod must be in the server's mod list and in every player's list, as for any gameplay mod. See [What runs on the server in Build 42 multiplayer](/pz/build-42/modding/multiplayer/what-runs-on-the-server-in-build-42-multiplayer).

If you want to change **who decides**: the tension and line wear run on the client :cite[(`FishingRod.lua:113-114`)], the bite and the species on the server :cite[(`Bobber.lua:127-160`)]. A mod that changes the weather factors must change them for the server's bite roll. Do it in `shared/` so both sides agree.

## Events and hooks

The fishing and trap code raises a few events, but there is no event for a landed fish or a trapped animal.

| Name | When | Which side | What to use it for |
|------|------|-----------|--------------------|
| `Events.OnFishingActionMPUpdate` | The server and client exchange fishing state. Fires on the client when the server sends a new fish or a bobber event, and on the server when the client reports it started reeling | Both | Watch the fish that bites. Data: `fish`, `fishItem`, `UpdateFish`, `CatchFishStarted`, `Reject` (`zombie/core/FishingAction.java:220-239`; `zombie/network/packets/FishingActionPacket.java:45`, `:79`) |
| `Events.OnThrowableExplode` | An explosive, flame, smoke or noise trap goes off | The machine that triggers it: the server or single player, and also a client for instant ones | React to explosions. Args: trap object, square (`IsoTrap.java:424`; `AddExplosiveTrapPacket.java:104-113`) |
| `Events.EveryDays` | Midnight | Server | Vanilla reseeds fish schools here (`FishingUtils.lua:276-279`) and ages trap bait (`STrapSystem.lua:132`) |
| `Events.EveryHours` | Each game hour | Server | Vanilla runs the trap roll here (`STrapSystem.lua:133`) |
| `Events.OnGameStart`, `Events.OnServerStarted` | Game or server start | Client, server | Vanilla rebuilds `Fishing.lure.All` here (`fishing_properties.lua:75-76`) |
| `Events.OnObjectAdded` | A trap is placed | Both | `TrapBO:create` triggers it so the server registers the new trap (`TrapBO.lua:49`) |

There is **no event for "a fish was landed"** or "an animal was trapped". To react to a landed fish, wrap `ISPickupFishAction:complete` (server) in a file that loads after vanilla, call the original, then do your work. To react to a trapped animal, wrap `STrapGlobalObject:setAnimal` :cite[(`STrapGlobalObject.lua:427-443`)] on the server in the same way. Both are plain Lua functions, so this is a supported pattern, but it is not an official hook.

A short example, logging each fish a client sees bite. Put it in `42/media/lua/client/GoldenCarpWatch.lua`:

```lua
-- Runs on the client. Prints a line when a fish takes the bait.
local function onFishingUpdate(data)
    if data.UpdateFish and data.fishItem then
        print("[GoldenCarp] a fish bit: " .. tostring(data.fishItem:getName()))
    end
end

Events.OnFishingActionMPUpdate.Add(onFishingUpdate)
```

The `print` output goes to the game log, `Zomboid/console.txt`, not to the screen.

The name is the fish item's name at the moment of the bite, for example "Medium Golden Carp - 22cm" :cite[(`Fish.lua:229-233`)]. `Events.OnFishingActionMPUpdate` is the vanilla event name from `api/events.jsonl`.

## More things you can change with tables

Many tuning changes are one line in a Lua table, but weather mods and new trap types have gotchas.

| Goal | Edit | Caution |
|------|------|---------|
| Make paperclip hooks as good as a real hook | `Fishing.hook["Base.Paperclip"] = 1.2` | Read by `FishingUtils.lua:247-256` |
| Make twine last longer | `Fishing.line["Base.Twine"] = 0.1 / 15.0` | Wear per hit (`fishing_properties.lua:673-677`) |
| Let level 0 catch bigger fish | `Fishing.Utils.skillSizeLimit[0] = 2.0` | Changes the whole pool (`FishingUtils.lua:161-172`) |
| Change size odds | `Fishing.Utils.fishSizeChancesBySkillLevel[0] = { 70, 25, 5 }` | Three numbers: Small, Medium, Big (`FishingUtils.lua:175-186`) |
| Put a new item in nets | `table.insert(Fishing.fishNet, "Base.MyItem")` | Items are picked evenly (`fishing_properties.lua:693-700`) |
| Add trash | `table.insert(Fishing.trashItems, "Base.MyJunk")` | `fishing_properties.lua:666-672` |
| Make rabbits likelier in towns | In a server file, find the animal in `TrapAnimals` and set `a.zone["TownZone"] = 20` | Same idea as the chipmunk file |
| Mark a river | `table.insert(Fishing.RiverZones, {x1=..., y1=..., x2=..., y2=...})` | Only matters if a fish is river-only |
| Mark a no-fish area | `table.insert(Fishing.NoFishZones, {...})` | The Lua test is live (`FishingZones.lua:31-38`), but the school code copies the list once on first use (`FishSchoolManager.java:238-256`), so add rectangles at load time, never later |
| Change a bomb | Edit the item's script fields (`ExplosionPower`, `SensorRange`, `NoiseRange` and so on) | Radius is capped at 15 and power at 100 in Java (`IsoTrap.java:69-71`, `:773`) |

**A gotcha that bites weather mods.** The nibble wait calculates temperature, weather and time on its own :cite[(`shared/Fishing/Bobber.lua:83-104`)], while the bite roll calls the helpers in `FishingUtils` :cite[(`Bobber.lua:223-231`)]. They agree today only because the numbers match. To change how weather affects fishing, change both: override the helper functions **and** `Bobber:getNibbleTime`.

**A gotcha for new trap types.** A trap is recognized by its sprite name: the map-object code looks up each sprite in the `Traps` table and builds the trap object from it :cite[(`server/Map/MapObjects/MOTrap.lua:17-30`, `:131-135`)]. Two trap types cannot share a sprite. A new type therefore needs its own tile sprites in a tile pack; you cannot make one from existing art without taking another trap's sprite.

## What needs Java

The school and explosion rules are fixed inside the game's code, and only a loose Java class ahead of the jar can change them.

These are fixed inside the game's code. A Java patch would be a loose class placed ahead of the jar on the classpath (tier L3: possible, high cost, must be rebuilt for each game patch).

- **How fish are placed.** The hash threshold, point radius, fish count formula, the 13 by 13 window, chum power and timings, the noise radius divider and silence time, the 40 by 40 zone and the 5-day reset :cite[(`FishSchoolManager.java:145-151`, `:268-443`)]. A mod can only call into them.
- **What a school is saved as.** The seeds and the chum list only :cite[(`FishSchoolManager.java:517-543`)].
- **Spear fishing.** No catch logic exists to extend. You could write a Lua rod-like system, but it would be your own.
- **Explosion rules.** The damage formula, the caps, the 1-second sensor check, the timer unit, and who is protected :cite[(`IsoTrap.java:69-74`, `:264-300`, `:815-868`)].
- **A new moodle or status for a trapped animal.** Not part of these systems.

## When it does not work

Most failures are a Lua file that did not load, a skipped `initFishSizeData()`, or a missing script flag.

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| The Golden Carp never appears in the log or pack | The Lua file did not load | Check `42/media/lua/shared/GoldenCarpFishing.lua` spelling and folder; read `Zomboid/console.txt` |
| Log says "no fish definition found for item type" | `Fishing.fishes` has no entry for the item | The shared file did not load on that machine; install the mod there |
| An error on the first catch about an `fishesSizeData` or arithmetic on nil | `initFishSizeData()` was skipped or placed before a setter | Call it after all the `set...` lines |
| Right-click does not offer the Glow Grub | The script is missing `FishingLure = true` | Add it |
| Attaching the Glow Grub errors | The item is not in a `Fishing.lure` group | Add the `Fishing.lure.Insect[...]` line before the game starts |
| Chipmunk missing from the debug menu | The trap file did not load, or the trap type is not in `chipmunk.traps` | Check `server/GoldenCarpTraps.lua` and the trap name |
| Traps catch nothing | You are standing nearby: the roll only runs when the trap's square is not loaded | Walk away |
| An old trap shows empty after you remove the mod | The trap stored the type `chipmunk`, which no table has now | The trap reads as empty; no crash expected, not verified |

## Where to go next

- [How fishing works](/pz/build-42/engine/fishing-and-trapping/how-fishing-works) and [Fish and where to find them](/pz/build-42/engine/fishing-and-trapping/fish-and-where-to-find-them) for what the tables mean.
- [How trapping works](/pz/build-42/engine/fishing-and-trapping/how-trapping-works)
- [Fishing and trapping reference](/pz/build-42/engine/fishing-and-trapping/fishing-and-trapping-reference)
- [New food](/pz/build-42/modding/cookbook/new-food) for a fuller treatment of item scripts, and [Project skeleton](/pz/build-42/modding/cookbook/project-skeleton) for mod structure.
- [The animal definitions table](/pz/build-42/modding/farming-and-animals/modding-the-animaldefinitions-global-table) for the *living* animal system (a trapped rabbit becomes one of those).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 capture. Not verified: the exact main-menu steps for enabling a mod, and whether a mod needs its own `language.json`. The Golden Carp and Chipmunk files were written from reading the code and were not run in a game for this page. Also not verified is whether a client without the mod can join a server that has it; assume not.
:::
