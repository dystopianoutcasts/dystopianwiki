---
id: build-42-built-object-health-table
slug: built-object-health-table
title: 'Built object health table'
game: pz
version: build-42
section: engine
category: building-and-moveables
difficulty: advanced
tags:
  - engine
  - building
  - health
  - reference
excerpt: >-
  The health of every buildable object in 42.22, computed from its script: base value, per-skill-level value and bonus, at the needed level and at level 10.
last_updated: '2026-11-14'
related_articles:
  - how-building-works
  - built-objects-health-and-zombies
  - moveables-pick-up-place-and-scrap
  - building-recipes-by-skill
  - building-and-moveables-reference
  - modding-building-and-moveables
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

:::callout[The 1-minute version]{kind=key}
- A finished object gets `max(health, 0) + bonusHealth x multiplier + skillBaseHealth x skill level`, worked out here from its entity script. :cite[(`media/lua/server/BuildingObjects/ISBuildIsoEntity.lua:666-677`)]
- All values assume Normal construction strength. "HP at the needed level" is for a player exactly at the recipe's requirement, and "HP at level 10" is the best case.
- A `*` means the script does not set the value, so the default 20 applies. Furniture works this way: a table built at Carpentry 1 has 20 health, a crate built at Carpentry 7 has 140.
- Door tiers have the same 300 per level and only differ in the level needed to build: a Carpentry 3 door is 900, a Carpentry 7 door is 2,100, a Carpentry 10 door is 3,000.
- Nothing was played out in the game, so every number is computed from the scripts.
:::

:::facts
- **Default per level** 20 when the script sets none
- **Door tiers** 300 per skill level, with no base health set
- **Wooden Wall Lvl1** 490 at Carpentry 2, 650 at level 10, at Normal construction strength
- **Stone Wall** 800 at Masonry 2, 4000 at level 10, at Normal construction strength
- **Sandbag wall** 400 at Normal (no skill, so level 0)
:::

Outcast, this page is the long table behind [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies). It lists the health a finished object gets, worked out from its entity script with the formula `max(health, 0) + bonusHealth x multiplier + skillBaseHealth x skill level`. :cite[(`media/lua/server/BuildingObjects/ISBuildIsoEntity.lua:666-677`)] The strength option and the other constants are in [the numbers page](/pz/build-42/engine/building-and-moveables/building-and-moveables-reference).

Paths in the Code column are under `media/scripts/generated/entities/` of the capture, and the line range is the object's own `SpriteConfig` block. For objects with no skill requirement but an XP-award skill, the XP skill's level is used; with neither, the level is 0.

The default of 20 for a value the script does not set comes from the script class. :cite[(`zombie/scripting/entity/components/spriteconfig/SpriteConfigScript.java:36`)]

## The main structures

Walls, doors, fences, stairs and the metal and masonry builds are grouped by material below, each with its health at the needed skill level and at level 10.

### Wood: walls, frames, windows

| Recipe | Skill needed | `health` | per skill level | `bonusHealth` | HP at the needed level | HP at level 10 | Code |
|---|---|---|---|---|---|---|---|
| Wooden Wall Frame | Carpentry 2 | 50 | 20 | - | 90 | 250 | `walls/entity_woodenwallframe.txt:11-31` |
| Wooden Wall Lvl1 | Carpentry 2 | 450 | 20 | - | 490 | 650 | `walls/entity_wood_walllvl1.txt:11-34` |
| Wooden Wall Lvl2 | Carpentry 4 | 550 | 20 | - | 630 | 750 | `walls/entity_wood_walllvl2.txt:11-34` |
| Wooden Wall Lvl3 | Carpentry 6 | 650 | 20 | - | 770 | 850 | `walls/entity_wood_walllvl3.txt:11-34` |
| Wooden Window Frame Lvl1 | Carpentry 2 | 450 | 20 | - | 490 | 650 | `walls/entity_wood_windowframelvl1.txt:11-31` |
| Wooden Window Frame Lvl2 | Carpentry 4 | 550 | 20 | - | 630 | 750 | `walls/entity_wood_windowframelvl2.txt:11-31` |
| Wooden Window Frame Lvl3 | Carpentry 6 | 650 | 20 | - | 770 | 850 | `walls/entity_wood_windowframelvl3.txt:11-32` |
| Wooden Pole | Carpentry 2 | 50 | 20* | - | 90 | 250 | `walls/entity_woodenpole.txt:11-22` |

### Wood: doors and frames

| Recipe | Skill needed | `health` | per skill level | `bonusHealth` | HP at the needed level | HP at level 10 | Code |
|---|---|---|---|---|---|---|---|
| Wood Door Frame Lvl1 | Carpentry 2 | - | 300 | - | 600 | 3000 | `walls/entity_wood_doorframelvl1.txt:11-32` |
| Wood Door Frame Lvl2 | Carpentry 4 | - | 300 | - | 1200 | 3000 | `walls/entity_wood_doorframelvl2.txt:11-32` |
| Wood Door Frame Lvl3 | Carpentry 6 | - | 300 | - | 1800 | 3000 | `walls/entity_wood_doorframelvl3.txt:11-32` |
| Wooden Door Lvl1 | Carpentry 3 | - | 300 | - | 900 | 3000 | `walls/entity_woodendoorlvl1.txt:11-43` |
| Wooden Door Lvl2 | Carpentry 5 | - | 300 | - | 1500 | 3000 | `walls/entity_woodendoorlvl2.txt:11-43` |
| Wooden Door Lvl3 | Carpentry 7 | - | 300 | - | 2100 | 3000 | `walls/entity_woodendoorlvl3.txt:11-43` |
| Double Door | Carpentry 4 | - | 300 | - | 1200 | 3000 | `walls/entity_wood_doubledoor.txt:11-34` |
| Wood Fence Gate | Carpentry 3 | - | 300 | - | 900 | 3000 | `walls/entity_wood_fencegate.txt:11-45` |

### Wood: fences, stairs and the survival builds

