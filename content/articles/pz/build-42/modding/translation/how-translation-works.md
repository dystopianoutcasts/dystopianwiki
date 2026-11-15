---
id: build-42-how-translation-works
slug: how-translation-works
title: 'How translation works: languages, files and fallback'
game: pz
version: build-42
section: modding
category: translation
difficulty: intermediate
tags:
  - translation
  - localization
  - engine
  - json
  - multiplayer
excerpt: >-
  How the game finds its languages, picks yours, falls back to English, decides which mod wins a duplicate string, and what a server does when a mod asks it for text.
last_updated: '2026-11-14'
related_articles:
  - translation-file-types
  - translating-your-mod
  - gettext-in-lua
  - adding-a-language
  - translation-troubleshooting
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-13.

**Who this page is for:** [modders](#the-two-files-that-describe-a-language) | [server owners](#client-versus-server)

Open the Options screen and flip the language from English to French. Item names, menus, moodles and tooltips all change, and none of the game's code changed. That is the translation system: the game never hard-codes the words you read.

It asks for a **key** (a short code name such as `IGUI_invpanel_Type`) and the translator hands back the text for your language. This article is the big picture. The other articles in the series cover the files, the Lua functions and how to translate your own mod.

:::callout[The 1-minute version]{kind=key}
- Each language is a folder under `media/lua/shared/Translate/` with a `language.json`; a folder without it is not a language.
- The game loads translations once at startup, so a restart is the rule. With `-debugtranslation`, F12 reloads the string files.
- Your language comes from Options, then the computer's language, then English.
- English loads first, then the base language, then yours, and an empty string never overwrites. A half-translated language therefore shows English for the gaps.
- A later load wins a duplicate key: a mod beats vanilla, and a later mod beats an earlier one. But each file type loads English fully before the next language, so an English override does not change what a French player sees.
- A server uses its own one language. Send the key to players, not a finished sentence.
:::

:::facts
- **Language record** `language.json`, fields `version` (must be 1), `language_name`, optional `base` and `azerty`
- **Vanilla languages** 29 `language.json` files; none sets `base`, only `FR` sets `azerty`
- **Reload key** F12, only with `-debugtranslation`
- **Load order** English, then each base, then your language; vanilla before mods
:::

## The two files that describe a language

Each language lives in a folder under `media/lua/shared/Translate/`, named with a short code such as `EN` or `FR`, and only a folder with a `language.json` counts as a language.

In Build 42.22 every language folder holds the same kind of files.

| File | What it is | Does the game read it? |
|---|---|---|
| `language.json` | Names the language. Fields: `version`, `language_name`, and optionally `base` and `azerty` | Yes. A folder without it is not a language |
| `glossary.tbx` | A term list (TBX format) with a "Weblate Glossary" header, for translators | No. Nothing in the engine or vanilla Lua refers to it |
| `ItemName.json`, `IG_UI.json` and so on | The actual strings | Yes, see [the file types reference](/pz/build-42/modding/translation/translation-file-types) |

Here is the whole of the English `language.json`:

```json
{
    "version": "1",
    "language_name": "English"
}
```

That is the whole file. :cite[(`media/lua/shared/Translate/EN/language.json:2-3`)] The glossary file carries a "Weblate Glossary" header. :cite[(`media/lua/shared/Translate/EN/glossary.tbx:7`)] A search of the engine source and the vanilla Lua for `glossary` and `tbx` finds no reader, so `glossary.tbx` is a translator's tool and is not loaded in game.

The engine reads `language.json` in `LanguageFile`. It asks for four fields :cite[(`zombie/core/LanguageFile.java:31-34`)]:

- `version` must be 1. A missing `version` counts as 1.
- `language_name` is required and must not be blank. This is the name players see in the language list.
- `base` is optional: the code of another language to fall back to before English (more below).
- `azerty` is optional: a true or false flag.

If `version` is anything other than 1, or `language_name` is missing, the engine throws and that language is skipped. :cite[(`zombie/core/LanguageFile.java:35-39`)] The loader catches the exception and returns nothing for that folder. :cite[(`zombie/core/Languages.java:102-111`)] None of the 29 vanilla `language.json` files sets `base`; only `FR` sets `azerty`.

## How the engine finds languages

When the game starts, `Languages.init` builds the list from the game's own folder and then from every active mod, and a mod folder with a matching name replaces the existing language.

The steps are these :cite[(`zombie/core/Languages.java:34-54`)]:

:::flow[How Languages.init builds the list]
- Create English (`EN`) as the default
- Scan the game's own `media/lua/shared/Translate` folder
- Scan the same path in each active mod, in load order (common folder, then version folder)
:::

Every sub-folder that contains a `language.json` becomes a language. If a mod ships a folder whose name matches an existing language, the engine **replaces** that language's entry with the mod's `language.json`. :cite[(`zombie/core/Languages.java:76-100`)]

That is how a mod can rename a language, and it is also a trap: a mod that ships `FR/language.json` for a few strings replaces the vanilla FR record, including the `azerty` flag. A mod that only adds strings to an existing language should not ship a `language.json` at all. The filter is at line 77, and the replace-by-name branch at lines 85-93.

Language codes match without regard to case (`getByName` ignores case), but the folder itself is opened by its exact spelling. :cite[(`zombie/core/Languages.java:68-70`, `zombie/core/Translator.java:365`)] The lookup ignores case, and the path is built from the language name as written.

## When the files are loaded

Translations load once at startup and again only when Lua is reset, so a restart is the rule, with two debugging shortcuts.

`Languages.init` followed by `Translator.loadFiles` runs at these moments:

| Moment | Code |
|---|---|
| Game start, at the "Loading Translations" step | :cite[(`zombie/GameWindow.java:981-984`)] |
| Lua is reset with a new mod list (joining a server, changing mods) | :cite[(`zombie/core/Core.java:3522-3523`)] |
| Returning to the main menu with the default mod list | :cite[(`zombie/gameStates/IngameState.java:1046-1047`)] |
| A dedicated server starts | :cite[(`zombie/network/GameServer.java:621-622`)] |

Edit a JSON file while the game is running and nothing changes until the game loads translations again. Two exceptions help while you work:

- Start the game with the `-debugtranslation` argument. Then pressing **F12** in game calls `Translator.loadFiles` again :cite[(`zombie/gameStates/MainScreenState.java:268`, `zombie/characters/IsoPlayer.java:2439-2440`)].
- The debug menu has a "reload translations" entry that calls the same function :cite[(`media/lua/client/DebugUIs/DebugContextMenu.lua:1087`, `media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:283`)].

A reload re-reads the string files but does **not** run `Languages.init`, so a brand-new `language.json` still needs a restart. Item names are also copied onto each item when scripts load :cite[(`zombie/scripting/objects/Item.java:3067`)], so a reload may not refresh an item name already in use. That last point comes from reading the code and was not tested in game.

## Which language you get

The game uses the language you chose in Options, then the computer's language, then English.

`Translator.getLanguage` decides, in this order :cite[(`zombie/core/Translator.java:576-593`)]:

:::flow[How the current language is chosen]
- The language chosen in Options
- If blank or unknown, the Java runtime language (`user.language`, upper-cased)
- If that is not a known language, English
:::

The option starts out as the system language :cite[(`zombie/core/Core.java:1168`)]. Picking a language in Options sets the option and calls `Translator.setLanguage` :cite[(`media/lua/client/OptionScreens/MainOptions.lua:1834-1836`, `zombie/core/Translator.java:564-570`)].

There is exactly one current language per running game, held in a single static field :cite[(`zombie/core/Translator.java:177`)].

## Falling back to English

A half-translated language stays usable because English loads first and every later load overwrites it, except that an empty string never overwrites.

`forLanguageStack` builds a list: your language, then its `base` language (and that language's base, and so on), then English. It then walks the list **backwards**, so English loads first, then the base, then your language. Each load overwrites the earlier ones.

```java
while (language != null && bases.add(language)) {
   language = Languages.instance.getByName(language.base());
}
bases.add(getDefaultLanguage());
```

The `bases.add` check at line 352 stops a loop if two languages name each other as `base`. :cite[(`zombie/core/Translator.java:348-362`)]

Two rules make the fallback work:

- **An empty string never overwrites.** When a value is loaded, it is stored only if the key is new or the new value is not empty. A translator who leaves `""` for a string keeps the English text. :cite[(`zombie/core/Translator.java:374-376`)]
- **A key nobody defines comes back as itself.** If no language has the key, the game shows the raw key. See [troubleshooting](/pz/build-42/modding/translation/translation-troubleshooting).

## Load order: vanilla, then mods

The last file loaded wins a duplicate key, so a mod beats vanilla and a later mod beats an earlier one, but each file type loads every English file before any French one.

For each language in that list, and for each file type, the engine loads the game's own file first and then every active mod's file:

```java
BY_NAME.forEach((name, mapx) -> forLanguageStack(l -> {
   tryFillMapFromFile(ZomboidFileSystem.instance.base.canonicalFile.getPath(), name, mapx, l, Translator::formatFixer);
   tryFillMapFromMods(name, mapx, l);
}));
```

That loop is the whole mechanism :cite[(`zombie/core/Translator.java:228-231`)], and the mod step loads each mod's common folder and then its version folder. :cite[(`zombie/core/Translator.java:384-401`)]

Because every load overwrites, the **last one loaded wins** a duplicate key:

1. Within one language, a mod beats vanilla.
2. Between mods, the one loaded later wins. Mods that another mod requires load first, then the rest in list order. :cite[(`zombie/ZomboidFileSystem.java:868-875`, `zombie/ZomboidFileSystem.java:851`)]
3. Within one mod, the version folder (for example `42/`) beats the common folder.

Now the surprise. The outer loop is the file type, and inside it the engine walks the languages. So for each file (say `IG_UI.json`), English loads completely (vanilla, then mods) before French loads (vanilla, then mods).

The same pattern is used for map and mod names :cite[(`zombie/core/Translator.java:403-428`)]. So if your mod ships an English override for a vanilla key, a French player still sees the **vanilla French** text, because the French pass runs later. To change a string for everyone, ship the override in every language you care about, or accept that players in other languages get the vanilla text.

## Encoding and file format

String files are UTF-8 JSON in which every value must be a string, and one bad value rejects the whole file.

The files are read with `Files.readString`, which decodes UTF-8, and parsed as JSON. Every value must be a string. A number, list or nested object fails the cast and the whole file is rejected with the error `JSON Error in: <file>`. :cite[(`zombie/core/Translator.java:368`, `zombie/core/Translator.java:373-379`)]

Strict JSON checking is switched on only in development builds (`withStrictMode(Core.IS_DEV)`, line 373). Released builds are more forgiving, but write strict JSON anyway: it is the only form guaranteed to behave the same everywhere.

Whether a byte-order mark at the start of the file breaks parsing was not verified. Save without one. The vanilla files have none.

Percent signs and `%1` placeholders are rewritten as the file loads, so they need care. That is covered in [getText in Lua](/pz/build-42/modding/translation/gettext-in-lua).

## Client versus server

A server translates in its own single language, so send players a key and let each client call `getText`.

The server runs its own translator. A dedicated server loads languages and files at startup :cite[(`zombie/network/GameServer.java:621-622`)], and the Lua functions `getText` and `getTextOrNull` are global in both places :cite[(`zombie/Lua/LuaManager.java:8516-8530`)].

What a server-side `getText` returns:

- It uses the server's **one** current language. That comes from the server's own option or computer language, not from any connected player :cite[(`zombie/core/Translator.java:576-593`)]. Whether a dedicated server's saved options override it was not verified.
- It only knows the strings from mods the server loaded, in the server's language.
- A key that the server does not know is returned as the raw key.

So never build a sentence on the server and send it to players. Send the key, and let each client call `getText` so the text comes out in that player's language.

On the client side there is one helpful rule. When you join a server, the game also loads any **translation-only mod** you have enabled locally, even if the server does not run it. A mod counts as translation-only if every file under its `media/` folder sits in `media/lua/shared/translate/` and ends in `.txt` or `.json`. That is how a community language pack can work on any server. :cite[(`zombie/ZomboidFileSystem.java:757-762`, `zombie/ZomboidFileSystem.java:784-822`)]

The order matters: translation-only mods are put first and the server's mods are added after them (`toLoad.addAll(GameClient.instance.serverMods)`), so the **server's mods win** a duplicate key :cite[(`zombie/ZomboidFileSystem.java:760-762`)]. This path runs only on a connected client (`GameClient.client`), and it finds your local mods by reading your default mod list (`readDefaultModsTxt`) :cite[(`zombie/ZomboidFileSystem.java:811`)].

## Where to go next

- [Every translation file type, with keys and readers](/pz/build-42/modding/translation/translation-file-types)
- [Translate your own mod, step by step](/pz/build-42/modding/translation/translating-your-mod)
- [getText and its relatives in Lua](/pz/build-42/modding/translation/gettext-in-lua)
- [Shipping a second language](/pz/build-42/modding/translation/adding-a-language)
- [Troubleshooting](/pz/build-42/modding/translation/translation-troubleshooting)

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source and vanilla Lua. Not tested in game: whether a reload refreshes an item name already in use, whether a byte-order mark breaks parsing, and whether a dedicated server's saved options override its language.
:::
