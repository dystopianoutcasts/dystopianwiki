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
  How the Build 42 world map works: where its picture comes from, how the fog of discovery is stored and synced, who owns a symbol on a server, and what a mod can add or change.
last_updated: '2026-11-15'
related_articles:
  - world-and-cells-overview
  - in-game-map-worldmap-generation
  - world-map-and-tiles-overview
  - missing-minimap-check-the-sandbox-first
  - randomized-stories
  - lua-classes-world-4
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

**Who this page is for:** [modders](#what-lua-can-reach) | [server owners](#when-it-runs-and-on-which-side) | [map makers](#where-the-picture-comes-from), who will also want [In-game map (worldmap) generation](/pz/build-42/mapping/fundamentals/in-game-map-worldmap-generation)

:::callout[The 1-minute version]{kind=key}
- The M map, the minimap and paper maps are one Java system with a Lua front end. The picture comes from map data files that map makers generate, not from the loaded world.
- Every map folder's features are drawn, but a lower-priority folder's shapes are cut away where a higher-priority map has its own lot cells. A map folder with no world map data adds no shapes.
- Discovery (the fog) is stored per 32 by 32 squares, with a "known" flag and a "visited" flag. While you are alive, the squares within 25 of you get both.
- On a server, discovery belongs to the account and the server keeps it; a reveal made only on the client is, as read from the code and not watched, rebuilt from the server's copy when you reconnect.
- Shared symbols live on the server and only their author can change them. Private symbols are kept in your own save.
- A mod can add paper maps, stamps and reveals, and can build its own map window. It cannot change the 25-square radius from Lua.
:::

:::facts
- **Package size** 85 files, 19,177 lines in `zombie/worldMap`, counted by script
- **Discovery unit** 32 by 32 squares, 8 for each side of a 256-square cell :cite[(`WorldMapVisited.java:93-95`)]
- **Discovery radius** 25 squares around a living player :cite[(`WorldMapVisited.java:92`, `:920-940`)]
- **Cell size** 256 squares :cite[(`IsoCell.java:127`)]
- **Remote players on the map** server option 1 to 4, default 1 (hidden) :cite[(`ServerOptions.java:191`)]
:::

## What it does for the player

The player presses M for the world map, and it fills in as they explore.

The map shows streets, buildings and water, hidden where the player has never been. Places near the player fill in as they walk, and reading a paper map fills in its whole area at once. Players can place stamps and text, and on a server they can share them. A minimap sits in the corner when the sandbox allows it, and on a server that allows it, other players appear on the map.

The sandbox group `Map` holds four options, and their defaults are off for `AllowMiniMap`, on for `AllowWorldMap`, off for `MapAllKnown` and on for `MapNeedsLight` :cite[(`SandboxOptions.java:1791-1794`)]. The in-game names are "Allow Mini-Map", "Allow World Map", "All Known On Start" and "Light Needed To Read Map" :cite[(`Sandbox.json:869-876`)].

## Where it lives

The map is about 19,000 lines in the `zombie.worldMap` package, plus a set of Lua windows.

::::cards
:::card[Data]{accent=orange}
`WorldMap`, `WorldMapData` and `WorldMapBinary` hold the map features (streets, buildings, water) read from `worldmap.xml` and `worldmap-forest.xml`, or from the binary form of each.
:::
:::card[Images]{accent=blue}
`ImagePyramid` and `WorldMapImages` load tile images from `pyramid.zip` and `forest.pyramid.zip` in each map folder.
:::
:::card[Drawing]{accent=purple}
`WorldMapRenderer` and the `styles` classes draw the layers with a style; `streets` holds street names and their placement.
:::
:::card[Discovery]{accent=cream}
`WorldMapVisited` is the fog on a client or in single player. `WorldMapVisitedServer` holds one record per account on a server.
:::
:::card[Symbols]{accent=orange}
`symbols` and `MapSymbolDefinitions` hold stamps and text; `WorldMapServer` and `WorldMapClient` share symbols on a server.
:::
:::card[Paper maps]{accent=blue}
`MapItem` is a paper map item. The world map itself is a hidden `MapItem` too.
:::
::::

The widget is `UIWorldMap`, and Lua drives it through three API objects, `getAPIv1()`, `getAPIv2()` and `getAPIv3()` :cite[(`UIWorldMap.java:102-112`)]. The classes named above are in the `zombie/worldMap` package, apart from `MapItem`, which is an inventory item type :cite[(`MapItem.java:33`)]. The hidden world map item is built from the item script `Base.Map` :cite[(`MapItem.java:40-48`)].

The Lua side is `media/lua/client/ISUI/Maps/`: `ISWorldMap.lua` is the M window, `ISMiniMap.lua` the minimap, `ISMap.lua` reading a paper map, and `ISMapDefinitions.lua` holds `MapUtils` and the `LootMaps` definitions. The stamps are defined in `media/lua/shared/Definitions/MapSymbolDefinitions.lua`.

## Where the picture comes from

The map does not read the game world. It reads separate data files that map makers generate.

For each map folder, Lua adds `worldmap-forest.xml` and then `worldmap.xml`, closes the folder with `endDirectoryData`, and adds the folder's images :cite[(`ISMapDefinitions.lua:3-20`)]. When a data file is loaded, the game uses the `.bin` file beside it if one exists, and the XML only when there is none :cite[(`WorldMapDataAssetManager.java:34-38`)]. Street names come from `streets.xml` in the same folder, and extra drawings from `worldmap-annotations.lua` :cite[(`ISMapDefinitions.lua:32-39`, `:52-60`)].

`MapUtils.initDefaultMapData` walks the map folders from highest priority (mods) to lowest (vanilla) :cite[(`ISMapDefinitions.lua:22-30`)]. A comment in that file says that when a folder has features for a cell, no data added afterward is used for that cell :cite[(`ISMapDefinitions.lua:14-17`)]. The Java side records the end of each folder but no code was found that reads that record, so the comment does not describe what the renderer does :cite[(`WorldMap.java:107-118`)].

The renderer collects a cell's features from every data file, and each cell takes the priority of the map folder that holds its file :cite[(`WorldMapRenderer.java:1016-1033`)].

When the game prepares a cell's shapes, it clips them against the 300-square lot cells of every higher-priority map that has a cell there :cite[(`WorldMapGeometry.java:141-160`)]. The result is that a mod's own lot cells cut the vanilla shapes away, and a map folder with no world map data adds no shapes at all, however well the map plays.

The binary file is read by `WorldMapBinary`. It checks a four-letter header, accepts only version 2, and rejects version 1, which the code describes as cell size 300 :cite[(`WorldMapBinary.java:40-45`)]. It also rejects any cell size other than 256 :cite[(`WorldMapBinary.java:50-52`)]. How to produce this data is on [In-game map (worldmap) generation](/pz/build-42/mapping/fundamentals/in-game-map-worldmap-generation).

## How the fog lifts

Discovery is stored in blocks of 32 by 32 squares, with two flags for each block: known (the map shows it) and visited (you have been there).

The block size and the flag values are constants: 32 squares per block, 8 blocks per cell side, visited is bit 1 and known is bit 2 :cite[(`WorldMapVisited.java:92-100`)]. While a player is alive, the blocks within 25 squares of the player get both flags :cite[(`WorldMapVisited.java:913-946`)].

Reading a paper map sets "known" for the map's rectangle :cite[(`ISMap.lua:392-396`, `ISMapDefinitions.lua:377-384`)]. A book or magazine that marks places sets "known" for each location it lists, on the server when the code runs there and on the client otherwise :cite[(`ISReadABook.lua:301-319`)]. With the sandbox option All Known On Start, "known" is set over the whole map each time the discovery data is built after loading, which is every game load :cite[(`WorldMapVisited.java:896-901`)].

The Forget button on the map asks for confirmation, then clears the player's own annotations and the discovery record, and sends a `forget` command to the server :cite[(`ISWorldMap.lua:994`, `:1005-1010`)]. The server answers by replacing the account's record with an empty one :cite[(`WorldMapVisitedServer.java:79-84`, `ClientCommands.lua:1293-1295`)].

## When it runs and on which side

Where the discovery record lives depends on whether you play alone, on a client, or on a dedicated server.

- **Single player:** the game marks discovery on every update :cite[(`IngameState.java:717-718`)] and saves it in `map_visited.bin` in the save :cite[(`WorldMapVisited.java:466`, `:488`, `:560`)].
- **Multiplayer client:** the client marks discovery for its own display, but it never loads it from disk :cite[(`WorldMapVisited.java:893-895`)]. It receives the record from the server when it connects :cite[(`RequestDataPacket.java:235`, `WorldMapVisited.java:618`)].
- **Dedicated server:** the server keeps one record for each account name, as a zip per user in the save's `map_visited_server` folder :cite[(`WorldMapVisitedServer.java:86-130`, `:222`)]. It marks each connected player's position in its main loop, but not while the player is dead or asleep :cite[(`GameServer.java:1215`, `WorldMapVisitedServer.java:59-70`)]. It saves the records when the server saves, and on disconnect it saves that user's record before dropping it from memory :cite[(`ServerMap.java:390`, `GameServer.java:3109`, `WorldMapVisitedServer.java:193-197`)].
- **After death:** the record is deleted on death only when the server option `DropOffWhiteListAfterDeath` is on and the player's role does not have the `CanAlwaysJoinServer` capability. Otherwise a new character after death starts with the old map :cite[(`IsoGameCharacter.java:2085-2096`)].
- **Private symbols:** a player's own stamps on the M map are kept in `map_symbols.bin` in the save, and the game loads that file when it is not a server :cite[(`MapItem.java:53-100`, `IsoWorld.java:2210-2213`)].
- **Shared symbols:** these live on the server in `servermap_symbols.bin`, and a client may change or remove one only when its user name matches the symbol's author :cite[(`WorldMapServer.java:266`, `:293`, `:92`, `:111`, `:126`, `:157-159`)].
- **Other players on the map:** the server decides whom to show to whom. The option `MapRemotePlayerVisibility` has the values 1 (hidden, the default), 2 (faction or safehouse members), 3 (faction or safehouse members plus players who are in sight) and 4 (everyone), and a role with the `SeeWorldMap` capability sees every player :cite[(`ServerOptions.java:191`, `GameServer.java:3390-3420`, `:4473-4478`)].

## What Lua can reach

A mod can read and set discovery, draw its own map window, add stamps and add paper maps.

- **Discovery, client or single player:** `WorldMapVisited.getInstance()` with `setKnownInSquares(x1, y1, x2, y2)`, `setVisitedInSquares`, the `clear...` versions, `isKnown(x, y)`, `isVisited(x, y)` and `forget()` :cite[(`WorldMapVisited.java:210-224`, `:864-882`, `:952`)].
- **Discovery, server:** `WorldMapVisitedServer.getInstance():setKnownInSquares(player, x1, y1, x2, y2)` and `forget(player)`. The server class has no per-player "visited" setter :cite[(`WorldMapVisitedServer.java:72-84`, `LuaManager.java:2720`)].
- **The widget:** `UIWorldMap` and its three API objects; vanilla's windows are examples of driving them :cite[(`LuaManager.java:2692`)].
- **Stamps:** `MapSymbolDefinitions.getInstance():addTexture(id, path, tab)`, as vanilla does in a shared file :cite[(`MapSymbolDefinitions.lua:1-5`)].
- **Paper maps:** an item script with `Map = <id>`, and a client Lua function `LootMaps.Init.<id> = function(mapUI) ... end` that loads data, sets the bounds and style and adds overlays :cite[(`Item.java:2608-2609`, `ISMapDefinitions.lua:447-451`)]. `LootMaps.callLua` looks the function up by the item's stash name first, then its map id :cite[(`ISMapDefinitions.lua:428-441`)].
- **Stash icons:** while the print media toggle is active, the world map draws a map icon for each stash map the player has read, at the center of that stash's drawing rectangle, as the draw loop shows :cite[(`ISWorldMap.lua:595-626`)]. See [Paper maps and annotations](/pz/build-42/engine/stash-and-annotated-maps/paper-maps-and-annotations).
- **Sandbox:** the four `Map` options listed above.

Reference pages: [UIWorldMap](/pz/build-42/modding/reference/lua-classes-world-4#uiworldmap), [WorldMapVisited](/pz/build-42/modding/reference/lua-classes-world-4#worldmapvisited), [WorldMapVisitedServer](/pz/build-42/modding/reference/lua-classes-world-4#worldmapvisitedserver), [MapSymbolDefinitions](/pz/build-42/modding/reference/lua-classes-world-4#mapsymboldefinitions), [MapItem](/pz/build-42/modding/reference/lua-classes-items#mapitem) and [SandboxOptions](/pz/build-42/modding/reference/lua-classes-game-and-core-2#sandboxoptions). None of the Lua event names in the API index concerns the world map window, discovery or symbols; the events with "Map" in their name are about loading cells and zones.

## Tools for map makers

When the game runs in debug mode, or the player is an admin on a server, the map has extra tools.

Right-clicking the M map then offers Show Cell Grid, Show Tile Grid, Hide Unvisited Areas, Isometric and Reapply Style, and a teleport entry :cite[(`ISWorldMap.lua:911-942`)].

The same condition shows every option in the map's options panel :cite[(`ISWorldMap.lua:36-38`)].

The debug menu has a "Map Editor" button that opens a world map editor window :cite[(`ISDebugMenu.lua:42`, `IG_UI.json:5673`)]. It has seven modes: data files, bounds, style, annotations, maps, stashes and streets :cite[(`WorldMapEditor.lua:36-39`)].

It can copy the Lua script that the current mode generates :cite[(`WorldMapEditor.lua:101`, `:245-246`)]. Which of these tools a map maker should use is not covered here; this page only records that they exist.

## What a mod can and cannot change

A mod can add maps, stamps and reveals, and cannot change the discovery grain or radius.

**Can:** add paper maps with their own area and look, add stamps, reveal areas (and clear them, though on a server only the whole record can be cleared), add the world map data for a custom map, build its own map window on `UIWorldMap`, and draw on top of the map from Lua.

**Cannot, from Lua:** change the built-in 25-square discovery radius (you can reveal more yourself with the calls above), store discovery at a finer grain than 32 by 32 squares, or make the server keep a "visited" flag for a player (only "known").

Traps:

- **A reveal made only on the client is lost on reconnect.** In multiplayer the client's record is, as read from the code and not watched, rebuilt from the server's every time it connects. Do what vanilla does: update the client's `WorldMapVisited` for the immediate display, and make the server update `WorldMapVisitedServer` :cite[(`ISMap.lua:393-406`, `ClientCommands.lua:1289-1291`)]. Vanilla's paper map sends the client command `map` / `setKnownInSquares`, and vanilla's book reading calls the server class directly when `isServer()` :cite[(`ISReadABook.lua:315-317`)].
- **The server takes the client's rectangle as given.** Vanilla's `setKnownInSquares` command passes the client's coordinates straight to the server record, with no check :cite[(`ClientCommands.lua:1289-1291`)]. A modified client can reveal its whole map for itself. That is a server owner's concern, and a reason not to hang anything secret on discovery.
- **Private symbols are not on the server.** Private stamps are kept in a file in the save, so a player who plays from another machine, as far as the file names show, would not have them, while shared ones survive on the server. This was not tried.
- **Discovery belongs to the account, not the character.** On a server, dying and making a new character keeps the map unless the account is dropped after death.
- **No world map data, no shapes.** The renderer draws shapes only from data files. A map mod without them adds nothing to the map, and its lot cells still cut away lower-priority shapes where they overlap.

## Where to go next

- [In-game map (worldmap) generation](/pz/build-42/mapping/fundamentals/in-game-map-worldmap-generation), to make the data the map draws.
- [World and cells](/pz/build-42/mapping/fundamentals/world-and-cells-overview), the cell and tool overview for map makers.
- [Missing minimap? Check the sandbox first](/pz/build-42/modding/multiplayer/missing-minimap-check-the-sandbox-first).
- [Stories and randomized content](/pz/build-42/modding/engine/randomized-stories), where the treasure-map stashes come from.
- [Radio and television](/pz/build-42/modding/engine/radio-and-television), the other system with separate client and server copies.

:::callout[How we know]{kind=proof}
Every code reference was opened in the 42.22 capture. The package size and the counts come from reading the source tree, not from one line.

**Corrected or added since the older page:**
- Pressing Forget now also clears the player's own annotations and sends a `forget` command to the server.
- The `DropOffWhiteListAfterDeath` deletion skips roles with the `CanAlwaysJoinServer` capability.
- The game loads `worldmap.xml.bin` instead of `worldmap.xml` when the binary file exists, and it rejects cell size 300.
- Street names (`streets.xml`) and `worldmap-annotations.lua` are read per map folder.
- The older page said the first map folder with data for a cell wins it, from the Lua comment. The renderer instead draws every folder's features and clips lower-priority shapes by higher-priority lot cells.

**Not verified:**
- We have not reconnected to a server to watch a client-only reveal disappear. The test that settles it: on a test server, run `WorldMapVisited.getInstance():setKnownInSquares(...)` for a far-away area from a client-side Lua console, check the map, reconnect, and check again.
- The older page said the client keeps private stamps "in the client's own save folder for that server". The code shows the file name and that it is saved in the current save; the folder for a server was not traced.
- The map data files themselves (`worldmap.xml`, `pyramid.zip`, `map.info`) are not in the capture, so which maps ship which files was not checked.
:::
