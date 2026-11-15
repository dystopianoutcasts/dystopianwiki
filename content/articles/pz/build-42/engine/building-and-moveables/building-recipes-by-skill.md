---
id: build-42-building-recipes-by-skill
slug: building-recipes-by-skill
title: 'Building recipes by skill: what each level unlocks'
game: pz
version: build-42
section: engine
category: building-and-moveables
difficulty: beginner
tags:
  - engine
  - building
  - carpentry
  - welding
  - masonry
  - recipes
excerpt: >-
  Every build recipe in 42.22 by skill and level: Carpentry 1 to 7, Welding 2 to
  10, Masonry 1 to 5, plus what needs no skill. Materials, tools, XP and which
  recipes must be learned from a magazine.
last_updated: '2026-11-14'
related_articles:
  - how-building-works
  - built-objects-health-and-zombies
  - moveables-pick-up-place-and-scrap
  - building-and-moveables-reference
  - modding-building-and-moveables
  - built-object-health-table
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [Carpentry](#carpentry-script-name-woodwork) | [Welding](#welding-script-name-metalwelding) | [Masonry](#masonry) | [no-skill builds](#recipes-that-need-no-skill)

:::callout[The 1-minute version]{kind=key}
- Carpentry builds with a hammer, planks and nails. Nothing in the scripts needs Carpentry 8, 9 or 10: those levels only add health to what you build and speed to building on a server.
- Welding builds with a blowtorch, welding rods and sheet metal, bars or pipes. Most of it needs a magazine first.
- Masonry builds with a masonry trowel, mortar or concrete and bricks or stone blocks.
- Metalwork recipes marked "Learn" must be learned from a magazine, or you start as a metalworker. The metal doors, the second metal fence tier and the metal barricades need only the skill.
- The Build window hides the lower tier of a family once you are past it. This is a menu filter only; the "show all" filter reveals everything.
- Nothing here was played out in the game: it is read straight from the entity scripts.
:::

:::facts
- **Buildable objects** 194 with a build recipe
- **By skill** 80 Carpentry, 38 Welding, 14 Masonry, 62 no skill
- **Wall coverings** 8 (paint, paper, plaster), listed separately
- **No recipe** 17 entities
- **Must be learned** 32 recipes, all metalwork
:::

Outcast, this is the shopping list. For each build skill it says what you can build at each level, what it costs, which tools you must hold and how much XP you earn. For how the Build window turns these into walls, read [How building works](/pz/build-42/engine/building-and-moveables/how-building-works); for how strong the results are, read [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies).

Everything below is read straight from the entity scripts in `media/scripts/generated/entities/` of the capture (paths in the Code column are relative to that folder, and the line range is the recipe's `CraftRecipe` block up to the end of the entity).

## How to read the tables

Each table gives a level, the recipe, its XP, whether it must be learned, the tools you hold, the materials used and where the script is.

- **Level** is the skill level you must have (`SkillRequired`). The in-game names are Carpentry (script `Woodwork`), Welding (script `MetalWelding`) and Masonry.
- **XP** is raw XP added to that skill when the build completes (`xpAward`). Boosts are not included.
- **Learn** means the recipe has `NeedToBeLearn = true`. You must have read the magazine that teaches it (or start as a metalworker) before it shows up. See "Books" below.
- **Tools you hold** are inputs marked `mode:keep`: they are not used up (they may wear down). `#hammer` means "any item with the tag `base:hammer`", and the other `#` entries are tags in the same way.
- **Materials used** are the other inputs. `4x Plank` is four planks. Slash means "any one of these". For drainable items such as the blowtorch and welding rods, the number is **uses**, not items: `4x BlowTorch` is four units of the torch's fuel. This follows how the input script handles partial items; it is not verified in play. :cite[(`zombie/scripting/entity/components/crafting/InputScript.java:174-183`)]
- Several tiers of one thing (`Lvl1`, `Lvl2`, `Lvl3`) usually cost the same; the higher tier just needs a higher level and gives more health.

There are 194 buildable objects with a build recipe: 80 need Carpentry, 38 Welding, 14 Masonry and 62 need no skill. Eight wall coverings (paint, paper, plaster) also have recipes and are listed separately, and 17 entities have no recipe at all.

## What the Build window shows you

The window hides the lower tier of a family once you are past it, so you do not scroll past recipes you no longer want. :cite[(`media/lua/server/CraftRecipeCode/CraftRecipe_BuildMenu.lua`)]

This is a menu filter only; the "show all" filter reveals everything. The line numbers in the Code column below are lines in that menu file.

| Family | Shown when | Code |
|---|---|---|
| Wooden wall and wooden window frame | Lvl1 below Carpentry 4, Lvl2 at 4-5, Lvl3 at 6 or more | `:11-35` |
| Wooden door frame | Lvl1 below 4, Lvl2 at 4-5, Lvl3 at 6 or more | `:240-263` |
| Wooden floor | Lvl1 below 2, Lvl2 at 2-3, Lvl3 at 4 or more | `:288-311` |
| Wooden door | Lvl1 below 5, Lvl2 at 5-6, Lvl3 at 7 or more | `:312-335` |
| Wooden fence | Lvl1 below 5, Lvl2 at 5-6, Lvl3 at 7 or more | `:264-287` |
| Wooden table and small table | Lvl1 below 3, Lvl2 at 3-4, Lvl3 at 5 or more | `:124-147` |
| Wooden table with drawer | Lvl1 below 4, Lvl2 at 4-5, Lvl3 at 6 or more | `:148-171` |
| Wooden chair | Lvl1 below 3, Lvl2 at 3-5, Lvl3 above 5 | `:68-91` |
| Wooden bar element | Lvl1 below 5, Lvl2 at 5-6, Lvl3 at 7 or more | `:36-59` |
| Wooden crate | Lvl1 below 7, Lvl2 at 7 or more | `:92-107` |
| Wooden shelves | Lvl1 below 5, Lvl2 at 5 or more | `:108-123` |
| Wooden bookcase, small bookcase | Lvl1 below 5, Lvl2 at 5 or more (they reuse the bar-element test for Lvl1) | `:36-67` |
| Composter | Lvl1 below 6, Lvl2 at 6 or more | `:352-367` |
| Brick wall, door frame and window frame | Lvl1 below Masonry 5, Lvl2 at 5 or more | `:336-351` |
| Metal wall, window frame, door frame, fence and door | Lvl1 below Welding 5, Lvl2 at 5 or more | `:368-399` |
| Metal counter | Lvl1 below Welding 8, Lvl2 at 8 or more | `:172-187` |
| Metal crate | Lvl1 below 7, Lvl2 at 7 or more | `:188-203` |
| Big metal locker | Lvl1 below 10, Lvl2 at 10 | `:204-219` |
| Small metal locker and metal shelves | Lvl1 below 9, Lvl2 at 9 or more | `:220-235` |

## Books

Some metalwork recipes must be learned from a magazine or granted by the metalworker profession.

Three magazines teach them :cite[(`media/scripts/generated/items/literature.txt:5822-5865`)], and the metalworker profession grants them :cite[(`media/scripts/generated/characters/character_professions.txt:155`)]. The recipes are flagged `NeedToBeLearn`, and in all 32 of them must be learned; the real list is in [How building works](/pz/build-42/engine/building-and-moveables/how-building-works).

| Magazine | Teaches |
|---|---|
| `MetalworkMag1` | Metal wall Lvl1 and Lvl2, metal floor, metal window frame Lvl1 and Lvl2, metal wall frame, metal door frame Lvl1 and Lvl2, metal stairs |
| `MetalworkMag2` | Metal counter, counter corner, crate, small locker, big locker and shelves (both tiers) |
| `MetalworkMag3` | Metal pole gate (large and small), wire gate (large and small), double gates, big and small metal fences, small pole fence, small wire fence, and the Lvl1 metal fence |

Three groups of metalwork are **not** on the list and need only the skill: the metal doors (`MetalDoorLvl1`, `MetalDoorLvl2`, Welding 3), the second metal fence tier (`MetalFenceLvl2`, Welding 5) and the metal barricades (Welding 3). Check any recipe you cannot find against the Learn column.

## Carpentry (script name Woodwork)

Carpentry builds with a hammer, planks and nails.

Levels in one line each:

- **1:** low tables, chairs, a floor, a sign, a lamp pillar, drying racks (the carpentry ones and the small leather rack), a simple feeding trough, a chopping block, the rugged stool and table.
- **2:** the first wall, window frame, pole, wall frame, door frame and floor tier; shelves and a table with drawers; a scutching board.
- **3:** the first door and fence, fence gate, bookcases, crates, bar elements, rain collectors, looms and combs, a butcher hook, two chicken hutches, a double feeding trough, a shoddy composter, log stairs.
- **4:** the second wall, window frame, door frame and floor tiers; double doors; the bed and the coffin.
- **5:** the second door and fence tiers, windows with glass, round rain collectors (with garbage bags or a tarp), a spinning wheel, a pottery bench, barbed wire fence, the third table tier.
- **6:** the third wall, window frame and door frame tiers, wooden stairs, a composter, plaster walls.
- **7:** the third door and fence tiers, the second crate tier, the third bar elements.

Nothing in the scripts needs Carpentry 8, 9 or 10. Those levels only add health to what you build (see the health page) and speed to building on a server.

| Level | Recipe | XP | Learn | Tools you hold | Materials used | Code |
|---|---|---|---|---|---|---|
| 1 | Chopping Block | 10 |  | #crudesaw/saw | 1x Log | `outdoors/entity_chopping_block.txt:25-38` |
| 1 | Drying Rack Small | 10 |  | #hammer, #saw/smallsaw/crudesaw | 4x Long Stick; 4x Twine; 1x Nails | `animals/workstations/entity_leather_prep.txt:1111-1127` |
| 1 | Drying Rack | 10 |  | #hammer, #crudesaw/saw | 6x Long Stick; 8x Twine; 2x Nails | `agricultural/workstations/entity_Drying_Rack.txt:474-491` |
| 1 | Feeding Trough Simple | 10 |  | #hammer | 2x Plank; 2x Nails | `animals/workstations/entity_feedingtrough.txt:118-132` |
| 1 | Herb Drying Rack | 10 |  | #hammer, #crudesaw/saw, #drillwood/drillmetal/drillwoodpoor | 4x Long Stick; 4x Twine; 2x Nails | `agricultural/workstations/entity_Herb_Drying_Rack.txt:509-527` |
| 1 | Rugged Stool | 10 |  | - | 4x TreeBranch2 (Tree Branch)/WoodenStick2 (Wooden Rod); 2x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `furniture/entity_rugged_stool.txt:28-42` |
| 1 | Rugged Table | 10 |  | - | 8x TreeBranch2 (Tree Branch)/WoodenStick2 (Wooden Rod); 4x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `furniture/entity_rugged_table.txt:29-43` |
| 1 | Wood Floor Lvl1 | 10 |  | #hammer | 1x Plank; 1x Nails | `walls/entity_wood_floorlvl1.txt:24-39` |
| 1 | Wood Lamp Pillar | 10 |  | #hammer | 1x Log; 4x Nails; 1x Rope; 1x #flashlightpillar (destroy) | `outdoors/entity_wood_lamppillar.txt:64-80` |
| 1 | Wood Sign | 10 |  | #hammer | 3x Plank; 3x Nails | `outdoors/entity_wood_sign.txt:29-43` |
| 1 | Wood Chair Lvl1 | 10 |  | #hammer | 2x Plank; 2x Nails | `furniture/entity_carpentry_chair_lvl1.txt:42-58` |
| 1 | Wood Table Lvl1 | 10 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_table_lvl1.txt:29-45` |
| 1 | Wood Table Small Lvl1 | 10 |  | #hammer | 2x Plank; 2x Nails | `furniture/entity_carpentry_tablesmall_lvl1.txt:21-37` |
| 2 | Scutching Board | 20 |  | #hammer, #saw/crudesaw | 2x Plank; 4x Nails | `agricultural/workstations/entity_scutching_board.txt:33-49` |
| 2 | Wood Door Frame Lvl1 | 20 |  | #hammer | 4x Plank; 4x Nails | `walls/entity_wood_doorframelvl1.txt:33-48` |
| 2 | Wood Floor Lvl2 | 10 |  | #hammer | 1x Plank; 1x Nails | `walls/entity_wood_floorlvl2.txt:24-39` |
| 2 | Wood Shelves Double Lvl1 | 20 |  | #hammer | 2x Plank; 4x Nails | `furniture/entity_carpentry_shelvesdouble_lvl1.txt:43-58` |
| 2 | Wood Shelves Lvl1 | 20 |  | #hammer | 1x Plank; 2x Nails | `furniture/entity_carpentry_shelves_lvl1.txt:43-59` |
| 2 | Wood Table Drawer Lvl1 | 20 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_tabledrawer_lvl1.txt:42-58` |
| 2 | Wooden Pole | 20 |  | #hammer | 1x Plank; 1x Nails | `walls/entity_woodenpole.txt:23-37` |
| 2 | Wooden Wall Frame | 20 |  | #hammer | 2x Plank; 2x Nails | `walls/entity_woodenwallframe.txt:32-46` |
| 2 | Wooden Wall Lvl1 | 20 |  | #hammer | 2x Plank; 4x Nails | `walls/entity_wood_walllvl1.txt:35-50` |
| 2 | Wooden Window Frame Lvl1 | 20 |  | #hammer | 2x Plank; 4x Nails | `walls/entity_wood_windowframelvl1.txt:32-47` |
| 3 | Butcher Hook | 30 |  | #hammer | 2x Plank; 2x Nails; 1x Large Hook | `animals/workstations/entity_butcher_hook.txt:31-46` |
| 3 | Chicken Hutch | 30 |  | #hammer | 5x Plank; 5x Nails | `animals/workstations/entity_chickenhutch.txt:23-37` |
| 3 | Chicken Hutch2 | 30 |  | #hammer | 5x Plank; 5x Nails | `animals/workstations/entity_chickenhutch.txt:60-74` |
| 3 | Composter Shoddy | 30 |  | #hammer | 4x Plank; 4x Nails | `outdoors/entity_composter.txt:59-74` |
| 3 | Feeding Trough Double | 30 |  | #hammer | 4x Plank; 2x Nails | `animals/workstations/entity_feedingtrough.txt:75-89` |
| 3 | Heckle Comb | 30 |  | #hammer, #saw/crudesaw | 4x Plank; 8x Nails | `agricultural/workstations/entity_heckle_comb.txt:34-50` |
| 3 | Log Stairs | 30 |  | #hammer, #choptree/saw/crudesaw | 12x Log; 12x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `stairs/entity_log_stairs.txt:34-50` |
| 3 | Rain Collector | 30 |  | #hammer | 4x Plank; 4x Nails; 4x #garbagebag | `outdoors/entity_raincollector.txt:29-45` |
| 3 | Rain Collector Tarp | 30 |  | #hammer | 4x Plank; 4x Nails; 1x Tarp | `outdoors/entity_raincollector_tarp.txt:29-45` |
| 3 | Ripple Comb | 30 |  | #hammer, #saw/crudesaw | 4x Plank; 8x Nails | `agricultural/workstations/entity_ripple_comb.txt:33-49` |
| 3 | Simple Loom | 30 |  | #hammer, #crudesaw/saw | 4x Log; 5x Long Stick; 4x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `agricultural/workstations/entity_simple_loom.txt:33-50` |
| 3 | Wood Fence Gate | 30 |  | #hammer | 4x Plank; 4x Nails; 2x Hinge (Door Hinge); 1x Doorknob | `walls/entity_wood_fencegate.txt:46-63` |
| 3 | Wood Fence Lvl1 | 30 |  | #hammer | 2x Plank; 2x Nails | `walls/entity_wood_fencelvl1.txt:32-47` |
| 3 | Wood Bar Element Corner Lvl1 | 30 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_barelementcorner_lvl1.txt:43-59` |
| 3 | Wood Bar Element Lvl1 | 30 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_barelement_lvl1.txt:43-59` |
| 3 | Wood Bookcase Small Lvl1 | 30 |  | #hammer | 2x Plank; 2x Nails | `furniture/entity_carpentry_bookcasesmall_lvl1.txt:42-58` |
| 3 | Wood Bookcase Lvl1 | 30 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_bookcase_lvl1.txt:42-57` |
| 3 | Wood Chair Lvl2 | 30 |  | #hammer | 2x Plank; 2x Nails | `furniture/entity_carpentry_chair_lvl2.txt:42-58` |
| 3 | Wood Crate Lvl1 | 30 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_crate_lvl1.txt:22-38` |
| 3 | Wood Table Lvl2 | 30 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_table_lvl2.txt:29-45` |
| 3 | Wood Table Small Lvl2 | 30 |  | #hammer | 2x Plank; 2x Nails | `furniture/entity_carpentry_tablesmall_lvl2.txt:21-37` |
| 3 | Wooden Door Lvl1 | 30 |  | #hammer | 4x Plank; 4x Nails; 2x Hinge (Door Hinge); 1x Doorknob | `walls/entity_woodendoorlvl1.txt:44-61` |
| 4 | Coffin | 40 |  | #hammer, #saw/crudesaw | 4x Plank; 4x Nails | `furniture/entity_carpentry_coffin.txt:44-59` |
| 4 | Double Door | 40 |  | #hammer | 8x Plank; 8x Nails; 4x Hinge (Door Hinge); 2x Doorknob | `walls/entity_wood_doubledoor.txt:35-51` |
| 4 | Wood Door Frame Lvl2 | 40 |  | #hammer | 4x Plank; 4x Nails | `walls/entity_wood_doorframelvl2.txt:33-48` |
| 4 | Wood Floor Lvl3 | 15 |  | #hammer | 1x Plank; 1x Nails | `walls/entity_wood_floorlvl3.txt:24-39` |
| 4 | Wood Bed | 40 |  | #hammer | 6x Plank; 4x Nails; 1x Mattress | `furniture/entity_carpentry_bed.txt:29-45` |
| 4 | Wood Table Drawer Lvl2 | 40 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_tabledrawer_lvl2.txt:42-58` |
| 4 | Wooden Wall Lvl2 | 40 |  | #hammer | 2x Plank; 4x Nails | `walls/entity_wood_walllvl2.txt:35-50` |
| 4 | Wooden Window Frame Lvl2 | 40 |  | #hammer | 2x Plank; 4x Nails | `walls/entity_wood_windowframelvl2.txt:32-47` |
| 5 | Barbed Wire Fence | 50 |  | #hammer | 1x Barbed Wire | `walls/entity_wood_fencebarbedwirelvl1.txt:31-44` |
| 5 | Pottery Bench | 5 |  | #hammer | 4x Plank; 4x Nails; 1x Sheet | `pottery/workstations/entity_pottery_bench.txt:33-48` |
| 5 | Rain Collector Round | 50 |  | #hammer | 6x Plank; 5x Nails; 4x #garbagebag | `outdoors/entity_raincollector.txt:84-100` |
| 5 | Rain Collector Round Tarp | 50 |  | #hammer | 6x Plank; 5x Nails; 1x Tarp | `outdoors/entity_raincollector_tarp.txt:84-100` |
| 5 | Spinning Wheel | 50 |  | #hammer | 4x Plank; 4x Nails; 3x Long Stick | `animals/workstations/entity_spinning_wheel.txt:46-61` |
| 5 | Wood Fence Lvl2 | 50 |  | #hammer | 2x Plank; 2x Nails | `walls/entity_wood_fencelvl2.txt:32-47` |
| 5 | Wood Bar Element Corner Lvl2 | 50 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_barelementcorner_lvl2.txt:43-59` |
| 5 | Wood Bar Element Lvl2 | 50 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_barelement_lvl2.txt:43-59` |
| 5 | Wood Bookcase Small Lvl2 | 50 |  | #hammer | 2x Plank; 2x Nails | `furniture/entity_carpentry_bookcasesmall_lvl2.txt:42-58` |
| 5 | Wood Bookcase Lvl2 | 50 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_bookcase_lvl2.txt:42-57` |
| 5 | Wood Shelves Lvl2 | 50 |  | #hammer | 1x Plank; 2x Nails | `furniture/entity_carpentry_shelves_lvl2.txt:43-59` |
| 5 | Wood Table Lvl3 | 50 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_table_lvl3.txt:29-45` |
| 5 | Wood Table Small Lvl3 | 50 |  | #hammer | 2x Plank; 2x Nails | `furniture/entity_carpentry_tablesmall_lvl3.txt:21-37` |
| 5 | Wooden Door Lvl2 | 50 |  | #hammer | 4x Plank; 4x Nails; 2x Hinge (Door Hinge); 1x Doorknob | `walls/entity_woodendoorlvl2.txt:44-61` |
| 5 | Wooden Windows | 15 |  | #hammer | 4x GlassPanel (Glass Pane); 2x Plank; 4x Nails | `furniture/entity_wood_windowglass.txt:30-46` |
| 6 | Composter | 60 |  | #hammer | 4x Plank; 4x Nails | `outdoors/entity_composter.txt:22-37` |
| 6 | Wood Door Frame Lvl3 | 60 |  | #hammer | 4x Plank; 4x Nails | `walls/entity_wood_doorframelvl3.txt:33-48` |
| 6 | Wood Chair Lvl3 | 60 |  | #hammer | 2x Plank; 2x Nails | `furniture/entity_carpentry_chair_lvl3.txt:42-58` |
| 6 | Wood Stairs | 60 |  | #hammer | 13x Plank; 8x Nails | `stairs/entity_carpentry_stairs.txt:34-48` |
| 6 | Wood Table Drawer Lvl3 | 60 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_tabledrawer_lvl3.txt:42-58` |
| 6 | Wooden Wall Lvl3 | 60 |  | #hammer | 2x Plank; 4x Nails | `walls/entity_wood_walllvl3.txt:35-50` |
| 6 | Wooden Window Frame Lvl3 | 60 |  | #hammer | 2x Plank; 4x Nails | `walls/entity_wood_windowframelvl3.txt:33-48` |
| 7 | Wood Fence Lvl3 | 70 |  | #hammer | 2x Plank; 2x Nails | `walls/entity_wood_fencelvl3.txt:32-47` |
| 7 | Wood Bar Element Corner Lvl3 | 70 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_barelementcorner_lvl3.txt:43-59` |
| 7 | Wood Bar Element Lvl3 | 70 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_barelement_lvl3.txt:43-59` |
| 7 | Wood Crate Lvl2 | 70 |  | #hammer | 4x Plank; 4x Nails | `furniture/entity_carpentry_crate_lvl2.txt:22-38` |
| 7 | Wooden Door Lvl3 | 70 |  | #hammer | 4x Plank; 4x Nails; 2x Hinge (Door Hinge); 1x Doorknob | `walls/entity_woodendoorlvl3.txt:44-61` |

## Welding (script name MetalWelding)

Welding builds with a blowtorch, welding rods and sheet metal, bars or pipes.
Most of it needs a magazine first. The levels in one line each:

- **2:** the metal wall frame.
- **3:** walls, window frames, door frames and doors; fences and gates in metal and wire; the first counters, crates, shelves and lockers; metal barricades; a double metal feeding trough.
- **5:** the second tier of walls, window frames, door frames and fences; stairs; double gates; a barrel oven; the small locker.
- **7:** the second crate tier. **8:** the second counter tier. **9:** the second small locker and shelves tier. **10:** the second big locker tier.

| Level | Recipe | XP | Learn | Tools you hold | Materials used | Code |
|---|---|---|---|---|---|---|
| 2 | Metal Wall Frame | 20 | yes | - | 1x BlowTorch (Welding Torch); 3x MetalBar (Steel Rod); 2x Welding Rods | `walls/entity_metal_wallframe.txt:32-47` |
| 3 | Barricade Metal Bar | 30 |  | - | 3x BlowTorch (Welding Torch); 3x Iron Bar/MetalBar (Steel Rod)/Steel Bar; 3x Welding Rods | `barricades/entity_barricade_metalbar.txt:46-61` |
| 3 | Barricade Metal Sheet | 30 |  | - | 1x BlowTorch (Welding Torch); 1x SheetMetal (Steel Sheet); 1x Welding Rods | `barricades/entity_barricade_metalsheet.txt:46-61` |
| 3 | Feeding Trough Double Metal | 30 |  | - | 4x BlowTorch (Welding Torch); 4x SheetMetal (Steel Sheet); 4x Welding Rods | `animals/workstations/entity_feedingtrough.txt:30-45` |
| 3 | Metal Big Metal Fence | 30 | yes | - | 5x BlowTorch (Welding Torch); 5x MetalPipe (Iron Pipe); 2x Scrap Metal; 5x Welding Rods | `walls/entity_metal_bigmetalfence.txt:33-49` |
| 3 | Metal Big Wire Fence | 30 | yes | - | 4x BlowTorch (Welding Torch); 3x MetalPipe (Iron Pipe); 4x Scrap Metal; 3x Wire; 5x Welding Rods | `walls/entity_metal_bigwirefence.txt:33-50` |
| 3 | Metal Door Frame Lvl1 | 30 | yes | - | 4x BlowTorch (Welding Torch); 4x MetalBar (Steel Rod); 4x Welding Rods | `walls/entity_metal_doorframelvl1.txt:33-49` |
| 3 | Metal Door Lvl1 | 30 |  | - | 4x BlowTorch (Welding Torch); 3x SmallSheetMetal (Steel Sheet - Small); 4x Welding Rods; 2x Hinge (Door Hinge); 1x Doorknob | `walls/entity_metal_doorlvl1.txt:44-61` |
| 3 | Metal Door Lvl2 | 30 |  | - | 4x BlowTorch (Welding Torch); 3x SmallSheetMetal (Steel Sheet - Small); 4x Welding Rods; 2x Hinge (Door Hinge); 1x Doorknob | `walls/entity_metal_doorlvl2.txt:44-61` |
| 3 | Metal Fence Lvl1 | 30 | yes | - | 2x BlowTorch (Welding Torch); 2x MetalBar (Steel Rod); 2x Welding Rods | `walls/entity_metal_fencelvl1.txt:32-48` |
| 3 | Metal Pole Fence Gate | 30 | yes | - | 4x BlowTorch (Welding Torch); 5x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Scrap Metal; 4x Welding Rods | `walls/entity_metal_polefencegate.txt:46-63` |
| 3 | Metal Pole Fence Gate Small | 30 | yes | - | 4x BlowTorch (Welding Torch); 3x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 2x Scrap Metal; 4x Welding Rods | `walls/entity_metal_polefencegatesmall.txt:46-63` |
| 3 | Metal Small Pole Fence | 30 | yes | - | 2x BlowTorch (Welding Torch); 3x MetalPipe (Iron Pipe); 2x Welding Rods | `walls/entity_metal_smallpolefence.txt:33-48` |
| 3 | Metal Small Wire Fence | 30 | yes | - | 2x BlowTorch (Welding Torch); 2x MetalPipe (Iron Pipe); 1x Scrap Metal; 1x Wire; 2x Welding Rods | `walls/entity_metal_smallwirefence.txt:33-50` |
| 3 | Metal Wall Lvl1 | 30 | yes | - | 4x BlowTorch (Welding Torch); 3x SmallSheetMetal (Steel Sheet - Small); 4x Welding Rods | `walls/entity_metal_walllvl1.txt:34-50` |
| 3 | Metal Window Frame Lvl1 | 30 | yes | - | 4x BlowTorch (Welding Torch); 3x SmallSheetMetal (Steel Sheet - Small) | `walls/entity_metal_windowframelvl1.txt:32-47` |
| 3 | Metal Wire Fence Gate | 30 | yes | - | 4x BlowTorch (Welding Torch); 3x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Scrap Metal; 4x Welding Rods | `walls/entity_metal_wirefencegate.txt:46-63` |
| 3 | Metal Wire Fence Gate Small | 30 | yes | - | 2x BlowTorch (Welding Torch); 2x MetalPipe (Iron Pipe); 1x Scrap Metal; 1x Wire; 2x Welding Rods | `walls/entity_metal_wirefencegatesmall.txt:46-63` |
| 3 | Metal Counter Corner Lvl1 | 30 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small); 2x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Welding Rods | `furniture/entity_welding_countercorner_lvl1.txt:43-62` |
| 3 | Metal Counter Lvl1 | 30 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small); 2x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Welding Rods | `furniture/entity_welding_counter_lvl1.txt:42-61` |
| 3 | Metal Crate Lvl1 | 30 | yes | - | 4x BlowTorch (Welding Torch); 2x SmallSheetMetal (Steel Sheet - Small); 2x SheetMetal (Steel Sheet); 1x Scrap Metal; 4x Welding Rods | `furniture/entity_welding_crate_lvl1.txt:43-62` |
| 3 | Metal Locker Big Lvl1 | 30 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small); 8x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Welding Rods | `furniture/entity_welding_lockerbig_lvl1.txt:43-62` |
| 3 | Metal Shelves Lvl1 | 30 | yes | - | 2x BlowTorch (Welding Torch); 1x SmallSheetMetal (Steel Sheet - Small); 2x MetalPipe (Iron Pipe); 1x Scrap Metal; 2x Welding Rods | `furniture/entity_welding_shelves_lvl1.txt:43-62` |
| 5 | Barrel Oven | 50 |  | - | 4x BlowTorch (Welding Torch); 2x SmallSheetMetal (Steel Sheet - Small); 2x SheetMetal (Steel Sheet); 1x Scrap Metal; 4x Welding Rods | `furniture/entity_welding_barreloven.txt:43-60` |
| 5 | Double Fence Gate | 50 | yes | - | 10x BlowTorch (Welding Torch); 10x MetalPipe (Iron Pipe); 4x Hinge (Door Hinge); 4x Scrap Metal; 10x Welding Rods | `walls/entity_metal_doublepolegate.txt:35-52` |
| 5 | Double Wire Gate | 50 | yes | - | 10x BlowTorch (Welding Torch); 8x MetalPipe (Iron Pipe); 4x Wire; 4x Hinge (Door Hinge); 2x Scrap Metal; 10x Welding Rods | `walls/entity_metal_doublewiregate.txt:35-53` |
| 5 | Metal Door Frame Lvl2 | 50 | yes | - | 4x BlowTorch (Welding Torch); 4x MetalBar (Steel Rod); 4x Welding Rods | `walls/entity_metal_doorframelvl2.txt:33-49` |
| 5 | Metal Fence Lvl2 | 50 |  | - | 2x BlowTorch (Welding Torch); 2x MetalBar (Steel Rod); 2x Welding Rods | `walls/entity_metal_fencelvl2.txt:32-47` |
| 5 | Metal Wall Lvl2 | 50 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small); 4x Welding Rods | `walls/entity_metal_walllvl2.txt:34-50` |
| 5 | Metal Window Frame Lvl2 | 50 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small) | `walls/entity_metal_windowframelvl2.txt:32-47` |
| 5 | Metal Locker Small Lvl1 | 50 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small); 3x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Welding Rods | `furniture/entity_welding_lockersmall_lvl1.txt:43-62` |
| 5 | Metal Stairs | 50 | yes | - | 4x BlowTorch (Welding Torch); 4x MetalBar (Steel Rod); 6x SmallSheetMetal (Steel Sheet - Small); 4x Welding Rods | `stairs/entity_welding_stairs.txt:34-50` |
| 7 | Metal Crate Lvl2 | 70 | yes | - | 4x BlowTorch (Welding Torch); 2x SmallSheetMetal (Steel Sheet - Small); 2x SheetMetal (Steel Sheet); 1x Scrap Metal; 4x Welding Rods | `furniture/entity_welding_crate_lvl2.txt:22-41` |
| 8 | Metal Counter Corner Lvl2 | 80 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small); 2x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Welding Rods | `furniture/entity_welding_countercorner_lvl2.txt:43-62` |
| 8 | Metal Counter Lvl2 | 80 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small); 2x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Welding Rods | `furniture/entity_welding_counter_lvl2.txt:42-61` |
| 9 | Metal Locker Small Lvl2 | 90 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small); 3x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Welding Rods | `furniture/entity_welding_lockersmall_lvl2.txt:43-62` |
| 9 | Metal Shelves Lvl2 | 90 | yes | - | 2x BlowTorch (Welding Torch); 1x SmallSheetMetal (Steel Sheet - Small); 2x MetalPipe (Iron Pipe); 1x Scrap Metal; 2x Welding Rods | `furniture/entity_welding_shelves_lvl2.txt:43-62` |
| 10 | Metal Locker Big Lvl2 | 100 | yes | - | 4x BlowTorch (Welding Torch); 4x SmallSheetMetal (Steel Sheet - Small); 8x MetalPipe (Iron Pipe); 2x Hinge (Door Hinge); 4x Welding Rods | `furniture/entity_welding_lockerbig_lvl2.txt:43-61` |

## Masonry

Masonry builds with a masonry trowel, mortar or concrete (the `#concrete` tag) and bricks or stone blocks.

The levels in one line each:

- **1:** the simple cooking pit, the stone mill and the stone quern.
- **2:** brick and stone walls, window frames and door frames; the cooking pit.
- **5:** the second brick tier: wall, window frame, door frame and a brick fence.

| Level | Recipe | XP | Learn | Tools you hold | Materials used | Code |
|---|---|---|---|---|---|---|
| 1 | Simple Cooking Pit | 10 |  | - | 1x #concrete; 10x Stone2 (Stone); 3x TreeBranch2 (Tree Branch)/WoodenStick2 (Wooden Rod) | `agricultural/workstations/entity_simple_cooking_pit.txt:22-36` |
| 1 | Stone Mill | 10 |  | #masonstrowel | 1x Stone Wheel; 2x StoneWheelSmall (Small Stone Wheel); 1x LongHandle (Large Handle); 1x WoodenStick2 (Wooden Rod); 10x Stone Block; 1x #concrete | `agricultural/workstations/entity_stone_mill.txt:25-43` |
| 1 | Stone Quern | 10 |  | - | 1x Stone Wheel; 2x StoneWheelSmall (Small Stone Wheel); 1x Handle (Medium Handle) | `agricultural/workstations/entity_stone_quern.txt:26-40` |
| 2 | Brick Door Frame Lvl1 | 20 |  | #masonstrowel | 2x #concrete; 4x ClayBrick (Brick) | `walls/entity_brick_doorframelvl1.txt:33-48` |
| 2 | Brick Wall Lvl1 | 20 |  | #masonstrowel | 2x #concrete; 4x ClayBrick (Brick) | `walls/entity_brick_walllvl1.txt:33-48` |
| 2 | Brick Window Frame Lvl1 | 20 |  | #masonstrowel | 2x #concrete; 4x ClayBrick (Brick) | `walls/entity_brick_windowframelvl1.txt:32-47` |
| 2 | Cooking Pit | 20 |  | #masonstrowel | 10x Stone Block; 1x #concrete | `agricultural/workstations/entity_cooking_pit.txt:22-37` |
| 2 | Stone Door Frame | 20 |  | #masonstrowel | 2x #concrete; 4x Stone Block | `walls/entity_stone_doorframe.txt:33-47` |
| 2 | Stone Wall | 20 |  | #masonstrowel | 2x #concrete; 6x Stone Block | `walls/entity_stone_wall.txt:32-46` |
| 2 | Stone Window Frame | 20 |  | #masonstrowel | 2x #concrete; 5x Stone Block | `walls/entity_stone_windowframe.txt:32-47` |
| 5 | Brick Door Frame Lvl2 | 50 |  | #masonstrowel | 2x #concrete; 4x ClayBrick (Brick) | `walls/entity_brick_doorframelvl2.txt:33-48` |
| 5 | Brick Fence Lvl2 | 50 |  | #masonstrowel | 1x #concrete; 2x ClayBrick (Brick) | `walls/entity_brick_fencelvl2.txt:32-46` |
| 5 | Brick Wall Lvl2 | 50 |  | #masonstrowel | 2x #concrete; 4x ClayBrick (Brick) | `walls/entity_brick_walllvl2.txt:33-48` |
| 5 | Brick Window Frame Lvl2 | 50 |  | #masonstrowel | 2x #concrete; 4x ClayBrick (Brick) | `walls/entity_brick_windowframelvl2.txt:32-47` |

## Recipes that need no skill

These recipes have no `SkillRequired`.

Some still give XP, which is shown. They are survival builds (logs, sticks, stone), workstations (forges, furnaces, kilns), outdoor shelters. The workstation recipes only build the workstation; what it crafts is separate, see [The workstation entity system](/pz/build-42/modding/items-and-scripting/the-workstation-entity-system).

| Recipe | Category | XP | Tools you hold | Materials used | Code |
|---|---|---|---|---|---|
| Barricade Planks | Barricades | Woodwork 10 | #hammer | 1x Plank; 1x Nails | `barricades/entity_barricade_planks.txt:46-60` |
| Advanced Forge | Blacksmithing | - | #masonstrowel | 30x Stone Block; 1x #concrete; 1x Blacksmith Anvil; 1x BucketLargeWood (Wooden Bucket); 1x Log; 1x Large Bellows | `blacksmith/workstations/entity_forge_iii.txt:38-54` |
| Blast Furnace | Blacksmithing | - | #masonstrowel | 40x Stone Block; 1x #concrete; 1x Large Bellows | `blacksmith/workstations/entity_furnace_iii.txt:28-41` |
| Charcoal Burner Dark Green Barrel | Blacksmithing | - | - | 1x Mov_DarkGreenBarrel (Dark Green Barrel); 4x Stone2 (Stone) | `blacksmith/workstations/entity_charcoal_burner.txt:103-114` |
| Charcoal Burner Light Green Barrel | Blacksmithing | - | - | 1x Mov_LightGreenBarrel (Light Green Barrel); 4x Stone2 (Stone) | `blacksmith/workstations/entity_charcoal_burner.txt:141-152` |
| Charcoal Burner Metal Drum | Blacksmithing | - | - | 1x Metal Drum; 4x Stone2 (Stone) | `blacksmith/workstations/entity_charcoal_burner.txt:27-38` |
| Charcoal Burner Orange Barrel | Blacksmithing | - | - | 1x Mov_OrangeBarrel (Orange Barrel); 4x Stone2 (Stone) | `blacksmith/workstations/entity_charcoal_burner.txt:65-76` |
| Charcoal Pit | Blacksmithing | - | #diggrave | - | `blacksmith/workstations/entity_charcoal_pit.txt:28-38` |
| Dome Kiln | Blacksmithing | - | #masonstrowel | 40x Stone Block; 1x #concrete | `blacksmith/workstations/entity_dome_kiln.txt:36-47` |
| Forge | Blacksmithing | - | #masonstrowel | 30x Stone Block; 1x #concrete; 1x Blacksmith Anvil; 1x BucketLargeWood (Wooden Bucket); 1x Log | `blacksmith/workstations/entity_forge_ii.txt:36-51` |
| Forge Primitive Forge | Blacksmithing | - | - | 1x #concrete; 10x Stone2 (Stone); 1x Stone Anvil | `blacksmith/workstations/entity_forge_i.txt:35-47` |
| Grindstone | Blacksmithing | - | #hammer | 4x Plank; 4x Nails; 1x Stone Wheel | `blacksmith/workstations/entity_grindstone.txt:46-59` |
| Primitive Furnace | Blacksmithing | - | - | 6x Clay; 4x Stone2 (Stone); 1x #concrete | `blacksmith/workstations/entity_furnace_i.txt:34-46` |
| Smelting Furnace | Blacksmithing | - | #masonstrowel | 40x Stone Block; 1x #concrete | `blacksmith/workstations/entity_furnace_ii.txt:34-46` |
| Log Door Frame Lvl1 | Carpentry | Woodwork 10 | - | 3x Log; 3x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `walls/entity_log_doorframelvl1.txt:33-45` |
| Log Fence | Carpentry | Woodwork 5 | - | 2x Log; 2x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `fences_low/entity_logfence.txt:32-45` |
| Log Gate | Carpentry | Woodwork 5 | - | 5x Log; 5x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `fences_low/entity_logfenceopen.txt:33-46` |
| Log Wall | Carpentry | Woodwork 10 | - | 4x Log; 4x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `walls/entity_logwall.txt:32-44` |
| Log Window Frame Lvl1 | Carpentry | Woodwork 10 | - | 4x Log; 4x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `walls/entity_log_windowframelvl1.txt:31-43` |
| Stick Fence | Carpentry | Woodwork 1 | - | 6x Long Stick/Sapling; 2x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `fences_low/entity_stickfence.txt:32-45` |
| Piano | Debug | - | #hammer | 2x Plank; 4x Nails | `admin/entity_piano.txt:38-50` |
| Churn Bucket | Farming | Woodwork 10 | #hammer | 2x Plank; 2x Nails | `animals/workstations/entity_butter_churn.txt:26-39` |
| Drying Rack Large | Farming | - | #hammer, #saw/smallsaw/crudesaw | 6x Long Stick; 8x Twine; 2x Nails | `animals/workstations/entity_leather_prep.txt:465-479` |
| Drying Rack Medium | Farming | - | #hammer, #saw/smallsaw/crudesaw | 6x Long Stick; 8x Twine; 2x Nails | `animals/workstations/entity_leather_prep.txt:823-837` |
| Simple Drying Rack | Farming | Woodwork 5 | - | 6x Long Stick/Sapling; 8x Twine/RippedSheets (Rag)/Denim Strips/Leather Strips/Rope | `agricultural/workstations/entity_Drying_Rack.txt:971-984` |
| Simple Herb Drying Rack | Farming | Woodwork 5 | - | 4x Long Stick/Sapling; 4x Twine/RippedSheets (Rag)/Denim Strips/Leather Strips/Rope | `agricultural/workstations/entity_Herb_Drying_Rack.txt:1042-1055` |
| Softening Beam | Farming | Woodwork 6 | #hammer | 2x Plank; 2x Nails | `animals/workstations/entity_leather_prep.txt:33-46` |
| Tannin Barrel | Farming | Woodwork 10 | #hammer | 2x Plank; 2x Nails | `animals/workstations/entity_leather_prep.txt:98-111` |
| Log Bench | Furniture | - | #choptree/saw/crudesaw | 1x Log; 2x TreeBranch2 (Tree Branch); 4x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `furniture/entity_log_bench.txt:31-45` |
| Log Stool | Furniture | - | #choptree/saw/crudesaw | 1x Log; 3x TreeBranch2 (Tree Branch); 4x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `furniture/entity_log_stool.txt:29-43` |
| Log Table | Furniture | - | #choptree/saw/crudesaw | 4x TreeBranch2 (Tree Branch); 2x Log; 8x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `furniture/entity_log_table.txt:31-45` |
| Other Log Stool | Furniture | - | #choptree/saw/crudesaw | 1x Log; 3x TreeBranch2 (Tree Branch); 4x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `furniture/entity_other_log_stool.txt:22-36` |
| Stick Bookcase | Furniture | Woodwork 5 | - | 8x TreeBranch2 (Tree Branch)/WoodenStick2 (Wooden Rod); 4x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `furniture/entity_rugged_bookcase.txt:44-57` |
| Stick Bookcase Small Lvl1 | Furniture | Woodwork 5 | - | 8x TreeBranch2 (Tree Branch)/WoodenStick2 (Wooden Rod); 4x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `furniture/entity_rugged_bookcasesmall.txt:42-56` |
| Brick Floor Lvl1 | Masonry | Masonry 10 | #masonstrowel | 1x #concrete; 4x ClayTile (Ceramic Tile) | `walls/entity_brick_floor.txt:24-37` |
| Stone Cabinet | Masonry | Masonry 5 | - | 1x #concrete; 10x Stone2 (Stone); 2x FlatStone (Large Smooth Flat Stone) | `furniture/entity_stone_cabinet.txt:44-57` |
| Rugged Cross | Miscellaneous | Woodwork 1 | - | 1x TreeBranch2 (Tree Branch)/WoodenStick2 (Wooden Rod); 1x Long Stick/Sapling; 1x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `outdoors/entity_rugged_cross.txt:44-57` |
| Skull Pole Antlers | Miscellaneous | - | - | 1x Long Stick/Sapling; 1x Sheet Rope; 1x DeerStag_Skull (Stag Skull) | `outdoors/entity_skull_poleantlers.txt:30-42` |
| Skull Pole Bull | Miscellaneous | - | - | 1x Long Stick/Sapling; 1x Sheet Rope; 1x Bull Skull | `outdoors/entity_skull_polebull.txt:44-56` |
| Skull Pole Cow | Miscellaneous | - | - | 1x Long Stick/Sapling; 1x Sheet Rope; 1x Cow Skull | `outdoors/entity_skull_polecow.txt:44-56` |
| Skull Pole Deer | Miscellaneous | - | - | 1x Long Stick/Sapling; 1x Sheet Rope; 1x DeerStag_Skull (Stag Skull) | `outdoors/entity_skull_poledeer.txt:44-56` |
| Skull Pole Deer Doe | Miscellaneous | - | - | 1x Long Stick/Sapling; 1x Sheet Rope; 1x DeerDoe_Skull (Deer Skull) | `outdoors/entity_skull_poleDeerDoe.txt:44-56` |
| Skull Pole Pig | Miscellaneous | - | - | 1x Long Stick/Sapling; 1x Sheet Rope; 1x Pig Skull | `outdoors/entity_skull_polepig.txt:44-56` |
| Skull Pole Sheep | Miscellaneous | - | - | 1x Long Stick/Sapling; 1x Sheet Rope; 1x Sheep Skull | `outdoors/entity_skull_polesheep.txt:44-56` |
| Stone Cairn | Miscellaneous | - | - | 6x Stone2 (Stone) | `outdoors/entity_stone_cairn.txt:23-33` |
| Wood Cross | Miscellaneous | Woodwork 6 | #hammer | 2x Plank; 2x Nails | `outdoors/entity_wood_cross.txt:44-57` |
| Wood Picket | Miscellaneous | Woodwork 6 | - | 1x Plank; 1x Sheet Rope | `outdoors/entity_wood_picket.txt:22-35` |
| Campfire | Outdoors | - | - | 3x Stone2 (Stone) | `outdoors/entity_campfire.txt:24-35` |
| Dirt Floor | Outdoors | - | - | 1x Dirtbag (Sack of Dirt) | `walls/entity_floor_dirt.txt:24-34` |
| Gravel Floor | Outdoors | - | - | 1x Gravelbag (Sack of Gravel) | `walls/entity_floor_gravel.txt:24-34` |
| Lean To Shelter | Outdoors | - | - | 20x TreeBranch2 (Tree Branch)/WoodenStick2 (Wooden Rod); 4x Stone2 (Stone); 4x Log; 5x Long Stick/Sapling; 2x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `outdoors/entity_leanto_shelter.txt:45-59` |
| Leather Shelter | Outdoors | - | - | 2x TreeBranch2 (Tree Branch)/WoodenStick2 (Wooden Rod); 1x #leathercrudetannedlarge/leatherfurtannedlarge; 4x Stone2 (Stone); 4x Log; 1x Long Stick/Sapling; 2x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `outdoors/entity_leather_shelter.txt:45-60` |
| Sand Floor | Outdoors | - | - | 1x Sandbag (Sack of Sand) | `walls/entity_floor_sand.txt:24-34` |
| Sandbag Wall | Outdoors | - | - | 3x Sandbag (Sack of Sand) (destroy) | `outdoors/entity_sandbagwall.txt:44-54` |
| Tarp Shelter | Outdoors | - | - | 2x TreeBranch2 (Tree Branch)/WoodenStick2 (Wooden Rod); 1x Tarp; 4x Stone2 (Stone); 4x Log; 1x Long Stick/Sapling; 2x RippedSheets (Rag)/RippedSheetsDirty (Rag (Dirty))/Twine/Rope/Sheet Rope | `outdoors/entity_tarp_shelter.txt:45-60` |
| Wood Stake | Outdoors | Woodwork 6 | - | 1x Plank | `outdoors/entity_wood_stake.txt:22-34` |
| Amphora | Pottery | - | #masonstrowel | 10x Clay | `outdoors/entity_amphora.txt:46-57` |
| Hand Press | Pottery | - | #hammer | 4x Plank; 4x Nails | `pottery/workstations/entity_hand_press.txt:34-46` |
| Kiln Large | Pottery | - | #masonstrowel | 20x Clay | `pottery/workstations/entity_kiln_large.txt:35-46` |
| Kiln Small | Pottery | - | #masonstrowel | 20x Clay | `pottery/workstations/entity_kiln_small.txt:34-45` |
| Pottery Wheel | Pottery | - | #hammer | 4x Plank; 4x Nails; 1x Stone Wheel; 1x StoneWheelSmall (Small Stone Wheel) | `pottery/workstations/entity_pottery_wheel.txt:35-49` |
| Metal Floor Lvl1 | Welding | MetalWelding 10 | - | 1x BlowTorch (Welding Torch); 1x SmallSheetMetal (Steel Sheet - Small); 1x Welding Rods | `walls/entity_metal_floorlvl1.txt:24-38` |

## Things the tables do not say

The tables leave out a few details, which are listed here.

- **Timed action and time.** Every recipe also names a `timedAction` (the animation and sound) and a `time` (50 to 200). On a server the time is replaced; see [How building works](/pz/build-42/engine/building-and-moveables/how-building-works).
- **17 entities have no build recipe:** the loom, coffee machine, toaster, water dispensers (two), well, fuel pump, key duplicator, metal band saw, modern pottery wheel, brick and gold pallets, hay bundles (two), and the "closed" versions of the amphora and the round rain collectors (two). The ordinary `Pottery_Wheel` is a buildable recipe and is in the no-skill table; `Pottery_Wheel_Modern` is the one without a recipe.
- **Debug.** `Piano` is a debug entity. :cite[(`entities/admin/entity_piano.txt`)]
- **Wall coverings** are build-window recipes that use a paint or paper cursor instead of placing an object. :cite[(`media/lua/client/Entity/ISUI/BuildRecipe/ISBuildPanel.lua:341-350`)] They are the eight rows in the next table; plaster needs Carpentry 6.
- **Changed from the older build menus.** Barricade planks cost one plank and one nail here, and metal barricades need Welding 3 and welding rods. The workstation page says a `Stone_Mill` entity has only a `CraftBench` component; in 42.22 it also has `SpriteConfig` and `CraftRecipe`, so the mill is itself built from this menu. :cite[(`entities/agricultural/workstations/entity_stone_mill.txt:3-44`)]

## Wall coverings

Wall coverings paint or paper a wall instead of placing an object.

| Recipe | Skill | XP | Tools you hold | Materials used | Code |
|---|---|---|---|---|---|
| Paint Sign Arrow Down | - | - | #paintbrush | 1x #paint | `walls/paint_sign.txt:124-135` |
| Paint Sign Arrow Left | - | - | #paintbrush | 1x #paint | `walls/paint_sign.txt:70-81` |
| Paint Sign Arrow Right | - | - | #paintbrush | 1x #paint | `walls/paint_sign.txt:43-54` |
| Paint Sign Arrow Up | - | - | #paintbrush | 1x #paint | `walls/paint_sign.txt:97-108` |
| Paint Sign Skull | - | - | #paintbrush | 1x #paint | `walls/paint_sign.txt:16-27` |
| Paint Wall | - | - | #paintbrush | 1x #paint | `walls/paint_wall.txt:15-26` |
| Paper Wall | - | - | #paintbrush, #scissors | 1x #wallpaperpaste; 1x #wallpaper | `walls/paper_wall.txt:15-28` |
| Plaster Wall | Woodwork 6 | Woodwork 60 | #plastertrowel | 1x BucketPlasterFull (Bucket of Plaster)/BucketCarvedPlasterFull (Carved Bucket of Plaster) | `walls/plaster_wall.txt:15-28` |

## Where to go next

These pages cover how building works, how strong the results are and how to add your own recipe.

- [How building works](/pz/build-42/engine/building-and-moveables/how-building-works).
- [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies).
- [The numbers](/pz/build-42/engine/building-and-moveables/building-and-moveables-reference).
- [Modding building and moveables](/pz/build-42/engine/building-and-moveables/modding-building-and-moveables) (add your own recipe).
- [craftRecipe reference](/pz/build-42/modding/crafting/craftrecipe-reference).

:::callout[How we know]{kind=proof}
Scripts. Every row comes from the entity script named in its Code column, in `media/scripts/generated/entities/` of capture B42_3d39148846.

The menu tiers come from the build menu file. :cite[(`media/lua/server/CraftRecipeCode/CraftRecipe_BuildMenu.lua`)]

The 194, 80, 38, 14, 62, 8, 17 and 32 counts were taken by reading every entity script with a script, not by hand. Items show their id, with the in-game name in brackets where it differs. :cite[(`media/lua/shared/Translate/EN/ItemName.json`)]
:::
