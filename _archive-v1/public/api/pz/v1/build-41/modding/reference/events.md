---
id: events
slug: events
title: Events Reference
excerpt: Events are PZ's callback system. They fire when specific things happen in the game, allowing your mod to respond. Every mod uses events. Events.EventName.Add(yourCallbackFunction) function...
game: pz
version: build-41
section: modding
category: reference
subcategory: null
difficulty: intermediate
tags:
  - intermediate
  - lua
  - events
  - api
  - reference
  - callbacks
last_updated: 2026-01-09
---
# Events Reference

## Overview

Events are PZ's callback system. They fire when specific things happen in the game, allowing your mod to respond. Every mod uses events.

## How Events Work

```lua
-- Subscribe to an event
Events.EventName.Add(yourCallbackFunction)

-- Your callback receives event-specific parameters
function yourCallbackFunction(param1, param2, ...)
    -- Your code here
end
```

## Event Categories

- **Game Lifecycle** - Game start, load, save, quit
- **Player Events** - Death, movement, actions, XP
- **World Events** - Objects, containers, zombies
- **UI Events** - Context menus, keyboard, mouse
- **Time Events** - Ticks, minutes, hours, days
- **Vehicle Events** - Enter, exit, damage
- **Multiplayer Events** - Connection, commands, chat
- **Weather Events** - Climate, thunder, seasons

---

## Game Lifecycle Events

### OnGameBoot
Fired when the game first boots up (before main menu).
```lua
Events.OnGameBoot.Add(function()
    print("Game is booting up")
end)
```
**Parameters:** None

### OnMainMenuEnter
Fired when entering the main menu.
```lua
Events.OnMainMenuEnter.Add(function()
    print("At main menu")
end)
```
**Parameters:** None

### OnGameStart
Fired when a game session starts (after loading completes).
```lua
Events.OnGameStart.Add(function()
    local player = getPlayer()
    print("Game started for: " .. player:getUsername())
end)
```
**Parameters:** None

### OnNewGame
Fired when starting a new game (not loading a save).
```lua
Events.OnNewGame.Add(function()
    print("Fresh game started")
end)
```
**Parameters:** None

### OnPreMapLoad
Fired before the map loads.
```lua
Events.OnPreMapLoad.Add(function()
    print("About to load map")
end)
```
**Parameters:** None

### OnGameTimeLoaded
Fired when game time data has loaded.
```lua
Events.OnGameTimeLoaded.Add(function()
    local gameTime = getGameTime()
    print("Day: " .. gameTime:getNightsSurvived())
end)
```
**Parameters:** None

### OnSave
Fired when the game saves.
```lua
Events.OnSave.Add(function()
    -- Save your mod data here
end)
```
**Parameters:** None

### OnPostSave
Fired after saving completes.
```lua
Events.OnPostSave.Add(function()
    print("Save complete")
end)
```
**Parameters:** None

### OnResetLua
Fired when Lua scripts are reset/reloaded.
```lua
Events.OnResetLua.Add(function()
    -- Reinitialize your mod state
end)
```
**Parameters:** None

---

## Player Events

### OnCreatePlayer
Fired when a player character is created.
```lua
Events.OnCreatePlayer.Add(function(playerIndex, player)
    print("Created player " .. playerIndex)
end)
```
**Parameters:**
- `playerIndex` (int) - Player number (0-3 for splitscreen)
- `player` (IsoPlayer) - The player object

