---
id: build-42-missing-minimap-check-the-sandbox-first
slug: missing-minimap-check-the-sandbox-first
title: 'Missing minimap? Check the sandbox first'
game: pz
version: build-42
section: modding
category: multiplayer
difficulty: beginner
tags:
  - minimap
  - sandbox
  - server
  - ui
  - layout
excerpt: >-
  No minimap in 42.22 is usually the sandbox option Map.AllowMiniMap, which three of five presets set to off. If the sandbox allows it, suspect layout.ini, which keeps one layout per resolution.
last_updated: '2026-11-21'
related_articles:
  - sandbox-multiplayer-options
  - reading-server-performance-numbers-honestly
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-21.

**Who this page is for:** [players](#1-is-the-minimap-allowed-at-all) | [server owners](#how-a-server-owner-turns-it-on) | [anyone whose minimap is allowed but gone](#2-is-it-hidden-in-a-different-layout)

Outcast, we lost the minimap twice, and both times we went looking in the wrong place. If yours is gone, in single player or on a server, work down this page in order.

:::callout[The 1-minute version]{kind=key}
- The minimap is the sandbox option `Map.AllowMiniMap`. Its code default is off, and the Apocalypse, Extinction and Six Months Later presets also set it off. Outbreak and Rising set it on.
- Hover the map button on the left sidebar. If the minimap is allowed, a small popup offers "View Map" and "Toggle Minimap". If it is not, nothing appears.
- The minimap is also off in the tutorial, and off whenever the world map itself is not allowed.
- On a server, set `AllowMiniMap = true` in the `Map` table of the server's sandbox file, then restart the server, or use the admin panel's sandbox options as described below.
- If the sandbox allows it and it is still gone, the game keeps one window layout for each screen resolution in `layout.ini`, and may have loaded one where the minimap is closed or off screen.
- If you edit `layout.ini` by hand, quit the game first: the file is rewritten when the game leaves the world or exits.
:::

:::facts
- **Option** `Map.AllowMiniMap`, in the "In-game Map" group as "Allow Mini-Map"
- **Code default** off; presets off: Apocalypse, Extinction, Six Months Later; on: Outbreak, Rising
- **Needs also** `Map.AllowWorldMap` on (its code default is on); not in the tutorial
- **Layout file** `layout.ini` in the `Lua` folder of your Zomboid user folder, one `[WIDTHxHEIGHT]` section per resolution
:::

## 1. Is the minimap allowed at all?

The minimap is a sandbox option, `Map.AllowMiniMap`, and its default in the code is **off**.

The option is created with the default `false`. :cite[(`SandboxOptions.java:1791`)] Each preset file sets it, and the plain `SandboxVars.lua` in the same folder starts from the Apocalypse preset, which has it off. :cite[(`media/lua/shared/Sandbox/SandboxVars.lua:1`)] Three of the five vanilla presets keep it off.

| Preset | AllowMiniMap | Code |
|---|---|---|
| Apocalypse | false | `media/lua/shared/Sandbox/Apocalypse.lua:189` |
| Extinction | false | `media/lua/shared/Sandbox/Extinction.lua:189` |
| Six Months Later | false | `media/lua/shared/Sandbox/SixMonthsLater.lua:99` |
| Outbreak | true | `media/lua/shared/Sandbox/Outbreak.lua:189` |
| Rising | true | `media/lua/shared/Sandbox/Rising.lua:189` |

Two of the game's challenge scenarios also set it: one turns it on and one turns it off. :cite[(`media/lua/client/Challenge/28MinutesLater.lua:186`, `media/lua/client/Challenge/TopOfTheWorld.lua:193`)] The option's page is [Map.AllowMiniMap](/pz/build-42/server/sandbox-options/sandbox-options-meta-events#mapallowminimap).

The game answers "is it allowed" in one function, and the minimap needs the world map allowed too. :cite[(`media/lua/client/ISUI/Maps/ISMiniMap.lua:684-688`, `media/lua/client/ISUI/Maps/ISWorldMap.lua:1491-1494`)] The tutorial always answers no. The world map option, `Map.AllowWorldMap`, is created with the default `true`. :cite[(`SandboxOptions.java:1792`)]

**The quick tell:** hover the map button on the left sidebar. The button itself exists only when the world map is allowed, and the popup beside it is built only when the minimap is allowed too, so with the minimap off nothing appears. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:852-868`, `media/lua/client/ISUI/ISEquippedItem.lua:107-119`)] The popup offers "View Map" and "Toggle Minimap". :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:1204`, `media/lua/shared/Translate/EN/IG_UI.json:1074-1075`)]

There is no separate minimap key in Build 42. The only key binding for the map is the map key, "Toggle Map" in the options. :cite[(`KeybindId.java:58`, `media/lua/shared/Translate/EN/UI.json:213`)] Pressing and releasing it toggles the world map, and holding it for half a second opens a radial menu, which offers the minimap toggle only when a minimap exists. :cite[(`media/lua/client/ISUI/Maps/ISWorldMap.lua:1674-1694`, `media/lua/client/ISUI/Maps/ISWorldMap.lua:1704-1716`)]