| Recipe | Skill needed | `health` | per skill level | `bonusHealth` | HP at the needed level | HP at level 10 | Code |
|---|---|---|---|---|---|---|---|
| Wood Fence Lvl1 | Carpentry 3 | 250 | 20 | - | 310 | 450 | `walls/entity_wood_fencelvl1.txt:11-31` |
| Wood Fence Lvl2 | Carpentry 5 | 350 | 20 | - | 450 | 550 | `walls/entity_wood_fencelvl2.txt:11-31` |
| Wood Fence Lvl3 | Carpentry 7 | 450 | 20 | - | 590 | 650 | `walls/entity_wood_fencelvl3.txt:11-31` |
| Barbed Wire Fence | Carpentry 5 | 100 | 20 | - | 200 | 300 | `walls/entity_wood_fencebarbedwirelvl1.txt:11-30` |
| Wood Stairs | Carpentry 6 | 150 | 50 | - | 450 | 650 | `stairs/entity_carpentry_stairs.txt:11-33` |
| Log Stairs | Carpentry 3 | 150 | 50 | - | 300 | 650 | `stairs/entity_log_stairs.txt:11-33` |
| Log Wall | Carpentry 0 | 500 | 50 | - | 500 | 1000 | `walls/entity_logwall.txt:11-31` |
| Log Fence | Carpentry 0 | 200 | 50 | - | 200 | 700 | `fences_low/entity_logfence.txt:11-31` |
| Log Gate | Carpentry 0 | - | 300 | - | 0 | 3000 | `fences_low/entity_logfenceopen.txt:11-32` |
| Log Door Frame Lvl1 | Carpentry 0 | 500 | 50 | - | 500 | 1000 | `walls/entity_log_doorframelvl1.txt:11-32` |
| Log Window Frame Lvl1 | Carpentry 0 | 500 | 50 | - | 500 | 1000 | `walls/entity_log_windowframelvl1.txt:11-30` |
| Stick Fence | Carpentry 0 | 200 | 50 | - | 200 | 700 | `fences_low/entity_stickfence.txt:11-31` |

### Metal