### OnPlayerUpdate
Fired every frame for each player.
```lua
Events.OnPlayerUpdate.Add(function(player)
    -- Called frequently, keep it light
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player being updated

### OnPlayerMove
Fired when a player moves.
```lua
Events.OnPlayerMove.Add(function(player)
    local x, y, z = player:getX(), player:getY(), player:getZ()
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player who moved

### OnPlayerDeath
Fired when a player dies.
```lua
Events.OnPlayerDeath.Add(function(player)
    print(player:getUsername() .. " has died")
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player who died

### AddXP
Fired when XP is gained.
```lua
Events.AddXP.Add(function(player, perk, amount)
    print("Gained " .. amount .. " XP in " .. tostring(perk))
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player
- `perk` (Perk) - The skill/perk
- `amount` (float) - XP amount

### LevelPerk
Fired when a perk levels up.
```lua
Events.LevelPerk.Add(function(player, perk, level, levelUp)
    if levelUp then
        print("Leveled up " .. tostring(perk) .. " to " .. level)
    end
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player
- `perk` (Perk) - The skill/perk
- `level` (int) - New level
- `levelUp` (boolean) - True if leveled up, false if leveled down

### OnEquipPrimary
Fired when equipping primary hand item.
```lua
Events.OnEquipPrimary.Add(function(player, item)
    if item then
        print("Equipped: " .. item:getName())
    end
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player
- `item` (InventoryItem) - The equipped item (or nil)

### OnEquipSecondary
Fired when equipping secondary hand item.
```lua
Events.OnEquipSecondary.Add(function(player, item)
    if item then
        print("Off-hand: " .. item:getName())
    end
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player
- `item` (InventoryItem) - The equipped item (or nil)

### OnPlayerAttackFinished
Fired when a player completes an attack.
```lua
Events.OnPlayerAttackFinished.Add(function(player, weapon)
    print("Attack finished")
end)
```
**Parameters:**
- `player` (IsoPlayer) - The attacker
- `weapon` (HandWeapon) - The weapon used

---

## Context Menu Events

### OnFillInventoryObjectContextMenu
Fired when right-clicking items in inventory. **Most commonly used event for adding item actions.**
```lua
Events.OnFillInventoryObjectContextMenu.Add(function(playerIndex, context, items)
    -- Add custom menu options
    context:addOption("My Option", items, myFunction)
end)
```
**Parameters:**
- `playerIndex` (int) - Player number
- `context` (ISContextMenu) - The menu to add options to
- `items` (table) - Selected items

### OnFillWorldObjectContextMenu
Fired when right-clicking objects in the world.
```lua
Events.OnFillWorldObjectContextMenu.Add(function(playerIndex, context, worldObjects, test)
    -- Add custom world object options
    context:addOption("Examine", worldObjects, examineObject)
end)
```
**Parameters:**
- `playerIndex` (int) - Player number
- `context` (ISContextMenu) - The menu to add options to
- `worldObjects` (table) - Objects under cursor
- `test` (boolean) - True if just testing for valid options

---

## Time Events

### OnTick
Fired every game tick (most frequent).
```lua
Events.OnTick.Add(function()
    -- Runs every tick - use sparingly!
end)
```
**Parameters:** None

### OnTickEvenPaused
Fired every tick, even when paused.
```lua
Events.OnTickEvenPaused.Add(function()
    -- UI updates can go here
end)
```
**Parameters:** None

### OnRenderTick
Fired every render frame.
```lua
Events.OnRenderTick.Add(function()
    -- Drawing/rendering code
end)
```
**Parameters:** None

### EveryOneMinute
Fired every in-game minute.
```lua
Events.EveryOneMinute.Add(function()
    print("One minute passed")
end)
```
**Parameters:** None

### EveryTenMinutes
Fired every 10 in-game minutes.
```lua
Events.EveryTenMinutes.Add(function()
    -- Good for periodic checks
end)
```
**Parameters:** None

### EveryHours
Fired every in-game hour.
```lua
Events.EveryHours.Add(function()
    -- Hourly updates
end)
```
**Parameters:** None

### EveryDays
Fired every in-game day.
```lua
Events.EveryDays.Add(function()
    -- Daily updates
end)
```
**Parameters:** None

### OnDawn
Fired at dawn.
```lua
Events.OnDawn.Add(function()
    print("The sun rises")
end)
```
**Parameters:** None

### OnDusk
Fired at dusk.
```lua
Events.OnDusk.Add(function()
    print("Night falls")
end)
```
**Parameters:** None

---

## World Events

### OnZombieDead
Fired when a zombie dies.
```lua
Events.OnZombieDead.Add(function(zombie)
    print("Zombie killed at " .. zombie:getX() .. ", " .. zombie:getY())
end)
```
**Parameters:**
- `zombie` (IsoZombie) - The dead zombie

### OnZombieUpdate
Fired every frame for each zombie (use carefully!).
```lua
Events.OnZombieUpdate.Add(function(zombie)
    -- Called very frequently
end)
```
**Parameters:**
- `zombie` (IsoZombie) - The zombie being updated

### OnHitZombie
Fired when a zombie is hit.
```lua
Events.OnHitZombie.Add(function(zombie, attacker, bodyPart, weapon)
    print("Hit zombie!")
end)
```
**Parameters:**
- `zombie` (IsoZombie) - The zombie hit
- `attacker` (IsoPlayer/IsoGameCharacter) - Who hit it
- `bodyPart` (BodyPart) - Where it was hit
- `weapon` (HandWeapon) - Weapon used

### OnContainerUpdate
Fired when a container's contents change.
```lua
Events.OnContainerUpdate.Add(function(container)
    -- Container inventory changed
end)
```
**Parameters:**
- `container` (ItemContainer) - The container that changed

### OnObjectAdded
Fired when an object is added to the world.
```lua
Events.OnObjectAdded.Add(function(object)
    print("Object added: " .. tostring(object))
end)
```
**Parameters:**
- `object` (IsoObject) - The added object

### OnObjectAboutToBeRemoved
Fired before an object is removed.
```lua
Events.OnObjectAboutToBeRemoved.Add(function(object)
    print("Object being removed")
end)
```
**Parameters:**
- `object` (IsoObject) - The object being removed

### OnDestroyIsoThumpable
Fired when a player-built object is destroyed.
```lua
Events.OnDestroyIsoThumpable.Add(function(thumpable, destroyer)
    print("Built object destroyed")
end)
```
**Parameters:**
- `thumpable` (IsoThumpable) - The destroyed object
- `destroyer` (IsoGameCharacter) - Who destroyed it

### LoadGridsquare
Fired when a grid square loads.
```lua
Events.LoadGridsquare.Add(function(square)
    -- Square just loaded into memory
end)
```
**Parameters:**
- `square` (IsoGridSquare) - The loaded square

---

## Vehicle Events

### OnEnterVehicle
Fired when entering a vehicle.
```lua
Events.OnEnterVehicle.Add(function(player)
    print(player:getUsername() .. " entered vehicle")
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player entering

### OnExitVehicle
Fired when exiting a vehicle.
```lua
Events.OnExitVehicle.Add(function(player)
    print(player:getUsername() .. " exited vehicle")
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player exiting

### OnSwitchVehicleSeat
Fired when switching seats.
```lua
Events.OnSwitchVehicleSeat.Add(function(player)
    print("Switched seats")
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player switching

### OnUseVehicle
Fired when using vehicle controls.
```lua
Events.OnUseVehicle.Add(function(player, vehicle, pressedNotTapped)
    -- Player interacting with vehicle
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player
- `vehicle` (BaseVehicle) - The vehicle
- `pressedNotTapped` (boolean) - Long press vs tap

### OnVehicleDamageTexture
Fired when vehicle texture updates due to damage.
```lua
Events.OnVehicleDamageTexture.Add(function(player)
    -- Vehicle appearance changed
end)
```
**Parameters:**
- `player` (IsoPlayer) - The driver/owner

### OnVehicleHorn
Fired when honking horn.
```lua
Events.OnVehicleHorn.Add(function(player, vehicle, pressed)
    if pressed then
        print("HONK!")
    end
end)
```
**Parameters:**
- `player` (IsoPlayer) - The player
- `vehicle` (BaseVehicle) - The vehicle
- `pressed` (boolean) - True if pressed, false if released

### OnMechanicActionDone
Fired when a mechanic action completes.
```lua
Events.OnMechanicActionDone.Add(function(player, success, vehicleId, partId)
    if success then
        print("Repair successful")
    end
end)
```
**Parameters:**
- `player` (IsoPlayer) - The mechanic
- `success` (boolean) - Whether it succeeded
- `vehicleId` (int) - Vehicle ID
- `partId` (string) - Part that was worked on

---

## Crafting Events

### OnMakeItem
Fired when crafting an item.
```lua
Events.OnMakeItem.Add(function(item, player, recipe)
    print("Crafted: " .. item:getName())
end)
```
**Parameters:**
- `item` (InventoryItem) - The crafted item
- `player` (IsoPlayer) - The crafter
- `recipe` (Recipe) - The recipe used

### OnDynamicMovableRecipe
Fired for dynamic/movable recipes.
```lua
Events.OnDynamicMovableRecipe.Add(function(movableRecipe, item, player)
    -- Dynamic crafting
end)
```
**Parameters:**
- `movableRecipe` - The recipe
- `item` (InventoryItem) - Result item
- `player` (IsoPlayer) - The crafter

---

## Input Events

### OnKeyPressed
Fired when a key is pressed.
```lua
Events.OnKeyPressed.Add(function(key)
    if key == Keyboard.KEY_F then
        print("F pressed")
    end
end)
```
**Parameters:**
- `key` (int) - Key code (use Keyboard.KEY_*)

### OnKeyStartPressed
Fired on initial key press.
```lua
Events.OnKeyStartPressed.Add(function(key)
    -- Key just went down
end)
```
**Parameters:**
- `key` (int) - Key code

### OnKeyKeepPressed
Fired while key is held.
```lua
Events.OnKeyKeepPressed.Add(function(key)
    -- Key is being held
end)
```
**Parameters:**
- `key` (int) - Key code

### OnCustomUIKey
Fired for custom UI key bindings.
```lua
Events.OnCustomUIKey.Add(function(key)
    -- Custom key handling
end)
```
**Parameters:**
- `key` (int) - Key code

### OnMouseDown
Fired on mouse button press.
```lua
Events.OnMouseDown.Add(function(x, y)
    print("Click at " .. x .. ", " .. y)
end)
```
**Parameters:**
- `x` (int) - Mouse X position
- `y` (int) - Mouse Y position

### OnRightMouseDown
Fired on right mouse button press.
```lua
Events.OnRightMouseDown.Add(function(x, y)
    print("Right click at " .. x .. ", " .. y)
end)
```
**Parameters:**
- `x` (int) - Mouse X position
- `y` (int) - Mouse Y position

---

## Weather Events

### OnClimateManagerInit
Fired when climate system initializes.
```lua
Events.OnClimateManagerInit.Add(function(climate)
    print("Climate initialized")
end)
```
**Parameters:**
- `climate` (ClimateManager) - The climate manager

### OnClimateTick
Fired every climate tick.
```lua
Events.OnClimateTick.Add(function(climate)
    -- Climate updates
end)
```
**Parameters:**
- `climate` (ClimateManager) - The climate manager

### OnThunderEvent
Fired during thunder.
```lua
Events.OnThunderEvent.Add(function(x, y, strike)
    if strike then
        print("Lightning strike at " .. x .. ", " .. y)
    end
end)
```
**Parameters:**
- `x` (int) - X coordinate
- `y` (int) - Y coordinate
- `strike` (boolean) - True if lightning strike

### OnWeatherPeriodStart
Fired when a weather period starts.
```lua
Events.OnWeatherPeriodStart.Add(function(period)
    print("Weather changing")
end)
```
**Parameters:**
- `period` (WeatherPeriod) - The weather period

### OnWeatherPeriodStage
Fired during weather stage transitions.
```lua
Events.OnWeatherPeriodStage.Add(function(period)
    -- Weather stage changed
end)
```
**Parameters:**
- `period` (WeatherPeriod) - The weather period

### OnWeatherPeriodComplete
Fired when weather period ends.
```lua
Events.OnWeatherPeriodComplete.Add(function(period)
    print("Weather period ended")
end)
```
**Parameters:**
- `period` (WeatherPeriod) - The completed period

### OnInitSeasons
Fired when seasons initialize.
```lua
Events.OnInitSeasons.Add(function()
    print("Seasons initialized")
end)
```
**Parameters:** None

---

## Multiplayer Events

### OnConnected
Fired when connected to a server.
```lua
Events.OnConnected.Add(function()
    print("Connected to server")
end)
```
**Parameters:** None

### OnConnectFailed
Fired when connection fails.
```lua
Events.OnConnectFailed.Add(function(error)
    print("Connection failed: " .. error)
end)
```
**Parameters:**
- `error` (string) - Error message

### OnDisconnect
Fired when disconnected.
```lua
Events.OnDisconnect.Add(function()
    print("Disconnected")
end)
```
**Parameters:** None

### OnServerStarted
Fired when server starts (server-side).
```lua
Events.OnServerStarted.Add(function()
    print("Server started")
end)
```
**Parameters:** None

### OnClientCommand
Fired when receiving client command (server-side).
```lua
Events.OnClientCommand.Add(function(module, command, player, args)
    if module == "MyMod" then
        -- Handle command
    end
end)
```
**Parameters:**
- `module` (string) - Module name
- `command` (string) - Command name
- `player` (IsoPlayer) - Player who sent it
- `args` (table) - Command arguments

### OnServerCommand
Fired when receiving server command (client-side).
```lua
Events.OnServerCommand.Add(function(module, command, args)
    if module == "MyMod" then
        -- Handle command
    end
end)
```
**Parameters:**
- `module` (string) - Module name
- `command` (string) - Command name
- `args` (table) - Command arguments

---

## UI Events

### OnCreateUI
Fired when main UI is created.
```lua
Events.OnCreateUI.Add(function()
    -- Add custom UI elements
end)
```
**Parameters:** None

### OnPreUIDraw
Fired before UI draws.
```lua
Events.OnPreUIDraw.Add(function()
    -- Draw behind UI
end)
```
**Parameters:** None

### OnPostUIDraw
Fired after UI draws.
```lua
Events.OnPostUIDraw.Add(function()
    -- Draw on top of UI
end)
```
**Parameters:** None

### OnResolutionChange
Fired when screen resolution changes.
```lua
Events.OnResolutionChange.Add(function(oldW, oldH, newW, newH)
    print("Resolution: " .. newW .. "x" .. newH)
end)
```
**Parameters:**
- `oldW` (int) - Old width
- `oldH` (int) - Old height
- `newW` (int) - New width
- `newH` (int) - New height

---

## Global Object Events

### OnCGlobalObjectSystemInit
Fired when client global object system initializes.
```lua
Events.OnCGlobalObjectSystemInit.Add(function()
    -- Client global objects ready
end)
```
**Parameters:** None

### OnSGlobalObjectSystemInit
Fired when server global object system initializes.
```lua
Events.OnSGlobalObjectSystemInit.Add(function()
    -- Server global objects ready
end)
```
**Parameters:** None

### OnInitGlobalModData
Fired when global mod data initializes.
```lua
Events.OnInitGlobalModData.Add(function(isNewGame)
    if isNewGame then
        -- Initialize new mod data
    else
        -- Load existing mod data
    end
end)
```
**Parameters:**
- `isNewGame` (boolean) - True if new game, false if loading

### OnReceiveGlobalModData
Fired when receiving global mod data (multiplayer).
```lua
Events.OnReceiveGlobalModData.Add(function(key, data)
    print("Received mod data: " .. key)
end)
```
**Parameters:**
- `key` (string) - Data key
- `data` (table) - The data

---

## Complete Event List

All 144 events found in Build 41:

### Game/System
- OnGameBoot, OnMainMenuEnter, OnGameStart, OnNewGame
- OnPreMapLoad, OnGameTimeLoaded, OnInitWorld, OnLoadMapZones
- OnLoadedMapZones, OnSave, OnPostSave, OnResetLua
- OnModsModified, OnChallengeQuery, OnGameStateEnter

### Player
- OnCreatePlayer, OnCreateSurvivor, OnPlayerUpdate, OnPlayerMove
- OnPlayerDeath, OnPlayerAttackFinished, AddXP, LevelPerk
- OnEquipPrimary, OnEquipSecondary, OnCharacterCreateStats
- OnClothingUpdated

### Zombies
- OnZombieDead, OnZombieUpdate, OnHitZombie

### World/Objects
- OnContainerUpdate, OnObjectAdded, OnObjectAboutToBeRemoved
- OnDestroyIsoThumpable, LoadGridsquare, OnWaterAmountChange
- OnDoTileBuilding2, OnDoTileBuilding3

### Vehicles
- OnEnterVehicle, OnExitVehicle, OnSwitchVehicleSeat
- OnUseVehicle, OnVehicleDamageTexture, OnVehicleHorn
- OnMechanicActionDone

### Combat
- OnWeaponHitTree, OnWeaponHitXp, OnWeaponSwingHitPoint
- OnPressRackButton, OnPressReloadButton

### Crafting
- OnMakeItem, OnDynamicMovableRecipe

### UI/Input
- OnCreateUI, OnFillInventoryObjectContextMenu, OnFillWorldObjectContextMenu
- OnPreUIDraw, OnPostUIDraw, OnResolutionChange
- OnKeyPressed, OnKeyStartPressed, OnKeyKeepPressed, OnCustomUIKey
- OnMouseDown, OnRightMouseDown, OnPressWalkTo
- OnObjectLeftMouseButtonDown, OnObjectLeftMouseButtonUp
- OnObjectRightMouseButtonDown, OnObjectRightMouseButtonUp

### Time
- OnTick, OnTickEvenPaused, OnRenderTick
- EveryOneMinute, EveryTenMinutes, EveryHours, EveryDays
- OnDawn, OnDusk

### Weather
- OnClimateManagerInit, OnClimateTick, OnClimateTickDebug
- OnThunderEvent, OnWeatherPeriodStart, OnWeatherPeriodStage
- OnWeatherPeriodComplete, OnInitSeasons

### Multiplayer
- OnConnected, OnConnectFailed, OnConnectionStateChanged, OnDisconnect
- OnServerStarted, OnServerStartSaving, OnServerFinishSaving
- OnClientCommand, OnServerCommand, OnAdminMessage
- OnCoopJoinFailed, OnCoopServerMessage, OnLoginState, OnLoginStateSuccess
- OnServerStatisticReceived, OnAcceptInvite

### Chat/Social
- OnAddMessage, OnChatWindowInit, SwitchChatStream
- OnScoreboardUpdate, OnMiniScoreboardUpdate
- AcceptedFactionInvite, ReceiveFactionInvite, SyncFaction
- AcceptedSafehouseInvite, ReceiveSafehouseInvite, OnSafehousesChanged
- AcceptedTrade, RequestTrade, TradingUIAddItem, TradingUIRemoveItem, TradingUIUpdateState

### Gamepad/Controller
- OnGamepadConnect, OnGamepadDisconnect
- OnJoypadActivate, OnJoypadActivateUI, OnJoypadDeactivate
- OnJoypadReactivate, OnJoypadBeforeDeactivate, OnJoypadBeforeReactivate
- OnJoypadRenderUI

### Global Objects
- OnCGlobalObjectSystemInit, OnSGlobalObjectSystemInit
- OnInitGlobalModData, OnReceiveGlobalModData

### Misc
- OnDeviceText, OnDistributionMerge, OnPreDistributionMerge, OnPostDistributionMerge
- OnDoSpecialTooltip, onEnableSearchMode, onUpdateIcon
- OnGetDBSchema, OnGetTableResult, MngInvReceiveItems
- OnInitRecordedMedia, OnLoadRadioScripts, OnLoadSoundBanks
- OnReceiveUserlog, OnSetDefaultTab, OnTabAdded, OnTabRemoved
- OnTemplateTextInit, ServerPinged, ViewTickets

### Steam
- OnSteamFriendStatusChanged, OnSteamGameJoin
- OnSteamRefreshInternetServers, OnSteamRulesRefreshComplete
- OnSteamServerFailedToRespond2, OnSteamServerResponded, OnSteamServerResponded2
- OnSteamWorkshopItemCreated, OnSteamWorkshopItemNotCreated
- OnSteamWorkshopItemUpdated, OnSteamWorkshopItemNotUpdated
- OnServerWorkshopItems

---

## Best Practices

### Performance
```lua
-- BAD: Heavy work in OnTick
Events.OnTick.Add(function()
    for i = 1, 1000 do
        -- Don't do this every tick!
    end
end)

-- GOOD: Use appropriate timing
Events.EveryTenMinutes.Add(function()
    -- Periodic work goes here
end)
```

### Cleanup
```lua
-- Store function reference for removal
local function myCallback()
    -- Do stuff
end

-- Add
Events.OnGameStart.Add(myCallback)

-- Remove when done
Events.OnGameStart.Remove(myCallback)
```

### Guard Clauses
```lua
Events.OnPlayerUpdate.Add(function(player)
    -- Exit early if conditions aren't met
    if not player then return end
    if player:isDead() then return end
    
    -- Your code here
end)
```

## Related

- [Global Functions](/build-41/modding/reference/globals) - Available global functions
- [Script Properties](/build-41/modding/reference/script-properties) - Item/recipe properties 