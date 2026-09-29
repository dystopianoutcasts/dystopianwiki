---
id: build-42-new-item
slug: new-item
title: New item
game: pz
version: build-42
section: modding
category: cookbook
difficulty: beginner
tags:
  - cookbook
  - mod-recipes
  - from-scratch
  - skeletons
excerpt: 'What you build: a plain inventory item (no food/weapon/clothing behavior).'
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-food
  - new-weapon
  - new-clothing
  - new-craftrecipe
  - new-workstation
  - new-fluid
  - item-repair
  - evolved-recipe
  - new-trait
  - new-profession
  - new-skill
  - new-animal
  - new-crop
  - lua-gameplay-mod
  - custom-ui
  - custom-moodle
  - sound-mod
  - radio-channel
  - translations
  - map-building-basement
  - vehicle-mod
  - workshop-verified-corrections
---
# New item

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a plain inventory item (no food/weapon/clothing behavior).

**Files + placement:** `42/media/scripts/items.txt`; icon PNG at `42/media/textures/Item_Foo.png`; display name in the translation file (sec 21).

**Skeleton.**

```
module yourModule
{
    item Foo
    {
        ItemType = base:normal,        -- CONFIRMED (item.txt): replaced legacy `Type` in 42.13
        Weight   = 1.0,
        Icon     = Foo,                -- media/textures/Item_Foo.png, referenced w/o Item_ prefix or .png
    }
}
```

Items are referenced by full type `yourModule.Foo`. A display name comes from a translation entry (`"yourModule.Foo": "Foo"` in `ItemName.json`) -- per the schema, **weight will not apply in-game without a display name**. [CONFIRMED -- module.txt, item.txt]

**Key fields** (all CONFIRMED as `item.txt` schema parameters; meaning tagged where the schema itself gives no description):

| Field | Meaning | Tag |
|-------|---------|-----|
| `ItemType` | Item class (Required). Allowed: `base:normal base:food base:weapon base:clothing base:container base:drainable base:key base:literature base:map base:moveable base:radio base:weaponpart base:animal base:alarmclock base:alarmclockclothing`. | CONFIRMED |
| `Weight` | Encumbrance (default 1.0); also drives stamina drain with `UseEndurance`. | CONFIRMED |
| `Icon` | Inventory icon file `media/textures/Item_<name>.png`. | CONFIRMED |
| `Tags` | `;`-separated property tags used by Lua/Java/craftRecipes (e.g. `Tags = base:egg;isseed`). Custom tags must be `ItemTag.register()`-ed in registries.lua. | CONFIRMED |
| `DisplayCategory` | Inventory sorting category (translated via `DisplayCategory_`). | field CONFIRMED / meaning LIKELY |
| `Count` / `CanStack` | Stack/spawn behavior. | field CONFIRMED / meaning LIKELY |
| `ColorRed/Green/Blue` | Item tint (default 255). | field CONFIRMED / meaning LIKELY |
| `MetalValue` | Metal-detector / scrap value. | field CONFIRMED / meaning LIKELY |

**Gotchas.** `Type` and inline `DisplayName` are **deprecated as of 42.13** -- use `ItemType` + a translation. Fields not in the schema are silently written to the item's ModData (bad practice -- the wiki flags this). Custom `Tags` need registration in registries.lua (sec 1).

**Deep reference:** `_raw_scriptsdocs/item.txt`, `_raw_scriptsdocs/module.txt`; `_raw_pzwiki_sources/08_creation_toolkit/Item_scripts.wiki.txt`; doc 02.

---

<a name="3-new-food"></a>
