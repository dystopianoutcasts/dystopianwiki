---
id: build-42-translating-your-mod
slug: translating-your-mod
title: 'Translate your mod: a first working example'
game: pz
version: build-42
section: modding
category: translation
difficulty: beginner
tags:
  - translation
  - how-to
  - beginner
  - json
excerpt: >-
  How to give your mod an English name for an item, a sandbox option and a UI string in about ten minutes, and how to tell in game whether it worked.
last_updated: '2026-11-14'
related_articles:
  - how-translation-works
  - translation-file-types
  - gettext-in-lua
  - adding-a-language
  - translation-troubleshooting
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-13.

**Who this page is for:** [modders starting from the folder](#step-1-make-the-folder) | [modders checking a result](#step-7-check-that-it-worked)

You have a mod, and in game its item shows up as `MyMod.Widget` instead of "Widget". Or the sandbox screen shows `Sandbox_MyMod_Strength`. That raw code is what the game falls back to when it cannot find a translation. Here is how you give it one.

By the end of this page you will have three strings working: an **item name**, a **sandbox option** and a **UI string**. You will not need to know any of the engine details first. If you want those, read [how translation works](/pz/build-42/modding/translation/how-translation-works) afterward.

:::callout[The 1-minute version]{kind=key}
- Make `media/lua/shared/Translate/EN/` inside your mod's version folder (`42`). Do not add a `language.json` for English.
- Item names go in `ItemName.json` as `"MyMod.Widget": "Widget"`.
- Sandbox text goes in `Sandbox.json` under `Sandbox_` plus the option's `translation` value, and the page title is `Sandbox_` plus your `page` value.
- UI text goes in `IG_UI.json` with a key that starts `IGUI_`, and you read it with `getText`.
- Restart the game. Run the game with `-debug`, then search `console.txt` for `Missing translation`. No line with your keys means every lookup worked.
:::

:::callout[Note]{kind=key}
You always write English first. English (`EN`) is the language every other language falls back to, so your `EN` files are the source of truth even if you plan to add other languages later.
:::

:::flow[The eight steps, Step 0 to Step 7]
- Step 0: check what your mod needs
- Step 1: make the folder
- Step 2: name your item
- Step 3: name your sandbox option
- Step 4: add a UI string
- Step 5: use the string in Lua
- Step 6: restart and look in game
- Step 7: check the log
:::

## Step 0: What your mod needs first

This page adds translations to a mod that already exists, and each example needs one thing.

For the three examples you need:

- a `mod.info` file for the mod itself;
- an **item script** that defines `MyMod.Widget` (see the new-item cookbook page), for the item example;
- a **`sandbox-options.txt`** with one option, for the sandbox example (a minimal one is in Step 3).

If you only want the UI string, you need just `mod.info` and the Lua file.

## Step 1: Make the folder

The folder is `Translate/EN/` inside `media/lua/shared/` in your mod's version folder.

Make this path inside the `42` folder. The new folders sit next to any other shared Lua you have.

```
MyMod/
├── mod.info
└── 42/
    └── media/
        └── lua/
            ├── client/
            │   └── MyMod_Hello.lua        <- Step 5 (optional test)
            └── shared/
                └── Translate/
                    └── EN/                <- one folder per language
                        ├── ItemName.json
                        ├── Sandbox.json
                        └── IG_UI.json
```

Why `shared`? The engine looks in this exact path (below), and a server loads translations as well as a client :cite[(`zombie/network/GameServer.java:621-622`)]. Why `EN`? It is the language code for English.

The engine looks for exactly `media/lua/shared/Translate/<CODE>/<File>.json` in every active mod. It builds the path `<root>/media/lua/shared/Translate/<language>/<file>.json` :cite[(`zombie/core/Translator.java:365`)] and runs it for each mod's common folder and version folder. :cite[(`zombie/core/Translator.java:384-401`)]

Notice what you did **not** make: a `language.json`. English already exists in the game, so you only add strings to it. Adding your own `language.json` for `EN` would replace the game's English language record :cite[(`zombie/core/Languages.java:85-93`)]. Leave it out.

## Step 2: Name your item

An item's key is the module name, a dot, then the item name, saved in `EN/ItemName.json`.

Say your item script defines an item called `Widget` in the module `MyMod`. Save this as `EN/ItemName.json`:

```json
{
    "MyMod.Widget": "Widget"
}
```

Line by line:

- `{` and `}` wrap the whole file. Everything between belongs together.
- `"MyMod.Widget"` is the key. The `.` means "the Widget that belongs to MyMod". It must match the item's full type exactly, capitals included.
- `:` separates the key from its text.
- `"Widget"` is what the player sees.
- Every string is in double quotes. Single quotes are not JSON.
- When you add a second line, put a **comma** after the first one. The last line has no comma.

The engine fills an item's display name from `ItemName` with the key being the full type, called while scripts load. :cite[(`zombie/core/Translator.java:608-629`, `zombie/scripting/objects/Item.java:3067`)] The full type is module plus name. :cite[(`zombie/scripting/objects/Item.java:890-892`)] Vanilla example: `"Base.3030Box": "Box of .30-30 Rounds"` :cite[(`media/lua/shared/Translate/EN/ItemName.json:2`)].

## Step 3: Name your sandbox option

A sandbox option's text is found from its `translation` field, so you write the option first and then its `Sandbox_` keys.

Save this minimal file as `42/media/sandbox-options.txt`:

```
VERSION = 1,

option MyMod.Strength
{
    type = integer,
    min = 1,
    max = 10,
    default = 5,
    page = MyMod,
    translation = MyMod_Strength,
}
```

`VERSION = 1` is required. `type`, `min`, `max` and `default` define the option, `page` is the sandbox page it appears on, and `translation` is the name used for its text. The game then asks for the key `Sandbox_` plus the `translation` value. Save `EN/Sandbox.json`:

```json
{
    "Sandbox_MyMod": "My Mod",
    "Sandbox_MyMod_Strength": "Widget Strength",
    "Sandbox_MyMod_Strength_tooltip": "How strong a widget is. Higher is stronger."
}
```

- `Sandbox_MyMod` is the **page title** (`Sandbox_` plus your `page` value). Without it the page shows the raw key.
- `Sandbox_MyMod_Strength` is the option's name.
- `_tooltip` is optional hover help, and `_help` is also looked up as help text. For an enum option, each choice is `Sandbox_<name>_option1`, `_option2` and so on.

If the option has no `translation` field, the game uses the option's short name instead. Setting `translation` yourself keeps the key predictable.

:::callout[Never put a // comment in sandbox-options.txt]{kind=warn}
The game joins every line of the file into one long line before it removes comments, so a `//` comment does not stop at the end of its line: it swallows everything after it, and every option below it disappears. Use `/* ... */` comments instead. :cite[(`zombie/sandbox/CustomSandboxOptions.java:71-72`, `:89`)]
:::

The engine asks for `"Sandbox_" + (translation or short name)`. :cite[(`zombie/SandboxOptions.java:1368`)] It adds `_tooltip` :cite[(`:1373`)] and `_help` :cite[(`:1473`)], both with `getTextOrNull`, and builds the enum keys `_option<N>`. :cite[(`:1656`)] The page title is looked up with `getText("Sandbox_" .. page.name)`. :cite[(`media/lua/client/OptionScreens/ServerSettingsScreen.lua:5151`)] The loader reads the `page` and `translation` fields :cite[(`zombie/sandbox/CustomSandboxOption.java:39`, `:44`)], the `type` values :cite[(`zombie/sandbox/CustomSandboxOptions.java:124-132`)], the integer fields `min`, `max` and `default` :cite[(`zombie/sandbox/CustomIntegerSandboxOption.java:25-27`)], and `VERSION`. :cite[(`zombie/sandbox/CustomSandboxOptions.java:92`)]

The engine reads `media/sandbox-options.txt` from the mod's version folder first and from the common folder only if the version folder has none, so `42/media/` is the safe place. :cite[(`zombie/sandbox/CustomSandboxOptions.java:38-43`)] The exact punctuation was written from how the parser reads these fields, not copied from a shipped mod, so test it in game.

## Step 4: Add a UI string

Text for your own panels goes in `IG_UI.json` under a key that starts `IGUI_`.

Save `EN/IG_UI.json`:

```json
{
    "IGUI_MyMod_Hello": "Hello, survivor. Your widget is ready."
}
```

The prefix matters. The engine picks the file by the first letters of the key, so `IGUI_MyMod_Hello` goes in `IG_UI.json`. A key that starts with something else, such as `MyMod_Hello`, will load but can never be found. [The file types reference](/pz/build-42/modding/translation/translation-file-types) lists every prefix.

The engine sends `IGUI_` keys to the `IG_UI` map. :cite[(`zombie/core/Translator.java:444-445`)] Vanilla example: `"IGUI_invpanel_Type": "Item"` :cite[(`media/lua/shared/Translate/EN/IG_UI.json:2`)].

## Step 5: Use the string in Lua

Items and sandbox options need no Lua, but your own UI string you ask for yourself with `getText`.

Save this as `42/media/lua/client/MyMod_Hello.lua`:

```lua
-- Run this when the player enters the world
Events.OnGameStart.Add(function()
    -- getText finds the key in the player's language
    -- and print writes it to console.txt
    print(getText("IGUI_MyMod_Hello"))
end)
```

`getText` takes the key and returns the text. `print` writes it to the game's log file so you can see it. In your own panels you would pass the result to a label instead. `getText` is a global Lua function. :cite[(`zombie/Lua/LuaManager.java:8516-8523`)]

## Step 6: See it in game

Restart the game completely, because translation files load at start-up, not while you play.

1. **Restart.** To skip restarts while testing, launch with `-debugtranslation` and press **F12** in game to reload the files; see [how translation works](/pz/build-42/modding/translation/how-translation-works).
2. Enable your mod and start a new or existing game.
3. Open the sandbox settings for a new game. You should see "Widget Strength" on your page.
4. Spawn the item (use the debug item list if you have debug mode on) and look at its name in your inventory.
5. Open `console.txt`, in the `Zomboid` folder inside your user folder. Search for "Hello, survivor".

## Step 7: Check that it worked

Run the game in debug mode (the `-debug` launch option), search `console.txt` for `Missing translation`, and no line with your keys means every lookup succeeded.

In debug mode the game logs one line for each key it cannot find:

```
ERROR: Missing translation "IGUI_MyMod_Hello"
```

The line is printed only when the game runs in debug mode, and only once per key. :cite[(`zombie/core/Translator.java:494-497`)]

Search `console.txt` for `Missing translation`. No line with your keys means every lookup succeeded. Debug mode also has a "translation prefix" option that adds a `*` in front of text that was found and a `!` in front of text that was missing, so you can spot problems on screen :cite[(`zombie/core/Translator.java:488`, `zombie/core/Translator.java:507`)]. Where that switch sits in the debug menu was not verified.

If something looks wrong, go to [troubleshooting](/pz/build-42/modding/translation/translation-troubleshooting). The usual suspects are a missing comma, a wrong folder name or a typo in a key.

## Try it

Change `"Widget"` to your own name, restart, and spawn the item.

Then make a second folder, `FR`, with an `ItemName.json` of its own, and read [adding a language](/pz/build-42/modding/translation/adding-a-language).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source and vanilla files. Not verified: the exact punctuation of the sandbox example (written from how the parser reads the fields, not copied from a shipped mod, so test it in game) and where the translation-prefix switch sits in the debug menu.
:::
