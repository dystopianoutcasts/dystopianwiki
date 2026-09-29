---
id: build-42-new-clothing
slug: new-clothing
title: New clothing
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
excerpt: >-
  What you build: a wearable clothing item bound to a body location, plus (for a
  fully custom garment) a model + clothing.xml entry.
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
  - new-food
  - new-weapon
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
# New clothing

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a wearable clothing item bound to a body location, plus (for a fully custom garment) a model + `clothing.xml` entry.

**Files + placement:** item script in `42/media/scripts/`; a `model` script (sec on models below); a mesh `.fbx`/`.glb` under `common/media/models_X/` + `.png` texture under `media/textures/`; a `clothing.xml` entry; custom body locations declared in registries.lua.

**Skeleton -- item.**

```
module yourModule
{
    item HatCustom
    {
        ItemType     = base:clothing,
        Weight       = 0.2,
        Icon         = HatCustom,
        BodyLocation = Hat,             -- a valid BodyLocation value (or a custom one, see below)
        ClothingItem = Hat_Custom,      -- must match an entry in clothing.xml
        CanHaveHoles = FALSE,
    }
}
```

**Key fields** (field names CONFIRMED from `item.txt`):

| Field | Meaning | Tag |
|-------|---------|-----|
| `BodyLocation` | Body slot the item occupies; must be a valid BodyLocation value. | field CONFIRMED / definition documented |
| `ClothingItem` | References the garment defined in `clothing.xml` (model/texture). | CONFIRMED |
| `ClothingItemExtra` / `ClothingItemExtraOption` / `ClothingExtraSubmenu` | Extra equip options + context-menu label. | CONFIRMED |
| `CanHaveHoles` | Whether it can develop holes (default True). | CONFIRMED |
| `Insulation` / `WindResistance` / `WaterResistance` | Thermal/weather protection. | field CONFIRMED / meaning LIKELY |
| `FabricType` | Fabric (Cotton/Leather/Denim) for repair/protection. | field CONFIRMED / meaning LIKELY |
| `WeightWet` | Weight when wet (interpolated with `Weight`). | CONFIRMED |
| `Bite/Scratch/BulletDefense`, `NeckProtectionModifier`, `RunSpeedModifier`, `CombatSpeedModifier` | Protection / mobility modifiers. | CONFIRMED |

**Body Location system.** `BodyLocation` = which part of the body the item occupies. The authoritative vanilla list lives in `media/lua/shared/NPCs/BodyLocations.lua`; each location has a value (used in scripts), a Lua constant, Exclusive locations (can't be worn together), and Hidden locations (models hidden when equipped). [CONFIRMED -- `Body_Location.wiki.txt` v42.17.0]

Vanilla values (subset): `Hat FullHat Mask MaskEyes Eyes Ears Neck Necklace Scarf Shirt Tshirt ShortSleeveShirt Sweater Jacket Jacket_Bulky TankTop Dress Torso1 TorsoExtra TorsoExtraVest Belt Pants Skirt ShortPants Legs1 Shoes Socks Hands HandsLeft HandsRight Back Webbing Underwear UnderwearTop UnderwearBottom` (full ~130-value list in the wiki file).

**Adding a CUSTOM body location.** The `item.txt` schema for `BodyLocation` states verbatim: *"Needs to be a valid BodyLocation value. You can also create new ones via registries."* So in B42 you register a custom location with `ItemBodyLocation.register("mymod:MyLocation")` in registries.lua (one of the 11 registry types, sec 1), then use that string as the `BodyLocation` value. [mechanism CONFIRMED -- item.txt + registries list] The exact Exclusive/Hidden wiring for a registered location (the old B41 `BodyLocations.lua` `setExclusive`/`setHidden` pattern) is **not spelled out in the cached files** -- UNCERTAIN; verify against a live `BodyLocations.lua` / registries docs.

**Model note (for a full custom garment).** Point `ClothingItem` at a `clothing.xml` entry that references a `model` script:

```
module yourModule
{
    model HatCustomModel
    {
        mesh    = mymod/hat_custom,       -- media/models_X/mymod/hat_custom.fbx (no extension)
        texture = mymod/hat_custom_tex,   -- media/textures/mymod/hat_custom_tex.png (no extension)
        static  = false,                  -- clothing MUST NOT be static (must deform)
    }
}
```

`model` fields CONFIRMED (`model.txt`): `mesh` (`.fbx`/`.glb`, extension omitted, under `media/models_X/`), `texture` (`.png` only, omitted, under `media/textures/`), `scale`, `static` (clothing = false), `shader`, `cullFace`, `animationsMesh`, `attachment` child block.

**Gotchas.** Clothing must be `static = false` or it won't deform with the body. A full garment additionally needs a `clothing.xml` entry and body **mask IDs**, authored on the **Nik rig** -- the cached `Creating_a_clothing_mod.wiki.txt` is a stub that only links these resources; the `clothing.xml` field schema, Nik-rig bone list, and mask-ID table are **NOT in the cache** (GAP -- pull separately). Hair mods follow the same asset pattern (`Creating_a_hair_mod.wiki.txt`).

**Deep reference:** `_raw_scriptsdocs/item.txt` (clothing fields), `_raw_scriptsdocs/model.txt`; `_raw_pzwiki_sources/08_creation_toolkit/Body_Location.wiki.txt`, `Creating_a_clothing_mod.wiki.txt`, `Creating_a_hair_mod.wiki.txt`, `Model_scripts.wiki.txt`; doc 02.

---

<a name="6-new-craftrecipe"></a>
