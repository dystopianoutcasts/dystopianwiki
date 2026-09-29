---
id: build-42-translations
slug: translations
title: Translations and localization
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
excerpt: 'What you build: localized display names and UI text for your mod.'
last_updated: '2026-09-29'
related_articles:
  - project-skeleton
  - new-item
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
  - map-building-basement
  - vehicle-mod
  - workshop-verified-corrections
---
# Translations and localization

> Source: 08_MOD_CREATION_TOOLKIT.md (compiled 2026-07-29, verified against Project Zomboid 42.20). Imported 2026-09-29. Confidence tags in the text are the original author's.

**What you build:** localized display names and UI text for your mod.

> **MAJOR B42 CHANGE.** As of **Build 42.15.0**, translation files are **`.json`** and **must NOT carry the language code in the filename**, and **all languages use UTF-8**. The B41 form (`ItemName_EN.txt`, `Recipe_EN.txt`, `IG_UI_EN.txt`, `key=value`, mixed encodings) is legacy. In STABLE 42.20 use `ItemName.json`, `Recipes.json`, `IG_UI.json`, etc. [CONFIRMED -- `Translation.wiki.txt` v42.16.3] (Some track docs 01/05 still show the legacy `_EN.txt` form -- prefer the JSON form here.)

**Files + placement.** `42/media/lua/shared/Translate/<LANGUAGE CODE>/` -- one folder per language, each containing a `language.txt` plus the JSON files. [CONFIRMED]

```
media/lua/shared/Translate/
  EN/
    language.txt
    ItemName.json
    Recipes.json
    IG_UI.json
    UI.json
    Fluids.json
    Moodles.json
```

**Skeletons.**

```json
// ItemName.json  -- key = item full type
{ "yourModule.Foo": "Foo", "yourModule.CannedBeansOpen": "Open Canned Beans" }
```
```json
// IG_UI.json  -- IGUI_ prefixed keys, UTF-8
{ "IGUI_mymod_hello": "Hello ¼" }
```
```
// language.txt  (note trailing commas)
VERSION=1,
text=English,
charset=UTF-8,
```

**Translation types** (filename base `.json` / key prefix / retrieval fn) [CONFIRMED -- `Translation.wiki.txt`]:

| Type | File | Key prefix | Function |
|------|------|-----------|----------|
| Item names | `ItemName` | (key = item full type) | `getItemNameFromFullType` |
| Recipes | `Recipes` | (key = craftRecipe ID) | `getRecipeDisplayName` |
| IGUI | `IG_UI` | `IGUI_` | `getText` |
| UI | `UI` | `UI_` | `getText` |
| Tooltip | `Tooltip` | `Tooltip_` | `getText` |
| ContextMenu | `ContextMenu` | `ContextMenu_` | `getText` |
| Moodles | `Moodles` | `Moodles_` | `getText` |
| Sandbox | `Sandbox` | `Sandbox_` | `getText` |
| Entity | `Entity` | `EC_` | `getText` |
| Fluids | `Fluids` | `Fluid_Name_` | `getText` |
| Farming | `Farming` | `Farming_` | `getText` |
| Mod (mod.info) | `Mod` | keys `name`,`description` | -- |
| EvolvedRecipeName | `EvolvedRecipeName` | (none) | `Translator.getItemEvolvedRecipeName` |

(Full ~30-type list -- Challenge, DynamicRadio, GameSound, MapLabel, RecipeGroups, MultiStageBuild, Moveables, Attributes, etc. -- in the wiki file.)

**language.txt fields** [CONFIRMED -- `Language_txt.wiki.txt`]: `VERSION`, `text` (language name), `charset` (`UTF-8`), `azerty` (bool), `base` (limited support). Trailing commas in every entry.

**Gotchas.** No `_EN` suffix in B42 filenames (that breaks loading). UTF-8 always. `ItemName` keys are the item full type (`Base.Axe`); `Recipes` keys are the bare RecipeID. `Mod` translation localizes mod.info `name`/`description`. Optional `"$schema"` JSON validation is available (see wiki).

**Deep reference:** `_raw_pzwiki_sources/08_creation_toolkit/Translation.wiki.txt`, `Language_txt.wiki.txt`, `TranslationZed.wiki.txt`; doc 01 sec (translations).

---

<a name="22-map--building--basement"></a>
