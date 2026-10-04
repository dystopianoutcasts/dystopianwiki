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
  No minimap in Build 42 is usually a sandbox setting, not a bug: three of the
  five vanilla presets switch it off. If the sandbox allows it, the next suspect
  is layout.ini, which keeps one UI layout per screen resolution.
last_updated: '2026-10-04'
related_articles:
  - sandbox-multiplayer-options
  - reading-server-performance-numbers-honestly
---
# Missing minimap? Check the sandbox first

Outcast, we lost the minimap twice, and both times we went looking in the wrong place. If yours is gone, in single player or on a server, work down this page in order.

## 1. Is the minimap allowed at all?

The minimap is a sandbox option, `Map.AllowMiniMap`, and its default in the code is **off**. Three of the five vanilla presets keep it off:

| Preset | AllowMiniMap |
|---|---|
| Apocalypse | false |
| Extinction | false |
| Six Months Later | false |
| Outbreak | true |
| Rising | true |

**The quick tell:** hover the map button on the left sidebar. When the minimap is allowed, a small popup offers "View Map" and "Toggle Minimap". When it is not allowed, the game never builds that popup, so nothing appears. The minimap is also always off in the tutorial, and off whenever the world map itself is disallowed.

There is no separate minimap key in Build 42. The map key (M by default) opens the world map; holding it opens a small radial menu, and that menu offers the minimap toggle only when a minimap exists.

**The fix:**
- Single player: start a new game on a Custom preset with the minimap allowed, or in debug mode change it from the debug menu's sandbox options.
- Server: set `AllowMiniMap = true` inside the `Map` section of your server's `SandboxVars.lua`, then restart the server.

> **Proof:** Code. `zombie.SandboxOptions` (`newBooleanOption("Map.AllowMiniMap", false)`); presets in `media/lua/shared/Sandbox/` (`Apocalypse.lua`, `Extinction.lua`, `SixMonthsLater.lua` false; `Outbreak.lua`, `Rising.lua` true); `media/lua/client/ISUI/Maps/ISMiniMap.lua`, `ISMiniMap.IsAllowed`; `media/lua/client/ISUI/ISEquippedItem.lua`, `ISEquippedItem:initialise` (builds the map popup only when `ISMiniMap.IsAllowed()`); `media/lua/shared/keyBinding.lua` (only a `Map` key); `media/lua/client/ISUI/Maps/ISWorldMap.lua`, `ISWorldMap.onKeyKeepPressed`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## 2. Is it hidden in a different layout?

If the sandbox allows the minimap and it is still gone, look at your screen resolution. The game saves where every window sits, and whether it is shown, in `layout.ini` in the `Lua` folder of your Zomboid user folder (`%UserProfile%\Zomboid\Lua\layout.ini` on Windows, `~/Zomboid/Lua/layout.ini` on Linux). That file has **one section per resolution** the game has ever run at, headed like `[1920x1080]`, and the game only uses the section that matches the current screen size.

So if the game starts at a different resolution than you think (a remote-desktop tool or a second monitor can change it under you), it loads a different layout, where the minimap may be closed or off-screen. It looks lost, while it is fine in the layout you normally use.

What to do:
- Check the resolution first. In `console.txt` in the same Zomboid folder, compare the line for the desktop resolution with the line for the game's initial resolution. If they differ, fix the game's resolution in the options before touching anything else.
- If you edit `layout.ini` by hand, quit the game completely first. The game rewrites the file when it exits, so an edit made while it runs is thrown away.

> **Proof:** Code. `media/lua/client/ISUI/ISLayoutManager.lua`, `ReadIni` (parses `[WIDTHxHEIGHT]` headers) and `WriteIni` (writes one section per resolution), matched against `getCore():getScreenWidth()` and `getScreenHeight()`; the file goes to the user's `Lua` folder via `zombie.Lua.LuaManager.GlobalObject#getFileWriter`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Game test. Both causes seen on our own machine: a minimap missing for months because the game ran at a larger resolution than the screen and loaded that layout, and later a minimap missing because the world used the Apocalypse preset. Build 42.20 and 42.21.
