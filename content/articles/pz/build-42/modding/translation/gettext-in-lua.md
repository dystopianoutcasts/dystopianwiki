---
id: build-42-gettext-in-lua
slug: gettext-in-lua
title: 'getText in Lua: placeholders, missing keys and item names'
game: pz
version: build-42
section: modding
category: translation
difficulty: intermediate
tags:
  - translation
  - lua
  - gettext
  - placeholders
excerpt: >-
  Why getText prints the raw key on screen, how %1 placeholders work, what comes back for a missing key, and how an item's DisplayName relates to ItemName.json.
last_updated: '2026-11-14'
related_articles:
  - how-translation-works
  - translation-file-types
  - translating-your-mod
  - adding-a-language
  - translation-troubleshooting
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-13.

**Who this page is for:** [modders calling getText](#the-functions-you-can-call-from-lua) | [modders naming items](#how-an-items-displayname-relates-to-itemnamejson)

Every time a vanilla Lua file shows words to the player, it calls `getText`. The vanilla Lua folder calls it more than six thousand times. If you have ever written `getText("UI_something")` and watched the screen print `UI_something`, this page explains why, and what else the engine offers.

:::callout[The 1-minute version]{kind=key}
- `getText(key, ...)` returns the text, or the key itself if it is missing. `getTextOrNull` returns `nil` instead and stays quiet in the log.
- Write `%1` to `%9` for values and pass them as extra arguments. Write `%%` for a real percent sign.
- A raw key on screen means no translation was found.
- An item's name is `ItemName.json` first, then the script's `DisplayName`, then the full type. Only `ItemName.json` can be translated.
- On a server, `getText` answers in the server's language, so send keys and let clients call it.
:::

:::facts
- **Calls in vanilla Lua** more than six thousand
- **Placeholders** `%1` to `%9`; `%%` for a literal percent
- **Global translation functions** 4, plus 2 file-specific lookups
:::

## The functions you can call from Lua

Four translation functions are plain globals, available anywhere in client, shared and server Lua, and two more look up one specific file.

| Function | Returns | If the key is missing |
|---|---|---|
| `getText(key, ...)` | The text, with arguments filled in | The key itself |
| `getTextOrNull(key, ...)` | The text, with arguments filled in | `nil` |
| `getItemText(name)` | An older item-name lookup in the `Items` map | The name you passed in |
| `getTextMediaEN(key)` | The English text of a recorded-media (`RM_`) key | The key itself |

Two more are global lookups for specific files:

| Function | Reads | If missing |
|---|---|---|
| `getItemNameFromFullType("Module.Type")` | `ItemName.json`, then the item script | The script's `DisplayName`, or the full type |
| `getRecipeDisplayName(name)` | `Recipes.json` | The recipe name |

The globals are declared for `getText`, `getTextOrNull`, `getItemText`, `getTextMediaEN` and `getItemNameFromFullType` :cite[(`zombie/Lua/LuaManager.java:8516-8556`)] and for `getRecipeDisplayName`. :cite[(`zombie/Lua/LuaManager.java:8792-8800`)] The behavior of `getText` is one method :cite[(`zombie/core/Translator.java:517-519`)], and `getTextOrNull` is another. :cite[(`:546-549`)] The older item lookup is `getDisplayItemName` :cite[(`:603-606`)], the English media lookup is `getTextMediaEN` :cite[(`:818-851`)], and the full-type and recipe lookups sit beside them. :cite[(`:608-629`, `:699-710`)]

The whole `Translator` class is also exposed to Lua :cite[(`zombie/Lua/LuaManager.java:1882`)]. Vanilla Lua calls these through it: `Translator.getText`, `Translator.getRecipeName`, `Translator.getMoveableDisplayName`, `Translator.getLanguage():name()`, `Translator.getAvailableLanguage()`, `Translator.setLanguage` and `Translator.loadFiles`. Other public static functions such as `getFluidText` exist, but whether each is callable from Lua was not verified.

## getText versus getTextOrNull

Use `getText` when the string must exist and you want something visible if it does not, and `getTextOrNull` when a missing string is a normal case you handle yourself.

```lua
-- getText: always gives you a string
local title = getText("IGUI_MyMod_Hello")

-- getTextOrNull: gives you nil when the key is not defined
local tip = getTextOrNull("Tooltip_MyMod_Widget")
if tip then
    -- only show a tooltip if the translator wrote one
    label:setName(tip)
end
```

The engine uses `getTextOrNull` for optional text, such as a sandbox option's tooltip and the key names in the keyboard settings. :cite[(`zombie/SandboxOptions.java:1373`, `zombie/core/input/Input.java:37`)]

`getTextOrNull` also stays quiet. It does not write the "Missing translation" line to the log that `getText` writes. :cite[(`zombie/core/Translator.java:489-492`)]

## Placeholders: %1, %2 and %%

Write `%1` to `%9` in the JSON for a value and pass the value as an extra argument, and write `%%` for a real percent sign.

A translation often needs a hole for a value, such as "Learned %1". You write `%1` in the JSON and pass the value as an extra argument.

```json
{ "IGUI_HaloNote_LearnedRecipe": "Learned %1" }
```

```lua
-- %1 becomes the recipe's display name
getText("IGUI_HaloNote_LearnedRecipe", getRecipeDisplayName(recipe))
```

Vanilla uses exactly this key and call. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:1849`, `media/lua/server/XpSystem/XpUpdate.lua:280`)]

The rules, all from `zombie/core/Translator.java`:

- **Numbering is 1 to 9.** When a file loads, every `%1` to `%9` is rewritten to Java's `%1$s` form, and every `%%` is kept as a literal percent sign. :cite[(`:178`, `:917-918`)] Any other `%` is left alone.
- **Position, not order.** Because the number picks the argument, a translator can reorder them: `"%2 of %1"` is fine in a language that puts words the other way around.
- **Write `%%` for a real percent sign.** The text is run through Java's formatter every time, even with no arguments :cite[(`:517-519`, `:523`)], and a lone `%` followed by a letter looks like a formatting code. Write `"50%% off"`.
- **Numbers print cleanly.** A whole number passed as a Lua number prints without ".0" (`5`, not `5.0`). A `nil` argument becomes an empty string. :cite[(`:551-562`)]
- **Too few arguments.** If the text asks for `%2` and you pass one value, the game logs "Missing arguments" and returns the text unfilled. :cite[(`:524-530`)]
- **Extra arguments** are ignored.
- **Bad formats.** If the formatter rejects the string, release builds log a warning and try to repair it by doubling stray percent signs. If the repair fails you get the raw text. Development builds throw instead. :cite[(`:531-542`)]

Vanilla uses several holes at once in `"Sandbox_MinMaxDefault": "Min: %1 Max: %2 Default: %3"` :cite[(`Sandbox.json:598`)], and the sandbox code fills all three. :cite[(`zombie/SandboxOptions.java:1479`)]

## Line breaks

`getText` turns `<br>` or `<BR>` into a newline, and you can also write `\n` in the JSON.

If a translated string contains `<br>` or `<BR>`, `getText` turns it into a newline before returning it. :cite[(`zombie/core/Translator.java:510-513`)] You can also write `\n` in the JSON, which JSON turns into a newline itself. Other tags such as `<LINE>` or `<SIZE:small>` are not touched by the translator. They are read later by the rich-text panels that show the text.

## What a missing key does

A missing key makes `getText` return the key itself and `getTextOrNull` return `nil`.

Follow a key that is not found:

:::flow[A key that is not found]
- Pick a map from the prefix (`IGUI_` leads to `IG_UI`); an unknown prefix finds nothing
- No entry in the map: `getText` returns the key itself, `getTextOrNull` returns `nil`
- `getText` in debug mode logs `ERROR: Missing translation "<key>"` once per key
- With the debug translation-prefix option on, found text gets `*` and missing text `!`
:::

All of this happens in one method. :cite[(`zombie/core/Translator.java:430-515`)] The log line is written once per key :cite[(`:494-497`)], the key is returned as the result :cite[(`:506`)], and the `*` and `!` markers are added to found and missing text. :cite[(`:488`, `:507`)]

So a raw key such as `IGUI_MyMod_Hello` on screen means "no translation was found". Calling `getText` on text that is not a key at all, such as `getText("Hello")`, simply returns `"Hello"`. Vanilla relies on that when it passes an item's display name through `getText`. :cite[(`zombie/inventory/InventoryItem.java:5017-5020`)]

## When your Lua runs

Translations load before Lua starts, so you can call `getText` at the top level of a file, but call it when you show the text rather than storing the result.

At game start the loader runs first and Lua is initialized after it. :cite[(`zombie/GameWindow.java:984-986`)] When the player changes language in Options, Lua is reset so your files run again and pick up the new language. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:1834-1836`)] Even so, the safest habit is to call `getText` at the moment you show the text, not to store the result in a variable that lives for the whole session.

