---
id: build-42-modding-building-and-moveables
slug: modding-building-and-moveables
title: 'Modding building and moveables'
game: pz
version: build-42
section: engine
category: building-and-moveables
difficulty: intermediate
tags:
  - engine
  - modding
  - building
  - moveables
  - entities
  - multiplayer
  - lua
excerpt: >-
  Add a buildable object with an entity script and a little Lua, make a tile moveable, change health or thump behavior, hook events, and see what needs Java. One small working mod.
last_updated: '2026-11-14'
related_articles:
  - how-building-works
  - built-objects-health-and-zombies
  - moveables-pick-up-place-and-scrap
  - building-recipes-by-skill
  - building-and-moveables-reference
  - built-object-health-table
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders](#a-small-working-mod-low-table-built) | [server owners and mod authors](#which-side-must-act-in-multiplayer)

:::callout[The 1-minute version]{kind=key}
- A mod can add a buildable object with an `entity` script (`SpriteConfig` and `CraftRecipe` components) and a little Lua, and the Build window lists it.
- A mod can set health on its own recipe, change a live object's health with setters on the server, or override the vanilla Lua file to change the formula for all builds.
- A mod cannot change how much damage one zombie does per thump or how fast zombies thump: that is Java and animation data. Changing what a weapon does to a wall is an edit to the weapon's `DoorDamage` in its item script.
- Whether a tile can be lifted lives in the tile definition, not in a script, and the tile definitions are not in the capture.
- Anything a client asks the server to do must be checked on the server. Vanilla does not check a build request against the recipe, skills, materials, distance or safehouse, and it does not check who changes the lock data of a built door.
- The walk-through mod was written from the files named below and was not run in the game.
:::

:::facts
- **Example recipe** 2 planks, 2 nails, Carpentry 1
- **Example health** 300 + 40 x your Carpentry level without the `OnCreate` (340 at Carpentry 1), 1000 with it
- **Default `thumpDmg`** 8, and 5 for doors
- **Vanilla file to override for every build** `ISBuildIsoEntity.lua`, 1,155 lines
:::

You have read how building works, how built objects take damage and how moveables are lifted and scrapped. This page is for the next step: adding your own buildable object, changing how strong things are, and hooking what happens when something is built or destroyed. It starts with what you can touch, then the one-small-mod walk-through, then the rest.

If "client", "server" and "event" are new words, read [The events system](/pz/build-42/modding/lua-api/the-events-system) and [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns) first. The folder layout is in [The B42 mod folder model](/pz/build-42/modding/lua-api/the-b42-mod-folder-model). Scripts are covered in [craftRecipe reference](/pz/build-42/modding/crafting/craftrecipe-reference) and [The workstation entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system).

Citations use short paths: `zombie/...` is under the capture's `src/`, `media/...` under its `game_snapshot/`, `api/...` under its `api/`.

## What a mod can reach

A mod can add recipes, run Lua when something is built, set health and add moveable tiles, but it cannot change thump damage or thump speed.

| You want to | Can a mod do it? | How | Code |
|---|---|---|---|
| Add a new thing to the Build window | Yes | An `entity` script with `SpriteConfig` and `CraftRecipe` components | `zombie/entity/components/build/BuildLogic.java:160-181` |
| Make the object react when it is built | Yes | `OnCreate` and `OnIsValid` Lua functions named in `SpriteConfig` | `media/lua/server/BuildingObjects/ISBuildIsoEntity.lua:186-197`, `:749-753` |
| Set health on one recipe | Yes | `health`, `skillBaseHealth`, `bonusHealth` in `SpriteConfig` | `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:241-295` |
| Change health or thump behavior of any built object, live | Yes | `setHealth`, `setMaxHealth`, `setThumpDmg`, `setIsThumpable`, `setBreakSound` on the `IsoThumpable` (class `zombie.iso.objects.IsoThumpable`) | `api/lua_exposed.jsonl` |
| Change the formula for all builds | Yes, by overriding a vanilla Lua file | The formula is Lua | `ISBuildIsoEntity.lua:666-677` |
| Add a tile that can be picked up or scrapped | Yes, with a tile definition | Tile properties, read by the moveable Lua | `ISMoveableSpriteProps.lua:71-209` |
| Add a new scrap material, tool group or repair rule | Yes | `ISMoveableDefinitions:getInstance().addScrapDefinition` and friends | `ISMoveableDefinitions.lua:47-298` |
| Change how much damage one zombie does per thump | **No** | Java | `zombie/iso/objects/IsoThumpable.java:1049-1063` |
| Change how fast zombies thump | **No** | Animation data and Java | `zombie/ai/states/ThumpState.java:99-117` |
| Change what a weapon does to a wall | Edit the weapon's `DoorDamage` | Item script | |

## A small working mod: Low Table Built

This mod adds one buildable low table to the Build window, with a health you choose in Lua and a right-click entry that shows any built object's health.

It uses a tile from your own tilesheet, costs 2 planks and 2 nails, and needs Carpentry 1. You will see the new recipe in the Build window, place it, and read its numbers.

### 1. Make the folders

Find your Zomboid user folder (on Windows `C:\Users\<your name>\Zomboid`). Inside it make this tree:

```
Zomboid\
  mods\
    LowTableBuilt\
      common\                              <- an EMPTY folder; the layout needs it
      42\
        mod.info
        media\
          scripts\
            LowTableBuilt_xuiSkin.txt
            LowTableBuilt.txt
          lua\
            server\
              LowTableBuilt_OnCreate.lua
            client\
              LowTableBuilt_Check.lua
```

Why `42`? The game loads the folder closest to its version.

Why `server` for one Lua file and `client` for the other? Building finishes on the server in multiplayer (and in single player the server folder also runs), so the code that touches the new object belongs there. The right-click entry is a menu, so it belongs on the player's screen.

### 2. mod.info

Save as `42\mod.info`. No spaces around `=`.

```
name=Low Table Built
id=LowTableBuilt
description=Adds a low table to the Build window and a right-click health check for built objects.
```

### 3. The menu name: `LowTableBuilt_xuiSkin.txt`

Vanilla gives every entity a "style" with a name and an icon. Copy that pattern; the vanilla crate shows it. :cite[(`media/scripts/entities/furniture/entity_carpentry_crate_lvl1_xuiSkin.txt`)]

```
module Base
{
    xuiSkin default
    {
        entity ES_LowTableBuilt
        {
            LuaWindowClass = ISEntityWindow,
            DisplayName = Low Table (Built),
            Icon = Build_CrateWood,
        }
    }
}
```

| Line | Means |
|---|---|
| `module Base` | The group of scripts this belongs to. Every vanilla entity uses `Base` |
| `xuiSkin default` | The look of the UI. Many files add to the same `default` skin; yours adds one style to it |
| `entity ES_LowTableBuilt` | A style name you invent. The entity below refers to it |
| `DisplayName`, `Icon` | The name and picture. `Build_CrateWood` is a vanilla icon, reused here |

### 4. The object: `LowTableBuilt.txt`

```
module Base
{
    entity LowTableBuilt
    {
        component UiConfig
        {
            xuiSkin = default,
            entityStyle = ES_LowTableBuilt,
            uiEnabled = false,
        }
        component SpriteConfig
        {
            health = 300,
            skillBaseHealth = 40,
            OnCreate = LowTableBuilt.OnCreate,
            face SINGLE
            {
                layer
                {
                    row = LowTableBuilt_tiles_0,
                }
            }
        }
        component CraftRecipe
        {
            timedAction = BuildWoodenStructureSmall,
            time = 50,
            category = Furniture,
            SkillRequired = Woodwork:1,
            xpAward = Woodwork:10,
            Tooltip = Tooltip_craft_tableDesc,
            inputs
            {
                item 1 tags[base:hammer] mode:keep flags[Prop1;MayDegradeVeryLight],
                item 2 [Base.Plank],
                item 2 [Base.Nails],
            }
        }
    }
}
```

What each part does is read from vanilla scripts. :cite[(`entities/furniture/entity_carpentry_table_lvl1.txt`, `entities/outdoors/entity_sandbagwall.txt`)]

| Part | Meaning | Code |
|---|---|---|
| `entity LowTableBuilt` | The name. It also becomes the recipe's name in the Build list, unless a translation exists | `zombie/core/Translator.java:699-709` |
| `UiConfig` | Points at the style above. `uiEnabled = false` is what vanilla furniture uses | |
| `health = 300`, `skillBaseHealth = 40` | Health = 300 + 40 x your Carpentry level (see the health page) | |
| `OnCreate = LowTableBuilt.OnCreate` | The Lua function the game calls when the table is built | |
| `face SINGLE` ... `row = LowTableBuilt_tiles_0` | One picture, one tile. `SINGLE` means it has no rotation, the way the vanilla stone mill does it | `entities/agricultural/workstations/entity_stone_mill.txt` |
| `timedAction`, `time` | The build animation and sound; the time is used in single player (a server uses its own formula) | |
| `category = Furniture` | The tab it appears in | |
| `SkillRequired = Woodwork:1` | Carpentry 1 to build. `Woodwork` is the script name of Carpentry | |
| `xpAward = Woodwork:10` | 10 XP when built | |
| `inputs` | A tool you keep (`mode:keep`, held in the right hand because of `Prop1`) and what is used up | |

**The tile.** `LowTableBuilt_tiles_0` is a placeholder. Replace it with a tile from your own tilesheet (how to add one is in [The tile system](/pz/build-42/modding/world-and-tiles/tile-system)). The example must use a tile that **no other entity uses**.

A tile name can belong to only one entity, and a duplicate makes that entity fail to load with a "Sprite ... is duplicate" error in the log file. :cite[(`zombie/entity/components/spriteconfig/SpriteConfigManager.java:134-136`)] The failure is caught, so other entities still load. :cite[(`:156-159`)] Do not borrow a vanilla furniture tile: registering a tile flags it for every world object that uses it, which would change how every such object in the world is treated. :cite[(`SpriteConfigManager.java:141-147`)]

### 5. The Lua that runs when it is built: `lua\server\LowTableBuilt_OnCreate.lua`

```lua
-- Low Table Built, server side.
-- A global table to hold our function. "or {}" keeps it if the file is loaded twice.
LowTableBuilt = LowTableBuilt or {}

-- The game calls this once the table is built, before it is sent to the players.
-- params.thumpable = the new table object
-- params.character = the player who built it
-- params.facing = the face it was built with
function LowTableBuilt.OnCreate(params)
    local table = params.thumpable
    table:setMaxHealth(1000)      -- change the maximum
    table:setHealth(1000)         -- and start full
    -- no return value: the game then sends the table to every player
end
```

Why `server`? In multiplayer, `create` runs on the server and calls `OnCreate` there. :cite[(`ISBuildIsoEntity.lua:749-753`)] In single player the same Lua runs in your own game.

The function runs **before** the object is transmitted :cite[(`:755-771`)], so the new values go out with it. Return nothing, as here.

If you return a table instead, the new thumpable is **not** sent to players unless the table sets `replaceObject` and `object` (then that object is sent); `objectAlreadyTransmitted = true` means you sent everything yourself. :cite[(`:756-771`)]

### 6. The check: `lua\client\LowTableBuilt_Check.lua`

```lua
-- Low Table Built, client side. Adds "Check built health" to the right-click menu.
local function onFillMenu(playerNum, context, worldobjects, test)
    if test then return end                           -- the game is only asking whether a menu exists
    for _, obj in ipairs(worldobjects) do             -- look at everything under the click
        if instanceof(obj, "IsoThumpable") then       -- is it a built object?
            local player = getSpecificPlayer(playerNum)
            context:addOption("Check built health", obj, function(o)
                player:Say("Health " .. o:getHealth() .. " of " .. o:getMaxHealth()
                    .. ". Zombies for full damage: " .. o:getThumpDmg())
            end)
            break                                     -- one entry is enough
        end
    end
end
Events.OnFillWorldObjectContextMenu.Add(onFillMenu)
```

Symbols: `..` joins text; `:` calls a method of an object; `--` starts a comment; `ipairs` walks a list. `getHealth`, `getMaxHealth` and `getThumpDmg` are exposed on `IsoThumpable`. :cite[(`api/lua_exposed.jsonl`)]

### 7. Turn it on and try it

1. On a **dedicated server**, put the `LowTableBuilt` folder in the server's own `Zomboid\mods` folder and add its id to `Mods=` in the server's settings file (for a Workshop mod also add its Workshop id to `WorkshopItems=`). Separate several ids with `;`. :cite[(`zombie/network/ServerOptions.java:73`, `:134`)] Every player joins with the same mod installed and enabled. In single player skip this step.
2. Start Project Zomboid. On the main menu open **Mods**, find **Low Table Built** and turn on its checkbox (checked means on). If it is not listed, the folder is in the wrong place (see the table below).
3. Start a new game with the mod on, or pick an existing save and open its mod list before pressing Play. Use a throwaway save.
4. Give yourself Carpentry 1 or more, a hammer, 2 planks and 2 nails. The Carpenter profession, or a few levels from a carpentry action, will do.
5. Open the **Build** window with the Build button in the left sidebar (see [How building works](/pz/build-42/engine/building-and-moveables/how-building-works)). Look in the **Furniture** tab, or type `LowTable` in the search. You should see **LowTableBuilt**.
6. Select it and move the ghost over a free floor square. It turns red where it cannot go. Click to build it.
7. Wait for the bar. The table appears. Right-click it and choose **Check built health**. Your character should say "Health 1000 of 1000. Zombies for full damage: 8".
8. Compare with the plain formula: without your `OnCreate` the table would have 300 + 40 x your Carpentry level, for example 340 at Carpentry 1.

If you want a nicer name than `LowTableBuilt`, add a recipe translation: see [Translating your mod](/pz/build-42/modding/translation/translating-your-mod). The recipe name is looked up in `Recipes.json` under the entity name. :cite[(`zombie/core/Translator.java:699-710`)] The vanilla example is the entry `"MetalWallLvl1": "Metal Wall (Basic)"`. :cite[(`media/lua/shared/Translate/EN/Recipes.json:1205`)]

### If it does not work

| You see | Likely cause | Fix | Code |
|---|---|---|---|
| Mod not in the list | Folder in the wrong place, or `mod.info` not inside `42` | Check the tree; there must be an empty `common` beside `42` | |
| Recipe missing from the Build window | The entity failed to load. The log has "Invalid SpriteConfig script" or "Sprite ... does not exist" or "is duplicate" | Open `console.txt` and search for `SpriteConfig`; fix the tile name | `SpriteConfigManager.java:118-136` |
| Recipe missing, no error | Your skill is below `SkillRequired`, or the "show all" filter is off and a tier hides it | Raise Carpentry or turn on show all | |
| The ghost is always red | The tile is not placeable there (something on the square, no floor) | Try an empty indoor floor square | |
| "Health 340 ..." not 1000 | `OnCreate` did not run: wrong name, or file in the wrong folder | The name in the script must match the Lua exactly, including capitals | |
| Red error in the log | A typo in the Lua | Read the line number in the message | |

## Moveables: making a tile movable

Whether a tile can be lifted lives in the tile definition, not in a script.

The tile definition files and the tile editor are covered in [The tile system](/pz/build-42/modding/world-and-tiles/tile-system). Their contents are not in the capture, so the exact file format is outside this page. What the Lua reads from each tile is in the table. :cite[(`media/lua/shared/Moveables/ISMoveableSpriteProps.lua:71-209`)]

| Property | Needed? | What it does | Code |
|---|---|---|---|
| `IsMoveAble` | Yes | Makes the tile a moveable | |
| `CustomName` (and optional `GroupName`) | Yes | The name shown; `GroupName CustomName` if both | |
| `PickUpWeight` | Recommended | Raw weight; the object weighs a tenth. Missing means 5 in the Lua rules and 1 in the item | `ISMoveableSpriteProps.lua:148`, `zombie/inventory/types/Moveable.java:132-136` |
| `MoveType` | Recommended | `Object` (default), `WallObject`, `WindowObject`, `Window`, `FloorTile`, `FloorRug`, `Vegitation`, `WallOverlay` | |
| `PickUpTool`, `PlaceTool` | Optional | One of the tool groups: Hammer, Crowbar, Electrician, Cutter, Shovel, Wrench, Metal, Screwdriver, or `None` | |
| `PickUpLevel` | Optional | Minimum level in the tool's skill | |
| `CanBreak` | Optional | Lifting with a tool may break it | |
| `Material`, `Material2`, `Material3` | Optional | Scrap, repair and health material names (Wood, Steel, Brick, Door, Fabric and so on) | |
| `CanScrap`, `ScrapSize` | Optional | Scrappable with a Small, Medium or Large yield | |
| `Facing` | For wall objects | N, S, E or W | |
| `ForceSingleItem` | For multi-tile | One item for the whole object | |
| `CustomItem` | Optional | Use a named item instead of the generic moveable item | |
| `IsTable`, `IsTableTop`, `IsStackable`, `Surface` | Optional | Table stacking | |

Other properties are listed in [the numbers page](/pz/build-42/engine/building-and-moveables/building-and-moveables-reference).

**An item block.** Vanilla gives some tiles a named item in `media/scripts/generated/items/moveable.txt`:

```
item Mov_FancyLowTable
{
    DisplayCategory = Furniture,
    ItemType = base:moveable,
    Icon = default,
    Weight = 0.5,
    WorldObjectSprite = furniture_tables_low_01_3,
}
```

The Lua asks for an item called `Moveables.<tile name>`, or `Moveables.Moveable` for multi-tile objects. :cite[(`ISMoveableSpriteProps.lua:215-226`)] Where the game makes those per-tile items is outside the capture's scripts, so whether you need your own block for a new tile is **not verified**; test by lifting your tile.

**Your own scrap or repair rule.** The definition tables are plain Lua and public. To make a new material scrappable, add a definition after the vanilla ones load; the vanilla loader runs on `OnGameBoot`. :cite[(`ISMoveableDefinitions.lua:302-693`, `:693`)]

```lua
-- Run after the vanilla definitions have loaded. Client and server both need it.
local function addMyScrap()
    local defs = ISMoveableDefinitions:getInstance()
    -- material, tools, second tools, skill, base time, sound, is a wav, base chance
    defs.addScrapDefinition("MyAlloy", {"Base.BlowTorch"}, {"Tag.WeldingMask"}, Perks.MetalWelding, 1000, "BlowTorch", true, 0)
    -- material, item, tries, chance per try, static
    defs.addScrapItem("MyAlloy", "Base.SteelChunk", 2, 70, true)
end
Events.OnGameBoot.Add(addMyScrap)
```

This sketch follows the call shapes in the definitions file. :cite[(`ISMoveableDefinitions.lua:128-193`, `:388-431`)] I did not run it, and the order in which two `OnGameBoot` handlers run is **not verified**, so test that your definition is still there after the game starts. It must run on the client **and** the server (put it in `shared`), because both read the definitions.

## Changing health or thump behavior

Your own recipes are changed in their entity script, and everything else needs an override, a setter call or a sandbox option.

| Goal | Way | Notes | Code |
|---|---|---|---|
| One recipe stronger | Edit your entity's `health`, `skillBaseHealth`, `bonusHealth` | Only for your own recipes. For a vanilla one see the next row | |
| One vanilla recipe stronger | Override the vanilla script | `SpriteConfigScript.copyFrom` throws "Unfinished Todo", so I do not know if a second `entity` block merges. Not verified. See [Changing recipes and crafting](/pz/build-42/modding/changing-vanilla/changing-recipes-and-crafting) for `craftRecipe` | `SpriteConfigScript.java:203-205` |
| Every build stronger | Override `media/lua/server/BuildingObjects/ISBuildIsoEntity.lua` with a copy that changes `local totalHealth = baseHealth + bonusHealth + skillBonus` | The file is 1,155 lines; a game update leaves your copy behind. See [Patching vanilla Lua](/pz/build-42/modding/changing-vanilla/patching-vanilla-lua) | `ISBuildIsoEntity.lua:675` |
| Zombies need more of a crowd | `thumpable:setThumpDmg(16)` in an `OnCreate` | Default is 8, doors 5. Per-object, and not synced to clients (no sync in `IsoThumpable.setThumpDmg`); damage is calculated on the server anyway | `ISBuildIsoEntity.lua:634-636`, `IsoThumpable.java:316-318` |
| Make one object immune to upright zombies | `thumpable:setIsThumpable(false)` | `getThumpableFor` then refuses it; crawlers can still break hoppable and breakable ones, and `Damage` also ignores player weapons while the flag is false | `IsoThumpable.java:1129-1149`, `:1585-1593` |
| Stop zombies damaging builds server-wide | Sandbox **Damage Construction** off | | `IsoThumpable.java:1016` |
| Change a live object | Call the setters on the server | `setHealth` syncs to clients; `setMaxHealth` does not | `IsoThumpable.java:293-310` |
| Change what comes back when it breaks | Replace the listener | `Events.OnDestroyIsoThumpable.Remove(ISBuildingObject.onDestroy)` then add your own; keep the container dump and stair handling | `ISBuildingObject.lua:39-71`, `:743` |
| Different dismantle result | Override `ISMoveableSpriteProps.lua` functions | `scrapObjectInternal` and `ISThumpableSpriteProps:scrapObjectViaCursor` | `ISMoveableSpriteProps.lua:3691-3809`, `:4320-4366` |

## Events you can hook

Building and breaking fire a handful of events that a mod can hook.

| Event | Fires when | Side | Notes | Code |
|---|---|---|---|---|
| `OnDestroyIsoThumpable(thumpable, nil)` | A built object is destroyed (zombie, weapon or `destroy()`) | Where the destruction runs (server in multiplayer) | | `IsoThumpable.java:1213`, `:1616` |
| `OnWeaponHitThumpable(owner, weapon, object)` | A weapon hits a built object, barricade, window, door or compost | Server in multiplayer | No vanilla listener | `IsoThumpable.java:1183` |
| `OnProcessAction("build", player, args)` | A build action's timer ends on the server | Server | `args` has `x`, `y`, `z`, `north`, `spriteName`, `item` | `BuildAction.java:116-125` |
| `OnObjectAdded(object)` | An object was added to the map by a packet | Where the packet is handled | | `AddItemToMapPacket.java:101` |
| `OnObjectAboutToBeRemoved(object)` | An object is about to leave a square | Where it happens | Fired by the moveables code too | `ISMoveableSpriteProps.lua:1449`, `:1520` |
| `OnTileObjectAdded(square, spriteName)` | A plain tile object is added by a packet | Where handled | | `AddObjectToMapPacket.java:69` |
| `OnDoTileBuilding2/3` | Every frame while a cursor is dragged | Client | Drives the ghost | `IsoCell.java:2619` |
| `OnIsoThumpableLoad`, `OnIsoThumpableSave` | Never | | Registered but no trigger found in the code | |

For a hook with no event, wrap the Lua class. For example, to log every finished build on the server, wrap `ISBuildIsoEntity.create` in a `server` file and call the original first.

## Which side must act in multiplayer

In multiplayer the server creates objects and applies damage, while the client only shows things.

| Job | Side | Why | Code |
|---|---|---|---|
| Showing the recipe, ghost and cursor | Client | Display only | |
| Creating the object, using materials, adding XP | Server | `create` runs from the server's build action | `ActionManager.lua:26-32` |
| `OnCreate` and `OnIsValid` | Server (and the client for the ghost) | `OnIsValid` also runs on every ghost update, so keep it fast and free of side effects | `ISBuildIsoEntity.lua:186-197` |
| Health, `thumpDmg`, damage | Server | Zombie hits are applied on the server | `zombie/network/fields/hit/Thumpable.java:60-85` |
| Reading health for a message | Client | Health is synced when the server changes it | `IsoThumpable.java:293-300`, `:1585-1593` |
| Moveable lift, place, scrap, repair | Server (`complete()`) | | `ISMoveablesAction.lua:236-255` |
| Scrap, repair and break tables | Both | Both read the definitions | |

**Asking the server to do something.** A client cannot change a built object. It must send a command and the server must decide:

```lua
-- client: ask the server to heal the object under the click
sendClientCommand(getSpecificPlayer(playerNum), "LowTableBuilt", "heal",
    { x = obj:getX(), y = obj:getY(), z = obj:getZ(), index = obj:getObjectIndex() })
```

```lua
-- server (media/lua/server): answer it
local function onClientCommand(module, command, player, args)
    if module ~= "LowTableBuilt" or command ~= "heal" then return end
    -- WHO may do this? Decide here. This line allows only admins.
    if player:getAccessLevel() ~= "admin" then return end   -- confirm the exact text on your build
    local sq = getCell():getGridSquare(args.x, args.y, args.z)
    local obj = sq and sq:getObjects():get(args.index)
    if obj and instanceof(obj, "IsoThumpable") then
        obj:setHealth(obj:getMaxHealth())   -- setHealth syncs to clients
    end
end
Events.OnClientCommand.Add(onClientCommand)
```

This is a sketch of the pattern in [Multiplayer command patterns](/pz/build-42/modding/lua-api/multiplayer-command-patterns). I did not run it. A command handler is code a modified client can call with any numbers, so it must check who is asking and how far away they are, as the admin test does.

> **Warning for server owners and mod authors.** Anything a client asks the server to do must be checked on the server. Vanilla does not check a build request against the recipe, skills, materials, distance or safehouse, and it does not check who changes the lock data of a built door (see [How building works](/pz/build-42/engine/building-and-moveables/how-building-works) and [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies)). In anything you add, check ownership, distance and safehouse rules on the server, and do not assume the client did.

## What needs Java

Some jobs have no Lua route and need a Java change.

| You want | Why Java | Code |
|---|---|---|
| Change the damage a thump does, or the 1.5-square crowd count | Inside `IsoThumpable.Thump` and `IsoMovingObject.getSurroundingThumpers` | `IsoThumpable.java:1049-1063`, `IsoMovingObject.java:2363-2370` |
| Change how fast zombies thump | Animation timing and `ThumpState` | `ThumpState.java:99-117` |
| Make vehicles damage built objects | No such path in the Java I found; a native physics change would be needed | |
| Add a new tile property the Lua reads | The property list is in `IsoPropertyType` and in the tile loader | `zombie/core/properties/IsoPropertyType.java` |
| Make `skillBaseHealth` default 20 after a script reload | `SpriteConfigScript.PreReload` sets it to 0 | `SpriteConfigScript.java:183` |

The way to ship a Java change is a loose class ahead of the jar on the classpath; that is high cost and breaks on every game update. See [What needs Java and what is impossible](/pz/build-42/modding/changing-vanilla/what-needs-java-and-what-is-impossible).

## Where to go next

These pages cover how building works, built objects, moveables, the numbers and related modding guides.

- [How building works](/pz/build-42/engine/building-and-moveables/how-building-works) and [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies).
- [Moveables](/pz/build-42/engine/building-and-moveables/moveables-pick-up-place-and-scrap) and [the numbers](/pz/build-42/engine/building-and-moveables/building-and-moveables-reference).
- [New workstation (cookbook)](/pz/build-42/modding/cookbook/new-workstation): a placeable station with a recipe list.
- [Timed actions](/pz/build-42/modding/lua-api/timed-actions) and [ModData](/pz/build-42/modding/lua-api/moddata).

:::callout[How we know]{kind=proof}
The sources are code and scripts: `zombie/entity/components/build/BuildLogic.java`, `zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java`, `zombie/entity/components/spriteconfig/SpriteConfigManager.java`, `ISBuildIsoEntity.lua`, `ISBuildingObject.lua`, `ISMoveableSpriteProps.lua`, `ISMoveableDefinitions.lua`, `api/events.jsonl` and `api/lua_exposed.jsonl`. The mod code was written from those files and the vanilla scripts named above; it was not run in the game.

Not confirmed: that your own tile works as a single square, because tile data is not in the capture, and whether a second `entity` block can change a vanilla entity's `SpriteConfig`. Also not confirmed: the run order of two `OnGameBoot` handlers for the scrap sketch, whether per-tile moveable items need your own item block, and whether a mod's `Recipes.json` shows up in the Build list in 42.22. :cite[(`Translator.java:699-710`)] The exact `OnClientCommand` signature in 42.22 and the exact text `getAccessLevel()` returns are not confirmed either; check the [events page](/pz/build-42/modding/lua-api/the-events-system) and test on your server.
:::
