---
id: build-42-how-controls-and-keybinds-work
slug: how-controls-and-keybinds-work
title: 'How controls and keybinds work'
game: pz
version: build-42
section: engine
category: input-and-controls
difficulty: beginner
tags:
  - engine
  - input
  - keybinds
  - controller
  - aiming
excerpt: >-
  The default keys, how to change them and where they are saved, what a controller can do, why two actions can share a key, and how aiming works with a mouse or a stick.
last_updated: '2026-11-15'
related_articles:
  - inside-input
  - keys-events-and-mod-keybinds
  - controllers-and-joypads
  - mouse-and-aiming
  - input-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [players](#change-a-key) | [players with a controller](#using-a-controller) | [modders](/pz/build-42/engine/input-and-controls/inside-input)

:::callout[The 1-minute version]{kind=key}
- Open the options screen and pick the KEY BINDINGS tab. Click the button next to an action, then press the key, mouse button, or Shift, Ctrl or Alt plus a key that you want.
- If another action already uses that key with the same modifiers, the game asks whether to keep both, clear the other action or cancel. Nothing is stored until you save or accept the options. (Read from the Lua, not run in a game.)
- Your keys are written to a file called `keysB42.ini` in the `Lua` folder of the game's cache folder. Keys that mods add are written to `ModOptions.ini` and, by reading the code, also to `keysB42.ini`.
- Some vanilla actions share a default key, such as Reload Weapon, Sharpen Weapon and Rotate Building on R. The shared defaults are listed below.
- A controller has its own tab, with presets, and its own file for each controller. Zoom In, Zoom Out and Walk To have no default controller input.
- On the keyboard, Aim is held with Left Control or the right mouse button by default. With a firearm in hand and the precise-aim control down, the game shows a reticle instead of the cursor.
:::

:::facts
- **Rebinding tabs** KEY BINDINGS (keyboard and mouse), CONTROLLER (controller), MODS (mod options and mod keys)
- **Key file** `keysB42.ini`, in the cache folder's `Lua` folder
- **Mod key file** `ModOptions.ini`, same folder (mod keys also appear in `keysB42.ini`)
- **Controller files** `.config` files in a `joypads` folder and `.xml` files in an `InputBindings` folder, in the cache folder
- **Modifiers** one of Shift, Ctrl or Alt for each key you bind
:::

## Change a key

Rebinding is done in the options screen on the KEY BINDINGS tab, one action at a time.

The tab lists the actions under headings such as Player Control, Combat and Vehicle, with a button that shows the current key. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:2149-2194`, `media/lua/shared/Translate/EN/UI.json:146`)]

Here is the whole job in steps. These steps are read from the Lua and were not run in a game.

1. Open the options screen and choose the KEY BINDINGS tab. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:2143-2149`)]
2. Click the button next to the action. A box opens that says "Press any key to assign" and offers the buttons Assign No Key, Reset To Default and Cancel. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3640-3664`, `media/lua/client/ISUI/ISSetKeybindDialog.lua:9-44`, `media/lua/shared/Translate/EN/UI.json:652-655`)]
3. Press the key. You can hold Shift, Ctrl or Alt first, and only one modifier is kept. A mouse button also works. :cite[(`media/lua/client/ISUI/ISSetKeybindDialog.lua:103-120`)]
4. If another action already uses that key with the same modifiers, a second box offers Keep Both, Assign No Key or Cancel. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3794-3815`, `media/lua/client/ISUI/ISDuplicateKeybindDialog.lua:9-44`, `media/lua/shared/Translate/EN/UI.json:653-656`)]
5. Press Save or Accept in the options screen. The keys are written then. If you go Back instead, the game may first show a confirm dialog, and then it reloads the keys from the file and drops your changes. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3680-3698`, `media/lua/client/OptionScreens/MainOptions.lua:3741-3742`)]

The Save button is only active after something changed. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3629-3635`)]

## Where your keys are saved

Your keys are saved in a text file called `keysB42.ini`, in the `Lua` folder under the game's cache folder.

The file starts with `VERSION=2`, then has one line per action in the form `Name=key:<number>`, with `altCode`, `shift`, `ctrl` and `alt` parts added only when they are set. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3701-3737`)] The game writes it through `getFileWriter`, which puts the file in the cache folder's `Lua` folder. :cite[(`zombie/Lua/LuaManager.java:6697-6700`, `zombie/Lua/LuaManager.java:1273-1281`)] Where the cache folder is on your computer is not in the capture (not verified).

If the game finds an old `keys.ini` and no `keysB42.ini`, it reads the old file instead. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3514-3521`)]

Keys that a mod adds with the mod options API are written to `ModOptions.ini` in the same folder, and they appear on the MODS tab. They are also written to `keysB42.ini`, because the save loop covers every row on the screen, mod rows included, and the game registers each one under its label name (read, not run in a game). :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3016`, `media/lua/client/OptionScreens/MainOptions.lua:3701-3737`)] :cite[(`media/lua/client/PZAPI/ModOptions.lua:259-290`, `media/lua/client/OptionScreens/MainOptions.lua:2790-2793`, `media/lua/client/OptionScreens/MainOptions.lua:2982-3016`)] That tab exists only when at least one mod has registered options. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:409-411`)]

