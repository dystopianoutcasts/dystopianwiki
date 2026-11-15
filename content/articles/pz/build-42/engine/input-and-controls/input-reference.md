---
id: build-42-input-reference
slug: input-reference
title: 'Input reference'
game: pz
version: build-42
section: engine
category: input-and-controls
difficulty: advanced
tags:
  - engine
  - input
  - reference
  - events
  - keybinds
  - controller
excerpt: >-
  Every input event with its arguments and where it fires, every default key binding, every KeybindId, the default controller bindings and the Lua-callable input methods in Build 42.22.
last_updated: '2026-11-15'
related_articles:
  - how-controls-and-keybinds-work
  - inside-input
  - keys-events-and-mod-keybinds
  - controllers-and-joypads
  - mouse-and-aiming
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#input-events) | [players](#default-key-bindings) | the explanations are on [Inside input](/pz/build-42/engine/input-and-controls/inside-input)

:::callout[The 1-minute version]{kind=key}
- This page is a lookup. The tables were produced by a script from the capture's own files, and the counts are in the facts strip and in the last section.
- Events: each row gives the arguments, the number of Java places that fire it, and the number of vanilla Lua listeners.
- Default bindings come from `keyBinding.lua`, plus one added by the foraging script. A key named `none` means the default is unbound.
- `JoypadManager` is not exposed to Lua. Lua reads a controller through the global functions, `JoypadButton` and the two axis enums.
- Not run in a game: nothing here was checked by playing.
:::

:::facts
- **Input events** 32
- **Default bindings** 82 in `keyBinding.lua`, 1 more from the foraging script
- **Unbound by default** 13
- **`KeybindId` constants** 83
- **Controller binding constants** 28
:::

## Input events

Each row is one event, with what it passes and how often the engine fires it.

The columns are the event name, its arguments in order, the number of Java places that trigger it, the number of vanilla Lua listeners, and the references. The counts are the ones in the events index. :cite[(`api/events.jsonl`)] When an event has more than one Java trigger site, the cell lists all of them. The order and the conditions are on [Inside input](/pz/build-42/engine/input-and-controls/inside-input).

**Keyboard**

| Event | Arguments | Java triggers | Vanilla Lua listeners | Code |
|---|---|---|---|---|
| `OnKeyStartPressed` | key code | 4 | 11 | :cite[(`api/events.jsonl:111`, `zombie/input/GameKeyboard.java:86`, `zombie/ui/UIManager.java:713`, `zombie/ui/UIManager.java:723`, `zombie/ui/UIManager.java:792`)] |
| `OnKeyKeepPressed` | key code | 4 | 8 | :cite[(`api/events.jsonl:109`, `zombie/input/GameKeyboard.java:74`, `zombie/ui/UIManager.java:716`, `zombie/ui/UIManager.java:734`, `zombie/ui/UIManager.java:787`)] |
| `OnKeyPressed` | key code | 4 | 32 | :cite[(`api/events.jsonl:110`, `zombie/input/GameKeyboard.java:59`, `zombie/ui/UIManager.java:714`, `zombie/ui/UIManager.java:724`, `zombie/ui/UIManager.java:793`)] |
| `OnCustomUIKey` | key code | 1 | 0 | :cite[(`api/events.jsonl:55`, `zombie/input/GameKeyboard.java:63`)] |
| `OnCustomUIKeyPressed` | key code | 1 | 0 | :cite[(`api/events.jsonl:56`, `zombie/input/GameKeyboard.java:90`)] |
| `OnCustomUIKeyReleased` | key code | 1 | 0 | :cite[(`api/events.jsonl:57`, `zombie/input/GameKeyboard.java:64`)] |
| `OnContextKey` | player, milliseconds the context key was held | 2 | 2 | :cite[(`api/events.jsonl:48`, `zombie/characters/IsoPlayer.java:4751`, `zombie/characters/IsoPlayer.java:4848`)] |

**Mouse**

| Event | Arguments | Java triggers | Vanilla Lua listeners | Code |
|---|---|---|---|---|
| `OnMouseDown` | x, y | 1 | 1 | :cite[(`api/events.jsonl:126`, `zombie/ui/UIManager.java:722`)] |
| `OnMouseUp` | x, y | 1 | 0 | :cite[(`api/events.jsonl:128`, `zombie/ui/UIManager.java:731`)] |
| `OnMouseMove` | x, y, world x, world y | 1 | 0 | :cite[(`api/events.jsonl:127`, `zombie/ui/UIManager.java:643`)] |
| `OnMouseWheel` | wheel value | 1 | 0 | :cite[(`api/events.jsonl:129`, `zombie/ui/UIManager.java:627`)] |
| `OnRightMouseDown` | x, y | 1 | 1 | :cite[(`api/events.jsonl:186`, `zombie/ui/UIManager.java:739`)] |
| `OnRightMouseUp` | x, y | 1 | 0 | :cite[(`api/events.jsonl:187`, `zombie/ui/UIManager.java:759`)] |
| `OnObjectLeftMouseButtonDown` | object, x, y | 1 | 1 | :cite[(`api/events.jsonl:140`, `zombie/ui/UIManager.java:593`)] |
| `OnObjectLeftMouseButtonUp` | object, x, y | 1 | 1 | :cite[(`api/events.jsonl:141`, `zombie/ui/UIManager.java:610`)] |
| `OnObjectRightMouseButtonDown` | object, x, y | 1 | 1 | :cite[(`api/events.jsonl:142`, `zombie/ui/UIManager.java:741`)] |
| `OnObjectRightMouseButtonUp` | object, x, y | 1 | 1 | :cite[(`api/events.jsonl:143`, `zombie/ui/UIManager.java:761`)] |

**Controller**

| Event | Arguments | Java triggers | Vanilla Lua listeners | Code |
|---|---|---|---|---|
| `OnGamepadConnect` | controller id | 1 | 2 | :cite[(`api/events.jsonl:88`, `zombie/core/input/Input.java:188`)] |
| `OnGamepadDisconnect` | controller id | 1 | 3 | :cite[(`api/events.jsonl:89`, `zombie/core/input/Input.java:195`)] |
| `OnJoypadActivate` | joypad id | 2 | 2 | :cite[(`api/events.jsonl:101`, `zombie/GameWindow.java:352`, `zombie/Lua/LuaManager.java:6416`)] |
| `OnJoypadActivateUI` | joypad id | 3 | 1 | :cite[(`api/events.jsonl:102`, `zombie/GameWindow.java:354`, `zombie/Lua/LuaManager.java:6418`, `zombie/Lua/LuaManager.java:6428`)] |
| `OnJoypadBeforeDeactivate` | joypad id | 1 | 2 | :cite[(`api/events.jsonl:103`, `zombie/input/JoypadManager.java:588`)] |
| `OnJoypadDeactivate` | joypad id | 1 | 1 | :cite[(`api/events.jsonl:105`, `zombie/input/JoypadManager.java:590`)] |
| `OnJoypadBeforeReactivate` | joypad id | 1 | 1 | :cite[(`api/events.jsonl:104`, `zombie/input/JoypadManager.java:579`)] |
| `OnJoypadReactivate` | joypad id | 1 | 1 | :cite[(`api/events.jsonl:107`, `zombie/input/JoypadManager.java:581`)] |
| `OnJoypadRenderUI` | none | 1 | 1 | :cite[(`api/events.jsonl:108`, `zombie/input/JoypadManager.java:629`)] |
| `OnJoypadDebugRenderUIOptionSet` | draw UI flag, draw navigation flag | 1 | 1 | :cite[(`api/events.jsonl:106`, `zombie/input/JoypadManager.java:628`)] |
| `OptionControllerButtonStyleChanged` | style name | 1 | 2 | :cite[(`api/events.jsonl:250`, `zombie/core/Core.java:3321`)] |
| `OptionGamepadBindingPresetChanged` | preset name | 1 | 2 | :cite[(`api/events.jsonl:251`, `zombie/core/Core.java:3336`)] |

