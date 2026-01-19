# Events System Complete Reference

**Location:** Events defined in Java, triggered throughout `media/lua/`
**Purpose:** Complete catalog of all game events with parameters, triggers, and usage

---

## Overview

Project Zomboid uses an event-driven architecture where game systems broadcast events that mods can hook into. The Events table contains **~150 unique events** that fire during gameplay, UI interactions, and game state changes.

### Event System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Java Engine                              │
│  (Defines most events, triggers from game code)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ triggerEvent()
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   LuaEventManager                            │
│  - Manages event registration                                │
│  - Routes events to registered handlers                      │
│  - LuaEventManager.AddEvent("EventName") for Lua events      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Events.EventName                          │
│  - Events.EventName.Add(function)                            │
│  - Events.EventName.Remove(function)                         │
└─────────────────────────────────────────────────────────────┘
```

### Basic Usage Pattern

```lua
-- Register a handler
local function myHandler(param1, param2)
    print("Event fired with:", param1, param2)
end
Events.OnGameStart.Add(myHandler)

-- Remove a handler (important for cleanup)
Events.OnGameStart.Remove(myHandler)
```

---

## Event Categories

### Quick Reference by Category

| Category | Events | Description |
|----------|--------|-------------|
| **Lifecycle** | 15 | Game boot, start, save, load |
| **Player** | 12 | Movement, death, updates, XP |
| **Input** | 10 | Keyboard, mouse, joypad |
| **UI** | 8 | Context menus, UI creation |
| **World** | 12 | Objects, time, weather |
| **Vehicles** | 8 | Enter, exit, damage |
| **Zombies** | 4 | Death, updates, hits |
| **Multiplayer** | 20 | Connection, chat, factions |
| **Steam** | 12 | Workshop, server lists |
| **Time** | 6 | Ticks, minutes, hours |
| **Foraging** | 5 | Search mode, icons |
| **Other** | 40+ | Specialized systems |

---

## Complete Event Catalog

### Lifecycle Events

#### OnGameBoot
**When:** Game executable starts, before main menu
**Parameters:** None
**Use Case:** Early mod initialization, global setup
```lua
Events.OnGameBoot.Add(function()
    print("Game is booting up")
    -- Initialize global mod data
end)
```
**Files that trigger:** Java engine
**Files that listen:** 14+ files

---

#### OnMainMenuEnter
**When:** Main menu screen is displayed
**Parameters:** None
**Use Case:** Menu modifications, pre-game setup
```lua
Events.OnMainMenuEnter.Add(function()
    print("Entered main menu")
end)
```
**Files that listen:** 8+ files

---

#### OnGameStart
**When:** New game starts or save is loaded, player is ready
**Parameters:** None
**Use Case:** Most common initialization point for mods
```lua
Events.OnGameStart.Add(function()
    local player = getPlayer()
    print("Game started for", player:getUsername())
end)
```
**Files that listen:** 39+ files (MOST USED EVENT)

---

#### OnNewGame
**When:** New game is created (not on load)
**Parameters:** `player` (IsoPlayer), `square` (IsoGridSquare)
**Use Case:** First-time setup, starter items
```lua
Events.OnNewGame.Add(function(player, square)
    -- Give starter items
    player:getInventory():AddItem("Base.Hammer")
end)
```

---

#### OnCreatePlayer
**When:** Player character is created
**Parameters:** `playerIndex` (int), `player` (IsoPlayer)
**Use Case:** Player-specific initialization
```lua
Events.OnCreatePlayer.Add(function(playerIndex, player)
    print("Player", playerIndex, "created:", player:getUsername())
end)
```

---

#### OnPreMapLoad
**When:** Before map data loads
**Parameters:** None
**Use Case:** Map preparation

---

#### OnInitWorld
**When:** World is initializing
**Parameters:** None
**Use Case:** World data setup

---

#### OnSave
**When:** Game is being saved
**Parameters:** None
**Use Case:** Persist mod data
```lua
Events.OnSave.Add(function()
    ModData.getOrCreate("MyMod").lastSave = getGameTime():getWorldAgeHours()
end)
```

---

#### OnPostSave
**When:** After game save completes
**Parameters:** None
**Use Case:** Post-save cleanup

---

#### OnGameTimeLoaded
**When:** Game time data is loaded
**Parameters:** None
```lua
Events.OnGameTimeLoaded.Add(function()
    local time = getGameTime()
    print("World age:", time:getWorldAgeHours(), "hours")
end)
```

---

#### OnResetLua
**When:** Lua state is reset (debug/reload)
**Parameters:** `reason` (string)
**Use Case:** Cleanup, re-registration

---

### Player Events

#### OnPlayerUpdate
**When:** Every frame, per player
**Parameters:** `player` (IsoPlayer)
**Use Case:** Continuous player monitoring (use sparingly - performance)
```lua
Events.OnPlayerUpdate.Add(function(player)
    if player:isAsleep() then
        -- Player is sleeping
    end
end)
```
**Files that listen:** 11+ files

---

#### OnPlayerMove
**When:** Player moves
**Parameters:** `player` (IsoPlayer)
**Use Case:** Movement-triggered effects

---

#### OnPlayerDeath
**When:** Player dies
**Parameters:** `player` (IsoPlayer)
**Use Case:** Death handling, statistics
```lua
Events.OnPlayerDeath.Add(function(player)
    print(player:getUsername(), "died at day", getGameTime():getDay())
end)
```
**Files that listen:** 11+ files

---

#### OnCreateSurvivor
**When:** NPC survivor is created
**Parameters:** `survivor` (IsoSurvivor)

---

#### OnCharacterCreateStats
**When:** Character stats are being calculated during creation
**Parameters:** `player` (IsoPlayer)

---

### XP & Skills Events

#### AddXP
**When:** Player gains XP
**Parameters:** `player` (IsoPlayer), `perk` (PerkFactory.Perks), `amount` (float)
```lua
Events.AddXP.Add(function(player, perk, amount)
    print(player:getUsername(), "gained", amount, "XP in", tostring(perk))
end)
```

---

#### LevelPerk
**When:** Player levels up a skill
**Parameters:** `player` (IsoPlayer), `perk` (PerkFactory.Perks), `level` (int)
```lua
Events.LevelPerk.Add(function(player, perk, level)
    print("Leveled up:", tostring(perk), "to level", level)
end)
```

---

### Input Events

#### OnKeyPressed
**When:** Key is pressed
**Parameters:** `key` (int - Keyboard constant)
**Use Case:** Hotkeys, custom controls
```lua
Events.OnKeyPressed.Add(function(key)
    if key == Keyboard.KEY_F5 then
        print("F5 pressed!")
    end
end)
```
**Files that listen:** 31+ files

---

#### OnKeyKeepPressed
**When:** Key is held down (fires repeatedly)
**Parameters:** `key` (int)
```lua
Events.OnKeyKeepPressed.Add(function(key)
    if key == Keyboard.KEY_LSHIFT then
        -- Shift is being held
    end
end)
```
**Files that listen:** 18+ files

---

#### OnKeyStartPressed
**When:** Key press begins (first frame only)
**Parameters:** `key` (int)
**Files that listen:** 10+ files

---

#### OnCustomUIKey
**When:** Custom keybind is pressed
**Parameters:** `key` (int)
**Files that listen:** 12+ files

---

#### OnMouseDown
**When:** Mouse button pressed
**Parameters:** `x` (int), `y` (int)

---

#### OnRightMouseDown
**When:** Right mouse button pressed
**Parameters:** `x` (int), `y` (int)

---

#### OnObjectLeftMouseButtonDown
**When:** Left click on world object
**Parameters:** `object` (IsoObject), `x` (int), `y` (int)

---

#### OnObjectLeftMouseButtonUp
**When:** Left click released on world object
**Parameters:** `object` (IsoObject), `x` (int), `y` (int)
**Files that listen:** 12+ files

---

#### OnObjectRightMouseButtonDown
**When:** Right click on world object
**Parameters:** `object` (IsoObject), `x` (int), `y` (int)

---

#### OnObjectRightMouseButtonUp
**When:** Right click released on world object
**Parameters:** `object` (IsoObject), `x` (int), `y` (int)

---

### Joypad/Controller Events

#### OnJoypadActivate
**When:** Joypad becomes active
**Parameters:** `joypadData` (table)

---

#### OnJoypadActivateUI
**When:** Joypad activates UI control
**Parameters:** `joypadData` (table)

---

#### OnJoypadDeactivate
**When:** Joypad deactivates
**Parameters:** `joypadData` (table)

---

#### OnJoypadReactivate
**When:** Joypad reactivates after deactivation
**Parameters:** `joypadData` (table)

---

#### OnJoypadBeforeDeactivate
**When:** Before joypad deactivates
**Parameters:** `joypadData` (table)

---

#### OnJoypadBeforeReactivate
**When:** Before joypad reactivates
**Parameters:** `joypadData` (table)

---

#### OnJoypadRenderUI
**When:** Joypad UI should render
**Parameters:** `joypadData` (table)

---

#### OnGamepadConnect
**When:** Gamepad is connected
**Parameters:** `controllerId` (int)

---

#### OnGamepadDisconnect
**When:** Gamepad is disconnected
**Parameters:** `controllerId` (int)

---

### UI Events

#### OnCreateUI
**When:** Main UI is being created
**Parameters:** None
**Use Case:** Add custom UI elements
```lua
Events.OnCreateUI.Add(function()
    -- Create custom UI window
    local myWindow = ISPanel:new(100, 100, 200, 150)
    myWindow:initialise()
    myWindow:addToUIManager()
end)
```

---

#### OnFillWorldObjectContextMenu
**When:** Right-click context menu on world objects
**Parameters:** `playerIndex` (int), `context` (ISContextMenu), `worldObjects` (table), `test` (bool)
**Use Case:** Add custom actions to world objects
```lua
Events.OnFillWorldObjectContextMenu.Add(function(player, context, worldobjects, test)
    for _, obj in ipairs(worldobjects) do
        if instanceof(obj, "IsoThumpable") then
            context:addOption("My Custom Action", obj, myActionFunction)
        end
    end
end)
```
**Files that listen:** 15+ files
**Triggered in:** `ISWorldObjectContextMenu.lua:1543`

---

#### OnPreFillWorldObjectContextMenu
**When:** Before world context menu is filled
**Parameters:** `playerIndex` (int), `context` (ISContextMenu), `worldObjects` (table), `test` (bool)
**Use Case:** Early menu modifications
**Triggered in:** `ISWorldObjectContextMenu.lua:489`

---

#### OnFillInventoryObjectContextMenu
**When:** Right-click context menu on inventory items
**Parameters:** `playerIndex` (int), `context` (ISContextMenu), `items` (table)
**Use Case:** Add custom actions to items
```lua
Events.OnFillInventoryObjectContextMenu.Add(function(player, context, items)
    for _, item in ipairs(items) do
        if item:getFullType() == "Base.Hammer" then
            context:addOption("Special Hammer Action", item, myFunction)
        end
    end
end)
```
**Triggered in:** `ISInventoryPaneContextMenu.lua:787`

---

#### OnPreFillInventoryObjectContextMenu
**When:** Before inventory context menu is filled
**Parameters:** `playerIndex` (int), `context` (ISContextMenu), `items` (table)
**Triggered in:** `ISInventoryPaneContextMenu.lua:256`

---

#### OnRefreshInventoryWindowContainers
**When:** Inventory container list refreshes
**Parameters:** `inventoryPage` (ISInventoryPage), `state` (string: "begin", "beforeFloor", "buttonsAdded", "end")

---

#### OnSetDefaultTab
**When:** Default tab is set
**Parameters:** None

---

#### OnResolutionChange
**When:** Screen resolution changes
**Parameters:** `oldWidth` (int), `oldHeight` (int), `newWidth` (int), `newHeight` (int)

---

### World Object Events

#### OnObjectAdded
**When:** Object is added to world
**Parameters:** `object` (IsoObject)
**Use Case:** Track placed objects
```lua
Events.OnObjectAdded.Add(function(object)
    if instanceof(object, "IsoThumpable") then
        print("Player-built object placed")
    end
end)
```
**Triggered in:** Multiple building/placement files

---

#### OnObjectAboutToBeRemoved
**When:** Object is about to be removed
**Parameters:** `object` (IsoObject)
**Use Case:** Cleanup before removal
**Triggered in:** `ISMoveableSpriteProps.lua:1047, 1080, 1116`

---

#### OnDestroyIsoThumpable
**When:** Player-built object is destroyed
**Parameters:** `thumpable` (IsoThumpable), `player` (IsoPlayer)

---

#### OnContainerUpdate
**When:** Container contents change
**Parameters:** None
**Use Case:** Refresh inventory displays
**Triggered in:** Multiple inventory/container files

---

#### OnDoTileBuilding
**When:** Tile building occurs
**Parameters:** None

---

#### LoadGridsquare
**When:** Grid square is loaded
**Parameters:** `square` (IsoGridSquare)

---

### Time Events

#### OnTick
**When:** Every game tick (most frequent)
**Parameters:** `tick` (double)
**Use Case:** High-frequency updates (use sparingly)
**Files that listen:** 31+ files

---

#### OnTickEvenPaused
**When:** Every tick, even when paused
**Parameters:** `tick` (double)

---

#### OnRenderTick
**When:** Every render frame
**Parameters:** None
**Use Case:** Visual effects, UI updates

---

#### EveryOneMinute
**When:** Every in-game minute
**Parameters:** None
```lua
Events.EveryOneMinute.Add(function()
    print("One minute passed")
end)
```

---

#### EveryTenMinutes
**When:** Every 10 in-game minutes
**Parameters:** None

---

#### EveryHours
**When:** Every in-game hour
**Parameters:** None

---

#### EveryDays
**When:** Every in-game day
**Parameters:** None

---

#### OnDawn
**When:** Dawn begins
**Parameters:** None
**Triggered in:** `season.lua:322`

---

#### OnDusk
**When:** Dusk begins
**Parameters:** None
**Triggered in:** `season.lua:318`

---

### Weather Events

#### OnThunderEvent
**When:** Thunder occurs
**Parameters:** `x` (int), `y` (int), `strike` (bool)

---

#### OnWeatherPeriodStart
**When:** Weather period starts
**Parameters:** `weatherPeriod` (WeatherPeriod)

---

#### OnWeatherPeriodStage
**When:** Weather period changes stage
**Parameters:** `weatherPeriod` (WeatherPeriod)

---

#### OnWeatherPeriodComplete
**When:** Weather period ends
**Parameters:** `weatherPeriod` (WeatherPeriod)

---

#### OnChangeWeather
**When:** Weather changes (Lua-defined)
**Parameters:** `weather` (string)
**Triggered in:** `season.lua:291`

---

#### OnClimateManagerInit
**When:** Climate manager initializes
**Parameters:** `climateManager` (ClimateManager)

---

#### OnClimateTick
**When:** Climate update tick
**Parameters:** `climateManager` (ClimateManager)

---

#### OnClimateTickDebug
**When:** Climate debug tick
**Parameters:** `climateManager` (ClimateManager)
**Files that listen:** 11+ files

---

### Vehicle Events

#### OnEnterVehicle
**When:** Player enters vehicle
**Parameters:** `player` (IsoPlayer)
**Triggered in:** `ISEnterVehicle.lua:48`

---

#### OnExitVehicle
**When:** Player exits vehicle
**Parameters:** `player` (IsoPlayer)
**Triggered in:** `ISExitVehicle.lua:65`

---

#### OnSwitchVehicleSeat
**When:** Player changes seat
**Parameters:** `player` (IsoPlayer)
**Triggered in:** `ISSwitchVehicleSeat.lua:60`

---

#### OnUseVehicle
**When:** Vehicle is used
**Parameters:** `player` (IsoPlayer), `vehicle` (BaseVehicle)

---

#### OnVehicleHorn
**When:** Vehicle horn is used
**Parameters:** `player` (IsoPlayer), `vehicle` (BaseVehicle), `pressed` (bool)

---

#### OnVehicleDamageTexture
**When:** Vehicle damage texture updates
**Parameters:** `vehicle` (BaseVehicle)

---

#### OnMechanicActionDone
**When:** Mechanic action completes
**Parameters:** `player` (IsoPlayer), `success` (bool), `vehicleId` (int), `partId` (string)

---

### Zombie Events

#### OnZombieDead
**When:** Zombie dies
**Parameters:** `zombie` (IsoZombie)
```lua
Events.OnZombieDead.Add(function(zombie)
    local player = getPlayer()
    local dist = zombie:DistTo(player)
    if dist < 10 then
        -- Player was nearby when zombie died
    end
end)
```

---

#### OnZombieUpdate
**When:** Zombie updates (per tick)
**Parameters:** `zombie` (IsoZombie)

---

#### OnHitZombie
**When:** Zombie is hit
**Parameters:** `zombie` (IsoZombie), `character` (IsoGameCharacter), `bodyPartType` (BodyPartType), `handWeapon` (HandWeapon)
```lua
Events.OnHitZombie.Add(function(zombie, attacker, bodyPart, weapon)
    print("Hit zombie with", weapon:getDisplayName())
end)
```

---

### Combat Events

#### OnWeaponSwingHitPoint
**When:** Weapon swing hits
**Parameters:** `character` (IsoGameCharacter), `handWeapon` (HandWeapon)

---

#### OnWeaponHitTree
**When:** Weapon hits tree
**Parameters:** `character` (IsoPlayer), `handWeapon` (HandWeapon)

---

#### OnWeaponHitXp
**When:** XP gained from weapon hit
**Parameters:** `player` (IsoPlayer), `handWeapon` (HandWeapon), `character` (IsoGameCharacter), `damage` (float)

---

#### OnPlayerAttackFinished
**When:** Attack animation finishes
**Parameters:** `player` (IsoPlayer), `handWeapon` (HandWeapon)

---

### Clothing Events

#### OnClothingUpdated
**When:** Player clothing changes
**Parameters:** `player` (IsoPlayer)
**Triggered in:** Many TimedActions (wear, wash, dye, etc.)

---

#### OnEquipPrimary
**When:** Primary weapon equipped
**Parameters:** `player` (IsoPlayer), `item` (InventoryItem)

---

#### OnEquipSecondary
**When:** Secondary item equipped
**Parameters:** `player` (IsoPlayer), `item` (InventoryItem)

---

### Foraging Events

#### onToggleSearchMode
**When:** Search mode toggled
**Parameters:** `character` (IsoPlayer), `isSearchMode` (bool)
**Triggered in:** `ISSearchManager.lua:1455`

---

#### onEnableSearchMode
**When:** Search mode enabled
**Parameters:** `character` (IsoPlayer), `isSearchMode` (bool)
**Triggered in:** `ISSearchManager.lua:1447`

---

#### onDisableSearchMode
**When:** Search mode disabled
**Parameters:** `character` (IsoPlayer), `isSearchMode` (bool)
**Triggered in:** `ISSearchManager.lua:1452`

---

#### onUpdateIcon
**When:** Foraging icon updates
**Parameters:** `zoneData` (table), `iconID` (string), `icon` (ISForageIcon or nil)
**Triggered in:** `forageSystem.lua`, `ISSearchManager.lua`, `ISForageIcon.lua`

---

#### onFillSearchIconContextMenu
**When:** Context menu for search icon
**Parameters:** `context` (ISContextMenu), `icon` (ISBaseIcon)
**Triggered in:** `ISBaseIcon.lua:183`

---

### Multiplayer Events

#### OnConnected
**When:** Client connects to server
**Parameters:** None

---

#### OnDisconnect
**When:** Client disconnects
**Parameters:** None

---

#### OnConnectFailed
**When:** Connection fails
**Parameters:** `error` (string), `detail` (string)

---

#### OnConnectionStateChanged
**When:** Connection state changes
**Parameters:** `state` (string), `reason` (string)

---

#### OnLoginState
**When:** Login state changes
**Parameters:** `state` (string)

---

#### OnLoginStateSuccess
**When:** Login successful
**Parameters:** None

---

#### OnServerStarted
**When:** Server starts
**Parameters:** None

---

#### OnServerCommand
**When:** Server sends command to client
**Parameters:** `module` (string), `command` (string), `args` (table)
```lua
Events.OnServerCommand.Add(function(module, command, args)
    if module == "MyMod" then
        if command == "syncData" then
            processServerData(args)
        end
    end
end)
```

---

#### OnClientCommand
**When:** Client sends command to server
**Parameters:** `module` (string), `command` (string), `player` (IsoPlayer), `args` (table)
```lua
Events.OnClientCommand.Add(function(module, command, player, args)
    if module == "MyMod" then
        if command == "requestData" then
            sendServerCommand(player, "MyMod", "syncData", myData)
        end
    end
end)
```

---

#### OnServerFinishSaving
**When:** Server finishes saving
**Parameters:** None

---

#### OnServerStartSaving
**When:** Server starts saving
**Parameters:** None

---

### Faction/Safehouse Events

#### SyncFaction
**When:** Faction data syncs
**Parameters:** `faction` (Faction)

---

#### ReceiveFactionInvite
**When:** Faction invite received
**Parameters:** `factionName` (string), `playerName` (string)

---

#### AcceptedFactionInvite
**When:** Faction invite accepted
**Parameters:** `factionName` (string), `playerName` (string)

---

#### OnSafehousesChanged
**When:** Safehouse data changes
**Parameters:** None

---

#### ReceiveSafehouseInvite
**When:** Safehouse invite received
**Parameters:** `safehouseTitle` (string), `ownerName` (string)

---

#### AcceptedSafehouseInvite
**When:** Safehouse invite accepted
**Parameters:** `safehouseTitle` (string), `playerName` (string)

---

### Chat/Trading Events

#### OnAddMessage
**When:** Chat message added
**Parameters:** `message` (ChatMessage), `tabId` (int)

---

#### OnChatWindowInit
**When:** Chat window initializes
**Parameters:** None

---

#### SwitchChatStream
**When:** Chat stream switches
**Parameters:** None

---

#### RequestTrade
**When:** Trade requested
**Parameters:** `requester` (string), `target` (string)

---

#### AcceptedTrade
**When:** Trade accepted
**Parameters:** `player1` (string), `player2` (string)

---

#### TradingUIAddItem
**When:** Item added to trade
**Parameters:** `player` (string), `item` (InventoryItem)

---

#### TradingUIRemoveItem
**When:** Item removed from trade
**Parameters:** `player` (string), `item` (InventoryItem)

---

#### TradingUIUpdateState
**When:** Trade UI state changes
**Parameters:** `player` (string), `state` (int)

---

### Recipe Events

#### OnMakeItem
**When:** Item is crafted
**Parameters:** `item` (InventoryItem), `player` (IsoPlayer), `items` (table)

---

#### OnDynamicMovableRecipe
**When:** Dynamic movable recipe registered
**Parameters:** `movableRecipe` (string), `item` (InventoryItem)

---

### Distribution Events

#### OnPreDistributionMerge
**When:** Before distribution tables merge
**Parameters:** None
**Use Case:** Modify distributions before mods merge

---

#### OnDistributionMerge
**When:** During distribution merge
**Parameters:** None

---

#### OnPostDistributionMerge
**When:** After distribution merge
**Parameters:** None
**Use Case:** Final distribution modifications

---

### Steam/Workshop Events

#### OnSteamWorkshopItemCreated
**When:** Workshop item created
**Parameters:** `itemId` (string), `success` (bool)

---

#### OnSteamWorkshopItemNotCreated
**When:** Workshop creation failed
**Parameters:** `errorCode` (int)

---

#### OnSteamWorkshopItemUpdated
**When:** Workshop item updated
**Parameters:** `success` (bool)

---

#### OnSteamWorkshopItemNotUpdated
**When:** Workshop update failed
**Parameters:** `errorCode` (int)

---

#### OnSteamServerResponded
**When:** Steam server responds
**Parameters:** `server` (ServerData)

---

#### OnSteamServerFailedToRespond
**When:** Steam server failed to respond
**Parameters:** None

---

#### OnSteamRulesRefreshComplete
**When:** Server rules refresh completes
**Parameters:** None

---

#### OnSteamRefreshInternetServers
**When:** Internet server list refreshes
**Parameters:** None

---

#### OnSteamGameJoin
**When:** Joining game via Steam
**Parameters:** None

---

#### OnSteamFriendStatusChanged
**When:** Friend status changes
**Parameters:** `steamId` (string)

---

#### OnServerWorkshopItems
**When:** Workshop items received from server
**Parameters:** `workshopItems` (table)

---

### Miscellaneous Events

#### OnChallengeQuery
**When:** Challenge mode queries
**Parameters:** None
**Files that listen:** 13+ files

---

#### OnLoadSoundBanks
**When:** Sound banks load
**Parameters:** None

---

#### OnLoadRadioScripts
**When:** Radio scripts load
**Parameters:** None

---

#### OnInitRecordedMedia
**When:** Recorded media initializes
**Parameters:** None

---

#### OnDeviceText
**When:** Radio/TV text displays
**Parameters:** `guid` (string), `codes` (string), `x` (float), `y` (float), `z` (float), `text` (string), `device` (WaveSignalDevice)

---

#### OnLoadedMapZones
**When:** Map zones finish loading
**Parameters:** None

---

#### OnLoadMapZones
**When:** Map zones are loading
**Parameters:** None

---

#### OnInitSeasons
**When:** Seasons initialize
**Parameters:** None

---

#### OnWaterAmountChange
**When:** Water amount changes
**Parameters:** `object` (IsoObject), `amount` (int)

---

#### DoSpecialTooltip
**When:** Special tooltip displayed
**Parameters:** `tooltip` (ISToolTip), `item` (InventoryItem)

---

#### OnModsModified
**When:** Mods are modified
**Parameters:** None

---

#### ViewTickets
**When:** Viewing support tickets
**Parameters:** None

---

#### OnAdminMessage
**When:** Admin message received
**Parameters:** `text` (string), `x` (int), `y` (int), `z` (int)

---

#### OnGetDBSchema
**When:** Database schema requested
**Parameters:** `schema` (table)

---

#### OnGetTableResult
**When:** Database table result received
**Parameters:** `result` (table), `rowId` (int), `tableName` (string)

---

#### OnReceiveGlobalModData
**When:** Global mod data received
**Parameters:** `key` (string), `data` (table)

---

#### OnInitGlobalModData
**When:** Global mod data initializes
**Parameters:** None

---

#### OnReceiveUserlog
**When:** User log received
**Parameters:** `username` (string), `logs` (table)

---

#### OnCGlobalObjectSystemInit
**When:** Client global object system initializes
**Parameters:** None

---

#### OnSGlobalObjectSystemInit
**When:** Server global object system initializes
**Parameters:** None

---

#### OnAcceptInvite
**When:** Invitation accepted (generic)
**Parameters:** `connectionType` (string)

---

#### MngInvReceiveItems
**When:** Manage inventory receives items
**Parameters:** None

---

#### OnTemplateTextInit
**When:** Template text initializes
**Parameters:** None

---

#### OnSpawnRegionsLoaded
**When:** Spawn regions finish loading
**Parameters:** `regions` (table)
**Triggered in:** `SpawnRegions.lua:94`

---

#### OnCoopJoinFailed
**When:** Co-op join fails
**Parameters:** `reason` (string)

---

#### OnCoopServerMessage
**When:** Co-op server message received
**Parameters:** `tag` (string), `cookie` (string), `payload` (string)

---

#### OnServerStatisticReceived
**When:** Server statistics received
**Parameters:** None

---

#### ServerPinged
**When:** Server responds to ping
**Parameters:** `ip` (string), `port` (int)

---

#### OnMiniScoreboardUpdate
**When:** Mini scoreboard updates
**Parameters:** None

---

#### OnScoreboardUpdate
**When:** Scoreboard updates
**Parameters:** None

---

#### OnTabAdded
**When:** Chat tab added
**Parameters:** `title` (string), `tabId` (int)

---

#### OnTabRemoved
**When:** Chat tab removed
**Parameters:** `title` (string), `tabId` (int)

---

#### OnGameStateEnter
**When:** Entering game state
**Parameters:** `state` (string)

---

#### OnPreUIDraw
**When:** Before UI draws
**Parameters:** None

---

#### OnPostUIDraw
**When:** After UI draws
**Parameters:** None

---

#### OnPressWalkTo
**When:** Walk-to button pressed
**Parameters:** None

---

#### OnPressRackButton
**When:** Rack weapon button pressed
**Parameters:** None

---

#### OnPressReloadButton
**When:** Reload button pressed
**Parameters:** None

---

## Creating Custom Events

### Using LuaEventManager

```lua
-- Define a new event (do once, early in load)
LuaEventManager.AddEvent("OnMyModEvent")

