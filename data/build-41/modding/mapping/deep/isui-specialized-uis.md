# ISUI Specialized UIs

## Overview

This document covers the complex, game-specific UI components in Project Zomboid. These are built using the foundational ISUI components but implement specialized behaviors for core game systems.

**Systems Covered:**
- **ISInventoryPane** - Item inventory display and management
- **ISInventoryPage** - Inventory window container
- **ISCraftingUI** - Recipe crafting interface
- **ISWorldMap / ISMiniMap** - Map display systems
- **Admin Panel UIs** - Server administration interfaces

---

## Architecture Pattern

Specialized UIs in Project Zomboid follow a common pattern:

```
ISCollapsableWindow / ISPanelJoypad
├── Child panels for content areas
├── ISScrollingListBox for item lists
├── ISTabPanel for categories
├── ISButton for actions
└── State management (player, inventory, selection)
```

---

## ISInventoryPane

The core inventory display component showing items in a scrollable, categorized list.

**Source:** `media/lua/client/ISUI/ISInventoryPane.lua` (2000+ lines)

### Key Properties

| Property | Description |
|----------|-------------|
| `inventory` | ItemContainer being displayed |
| `player` | Player index (0-3) |
| `items` | Processed item list for display |
| `selected` | Currently selected item index |
| `mode` | Display mode |
| `zoom` | UI scale factor |
| `filter` | Current filter text |
| `collapsed` | Table of collapsed categories |

### Layout Structure

```lua
ISInventoryPane (ISPanel)
├── expandAll (ISButton) - Expand all categories
├── collapseAll (ISButton) - Collapse all categories
├── filterMenu (ISButton) - Filter options
├── nameHeader (ISResizableButton) - Name column header
├── typeHeader (ISResizableButton) - Category column header
├── contextButton1-3 (ISButton) - Quick action buttons
└── ScrollBars
```

### Item Structure

```lua
-- Processed inventory item
{
    name = "Item Display Name",
    items = { ... },           -- Array of actual InventoryItem objects
    count = 5,                 -- Stack count
    invItem = InventoryItem,   -- Representative item
    cat = "Weapons",           -- Category name
    equipped = true/false,     -- Is item equipped
    favCat = "favorite",       -- Favorite category
}
```

### Key Methods

| Method | Description |
|--------|-------------|
| `setInventory(inventory)` | Set container to display |
| `refreshContainer()` | Rebuild item list |
| `doContextualDblClick()` | Handle double-click action |
| `transferSelected()` | Transfer selected items |
| `isInSelection()` | Check if item is selected |
| `getActualItems(items)` | Extract InventoryItem objects |

### Selection Handling

```lua
-- Multi-selection support
function ISInventoryPane:selectIndex(index, shiftDown, ctrlDown)
    if ctrlDown then
        -- Toggle selection
        self.selected[index] = not self.selected[index]
    elseif shiftDown then
        -- Range selection
        -- Select all items between anchor and index
    else
        -- Single selection
        self:clearSelection()
        self.selected[index] = true
    end
end
```

### Context Menu Integration

```lua
-- Right-click triggers context menu via ISInventoryPaneContextMenu
Events.OnFillInventoryObjectContextMenu.Add(function(player, context, items)
    -- Add custom options to inventory context menu
    context:addOption("My Custom Action", items, myCustomFunction)
end)
```

### Drag & Drop

```lua
-- ISMouseDrag handles inventory drag operations
function ISInventoryPane:onMouseDown(x, y)
    ISMouseDrag.dragging = self.selectedItems
    ISMouseDrag.dragView = self
end

function ISInventoryPane:onMouseUp(x, y)
    if ISMouseDrag.dragging then
        -- Handle drop
        self:dropItems(ISMouseDrag.dragging)
        ISMouseDrag.dragging = nil
    end
end
```

---

## ISInventoryPage

The container window for inventory panes (player inventory + loot containers).

**Source:** `media/lua/client/ISUI/ISInventoryPage.lua`

### Architecture

```lua
ISInventoryPage (ISCollapsableWindow)
├── backpack (ISInventoryPane) - For container inventories
├── inventoryPane (ISInventoryPane) - Player inventory
├── transferAll (ISButton) - Transfer buttons
├── weightBar (ISPanel) - Weight indicator
└── Button containers for loot sources
```

### Key Features

- Multiple container display
- Weight tracking
- Transfer all/selected
- Container selection tabs

### Accessing Inventory UI

```lua
-- Get player's inventory page
local invPage = getPlayerInventory(playerNum)

-- Get specific panes
local playerPane = invPage.inventoryPane
local lootPane = invPage.lootInventory
```

---

## ISCraftingUI

The crafting interface showing available recipes organized by category.

**Source:** `media/lua/client/ISUI/ISCraftingUI.lua` (1500+ lines)

### Architecture

