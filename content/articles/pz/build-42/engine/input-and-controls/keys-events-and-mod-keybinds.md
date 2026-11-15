---
id: build-42-keys-events-and-mod-keybinds
slug: keys-events-and-mod-keybinds
title: 'Keys, events and mod keybinds'
game: pz
version: build-42
section: engine
category: input-and-controls
difficulty: intermediate
tags:
  - engine
  - input
  - keybinds
  - events
  - modding
  - lua
excerpt: >-
  Which key event to use, how to read a binding, and how to add a key to your mod that players can rebind, with a complete example from an empty folder.
last_updated: '2026-11-15'
related_articles:
  - how-controls-and-keybinds-work
  - inside-input
  - controllers-and-joypads
  - mouse-and-aiming
  - input-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#which-key-event-to-use) | [server owners](#a-note-for-server-owners) | players should start at [How controls and keybinds work](/pz/build-42/engine/input-and-controls/how-controls-and-keybinds-work)

:::callout[The 1-minute version]{kind=key}
- `OnKeyStartPressed` fires when a key goes down, `OnKeyKeepPressed` each frame it stays down, and `OnKeyPressed` when it comes back up. All three pass the key code.
- To ask "is this key my action's key", use `getCore():isKey(name, key)`. It looks at the binding's modifiers. Comparing `key` with `getCore():getKey(name)` does not.
- The easiest key a player can rebind is a mod option made with `PZAPI.ModOptions:create` and `addKeyBind`. It shows on the MODS tab of the options screen and is saved in `ModOptions.ini` (and, by reading the code, also in `keysB42.ini`).
- The vanilla way is to append to the `keyBinding` table on `OnGameBoot`. The entry then shows on the KEY BINDINGS tab, and the label needs a translation.
- The options screen warns about a duplicate key only when a player rebinds. It does not check the default key you ship, so pick one that vanilla does not use.
- Not run in a game: the example below is read against the 42.22 Lua, so test it before you ship it.
:::

:::facts
- **Key events** `OnKeyStartPressed`, `OnKeyKeepPressed`, `OnKeyPressed`
- **Read a binding** `getCore():getKey`, `getAltKey`, `getKeyBinding`, `isKey`
- **Mod option key** `PZAPI.ModOptions:create`, then `addKeyBind(id, name, key, tooltip)`
- **Saved in** `ModOptions.ini` (mod options, which also reach `keysB42.ini`) or `keysB42.ini` (the `keyBinding` table)
- **Example default key** `Keyboard.KEY_F7`, which a search of the vanilla Lua finds unused
:::

## Which key event to use

Use `OnKeyStartPressed` when the action should happen the moment the key goes down, and `OnKeyPressed` only when releasing the key is the trigger.

The three events fire from `GameKeyboard.update` for each key, once per frame, and each passes the key code. :cite[(`zombie/input/GameKeyboard.java:44-92`)] `OnKeyPressed` fires on release, `OnKeyKeepPressed` fires while the key stays down, and `OnKeyStartPressed` fires on the frame it went down. :cite[(`zombie/input/GameKeyboard.java:44-60`, `zombie/input/GameKeyboard.java:68-76`, `zombie/input/GameKeyboard.java:78-87`)]

| Event | Fires | Vanilla Lua listeners | Code |
|---|---|---|---|
| `OnKeyStartPressed` | when the key goes down | 11 | :cite[(`api/events.jsonl:111`)] |
| `OnKeyKeepPressed` | each frame the key stays down | 8 | :cite[(`api/events.jsonl:109`)] |
| `OnKeyPressed` | when the key is released | 32 | :cite[(`api/events.jsonl:110`)] |

Mouse buttons come through the same events as codes from 10000. :cite[(`zombie/ui/UIManager.java:711-724`)] The ordering rules and the mouse differences are on [Inside input](/pz/build-42/engine/input-and-controls/inside-input).

Several things can keep your handler from running:

- The key events are skipped while `noEventsWhileLoading` is true, and `OnKeyPressed`, `OnKeyKeepPressed` and `OnKeyStartPressed` are skipped while `doLuaKeyPressed` is false. :cite[(`zombie/input/GameKeyboard.java:50`, `zombie/input/GameKeyboard.java:58`, `zombie/input/GameKeyboard.java:73`, `zombie/input/GameKeyboard.java:85`)]
- A UI element that wants key events can consume the key. :cite[(`zombie/ui/UIManager.java:1450-1481`)]
- A text box that is taking text stops the events, and `isKeyDown` answers false. :cite[(`zombie/input/GameKeyboard.java:39`, `zombie/input/GameKeyboard.java:132-134`)]
- Another mod can call `GameKeyboard.eatKeyPress(key)`, which swallows the next release of that key. :cite[(`zombie/input/GameKeyboard.java:45-48`, `zombie/input/GameKeyboard.java:186-190`)]

## Read a binding