-- Trigger the event
triggerEvent("OnMyModEvent", param1, param2)

-- Listen to the event
Events.OnMyModEvent.Add(function(param1, param2)
    print("Custom event fired:", param1, param2)
end)
```

### Best Practices

1. **Prefix custom events** with your mod name: `OnMyMod_Something`
2. **Register early** in OnGameBoot or OnGameStart
3. **Document parameters** for other mod authors
4. **Remove handlers** when no longer needed to prevent memory leaks

---

## Event Timing Diagram

```
Game Boot Sequence:
┌─ OnGameBoot
├─ OnLoadSoundBanks
├─ OnLoadRadioScripts
├─ OnMainMenuEnter
│
├─ [User starts game]
├─ OnPreMapLoad
├─ OnLoadMapZones
├─ OnLoadedMapZones
├─ OnInitWorld
├─ OnPreDistributionMerge
├─ OnDistributionMerge
├─ OnPostDistributionMerge
├─ OnGameTimeLoaded
├─ OnCreatePlayer (per player)
├─ OnGameStart
│
├─ [Gameplay Loop]
├── OnTick (every frame)
├── OnPlayerUpdate (per player, per frame)
├── EveryOneMinute
├── EveryTenMinutes
├── EveryHours
├── OnDawn / OnDusk
├── EveryDays
│
├─ OnSave
├─ OnPostSave
│
└─ [Shutdown]
```

---

## Documentation Status

| Category | Events | Documented | Parameters |
|----------|--------|------------|------------|
| Lifecycle | 15 | Yes | Yes |
| Player | 12 | Yes | Yes |
| Input | 10 | Yes | Yes |
| UI | 8 | Yes | Yes |
| World | 12 | Yes | Yes |
| Vehicles | 8 | Yes | Yes |
| Zombies | 4 | Yes | Yes |
| Combat | 4 | Yes | Yes |
| Clothing | 3 | Yes | Yes |
| Foraging | 5 | Yes | Yes |
| Multiplayer | 20 | Yes | Yes |
| Steam | 12 | Yes | Yes |
| Time | 9 | Yes | Yes |
| Weather | 7 | Yes | Yes |
| Distribution | 3 | Yes | Yes |
| Other | 40+ | Yes | Partial |

**Total: ~150 events documented**

---

## Related Systems

- **ISBaseTimedAction** - Many events fire from timed actions
- **Context Menus** - OnFillWorldObjectContextMenu, OnFillInventoryObjectContextMenu
- **Recipe System** - OnMakeItem, recipe callbacks
- **Mod Data** - OnReceiveGlobalModData, OnInitGlobalModData