## Default keys

The vanilla defaults come from one Lua file, and the game builds the options screen from it.

The file lists 82 actions under 10 headings, and 13 of those actions have no default key. One more action, Toggle Search Mode, is added by a foraging script with key code 207. :cite[(`media/lua/shared/keyBinding.lua:6-378`, `media/lua/client/Foraging/ISSearchManager.lua:1472-1475`)] The labels below are the English names of the actions. :cite[(`media/lua/shared/Translate/EN/UI.json`)] The full list, with the UI, Hotkeys, Multiplayer and Debug headings, is on [Input reference](/pz/build-42/engine/input-and-controls/input-reference).

**Player Control**

| Action | Default | Code |
|---|---|---|
| Forward | W | :cite[(`media/lua/shared/keyBinding.lua:12-13`)] |
| Backward | S | :cite[(`media/lua/shared/keyBinding.lua:16-17`)] |
| Left | A | :cite[(`media/lua/shared/keyBinding.lua:20-21`)] |
| Right | D | :cite[(`media/lua/shared/keyBinding.lua:24-25`)] |
| Run | Left Shift | :cite[(`media/lua/shared/keyBinding.lua:28-29`)] |
| Interact | E | :cite[(`media/lua/shared/keyBinding.lua:32-33`)] |
| Sprint | Left Alt (Left Command on macOS) | :cite[(`media/lua/shared/keyBinding.lua:36-37`)] |
| Rotate Building | R | :cite[(`media/lua/shared/keyBinding.lua:40-41`)] |
| Toggle Mode | Tab | :cite[(`media/lua/shared/keyBinding.lua:44-45`)] |
| Cancel Action | Escape | :cite[(`media/lua/shared/keyBinding.lua:48-49`)] |
| Walk To | Y | :cite[(`media/lua/shared/keyBinding.lua:52-53`)] |
| Let Go of Rope Being Climbed | none | :cite[(`media/lua/shared/keyBinding.lua:56-57`)] |
| Sit On Ground | none | :cite[(`media/lua/shared/keyBinding.lua:60-61`)] |

**Combat**

| Action | Default | Code |
|---|---|---|
| Attack/Click | Left Click | :cite[(`media/lua/shared/keyBinding.lua:67-68`)] |
| Sneak | C | :cite[(`media/lua/shared/keyBinding.lua:71-72`)] |
| Aim | Left Control or Right Click | :cite[(`media/lua/shared/keyBinding.lua:75-77`)] |
| Shove/Stomp | Space | :cite[(`media/lua/shared/keyBinding.lua:80-81`)] |
| Rack Firearm | X | :cite[(`media/lua/shared/keyBinding.lua:84-85`)] |
| Reload Weapon | R | :cite[(`media/lua/shared/keyBinding.lua:88-89`)] |
| Sharpen Weapon | R | :cite[(`media/lua/shared/keyBinding.lua:92-93`)] |
| Manual Floor Attack | Left Alt | :cite[(`media/lua/shared/keyBinding.lua:96-97`)] |

**Vehicle**

| Action | Default | Code |
|---|---|---|
| Start Vehicle Engine | N | :cite[(`media/lua/shared/keyBinding.lua:103-104`)] |
| Brake | Space | :cite[(`media/lua/shared/keyBinding.lua:107-108`)] |
| Cruise Control | Left Shift | :cite[(`media/lua/shared/keyBinding.lua:111-112`)] |
| Toggle Vehicle Headlights | F | :cite[(`media/lua/shared/keyBinding.lua:115-116`)] |
| Vehicle Heater | O | :cite[(`media/lua/shared/keyBinding.lua:119-120`)] |
| Vehicle Info | U | :cite[(`media/lua/shared/keyBinding.lua:123-124`)] |
| Horn | Q | :cite[(`media/lua/shared/keyBinding.lua:127-128`)] |
| Vehicle Radial Menu | V | :cite[(`media/lua/shared/keyBinding.lua:131-132`)] |
| Switch Seat | Z | :cite[(`media/lua/shared/keyBinding.lua:135-136`)] |

The key names come from the constants in the file. Left Alt and Left Control are the in-game English names for the `LMENU` and `LCONTROL` constants. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:6849-6854`)]

## Two actions on one key

Several default actions share a key, and the options screen does not stop that.

The default file puts these on the same key: Run and Cruise Control (Left Shift); Reload Weapon, Sharpen Weapon and Rotate Building (R); Horn, Shout and the Emotes Wheel (Q); Brake and Shove/Stomp (Space); Cancel Action and Main Menu (Escape); Toggle Mode and Switch Chat Stream (Tab); Vehicle Radial Menu and Animal Radial Menu (V); and a few more pairs. :cite[(`media/lua/shared/keyBinding.lua:29`, `:112`, `:41`, `:89`, `:93`, `:128`, `:339`, `:343`, `:81`, `:108`, `:49`, `:155`, `:45`, `:325`, `:132`, `:187`)] The options screen only warns when you bind a key that another action already holds with the same modifiers. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:3806-3813`)] Whether each shared pair is meant for different situations, such as on foot against in a vehicle, is not stated in the code (not verified).

