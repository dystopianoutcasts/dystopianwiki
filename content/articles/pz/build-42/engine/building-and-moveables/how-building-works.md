---
id: build-42-how-building-works
slug: how-building-works
title: 'How building works: from the Build button to a finished wall'
game: pz
version: build-42
section: engine
category: building-and-moveables
difficulty: intermediate
tags:
  - engine
  - building
  - carpentry
  - construction
  - entities
  - multiplayer
excerpt: >-
  Click Build, pick a recipe, place the ghost, wait for the bar. Which recipes you see, what placement checks, how long it takes, the XP, and which side (client or server) does each step.
last_updated: '2026-11-14'
related_articles:
  - built-objects-health-and-zombies
  - moveables-pick-up-place-and-scrap
  - building-recipes-by-skill
  - building-and-moveables-reference
  - modding-building-and-moveables
  - built-object-health-table
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [players](#1-opening-the-build-window) | [modders](#2-where-the-recipes-come-from) | [server owners](#9-which-side-does-what-in-multiplayer)

:::callout[The 1-minute version]{kind=key}
- Press the Build button in the left sidebar, pick a recipe, slide the ghost over a square and click. The ghost is red when any square it covers fails a check.
- You can build a recipe when you have every listed skill at its level, know the recipe if it must be learned (32 build recipes, all metalwork), and hold the materials and tools. A learned recipe that is exactly one level short is waived if you can read and the matching magazine is in a container you can reach.
- The Build window shows only the tier of a family that fits your level, such as Lvl1 below Carpentry 4. This is a hint on your screen only, and the "show all" filter turns the hiding off.
- Single player uses the recipe's own `time` (the Handy trait subtracts 50). Multiplayer ignores it and uses 200 minus 5 per Carpentry level, minus 50 for Handy, then multiplies by 20. The unit is not verified in play.
- When the bar completes, the materials are used up, XP is added and the object appears. Hammering while the bar fills makes noise that zombies can hear.
- On a server, the server does not check a build request against the recipe, the builder's skills and materials, distance or safehouse ownership, so servers should add their own server-side checks.
:::

:::facts
- **Entity scripts** 219 in `media/scripts/generated/entities/`: 194 buildable objects, 8 wall coverings, 17 with no recipe
- **Single-player time** the recipe's `time` (50, 80, 100, 150 or 200 in the scripts); Handy subtracts 50
- **Multiplayer time** (200 - 5 per Carpentry level - 50 for Handy) x 20; grave digging starts from 150; instant-action mode makes it 1
- **Hammer noise radius** `ceil(20 * hammerSoundMod)`; 15 for a saw or a recipe sound
- **XP** the recipe's `xpAward`; most wood recipes give 10 times their level
:::

Outcast, nearly everything you do to keep zombies out of your house starts here: you open the Build window, pick "Wooden Wall", slide a ghost over a square, click, and a bar fills while your character hammers. This page follows that whole path, from the button to the finished object, and says which parts are checked by the game and which parts are only a hint on your screen.

Citations use short paths: `zombie/...` is under the capture's `src/`, `media/...` is under its `game_snapshot/`. Where the page says "not verified", the capture did not let me confirm it.

## The short version

Building runs through seven steps from the Build button to a finished object, and the table says where each is decided.

| Step | What happens | Code |
|---|---|---|
| 1 | You press the Build button in the left sidebar | `media/lua/client/ISUI/ISEquippedItem.lua:785-794`, `:485-491` |
| 2 | The window lists every recipe whose entity script has a build recipe | `zombie/entity/components/build/BuildLogic.java:160-181` |
| 3 | You pick one; the game checks skill, learned recipe and materials | `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:342-380` |
| 4 | You move a ghost; every square it covers is tested | `media/lua/server/BuildingObjects/ISBuildIsoEntity.lua:177-485` |
| 5 | You click; your character walks over, equips the tools and starts the build action | `media/lua/server/BuildingObjects/ISBuildingObject.lua:180-289` |
| 6 | The bar fills; hammering makes noise | `media/lua/client/BuildingObjects/TimedActions/ISBuildAction.lua:73-125` |
| 7 | The action finishes; materials are used, XP is added, the object appears | `ISBuildIsoEntity.lua:510-602`, `:604-772` |

## 1. Opening the Build window

The Build button in the left sidebar opens a window that lists recipes, and double-clicking a recipe starts building it if you can afford it.

The button is one of the sidebar icons on the left of the screen (inventory, health, crafting, build, moveables, search). Click it and the Build window opens; click it again and it closes. :cite[(`ISEquippedItem.lua:485-491`)] Opening it calls `ISEntityUI.OpenBuildWindow(chr, nil, "*")`. :cite[(`media/lua/client/Entity/ISEntityUI.lua:580-596`)]

The window has a recipe list, a filter, a sort box, an ingredient panel and a Build control. :cite[(`media/lua/client/Entity/ISUI/BuildRecipe/ISBuildPanel.lua:103-150`)] Double-clicking a recipe starts building it if you can afford it. :cite[(`:124-129`)]

Two older things still ship but do nothing for a normal player:

- `ISEntityBuildMenu` (a right-click Build submenu) is still in the files, but no other vanilla Lua file calls it (a search of `media/lua` finds no caller). :cite[(`media/lua/client/Entity/ISUI/ISEntityBuildMenu.lua:21-55`)]
- `ISBuildMenu.buildRampsMenu` adds four test ramps and is only reached from the debug context menu. :cite[(`media/lua/client/BuildingObjects/ISUI/ISBuildMenu.lua:4-14`, `media/lua/client/DebugUIs/DebugContextMenu.lua:134`)]

## 2. Where the recipes come from

In 42.22 a buildable thing is an entity script: an `entity { }` block with a `SpriteConfig` component (the tiles) and a `CraftRecipe` component (what it costs).

Any `CraftRecipe` component is marked as a build recipe automatically: the loader adds the tag `EntityRecipe` to it :cite[(`zombie/scripting/entity/components/crafting/CraftRecipeComponentScript.java:65`)], and the Build window asks for every entity recipe with that tag. :cite[(`BuildLogic.java:160-181`)]

The vanilla scripts live in `media/scripts/generated/entities/`, and there are 219 entity blocks there. 194 are buildable objects with tiles and a build recipe (80 need Carpentry, 38 Welding, 14 Masonry, 62 no skill). Another 8 are wall coverings (paint, paper, plaster) with a recipe and no tiles.

The remaining 17 have no recipe: machines such as the toaster and coffee machine, and "closed" or alternate versions of buildable things. The next page, [Building recipes by skill](/pz/build-42/engine/building-and-moveables/building-recipes-by-skill), lists them.

A small example (the whole script is in `media/scripts/generated/entities/walls/entity_wood_walllvl2.txt`):

```
component SpriteConfig  { health = 550, skillBaseHealth = 20, face W { ... }, face N { ... } }
component CraftRecipe   { SkillRequired = Woodwork:4, xpAward = Woodwork:40, time = 200,
                          inputs { item 1 tags[base:hammer] mode:keep flags[Prop1;...],
                                   item 2 [Base.Plank], item 4 [Base.Nails] } }
```

The in-game skill names differ from the script names: `Woodwork` is shown as **Carpentry**, `MetalWelding` as **Welding**. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:199-200`, `:750`)]

## 3. What decides whether you can build it

You can build a recipe when you have the skill, know the recipe if it must be learned, and hold the materials and tools.

| Gate | What it does | Code |
|---|---|---|
| **Skill** (`SkillRequired`) | You must have every listed skill at the listed level. Otherwise the recipe is not valid for you | `CraftRecipeManager.java:348-352`, `:367-382` |
| **Learned recipe** (`NeedToBeLearn = true`) | You must know the recipe. Only 32 build recipes need this, all metalwork (see below); the 32 count is from the scripts | `CraftRecipeManager.java:355-361` |
| **A recipe at hand** | If you already know a learned recipe, are exactly one level short, can read (not too dark) and the matching magazine is in a container you can reach, the skill gate is waived | `zombie/scripting/entity/components/crafting/CraftRecipe.java:1491-1525`, `:1535-1554`, `CraftRecipeManager.java:372-377` |
| **Materials and tools** | Every `inputs` line must be satisfiable. Lines marked `mode:keep` are tools you hold; the rest are used up | `zombie/entity/components/crafting/recipe/CraftRecipeData.java:497-509` |
| **Menu tier filter** (`OnAddToMenu`) | Hides the weaker version of a recipe once you pass its tier. A hint on your screen only | `media/lua/client/Entity/ISUI/CraftRecipe/ISRecipeScrollingListBox.lua:344-348`, `media/lua/server/CraftRecipeCode/CraftRecipe_BuildMenu.lua` |

**Books.** The 32 recipes that must be learned are taught by three magazines and by one profession:

| Teaches | Recipes | Code |
|---|---|---|
| `MetalworkMag1` | Metal wall (both tiers), metal floor, metal window frames, metal wall frame, metal door frames, metal stairs | `media/scripts/generated/items/literature.txt:5822-5835` |
| `MetalworkMag2` | Metal counters, counter corners, crates, big and small lockers, shelves (both tiers) | `literature.txt:5837-5850` |
| `MetalworkMag3` | Metal pole, wire and double gates, big and small fences, small pole and wire fences | `literature.txt:5852-5865` |
| Metalworker profession | Grants these recipes at the start: both metal wall tiers, wall frame, both door frame and window frame tiers, stairs, every counter, counter corner, crate, locker and shelf tier, the pole and wire gates (large and small), both metal fence tiers and the small wire fence. Not granted: the metal floor, the big metal and wire fences, the small pole fence and the double gates | `media/scripts/generated/characters/character_professions.txt:155` |

Wood, masonry and the survival-style builds (logs, sticks, stone) need no book.

**The menu tier filter in plain words.** Many families come in three tiers with the same cost and better health: Wooden Wall Lvl1, Lvl2, Lvl3. The Build window shows only the tier that fits your level: Lvl1 below Carpentry 4, Lvl2 at 4 and 5, Lvl3 at 6 and up. :cite[(`CraftRecipe_BuildMenu.lua:11-35`)] There is a "show all" filter that turns the hiding off. :cite[(`ISRecipeScrollingListBox.lua:346`)] Nothing on the server checks the tier, only the real skill requirement.

**Material sources.** The window uses the same container list as the crafting window: your inventory, containers open in the loot window, and items on the floor. :cite[(`ISBuildPanel.lua:318`, `BuildLogic.java:237-242`)] The list turns red or gray when a line is short.

## 4. Placement and the ghost

Placement uses a ghost object on your mouse that turns red when any square it covers fails a check.

The cursor object is `ISBuildIsoEntity`, made when you pick a recipe. :cite[(`ISBuildPanel.lua:310-340`, `ISBuildIsoEntity.lua:884-957`)]

- **Rotate.** The rotate-building key cycles the facing through 1, 2, 3, 4 (west, north, east, south in the script's order), skipping faces the object does not have. :cite[(`ISBuildIsoEntity.lua:774-782`, `:784-818`)] A recipe flagged auto-rotate tries all four facings by itself when yours is invalid. :cite[(`ISBuildingObject.lua:149-164`)]
- **The ghost.** Valid squares draw white-ish, invalid ones red, and a colored floor grid shows every square the object will use. :cite[(`ISBuildIsoEntity.lua:46-118`)]
- **Walls and doors face a side.** `face N` and `face W` are wall faces; `n_open` and `w_open` are the open-door pictures. :cite[(`zombie/entity/components/spriteconfig/SpriteConfigManager.java:57-73`)]
- **Repeat builds.** After you finish one, the window makes a fresh cursor so you can place the next one at once. :cite[(`ISBuildPanel.lua:414-421`)]

### What the ghost checks

The ghost is red when any square it covers fails any of these checks. :cite[(`ISBuildIsoEntity.lua:177-485`)]

Line numbers in the Code column are in `ISBuildIsoEntity.lua` unless a file is named.

| Check | In plain words | Code |
|---|---|---|
| Materials | You do not have what the recipe needs | `:454` |
| Safehouse | On a server, you may not build in someone else's safehouse. Client side only, see the multiplayer section | `:457` |
| Vehicle | A vehicle is on the square | `:211` |
| Garage door | Never on a garage door | `:200` |
| Passing through walls | A multi-tile object may not cross a wall, window, door or hoppable fence between its own tiles | `:204-209` |
| Free square | The first layer needs a free square; higher layers may hang in mid-air. Water is allowed only for recipes that say so, such as the upper steps of stairs | `:220-236`, `buildRecipeCode.lua:190-193` |
| Previous stage | A wall that upgrades a frame needs that frame on the square, facing the same way. `WoodenWallLvl2` accepts a wall frame, a metal wall frame or a Lvl1 wall, set by `previousStage` in its script | `:245-263`, `entity_wood_walllvl2.txt` |
| Door | A door needs a door frame on that edge and no door yet | `:266-311` |
| Window | A window pane needs a window frame and no pane yet | `:314-341` |
| Solid on solid | A solid object cannot go on a solid or placement-blocking square. Stackable tops are handed to the moveables rules | `:344-350` |
| Against a wall | Shelves and similar must have a wall behind them, with no other built object in the way | `:353-385` |
| Wall rules | No wall on a square that already blocks that edge, or across the middle of a multi-tile couch. On upper floors it needs a floor under it, or a wall below it | `:389-439` |
| Recipe hook | The recipe's own `OnIsValid` Lua gets the last word | `:186-197` |

Stairs add their own rules: never at the top world level, never where there is a floor above the stairs, and no wall or solid object at the top step. :cite[(`media/lua/server/BuildRecipeCode/buildRecipeCode.lua:169-218`)] Floors must connect to another floor and may not sit on a staircase's underside. :cite[(`:344-370`)]

## 5. Clicking: walk, equip, queue

Clicking turns your placement into a queued build action.

`ISBuildingObject:tryBuild` copies the cursor so rotating it later cannot change the job, walks your character next to the target square, equips a hammer (if the recipe uses one) and the tools in the recipe's hand slots, then queues the build action. :cite[(`ISBuildingObject.lua:180-289`)] Tools flagged `Prop1` go in the right hand, `Prop2` in the left. :cite[(`ISBuildPanel.lua:324-326`)] Walls walk you to the wall edge; floors and furniture to a free neighbor square. :cite[(`ISBuildIsoEntity.lua:9-31`)]

## 6. How long it takes

There are two different timers, one for single player and one for multiplayer.

| Where | Time | Code |
|---|---|---|
| Single player | The recipe's own `time` value (50, 80, 100, 150 or 200 in the scripts); the Handy trait subtracts 50 | `ISBuildIsoEntity.lua:927`, `ISBuildAction.lua:257-271`, `ISBuildingObject.lua:189-196` |
| Multiplayer | The server ignores the recipe's `time`. It uses 200 minus 5 per Carpentry level, minus 50 for Handy, then multiplies by 20. The client takes whatever the server answers | `zombie/core/BuildAction.java:91-106`, `ISBuildAction.lua:117-123` |

On a server the grave-digging action starts from 150 instead of 200, and instant-action mode makes any build take 1 unit. :cite[(`zombie/core/BuildAction.java:93-99`)] So a 50-time table takes as long as a 200-time wall on a server. :cite[(`BuildAction.java:92`)]

At Carpentry 0 the server's base is 200, and each level saves 5 (190 at Carpentry 2, 150 at Carpentry 10). If one unit is 20 milliseconds, as the `* 20` suggests, 200 is about 4 seconds, 50 about 1 second. The unit is not verified in play.

The skill never speeds up the single-player timer: the script value is used as is. `CraftRecipe.getTime(character)` exists and would take 5 percent off per level above the requirement :cite[(`CraftRecipe.java:199-213`)], but the build path calls the plain `getTime()`. :cite[(`ISBuildIsoEntity.lua:927`)]

**Noise.** While you hammer, the game plays the sound and adds a world sound so zombies can hear it: radius `ceil(20 * hammerSoundMod)` for a hammer, 15 for a saw or a recipe sound, repeated every few seconds. :cite[(`ISBuildAction.lua:73-104`)] Your body works at "heavy work" intensity during the action. :cite[(`:106`, server `BuildAction.java:109-113`)]

## 7. Finishing: what happens in `create`

When the bar completes, `create` uses the materials, adds XP, makes the thumpable object and sends it to every client.

`ISBuildIsoEntity:create` runs when the bar completes. :cite[(`ISBuildIsoEntity.lua:510-602`)] In order:

1. It tests the placement again. :cite[(`:543`)]
2. It uses up the materials: `performCurrentRecipe` removes the inputs, calls the recipe's `OnStart` script, creates the outputs and **adds the XP**. :cite[(`zombie/entity/components/build/BuildLogic.java:244-251`, `CraftRecipeData.java:497-518`)] It checks your skill again first and writes a craft-history entry. :cite[(`CraftRecipeData.java:500`, `:511`)]
3. It remembers what was used in the object's "need:" data, so dismantling can give materials back. :cite[(`media/lua/server/BuildingObjects/ISBuildingObject.lua:357-372`)]
4. For each tile of the object it makes a thumpable, sets its flags and **health** (see [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies)), adds it to the square, adds a corner piece if two walls meet, and calls the recipe's own `OnCreate`. :cite[(`ISBuildIsoEntity.lua:604-772`, `ISBuildUtil.lua:57-100`)]
5. It sends the finished object to all clients. :cite[(`ISBuildIsoEntity.lua:771`)] The recipe's `OnCreate` runs **before** that, so anything it changes is sent too.

A stone or crude hammer wears: a stone hammer loses a point of condition by chance when the action completes. :cite[(`zombie/core/BuildAction.java:116-121`)] The single-player twin does the same. :cite[(`ISBuildAction.lua:222-226`)]

### XP

The builder gets the recipe's `xpAward` as raw XP in that skill when the build completes.

| Fact | Value | Code |
|---|---|---|
| Who gets XP | The builder, when the build completes, never when it is canceled | `CraftRecipeData.java:506-509` |
| How much | The recipe's `xpAward`, as raw XP in that skill. Most wood recipes give 10 times their level (Carpentry 4 gives 40), from the scripts | `CraftRecipe.java:1464-1489` |
| Which side adds it | Server (`GameServer.addXp`) or single player; a pure client does not | `CraftRecipe.java:1481-1485` |
| Recipes with no `xpAward` | No XP, for example sandbag walls and stone cairns (from the scripts) | |

XP boosts and the exact level thresholds are covered elsewhere and are not verified here.

## 8. Multi-tile and multi-floor builds

A `face` block is a picture of the whole object, and every tile in it is checked and made on its own.

Each `row = a b c` line is one row of tiles going east. Each extra `row` line goes one square south. Each extra `layer { }` block goes one floor up.

The words `true` and `false` mean "empty square that blocks placement" and "empty square that does not". :cite[(`zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:391-455`)] The wooden staircase is three rows in one layer; vanilla uses the same grammar for tables, beds and lamp pillars.

- **Every tile must be valid.** The ghost walks every square of every layer :cite[(`ISBuildIsoEntity.lua:467-483`)], and the game creates missing squares and the squares below them as needed. :cite[(`:120-157`)]
- **Every tile is its own object.** The create loop calls `setInfo` once per tile, so a three-tile staircase is three thumpables, each with the full health from the formula. :cite[(`:588-600`)]
- **Floors above ground.** A wall on an upper floor needs a floor on its own square or a wall below it; a pole checks the squares to its north-west and west. :cite[(`:413-438`)]
- **Sprites belong to one entity.** One tile name may appear in only one entity script. A second entity that reuses it fails to load and logs an error, but only that entity fails; the others still load because the failure is caught. :cite[(`zombie/entity/components/spriteconfig/SpriteConfigManager.java:134-136`, `:156-159`)] The script loader also flags duplicates. :cite[(`SpriteConfigScript.java:336-343`)] A tile that is registered by an entity is flagged for every world object that uses it, so never register a tile that other things need. :cite[(`SpriteConfigManager.java:141-147`)]
- **Moveable furniture props.** An entity with `isProp = true` is placed as a loose moveable with a fixed weight instead of as a thumpable. :cite[(`ISBuildIsoEntity.lua:606-611`)]

## 9. Which side does what in multiplayer

In multiplayer the client handles the menu, ghost and animation, and the server accepts the request, calculates the duration and builds.

| Step | Client (your game) | Server | Code |
|---|---|---|---|
| Menu, recipe list, ghost, red or white | Yes | No | |
| Walking, equipping, the animation, hammering sound | Yes | Replays the noise rules for zombies | |
| Asking to build | Sends a build request to the server | Receives it | `ISBuildAction.lua:152` |
| Accepting the request | Waits for the answer | Accepts it and builds when the timer ends. It does not check the request against the recipe, skills, materials, distance or safehouse ownership first (see the warning below) | `ISBuildAction.lua:110-124` |
| Duration | Takes the server's number | Calculates it | `BuildAction.java:91-106` |
| The build itself | Nothing | On finish, runs `Actions.build`, which calls `create`: uses the materials, adds XP, makes the object and sends it | `BuildAction.java:116-125`, `media/lua/shared/ActionManager.lua:26-32` |
| A refused build | Stops the bar if the server rejects the request | Rejects a bad request | `ISBuildAction.lua:113-115` |

When a build finishes, the code also marks the zone as "has construction". :cite[(`media/lua/shared/ActionManager.lua:29-31`, `ISBuildUtil.lua:603-608`)] With the **Construction Prevents Loot Respawn** sandbox option on (the default), items do not respawn in buildings that players have built. :cite[(`zombie/LootRespawn.java:110`)]

> **Warning for server owners.** The server does not check a build request against the recipe, the builder's skills and materials, distance, or safehouse ownership before it builds; vanilla's validity check is never called on the server. The check has no callers :cite[(`zombie/core/BuildAction.java:79-83`)], and the request handling for a build is in the same file. :cite[(`:139-156`)] Servers should add their own server-side checks before accepting a build. The only safehouse test I found on the server is in the older build classes :cite[(`media/lua/server/BuildingObjects/ISBuildUtil.lua:15`)]; the entity build path and the moveables path test only on the client. :cite[(`ISBuildIsoEntity.lua:457`, `media/lua/shared/Moveables/ISMoveablesAction.lua:51`)]

## Where to go next

These pages cover what you built, the recipes, moveables, the numbers and modding.

- [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies): what you just built is worth, and how zombies take it apart.
- [Building recipes by skill](/pz/build-42/engine/building-and-moveables/building-recipes-by-skill): every recipe, level by level.
- [Moveables: pick up, place and scrap](/pz/build-42/engine/building-and-moveables/moveables-pick-up-place-and-scrap).
- [Building and moveables: the numbers](/pz/build-42/engine/building-and-moveables/building-and-moveables-reference).
- [Modding building and moveables](/pz/build-42/engine/building-and-moveables/modding-building-and-moveables).
- [Barricades and locks in vanilla](/pz/build-42/modding/world-and-tiles/barricades-and-locks-in-vanilla), [The workstation entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system) and [craftRecipe reference](/pz/build-42/modding/crafting/craftrecipe-reference).

:::callout[How we know]{kind=proof}
The sources are the `file:line` citations on this page, all in capture B42_3d39148846: `zombie/entity/components/build/BuildLogic.java`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java`, `CraftRecipeData.java`, `zombie/scripting/entity/components/crafting/CraftRecipe.java`, `zombie/core/BuildAction.java`, and the Lua files `ISBuildIsoEntity.lua`, `ISBuildingObject.lua`, `ISBuildAction.lua`, `ISBuildUtil.lua`, `buildRecipeCode.lua`, `CraftRecipe_BuildMenu.lua`. Script counts come from `media/scripts/generated/entities/`.

Not confirmed: how long one build "unit" lasts in real time (the arithmetic above assumes 20 milliseconds), exact XP thresholds and boosts, and the per-tile properties (container type, light, material) of the sprites, because the capture holds scripts and Lua, not the tile definitions. I also did not trace what the later steps of a build catch when a request is not what a normal game sends.
:::