**Weapon buttons**

| Event | Arguments | Java triggers | Vanilla Lua listeners | Code |
|---|---|---|---|---|
| `OnPressReloadButton` | player, weapon | 1 | 1 | :cite[(`api/events.jsonl:170`, `zombie/characters/IsoPlayer.java:3509`)] |
| `OnPressRackButton` | player, weapon, shift held | 1 | 1 | :cite[(`api/events.jsonl:169`, `zombie/characters/IsoPlayer.java:3512`)] |
| `OnPressWalkTo` | three zeros | 1 | 1 | :cite[(`api/events.jsonl:171`, `zombie/characters/IsoPlayer.java:6391`)] |

The mouse button codes inside the key events are 10000 and up. :cite[(`zombie/input/Mouse.java:30-41`)] The `OnObject...` events pass the picked object first. :cite[(`zombie/ui/UIManager.java:593`, `zombie/ui/UIManager.java:610`, `zombie/ui/UIManager.java:741`, `zombie/ui/UIManager.java:761`)]

## Default key bindings

These are the keys a new profile starts with, and the id column is the name the Lua passes to `getCore():getKey`.

The labels are the English names shown on the options screen. :cite[(`media/lua/shared/Translate/EN/UI.json`)] The Default column names the key as the English key name table writes it. :cite[(`media/lua/shared/Translate/EN/IG_UI.json:6840-6857`)] A binding with two keys shows both. The Search Mode row is the one binding that the foraging script adds when the game boots. :cite[(`media/lua/client/Foraging/ISSearchManager.lua:1472-1481`)]