Modifiers decide between two bindings on the same key. If one action is plain R and another is Shift plus R, then holding Shift makes only the Shift binding count, and the plain one stops counting. :cite[(`zombie/core/Core.java:2365-2402`)]

## Using a controller

A controller has its own tab in the options screen and its own settings files, separate from the keyboard keys.

The CONTROLLER tab has a "Select Preset" box. The two built-in presets are Default and Original, and Original moves Run, Sprint and Precision Aim to different inputs. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:2720-2722`, `media/lua/client/ISUI/Gamepad/GameOptionControllerTab.lua:263-270`, `media/lua/client/gamepadBinding.lua:155-174`)]

Only presets loaded from saved sets can be edited, and a new set is made from the current bindings. :cite[(`media/lua/client/gamepadBinding.lua:103-111`, `media/lua/client/gamepadBinding.lua:149-153`)] Saved sets are XML files in an `InputBindings` folder in the cache folder. :cite[(`zombie/characters/CharacterInputBindingSet.java:82-95`)] Editing and saving a set was read from the code and not run in a game.

The game only treats a device as a controller when it reports itself as a gamepad. :cite[(`zombie/core/input/Input.java:292-310`)] A controller becomes active when its A button is pressed, and the game has 16 controller slots and 4 player slots. :cite[(`zombie/GameWindow.java:343-358`, `zombie/input/JoypadManager.java:37-38`)] Each controller also gets a `.config` file named after the controller's GUID in a `joypads` folder, holding its axis numbers, dead zones and a Disabled flag. :cite[(`zombie/input/JoypadManager.java:72-78`, `zombie/input/JoypadManager.java:185-234`)]

These are the default controller bindings in the code, and the presets can change some of them. :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:20-47`)]

:::chips
- Aim: right stick
- Precision Aim: right trigger
- Melee: left trigger
- Attack: right trigger, pulled further
- Run: left stick, pushed far
- Interact: A
- Sneak: left stick button
- Reload Weapon: right bumper
- Rack Firearm: left bumper
- Sprint: right stick button
- Cancel Action: B
- Manual Floor Attack: left bumper
:::

Walk To, Zoom In and Zoom Out are declared with no default controller input. :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:26`, `:46-47`)] Keys a mod adds through the mod options API store a keyboard or mouse code, so a controller button cannot be assigned to them there. :cite[(`media/lua/client/PZAPI/ModOptions.lua:182-204`)] That second point is read from the API's fields and not tested in a game.

## Aiming with a mouse or a stick

Aiming changes with the weapon in your hands, whether a target is found, and whether the precise-aim control is held.

The game picks one of nine aiming modes: not aiming, then unarmed, melee, ranged and precise ranged, each of those with a "target found" version. :cite[(`zombie/input/AimingMode.java:18-27`, `zombie/characters/IsoGameCharacter.java:16500-16515`)] Precise ranged aiming is used when a ranged weapon is equipped and the precise-aim control is down, which on the keyboard is the same Aim key. :cite[(`zombie/characters/IsoGameCharacter.java:16505-16510`, `zombie/characters/component/CharacterInputComponent.java:354-356`)]

The picture on screen follows the mode. While the precise-aim control is down with a firearm in hand, the game shows a reticle, and in every other case it shows the normal cursor. :cite[(`zombie/characters/IsoPlayer.java:2168`)]

With a mouse, the aim point is the mouse position. With a controller, it is worked out from the right stick, and a small stick movement is cut off first. :cite[(`zombie/input/AimingReticle.java:22-25`, `zombie/input/AimingReticle.java:37-45`, `zombie/input/AimingReticle.java:57-62`)] The modes and the reticle are explained for modders on [Mouse and aiming](/pz/build-42/engine/input-and-controls/mouse-and-aiming).

The options screen also has a tickbox that makes Aim a toggle instead of a hold. :cite[(`media/lua/client/OptionScreens/MainOptions.lua:2322-2330`)]

## Where to go next

- How a key press travels through the engine: [Inside input](/pz/build-42/engine/input-and-controls/inside-input).
- Add a key to your mod that players can change: [Keys, events and mod keybinds](/pz/build-42/engine/input-and-controls/keys-events-and-mod-keybinds).
- Every default binding, event and `KeybindId`: [Input reference](/pz/build-42/engine/input-and-controls/input-reference).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 Java and Lua. We did not run a game, so the rebinding steps, the duplicate-key box, the controller preset editing and the aiming pictures are read, not watched. Not verified: where the cache folder is on each system, and whether shared default keys are meant for different situations.
:::