```lua
ISCraftingUI (ISCollapsableWindow)
├── panel (ISTabPanel) - Category tabs
│   └── ISCraftingCategoryUI per category
│       ├── recipes (ISScrollingListBox) - Recipe list
│       └── ingredientPanel - Required items
├── craftButton (ISButton) - Craft action
├── craftAllButton (ISButton) - Craft all
└── searchEntry (ISTextEntryBox) - Recipe search
```

### Key Properties

| Property | Description |
|----------|-------------|
| `character` | Player character |
| `recipesList` | Recipes by category |
| `categories` | Category UI list |
| `containers` | Available containers |
| `selectedIndex` | Selection per category |

### Recipe Display

```lua
-- Recipe list item structure
{
    recipe = ScriptRecipe,     -- The recipe object
    available = true/false,    -- Can be crafted now
    numItems = 5,              -- Number of times craftable
    known = true/false,        -- Is recipe known
    favorite = true/false,     -- Is favorited
}
```

### Key Methods

| Method | Description |
|--------|-------------|
| `refresh()` | Rebuild recipe list |
| `populateRecipesList()` | Load all available recipes |
| `getContainers()` | Get nearby containers |
| `craft(recipe, all)` | Execute crafting |
| `filter()` | Apply search filter |

### Recipe Filtering

```lua
-- Custom recipe filtering
function ISCraftingUI:filterRecipe(recipe)
    -- Check search text
    if self.searchText ~= "" then
        if not recipe:getName():lower():contains(self.searchText:lower()) then
            return false
        end
    end
    -- Check category filter
    -- Check available/unavailable filter
    return true
end
```

### Accessing Crafting UI

```lua
-- Get/create crafting UI
local craftUI = ISCraftingUI.instance

-- Open crafting UI for player
function openCraftingUI(playerNum)
    local playerObj = getSpecificPlayer(playerNum)
    if not ISCraftingUI.instance then
        ISCraftingUI.instance = ISCraftingUI:new(x, y, width, height, playerObj)
        ISCraftingUI.instance:initialise()
        ISCraftingUI.instance:addToUIManager()
    end
    ISCraftingUI.instance:setVisible(true)
end
```

---

## Map System

### ISWorldMap

The full-screen world map display.

**Source:** `media/lua/client/ISUI/Maps/ISWorldMap.lua`

### Architecture

```lua
ISWorldMap (ISPanelJoypad)
├── mapAPI (Java WorldMap) - Java map renderer
├── symbolsUI (ISWorldMapSymbols) - Map symbols/markers
├── optionsUI (WorldMapOptions) - Map settings
└── Zoom/pan controls
```

### Key Properties

| Property | Description |
|----------|-------------|
| `mapAPI` | Java WorldMap interface |
| `centerX, centerY` | Map center position |
| `zoom` | Current zoom level |
| `symbols` | Map markers/symbols |
| `playerNum` | Player index |

### Java Integration

The map uses heavy Java-side rendering:

```lua
-- Java WorldMap API
self.mapAPI = WorldMap.new()
self.mapAPI:setDirectory("media/maps/")
self.mapAPI:addImages()

-- In render
self.mapAPI:render(self:getAbsoluteX(), self:getAbsoluteY(), zoom, worldX, worldY)
```

### Adding Map Markers

```lua
-- Add custom symbol
function ISWorldMap:addSymbol(symbolDef)
    local symbol = {}
    symbol.worldX = x
    symbol.worldY = y
    symbol.texture = texture
    symbol.text = "My Marker"
    table.insert(self.symbols, symbol)
end
```

### ISMiniMap

The HUD minimap display.

**Source:** `media/lua/client/ISUI/Maps/ISMiniMap.lua`

```lua
ISMiniMap = ISPanelJoypad:derive("ISMiniMap")

-- Uses same Java WorldMap API but smaller viewport
-- Player-centered view
-- Automatic rotation option
```

### Map Definitions

**Source:** `media/lua/client/ISUI/Maps/ISMapDefinitions.lua`

Contains symbol definitions, icon mappings, and map configuration.

```lua
-- Symbol types
ISMapDefinitions.symbols = {
    ["mapSymbol_SquareBlue"] = { ... },
    ["mapSymbol_CircleRed"] = { ... },
    -- etc
}

-- Map markers for POIs
ISMapDefinitions.markers = { ... }
```

---

## Admin Panel UIs

Server administration interfaces in `media/lua/client/ISUI/AdminPanel/`.

### Key Admin Panels

| Panel | Purpose |
|-------|---------|
| `ISAdminPanelUI` | Main admin interface |
| `ISSpawnItemUI` | Item spawning |
| `ISSpawnVehicleUI` | Vehicle spawning |
| `ISTeleportUI` | Teleportation |
| `ISPlayerStatsUI` | Player statistics |
| `ISServerOptionsUI` | Server settings |

### Admin Panel Pattern

```lua
AdminPanel = ISPanelJoypad:derive("AdminPanel")

function AdminPanel:new(x, y, width, height, playerNum)
    local o = ISPanelJoypad.new(self, x, y, width, height)
    o.playerNum = playerNum
    -- Check admin access
    if not isAdmin() and not isCoopHost() then
        return nil
    end
    return o
end
```