**The fix for a single-player game:**
- Start a new game on a Custom setup with "Allow Mini-Map" checked in the "In-game Map" group. :cite[(`media/lua/shared/Translate/EN/Sandbox.json:868-870`)]
- Or, in debug mode, open the debug menu's sandbox options and change it there. :cite[(`media/lua/client/DebugUIs/DebugMenu/ISDebugMenu.lua:217-220`)]

### How a server owner turns it on

A dedicated server reads `Map.AllowMiniMap` from its own sandbox file when it starts, so the change is a one-line edit and a restart.

The file is `Server/<servername>_SandboxVars.lua` in the Zomboid folder, and the server loads it at startup when it exists. :cite[(`GameServer.java:1527-1535`)] Set `AllowMiniMap = true` inside the `Map` table, then restart the server.

An admin whose role has the `SandboxOptions` capability can also open "Sandbox Options" in the admin panel and press its apply button. On a client, the button's handler sends the options to the server. :cite[(`media/lua/client/ISUI/AdminPanel/ISAdminPanelUI.lua:226`, `media/lua/client/ISUI/AdminPanel/ISServerSandboxOptionsUI.lua:470-471`, `media/lua/client/ISUI/AdminPanel/ISServerSandboxOptionsUI.lua:763-767`, `SandboxOptions.java:1110-1114`)] The server loads them, applies them, writes its sandbox file, and sends the same packet to every connection, and each client loads and applies them. :cite[(`GameServer.java:1740-1755`, `GameClient.java:2554-2558`)]

We did not test whether a minimap appears for a player already in the game after that. The "reload the options for all clients" tooltip belongs to a different screen, the Server Options screen's button. :cite[(`media/lua/client/ISUI/AdminPanel/ISServerOptions.lua:103-105`, `media/lua/shared/Translate/EN/IG_UI.json:838-839`)] The `/reloadoptions` command is on [the admin commands page](/pz/build-42/server/admin-commands/admin-commands#reloadoptions).

The main menu's server settings screen, used to set up a hosted or co-op game, also lists `Map.AllowMiniMap`. :cite[(`media/lua/client/OptionScreens/ServerSettingsScreen.lua:4961`)]

The game builds the minimap window and the sidebar popup when the player's interface is created. :cite[(`media/lua/client/ISUI/PlayerData/ISPlayerDataObject.lua:139-141`, `media/lua/client/ISUI/ISEquippedItem.lua:863-868`)] A player already in the game may therefore need to rejoin to see a minimap that was just allowed. We read that from the code order and did not test it.

## 2. Is it hidden in a different layout?

If the sandbox allows the minimap and it is still gone, look at your screen resolution: the game saves where every window sits, and whether it is shown, once for each resolution.

The data lives in `layout.ini` in the `Lua` folder of your Zomboid user folder (`%UserProfile%\Zomboid\Lua\layout.ini` on Windows, `~/Zomboid/Lua/layout.ini` on Linux; a game started with `-cachedir=` uses that folder instead of `Zomboid`). :cite[(`Lua/LuaManager.java:1273-1281`, `Lua/LuaManager.java:6697-6701`, `gameStates/MainScreenState.java:166-167`)] That file has **one section per resolution** the game has ever used, headed like `[1920x1080]`; the game only uses the section that matches the current screen size. :cite[(`media/lua/client/ISUI/ISLayoutManager.lua:75-94`, `media/lua/client/ISUI/ISLayoutManager.lua:125-168`)] The minimap window is saved there under the name `miniMap` plus the player number. :cite[(`media/lua/client/ISUI/PlayerData/ISPlayerDataObject.lua:154-156`)]

So if the game starts at a different resolution than you think (a remote-desktop tool or a second monitor can change it under you), it loads a different layout, where the minimap may be closed or off screen. It looks lost, while it is fine in the layout you normally use.

What to do:
- Check the resolution first. In `console.txt` in the same Zomboid folder, compare the line "Desktop resolution" with the line "Initial resolution". If they differ, fix the game's resolution in the options before touching anything else. :cite[(`Core.java:1782-1783`)]
- If you edit `layout.ini` by hand, quit the game completely first. The game writes the file out of its in-memory copy after a save, which happens when it exits or leaves the world, so an edit made while it runs is thrown away. :cite[(`media/lua/client/ISUI/ISLayoutManager.lua:169-232`, `GameWindow.java:761-801`, `IngameState.java:1388`)]

:::callout[How we know]{kind=proof}
- **Code, 42.22.** Every claim above was read from the decompiled 42.22 engine and the vanilla Lua on 2026-11-21.
- **Game test, 42.20 and 42.21 (not re-run on 42.22).** Both causes were seen on our own machine: a minimap missing for months because the game ran at a larger resolution than the screen and loaded that layout, and later a minimap missing because the world used the Apocalypse preset.
- **Not tested.** That an already-connected player must rejoin after the minimap is allowed; and the admin panel's apply button on a live server. The server's broadcast to clients is read from code only.
:::