| Group | Action | Id | Default | Code |
|---|---|---|---|---|
| Player Control | Forward | `Forward` | W | :cite[(`media/lua/shared/keyBinding.lua:12-13`, `zombie/input/KeybindId.java:17`)] |
| Player Control | Backward | `Backward` | S | :cite[(`media/lua/shared/keyBinding.lua:16-17`, `zombie/input/KeybindId.java:18`)] |
| Player Control | Left | `Left` | A | :cite[(`media/lua/shared/keyBinding.lua:20-21`, `zombie/input/KeybindId.java:19`)] |
| Player Control | Right | `Right` | D | :cite[(`media/lua/shared/keyBinding.lua:24-25`, `zombie/input/KeybindId.java:20`)] |
| Player Control | Run | `Run` | Left Shift | :cite[(`media/lua/shared/keyBinding.lua:28-29`, `zombie/input/KeybindId.java:21`)] |
| Player Control | Interact | `Interact` | E | :cite[(`media/lua/shared/keyBinding.lua:32-33`, `zombie/input/KeybindId.java:22`)] |
| Player Control | Sprint | `Sprint` | Left Alt (Left Command on macOS) | :cite[(`media/lua/shared/keyBinding.lua:36-37`, `zombie/input/KeybindId.java:23`)] |
| Player Control | Rotate Building | `Rotate building` | R | :cite[(`media/lua/shared/keyBinding.lua:40-41`, `zombie/input/KeybindId.java:24`)] |
| Player Control | Toggle Mode | `Toggle mode` | Tab | :cite[(`media/lua/shared/keyBinding.lua:44-45`, `zombie/input/KeybindId.java:25`)] |
| Player Control | Cancel Action | `CancelAction` | Escape | :cite[(`media/lua/shared/keyBinding.lua:48-49`, `zombie/input/KeybindId.java:27`)] |
| Player Control | Walk To | `WalkTo` | Y | :cite[(`media/lua/shared/keyBinding.lua:52-53`, `zombie/input/KeybindId.java:28`)] |
| Player Control | Let Go of Rope Being Climbed | `ReleaseRope` | none | :cite[(`media/lua/shared/keyBinding.lua:56-57`, `zombie/input/KeybindId.java:29`)] |
| Player Control | Sit On Ground | `SitOnGround` | none | :cite[(`media/lua/shared/keyBinding.lua:60-61`, `zombie/input/KeybindId.java:30`)] |
| Combat | Attack/Click | `Attack/Click` | Left Click | :cite[(`media/lua/shared/keyBinding.lua:67-68`, `zombie/input/KeybindId.java:31`)] |
| Combat | Sneak | `Crouch` | C | :cite[(`media/lua/shared/keyBinding.lua:71-72`, `zombie/input/KeybindId.java:32`)] |
| Combat | Aim | `Aim` | Left Control or Right Click | :cite[(`media/lua/shared/keyBinding.lua:75-77`, `zombie/input/KeybindId.java:33`)] |
| Combat | Shove/Stomp | `Melee` | Space | :cite[(`media/lua/shared/keyBinding.lua:80-81`, `zombie/input/KeybindId.java:34`)] |
| Combat | Rack Firearm | `Rack Firearm` | X | :cite[(`media/lua/shared/keyBinding.lua:84-85`, `zombie/input/KeybindId.java:35`)] |
| Combat | Reload Weapon | `ReloadWeapon` | R | :cite[(`media/lua/shared/keyBinding.lua:88-89`, `zombie/input/KeybindId.java:36`)] |
| Combat | Sharpen Weapon | `SharpenWeapon` | R | :cite[(`media/lua/shared/keyBinding.lua:92-93`, `zombie/input/KeybindId.java:37`)] |
| Combat | Manual Floor Attack | `ManualFloorAtk` | Left Alt | :cite[(`media/lua/shared/keyBinding.lua:96-97`, `zombie/input/KeybindId.java:38`)] |
| Vehicle | Start Vehicle Engine | `StartVehicleEngine` | N | :cite[(`media/lua/shared/keyBinding.lua:103-104`, `zombie/input/KeybindId.java:39`)] |
| Vehicle | Brake | `Brake` | Space | :cite[(`media/lua/shared/keyBinding.lua:107-108`, `zombie/input/KeybindId.java:40`)] |
| Vehicle | Cruise Control | `CruiseControl` | Left Shift | :cite[(`media/lua/shared/keyBinding.lua:111-112`, `zombie/input/KeybindId.java:41`)] |
| Vehicle | Toggle Vehicle Headlights | `ToggleVehicleHeadlights` | F | :cite[(`media/lua/shared/keyBinding.lua:115-116`, `zombie/input/KeybindId.java:42`)] |
| Vehicle | Vehicle Heater | `VehicleHeater` | O | :cite[(`media/lua/shared/keyBinding.lua:119-120`, `zombie/input/KeybindId.java:43`)] |
| Vehicle | Vehicle Info | `VehicleMechanics` | U | :cite[(`media/lua/shared/keyBinding.lua:123-124`, `zombie/input/KeybindId.java:44`)] |
| Vehicle | Horn | `VehicleHorn` | Q | :cite[(`media/lua/shared/keyBinding.lua:127-128`, `zombie/input/KeybindId.java:45`)] |
| Vehicle | Vehicle Radial Menu | `VehicleRadialMenu` | V | :cite[(`media/lua/shared/keyBinding.lua:131-132`, `zombie/input/KeybindId.java:46`)] |
| Vehicle | Switch Seat | `VehicleSwitchSeat` | Z | :cite[(`media/lua/shared/keyBinding.lua:135-136`, `zombie/input/KeybindId.java:47`)] |
| UI | Toggle UI | `Toggle UI` | none | :cite[(`media/lua/shared/keyBinding.lua:142-143`, `zombie/input/KeybindId.java:48`)] |
| UI | Toggle Crafting UI | `Crafting UI` | B | :cite[(`media/lua/shared/keyBinding.lua:146-147`, `zombie/input/KeybindId.java:49`)] |
| UI | Toggle Building UI | `Building UI` | none | :cite[(`media/lua/shared/keyBinding.lua:150-151`, `zombie/input/KeybindId.java:50`)] |
| UI | Main Menu | `Main Menu` | Escape | :cite[(`media/lua/shared/keyBinding.lua:154-155`, `zombie/input/KeybindId.java:51`)] |
| UI | Toggle Inventory | `Toggle Inventory` | I | :cite[(`media/lua/shared/keyBinding.lua:158-159`, `zombie/input/KeybindId.java:52`)] |
| UI | Toggle Skill Panel | `Toggle Skill Panel` | L | :cite[(`media/lua/shared/keyBinding.lua:162-163`, `zombie/input/KeybindId.java:53`)] |
| UI | Toggle Health Panel | `Toggle Health Panel` | H | :cite[(`media/lua/shared/keyBinding.lua:166-167`, `zombie/input/KeybindId.java:54`)] |
| UI | Toggle Info Panel | `Toggle Info Panel` | J | :cite[(`media/lua/shared/keyBinding.lua:170-171`, `zombie/input/KeybindId.java:55`)] |
| UI | Toggle Clothing Protection Panel | `Toggle Clothing Protection Panel` | P | :cite[(`media/lua/shared/keyBinding.lua:174-175`, `zombie/input/KeybindId.java:56`)] |
| UI | Toggle Moveable Panel Mode | `Toggle Moveable Panel Mode` | ] | :cite[(`media/lua/shared/keyBinding.lua:178-179`, `zombie/input/KeybindId.java:57`)] |
| UI | Toggle Map | `Map` | M | :cite[(`media/lua/shared/keyBinding.lua:182-183`, `zombie/input/KeybindId.java:58`)] |
| UI | Animal Radial Menu | `AnimalRadialMenu` | V | :cite[(`media/lua/shared/keyBinding.lua:186-187`, `zombie/input/KeybindId.java:59`)] |
| UI | Take Screenshot | `Take screenshot` | F10 | :cite[(`media/lua/shared/keyBinding.lua:190-191`, `zombie/input/KeybindId.java:60`)] |
| UI | Toggle Survival Guide | `Toggle Survival Guide` | F1 | :cite[(`media/lua/shared/keyBinding.lua:194-195`, `zombie/input/KeybindId.java:61`)] |
| UI | Display FPS | `Display FPS` | key code 37 | :cite[(`media/lua/shared/keyBinding.lua:198-199`, `zombie/input/KeybindId.java:62`)] |
| UI | Pause | `Pause` | F2 | :cite[(`media/lua/shared/keyBinding.lua:202-203`, `zombie/input/KeybindId.java:63`)] |
| UI | Normal Speed | `Normal Speed` | F3 | :cite[(`media/lua/shared/keyBinding.lua:206-207`, `zombie/input/KeybindId.java:64`)] |
| UI | Fast Forward x1 | `Fast Forward x1` | F4 | :cite[(`media/lua/shared/keyBinding.lua:210-211`, `zombie/input/KeybindId.java:65`)] |
| UI | Fast Forward x2 | `Fast Forward x2` | F5 | :cite[(`media/lua/shared/keyBinding.lua:214-215`, `zombie/input/KeybindId.java:66`)] |
| UI | Fast Forward x3 | `Fast Forward x3` | F6 | :cite[(`media/lua/shared/keyBinding.lua:218-219`, `zombie/input/KeybindId.java:67`)] |
| UI | Pan Camera | `PanCamera` | none | :cite[(`media/lua/shared/keyBinding.lua:222-223`, `zombie/input/KeybindId.java:68`)] |
| UI | Zoom In | `Zoom in` | = | :cite[(`media/lua/shared/keyBinding.lua:226-227`, `zombie/input/KeybindId.java:69`)] |
| UI | Zoom Out | `Zoom out` | - | :cite[(`media/lua/shared/keyBinding.lua:230-231`, `zombie/input/KeybindId.java:70`)] |
| Hotkeys | Hotbar 1 | `Hotbar 1` | 1 | :cite[(`media/lua/shared/keyBinding.lua:237-238`, `zombie/input/KeybindId.java:71`)] |
| Hotkeys | Hotbar 2 | `Hotbar 2` | 2 | :cite[(`media/lua/shared/keyBinding.lua:241-242`, `zombie/input/KeybindId.java:72`)] |
| Hotkeys | Hotbar 3 | `Hotbar 3` | 3 | :cite[(`media/lua/shared/keyBinding.lua:245-246`, `zombie/input/KeybindId.java:73`)] |
| Hotkeys | Hotbar 4 | `Hotbar 4` | 4 | :cite[(`media/lua/shared/keyBinding.lua:249-250`, `zombie/input/KeybindId.java:74`)] |
| Hotkeys | Hotbar 5 | `Hotbar 5` | 5 | :cite[(`media/lua/shared/keyBinding.lua:253-254`, `zombie/input/KeybindId.java:75`)] |
| Hotkeys | Hotbar 6 | `Hotbar 6` | 6 | :cite[(`media/lua/shared/keyBinding.lua:257-258`, `zombie/input/KeybindId.java:76`)] |
| Hotkeys | Hotbar 7 | `Hotbar 7` | 7 | :cite[(`media/lua/shared/keyBinding.lua:261-262`, `zombie/input/KeybindId.java:77`)] |
| Hotkeys | Hotbar 8 | `Hotbar 8` | 8 | :cite[(`media/lua/shared/keyBinding.lua:265-266`, `zombie/input/KeybindId.java:78`)] |
| Hotkeys | Equip/Turn On/Off Light Source | `Equip/Turn On/Off Light Source` | F | :cite[(`media/lua/shared/keyBinding.lua:281-282`, `zombie/input/KeybindId.java:79`)] |
| Hotkeys | Drop Both Held Items | `DropBothHeldItems` | none | :cite[(`media/lua/shared/keyBinding.lua:285-286`, `zombie/input/KeybindId.java:80`)] |
| Hotkeys | Drop Primary Held Item | `DropPrimaryHeldItem` | none | :cite[(`media/lua/shared/keyBinding.lua:289-290`, `zombie/input/KeybindId.java:81`)] |
| Hotkeys | Drop Secondary Held Item | `DropSecondaryHeldItem` | none | :cite[(`media/lua/shared/keyBinding.lua:293-294`, `zombie/input/KeybindId.java:82`)] |
| Hotkeys | Drop Worn Bag | `DropWornBag` | none | :cite[(`media/lua/shared/keyBinding.lua:297-298`, `zombie/input/KeybindId.java:83`)] |
| Hotkeys | Drop Held Items And Worn Bag | `DropBothHeldItemsAndWornBag` | none | :cite[(`media/lua/shared/keyBinding.lua:301-302`, `zombie/input/KeybindId.java:84`)] |
| Hotkeys | Grab Corpse | `GrabCorpse` | none | :cite[(`media/lua/shared/keyBinding.lua:305-306`, `zombie/input/KeybindId.java:85`)] |
| Multiplayer | Toggle Safety | `Toggle Safety` | G | :cite[(`media/lua/shared/keyBinding.lua:312-313`, `zombie/input/KeybindId.java:86`)] |
| Multiplayer | Toggle Chat | `Toggle chat` | T | :cite[(`media/lua/shared/keyBinding.lua:316-317`, `zombie/input/KeybindId.java:87`)] |
| Multiplayer | Alt Toggle Chat | `Alt toggle chat` | Enter | :cite[(`media/lua/shared/keyBinding.lua:320-321`, `zombie/input/KeybindId.java:88`)] |
| Multiplayer | Switch Chat Stream | `Switch chat stream` | Tab | :cite[(`media/lua/shared/keyBinding.lua:324-325`, `zombie/input/KeybindId.java:89`)] |
| Voice | Push-to-talk Key | `Enable voice transmit` | Left Alt | :cite[(`media/lua/shared/keyBinding.lua:331-332`, `zombie/input/KeybindId.java:90`)] |
| NPC Interaction | Shout | `Shout` | Q | :cite[(`media/lua/shared/keyBinding.lua:338-339`, `zombie/input/KeybindId.java:91`)] |
| NPC Interaction | Emotes Wheel (long press) | `Emote` | Q | :cite[(`media/lua/shared/keyBinding.lua:342-343`, `zombie/input/KeybindId.java:92`)] |
| Audio | Toggle Music | `Toggle Music` | none | :cite[(`media/lua/shared/keyBinding.lua:349-350`, `zombie/input/KeybindId.java:93`)] |
| Debug | Toggle Lua Debugger | `Toggle Lua Debugger` | F11 | :cite[(`media/lua/shared/keyBinding.lua:356-357`, `zombie/input/KeybindId.java:94`)] |
| Debug | Toggle Lua Console | `ToggleLuaConsole` | Grave | :cite[(`media/lua/shared/keyBinding.lua:360-361`, `zombie/input/KeybindId.java:95`)] |
| Debug | Toggle God Mode and Invisible | `ToggleGodModeInvisible` | N | :cite[(`media/lua/shared/keyBinding.lua:364-365`, `zombie/input/KeybindId.java:96`)] |
| Debug | Toggle Models Enabled | `ToggleModelsEnabled` | F3 | :cite[(`media/lua/shared/keyBinding.lua:368-369`, `zombie/input/KeybindId.java:97`)] |
| Debug | Toggle Animation Text | `ToggleAnimationText` | F6 | :cite[(`media/lua/shared/keyBinding.lua:372-373`, `zombie/input/KeybindId.java:98`)] |
| Debug | Toggle Old Renderer | `ToggleOldRenderer` | none | :cite[(`media/lua/shared/keyBinding.lua:376-377`, `zombie/input/KeybindId.java:99`)] |
| Search Mode | Toggle Search Mode | `Toggle Search Mode` | key code 207 | :cite[(`media/lua/client/Foraging/ISSearchManager.lua:1473-1475`, `zombie/input/KeybindId.java:26`)] |