---

## Creating Custom Specialized UIs

### Pattern: Window with List

```lua
MyCustomUI = ISCollapsableWindow:derive("MyCustomUI")

function MyCustomUI:new(x, y, width, height, player)
    local o = ISCollapsableWindow.new(self, x, y, width, height)
    o.player = player
    o.playerNum = player:getPlayerNum()
    o.title = "My Custom UI"
    o.resizable = true
    o.minimumWidth = 300
    o.minimumHeight = 200
    return o
end

function MyCustomUI:createChildren()
    ISCollapsableWindow.createChildren(self)

    local y = self:titleBarHeight()
    local padX = 10
    local listHeight = self.height - y - 50

    -- Main list
    self.itemList = ISScrollingListBox:new(padX, y, self.width - padX * 2, listHeight)
    self.itemList:initialise()
    self.itemList:instantiate()
    self.itemList.itemheight = 24
    self.itemList.doDrawItem = self.drawListItem
    self.itemList.target = self
    self:addChild(self.itemList)

    -- Action button
    local btnWidth = 100
    self.actionBtn = ISButton:new(self.width / 2 - btnWidth / 2, self.height - 40, btnWidth, 25, "Action", self, self.onAction)
    self.actionBtn:initialise()
    self.actionBtn:instantiate()
    self:addChild(self.actionBtn)
end

function MyCustomUI:drawListItem(y, item, alt)
    self:drawText(item.text, 10, y + 4, 1, 1, 1, 1, UIFont.Small)
    return y + self.itemheight
end

function MyCustomUI:populate()
    self.itemList:clear()
    -- Add items
    for _, data in ipairs(myDataSource) do
        self.itemList:addItem(data.name, data)
    end
end

function MyCustomUI:onAction()
    local selected = self.itemList.items[self.itemList.selected]
    if selected then
        -- Do action with selected.item
    end
end
```

### Pattern: Tabbed Interface

```lua
MyTabbedUI = ISCollapsableWindow:derive("MyTabbedUI")

function MyTabbedUI:createChildren()
    ISCollapsableWindow.createChildren(self)

    -- Create tab panel
    self.tabPanel = ISTabPanel:new(0, self:titleBarHeight(), self.width, self.height - self:titleBarHeight())
    self.tabPanel:initialise()
    self:addChild(self.tabPanel)

    -- Create tab views
    local tab1 = self:createTab1()
    local tab2 = self:createTab2()

    self.tabPanel:addView("Settings", tab1)
    self.tabPanel:addView("Statistics", tab2)
end

function MyTabbedUI:createTab1()
    local panel = ISPanel:new(0, 0, self.width, self.height - self:titleBarHeight() - self.tabPanel.tabHeight)
    panel:initialise()
    -- Add controls to panel
    return panel
end
```

### Pattern: Dialog with Validation

```lua
function showMyDialog(target, callback)
    local width = 350
    local height = 150

    local dialog = ISTextBox:new(0, 0, width, height, "Enter value:", "", target, callback)
    dialog.noEmpty = true
    dialog.maxChars = 100
    dialog:setValidateFunction(target, function(target, text)
        return text:len() >= 3
    end)
    dialog:setValidateTooltipText("Must be at least 3 characters")
    dialog:initialise()
    dialog:addToUIManager()
end
```

---

## Integration Points

### Events for UI Hooks

```lua
-- Inventory context menu
Events.OnFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    -- Add custom inventory options
end)

-- World context menu
Events.OnFillWorldObjectContextMenu.Add(function(playerNum, context, worldObjs, test)
    -- Add custom world interaction options
end)

-- Pre-fill inventory tooltip
Events.OnPreFillInventoryObjectContextMenu.Add(function(playerNum, context, items)
    -- Modify tooltip before display
end)
```

### Global UI Access

```lua
-- Player inventory
local inv = getPlayerInventory(playerNum)

-- Player loot
local loot = getPlayerLoot(playerNum)

-- Crafting UI
local craft = ISCraftingUI.instance

-- Hotbar
local hotbar = getPlayerHotbar(playerNum)

-- Data panel (health, etc)
local data = getPlayerData(playerNum)
```

---

## Performance Considerations

1. **Item Lists**: Use `MAX_ITEMS_IN_STACK_TO_RENDER` limits
2. **Refresh Throttling**: Don't refresh every frame
3. **Lazy Loading**: Populate lists on-demand
4. **Object Pooling**: Reuse UI elements where possible
5. **Dirty Flags**: Track changes to avoid unnecessary updates

---

## Common Gotchas

1. **Player Index**: Always track `playerNum` for split-screen support

2. **Container Changes**: Subscribe to inventory events for updates

3. **Recipe Availability**: Containers affect what recipes are available

4. **Map Coordinates**: World coords vs screen coords vs cell coords

5. **Admin Access**: Always check permissions before showing admin UIs

6. **UI Manager**: Add/remove properly to avoid memory leaks

7. **Joypad Focus**: Set up button navigation for controller support
