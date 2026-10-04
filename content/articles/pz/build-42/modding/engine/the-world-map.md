---
id: build-42-the-world-map
slug: the-world-map
title: 'The world map: data, discovery and symbols'
game: pz
version: build-42
section: modding
category: engine
difficulty: intermediate
tags:
  - engine
  - world-map
  - ui
  - lua-api
  - multiplayer
excerpt: >-
  The map you open with M, the minimap, paper maps and the stamps you draw are
  one Java system with a Lua front end. Where the map data comes from, how the
  fog of discovery is stored and synced, who owns a symbol on a server, and
  how a mod adds a paper map, a stamp or a reveal that survives a reconnect.
last_updated: '2026-10-04'
related_articles:
  - in-game-map-worldmap-generation
  - missing-minimap-check-the-sandbox-first
  - randomized-stories
  - lua-classes-world-4
---
# The world map: data, discovery and symbols

Outcast, the map is how you find your way back to base, plan a supply run and leave notes for your group. In Build 42 it is also one of the systems where your client and the server keep separate copies of the same thing, which is exactly where mods go wrong. This page covers the map from the 42.21 code: where its picture comes from, how the fog lifts, where your stamps are stored, and what a mod can add.

## What it does for the player

Press M and you get the world map: streets, buildings and water, greyed out where you have never been. Places you walk near fill in. Reading a paper map fills in its whole area at once. You can place stamps and text, and on a server you can share them. If the sandbox settings allow it, a minimap sits in the corner, and on a server that allows it other players appear on the map.

## Where it lives

`zombie.worldMap` is about 19,000 lines in 85 files.

| Piece | Class | Job |
|---|---|---|
| The widget | `UIWorldMap` | The Java UI element; Lua drives it through `getAPIv1()`, `getAPIv2()`, `getAPIv3()` |
| Data | `WorldMap`, `WorldMapData`, `WorldMapBinary` | Map features (streets, buildings, water) from `worldmap.xml` and `worldmap-forest.xml` per map folder |
| Images | `ImagePyramid`, `WorldMapImages` | Tile images from `pyramid.zip` and `forest.pyramid.zip` per map folder |
| Drawing | `WorldMapRenderer`, `styles.*` | Draws the layers with a style; also has debug overlays |
| Streets | `streets.*` | Street names and their placement |
| Discovery | `WorldMapVisited` | The fog: one record per 32 by 32 squares, two bits each, "known" and "visited" |
| Discovery, server | `WorldMapVisitedServer` | One discovery record per account, kept by the server |
| Symbols | `symbols.*`, `MapSymbolDefinitions` | Stamps and text, and the list of stamp images |
| Shared symbols | `network.WorldMapServer`, `WorldMapClient` | Symbols shared on a server |
| Paper maps | `inventory.types.MapItem` | A map item; the world map itself is a hidden `MapItem` too |

The Lua side: `media/lua/client/ISUI/Maps/ISWorldMap.lua` (the M window), `ISMiniMap.lua`, `ISMap.lua` (reading a paper map), `ISMapDefinitions.lua` (`MapUtils` and the `LootMaps` definitions), and `media/lua/shared/Definitions/MapSymbolDefinitions.lua` (the stamps).