| Recipe | Skill needed | `health` | per skill level | `bonusHealth` | HP at the needed level | HP at level 10 | Code |
|---|---|---|---|---|---|---|---|
| Metal Wall Frame | Welding 2 | 100 | 20 | - | 140 | 300 | `walls/entity_metal_wallframe.txt:11-31` |
| Metal Wall Lvl1 | Welding 3 | 700 | 20 | - | 760 | 900 | `walls/entity_metal_walllvl1.txt:11-33` |
| Metal Wall Lvl2 | Welding 5 | 800 | 20 | - | 900 | 1000 | `walls/entity_metal_walllvl2.txt:11-33` |
| Metal Window Frame Lvl1 | Welding 3 | - | 300 | 400 | 1300 | 3400 | `walls/entity_metal_windowframelvl1.txt:11-31` |
| Metal Window Frame Lvl2 | Welding 5 | - | 300 | 400 | 1900 | 3400 | `walls/entity_metal_windowframelvl2.txt:11-31` |
| Metal Door Frame Lvl1 | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_doorframelvl1.txt:11-32` |
| Metal Door Frame Lvl2 | Welding 5 | - | 300 | - | 1500 | 3000 | `walls/entity_metal_doorframelvl2.txt:11-32` |
| Metal Door Lvl1 | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_doorlvl1.txt:11-43` |
| Metal Door Lvl2 | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_doorlvl2.txt:11-43` |
| Metal Fence Lvl1 | Welding 3 | 250 | 20 | - | 310 | 450 | `walls/entity_metal_fencelvl1.txt:11-31` |
| Metal Fence Lvl2 | Welding 5 | 450 | 20 | - | 550 | 650 | `walls/entity_metal_fencelvl2.txt:11-31` |
| Metal Small Pole Fence | Welding 3 | 350 | 20 | - | 410 | 550 | `walls/entity_metal_smallpolefence.txt:11-32` |
| Metal Small Wire Fence | Welding 3 | 200 | 20 | - | 260 | 400 | `walls/entity_metal_smallwirefence.txt:11-32` |
| Metal Big Metal Fence | Welding 3 | 450 | 50 | - | 600 | 950 | `walls/entity_metal_bigmetalfence.txt:11-32` |
| Metal Big Wire Fence | Welding 3 | 400 | 50 | - | 550 | 900 | `walls/entity_metal_bigwirefence.txt:11-32` |
| Metal Pole Fence Gate | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_polefencegate.txt:11-45` |
| Metal Wire Fence Gate | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_wirefencegate.txt:11-45` |
| Double Fence Gate | Welding 5 | - | 300 | - | 1500 | 3000 | `walls/entity_metal_doublepolegate.txt:11-34` |
| Metal Stairs | Welding 5 | 150 | 50 | - | 400 | 650 | `stairs/entity_welding_stairs.txt:11-33` |

### Masonry and sandbags

| Recipe | Skill needed | `health` | per skill level | `bonusHealth` | HP at the needed level | HP at level 10 | Code |
|---|---|---|---|---|---|---|---|
| Brick Wall Lvl1 | Masonry 2 | 500 | 70 | - | 640 | 1200 | `walls/entity_brick_walllvl1.txt:11-32` |
| Brick Wall Lvl2 | Masonry 5 | 800 | 70 | - | 1150 | 1500 | `walls/entity_brick_walllvl2.txt:11-32` |
| Brick Window Frame Lvl1 | Masonry 2 | - | 300 | 400 | 1000 | 3400 | `walls/entity_brick_windowframelvl1.txt:11-31` |
| Brick Window Frame Lvl2 | Masonry 5 | - | 300 | 400 | 1900 | 3400 | `walls/entity_brick_windowframelvl2.txt:11-31` |
| Brick Door Frame Lvl1 | Masonry 2 | - | 300 | - | 600 | 3000 | `walls/entity_brick_doorframelvl1.txt:11-32` |
| Brick Door Frame Lvl2 | Masonry 5 | - | 300 | - | 1500 | 3000 | `walls/entity_brick_doorframelvl2.txt:11-32` |
| Brick Fence Lvl2 | Masonry 5 | 400 | 50 | - | 650 | 900 | `walls/entity_brick_fencelvl2.txt:11-31` |
| Stone Wall | Masonry 2 | - | 400 | - | 800 | 4000 | `walls/entity_stone_wall.txt:11-31` |
| Stone Window Frame | Masonry 2 | - | 300 | 400 | 1000 | 3400 | `walls/entity_stone_windowframe.txt:11-31` |
| Stone Door Frame | Masonry 2 | - | 300 | - | 600 | 3000 | `walls/entity_stone_doorframe.txt:11-32` |
| Sandbag Wall | - 0 | - | 300 | 400 | 400 | 3400 | `outdoors/entity_sandbagwall.txt:11-43` |

## Reading the tables

Wall and door tiers differ only in base health or in the level needed, and furniture falls back to the default 20 per level.

- **Wall tiers.** Lvl1, Lvl2 and Lvl3 walls cost the same planks and nails :cite[(`entity_wood_walllvl1.txt`, `entity_wood_walllvl2.txt`, `entity_wood_walllvl3.txt`)] and only the base health differs: 450, 550, 650. At Carpentry 6 a Lvl3 wall has 770, a Lvl2 wall would have 670.
- **Door tiers** have the same 300 per level; the higher tiers only need a higher level to build. A Carpentry 3 door is 900, a Carpentry 7 door is 2,100, a Carpentry 10 door is 3,000.
- **Metal doors:** `MetalDoorLvl1` and `MetalDoorLvl2` have the same level requirement (Welding 3) and the same health numbers in the scripts :cite[(`entity_metal_doorlvl1.txt`, `entity_metal_doorlvl2.txt`)]; the menu shows one below Welding 5 and the other from 5 up. :cite[(`CraftRecipe_BuildMenu.lua:368-392`)]
- **Sandbag wall** has no skill, so its level counts as 0 and its health is just the bonus (400 at Normal). Whether a recipe with no skill at all can be built without an error is not verified. :cite[(`ISBuildIsoEntity.lua:653-654`)]
- **Furniture** (tables, chairs, shelves, beds and bookcases) has no `health` and no `skillBaseHealth` in its script, so the default 20 per level applies: a table built at Carpentry 1 has 20 health, a crate built at Carpentry 7 has 140. Thirty-one wooden furniture recipes work this way, for example `Wood_TableLvl1`. :cite[(`media/scripts/generated/entities/furniture/entity_carpentry_table_lvl1.txt`)] The full list is the last table on this page.

## Every buildable object

The full list is one table grouped by category, with the same numbers as above plus the category.

| Recipe | Category | Skill | `health` | per level | `bonusHealth` | HP at needed level | HP at level 10 | Code |
|---|---|---|---|---|---|---|---|---|
| Coffin | - | Carpentry 4 | - | 20* | - | 80 | 200 | `furniture/entity_carpentry_coffin.txt:11-43` |
| Wood Lamp Pillar | - | Carpentry 1 | - | 300 | - | 300 | 3000 | `outdoors/entity_wood_lamppillar.txt:19-63` |
| Barricade Metal Bar | Barricades | Welding 3 | - | 20* | - | 60 | 200 | `barricades/entity_barricade_metalbar.txt:11-45` |
| Barricade Metal Sheet | Barricades | Welding 3 | - | 20* | - | 60 | 200 | `barricades/entity_barricade_metalsheet.txt:11-45` |
| Barricade Planks | Barricades | Carpentry 0 | - | 20* | - | 0 | 200 | `barricades/entity_barricade_planks.txt:11-45` |
| Advanced Forge | Blacksmithing | - - | 150 | 50 | - | 150 | 650 | `blacksmith/workstations/entity_forge_iii.txt:15-37` |
| Blast Furnace | Blacksmithing | - - | 150 | 50 | - | 150 | 650 | `blacksmith/workstations/entity_furnace_iii.txt:15-27` |
| Charcoal Burner Dark Green Barrel | Blacksmithing | - - | 100 | 20 | - | 100 | 300 | `blacksmith/workstations/entity_charcoal_burner.txt:91-102` |
| Charcoal Burner Light Green Barrel | Blacksmithing | - - | 100 | 20 | - | 100 | 300 | `blacksmith/workstations/entity_charcoal_burner.txt:129-140` |
| Charcoal Burner Metal Drum | Blacksmithing | - - | 100 | 20 | - | 100 | 300 | `blacksmith/workstations/entity_charcoal_burner.txt:15-26` |
| Charcoal Burner Orange Barrel | Blacksmithing | - - | 100 | 20 | - | 100 | 300 | `blacksmith/workstations/entity_charcoal_burner.txt:53-64` |
| Charcoal Pit | Blacksmithing | - - | 100 | 20 | - | 100 | 300 | `blacksmith/workstations/entity_charcoal_pit.txt:15-27` |
| Dome Kiln | Blacksmithing | - - | 200 | 50 | - | 200 | 700 | `blacksmith/workstations/entity_dome_kiln.txt:15-35` |
| Forge | Blacksmithing | - - | 150 | 50 | - | 150 | 650 | `blacksmith/workstations/entity_forge_ii.txt:15-35` |
| Forge Primitive Forge | Blacksmithing | - - | 150 | 50 | - | 150 | 650 | `blacksmith/workstations/entity_forge_i.txt:15-34` |
| Grindstone | Blacksmithing | - - | - | 20* | - | 0 | 200 | `blacksmith/workstations/entity_grindstone.txt:15-45` |
| Primitive Furnace | Blacksmithing | - - | 150 | 50 | - | 150 | 650 | `blacksmith/workstations/entity_furnace_i.txt:15-33` |
| Smelting Furnace | Blacksmithing | - - | 150 | 50 | - | 150 | 650 | `blacksmith/workstations/entity_furnace_ii.txt:15-33` |
| Double Door | Carpentry | Carpentry 4 | - | 300 | - | 1200 | 3000 | `walls/entity_wood_doubledoor.txt:11-34` |
| Log Door Frame Lvl1 | Carpentry | Carpentry 0 | 500 | 50 | - | 500 | 1000 | `walls/entity_log_doorframelvl1.txt:11-32` |
| Log Fence | Carpentry | Carpentry 0 | 200 | 50 | - | 200 | 700 | `fences_low/entity_logfence.txt:11-31` |
| Log Gate | Carpentry | Carpentry 0 | - | 300 | - | 0 | 3000 | `fences_low/entity_logfenceopen.txt:11-32` |
| Log Wall | Carpentry | Carpentry 0 | 500 | 50 | - | 500 | 1000 | `walls/entity_logwall.txt:11-31` |
| Log Window Frame Lvl1 | Carpentry | Carpentry 0 | 500 | 50 | - | 500 | 1000 | `walls/entity_log_windowframelvl1.txt:11-30` |
| Log Stairs | Carpentry | Carpentry 3 | 150 | 50 | - | 300 | 650 | `stairs/entity_log_stairs.txt:11-33` |
| Stick Fence | Carpentry | Carpentry 0 | 200 | 50 | - | 200 | 700 | `fences_low/entity_stickfence.txt:11-31` |
| Wood Door Frame Lvl1 | Carpentry | Carpentry 2 | - | 300 | - | 600 | 3000 | `walls/entity_wood_doorframelvl1.txt:11-32` |
| Wood Door Frame Lvl2 | Carpentry | Carpentry 4 | - | 300 | - | 1200 | 3000 | `walls/entity_wood_doorframelvl2.txt:11-32` |
| Wood Door Frame Lvl3 | Carpentry | Carpentry 6 | - | 300 | - | 1800 | 3000 | `walls/entity_wood_doorframelvl3.txt:11-32` |
| Wood Fence Gate | Carpentry | Carpentry 3 | - | 300 | - | 900 | 3000 | `walls/entity_wood_fencegate.txt:11-45` |
| Wood Fence Lvl1 | Carpentry | Carpentry 3 | 250 | 20 | - | 310 | 450 | `walls/entity_wood_fencelvl1.txt:11-31` |
| Wood Fence Lvl2 | Carpentry | Carpentry 5 | 350 | 20 | - | 450 | 550 | `walls/entity_wood_fencelvl2.txt:11-31` |
| Wood Fence Lvl3 | Carpentry | Carpentry 7 | 450 | 20 | - | 590 | 650 | `walls/entity_wood_fencelvl3.txt:11-31` |
| Wood Floor Lvl1 | Carpentry | Carpentry 1 | - | 20* | - | 20 | 200 | `walls/entity_wood_floorlvl1.txt:11-23` |
| Wood Floor Lvl2 | Carpentry | Carpentry 2 | - | 20* | - | 40 | 200 | `walls/entity_wood_floorlvl2.txt:11-23` |
| Wood Floor Lvl3 | Carpentry | Carpentry 4 | - | 20* | - | 80 | 200 | `walls/entity_wood_floorlvl3.txt:11-23` |
| Wood Stairs | Carpentry | Carpentry 6 | 150 | 50 | - | 450 | 650 | `stairs/entity_carpentry_stairs.txt:11-33` |
| Wooden Door Lvl1 | Carpentry | Carpentry 3 | - | 300 | - | 900 | 3000 | `walls/entity_woodendoorlvl1.txt:11-43` |
| Wooden Door Lvl2 | Carpentry | Carpentry 5 | - | 300 | - | 1500 | 3000 | `walls/entity_woodendoorlvl2.txt:11-43` |
| Wooden Door Lvl3 | Carpentry | Carpentry 7 | - | 300 | - | 2100 | 3000 | `walls/entity_woodendoorlvl3.txt:11-43` |
| Wooden Pole | Carpentry | Carpentry 2 | 50 | 20* | - | 90 | 250 | `walls/entity_woodenpole.txt:11-22` |
| Wooden Wall Frame | Carpentry | Carpentry 2 | 50 | 20 | - | 90 | 250 | `walls/entity_woodenwallframe.txt:11-31` |
| Wooden Wall Lvl1 | Carpentry | Carpentry 2 | 450 | 20 | - | 490 | 650 | `walls/entity_wood_walllvl1.txt:11-34` |
| Wooden Wall Lvl2 | Carpentry | Carpentry 4 | 550 | 20 | - | 630 | 750 | `walls/entity_wood_walllvl2.txt:11-34` |
| Wooden Wall Lvl3 | Carpentry | Carpentry 6 | 650 | 20 | - | 770 | 850 | `walls/entity_wood_walllvl3.txt:11-34` |
| Wooden Window Frame Lvl1 | Carpentry | Carpentry 2 | 450 | 20 | - | 490 | 650 | `walls/entity_wood_windowframelvl1.txt:11-31` |
| Wooden Window Frame Lvl2 | Carpentry | Carpentry 4 | 550 | 20 | - | 630 | 750 | `walls/entity_wood_windowframelvl2.txt:11-31` |
| Wooden Window Frame Lvl3 | Carpentry | Carpentry 6 | 650 | 20 | - | 770 | 850 | `walls/entity_wood_windowframelvl3.txt:11-32` |
| Piano | Debug | - - | - | 20* | - | 0 | 200 | `admin/entity_piano.txt:5-37` |
| Butcher Hook | Farming | Carpentry 3 | - | 20* | - | 60 | 200 | `animals/workstations/entity_butcher_hook.txt:19-30` |
| Chicken Hutch | Farming | Carpentry 3 | - | 20* | - | 60 | 200 | `animals/workstations/entity_chickenhutch.txt:11-22` |
| Chicken Hutch2 | Farming | Carpentry 3 | - | 20* | - | 60 | 200 | `animals/workstations/entity_chickenhutch.txt:48-59` |
| Churn Bucket | Farming | Carpentry 0 | - | 20* | - | 0 | 200 | `animals/workstations/entity_butter_churn.txt:15-25` |
| Composter | Farming | Carpentry 6 | - | 20* | - | 120 | 200 | `outdoors/entity_composter.txt:11-21` |
| Composter Shoddy | Farming | Carpentry 3 | - | 20* | - | 60 | 200 | `outdoors/entity_composter.txt:48-58` |
| Drying Rack Large | Farming | - - | 100 | 20 | - | 100 | 300 | `animals/workstations/entity_leather_prep.txt:141-161` |
| Drying Rack Medium | Farming | - - | 100 | 20 | - | 100 | 300 | `animals/workstations/entity_leather_prep.txt:515-534` |
| Drying Rack Small | Farming | Carpentry 1 | 100 | 20 | - | 120 | 300 | `animals/workstations/entity_leather_prep.txt:873-891` |
| Drying Rack | Farming | Carpentry 1 | 100 | 20 | - | 120 | 300 | `agricultural/workstations/entity_Drying_Rack.txt:30-50` |
| Feeding Trough Double | Farming | Carpentry 3 | - | 20* | - | 60 | 200 | `animals/workstations/entity_feedingtrough.txt:56-74` |
| Feeding Trough Double Metal | Farming | Welding 3 | - | 20* | - | 60 | 200 | `animals/workstations/entity_feedingtrough.txt:11-29` |
| Feeding Trough Simple | Farming | Carpentry 1 | - | 20* | - | 20 | 200 | `animals/workstations/entity_feedingtrough.txt:100-117` |
| Heckle Comb | Farming | Carpentry 3 | - | 20* | - | 60 | 200 | `agricultural/workstations/entity_heckle_comb.txt:15-33` |
| Herb Drying Rack | Farming | Carpentry 1 | 100 | 20 | - | 120 | 300 | `agricultural/workstations/entity_Herb_Drying_Rack.txt:30-49` |
| Ripple Comb | Farming | Carpentry 3 | - | 20* | - | 60 | 200 | `agricultural/workstations/entity_ripple_comb.txt:15-32` |
| Scutching Board | Farming | Carpentry 2 | - | 20* | - | 40 | 200 | `agricultural/workstations/entity_scutching_board.txt:15-32` |
| Simple Loom | Farming | Carpentry 3 | - | 20* | - | 60 | 200 | `agricultural/workstations/entity_simple_loom.txt:15-32` |
| Simple Drying Rack | Farming | Carpentry 0 | 100 | 20 | - | 100 | 300 | `agricultural/workstations/entity_Drying_Rack.txt:527-547` |
| Simple Herb Drying Rack | Farming | Carpentry 0 | 100 | 20 | - | 100 | 300 | `agricultural/workstations/entity_Herb_Drying_Rack.txt:563-582` |
| Softening Beam | Farming | Carpentry 0 | - | 20* | - | 0 | 200 | `animals/workstations/entity_leather_prep.txt:15-32` |
| Spinning Wheel | Farming | Carpentry 5 | - | 20* | - | 100 | 200 | `animals/workstations/entity_spinning_wheel.txt:15-45` |
| Stone Mill | Farming | Masonry 1 | - | 20* | - | 20 | 200 | `agricultural/workstations/entity_stone_mill.txt:15-24` |
| Stone Quern | Farming | Masonry 1 | - | 20* | - | 20 | 200 | `agricultural/workstations/entity_stone_quern.txt:15-25` |
| Tannin Barrel | Farming | Carpentry 0 | - | 20* | - | 0 | 200 | `animals/workstations/entity_leather_prep.txt:61-71` |
| Log Bench | Furniture | - - | 100 | 20 | - | 100 | 300 | `furniture/entity_log_bench.txt:11-30` |
| Log Stool | Furniture | - - | - | 20* | - | 0 | 200 | `furniture/entity_log_stool.txt:11-28` |
| Log Table | Furniture | - - | 100 | 20 | - | 100 | 300 | `furniture/entity_log_table.txt:11-30` |
| Metal Counter Corner Lvl1 | Furniture | Welding 3 | - | 20* | - | 60 | 200 | `furniture/entity_welding_countercorner_lvl1.txt:11-42` |
| Metal Counter Corner Lvl2 | Furniture | Welding 8 | - | 20* | - | 160 | 200 | `furniture/entity_welding_countercorner_lvl2.txt:11-42` |
| Metal Counter Lvl1 | Furniture | Welding 3 | - | 20* | - | 60 | 200 | `furniture/entity_welding_counter_lvl1.txt:11-41` |
| Metal Counter Lvl2 | Furniture | Welding 8 | - | 20* | - | 160 | 200 | `furniture/entity_welding_counter_lvl2.txt:11-41` |
| Metal Crate Lvl1 | Furniture | Welding 3 | - | 20* | - | 60 | 200 | `furniture/entity_welding_crate_lvl1.txt:11-42` |
| Metal Crate Lvl2 | Furniture | Welding 7 | - | 20* | - | 140 | 200 | `furniture/entity_welding_crate_lvl2.txt:11-21` |
| Metal Locker Big Lvl1 | Furniture | Welding 3 | - | 20* | - | 60 | 200 | `furniture/entity_welding_lockerbig_lvl1.txt:11-42` |
| Metal Locker Big Lvl2 | Furniture | Welding 10 | - | 20* | - | 200 | 200 | `furniture/entity_welding_lockerbig_lvl2.txt:11-42` |
| Metal Locker Small Lvl1 | Furniture | Welding 5 | - | 20* | - | 100 | 200 | `furniture/entity_welding_lockersmall_lvl1.txt:11-42` |
| Metal Locker Small Lvl2 | Furniture | Welding 9 | - | 20* | - | 180 | 200 | `furniture/entity_welding_lockersmall_lvl2.txt:11-42` |
| Metal Shelves Lvl1 | Furniture | Welding 3 | - | 20* | - | 60 | 200 | `furniture/entity_welding_shelves_lvl1.txt:11-42` |
| Metal Shelves Lvl2 | Furniture | Welding 9 | - | 20* | - | 180 | 200 | `furniture/entity_welding_shelves_lvl2.txt:11-42` |
| Other Log Stool | Furniture | - - | - | 20* | - | 0 | 200 | `furniture/entity_other_log_stool.txt:11-21` |
| Rugged Stool | Furniture | Carpentry 1 | - | 20* | - | 20 | 200 | `furniture/entity_rugged_stool.txt:11-27` |
| Rugged Table | Furniture | Carpentry 1 | - | 20* | - | 20 | 200 | `furniture/entity_rugged_table.txt:11-28` |
| Stick Bookcase | Furniture | Carpentry 0 | 100 | 20 | - | 100 | 300 | `furniture/entity_rugged_bookcase.txt:11-43` |
| Stick Bookcase Small Lvl1 | Furniture | Carpentry 0 | - | 20* | - | 0 | 200 | `furniture/entity_rugged_bookcasesmall.txt:11-41` |
| Wood Bar Element Corner Lvl1 | Furniture | Carpentry 3 | - | 20* | - | 60 | 200 | `furniture/entity_carpentry_barelementcorner_lvl1.txt:11-42` |
| Wood Bar Element Corner Lvl2 | Furniture | Carpentry 5 | - | 20* | - | 100 | 200 | `furniture/entity_carpentry_barelementcorner_lvl2.txt:11-42` |
| Wood Bar Element Corner Lvl3 | Furniture | Carpentry 7 | - | 20* | - | 140 | 200 | `furniture/entity_carpentry_barelementcorner_lvl3.txt:11-42` |
| Wood Bar Element Lvl1 | Furniture | Carpentry 3 | - | 20* | - | 60 | 200 | `furniture/entity_carpentry_barelement_lvl1.txt:11-42` |
| Wood Bar Element Lvl2 | Furniture | Carpentry 5 | - | 20* | - | 100 | 200 | `furniture/entity_carpentry_barelement_lvl2.txt:11-42` |
| Wood Bar Element Lvl3 | Furniture | Carpentry 7 | - | 20* | - | 140 | 200 | `furniture/entity_carpentry_barelement_lvl3.txt:11-42` |
| Wood Bed | Furniture | Carpentry 4 | - | 20* | - | 80 | 200 | `furniture/entity_carpentry_bed.txt:11-28` |
| Wood Bookcase Small Lvl1 | Furniture | Carpentry 3 | - | 20* | - | 60 | 200 | `furniture/entity_carpentry_bookcasesmall_lvl1.txt:11-41` |
| Wood Bookcase Small Lvl2 | Furniture | Carpentry 5 | - | 20* | - | 100 | 200 | `furniture/entity_carpentry_bookcasesmall_lvl2.txt:11-41` |
| Wood Bookcase Lvl1 | Furniture | Carpentry 3 | - | 20* | - | 60 | 200 | `furniture/entity_carpentry_bookcase_lvl1.txt:11-41` |
| Wood Bookcase Lvl2 | Furniture | Carpentry 5 | - | 20* | - | 100 | 200 | `furniture/entity_carpentry_bookcase_lvl2.txt:11-41` |
| Wood Chair Lvl1 | Furniture | Carpentry 1 | - | 20* | - | 20 | 200 | `furniture/entity_carpentry_chair_lvl1.txt:11-41` |
| Wood Chair Lvl2 | Furniture | Carpentry 3 | - | 20* | - | 60 | 200 | `furniture/entity_carpentry_chair_lvl2.txt:11-41` |
| Wood Chair Lvl3 | Furniture | Carpentry 6 | - | 20* | - | 120 | 200 | `furniture/entity_carpentry_chair_lvl3.txt:11-41` |
| Wood Crate Lvl1 | Furniture | Carpentry 3 | - | 20* | - | 60 | 200 | `furniture/entity_carpentry_crate_lvl1.txt:11-21` |
| Wood Crate Lvl2 | Furniture | Carpentry 7 | - | 20* | - | 140 | 200 | `furniture/entity_carpentry_crate_lvl2.txt:11-21` |
| Wood Shelves Double Lvl1 | Furniture | Carpentry 2 | - | 20* | - | 40 | 200 | `furniture/entity_carpentry_shelvesdouble_lvl1.txt:11-42` |
| Wood Shelves Lvl1 | Furniture | Carpentry 2 | - | 20* | - | 40 | 200 | `furniture/entity_carpentry_shelves_lvl1.txt:11-42` |
| Wood Shelves Lvl2 | Furniture | Carpentry 5 | - | 20* | - | 100 | 200 | `furniture/entity_carpentry_shelves_lvl2.txt:11-42` |
| Wood Table Drawer Lvl1 | Furniture | Carpentry 2 | - | 20* | - | 40 | 200 | `furniture/entity_carpentry_tabledrawer_lvl1.txt:11-41` |
| Wood Table Drawer Lvl2 | Furniture | Carpentry 4 | - | 20* | - | 80 | 200 | `furniture/entity_carpentry_tabledrawer_lvl2.txt:11-41` |
| Wood Table Drawer Lvl3 | Furniture | Carpentry 6 | - | 20* | - | 120 | 200 | `furniture/entity_carpentry_tabledrawer_lvl3.txt:11-41` |
| Wood Table Lvl1 | Furniture | Carpentry 1 | - | 20* | - | 20 | 200 | `furniture/entity_carpentry_table_lvl1.txt:11-28` |
| Wood Table Lvl2 | Furniture | Carpentry 3 | - | 20* | - | 60 | 200 | `furniture/entity_carpentry_table_lvl2.txt:11-28` |
| Wood Table Lvl3 | Furniture | Carpentry 5 | - | 20* | - | 100 | 200 | `furniture/entity_carpentry_table_lvl3.txt:11-28` |
| Wood Table Small Lvl1 | Furniture | Carpentry 1 | - | 20* | - | 20 | 200 | `furniture/entity_carpentry_tablesmall_lvl1.txt:11-20` |
| Wood Table Small Lvl2 | Furniture | Carpentry 3 | - | 20* | - | 60 | 200 | `furniture/entity_carpentry_tablesmall_lvl2.txt:11-20` |
| Wood Table Small Lvl3 | Furniture | Carpentry 5 | - | 20* | - | 100 | 200 | `furniture/entity_carpentry_tablesmall_lvl3.txt:11-20` |
| Wooden Windows | Furniture | Carpentry 5 | - | 20* | - | 100 | 200 | `furniture/entity_wood_windowglass.txt:11-29` |
| Brick Door Frame Lvl1 | Masonry | Masonry 2 | - | 300 | - | 600 | 3000 | `walls/entity_brick_doorframelvl1.txt:11-32` |
| Brick Door Frame Lvl2 | Masonry | Masonry 5 | - | 300 | - | 1500 | 3000 | `walls/entity_brick_doorframelvl2.txt:11-32` |
| Brick Fence Lvl2 | Masonry | Masonry 5 | 400 | 50 | - | 650 | 900 | `walls/entity_brick_fencelvl2.txt:11-31` |
| Brick Floor Lvl1 | Masonry | Masonry 0 | - | 20* | - | 0 | 200 | `walls/entity_brick_floor.txt:11-23` |
| Brick Wall Lvl1 | Masonry | Masonry 2 | 500 | 70 | - | 640 | 1200 | `walls/entity_brick_walllvl1.txt:11-32` |
| Brick Wall Lvl2 | Masonry | Masonry 5 | 800 | 70 | - | 1150 | 1500 | `walls/entity_brick_walllvl2.txt:11-32` |
| Brick Window Frame Lvl1 | Masonry | Masonry 2 | - | 300 | 400 | 1000 | 3400 | `walls/entity_brick_windowframelvl1.txt:11-31` |
| Brick Window Frame Lvl2 | Masonry | Masonry 5 | - | 300 | 400 | 1900 | 3400 | `walls/entity_brick_windowframelvl2.txt:11-31` |
| Cooking Pit | Masonry | Masonry 2 | - | 20* | - | 40 | 200 | `agricultural/workstations/entity_cooking_pit.txt:11-21` |
| Simple Cooking Pit | Masonry | Masonry 1 | - | 20* | - | 20 | 200 | `agricultural/workstations/entity_simple_cooking_pit.txt:11-21` |
| Stone Door Frame | Masonry | Masonry 2 | - | 300 | - | 600 | 3000 | `walls/entity_stone_doorframe.txt:11-32` |
| Stone Wall | Masonry | Masonry 2 | - | 400 | - | 800 | 4000 | `walls/entity_stone_wall.txt:11-31` |
| Stone Window Frame | Masonry | Masonry 2 | - | 300 | 400 | 1000 | 3400 | `walls/entity_stone_windowframe.txt:11-31` |
| Stone Cabinet | Masonry | Masonry 0 | 100 | 20 | - | 100 | 300 | `furniture/entity_stone_cabinet.txt:11-43` |
| Rugged Cross | Miscellaneous | Carpentry 0 | - | 300 | - | 0 | 3000 | `outdoors/entity_rugged_cross.txt:11-43` |
| Skull Pole Antlers | Miscellaneous | - - | 50 | 10 | - | 50 | 150 | `outdoors/entity_skull_poleantlers.txt:11-29` |
| Skull Pole Bull | Miscellaneous | - - | 50 | 10 | - | 50 | 150 | `outdoors/entity_skull_polebull.txt:11-43` |
| Skull Pole Cow | Miscellaneous | - - | 50 | 10 | - | 50 | 150 | `outdoors/entity_skull_polecow.txt:11-43` |
| Skull Pole Deer | Miscellaneous | - - | 50 | 10 | - | 50 | 150 | `outdoors/entity_skull_poledeer.txt:11-43` |
| Skull Pole Deer Doe | Miscellaneous | - - | 50 | 10 | - | 50 | 150 | `outdoors/entity_skull_poleDeerDoe.txt:11-43` |
| Skull Pole Pig | Miscellaneous | - - | 50 | 10 | - | 50 | 150 | `outdoors/entity_skull_polepig.txt:11-43` |
| Skull Pole Sheep | Miscellaneous | - - | 50 | 10 | - | 50 | 150 | `outdoors/entity_skull_polesheep.txt:11-43` |
| Stone Cairn | Miscellaneous | - - | 150 | 50 | - | 150 | 650 | `outdoors/entity_stone_cairn.txt:11-22` |
| Wood Cross | Miscellaneous | Carpentry 0 | - | 300 | - | 0 | 3000 | `outdoors/entity_wood_cross.txt:11-43` |
| Wood Picket | Miscellaneous | Carpentry 0 | - | 20* | - | 0 | 200 | `outdoors/entity_wood_picket.txt:11-21` |
| Wood Sign | Miscellaneous | Carpentry 1 | - | 300 | - | 300 | 3000 | `outdoors/entity_wood_sign.txt:11-28` |
| Barbed Wire Fence | Outdoors | Carpentry 5 | 100 | 20 | - | 200 | 300 | `walls/entity_wood_fencebarbedwirelvl1.txt:11-30` |
| Campfire | Outdoors | - - | - | 20* | - | 0 | 200 | `outdoors/entity_campfire.txt:11-23` |
| Chopping Block | Outdoors | Carpentry 1 | - | 20* | - | 20 | 200 | `outdoors/entity_chopping_block.txt:15-24` |
| Dirt Floor | Outdoors | - - | - | 20* | - | 0 | 200 | `walls/entity_floor_dirt.txt:11-23` |
| Gravel Floor | Outdoors | - - | - | 20* | - | 0 | 200 | `walls/entity_floor_gravel.txt:11-23` |
| Lean To Shelter | Outdoors | - - | - | 20* | - | 0 | 200 | `outdoors/entity_leanto_shelter.txt:11-44` |
| Leather Shelter | Outdoors | - - | - | 20* | - | 0 | 200 | `outdoors/entity_leather_shelter.txt:11-44` |
| Rain Collector | Outdoors | Carpentry 3 | - | 20* | - | 60 | 200 | `outdoors/entity_raincollector.txt:19-28` |
| Rain Collector Round | Outdoors | Carpentry 5 | - | 20* | - | 100 | 200 | `outdoors/entity_raincollector.txt:74-83` |
| Rain Collector Round Tarp | Outdoors | Carpentry 5 | - | 20* | - | 100 | 200 | `outdoors/entity_raincollector_tarp.txt:74-83` |
| Rain Collector Tarp | Outdoors | Carpentry 3 | - | 20* | - | 60 | 200 | `outdoors/entity_raincollector_tarp.txt:19-28` |
| Sand Floor | Outdoors | - - | - | 20* | - | 0 | 200 | `walls/entity_floor_sand.txt:11-23` |
| Sandbag Wall | Outdoors | - - | - | 300 | 400 | 400 | 3400 | `outdoors/entity_sandbagwall.txt:11-43` |
| Tarp Shelter | Outdoors | - - | - | 20* | - | 0 | 200 | `outdoors/entity_tarp_shelter.txt:11-44` |
| Wood Stake | Outdoors | Carpentry 0 | - | 20* | - | 0 | 200 | `outdoors/entity_wood_stake.txt:11-21` |
| Amphora | Pottery | - - | 100 | 20 | - | 100 | 300 | `outdoors/entity_amphora.txt:27-45` |
| Hand Press | Pottery | - - | 100 | 20 | - | 100 | 300 | `pottery/workstations/entity_hand_press.txt:15-33` |
| Kiln Large | Pottery | - - | 200 | 50 | - | 200 | 700 | `pottery/workstations/entity_kiln_large.txt:15-34` |
| Kiln Small | Pottery | - - | 150 | 50 | - | 150 | 650 | `pottery/workstations/entity_kiln_small.txt:15-33` |
| Pottery Bench | Pottery | Carpentry 5 | - | 20* | - | 100 | 200 | `pottery/workstations/entity_pottery_bench.txt:15-32` |
| Pottery Wheel | Pottery | - - | 100 | 20 | - | 100 | 300 | `pottery/workstations/entity_pottery_wheel.txt:15-34` |
| Barrel Oven | Welding | Welding 5 | - | 20* | - | 100 | 200 | `furniture/entity_welding_barreloven.txt:11-42` |
| Double Fence Gate | Welding | Welding 5 | - | 300 | - | 1500 | 3000 | `walls/entity_metal_doublepolegate.txt:11-34` |
| Double Wire Gate | Welding | Welding 5 | - | 300 | - | 1500 | 3000 | `walls/entity_metal_doublewiregate.txt:11-34` |
| Metal Big Metal Fence | Welding | Welding 3 | 450 | 50 | - | 600 | 950 | `walls/entity_metal_bigmetalfence.txt:11-32` |
| Metal Big Wire Fence | Welding | Welding 3 | 400 | 50 | - | 550 | 900 | `walls/entity_metal_bigwirefence.txt:11-32` |
| Metal Door Frame Lvl1 | Welding | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_doorframelvl1.txt:11-32` |
| Metal Door Frame Lvl2 | Welding | Welding 5 | - | 300 | - | 1500 | 3000 | `walls/entity_metal_doorframelvl2.txt:11-32` |
| Metal Door Lvl1 | Welding | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_doorlvl1.txt:11-43` |
| Metal Door Lvl2 | Welding | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_doorlvl2.txt:11-43` |
| Metal Fence Lvl1 | Welding | Welding 3 | 250 | 20 | - | 310 | 450 | `walls/entity_metal_fencelvl1.txt:11-31` |
| Metal Fence Lvl2 | Welding | Welding 5 | 450 | 20 | - | 550 | 650 | `walls/entity_metal_fencelvl2.txt:11-31` |
| Metal Floor Lvl1 | Welding | Welding 0 | - | 20* | - | 0 | 200 | `walls/entity_metal_floorlvl1.txt:11-23` |
| Metal Pole Fence Gate | Welding | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_polefencegate.txt:11-45` |
| Metal Pole Fence Gate Small | Welding | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_polefencegatesmall.txt:11-45` |
| Metal Small Pole Fence | Welding | Welding 3 | 350 | 20 | - | 410 | 550 | `walls/entity_metal_smallpolefence.txt:11-32` |
| Metal Small Wire Fence | Welding | Welding 3 | 200 | 20 | - | 260 | 400 | `walls/entity_metal_smallwirefence.txt:11-32` |
| Metal Wall Frame | Welding | Welding 2 | 100 | 20 | - | 140 | 300 | `walls/entity_metal_wallframe.txt:11-31` |
| Metal Wall Lvl1 | Welding | Welding 3 | 700 | 20 | - | 760 | 900 | `walls/entity_metal_walllvl1.txt:11-33` |
| Metal Wall Lvl2 | Welding | Welding 5 | 800 | 20 | - | 900 | 1000 | `walls/entity_metal_walllvl2.txt:11-33` |
| Metal Window Frame Lvl1 | Welding | Welding 3 | - | 300 | 400 | 1300 | 3400 | `walls/entity_metal_windowframelvl1.txt:11-31` |
| Metal Window Frame Lvl2 | Welding | Welding 5 | - | 300 | 400 | 1900 | 3400 | `walls/entity_metal_windowframelvl2.txt:11-31` |
| Metal Wire Fence Gate | Welding | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_wirefencegate.txt:11-45` |
| Metal Wire Fence Gate Small | Welding | Welding 3 | - | 300 | - | 900 | 3000 | `walls/entity_metal_wirefencegatesmall.txt:11-45` |
| Metal Stairs | Welding | Welding 5 | 150 | 50 | - | 400 | 650 | `stairs/entity_welding_stairs.txt:11-33` |

## Where to go next

Start with the pages this table backs up.

- [Built objects, health and zombies](/pz/build-42/engine/building-and-moveables/built-objects-health-and-zombies), [How building works](/pz/build-42/engine/building-and-moveables/how-building-works) and [Building recipes by skill](/pz/build-42/engine/building-and-moveables/building-recipes-by-skill).
- [The numbers](/pz/build-42/engine/building-and-moveables/building-and-moveables-reference).

:::callout[How we know]{kind=proof}
Scripts and Lua. Each row is computed by script from the entity script named in its Code column, using the formula in the Lua build file. :cite[(`ISBuildIsoEntity.lua:666-677`)]

Not verified: whether a recipe with no skill at all (the sandbag wall) builds without error, because `getPerkLevel` is called with a null skill. :cite[(`ISBuildIsoEntity.lua:653-654`)] The health of anything built by an older legacy build class is also not confirmed (see the health page).
:::
