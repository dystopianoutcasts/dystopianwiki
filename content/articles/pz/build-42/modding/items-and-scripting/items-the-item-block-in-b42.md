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
  A real vanilla Build 42 item, from media/scripts/generated/items/normal.txt,
  and why Build 42 writes ItemType = base:normal where Build 41 wrote
  Type = Normal.
last_updated: '2026-10-04'
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

A real vanilla Build 42 item, from `media/scripts/generated/items/normal.txt`:

```
item CrudeWoodenTongs
{
    DisplayCategory = Tool,
    ItemType = base:normal,
    Weight = 1.0,
    Icon = TwigTongs,
    StaticModel = Tongs_Twine,
    WorldStaticModel = Tongs_Twine,
    Tags = base:crudetongs;base:breakonsmithing;base:crude;base:isfirefuel;base:isfiretinder,
    BreakSound = PlankBreak,
    ConditionMax = 1,
    ConditionLowerChanceOneIn = 1,
    Tooltip = Tooltip_item_BreakOnSmithing,
    Researchablerecipes = Forge_Tongs;Forge_Heading_Tool,
}
```

Note `ItemType = base:normal`. Build 42 does **not** use B41's `Type = Normal`:
the installed game has 1,099 items with `ItemType = base:normal`, all in
`generated/items/normal.txt`, and not one `Type = Normal` anywhere in its
scripts. The item parser reads `ItemType` and has no `Type` key, so an item
written with `Type = Normal` registers but gets no type. We learned this the
hard way: such an item can be looked up by name and still never be created.

> **Proof:** Code. `zombie.scripting.objects.Item#DoParam` (reads `ItemType`, no `Type` key), revision 4a0e9546ec; count of `ItemType = base:normal` and `Type = Normal` in `media/scripts` of the installed game. Build 42.21.0.

> **Proof:** Game test. Nineteen Outcast Motors items written with `Type = Normal` were found by `getScriptManager():getItem()`, but `InventoryItemFactory.CreateItem` returned nil for each. Build 42.20.

### Fields that matter in B42 (new / changed emphasis)

| Field | Notes | Flag |
|---|---|---|
| `ItemType` | `base:normal`, `base:food`, `base:literature`, `base:weapon`, `base:clothing`, `base:drainable`, etc. Replaces B41's `Type = Normal`, which Build 42 does not read. | Code (proof above) |
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

A "material" item is trivial (from `generated/items/normal.txt`):

```
item IronOre
{
    DisplayCategory = Material,
    ItemType = base:normal,
    Weight = 40.0,
    Icon = IronOre,
    StaticModel = IronOre,
    WorldStaticModel = IronOre,
    Tags = base:hasmetal;base:heavyitem;base:ironore;base:ironsource,
    RequiresEquippedBothHands = true,
}
```

---

*Corrected 2026-10-04: Build 42 items use ItemType = base:normal; B41's Type = Normal is not read, and the vanilla examples now quote a file that exists.*