> **Proof:** Code. `zombie.worldMap.UIWorldMap`, `zombie.worldMap.WorldMap#addData`, `#endDirectoryData`, `#addImages` (`forest.pyramid.zip`), `zombie.worldMap.WorldMapImages#getOrCreate` (`pyramid.zip`), `zombie.worldMap.WorldMapVisited` (`SQUARES_PER_UNIT = 32`, `BIT_VISITED = 1`, `BIT_KNOWN = 2`), `zombie.worldMap.WorldMapVisitedServer`, `zombie.worldMap.network.WorldMapServer`, `zombie.inventory.types.MapItem#getSingleton`; `media/lua/client/ISUI/Maps/ISMapDefinitions.lua` (`MapUtils.initDirectoryMapData`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where the picture comes from

The map does not read the game world. It reads separate data that map makers generate: for each map folder, `worldmap.xml` and `worldmap-forest.xml` for shapes and `pyramid.zip` and `forest.pyramid.zip` for images. `MapUtils.initDefaultMapData` walks the map folders in load order, mods first and vanilla last, and the first folder that has features for a cell wins that cell. A map mod whose map has no worldmap data shows as blank on the map, however well it plays. How to generate that data is on [In-game map (worldmap) generation](/pz/build-42/mapping/fundamentals/in-game-map-worldmap-generation).

> **Proof:** Code. `media/lua/client/ISUI/Maps/ISMapDefinitions.lua` (`MapUtils.initDirectoryMapData`: `worldmap-forest.xml`, `worldmap.xml`, `endDirectoryData`, `addImages`; `MapUtils.initDefaultMapData` over `getLotDirectories()`, "highest priority (mods) to lowest priority (vanilla)"); `zombie.worldMap.WorldMap#endDirectoryData` and `#isLastDataInDirectory`. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## How the fog lifts

Discovery is stored in blocks of 32 by 32 squares, eight per cell side, with two flags per block: **known** (the map shows it) and **visited** (you have been there). While you are alive, every block that overlaps a square 25 squares around you in each direction gets both flags. Reading a paper map, or a book or magazine that marks places, sets **known** for its rectangle. The sandbox option **All Known On Start** fills the map when the discovery data is created. The Forget button on the map clears it.

> **Proof:** Code. `zombie.worldMap.WorldMapVisited#update` (`RADIUS = 25`, flags `3`), `#getInstance` (`mapAllKnown` sets known in all cells on load), `#setBounds` (the texture starts filled when `mapAllKnown` is on), `#forget`; `media/lua/client/ISUI/Maps/ISMap.lua` (`MapUtils.revealKnownArea`); `media/lua/shared/TimedActions/ISReadABook.lua` (`setKnownInSquares` for each location); `media/lua/client/ISUI/Maps/ISWorldMap.lua` (`onConfirmForget`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## When it runs and on which side

- **Single player:** your game marks discovery every update and saves it with the save.
- **Multiplayer client:** the client marks discovery for its own display, but it never loads it from disk. It gets its record from the server when it connects.
- **Dedicated server:** the server keeps one record per account name, as a zip per user in the save's `map_visited_server` folder, and marks it from each connected player's position in its main loop (not while that player is asleep). It is saved when the user leaves and when the server saves. The record is deleted on death only when the server option `DropOffWhiteListAfterDeath` removes the account; otherwise a new character after death starts with the old map.
- **Symbols:** your private stamps on the M map are kept by your own game in `map_symbols.bin` (on a client, in the client's own save folder for that server). Shared symbols live on the server in `servermap_symbols.bin`, and only their author can change, unshare or remove them.
- **Other players on the map:** the server decides whom to send to whom. Server option `MapRemotePlayerVisibility`: 1 hidden (default), 2 faction or safehouse members, 3 those plus anyone you can see, 4 everyone. A role with the `SeeWorldMap` capability sees all.

> **Proof:** Code. `zombie.gameStates.IngameState` (`WorldMapVisited.update()` every update); `WorldMapVisited#getInstance` (returns before `load()` on a client); `zombie.network.packets.RequestDataPacket` (`WorldMapVisitedServer#sendRequestData`, client `WorldMapVisited#receiveRequestData`); `zombie.worldMap.WorldMapVisitedServer#update` (skips dead and sleeping players), `#loadUser`, `#unloadUser`, `#save`, `#deleteUser`, `#getFolderName` (`map_visited_server`); `zombie.network.ServerMap` (calls `WorldMapVisitedServer.getInstance().save()`); `zombie.network.GameServer` (calls `WorldMapVisitedServer.getInstance().update()` in the main loop, `unloadUser` on disconnect, `#shouldSendWorldMapPlayerPosition`, `MapRemotePlayerVisibility` NONE, FACTION_ONLY, FACTION_AND_VISIBLE_ONLY, ALL); `zombie.characters.IsoGameCharacter` (`deleteUser` under `dropOffWhiteListAfterDeath`); `zombie.inventory.types.MapItem#SaveWorldMap` (`map_symbols.bin`), `zombie.iso.IsoWorld#init` (`LoadWorldMap` when not a server); `zombie.worldMap.network.WorldMapServer` (`servermap_symbols.bin`, `canClientModify` compares the author to the connection's user name); `zombie.network.ServerOptions` (`MapRemotePlayerVisibility` 1 to 4, default 1). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What Lua can reach

- **Discovery, client or single player:** `WorldMapVisited.getInstance()` with `setKnownInSquares(x1, y1, x2, y2)`, `setVisitedInSquares`, the `clear...` versions, `isKnown(x, y)`, `isVisited(x, y)` and `forget()`.
- **Discovery, server:** `WorldMapVisitedServer.getInstance():setKnownInSquares(player, x1, y1, x2, y2)` and `forget(player)`. There is no per-player "visited" setter on the server.
- **The widget:** `UIWorldMap` and its three API objects; vanilla's windows are good examples of driving them.
- **Stamps:** `MapSymbolDefinitions.getInstance():addTexture(id, path, tab)`, as vanilla does in a shared file.
- **Paper maps:** an item script with `Map = <id>`, and a function `LootMaps.Init.<id> = function(mapUI) ... end` in client Lua that loads data, sets the bounds and style and adds overlays. `LootMaps.callLua` looks the function up by the item's stash name first, then its map id.
- **Sandbox:** `Map.AllowMiniMap` (off by default), `Map.AllowWorldMap`, `Map.MapAllKnown`, `Map.MapNeedsLight`.

See [UIWorldMap](/pz/build-42/modding/reference/lua-classes-world-4#uiworldmap), [WorldMapVisited](/pz/build-42/modding/reference/lua-classes-world-4#worldmapvisited), [WorldMapVisitedServer](/pz/build-42/modding/reference/lua-classes-world-4#worldmapvisitedserver), [MapSymbolDefinitions](/pz/build-42/modding/reference/lua-classes-world-4#mapsymboldefinitions), [MapItem](/pz/build-42/modding/reference/lua-classes-items#mapitem) and [SandboxOptions](/pz/build-42/modding/reference/lua-classes-game-and-core-2#sandboxoptions). No Lua event is fired by the map system itself.

> **Proof:** Code. `zombie.Lua.LuaManager` (map classes exposed); `media/lua/shared/Definitions/MapSymbolDefinitions.lua` (`MapSymbolDefinitions.getInstance():addTexture(...)`); `zombie.scripting.objects.Item#DoParam` (`Map`) and the map item branch (`setMapID`); `media/lua/client/ISUI/Maps/ISMapDefinitions.lua` (`LootMaps.Init.MarchRidgeMap`, `LootMaps.callLua`: `t[mapItem:getStashMap()] or t[mapItem:getMapID()]`); `zombie.SandboxOptions.Map` (`AllowMiniMap` false, `AllowWorldMap` true, `MapAllKnown` false, `MapNeedsLight` true). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## What a mod can and cannot change

**Can:** add paper maps with their own area and look, add stamps, reveal areas (and clear them, though on a server only the whole record can be cleared), add the worldmap data for a custom map, build its own map window on `UIWorldMap`, and draw on top of the map from Lua.

**Cannot, from Lua:** change the built-in 25-square discovery radius (you can reveal more yourself with the calls above), store discovery at a finer grain than 32 by 32 squares, or make the server keep a "visited" flag for a player (only "known").

Traps:

- **A reveal made only on the client is lost on reconnect.** In multiplayer the client's record is rebuilt from the server's every time it connects. Do what vanilla does: update the client's `WorldMapVisited` for the immediate display, and make the server update `WorldMapVisitedServer` (vanilla's paper map sends the client command `map` / `setKnownInSquares`; vanilla's book reading calls the server class directly when `isServer()`).
- **The server takes the client's rectangle as given.** Vanilla's `setKnownInSquares` client command passes the client's coordinates straight to the server record. A modified client can reveal its whole map for itself. That is a server owner's concern, and a reason not to hang anything secret on discovery.
- **Private symbols are not on the server.** A player who reinstalls or plays from another machine loses private stamps, while shared ones survive.
- **Discovery belongs to the account, not the character.** On a server, dying and making a new character keeps the map unless the account is dropped after death.
- **No worldmap data, no map.** The renderer only shows data files; a map mod without `worldmap.xml` draws nothing, and the first map folder with data for a cell hides every later folder's data for it.

> **Proof:** Code. `WorldMapVisited#getInstance` (client never loads), `zombie.network.packets.RequestDataPacket`; `media/lua/client/ISUI/Maps/ISMap.lua` (`sendClientCommand(self.character, "map", "setKnownInSquares", args)` when `isClient()`); `media/lua/server/ClientCommands.lua` (`Commands.map.setKnownInSquares` calls `WorldMapVisitedServer.getInstance():setKnownInSquares(player, args.x1, args.y1, args.x2, args.y2)` with no check); `media/lua/shared/TimedActions/ISReadABook.lua` (server and client branches); `MapItem#SaveWorldMap`, `WorldMapServer#writeSavefile`; `WorldMapVisitedServer` (keyed by `connection.getUserName()`); `IsoGameCharacter` (`deleteUser` only under `dropOffWhiteListAfterDeath`). Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

> **Proof:** Unknown. We have not reconnected to a server to watch a client-only reveal disappear. The test that settles it: on a test server, run `WorldMapVisited.getInstance():setKnownInSquares(...)` for a far-away area from a client-side Lua console, check the map, reconnect, and check again. Build 42.21, engine revision 4a0e9546ec (Steam build 25485521).

## Where to go next

- [In-game map (worldmap) generation](/pz/build-42/mapping/fundamentals/in-game-map-worldmap-generation), to make the data the map draws.
- [Missing minimap? Check the sandbox first](/pz/build-42/modding/multiplayer/missing-minimap-check-the-sandbox-first).
- [Stories and randomized content](/pz/build-42/modding/engine/randomized-stories), where the treasure-map stashes come from.
- [Radio and television](/pz/build-42/modding/engine/radio-and-television), the other system with separate client and server copies.