A binding is looked up by its name, and `isKey` is the call that respects the modifiers.

`getCore():getKey(name)` returns the primary key code and `getAltKey(name)` the alternate one, and both take either a name or a `KeybindId`. :cite[(`zombie/core/Core.java:2421-2427`, `zombie/core/Core.java:2464-2470`)] `getKeyBinding(name)` returns the whole record, with `keyValue`, `altKey`, `shift`, `ctrl` and `alt`. A name that was never registered gives an empty binding. :cite[(`zombie/core/Core.java:2429-2435`, `zombie/core/Core.java:388`, `zombie/core/Core.java:4530`)]

`getCore():isKey(name, key)` is true when the key is the primary or the alternate key and the modifiers fit. It is false when the binding has no key at all. :cite[(`zombie/core/Core.java:2412-2419`, `zombie/core/Core.java:2365-2375`)] Vanilla code uses it inside an `OnKeyPressed` handler. :cite[(`media/lua/client/Foraging/ISSearchManager.lua:1461-1479`)]

Two other calls read the held state. `GameKeyboard.isKeyDown(name)` is true while either key of the binding is down and the modifiers fit. :cite[(`zombie/input/GameKeyboard.java:139-142`, `zombie/input/GameKeyboard.java:208-210`)] Modifiers work like this: a binding that asks for Shift is invalid unless Shift is down, and a plain binding on the same key is invalid while a binding with matching modifiers exists. :cite[(`zombie/core/Core.java:2379-2402`)]

## Add a key players can rebind

There are two routes, and the mod options route is the shorter one.

**Route 1: a mod option.** `PZAPI.ModOptions:create(id, title)` makes an options page for your mod, and `addKeyBind(id, name, key, tooltip)` adds a key button to it. :cite[(`media/lua/client/PZAPI/ModOptions.lua:182-204`, `media/lua/client/PZAPI/ModOptions.lua:247-253`)] The page appears on the MODS tab, and the button opens the same "press a key" box as the vanilla keys. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:2790-2800`, `media/lua/client/OptionScreens/MainOptions.lua:2982-3016`, `media/lua/client/OptionScreens/MainOptions.lua:3640-3656`)]

Read the key back with `options:getOption(id):getValue()`. :cite[(`media/lua/client/PZAPI/ModOptions.lua:24-26`, `media/lua/client/PZAPI/ModOptions.lua:191`)] That value changes only when the player saves the options. Save copies the button's key into the option and writes the file. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3741-3761`, `media/lua/client/PZAPI/ModOptions.lua:259-281`)]

Some limits come from reading the code, and none were tested in a game:

- The saved line holds only the key number, so a Shift, Ctrl or Alt the player chose is not saved for a mod key. :cite[(`media/lua/client/PZAPI/ModOptions.lua:276-281`)]
- The saved value is loaded into the option when the options screen is built, so read the value inside your handler, not once when your file loads. :cite[(`media/lua/client/PZAPI/ModOptions.lua:292-333`, `media/lua/client/OptionScreens/MainOptions.lua:2790-2791`)]
- The key button has no field for a controller input. :cite[(`media/lua/client/PZAPI/ModOptions.lua:182-204`)]

**Route 2: the `keyBinding` table.** Vanilla's foraging code appends a heading and a binding to `keyBinding` when `OnGameBoot` fires, and the options screen builds its rows from that table. :cite[(`media/lua/client/Foraging/ISSearchManager.lua:1472-1481`, `media/lua/client/OptionScreens/MainOptions.lua:3467-3512`)] A mod can do the same. The options screen then writes the key to `keysB42.ini` with the vanilla ones, and each row's label is read from a translation named `UI_optionscreen_binding_` plus the binding's name. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3701-3737`, `media/lua/client/OptionScreens/MainOptions.lua:2172-2177`)] A missing translation shows the key text itself. :cite[(`zombie/core/Translator.java:489-506`)] The mod must also ship that translation. How a mod's translation files are laid out is not covered here.

```lua
-- Route 2 sketch, modeled on the vanilla foraging code. Not a full mod.
local function initBinds()
    table.insert(keyBinding, { value = "[KeyPing]" })
    table.insert(keyBinding, { value = "KeyPing_Ping", key = Keyboard.KEY_F7 })
end
Events.OnGameBoot.Add(initBinds)

local function onKeyPressed(key)
    if getCore():isKey("KeyPing_Ping", key) then
        -- do the action
    end
end
Events.OnKeyPressed.Add(onKeyPressed)
```

## A complete example, from an empty folder

This mod adds one key, F7, on the MODS tab. When you press it, a note with your position floats over your head. It follows the layout of the other mod pages on this wiki. The steps are read from the code, not run in a game.

**1. Make the folders.** Put the mod in the Workshop folder, with the mandatory `common` folder and a `42` folder:

```
Zomboid/Workshop/KeyPing/
  Contents/
    mods/
      KeyPing/
        common/                  <- must exist; empty is fine
        42/
          mod.info
          media/
            lua/
              client/
                KeyPing.lua
```