## KeybindId constants

Each constant names one vanilla binding, and the id string is what the options file and the binding table use.

`KeybindId.register(id)` is public and Lua-callable, and we infer that it is how a mod adds a name (not verified; no caller was found). The vanilla constants are registered by an internal call that allows the default namespace. :cite[(`zombie/input/KeybindId.java:110-120`)] Every constant except `TOGGLE_SEARCH_MODE` has a row in `keyBinding.lua`. :cite[(`zombie/input/KeybindId.java:26`, `media/lua/client/Foraging/ISSearchManager.lua:1474`)]

| Constant | Id string | Code |
|---|---|---|
| `KeybindId.FORWARD` | `Forward` | :cite[(`zombie/input/KeybindId.java:17`)] |
| `KeybindId.BACKWARD` | `Backward` | :cite[(`zombie/input/KeybindId.java:18`)] |
| `KeybindId.LEFT` | `Left` | :cite[(`zombie/input/KeybindId.java:19`)] |
| `KeybindId.RIGHT` | `Right` | :cite[(`zombie/input/KeybindId.java:20`)] |
| `KeybindId.RUN` | `Run` | :cite[(`zombie/input/KeybindId.java:21`)] |
| `KeybindId.INTERACT` | `Interact` | :cite[(`zombie/input/KeybindId.java:22`)] |
| `KeybindId.SPRINT` | `Sprint` | :cite[(`zombie/input/KeybindId.java:23`)] |
| `KeybindId.ROTATE_BUILDING` | `Rotate building` | :cite[(`zombie/input/KeybindId.java:24`)] |
| `KeybindId.TOGGLE_MODE` | `Toggle mode` | :cite[(`zombie/input/KeybindId.java:25`)] |
| `KeybindId.TOGGLE_SEARCH_MODE` | `Toggle Search Mode` | :cite[(`zombie/input/KeybindId.java:26`)] |
| `KeybindId.CANCEL_ACTION` | `CancelAction` | :cite[(`zombie/input/KeybindId.java:27`)] |
| `KeybindId.WALK_TO` | `WalkTo` | :cite[(`zombie/input/KeybindId.java:28`)] |
| `KeybindId.RELEASE_ROPE` | `ReleaseRope` | :cite[(`zombie/input/KeybindId.java:29`)] |
| `KeybindId.SIT_ON_GROUND` | `SitOnGround` | :cite[(`zombie/input/KeybindId.java:30`)] |
| `KeybindId.ATTACK_CLICK` | `Attack/Click` | :cite[(`zombie/input/KeybindId.java:31`)] |
| `KeybindId.CROUCH` | `Crouch` | :cite[(`zombie/input/KeybindId.java:32`)] |
| `KeybindId.AIM` | `Aim` | :cite[(`zombie/input/KeybindId.java:33`)] |
| `KeybindId.MELEE` | `Melee` | :cite[(`zombie/input/KeybindId.java:34`)] |
| `KeybindId.RACK_FIREARM` | `Rack Firearm` | :cite[(`zombie/input/KeybindId.java:35`)] |
| `KeybindId.RELOAD_WEAPON` | `ReloadWeapon` | :cite[(`zombie/input/KeybindId.java:36`)] |
| `KeybindId.SHARPEN_WEAPON` | `SharpenWeapon` | :cite[(`zombie/input/KeybindId.java:37`)] |
| `KeybindId.MANUAL_FLOOR_ATTACK` | `ManualFloorAtk` | :cite[(`zombie/input/KeybindId.java:38`)] |
| `KeybindId.START_VEHICLE_ENGINE` | `StartVehicleEngine` | :cite[(`zombie/input/KeybindId.java:39`)] |
| `KeybindId.BRAKE` | `Brake` | :cite[(`zombie/input/KeybindId.java:40`)] |
| `KeybindId.CRUISE_CONTROL` | `CruiseControl` | :cite[(`zombie/input/KeybindId.java:41`)] |
| `KeybindId.TOGGLE_VEHICLE_HEADLIGHTS` | `ToggleVehicleHeadlights` | :cite[(`zombie/input/KeybindId.java:42`)] |
| `KeybindId.VEHICLE_HEATER` | `VehicleHeater` | :cite[(`zombie/input/KeybindId.java:43`)] |
| `KeybindId.VEHICLE_MECHANICS` | `VehicleMechanics` | :cite[(`zombie/input/KeybindId.java:44`)] |
| `KeybindId.VEHICLE_HORN` | `VehicleHorn` | :cite[(`zombie/input/KeybindId.java:45`)] |
| `KeybindId.VEHICLE_RADIAL_MENU` | `VehicleRadialMenu` | :cite[(`zombie/input/KeybindId.java:46`)] |
| `KeybindId.VEHICLE_SWITCH_SEAT` | `VehicleSwitchSeat` | :cite[(`zombie/input/KeybindId.java:47`)] |
| `KeybindId.TOGGLE_UI` | `Toggle UI` | :cite[(`zombie/input/KeybindId.java:48`)] |
| `KeybindId.CRAFTING_UI` | `Crafting UI` | :cite[(`zombie/input/KeybindId.java:49`)] |
| `KeybindId.BUILDING_UI` | `Building UI` | :cite[(`zombie/input/KeybindId.java:50`)] |
| `KeybindId.MAIN_MENU` | `Main Menu` | :cite[(`zombie/input/KeybindId.java:51`)] |
| `KeybindId.TOGGLE_INVENTORY` | `Toggle Inventory` | :cite[(`zombie/input/KeybindId.java:52`)] |
| `KeybindId.TOGGLE_SKILL_PANEL` | `Toggle Skill Panel` | :cite[(`zombie/input/KeybindId.java:53`)] |
| `KeybindId.TOGGLE_HEALTH_PANEL` | `Toggle Health Panel` | :cite[(`zombie/input/KeybindId.java:54`)] |
| `KeybindId.TOGGLE_INFO_PANEL` | `Toggle Info Panel` | :cite[(`zombie/input/KeybindId.java:55`)] |
| `KeybindId.TOGGLE_CLOTHING_PROTECTION_PANEL` | `Toggle Clothing Protection Panel` | :cite[(`zombie/input/KeybindId.java:56`)] |
| `KeybindId.TOGGLE_MOVABLE_PANEL_MODE` | `Toggle Moveable Panel Mode` | :cite[(`zombie/input/KeybindId.java:57`)] |
| `KeybindId.MAP` | `Map` | :cite[(`zombie/input/KeybindId.java:58`)] |
| `KeybindId.ANIMAL_RADIAL_MENU` | `AnimalRadialMenu` | :cite[(`zombie/input/KeybindId.java:59`)] |
| `KeybindId.TAKE_SCREENSHOT` | `Take screenshot` | :cite[(`zombie/input/KeybindId.java:60`)] |
| `KeybindId.TOGGLE_SURVIVAL_GUIDE` | `Toggle Survival Guide` | :cite[(`zombie/input/KeybindId.java:61`)] |
| `KeybindId.DISPLAY_FPS` | `Display FPS` | :cite[(`zombie/input/KeybindId.java:62`)] |
| `KeybindId.PAUSE` | `Pause` | :cite[(`zombie/input/KeybindId.java:63`)] |
| `KeybindId.NORMAL_SPEED` | `Normal Speed` | :cite[(`zombie/input/KeybindId.java:64`)] |
| `KeybindId.FAST_FORWARD_X1` | `Fast Forward x1` | :cite[(`zombie/input/KeybindId.java:65`)] |
| `KeybindId.FAST_FORWARD_X2` | `Fast Forward x2` | :cite[(`zombie/input/KeybindId.java:66`)] |
| `KeybindId.FAST_FORWARD_X3` | `Fast Forward x3` | :cite[(`zombie/input/KeybindId.java:67`)] |
| `KeybindId.PAN_CAMERA` | `PanCamera` | :cite[(`zombie/input/KeybindId.java:68`)] |
| `KeybindId.ZOOM_IN` | `Zoom in` | :cite[(`zombie/input/KeybindId.java:69`)] |
| `KeybindId.ZOOM_OUT` | `Zoom out` | :cite[(`zombie/input/KeybindId.java:70`)] |
| `KeybindId.HOTBAR_1` | `Hotbar 1` | :cite[(`zombie/input/KeybindId.java:71`)] |
| `KeybindId.HOTBAR_2` | `Hotbar 2` | :cite[(`zombie/input/KeybindId.java:72`)] |
| `KeybindId.HOTBAR_3` | `Hotbar 3` | :cite[(`zombie/input/KeybindId.java:73`)] |
| `KeybindId.HOTBAR_4` | `Hotbar 4` | :cite[(`zombie/input/KeybindId.java:74`)] |
| `KeybindId.HOTBAR_5` | `Hotbar 5` | :cite[(`zombie/input/KeybindId.java:75`)] |
| `KeybindId.HOTBAR_6` | `Hotbar 6` | :cite[(`zombie/input/KeybindId.java:76`)] |
| `KeybindId.HOTBAR_7` | `Hotbar 7` | :cite[(`zombie/input/KeybindId.java:77`)] |
| `KeybindId.HOTBAR_8` | `Hotbar 8` | :cite[(`zombie/input/KeybindId.java:78`)] |
| `KeybindId.LIGHT_SOURCE` | `Equip/Turn On/Off Light Source` | :cite[(`zombie/input/KeybindId.java:79`)] |
| `KeybindId.DROP_BOTH_HELD_ITEMS` | `DropBothHeldItems` | :cite[(`zombie/input/KeybindId.java:80`)] |
| `KeybindId.DROP_PRIMARY_HELD_ITEM` | `DropPrimaryHeldItem` | :cite[(`zombie/input/KeybindId.java:81`)] |
| `KeybindId.DROP_SECONDARY_HELD_ITEM` | `DropSecondaryHeldItem` | :cite[(`zombie/input/KeybindId.java:82`)] |
| `KeybindId.DROP_WORN_BAG` | `DropWornBag` | :cite[(`zombie/input/KeybindId.java:83`)] |
| `KeybindId.DROP_BOTH_HELD_ITEMS_AND_WORN_BAG` | `DropBothHeldItemsAndWornBag` | :cite[(`zombie/input/KeybindId.java:84`)] |
| `KeybindId.GRAB_CORPSE` | `GrabCorpse` | :cite[(`zombie/input/KeybindId.java:85`)] |
| `KeybindId.TOGGLE_SAFETY` | `Toggle Safety` | :cite[(`zombie/input/KeybindId.java:86`)] |
| `KeybindId.TOGGLE_CHAT` | `Toggle chat` | :cite[(`zombie/input/KeybindId.java:87`)] |
| `KeybindId.ALT_TOGGLE_CHAT` | `Alt toggle chat` | :cite[(`zombie/input/KeybindId.java:88`)] |
| `KeybindId.SWITCH_CHAT_STREAM` | `Switch chat stream` | :cite[(`zombie/input/KeybindId.java:89`)] |
| `KeybindId.ENABLE_VOICE_TRANSMIT` | `Enable voice transmit` | :cite[(`zombie/input/KeybindId.java:90`)] |
| `KeybindId.SHOUT` | `Shout` | :cite[(`zombie/input/KeybindId.java:91`)] |
| `KeybindId.EMOTE` | `Emote` | :cite[(`zombie/input/KeybindId.java:92`)] |
| `KeybindId.TOGGLE_MUSIC` | `Toggle Music` | :cite[(`zombie/input/KeybindId.java:93`)] |
| `KeybindId.TOGGLE_LUA_DEBUGGER` | `Toggle Lua Debugger` | :cite[(`zombie/input/KeybindId.java:94`)] |
| `KeybindId.TOGGLE_LUA_CONSOLE` | `ToggleLuaConsole` | :cite[(`zombie/input/KeybindId.java:95`)] |
| `KeybindId.TOGGLE_GOD_MODE` | `ToggleGodModeInvisible` | :cite[(`zombie/input/KeybindId.java:96`)] |
| `KeybindId.TOGGLE_MODELS_ENABLED` | `ToggleModelsEnabled` | :cite[(`zombie/input/KeybindId.java:97`)] |
| `KeybindId.TOGGLE_ANIMATION_TEXT` | `ToggleAnimationText` | :cite[(`zombie/input/KeybindId.java:98`)] |
| `KeybindId.TOGGLE_OLD_RENDERER` | `ToggleOldRenderer` | :cite[(`zombie/input/KeybindId.java:99`)] |

