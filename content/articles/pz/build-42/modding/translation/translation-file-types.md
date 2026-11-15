---
id: build-42-translation-file-types
slug: translation-file-types
title: 'Translation file types: what each file holds'
game: pz
version: build-42
section: modding
category: translation
difficulty: intermediate
tags:
  - translation
  - reference
  - json
  - keys
excerpt: >-
  Which translation file a string belongs in, how its key must start, and what in the game reads it, with one real English key for each file.
last_updated: '2026-11-14'
related_articles:
  - how-translation-works
  - translating-your-mod
  - gettext-in-lua
  - adding-a-language
  - translation-troubleshooting
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-13.

**Who this page is for:** [modders choosing a file](#quick-chooser) | [modders checking a key prefix](#files-looked-up-by-key-prefix-through-gettext)

Open the `EN` translation folder and you meet more than forty JSON files. This page is the map. It tells you which file a string belongs in, what its key must look like, and what in the game reads it. Use it when you are asking "where does my new string go?"

All the paths below are inside `media/lua/shared/Translate/<CODE>/`. In your own mod, the same folder sits under your version folder, for example `42/media/lua/shared/Translate/EN/`.

:::callout[The 1-minute version]{kind=key}
- `getText` does not search every file. It reads the first letters of the key and opens one map, so the file and the key prefix must agree.
- A key like `MyMod_Hello` in `IG_UI.json` loads but can never be found. Name it `IGUI_MyMod_Hello`.
- Item names, recipes, evolved recipes, moveables, mod names and map names use their own key shapes and lookup functions, not the prefix chain.
- `glossary.tbx` and any `.txt` file are ignored by the engine; `MultiStageBuild.json` appears unused (not verified in game).
- The quick chooser at the bottom says which file and key to use for the common jobs.
:::

:::facts
- **Files in `EN`** more than forty JSON files
- **Prefix-looked-up files** 24 (table below)
- **Own-lookup files** 9 (second table)
- **Ignored** `glossary.tbx`, `MultiStageBuild.json`, any `.txt`
:::

## The rule that trips everyone up

The file and the key prefix must agree, because the engine opens one map chosen by the first letters of the key.

Most strings are fetched with `getText("SOME_KEY")`. The engine does not search every file for that key. It looks at the **first letters of the key** and opens one map.

A key starting with `IGUI_` is looked up only in the `IG_UI` map. A key starting with `Sandbox_` only in the `Sandbox` map.

That means the file **and** the prefix must agree. A key called `MyMod_Hello` placed in `IG_UI.json` loads fine, but `getText("MyMod_Hello")` can never find it, because `MyMod_` is not a known prefix. Name it `IGUI_MyMod_Hello`.

The prefix chain decides the map :cite[(`zombie/core/Translator.java:436-486`)], from a fixed file-to-map table. :cite[(`zombie/core/Translator.java:142-176`)] A key with no known prefix leaves `result` null and falls through to the raw key. :cite[(`zombie/core/Translator.java:489-508`)]

## Files looked up by key prefix (through getText)

Twenty-four files are found by a key prefix, and each file has its own prefix.

The prefixes are:

:::chips
- `UI_`
- `IGUI_`
- `ContextMenu_`
- `Tooltip_`
- `Moodles_`
- `Sandbox_`
- `Challenge_`
- `Farming_`
- `SurvivalGuide_`
- `GameSound_`
- `Stash_`
- `MakeUp`
- `SurvivorName_` and `SurvivorSurname_`
- `Attributes_`
- `Fluid_`
- `EC_`
- `BODYPART_`
- `MapLabel_`
- `credits_`
- `AEBS_`
- `RD_`
- `RM_`
- `Print_Media_`
- `Print_Text_`
:::

The full table has the file, what it holds, the code that reads it and a real key.

| File | Prefix | What it holds | Code | Example key |
|---|---|---|---|---|
| `UI.json` | `UI_` | Menus, options screens, server option tooltips | :cite[(`zombie/core/Translator.java:436`; `zombie/network/ServerOptions.java:541`)] | `UI_mainscreen_laststand` :cite[(`UI.json:2`)] |
| `IG_UI.json` | `IGUI_` | In-game UI: inventory, panels, notes | :cite[(`zombie/core/Translator.java:444`; `zombie/core/input/Input.java:37`)] | `IGUI_invpanel_Type` :cite[(`IG_UI.json:2`)] |
| `ContextMenu.json` | `ContextMenu_` | Right-click menu entries | :cite[(`zombie/core/Translator.java:446`; `zombie/iso/ISWorldObjectContextMenuLogic.java:2343`)] | `ContextMenu_Destroy` :cite[(`ContextMenu.json:2`)] |
| `Tooltip.json` | `Tooltip_` | Item and object tooltips | :cite[(`zombie/core/Translator.java:452`; `zombie/inventory/InventoryItem.java:1245`)] | `Tooltip_food_Bowl` :cite[(`Tooltip.json:2`)] |
| `Moodles.json` | `Moodles_` | Moodle names and descriptions | :cite[(`zombie/core/Translator.java:438`; `zombie/characters/Moodles/Moodles.java:81`)] | `Moodles_Endurance_lvl1` :cite[(`Moodles.json:2`)] |
| `Sandbox.json` | `Sandbox_` | Sandbox option names, tooltips, enum choices | :cite[(`zombie/core/Translator.java:450`; `zombie/SandboxOptions.java:1368`)] | `Sandbox_ZombieCount` :cite[(`Sandbox.json:8`)] |
| `Challenge.json` | `Challenge_` | Challenge names and descriptions | :cite[(`zombie/core/Translator.java:454`; `zombie/GameTime.java:329`)] | `Challenge_YouHaveOneDay_name` :cite[(`Challenge.json:2`)] |
| `Farming.json` | `Farming_` | Crop names and farming text | :cite[(`zombie/core/Translator.java:442`)] | `Farming_Carrots` :cite[(`Farming.json:2`)] |
| `SurvivalGuide.json` | `SurvivalGuide_` | The in-game Survival Guide | :cite[(`zombie/core/Translator.java:440`; `zombie/core/SurvivalGuideEntry.java:353`)] | `SurvivalGuide_WindowTitle` :cite[(`SurvivalGuide.json:2`)] |
| `GameSound.json` | `GameSound_` | Sound option labels | :cite[(`zombie/core/Translator.java:448`)] | `GameSound_ButtonAdvanced` :cite[(`GameSound.json:2`)] |
| `Stash.json` | `Stash_` | Treasure-map and stash annotations | :cite[(`zombie/core/Translator.java:458`; `zombie/core/stash/Stash.java:53`)] | `Stash_AnnotedMap` :cite[(`Stash.json:2`)] |
| `MakeUp.json` | `MakeUp` (no underscore) | Makeup categories and types | :cite[(`zombie/core/Translator.java:456`)] | `MakeUpCategory_Eyes` :cite[(`MakeUp.json:2`)] |
| `SurvivorNames.json` | `SurvivorName_`, `SurvivorSurname_` | Random survivor first and last names | :cite[(`zombie/core/Translator.java:462-464`)] | `SurvivorSurname_Simpson` :cite[(`SurvivorNames.json:2`)] |
| `Attributes.json` | `Attributes_` | Entity attribute names | :cite[(`zombie/core/Translator.java:466`; `zombie/entity/components/attributes/AttributeType.java:95`)] | `Attributes_Type_None` :cite[(`Attributes.json:2`)] |
| `Fluids.json` | `Fluid_` | Fluid and container text | :cite[(`zombie/core/Translator.java:468`; `zombie/entity/components/fluids/FluidContainer.java:407`)] | `Fluid_Transfer_Fluids` :cite[(`Fluids.json:2`)] |
| `Entity.json` | `EC_` | Craft-entity (workstation) text | :cite[(`zombie/core/Translator.java:474`; `zombie/entity/components/resources/Resource.java:123`)] | `EC_Entity_DisplayName_Default` :cite[(`Entity.json:2`)] |
| `BodyParts.json` | `BODYPART_` | Body part names | :cite[(`zombie/core/Translator.java:478`; `zombie/characters/BodyDamage/BodyPartType.java:269`)] | `BODYPART_PELVIS` :cite[(`BodyParts.json:2`)] |
| `MapLabel.json` | `MapLabel_` | Town labels on the world map | :cite[(`zombie/core/Translator.java:480`; `zombie/core/Translator.java:889-892`)] | `MapLabel_Brandenburg` :cite[(`MapLabel.json:2`)] |
| `Credits.json` | `credits_` | The credits roll | :cite[(`zombie/core/Translator.java:482`)] | `credits_start` :cite[(`Credits.json:2`)] |
| `DynamicRadio.json` | `AEBS_` | Automated emergency broadcast lines (the Lua or Java caller was not verified) | :cite[(`zombie/core/Translator.java:484`)] | `AEBS_Intro` :cite[(`DynamicRadio.json:2`)] |
| `RadioData.json` | `RD_` | Radio script lines, keyed by GUID (caller not verified) | :cite[(`zombie/core/Translator.java:476`)] | key is `RD_` plus a GUID :cite[(`RadioData.json:2`)] |
| `Recorded_Media.json` | `RM_` | Titles and authors of CDs, tapes, VHS | :cite[(`zombie/core/Translator.java:460`; `zombie/radio/media/MediaData.java:55-115`)] | key is `RM_` plus a GUID :cite[(`Recorded_Media.json:2`)] |
| `Print_Media.json` | `Print_Media_` | Newspaper and magazine UI and titles (caller not verified) | :cite[(`zombie/core/Translator.java:470`)] | `Print_Media_KnoxKnews_July1_title` :cite[(`Print_Media.json:3`)] |
| `Print_Text.json` | `Print_Text_` | Newspaper and magazine text (caller not verified) | :cite[(`zombie/core/Translator.java:472`)] | `Print_Text_KnoxKnews_July1_title` :cite[(`Print_Text.json:2`)] |

A few of these have a second door. The engine also reads `Fluids`, `Entity`, `Attributes` and `MapLabel` through dedicated functions that skip the prefix check: `getFluidText`, `getEntityText`, `getAttributeText` and `getMapLabelText`. :cite[(`zombie/core/Translator.java:853-892`)]

`Recorded_Media` is loaded twice: once for your language and once for English into a separate map. The English copy backs `getTextMediaEN`, which the game uses to show the original English title next to a translated one. :cite[(`zombie/core/Translator.java:232-235`, `zombie/core/Translator.java:818-851`)]

## Files looked up by a different key shape

Nine files skip the prefix chain, and each has its own lookup function and its own key shape.

| File | Key shape | What it holds | Code | Example key |
|---|---|---|---|---|
| `ItemName.json` | Full type: `Module.Type` | Item display names, read by `Translator.getItemNameFromFullType`, which item scripts call and Lua can call too | :cite[(`zombie/core/Translator.java:608-629`, `zombie/scripting/objects/Item.java:3067`, `zombie/Lua/LuaManager.java:8553`)] | `Base.3030Box` :cite[(`ItemName.json:2`)] |
| `Items.json` | Item name with spaces and hyphens as underscores | Older name lookup. No `Items.json` ships in `EN`, but the map exists | :cite[(`Translator.getDisplayItemName` (`zombie/core/Translator.java:603-606`), Lua `getItemText` (`zombie/Lua/LuaManager.java:8537`))] | none in vanilla |
| `Recipes.json` | The craft recipe's name, as written in its script | Recipe display names | :cite[(`Translator.getRecipeName` (`zombie/core/Translator.java:699-710`), Lua `getRecipeDisplayName` (`zombie/Lua/LuaManager.java:8798`))] | `AddACigarette` :cite[(`Recipes.json:2`)] |
| `RecipeGroups.json` | `RecipeGroup_` plus the group id | Names of recipe groups in the crafting window | :cite[(`Translator.getRecipeGroupName` (`zombie/core/Translator.java:712-723`), called at `zombie/scripting/objects/CraftRecipeGroup.java:45`)] | `RecipeGroup_OpenBox` :cite[(`RecipeGroups.json:2`)] |
| `EvolvedRecipeName.json` | Full type: `Module.Type` | Names for evolved-recipe (salad, sandwich) results | :cite[(`Translator.getItemEvolvedRecipeName` (`zombie/core/Translator.java:642-664`))] | `Base.CannedBologneseOpen` :cite[(`EvolvedRecipeName.json:2`)] |
| `Moveables.json` | Object name: spaces and hyphens become `_`, apostrophes are dropped | Names of furniture and other movable objects | :cite[(`Translator.getMoveableDisplayName` (`zombie/core/Translator.java:679-687`), used at `zombie/inventory/types/Moveable.java:79`)] | `50s_Barstool` :cite[(`Moveables.json:2`)] |
| `Mod.json` | Only two keys: `name` and `description` | Your mod's title and blurb in the mod list | :cite[(`Translator.readModTranslation` (`zombie/core/Translator.java:413-428`), called at `zombie/gameStates/ChooseGameInfo.java:352`)] | `name` |
| `<map folder name>.json` | Only two keys: `title` and `description` | A map's name and description on the map selection screen | :cite[(`Translator.readMapTranslation` (`zombie/core/Translator.java:403-411`), called at `zombie/gameStates/ChooseGameInfo.java:123`)] | `title` :cite[(`Muldraugh, KY.json:2`)] |
| `Credits_Translator.json` | One key, `Translator` | The translator credit line for that language. **Vanilla only:** the credits code scans just the install-relative `media/lua/shared/Translate` folder, never mods | :cite[(`zombie/core/CreditsRole.java:264-310`)] | `Translator` :cite[(`Credits_Translator.json:2`)] |

Three details worth knowing:

- **Recipes are keyed by the plain recipe name**, with no prefix. If a recipe's translation is missing or empty, the game shows the recipe name itself. :cite[(`zombie/core/Translator.java:699-710`)]
- **Moveables lose their dashes.** `Translator.getMoveableDisplayName` swaps spaces and `-` for `_` and deletes apostrophes before looking up the key. It also calls `replace("\\.", "")`, which in Java replaces the literal text backslash-dot, not a period, so dots appear to stay in the key. That comes from decompiled output and was not tested.
- **Town and map files are named after the map folder.** `Muldraugh, KY.json` is the file for the map folder `Muldraugh, KY`, comma and space included.

## Files the engine ignores

Three kinds of file sit in the folder but are not read: `glossary.tbx` and any `.txt` file are ignored, and `MultiStageBuild.json` appears unused (not verified in game).

- **`glossary.tbx`.** A translators' term list. No code reads it (see [how translation works](/pz/build-42/modding/translation/how-translation-works)).
- **`MultiStageBuild.json`.** It ships in all 29 languages, and its keys look like `MultiStageBuild_CreateWoodenWall_1` :cite[(`MultiStageBuild.json:2`)]. But `MultiStageBuild` is not in the table of loaded files :cite[(`zombie/core/Translator.java:142-176`)], and the only code that mentions it in the engine is a debug writer :cite[(`zombie/core/Translator.java:757-769`, called from `zombie/scripting/ScriptManager.java:1726`)]. No Lua file reads those keys either. In 42.22 it looks unused, so do not rely on it. Not verified in game.
- **Any `.txt` file.** The loader opens `.json` only. :cite[(`zombie/core/Translator.java:365`)]

## Quick chooser

Match the job to a row to get the file and key shape.

| You are translating... | Put it in | Key |
|---|---|---|
| An item's name | `ItemName.json` | `YourModule.YourItem` |
| A craft recipe | `Recipes.json` | the recipe name |
| A sandbox option | `Sandbox.json` | `Sandbox_` plus the option's `translation` value |
| A line on one of your own UI panels | `IG_UI.json` (or `UI.json`) | `IGUI_YourMod_Something` |
| A right-click menu entry | `ContextMenu.json` | `ContextMenu_YourMod_Something` |
| An item tooltip | `Tooltip.json` | `Tooltip_YourMod_Something` |
| Your mod's name in the mod list | `Mod.json` | `name` and `description` |

Next: [translate your own mod, step by step](/pz/build-42/modding/translation/translating-your-mod).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source and the English translation files. Not verified: the Lua or Java callers for `DynamicRadio`, `RadioData` and the two `Print_` files, how a literal backslash-dot behaves in the moveable lookup (decompiled output, untested), and whether `MultiStageBuild.json` is unused in a running game.
:::
