---
id: build-42-translation-troubleshooting
slug: translation-troubleshooting
title: 'Translation troubleshooting: when the text will not show up'
game: pz
version: build-42
section: modding
category: translation
difficulty: beginner
tags:
  - translation
  - troubleshooting
  - json
  - debugging
excerpt: >-
  Why a raw key shows on screen, a JSON error appears, a file is silently ignored, old B41 .txt files do nothing or text will not update, each with its cause and fix.
last_updated: '2026-11-14'
related_articles:
  - how-translation-works
  - translation-file-types
  - translating-your-mod
  - gettext-in-lua
  - adding-a-language
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-13.

**Who this page is for:** [a raw key on screen](#symptom-a-raw-key-shows-on-screen) | [a JSON error](#symptom-the-game-reports-json-error-in-or-will-not-finish-loading) | [nothing happens](#symptom-nothing-happens-and-no-error-appears) | [old B41 files](#symptom-a-b41-txt-translation-does-nothing)

You wrote the JSON, restarted the game, and the screen still says `IGUI_MyMod_Hello`. Nothing is wrong with you. Translation is picky about folders, file names and key prefixes, and when it fails it mostly fails quietly. Start with the two tools below, then find your symptom.

:::callout[The 1-minute version]{kind=key}
- Turn on debug mode (`-debug`) and search `console.txt` for `Missing translation`, then for `JSON Error`. The key or file named there is usually the answer.
- A raw key on screen means the engine found nothing: check the prefix against the file, the exact key, and that you restarted.
- A wrong folder or file name is skipped silently, so check the exact path and capital `Translate`.
- B41 `.txt` translation files are never read in 42.22. Convert them to `.json`.
- Save as UTF-8. Ship an override in every language you want to change.
:::

:::facts
- **Debug launch options** `-debug` and `-debugtranslation`
- **Reload key** F12, with `-debugtranslation`
- **Log files** `console.txt` and `translationProblems.txt`, in the `Zomboid` folder
:::

## Two tools worth turning on first

Turn on debug mode and `-debugtranslation` so the game tells you which key it could not find.

1. **Debug mode** (the `-debug` launch option). The game then logs `ERROR: Missing translation "<key>"` the first time a key is not found. :cite[(`zombie/core/Translator.java:494-497`)]
2. **The `-debugtranslation` launch option.** It also writes the missing keys to a file named `translationProblems.txt` in the game's cache folder (the `Zomboid` folder in your user folder), and lets you press **F12** in game to reload the translation files without restarting. :cite[(`zombie/gameStates/MainScreenState.java:268`, `zombie/core/Translator.java:183-194`, `zombie/core/Translator.java:499-501`, `zombie/characters/IsoPlayer.java:2439-2440`)]

Everything below assumes you read the log. `console.txt` is in the same `Zomboid` folder.

## Symptom: a raw key shows on screen

The engine looked for that key, found nothing and returned the key itself as the text.

You see `IGUI_MyMod_Hello`, `Sandbox_MyMod_Strength` or `MyMod.Widget` where words should be.

**What it means:** the engine looked for that key and found nothing, so it returned the key as the text. :cite[(`zombie/core/Translator.java:506`)]

Check these in order:

| Cause | How to tell | Fix |
|---|---|---|
| The prefix does not match the file | Your key does not start with the prefix of the file it is in, for example `MyMod_Hello` in `IG_UI.json` | Rename the key `IGUI_MyMod_Hello`. The engine opens one map based on the first letters of the key :cite[(`Translator.java:436-486`)] |
| A typo in the key | The log line shows the exact key the code asked for | Copy it from the log into your JSON |
| Item key is not the full type | `ItemName.json` has `"Widget"` instead of `"MyMod.Widget"` | Use `Module.Type` :cite[(`Translator.java:608-612`)] |
| The game has not reloaded | You edited a file while the game ran | Restart, or use F12 with `-debugtranslation` |
| The file is not where the engine looks | See the next section | Fix the path |
| The value is empty (`""`) | The key exists but its value is blank | Write the text. An empty value never overwrites :cite[(`Translator.java:374-376`)], so a blank in `EN` leaves nothing to fall back to |

Where the engine decides: :cite[(`zombie/core/Translator.java:430-515`)].

**A special case: an item shows its old script name.** Item names are copied onto the item when scripts load. :cite[(`zombie/scripting/objects/Item.java:3067`)] If you add an `ItemName.json` entry and the item still shows the old text, restart the game completely; F12 is not enough (inferred from the code, not tested).

## Symptom: the game reports "JSON Error in" or will not finish loading

A translation file could not be parsed, and the message names the file.

**Cause:** a translation file could not be parsed. The loader wraps any failure in a `RuntimeException` whose message names the file: `JSON Error in: <path>` :cite[(`zombie/core/Translator.java:378-379`)].

Common reasons:

- **A missing or extra comma.** Every line needs a comma after it **except the last one**.

  ```json
  {
      "IGUI_MyMod_A": "First",
      "IGUI_MyMod_B": "Second"
  }
  ```
- **Single quotes or curly quotes** around keys or values. JSON needs straight double quotes (`"`). Release builds may accept single quotes, comments or trailing commas; do not rely on it. Strict JSON always works.
- **A value that is not a string.** The loader casts every value to a string, so a number, list or nested object breaks the whole file. :cite[(`zombie/core/Translator.java:375`)] Write `"5"`, not `5`.
- **An unescaped double quote** inside a string. Write `\"`.
- **A comment.** JSON has no `//` comments.

In development builds the parser is strict (`withStrictMode(Core.IS_DEV)`). :cite[(`zombie/core/Translator.java:373`)] Released builds are more lenient, but do not rely on that. Strict JSON always works. Paste your file into a JSON checker first.

Exactly what a player sees when this exception fires during start-up was not verified. Expect the stack trace with the file path in `console.txt`.

**Fix:** open the file named in the message, validate it, fix it, restart.

## Symptom: nothing happens and no error appears

The engine opens files by exact path and silently skips any that do not exist, so a wrong name is invisible.

If the file does not exist, the code does nothing. :cite[(`zombie/core/Translator.java:366-367`)] Check:

| Mistake | Correct form |
|---|---|
| Folder in `client` or `server` | `media/lua/shared/Translate/` |
| Folder `translate` (lowercase) | `Translate`. The engine builds the path with a capital T :cite[(`zombie/core/Languages.java:43`, `:48`)]. Windows ignores case, but case-sensitive systems such as a Linux server do not (general Java behavior, not tested here) |
| Language code in the file name, `ItemName_EN.json` | `ItemName.json`, inside the `EN` folder. The loader builds `<CODE>/<FileName>.json` :cite[(`Translator.java:365`)] |
| `IGUI.json` or `IG_Ui.json` | `IG_UI.json`. The names come from a fixed table :cite[(`Translator.java:142-176`)] |
| Your own file name, `MyMod.json` | Not a file type. Use an existing file with your own prefixed key |
| `en` or `English` as the folder | `EN` for English. Matching is case-insensitive for the language record :cite[(`Languages.java:68-70`)] but the folder is opened by its exact spelling |
| Files in the mod root instead of `42/` | Put them under the version folder (`42/media/...`). The engine reads the mod's common folder and version folder :cite[(`Translator.java:384-401`)]; other placements were not verified |

## Symptom: a B41 `.txt` translation does nothing

Build 42.22 has no loader for `.txt` translation files, so they are ignored and nothing is logged.

You copied a B41-era mod, with files like `ItemName_EN.txt`, `Recipe_EN.txt` or `IG_UI_EN.txt` and `key = "value",` lines.

**Cause:** Build 42.22 has no loader for them. The only file the string loader opens is `<file>.json`. :cite[(`zombie/core/Translator.java:365`)] The `.txt` files are never read, and nothing is logged. Even the game's own `TH` folder still carries leftover `language.txt` and `credits.txt` files that are ignored, with `language.json` doing the work. :cite[(`media/lua/shared/Translate/TH/`)]

**Fix:** convert the file.

1. Rename it to its B42 name with no language code (`ItemName_EN.txt` becomes `ItemName.json` inside an `EN` folder).
2. Turn each `key = "value",` line into `"key": "value",` inside `{ }`.
3. **Check the keys.** B41 prefixed some keys with the file name. B42's files do not: `ItemName.json` keys are `Base.3030Box`, not `ItemName_Base.3030Box`, and `Recipes.json` keys are the plain recipe name. :cite[(`media/lua/shared/Translate/EN/ItemName.json:2`, `media/lua/shared/Translate/EN/Recipes.json:2`)]
4. Add a `language.json` only if you are creating a new language. Remove any old `language.txt`.
5. Save as UTF-8.

## Symptom: accented letters turn into garbage, or the file is rejected

The loader reads UTF-8 only, so text saved in an older Windows encoding breaks.

**Cause:** the loader reads files as UTF-8. :cite[(`zombie/core/Translator.java:368`)] Text saved in an older Windows encoding breaks, and invalid UTF-8 raises an error that is also reported as `JSON Error in`, because the loader catches every exception from the read and the parse together. :cite[(`zombie/core/Translator.java:367-380`)]

**Fix:** save the file as **UTF-8** and open it again to confirm accents survived. Prefer **UTF-8 without a byte-order mark**. The vanilla files have none. Whether a BOM would break the parser was not verified.

**Look-alike characters.** In development builds the game rejects English files that contain curly quotes, long dashes, zero-width characters and look-alike letters. :cite[(`zombie/core/Translator.java:51-96`, `:898-915`)] Released builds do not check, but those characters still look wrong in text. Type straight quotes.

## Symptom: text shows `%1` or `%1$s`, or part of the sentence is missing

The Lua call passed too few arguments, or the text has a stray `%`.

**Cause:** the Lua call passed too few arguments, or the text has a stray `%`. `getText` fills in the holes and logs `Missing arguments` when it cannot. :cite[(`zombie/core/Translator.java:524-530`)]

**Fix:** pass one argument per `%1` to `%9`, and write `%%` for a literal percent sign. See [getText in Lua](/pz/build-42/modding/translation/gettext-in-lua).

## Symptom: my override of a vanilla string does not win

For each file, English loads completely before French, so the vanilla French text overwrites your English override.

You shipped `EN/IG_UI.json` with a changed vanilla key, but a player in French still sees the old text.

**Cause:** for each file, English loads completely (vanilla, then mods) before French does, and the vanilla French text overwrites your English override. :cite[(`zombie/core/Translator.java:228-231`, `:348-362`, and the same pattern at `:403-428`)]

**Fix:** ship the override in every language you want to change. See [how translation works](/pz/build-42/modding/translation/how-translation-works). If two mods change the same key in the same language, the one loaded later wins. :cite[(`zombie/ZomboidFileSystem.java:868-875`)]

## Symptom: my new language is missing from the Options list

The folder needs a readable `language.json` with `"version": "1"` and a non-empty `"language_name"`.

**Cause:** without the file, the folder is not a language at all. With a bad one, the engine logs the problem and skips the folder. :cite[(`zombie/core/Languages.java:77`, `:102-111`, `zombie/core/LanguageFile.java:35-39`)]

**Fix:** see [adding a language](/pz/build-42/modding/translation/adding-a-language).

## Symptom: edits do not appear even after a restart

This is rare, and there are three things to check.

- You are editing the mod you are running. A Workshop copy and a local copy of the same mod can both exist. Which one the game prefers was not verified, so make sure only one is enabled.
- The mod is enabled for **this save**. Translations load for the active mod list. :cite[(`zombie/ZomboidFileSystem.java:868-875`)]
- A cached result in the game is stale. The game remembers each item's name after the first lookup, but that memory is cleared every time translations reload, so a full restart always clears it. :cite[(`zombie/core/Translator.java:200`, `:625`)]

## Still stuck

Search `console.txt` for `Missing translation`, then for `JSON Error`. The key or file named in the line is the answer nine times out of ten. Walk back through [translating your mod](/pz/build-42/modding/translation/translating-your-mod) with that key in hand.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source. Not verified: what a player sees when the JSON exception fires at start-up, whether a byte-order mark breaks the parser, which of a Workshop and a local copy of the same mod the game prefers, file placement outside the version and common folders, case-sensitive folder behavior on Linux, and that F12 does not refresh an item name already in use.
:::
