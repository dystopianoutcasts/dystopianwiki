---
id: build-42-adding-a-language
slug: adding-a-language
title: 'Adding a language: a second language, or a brand-new one'
game: pz
version: build-42
section: modding
category: translation
difficulty: intermediate
tags:
  - translation
  - languages
  - mod-packaging
excerpt: >-
  How to ship French or any other language beside your English files, the 29 language codes the game ships, and what a mod can and cannot add.
last_updated: '2026-11-14'
related_articles:
  - how-translation-works
  - translation-file-types
  - translating-your-mod
  - gettext-in-lua
  - translation-troubleshooting
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-13.

**Who this page is for:** [modders adding French or similar](#job-1-add-french-next-to-your-english) | [modders adding a new language](#job-2-add-a-brand-new-language) | [language pack authors](#language-packs-that-work-on-any-server)

Your mod works in English. Now a friend who plays in Portuguese asks if the Widget can be called something else. This page covers that, and the bigger case: a language the game does not ship at all.

:::callout[The 1-minute version]{kind=key}
- To add strings to a language the game already has, make a sibling folder with its code (such as `FR`) and the same file names. Do not ship a `language.json`.
- To add a language the game does not have, make a folder with a new code and a `language.json`.
- Whatever your language leaves out falls back to your `EN` text, and what `EN` leaves out shows the raw key.
- A mod cannot add a new file type or key prefix, per-player languages on a server, translator credits, or `.txt` translation files.
- A mod made only of translation files that you enabled also loads on any server you join.
:::

:::facts
- **Languages shipped** 29 codes in 42.22
- **Vanilla languages that set `base`** none
- **Vanilla languages with an `azerty` flag** 1 (`FR`)
:::

::::cards
:::card[Job 1: a language the game has]{accent=blue}
Add strings to French, German and so on. **No** `language.json`. Shipping one would replace the game's own record.
:::
:::card[Job 2: a language the game lacks]{accent=orange}
Make a folder with a new code and a `language.json` with `version` and `language_name`. It then appears in the Options language box.
:::
::::

## Two jobs, two sets of files

There are two different jobs, and they need different files.

| Job | `language.json` needed? |
|---|---|
| Add strings to a language the game **already has** (French, German, and so on) | **No. Leave it out.** |
| Add a language the game does **not** have | **Yes** |

## Job 1: add French next to your English

Make a sibling folder named with the language code and put the same file names in it.

```
42/media/lua/shared/Translate/
├── EN/
│   └── ItemName.json     { "MyMod.Widget": "Widget" }
└── FR/
    └── ItemName.json     { "MyMod.Widget": "Gadget" }
```

That is all. A French player gets `FR`; everyone else gets `EN`. You do not need to translate every file. Whatever `FR` does not define falls back to your `EN` text, and what `EN` does not define shows the raw key.

The engine loads a language's files by path alone :cite[(`zombie/core/Translator.java:365`)] and does not require `language.json` in a mod for that. The fallback list always ends with English :cite[(`zombie/core/Translator.java:348-362`)]. A string left as `""` does not overwrite. :cite[(`zombie/core/Translator.java:374-376`)]

**Why not ship a `language.json` for FR?** Because if you do, the engine treats your folder as a new definition of French and **replaces** the game's French record: its display name, its `base` and its `azerty` flag. :cite[(`zombie/core/Languages.java:85-93`)] Only ship one when you mean to.

## The language codes in 42.22

The game ships 29 languages, and the code is the folder name.

The name is the `language_name` field in that folder's `language.json`. Codes are matched without regard to case.

| Code | `language_name` | Code | `language_name` |
|---|---|---|---|
| `AR` | Español (Argentina) | `KO` | Korean |
| `CA` | Català | `NL` | Nederlands |
| `CH` | Chinese (Traditional) | `NO` | Norsk |
| `CN` | Chinese (Simplified) | `PL` | Polski |
| `CS` | Čeština | `PT` | Português (Portugal) |
| `DA` | Dansk | `PTBR` | Português (Brasil) |
| `DE` | Deutsch | `RO` | Română |
| `EN` | English (the default) | `RU` | Russian |
| `ES` | Español (España) | `STREW` | Strewberrie |
| `ES_CL` | Español (Chile) | `TH` | Thai |
| `ES_MX` | Español (México) | `TR` | Türkçe |
| `FI` | Suomi | `UA` | Ukrainian |
| `FR` | Français (azerty flag set) | `HU` | Magyar |
| `ID` | Bahasa Indonesia | `IT` | Italiano |
| `JP` | Japanese | | |

Each folder's `language.json` holds its name. :cite[(`media/lua/shared/Translate/<CODE>/language.json:2-3`)] `FR/language.json` is the only one with an `azerty` field. None sets `base`. Note the codes are the game's own, not standard ISO codes: `JP` for Japanese, `CH` for Traditional Chinese, `UA` for Ukrainian and `PTBR` with no underscore.

Pick the code of an existing folder exactly. A mod that ships `pt_br` will be treated as a different, new language, and `getByName` ignoring case means `PTBR` and `ptbr` are the same language but `PT_BR` is not.

## Job 2: add a brand-new language

To add a language the game does not have, make a folder with a new code and a `language.json`.

```
42/media/lua/shared/Translate/
└── EO/
    ├── language.json
    └── ItemName.json
```

`EO/language.json`:

```json
{
    "version": "1",
    "language_name": "Esperanto"
}
```

When the game starts, `Languages.init` scans your mod's `Translate` folder, finds the folder with a `language.json`, and adds the language to the list. It then appears in the language box in Options, sorted by name. If your mod is enabled, a player can pick it.

The game scans a mod's folder for languages :cite[(`zombie/core/Languages.java:34-54`)], and any folder holding `language.json` is added if its name is new. :cite[(`:76-93`)] `version` must be 1 and `language_name` must not be blank. :cite[(`zombie/core/LanguageFile.java:35-39`)] The Options list is built from every available language and sorted by name (the sort is at line 3877). :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3872-3877`)]

### Starting from another language with base

A `base` field in `language.json` makes the game fall back to another language before English.

```json
{
    "version": "1",
    "language_name": "Español (Colombia)",
    "base": "ES"
}
```

Missing strings come from `ES`, then from English. Vanilla does not use this in 42.22, so test it in game before you depend on it. The engine code for it is plain :cite[(`zombie/core/Translator.java:348-362`)], but no shipped language exercises it.

### Fonts and the keyboard

A new language draws with the English fonts unless it has its own font file, and the `azerty` flag appears to do nothing for a mod language.

- **Fonts.** The game loads `media/fonts/EN/fonts.txt`, then, for any other language, `media/fonts/<CODE>/fonts.txt` on top. :cite[(`zombie/ui/TextManager.java:197-209`)] A new language without its own font file draws with the English fonts. Whether those fonts have the glyphs you need was not verified. Scripts with many characters, such as Chinese or Thai, are the likely trouble.
- **AZERTY.** The `azerty` field is read into the language record. :cite[(`zombie/core/LanguageFile.java:34`)] But the keyboard layout check uses a fixed list that contains only `FR` :cite[(`zombie/core/Translator.java:809-816`, used at `zombie/core/Core.java:1169`)], and no code that reads `Language.isAzerty` was found. For a mod language the flag appears to do nothing. Not verified in game.

## What a mod can add

A mod can add strings, replace vanilla strings, add whole languages and name itself in each language.

- Strings for any existing language, in any of the loaded file types.
- A **replacement** for any vanilla string, by using the same key (it wins within its language; see the load-order section of [how translation works](/pz/build-42/modding/translation/how-translation-works)).
- A whole new language with its own `language.json`.
- A different name or description for your mod in each language, with `Mod.json` (`name` and `description`).

## What a mod cannot add

A mod cannot add new file types, per-player server languages, translator credits, `.txt` translation files or text built in code.

- **A new file type or key prefix.** The engine loads a fixed list of file names :cite[(`zombie/core/Translator.java:142-176`)] and routes `getText` by a fixed list of prefixes :cite[(`zombie/core/Translator.java:436-486`)]. A file called `MyMod.json` is never read. Use the existing file with your own key, such as `IGUI_MyMod_Hello` in `IG_UI.json`.
- **Per-player languages on a server.** One language is current at a time. :cite[(`zombie/core/Translator.java:177`)] A server-side `getText` answers in the server's language, never the player's.
- **Translator credits.** `Credits_Translator.json` is vanilla-only: the credits code scans only the install-relative `media/lua/shared/Translate` folder and never looks in mods. :cite[(`zombie/core/CreditsRole.java:264`, `:285-310`)]
- **`.txt` translation files.** Only `.json` is read.
- **Translations that fix text built in code.** If a vanilla screen builds a sentence in Java without a key, there is nothing to override. Not verified for any specific case.

## Language packs that work on any server

A mod made only of translation files is loaded on any server you join, and the server's own mods still win a duplicate key.

When you join a server, the game also loads the translation-only mods you have enabled locally, even if the server does not run them. A mod qualifies when everything under its `media/` folder lives in `media/lua/shared/translate/` and ends in `.txt` or `.json`. :cite[(`zombie/ZomboidFileSystem.java:757-762`, `:784-822`)] The test accepts `.txt` files, but the loader never opens them.

The order matters: translation-only mods are put first and the server's mods are added after them (`toLoad.addAll(GameClient.instance.serverMods)`), so the **server's mods win** a duplicate key. :cite[(`zombie/ZomboidFileSystem.java:760-762`)] This path runs only on a connected client (`GameClient.client`), and it finds your local mods by reading your default mod list (`readDefaultModsTxt`). :cite[(`zombie/ZomboidFileSystem.java:811`)]

So a language pack for another mod's strings should contain only that folder, and nothing else under `media/`.

## Try it

Make an `EO` folder as above with a one-line `ItemName.json`, enable the mod, restart, and open Options. Your language should be in the list.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source and the shipped language folders. Not verified in a running game: the `base` field (no shipped language uses it), glyph coverage of the English fonts for other scripts, the `azerty` flag for mod languages, and text built in Java without a key.
:::
