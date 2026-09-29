---
id: build-42-items-the-item-block-in-b42
slug: items-the-item-block-in-b42
title: 'Items: the item block in B42'
game: pz
version: build-42
section: modding
category: items-and-scripting
difficulty: intermediate
tags:
  - item-scripts
  - tags
  - workstation
  - tech-tiers
  - timedaction
excerpt: >-
  Real vanilla B42 item (from entities/blacksmith/items/items_blacksmith_i.txt)
  [CONFIRMED]:
last_updated: '2026-09-29'
related_articles:
  - the-big-picture
  - script-file-anatomy
  - tags
  - skills-xp-and-learning
  - the-workstation-entity-system
  - tech-tiers-and-production-chains
  - timedaction-blocks
  - overriding-patching-vanilla
  - testing-loop-and-common-load-errors
  - master-checklist
---
# Items: the `item` block in B42

> Source: 02_SCRIPTING_ITEMS_AND_CRAFTING.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

Real vanilla B42 item (from `entities/blacksmith/items/items_blacksmith_i.txt`) `[CONFIRMED]`:

```
item CrudeWoodenTongs
{
    DisplayName = Crude Wooden Tongs,
    DisplayCategory = Tool,
    Type = Normal,
    Weight = 1,
    Icon = TwigTongs,
    StaticModel = Tongs_Twine,
    WorldStaticModel = Tongs_Twine,
    Tags = CrudeTongs;BreakOnSmithing;Crude;IsFireFuel;IsFireTinder,
    BreakSound = PlankBreak,
    ConditionMax = 1,
    ConditionLowerChanceOneIn = 1,
    ToolTip = Tooltip_item_BreakOnSmithing,
    ResearchableRecipes = Forge_Tongs;Forge_Heading_Tool,
}
```

### Fields that matter in B42 (new / changed emphasis)

| Field | Notes | Flag |
|---|---|---|
| `Type` | `Normal`, `Food`, `Literature`, `Weapon`, `Clothing`, `Drainable`, etc. Still present. | CONFIRMED |
| `DisplayCategory` | Which tab/category the item shows under (e.g. `Tool`, `Material`, `SkillBook`, `WaterContainer`). Heavily used in B42. | CONFIRMED |
| `Tags` | Semicolon-separated tag list. **This is the single most important field in B42** because recipes match on tags. | CONFIRMED |
| `StaticModel` / `WorldStaticModel` | B42 pushes 3D models. `WorldStaticModel` = the on-ground model; `StaticModel` = in-hand/equipped. B41's `WorldObjectSprite` is legacy. | CONFIRMED **[BREAKING-ish]** |
| `Icon` | Still the inventory icon. | CONFIRMED |
| `TeachedRecipes` | (on Literature items) semicolon list of `craftRecipe` IDs this magazine teaches. | CONFIRMED |
| `ResearchableRecipes` | semicolon list of recipe IDs the player can *learn by researching/disassembling this item*. | CONFIRMED |
| `SkillTrained` / `LvlSkillTrained` / `NumLevelsTrained` / `NumberOfPages` | Skill-book fields (train a skill over a level band). | CONFIRMED |
| `component FluidContainer { ... }` | NEW: makes the item hold fluids (see section 12). | CONFIRMED **[NEW]** |
| `EatType` / `PourType` | Animation/interaction variant keys used with fluids & food. | CONFIRMED |
| `IconFluidMask` | Mask overlay so the icon shows the fluid level/color. | CONFIRMED |
| `ItemWhenDry` / `Wet` / `WetCooldown` | Wet/dry item state transitions (seen on crafted tools). | CONFIRMED |
| `ConditionMax` / `ConditionLowerChanceOneIn` | Durability. `ConditionMax = 1` = one-use/fragile. | CONFIRMED |
| `RequiresEquippedBothHands` | Heavy items (ore, blooms) need both hands. | CONFIRMED |

**[BREAKING]** Note what is *gone or moved* from B41 item scripts: the old per-item `Recipes = ...` property (which auto-taught a recipe on pickup) is largely replaced by the learning system (`TeachedRecipes`/`ResearchableRecipes`/`AutoLearn`). The B41 recipe menu was flat and item-driven; B42 items participate in crafting almost entirely through **tags**.

A "material" item is trivial (from `items_blacksmith_i.txt`) `[CONFIRMED]`:

```
item IronOre
{
    DisplayName = Iron Ore,
    DisplayCategory = Material,
    Type = Normal,
    Weight = 40,
    Icon = IronORe,
    StaticModel = IronOre,
    WorldStaticModel = IronOre,
    Tags = HasMetal;HeavyItem;IronOre;IronSource,
    RequiresEquippedBothHands = TRUE,
}
```
