---
id: build-42-paper-maps-and-annotations
slug: paper-maps-and-annotations
title: 'Paper maps and annotations'
game: pz
version: build-42
section: engine
category: stash-and-annotated-maps
difficulty: intermediate
tags:
  - engine
  - maps
  - stash
  - lua
  - ui
  - debug
excerpt: >-
  How a paper map item is drawn in Build 42.22, how a stash's stamps and notes reach it, the 91 stamp symbols, and how to preview and test it with the map editor and the stash debug panel.
last_updated: '2026-11-14'
related_articles:
  - how-stash-maps-work
  - inside-the-stash-system
  - every-vanilla-stash
  - modding-stashes
  - stash-and-maps-reference
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-14.

**Who this page is for:** [modders drawing their own map](#how-the-picture-is-chosen) | [testers](#testing-tools) | players curious about the notes: [how stash maps work](/pz/build-42/engine/stash-and-annotated-maps/how-stash-maps-work)

:::callout[The 1-minute version]{kind=key}
- A map item has a map id (from its script, `Map = RosewoodMap`) and, for a stash map, a stash name. The picture is a Lua function looked up by the stash name first, then the map id.
- That function (`LootMaps.Init.<name>`) loads the map data, sets the style and the visible rectangle, and may add a badge, legend and paper texture.
- The stamps and notes are not drawn by that function. They live on the item as a symbol list, copied there from the stash when the map was made, and the map window draws that list.
- There are 91 stamp symbols in three tabs. A note is either a translation key or plain text.
- To preview and test: the debug menu has a Map Editor with a Stashes mode, and a Stash debuggers panel that spawns a stash map and sets up its building.
:::

:::facts
- **Drawing functions** 139 in `ISMapDefinitions.lua`: 14 for map ids, 125 for stashes
- **Stamp symbols** 91 (Locations 28, Loot 28, Symbols 35)
- **Editor modes** 7 tabs, 1 of them for stashes
- **Stamp scale** 0.666 for textures added from a stash
:::

## How a map gets its identity

A map item is an item script with `ItemType = base:map`, and the optional `Map = <id>` line sets its map id.

When the item is created, the engine stores that id on the item; if the script has no `Map` line, it picks a random id from the `LootMaps.Init` table instead. :cite[(`media/scripts/generated/items/map.txt:3-14`, `Item.java:1818-1826`, `MapDefinitions.java:28-48`)]

That random pick draws from every key of `LootMaps.Init`, so it can land on a stash drawing function name too. Vanilla's plain `Map` item is the one with no id, and it is never a stash item. :cite[(`media/scripts/generated/items/map.txt:175-184`, `MapDefinitions.java:36-47`)]

A stash map adds a second name, the stash name, stored in the item's `stashMap` field when `doStashItem` runs. `getMediaId` returns the stash name when there is one and the map id otherwise, and that is the key for "has this character read this map". :cite[(`MapItem.java:185-187`, `IsoGameCharacter.java:15270-15279`)]

## How the picture is chosen

The map window asks `LootMaps.callLua("Init", ui)`, and that function looks up `LootMaps.Init[stashName]` first and `LootMaps.Init[mapId]` second. :cite[(`ISMapDefinitions.lua:428-443`, `ISMap.lua:393`)]

If neither exists it prints "no such function" and returns without drawing. :cite[(`ISMapDefinitions.lua:436-439`)]

::::cards
:::card[By stash name]{accent=orange}
`LootMaps.Init.MulStashMap1` and 124 siblings. Zooms to a small rectangle around the cache. No badge, legend or paper texture.
:::
:::card[By map id]{accent=blue}
`LootMaps.Init.RosewoodMap` and 13 siblings. Shows a whole town with a badge, a legend and a paper look.
:::
:::card[Neither]{accent=cream}
The function is skipped and a line goes to the log, so the map data is not loaded (read, not run). Add a function for your name.
:::
::::

A town map function is short. This is Rosewood's, from the file. :cite[(`ISMapDefinitions.lua:593-602`)]

```lua
LootMaps.Init.RosewoodMap = function(mapUI)
	local mapAPI = mapUI.javaObject:getAPIv1()
	MapUtils.initDirectoryMapData(mapUI, LootMaps.DEFAULT_MAP_DIRECTORY)
	MapUtils.initDefaultStyleV3(mapUI)
	replaceWaterStyle(mapUI)
	mapAPI:setBoundsInSquares(7900, 11140, 8604, 12139)
	overlayPNG(mapUI, 7958, 11962, 0.666, "badge", "media/textures/worldMap/RosewoodBadge.png")
	overlayPNG(mapUI, 8213, 11161, 0.666, "legend", worldMapImage("Legend.png"))
	MapUtils.overlayPaper(mapUI)
end
```

Each call has one job: load the vanilla map data, pick the style, swap the water style, set the visible rectangle in world squares, add the two images, and lay a paper texture over everything. The default data directory is `media/maps/Muldraugh, KY`. :cite[(`ISMapDefinitions.lua:3-20`, `ISMapDefinitions.lua:392-423`, `ISMapDefinitions.lua:352-375`, `ISMapDefinitions.lua:445`)] A stash drawing function is the same without the two images and the paper. :cite[(`ISMapDefinitions.lua:626-631`)]

`replaceWaterStyle`, `overlayPNG` and `worldMapImage` are `local` functions in that file, so a mod cannot call them from another file. A mod copies the three or four lines it needs and calls the public `MapUtils` functions instead. :cite[(`ISMapDefinitions.lua:392`, `ISMapDefinitions.lua:406`, `ISMapDefinitions.lua:418`, `ISMapDefinitions.lua:3`, `ISMapDefinitions.lua:352`)]

The rectangle is in world squares, with x and y the same numbers the stash uses for its building. Pick one that includes the building and every stamp. A stamp outside the rectangle is saved on the item but should not be visible there (not verified). The function runs on every open of the map, so it is the place to change the look later; unlike stamps, a changed function affects maps that already exist. :cite[(`ISMap.lua:393`, `ISMapDefinitions.lua:626-631`)]

## How stamps and notes reach the map

A stash's stamps travel through four stops: your Lua call, a Java object, the item's own symbol list, and the screen.

Nothing redraws them from the Lua table afterwards. :cite[(`StashUtil.lua:18-31`, `Stash.java:100-113`, `StashSystem.java:168-195`, `UIWorldMap.java:135-137`)]

```
 stash:addStamp(...)             StashUtil.lua, adds a row to stash.annotations
   -> StashAnnotation.fromLua    Stash.load, only if type is "Map"
   -> doStashItem                copies each row into MapItem.getSymbols()
   -> UIWorldMap.setMapItem      the window's symbol list IS the item's list
   -> screen                     symbols draw on top of the map data
```

Because the window shares the item's list, a player's own marks go into the same list and are saved with the item. :cite[(`MapItem.java:154-162`, `ISMap.lua:40`)] That is also why editing a stash in Lua changes only maps made after the edit.

**The two kinds of row.** A row with a `symbol` adds a stamp, and a row with `text` adds a note. The text is checked against the translation files: if a translation exists for the string, the item stores the key and translates it when drawn; if not, it stores your string as plain text. :cite[(`StashSystem.java:172-185`, `WorldMapSymbols.java:40-46`)] Use keys for text a player will see, and add them to `Stash.json`. The vanilla keys look like `Stash_RosewoodStashMap2_Text1`. :cite[(`media/lua/shared/Translate/EN/Stash.json:204-206`)]

**Position and look.** A stamp is placed at world x and y with a color. The plain `addStamp` sets no anchor, so a stamp is centered on its point and a note hangs from its top-left corner. `addStampV2` also takes an anchor and a rotation, but a stash made by `newStash` does not carry that method (see the warning below). :cite[(`StashUtil.lua:12-13`, `StashUtil.lua:18-49`, `StashSystem.java:172-193`, `StashAnnotation.java:22-24`, `StashAnnotation.java:35-37`)] Vanilla's color palette is written as a comment at the top of the town files: black 0.129, 0.129, 0.129; red 0.65, 0.054, 0.054; blue 0.156, 0.188, 0.49; green 0.06, 0.39, 0.17. :cite[(`media/lua/shared/StashDescriptions/IrvingtonStashDesc.lua:2-5`)]

> **Warning:** `stash:addStampV2(...)` is a call to nothing on a stash from `StashUtil.newStash`, because `newStash` attaches only `addStamp` and `addContainer`. Write `StashUtil.addStampV2(stash, symbol, text, x, y, anchorX, anchorY, rotation, r, g, b)` instead, or set `stash.addStampV2 = StashUtil.addStampV2` once after `newStash`. :cite[(`StashUtil.lua:12-13`, `StashUtil.lua:33`)] We read this and did not run it.

**The symbols.** The valid stamp ids are the ones registered in `MapSymbolDefinitions.lua`. An unknown id is not rejected: it is drawn as an 18 by 18 blank box. :cite[(`media/lua/shared/Definitions/MapSymbolDefinitions.lua:1-92`, `WorldMapSymbols.java:79-82`)]

:::chips
- Locations: ArrowEast, ArrowNorth, ArrowSouth, ArrowWest, ArrowNorthWest, ArrowNorthEast, ArrowSouthWest, ArrowSouthEast, House, Lock, MedCross, Target, Tent, Trap, Waves, X, Z, Tree, Skyscraper, Police, Pawprint, Ladder, Furnace, Door, CrossedSwords, Columns, Book, Bed
- Loot: Apple, Axe, Boat, Burger, DollarSign, Fish, Garbage, Gears, Gun, KnifeFork, Pill, Wrench, VHS, Tire, SteeringWheel, Shirt, Lightbulb, Knife, Key, Hammer, Fuel, Flower, Egg, Bullets, Bomb, Baseball, Armor, Anvil
- Symbols: Asterisk, Checkmark, Club, Diamond, Heart, Spade, Cross, Exclamation, FaceDead, FaceHappy, FaceSad, Fire, Leaf, Lightning, Moon, Circle, Question, Radiation, Skull, Star, Sun, Triangle, Snowflake, Sheep, Rabbit, Cow, Deer, Pig, Chicken, Rodent, Raccoon, Turkey, Bird, Heartbroken, Eye
:::

A mod can add its own with one call per symbol in a shared Lua file: `MapSymbolDefinitions.getInstance():addTexture("MyId", "media/ui/MyMod/my.png", "Symbols")`, the same call vanilla makes. :cite[(`media/lua/shared/Definitions/MapSymbolDefinitions.lua:1`)]

## The map on the world map

Read stash maps also appear on the player's world map, but only on a game that fills the "already read" list, and only while the print media toggle is on.

The world map draws one map icon per stash name in that list, at the center of that stash's drawing rectangle. :cite[(`ISWorldMap.lua:594-634`, `ISWorldMap.lua:1025-1031`, `StashSystem.java:202-214`)] Hovering an icon draws the rectangle, and a click (mouse release) opens an overlay that runs the stash's drawing function and then `Stash.applyAnnotations`, which copies the stamps in without touching an item. :cite[(`ISWorldMap.lua:636-662`, `ISWorldMap.lua:765-775`, `Stash.java:132-166`)] The `AllStashMaps` world-map option, off by default, shows every stash instead. :cite[(`WorldMapRenderer.java:123`, `ISWorldMap.lua:598-606`)]

The "reveal" button on a stash map window has a map icon. It centers the world map on the area and marks the area as known (a client command to the server in multiplayer). The `copySymbolsToWorldMap` step it calls is empty in 42.22, so the item's stamps are not copied to the world map. :cite[(`ISMap.lua:96-110`, `ISMap.lua:186-190`, `ISMap.lua:545-561`, `ISMap.lua:391-405`)]

> **Warning:** On a multiplayer client the "already read" list is never filled by vanilla code (the client does not set up the building, the server does), so the world map icons are likely missing there. Read, not run. :cite[(`InventoryItem.java:3684-3691`, `IsoMetaGrid.java:1266-1272`)]

## Testing tools

The debug menu (debug mode) has two tools that matter: Map Editor and Stash debuggers, both on the DEV tab. :cite[(`ISDebugMenu.lua:35`, `ISDebugMenu.lua:42`)]

The editor also opens with key code 66 in game. :cite[(`IngameState.java:1477`)]

**Map Editor.** The editor has seven tabs: Data Files, Bounds, Style, Annotations, Maps, Stashes and Streets. :cite[(`WorldMapEditor.lua:35-85`)] A "Lua to Clipboard" button copies the script that the current tab generates. :cite[(`WorldMapEditor.lua:245-248`)]

::::cards
:::card[Stashes tab]{accent=orange}
Lists every stash of type Map in the `StashDescriptions` table. **Load** draws the stash's map and stamps and shows its building x and y. **Place** lets you click a new building point on the map. **Clear** blanks it.

The clipboard script is a `StashUtil.newStash` header, the building lines and one `addStamp` per mark.
:::
:::card[Annotations tab]{accent=blue}
Edits the map-wide annotations file `worldmap-annotations.lua` of a map folder: **Load** reads it, **Save** writes it. Its clipboard script is a list of `stashMap:addStampV2(...)` lines, one per symbol. :cite[(`WorldMapEditorMode_Annotations.lua:208-215`)] To use them in a stash file, change each line to the `StashUtil.addStampV2(stashMap, ...)` form from the warning above.
:::
:::card[Maps tab]{accent=purple}
Previews a map id's drawing function through `LootMaps.callLua`.
:::
::::

:cite[(`WorldMapEditorMode_Stashes.lua:9-44`, `WorldMapEditorMode_Stashes.lua:106-120`, `WorldMapEditorMode_Stashes.lua:195-257`, `WorldMapEditorMode_Annotations.lua:9-47`, `WorldMapEditorMode_Annotations.lua:162-232`, `WorldMapEditorMode_Maps.lua:84`)]

The Stashes tab generator writes the color numbers with a whole-number format. A color like 0.129 would come out as 0, so check the colors in what you paste (read from the code; we did not run the editor). :cite[(`WorldMapEditorMode_Stashes.lua:249`, `WorldMapEditorMode_Stashes.lua:253`)] The Annotations tab writes colors with three decimals. :cite[(`WorldMapEditorMode_Annotations.lua:208-214`)]

**Stash debuggers.** The panel lists the stashes still in `possibleStashes`. Select one and press Spawn: in single player it makes the map, applies the stash, puts it in your inventory and sets up the building. In multiplayer it sends the `debugAction.spawnStashMap` client command, which the server accepts from an admin with the add-item capability. Reinitialize reloads every stash from Lua and clears the read list. :cite[(`StashDebug.lua:59-65`, `StashDebug.lua:93-113`, `ClientCommands.lua:774-791`, `StashSystem.java:497-501`)]

Use the panel after you add a stash: if your stash is not in the list, the Lua file did not load, or the stash is not in the saved possible list of an old save (see [Inside the stash system](/pz/build-42/engine/stash-and-annotated-maps/inside-the-stash-system#what-is-saved-and-where)). A Reinitialize fixes the second case.

:::callout[How we know]{kind=proof}
All of the above is read from the 42.22 Lua and Java. Not verified: what the editor's "Lua to Clipboard" really prints for colors, whether the map icons show in multiplayer, and the real-time length of the 30-tick read action. We did not open the editor in a running game.
:::