On a server, `getText` returns text in the **server's** language, and it only knows the mods the server loaded. Send keys to clients and let them call `getText`. See [how translation works](/pz/build-42/modding/translation/how-translation-works).

## How an item's DisplayName relates to ItemName.json

`ItemName.json` wins when it has the item, then the script's `DisplayName`, then the full type, so only `ItemName.json` can be translated.

An item script can have a `DisplayName` line, and the translation system has `ItemName.json`. They are not rivals. They stack, in this order:

:::flow[How an item gets its display name]
- The script is read and `DisplayName` is stored on the script item
- When scripts finish loading, the engine asks `Translator.getItemNameFromFullType` for `Module.Type`
- The `ItemName` map is checked for the full type; if found, that text wins
- If not found, the script's `DisplayName`, then the full type itself; the result is remembered
:::

The script stores `DisplayName` when it is read :cite[(`zombie/scripting/objects/Item.java:1976-1977`)], the engine asks for the translated name when scripts finish loading :cite[(`zombie/scripting/objects/Item.java:3067`)], and the fallback to `DisplayName` and then the full type is in the lookup. :cite[(`zombie/core/Translator.java:608-629`, `zombie/scripting/objects/Item.java:501-503`)]

The result is stored back as the item's display name, which is what the inventory shows.

| You wrote | Player sees (English) | Player sees (a language with no entry) |
|---|---|---|
| `ItemName.json` has `"MyMod.Widget": "Widget"` | Widget | Widget (falls back to `EN`) |
| No `ItemName.json` entry, script says `DisplayName = Widget` | Widget | Widget, in every language |
| Neither | `MyMod.Widget` | `MyMod.Widget` |

So `DisplayName` is a handy English default, but only `ItemName.json` can be translated. For any item you want in several languages, give it an `ItemName.json` entry and treat `DisplayName` as a placeholder.

Recipe names work the same way without a script fallback. `getRecipeDisplayName(name)` looks in `Recipes.json` and returns the recipe name when the entry is missing or empty. :cite[(`zombie/core/Translator.java:699-710`)]

## Quick checklist

Check these five things before you blame the engine.

- Key prefix and file agree (`IGUI_` in `IG_UI.json`).
- Placeholders are `%1` to `%9`. A literal percent is `%%`.
- Pass as many arguments as the text has holes.
- Use `getTextOrNull` when absence is normal.
- Something shows a raw key? See [troubleshooting](/pz/build-42/modding/translation/translation-troubleshooting).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 engine source and vanilla Lua. Not verified: whether every public `Translator` function is callable from Lua.
:::
