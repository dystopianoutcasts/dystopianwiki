---
id: build-42-new-weapon
slug: new-weapon
title: New weapon
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
excerpt: 'What you build: a melee weapon or a firearm (ItemType = base:weapon).'
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
  - new-food
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
# New weapon

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** a melee weapon or a firearm (`ItemType = base:weapon`).

**Files + placement:** `42/media/scripts/items.txt`; icon + world sprite in `media/textures`; firearms also need an `AmmoType` (register custom ammo in registries.lua, sec 1).

**Skeleton -- melee.**

```
module yourModule
{
    item PipeWrench
    {
        ItemType     = base:weapon,
        Weight       = 2.0,
        Icon         = PipeWrench,
        Categories   = Blunt,          -- skill category (value LIKELY/convention)
        MinDamage    = 1.0,
        MaxDamage    = 2.0,
        Swingtime    = 1.0,
        MinRange     = 0.61,
        MaxRange     = 1.5,
        SwingAnim    = Bat,
        WeaponSprite = PipeWrench,
    }
}
```

**Melee key fields** (field names CONFIRMED from `item.txt`; where the schema gives no description the *value/meaning* is LIKELY from vanilla convention):

| Field | Meaning | Tag |
|-------|---------|-----|
| `MinDamage` / `MaxDamage` | Damage roll range (MaxDamage default 1.5). | CONFIRMED |
| `Swingtime` / `MinimumSwingtime` | Swing duration. | field CONFIRMED |
| `SwingAnim` | Swing animation (default `Rifle`; e.g. `Bat`, `Handgun`). | field CONFIRMED / value LIKELY |
| `MinRange` / `MaxRange` | Hard reach limits (MaxRange default 1.0). | CONFIRMED |
| `Categories` | Weapon skill category (`Blunt`, `Blade`, `Axe`, `Spear`...). | field CONFIRMED / value LIKELY |
| `WeaponSprite` | Held/world model sprite. | field CONFIRMED / value LIKELY |
| `TwoHandWeapon` / `RequiresEquippedBothHands` | Two-handed handling (1-hand use = x1.3 recoil penalty). | CONFIRMED |
| `MaxHitcount` | Max targets per swing (default 1000). | CONFIRMED |
| `UseEndurance` / `EnduranceMod` | Stamina cost. | CONFIRMED |
| `CritDmgMultiplier` / `CriticalChance` | Crit tuning. | CONFIRMED |
| `Sharpness` / `DoorDamage` / `TreeDamage` | Damage-behavior fields (B42 blade sharpness). | CONFIRMED |

**Firearm key fields** (all CONFIRMED `item.txt` schema params). Set `IsAimedFirearm = true` to enable the full firearm subsystem.

| Field | Meaning | Tag |
|-------|---------|-----|
| `IsAimedFirearm` | Enables ballistics/reticle/muzzle-flash. | CONFIRMED |
| `Ranged` | Marks item ranged for animation conditions. | CONFIRMED |
| `AmmoType` | Ammo consumed (e.g. `base:bullets_9mm`, `base:shotgun_shells`; custom via AmmoType.register). | CONFIRMED |
| `MagazineType` | Magazine item; omit to load rounds individually. | CONFIRMED |
| `MaxAmmo` / `AmmoBox` | Capacity / ammo box spawned. | CONFIRMED |
| `WeaponReloadType` | Reload workflow (`handgun`, `shotgun`, `boltaction`, `revolver`, `doublebarrelshotgun`...). | CONFIRMED |
| `FireMode` / `FireModePossibilities` | Default / available modes (`Single`, `Auto`; `/`-separated). | CONFIRMED |
| `JamGunChance` | Jam probability per pull (default 1.0). | CONFIRMED |
| `MinSightRange` / `MaxSightRange` | Optimal sight window. | CONFIRMED |
| `PiercingBullets` | Shot passes through targets. | CONFIRMED |
| `RecoilDelay` / `Aimingtime` / `HitChance` / `StopPower` / `Projectilecount` | Recoil / aim / hit / knockback / pellet tuning. | CONFIRMED |

**Gotchas.** Firearm ammo/magazine identifiers reference registry entries -- custom ammo must be `AmmoType.register()`-ed in registries.lua. B42 weapons gained separate Handle/Head condition + blade Sharpness (heads can fall off); some behavior detail still best read from vanilla scripts. `WeaponSprite`/`SwingAnim`/`Categories` values are convention, not enumerated in the schema.

**Deep reference:** `_raw_scriptsdocs/item.txt` (base:weapon section); doc 02, doc 07 (combat).

---

<a name="5-new-clothing--body-location"></a>