## Default controller bindings

These constants are the actions a controller can drive, with the input each starts on.

Each constant is a `CharacterJoypadButtonBinding`, and the presets can change them. :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:19-47`, `media/lua/client/gamepadBinding.lua:155-174`)] An axis with a number is a threshold the stick or trigger must pass. :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:63-81`)]

| Constant | Default input | Code |
|---|---|---|
| `Aim` | axis RightStick, minimum 0.1 | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:20`)] |
| `PrecisionAim` | axis RightTrigger, minimum -0.8 | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:21`)] |
| `Melee` | axis LeftTrigger, minimum -0.8 | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:22`)] |
| `Attack` | axis RightTrigger, minimum 0.93 | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:23`)] |
| `Run` | axis LeftStick, minimum 0.975 | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:24`)] |
| `Interact` | button A | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:25`)] |
| `WalkTo` | no default input | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:26`)] |
| `Crouch` | button LeftStick | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:27`)] |
| `ReloadWeapon` | button RightBump | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:28`)] |
| `RackFirearm` | button LeftBump | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:29`)] |
| `Sprint` | button RightStick | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:30`)] |
| `CancelAction` | button B | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:31`)] |
| `ManualFloorAtk` | button LeftBump | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:32`)] |
| `Inventory` | button Y | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:33`)] |
| `Loot` | button X | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:34`)] |
| `ClosePanel` | button B | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:35`)] |
| `CycleLoot` | button RightBump | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:36`)] |
| `CycleInventory` | button LeftBump | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:37`)] |
| `CycleTabsLeft` | button LeftBump | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:38`)] |
| `CycleTabsRight` | button RightBump | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:39`)] |
| `TransferItem` | button X | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:40`)] |
| `InteractOptions` | button X | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:41`)] |
| `ClimbThrough` | button B | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:42`)] |
| `SmashWindow` | button B | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:43`)] |
| `Brakes` | button B | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:44`)] |
| `CruiseControl` | button X | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:45`)] |
| `ZoomIn` | no default input | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:46`)] |
| `ZoomOut` | no default input | :cite[(`zombie/characters/CharacterJoypadButtonBinding.java:47`)] |

## Lua-callable input methods

The tables list the methods that the capture's API index marks as callable from Lua, by class.

Each row gives the method with its parameter and return types, and the line of the index that describes it. The index marks a class method as Lua-callable with its `lua` field, and a global function with the `LuaMethod` annotation. :cite[(`api/api.jsonl`)]

**GameKeyboard**

| Method | Code |
|---|---|
| `eatKeyPress(int): void` | :cite[(`api/api.jsonl:45399`)] |
| `getEventQueue(): KeyEventQueue` | :cite[(`api/api.jsonl:45400`)] |
| `getEventQueuePolling(): KeyEventQueue` | :cite[(`api/api.jsonl:45401`)] |
| `isKeyDown(int): boolean` | :cite[(`api/api.jsonl:45402`)] |
| `isKeyDown(String): boolean` | :cite[(`api/api.jsonl:45403`)] |
| `isKeyDown(KeybindId): boolean` | :cite[(`api/api.jsonl:45404`)] |
| `isKeyDownRaw(int): boolean` | :cite[(`api/api.jsonl:45405`)] |
| `isKeyPressed(int): boolean` | :cite[(`api/api.jsonl:45406`)] |
| `isKeyPressed(String): boolean` | :cite[(`api/api.jsonl:45407`)] |
| `isKeyPressed(KeybindId): boolean` | :cite[(`api/api.jsonl:45408`)] |
| `poll(): void` | :cite[(`api/api.jsonl:45409`)] |
| `setDoLuaKeyPressed(boolean): void` | :cite[(`api/api.jsonl:45410`)] |
| `update(): void` | :cite[(`api/api.jsonl:45411`)] |
| `wasKeyDown(int): boolean` | :cite[(`api/api.jsonl:45412`)] |
| `wasKeyDown(String): boolean` | :cite[(`api/api.jsonl:45413`)] |
| `wasKeyDown(KeybindId): boolean` | :cite[(`api/api.jsonl:45414`)] |
| `wasKeyDownRaw(int): boolean` | :cite[(`api/api.jsonl:45415`)] |
| `whichKeyDown(String): int` | :cite[(`api/api.jsonl:45416`)] |
| `whichKeyDown(KeybindId): int` | :cite[(`api/api.jsonl:45417`)] |
| `whichKeyDownIgnoreMouse(String): int` | :cite[(`api/api.jsonl:45418`)] |
| `whichKeyPressed(String): int` | :cite[(`api/api.jsonl:45419`)] |
| `whichKeyWasDown(String): int` | :cite[(`api/api.jsonl:45420`)] |

**Mouse**

| Method | Code |
|---|---|
| `UIBlockButtonDown(int): void` | :cite[(`api/api.jsonl:45841`)] |
| `getButtonCount(): int` | :cite[(`api/api.jsonl:45842`)] |
| `getWheelState(): int` | :cite[(`api/api.jsonl:45843`)] |
| `getX(): int` | :cite[(`api/api.jsonl:45844`)] |
| `getXA(): int` | :cite[(`api/api.jsonl:45845`)] |
| `getY(): int` | :cite[(`api/api.jsonl:45846`)] |
| `getYA(): int` | :cite[(`api/api.jsonl:45847`)] |
| `initCustomCursor(): void` | :cite[(`api/api.jsonl:45848`)] |
| `isButtonDown(int): boolean` | :cite[(`api/api.jsonl:45849`)] |
| `isButtonDownUICheck(int): boolean` | :cite[(`api/api.jsonl:45850`)] |
| `isButtonKey(int): boolean` | :cite[(`api/api.jsonl:45851`)] |
| `isButtonPressed(int): boolean` | :cite[(`api/api.jsonl:45852`)] |
| `isButtonReleased(int): boolean` | :cite[(`api/api.jsonl:45853`)] |
| `isCursorVisible(): boolean` | :cite[(`api/api.jsonl:45854`)] |
| `isLeftDown(): boolean` | :cite[(`api/api.jsonl:45855`)] |
| `isLeftPressed(): boolean` | :cite[(`api/api.jsonl:45856`)] |
| `isLeftReleased(): boolean` | :cite[(`api/api.jsonl:45857`)] |
| `isLeftUp(): boolean` | :cite[(`api/api.jsonl:45858`)] |
| `isMiddleDown(): boolean` | :cite[(`api/api.jsonl:45859`)] |
| `isMiddlePressed(): boolean` | :cite[(`api/api.jsonl:45860`)] |
| `isMiddleReleased(): boolean` | :cite[(`api/api.jsonl:45861`)] |
| `isMiddleUp(): boolean` | :cite[(`api/api.jsonl:45862`)] |
| `isRightDelay(): boolean` | :cite[(`api/api.jsonl:45863`)] |
| `isRightDown(): boolean` | :cite[(`api/api.jsonl:45864`)] |
| `isRightPressed(): boolean` | :cite[(`api/api.jsonl:45865`)] |
| `isRightReleased(): boolean` | :cite[(`api/api.jsonl:45866`)] |
| `isRightUp(): boolean` | :cite[(`api/api.jsonl:45867`)] |
| `loadCursor(String): Cursor` | :cite[(`api/api.jsonl:45868`)] |
| `poll(): void` | :cite[(`api/api.jsonl:45869`)] |
| `renderCursorTexture(): void` | :cite[(`api/api.jsonl:45870`)] |
| `setCursorVisible(boolean): void` | :cite[(`api/api.jsonl:45871`)] |
| `setXY(int, int): void` | :cite[(`api/api.jsonl:45872`)] |
| `update(): void` | :cite[(`api/api.jsonl:45873`)] |
| `wasButtonDown(int): boolean` | :cite[(`api/api.jsonl:45874`)] |

**KeybindId**

| Method | Code |
|---|---|
| `get(ResourceLocation): KeybindId` | :cite[(`api/api.jsonl:45785`)] |
| `getId(): String` | :cite[(`api/api.jsonl:45786`)] |
| `register(String): KeybindId` | :cite[(`api/api.jsonl:45787`)] |
| `toString(): String` | :cite[(`api/api.jsonl:45790`)] |

**JoypadButton**

| Method | Code |
|---|---|
| `fromIndex(int): JoypadButton` | :cite[(`api/api.jsonl:45486`)] |
| `getButtonCount(): int` | :cite[(`api/api.jsonl:45487`)] |
| `getButtons(): JoypadButton[]` | :cite[(`api/api.jsonl:45488`)] |
| `getNameTranslationKey(): String` | :cite[(`api/api.jsonl:45489`)] |
| `isButtonDown(int, int): boolean` | :cite[(`api/api.jsonl:45490`)] |
| `isDown(int): boolean` | :cite[(`api/api.jsonl:45491`)] |
| `valueOf(String): JoypadButton` | :cite[(`api/api.jsonl:45492`)] |
| `values(): JoypadButton[]` | :cite[(`api/api.jsonl:45493`)] |

**JoypadAxis1d**

| Method | Code |
|---|---|
| `fromIndex(int): JoypadAxis1d` | :cite[(`api/api.jsonl:45436`)] |
| `getAxes(): JoypadAxis1d[]` | :cite[(`api/api.jsonl:45437`)] |
| `getAxisCount(): int` | :cite[(`api/api.jsonl:45438`)] |
| `getDeadZone(int): float` | :cite[(`api/api.jsonl:45439`)] |
| `getNameTranslationKey(): String` | :cite[(`api/api.jsonl:45440`)] |
| `getValue(int): float` | :cite[(`api/api.jsonl:45441`)] |
| `setDeadZone(int, float): void` | :cite[(`api/api.jsonl:45442`)] |
| `valueOf(String): JoypadAxis1d` | :cite[(`api/api.jsonl:45443`)] |
| `values(): JoypadAxis1d[]` | :cite[(`api/api.jsonl:45444`)] |

**JoypadAxis2d**

| Method | Code |
|---|---|
| `getAxes(): JoypadAxis2d[]` | :cite[(`api/api.jsonl:45455`)] |
| `getLength(int): float` | :cite[(`api/api.jsonl:45456`)] |
| `getNameTranslationKey(): String` | :cite[(`api/api.jsonl:45457`)] |
| `getValue(int, Vector2): Vector2` | :cite[(`api/api.jsonl:45458`)] |
| `getValueX(int): float` | :cite[(`api/api.jsonl:45459`)] |
| `getValueY(int): float` | :cite[(`api/api.jsonl:45460`)] |
| `isApplied(int): boolean` | :cite[(`api/api.jsonl:45461`)] |
| `valueOf(String): JoypadAxis2d` | :cite[(`api/api.jsonl:45462`)] |
| `values(): JoypadAxis2d[]` | :cite[(`api/api.jsonl:45463`)] |

**Core, key bindings and controller options**

| Method | Code |
|---|---|
| `addKeyBinding(String, int, int, boolean, boolean, boolean): void` | :cite[(`api/api.jsonl:22701`)] |
| `addKeyBinding(KeybindId, int, int, boolean, boolean, boolean): void` | :cite[(`api/api.jsonl:22702`)] |
| `getAltKey(String): int` | :cite[(`api/api.jsonl:22714`)] |
| `getAltKey(KeybindId): int` | :cite[(`api/api.jsonl:22715`)] |
| `getKey(String): int` | :cite[(`api/api.jsonl:22742`)] |
| `getKey(KeybindId): int` | :cite[(`api/api.jsonl:22743`)] |
| `getKeyBinding(int): KeyBinding` | :cite[(`api/api.jsonl:22744`)] |
| `getKeyBinding(String): KeyBinding` | :cite[(`api/api.jsonl:22745`)] |
| `getKeyBinding(KeybindId): KeyBinding` | :cite[(`api/api.jsonl:22746`)] |
| `getOptionActiveController(String): boolean` | :cite[(`api/api.jsonl:22769`)] |
| `getOptionControllerButtonStyle(): int` | :cite[(`api/api.jsonl:22787`)] |
| `getOptionControllerButtonStyleString(): String` | :cite[(`api/api.jsonl:22788`)] |
| `getOptionGamepadBindingPreset(): String` | :cite[(`api/api.jsonl:22804`)] |
| `invalidBindingShiftCtrl(KeyBinding): boolean` | :cite[(`api/api.jsonl:22923`)] |
| `isKey(String, Integer): boolean` | :cite[(`api/api.jsonl:22941`)] |
| `isKey(KeybindId, Integer): boolean` | :cite[(`api/api.jsonl:22942`)] |
| `onOptionControllerButtonStyleChanged(ConfigOption): void` | :cite[(`api/api.jsonl:23000`)] |
| `onOptionGamepadBindingPresetChanged(ConfigOption): void` | :cite[(`api/api.jsonl:23001`)] |
| `reinitKeyMaps(): void` | :cite[(`api/api.jsonl:23005`)] |
| `setOptionActiveController(int, boolean): void` | :cite[(`api/api.jsonl:23048`)] |
| `setOptionControllerButtonStyle(int): void` | :cite[(`api/api.jsonl:23066`)] |
| `setOptionGamepadBindingPreset(String): void` | :cite[(`api/api.jsonl:23080`)] |
| `updateKeyboard(): void` | :cite[(`api/api.jsonl:23206`)] |

**Global functions for keys, the mouse and controllers**

| Function | Code |
|---|---|
| `activateJoypadOnSteamDeck(): void` | :cite[(`api/api.jsonl:4987`)] |
| `doKeyPress(boolean): void` | :cite[(`api/api.jsonl:5091`)] |
| `getButtonCount(int): int` | :cite[(`api/api.jsonl:5137`)] |
| `getControllerAxisValue(int, int): float` | :cite[(`api/api.jsonl:5163`)] |
| `getControllerCount(): int` | :cite[(`api/api.jsonl:5164`)] |
| `getControllerDeadZone(int, int): float` | :cite[(`api/api.jsonl:5165`)] |
| `getControllerGUID(int): String` | :cite[(`api/api.jsonl:5166`)] |
| `getControllerName(int): String` | :cite[(`api/api.jsonl:5167`)] |
| `getControllerPovX(int): float` | :cite[(`api/api.jsonl:5168`)] |
| `getControllerPovY(int): float` | :cite[(`api/api.jsonl:5169`)] |
| `getJoypadAimingAxisX(int): float` | :cite[(`api/api.jsonl:5234`)] |
| `getJoypadAimingAxisY(int): float` | :cite[(`api/api.jsonl:5235`)] |
| `getJoypadMovementAxisX(int): float` | :cite[(`api/api.jsonl:5236`)] |
| `getJoypadMovementAxisY(int): float` | :cite[(`api/api.jsonl:5237`)] |
| `getKeyCode(String): int` | :cite[(`api/api.jsonl:5238`)] |
| `getKeyName(int): String` | :cite[(`api/api.jsonl:5239`)] |
| `getMouseX(): int` | :cite[(`api/api.jsonl:5275`)] |
| `getMouseXScaled(): int` | :cite[(`api/api.jsonl:5276`)] |
| `getMouseY(): int` | :cite[(`api/api.jsonl:5277`)] |
| `getMouseYScaled(): int` | :cite[(`api/api.jsonl:5278`)] |
| `isAltKeyDown(): boolean` | :cite[(`api/api.jsonl:5398`)] |
| `isControllerConnected(int): boolean` | :cite[(`api/api.jsonl:5401`)] |
| `isCtrlKeyDown(): boolean` | :cite[(`api/api.jsonl:5403`)] |
| `isFloatingGamepadTextInputVisible(): boolean` | :cite[(`api/api.jsonl:5408`)] |
| `isJoypadConnected(int): boolean` | :cite[(`api/api.jsonl:5417`)] |
| `isJoypadDown(int): boolean` | :cite[(`api/api.jsonl:5418`)] |
| `isJoypadLBPressed(int): boolean` | :cite[(`api/api.jsonl:5419`)] |
| `isJoypadLTPressed(int): boolean` | :cite[(`api/api.jsonl:5420`)] |
| `isJoypadLeft(int): boolean` | :cite[(`api/api.jsonl:5421`)] |
| `isJoypadLeftStickButtonPressed(int): boolean` | :cite[(`api/api.jsonl:5422`)] |
| `isJoypadRBPressed(int): boolean` | :cite[(`api/api.jsonl:5423`)] |
| `isJoypadRTPressed(int): boolean` | :cite[(`api/api.jsonl:5424`)] |
| `isJoypadRight(int): boolean` | :cite[(`api/api.jsonl:5425`)] |
| `isJoypadRightStickButtonPressed(int): boolean` | :cite[(`api/api.jsonl:5426`)] |
| `isJoypadUp(int): boolean` | :cite[(`api/api.jsonl:5427`)] |
| `isKeyDown(int): boolean` | :cite[(`api/api.jsonl:5428`)] |
| `isKeyDown(String): boolean` | :cite[(`api/api.jsonl:5429`)] |
| `isKeyDown(KeybindId): boolean` | :cite[(`api/api.jsonl:5430`)] |
| `isKeyPressed(int): boolean` | :cite[(`api/api.jsonl:5431`)] |
| `isKeyPressed(String): boolean` | :cite[(`api/api.jsonl:5432`)] |
| `isKeyPressed(KeybindId): boolean` | :cite[(`api/api.jsonl:5433`)] |
| `isMetaKeyDown(): boolean` | :cite[(`api/api.jsonl:5434`)] |
| `isMouseButtonDown(int): boolean` | :cite[(`api/api.jsonl:5436`)] |
| `isMouseButtonPressed(int): boolean` | :cite[(`api/api.jsonl:5437`)] |
| `isPlaystationController(int): boolean` | :cite[(`api/api.jsonl:5440`)] |
| `isShiftKeyDown(): boolean` | :cite[(`api/api.jsonl:5446`)] |
| `isXBOXController(): boolean` | :cite[(`api/api.jsonl:5459`)] |
| `queueCharEvent(String): void` | :cite[(`api/api.jsonl:5502`)] |
| `reloadControllerConfigFiles(): void` | :cite[(`api/api.jsonl:5509`)] |
| `setMouseXY(int, int): void` | :cite[(`api/api.jsonl:5651`)] |

**Character input, joypad and aim methods**

| Method | Code |
|---|---|
| `getInputMode(): CharacterInputMode` | :cite[(`api/api.jsonl:12601`)] |
| `getJoypadBind(): int` | :cite[(`api/api.jsonl:12604`)] |
| `isAimKeyDown(): boolean` | :cite[(`api/api.jsonl:12605`)] |
| `isAnyAimKeyDown(): boolean` | :cite[(`api/api.jsonl:12608`)] |
| `isForceAim(): boolean` | :cite[(`api/api.jsonl:12616`)] |
| `isIgnoringAimingInput(): boolean` | :cite[(`api/api.jsonl:12621`)] |
| `isJoypadButtonsActive(): boolean` | :cite[(`api/api.jsonl:12626`)] |
| `isJoypadIgnoreAimUntilCentered(): boolean` | :cite[(`api/api.jsonl:12627`)] |
| `isPrecisionAimKeyDown(): boolean` | :cite[(`api/api.jsonl:12630`)] |
| `setForceAim(boolean): void` | :cite[(`api/api.jsonl:12637`)] |
| `setIgnoreAimingInput(boolean): void` | :cite[(`api/api.jsonl:12640`)] |
| `setJoypadBind(int): void` | :cite[(`api/api.jsonl:12642`)] |
| `setJoypadButtonsActive(boolean): void` | :cite[(`api/api.jsonl:12643`)] |
| `setJoypadIgnoreAim(boolean): void` | :cite[(`api/api.jsonl:12644`)] |
| `setJoypadIgnoreAimUntilCentered(boolean): void` | :cite[(`api/api.jsonl:12645`)] |
| `toggleForceAim(): boolean` | :cite[(`api/api.jsonl:12646`)] |

`JoypadManager` is not exposed to Lua. None of its methods are marked callable, so a mod reads a controller through the global functions and the enums above. :cite[(`api/api.jsonl:45494-45592`)]

## How these numbers were counted

A script read the cited files and counted the rows, and no number here is an estimate.

The script found 32 input events in `events.jsonl` from the names listed, 82 bindings between lines 6 and 378 of `keyBinding.lua` (13 of them with `Keyboard.KEY_NONE`), 83 constants in `KeybindId.java` and 28 constants in `CharacterJoypadButtonBinding.java`. :cite[(`api/events.jsonl`, `media/lua/shared/keyBinding.lua:6-378`, `zombie/input/KeybindId.java:17-99`, `zombie/characters/CharacterJoypadButtonBinding.java:20-47`)] The method tables list 22 `GameKeyboard` methods, 34 `Mouse` methods, 4 `KeybindId` methods, 8 `JoypadButton` methods, 9 `JoypadAxis1d` methods, 9 `JoypadAxis2d` methods, 23 `Core` methods, 50 global functions and 16 character methods. :cite[(`api/api.jsonl`)] `JoypadManager` has 88 methods in the index and none of them is Lua-callable.

The event list is the set we judged to be about input, chosen by name, so an event that carries input in another way may be missing (not verified). Events that Lua fires itself, such as `OnFillWorldObjectContextMenu`, are not listed.

:::callout[How we know]{kind=proof}
Every row comes from a file in the 42.22 capture, counted by a script, and nothing was run in a game. Not verified: whether the event list is complete for every kind of input, and the names the game shows for key codes that the English table does not translate.
:::
