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
excerpt: 'A quick recipe for giving your mod translated item names, recipes and UI text, with the file layout, skeletons and the traps to avoid.'
last_updated: '2026-11-14'
related_articles:
  - how-translation-works
  - translation-file-types
  - translating-your-mod
  - gettext-in-lua
  - adding-a-language
  - translation-troubleshooting
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
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-13. Rewritten from the earlier import, which was checked against 42.20 and described a `language.txt` file that 42.22 no longer reads.

**Who this page is for:** [modders who want the quick recipe](#files-and-placement) | [modders checking a file or prefix](#translation-types)

**What you build:** localized display names and UI text for your mod.

This page is the quick recipe. The full story is in the translation series: [how translation works](/pz/build-42/modding/translation/how-translation-works), [every file type](/pz/build-42/modding/translation/translation-file-types), [a step-by-step first example](/pz/build-42/modding/translation/translating-your-mod), [getText in Lua](/pz/build-42/modding/translation/gettext-in-lua), [adding a language](/pz/build-42/modding/translation/adding-a-language) and [troubleshooting](/pz/build-42/modding/translation/translation-troubleshooting).

:::callout[The 1-minute version]{kind=key}
- Translation files are `.json`, UTF-8, with no language code in the file name: `ItemName.json`, not `ItemName_EN.txt`.
- Put them in `42/media/lua/shared/Translate/<LANGUAGE CODE>/`, one folder per language. Ship a `language.json` only when the folder defines a new language.
- `getText` opens one map by the first letters of the key, so the file and the prefix must agree (`IGUI_MyMod_Hello` in `IG_UI.json`).
- `ItemName` keys are the item full type; `Recipes` keys are the bare recipe name.
- Files load at game start. Restart after an edit, or use `-debugtranslation` and F12.
:::

:::facts
- **`language.json` version** must be 1; a missing one counts as 1
- **Reload** `-debugtranslation` plus F12
- **Vanilla languages that use `base`** none in 42.22
:::

:::callout[B42 format]{kind=warn}
Translation files are **`.json`**, are **UTF-8**, and must **not** carry the language code in the filename. The B41 form (`ItemName_EN.txt`, `Recipe_EN.txt`, `IG_UI_EN.txt`, `key=value` lines) is not read at all: the loader opens only `<File>.json`, and a `.txt` file is skipped without a message. Use `ItemName.json`, `Recipes.json`, `IG_UI.json` and the other names in the table below. The loader builds the path `media/lua/shared/Translate/<CODE>/<File>.json` :cite[(`zombie/core/Translator.java:365`)] and reads it as UTF-8. :cite[(`zombie/core/Translator.java:368`)]
:::

## Files and placement

`42/media/lua/shared/Translate/<LANGUAGE CODE>/` is one folder per language, and it holds a `language.json` only when the folder defines a language.

It holds the JSON string files. To add strings to a language the game already has, such as `EN`, you ship the JSON files and no `language.json`.

```
media/lua/shared/Translate/
  EN/
    ItemName.json
    Recipes.json
    IG_UI.json
    UI.json
    Fluids.json
    Moodles.json
```

Each mod's common and version folder are searched for the same path. :cite[(`zombie/core/Translator.java:384-401`)] A folder is a language only if it holds `language.json` :cite[(`zombie/core/Languages.java:77`)], and a mod's `language.json` with an existing code replaces that language's record. :cite[(`:85-93`)]

## Skeletons

Three small files show the format: item names, UI strings and the `language.json` shape.

```json
// ItemName.json  -- key = item full type
{ "yourModule.Foo": "Foo", "yourModule.CannedBeansOpen": "Open Canned Beans" }
```
```json
// IG_UI.json  -- IGUI_ prefixed keys, UTF-8
{ "IGUI_mymod_hello": "Hello ¼" }
```

(The `//` lines above are labels for you. Real JSON has no comments, so leave them out of the file.)

```json
// language.json  -- the format (shipping this for EN would replace the game's English record)
{
    "version": "1",
    "language_name": "English"
}
```

The English record is exactly the two fields shown. :cite[(`media/lua/shared/Translate/EN/language.json:2-3`)] The engine reads those fields from the file. :cite[(`zombie/core/LanguageFile.java:31-34`)]

## Translation types

Each type has a file name, a key prefix and a retrieval function.

The table gives the filename base (`.json`), the key prefix and the retrieval function.

| Type | File | Key prefix | Function |
|------|------|-----------|----------|
| Item names | `ItemName` | (key = item full type) | `getItemNameFromFullType` |
| Recipes | `Recipes` | (key = craftRecipe name) | `getRecipeDisplayName` |
| IGUI | `IG_UI` | `IGUI_` | `getText` |
| UI | `UI` | `UI_` | `getText` |
| Tooltip | `Tooltip` | `Tooltip_` | `getText` |
| ContextMenu | `ContextMenu` | `ContextMenu_` | `getText` |
| Moodles | `Moodles` | `Moodles_` | `getText` |
| Sandbox | `Sandbox` | `Sandbox_` | `getText` |
| Entity | `Entity` | `EC_` | `getText` |
| Fluids | `Fluids` | `Fluid_` | `getText` |
| Farming | `Farming` | `Farming_` | `getText` |
| Mod (mod.info) | `Mod` | keys `name`, `description` | -- |
| EvolvedRecipeName | `EvolvedRecipeName` | (key = item full type) | `Translator.getItemEvolvedRecipeName` |

The engine routes prefixes in one chain :cite[(`zombie/core/Translator.java:436-486`)] from a fixed file table. :cite[(`zombie/core/Translator.java:142-176`)] Item names come from `getItemNameFromFullType` :cite[(`:608-629`)], recipes from `getRecipeName` (Lua name `getRecipeDisplayName`) :cite[(`:699-710`, `zombie/Lua/LuaManager.java:8798`)], evolved recipes from `getItemEvolvedRecipeName` :cite[(`:642-664`)], and the `Mod` file has its own reader. :cite[(`:413-428`)]

## The prefix rule

`getText` opens one map based on the first letters of the key, so the file and the prefix must agree.

A key `MyMod_Hello` in `IG_UI.json` loads but can never be found. Use `IGUI_MyMod_Hello`.

The full list of loaded files also includes Challenge, DynamicRadio, GameSound, MapLabel, RecipeGroups, Moveables, Attributes, SurvivalGuide, Stash, Print_Media, Print_Text, RadioData, Recorded_Media, SurvivorNames, MakeUp and Credits. `MultiStageBuild.json` ships with the game but is **not** in the loaded list, so do not rely on it :cite[(`zombie/core/Translator.java:142-176`)]. See [the file types reference](/pz/build-42/modding/translation/translation-file-types).

## language.json fields

`language.json` has four fields, and only `language_name` is required.

`version` (must be 1; a missing one counts as 1), `language_name` (required, not blank), `base` (optional: a language to fall back to before English) and `azerty` (optional true or false). There is no `charset` field and no trailing-comma rule. It is ordinary JSON. :cite[(`zombie/core/LanguageFile.java:31-39`)]

`base` works in the engine :cite[(`zombie/core/Translator.java:348-362`)] but no vanilla language uses it in 42.22. The `azerty` flag appears to do nothing for a mod's language, because the keyboard check uses a fixed list holding only `FR`. :cite[(`zombie/core/Translator.java:809-816`)]

## Gotchas

Eight traps to avoid.

- No `_EN` suffix in B42 filenames. A file named `ItemName_EN.json` is never opened.
- UTF-8 always. A byte-order mark was not verified to be safe, so save without one.
- Every value must be a string. A number or list makes the whole file fail with `JSON Error in: <file>` :cite[(`zombie/core/Translator.java:375-379`)].
- `ItemName` keys are the item full type (`Base.Axe`). `Recipes` keys are the bare recipe name.
- The `Mod` file localizes the `name` and `description` shown for your mod.
- Files load at game start. Restart after an edit, or launch with `-debugtranslation` and press F12 to reload. :cite[(`zombie/characters/IsoPlayer.java:2439-2440`, `zombie/gameStates/MainScreenState.java:267-268`)]
- A mod's English override of a vanilla key does not win for players in another language, because that language loads after English. Ship the override in each language. :cite[(`zombie/core/Translator.java:228-231`)]
- Optional `"$schema"` JSON validation: not verified in 42.22. A `"$schema"` line would be read as just another key.

**Deep reference:** the six articles linked at the top of this page.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source and the shipped English files. Not verified: whether a byte-order mark is safe, and `"$schema"` validation.
:::

---