**2. Write `mod.info`.** Plain text, every key lowercase:

```
name=Key Ping
id=KeyPing
description=Press F7 to show your position.
```

**3. Write `KeyPing.lua`.** It goes in the `client` folder because it reads a key on the player's own machine:

```lua
-- 42/media/lua/client/KeyPing.lua
local options = PZAPI.ModOptions:create("KeyPing", "Key Ping")
options:addKeyBind("ping", "Ping my position", Keyboard.KEY_F7, "Shows your position above your head.")

local function onKeyStartPressed(key)
    local player = getPlayer()
    if not player then return end
    if key ~= options:getOption("ping"):getValue() then return end
    player:setHaloNote("Ping: " .. math.floor(player:getX()) .. ", " .. math.floor(player:getY()))
end

Events.OnKeyStartPressed.Add(onKeyStartPressed)
```

**4. Enable the mod and test.** Enable Key Ping in the game's Mods screen before you load a save. The options screen builds the MODS tab once, and only when some mod has options, so you may need to restart the game after enabling the mod before the tab shows (not verified). :cite[(`media/lua/client/OptionScreens/MainScreen.lua:177`, `media/lua/client/OptionScreens/MainOptions.lua:409-411`)] Then load a save and press F7. A note with your position should float over your head. To rebind, open the options screen, choose the MODS tab, click the Key Ping button, press a new key and press Save. This was not run in a game.

Why each line is there:

- `PZAPI.ModOptions:create("KeyPing", "Key Ping")` makes the page, with the id `KeyPing` and the title "Key Ping". The id is written into the saved file, and the title is the heading on the MODS tab. :cite[(`media/lua/client/PZAPI/ModOptions.lua:247-253`, `media/lua/client/PZAPI/ModOptions.lua:264`, `media/lua/client/OptionScreens/MainOptions.lua:2800-2801`)]
- Use a plain, untranslated name for the keybind option. The button's internal name is the raw `option.name`, but the label is stored under its translated text, and the rebind code compares the two, so a translated name leaves nothing to bind and rebinding errors (read in the code, not run). :cite[(`media/lua/client/OptionScreens/MainOptions.lua:2985-2992`, `media/lua/client/OptionScreens/MainOptions.lua:3801-3819`, `media/lua/client/ISUI/ISSetKeybindDialog.lua:86-93`)] `addKeyBind` takes the option id, a name, the default key and a tooltip. The name is looked up as a translation, and an unknown name shows as written. :cite[(`media/lua/client/PZAPI/ModOptions.lua:182-183`, `media/lua/client/OptionScreens/MainOptions.lua:2985`, `zombie/core/Translator.java:489-506`)]
- `Keyboard.KEY_F7` is one of the key constants the game exposes to Lua. :cite[(`zombie/Lua/LuaManager.java:1518-1531`)] A search of the vanilla Lua for `KEY_F7` finds no use, but that does not prove that no mod or numeric key code uses it.
- `OnKeyStartPressed` fires when the key goes down, so the note appears at once. :cite[(`zombie/input/GameKeyboard.java:78-87`)]
- `setHaloNote` shows text over the character on this machine only. :cite[(`zombie/characters/IsoGameCharacter.java:6998-6999`)]

## Conflicts with other mods

Mods can end up on one key, and the game only helps when a player rebinds.

The options screen checks a new key against every row on the screen, mod keys included, and offers Keep Both, Assign No Key or Cancel. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3794-3815`, `media/lua/client/OptionScreens/MainOptions.lua:3006-3016`)] It does not check the default key a mod ships, so two mods that both default to F7 both fire on F7 (read, not run in a game). The box also asks for the other action's label by `UI_optionscreen_binding_` plus its name, which a route 1 key does not have, so that label may show as raw text. :cite[(`media/lua/client/ISUI/ISDuplicateKeybindDialog.lua:16-17`, `zombie/core/Translator.java:489-506`)]

Use names no other mod is likely to use. Route 1 ids are kept in one dictionary, so a second mod with the same options id replaces the first one's entry in the lookup. :cite[(`media/lua/client/PZAPI/ModOptions.lua:247-253`)] For route 2, the engine keeps one binding for each name, so a later binding with the same name replaces the earlier one. :cite[(`zombie/core/Core.java:2442-2458`)]

## A note for server owners

> **Warning:** A key press is a client event. If a mod's key sends a command to the server, the server has to check that the player is allowed to do it, because the server cannot see the keyboard.

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 Java and Lua, and the example was not run in a game. Not verified: whether the MODS tab shows in the session where a mod was just enabled, how a controller user opens the HelloPad world menu (on the controllers page), what the options screen shows for a mod key whose name has no translation beyond the raw text, how translation files for a mod's route 2 labels are laid out, and whether two mods with the same default key both fire as the code suggests.
:::
