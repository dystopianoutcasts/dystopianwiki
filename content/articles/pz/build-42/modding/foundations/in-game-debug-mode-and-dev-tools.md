---
id: build-42-in-game-debug-mode-and-dev-tools
slug: in-game-debug-mode-and-dev-tools
title: In-game DEBUG mode and dev tools
game: pz
version: build-42
section: modding
category: foundations
difficulty: beginner
tags:
  - debug-mode
  - tools
excerpt: >-
  How to turn on debug mode in Build 42.22 with the -debug launch option, what the debug menu's Main and Dev tabs hold, and where the Lua debugger key and debug-options.ini come from.
last_updated: '2026-11-16'
related_articles:
  - tl-dr-what-a-b41-modder-must-change-first
  - the-b42-mod-project-structure
  - lua-folder-load-order
  - b41-b42-porting-what-breaks-a-concrete-checklist
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-16.

**Who this page is for:** modders who want the debug tools while they build a mod. The load rules for your Lua are on [Lua folder load order](/pz/build-42/modding/foundations/lua-folder-load-order).

:::callout[The 1-minute version]{kind=key}
- Add `-debug` to the game's launch options. That sets the game's debug flag, and the debug menu is built only when the debug flag is set.
- With the flag on, the sidebar shows a debug button. It opens the debug menu, which has a Main tab and a Dev tab.
- The Main tab holds the Cheats, Items List, Player's Stats, Craft Recipes and Sandbox Settings windows, among others. The Dev tab holds viewers and editors such as the Animation Viewer, Attachment Editor, Map Editor and Vehicle Editor.
- F11 is the default key for Toggle Lua Debugger, and it only works while the debug flag is on.
- Debug options you set are saved in `debug-options.ini` in the game's cache folder.
:::

:::facts
- **Launch option** `-debug`
- **Lua debugger key** F11, the default
- **Debug options file** `debug-options.ini`, in the cache folder
- **Debug menu tabs** Main and Dev
:::

## 1. Turning it on

**The launch option `-debug` sets the game's debug flag, and the flag is what every debug tool checks.**

The game reads its start-up arguments and sets the debug flag when one is exactly `-debug`. :cite[(`zombie/gameStates/MainScreenState.java:242-243`)] The `-imgui` option sets the same flag, and so does `-imguidebugviewports`. :cite[(`zombie/gameStates/MainScreenState.java:245-250`)] In Steam, the Launch Options box is where you type it; that is a Steam step, not game code.

Lua asks for the flag with the global `isDebugEnabled`. :cite[(`zombie/Lua/LuaManager.java:4257-4262`)] On the main screen, a game started with the flag shows the debug scenarios list. :cite[(`media/lua/client/OptionScreens/MainScreen.lua:762-764`)]

## 2. The debug menu

**The sidebar's debug button opens a menu with a Main tab of general tools and a Dev tab of viewers and editors.**

The sidebar builds the button when the debug flag is set, unless `ISDebugMenu.forceEnable` is set, which also shows it outside multiplayer. :cite[(`media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:8`, `media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:86`)] :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:874-876`)] Its icon switches between an on and an off picture while the menu is open or closed. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:122-126`)] The same click handler opens the menu, or closes it when it is already open. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:453-457`)]

::::cards
:::card[Main tab]{accent=orange}
General debuggers, Cheats, Climate debuggers, Craft Recipes, Player's Stats, Items List, Fluids, Entities, Script Manager, XUI Debugger, Recipe Monitor and Sandbox Settings.
:::
:::card[Dev tab]{accent=purple}
Audio, IsoRegions, Zombie Population, Stash debuggers, Anim monitor, Zomboid Radio, Animation Viewer, Attachment Editor, Chunk Debugger, Global Objects, Map Editor, Vehicle Editor, World Flares, Global Mod Data, New UI, Unit Tests, Character Debug, Forget Recipes and Seam Editor.
:::
::::

The menu code adds each button to the Main or the Dev tab, and the labels come from the English translation. :cite[(`media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:16-47`, `media/lua/shared/Translate/EN/IG_UI.json:5651-5681`)]

## 3. The Lua debugger and debug options

**F11 is the default key for the Lua debugger, and your debug options are saved to a file in the cache folder.**

The key binding table gives Toggle Lua Debugger the key F11. :cite[(`media/lua/shared/keyBinding.lua:355-358`)] When the debug flag is on and that key is down, the game starts stepping into the Lua. :cite[(`zombie/GameWindow.java:719-724`)] The debug strip also has a toggle that sets whether the Lua debugger shows when a Lua error happens. :cite[(`media/lua/client/DebugUIs/DebugToolstrip.lua:28-30`)]

The debug options are written to and read from `debug-options.ini` in the cache folder. :cite[(`zombie/debug/DebugOptions.java:380-392`)] The file name ends in `.ini`.

Debug scenarios are Lua files in the folder `media/lua/client/DebugUIs/Scenarios/`, and `DebugScenario.lua` is one of them. :cite[(`media/lua/client/DebugUIs/Scenarios/DebugScenario.lua:1-2`)]

:::callout[How we know]{kind=proof}
Read from the 42.22 decompiled Java and the vanilla Lua; no game was run. Not verified: the color of the bug icon, the T key in the map debugger, whether the "reload file" button reliably applies a changed file, what `-debug` prints to the console, and the `[B42]DebugMenu` Workshop mod. Earlier notes named the options file `debug-options.init`; the code reads `debug-options.ini`.
:::
